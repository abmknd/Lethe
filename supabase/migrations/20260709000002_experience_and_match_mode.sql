-- Phase 2, item 2 — scoring fields (alignment plan).
--   experience_level — self-declared experience (first_time → veteran). Closer
--                      levels score higher unless mentor matching is requested (L2-S4).
--   mentor_match     — opt-in to mentor-style pairings; welcomes an experience
--                      gap instead of penalizing it.
--   match_mode       — 'match_my_ask' (default) weights ask/offer complementarity
--                      heavily; 'surprise_me' de-emphasizes it for serendipity (L2-S1).

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS experience_level TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mentor_match     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS match_mode       TEXT    NOT NULL DEFAULT 'match_my_ask';
