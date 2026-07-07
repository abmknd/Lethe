-- Complete the Phase 1 RLS lockdown started in 20260705000000/000001.
--
-- The `outcomes: read via own recommendation` and
-- `meetings: read via own recommendation` policies both checked participation
-- by sub-selecting from `recommendations`. Now that recommendations is deny-all
-- for clients, those sub-selects return nothing, so both policies already
-- resolve to "no rows". Drop them so the deny-all is explicit rather than an
-- accidental side effect: if a recommendations client policy were ever re-added,
-- these would silently re-open.
--
-- outcomes and meetings are served to clients only through the `api` edge
-- function (direct DB connection, bypasses RLS), so no client policy is needed.

DROP POLICY IF EXISTS "outcomes: read via own recommendation" ON outcomes;
DROP POLICY IF EXISTS "meetings: read via own recommendation" ON meetings;

ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
