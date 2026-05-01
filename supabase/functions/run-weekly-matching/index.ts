// Lethe — weekly matching Edge Function
// Triggered via HTTP POST (Vercel cron or manual).
// Ports WeeklyMatchingService.runWeeklyMatching() to async/Deno.

import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository } from "../_shared/repository.ts";

import { createDeterministicMatcher } from "../../../mvp/matching/deterministic-matcher.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";
import { RECOMMENDATION_STATUSES, nowIso } from "../../../mvp/domain/models.mjs";
import { buildRecommendationGenerationSnapshot } from "../../../mvp/context/profile-context-support.mjs";

const matcher = createDeterministicMatcher();

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return corsPreflightResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

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
      repository.listPairHistory({ sinceDays: 90 }),
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
