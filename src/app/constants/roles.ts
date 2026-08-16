// Canonical role taxonomy used by both KYC and admin onboarding.
// Stored on preferences.userType (single) and preferences.preferredUserTypes (multi).
// The matcher's role-fit signal compares userType against preferredUserTypes, so
// the strings here must match exactly between the two fields.
//
// FAMILIES, NOT JOB TITLES. A title list can never be complete — it fails the
// drone pilot, the midwife, the machinist — and an incomplete list does not read
// as "we missed one", it reads as "people like you are not who this is for".
// Families cover the space, and "Something else" is a real answer with a real
// text field behind it, not a dustbin. (redesign.md, Data: role families.)
export const ROLE_OPTIONS = [
  'Founder',
  'Operator',
  'Engineer',
  'Designer',
  'Researcher',
  'Writer',
  'Artist',
  'Investor',
  'Educator',
  'Healthcare',
  'Public service',
  'Trades & craft',
  'Student',
  'Something else',
] as const;

export type RoleOption = (typeof ROLE_OPTIONS)[number];

/** Index of the free-text family. Selecting it opens an input, and what the
 *  user types is what persists — never the literal "Something else". */
export const ROLE_OTHER_INDEX = ROLE_OPTIONS.length - 1;

/** Roles a user can ask to MEET. "Something else" is not offered here: it is an
 *  answer about yourself, not a filter, and "Open to anyone" already covers the
 *  case where the list is the wrong question. */
export const MEETABLE_ROLE_OPTIONS = ROLE_OPTIONS.slice(0, ROLE_OTHER_INDEX);

// ---------------------------------------------------------------------------
// Bridging the old taxonomy
//
// Before the rebrand this list was six entries: Founder, Operator, Investor,
// Researcher, Creative, Other. Four of them survive under the same name. The
// other two do not, and profiles written before the change still carry them.
//
// What that costs is specific, and worth stating exactly rather than
// hand-waving. Role fit is computed in mvp/matching/deterministic-matcher.mjs
// as a set-intersection on lower-cased strings:
//
//     profileWantsCandidate = preferredUserTypes.has(candidate.userType)
//     roleFitRatio = (profileWantsCandidate + candidateWantsProfile) / 2
//
// It is a SCORE component, not a filter — the hard gate is "2 of 3 primary
// signals" (intent, interest, complementarity), and role fit is none of those.
// So a retired value does not exclude anyone from matching. It silently scores
// zero, in both directions, against every user who onboarded after the change.
//
// A backfill would have to guess. "Creative" is not one family now — it is
// Designer, Writer and Artist, three genuinely different answers — and picking
// one on someone's behalf writes a fact about a person that nobody asked them.
//
// So instead of rewriting anyone's identity, we widen the PREFERENCE side,
// which is the only side that is a query rather than a statement. A preference
// list is expanded so it intersects with both taxonomies at once:
//
//     it contains a retired value   -> add the families that replaced it
//     it contains one of those      -> add the retired value back
//
// Both directions, because both directions break: a legacy user must be able to
// find new users, and new users must be able to find them. The matcher only
// ever asks "is this string in that set", so a superset is lossless and costs
// one set entry. Nothing renders these to a user — preferredUserTypes appears
// only as admin checkboxes — so the widening is invisible.
//
// This is self-healing: every profile that re-onboards writes the new taxonomy,
// and the bridge falls out on its own once no stored profile carries a retired
// value. Delete RETIRED_ROLE_COVERAGE then, not before.
// ---------------------------------------------------------------------------

/** Retired values, mapped to the families that now cover them. `Other` maps to
 *  nothing: it never named a kind of person, so there is nothing to bridge to. */
export const RETIRED_ROLE_COVERAGE: Record<string, readonly RoleOption[]> = {
  Creative: ['Designer', 'Writer', 'Artist'],
  Other: [],
};

export const LEGACY_ROLE_OPTIONS = Object.keys(RETIRED_ROLE_COVERAGE);

/**
 * Widen a preferred-roles list so it matches across the taxonomy change.
 * Order-stable, de-duplicated, and a no-op for a list that touches neither
 * side of the bridge.
 */
export function bridgeRoleTaxonomy(roles: readonly string[]): string[] {
  const out = new Set(roles);
  for (const [retired, families] of Object.entries(RETIRED_ROLE_COVERAGE)) {
    // A legacy preference reaches the families that replaced it.
    if (out.has(retired)) families.forEach((f) => out.add(f));
    // A current preference reaches back to the users still stored as legacy.
    if (families.some((f) => out.has(f))) out.add(retired);
  }
  return [...out];
}
