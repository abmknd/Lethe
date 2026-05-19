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

-- ── connection_readiness ─────────────────────────────────────────────────────
-- Short-lived, provider-agnostic pre-call readiness signal. This is not a
-- durable reputation score and should not be used as a hard matching filter.

CREATE TABLE IF NOT EXISTS connection_readiness (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  provider           TEXT NOT NULL DEFAULT 'manual_link',
  tested_at          TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  status             TEXT NOT NULL DEFAULT 'unknown',
  score              NUMERIC,
  latency_ms         NUMERIC,
  jitter_ms          NUMERIC,
  packet_loss_pct    NUMERIC,
  upload_kbps        NUMERIC,
  download_kbps      NUMERIC,
  can_use_camera     BOOLEAN NOT NULL DEFAULT FALSE,
  can_use_mic        BOOLEAN NOT NULL DEFAULT FALSE,
  device_warnings    JSONB NOT NULL DEFAULT '[]',
  recommendation     TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL,
  updated_at         TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connection_readiness_user    ON connection_readiness(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_readiness_expires ON connection_readiness(expires_at);

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
