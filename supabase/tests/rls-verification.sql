-- Lethe — RLS cross-user isolation verification
--
-- Prerequisites:
--   1. Two real Supabase auth users exist (sign up via magic link)
--   2. Replace the UUIDs and JWTs below with real values
--   3. Run each block in order in the SQL Editor (as postgres/service role)
--      then switch to each user JWT to verify isolation
--
-- Run with: paste into Supabase SQL Editor using the service role connection
--
-- STEP 1 — Seed test data as service role (bypasses RLS)
-- Replace user_a_id / user_b_id with real users.id values from your users table.

DO $$
DECLARE
  user_a_id TEXT := '<user-a-lethe-id>';
  user_b_id TEXT := '<user-b-lethe-id>';
  run_id    TEXT := 'rls-test-run-001';
  rec_id    TEXT := 'rls-test-rec-001';
BEGIN

  -- Insert a recommendation run
  INSERT INTO recommendation_runs (id, run_type, started_at, status)
  VALUES (run_id, 'weekly', NOW(), 'completed')
  ON CONFLICT (id) DO NOTHING;

  -- Insert a recommendation where user A is the source
  INSERT INTO recommendations (id, run_id, source_user_id, target_user_id, rank, score, why_matched, status, created_at, updated_at)
  VALUES (rec_id, run_id, user_a_id, user_b_id, 1, 85, 'test match', 'pending', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insert a preferences row for user A
  INSERT INTO preferences (id, user_id, created_at, updated_at)
  VALUES ('rls-test-pref-a', user_a_id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insert an event for user A
  INSERT INTO events (id, event_type, user_id, created_at)
  VALUES ('rls-test-event-a', 'RLS_TEST', user_a_id, NOW())
  ON CONFLICT (id) DO NOTHING;

END $$;


-- STEP 2 — Verify as user A JWT (paste user A's JWT into the Supabase client)
-- Expected: user A sees their own rows, nothing from user B.
--
-- Run these queries after setting the auth context to user A:
--   SELECT set_config('request.jwt.claims', '{"sub":"<user-a-auth-id>","role":"authenticated"}', true);

SELECT 'preferences' AS tbl, count(*) AS visible FROM preferences;
-- Expected: 1 (user A's own row)

SELECT 'recommendations' AS tbl, count(*) AS visible FROM recommendations;
-- Expected: 1 (user A is source_user_id)

SELECT 'events' AS tbl, count(*) AS visible FROM events WHERE event_type = 'RLS_TEST';
-- Expected: 1 (user A's own event)

SELECT 'admin_decisions' AS tbl, count(*) AS visible FROM admin_decisions;
-- Expected: 0 (fully blocked)

SELECT 'recommendation_runs' AS tbl, count(*) AS visible FROM recommendation_runs;
-- Expected: 0 (fully blocked)


-- STEP 3 — Verify as user B JWT
-- Expected: user B sees nothing — recommendations, preferences, events all empty.
--
--   SELECT set_config('request.jwt.claims', '{"sub":"<user-b-auth-id>","role":"authenticated"}', true);

SELECT 'preferences' AS tbl, count(*) AS visible FROM preferences;
-- Expected: 0 (user B has no preferences row)

SELECT 'recommendations' AS tbl, count(*) AS visible FROM recommendations;
-- Expected: 0 (user B is not source_user_id on any rec)

SELECT 'events' AS tbl, count(*) AS visible FROM events WHERE event_type = 'RLS_TEST';
-- Expected: 0 (event belongs to user A)


-- STEP 4 — Clean up test data (run as service role)

DELETE FROM events          WHERE id = 'rls-test-event-a';
DELETE FROM preferences     WHERE id = 'rls-test-pref-a';
DELETE FROM recommendations WHERE id = 'rls-test-rec-001';
DELETE FROM recommendation_runs WHERE id = 'rls-test-run-001';
