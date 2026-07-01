import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';
import { buildRecommendationGenerationSnapshot } from '../context/profile-context-support.mjs';
import { generateInsightText } from '../context/insight-generation.mjs';

export class WeeklyMatchingService {
  constructor({ repository, matcher, cepService = null, completenessService = null }) {
    this.repository = repository;
    this.matcher = matcher;
    this.cepService = cepService;
    this.completenessService = completenessService;
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
      const allProfiles = this.repository.listUsersForMatching();
      const profiles = this.completenessService
        ? this.completenessService.filterEligibleProfiles(allProfiles)
        : allProfiles;
      const usersSkippedIncomplete = allProfiles.length - profiles.length;
      const pairHistory = this.repository.listPairHistory({ sinceDays: 90 });
      const allUserIds = profiles.map((p) => p.user.id);
      const cepMap = this.cepService ? this.cepService.getActiveFocusMap(allUserIds) : new Map();
      const candidateMap = this.matcher.matchUsers(profiles, pairHistory, cepMap);
      const profilesById = new Map(profiles.map((profile) => [profile.user.id, profile]));

      const recommendations = [];
      for (const [userId, recs] of candidateMap.entries()) {
        const sourceProfile = profilesById.get(userId);
        for (const recommendation of recs.slice(0, maxRecommendationsPerUser)) {
          const candidateProfile = profilesById.get(recommendation.candidateUserId);
          const sourceCep = cepMap.get(userId) ?? null;
          const candidateCep = cepMap.get(recommendation.candidateUserId) ?? null;
          const insightText =
            sourceProfile && candidateProfile
              ? generateInsightText(sourceProfile, candidateProfile, { sourceCep, candidateCep })
              : '';
          recommendations.push({
            id: `rec_${randomUUID()}`,
            runId,
            userId,
            candidateUserId: recommendation.candidateUserId,
            rank: recommendation.rank,
            score: recommendation.score,
            status: RECOMMENDATION_STATUSES.PENDING_REVIEW,
            whyMatched: recommendation.whyMatched,
            insightText,
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
        usersSkippedIncomplete,
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
