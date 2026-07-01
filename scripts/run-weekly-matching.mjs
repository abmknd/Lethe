import { createTrialAppContext } from '../mvp/services/app-context.mjs';

const maxRecommendationsPerUser = Number(process.env.LETHE_TRIAL_MAX_RECOMMENDATIONS ?? 5);

const app = createTrialAppContext({
  dbPath: process.env.LETHE_TRIAL_DB_PATH,
});

try {
  const result = app.services.weeklyMatching.runWeeklyMatching({
    maxRecommendationsPerUser,
  });

  // eslint-disable-next-line no-console
  console.log('Weekly matching run completed.');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
} finally {
  app.close();
}
