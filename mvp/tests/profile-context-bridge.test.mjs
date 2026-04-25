import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import { createTrialApiServer } from '../api/server.mjs';

function prepareRecommendation(app) {
  app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
  const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
  assert.ok(pending.length > 0, 'expected at least one recommendation');
  return pending[0];
}

async function withStartedServer(app, fn) {
  const server = createTrialApiServer({
    services: app.services,
    dbPath: app.dbPath,
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('service: recommendation participants context returns viewer-safe payload', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareRecommendation(app);
    const payload = app.services.profileContext.getRecommendationParticipantsContext(recommendation.id);

    assert.equal(payload.recommendationId, recommendation.id);
    assert.equal(payload.runId, recommendation.runId);
    assert.ok(payload.sourceParticipant.id);
    assert.ok(payload.sourceParticipant.displayName);
    assert.ok(payload.candidateParticipant.id);
    assert.ok(payload.explanationSupport.headline);
    assert.ok(Array.isArray(payload.explanationSupport.highlights));

    assert.equal('email' in payload.sourceParticipant, false);
    assert.equal('blockedUserIds' in payload.sourceParticipant, false);
    assert.equal('freeText' in payload.sourceParticipant.extractionSupport, false);
  } finally {
    cleanup();
  }
});

test('service: recommendation participants context returns 404 when recommendation is missing', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    assert.throws(
      () => app.services.profileContext.getRecommendationParticipantsContext('missing_recommendation'),
      /Recommendation not found\./,
    );
  } finally {
    cleanup();
  }
});

test('service: recommendation participants context returns 404 when participant profile is missing', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareRecommendation(app);
    const originalGetUserProfile = app.repository.getUserProfile.bind(app.repository);

    app.repository.getUserProfile = (userId) => {
      if (userId === recommendation.candidateUserId) {
        return null;
      }
      return originalGetUserProfile(userId);
    };

    assert.throws(
      () => app.services.profileContext.getRecommendationParticipantsContext(recommendation.id),
      /Recommendation users not found\./,
    );
  } finally {
    cleanup();
  }
});

test('service: snapshotUsed reflects snapshot presence/absence', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareRecommendation(app);

    const withSnapshot = app.services.profileContext.getRecommendationParticipantsContext(recommendation.id);
    assert.equal(withSnapshot.meta.snapshotUsed, true);

    const originalListEvents = app.repository.listEvents.bind(app.repository);
    app.repository.listEvents = (filters = {}) => {
      if (filters.recommendationId === recommendation.id && filters.eventType === 'recommendation_generated') {
        return [];
      }
      return originalListEvents(filters);
    };

    const withoutSnapshot = app.services.profileContext.getRecommendationParticipantsContext(recommendation.id);
    assert.equal(withoutSnapshot.meta.snapshotUsed, false);
  } finally {
    cleanup();
  }
});

test('routes: participants-context and user-context endpoints return typed viewer-safe payloads', async () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareRecommendation(app);

    await withStartedServer(app, async (baseUrl) => {
      const participantRes = await fetch(
        `${baseUrl}/api/trial/recommendations/${encodeURIComponent(recommendation.id)}/participants-context`,
      );
      assert.equal(participantRes.status, 200);
      const participantBody = await participantRes.json();
      const participantContext = participantBody.context;

      assert.equal(participantContext.recommendationId, recommendation.id);
      assert.ok(participantContext.sourceParticipant.id);
      assert.ok(participantContext.candidateParticipant.id);
      assert.ok(Array.isArray(participantContext.explanationSupport.evidence));
      assert.ok(participantContext.explanationSupport.evidence.length <= 20);
      assert.equal('email' in participantContext.sourceParticipant, false);
      assert.equal('blockedUserIds' in participantContext.sourceParticipant, false);
      assert.equal('freeText' in participantContext.sourceParticipant.extractionSupport, false);

      const userRes = await fetch(
        `${baseUrl}/api/trial/users/${encodeURIComponent(recommendation.userId)}/context`,
      );
      assert.equal(userRes.status, 200);
      const userBody = await userRes.json();
      const userContext = userBody.context;

      assert.ok(userContext.participant.id);
      assert.ok(userContext.participant.summary);
      assert.equal('email' in userContext.participant, false);
      assert.equal('freeText' in userContext.participant.extractionSupport, false);
      assert.equal(userContext.meta.strategy, 'deterministic');
    });
  } finally {
    cleanup();
  }
});

test('routes: not-found behavior for new endpoints and admin route remains available', async () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: true });

  try {
    const recommendation = prepareRecommendation(app);

    await withStartedServer(app, async (baseUrl) => {
      const missingRecommendationRes = await fetch(
        `${baseUrl}/api/trial/recommendations/missing_recommendation/participants-context`,
      );
      assert.equal(missingRecommendationRes.status, 404);
      const missingRecommendationBody = await missingRecommendationRes.json();
      assert.match(missingRecommendationBody.error, /Recommendation not found\./);

      const missingUserRes = await fetch(`${baseUrl}/api/trial/users/missing_user/context`);
      assert.equal(missingUserRes.status, 404);
      const missingUserBody = await missingUserRes.json();
      assert.match(missingUserBody.error, /User not found\./);

      const adminContextRes = await fetch(
        `${baseUrl}/api/trial/admin/recommendations/${encodeURIComponent(recommendation.id)}/context`,
      );
      assert.equal(adminContextRes.status, 200);
      const adminContextBody = await adminContextRes.json();
      assert.ok(adminContextBody.context.sourceContext);
      assert.ok(adminContextBody.context.candidateContext);
      assert.ok(adminContextBody.context.explanationSupport);
    });
  } finally {
    cleanup();
  }
});
