import { isSameOrg, orgIdentity } from './org-exclusion.mjs';
import { passesStageRequirement, passesNotLookingFor } from './candidate-filters.mjs';
import {
  resolveWeights,
  experienceProximityModifier,
  isMentorMode,
  normalizeMatchMode,
  MATCH_MODES,
} from './scoring.mjs';
import { availabilityOverlap, hasConcreteOverlapWithinDays } from './availability.mjs';

function normalizeToken(value) {
  return String(value).trim().toLowerCase();
}

// Draw the org anchors from the profile's user + preferences. Company name and
// work email are declared during onboarding and stored on preferences.
function orgIdentityForProfile(profile) {
  return orgIdentity({
    email: profile.user?.email,
    companyName: profile.preferences?.companyName,
    workEmail: profile.preferences?.workEmail,
  });
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
    matchUsers(users, pairHistory = new Map(), cepMap = new Map()) {
      const now = new Date();
      const recommendationsByUser = new Map();
      let skippedByMinSignals = 0;
      let skippedByRecentSuccess = 0;
      let skippedByScheduleWindow = 0;

      for (const profile of users) {
        const scored = [];

        for (const candidate of users) {
          if (profile.user.id === candidate.user.id) {
            continue;
          }

          if (!candidate.user.isActive || !candidate.user.matchingEnabled) {
            continue;
          }

          if (profile.preferences.blockedUserIds.includes(candidate.user.id)) {
            continue;
          }
          if (candidate.preferences.blockedUserIds.includes(profile.user.id)) {
            continue;
          }

          // Layered same-org exclusion (Phase 2, item 1): email domain +
          // self-declared company name + verified work-email domain. Any layer
          // firing excludes the pair. See mvp/matching/org-exclusion.mjs.
          if (isSameOrg(orgIdentityForProfile(profile), orgIdentityForProfile(candidate))) {
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

          // 21-day concrete window (Phase 2, item 3): a recurring weekly overlap
          // is not enough — a concrete overlapping slot must fall within 21 days
          // of the cycle start, honoring each side's available_from. Defers a
          // counterpart who is unavailable for the near term (L2-S3).
          const concreteOverlap = hasConcreteOverlapWithinDays(
            {
              slots: profile.availability,
              timezone: profile.user.timezone,
              availableFrom: profile.preferences.availableFrom,
            },
            {
              slots: candidate.availability,
              timezone: candidate.user.timezone,
              availableFrom: candidate.preferences.availableFrom,
            },
            { now },
          );
          if (!concreteOverlap) {
            skippedByScheduleWindow += 1;
            continue;
          }

          // #76.2 — hard-skip pairs whose preferred meeting formats don't overlap.
          // 'no-preference' on either side counts as overlap with everything.
          // Tolerate legacy single-string shape from seed fixtures.
          const toFormatList = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v ? [v] : []);
          const profileFormats = new Set(toFormatList(profile.preferences.meetingFormat).map(normalizeToken));
          const candidateFormats = new Set(toFormatList(candidate.preferences.meetingFormat).map(normalizeToken));
          if (profileFormats.size && candidateFormats.size) {
            const eitherIsOpen = profileFormats.has('no-preference') || candidateFormats.has('no-preference');
            const hasFormatOverlap = eitherIsOpen
              || [...profileFormats].some((fmt) => candidateFormats.has(fmt));
            if (!hasFormatOverlap) {
              continue;
            }
          }

          // Directional candidate pre-filters (Phase 2, item 2): the requesting
          // profile's company-stage requirement and not_looking_for list gate
          // which candidates reach scoring. See mvp/matching/candidate-filters.mjs.
          if (!passesStageRequirement(profile.preferences, candidate.preferences)) {
            continue;
          }
          if (!passesNotLookingFor(profile.preferences, candidate.preferences)) {
            continue;
          }

          const intentRatio = overlapRatio(profile.preferences.matchIntent, candidate.preferences.matchIntent);
          const interestRatio = overlapRatio(profile.preferences.interests, candidate.preferences.interests);
          const complementarityRatio = overlapRatio(profile.preferences.asks, candidate.preferences.offers);
          const reciprocalComplementarity = overlapRatio(candidate.preferences.asks, profile.preferences.offers);
          // Does profile want to meet candidate's type? Does candidate want to meet profile's type?
          const profileWantsCandidate = candidate.preferences.userType
            ? new Set((profile.preferences.preferredUserTypes ?? []).map(normalizeToken)).has(normalizeToken(candidate.preferences.userType))
            : false;
          const candidateWantsProfile = profile.preferences.userType
            ? new Set((candidate.preferences.preferredUserTypes ?? []).map(normalizeToken)).has(normalizeToken(profile.preferences.userType))
            : false;
          const roleFitRatio = ((profileWantsCandidate ? 1 : 0) + (candidateWantsProfile ? 1 : 0)) / 2;

          // Require at least 2 of 3 primary signals to fire above a minimum threshold.
          // Caveat (per #80.5): on small cohorts this may be too aggressive. If a run
          // produces zero recommendations, relax back to the previous single-signal rule.
          // The skip counter logged at the end of matchUsers makes this observable.
          const primarySignalsFiring =
            (intentRatio >= 0.1 ? 1 : 0) +
            (interestRatio >= 0.15 ? 1 : 0) +
            (complementarityRatio >= 0.1 ? 1 : 0);
          if (primarySignalsFiring < 2) {
            skippedByMinSignals += 1;
            continue;
          }

          const historyRows = countHistoricalInteractions(pairHistory, profile.user.id, candidate.user.id);
          const hasPriorRejection = historyRows.some((row) => ['rejected', 'passed'].includes(row.status));
          if (hasPriorRejection) {
            continue;
          }

          // Successful-match cooldown — skip if this pair has been successfully introduced
          // within the past 180 days. Caller's listPairHistory({ sinceDays: 180 }) defines
          // the window, so any matching row here is in-window.
          const hasRecentSuccessfulIntro = historyRows.some((row) =>
            ['accepted', 'intro_sent', 'completed'].includes(row.status),
          );
          if (hasRecentSuccessfulIntro) {
            skippedByRecentSuccess += 1;
            continue;
          }

          if (isRecentIntro(historyRows, now, recentIntroDays)) {
            continue;
          }

          const objectivesScore = jaccardScore(
            new Set((profile.preferences.objectives ?? []).map(normalizeToken)),
            new Set((candidate.preferences.objectives ?? []).map(normalizeToken)),
          );
          const availabilityScore = Math.min(1, overlap.overlapHours / 1.5);
          const historicalPenalty = Math.min(20, historyRows.length * 4);

          // Weight vector is selected by the requesting profile's match mode
          // (Phase 2, item 2). match_my_ask keeps the historical weights exactly.
          const weights = resolveWeights(profile.preferences.matchMode);
          const rawBase =
            complementarityRatio * weights.complementarity +
            reciprocalComplementarity * weights.reciprocal +
            roleFitRatio * weights.roleFit +
            intentRatio * weights.intent +
            interestRatio * weights.interest +
            objectivesScore * weights.objectives +
            availabilityScore * weights.availability;

          // Experience-proximity modifier (Phase 2, item 2): closer experience
          // levels score higher, unless either side opted into mentor matching.
          // Neutral (1.0) when either side omits an experience level.
          const experienceModifier = experienceProximityModifier(
            profile.preferences,
            candidate.preferences,
          );
          const baseScore = rawBase * experienceModifier;

          const profileCep = cepMap.get(profile.user.id) ?? null;
          const candidateCep = cepMap.get(candidate.user.id) ?? null;
          let cepBoost = 0;
          const cepNote = [];
          if (profileCep && candidateCep) {
            cepBoost += 5;
            const profileTokens = toTokenSet(profileCep.focusText);
            const candidateTokens = toTokenSet(candidateCep.focusText);
            const sharedFocusCount = [...profileTokens].filter((t) => candidateTokens.has(t)).length;
            if (sharedFocusCount > 0) {
              cepBoost += 3;
              cepNote.push(`Weekly focus overlap (+${cepBoost} pts)`);
            } else {
              cepNote.push(`Both have weekly focus signal (+5 pts)`);
            }
          }

          const score = Math.max(0, Math.round(baseScore * 100 - historicalPenalty + cepBoost));

          const scoringNote = [];
          if (normalizeMatchMode(profile.preferences.matchMode) === MATCH_MODES.SURPRISE_ME) {
            scoringNote.push('Surprise-me mode (complementarity de-emphasized)');
          }
          if (isMentorMode(profile.preferences) || isMentorMode(candidate.preferences)) {
            scoringNote.push('Mentor-style match (experience gap welcomed)');
          } else if (experienceModifier < 1) {
            scoringNote.push(`Experience-gap adjustment ×${experienceModifier.toFixed(2)}`);
          }

          scored.push({
            candidateUserId: candidate.user.id,
            candidateLocationCountry: getCountry(candidate.user.location),
            score,
            whyMatched: [
              `Ask-offer fit ${(complementarityRatio * 100).toFixed(0)}%`,
              `Mutual ask-offer bonus ${(reciprocalComplementarity * 100).toFixed(0)}%`,
              `Role fit ${(roleFitRatio * 100).toFixed(0)}% (${profile.preferences.userType || '?'} ↔ ${candidate.preferences.userType || '?'})`,
              `Intent overlap ${(intentRatio * 100).toFixed(0)}%`,
              `Interest overlap ${(interestRatio * 100).toFixed(0)}%`,
              `Availability overlap ${overlap.overlapHours.toFixed(1)}h (timezone-normalized)`,
              `Objectives overlap ${(objectivesScore * 100).toFixed(0)}%`,
              ...scoringNote,
              ...cepNote,
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

      console.log(
        `[matcher] Skipped pairs: ${skippedByMinSignals} by min-signal filter, ${skippedByRecentSuccess} by recent-success cooldown, ${skippedByScheduleWindow} by 21-day schedule window.`,
      );

      return recommendationsByUser;
    },
  };
}
