// Input-quality detection at intake (alignment plan, Phase 2, item 5).
//
// Deterministic keyword/heuristic pass over a user's declared ask/offer/intro
// text. Per the plan this is the *fallback* under an LLM layer, but it is the
// must-have: detection must work without a model. Every detection is a small
// negative INTAKE_REGISTER trust signal written silently — never shown to the
// counterpart, never a hard block. Thin/absent asks route to a community-first
// getting-started track rather than blocking (L1-S1).
//
// Categories map to the L1 scenarios:
//   thin_ask / thin_offer          L1-S1 / L1-S5  → community-first
//   generic_bio                    L1-S2          copy-pasted LinkedIn register
//   cv_register                    L1-S7          formal third-person CV style
//   commercial_solicitation        L1-S3          selling, not connecting
//   fundraising_only               L1-S4          ask is solely fundraising
//   low_reciprocity_offer          L1-S10         broadcast/one-directional offer

export const INPUT_QUALITY_CATEGORIES = Object.freeze({
  THIN_ASK: 'thin_ask',
  THIN_OFFER: 'thin_offer',
  GENERIC_BIO: 'generic_bio',
  CV_REGISTER: 'cv_register',
  COMMERCIAL_SOLICITATION: 'commercial_solicitation',
  FUNDRAISING_ONLY: 'fundraising_only',
  LOW_RECIPROCITY_OFFER: 'low_reciprocity_offer',
});

// Small negative weights — no single intake signal should dominate the trust
// score (see computeTrustScore); sustained patterns accumulate.
const CATEGORY_WEIGHTS = Object.freeze({
  [INPUT_QUALITY_CATEGORIES.THIN_ASK]: -2,
  [INPUT_QUALITY_CATEGORIES.THIN_OFFER]: -2,
  [INPUT_QUALITY_CATEGORIES.GENERIC_BIO]: -2,
  [INPUT_QUALITY_CATEGORIES.CV_REGISTER]: -3,
  [INPUT_QUALITY_CATEGORIES.COMMERCIAL_SOLICITATION]: -5,
  [INPUT_QUALITY_CATEGORIES.FUNDRAISING_ONLY]: -3,
  [INPUT_QUALITY_CATEGORIES.LOW_RECIPROCITY_OFFER]: -4,
});

const GENERIC_BIO_PHRASES = [
  'passionate about', 'proven track record', 'results-driven', 'results driven',
  'team player', 'detail-oriented', 'detail oriented', 'self-starter', 'self starter',
  'go-getter', 'think outside the box', 'wear many hats', 'synergy',
  'thought leader', 'guru', 'rockstar', 'ninja', 'seasoned professional',
  'dynamic professional', 'strategic thinker',
];

const CV_REGISTER_PHRASES = [
  'responsible for', 'spearheaded', 'oversaw', 'managed a team', 'led a team of',
  'proven ability', 'demonstrated expertise', 'core competencies', 'key achievements',
  'years of experience in', 'track record of', 'p&l', 'kpis', 'stakeholder management',
  'cross-functional teams',
];

const COMMERCIAL_PHRASES = [
  'book a demo', 'book a call', 'our services', 'our pricing', 'our product',
  'we offer', 'we provide', 'sign up today', 'limited time', 'special offer',
  'discount', '% off', 'contact sales', 'schedule a consultation', 'buy now',
  'money-back', 'roi', 'clients', 'packages start', 'dm me to', 'reach out to buy',
];

const FUNDRAISING_TOKENS = [
  'raising', 'raise', 'fundraise', 'fundraising', 'seed round', 'pre-seed',
  'series a', 'series b', 'term sheet', 'cap table', 'investors', 'investment',
  'valuation', 'runway', 'lead investor', 'angel', 'vc', 'capital',
];

const LOW_RECIPROCITY_PHRASES = [
  'media coverage', 'press coverage', 'feature you', 'feature your', 'interview you',
  'promote you', 'promote your', 'shout out', 'shoutout', 'my audience', 'my followers',
  'my newsletter', 'my podcast', 'get you press', 'exposure to my',
];

function normalize(text) {
  return String(text ?? '').toLowerCase();
}

function joinList(list) {
  return Array.isArray(list) ? list.join(' . ') : String(list ?? '');
}

function wordCount(text) {
  const trimmed = String(text ?? '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function matchedPhrases(text, phrases) {
  const haystack = normalize(text);
  return phrases.filter((phrase) => haystack.includes(phrase));
}

// A field is "thin" when it is absent or so short it carries no matchable
// substance (a word or two). Completeness already blocks fully-empty asks/offers;
// this catches the present-but-hollow case.
function isThin(list) {
  const items = Array.isArray(list) ? list.filter((v) => String(v).trim()) : [];
  if (items.length === 0) {
    return true;
  }
  return wordCount(joinList(items)) < 3;
}

/**
 * Detect input-quality issues in a profile's declared text.
 *
 * @param {{ asks?: string[], offers?: string[], introText?: string, name?: string }} input
 * @returns {{ flags: Array<{category: string, weight: number, evidence: string[]}>, routeToCommunityFirst: boolean }}
 */
export function detectInputQuality(input = {}) {
  const asks = input.asks ?? [];
  const offers = input.offers ?? [];
  const intro = input.introText ?? '';
  const asksText = joinList(asks);
  const offersText = joinList(offers);
  const allText = [asksText, offersText, intro].join(' . ');

  const flags = [];
  const push = (category, evidence) => {
    flags.push({ category, weight: CATEGORY_WEIGHTS[category] ?? 0, evidence });
  };

  const thinAsk = isThin(asks);
  const thinOffer = isThin(offers);
  if (thinAsk) push(INPUT_QUALITY_CATEGORIES.THIN_ASK, []);
  if (thinOffer) push(INPUT_QUALITY_CATEGORIES.THIN_OFFER, []);

  const genericHits = matchedPhrases(allText, GENERIC_BIO_PHRASES);
  if (genericHits.length > 0) push(INPUT_QUALITY_CATEGORIES.GENERIC_BIO, genericHits);

  const cvHits = matchedPhrases(allText, CV_REGISTER_PHRASES);
  // Third-person self-reference: the user's own name followed by a copula.
  const name = String(input.name ?? '').trim().split(/\s+/)[0];
  const thirdPerson = name.length > 1
    && new RegExp(`\\b${name.toLowerCase()}\\s+(is|was|has|specializes|brings)\\b`).test(normalize(allText));
  if (cvHits.length > 0 || thirdPerson) {
    push(INPUT_QUALITY_CATEGORIES.CV_REGISTER, thirdPerson ? [...cvHits, 'third-person self-reference'] : cvHits);
  }

  const commercialHits = matchedPhrases(allText, COMMERCIAL_PHRASES);
  if (commercialHits.length > 0) push(INPUT_QUALITY_CATEGORIES.COMMERCIAL_SOLICITATION, commercialHits);

  // Fundraising-only: the ask is dominated by fundraising language and carries
  // little else. Requires a non-thin ask so we don't double-count emptiness.
  if (!thinAsk) {
    const fundraisingHits = matchedPhrases(asksText, FUNDRAISING_TOKENS);
    const askWords = wordCount(asksText);
    const nonFundraisingSubstance = askWords - fundraisingHits.length * 2;
    if (fundraisingHits.length > 0 && nonFundraisingSubstance <= 3) {
      push(INPUT_QUALITY_CATEGORIES.FUNDRAISING_ONLY, fundraisingHits);
    }
  }

  const lowRecipHits = matchedPhrases(offersText, LOW_RECIPROCITY_PHRASES);
  if (lowRecipHits.length > 0) push(INPUT_QUALITY_CATEGORIES.LOW_RECIPROCITY_OFFER, lowRecipHits);

  return {
    flags,
    routeToCommunityFirst: thinAsk || thinOffer,
  };
}
