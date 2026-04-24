function normalizeToken(value) {
  return String(value).trim().toLowerCase();
}

function toTokenSet(text) {
  if (!text) {
    return new Set();
  }

  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 2),
  );
}

function overlapRatio(listA, listB) {
  const a = new Set((listA ?? []).map(normalizeToken));
  const b = new Set((listB ?? []).map(normalizeToken));

  if (!a.size && !b.size) {
    return 0;
  }

  const intersection = [...a].filter((item) => b.has(item)).length;
  return intersection / Math.max(a.size, b.size, 1);
}

function jaccardScore(setA, setB) {
  if (!setA.size || !setB.size) {
    return 0;
  }

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersection += 1;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function getCountry(location) {
  const chunks = String(location ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return chunks.length ? chunks[chunks.length - 1].toLowerCase() : '';
}

function segmentOverlapHours(startA, endA, startB, endB) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function getTimezoneOffsetHours(timezone) {
  try {
    const now = new Date();
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
    const parts = formatter.formatToParts(now);
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );
    return (asUtc - now.getTime()) / 3_600_000;
  } catch {
    return 0;
  }
}

function normalizeWeeklyRange(start, end) {
  const weekHours = 24 * 7;
  let normalizedStart = start;
  let normalizedEnd = end;

  while (normalizedStart < 0) {
    normalizedStart += weekHours;
    normalizedEnd += weekHours;
  }
  while (normalizedStart >= weekHours) {
    normalizedStart -= weekHours;
    normalizedEnd -= weekHours;
  }

  if (normalizedEnd <= weekHours) {
    return [[normalizedStart, normalizedEnd]];
  }

  return [
    [normalizedStart, weekHours],
    [0, normalizedEnd - weekHours],
  ];
}

function toUtcSegments(slot, fallbackTimezone) {
  const timezone = slot.timezone || fallbackTimezone || 'UTC';
  const offsetHours = getTimezoneOffsetHours(timezone);
  const start = slot.dayOfWeek * 24 + slot.startHour - offsetHours;
  const end = slot.dayOfWeek * 24 + slot.endHour - offsetHours;
  return normalizeWeeklyRange(start, end);
}

function availabilityOverlap(slotsA, slotsB, timezoneA = 'UTC', timezoneB = 'UTC') {
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

function pairKey(userId, candidateUserId) {
  return `${userId}::${candidateUserId}`;
}

function countHistoricalInteractions(pairHistory, userId, candidateUserId) {
  const forward = pairHistory.get(pairKey(userId, candidateUserId)) ?? [];
  const reverse = pairHistory.get(pairKey(candidateUserId, userId)) ?? [];
  return [...forward, ...reverse];
}

function isRecentIntro(historyRows, now, recentIntroDays) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - recentIntroDays);

  return historyRows.some((row) => {
    if (!['approved', 'accepted', 'intro_sent'].includes(row.status)) {
      return false;
    }

    return new Date(row.createdAt) >= cutoff;
  });
}

export function createDeterministicMatcher({ topN = 5, recentIntroDays = 45 } = {}) {
  return {
    matchUsers(users, pairHistory = new Map()) {
      const now = new Date();
      const recommendationsByUser = new Map();

      for (const profile of users) {
        const scored = [];

        for (const candidate of users) {
          if (profile.user.id === candidate.user.id) {
            continue;
          }

          if (!candidate.user.isActive || !candidate.user.matchingEnabled || !candidate.preferences.matchEnabled) {
            continue;
          }

          if (profile.preferences.blockedUserIds.includes(candidate.user.id)) {
            continue;
          }
          if (candidate.preferences.blockedUserIds.includes(profile.user.id)) {
            continue;
          }

          if (
            (profile.preferences.localOnly || candidate.preferences.localOnly) &&
            normalizeToken(profile.user.location) !== normalizeToken(candidate.user.location)
          ) {
            continue;
          }

          const overlap = availabilityOverlap(
            profile.availability,
            candidate.availability,
            profile.user.timezone,
            candidate.user.timezone,
          );
          if (!overlap.hasOverlap) {
            continue;
          }

          const intentRatio = overlapRatio(profile.preferences.matchIntent, candidate.preferences.matchIntent);
          const interestRatio = overlapRatio(profile.preferences.interests, candidate.preferences.interests);
          const complementarityRatio = overlapRatio(profile.preferences.asks, candidate.preferences.offers);
          const reciprocalComplementarity = overlapRatio(candidate.preferences.asks, profile.preferences.offers);
          const roleFitRatio = overlapRatio(profile.preferences.preferredUserTypes, candidate.preferences.preferredUserTypes);
          if (intentRatio === 0 && interestRatio < 0.15 && complementarityRatio === 0) {
            continue;
          }

          const historyRows = countHistoricalInteractions(pairHistory, profile.user.id, candidate.user.id);
          const hasPriorRejection = historyRows.some((row) => ['rejected', 'passed'].includes(row.status));
          if (hasPriorRejection) {
            continue;
          }

          if (isRecentIntro(historyRows, now, recentIntroDays)) {
            continue;
          }

          const introScore = jaccardScore(toTokenSet(profile.preferences.introText), toTokenSet(candidate.preferences.introText));
          const availabilityScore = Math.min(1, overlap.overlapHours / 3);
          const historicalPenalty = Math.min(20, historyRows.length * 4);

          const baseScore =
            complementarityRatio * 0.2 +
            reciprocalComplementarity * 0.1 +
            roleFitRatio * 0.15 +
            intentRatio * 0.2 +
            interestRatio * 0.15 +
            introScore * 0.1 +
            availabilityScore * 0.1;

          const score = Math.max(0, Math.round(baseScore * 100 - historicalPenalty));

          scored.push({
            candidateUserId: candidate.user.id,
            candidateLocationCountry: getCountry(candidate.user.location),
            score,
            whyMatched: [
              `Ask-offer fit ${(complementarityRatio * 100).toFixed(0)}%`,
              `Mutual ask-offer bonus ${(reciprocalComplementarity * 100).toFixed(0)}%`,
              `Role/domain fit ${(roleFitRatio * 100).toFixed(0)}%`,
              `Intent overlap ${(intentRatio * 100).toFixed(0)}%`,
              `Interest overlap ${(interestRatio * 100).toFixed(0)}%`,
              `Availability overlap ${overlap.overlapHours.toFixed(1)}h (timezone-normalized)`,
              `Intro similarity ${(introScore * 100).toFixed(0)}%`,
            ],
          });
        }

        scored.sort((a, b) => b.score - a.score);

        // Apply a lightweight diversity penalty so top picks are less clustered by location.
        const selected = [];
        const countryCounts = new Map();
        for (const candidate of scored) {
          const country = candidate.candidateLocationCountry;
          const seenCount = country ? countryCounts.get(country) ?? 0 : 0;
          const adjustedScore = Math.max(0, candidate.score - seenCount * 6);

          selected.push({
            candidateUserId: candidate.candidateUserId,
            score: adjustedScore,
            whyMatched: [...candidate.whyMatched, seenCount > 0 ? 'Diversity penalty applied to repeated location' : 'Diverse location candidate'],
          });

          if (country) {
            countryCounts.set(country, seenCount + 1);
          }

          if (selected.length >= topN) {
            break;
          }
        }

        recommendationsByUser.set(
          profile.user.id,
          selected
            .sort((a, b) => b.score - a.score)
            .map((recommendation, index) => ({
              ...recommendation,
              rank: index + 1,
            })),
        );
      }

      return recommendationsByUser;
    },
  };
}
