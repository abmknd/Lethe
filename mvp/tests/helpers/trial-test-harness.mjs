import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTrialAppContext } from '../../services/app-context.mjs';
import { ensureSchema, openTrialDatabase } from '../../db/database.mjs';
import { clearAllTrialData } from '../../db/bootstrap.mjs';

function makeTempDbPath(prefix = 'lethe-trial-test-') {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), prefix));
  return {
    tempDir,
    dbPath: path.join(tempDir, 'test.sqlite'),
  };
}

export function createIsolatedTrialApp(options = {}) {
  const { seed = false, reset = true, dbPath: providedDbPath } = options;
  const created = providedDbPath ? null : makeTempDbPath();
  const dbPath = providedDbPath ?? created.dbPath;
  const tempDir = created?.tempDir ?? null;

  const app = createTrialAppContext({ dbPath });
  app.services.setup.initialize({ reset, seed });

  function cleanup() {
    try {
      try {
        app.close();
      } catch {
        // Ignore double-close during restart tests.
      }
    } finally {
      if (tempDir) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  return {
    app,
    dbPath,
    cleanup,
  };
}

export function resetSchemaAndData(dbPath) {
  const db = openTrialDatabase(dbPath);
  try {
    ensureSchema(db);
    clearAllTrialData(db);
  } finally {
    db.close();
  }
}
