import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { MATCH_STATUSES, MATCH_SIDE_RESPONSES, nowIso } from '../domain/models.mjs';
import { TRUST_SIGNAL_TYPES, normalizeTrustSignal } from '../domain/trust.mjs';

// Pair-level match state machine (alignment plan, Phase 0).
//
// A match row owns the double-blind gate: both sides must accept before the
// match reaches MUTUAL_ACCEPTED, and identity opens only at REVEALED. A
// decline is silent: the other side never learns a reason, and no reveal
// ever happens from a one-sided decision.
export const VALID_MATCH_TRANSITIONS = Object.freeze({
  [MATCH_STATUSES.GENERATED]: [MATCH_STATUSES.UNDER_REVIEW, MATCH_STATUSES.EXPIRED],
  [MATCH_STATUSES.UNDER_REVIEW]: [MATCH_STATUSES.OFFERED_BLIND, MATCH_STATUSES.CLOSED, MATCH_STATUSES.EXPIRED],
  [MATCH_STATUSES.OFFERED_BLIND]: [MATCH_STATUSES.MUTUAL_ACCEPTED, MATCH_STATUSES.DECLINED_SILENT, MATCH_STATUSES.EXPIRED],
  [MATCH_STATUSES.MUTUAL_ACCEPTED]: [MATCH_STATUSES.REVEALED, MATCH_STATUSES.EXPIRED, MATCH_STATUSES.SUSPENDED],
  [MATCH_STATUSES.REVEALED]: [MATCH_STATUSES.SCHEDULED, MATCH_STATUSES.CLOSED, MATCH_STATUSES.EXPIRED, MATCH_STATUSES.SUSPENDED],
  [MATCH_STATUSES.SCHEDULED]: [MATCH_STATUSES.MET, MATCH_STATUSES.CLOSED, MATCH_STATUSES.EXPIRED, MATCH_STATUSES.SUSPENDED],
  [MATCH_STATUSES.MET]: [MATCH_STATUSES.REVIEWED, MATCH_STATUSES.CLOSED],
  [MATCH_STATUSES.REVIEWED]: [MATCH_STATUSES.CLOSED],
  [MATCH_STATUSES.SUSPENDED]: [MATCH_STATUSES.CLOSED],
  [MATCH_STATUSES.CLOSED]: [],
  [MATCH_STATUSES.DECLINED_SILENT]: [],
  [MATCH_STATUSES.EXPIRED]: [],
});

export function isValidMatchTransition(fromState, toState) {
  return (VALID_MATCH_TRANSITIONS[fromState] ?? []).includes(toState);
}

// Stable pair ordering so (A, B) and (B, A) resolve to the same match row.
export function orderPair(userIdOne, userIdTwo) {
  return userIdOne < userIdTwo
    ? { userAId: userIdOne, userBId: userIdTwo }
    : { userAId: userIdTwo, userBId: userIdOne };
}

export class MatchLifecycleService {
  constructor({ repository }) {
    this.repository = repository;
  }

  getMatchByRecommendationId(recommendationId) {
    return this.repository.getMatchByRecommendationId(recommendationId);
  }

  // Called at admin approval. Idempotent: an existing match for the pair's
  // recommendation row is returned untouched.
  createBlindOffer({ recommendation, reverseRecommendationId = null, actorUserId = null }) {
    const existing = this.repository.getMatchByRecommendationId(recommendation.id);
    if (existing) {
      return existing;
    }

    const { userAId, userBId } = orderPair(recommendation.userId, recommendation.candidateUserId);
    const match = this.repository.createMatch({
      id: `match_${randomUUID()}`,
      recommendationId: recommendation.id,
      reverseRecommendationId,
      userAId,
      userBId,
      state: MATCH_STATUSES.OFFERED_BLIND,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.BLIND_OFFER_CREATED,
        actorUserId,
        targetUserId: recommendation.userId,
        recommendationId: recommendation.id,
        payload: { matchId: match.id, userAId, userBId },
        createdAt: nowIso(),
      },
    ]);

    return match;
  }

  // One side responds to a blind offer. Only a mutual accept advances the
  // match; a single decline silently terminates it. Repeating the same
  // response is idempotent; changing a response is an error.
  recordBlindResponse({ recommendationId, userId, decision, declineReason = null }) {
    const normalizedDecision = String(decision ?? '').toLowerCase();
    if (!['accept', 'decline'].includes(normalizedDecision)) {
      throw new Error('Blind response decision must be accept or decline.');
    }

    const match = this.repository.getMatchByRecommendationId(recommendationId);
    if (!match) {
      throw new Error('Match not found for recommendation.');
    }

    const side = userId === match.userAId ? 'a' : userId === match.userBId ? 'b' : null;
    if (!side) {
      throw new Error('User is not part of this match.');
    }

    const response = normalizedDecision === 'accept'
      ? MATCH_SIDE_RESPONSES.ACCEPTED
      : MATCH_SIDE_RESPONSES.DECLINED;

    const existingResponse = side === 'a' ? match.aResponse : match.bResponse;
    if (existingResponse) {
      if (existingResponse === response) {
        return { match, mutual: match.state === MATCH_STATUSES.MUTUAL_ACCEPTED, alreadyResponded: true };
      }
      throw new Error('This side of the match has already responded.');
    }

    if (match.state !== MATCH_STATUSES.OFFERED_BLIND) {
      throw new Error(`Match is not open for responses (state: ${match.state}).`);
    }

    const respondedAt = nowIso();
    const otherResponse = side === 'a' ? match.bResponse : match.aResponse;
    const mutual = response === MATCH_SIDE_RESPONSES.ACCEPTED
      && otherResponse === MATCH_SIDE_RESPONSES.ACCEPTED;
    const nextState = response === MATCH_SIDE_RESPONSES.DECLINED
      ? MATCH_STATUSES.DECLINED_SILENT
      : mutual
        ? MATCH_STATUSES.MUTUAL_ACCEPTED
        : match.state;

    const updated = this.repository.updateMatch(match.id, {
      state: nextState,
      [`${side}Response`]: response,
      [`${side}RespondedAt`]: respondedAt,
      updatedAt: respondedAt,
    });

    const events = [
      {
        id: `evt_${randomUUID()}`,
        eventType: response === MATCH_SIDE_RESPONSES.ACCEPTED ? EVENT_TYPES.BLIND_ACCEPT : EVENT_TYPES.BLIND_DECLINE,
        actorUserId: userId,
        targetUserId: userId,
        recommendationId,
        payload: { matchId: match.id, decision: normalizedDecision },
        createdAt: respondedAt,
      },
    ];

    if (mutual) {
      events.push({
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MUTUAL_ACCEPT,
        actorUserId: userId,
        targetUserId: userId,
        recommendationId,
        payload: { matchId: match.id },
        createdAt: respondedAt,
      });
    }

    this.repository.appendEvents(events);

    // The decline reason feeds the trust ledger, never the other user.
    if (response === MATCH_SIDE_RESPONSES.DECLINED && declineReason) {
      this.recordTrustSignal({
        userId,
        signalType: TRUST_SIGNAL_TYPES.BLIND_DECLINE_REASON,
        weight: 0,
        matchId: match.id,
        payload: { reason: String(declineReason).slice(0, 500) },
      });
    }

    return { match: updated, mutual, alreadyResponded: false };
  }

  // Identity opens only after a mutual blind accept.
  reveal({ matchId, actorUserId = null }) {
    return this.transition(matchId, MATCH_STATUSES.REVEALED, {
      actorUserId,
      eventType: EVENT_TYPES.IDENTITY_REVEALED,
    });
  }

  transition(matchId, toState, { actorUserId = null, payload = {}, eventType = EVENT_TYPES.MATCH_STATE_CHANGED } = {}) {
    const match = this.repository.getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found.');
    }

    if (!isValidMatchTransition(match.state, toState)) {
      throw new Error(`Invalid match transition: ${match.state} → ${toState}.`);
    }

    const updatedAt = nowIso();
    const updated = this.repository.updateMatch(matchId, { state: toState, updatedAt });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType,
        actorUserId,
        targetUserId: match.userAId,
        recommendationId: match.recommendationId,
        payload: { matchId, fromState: match.state, toState, ...payload },
        createdAt: updatedAt,
      },
    ]);

    return updated;
  }

  recordTrustSignal(input) {
    const signal = normalizeTrustSignal(input);
    const stored = this.repository.appendTrustSignal({
      id: `trust_${randomUUID()}`,
      ...signal,
      createdAt: nowIso(),
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.TRUST_SIGNAL_RECORDED,
        actorUserId: null,
        targetUserId: signal.userId,
        recommendationId: null,
        payload: { trustSignalId: stored.id, signalType: signal.signalType, matchId: signal.matchId },
        createdAt: nowIso(),
      },
    ]);

    return stored;
  }

  listTrustSignals(userId) {
    return this.repository.listTrustSignalsForUser(userId);
  }
}
