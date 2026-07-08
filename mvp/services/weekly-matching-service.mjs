import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';
import {
  buildRecommendationGenerationSnapshot,
  buildMatchingInputSnapshot,
} from '../context/profile-context-support.mjs';
import { generateInsightText } from '../context/insight-generation.mjs';
import { REVIEW_ROUTES } from '../domain/hitl-policy.mjs';

function pairKeyOf(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export class WeeklyMatchingService {
  constructor({ repository, matcher, cepService = null, completenessService = null, hitlService = null, matchLifecycle = null }) {
    this.repository = repository;
    this.matcher = matcher;
    this.cepService = cepService;
    this.completenessService = completenessService;
    this.hitlService = hitlService;
    this.matchLifecycle = matchLifecycle;
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

      // Freeze this cycle's matching inputs (decision 2). The matcher runs on
      // `profiles`, read once here, so mid-cycle edits already can't change this
      // run; the snapshot makes that durable and auditable, and is the record a
      // dispute is resolved against.
      if (typeof this.repository.insertMatchingSnapshots === 'function') {
        this.repository.insertMatchingSnapshots(runId, profiles.map((profile) => buildMatchingInputSnapshot(profile)));
      }

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

      // Graduated HITL routing (decision 3), decided once per unordered pair.
      // Parked at 0 → every pair routes to manual, so status stays
      // pending_review and behavior is unchanged.
      const recDecision = new Map();
      const pairDecisions = new Map();
      if (this.hitlService) {
        const routingContext = this.hitlService.prepareRoutingContext();
        const pairs = new Map();
        for (const rec of recommendations) {
          const key = pairKeyOf(rec.userId, rec.candidateUserId);
          if (!pairs.has(key)) {
            const [a, b] = rec.userId < rec.candidateUserId
              ? [rec.userId, rec.candidateUserId]
              : [rec.candidateUserId, rec.userId];
            pairs.set(key, { userAId: a, userBId: b, recs: [] });
          }
          pairs.get(key).recs.push(rec);
        }
        for (const [key, info] of pairs.entries()) {
          const decision = this.hitlService.routePair(routingContext, {
            pairKey: key,
            userAId: info.userAId,
            userBId: info.userBId,
          });
          pairDecisions.set(key, { decision, recs: info.recs });
          for (const rec of info.recs) {
            recDecision.set(rec.id, decision);
            if (decision.route === REVIEW_ROUTES.AUTO) {
              rec.status = RECOMMENDATION_STATUSES.APPROVED;
            }
          }
        }
      }

      this.repository.replacePendingRecommendationsForRun(runId, recommendations);

      // Auto-approved pairs open a blind offer immediately, mirroring what admin
      // approval does. No-op while the dial is parked at 0.
      if (this.hitlService && this.matchLifecycle) {
        for (const [key, { decision, recs }] of pairDecisions.entries()) {
          if (decision.route !== REVIEW_ROUTES.AUTO) continue;
          const primary = recs[0];
          const reverse = recs[1] ?? null;
          if (!primary) continue;
          this.matchLifecycle.createBlindOffer({
            recommendation: {
              id: primary.id,
              userId: primary.userId,
              candidateUserId: primary.candidateUserId,
              status: primary.status,
            },
            reverseRecommendationId: reverse?.id ?? null,
            actorUserId: null,
          });
          this.repository.appendEvents([
            {
              id: `evt_${randomUUID()}`,
              eventType: EVENT_TYPES.HITL_AUTO_APPROVED,
              actorUserId: null,
              targetUserId: primary.userId,
              recommendationId: primary.id,
              payload: { pairKey: key, reason: decision.reason },
              createdAt: nowIso(),
            },
          ]);
        }
      }

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
            hitlRouting: recDecision.get(recommendation.id) ?? null,
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
