-- Phase 0 of docs/alignment-plan.md: pair-level match lifecycle, append-only
-- trust signal ledger, and identity verification tier.
--
-- The matches row owns the double-blind gate. Identity must never reach a
-- client while state is before 'revealed'; both tables are server-only
-- (RLS enabled, no client policies — access runs through the edge function
-- with the service key).

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL UNIQUE REFERENCES recommendations(id) ON DELETE CASCADE,
  reverse_recommendation_id TEXT,
  user_a_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'offered_blind'
    CHECK (state IN (
      'generated', 'under_review', 'offered_blind', 'mutual_accepted',
      'revealed', 'scheduled', 'met', 'reviewed', 'closed',
      'declined_silent', 'expired', 'suspended'
    )),
  a_response TEXT CHECK (a_response IN ('accepted', 'declined')),
  a_responded_at TIMESTAMPTZ,
  b_response TEXT CHECK (b_response IN ('accepted', 'declined')),
  b_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_recommendation ON matches(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_matches_reverse_recommendation ON matches(reverse_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_matches_pair ON matches(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_state ON matches(state);

-- Append-only ledger (alignment plan, decision 9): trust is derived on read
-- from weighted signals, never stored as a mutable number. No UPDATE or
-- DELETE path exists in application code.
CREATE TABLE IF NOT EXISTS trust_signals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  match_id TEXT REFERENCES matches(id) ON DELETE SET NULL,
  source_event_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trust_signals_user ON trust_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_signals_type ON trust_signals(signal_type);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_tier TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_tier IN ('unverified', 'oauth_verified', 'work_email_verified'));

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_signals ENABLE ROW LEVEL SECURITY;
