import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';

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

    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    const status = DECISION_TO_STATUS[normalizedDecision];
    this.repository.updateRecommendationStatus(recommendationId, status, nowIso());

    this.repository.recordAdminDecision({
      id: `decision_${randomUUID()}`,
      recommendationId,
      adminId,
      decision: status,
      rationale: rationale ?? null,
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
          rationale: rationale ?? null,
          candidateUserId: recommendation.candidateUserId,
        },
        createdAt: nowIso(),
      },
    ]);

    return {
      recommendationId,
      status,
      decision: normalizedDecision,
      rationale: rationale ?? null,
    };
  }
}
