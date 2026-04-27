import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_SQL } from './schema.mjs';

export function resolveDefaultDbPath(projectRoot = process.cwd()) {
  return path.resolve(projectRoot, 'mvp', 'data', 'lethe-trial.sqlite');
}

export function openTrialDatabase(dbPath = resolveDefaultDbPath()) {
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath, {
    open: true,
    timeout: 10_000,
  });

  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  return db;
}

export function ensureSchema(db) {
  // Ensure local trial schema is compatible with the current code contracts.
  // If not, rebuild (local-first reset behavior is acceptable for the trial).
  if (!isSchemaCompatible(db)) {
    rebuildSchema(db);
  }

  db.exec(SCHEMA_SQL);
}

function isSchemaCompatible(db) {
  const requirements = {
    users: ['name', 'bio', 'matching_enabled'],
    preferences: ['id', 'offers', 'asks', 'preferred_locations', 'user_type', 'preferred_user_types', 'objectives'],
    availability_slots: ['start_time', 'end_time', 'timezone'],
    recommendations: ['source_user_id', 'target_user_id', 'why_matched'],
    events: ['user_id', 'payload'],
    outcomes: ['outcome_status'],
  };

  for (const [table, requiredColumns] of Object.entries(requirements)) {
    const columns = db
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((row) => row.name);

    if (!columns.length) {
      continue;
    }

    for (const requiredColumn of requiredColumns) {
      if (!columns.includes(requiredColumn)) {
        return false;
      }
    }
  }

  return true;
}

function rebuildSchema(db) {
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(`
    DROP TABLE IF EXISTS outcomes;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS admin_decisions;
    DROP TABLE IF EXISTS recommendations;
    DROP TABLE IF EXISTS recommendation_runs;
    DROP TABLE IF EXISTS availability_slots;
    DROP TABLE IF EXISTS preferences;
    DROP TABLE IF EXISTS users;
  `);
  db.exec('PRAGMA foreign_keys = ON;');
}
