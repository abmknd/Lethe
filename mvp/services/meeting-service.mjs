import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import {
  MEETING_STATUSES,
  OUTCOME_STATUSES,
  normalizeMeetingPayload,
  nowIso,
} from '../domain/models.mjs';

function outcomeStatusForMeetingStatus(status) {
  if (status === MEETING_STATUSES.SCHEDULED || status === MEETING_STATUSES.READY || status === MEETING_STATUSES.IN_PROGRESS) {
    return OUTCOME_STATUSES.MEETING_SCHEDULED;
  }
  if (status === MEETING_STATUSES.COMPLETED) {
    return OUTCOME_STATUSES.COMPLETED;
  }
  if (status === MEETING_STATUSES.CANCELLED || status === MEETING_STATUSES.FAILED) {
    return OUTCOME_STATUSES.NO_FOLLOW_THROUGH;
  }
  return null;
}

export class MeetingService {
  constructor({ repository }) {
    this.repository = repository;
  }

  getMeetingForRecommendation(recommendationId) {
    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    return this.repository.getMeetingByRecommendationId(recommendationId);
  }

  createMeetingForRecommendation({ recommendationId, actorUserId = null, ...payload }) {
    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    const meetingPayload = normalizeMeetingPayload(payload);
    const updatedAt = nowIso();
    const meeting = this.repository.upsertMeeting({
      id: `meeting_${randomUUID()}`,
      recommendationId,
      ...meetingPayload,
      updatedAt,
    });

    const outcomeStatus = outcomeStatusForMeetingStatus(meeting.status);
    if (outcomeStatus) {
      this.repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus,
        notes: payload.notes ?? `Meeting ${meeting.status}.`,
        updatedAt,
      });
    }

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_CREATED,
        actorUserId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: {
          meetingId: meeting.id,
          provider: meeting.provider,
          status: meeting.status,
          scheduledAt: meeting.scheduledAt,
        },
        createdAt: updatedAt,
      },
    ]);

    return meeting;
  }

  updateMeetingStatus({ recommendationId, actorUserId = null, status, notes = null }) {
    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found.');
    }

    const normalized = String(status ?? '').trim().toLowerCase();
    if (!Object.values(MEETING_STATUSES).includes(normalized)) {
      throw new Error('Invalid meeting status.');
    }

    const existing = this.repository.getMeetingByRecommendationId(recommendationId);
    if (!existing) {
      throw new Error('Meeting not found for recommendation.');
    }

    const updatedAt = nowIso();
    const meeting = this.repository.updateMeetingStatus(recommendationId, {
      status: normalized,
      startedAt: normalized === MEETING_STATUSES.IN_PROGRESS ? updatedAt : null,
      endedAt: [MEETING_STATUSES.COMPLETED, MEETING_STATUSES.CANCELLED, MEETING_STATUSES.FAILED].includes(normalized)
        ? updatedAt
        : null,
      updatedAt,
    });

    const outcomeStatus = outcomeStatusForMeetingStatus(normalized);
    if (outcomeStatus) {
      this.repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus,
        notes,
        updatedAt,
      });
    }

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_STATUS_UPDATED,
        actorUserId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: {
          meetingId: meeting.id,
          status: meeting.status,
          notes,
        },
        createdAt: updatedAt,
      },
    ]);

    return meeting;
  }
}
