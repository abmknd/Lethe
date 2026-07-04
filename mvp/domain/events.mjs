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
  // Match lifecycle (alignment plan, Phase 0)
  BLIND_OFFER_CREATED: 'blind_offer_created',
  BLIND_ACCEPT: 'blind_accept',
  BLIND_DECLINE: 'blind_decline',
  MUTUAL_ACCEPT: 'mutual_accept',
  IDENTITY_REVEALED: 'identity_revealed',
  MATCH_STATE_CHANGED: 'match_state_changed',
  TRUST_SIGNAL_RECORDED: 'trust_signal_recorded',
  // Reserved for later phases (scheduling integrity, mutual review)
  NO_SHOW_RECORDED: 'no_show_recorded',
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEWS_UNLOCKED: 'reviews_unlocked',
  DISPUTE_OPENED: 'dispute_opened',
});

export const EVENT_TYPE_VALUES = Object.freeze(Object.values(EVENT_TYPES));

export function isValidEventType(eventType) {
  return EVENT_TYPE_VALUES.includes(eventType);
}
