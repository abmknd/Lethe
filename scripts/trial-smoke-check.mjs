import { createTrialAppContext } from '../mvp/services/app-context.mjs';

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
  const generated = runResult.summary?.recommendationsGenerated ?? 0;
  assert(generated > 0, 'Expected recommendationsGenerated > 0.');

  const pendingQueue = app.services.adminReview.listQueue({ status: 'pending_review' });
  assert(pendingQueue.length > 0, 'Expected at least one pending recommendation after weekly run.');

  const recommendation = pendingQueue[0];
  const recommendationId = recommendation.id;

  log('3) Validate rationale enforcement');
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

  log('4) Validate first-write-wins concurrency behavior');
  const firstDecision = app.services.adminReview.decide({
    recommendationId,
    adminId: 'admin_trial',
    decision: 'approve',
    rationale: 'This intro has strong fit and clear mutual value.',
  });
  assert(firstDecision.status === 'approved', 'Expected first decision to set status=approved.');

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

  log('5) Validate event filter by recommendationId');
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

  log('Trial smoke check passed.');
  log(
    JSON.stringify(
      {
        usersSeeded: seeded.usersSeeded,
        recommendationsGenerated: generated,
        recommendationId,
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
