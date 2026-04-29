// Lethe API — Supabase Edge Function
// Port of mvp/api/server.mjs for Deno runtime.
// Domain modules (models, events, services) are imported via relative paths
// from the project root. Run `supabase functions serve` from the project root.

import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository } from "../_shared/repository.ts";

import { normalizeProfilePayload, RECOMMENDATION_STATUSES, OUTCOME_STATUSES, nowIso } from "../../../mvp/domain/models.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";

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
    // ── health ───────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/health") {
      return json({ ok: true });
    }

    // ── users ─────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/trial/users") {
      return json({ users: await repository.listUsers() });
    }

    const userProfileMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/profile$/);
    if (userProfileMatch) {
      const userId = decodeURIComponent(userProfileMatch[1]);

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
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ context: profile });
    }

    const userRecsMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/recommendations$/);
    if (userRecsMatch && req.method === "GET") {
      const userId = decodeURIComponent(userRecsMatch[1]);
      const status = url.searchParams.get("status") ?? undefined;
      const recommendations = await repository.listRecommendationsForUser(userId, { status });
      return json({ recommendations });
    }

    // ── admin ─────────────────────────────────────────────────────────────────

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
      if (recommendation.userId !== body.userId) {
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
        actorUserId: body.userId as string,
        targetUserId: body.userId as string,
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
        actorUserId: body.actorUserId as string ?? null,
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

    return json({ error: "Route not found." }, 404);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return json({ error: message }, statusCodeFromError(error));
  }
});
