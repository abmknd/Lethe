import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import {
  READINESS_STATUSES,
  isReadinessActive,
  normalizeConnectionReadiness,
  nowIso,
  readinessExpiresAt,
} from '../domain/models.mjs';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function recommendationFor(readiness) {
  if (readiness.recommendation) {
    return readiness.recommendation;
  }
  if (readiness.status === READINESS_STATUSES.EXCELLENT || readiness.status === READINESS_STATUSES.GOOD) {
    return 'Ready for video.';
  }
  if (readiness.status === READINESS_STATUSES.MEDIUM) {
    return 'Audio-first recommended.';
  }
  if (readiness.status === READINESS_STATUSES.LOW) {
    return 'Test again before joining; audio-first recommended.';
  }
  if (readiness.status === READINESS_STATUSES.FAILED) {
    return 'Resolve device or network issues before joining.';
  }
  return 'Untested recently.';
}

export class MeetingReadinessService {
  constructor({ repository }) {
    this.repository = repository;
  }

  startCheck(userId, { provider = 'manual_link', actorUserId = userId } = {}) {
    const user = this.repository.getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found.');
    }

    const now = nowIso();
    const readiness = this.repository.upsertConnectionReadiness(userId, {
      id: `readiness_${randomUUID()}`,
      provider,
      testedAt: now,
      expiresAt: readinessExpiresAt(now, 'join'),
      status: READINESS_STATUSES.UNKNOWN,
      score: null,
      latencyMs: null,
      jitterMs: null,
      packetLossPct: null,
      uploadKbps: null,
      downloadKbps: null,
      canUseCamera: false,
      canUseMic: false,
      deviceWarnings: [],
      recommendation: 'Readiness check started.',
      createdAt: now,
      updatedAt: now,
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_STARTED,
        actorUserId,
        targetUserId: userId,
        payload: { provider },
        createdAt: now,
      },
    ]);

    return this.withActiveState(readiness);
  }

  recordResult(userId, payload = {}) {
    const user = this.repository.getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found.');
    }

    const normalized = normalizeConnectionReadiness({
      ...payload,
      expiresAt: payload.expiresAt ?? readinessExpiresAt(payload.testedAt ?? nowIso(), 'scheduling'),
    });
    const now = nowIso();
    const readiness = this.repository.upsertConnectionReadiness(userId, {
      id: `readiness_${randomUUID()}`,
      ...normalized,
      recommendation: recommendationFor(normalized),
      updatedAt: now,
    });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_RECORDED,
        actorUserId: payload.actorUserId ?? userId,
        targetUserId: userId,
        payload: {
          provider: readiness.provider,
          status: readiness.status,
          score: readiness.score,
          recommendation: readiness.recommendation,
        },
        createdAt: now,
      },
    ]);

    return this.withActiveState(readiness);
  }

  getLatest(userId) {
    const user = this.repository.getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found.');
    }
    return this.withActiveState(this.repository.getConnectionReadinessByUserId(userId));
  }

  withActiveState(readiness) {
    if (!readiness) {
      return { readiness: null, isActive: false, displayStatus: READINESS_STATUSES.UNKNOWN };
    }
    const isActive = isReadinessActive(readiness);
    return {
      readiness,
      isActive,
      displayStatus: isActive ? readiness.status : READINESS_STATUSES.UNKNOWN,
    };
  }
}
