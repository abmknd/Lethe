import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';

test('meeting readiness records latest provider-agnostic result', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const [user] = app.services.onboarding.listUsers();
    const started = app.services.meetingReadiness.startCheck(user.id, { provider: 'manual_link' });
    assert.equal(started.displayStatus, 'unknown');
    assert.equal(started.isActive, true);

    const recorded = app.services.meetingReadiness.recordResult(user.id, {
      provider: 'manual_link',
      status: 'medium',
      score: 68,
      latencyMs: 140,
      canUseCamera: true,
      canUseMic: true,
      deviceWarnings: ['Network is variable.'],
    });

    assert.equal(recorded.displayStatus, 'medium');
    assert.equal(recorded.isActive, true);
    assert.equal(recorded.readiness.userId, user.id);
    assert.equal(recorded.readiness.score, 68);
    assert.equal(recorded.readiness.recommendation, 'Audio-first recommended.');

    const latest = app.services.meetingReadiness.getLatest(user.id);
    assert.deepEqual(latest, recorded);

    const events = app.services.recommendations.listEvents({
      userId: user.id,
      eventType: 'meeting_readiness_recorded',
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].payload.status, 'medium');
  } finally {
    cleanup();
  }
});

test('expired meeting readiness displays as untested recently', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const [user] = app.services.onboarding.listUsers();
    const recorded = app.services.meetingReadiness.recordResult(user.id, {
      provider: 'manual_link',
      status: 'good',
      score: 82,
      testedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      canUseCamera: true,
      canUseMic: true,
    });

    assert.equal(recorded.isActive, false);
    assert.equal(recorded.displayStatus, 'unknown');
    assert.equal(recorded.readiness.status, 'good');
  } finally {
    cleanup();
  }
});

test('meeting readiness validates user and status', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const [user] = app.services.onboarding.listUsers();
    assert.throws(
      () => app.services.meetingReadiness.startCheck('missing_user'),
      /User not found/,
    );
    assert.throws(
      () =>
        app.services.meetingReadiness.recordResult(user.id, {
          status: 'bad',
          canUseCamera: true,
          canUseMic: true,
        }),
      /Invalid meeting readiness status/,
    );
  } finally {
    cleanup();
  }
});
