export const EVENT_TYPES = Object.freeze({
  RECOMMENDATION_GENERATED: 'recommendation_generated',
  ADMIN_APPROVED: 'admin_approved',
  ADMIN_REJECTED: 'admin_rejected',
  USER_ACCEPT: 'user_accept',
  USER_PASS: 'user_pass',
  INTRO_SENT: 'intro_sent',
  FOLLOW_THROUGH_UPDATED: 'follow_through_updated',
  MEETING_CREATED: 'meeting_created',
  MEETING_STATUS_UPDATED: 'meeting_status_updated',
  MEETING_READINESS_STARTED: 'meeting_readiness_started',
  MEETING_READINESS_RECORDED: 'meeting_readiness_recorded',
  CONVERSATION_CREATED: 'conversation_created',
  MESSAGE_SENT: 'message_sent',
});

export const EVENT_TYPE_VALUES = Object.freeze(Object.values(EVENT_TYPES));

export function isValidEventType(eventType) {
  return EVENT_TYPE_VALUES.includes(eventType);
}
