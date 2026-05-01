// L0: Happy Path scenarios — users with complete profiles, clear intent, and complementary matches.
// All tests in this file represent the end-to-end intro loop working as designed.
// Reference: L0-S1 through L0-S10 in the user behavior scenario map.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import {
  buildMarcusWebb,
  buildLogisticsOperatorMentor,
  buildClaraOsei,
  buildPeerResearcher,
  buildPriyaNair,
  buildDevtoolsFounder,
  buildDanielHartmann,
  buildPeerIndieHacker,
} from './fixtures/persona-fixtures.mjs';

function approveRecommendationForUser(app, userId) {
  const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
  const rec = pending.find((r) => r.userId === userId);
  assert.ok(rec, `expected a pending recommendation for user ${userId}`);
  app.services.adminReview.decide({
    recommendationId: rec.id,
    adminId: 'admin_trial',
    decision: 'approve',
    rationale: 'Strong ask-offer fit confirmed by reviewer for L0 happy path test.',
  });
  return rec;
}

// L0-S1: Marcus (Builder, logistics founder) is matched with a logistics operator mentor.
// Validates the full intro loop: match → rationale → admin approval → user accept → outcome → events.
test('L0-S1: complete Builder-to-Operator happy path — full intro loop end-to-end', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('marcus_webb', { status: 'pending_review' });
    assert.ok(recs.length > 0, 'expected Marcus to receive at least one match suggestion');

    const rec = recs[0];
    assert.equal(rec.candidateUserId, 'logistics_mentor', 'expected the logistics mentor as the top match');
    assert.ok(Array.isArray(rec.whyMatched) && rec.whyMatched.length > 0, 'expected non-empty rationale');
    assert.ok(rec.score > 0, 'expected positive match score');

    approveRecommendationForUser(app, 'marcus_webb');

    const approved = app.services.recommendations.listForUser('marcus_webb', { status: 'approved' });
    assert.ok(approved.length > 0, 'expected recommendation to move to approved state after admin decision');

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });

    const accepted = app.repository.getRecommendationById(rec.id);
    assert.equal(accepted.status, 'accepted');

    app.services.recommendations.updateFollowThrough({
      recommendationId: rec.id,
      actorUserId: 'admin_trial',
      status: 'intro_sent',
      notes: 'Intro email sent to both parties.',
    });

    app.services.recommendations.updateFollowThrough({
      recommendationId: rec.id,
      actorUserId: 'admin_trial',
      status: 'meeting_scheduled',
      notes: 'Call booked for next week.',
    });

    const finalState = app.repository.getRecommendationById(rec.id);
    assert.equal(finalState.status, 'accepted');

    const userView = app.services.recommendations.listForUser('marcus_webb');
    const row = userView.find((r) => r.id === rec.id);
    assert.equal(row.outcome.outcomeStatus, 'meeting_scheduled');

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 50 });
    const eventTypes = new Set(events.map((e) => e.eventType));
    assert.ok(eventTypes.has('recommendation_generated'), 'expected recommendation_generated event');
    assert.ok(eventTypes.has('admin_approved'), 'expected admin_approved event');
    assert.ok(eventTypes.has('user_accept'), 'expected user_accept event');
    assert.ok(eventTypes.has('intro_sent'), 'expected intro_sent event');
  } finally {
    cleanup();
  }
});

// L0-S2: Clara (Thinker, UX researcher) is matched with a peer researcher.
// Validates same-archetype peer matching on shared domain interest.
test('L0-S2: Thinker-to-Thinker peer match — shared domain generates strong rationale', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildClaraOsei());
    app.services.onboarding.saveUserProfile(buildPeerResearcher());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('clara_osei', { status: 'pending_review' });
    assert.ok(recs.length > 0, 'expected Clara to receive a peer researcher match');

    const rec = recs[0];
    assert.equal(rec.candidateUserId, 'peer_researcher');
    assert.ok(rec.whyMatched.length > 0, 'expected rationale explaining the peer match');
    assert.ok(rec.score > 0);
  } finally {
    cleanup();
  }
});

// L0-S4: Priya (Operator, angel investor) is matched with a devtools founder.
// Validates complementarity-driven investor-to-founder match.
test('L0-S4: Operator-to-Builder match — investor ask-offer complementarity', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildPriyaNair());
    app.services.onboarding.saveUserProfile(buildDevtoolsFounder());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const priyaRecs = app.services.recommendations.listForUser('priya_nair', { status: 'pending_review' });
    assert.ok(priyaRecs.length > 0, 'expected Priya to receive a founder match');
    assert.equal(priyaRecs[0].candidateUserId, 'devtools_founder');

    const founderRecs = app.services.recommendations.listForUser('devtools_founder', { status: 'pending_review' });
    assert.ok(founderRecs.length > 0, 'expected the founder to also receive a match with the investor');
  } finally {
    cleanup();
  }
});

// L0-S5: Daniel (Builder, indie hacker) is matched with a peer at the same stage.
// Validates symmetric peer-to-peer match with accountability intent.
test('L0-S5: symmetric Builder-to-Builder peer match — accountability intent', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildDanielHartmann());
    app.services.onboarding.saveUserProfile(buildPeerIndieHacker());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const danielRecs = app.services.recommendations.listForUser('daniel_hartmann', { status: 'pending_review' });
    assert.ok(danielRecs.length > 0, 'expected Daniel to receive a peer indie hacker match');
    assert.equal(danielRecs[0].candidateUserId, 'peer_indie_hacker');

    const miaRecs = app.services.recommendations.listForUser('peer_indie_hacker', { status: 'pending_review' });
    assert.ok(miaRecs.length > 0, 'expected symmetric match from the peer side');
  } finally {
    cleanup();
  }
});

// L0 (general): match rationale contains only non-empty string lines.
// Validates rationale shape contract across all archetypes.
test('L0 (general): rationale lines are non-empty strings for all generated matches', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });
  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const users = app.services.onboarding.listUsers();
    for (const user of users) {
      const recs = app.services.recommendations.listForUser(user.id);
      for (const rec of recs) {
        assert.ok(Array.isArray(rec.whyMatched), `expected whyMatched array for ${user.id}`);
        assert.ok(rec.whyMatched.length > 0, `expected non-empty whyMatched for ${user.id}`);
        assert.ok(
          rec.whyMatched.every((line) => typeof line === 'string' && line.trim().length > 0),
          `expected all rationale lines to be non-empty strings for ${user.id}`,
        );
      }
    }
  } finally {
    cleanup();
  }
});

// L0 (general): scores are positive and sorted in descending order.
// Validates the ranking contract for all generated recommendations.
test('L0 (general): match scores are positive and ranked in descending order', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });
  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 5 });

    const users = app.services.onboarding.listUsers();
    for (const user of users) {
      const recs = app.services.recommendations.listForUser(user.id);
      for (let i = 0; i < recs.length; i++) {
        assert.ok(recs[i].score > 0, `expected positive score for rec ${i} of ${user.id}`);
        if (i > 0) {
          assert.ok(
            recs[i - 1].score >= recs[i].score,
            `expected descending score order at position ${i} for ${user.id}`,
          );
        }
      }
    }
  } finally {
    cleanup();
  }
});

// L0 (general): user can pass a recommendation and the decision is persisted.
// Validates the pass path of the intro loop.
test('L0 (general): user can pass a recommendation — decision and event persisted', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const rec = approveRecommendationForUser(app, 'marcus_webb');

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'pass',
    });

    const persisted = app.repository.getRecommendationById(rec.id);
    assert.equal(persisted.status, 'passed');

    const events = app.services.recommendations.listEvents({ recommendationId: rec.id, limit: 20 });
    const eventTypes = new Set(events.map((e) => e.eventType));
    assert.ok(eventTypes.has('user_pass'), 'expected user_pass event after pass decision');
  } finally {
    cleanup();
  }
});

// L0-S3 (general): weekly report snapshot reflects accepted outcomes.
// Validates that the reporting layer captures real happy-path signal.
test('L0-S3: weekly report reflects accepted match outcomes and event counts', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const rec = approveRecommendationForUser(app, 'marcus_webb');

    app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: 'marcus_webb',
      decision: 'accept',
    });
    app.services.recommendations.updateFollowThrough({
      recommendationId: rec.id,
      actorUserId: 'admin_trial',
      status: 'intro_sent',
      notes: 'Intro sent for report snapshot test.',
    });

    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date(Date.now() + 1000).toISOString();
    const report = app.services.weeklyReport.generateSnapshot({ fromIso: from, toIso: to, windowDays: 30 });

    assert.ok(report.recommendations.generated > 0, 'expected generated recommendations in report');
    assert.ok(report.responses.accepted > 0, 'expected accepted responses in report');
    assert.ok(report.outcomes.intro_sent > 0, 'expected intro_sent outcome in report');
  } finally {
    cleanup();
  }
});
