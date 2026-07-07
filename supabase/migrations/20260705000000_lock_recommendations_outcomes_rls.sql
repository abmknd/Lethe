-- Close a row-level backdoor found during Phase 1 RLS hardening.
--
-- `recommendations` and `outcomes` had no RLS enabled, so any authenticated
-- client could read the entire tables via PostgREST: the full pairing graph
-- (every source/target user id and `why_matched` line) and every match's
-- outcome + notes. This sits behind the edge-function blind gate but bypasses
-- it entirely at the row level.
--
-- Clients only ever receive these through the `api` edge function, which
-- connects over a direct Postgres connection that bypasses RLS. So the correct
-- client policy is no access at all. Enabling RLS with no policy denies the
-- anon/authenticated roles while leaving the edge function unaffected, exactly
-- how `matches` and `trust_signals` are already locked.

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
