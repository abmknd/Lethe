// Lethe API — Supabase Edge Function
// Port of mvp/api/server.mjs for Deno runtime.
// Domain modules (models, events, services) are imported via relative paths
// from the project root. Run `supabase functions serve` from the project root.

import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository, toPublicProfile } from "../_shared/repository.ts";
import { AuthError, requireAuth, requireSelf } from "../_shared/auth.ts";
import { sendIntroEmails } from "../_shared/email.ts";

import {
  normalizeProfilePayload,
  normalizeConnectionReadiness,
  readinessExpiresAt,
  isReadinessActive,
  RECOMMENDATION_STATUSES,
  OUTCOME_STATUSES,
  READINESS_STATUSES,
  nowIso,
} from "../../../mvp/domain/models.mjs";
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

function readinessRecommendation(readiness: { status: string; recommendation?: string }): string {
  if (readiness.recommendation) return readiness.recommendation;
  if (readiness.status === READINESS_STATUSES.EXCELLENT || readiness.status === READINESS_STATUSES.GOOD) {
    return "Ready for video.";
  }
  if (readiness.status === READINESS_STATUSES.MEDIUM) return "Audio-first recommended.";
  if (readiness.status === READINESS_STATUSES.LOW) return "Test again before joining; audio-first recommended.";
  if (readiness.status === READINESS_STATUSES.FAILED) return "Resolve device or network issues before joining.";
  return "Untested recently.";
}

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

    if (req.method === "GET" && path === "/api/v1/health") {
      return json({ ok: true });
    }

    // ── auth gate (everything below requires a valid Supabase JWT) ──────────

    const auth = await requireAuth(req);

    // ── users ─────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/users") {
      return json({ users: await repository.listUsers() });
    }

    const userPublicProfileMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/profile\/public$/);
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

    const userProfileMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/profile$/);
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

    const userContextMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/context$/);
    if (userContextMatch && req.method === "GET") {
      const userId = decodeURIComponent(userContextMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ context: profile });
    }

    const userRecsMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/recommendations$/);
    if (userRecsMatch && req.method === "GET") {
      const userId = decodeURIComponent(userRecsMatch[1]);
      requireSelf(auth, userId);
      const status = url.searchParams.get("status") ?? undefined;
      const recommendations = await repository.listRecommendationsForUser(userId, { status });
      return json({ recommendations });
    }

    const userCompletenessMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/completeness$/);
    if (userCompletenessMatch && req.method === "GET") {
      const userId = decodeURIComponent(userCompletenessMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      const result = checkProfileCompleteness(profile);
      return json({ completeness: { userId, ...result } });
    }

    const userReadinessMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/meeting-readiness$/);
    if (userReadinessMatch && req.method === "GET") {
      const userId = decodeURIComponent(userReadinessMatch[1]);
      requireSelf(auth, userId);
      const readiness = await repository.getConnectionReadiness(userId);
      const active = readiness ? isReadinessActive(readiness) : false;
      return json({
        readiness,
        isActive: active,
        displayStatus: active ? readiness?.status : READINESS_STATUSES.UNKNOWN,
      });
    }

    if (req.method === "POST" && path === "/api/trial/meeting-readiness/start") {
      const body = await readJsonBody(req);
      const userId = String(body.userId ?? "");
      requireSelf(auth, userId);
      const now = nowIso();
      const readiness = await repository.upsertConnectionReadiness(userId, {
        provider: String(body.provider ?? "manual_link"),
        testedAt: now,
        expiresAt: readinessExpiresAt(now, "join"),
        status: READINESS_STATUSES.UNKNOWN,
        canUseCamera: false,
        canUseMic: false,
        deviceWarnings: [],
        recommendation: "Readiness check started.",
      });
      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_STARTED ?? "meeting_readiness_started",
        actorUserId: userId,
        targetUserId: userId,
        payload: { provider: readiness.provider },
        createdAt: now,
      }]);
      return json({ readiness, isActive: isReadinessActive(readiness), displayStatus: readiness.status });
    }

    if (req.method === "POST" && path === "/api/trial/meeting-readiness/result") {
      const body = await readJsonBody(req);
      const userId = String(body.userId ?? "");
      requireSelf(auth, userId);
      const normalized = normalizeConnectionReadiness({
        ...body,
        expiresAt: body.expiresAt ?? readinessExpiresAt((body.testedAt as string | undefined) ?? nowIso(), "scheduling"),
      });
      const readiness = await repository.upsertConnectionReadiness(userId, {
        ...normalized,
        recommendation: readinessRecommendation(normalized),
      });
      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_RECORDED ?? "meeting_readiness_recorded",
        actorUserId: userId,
        targetUserId: userId,
        payload: {
          provider: readiness.provider,
          status: readiness.status,
          score: readiness.score,
          recommendation: readiness.recommendation,
        },
        createdAt: nowIso(),
      }]);
      return json({ readiness, isActive: isReadinessActive(readiness), displayStatus: readiness.status });
    }

    // ── admin (TODO: admin role auth — out of scope for ticket #1) ───────────

    if (req.method === "GET" && path === "/api/v1/admin/recommendations") {
      const status = url.searchParams.get("status") ?? "pending_review";
      const recommendations = await repository.listAdminRecommendations({ status });
      return json({ recommendations });
    }

    const adminDecisionMatch = path.match(/^\/api\/v1\/admin\/recommendations\/([^/]+)\/decision$/);
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

      const adminId = String(body.adminId ?? "admin_system");
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

    const adminContextMatch = path.match(/^\/api\/v1\/admin\/recommendations\/([^/]+)\/context$/);
    if (adminContextMatch && req.method === "GET") {
      const recommendationId = decodeURIComponent(adminContextMatch[1]);
      const context = await repository.getRecommendationContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    // ── recommendations ───────────────────────────────────────────────────────

    const insightMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/insight$/);
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

    const participantsContextMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/participants-context$/);
    if (participantsContextMatch && req.method === "GET") {
      const recommendationId = decodeURIComponent(participantsContextMatch[1]);
      const context = await repository.getRecommendationParticipantsContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    const respondMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/respond$/);
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

    const followThroughMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/follow-through$/);
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

    if (req.method === "GET" && path === "/api/v1/events") {
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

    if (req.method === "GET" && path === "/api/v1/report") {
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

    const cepMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/cep$/);
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

    const meetingMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/meeting$/);
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

    // ── messaging ─────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/conversations") {
      const conversations = await repository.listConversationsForUser(auth.userId);
      return json({ conversations });
    }

    if (req.method === "POST" && path === "/api/v1/conversations") {
      const body = await readJsonBody(req);
      const otherUserId = String(body.otherUserId ?? "").trim();
      if (!otherUserId) return json({ error: "otherUserId is required." }, 400);
      if (otherUserId === auth.userId) {
        return json({ error: "Cannot start a conversation with yourself." }, 400);
      }

      const existing = await repository.findConversationBetween(auth.userId, otherUserId);
      if (existing) return json({ conversation: existing });

      const unlockingId = await repository.findUnlockingRecommendationId(auth.userId, otherUserId);
      if (!unlockingId) {
        return json({ error: "Conversation is not unlocked for this pair." }, 403);
      }

      const conversation = await repository.createConversation({
        userA: auth.userId,
        userB: otherUserId,
        unlockedByRecommendationId: unlockingId,
        createdAt: nowIso(),
      });

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.CONVERSATION_CREATED ?? "conversation_created",
        actorUserId: auth.userId,
        targetUserId: otherUserId,
        recommendationId: unlockingId,
        payload: { conversationId: conversation.id },
        createdAt: nowIso(),
      }]);

      return json({ conversation }, 201);
    }

    const messagesMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/);
    if (messagesMatch) {
      const conversationId = decodeURIComponent(messagesMatch[1]);
      const conversation = await repository.getConversationById(conversationId);
      if (!conversation) return json({ error: "Conversation not found." }, 404);
      if (![conversation.participantA, conversation.participantB].includes(auth.userId)) {
        return json({ error: "Forbidden: not a participant." }, 403);
      }

      if (req.method === "GET") {
        const limit = Number(url.searchParams.get("limit") ?? 50);
        const before = url.searchParams.get("before") ?? undefined;
        const messages = await repository.listMessages(conversationId, {
          limit: Number.isFinite(limit) ? limit : 50,
          before,
        });
        return json({ messages });
      }

      if (req.method === "POST") {
        const body = await readJsonBody(req);
        const messageBody = String(body.body ?? "").trim();
        if (!messageBody) return json({ error: "body is required." }, 400);
        if (messageBody.length > 4000) {
          return json({ error: "body exceeds 4000 characters." }, 400);
        }

        const id = String(body.id ?? `msg_${randomUUID()}`);
        const createdAt = nowIso();
        const message = await repository.sendMessage({
          id, conversationId, senderId: auth.userId, body: messageBody, createdAt,
        });

        const peerId = conversation.participantA === auth.userId
          ? conversation.participantB
          : conversation.participantA;

        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.MESSAGE_SENT ?? "message_sent",
          actorUserId: auth.userId,
          targetUserId: peerId,
          recommendationId: conversation.unlockedByRecommendationId,
          payload: { conversationId, messageId: id },
          createdAt,
        }]);

        return json({ message }, 201);
      }
    }

    const readMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/read$/);
    if (readMatch && req.method === "POST") {
      const conversationId = decodeURIComponent(readMatch[1]);
      const conversation = await repository.getConversationById(conversationId);
      if (!conversation) return json({ error: "Conversation not found." }, 404);
      if (![conversation.participantA, conversation.participantB].includes(auth.userId)) {
        return json({ error: "Forbidden: not a participant." }, 403);
      }
      await repository.markConversationRead(conversationId, auth.userId, nowIso());
      return json({ ok: true });
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
