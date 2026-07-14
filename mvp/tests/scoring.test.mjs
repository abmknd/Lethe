// Phase 2, item 2 — scoring modifiers (experience proximity L2-S4, match mode L2-S1).
// Unit coverage for the pure module plus matcher-level regressions. The matcher
// tests use controls so they fail if a modifier over- or under-fires, and they
// assert the default (no new fields) path is unchanged.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExperienceLevel,
  experienceOrdinal,
  isMentorMode,
  experienceProximityModifier,
  normalizeMatchMode,
  resolveWeights,
  EXPERIENCE_LEVELS,
  MATCH_MODES,
} from '../matching/scoring.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';

test('normalizeExperienceLevel canonicalizes tokens and aliases', () => {
  assert.equal(normalizeExperienceLevel('First-Time'), 'first_time');
  assert.equal(normalizeExperienceLevel('serial'), 'veteran');
  assert.equal(normalizeExperienceLevel('senior'), 'experienced');
  assert.equal(normalizeExperienceLevel('bogus'), '');
  assert.equal(experienceOrdinal('first_time') < experienceOrdinal('veteran'), true);
  assert.equal(EXPERIENCE_LEVELS.length, 4);
});

test('isMentorMode reads flag or mentorship intent', () => {
  assert.equal(isMentorMode({ mentorMatch: true }), true);
  assert.equal(isMentorMode({ matchIntent: ['mentorship'] }), true);
  assert.equal(isMentorMode({ matchIntent: ['collaboration'] }), false);
  assert.equal(isMentorMode({}), false);
});

test('experienceProximityModifier: closer levels higher, mentor and missing data neutral', () => {
  const same = experienceProximityModifier({ experienceLevel: 'veteran' }, { experienceLevel: 'veteran' });
  const far = experienceProximityModifier({ experienceLevel: 'veteran' }, { experienceLevel: 'first_time' });
  assert.equal(same, 1);
  assert.equal(far < same, true);
  assert.equal(far >= 0.85 - 1e-9, true);
  // mentor mode neutralizes the gap
  assert.equal(
    experienceProximityModifier({ experienceLevel: 'veteran', mentorMatch: true }, { experienceLevel: 'first_time' }),
    1,
  );
  // missing data on either side → neutral
  assert.equal(experienceProximityModifier({ experienceLevel: 'veteran' }, {}), 1);
});

test('normalizeMatchMode defaults to match_my_ask; resolveWeights sums to 1', () => {
  assert.equal(normalizeMatchMode('surprise-me'), MATCH_MODES.SURPRISE_ME);
  assert.equal(normalizeMatchMode('anything'), MATCH_MODES.MATCH_MY_ASK);
  for (const mode of [MATCH_MODES.MATCH_MY_ASK, MATCH_MODES.SURPRISE_ME]) {
    const w = resolveWeights(mode);
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `weights for ${mode} sum to 1 (got ${sum})`);
  }
});

// ── matcher-level regressions ──────────────────────────────────────────────

function pair(seekerPrefs = {}, candidatePrefs = {}) {
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
      ...seekerPrefs,
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
      ...candidatePrefs,
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });
  return { seeker, candidate };
}

function topScore(seeker, candidate) {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(seeker);
    app.services.onboarding.saveUserProfile(candidate);
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const recs = app.services.recommendations.listForUser('seeker', { status: 'pending_review' });
    return recs.length ? recs[0].score : null;
  } finally {
    cleanup();
  }
}

test('L2-S4: a wide experience gap lowers the score, and mentor mode neutralizes it', () => {
  // Control: both veterans (gap 0) → no experience penalty.
  const close = pair({ experienceLevel: 'veteran' }, { experienceLevel: 'veteran' });
  const closeScore = topScore(close.seeker, close.candidate);
  assert.ok(closeScore > 0, 'control pair should match');

  // Wide gap (veteran ↔ first-time) → strictly lower score.
  const far = pair({ experienceLevel: 'veteran' }, { experienceLevel: 'first_time' });
  const farScore = topScore(far.seeker, far.candidate);
  assert.ok(farScore < closeScore, `wide experience gap should lower score (got ${farScore} vs ${closeScore})`);

  // Same wide gap, but the seeker opts into mentor matching → penalty removed.
  const mentor = pair({ experienceLevel: 'veteran', mentorMatch: true }, { experienceLevel: 'first_time' });
  const mentorScore = topScore(mentor.seeker, mentor.candidate);
  assert.equal(mentorScore, closeScore, 'mentor mode should neutralize the experience gap');
});

test('L2-S1: surprise_me de-emphasizes complementarity relative to match_my_ask', () => {
  // A complementarity-heavy pair. Under surprise_me the ask/offer weight drops,
  // so the score is strictly lower than under the default match_my_ask.
  const askPair = pair();
  const askScore = topScore(askPair.seeker, askPair.candidate);

  const surprisePair = pair({ matchMode: 'surprise_me' });
  const surpriseScore = topScore(surprisePair.seeker, surprisePair.candidate);

  assert.ok(askScore > 0 && surpriseScore > 0, 'both modes should still match');
  assert.ok(
    surpriseScore < askScore,
    `surprise_me should score this complementarity-heavy pair lower (got ${surpriseScore} vs ${askScore})`,
  );
});
