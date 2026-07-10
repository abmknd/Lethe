-- Phase 2, item 2 — candidate pre-filter fields (alignment plan).
--   company_stage   — self-declared stage (idea → scale).
--   meet_stages     — accepted candidate stages; empty means no constraint.
--                     Enforced as a hard pre-filter in the matcher (L2-S6).
--   not_looking_for — declared archetypes to exclude; a token matching a
--                     candidate's user_type hard-excludes the pair (L2-S7).

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS company_stage   TEXT  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meet_stages     JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS not_looking_for JSONB NOT NULL DEFAULT '[]';
