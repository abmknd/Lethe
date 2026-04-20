import { hasHourOverlap } from '../domain/models.mjs';

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

function availabilityOverlap(slotsA, slotsB) {
  let overlapHours = 0;
  let overlapSegments = 0;

  for (const slotA of slotsA) {
    for (const slotB of slotsB) {
      if (!hasHourOverlap(slotA, slotB)) {
        continue;
      }
      overlapSegments += 1;
      overlapHours += Math.max(0, Math.min(slotA.endHour, slotB.endHour) - Math.max(slotA.startHour, slotB.startHour));
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

          const overlap = availabilityOverlap(profile.availability, candidate.availability);
          if (!overlap.hasOverlap) {
            continue;
          }

          const intentRatio = overlapRatio(profile.preferences.matchIntent, candidate.preferences.matchIntent);
          const interestRatio = overlapRatio(profile.preferences.interests, candidate.preferences.interests);
          if (intentRatio === 0 && interestRatio < 0.15) {
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
          const timezoneScore =
            profile.user.timezone === candidate.user.timezone
              ? 1
              : profile.user.timezone.split('/')[0] === candidate.user.timezone.split('/')[0]
                ? 0.65
                : 0.35;
          const availabilityScore = Math.min(1, overlap.overlapHours / 3);
          const historicalPenalty = Math.min(20, historyRows.length * 4);

          const baseScore =
            intentRatio * 0.3 +
            interestRatio * 0.3 +
            introScore * 0.2 +
            availabilityScore * 0.15 +
            timezoneScore * 0.05;

          const score = Math.max(0, Math.round(baseScore * 100 - historicalPenalty));

          scored.push({
            candidateUserId: candidate.user.id,
            candidateLocationCountry: getCountry(candidate.user.location),
            score,
            whyMatched: [
              `Intent overlap ${(intentRatio * 100).toFixed(0)}%`,
              `Interest overlap ${(interestRatio * 100).toFixed(0)}%`,
              `Availability overlap ${overlap.overlapHours}h this week`,
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
