// Daily.co room configuration — pure helpers, no I/O.
//
// The request *shape* (name sanitization, expiry math, room properties) lives
// here so it is unit-testable under `node --test`. The actual HTTPS call is a
// thin adapter in the edge runtime (supabase/functions/_shared/daily.ts) that
// imports these. No `node:crypto` or other node-only builtins, so the edge
// (Deno) can import this module directly, same as the other mvp domain modules.

export const DAILY_API_ROOMS_URL = 'https://api.daily.co/v1/rooms';
export const DAILY_PROVIDER = 'daily';

const ROOM_NAME_PREFIX = 'relethe-';
const MAX_ROOM_NAME_LENGTH = 60;
const TTL_HOURS_AFTER_START = 6; // room stays open a while past the scheduled slot
const FALLBACK_TTL_DAYS = 14; // no concrete slot yet -> two-week window
const MIN_TTL_SECONDS = 3600; // never hand back an already-expired room
const MAX_PARTICIPANTS = 2; // a 1:1 intro

// Daily room names must match /^[A-Za-z0-9_-]+$/. Replace any other character
// with a hyphen, collapse runs, bound the length, and trim trailing hyphens so
// the name is always Daily-legal regardless of the recommendation id shape.
export function toDailyRoomName(seed, { prefix = ROOM_NAME_PREFIX } = {}) {
  const safe = String(seed ?? '')
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-');
  return `${prefix}${safe}`.slice(0, MAX_ROOM_NAME_LENGTH).replace(/-+$/, '');
}

// Room expiry as unix seconds. When we have a concrete scheduled start, the
// room lives a fixed window past it; otherwise it gets a two-week fallback so
// it is joinable while the pair coordinates. A past slot still yields a room
// that is valid for at least MIN_TTL_SECONDS from now.
export function computeRoomExp({ scheduledAt = null, now = new Date() } = {}) {
  const nowSec = Math.floor(now.getTime() / 1000);
  if (scheduledAt != null) {
    const start = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    if (!Number.isNaN(start.getTime())) {
      const expSec = Math.floor(start.getTime() / 1000) + TTL_HOURS_AFTER_START * 3600;
      return Math.max(expSec, nowSec + MIN_TTL_SECONDS);
    }
  }
  return nowSec + FALLBACK_TTL_DAYS * 24 * 3600;
}

// The POST body for `POST https://api.daily.co/v1/rooms`.
//
// `public` privacy keeps link-join parity with the retired Jitsi rooms for this
// slice; the identity gate (later Phase 3 slice) flips this to `private` with
// per-user meeting tokens. `exp` + `eject_at_room_exp` clean rooms up so they
// do not accumulate on the account.
export function buildDailyRoomConfig({ recommendationId, scheduledAt = null, now = new Date() } = {}) {
  return {
    name: toDailyRoomName(recommendationId),
    privacy: 'public',
    properties: {
      exp: computeRoomExp({ scheduledAt, now }),
      max_participants: MAX_PARTICIPANTS,
      enable_prejoin_ui: true,
      eject_at_room_exp: true,
    },
  };
}
