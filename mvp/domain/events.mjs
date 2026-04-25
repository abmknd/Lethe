export const EVENT_TYPES = Object.freeze({
  RECOMMENDATION_GENERATED: 'recommendation_generated',
  ADMIN_APPROVED: 'admin_approved',
  ADMIN_REJECTED: 'admin_rejected',
  USER_ACCEPT: 'user_accept',
  USER_PASS: 'user_pass',
  INTRO_SENT: 'intro_sent',
  FOLLOW_THROUGH_UPDATED: 'follow_through_updated',
});

export const EVENT_TYPE_VALUES = Object.freeze(Object.values(EVENT_TYPES));

export function isValidEventType(eventType) {
  return EVENT_TYPE_VALUES.includes(eventType);
}
