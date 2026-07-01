-- Phase 8 — Messaging MVP schema
--
-- Model: one persistent conversation per participant pair. Eligibility
-- (mutual-accept recommendation OR sent intro) is enforced in the
-- conversations edge function, not in SQL.
--
-- Conventions: user IDs are TEXT (matches users.id). Policies scope rows
-- via relethe_user_id() (renamed from lethe_user_id() in the prior migration).
-- Inserts/updates on conversations and messages go through Edge Functions
-- with the service key; RLS gives clients read-only and self-send access.

begin;

-- ── conversations ─────────────────────────────────────────────────────────────
-- One row per unordered pair (a, b) where a < b. The ordering check + UNIQUE
-- constraint prevents duplicate threads from concurrent eligibility races.

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

-- ── messages ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at);

-- Keep conversations.last_message_at in sync with the newest message.
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

-- ── conversation_reads ────────────────────────────────────────────────────────
-- Per-user read watermark. Unread count is derived at query time as
--   count(messages where created_at > last_read_at and sender_id != me).

CREATE TABLE IF NOT EXISTS conversation_reads (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_reads ENABLE ROW LEVEL SECURITY;

-- conversations: participants can read their own rows; no client INSERT
-- (creation runs through the edge function with the service key, which is
-- where the eligibility check lives).
DROP POLICY IF EXISTS "conversations: read own" ON conversations;
CREATE POLICY "conversations: read own"
  ON conversations FOR SELECT
  USING (relethe_user_id() IN (participant_a, participant_b));

-- messages: participants can read; senders can insert their own messages
-- into conversations they participate in.
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

-- conversation_reads: a user manages only their own watermark.
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

commit;
