// Layered same-org exclusion (alignment plan, Phase 2, item 1 / decision 1).
//
// Basic LinkedIn OIDC does not expose employer data, so "verified same-org
// exclusion" is implemented as layers of increasingly strong signals rather
// than a single authoritative check:
//
//   1. primary email domain  — the original signal (weakest; personal/platform
//      domains are ignored because gmail.com et al. say nothing about employer).
//   2. self-declared company name — normalized so "Big Telco, Inc." and
//      "big telco" collide.
//   3. verified work-email domain — the strongest signal we can currently get;
//      only present once a user verifies a work email (verification_tier
//      work_email_verified).
//
// The claimed LinkedIn URL is NOT a matcher filter — it is a HITL spot-check
// artifact surfaced to admins. It is deliberately absent from this module.
//
// Any one layer firing is sufficient to exclude the pair. All checks are
// symmetric and conservative: absent/ambiguous data never forces an exclusion.

// Domains that identify a mailbox provider, not an employer. Two users sharing
// one of these tells us nothing about whether they are colleagues. Kept in sync
// with the inline set the matcher previously used.
export const PERSONAL_AND_PLATFORM_DOMAINS = new Set([
  'lethe.io', 'relethe.io', 'example.com',
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'protonmail.com', 'proton.me', 'me.com', 'live.com', 'msn.com',
  'aol.com', 'gmx.com', 'mail.com', 'fastmail.com', 'hey.com',
]);

// Corporate suffixes stripped before comparing company names so legal-entity
// noise ("Inc", "LLC", "GmbH") does not defeat the match.
const COMPANY_SUFFIXES = new Set([
  'inc', 'incorporated', 'llc', 'llp', 'ltd', 'limited', 'corp', 'corporation',
  'co', 'company', 'gmbh', 'ag', 'sa', 'sas', 'srl', 'bv', 'plc', 'pty', 'oy',
  'ab', 'as', 'nv', 'kk', 'pte', 'group', 'holdings', 'labs', 'technologies',
  'technology', 'tech', 'the',
]);

export function emailDomain(email) {
  const at = String(email ?? '').trim().toLowerCase().split('@');
  return at.length === 2 && at[1] ? at[1] : '';
}

export function isGenericDomain(domain) {
  return !domain || PERSONAL_AND_PLATFORM_DOMAINS.has(domain);
}

// Normalize a self-declared company name to a comparable token string.
// Returns '' when nothing meaningful remains (so blanks never match blanks).
export function normalizeCompanyName(value) {
  const words = String(value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .split(/[^a-z0-9]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => !COMPANY_SUFFIXES.has(chunk));

  return words.join(' ').trim();
}

// Build the org identity a matcher needs from a profile's user + preferences.
export function orgIdentity({ email, companyName, workEmail } = {}) {
  return {
    primaryDomain: emailDomain(email),
    companyName: normalizeCompanyName(companyName),
    workDomain: emailDomain(workEmail),
  };
}

// True when the two profiles look like they belong to the same organization by
// any single layer. Personal/platform domains and blank company names never
// trigger a match on their own.
export function isSameOrg(a, b) {
  const left = a?.primaryDomain !== undefined ? a : orgIdentity(a);
  const right = b?.primaryDomain !== undefined ? b : orgIdentity(b);

  // Layer 1 + 3: domain equality (primary or verified work email), ignoring
  // generic mailbox providers.
  for (const domain of [left.primaryDomain, left.workDomain]) {
    if (isGenericDomain(domain)) {
      continue;
    }
    if (domain === right.primaryDomain || domain === right.workDomain) {
      return true;
    }
  }

  // Layer 2: normalized self-declared company name equality.
  if (left.companyName && left.companyName === right.companyName) {
    return true;
  }

  return false;
}
