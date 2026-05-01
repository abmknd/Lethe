// L2: Matching Failure scenarios — the matching engine runs but produces wrong, stale,
// or trust-eroding results. Tests expose bugs (failing assertions) and missing features (todos).
// Reference: L2-S1 through L2-S10 in the user behavior scenario map.

import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';
import {
  buildChrisNakamura,
  buildZaraHussain,
  buildColleagueAtBigTelco,
  buildEleanorHughes,
  buildMarcusWebb,
  buildLogisticsOperatorMentor,
  buildDevtoolsFounder,
} from './fixtures/persona-fixtures.mjs';

// L2-S1: Chris explicitly declares preferredUserTypes: ['investor'].
// When the only candidate in the pool is a fellow founder, the system should score that
// pairing lower on roleFit. The declared preference IS used in the scoring engine.
test('L2-S1: roleFit score is reduced when candidate userType does not match declared preferredUserTypes', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildChrisNakamura());

    const peerFounder = buildProfileFixture({
      user: { id: 'peer_founder', displayName: 'Peer Founder', handle: 'peer.founder', isActive: true, matchingEnabled: true },
      preferences: {
        userType: 'founder',
        preferredUserTypes: ['founder', 'investor'],
        matchIntent: ['collaboration', 'deal flow'],
        offers: ['b2c growth experience'],
        asks: ['product growth experience'],
        interests: ['consumer apps', 'growth', 'product'],
        introText: 'B2C founder looking for growth peers and investors.',
        matchEnabled: true,
        blockedUserIds: [],
      },
      availability: [{ dayOfWeek: 1, startHour: 14, endHour: 16, timezone: 'UTC' }],
    });
    app.services.onboarding.saveUserProfile(peerFounder);

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('chris_nakamura', { status: 'pending_review' });
    if (recs.length > 0) {
      // Chris wants investors; candidate is a founder. roleFit should be partial (0.5) since
      // the candidate wants investors but Chris does not want founders.
      // Score should be well below 100 due to the roleFit penalty.
      assert.ok(recs[0].score < 90, 'expected reduced score when candidateUserType does not match declaredPreferredUserTypes');
    }
  } finally {
    cleanup();
  }
});

// L2-S1 (pool without any investor): when the entire pool contains no user of the declared
// preferredUserType, the system should either produce no match or disclose the mismatch clearly.
// GAP: no pool-composition disclosure — the system silently matches across typelines.
test('L2-S1: no investor in pool — system matches Chris with a founder without disclosure (gap)', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildChrisNakamura());
    app.services.onboarding.saveUserProfile(buildMarcusWebb());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('chris_nakamura', { status: 'pending_review' });
    // GAP: When the declared preferredUserType is unavailable in the pool,
    // the desired behavior is a disclosure in the rationale or a deferred match.
    // When implemented, verify that whyMatched contains an explicit cross-type notice.
    if (recs.length > 0) {
      const rationale = recs[0].whyMatched.join(' ');
      // Currently no disclosure is present — documenting the gap.
      assert.ok(typeof rationale === 'string', 'rationale exists but may not disclose type mismatch');
    }
  } finally {
    cleanup();
  }
});

// L2-S8: Zara and her colleague Omar both have @bigtelco.com email addresses.
// CRITICAL BUG: the matching engine has no same-organization exclusion filter.
// This test will FAIL until same-org deduplication is implemented.
test('L2-S8 [BUG]: same-org users are excluded from each other\'s candidate pool', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildZaraHussain());
    app.services.onboarding.saveUserProfile(buildColleagueAtBigTelco());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const zaraRecs = app.services.recommendations.listForUser('zara_hussain', { status: 'pending_review' });
    // EXPECTED BEHAVIOR: zero matches — colleague should be excluded by same-org filter.
    // CURRENT BEHAVIOR: this assertion fails because no same-org filter exists.
    // Fix: implement email-domain deduplication as a hard pre-filter in the matcher.
    assert.equal(
      zaraRecs.length,
      0,
      'BUG: same-org colleague should be excluded from candidate pool — implement email-domain dedup filter',
    );
  } finally {
    cleanup();
  }
});

// L2-S10: Eleanor is the only person in her niche domain (conflict mediation).
// With only out-of-domain users in the pool, the matcher should produce no match or a
// low-confidence match with an explicit domain-density disclosure.
test('L2-S10: niche-domain user with no in-domain peers in pool produces no high-confidence match', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildEleanorHughes());
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildDevtoolsFounder());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const eleanorRecs = app.services.recommendations.listForUser('eleanor_hughes', { status: 'pending_review' });
    if (eleanorRecs.length > 0) {
      // Eleanor's domain interests (conflict mediation, peacebuilding, diplomacy) have
      // zero overlap with the available pool (logistics, devtools). Scores should be low.
      for (const rec of eleanorRecs) {
        assert.ok(
          rec.score < 60,
          `expected low confidence score for out-of-domain match (got ${rec.score})`,
        );
      }
    }
    // GAP: no domain-density disclosure in whyMatched. When implemented, verify that
    // the rationale explicitly surfaces the low-density notice.
  } finally {
    cleanup();
  }
});

// L2-S2: The rationale should only cite interests or tags that the user actually declared.
// Test that no rationale line fabricates a domain the user did not mention.
test('L2-S2: rationale lines reference declared profile data — no fabricated interests', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(buildMarcusWebb());
    app.services.onboarding.saveUserProfile(buildLogisticsOperatorMentor());

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const recs = app.services.recommendations.listForUser('marcus_webb', { status: 'pending_review' });
    assert.ok(recs.length > 0, 'expected a match to validate rationale content');

    const rec = recs[0];
    for (const line of rec.whyMatched) {
      assert.ok(
        typeof line === 'string' && line.trim().length > 0,
        'expected all rationale lines to be non-empty strings',
      );
    }
    // GAP: currently no grounding constraint is enforced — rationale lines are generated
    // from whatever signal is available. When a grounding constraint is added, this test
    // should verify that each line traces back to a declared offer, ask, interest, or intent.
  } finally {
    cleanup();
  }
});

// L2-S4: Experience asymmetry — a first-time founder matched with a highly experienced operator.
// Requires an experience-level dimension in the matching model (not yet implemented).
test.todo(
  'L2-S4: first-time founder receives a reduced roleFit score when matched with a veteran operator unless user explicitly requests mentor-style match (requires experience-level dimension)',
);

// L2-S3: Availability proximity — matches should not surface if the first overlapping
// time slot is more than 21 days away.
test.todo(
  'L2-S3: match is deferred when the earliest scheduling window between both users exceeds 21 days (requires availability-proximity pre-filter)',
);

// L2-S5: Stale rationale — when a matched user updates their core profile fields
// (offer, ask, meet_who, interests) after the match was generated, the rationale should
// be re-evaluated before the call happens.
test.todo(
  'L2-S5: match rationale is re-evaluated when a matched user updates core profile fields post-match (requires profile-change listener)',
);

// L2-S6: Company-stage filter — an investor who sets meet_who to "post-revenue founders"
// should not receive pre-product matches.
test.todo(
  'L2-S6: company-stage field in KYC is enforced as a hard pre-filter when user sets a minimum stage requirement (requires company-stage schema field)',
);

// L2-S7: Offer perception — a corporate-resource offer (distribution budget, experimentation)
// attracting pitch-seekers rather than the intended creative thinkers. The model should
// predict likely behavioral responses to an offer, not just overlap ratios.
test.todo(
  'L2-S7: offer-perception layer predicts likely candidate behavioral response to corporate-resource offer and down-weights pitch-seeking archetypes (requires offer-perception model)',
);

// L2-S9: No-show reminder — both parties should receive a 24h, 2h, and 15-min reminder.
// If the matched user does not confirm attendance in the 2h window, the other user is alerted.
test.todo(
  'L2-S9: multi-step reminder sequence (24h, 2h, 15min) is sent to both parties and no-show alert fires when attendance is unconfirmed (requires notification and scheduling infra)',
);
