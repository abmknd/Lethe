// Availability geometry (extracted from the deterministic matcher, unchanged)
// plus the concrete 21-day window resolution (alignment plan, Phase 2, item 3).
//
// Recurring weekly slots are converted to UTC "hour of week" segments in
// [0, 168). Weekly overlap tells us two people *can* meet in a typical week;
// item 3 additionally requires that a concrete overlapping slot falls within 21
// days of the cycle start, so a counterpart who is unavailable for six weeks
// (available_from far in the future) is deferred rather than surfaced (L2-S3).

const WEEK_HOURS = 24 * 7;
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export function segmentOverlapHours(startA, endA, startB, endB) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

export function getTimezoneOffsetHours(timezone, at = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(at);
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour === '24' ? '0' : map.hour),
      Number(map.minute),
      Number(map.second),
    );
    return (asUtc - at.getTime()) / HOUR_MS;
  } catch {
    return 0;
  }
}

export function normalizeWeeklyRange(start, end) {
  let normalizedStart = start;
  let normalizedEnd = end;

  while (normalizedStart < 0) {
    normalizedStart += WEEK_HOURS;
    normalizedEnd += WEEK_HOURS;
  }
  while (normalizedStart >= WEEK_HOURS) {
    normalizedStart -= WEEK_HOURS;
    normalizedEnd -= WEEK_HOURS;
  }

  if (normalizedEnd <= WEEK_HOURS) {
    return [[normalizedStart, normalizedEnd]];
  }

  return [
    [normalizedStart, WEEK_HOURS],
    [0, normalizedEnd - WEEK_HOURS],
  ];
}

export function toUtcSegments(slot, fallbackTimezone) {
  const timezone = slot.timezone || fallbackTimezone || 'UTC';
  const offsetHours = getTimezoneOffsetHours(timezone);
  const start = slot.dayOfWeek * 24 + slot.startHour - offsetHours;
  const end = slot.dayOfWeek * 24 + slot.endHour - offsetHours;
  return normalizeWeeklyRange(start, end);
}

export function availabilityOverlap(slotsA, slotsB, timezoneA = 'UTC', timezoneB = 'UTC') {
  let overlapHours = 0;
  let overlapSegments = 0;

  for (const slotA of slotsA) {
    for (const slotB of slotsB) {
      const segmentsA = toUtcSegments(slotA, timezoneA);
      const segmentsB = toUtcSegments(slotB, timezoneB);

      for (const [startA, endA] of segmentsA) {
        for (const [startB, endB] of segmentsB) {
          const overlap = segmentOverlapHours(startA, endA, startB, endB);
          if (overlap <= 0) {
            continue;
          }
          overlapSegments += 1;
          overlapHours += overlap;
        }
      }
    }
  }

  return {
    overlapHours,
    overlapSegments,
    hasOverlap: overlapSegments > 0,
  };
}

// The overlapping UTC weekly windows [startHourOfWeek, endHourOfWeek) between
// two slot sets, as concrete intervals we could schedule inside.
function overlappingWindows(slotsA, slotsB, timezoneA, timezoneB) {
  const windows = [];
  for (const slotA of slotsA) {
    for (const slotB of slotsB) {
      const segmentsA = toUtcSegments(slotA, timezoneA);
      const segmentsB = toUtcSegments(slotB, timezoneB);
      for (const [startA, endA] of segmentsA) {
        for (const [startB, endB] of segmentsB) {
          const start = Math.max(startA, startB);
          const end = Math.min(endA, endB);
          if (end > start) {
            windows.push([start, end]);
          }
        }
      }
    }
  }
  return windows;
}

function hourOfWeek(date) {
  // UTC hour-of-week with Sunday = day 0, matching slot.dayOfWeek semantics.
  return date.getUTCDay() * 24 + date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
}

// Earliest concrete Date >= startBound at which both parties are simultaneously
// available, or null if they never overlap in a typical week.
export function earliestOverlapDate(slotsA, slotsB, timezoneA, timezoneB, startBound) {
  const windows = overlapWindowsOrEmpty(slotsA, slotsB, timezoneA, timezoneB);
  if (!windows.length) {
    return null;
  }

  const bound = startBound instanceof Date ? startBound : new Date(startBound);
  const nowHoW = hourOfWeek(bound);

  let bestDelta = Infinity;
  for (const [wStart, wEnd] of windows) {
    // Already inside this window right now → can meet at the bound itself.
    if (nowHoW >= wStart && nowHoW < wEnd) {
      bestDelta = 0;
      break;
    }
    const delta = ((wStart - nowHoW) % WEEK_HOURS + WEEK_HOURS) % WEEK_HOURS;
    if (delta < bestDelta) {
      bestDelta = delta;
    }
  }

  return new Date(bound.getTime() + bestDelta * HOUR_MS);
}

function overlapWindowsOrEmpty(slotsA, slotsB, timezoneA, timezoneB) {
  return overlappingWindows(slotsA ?? [], slotsB ?? [], timezoneA ?? 'UTC', timezoneB ?? 'UTC');
}

// True when a concrete overlapping slot exists within `windowDays` of `now`,
// honoring each side's available_from (near-term unavailability). Missing
// available_from means "available now".
export function hasConcreteOverlapWithinDays(
  a,
  b,
  { now = new Date(), windowDays = 21 } = {},
) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const fromA = a.availableFrom ? new Date(a.availableFrom) : nowDate;
  const fromB = b.availableFrom ? new Date(b.availableFrom) : nowDate;
  const startBound = new Date(Math.max(nowDate.getTime(), fromA.getTime(), fromB.getTime()));

  const earliest = earliestOverlapDate(a.slots, b.slots, a.timezone, b.timezone, startBound);
  if (!earliest) {
    return false;
  }
  return earliest.getTime() <= nowDate.getTime() + windowDays * DAY_MS;
}
