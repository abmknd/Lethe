-- Phase 2, item 1 — layered same-org exclusion (alignment plan, decision 1).
-- Org anchors declared during onboarding and used by the matcher to exclude
-- colleagues from each other's candidate pool:
--   company_name — self-declared, normalized before comparison in the matcher.
--   work_email   — optional verified work email; its domain is a strong org signal.
--   linkedin_url — HITL spot-check artifact only; never a matcher filter.

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS work_email   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT NOT NULL DEFAULT '';
