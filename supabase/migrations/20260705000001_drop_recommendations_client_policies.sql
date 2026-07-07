-- Follow-up to 20260705000000. `recommendations` already had RLS enabled but
-- with a permissive policy, so enabling RLS alone did not close the leak: an
-- authenticated client could still read the whole table. Clients never read
-- recommendations directly (they go through the `api` edge function, which
-- bypasses RLS via a direct connection), so all client-facing policies should
-- go, leaving deny-all — same posture as `matches` and `trust_signals`.
--
-- Drop every existing policy on the table by name (we don't assume the name),
-- then ensure RLS stays enabled.

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recommendations'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.recommendations', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
