import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { OUTCOME_STATUSES, RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';

export class RecommendationService {
  constructor({ repository }) {
    this.repository = repository;
  }

  listForUser(userId, { status } = {}) {
    return this.repository.listRecommendationsForUser(userId, { status });
  }

  respondToRecommendation({ recommendationId, userId, decision }) {
    const normalizedDecision = String(decision ?? '').toLowerCase();
    if (!['accept', 'pass'].includes(normalizedDecision)) {
      throw new Error('Decision must be accept or pass.');
    }

    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    if (recommendation.userId !== userId) {
      throw new Error('User is not allowed to respond to this recommendation.');
    }

    const nextStatus = normalizedDecision === 'accept' ? RECOMMENDATION_STATUSES.ACCEPTED : RECOMMENDATION_STATUSES.PASSED;

    this.repository.updateRecommendationStatus(recommendationId, nextStatus, nowIso());

    this.repository.upsertOutcome({
      id: `outcome_${randomUUID()}`,
      recommendationId,
      requesterResponse: normalizedDecision,
      outcomeStatus: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
      notes: null,
      updatedAt: nowIso(),
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: normalizedDecision === 'accept' ? EVENT_TYPES.USER_ACCEPT : EVENT_TYPES.USER_PASS,
        actorUserId: userId,
        targetUserId: userId,
        recommendationId,
        payload: {
          decision: normalizedDecision,
          candidateUserId: recommendation.candidateUserId,
        },
        createdAt: nowIso(),
      },
    ]);

    return {
      recommendationId,
      status: nextStatus,
      decision: normalizedDecision,
    };
  }

  updateFollowThrough({ recommendationId, actorUserId, status, notes }) {
    const normalizedStatus = String(status ?? '').toLowerCase();
    if (!Object.values(OUTCOME_STATUSES).includes(normalizedStatus)) {
      throw new Error('Invalid follow-through status.');
    }

    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    const outcome = this.repository.upsertOutcome({
      id: `outcome_${randomUUID()}`,
      recommendationId,
      outcomeStatus: normalizedStatus,
      notes: notes ?? null,
      updatedAt: nowIso(),
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: normalizedStatus === OUTCOME_STATUSES.INTRO_SENT ? EVENT_TYPES.INTRO_SENT : EVENT_TYPES.FOLLOW_THROUGH_UPDATED,
        actorUserId: actorUserId ?? null,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: {
          outcomeStatus: normalizedStatus,
          notes: notes ?? null,
        },
        createdAt: nowIso(),
      },
    ]);

    return outcome;
  }

  listEvents(filters = {}) {
    return this.repository.listEvents(filters);
  }
}
