-- Post-launch QA migration bundle — Abiola pastes this into the SQL Editor.
-- Idempotent: safe to run multiple times, no destructive drops.
-- Covers issues: #75.3, #76.2, #76.3, #78.2.

BEGIN;

-- ── #75.3: waitlist.handle ─────────────────────────────────────────────────
-- Landing-page form now collects an optional handle. The signup Edge Function
-- writes it here; first sign-in copies it onto users.handle via
-- findOrCreateUserByAuthId.
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS handle TEXT;
CREATE INDEX IF NOT EXISTS waitlist_handle_idx ON public.waitlist (lower(handle))
  WHERE handle IS NOT NULL;

-- ── #76.2: meeting_format TEXT → JSONB array ───────────────────────────────
-- Old rows stored a single value ('video'). New shape is an array so users can
-- pick multiple formats. Coerce existing values into single-element arrays.
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'preferences' AND column_name = 'meeting_format';

  IF col_type = 'text' THEN
    ALTER TABLE public.preferences
      ALTER COLUMN meeting_format DROP DEFAULT,
      ALTER COLUMN meeting_format TYPE JSONB
        USING CASE
          WHEN meeting_format IS NULL OR meeting_format = '' THEN '["video"]'::jsonb
          ELSE jsonb_build_array(meeting_format)
        END,
      ALTER COLUMN meeting_format SET DEFAULT '["video"]'::jsonb,
      ALTER COLUMN meeting_format SET NOT NULL;
  END IF;
END $$;

-- ── #76.3: users.last_seen_matches_at ──────────────────────────────────────
-- Drives the new-match badge on the SUGGESTIONS tab. Stamped when the user
-- visits Suggestions; compared against recommendations.updated_at to count
-- approvals the user hasn't seen yet.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_seen_matches_at TIMESTAMPTZ;

-- ── #78.2: users.avatar_url + avatars bucket + RLS ─────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Public-read avatars bucket. Anyone can fetch by URL (image is meant to be
-- shown to matched users + on the public profile). Only the owner can write,
-- and only under {auth.uid()}/* — enforced by storage policies below.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Owner-write policies. The folder layout is `{userId}/avatar.{ext}`; we
-- match the first path segment against auth.uid() so users can only mutate
-- their own object.
DO $$ BEGIN
  CREATE POLICY "avatars_public_read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_owner_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_owner_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_owner_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
