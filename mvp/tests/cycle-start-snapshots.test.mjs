// Cycle-start matching snapshots (alignment plan, Phase 1 / decision 2).
// A profile edit must not change the cycle it was already matched in; it takes
// effect only in the next cycle. The snapshot is the durable, frozen record.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildMarcusWebb, buildLogisticsOperatorMentor } from './fixtures/persona-fixtures.mjs';

test('each cycle freezes its own inputs; edits take effect only next cycle', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    // Cycle 1.
    const run1 = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const snap1 = app.repository.getMatchingSnapshot(run1.runId, 'marcus_webb');
    assert.ok(snap1, 'cycle 1 should capture a snapshot for the user');
    assert.ok(!snap1.asks.includes('brand_new_ask'), 'original snapshot must not contain the future edit');

    // Edit the profile after the cycle ran.
    const edited = buildMarcusWebb();
    edited.preferences.asks = [...edited.preferences.asks, 'brand_new_ask'];
    app.services.onboarding.saveUserProfile(edited);

    // Cycle 2.
    const run2 = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const snap2 = app.repository.getMatchingSnapshot(run2.runId, 'marcus_webb');
    assert.ok(snap2.asks.includes('brand_new_ask'), 'next cycle should reflect the edit');

    // Cycle 1's snapshot is unchanged — the edit did not reach back in time.
    const snap1Again = app.repository.getMatchingSnapshot(run1.runId, 'marcus_webb');
    assert.ok(!snap1Again.asks.includes('brand_new_ask'), 'the earlier cycle snapshot must stay frozen');
  } finally {
    cleanup();
  }
});

test('a snapshot is captured for every eligible user in the run', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    const run = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const snaps = app.repository.listMatchingSnapshotsForRun(run.runId);
    const ids = new Set(snaps.map((s) => s.userId));
    assert.ok(ids.has('marcus_webb') && ids.has('logistics_mentor'), 'both eligible users should be snapshotted');
    // Snapshot carries matching inputs, not free text.
    assert.ok(Array.isArray(snaps[0].offers) && Array.isArray(snaps[0].availability));
    assert.equal(snaps[0].bio, undefined, 'snapshot should not carry free-text bio');
  } finally {
    cleanup();
  }
});
