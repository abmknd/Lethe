// Match lifecycle: the pair-level double-blind gate (alignment plan, Phase 0).
// Regression intent: the loopholes from the July 4 2026 hardening audit stay
// closed. A one-sided accept must never convert a pair or reveal identity,
// and a decline must terminate silently.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { MATCH_STATUSES } from '../domain/models.mjs';
import { TRUST_SIGNAL_TYPES, computeTrustScore } from '../domain/trust.mjs';
import { isValidMatchTransition, orderPair } from '../services/match-lifecycle-service.mjs';
import { buildMarcusWebb, buildLogisticsOperatorMentor } from './fixtures/persona-fixtures.mjs';

function setupApprovedPair(app) {
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
    rationale: 'Approved for match lifecycle test coverage.',
  });

  return rec;
}

test('admin approval opens a blind offer, not an intro', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const rec = setupApprovedPair(app);

    const match = app.services.matchLifecycle.getMatchByRecommendationId(rec.id);
    assert.ok(match, 'expected approval to create a match row');
    assert.equal(match.state, MATCH_STATUSES.OFFERED_BLIND);
    assert.equal(match.aResponse, null);
    assert.equal(match.bResponse, null);

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 50 });
    const eventTypes = new Set(events.map((e) => e.eventType));
    assert.ok(eventTypes.has('blind_offer_created'), 'expected blind_offer_created event');
    // The old flow sent intro emails and created a meeting at approval time.
    // Neither may exist while the match is blind.
    assert.ok(!eventTypes.has('intro_sent'), 'approval must not send an intro');
    assert.equal(app.repository.getMeetingByRecommendationId(rec.id), null, 'approval must not create a meeting');
  } finally {
    cleanup();
  }
});

test('a one-sided accept does not convert the pair', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const rec = setupApprovedPair(app);

    const result = app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });

    assert.equal(result.mutual, false);
    assert.equal(result.waitingOnOtherSide, true);
    assert.equal(result.matchState, MATCH_STATUSES.OFFERED_BLIND);

    const afterOneAccept = app.repository.getRecommendationById(rec.id);
    assert.equal(afterOneAccept.status, 'approved', 'a lone accept must leave the recommendation approved');

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 50 });
    const eventTypes = new Set(events.map((e) => e.eventType));
    assert.ok(eventTypes.has('blind_accept'));
    assert.ok(!eventTypes.has('mutual_accept'), 'no mutual_accept from one side');
    assert.ok(!eventTypes.has('identity_revealed'), 'no reveal from one side');
  } finally {
    cleanup();
  }
});

test('mutual blind accept converts the pair and unlocks reveal', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const rec = setupApprovedPair(app);

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });
    const second = app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'logistics_mentor',
      decision: 'accept',
    });

    assert.equal(second.mutual, true);
    assert.equal(second.matchState, MATCH_STATUSES.MUTUAL_ACCEPTED);
    assert.equal(app.repository.getRecommendationById(rec.id).status, 'accepted');

    const match = app.services.matchLifecycle.getMatchByRecommendationId(rec.id);
    const revealed = app.services.matchLifecycle.reveal({ matchId: match.id });
    assert.equal(revealed.state, MATCH_STATUSES.REVEALED);

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 50 });
    const eventTypes = new Set(events.map((e) => e.eventType));
    assert.ok(eventTypes.has('mutual_accept'));
    assert.ok(eventTypes.has('identity_revealed'));
  } finally {
    cleanup();
  }
});

test('a decline terminates silently and never reveals', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const rec = setupApprovedPair(app);

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });
    const declined = app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'logistics_mentor',
      decision: 'pass',
      declineReason: 'Not relevant to my current goals.',
    });

    assert.equal(declined.mutual, false);
    assert.equal(declined.matchState, MATCH_STATUSES.DECLINED_SILENT);
    assert.equal(app.repository.getRecommendationById(rec.id).status, 'passed');

    // Reveal must be impossible from a declined match.
    const match = app.services.matchLifecycle.getMatchByRecommendationId(rec.id);
    assert.throws(() => app.services.matchLifecycle.reveal({ matchId: match.id }), /Invalid match transition/);

    // The decline reason lands in the decliner's trust ledger, not anywhere
    // the other user can see.
    const signals = app.services.matchLifecycle.listTrustSignals('logistics_mentor');
    assert.equal(signals.length, 1);
    assert.equal(signals[0].signalType, TRUST_SIGNAL_TYPES.BLIND_DECLINE_REASON);
    assert.equal(signals[0].payload.reason, 'Not relevant to my current goals.');
    assert.equal(app.services.matchLifecycle.listTrustSignals('marcus_webb').length, 0);
  } finally {
    cleanup();
  }
});

test('repeating a response is idempotent; flipping it is an error', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const rec = setupApprovedPair(app);

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });
    const repeat = app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });
    assert.equal(repeat.waitingOnOtherSide, true);

    assert.throws(
      () => app.services.recommendations.respondToRecommendation({
        recommendationId: rec.id,
        userId: 'marcus_webb',
        decision: 'pass',
      }),
      /already responded/,
    );
  } finally {
    cleanup();
  }
});

test('transition map rejects skips and terminal-state exits', () => {
  assert.equal(isValidMatchTransition(MATCH_STATUSES.OFFERED_BLIND, MATCH_STATUSES.REVEALED), false);
  assert.equal(isValidMatchTransition(MATCH_STATUSES.MUTUAL_ACCEPTED, MATCH_STATUSES.REVEALED), true);
  assert.equal(isValidMatchTransition(MATCH_STATUSES.DECLINED_SILENT, MATCH_STATUSES.OFFERED_BLIND), false);
  assert.equal(isValidMatchTransition(MATCH_STATUSES.EXPIRED, MATCH_STATUSES.REVEALED), false);
  assert.equal(isValidMatchTransition(MATCH_STATUSES.REVEALED, MATCH_STATUSES.SCHEDULED), true);
});

test('pair ordering is stable and trust score stays clamped', () => {
  assert.deepEqual(orderPair('zoe', 'adam'), { userAId: 'adam', userBId: 'zoe' });
  assert.deepEqual(orderPair('adam', 'zoe'), { userAId: 'adam', userBId: 'zoe' });

  assert.equal(computeTrustScore([]), 50);
  assert.equal(computeTrustScore([{ weight: -100 }]), 0);
  assert.equal(computeTrustScore([{ weight: 100 }]), 100);
  assert.equal(computeTrustScore([{ weight: 3 }, { weight: -5 }]), 48);
});
