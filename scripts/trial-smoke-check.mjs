import { createTrialAppContext } from '../mvp/services/app-context.mjs';
import { createTrialApiServer } from '../mvp/api/server.mjs';

const EXPECTED_CONFLICT = 'Recommendation is no longer pending review.';
const EXPECTED_RATIONALE = 'Rationale is required and must be at least 10 characters.';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

function messageFrom(error) {
  return error instanceof Error ? error.message : String(error);
}

function readRecommendationRun(db, runId) {
  return db
    .prepare(
      `
      SELECT id, status, started_at, completed_at, summary_json
      FROM recommendation_runs
      WHERE id = :runId
    `,
    )
    .get({ runId });
}

function listRecommendationsForRun(db, runId) {
  return db
    .prepare(
      `
      SELECT id, run_id
      FROM recommendations
      WHERE run_id = :runId
    `,
    )
    .all({ runId });
}

function findRunEvents({ events, runId, eventType }) {
  return events.filter((event) => event.runId === runId && (!eventType || event.eventType === eventType));
}

function listen(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function runWeeklyViaApi(app) {
  const server = createTrialApiServer({
    services: app.services,
    dbPath: app.dbPath,
  });

  await listen(server);

  try {
    const address = server.address();
    assert(address && typeof address === 'object', 'Expected API server to bind to an address.');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/trial/matching/run-weekly`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ maxRecommendationsPerUser: 5 }),
    });

    assert(response.ok, `Expected API weekly run HTTP 200, got ${response.status}.`);
    return response.json();
  } finally {
    await closeServer(server);
  }
}

async function fetchAdminContextViaApi(app, recommendationId) {
  const server = createTrialApiServer({
    services: app.services,
    dbPath: app.dbPath,
  });

  await listen(server);

  try {
    const address = server.address();
    assert(address && typeof address === 'object', 'Expected API server to bind to an address.');
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/trial/admin/recommendations/${encodeURIComponent(recommendationId)}/context`,
      { method: 'GET' },
    );
    assert(response.ok, `Expected API admin context HTTP 200, got ${response.status}.`);
    return response.json();
  } finally {
    await closeServer(server);
  }
}

const app = createTrialAppContext({
  dbPath: process.env.LETHE_TRIAL_DB_PATH,
});

try {
  log('1) Reset + seed trial data');
  const seeded = app.services.setup.initialize({ reset: true, seed: true });
  assert((seeded.usersSeeded ?? 0) > 0, 'Expected seeded users > 0.');

  const users = app.services.onboarding.listUsers();
  assert(users.length > 0, 'Expected at least one persisted user after seed.');

  log('2) Run weekly matcher');
  const runResult = app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 5 });
  assert(Boolean(runResult.runId), 'Expected runId from weekly matcher.');
  const generated = runResult.summary?.recommendationsGenerated ?? 0;
  assert(generated > 0, 'Expected recommendationsGenerated > 0.');

  const persistedRun = readRecommendationRun(app.db, runResult.runId);
  assert(Boolean(persistedRun), 'Expected persisted recommendation_runs row for service run.');
  assert(persistedRun.status === 'completed', 'Expected recommendation run status=completed.');
  assert(Boolean(persistedRun.completed_at), 'Expected recommendation run completed_at to be set.');
  const persistedSummary = JSON.parse(persistedRun.summary_json ?? '{}');
  assert(
    Number(persistedSummary.recommendationsGenerated ?? 0) > 0,
    'Expected summary_json.recommendationsGenerated > 0.',
  );

  const persistedRecs = listRecommendationsForRun(app.db, runResult.runId);
  assert(persistedRecs.length === generated, 'Expected all generated recommendations persisted under run_id.');
  assert(
    persistedRecs.every((recommendation) => recommendation.run_id === runResult.runId),
    'Expected persisted recommendations to reference run_id.',
  );

  const generatedEvents = app.services.recommendations.listEvents({
    eventType: 'recommendation_generated',
    limit: 1000,
  });
  const runGeneratedEvents = findRunEvents({
    events: generatedEvents,
    runId: runResult.runId,
    eventType: 'recommendation_generated',
  });
  assert(runGeneratedEvents.length > 0, 'Expected at least one recommendation_generated event for service run.');
  assert(
    runGeneratedEvents.some((event) => event.payload?.explanationSupportSnapshot),
    'Expected explanationSupportSnapshot in recommendation_generated payload.',
  );

  log('3) Confirm API parity for /api/trial/matching/run-weekly');
  const apiRunResult = await runWeeklyViaApi(app);
  assert(Boolean(apiRunResult.runId), 'Expected runId from API weekly run route.');
  const persistedApiRun = readRecommendationRun(app.db, apiRunResult.runId);
  assert(Boolean(persistedApiRun), 'Expected persisted recommendation_runs row for API run.');
  assert(persistedApiRun.status === 'completed', 'Expected API recommendation run status=completed.');
  const apiGenerated = Number(apiRunResult.summary?.recommendationsGenerated ?? 0);
  const apiPersistedRecs = listRecommendationsForRun(app.db, apiRunResult.runId);
  assert(apiGenerated > 0, 'Expected API recommendation run to generate recommendations.');
  assert(
    apiPersistedRecs.length === apiGenerated,
    'Expected API generated recommendations to persist under API run_id.',
  );

  const pendingQueue = app.services.adminReview.listQueue({ status: 'pending_review' });
  assert(pendingQueue.length > 0, 'Expected at least one pending recommendation after weekly run.');

  const recommendation = pendingQueue[0];
  const recommendationId = recommendation.id;

  log('4) Validate admin context endpoint + evidence contract');
  const contextResponse = await fetchAdminContextViaApi(app, recommendationId);
  const context = contextResponse.context;
  assert(context.meta.strategy === 'deterministic', 'Expected context strategy=deterministic.');
  assert(typeof context.meta.snapshotUsed === 'boolean', 'Expected snapshotUsed boolean.');
  assert(Array.isArray(context.explanationSupport.evidence), 'Expected explanationSupport evidence array.');
  assert(
    context.explanationSupport.evidence.every(
      (evidence) =>
        evidence &&
        typeof evidence.entityType === 'string' &&
        typeof evidence.entityId === 'string' &&
        typeof evidence.fieldPath === 'string' &&
        Object.prototype.hasOwnProperty.call(evidence, 'normalizedValue'),
    ),
    'Expected strict evidence reference fields in context endpoint response.',
  );
  assert(
    Array.isArray(context.sourceContext.extractionSupport.calibrationChoices),
    'Expected calibration choices in source extraction support.',
  );

  log('5) Validate rationale enforcement');
  let rationaleFailed = false;
  try {
    app.services.adminReview.decide({
      recommendationId,
      adminId: 'admin_trial',
      decision: 'approve',
      rationale: 'short',
    });
  } catch (error) {
    rationaleFailed = true;
    assert(messageFrom(error) === EXPECTED_RATIONALE, `Expected rationale message: "${EXPECTED_RATIONALE}".`);
  }
  assert(rationaleFailed, 'Expected short rationale decision to fail.');

  log('6) Validate first-write-wins concurrency behavior');
  const firstDecision = app.services.adminReview.decide({
    recommendationId,
    adminId: 'admin_trial',
    decision: 'approve',
    rationale: 'This intro has strong fit and clear mutual value.',
  });
  assert(firstDecision.status === 'approved', 'Expected first decision to set status=approved.');

  log('7) Validate user response + follow-through outcome traceability');
  const userResponse = app.services.recommendations.respondToRecommendation({
    recommendationId,
    userId: recommendation.userId,
    decision: 'accept',
  });
  assert(userResponse.status === 'accepted', 'Expected accept response to set status=accepted.');

  const introOutcome = app.services.recommendations.updateFollowThrough({
    recommendationId,
    actorUserId: 'admin_trial',
    status: 'intro_sent',
    notes: 'Intro sent during smoke validation.',
  });
  assert(introOutcome.outcomeStatus === 'intro_sent', 'Expected intro_sent outcome status.');

  const meetingOutcome = app.services.recommendations.updateFollowThrough({
    recommendationId,
    actorUserId: 'admin_trial',
    status: 'meeting_scheduled',
    notes: 'Meeting scheduled during smoke validation.',
  });
  assert(meetingOutcome.outcomeStatus === 'meeting_scheduled', 'Expected meeting_scheduled outcome status.');

  const refreshedRecommendation = app.services.recommendations
    .listForUser(recommendation.userId)
    .find((item) => item.id === recommendationId);
  assert(Boolean(refreshedRecommendation), 'Expected recommendation to remain queryable for user.');
  assert(
    refreshedRecommendation.outcome.outcomeStatus === 'meeting_scheduled',
    'Expected recommendation outcomeStatus to persist as meeting_scheduled.',
  );

  let conflictFailed = false;
  try {
    app.services.adminReview.decide({
      recommendationId,
      adminId: 'admin_trial',
      decision: 'reject',
      rationale: 'Second decision should conflict after the first update.',
    });
  } catch (error) {
    conflictFailed = true;
    assert(messageFrom(error) === EXPECTED_CONFLICT, `Expected conflict message: "${EXPECTED_CONFLICT}".`);
  }
  assert(conflictFailed, 'Expected second decision on same recommendation to fail with conflict.');

  log('8) Validate event filters by recommendationId and eventType');
  const filteredEvents = app.services.recommendations.listEvents({
    recommendationId,
    limit: 200,
  });
  assert(filteredEvents.length > 0, 'Expected at least one event for recommendationId filter.');
  assert(
    filteredEvents.every((event) => event.recommendationId === recommendationId),
    'Expected all filtered events to match recommendationId.',
  );
  assert(
    filteredEvents.some((event) => event.eventType === 'recommendation_generated'),
    'Expected recommendation_generated event in filtered set.',
  );
  assert(
    filteredEvents.some((event) => event.eventType === 'admin_approved'),
    'Expected admin_approved event in filtered set.',
  );
  assert(
    filteredEvents.some((event) => event.eventType === 'user_accept'),
    'Expected user_accept event in filtered set.',
  );
  assert(
    filteredEvents.some((event) => event.eventType === 'intro_sent'),
    'Expected intro_sent event in filtered set.',
  );
  assert(
    filteredEvents.some((event) => event.eventType === 'follow_through_updated'),
    'Expected follow_through_updated event in filtered set.',
  );

  const introEvents = app.services.recommendations.listEvents({
    recommendationId,
    eventType: 'intro_sent',
    limit: 50,
  });
  assert(introEvents.length > 0, 'Expected intro_sent event filter to return records.');
  assert(
    introEvents.every((event) => event.eventType === 'intro_sent' && event.recommendationId === recommendationId),
    'Expected intro_sent filtered events scoped by recommendationId.',
  );

  log('Trial smoke check passed.');
  log(
    JSON.stringify(
      {
        usersSeeded: seeded.usersSeeded,
        recommendationsGeneratedServiceRun: generated,
        recommendationRunIdService: runResult.runId,
        recommendationRunIdApi: apiRunResult.runId,
        recommendationsGeneratedApiRun: apiGenerated,
        recommendationId,
        outcomeStatusFinal: refreshedRecommendation.outcome.outcomeStatus,
        snapshotUsedForContext: context.meta.snapshotUsed,
        contextEvidenceCount: context.explanationSupport.evidence.length,
        filteredEvents: filteredEvents.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Trial smoke check failed.');
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  app.close();
}
