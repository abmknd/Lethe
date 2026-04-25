import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';

function prepareApprovedRecommendation(app) {
  app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
  const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
  assert.ok(pending.length > 0, 'expected pending recommendations');

  const recommendation = pending[0];
  app.services.adminReview.decide({
    recommendationId: recommendation.id,
    adminId: 'admin_trial',
    decision: 'approve',
    rationale: 'Approved for deterministic event and outcome validation.',
  });
  return recommendation;
}

test('outcome updates are traceable and emit expected events by recommendation', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareApprovedRecommendation(app);

    const accepted = app.services.recommendations.respondToRecommendation({
      recommendationId: recommendation.id,
      userId: recommendation.userId,
      decision: 'accept',
    });
    assert.equal(accepted.status, 'accepted');

    app.services.recommendations.updateFollowThrough({
      recommendationId: recommendation.id,
      actorUserId: 'admin_trial',
      status: 'intro_sent',
      notes: 'Intro email sent with context.',
    });
    const finalOutcome = app.services.recommendations.updateFollowThrough({
      recommendationId: recommendation.id,
      actorUserId: 'admin_trial',
      status: 'meeting_scheduled',
      notes: 'Call booked for next Tuesday.',
    });

    assert.equal(finalOutcome.outcomeStatus, 'meeting_scheduled');
    assert.equal(finalOutcome.notes, 'Call booked for next Tuesday.');

    const persisted = app.repository.getRecommendationById(recommendation.id);
    assert.equal(persisted.status, 'accepted');

    const userView = app.services.recommendations.listForUser(recommendation.userId);
    const row = userView.find((item) => item.id === recommendation.id);
    assert.ok(row, 'expected recommendation row in user view');
    assert.equal(row.outcome.outcomeStatus, 'meeting_scheduled');
    assert.equal(row.outcome.followThroughStatus, 'scheduled');
    assert.equal(row.outcome.notes, 'Call booked for next Tuesday.');

    const events = app.services.recommendations.listEvents({
      recommendationId: recommendation.id,
      limit: 100,
    });
    const types = new Set(events.map((event) => event.eventType));

    assert.ok(types.has('recommendation_generated'), 'expected recommendation_generated event');
    assert.ok(types.has('admin_approved'), 'expected admin_approved event');
    assert.ok(types.has('user_accept'), 'expected user_accept event');
    assert.ok(types.has('intro_sent'), 'expected intro_sent event');
    assert.ok(types.has('follow_through_updated'), 'expected follow_through_updated event');
  } finally {
    cleanup();
  }
});

test('event querying filters by recommendationId, eventType, and userId', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareApprovedRecommendation(app);
    app.services.recommendations.respondToRecommendation({
      recommendationId: recommendation.id,
      userId: recommendation.userId,
      decision: 'accept',
    });
    app.services.recommendations.updateFollowThrough({
      recommendationId: recommendation.id,
      actorUserId: 'admin_trial',
      status: 'intro_sent',
      notes: 'Intro sent for API filter test.',
    });

    const byRecommendation = app.services.recommendations.listEvents({
      recommendationId: recommendation.id,
      limit: 100,
    });
    assert.ok(byRecommendation.length > 0, 'expected events for recommendationId filter');
    assert.ok(
      byRecommendation.every((event) => event.recommendationId === recommendation.id),
      'expected recommendationId-scoped events',
    );

    const introEvents = app.services.recommendations.listEvents({
      recommendationId: recommendation.id,
      eventType: 'intro_sent',
      limit: 100,
    });
    assert.ok(introEvents.length > 0, 'expected intro_sent events');
    assert.ok(introEvents.every((event) => event.eventType === 'intro_sent'));
    assert.ok(
      introEvents.every((event) => event.recommendationId === recommendation.id),
      'expected intro_sent events scoped to recommendationId',
    );

    const byUser = app.services.recommendations.listEvents({
      userId: recommendation.userId,
      limit: 200,
    });
    assert.ok(byUser.length > 0, 'expected events for userId filter');
    assert.ok(byUser.every((event) => event.userId === recommendation.userId));
  } finally {
    cleanup();
  }
});

test('weekly report snapshot reflects outcomes and event counts after trial actions', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareApprovedRecommendation(app);
    app.services.recommendations.respondToRecommendation({
      recommendationId: recommendation.id,
      userId: recommendation.userId,
      decision: 'accept',
    });
    app.services.recommendations.updateFollowThrough({
      recommendationId: recommendation.id,
      actorUserId: 'admin_trial',
      status: 'intro_sent',
      notes: 'Intro sent for report snapshot.',
    });

    const fromIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toIso = new Date(Date.now() + 1_000).toISOString();
    const report = app.services.weeklyReport.generateSnapshot({ fromIso, toIso, windowDays: 30 });
    assert.ok(report.recommendations.generated > 0);
    assert.ok(report.responses.accepted > 0);
    assert.ok(report.outcomes.intro_sent > 0);
    assert.ok((report.events.recommendation_generated ?? 0) > 0);
    assert.ok((report.events.admin_approved ?? 0) > 0);
    assert.ok((report.events.user_accept ?? 0) > 0);
    assert.ok((report.events.intro_sent ?? 0) > 0);
  } finally {
    cleanup();
  }
});
