-- ────────────────────────────────────────────────────────────────────────────
-- Bundle: pending migrations for the Edge Function cutover (2026-05-29)
-- ────────────────────────────────────────────────────────────────────────────
-- Includes:
--   1) 20260519000001_phase8_messaging         — conversations, messages,
--                                                conversation_reads, RLS
--   2) 20260519000002_settings_persistence    — users.dob + preferences cols
--
-- Idempotent: safe to re-run. Wrap in BEGIN/COMMIT so partial failures roll back.
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- ────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── (1) Phase 8 messaging ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id                              TEXT PRIMARY KEY,
  participant_a                   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_b                   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unlocked_by_recommendation_id   TEXT REFERENCES recommendations(id) ON DELETE SET NULL,
  created_at                      TIMESTAMPTZ NOT NULL,
  last_message_at                 TIMESTAMPTZ,
  CONSTRAINT conversations_ordered_pair CHECK (participant_a < participant_b),
  CONSTRAINT conversations_unique_pair  UNIQUE (participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_a
  ON conversations (participant_a, last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b
  ON conversations (participant_b, last_message_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at);

CREATE OR REPLACE FUNCTION public.touch_conversation_last_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations
     SET last_message_at = NEW.created_at
   WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_touch_conversation ON messages;
CREATE TRIGGER messages_touch_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_last_message();

CREATE TABLE IF NOT EXISTS conversation_reads (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations: read own" ON conversations;
CREATE POLICY "conversations: read own"
  ON conversations FOR SELECT
  USING (relethe_user_id() IN (participant_a, participant_b));

DROP POLICY IF EXISTS "messages: read via own conversation" ON messages;
CREATE POLICY "messages: read via own conversation"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
       WHERE relethe_user_id() IN (participant_a, participant_b)
    )
  );

DROP POLICY IF EXISTS "messages: send own" ON messages;
CREATE POLICY "messages: send own"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = relethe_user_id()
    AND conversation_id IN (
      SELECT id FROM conversations
       WHERE relethe_user_id() IN (participant_a, participant_b)
    )
  );

DROP POLICY IF EXISTS "conversation_reads: read own" ON conversation_reads;
CREATE POLICY "conversation_reads: read own"
  ON conversation_reads FOR SELECT
  USING (user_id = relethe_user_id());

DROP POLICY IF EXISTS "conversation_reads: insert own" ON conversation_reads;
CREATE POLICY "conversation_reads: insert own"
  ON conversation_reads FOR INSERT
  WITH CHECK (
    user_id = relethe_user_id()
    AND conversation_id IN (
      SELECT id FROM conversations
       WHERE relethe_user_id() IN (participant_a, participant_b)
    )
  );

DROP POLICY IF EXISTS "conversation_reads: update own" ON conversation_reads;
CREATE POLICY "conversation_reads: update own"
  ON conversation_reads FOR UPDATE
  USING (user_id = relethe_user_id())
  WITH CHECK (user_id = relethe_user_id());

-- ── (2) Settings persistence fields ──────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS dob TEXT;

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS languages          JSONB   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS meeting_frequency  TEXT    NOT NULL DEFAULT 'every_week',
  ADD COLUMN IF NOT EXISTS learn_about        TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ask_about          TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS who_to_meet        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB   NOT NULL DEFAULT '{}';

COMMIT;

-- ── Verification (read-only; run separately and inspect results) ─────────────
-- Expect rows for: dob, languages, meeting_frequency, learn_about, ask_about,
--                  who_to_meet, notification_prefs (in 'users' + 'preferences'),
-- plus tables conversations / messages / conversation_reads existing.

-- SELECT table_name, column_name
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND ((table_name = 'users'       AND column_name = 'dob')
--      OR (table_name = 'preferences' AND column_name IN
--            ('languages','meeting_frequency','learn_about','ask_about',
--             'who_to_meet','notification_prefs')))
--  ORDER BY table_name, column_name;

-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema = 'public'
--    AND table_name IN ('conversations','messages','conversation_reads');
