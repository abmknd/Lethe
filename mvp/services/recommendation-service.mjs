import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { OUTCOME_STATUSES, RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';

export class RecommendationService {
  constructor({ repository, matchLifecycle = null }) {
    this.repository = repository;
    this.matchLifecycle = matchLifecycle;
  }

  listForUser(userId, { status } = {}) {
    return this.repository.listRecommendationsForUser(userId, { status });
  }

  getRecommendation(recommendationId) {
    return this.repository.getRecommendationById(recommendationId);
  }

  updateInsightText(recommendationId, insightText) {
    this.repository.updateRecommendationInsightText(recommendationId, insightText);
  }

  // Double-blind response (alignment plan, Phase 0/1). A single accept no
  // longer converts the pair: the recommendation row stays approved until
  // both sides accept blind. Any decline terminates the pair silently.
  respondToRecommendation({ recommendationId, userId, decision, declineReason = null }) {
    const normalizedDecision = String(decision ?? '').toLowerCase();
    if (!['accept', 'pass', 'decline'].includes(normalizedDecision)) {
      throw new Error('Decision must be accept or pass.');
    }
    const blindDecision = normalizedDecision === 'accept' ? 'accept' : 'decline';

    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    // Either side of the pair can respond — recommendations are symmetric after #76.1.
    if (recommendation.userId !== userId && recommendation.candidateUserId !== userId) {
      throw new Error('User is not allowed to respond to this recommendation.');
    }

    if (!this.matchLifecycle) {
      throw new Error('Match lifecycle service is not configured.');
    }

    // Recommendations approved before the lifecycle existed get their match
    // row lazily, so in-flight pairs keep working across the cutover.
    let match = this.matchLifecycle.getMatchByRecommendationId(recommendationId);
    if (!match) {
      const reverse = typeof this.repository.getLatestReverseRecommendation === 'function'
        ? this.repository.getLatestReverseRecommendation({
            userId: recommendation.userId,
            candidateUserId: recommendation.candidateUserId,
          })
        : null;
      match = this.matchLifecycle.createBlindOffer({
        recommendation,
        reverseRecommendationId: reverse?.id ?? null,
        actorUserId: userId,
      });
    }

    const { match: updatedMatch, mutual, alreadyResponded } = this.matchLifecycle.recordBlindResponse({
      recommendationId,
      userId,
      decision: blindDecision,
      declineReason,
    });

    // The recommendation rows derive their status from the pair state:
    // mutual accept converts both directions, a decline passes both, and a
    // lone accept leaves them approved while the other side decides.
    let nextStatus = recommendation.status;
    if (!alreadyResponded) {
      if (mutual) {
        nextStatus = RECOMMENDATION_STATUSES.ACCEPTED;
      } else if (blindDecision === 'decline') {
        nextStatus = RECOMMENDATION_STATUSES.PASSED;
      }

      if (nextStatus !== recommendation.status) {
        this.repository.updateRecommendationStatus(recommendationId, nextStatus, nowIso());
        if (updatedMatch.reverseRecommendationId) {
          this.repository.updateRecommendationStatus(updatedMatch.reverseRecommendationId, nextStatus, nowIso());
        }
      }

      this.repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        requesterResponse: blindDecision === 'accept' ? 'accept' : 'pass',
        outcomeStatus: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
        notes: null,
        updatedAt: nowIso(),
      });

      this.repository.appendEvents([
        {
          id: `evt_${randomUUID()}`,
          eventType: blindDecision === 'accept' ? EVENT_TYPES.USER_ACCEPT : EVENT_TYPES.USER_PASS,
          actorUserId: userId,
          targetUserId: userId,
          recommendationId,
          payload: {
            decision: blindDecision === 'accept' ? 'accept' : 'pass',
            candidateUserId: recommendation.candidateUserId,
          },
          createdAt: nowIso(),
        },
      ]);
    }

    return {
      recommendationId,
      status: nextStatus,
      decision: blindDecision === 'accept' ? 'accept' : 'pass',
      matchId: updatedMatch.id,
      matchState: updatedMatch.state,
      mutual,
      waitingOnOtherSide: blindDecision === 'accept' && !mutual,
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
