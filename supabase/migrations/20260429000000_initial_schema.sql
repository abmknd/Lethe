-- Lethe — initial Postgres schema
-- Converted from mvp/db/schema.mjs (SQLite)
-- Key differences: JSONB for arrays, BOOLEAN for flags, TIMESTAMPTZ for dates,
-- auth_id links users to Supabase Auth, GENERATED ALWAYS AS IDENTITY for auto-increment.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  auth_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  handle       TEXT UNIQUE,
  email        TEXT,
  location     TEXT,
  bio          TEXT NOT NULL DEFAULT '',
  matching_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  timezone     TEXT NOT NULL DEFAULT 'UTC',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id) WHERE auth_id IS NOT NULL;

-- ── preferences ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS preferences (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  match_intent         TEXT NOT NULL,
  offers               JSONB NOT NULL DEFAULT '[]',
  asks                 JSONB NOT NULL DEFAULT '[]',
  preferred_locations  JSONB NOT NULL DEFAULT '[]',
  user_type            TEXT NOT NULL DEFAULT '',
  preferred_user_types JSONB NOT NULL DEFAULT '[]',
  interests            JSONB NOT NULL DEFAULT '[]',
  objectives           JSONB NOT NULL DEFAULT '[]',
  intro_text           TEXT NOT NULL DEFAULT '',
  meeting_format       TEXT NOT NULL DEFAULT 'video',
  local_only           BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_user_ids     JSONB NOT NULL DEFAULT '[]',
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

-- ── availability_slots ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS availability_slots (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL,
  start_time   TEXT NOT NULL,
  end_time     TEXT NOT NULL,
  timezone     TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_availability_user ON availability_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_day  ON availability_slots(day_of_week);

-- ── recommendation_runs ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendation_runs (
  id           TEXT PRIMARY KEY,
  run_type     TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  completed_at TEXT,
  status       TEXT NOT NULL,
  summary_json JSONB
);

-- ── recommendations ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendations (
  id               TEXT PRIMARY KEY,
  run_id           TEXT NOT NULL REFERENCES recommendation_runs(id) ON DELETE CASCADE,
  source_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank             INTEGER NOT NULL DEFAULT 1,
  score            REAL NOT NULL,
  why_matched      TEXT NOT NULL,
  status           TEXT NOT NULL,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  UNIQUE(run_id, source_user_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_source ON recommendations(source_user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_pair   ON recommendations(source_user_id, target_user_id);

-- ── admin_decisions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_decisions (
  id                TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  decision          TEXT NOT NULL,
  rationale         TEXT,
  admin_id          TEXT,
  decided_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_decisions_rec ON admin_decisions(recommendation_id);

-- ── events ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id                TEXT PRIMARY KEY,
  event_type        TEXT NOT NULL,
  user_id           TEXT,
  recommendation_id TEXT REFERENCES recommendations(id) ON DELETE SET NULL,
  payload           JSONB NOT NULL DEFAULT '{}',
  created_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_type    ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_user    ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- ── outcomes ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outcomes (
  id                TEXT PRIMARY KEY,
  recommendation_id TEXT UNIQUE NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  outcome_status    TEXT NOT NULL,
  notes             TEXT,
  updated_at        TEXT NOT NULL
);
