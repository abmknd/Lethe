import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';

function prepareAcceptedRecommendation(app) {
  app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
  const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
  assert.ok(pending.length > 0, 'expected pending recommendations');

  const recommendation = pending[0];
  app.services.adminReview.decide({
    recommendationId: recommendation.id,
    adminId: 'admin_system',
    decision: 'approve',
    rationale: 'Approved for meeting layer validation.',
  });
  app.services.recommendations.respondToRecommendation({
    recommendationId: recommendation.id,
    userId: recommendation.userId,
    decision: 'accept',
  });
  return recommendation;
}

test('meeting layer creates provider-agnostic manual-link meeting for a recommendation', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });

  try {
    const recommendation = prepareAcceptedRecommendation(app);
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const meeting = app.services.meetings.createMeetingForRecommendation({
      recommendationId: recommendation.id,
      actorUserId: 'admin_system',
      provider: 'manual_link',
      meetingUrl: 'https://meet.example.com/lethe-test',
      scheduledAt,
      status: 'scheduled',
      notes: 'Manual meeting link added.',
    });

    assert.equal(meeting.recommendationId, recommendation.id);
    assert.equal(meeting.provider, 'manual_link');
    assert.equal(meeting.meetingUrl, 'https://meet.example.com/lethe-test');
    assert.equal(meeting.status, 'scheduled');
    assert.equal(meeting.scheduledAt, scheduledAt);

    const persisted = app.services.meetings.getMeetingForRecommendation(recommendation.id);
    assert.deepEqual(persisted, meeting);

    const userRows = app.services.recommendations.listForUser(recommendation.userId);
    const row = userRows.find((item) => item.id === recommendation.id);
    assert.equal(row.meeting.meetingUrl, 'https://meet.example.com/lethe-test');
    assert.equal(row.outcome.outcomeStatus, 'meeting_scheduled');

    const meetingEvents = app.services.recommendations.listEvents({
      recommendationId: recommendation.id,
      eventType: 'meeting_created',
    });
    assert.equal(meetingEvents.length, 1);
    assert.equal(meetingEvents[0].payload.provider, 'manual_link');
  } finally {
    cleanup();
  }
});

test('meeting status updates sync completed outcome and status event', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });

  try {
    const recommendation = prepareAcceptedRecommendation(app);
    app.services.meetings.createMeetingForRecommendation({
      recommendationId: recommendation.id,
      actorUserId: 'admin_system',
      provider: 'manual_link',
      meetingUrl: 'https://meet.example.com/lethe-test',
      status: 'scheduled',
    });

    const completed = app.services.meetings.updateMeetingStatus({
      recommendationId: recommendation.id,
      actorUserId: 'admin_system',
      status: 'completed',
      notes: 'Meeting completed successfully.',
    });

    assert.equal(completed.status, 'completed');
    assert.ok(completed.endedAt, 'expected endedAt to be set');

    const outcome = app.repository.getOutcomeByRecommendation(recommendation.id);
    assert.equal(outcome.outcomeStatus, 'completed');
    assert.equal(outcome.notes, 'Meeting completed successfully.');

    const statusEvents = app.services.recommendations.listEvents({
      recommendationId: recommendation.id,
      eventType: 'meeting_status_updated',
    });
    assert.equal(statusEvents.length, 1);
    assert.equal(statusEvents[0].payload.status, 'completed');
  } finally {
    cleanup();
  }
});

test('meeting layer validates provider, status, and existing recommendation', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });

  try {
    const recommendation = prepareAcceptedRecommendation(app);

    assert.throws(
      () =>
        app.services.meetings.createMeetingForRecommendation({
          recommendationId: recommendation.id,
          provider: 'unsupported',
          meetingUrl: 'https://meet.example.com/lethe-test',
          status: 'scheduled',
        }),
      /Invalid meeting provider/,
    );

    assert.throws(
      () =>
        app.services.meetings.createMeetingForRecommendation({
          recommendationId: recommendation.id,
          provider: 'manual_link',
          meetingUrl: '',
          status: 'scheduled',
        }),
      /Meeting URL is required/,
    );

    assert.throws(
      () =>
        app.services.meetings.updateMeetingStatus({
          recommendationId: recommendation.id,
          status: 'completed',
        }),
      /Meeting not found/,
    );

    assert.throws(
      () =>
        app.services.meetings.createMeetingForRecommendation({
          recommendationId: 'missing_rec',
          provider: 'manual_link',
          meetingUrl: 'https://meet.example.com/lethe-test',
          status: 'scheduled',
        }),
      /Recommendation not found/,
    );
  } finally {
    cleanup();
  }
});
