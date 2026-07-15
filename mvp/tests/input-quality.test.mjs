// Phase 2, item 5 — input-quality pass at intake.
// Unit coverage for the deterministic detector plus an integration test proving
// intake writes INTAKE_REGISTER trust signals silently (never blocking save).

import test from 'node:test';
import assert from 'node:assert/strict';
import { detectInputQuality, INPUT_QUALITY_CATEGORIES } from '../context/input-quality.mjs';
import { TRUST_SIGNAL_TYPES } from '../domain/trust.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';

const cats = (result) => result.flags.map((f) => f.category);

test('thin ask/offer flags and routes to community-first', () => {
  const result = detectInputQuality({ asks: ['help'], offers: [] });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.THIN_ASK));
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.THIN_OFFER));
  assert.equal(result.routeToCommunityFirst, true);
});

test('generic LinkedIn-bio register is detected (L1-S2)', () => {
  const result = detectInputQuality({
    asks: ['meet founders'],
    offers: ['I am a passionate about growth results-driven team player'],
  });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.GENERIC_BIO));
});

test('third-person CV register is detected (L1-S7)', () => {
  const result = detectInputQuality({
    name: 'Fatima Ahmed',
    asks: ['meet operators'],
    offers: ['Fatima is a seasoned leader responsible for cross-functional teams'],
  });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.CV_REGISTER));
});

test('commercial solicitation is detected (L1-S3)', () => {
  const result = detectInputQuality({
    asks: ['book a demo of our product, contact sales for pricing'],
    offers: ['consulting help'],
  });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.COMMERCIAL_SOLICITATION));
});

test('fundraising-only ask is detected (L1-S4)', () => {
  const result = detectInputQuality({
    asks: ['raising our seed round from investors'],
    offers: ['product feedback'],
  });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.FUNDRAISING_ONLY));
});

test('a substantive ask that mentions fundraising among other things is NOT fundraising-only', () => {
  const result = detectInputQuality({
    asks: ['advice on hiring my first engineers and structuring a seed round and go-to-market'],
    offers: ['ops help'],
  });
  assert.ok(!cats(result).includes(INPUT_QUALITY_CATEGORIES.FUNDRAISING_ONLY));
});

test('low-reciprocity broadcast offer is detected (L1-S10)', () => {
  const result = detectInputQuality({
    asks: ['meet founders'],
    offers: ['I can give you media coverage and feature you to my audience'],
  });
  assert.ok(cats(result).includes(INPUT_QUALITY_CATEGORIES.LOW_RECIPROCITY_OFFER));
});

test('a clean, conversational profile raises no flags', () => {
  const result = detectInputQuality({
    name: 'Sam Rivera',
    asks: ['advice on pricing my b2b saas and finding my first sales hire'],
    offers: ['i can share what worked scaling support from 0 to 10k users'],
    introText: 'building tools for small teams, happy to swap notes on early growth',
  });
  assert.deepEqual(result.flags, []);
  assert.equal(result.routeToCommunityFirst, false);
});

// Integration: intake detection writes trust signals silently and never blocks save.
test('saveUserProfile writes INTAKE_REGISTER trust signals for low-quality input', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const saved = app.services.onboarding.saveUserProfile(
      buildProfileFixture({
        user: { id: 'solicitor', displayName: 'Solly', handle: 'solly', email: 'solly@personalmail.test' },
        preferences: {
          asks: ['book a demo of our services, dm me to buy'],
          offers: ['media coverage — i can feature you to my audience'],
          introText: 'passionate about synergy, proven track record',
        },
      }),
    );

    // Save succeeds and returns the detection alongside the profile.
    assert.ok(saved.user.id === 'solicitor');
    assert.ok(saved.inputQuality.flags.length > 0);

    const signals = app.services.matchLifecycle.listTrustSignals('solicitor');
    const intakeSignals = signals.filter((s) => s.signalType === TRUST_SIGNAL_TYPES.INTAKE_REGISTER);
    assert.ok(intakeSignals.length > 0, 'expected INTAKE_REGISTER signals to be written');
    // Detections carry negative weight (they lower the trust score).
    assert.ok(intakeSignals.every((s) => s.weight <= 0));
  } finally {
    cleanup();
  }
});

test('a clean profile writes no intake trust signals', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(
      buildProfileFixture({
        user: { id: 'clean_user', displayName: 'Clean', handle: 'clean', email: 'clean@personalmail.test' },
        preferences: {
          asks: ['advice on hiring my first two engineers'],
          offers: ['i can share how we cut churn in half last year'],
          introText: 'building developer tools, love talking shop about early traction',
        },
      }),
    );
    const signals = app.services.matchLifecycle
      .listTrustSignals('clean_user')
      .filter((s) => s.signalType === TRUST_SIGNAL_TYPES.INTAKE_REGISTER);
    assert.equal(signals.length, 0);
  } finally {
    cleanup();
  }
});
