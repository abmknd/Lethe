import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';

const CONFLICT_MESSAGE = 'Recommendation is no longer pending review.';
const RATIONALE_MESSAGE = 'Rationale is required and must be at least 10 characters.';

const DECISION_TO_STATUS = {
  approve: RECOMMENDATION_STATUSES.APPROVED,
  reject: RECOMMENDATION_STATUSES.REJECTED,
  approved: RECOMMENDATION_STATUSES.APPROVED,
  rejected: RECOMMENDATION_STATUSES.REJECTED,
};

const DECISION_TO_EVENT = {
  approve: EVENT_TYPES.ADMIN_APPROVED,
  reject: EVENT_TYPES.ADMIN_REJECTED,
  approved: EVENT_TYPES.ADMIN_APPROVED,
  rejected: EVENT_TYPES.ADMIN_REJECTED,
};

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class AdminReviewService {
  constructor({ repository }) {
    this.repository = repository;
  }

  listQueue({ status = RECOMMENDATION_STATUSES.PENDING_REVIEW } = {}) {
    return this.repository.listAdminRecommendations({ status });
  }

  decide({ recommendationId, adminId, decision, rationale }) {
    const normalizedDecision = String(decision ?? '').toLowerCase();
    if (!DECISION_TO_STATUS[normalizedDecision]) {
      throw new Error('Decision must be either approve or reject.');
    }

    const normalizedRationale = String(rationale ?? '').trim();
    if (normalizedRationale.length < 10) {
      throw createHttpError(400, RATIONALE_MESSAGE);
    }

    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    if (recommendation.status !== RECOMMENDATION_STATUSES.PENDING_REVIEW) {
      throw createHttpError(409, CONFLICT_MESSAGE);
    }

    const status = DECISION_TO_STATUS[normalizedDecision];
    const runInTransaction =
      typeof this.repository.withTransaction === 'function'
        ? this.repository.withTransaction.bind(this.repository)
        : (fn) => fn();

    runInTransaction(() => {
      const updated = this.repository.updateRecommendationStatusIfPending(recommendationId, status, nowIso());
      if (!updated) {
        throw createHttpError(409, CONFLICT_MESSAGE);
      }

      this.repository.recordAdminDecision({
        id: `decision_${randomUUID()}`,
        recommendationId,
        adminId,
        decision: status,
        rationale: normalizedRationale,
        decidedAt: nowIso(),
      });

      this.repository.appendEvents([
        {
          id: `evt_${randomUUID()}`,
          eventType: DECISION_TO_EVENT[normalizedDecision],
          actorUserId: adminId,
          targetUserId: recommendation.userId,
          recommendationId,
          payload: {
            decision: normalizedDecision,
            rationale: normalizedRationale,
            candidateUserId: recommendation.candidateUserId,
          },
          createdAt: nowIso(),
        },
      ]);
    });

    return {
      recommendationId,
      status,
      decision: normalizedDecision,
      rationale: normalizedRationale,
    };
  }
}
