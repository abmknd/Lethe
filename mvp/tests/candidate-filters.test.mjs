// Phase 2, item 2 — candidate pre-filters (company_stage L2-S6, not_looking_for L2-S7).
// Unit coverage for the pure module plus matcher-level regressions, each paired
// with a control proving the same two profiles DO match once the filter no
// longer bites (so the tests fail loudly if the filter over- or under-fires).

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeStage,
  normalizeStageList,
  stageOrdinal,
  passesStageRequirement,
  passesNotLookingFor,
  COMPANY_STAGES,
} from '../matching/candidate-filters.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';

test('normalizeStage canonicalizes tokens and aliases', () => {
  assert.equal(normalizeStage('Revenue'), 'revenue');
  assert.equal(normalizeStage('pre-revenue'), 'pre_revenue');
  assert.equal(normalizeStage('post-revenue'), 'revenue');
  assert.equal(normalizeStage('MVP'), 'prototype');
  assert.equal(normalizeStage('nonsense'), '');
  assert.equal(normalizeStage(''), '');
});

test('normalizeStageList dedupes and drops unknowns; stageOrdinal orders', () => {
  assert.deepEqual(normalizeStageList(['revenue', 'Revenue', 'bogus', 'growth']), ['revenue', 'growth']);
  assert.equal(stageOrdinal('idea') < stageOrdinal('scale'), true);
  assert.equal(stageOrdinal('bogus'), null);
  assert.equal(COMPANY_STAGES.length, 6);
});

test('passesStageRequirement: no constraint or missing candidate stage always passes', () => {
  assert.equal(passesStageRequirement({}, { companyStage: 'idea' }), true);
  assert.equal(passesStageRequirement({ meetStages: ['revenue'] }, { companyStage: '' }), true);
});

test('passesStageRequirement enforces accepted set', () => {
  assert.equal(passesStageRequirement({ meetStages: ['revenue', 'growth', 'scale'] }, { companyStage: 'prototype' }), false);
  assert.equal(passesStageRequirement({ meetStages: ['revenue', 'growth', 'scale'] }, { companyStage: 'revenue' }), true);
});

test('passesNotLookingFor excludes only on user_type match', () => {
  assert.equal(passesNotLookingFor({ notLookingFor: ['investor'] }, { userType: 'investor' }), false);
  assert.equal(passesNotLookingFor({ notLookingFor: ['investor'] }, { userType: 'founder' }), true);
  assert.equal(passesNotLookingFor({}, { userType: 'investor' }), true);
});

// Two profiles that overlap on intent + interests + complementary asks/offers,
// so they match absent any pre-filter. Stage/not_looking_for are layered on top.
function seekerAndCandidate(candidatePrefs = {}) {
  const seeker = buildProfileFixture({
    user: { id: 'seeker', displayName: 'Seeker', handle: 'seeker', email: 'seeker@personalmail.test' },
    preferences: {
      userType: 'investor',
      preferredUserTypes: ['founder'],
      matchIntent: ['deal flow', 'collaboration'],
      offers: ['capital', 'intros'],
      asks: ['product traction stories'],
      interests: ['fintech', 'growth', 'product'],
      objectives: [],
      meetStages: [],
      notLookingFor: [],
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });
  const candidate = buildProfileFixture({
    user: { id: 'candidate', displayName: 'Candidate', handle: 'candidate', email: 'candidate@othermail.test' },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['investor'],
      matchIntent: ['deal flow', 'collaboration'],
      offers: ['product traction stories'],
      asks: ['capital'],
      interests: ['fintech', 'growth', 'product'],
      objectives: [],
      ...candidatePrefs,
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });
  return { seeker, candidate };
}

function runAndCount(seeker, candidate) {
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

test('L2-S6: company-stage requirement hard-excludes below-stage candidates', () => {
  // Control: seeker with no stage requirement matches the prototype-stage founder.
  const control = seekerAndCandidate({ companyStage: 'prototype' });
  assert.equal(runAndCount(control.seeker, control.candidate) > 0, true, 'control should match with no stage requirement');

  // Requirement: seeker only wants revenue+; prototype candidate is excluded.
  const filtered = seekerAndCandidate({ companyStage: 'prototype' });
  filtered.seeker.preferences.meetStages = ['revenue', 'growth', 'scale'];
  assert.equal(runAndCount(filtered.seeker, filtered.candidate), 0, 'below-stage candidate must be excluded');

  // Same requirement, candidate now at revenue → matches again.
  const passing = seekerAndCandidate({ companyStage: 'revenue' });
  passing.seeker.preferences.meetStages = ['revenue', 'growth', 'scale'];
  assert.equal(runAndCount(passing.seeker, passing.candidate) > 0, true, 'in-stage candidate must match');
});

test('L2-S7: not_looking_for hard-excludes candidates of an avoided user_type', () => {
  // Control: no avoid list → the founder candidate matches.
  const control = seekerAndCandidate();
  assert.equal(runAndCount(control.seeker, control.candidate) > 0, true, 'control should match with empty not_looking_for');

  // Avoid founders → the founder candidate is excluded.
  const filtered = seekerAndCandidate();
  filtered.seeker.preferences.notLookingFor = ['founder'];
  assert.equal(runAndCount(filtered.seeker, filtered.candidate), 0, 'avoided user_type must be excluded');
});
