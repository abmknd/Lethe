import { createTrialAppContext } from '../mvp/services/app-context.mjs';
import { createTrialApiServer } from '../mvp/api/server.mjs';

const port = Number(process.env.LETHE_TRIAL_API_PORT ?? 8787);
const app = createTrialAppContext({
  dbPath: process.env.LETHE_TRIAL_DB_PATH,
});

// Safe default for local demos; no destructive reset unless explicitly requested.
app.services.setup.initialize({
  reset: false,
  seed: true,
});

const server = createTrialApiServer({
  services: app.services,
  dbPath: app.dbPath,
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Lethe trial API listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`SQLite database: ${app.dbPath}`);
});

function shutdown() {
  server.close(() => {
    app.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
