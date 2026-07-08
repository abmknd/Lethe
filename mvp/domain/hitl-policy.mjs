// Graduated HITL review dial (alignment plan, Phase 1 / decision 3).
//
// Today every generated match is held for manual admin review. This module is
// the plumbing for letting a *share* of matches auto-approve as sustained,
// verified-tenure-weighted acceptance holds — a dial, not a switch a sybil vote
// can flip. It ships PARKED AT 0 (autoApproveRate = 0), so behavior is
// unchanged until an admin deliberately raises it.
//
// Every routing decision is deterministic and explainable: the same match
// always routes the same way for a given config, and the reason is recorded.

export const ALLOWED_AUTO_APPROVE_RATES = Object.freeze([0, 10, 25, 50]);

export const DEFAULT_HITL_CONFIG = Object.freeze({
  autoApproveRate: 0,
  minSampleFloor: 20,
  whiteGloveFirstMatch: true,
});

export const REVIEW_ROUTES = Object.freeze({ MANUAL: 'manual', AUTO: 'auto' });

export const ROUTING_REASONS = Object.freeze({
  DIAL_PARKED: 'hitl_dial_parked',
  BELOW_FLOOR: 'below_min_sample_floor',
  WHITE_GLOVE: 'white_glove_first_match',
  AUTO_BY_DIAL: 'auto_approved_by_dial',
  OUTSIDE_SHARE: 'held_outside_dial_share',
});

// Verified tenure weighting for the acceptance metric (decision 3). More
// trustworthy accounts count for more, so a handful of new or gamed accounts
// cannot move the metric that would justify raising the dial.
const TIER_WEIGHT = { unverified: 0.5, oauth_verified: 1.0, work_email_verified: 1.5 };

export function normalizeHitlConfig(input = {}) {
  const rawRate = Number(input.autoApproveRate ?? input.auto_approve_rate ?? 0);
  // Snap to the nearest allowed rate; anything invalid falls back to 0 (parked).
  const autoApproveRate = ALLOWED_AUTO_APPROVE_RATES.includes(rawRate)
    ? rawRate
    : 0;

  const rawFloor = Number(input.minSampleFloor ?? input.min_sample_floor ?? DEFAULT_HITL_CONFIG.minSampleFloor);
  const minSampleFloor = Number.isFinite(rawFloor) && rawFloor >= 0 ? Math.floor(rawFloor) : DEFAULT_HITL_CONFIG.minSampleFloor;

  const whiteGloveRaw = input.whiteGloveFirstMatch ?? input.white_glove_first_match;
  const whiteGloveFirstMatch = whiteGloveRaw === undefined ? true : Boolean(whiteGloveRaw);

  return { autoApproveRate, minSampleFloor, whiteGloveFirstMatch };
}

// Stable 0..99 bucket from a string key (FNV-1a). Deterministic so a given
// pair always lands in the same bucket, which makes "X% auto-approve" a stable
// share rather than a coin flip that changes on retry.
export function hashBucket(key) {
  let h = 0x811c9dc5;
  const s = String(key);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 100;
}

// The core decision. Returns { route, reason }, always explainable.
export function decideReviewRouting({
  config = DEFAULT_HITL_CONFIG,
  resolvedCount = 0,
  isFirstMatchForEitherUser = false,
  pairKey = '',
} = {}) {
  const cfg = normalizeHitlConfig(config);

  if (cfg.autoApproveRate <= 0) {
    return { route: REVIEW_ROUTES.MANUAL, reason: ROUTING_REASONS.DIAL_PARKED };
  }
  if (resolvedCount < cfg.minSampleFloor) {
    return { route: REVIEW_ROUTES.MANUAL, reason: ROUTING_REASONS.BELOW_FLOOR };
  }
  if (cfg.whiteGloveFirstMatch && isFirstMatchForEitherUser) {
    return { route: REVIEW_ROUTES.MANUAL, reason: ROUTING_REASONS.WHITE_GLOVE };
  }
  const bucket = hashBucket(pairKey);
  return bucket < cfg.autoApproveRate
    ? { route: REVIEW_ROUTES.AUTO, reason: ROUTING_REASONS.AUTO_BY_DIAL }
    : { route: REVIEW_ROUTES.MANUAL, reason: ROUTING_REASONS.OUTSIDE_SHARE };
}

function tenureFactor(tenureDays) {
  const days = Math.max(0, Number(tenureDays) || 0);
  // 1.0 at day 0 rising to 1.5 by a year of tenure, then flat.
  return 1 + Math.min(days / 365, 1) * 0.5;
}

// Verified-tenure-weighted acceptance rate over resolved matches. This is the
// metric an admin would watch before raising the dial; it is not used to
// auto-move the dial (decision 4: don't auto-tune yet).
export function computeWeightedAcceptance(resolvedMatches = []) {
  let weightedAccepted = 0;
  let weightedTotal = 0;
  for (const m of resolvedMatches) {
    const w = (TIER_WEIGHT[m.verificationTier] ?? TIER_WEIGHT.unverified) * tenureFactor(m.tenureDays);
    weightedTotal += w;
    if (m.accepted) weightedAccepted += w;
  }
  return {
    sampleCount: resolvedMatches.length,
    weightedAcceptance: weightedTotal > 0 ? weightedAccepted / weightedTotal : 0,
  };
}
