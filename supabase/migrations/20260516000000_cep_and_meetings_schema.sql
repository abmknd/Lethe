-- Lethe — CEP lite + meetings schema
-- Adds weekly_cep and meetings tables introduced in Phase 7A (local-first).
-- Postgres adaptations from SQLite: TIMESTAMPTZ for dates, JSONB for metadata.
-- All mutations go through Edge Functions with the service key; user JWT gets
-- read-only access scoped via RLS (see policies/rls.sql).

-- ── meetings ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meetings (
  id                   TEXT PRIMARY KEY,
  recommendation_id    TEXT UNIQUE NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  provider             TEXT NOT NULL DEFAULT 'manual_link',
  external_meeting_id  TEXT,
  meeting_url          TEXT NOT NULL DEFAULT '',
  scheduled_at         TIMESTAMPTZ,
  started_at           TIMESTAMPTZ,
  ended_at             TIMESTAMPTZ,
  status               TEXT NOT NULL DEFAULT 'scheduled',
  metadata             JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL,
  updated_at           TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meetings_recommendation ON meetings(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status         ON meetings(status);

-- ── weekly_cep ────────────────────────────────────────────────────────────────
-- One active CEP entry per user. UNIQUE on user_id enforces the single-signal
-- contract; upserts replace the previous focus rather than appending.

CREATE TABLE IF NOT EXISTS weekly_cep (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  focus_text  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weekly_cep_user    ON weekly_cep(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_cep_expires ON weekly_cep(expires_at);
