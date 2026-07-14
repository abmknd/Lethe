// Directional candidate pre-filters (alignment plan, Phase 2, item 2).
//
// Unlike same-org exclusion (which is symmetric), these encode what the
// *requesting* profile is willing to meet, so they are applied per direction
// inside the matcher loop: profile P's preferences filter which candidates C
// appear in P's recommendations. The reverse pairing (C as requester) is
// evaluated independently.
//
//   company_stage / meet_stages — L2-S6: an investor asking for "post-revenue
//     founders" must not receive pre-product matches. Each user declares their
//     own company_stage; meet_stages is the set of stages they will accept in a
//     candidate. Empty meet_stages == no constraint.
//   not_looking_for — L2-S7: declared archetypes the user does not want to meet
//     (e.g. a creative thinker who does not want pitch-seeking investors). A
//     token that matches the candidate's user_type hard-excludes the pair.

function normalizeToken(value) {
  return String(value ?? '').trim().toLowerCase();
}

// Ordered company stages, earliest → latest. Ordinal position is what makes a
// "minimum stage" expressible as an accepted-set on the UI side, and lets the
// scoring layer (2b-ii) reason about proximity later.
export const COMPANY_STAGES = Object.freeze([
  'idea',
  'prototype',
  'pre_revenue',
  'revenue',
  'growth',
  'scale',
]);

const STAGE_ALIASES = new Map([
  ['pre-revenue', 'pre_revenue'],
  ['preproduct', 'prototype'],
  ['pre-product', 'prototype'],
  ['mvp', 'prototype'],
  ['post_revenue', 'revenue'],
  ['post-revenue', 'revenue'],
  ['seed', 'pre_revenue'],
  ['growth_stage', 'growth'],
]);

// Canonicalize a stage token to one of COMPANY_STAGES, or '' if unrecognized.
export function normalizeStage(value) {
  const token = normalizeToken(value).replace(/\s+/g, '_');
  if (!token) {
    return '';
  }
  if (COMPANY_STAGES.includes(token)) {
    return token;
  }
  return STAGE_ALIASES.get(token) ?? STAGE_ALIASES.get(normalizeToken(value)) ?? '';
}

export function normalizeStageList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return [...new Set(values.map(normalizeStage).filter(Boolean))];
}

export function stageOrdinal(value) {
  const stage = normalizeStage(value);
  const idx = COMPANY_STAGES.indexOf(stage);
  return idx === -1 ? null : idx;
}

// True when `candidatePrefs` satisfies `profilePrefs`'s company-stage
// requirement. A requirement only bites when the requester declared meet_stages
// AND the candidate declared a (recognized) stage; missing data never excludes.
export function passesStageRequirement(profilePrefs = {}, candidatePrefs = {}) {
  const accepted = new Set(normalizeStageList(profilePrefs.meetStages));
  if (accepted.size === 0) {
    return true;
  }
  const candidateStage = normalizeStage(candidatePrefs.companyStage);
  if (!candidateStage) {
    return true;
  }
  return accepted.has(candidateStage);
}

// True when the candidate is NOT excluded by the requester's not_looking_for
// list. A not_looking_for token hard-excludes when it matches the candidate's
// declared user_type. Blank lists never exclude.
export function passesNotLookingFor(profilePrefs = {}, candidatePrefs = {}) {
  const avoid = new Set((profilePrefs.notLookingFor ?? []).map(normalizeToken).filter(Boolean));
  if (avoid.size === 0) {
    return true;
  }
  const candidateType = normalizeToken(candidatePrefs.userType);
  if (candidateType && avoid.has(candidateType)) {
    return false;
  }
  return true;
}
