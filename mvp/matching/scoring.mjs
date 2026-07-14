// Scoring modifiers (alignment plan, Phase 2, item 2).
//
// Two knobs layered on top of the deterministic base score, both designed to be
// no-ops when their fields are absent so existing scores are unchanged:
//
//   experience proximity (L2-S4) — a first-time founder paired with a veteran
//     operator makes for a one-directional, discouraging call. When BOTH sides
//     declare an experience level, closer levels score higher via a bounded
//     multiplier. The escape hatch: if either side opts into mentor-style
//     matching, the gap is welcomed and no penalty applies.
//
//   match mode (L2-S1) — 'match_my_ask' (default) weights ask/offer
//     complementarity and role fit heavily, as today. 'surprise_me' de-emphasizes
//     complementarity and redistributes toward shared intent/interests/objectives
//     for serendipitous pairings. The requesting profile's mode selects the
//     weight vector for its own recommendations.

function normalizeToken(value) {
  return String(value ?? '').trim().toLowerCase();
}

export const EXPERIENCE_LEVELS = Object.freeze(['first_time', 'early', 'experienced', 'veteran']);

const EXPERIENCE_ALIASES = new Map([
  ['first-time', 'first_time'],
  ['firsttime', 'first_time'],
  ['novice', 'first_time'],
  ['beginner', 'first_time'],
  ['junior', 'early'],
  ['emerging', 'early'],
  ['mid', 'experienced'],
  ['seasoned', 'experienced'],
  ['senior', 'experienced'],
  ['serial', 'veteran'],
  ['expert', 'veteran'],
]);

export function normalizeExperienceLevel(value) {
  const token = normalizeToken(value).replace(/\s+/g, '_');
  if (!token) {
    return '';
  }
  if (EXPERIENCE_LEVELS.includes(token)) {
    return token;
  }
  return EXPERIENCE_ALIASES.get(token) ?? EXPERIENCE_ALIASES.get(normalizeToken(value)) ?? '';
}

export function experienceOrdinal(value) {
  const idx = EXPERIENCE_LEVELS.indexOf(normalizeExperienceLevel(value));
  return idx === -1 ? null : idx;
}

const MENTOR_INTENT_TOKENS = new Set(['mentorship', 'mentor', 'mentoring', 'mentee']);

// A profile is in mentor mode if it flags mentorMatch or declares a
// mentorship-flavored match intent.
export function isMentorMode(prefs = {}) {
  if (prefs.mentorMatch === true) {
    return true;
  }
  const intents = Array.isArray(prefs.matchIntent) ? prefs.matchIntent : [];
  return intents.some((intent) => MENTOR_INTENT_TOKENS.has(normalizeToken(intent)));
}

// Multiplier in [1 - maxPenalty, 1]. Returns 1 (no effect) when either side
// lacks an experience level or when either side is in mentor mode.
export function experienceProximityModifier(aPrefs = {}, bPrefs = {}, { maxPenalty = 0.15 } = {}) {
  if (isMentorMode(aPrefs) || isMentorMode(bPrefs)) {
    return 1;
  }
  const a = experienceOrdinal(aPrefs.experienceLevel);
  const b = experienceOrdinal(bPrefs.experienceLevel);
  if (a === null || b === null) {
    return 1;
  }
  const maxGap = EXPERIENCE_LEVELS.length - 1;
  const gap = Math.abs(a - b);
  return 1 - maxPenalty * (gap / maxGap);
}

export const MATCH_MODES = Object.freeze({
  MATCH_MY_ASK: 'match_my_ask',
  SURPRISE_ME: 'surprise_me',
});

export function normalizeMatchMode(value) {
  const token = normalizeToken(value).replace(/[\s-]+/g, '_');
  return token === MATCH_MODES.SURPRISE_ME ? MATCH_MODES.SURPRISE_ME : MATCH_MODES.MATCH_MY_ASK;
}

// match_my_ask preserves the historical weight vector exactly so existing
// scores are unchanged when the toggle is untouched.
const MATCH_MY_ASK_WEIGHTS = Object.freeze({
  complementarity: 0.2,
  reciprocal: 0.1,
  roleFit: 0.15,
  intent: 0.2,
  interest: 0.15,
  objectives: 0.1,
  availability: 0.1,
});

// surprise_me pulls weight out of complementarity + role fit and spreads it
// across shared intent/interests/objectives/availability. Sums to 1.0.
const SURPRISE_ME_WEIGHTS = Object.freeze({
  complementarity: 0.05,
  reciprocal: 0.05,
  roleFit: 0.1,
  intent: 0.25,
  interest: 0.25,
  objectives: 0.15,
  availability: 0.15,
});

export function resolveWeights(matchMode) {
  return normalizeMatchMode(matchMode) === MATCH_MODES.SURPRISE_ME
    ? SURPRISE_ME_WEIGHTS
    : MATCH_MY_ASK_WEIGHTS;
}
