-- Rebrand: rename lethe_user_id() → relethe_user_id().
-- ALTER FUNCTION ... RENAME preserves the function OID, so all dependent RLS
-- policies (preferences, availability_slots, recommendations, outcomes, events,
-- meetings, weekly_cep) automatically follow the new name. No policy recreation
-- required.
--
-- The source-of-truth file supabase/policies/rls.sql has been updated to use
-- the new name; do not re-apply it before this migration runs.

begin;

alter function public.lethe_user_id() rename to relethe_user_id;

commit;
