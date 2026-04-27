import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';
import { createDeterministicMatcher } from '../matching/deterministic-matcher.mjs';

function saveProfiles(app, profiles) {
  for (const profile of profiles) {
    app.services.onboarding.saveUserProfile(profile);
  }
}

function buildScenarioProfiles() {
  const source = buildProfileFixture({
    user: {
      id: 'user_src',
      displayName: 'Source User',
      handle: 'source.user',
      location: 'Montreal, Canada',
      timezone: 'UTC',
    },
    preferences: {
      localOnly: false,
      blockedUserIds: ['user_blocked'],
      asks: ['fundraising'],
      offers: ['design feedback'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
      introText: 'Source intro text for deterministic matching tests',
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const blocked = buildProfileFixture({
    user: { id: 'user_blocked', displayName: 'Blocked User', handle: 'blocked.user' },
    preferences: {
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
      blockedUserIds: [],
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const localMismatch = buildProfileFixture({
    user: {
      id: 'user_local_mismatch',
      displayName: 'Local Mismatch',
      handle: 'local.mismatch',
      location: 'Berlin, Germany',
      timezone: 'UTC',
    },
    preferences: {
      localOnly: true,
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const noOverlap = buildProfileFixture({
    user: { id: 'user_no_overlap', displayName: 'No Overlap', handle: 'no.overlap' },
    preferences: {
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
    },
    availability: [{ dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const priorPassed = buildProfileFixture({
    user: { id: 'user_prior_passed', displayName: 'Prior Passed', handle: 'prior.passed' },
    preferences: {
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const recentIntro = buildProfileFixture({
    user: { id: 'user_recent_intro', displayName: 'Recent Intro', handle: 'recent.intro' },
    preferences: {
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  const valid = buildProfileFixture({
    user: { id: 'user_valid', displayName: 'Valid Match', handle: 'valid.match' },
    preferences: {
      asks: ['design feedback'],
      offers: ['fundraising'],
      matchIntent: ['collaboration'],
      preferredUserTypes: ['founder'],
      interests: ['product'],
      introText: 'Valid candidate intro text with overlap',
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  });

  return { source, blocked, localMismatch, noOverlap, priorPassed, recentIntro, valid };
}

function createHistoricalRecommendation(app, { runId, sourceUserId, targetUserId, status, createdAt }) {
  app.repository.createRecommendationRun({
    id: runId,
    runType: 'weekly',
    status: 'completed',
    startedAt: createdAt,
  });

  app.db
    .prepare(
      `
      INSERT INTO recommendations (
        id, run_id, source_user_id, target_user_id, rank, score, why_matched, status, created_at, updated_at
      )
      VALUES (
        :id, :runId, :sourceUserId, :targetUserId, :rank, :score, :whyMatched, :status, :createdAt, :updatedAt
      )
    `,
    )
    .run({
      id: `rec_hist_${randomUUID()}`,
      runId,
      sourceUserId,
      targetUserId,
      rank: 1,
      score: 55,
      whyMatched: JSON.stringify(['historical test record']),
      status,
      createdAt,
      updatedAt: createdAt,
    });
}

test('deterministic matcher excludes blocked/local/no-overlap/history and keeps valid candidate', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });

  try {
    const profiles = buildScenarioProfiles();
    saveProfiles(app, Object.values(profiles));

    const recentIso = new Date().toISOString();
    createHistoricalRecommendation(app, {
      runId: `run_hist_${randomUUID()}`,
      sourceUserId: profiles.source.user.id,
      targetUserId: profiles.priorPassed.user.id,
      status: 'passed',
      createdAt: recentIso,
    });
    createHistoricalRecommendation(app, {
      runId: `run_hist_${randomUUID()}`,
      sourceUserId: profiles.source.user.id,
      targetUserId: profiles.recentIntro.user.id,
      status: 'approved',
      createdAt: recentIso,
    });

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 5 });
    const pendingRecommendations = app.services.recommendations.listForUser(profiles.source.user.id, {
      status: 'pending_review',
    });

    assert.equal(pendingRecommendations.length, 1);
    assert.equal(pendingRecommendations[0].candidateUserId, profiles.valid.user.id);
  } finally {
    cleanup();
  }
});

test('deterministic matcher enforces recommendation cap, rank ordering, and explanation shape', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const result = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    assert.ok(result.summary.recommendationsGenerated > 0);

    const users = app.services.onboarding.listUsers();
    for (const user of users) {
      const recommendations = app.services.recommendations.listForUser(user.id);
      assert.ok(recommendations.length <= 3, `expected <=3 recommendations for ${user.id}`);

      for (let i = 0; i < recommendations.length; i += 1) {
        const recommendation = recommendations[i];
        assert.equal(recommendation.rank, i + 1, 'expected contiguous ranks starting at 1');
        assert.ok(Array.isArray(recommendation.whyMatched), 'expected whyMatched array');
        assert.ok(recommendation.whyMatched.length > 0, 'expected non-empty whyMatched array');
        assert.ok(recommendation.whyMatched.every((line) => typeof line === 'string' && line.length > 0));

        if (i > 0) {
          assert.ok(
            recommendations[i - 1].score >= recommendation.score,
            'expected recommendations sorted by descending score',
          );
        }
      }
    }
  } finally {
    cleanup();
  }
});

test('admin review rejects invalid decision and short rationale', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 2 });
    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    assert.ok(pending.length > 0, 'expected pending recommendations');
    const recommendationId = pending[0].id;

    assert.throws(
      () =>
        app.services.adminReview.decide({
          recommendationId,
          adminId: 'admin_trial',
          decision: 'maybe',
          rationale: 'This should not pass validation.',
        }),
      /Decision must be either approve or reject\./,
    );

    assert.throws(
      () =>
        app.services.adminReview.decide({
          recommendationId,
          adminId: 'admin_trial',
          decision: 'approve',
          rationale: 'short',
        }),
      /Rationale is required and must be at least 10 characters\./,
    );
  } finally {
    cleanup();
  }
});

test('admin review accepts valid decision and persists decision + approved event', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 2 });
    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    assert.ok(pending.length > 0, 'expected pending recommendations');
    const recommendationId = pending[0].id;

    const decision = app.services.adminReview.decide({
      recommendationId,
      adminId: 'admin_trial',
      decision: 'approve',
      rationale: 'Strong ask-offer fit and clear shared intent for intro.',
    });

    assert.equal(decision.status, 'approved');

    const persistedRecommendation = app.repository.getRecommendationById(recommendationId);
    assert.equal(persistedRecommendation.status, 'approved');

    const adminDecision = app.repository.getAdminDecisionByRecommendationId(recommendationId);
    assert.ok(adminDecision, 'expected persisted admin decision');
    assert.equal(adminDecision.decision, 'approved');

    const events = app.services.recommendations.listEvents({
      recommendationId,
      eventType: 'admin_approved',
      limit: 20,
    });
    assert.ok(events.length > 0, 'expected admin_approved event');
  } finally {
    cleanup();
  }
});

test('admin review first-write-wins conflict and non-pending transition enforcement', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 2 });
    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    assert.ok(pending.length > 0, 'expected pending recommendations');
    const recommendationId = pending[0].id;

    app.services.adminReview.decide({
      recommendationId,
      adminId: 'admin_trial',
      decision: 'approve',
      rationale: 'First decision should persist and lock state transition.',
    });

    assert.throws(
      () =>
        app.services.adminReview.decide({
          recommendationId,
          adminId: 'admin_trial',
          decision: 'reject',
          rationale: 'Second decision should conflict and be rejected.',
        }),
      /Recommendation is no longer pending review\./,
    );

    const approvedQueue = app.services.adminReview.listQueue({ status: 'approved' });
    const approvedRecommendation = approvedQueue.find((item) => item.id === recommendationId);
    assert.ok(approvedRecommendation, 'expected recommendation to move to approved queue');
  } finally {
    cleanup();
  }
});

test('scoring weight vector produces expected output for a known input pair', () => {
  // Weights: complementarity 0.2, reciprocalComplementarity 0.1, roleFit 0.15,
  //          intent 0.2, interests 0.15, intro 0.1, availability 0.1 → total 1.0
  const matcher = createDeterministicMatcher({ topN: 5 });

  const source = {
    user: { id: 'score_src', isActive: true, matchingEnabled: true, location: 'Montreal, Canada', timezone: 'UTC' },
    preferences: {
      matchEnabled: true,
      blockedUserIds: [],
      localOnly: false,
      matchIntent: ['collaboration'],
      interests: ['product'],
      asks: ['fundraising advice'],
      offers: ['design feedback'],
      userType: 'designer',
      preferredUserTypes: ['founder'],
      introText: '',
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  };

  const candidate = {
    user: { id: 'score_cand', isActive: true, matchingEnabled: true, location: 'Toronto, Canada', timezone: 'UTC' },
    preferences: {
      matchEnabled: true,
      blockedUserIds: [],
      localOnly: false,
      matchIntent: ['collaboration'],
      interests: ['product'],
      asks: ['design feedback'],
      offers: ['fundraising advice', 'investor intros'],
      userType: 'founder',
      preferredUserTypes: ['designer', 'operator'],
      introText: '',
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  };

  const results = matcher.matchUsers([source, candidate]);
  const recommendations = results.get('score_src');

  assert.ok(recommendations && recommendations.length === 1, 'expected exactly one recommendation');

  const rec = recommendations[0];
  assert.equal(rec.candidateUserId, 'score_cand');

  // complementarityRatio: ['fundraising advice'] vs ['fundraising advice', 'investor intros'] = 1/2 = 0.5 → *0.2 = 0.10
  // reciprocalComplementarity: ['design feedback'] vs ['design feedback'] = 1/1 = 1.0 → *0.1 = 0.10
  // roleFitRatio: profile wants candidate type? 'founder' in ['founder'] YES.
  //               candidate wants profile type? 'designer' in ['designer','operator'] YES. → 1.0 → *0.15 = 0.15
  // intentRatio: ['collaboration'] vs ['collaboration'] = 1.0 → *0.2 = 0.20
  // interestRatio: ['product'] vs ['product'] = 1.0 → *0.15 = 0.15
  // introScore: both empty → 0 → *0.1 = 0
  // availabilityScore: 2h overlap → min(1, 2/3) ≈ 0.667 → *0.1 = 0.0667
  // base = 0.10 + 0.10 + 0.15 + 0.20 + 0.15 + 0 + 0.0667 = 0.7667 → score = round(76.67) = 77
  assert.equal(rec.score, 77, 'expected score 77 given the current weight vector');
});
