-- Phase 2, item 3 — 21-day concrete availability window (alignment plan).
--   available_from — a near-term availability floor. Empty means "available
--     now". The matcher requires a concrete overlapping slot within 21 days of
--     the cycle start, honoring this floor, so a counterpart who is unavailable
--     for the near term is deferred rather than surfaced (L2-S3).

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS available_from TEXT NOT NULL DEFAULT '';
