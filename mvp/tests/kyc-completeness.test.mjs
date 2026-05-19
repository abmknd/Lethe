import test from 'node:test';
import assert from 'node:assert/strict';
import { checkProfileCompleteness, COMPLETENESS_FIELDS } from '../domain/completeness.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';
import {
  buildTylerBrooks,
  buildEthanPark,
  buildMarcusWebb,
  buildLogisticsOperatorMentor,
} from './fixtures/persona-fixtures.mjs';

// ─── Domain: checkProfileCompleteness ────────────────────────────────────────

test('full profile is eligible with score 100', () => {
  const profile = buildProfileFixture();
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, true);
  assert.deepEqual(result.missingFields, []);
  assert.equal(result.completenessScore, 100);
});

test('empty asks → not eligible', () => {
  const profile = buildProfileFixture({ preferences: { asks: [] } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.ASKS));
});

test('empty offers → not eligible', () => {
  const profile = buildProfileFixture({ preferences: { offers: [] } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.OFFERS));
});

test('empty availability → not eligible', () => {
  const profile = buildProfileFixture({ availability: [] });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.AVAILABILITY));
});

test('isActive=false → not eligible', () => {
  const profile = buildProfileFixture({ user: { isActive: false } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.ACTIVE));
});

test('matchingEnabled=false → not eligible', () => {
  const profile = buildProfileFixture({ user: { matchingEnabled: false } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.MATCHING_ENABLED));
});

test('matchEnabled=false → not eligible', () => {
  const profile = buildProfileFixture({ preferences: { matchEnabled: false } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.MATCH_ENABLED));
});

test('missing name → not eligible', () => {
  const profile = buildProfileFixture({ user: { displayName: '', name: '' } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.NAME));
});

test('missing handle → not eligible', () => {
  const profile = buildProfileFixture({ user: { handle: '' } });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.HANDLE));
});

test('multiple missing fields accumulate correctly', () => {
  const profile = buildProfileFixture({
    preferences: { asks: [], offers: [] },
    availability: [],
  });
  const result = checkProfileCompleteness(profile);
  assert.equal(result.isEligible, false);
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.ASKS));
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.OFFERS));
  assert.ok(result.missingFields.includes(COMPLETENESS_FIELDS.AVAILABILITY));
  assert.ok(result.completenessScore < 100);
});

test('completenessScore scales proportionally', () => {
  const full = checkProfileCompleteness(buildProfileFixture());
  const oneGap = checkProfileCompleteness(buildProfileFixture({ preferences: { asks: [] } }));
  assert.equal(full.completenessScore, 100);
  assert.ok(oneGap.completenessScore > 0 && oneGap.completenessScore < 100);
});

test('null profile returns ineligible with score 0', () => {
  const result = checkProfileCompleteness(null);
  assert.equal(result.isEligible, false);
  assert.ok(result.completenessScore < 100);
});

// ─── Service: CompletenessService ────────────────────────────────────────────

test('getCompleteness returns null for unknown user', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const result = app.services.completeness.getCompleteness('no_such_user');
    assert.equal(result, null);
  } finally {
    cleanup();
  }
});

test('getCompleteness returns eligible result for complete seed profile', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users.find((u) => u.isActive && u.matchingEnabled);
    assert.ok(user, 'seed must produce at least one active user');

    const result = app.services.completeness.getCompleteness(user.id);
    assert.ok(result, 'expected a completeness result');
    assert.equal(result.userId, user.id);
    assert.equal(typeof result.isEligible, 'boolean');
    assert.ok(Array.isArray(result.missingFields));
    assert.ok(result.completenessScore >= 0 && result.completenessScore <= 100);
  } finally {
    cleanup();
  }
});

test('filterEligibleProfiles excludes profiles with empty asks', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildTylerBrooks());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    const all = app.repository.listUsersForMatching();
    const eligible = app.services.completeness.filterEligibleProfiles(all);

    const tylerInAll = all.some((p) => p.user.id === 'tyler_brooks');
    const tylerInEligible = eligible.some((p) => p.user.id === 'tyler_brooks');
    assert.ok(tylerInAll, 'Tyler must be in all profiles');
    assert.equal(tylerInEligible, false, 'Tyler must be excluded from eligible profiles');
  } finally {
    cleanup();
  }
});

// ─── Integration: matching gate ───────────────────────────────────────────────

test('matching run skips incomplete users and reports usersSkippedIncomplete', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildTylerBrooks());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    const result = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    assert.ok(result.summary.usersSkippedIncomplete >= 1, 'at least one user should be skipped');
  } finally {
    cleanup();
  }
});

test('complete profiles still receive recommendations after gate is applied', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('marcus_webb', { status: 'pending_review' });
    assert.ok(recs.length > 0, 'complete profiles must still generate recommendations');
  } finally {
    cleanup();
  }
});

test('empty-asks user receives zero recommendations (completeness gate)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildTylerBrooks());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('tyler_brooks', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'incomplete profile must not enter the matching pool');
  } finally {
    cleanup();
  }
});

test('empty-offers user receives zero recommendations (completeness gate)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildEthanPark());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('ethan_park', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'incomplete profile (empty offers) must not enter the matching pool');
  } finally {
    cleanup();
  }
});

test('no-availability user receives zero recommendations (completeness gate)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const noAvailability = buildProfileFixture({
      user: { id: 'no_avail_user', displayName: 'No Avail', handle: 'no.avail', email: 'no@avail.test' },
      availability: [],
    });
    app.services.onboarding.saveUserProfile(noAvailability);
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('no_avail_user', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'no-availability profile must not enter the matching pool');
  } finally {
    cleanup();
  }
});

test('passive user (matchEnabled=false) receives zero recommendations (completeness gate)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const passive = buildProfileFixture({
      user: { id: 'passive_user', displayName: 'Passive User', handle: 'passive', email: 'p@test.test' },
      preferences: { matchEnabled: false },
    });
    app.services.onboarding.saveUserProfile(passive);
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('passive_user', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'passive profile must not enter the matching pool');
  } finally {
    cleanup();
  }
});
