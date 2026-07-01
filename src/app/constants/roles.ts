// Canonical role taxonomy used by both KYC and admin onboarding.
// Stored on preferences.userType (single) and preferences.preferredUserTypes (multi).
// The matcher's role-fit signal compares userType against preferredUserTypes, so
// the strings here must match exactly between the two fields.
export const ROLE_OPTIONS = [
  'Founder',
  'Operator',
  'Investor',
  'Researcher',
  'Creative',
  'Other',
] as const;

export type RoleOption = (typeof ROLE_OPTIONS)[number];
