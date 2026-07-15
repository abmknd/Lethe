// Lethe — weekly matching Edge Function
// Triggered via HTTP POST (Vercel cron or manual).
// Ports WeeklyMatchingService.runWeeklyMatching() to async/Deno.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository } from "../_shared/repository.ts";

import { createDeterministicMatcher } from "../../../mvp/matching/deterministic-matcher.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";
import { RECOMMENDATION_STATUSES, MATCH_STATUSES, nowIso } from "../../../mvp/domain/models.mjs";
import {
  buildRecommendationGenerationSnapshot,
  buildMatchingInputSnapshot,
} from "../../../mvp/context/profile-context-support.mjs";
import {
  decideReviewRouting,
  normalizeHitlConfig,
  DEFAULT_HITL_CONFIG,
  REVIEW_ROUTES,
} from "../../../mvp/domain/hitl-policy.mjs";

function pairKeyOf(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const matcher = createDeterministicMatcher();

// Verify the caller is an admin. Returns null on success or a Response on failure.
// Identity is established by decoding the user JWT in the Authorization header
// against the Supabase Auth service (auth.getUser). Authorization is a
// comma-separated email allowlist read from the ADMIN_EMAILS function secret.
async function authorizeAdmin(req: Request): Promise<Response | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[run-weekly-matching] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json({ error: "Server misconfiguration." }, 500);
  }

  const adminEmails = (Deno.env.get("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) {
    console.error("[run-weekly-matching] ADMIN_EMAILS is not set");
    return json({ error: "Server misconfiguration." }, 500);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ error: "Authentication required." }, 401);
  const token = match[1];

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return json({ error: "Invalid session." }, 401);

  const email = (data.user.email ?? "").toLowerCase();
  if (!email || !adminEmails.includes(email)) {
    return json({ error: "Admin access required." }, 403);
  }
  return null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return corsPreflightResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authFailure = await authorizeAdmin(req);
  if (authFailure) return authFailure;

  let maxRecommendationsPerUser = 5;
  try {
    const text = await req.text();
    if (text.trim()) {
      const body = JSON.parse(text);
      if (typeof body.maxRecommendationsPerUser === "number") {
        maxRecommendationsPerUser = body.maxRecommendationsPerUser;
      }
    }
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const runId = `run_${crypto.randomUUID()}`;
  const startedAt = nowIso();

  await repository.createRecommendationRun({
    id: runId,
    runType: "weekly",
    status: "running",
    startedAt,
  });

  try {
    const [profiles, pairHistory] = await Promise.all([
      repository.listUsersForMatching(),
      repository.listPairHistory({ sinceDays: 180 }),
    ]);

    // Freeze this cycle's matching inputs (decision 2): a durable, per-run record.
    await repository.insertMatchingSnapshots(
      runId,
      profiles.map((p) => buildMatchingInputSnapshot(p)),
    );

    const candidateMap = matcher.matchUsers(profiles, pairHistory);
    const profilesById = new Map(profiles.map((p) => [p.user.id, p]));

    const recommendations: Array<{
      id: string; runId: string; userId: string; candidateUserId: string;
      rank: number; score: number; status: string; whyMatched: string;
    }> = [];

    for (const [userId, recs] of candidateMap.entries()) {
      for (const rec of (recs as Array<Record<string, unknown>>).slice(0, maxRecommendationsPerUser)) {
        recommendations.push({
          id: `rec_${crypto.randomUUID()}`,
          runId,
          userId,
          candidateUserId: rec.candidateUserId as string,
          rank: rec.rank as number,
          score: rec.score as number,
          status: RECOMMENDATION_STATUSES.PENDING_REVIEW,
          whyMatched: rec.whyMatched as string,
        });
      }
    }

    // Graduated HITL routing (decision 3), per unordered pair. Parked at 0 →
    // every pair routes to manual, recommendations stay pending_review, and this
    // whole block is a no-op, matching the pre-dial behavior.
    const hitlConfig = normalizeHitlConfig((await repository.getHitlConfig()) ?? DEFAULT_HITL_CONFIG);
    const recDecision = new Map<string, { route: string; reason: string }>();
    const autoPairs: Array<{ pairKey: string; reason: string; recs: typeof recommendations }> = [];

    if (hitlConfig.autoApproveRate > 0) {
      const resolvedCount = (await repository.listResolvedMatchStats()).length;
      const pairs = new Map<string, { userAId: string; userBId: string; recs: typeof recommendations }>();
      for (const rec of recommendations) {
        const key = pairKeyOf(rec.userId, rec.candidateUserId);
        if (!pairs.has(key)) {
          const [a, b] = rec.userId < rec.candidateUserId
            ? [rec.userId, rec.candidateUserId]
            : [rec.candidateUserId, rec.userId];
          pairs.set(key, { userAId: a, userBId: b, recs: [] });
        }
        pairs.get(key)!.recs.push(rec);
      }
      for (const [key, info] of pairs.entries()) {
        const isFirst =
          !(await repository.hasPriorMatchForUser(info.userAId)) ||
          !(await repository.hasPriorMatchForUser(info.userBId));
        const decision = decideReviewRouting({
          config: hitlConfig as unknown as typeof DEFAULT_HITL_CONFIG,
          resolvedCount,
          isFirstMatchForEitherUser: isFirst,
          pairKey: key,
        });
        for (const rec of info.recs) recDecision.set(rec.id, decision);
        if (decision.route === REVIEW_ROUTES.AUTO) {
          for (const rec of info.recs) rec.status = RECOMMENDATION_STATUSES.APPROVED;
          autoPairs.push({ pairKey: key, reason: decision.reason, recs: info.recs });
        }
      }
    }

    await repository.replacePendingRecommendationsForRun(runId, recommendations);

    // Auto-approved pairs open a blind offer, mirroring admin approval.
    for (const { pairKey: key, reason, recs } of autoPairs) {
      const primary = recs[0];
      const reverse = recs[1] ?? null;
      const [ua, ub] = primary.userId < primary.candidateUserId
        ? [primary.userId, primary.candidateUserId]
        : [primary.candidateUserId, primary.userId];
      const matchId = `match_${crypto.randomUUID()}`;
      await repository.createMatch({
        id: matchId,
        recommendationId: primary.id,
        reverseRecommendationId: reverse?.id ?? null,
        userAId: ua,
        userBId: ub,
        state: MATCH_STATUSES.OFFERED_BLIND,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      await repository.appendEvents([
        {
          id: `evt_${crypto.randomUUID()}`,
          eventType: EVENT_TYPES.BLIND_OFFER_CREATED,
          actorUserId: null,
          targetUserId: primary.userId,
          recommendationId: primary.id,
          payload: { matchId, userAId: ua, userBId: ub },
          createdAt: nowIso(),
        },
        {
          id: `evt_${crypto.randomUUID()}`,
          eventType: EVENT_TYPES.HITL_AUTO_APPROVED,
          actorUserId: null,
          targetUserId: primary.userId,
          recommendationId: primary.id,
          payload: { pairKey: key, reason },
          createdAt: nowIso(),
        },
      ]);
    }

    const events = recommendations.map((rec) => {
      const sourceProfile = profilesById.get(rec.userId);
      const candidateProfile = profilesById.get(rec.candidateUserId);

      const explanationSupportSnapshot =
        sourceProfile && candidateProfile
          ? buildRecommendationGenerationSnapshot({
              recommendation: rec,
              sourceProfile,
              candidateProfile,
              generatedAt: nowIso(),
            })
          : null;

      return {
        id: `evt_${crypto.randomUUID()}`,
        eventType: EVENT_TYPES.RECOMMENDATION_GENERATED,
        actorUserId: null,
        targetUserId: rec.userId,
        recommendationId: rec.id,
        payload: {
          candidateUserId: rec.candidateUserId,
          score: rec.score,
          rank: rec.rank,
          whyMatched: rec.whyMatched,
          explanationSupportSnapshot,
          hitlRouting: recDecision.get(rec.id) ?? null,
        },
        createdAt: nowIso(),
      };
    });

    await repository.appendEvents(events);

    const summary = {
      usersEvaluated: profiles.length,
      recommendationsGenerated: recommendations.length,
      maxRecommendationsPerUser,
    };

    const completedAt = nowIso();
    await repository.completeRecommendationRun(runId, {
      status: "completed",
      completedAt,
      summary,
    });

    return json({ ok: true, runId, startedAt, completedAt, summary });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await repository.completeRecommendationRun(runId, {
      status: "failed",
      completedAt: nowIso(),
      summary: { error: message },
    });
    return json({ error: message }, 500);
  }
});
