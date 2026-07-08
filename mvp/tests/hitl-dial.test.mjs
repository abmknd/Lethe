// Graduated HITL review dial (alignment plan, Phase 1). Verifies the policy
// gates and that the dial ships parked at 0 (no auto-approval, no behavior
// change) until an admin raises it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import {
  decideReviewRouting,
  normalizeHitlConfig,
  hashBucket,
  computeWeightedAcceptance,
  REVIEW_ROUTES,
  ROUTING_REASONS,
  ALLOWED_AUTO_APPROVE_RATES,
} from '../domain/hitl-policy.mjs';
import { buildMarcusWebb, buildLogisticsOperatorMentor } from './fixtures/persona-fixtures.mjs';

// ── pure policy ────────────────────────────────────────────────────────────

test('dial parked at 0 always routes to manual', () => {
  const d = decideReviewRouting({ config: { autoApproveRate: 0 }, resolvedCount: 9999, pairKey: 'ua|ub' });
  assert.equal(d.route, REVIEW_ROUTES.MANUAL);
  assert.equal(d.reason, ROUTING_REASONS.DIAL_PARKED);
});

test('below the minimum sample floor routes to manual even with the dial up', () => {
  const d = decideReviewRouting({
    config: { autoApproveRate: 50, minSampleFloor: 100, whiteGloveFirstMatch: false },
    resolvedCount: 5,
    pairKey: 'ua|ub',
  });
  assert.equal(d.route, REVIEW_ROUTES.MANUAL);
  assert.equal(d.reason, ROUTING_REASONS.BELOW_FLOOR);
});

test('white-glove forces a first match to manual regardless of the dial', () => {
  const d = decideReviewRouting({
    config: { autoApproveRate: 50, minSampleFloor: 0, whiteGloveFirstMatch: true },
    resolvedCount: 999,
    isFirstMatchForEitherUser: true,
    pairKey: 'ua|ub',
  });
  assert.equal(d.route, REVIEW_ROUTES.MANUAL);
  assert.equal(d.reason, ROUTING_REASONS.WHITE_GLOVE);
});

test('above floor + not first match: bucket under the rate auto-approves, at/over stays manual', () => {
  const base = { minSampleFloor: 0, whiteGloveFirstMatch: false };
  // ua|ub hashes to bucket 14.
  assert.equal(hashBucket('ua|ub'), 14);
  const auto = decideReviewRouting({ config: { ...base, autoApproveRate: 25 }, resolvedCount: 50, pairKey: 'ua|ub' });
  assert.equal(auto.route, REVIEW_ROUTES.AUTO);
  assert.equal(auto.reason, ROUTING_REASONS.AUTO_BY_DIAL);

  const manual = decideReviewRouting({ config: { ...base, autoApproveRate: 10 }, resolvedCount: 50, pairKey: 'ua|ub' });
  assert.equal(manual.route, REVIEW_ROUTES.MANUAL);
  assert.equal(manual.reason, ROUTING_REASONS.OUTSIDE_SHARE);
});

test('normalizeHitlConfig snaps invalid rates to 0 and keeps allowed ones', () => {
  assert.equal(normalizeHitlConfig({ autoApproveRate: 33 }).autoApproveRate, 0);
  assert.equal(normalizeHitlConfig({ autoApproveRate: 90 }).autoApproveRate, 0);
  for (const r of ALLOWED_AUTO_APPROVE_RATES) {
    assert.equal(normalizeHitlConfig({ autoApproveRate: r }).autoApproveRate, r);
  }
  assert.equal(normalizeHitlConfig({}).whiteGloveFirstMatch, true);
});

test('weighted acceptance weights verified, tenured accounts more heavily', () => {
  // One verified+tenured acceptance vs one unverified brand-new decline.
  const { weightedAcceptance } = computeWeightedAcceptance([
    { accepted: true, verificationTier: 'work_email_verified', tenureDays: 365 },
    { accepted: false, verificationTier: 'unverified', tenureDays: 0 },
  ]);
  // work_email(1.5)*tenure(1.5)=2.25 accepted vs unverified(0.5)*1=0.5 total 2.75.
  assert.ok(weightedAcceptance > 0.8, `expected heavy weighting toward the verified accept, got ${weightedAcceptance}`);
});

// ── integration: wiring through the matching cycle ───────────────────────────

function seedPair(app, srcId = 'marcus_webb', candId = 'logistics_mentor') {
  const src = buildMarcusWebb();
  src.user.id = srcId;
  const cand = buildLogisticsOperatorMentor();
  cand.user.id = candId;
  app.services.onboarding.saveUserProfile(src);
  app.services.onboarding.saveUserProfile(cand);
}

test('parked at 0 (default): matching auto-approves nothing', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    seedPair(app);
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('marcus_webb');
    assert.ok(recs.length > 0);
    assert.ok(recs.every((r) => r.status === 'pending_review'), 'all recs should be pending_review while parked');
    for (const r of recs) {
      assert.equal(app.services.matchLifecycle.getMatchByRecommendationId(r.id), null, 'no blind offer while parked');
    }
    const events = app.services.recommendations.listEvents({ limit: 200 });
    assert.ok(!events.some((e) => e.eventType === 'hitl_auto_approved'), 'no auto-approve events while parked');
  } finally {
    cleanup();
  }
});

test('dial up + white-glove off: an under-rate pair auto-approves and opens a blind offer', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    seedPair(app, 'ua', 'ub'); // pairKey ua|ub → bucket 14
    app.services.hitl.setConfig({ autoApproveRate: 25, minSampleFloor: 0, whiteGloveFirstMatch: false, adminId: 'admin_system' });

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('ua');
    assert.ok(recs.length > 0, 'expected a recommendation for the pair');
    assert.ok(recs.every((r) => r.status === 'approved'), 'under-rate pair should be auto-approved');

    const match = app.services.matchLifecycle.getMatchByRecommendationId(recs[0].id);
    assert.ok(match, 'auto-approval should open a blind offer');
    assert.equal(match.state, 'offered_blind');

    const events = app.services.recommendations.listEvents({ limit: 200 });
    assert.ok(events.some((e) => e.eventType === 'hitl_auto_approved'), 'expected a hitl_auto_approved event');
  } finally {
    cleanup();
  }
});

test('white-glove on keeps a first match manual even with the dial up', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    seedPair(app, 'ua', 'ub');
    app.services.hitl.setConfig({ autoApproveRate: 25, minSampleFloor: 0, whiteGloveFirstMatch: true, adminId: 'admin_system' });

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('ua');
    assert.ok(recs.every((r) => r.status === 'pending_review'), 'first match should stay manual under white-glove');
  } finally {
    cleanup();
  }
});

test('below the sample floor keeps everything manual with the dial up', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    seedPair(app, 'ua', 'ub');
    app.services.hitl.setConfig({ autoApproveRate: 25, minSampleFloor: 9999, whiteGloveFirstMatch: false, adminId: 'admin_system' });

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('ua');
    assert.ok(recs.every((r) => r.status === 'pending_review'), 'below floor should stay manual');
  } finally {
    cleanup();
  }
});

test('config set persists and emits a change event', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    assert.equal(app.services.hitl.getConfig().autoApproveRate, 0, 'defaults to parked');
    app.services.hitl.setConfig({ autoApproveRate: 50, adminId: 'admin_system' });
    assert.equal(app.services.hitl.getConfig().autoApproveRate, 50);

    const events = app.services.recommendations.listEvents({ eventType: 'hitl_config_changed', limit: 10 });
    assert.ok(events.length >= 1, 'expected a hitl_config_changed event');
  } finally {
    cleanup();
  }
});
