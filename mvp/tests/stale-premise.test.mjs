// Phase 2, item 6 — stale-premise re-evaluation (L2-S5).
// When a user edits a core matching field after a match is past HITL review,
// the in-flight pair is re-scored: the rationale is refreshed, and a confidence
// drop routes the recommendation back to the HITL queue with a trust signal.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { MATCH_STATUSES } from '../domain/models.mjs';
import { TRUST_SIGNAL_TYPES } from '../domain/trust.mjs';
import { EVENT_TYPES } from '../domain/events.mjs';
import { buildMarcusWebb, buildLogisticsOperatorMentor } from './fixtures/persona-fixtures.mjs';

function setupInFlightMatch(app) {
  app.services.onboarding.saveUserProfile(buildMarcusWebb());
  app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());
  app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

  const recs = app.services.recommendations.listForUser('marcus_webb', { status: 'pending_review' });
  assert.ok(recs.length > 0, 'expected a pending recommendation');
  const rec = recs[0];

  app.services.adminReview.decide({
    recommendationId: rec.id,
    adminId: 'admin_system',
    decision: 'approve',
    rationale: 'Approved for stale-premise test.',
  });

  const match = app.services.matchLifecycle.getMatchByRecommendationId(rec.id);
  assert.equal(match.state, MATCH_STATUSES.OFFERED_BLIND, 'match should be in-flight (offered_blind)');
  return { rec, match };
}

// Re-save Marcus with edited preferences, preserving everything else so the
// only variable is the core-field change under test.
function editMarcus(app, preferenceOverrides) {
  const current = app.services.onboarding.getUserProfile('marcus_webb');
  app.services.onboarding.saveUserProfile({
    user: { ...current.user },
    preferences: { ...current.preferences, ...preferenceOverrides },
    availability: current.availability,
  });
}

test('core-field edit that breaks compatibility refreshes rationale and routes back to HITL', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const { rec } = setupInFlightMatch(app);
    const before = app.services.recommendations.getRecommendation(rec.id);
    assert.equal(before.status, 'approved');
    const originalWhy = JSON.stringify(before.whyMatched);

    // Marcus pivots: asks/offers/interests now share nothing with the mentor,
    // so the pair no longer clears the matcher's signal threshold.
    editMarcus(app, {
      asks: ['underwater basket weaving techniques'],
      offers: ['medieval lute restoration'],
      interests: ['numismatics', 'philately', 'topiary'],
    });

    const after = app.services.recommendations.getRecommendation(rec.id);

    // Rationale was re-evaluated and updated (L2-S5 core assertion).
    assert.notEqual(JSON.stringify(after.whyMatched), originalWhy, 'rationale should be refreshed');

    // Confidence dropped → routed back to the HITL review queue.
    assert.equal(after.status, 'pending_review', 'a confidence drop must route back to HITL');

    // Auditable trust signal + event recorded.
    const hitlFlags = app.services.matchLifecycle
      .listTrustSignals('marcus_webb')
      .filter((s) => s.signalType === TRUST_SIGNAL_TYPES.HITL_FLAG && s.payload?.reason === 'stale_premise');
    assert.ok(hitlFlags.length > 0, 'expected a stale_premise HITL trust signal');

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 50 });
    assert.ok(
      events.some((e) => e.eventType === EVENT_TYPES.STALE_PREMISE_REEVALUATED),
      'expected a stale_premise_reevaluated event',
    );
  } finally {
    cleanup();
  }
});

test('a non-core edit does not trigger re-evaluation', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const { rec } = setupInFlightMatch(app);
    const before = app.services.recommendations.getRecommendation(rec.id);

    // Change only non-core fields.
    editMarcus(app, { introText: 'A fresh introduction blurb that changes nothing about matching.', localOnly: false });

    const after = app.services.recommendations.getRecommendation(rec.id);
    assert.equal(after.status, before.status, 'non-core edit must not change recommendation status');
    assert.deepEqual(after.whyMatched, before.whyMatched, 'non-core edit must not rewrite rationale');

    const hitlFlags = app.services.matchLifecycle
      .listTrustSignals('marcus_webb')
      .filter((s) => s.signalType === TRUST_SIGNAL_TYPES.HITL_FLAG);
    assert.equal(hitlFlags.length, 0, 'non-core edit must not flag HITL');
  } finally {
    cleanup();
  }
});
