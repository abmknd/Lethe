// Phase 2, item 3 — 21-day concrete availability window (L2-S3).
// Unit coverage for the window resolution plus a matcher-level regression:
// a counterpart unavailable for six weeks is deferred, not surfaced.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  availabilityOverlap,
  earliestOverlapDate,
  hasConcreteOverlapWithinDays,
} from '../matching/availability.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;
const tuesday = [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }];
const thursday = [{ dayOfWeek: 4, startHour: 3, endHour: 4, timezone: 'UTC' }];

test('availabilityOverlap still reports weekly overlap after extraction', () => {
  assert.equal(availabilityOverlap(tuesday, tuesday, 'UTC', 'UTC').hasOverlap, true);
  assert.equal(availabilityOverlap(tuesday, thursday, 'UTC', 'UTC').hasOverlap, false);
});

test('earliestOverlapDate returns a concrete slot within a week of the bound', () => {
  const bound = new Date('2026-07-13T00:00:00Z'); // Monday
  const earliest = earliestOverlapDate(tuesday, tuesday, 'UTC', 'UTC', bound);
  assert.ok(earliest instanceof Date);
  const daysOut = (earliest.getTime() - bound.getTime()) / DAY_MS;
  assert.ok(daysOut >= 0 && daysOut <= 7, `expected within a week, got ${daysOut} days`);
  assert.equal(earliestOverlapDate(tuesday, thursday, 'UTC', 'UTC', bound), null);
});

test('hasConcreteOverlapWithinDays honors available_from', () => {
  const now = new Date('2026-07-13T00:00:00Z');
  const both = (fromA) => ({
    a: { slots: tuesday, timezone: 'UTC', availableFrom: fromA },
    b: { slots: tuesday, timezone: 'UTC' },
  });

  // Available now → within window.
  assert.equal(hasConcreteOverlapWithinDays(both().a, both().b, { now }), true);

  // Available in 10 days → earliest overlap ~17 days out → still within 21.
  const soon = new Date(now.getTime() + 10 * DAY_MS).toISOString();
  assert.equal(hasConcreteOverlapWithinDays(both(soon).a, both(soon).b, { now }), true);

  // Available in 42 days → beyond the window → deferred.
  const later = new Date(now.getTime() + 42 * DAY_MS).toISOString();
  assert.equal(hasConcreteOverlapWithinDays(both(later).a, both(later).b, { now }), false);

  // No weekly overlap at all → false.
  assert.equal(
    hasConcreteOverlapWithinDays(
      { slots: tuesday, timezone: 'UTC' },
      { slots: thursday, timezone: 'UTC' },
      { now },
    ),
    false,
  );
});

// Matcher-level L2-S3: two otherwise-matching profiles; when one is unavailable
// for six weeks, the pair is deferred out of the candidate pool.
function matchablePair(candidateAvailableFrom) {
  const seeker = buildProfileFixture({
    user: { id: 'seeker', displayName: 'Seeker', handle: 'seeker', email: 'seeker@personalmail.test' },
    preferences: {
      userType: 'operator',
      preferredUserTypes: ['founder'],
      matchIntent: ['collaboration', 'peer exchange'],
      offers: ['ops playbooks'],
      asks: ['fundraising help'],
      interests: ['saas', 'growth', 'product'],
      objectives: [],
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });
  const candidate = buildProfileFixture({
    user: { id: 'candidate', displayName: 'Candidate', handle: 'candidate', email: 'candidate@othermail.test' },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['operator'],
      matchIntent: ['collaboration', 'peer exchange'],
      offers: ['fundraising help'],
      asks: ['ops playbooks'],
      interests: ['saas', 'growth', 'product'],
      objectives: [],
      ...(candidateAvailableFrom ? { availableFrom: candidateAvailableFrom } : {}),
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });
  return { seeker, candidate };
}

function countRecs(seeker, candidate) {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(seeker);
    app.services.onboarding.saveUserProfile(candidate);
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    return app.services.recommendations.listForUser('seeker', { status: 'pending_review' }).length;
  } finally {
    cleanup();
  }
}

test('L2-S3: a counterpart unavailable for six weeks is deferred', () => {
  // Control: available now → matches.
  const control = matchablePair();
  assert.ok(countRecs(control.seeker, control.candidate) > 0, 'control pair should match');

  // Candidate unavailable for 6 weeks → no concrete slot within 21 days → deferred.
  const sixWeeks = new Date(Date.now() + 42 * DAY_MS).toISOString();
  const deferred = matchablePair(sixWeeks);
  assert.equal(countRecs(deferred.seeker, deferred.candidate), 0, 'far-out availability should defer the match');
});
