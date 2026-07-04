// Trust signal ledger (alignment plan, Phase 0 / decision 9).
//
// Trust is an append-only ledger of weighted signals, never a mutable number.
// Signals are written by intake detection, HITL flags, decline reasons,
// no-show tracking, and post-call reviews as those phases land. The computed
// score is derived on read so weight changes replay cleanly over history.

export const TRUST_SIGNAL_TYPES = Object.freeze({
  BLIND_DECLINE_REASON: 'blind_decline_reason',
  INTAKE_REGISTER: 'intake_register',
  HITL_FLAG: 'hitl_flag',
  SILENT_NO_SHOW: 'silent_no_show',
  NOTIFIED_CANCELLATION: 'notified_cancellation',
  REVIEW_POSITIVE: 'review_positive',
  REVIEW_NEGATIVE: 'review_negative',
  DISPUTE_RESOLVED: 'dispute_resolved',
});

export const TRUST_SIGNAL_TYPE_VALUES = Object.freeze(Object.values(TRUST_SIGNAL_TYPES));

export function isValidTrustSignalType(signalType) {
  return TRUST_SIGNAL_TYPE_VALUES.includes(signalType);
}

export function normalizeTrustSignal(input = {}) {
  const signalType = String(input.signalType ?? '').trim().toLowerCase();
  if (!isValidTrustSignalType(signalType)) {
    throw new Error(`Invalid trust signal type: ${signalType || '(empty)'}`);
  }

  const userId = String(input.userId ?? '').trim();
  if (!userId) {
    throw new Error('Trust signal requires a userId.');
  }

  const weight = Number(input.weight ?? 0);
  if (!Number.isFinite(weight)) {
    throw new Error('Trust signal weight must be a finite number.');
  }

  return {
    userId,
    signalType,
    weight,
    matchId: input.matchId ? String(input.matchId).trim() : null,
    sourceEventId: input.sourceEventId ? String(input.sourceEventId).trim() : null,
    payload: typeof input.payload === 'object' && input.payload !== null ? input.payload : {},
  };
}

// Neutral baseline of 50, clamped to [0, 100]. Weights are small integers so
// a single signal never dominates; sustained behavior moves the score.
export function computeTrustScore(signals = []) {
  const base = 50;
  const total = signals.reduce((sum, signal) => sum + (Number(signal.weight) || 0), 0);
  return Math.max(0, Math.min(100, Math.round(base + total)));
}
