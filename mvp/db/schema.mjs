export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT UNIQUE,
  email TEXT,
  location TEXT,
  bio TEXT NOT NULL DEFAULT '',
  matching_enabled INTEGER NOT NULL DEFAULT 1,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  match_intent TEXT NOT NULL,
  offers TEXT NOT NULL DEFAULT '[]',
  asks TEXT NOT NULL DEFAULT '[]',
  preferred_locations TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT '',
  preferred_user_types TEXT NOT NULL,
  interests TEXT NOT NULL,
  objectives TEXT NOT NULL,
  intro_text TEXT NOT NULL DEFAULT '',
  meeting_format TEXT NOT NULL DEFAULT 'video',
  local_only INTEGER NOT NULL DEFAULT 0,
  blocked_user_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_availability_user ON availability_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability_slots(day_of_week);

CREATE TABLE IF NOT EXISTS recommendation_runs (
  id TEXT PRIMARY KEY,
  run_type TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  summary_json TEXT
);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  source_user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 1,
  score REAL NOT NULL,
  why_matched TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(run_id, source_user_id, target_user_id),
  FOREIGN KEY(run_id) REFERENCES recommendation_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(source_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recommendations_source ON recommendations(source_user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_pair ON recommendations(source_user_id, target_user_id);

CREATE TABLE IF NOT EXISTS admin_decisions (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  rationale TEXT,
  admin_id TEXT,
  decided_at TEXT NOT NULL,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_decisions_rec ON admin_decisions(recommendation_id);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  recommendation_id TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT UNIQUE NOT NULL,
  outcome_status TEXT NOT NULL,
  notes TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);
`;
