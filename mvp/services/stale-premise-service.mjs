import { randomUUID } from 'node:crypto';
import { MATCH_STATUSES, RECOMMENDATION_STATUSES, nowIso } from '../domain/models.mjs';
import { TRUST_SIGNAL_TYPES } from '../domain/trust.mjs';
import { EVENT_TYPES } from '../domain/events.mjs';
import { confidenceBandFromScore } from '../context/blind-rationale.mjs';

// Stale-premise re-evaluation (alignment plan, Phase 2, item 6).
//
// When a user edits a core matching field after a match has moved past HITL
// review, the rationale the other side has already seen or acted on may no
// longer hold (Tom pivots edtech → fintech; the call premise is stale, L2-S5).
// On such an edit we re-score the in-flight pair with the production matcher,
// refresh the stored rationale so no one acts on a stale premise, and — if the
// confidence band dropped — route the recommendation back to the HITL queue
// with an auditable trust signal. We deliberately do NOT auto-mutate match
// state: surfacing to admin (100% review) is the product (decision 3).

// Fields whose change can invalidate a match premise. Exported so the edge api
// handler reuses the exact same decision logic (no drift between backends).
export const CORE_FIELDS = ['asks', 'offers', 'interests', 'userType', 'preferredUserTypes'];

// In-flight = past under_review, not yet met/terminal.
export const IN_FLIGHT_STATES = [
  MATCH_STATUSES.OFFERED_BLIND,
  MATCH_STATUSES.MUTUAL_ACCEPTED,
  MATCH_STATUSES.REVEALED,
  MATCH_STATUSES.SCHEDULED,
];

export const BAND_RANK = Object.freeze({ low: 0, medium: 1, high: 2 });

function comparable(value) {
  if (Array.isArray(value)) {
    return [...value].map((v) => String(v).trim().toLowerCase()).sort();
  }
  return String(value ?? '').trim().toLowerCase();
}

// Did any core matching field change between two preference snapshots?
export function coreFieldsChanged(previousPreferences, currentPreferences) {
  if (!previousPreferences) {
    return false;
  }
  return CORE_FIELDS.some(
    (field) =>
      JSON.stringify(comparable(previousPreferences[field])) !==
      JSON.stringify(comparable(currentPreferences[field])),
  );
}

// Pure decision for a single recommendation given its fresh re-score. `fresh`
// is the matcher's recommendation object for this pair, or null if the pair no
// longer produces a match. Returns the rationale to store and whether the
// confidence band dropped (→ route back to HITL).
export function decideRecReeval(rec, fresh) {
  const oldBand = confidenceBandFromScore(rec.score);
  const newScore = fresh ? fresh.score : 0;
  const newBand = fresh ? confidenceBandFromScore(newScore) : 'low';
  const dropped = !fresh || BAND_RANK[newBand] < BAND_RANK[oldBand];
  // rec.whyMatched is an array on the mvp path and a raw string on the edge
  // path; coerce so we never spread a string into characters.
  const priorWhy = Array.isArray(rec.whyMatched)
    ? rec.whyMatched
    : rec.whyMatched
      ? [String(rec.whyMatched)]
      : [];
  const whyMatched = fresh
    ? fresh.whyMatched
    : [...priorWhy, 'Premise changed: pair no longer meets current matching criteria'];
  return { whyMatched, newScore, oldBand, newBand, dropped };
}

export class StalePremiseService {
  constructor({ repository, matcher, cepService = null }) {
    this.repository = repository;
    this.matcher = matcher;
    this.cepService = cepService;
  }

  coreFieldsChanged(previousPreferences, currentPreferences) {
    return coreFieldsChanged(previousPreferences, currentPreferences);
  }

  reEvaluateForUser(userId, { previousPreferences = null } = {}) {
    const currentProfile = this.repository.getUserProfile(userId);
    if (!currentProfile) {
      return { changed: false, reevaluated: [] };
    }
    if (previousPreferences && !this.coreFieldsChanged(previousPreferences, currentProfile.preferences)) {
      return { changed: false, reevaluated: [] };
    }

    const matches = this.repository.listMatchesForUser(userId, { states: IN_FLIGHT_STATES });
    const reevaluated = [];

    for (const match of matches) {
      const otherId = match.userAId === userId ? match.userBId : match.userAId;
      const otherProfile = this.repository.getUserProfile(otherId);
      if (!otherProfile) {
        continue;
      }

      const cepMap = this.cepService
        ? this.cepService.getActiveFocusMap([userId, otherId])
        : new Map();
      // Empty pair-history so cooldown / prior-intro filters don't suppress the
      // re-score; we want a fresh compatibility read on current profiles.
      const results = this.matcher.matchUsers([currentProfile, otherProfile], new Map(), cepMap);

      for (const recId of [match.recommendationId, match.reverseRecommendationId]) {
        if (!recId) {
          continue;
        }
        const rec = this.repository.getRecommendationById(recId);
        if (!rec) {
          continue;
        }

        const fresh = (results.get(rec.userId) ?? []).find((r) => r.candidateUserId === rec.candidateUserId) ?? null;
        const { whyMatched, newScore, oldBand, newBand, dropped } = decideRecReeval(rec, fresh);

        // Always refresh the stored rationale so nobody acts on a stale premise.
        this.repository.updateRecommendationRationale(recId, { whyMatched, score: newScore });

        if (dropped) {
          this.flagForHitl({ recId, match, editorUserId: userId, oldBand, newBand });
        }
        this.recordEvent({ recId, match, editorUserId: userId, oldBand, newBand, dropped });
        reevaluated.push({ recommendationId: recId, oldBand, newBand, dropped });
      }
    }

    return { changed: reevaluated.length > 0, reevaluated };
  }

  flagForHitl({ recId, match, editorUserId, oldBand, newBand }) {
    // Route back to HITL: return the recommendation to the admin review queue
    // and record an auditable, explainable trust signal.
    this.repository.updateRecommendationStatus(recId, RECOMMENDATION_STATUSES.PENDING_REVIEW);
    this.repository.appendTrustSignal({
      id: `trust_${randomUUID()}`,
      userId: editorUserId,
      signalType: TRUST_SIGNAL_TYPES.HITL_FLAG,
      weight: 0,
      matchId: match.id,
      sourceEventId: null,
      payload: { reason: 'stale_premise', oldBand, newBand },
      createdAt: nowIso(),
    });
  }

  recordEvent({ recId, match, editorUserId, oldBand, newBand, dropped }) {
    if (typeof this.repository.appendEvents !== 'function') {
      return;
    }
    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.STALE_PREMISE_REEVALUATED,
        actorUserId: editorUserId,
        targetUserId: null,
        recommendationId: recId,
        payload: { matchId: match.id, oldBand, newBand, dropped, routedToHitl: dropped },
        createdAt: nowIso(),
      },
    ]);
  }
}
