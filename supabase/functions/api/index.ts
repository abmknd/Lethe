// Lethe API — Supabase Edge Function
// Port of mvp/api/server.mjs for Deno runtime.
// Domain modules (models, events, services) are imported via relative paths
// from the project root. Run `supabase functions serve` from the project root.

import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository, toPublicProfile } from "../_shared/repository.ts";
import { AuthError, requireAuth, requireSelf } from "../_shared/auth.ts";
import { sendIntroEmails } from "../_shared/email.ts";

import { normalizeProfilePayload, RECOMMENDATION_STATUSES, OUTCOME_STATUSES, nowIso } from "../../../mvp/domain/models.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";
import { checkProfileCompleteness } from "../../../mvp/domain/completeness.mjs";

const MEETING_OUTCOME_MAP: Record<string, string> = {
  scheduled: OUTCOME_STATUSES.MEETING_SCHEDULED,
  ready: OUTCOME_STATUSES.MEETING_SCHEDULED,
  in_progress: OUTCOME_STATUSES.MEETING_SCHEDULED,
  completed: OUTCOME_STATUSES.COMPLETED,
  cancelled: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
  failed: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
};

const { randomUUID } = crypto;

function getPath(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

function statusCodeFromError(error: unknown): number {
  if (error && typeof error === "object" && "statusCode" in error) {
    return (error as { statusCode: number }).statusCode;
  }
  return 400;
}

async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  const url = new URL(req.url);
  const path = getPath(url);

  try {
    // ── health (open) ────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/health") {
      return json({ ok: true });
    }

    // ── auth gate (everything below requires a valid Supabase JWT) ──────────

    const auth = await requireAuth(req);

    // ── users ─────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/users") {
      return json({ users: await repository.listUsers() });
    }

    const userPublicProfileMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/profile\/public$/);
    if (userPublicProfileMatch && req.method === "GET") {
      const idOrHandle = decodeURIComponent(userPublicProfileMatch[1]);
      let profile = await repository.getUserProfile(idOrHandle);
      if (!profile) {
        const byHandle = await repository.getUserByHandle(idOrHandle);
        if (byHandle) profile = await repository.getUserProfile(byHandle.id);
      }
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ profile: toPublicProfile(profile) });
    }

    const userProfileMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/profile$/);
    if (userProfileMatch) {
      const userId = decodeURIComponent(userProfileMatch[1]);
      requireSelf(auth, userId);

      if (req.method === "GET") {
        const profile = await repository.getUserProfile(userId);
        if (!profile) return json({ error: "User not found." }, 404);
        return json({ profile });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const normalized = normalizeProfilePayload({
          user: { id: userId, ...body.user },
          preferences: body.preferences ?? {},
          availability: body.availability ?? [],
        });
        const profile = await repository.upsertUserProfile(normalized);
        return json({ profile });
      }
    }

    const userContextMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/context$/);
    if (userContextMatch && req.method === "GET") {
      const userId = decodeURIComponent(userContextMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ context: profile });
    }

    const userRecsMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/recommendations$/);
    if (userRecsMatch && req.method === "GET") {
      const userId = decodeURIComponent(userRecsMatch[1]);
      requireSelf(auth, userId);
      const status = url.searchParams.get("status") ?? undefined;
      const recommendations = await repository.listRecommendationsForUser(userId, { status });
      return json({ recommendations });
    }

    const userCompletenessMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/completeness$/);
    if (userCompletenessMatch && req.method === "GET") {
      const userId = decodeURIComponent(userCompletenessMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      const result = checkProfileCompleteness(profile);
      return json({ completeness: { userId, ...result } });
    }

    // ── admin (TODO: admin role auth — out of scope for ticket #1) ───────────

    if (req.method === "GET" && path === "/api/trial/admin/recommendations") {
      const status = url.searchParams.get("status") ?? "pending_review";
      const recommendations = await repository.listAdminRecommendations({ status });
      return json({ recommendations });
    }

    const adminDecisionMatch = path.match(/^\/api\/trial\/admin\/recommendations\/([^/]+)\/decision$/);
    if (adminDecisionMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(adminDecisionMatch[1]);
      const body = await readJsonBody(req);

      const normalizedDecision = String(body.decision ?? "").toLowerCase();
      const statusMap: Record<string, string> = {
        approve: RECOMMENDATION_STATUSES.APPROVED,
        reject: RECOMMENDATION_STATUSES.REJECTED,
        approved: RECOMMENDATION_STATUSES.APPROVED,
        rejected: RECOMMENDATION_STATUSES.REJECTED,
      };
      if (!statusMap[normalizedDecision]) {
        return json({ error: "Decision must be approve or reject." }, 400);
      }

      const rationale = String(body.rationale ?? "").trim();
      if (rationale.length < 10) {
        return json({ error: "Rationale is required and must be at least 10 characters." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.status !== RECOMMENDATION_STATUSES.PENDING_REVIEW) {
        return json({ error: "Recommendation is no longer pending review." }, 409);
      }

      const newStatus = statusMap[normalizedDecision];
      const updated = await repository.updateRecommendationStatusIfPending(recommendationId, newStatus, nowIso());
      if (!updated) return json({ error: "Recommendation is no longer pending review." }, 409);

      const adminId = String(body.adminId ?? "admin_trial");
      await repository.recordAdminDecision({
        id: `decision_${randomUUID()}`,
        recommendationId,
        adminId,
        decision: newStatus,
        rationale,
        decidedAt: nowIso(),
      });

      const eventType = normalizedDecision.startsWith("approve")
        ? EVENT_TYPES.ADMIN_APPROVED
        : EVENT_TYPES.ADMIN_REJECTED;

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType,
        actorUserId: adminId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: { decision: normalizedDecision, rationale, candidateUserId: recommendation.candidateUserId },
        createdAt: nowIso(),
      }]);

      if (newStatus === RECOMMENDATION_STATUSES.APPROVED) {
        const [requesterProfile, candidateProfile] = await Promise.all([
          repository.getUserProfile(recommendation.userId),
          repository.getUserProfile(recommendation.candidateUserId),
        ]);
        if (requesterProfile && candidateProfile) {
          const emailResult = await sendIntroEmails({
            requesterProfile,
            candidateProfile,
            insightText: recommendation.insightText ?? null,
          });
          if (emailResult.ok) {
            await repository.upsertOutcome({
              id: `outcome_${randomUUID()}`,
              recommendationId,
              outcomeStatus: OUTCOME_STATUSES.INTRO_SENT,
              notes: null,
              updatedAt: nowIso(),
            });
            await repository.appendEvents([{
              id: `evt_${randomUUID()}`,
              eventType: EVENT_TYPES.INTRO_SENT,
              actorUserId: adminId,
              targetUserId: recommendation.userId,
              recommendationId,
              payload: { emailIds: emailResult.ids },
              createdAt: nowIso(),
            }]);
          }
        }
      }

      return json({ ok: true, recommendationId, status: newStatus, decision: normalizedDecision, rationale });
    }

    const adminContextMatch = path.match(/^\/api\/trial\/admin\/recommendations\/([^/]+)\/context$/);
    if (adminContextMatch && req.method === "GET") {
      const recommendationId = decodeURIComponent(adminContextMatch[1]);
      const context = await repository.getRecommendationContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    // ── recommendations ───────────────────────────────────────────────────────

    const insightMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/insight$/);
    if (insightMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(insightMatch[1]);
      const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!anthropicKey) return json({ error: "ANTHROPIC_API_KEY not configured." }, 422);

      const rec = await repository.getRecommendationById(recommendationId);
      if (!rec) return json({ error: "Recommendation not found." }, 404);

      const sourceProfile = await repository.getUserProfile(rec.userId);
      const candidateProfile = await repository.getUserProfile(rec.candidateUserId);
      if (!sourceProfile || !candidateProfile) return json({ error: "Profile not found." }, 404);

      const src = sourceProfile.user;
      const srcP = sourceProfile.preferences ?? {};
      const cnd = candidateProfile.user;
      const cndP = candidateProfile.preferences ?? {};

      const profileContext = [
        `Person A: ${src.displayName ?? src.name}`,
        src.location ? `  Location: ${src.location}` : null,
        srcP.userType ? `  Role: ${srcP.userType}` : null,
        srcP.asks?.length ? `  Looking for: ${(srcP.asks as string[]).slice(0, 3).join(", ")}` : null,
        srcP.offers?.length ? `  Can offer: ${(srcP.offers as string[]).slice(0, 3).join(", ")}` : null,
        srcP.introText ? `  Bio: ${(srcP.introText as string).slice(0, 150)}` : null,
        "",
        `Person B: ${cnd.displayName ?? cnd.name}`,
        cnd.location ? `  Location: ${cnd.location}` : null,
        cndP.userType ? `  Role: ${cndP.userType}` : null,
        cndP.asks?.length ? `  Looking for: ${(cndP.asks as string[]).slice(0, 3).join(", ")}` : null,
        cndP.offers?.length ? `  Can offer: ${(cndP.offers as string[]).slice(0, 3).join(", ")}` : null,
        cndP.introText ? `  Bio: ${(cndP.introText as string).slice(0, 150)}` : null,
      ].filter(Boolean).join("\n");

      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          system:
            "You write concise, specific introductions explaining why two professionals should meet. " +
            "Write exactly 2–3 sentences. Be concrete — name the actual asks, offers, or shared context. " +
            "No fluff, no generic praise. Do not start with \"I\" or mention Lethe.",
          messages: [{ role: "user", content: `Write a 2–3 sentence explanation of why these two people should meet:\n\n${profileContext}` }],
        }),
      });

      if (!anthropicRes.ok) return json({ error: "Insight generation failed." }, 502);
      const anthropicBody = await anthropicRes.json() as { content: Array<{ type: string; text: string }> };
      const insightText = anthropicBody.content[0]?.type === "text" ? anthropicBody.content[0].text.trim() : "";
      if (!insightText) return json({ error: "Empty insight returned." }, 502);

      await repository.updateRecommendationInsightText(recommendationId, insightText);
      return json({ ok: true, insightText });
    }

    const participantsContextMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/participants-context$/);
    if (participantsContextMatch && req.method === "GET") {
      const recommendationId = decodeURIComponent(participantsContextMatch[1]);
      const context = await repository.getRecommendationParticipantsContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    const respondMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/respond$/);
    if (respondMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(respondMatch[1]);
      const body = await readJsonBody(req);

      const decision = String(body.decision ?? "").toLowerCase();
      if (!["accept", "pass"].includes(decision)) {
        return json({ error: "Decision must be accept or pass." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "User is not allowed to respond to this recommendation." }, 403);
      }

      const nextStatus = decision === "accept"
        ? RECOMMENDATION_STATUSES.ACCEPTED
        : RECOMMENDATION_STATUSES.PASSED;

      await repository.updateRecommendationStatus(recommendationId, nextStatus, nowIso());

      await repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
        notes: null,
        updatedAt: nowIso(),
        requesterResponse: decision,
      });

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: decision === "accept" ? EVENT_TYPES.USER_ACCEPT : EVENT_TYPES.USER_PASS,
        actorUserId: auth.userId,
        targetUserId: auth.userId,
        recommendationId,
        payload: { decision, candidateUserId: recommendation.candidateUserId },
        createdAt: nowIso(),
      }]);

      return json({ ok: true, recommendationId, status: nextStatus, decision });
    }

    const followThroughMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/follow-through$/);
    if (followThroughMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(followThroughMatch[1]);
      const body = await readJsonBody(req);

      const status = String(body.status ?? "").toLowerCase();
      if (!Object.values(OUTCOME_STATUSES).includes(status)) {
        return json({ error: "Invalid follow-through status." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "User is not allowed to update this recommendation." }, 403);
      }

      const outcome = await repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus: status,
        notes: body.notes as string ?? null,
        updatedAt: nowIso(),
      });

      const eventType = status === OUTCOME_STATUSES.INTRO_SENT
        ? EVENT_TYPES.INTRO_SENT
        : EVENT_TYPES.FOLLOW_THROUGH_UPDATED;

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType,
        actorUserId: auth.userId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: { outcomeStatus: status, notes: body.notes ?? null },
        createdAt: nowIso(),
      }]);

      return json({ ok: true, outcome });
    }

    // ── events ────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/events") {
      const limit = Number(url.searchParams.get("limit") ?? 200);
      const events = await repository.listEvents({
        limit: Number.isFinite(limit) ? Math.max(1, Math.min(1000, limit)) : 200,
        userId: url.searchParams.get("userId") ?? undefined,
        eventType: url.searchParams.get("eventType") ?? undefined,
        recommendationId: url.searchParams.get("recommendationId") ?? undefined,
      });
      return json({ events });
    }

    // ── report ────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/report") {
      const windowDays = Number(url.searchParams.get("windowDays") ?? 7);
      const toIso = url.searchParams.get("to") ?? new Date().toISOString();
      const fromIso = url.searchParams.get("from")
        ?? new Date(Date.now() - Math.max(1, windowDays) * 86_400_000).toISOString();

      const [rows, eventCounts] = await Promise.all([
        repository.listRecommendationsWithDecisionAndOutcome({ fromIso, toIso }),
        repository.countEventsByType({ fromIso, toIso }),
      ]);

      const r = rows as Array<Record<string, unknown>>;
      const generated = r.length;
      const approved  = r.filter((x) => x.decision === "approved").length;
      const accepted  = r.filter((x) => x.status === "accepted").length;
      const passed    = r.filter((x) => x.status === "passed").length;
      const pct = (n: number, d: number) => d ? Number(((n / d) * 100).toFixed(1)) : 0;

      return json({
        report: {
          window: { fromIso, toIso, days: Math.max(1, windowDays) },
          recommendations: {
            generated, approved,
            rejected: r.filter((x) => x.decision === "rejected").length,
            approvalRatePct: pct(approved, generated),
          },
          responses: { accepted, passed, acceptRatePct: pct(accepted, generated) },
          events: eventCounts,
        },
      });
    }

    // ── weekly_cep ────────────────────────────────────────────────────────────

    const cepMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/cep$/);
    if (cepMatch) {
      const userId = decodeURIComponent(cepMatch[1]);
      requireSelf(auth, userId);

      if (req.method === "GET") {
        const cep = await repository.getCep(userId);
        return json({ cep: cep?.isActive ? cep : null, isActive: cep?.isActive ?? false });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const focusText = String(body.focusText ?? "").trim();
        if (!focusText) return json({ error: "focusText is required." }, 400);
        const cep = await repository.upsertCep(userId, focusText);
        return json({ cep });
      }

      if (req.method === "DELETE") {
        await repository.deleteCep(userId);
        return json({ ok: true });
      }
    }

    // ── meetings ──────────────────────────────────────────────────────────────

    const meetingMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/meeting$/);
    if (meetingMatch) {
      const recommendationId = decodeURIComponent(meetingMatch[1]);

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "Forbidden: not your recommendation." }, 403);
      }

      if (req.method === "GET") {
        const meeting = await repository.getMeetingForRecommendation(recommendationId);
        return json({ meeting });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const status = String(body.status ?? "scheduled");
        const meeting = await repository.upsertMeeting({
          recommendationId,
          provider: body.provider as string | undefined,
          meetingUrl: body.meetingUrl as string | undefined,
          scheduledAt: body.scheduledAt as string | null | undefined,
          status,
          metadata: body.metadata as Record<string, unknown> | undefined,
        });

        const outcomeStatus = MEETING_OUTCOME_MAP[status] ?? OUTCOME_STATUSES.MEETING_SCHEDULED;
        await repository.upsertOutcome({
          id: `outcome_${randomUUID()}`,
          recommendationId,
          outcomeStatus,
          notes: body.notes as string ?? null,
          updatedAt: nowIso(),
        });

        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.MEETING_STATUS_UPDATED ?? "MEETING_STATUS_UPDATED",
          actorUserId: auth.userId,
          targetUserId: recommendation.candidateUserId,
          recommendationId,
          payload: { status, meetingUrl: body.meetingUrl ?? null },
          createdAt: nowIso(),
        }]);

        return json({ meeting });
      }
    }

    return json({ error: "Route not found." }, 404);

  } catch (error) {
    if (error instanceof AuthError) {
      return json({ error: error.message }, error.statusCode);
    }
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return json({ error: message }, statusCodeFromError(error));
  }
});
