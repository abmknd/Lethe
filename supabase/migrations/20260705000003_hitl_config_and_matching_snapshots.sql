-- Phase 1: graduated HITL review dial + cycle-start matching snapshots.
--
-- hitl_config is a singleton the admin sets (ships parked at auto_approve_rate=0,
-- so nothing auto-approves until deliberately raised). matching_snapshots freezes
-- each cycle's matching inputs so a mid-cycle profile edit takes effect only next
-- cycle and disputes have a durable record of what was matched on.
--
-- Both are server-only: read/written through the edge functions (direct DB
-- connection bypasses RLS). RLS enabled with no client policy = deny-all.

CREATE TABLE IF NOT EXISTS hitl_config (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  auto_approve_rate INTEGER NOT NULL DEFAULT 0,
  min_sample_floor INTEGER NOT NULL DEFAULT 20,
  white_glove_first_match BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS matching_snapshots (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES recommendation_runs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_matching_snapshots_run ON matching_snapshots(run_id);
CREATE INDEX IF NOT EXISTS idx_matching_snapshots_user ON matching_snapshots(user_id);

ALTER TABLE hitl_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_snapshots ENABLE ROW LEVEL SECURITY;
