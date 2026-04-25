import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';
import { buildRecommendationGenerationSnapshot } from '../context/profile-context-support.mjs';

export class WeeklyMatchingService {
  constructor({ repository, matcher }) {
    this.repository = repository;
    this.matcher = matcher;
  }

  runWeeklyMatching({ maxRecommendationsPerUser = 5 } = {}) {
    const runId = `run_${randomUUID()}`;
    const startedAt = nowIso();

    this.repository.createRecommendationRun({
      id: runId,
      runType: 'weekly',
      status: 'running',
      startedAt,
    });

    try {
      const profiles = this.repository.listUsersForMatching();
      const pairHistory = this.repository.listPairHistory({ sinceDays: 90 });
      const candidateMap = this.matcher.matchUsers(profiles, pairHistory);
      const profilesById = new Map(profiles.map((profile) => [profile.user.id, profile]));

      const recommendations = [];
      for (const [userId, recs] of candidateMap.entries()) {
        for (const recommendation of recs.slice(0, maxRecommendationsPerUser)) {
          recommendations.push({
            id: `rec_${randomUUID()}`,
            runId,
            userId,
            candidateUserId: recommendation.candidateUserId,
            rank: recommendation.rank,
            score: recommendation.score,
            status: RECOMMENDATION_STATUSES.PENDING_REVIEW,
            whyMatched: recommendation.whyMatched,
          });
        }
      }

      this.repository.replacePendingRecommendationsForRun(runId, recommendations);

      this.repository.appendEvents(
        recommendations.map((recommendation) => {
          const sourceProfile = profilesById.get(recommendation.userId) ?? this.repository.getUserProfile(recommendation.userId);
          const candidateProfile =
            profilesById.get(recommendation.candidateUserId) ?? this.repository.getUserProfile(recommendation.candidateUserId);

          const explanationSupportSnapshot =
            sourceProfile && candidateProfile
              ? buildRecommendationGenerationSnapshot({
                  recommendation,
                  sourceProfile,
                  candidateProfile,
                  generatedAt: nowIso(),
                })
              : null;

          return {
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.RECOMMENDATION_GENERATED,
          actorUserId: null,
          targetUserId: recommendation.userId,
          recommendationId: recommendation.id,
          runId,
          payload: {
            candidateUserId: recommendation.candidateUserId,
            score: recommendation.score,
            rank: recommendation.rank,
            whyMatched: recommendation.whyMatched,
            explanationSupportSnapshot,
          },
          createdAt: nowIso(),
          };
        }),
      );

      const summary = {
        usersEvaluated: profiles.length,
        recommendationsGenerated: recommendations.length,
        maxRecommendationsPerUser,
      };

      this.repository.completeRecommendationRun(runId, {
        status: 'completed',
        completedAt: nowIso(),
        summary,
      });

      return {
        runId,
        startedAt,
        completedAt: nowIso(),
        summary,
      };
    } catch (error) {
      this.repository.completeRecommendationRun(runId, {
        status: 'failed',
        completedAt: nowIso(),
        summary: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}
