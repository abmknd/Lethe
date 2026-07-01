-- Lock waitlist inserts to the signup Edge Function (service role).
-- After this migration the anon client can no longer write to waitlist
-- directly; all submissions must go through /functions/v1/signup.
-- Apply only AFTER the signup function is deployed and the frontend is
-- cut over, otherwise live form submissions will fail.

revoke insert on table public.waitlist from anon;
revoke insert on table public.waitlist from authenticated;
