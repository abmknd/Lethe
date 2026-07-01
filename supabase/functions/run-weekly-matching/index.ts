// Lethe — weekly matching Edge Function
// Triggered via HTTP POST (Vercel cron or manual).
// Ports WeeklyMatchingService.runWeeklyMatching() to async/Deno.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository } from "../_shared/repository.ts";

import { createDeterministicMatcher } from "../../../mvp/matching/deterministic-matcher.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";
import { RECOMMENDATION_STATUSES, nowIso } from "../../../mvp/domain/models.mjs";
import { buildRecommendationGenerationSnapshot } from "../../../mvp/context/profile-context-support.mjs";

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

    await repository.replacePendingRecommendationsForRun(runId, recommendations);

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
