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
  verification_tier TEXT NOT NULL DEFAULT 'unverified',
  dob TEXT,
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
  languages TEXT NOT NULL DEFAULT '[]',
  meeting_frequency TEXT NOT NULL DEFAULT 'every_week',
  learn_about TEXT NOT NULL DEFAULT '',
  ask_about TEXT NOT NULL DEFAULT '',
  who_to_meet INTEGER NOT NULL DEFAULT 0,
  notification_prefs TEXT NOT NULL DEFAULT '{}',
  company_name TEXT NOT NULL DEFAULT '',
  work_email TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  company_stage TEXT NOT NULL DEFAULT '',
  meet_stages TEXT NOT NULL DEFAULT '[]',
  not_looking_for TEXT NOT NULL DEFAULT '[]',
  experience_level TEXT NOT NULL DEFAULT '',
  mentor_match INTEGER NOT NULL DEFAULT 0,
  match_mode TEXT NOT NULL DEFAULT 'match_my_ask',
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
  insight_text TEXT NOT NULL DEFAULT '',
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

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual_link',
  external_meeting_id TEXT,
  meeting_url TEXT NOT NULL DEFAULT '',
  scheduled_at TEXT,
  started_at TEXT,
  ended_at TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meetings_recommendation ON meetings(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

CREATE TABLE IF NOT EXISTS connection_readiness (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'manual_link',
  tested_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  score REAL,
  latency_ms REAL,
  jitter_ms REAL,
  packet_loss_pct REAL,
  upload_kbps REAL,
  download_kbps REAL,
  can_use_camera INTEGER NOT NULL DEFAULT 0,
  can_use_mic INTEGER NOT NULL DEFAULT 0,
  device_warnings TEXT NOT NULL DEFAULT '[]',
  recommendation TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_connection_readiness_user ON connection_readiness(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_readiness_expires ON connection_readiness(expires_at);

CREATE TABLE IF NOT EXISTS weekly_cep (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  focus_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weekly_cep_user ON weekly_cep(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_cep_expires ON weekly_cep(expires_at);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL UNIQUE,
  reverse_recommendation_id TEXT,
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'offered_blind',
  a_response TEXT,
  a_responded_at TEXT,
  b_response TEXT,
  b_responded_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(user_b_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matches_recommendation ON matches(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_matches_reverse_recommendation ON matches(reverse_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_matches_pair ON matches(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_state ON matches(state);

CREATE TABLE IF NOT EXISTS trust_signals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  match_id TEXT,
  source_event_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trust_signals_user ON trust_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_signals_type ON trust_signals(signal_type);

CREATE TABLE IF NOT EXISTS hitl_config (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  auto_approve_rate INTEGER NOT NULL DEFAULT 0,
  min_sample_floor INTEGER NOT NULL DEFAULT 20,
  white_glove_first_match INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS matching_snapshots (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  snapshot TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE(run_id, user_id),
  FOREIGN KEY(run_id) REFERENCES recommendation_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matching_snapshots_run ON matching_snapshots(run_id);
CREATE INDEX IF NOT EXISTS idx_matching_snapshots_user ON matching_snapshots(user_id);
`;
