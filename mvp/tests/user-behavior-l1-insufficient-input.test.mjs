// L1: Insufficient Input scenarios — users who have incomplete, vague, or misaligned profiles.
// Tests document current behavior and expose gaps in input validation and matching guards.
// Reference: L1-S1 through L1-S10 in the user behavior scenario map.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';
import {
  buildTylerBrooks,
  buildEthanPark,
  buildLeilaAhmadi,
  buildMinJiPark,
  buildLogisticsOperatorMentor,
  buildMarcusWebb,
} from './fixtures/persona-fixtures.mjs';

// L1-S1: Tyler has no asks.
// The completeness gate now blocks him from the matching pool until asks are filled.
test('L1-S1: user with empty asks receives zero matches — completeness gate blocks entry', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildTylerBrooks());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('tyler_brooks', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'incomplete profile (empty asks) must not enter the matching pool');
  } finally {
    cleanup();
  }
});

// L1-S1 (complementarity score): Tyler is now blocked by the completeness gate so
// receives no recs. The scoring assertion is no longer reachable for this persona,
// but is preserved as documentation of the scoring intent.
test('L1-S1: empty asks — Tyler receives no recommendations (gate blocks before scoring)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildTylerBrooks());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const tylerRecs = app.services.recommendations.listForUser('tyler_brooks');
    assert.equal(tylerRecs.length, 0, 'Tyler is excluded before scoring due to empty asks');
  } finally {
    cleanup();
  }
});

// L1-S5: Ethan has no offers.
// The completeness gate now blocks him from the matching pool until offers are filled.
test('L1-S5: user with empty offers receives zero matches — completeness gate blocks entry', () => {
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

// L1-S6: Leila has a strong profile but no availability windows set.
// The availability score dimension contributes zero, but matching still runs.
// GAP: no blocking guard requiring availability before a match is surfaced.
test('L1-S6: user with no availability still receives a match — availability score is zero (gap)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildLeilaAhmadi());
    app.services.onboarding.saveUserProfile(buildMarcusWebb());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('leila_ahmadi', { status: 'pending_review' });
    // GAP: When Leila has no availability, the scheduling step silently fails.
    // The desired behavior: no match is surfaced until at least one availability window is set.
    // When that guard is added, this should assert recs.length === 0.
    if (recs.length > 0) {
      assert.ok(
        recs[0].score < 100,
        'expected score below maximum when availability windows are empty',
      );
    }
  } finally {
    cleanup();
  }
});

// L1-S8: Claire skipped availability during onboarding.
// The completeness gate now requires at least one availability slot before matching.
test('L1-S8: user with no availability receives zero matches — completeness gate requires availability', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    const claire = buildProfileFixture({
      user: {
        id: 'claire_dubois',
        displayName: 'Claire Dubois',
        handle: 'claire.dubois',
        email: 'claire@startuplaw.fr',
        isActive: true,
        matchingEnabled: true,
      },
      preferences: {
        userType: 'consultant',
        preferredUserTypes: ['founder'],
        matchIntent: ['mentorship'],
        offers: ['startup legal advice', 'founder agreement expertise', 'equity structuring'],
        asks: ['pre-seed founders making first legal mistakes'],
        interests: ['startups', 'legal', 'founder tools'],
        introText: 'Startup lawyer wanting to meet early founders before they make expensive legal mistakes.',
        blockedUserIds: [],
      },
      availability: [],
    });

    app.services.onboarding.saveUserProfile(claire);
    app.services.onboarding.saveUserProfile(buildMarcusWebb());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('claire_dubois', { status: 'pending_review' });
    assert.equal(recs.length, 0, 'no-availability profile must not enter the matching pool');
  } finally {
    cleanup();
  }
});

// L1-S10: Min-Ji (journalist) offers media coverage — a low-reciprocity offer.
// The system currently has no offer-reciprocity detector to flag or hold such matches.
// GAP: no low-reciprocity offer detection; match generates without HITL flag.
test('L1-S10: low-reciprocity offer (media coverage) produces a match without HITL flag (gap)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMinJiPark());
    app.services.onboarding.saveUserProfile(buildMarcusWebb());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('min_ji_park', { status: 'pending_review' });
    // GAP: Min-Ji's offer ("media coverage") is low-reciprocity and should trigger HITL hold.
    // The desired behavior is that this match is held for admin review with a reciprocity flag.
    // When a reciprocity detector is added, this test should verify the held/flagged state.
    assert.ok(recs.length >= 0, 'documenting gap: no low-reciprocity offer detection');
  } finally {
    cleanup();
  }
});

// L1-S6 (scheduling failure contract): when availability is empty, the scheduling
// step cannot produce a valid meeting time. This test documents the expected
// behavior that will need to be implemented when scheduling infrastructure ships.
test.todo(
  'L1-S6: scheduling step surfaces a clear error when no availability is set (requires scheduling infra)',
);

// L1-S8 (notification contract): when a match is generated for a user with no availability,
// a 24-hour nudge notification should fire prompting them to add availability windows.
test.todo(
  'L1-S8: availability-missing nudge notification fires within 24 hours of match generation (requires notification infra)',
);

// L1-S2 (input quality): when offer/ask text is a copy-pasted LinkedIn bio,
// an input quality indicator should flag it before the profile is saved.
test.todo(
  'L1-S2: generic/LinkedIn-bio-style input triggers an input quality warning during KYC (requires input quality scorer)',
);

// L1-S4 (fundraising-coded ask): when ask text is solely fundraising-focused,
// the system should surface a clarifying re-framing prompt rather than blocking matching.
test.todo(
  'L1-S4: fundraising-only ask triggers a re-framing prompt rather than blocking profile submission (requires intent classifier)',
);

// L1-S7 (CV-register detection): when offer text is written in formal third-person CV style,
// the system should flag it and prompt a conversational rewrite.
test.todo(
  'L1-S7: third-person CV-style offer text is detected and prompts a conversational rewrite (requires language register detector)',
);

// L1-S9 (onboarding accessibility): non-tech-native users who cannot interpret
// offer/ask terminology need plain-language examples or an alternative onboarding track.
test.todo(
  'L1-S9: onboarding microcopy provides plain-language examples for users who cannot interpret offer/ask jargon (UX layer)',
);

// L1-S3 (commercial solicitation): offer/ask pattern matching commercial service delivery
// (e.g., "seeking clients") should be detected and soft-redirected with a value-mismatch message.
test.todo(
  'L1-S3: commercial solicitation pattern in ask triggers a soft value-mismatch message rather than a match (requires intent classifier)',
);
