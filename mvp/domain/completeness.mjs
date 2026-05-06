// Minimum profile completeness requirements for matching eligibility.
// A user missing any required field is routed to a community-first state rather than
// receiving direct match suggestions.

export const COMPLETENESS_FIELDS = Object.freeze({
  NAME: 'name',
  HANDLE: 'handle',
  ASKS: 'asks',
  OFFERS: 'offers',
  AVAILABILITY: 'availability',
  ACTIVE: 'isActive',
  MATCHING_ENABLED: 'matchingEnabled',
  MATCH_ENABLED: 'matchEnabled',
});

// Each required field carries equal weight in the score calculation.
const REQUIRED_FIELDS = [
  COMPLETENESS_FIELDS.NAME,
  COMPLETENESS_FIELDS.HANDLE,
  COMPLETENESS_FIELDS.ASKS,
  COMPLETENESS_FIELDS.OFFERS,
  COMPLETENESS_FIELDS.AVAILABILITY,
  COMPLETENESS_FIELDS.ACTIVE,
  COMPLETENESS_FIELDS.MATCHING_ENABLED,
  COMPLETENESS_FIELDS.MATCH_ENABLED,
];

/**
 * @typedef {{ isEligible: boolean, missingFields: string[], completenessScore: number }} CompletenessResult
 */

/**
 * Checks whether a profile meets the minimum eligibility requirements for matching.
 *
 * @param {{ user: object, preferences: object, availability: Array }} profile
 * @returns {CompletenessResult}
 */
export function checkProfileCompleteness(profile) {
  const { user = {}, preferences = {}, availability = [] } = profile ?? {};
  const missingFields = [];

  if (!String(user.name ?? user.displayName ?? '').trim()) {
    missingFields.push(COMPLETENESS_FIELDS.NAME);
  }
  if (!String(user.handle ?? '').trim()) {
    missingFields.push(COMPLETENESS_FIELDS.HANDLE);
  }
  if (!Array.isArray(preferences.asks) || preferences.asks.length === 0) {
    missingFields.push(COMPLETENESS_FIELDS.ASKS);
  }
  if (!Array.isArray(preferences.offers) || preferences.offers.length === 0) {
    missingFields.push(COMPLETENESS_FIELDS.OFFERS);
  }
  if (!Array.isArray(availability) || availability.length === 0) {
    missingFields.push(COMPLETENESS_FIELDS.AVAILABILITY);
  }
  if (user.isActive === false) {
    missingFields.push(COMPLETENESS_FIELDS.ACTIVE);
  }
  if (user.matchingEnabled === false) {
    missingFields.push(COMPLETENESS_FIELDS.MATCHING_ENABLED);
  }
  if (preferences.matchEnabled === false) {
    missingFields.push(COMPLETENESS_FIELDS.MATCH_ENABLED);
  }

  const completenessScore = Math.round(
    ((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100,
  );

  return {
    isEligible: missingFields.length === 0,
    missingFields,
    completenessScore,
  };
}
