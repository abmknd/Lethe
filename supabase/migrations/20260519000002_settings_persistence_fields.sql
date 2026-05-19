-- Settings persistence — additional user/preference fields surfaced in SettingsPage.
-- Adds: users.dob, plus preferences.{languages, meeting_frequency, learn_about,
-- ask_about, who_to_meet, notification_prefs}.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS dob TEXT;

ALTER TABLE preferences
  ADD COLUMN IF NOT EXISTS languages          JSONB   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS meeting_frequency  TEXT    NOT NULL DEFAULT 'every_week',
  ADD COLUMN IF NOT EXISTS learn_about        TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ask_about          TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS who_to_meet        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB   NOT NULL DEFAULT '{}';
