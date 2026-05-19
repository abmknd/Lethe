const DAYS = new Set([0, 1, 2, 3, 4, 5, 6]);

export const CEP_EXPIRY_DAYS = 8;
export const CEP_MAX_TEXT_LENGTH = 280;

export const RECOMMENDATION_STATUSES = Object.freeze({
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  PASSED: 'passed',
});

export const OUTCOME_STATUSES = Object.freeze({
  INTRO_SENT: 'intro_sent',
  MEETING_SCHEDULED: 'meeting_scheduled',
  COMPLETED: 'completed',
  NO_FOLLOW_THROUGH: 'no_follow_through',
});

export const MEETING_PROVIDERS = Object.freeze({
  MANUAL_LINK: 'manual_link',
  GOOGLE_MEET: 'google_meet',
  ZOOM: 'zoom',
  WHEREBY: 'whereby',
  DAILY: 'daily',
  AGORA: 'agora',
  LIVEKIT: 'livekit',
});

export const MEETING_STATUSES = Object.freeze({
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  READY: 'ready',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

export const READINESS_STATUSES = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD: 'good',
  MEDIUM: 'medium',
  LOW: 'low',
  FAILED: 'failed',
  UNKNOWN: 'unknown',
});

export const READINESS_JOIN_EXPIRY_MINUTES = 30;
export const READINESS_SCHEDULING_EXPIRY_HOURS = 24;

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeStringList(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return [...new Set(input.map((value) => String(value).trim()).filter(Boolean))];
}

export function normalizeAvailabilitySlots(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const slots = [];
  for (const raw of input) {
    const dayOfWeek = Number(raw?.dayOfWeek);
    const timezone = String(raw?.timezone ?? 'UTC').trim() || 'UTC';

    // Accept either hour-based or time-string payloads.
    const startHour = raw?.startHour !== undefined ? Number(raw.startHour) : parseHour(raw?.startTime);
    const endHour = raw?.endHour !== undefined ? Number(raw.endHour) : parseHour(raw?.endTime);

    if (!DAYS.has(dayOfWeek)) {
      continue;
    }
    if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
      continue;
    }
    if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24) {
      continue;
    }
    if (endHour <= startHour) {
      continue;
    }

    slots.push({
      dayOfWeek,
      startHour,
      endHour,
      startTime: hourToTime(startHour),
      endTime: hourToTime(endHour),
      timezone,
    });
  }

  return slots;
}

export function normalizeMatchIntent(input) {
  if (Array.isArray(input)) {
    return normalizeStringList(input);
  }

  if (typeof input === 'string') {
    return normalizeStringList(
      input
        .split(',')
        .map((chunk) => chunk.trim())
        .filter(Boolean),
    );
  }

  return [];
}

const MEETING_FREQUENCIES = new Set(['every_week', 'every_two_weeks', 'monthly', 'twice_monthly']);

export function normalizeNotificationPrefs(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }
  const out = {};
  for (const [groupId, items] of Object.entries(input)) {
    if (!items || typeof items !== 'object' || Array.isArray(items)) continue;
    const group = {};
    for (const [itemKey, channels] of Object.entries(items)) {
      if (!channels || typeof channels !== 'object') continue;
      group[String(itemKey)] = {
        email: Boolean(channels.email),
        push: Boolean(channels.push),
      };
    }
    out[String(groupId)] = group;
  }
  return out;
}

export function normalizePreferences(input = {}) {
  const preferredLocations = normalizeStringList(input.preferredLocations);
  const preferredUserTypes = normalizeStringList(input.preferredUserTypes);
  const meetingFrequency = typeof input.meetingFrequency === 'string' && MEETING_FREQUENCIES.has(input.meetingFrequency)
    ? input.meetingFrequency
    : 'every_week';
  const whoToMeetRaw = Number(input.whoToMeet);
  const whoToMeet = Number.isInteger(whoToMeetRaw) && whoToMeetRaw >= 0 && whoToMeetRaw < 10 ? whoToMeetRaw : 0;

  return {
    matchIntent: normalizeMatchIntent(input.matchIntent),
    offers: normalizeStringList(input.offers),
    asks: normalizeStringList(input.asks),
    preferredLocations,
    userType: typeof input.userType === 'string' ? input.userType.trim().toLowerCase() : '',
    preferredUserTypes,
    interests: normalizeStringList(input.interests),
    objectives: normalizeStringList(input.objectives),
    introText: typeof input.introText === 'string' ? input.introText.trim() : '',
    meetingFormat: typeof input.meetingFormat === 'string' ? input.meetingFormat : 'video',
    localOnly: Boolean(input.localOnly),
    matchEnabled: input.matchEnabled === undefined ? true : Boolean(input.matchEnabled),
    blockedUserIds: normalizeStringList(input.blockedUserIds),
    languages: normalizeStringList(input.languages),
    meetingFrequency,
    learnAbout: typeof input.learnAbout === 'string' ? input.learnAbout.trim() : '',
    askAbout: typeof input.askAbout === 'string' ? input.askAbout.trim() : '',
    whoToMeet,
    notificationPrefs: normalizeNotificationPrefs(input.notificationPrefs),
  };
}

export function normalizeUser(input = {}) {
  const name = String(input.name ?? input.displayName ?? '').trim();
  const dobRaw = input.dob;
  const dob = typeof dobRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dobRaw.trim()) ? dobRaw.trim() : null;

  return {
    id: String(input.id ?? '').trim(),
    name,
    displayName: name,
    handle: String(input.handle ?? '').trim(),
    email: String(input.email ?? '').trim(),
    timezone: String(input.timezone ?? 'UTC').trim() || 'UTC',
    location: String(input.location ?? '').trim(),
    bio: String(input.bio ?? input.introText ?? '').trim(),
    matchingEnabled: input.matchingEnabled === undefined ? true : Boolean(input.matchingEnabled),
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    dob,
  };
}

export function normalizeProfilePayload(input = {}) {
  return {
    user: normalizeUser(input.user),
    preferences: normalizePreferences(input.preferences),
    availability: normalizeAvailabilitySlots(input.availability),
  };
}

export function normalizeMeetingPayload(input = {}) {
  const provider = String(input.provider ?? MEETING_PROVIDERS.MANUAL_LINK).trim().toLowerCase();
  const status = String(input.status ?? MEETING_STATUSES.SCHEDULED).trim().toLowerCase();

  if (!Object.values(MEETING_PROVIDERS).includes(provider)) {
    throw new Error('Invalid meeting provider.');
  }
  if (!Object.values(MEETING_STATUSES).includes(status)) {
    throw new Error('Invalid meeting status.');
  }

  const meetingUrl = String(input.meetingUrl ?? '').trim();
  if (status !== MEETING_STATUSES.DRAFT && !meetingUrl) {
    throw new Error('Meeting URL is required unless status is draft.');
  }

  const scheduledAt = normalizeOptionalDate(input.scheduledAt, 'scheduledAt');
  const startedAt = normalizeOptionalDate(input.startedAt, 'startedAt');
  const endedAt = normalizeOptionalDate(input.endedAt, 'endedAt');

  return {
    provider,
    externalMeetingId: input.externalMeetingId ? String(input.externalMeetingId).trim() : null,
    meetingUrl,
    scheduledAt,
    startedAt,
    endedAt,
    status,
    metadata: typeof input.metadata === 'object' && input.metadata !== null ? input.metadata : {},
  };
}

export function readinessExpiresAt(testedAt = nowIso(), mode = 'scheduling') {
  const base = new Date(testedAt);
  if (Number.isNaN(base.getTime())) {
    throw new Error('Invalid readiness testedAt.');
  }
  const ms = mode === 'join'
    ? READINESS_JOIN_EXPIRY_MINUTES * 60 * 1000
    : READINESS_SCHEDULING_EXPIRY_HOURS * 60 * 60 * 1000;
  return new Date(base.getTime() + ms).toISOString();
}

export function isReadinessActive(entry, now = nowIso()) {
  if (!entry?.expiresAt) return false;
  return new Date(entry.expiresAt).getTime() > new Date(now).getTime();
}

export function normalizeConnectionReadiness(input = {}) {
  const status = String(input.status ?? READINESS_STATUSES.UNKNOWN).trim().toLowerCase();
  if (!Object.values(READINESS_STATUSES).includes(status)) {
    throw new Error('Invalid meeting readiness status.');
  }

  const score = normalizeOptionalNumber(input.score, 'score', { min: 0, max: 100 });
  const testedAt = normalizeOptionalDate(input.testedAt ?? nowIso(), 'testedAt') ?? nowIso();
  const expiresAt = normalizeOptionalDate(input.expiresAt ?? readinessExpiresAt(testedAt), 'expiresAt');

  return {
    provider: input.provider ? String(input.provider).trim().toLowerCase() : 'manual_link',
    testedAt,
    expiresAt,
    status,
    score,
    latencyMs: normalizeOptionalNumber(input.latencyMs, 'latencyMs', { min: 0 }),
    jitterMs: normalizeOptionalNumber(input.jitterMs, 'jitterMs', { min: 0 }),
    packetLossPct: normalizeOptionalNumber(input.packetLossPct, 'packetLossPct', { min: 0, max: 100 }),
    uploadKbps: normalizeOptionalNumber(input.uploadKbps, 'uploadKbps', { min: 0 }),
    downloadKbps: normalizeOptionalNumber(input.downloadKbps, 'downloadKbps', { min: 0 }),
    canUseCamera: Boolean(input.canUseCamera),
    canUseMic: Boolean(input.canUseMic),
    deviceWarnings: normalizeStringList(input.deviceWarnings),
    recommendation: typeof input.recommendation === 'string' ? input.recommendation.trim() : '',
  };
}

function normalizeOptionalDate(value, fieldName) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid meeting ${fieldName}.`);
  }

  return date.toISOString();
}

function normalizeOptionalNumber(value, fieldName, { min = -Infinity, max = Infinity } = {}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid readiness ${fieldName}.`);
  }
  return number;
}

export function hasHourOverlap(a, b) {
  if (a.dayOfWeek !== b.dayOfWeek) {
    return false;
  }

  return Math.max(a.startHour, b.startHour) < Math.min(a.endHour, b.endHour);
}

export function hourToTime(hour) {
  const normalized = Math.max(0, Math.min(24, Number(hour)));
  return `${String(normalized).padStart(2, '0')}:00`;
}

export function parseHour(timeValue) {
  if (typeof timeValue !== 'string') {
    return NaN;
  }

  const match = timeValue.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return NaN;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute !== 0) {
    return NaN;
  }

  return hour;
}

export function normalizeCepEntry(input = {}) {
  const focusText = String(input.focusText ?? input.focus_text ?? '').trim().slice(0, CEP_MAX_TEXT_LENGTH);
  if (!focusText) {
    throw new Error('CEP focus text is required.');
  }
  return { focusText };
}

export function cepExpiresAt(createdAt = new Date().toISOString()) {
  const d = new Date(createdAt);
  d.setUTCDate(d.getUTCDate() + CEP_EXPIRY_DAYS);
  return d.toISOString();
}

export function isCepActive(cep, now = new Date().toISOString()) {
  if (!cep) return false;
  return cep.expiresAt > now;
}
