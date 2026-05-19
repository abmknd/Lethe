import { createTrialAppContext } from '../mvp/services/app-context.mjs';

const reset = process.argv.includes('--reset');
const seed = !process.argv.includes('--no-seed');

const app = createTrialAppContext({
  dbPath: process.env.LETHE_TRIAL_DB_PATH,
});

try {
  const result = app.services.setup.initialize({ reset, seed });
  // eslint-disable-next-line no-console
  console.log('Trial database initialized.');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ dbPath: app.dbPath, ...result }, null, 2));
} finally {
  app.close();
}
