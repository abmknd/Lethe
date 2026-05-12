-- Lethe — Row Level Security policies
-- Apply after schema migration and auth setup.
-- Service role bypasses RLS by default (used by Edge Functions with service key).
-- Authenticated users are scoped to their own data via auth.uid() → users.auth_id.

-- ── helper ────────────────────────────────────────────────────────────────────

-- Resolves the current Supabase Auth user to their Lethe user id.
CREATE OR REPLACE FUNCTION lethe_user_id()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$;

-- ── enable RLS on all tables ──────────────────────────────────────────────────

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_decisions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_runs ENABLE ROW LEVEL SECURITY;

-- ── users ─────────────────────────────────────────────────────────────────────
-- No INSERT policy — users are created by the service role during onboarding.
-- Authenticated users may read and update their own row only.

CREATE POLICY "users: read own profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "users: update own profile"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- ── preferences ───────────────────────────────────────────────────────────────

CREATE POLICY "preferences: read own"
  ON preferences FOR SELECT
  USING (user_id = lethe_user_id());

CREATE POLICY "preferences: write own"
  ON preferences FOR INSERT
  WITH CHECK (user_id = lethe_user_id());

CREATE POLICY "preferences: update own"
  ON preferences FOR UPDATE
  USING (user_id = lethe_user_id());

-- ── availability_slots ────────────────────────────────────────────────────────

CREATE POLICY "availability: read own"
  ON availability_slots FOR SELECT
  USING (user_id = lethe_user_id());

CREATE POLICY "availability: write own"
  ON availability_slots FOR INSERT
  WITH CHECK (user_id = lethe_user_id());

CREATE POLICY "availability: delete own"
  ON availability_slots FOR DELETE
  USING (user_id = lethe_user_id());

-- ── recommendations ───────────────────────────────────────────────────────────

CREATE POLICY "recommendations: read own"
  ON recommendations FOR SELECT
  USING (source_user_id = lethe_user_id());

-- ── outcomes ──────────────────────────────────────────────────────────────────

CREATE POLICY "outcomes: read via own recommendation"
  ON outcomes FOR SELECT
  USING (
    recommendation_id IN (
      SELECT id FROM recommendations WHERE source_user_id = lethe_user_id()
    )
  );

-- ── events ────────────────────────────────────────────────────────────────────

CREATE POLICY "events: read own"
  ON events FOR SELECT
  USING (user_id = lethe_user_id());

-- ── meetings ──────────────────────────────────────────────────────────────────
-- Users may read meetings linked to their own recommendations.
-- Create and status updates go through Edge Functions (service key).

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings: read via own recommendation"
  ON meetings FOR SELECT
  USING (
    recommendation_id IN (
      SELECT id FROM recommendations WHERE source_user_id = lethe_user_id()
    )
  );

-- ── weekly_cep ────────────────────────────────────────────────────────────────
-- Users own their CEP entry: read, write, and delete scoped to their user id.
-- The upsert (submit/replace) goes through the same Edge Function as reads,
-- so INSERT and UPDATE are both permitted here.

ALTER TABLE weekly_cep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_cep: read own"
  ON weekly_cep FOR SELECT
  USING (user_id = lethe_user_id());

CREATE POLICY "weekly_cep: write own"
  ON weekly_cep FOR INSERT
  WITH CHECK (user_id = lethe_user_id());

CREATE POLICY "weekly_cep: update own"
  ON weekly_cep FOR UPDATE
  USING (user_id = lethe_user_id());

CREATE POLICY "weekly_cep: delete own"
  ON weekly_cep FOR DELETE
  USING (user_id = lethe_user_id());

-- ── admin tables: service role only ──────────────────────────────────────────
-- admin_decisions and recommendation_runs are write-only via service role.
-- Authenticated users have no direct access — admin review goes through Edge Functions
-- that run with the service key.

CREATE POLICY "admin_decisions: no direct user access"
  ON admin_decisions FOR ALL
  USING (false);

CREATE POLICY "recommendation_runs: no direct user access"
  ON recommendation_runs FOR ALL
  USING (false);
