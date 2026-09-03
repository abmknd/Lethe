// Blind rationale generator (alignment plan, Phase 1; decisions 4 and 5).
//
// Turns matcher signals + both profiles into non-identifying claims a user can
// act on BEFORE any identity is revealed. Hard rule, enforced in code by
// assertNoBlindIdentityLeak: nothing that could identify the other person
// passes through — no name, handle, email, company, city, avatar, or
// free-text quote. Every claim derives from tokens the VIEWER also declared
// (shared themes), the candidate's role category, or the match's own
// confidence band. Never a raw percentage (decision 4).

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function titleCase(token) {
  return String(token ?? '')
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

// Tokens present (case-insensitively) in both lists, preserving a's original
// casing and order, deduped.
function sharedTokens(a = [], b = []) {
  const bSet = new Set((Array.isArray(b) ? b : []).map(normalize));
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(a) ? a : []) {
    const n = normalize(raw);
    if (n && bSet.has(n) && !seen.has(n)) {
      seen.add(n);
      out.push(raw);
    }
  }
  return out;
}

function formatThemeList(tokens) {
  const top = tokens.slice(0, 2).map(titleCase);
  if (top.length === 2) return `${top[0]} and ${top[1]}`;
  return top[0] ?? '';
}

/**
 * A theme, carried as an EMPHASIS SPAN rather than one joined string.
 *
 * The Suggested card draws each signal bullet in two colours: the sentence in
 * `text/default/placeholder` with the operative phrase stepped up to
 * `text/default/body`. That phrase is always the shared tokens — the part that
 * is actually about these two people, as opposed to the stock framing around
 * it. Splitting here is free because this is where the two halves are already
 * separate; joining them and asking the client to find the seam again is not.
 *
 * `label` stays, pre-joined, so existing consumers and the leak guard are
 * unaffected. It is exactly `pre + emph + post`.
 */
function theme(kind, pre, tokens, post = '') {
  const emph = formatThemeList(tokens);
  return { kind, label: `${pre}${emph}${post}`, pre, emph, post };
}

const ROLE_CATEGORY_LABELS = {
  builder: 'A builder',
  operator: 'An operator',
  founder: 'A founder',
  investor: 'An investor',
  researcher: 'A researcher',
  thinker: 'A thinker',
  designer: 'A designer',
  engineer: 'An engineer',
  marketer: 'A marketer',
  mentor: 'A mentor',
  advisor: 'An advisor',
};

// Role category is explicitly allowed non-identifying signal. Falls back to an
// article + title-cased userType for values not in the map, and to a neutral
// label when userType is absent.
export function roleCategoryLabel(userType) {
  const t = normalize(userType);
  if (!t) return 'Someone new to meet';
  if (ROLE_CATEGORY_LABELS[t]) return ROLE_CATEGORY_LABELS[t];
  const article = /^[aeiou]/.test(t) ? 'An' : 'A';
  return `${article} ${titleCase(t)}`;
}

// Bands only, never a percentage (decision 4). The matcher score is an
// uncalibrated heuristic; percentages manufacture false precision.
export function confidenceBandFromScore(score) {
  const s = Number(score) || 0;
  if (s >= 60) return 'high';
  if (s >= 35) return 'medium';
  return 'low';
}

function deriveAvailability(recommendation, viewerProfile, candidateProfile) {
  const why = Array.isArray(recommendation?.whyMatched) ? recommendation.whyMatched : [];
  const line = why.find((s) => /availability overlap/i.test(String(s)));
  if (line) {
    const match = String(line).match(/([\d.]+)\s*h/);
    if (match && Number.parseFloat(match[1]) > 0) {
      return 'You share open time this week';
    }
  }
  const bothHaveSlots =
    (viewerProfile?.availability?.length ?? 0) > 0 &&
    (candidateProfile?.availability?.length ?? 0) > 0;
  return bothHaveSlots
    ? 'Scheduling to be arranged once you both accept'
    : 'Add availability to unlock scheduling';
}

// The core guard. Fails closed: if any identifying value from the candidate
// appears verbatim in the rationale, throw rather than ship it. Location is
// intentionally not emitted, so it is not in the checked set.
export function assertNoBlindIdentityLeak(rationale, candidateProfile) {
  const blob = JSON.stringify(rationale).toLowerCase();
  const user = candidateProfile?.user ?? {};
  const forbidden = [
    user.name,
    user.displayName,
    user.handle,
    user.email,
    user.avatarUrl,
    user.bio,
    candidateProfile?.preferences?.introText,
  ]
    .map((v) => normalize(v))
    .filter((v) => v.length >= 3);

  for (const value of forbidden) {
    if (blob.includes(value)) {
      throw new Error(`Blind rationale leaked identifying value: "${value}"`);
    }
  }
  return true;
}

export function buildBlindRationale({ recommendation = {}, viewerProfile, candidateProfile }) {
  const vp = viewerProfile?.preferences ?? {};
  const cp = candidateProfile?.preferences ?? {};

  const themes = [];
  const theyHelp = sharedTokens(vp.asks, cp.offers);
  if (theyHelp.length) {
    themes.push(theme('they_help', 'Can help with ', theyHelp));
  }
  const youHelp = sharedTokens(cp.asks, vp.offers);
  if (youHelp.length) {
    themes.push(theme('you_help', 'Looking for something you offer: ', youHelp));
  }
  const interests = sharedTokens(vp.interests, cp.interests);
  if (interests.length) {
    themes.push(theme('shared_interest', 'Shared interest in ', interests));
  }
  const objectives = sharedTokens(vp.objectives, cp.objectives);
  if (objectives.length) {
    themes.push(theme('shared_objective', 'Both working toward ', objectives));
  }

  const rationale = {
    roleCategory: roleCategoryLabel(cp.userType),
    overlapThemes: themes.slice(0, 3),
    availabilityCompatibility: deriveAvailability(recommendation, viewerProfile, candidateProfile),
    confidenceBand: confidenceBandFromScore(recommendation.score),
  };

  assertNoBlindIdentityLeak(rationale, candidateProfile);
  return rationale;
}

// Match states in which identity may be shown. Everything else is blind.
export const IDENTITY_VISIBLE_STATES = Object.freeze([
  'revealed',
  'scheduled',
  'met',
  'reviewed',
  'closed',
]);

export function isIdentityVisible(matchState) {
  return IDENTITY_VISIBLE_STATES.includes(String(matchState ?? ''));
}
