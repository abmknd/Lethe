const DAYS = new Set([0, 1, 2, 3, 4, 5, 6]);

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

export function normalizePreferences(input = {}) {
  const preferredLocations = normalizeStringList(input.preferredLocations);
  const preferredUserTypes = normalizeStringList(input.preferredUserTypes);

  return {
    matchIntent: normalizeMatchIntent(input.matchIntent),
    offers: normalizeStringList(input.offers),
    asks: normalizeStringList(input.asks),
    preferredLocations,
    preferredUserTypes,
    interests: normalizeStringList(input.interests),
    objectives: normalizeStringList(input.objectives),
    introText: typeof input.introText === 'string' ? input.introText.trim() : '',
    meetingFormat: typeof input.meetingFormat === 'string' ? input.meetingFormat : 'video',
    localOnly: Boolean(input.localOnly),
    matchEnabled: input.matchEnabled === undefined ? true : Boolean(input.matchEnabled),
    blockedUserIds: normalizeStringList(input.blockedUserIds),
  };
}

export function normalizeUser(input = {}) {
  const name = String(input.name ?? input.displayName ?? '').trim();

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
  };
}

export function normalizeProfilePayload(input = {}) {
  return {
    user: normalizeUser(input.user),
    preferences: normalizePreferences(input.preferences),
    availability: normalizeAvailabilitySlots(input.availability),
  };
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
