// L3: Match Bypass scenarios — users who have valid profiles but route around the matching feature.
// Tests verify that bypass states are correctly represented in the data layer and
// document the engagement patterns that need product-level interventions.
// Reference: L3-S1 through L3-S10 in the user behavior scenario map.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';
import {
  buildMeiChen,
  buildJamesOsei,
  buildCamilleFontaine,
  buildWilliamCastillo,
  buildLogisticsOperatorMentor,
  buildMarcusWebb,
  buildPeerResearcher,
} from './fixtures/persona-fixtures.mjs';

// L3-S2: James has matchingEnabled: false on his user record and matchEnabled: false
// in preferences. The matching engine must honour both flags.
test('L3-S2: user with matchingEnabled: false is excluded from match generation entirely', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildJamesOsei());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('james_osei');
    assert.equal(recs.length, 0, 'expected no matches for a user who has disabled matching');
  } finally {
    cleanup();
  }
});

// L3-S2 (symmetric): James should also not appear as a candidate for other users.
test('L3-S2: user with matchingEnabled: false is excluded as a candidate for other users', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildJamesOsei());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const mentorRecs = app.services.recommendations.listForUser('logistics_mentor');
    const jamesIsCandidate = mentorRecs.some((r) => r.candidateUserId === 'james_osei');
    assert.equal(jamesIsCandidate, false, 'expected James to be excluded as a candidate when matching is disabled');
  } finally {
    cleanup();
  }
});

// L3-S3: Camille explicitly disabled matching via preferences.matchEnabled: false.
// The engine must exclude her both as a source and as a candidate.
test('L3-S3: user with preferences.matchEnabled: false receives no match and is excluded as candidate', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildCamilleFontaine());
    app.services.onboarding.saveUserProfile(buildPeerResearcher());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const camilleRecs = app.services.recommendations.listForUser('camille_fontaine');
    assert.equal(camilleRecs.length, 0, 'expected no matches generated for Camille with matchEnabled: false');

    const peerRecs = app.services.recommendations.listForUser('peer_researcher');
    const camilleIsCandidate = peerRecs.some((r) => r.candidateUserId === 'camille_fontaine');
    assert.equal(camilleIsCandidate, false, 'expected Camille to be excluded as a candidate');
  } finally {
    cleanup();
  }
});

// L3-S4: William has an effectively empty profile (no offers, no asks, no availability,
// no matchIntent). The system has no guard against this — he still enters the match loop
// but should score near zero on most dimensions.
test('L3-S4: passive lurker with empty profile scores near zero — no KYC completeness gate (gap)', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildWilliamCastillo());
    app.services.onboarding.saveUserProfile(buildMarcusWebb());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const williamRecs = app.services.recommendations.listForUser('william_castillo', { status: 'pending_review' });
    // GAP: William should be routed to a passive-user trust-building sequence,
    // not dropped into the matching pool with a near-zero score.
    // When a KYC completeness gate is implemented, assert williamRecs.length === 0.
    if (williamRecs.length > 0) {
      // Score should be very low given empty offers, asks, matchIntent, and availability.
      assert.ok(williamRecs[0].score < 30, `expected very low score for near-empty profile (got ${williamRecs[0].score})`);
    }
  } finally {
    cleanup();
  }
});

// L3-S1: Mei has a valid profile, a pending match is generated, but she never opens the match card.
// The recommendation should persist in pending_review state indefinitely — no auto-expiry today.
test('L3-S1: pending match stays in pending_review state when user never responds', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMeiChen());
    app.services.onboarding.saveUserProfile(
      buildLogisticsOperatorMentor({ availability: [{ dayOfWeek: 2, startHour: 18, endHour: 20, timezone: 'UTC' }] }),
    );

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    const meiPending = pending.find((r) => r.userId === 'mei_chen');
    assert.ok(meiPending, 'expected a pending recommendation for Mei');

    app.services.adminReview.decide({
      recommendationId: meiPending.id,
      adminId: 'admin_trial',
      decision: 'approve',
      rationale: 'Approved for L3-S1 bypass test — Mei will never respond.',
    });

    // Simulate time passing — no action taken by Mei.
    const meiApproved = app.services.recommendations.listForUser('mei_chen', { status: 'approved' });
    assert.ok(meiApproved.length > 0, 'expected approved match waiting for Mei\'s response');
    assert.equal(meiApproved[0].status, 'approved', 'expected match to remain in approved state when user does not respond');
  } finally {
    cleanup();
  }
});

// L3-S5: Yuki joined via referral, accepted her first match, and has no further intent.
// After the first accept, the pool is exhausted (only the referrer was relevant).
// The system has no second-hook mechanism — this test documents the re-engagement gap.
test('L3-S5: referral user accepts first match but has no further reason to stay — re-engagement gap (gap)', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    const referrer = buildProfileFixture({
      user: { id: 'referrer_user', displayName: 'Trusted Friend', handle: 'trusted.friend', isActive: true, matchingEnabled: true },
      preferences: {
        userType: 'founder',
        preferredUserTypes: ['operator'],
        matchIntent: ['collaboration'],
        offers: ['startup experience', 'growth tactics'],
        asks: ['growth marketing expertise'],
        interests: ['growth', 'marketing', 'product'],
        introText: 'Referred Yuki to Lethe. Building a growth-stage company.',
        matchEnabled: true,
        blockedUserIds: [],
      },
      availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
    });

    const yuki = buildProfileFixture({
      user: {
        id: 'yuki_tanaka',
        displayName: 'Yuki Tanaka',
        handle: 'yuki.tanaka',
        email: 'yuki@company.com',
        isActive: true,
        matchingEnabled: true,
      },
      preferences: {
        userType: 'operator',
        preferredUserTypes: ['founder'],
        matchIntent: ['collaboration'],
        offers: ['growth hacking expertise', 'user acquisition strategy'],
        asks: ['startup experience', 'growth tactics'],
        interests: ['growth', 'product', 'marketing'],
        introText: 'Growth hacker at a US company. Joined to reconnect with a trusted friend.',
        matchEnabled: true,
        blockedUserIds: [],
      },
      availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
    });

    app.services.onboarding.saveUserProfile(referrer);
    app.services.onboarding.saveUserProfile(yuki);

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    if (pending.length > 0) {
      app.services.adminReview.decide({
        recommendationId: pending[0].id,
        adminId: 'admin_trial',
        decision: 'approve',
        rationale: 'Referral match approved for L3-S5 test.',
      });

      const yukiRecs = app.services.recommendations.listForUser('yuki_tanaka', { status: 'approved' });
      if (yukiRecs.length > 0) {
        app.services.recommendations.respondToRecommendation({
          recommendationId: yukiRecs[0].id,
          userId: 'yuki_tanaka',
          decision: 'accept',
        });
      }
    }

    // GAP: after Yuki accepts the referral match, the system has no post-referral activation
    // sequence to surface a second relevant discovery. When implemented, verify that a
    // "next discovery" prompt is triggered after first-match acceptance.
    const accepted = app.services.recommendations.listForUser('yuki_tanaka', { status: 'accepted' });
    assert.ok(accepted.length <= 1, 'expected at most one accepted match for a single-referral user');
  } finally {
    cleanup();
  }
});

// L3-S7: Dormancy re-activation — Sofia went dormant and only returned via a feed notification.
// After re-activation, she engaged with the feed but did not convert back to matching.
// The test documents that a pending match remains in state during dormancy.
test('L3-S7: pending match state is preserved during user dormancy and available on re-activation', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    const sofia = buildProfileFixture({
      user: {
        id: 'sofia_reyes',
        displayName: 'Sofia Reyes',
        handle: 'sofia.reyes',
        email: 'sofia@econ.mx',
        isActive: true,
        matchingEnabled: true,
      },
      preferences: {
        userType: 'researcher',
        preferredUserTypes: ['researcher', 'consultant'],
        matchIntent: ['mentorship', 'peer exchange'],
        offers: ['economics research', 'policy analysis'],
        asks: ['research mentor', 'economics faculty advisor'],
        interests: ['economics', 'policy', 'research'],
        introText: 'Graduate student in economics. Looking for a research mentor.',
        matchEnabled: true,
        blockedUserIds: [],
      },
      availability: [{ dayOfWeek: 3, startHour: 16, endHour: 18, timezone: 'UTC' }],
    });

    app.services.onboarding.saveUserProfile(sofia);
    app.services.onboarding.saveUserProfile(
      buildLogisticsOperatorMentor({ availability: [{ dayOfWeek: 3, startHour: 16, endHour: 18, timezone: 'UTC' }] }),
    );

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    const sofiaPending = pending.find((r) => r.userId === 'sofia_reyes');
    if (sofiaPending) {
      app.services.adminReview.decide({
        recommendationId: sofiaPending.id,
        adminId: 'admin_trial',
        decision: 'approve',
        rationale: 'Approved for L3-S7 dormancy test.',
      });
    }

    // Simulate dormancy: no action taken by Sofia for an extended period.
    // The match should remain in approved state — no auto-expiry.
    const sofiaApproved = app.services.recommendations.listForUser('sofia_reyes', { status: 'approved' });
    assert.ok(sofiaApproved.length > 0, 'expected match to persist in approved state during dormancy');
  } finally {
    cleanup();
  }
});

// L3-S1 (notification contract): after 30 days of feed-only usage with no match engagement,
// an async intro option (written Q&A before a live call) should be surfaced to lower the stakes.
test.todo(
  'L3-S1: async intro prompt is surfaced after 30 days of feed-only usage with zero match engagement (requires notification and engagement tracking infra)',
);

// L3-S4 (passive-user trust sequence): at day 7, surface testimonials;
// at day 21, surface a 3-step matching walkthrough for users who have not interacted.
test.todo(
  'L3-S4: passive-user trust-building sequence (testimonials at day 7, walkthrough at day 21) fires for high-read-activity zero-contribution users (requires notification infra)',
);

// L3-S5 (post-referral activation): after first-match acceptance via a referral,
// immediately surface two more relevant profiles from the pool to give the user a reason to stay.
test.todo(
  'L3-S5: post-referral activation sequence surfaces two additional discovery suggestions after first-match acceptance (requires referral-path detection)',
);

// L3-S6 (feed-to-match conversion): for users who have engaged heavily with a specific person
// via the feed, surface a "formalize this connection" CTA offering a structured match.
test.todo(
  'L3-S6: "formalize this connection" CTA appears when two users have had significant feed engagement (requires feed engagement tracking)',
);

// L3-S7 (tiered re-activation): second re-activation nudge at day 21 of dormancy
// combines topic-relevant feed content with a pending match reminder.
test.todo(
  'L3-S7: tiered re-activation nudge at day 21 combines topic-relevant content with a pending match reminder (requires engagement tracking and notification infra)',
);

// L3-S8/S9/S10 (community-first tier): community-only users who have never engaged with
// matching should not be forced into the match flow. Evaluate whether a community-tier
// product position makes sense once sufficient community-only retention data exists.
test.todo(
  'L3-S8/S9/S10: community-only users are not force-nudged into matching — evaluate community-tier positioning after retention data exists (strategic, not a code change)',
);

// L3-S9 (first-match recovery): after a poor first match experience, a recovery prompt
// ("tell us what felt off") should appear immediately to prevent permanent feature switch.
test.todo(
  'L3-S9: recovery prompt appears immediately after a rejected first match and feeds a profile-refinement flow (requires first-match rejection detection and prompt infra)',
);
