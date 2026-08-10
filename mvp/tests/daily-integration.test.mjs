import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toDailyRoomName,
  computeRoomExp,
  buildDailyRoomConfig,
  DAILY_PROVIDER,
  DAILY_API_ROOMS_URL,
} from '../integrations/daily.mjs';

test('toDailyRoomName keeps Daily-legal ids intact', () => {
  assert.equal(toDailyRoomName('rec_abc-123'), 'relethe-rec_abc-123');
});

test('toDailyRoomName sanitizes illegal characters and collapses runs', () => {
  const name = toDailyRoomName('weird id!@#  here');
  assert.match(name, /^[A-Za-z0-9_-]+$/);
  assert.doesNotMatch(name, /-{2,}/);
});

test('toDailyRoomName bounds length and trims trailing hyphens', () => {
  const name = toDailyRoomName('x'.repeat(200));
  assert.ok(name.length <= 60, `expected <=60, got ${name.length}`);
  assert.doesNotMatch(name, /-$/);
});

test('computeRoomExp uses slot start plus a fixed window when scheduled', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const scheduledAt = new Date('2026-08-12T15:00:00Z');
  const exp = computeRoomExp({ scheduledAt, now });
  assert.equal(exp, Math.floor(scheduledAt.getTime() / 1000) + 6 * 3600);
});

test('computeRoomExp never returns an already-expired room for a past slot', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const scheduledAt = new Date('2026-08-01T00:00:00Z'); // in the past
  const exp = computeRoomExp({ scheduledAt, now });
  assert.ok(exp >= Math.floor(now.getTime() / 1000) + 3600);
});

test('computeRoomExp falls back to a two-week window without a slot', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const exp = computeRoomExp({ scheduledAt: null, now });
  assert.equal(exp, Math.floor(now.getTime() / 1000) + 14 * 24 * 3600);
});

test('computeRoomExp tolerates an invalid scheduledAt by using the fallback', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const exp = computeRoomExp({ scheduledAt: 'not-a-date', now });
  assert.equal(exp, Math.floor(now.getTime() / 1000) + 14 * 24 * 3600);
});

test('buildDailyRoomConfig produces a 1:1 public expiring room', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const config = buildDailyRoomConfig({ recommendationId: 'rec_abc-123', scheduledAt: null, now });
  assert.equal(config.name, 'relethe-rec_abc-123');
  assert.equal(config.privacy, 'public');
  assert.equal(config.properties.max_participants, 2);
  assert.equal(config.properties.enable_prejoin_ui, true);
  assert.equal(config.properties.eject_at_room_exp, true);
  assert.equal(config.properties.exp, Math.floor(now.getTime() / 1000) + 14 * 24 * 3600);
});

test('module exposes the Daily provider tag and rooms endpoint', () => {
  assert.equal(DAILY_PROVIDER, 'daily');
  assert.equal(DAILY_API_ROOMS_URL, 'https://api.daily.co/v1/rooms');
});
