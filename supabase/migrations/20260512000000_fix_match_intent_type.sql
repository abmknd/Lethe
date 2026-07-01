-- Fix preferences.match_intent column type: TEXT → JSONB
-- The initial migration declared this as TEXT but the repository inserts and
-- reads it as a JSONB array. TEXT storage causes matchIntent to come back as
-- the string '[]' instead of an empty array, breaking the matching engine.
ALTER TABLE preferences
  ALTER COLUMN match_intent TYPE JSONB USING match_intent::jsonb,
  ALTER COLUMN match_intent SET DEFAULT '[]';
