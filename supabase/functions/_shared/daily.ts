// Daily.co room adapter (edge runtime).
//
// Creates the embedded video room for a mutual-accepted match (Phase 3, item
// 3). The request shape comes from the pure, node-tested builder in
// mvp/integrations/daily.mjs; this module only performs the HTTPS call and
// normalizes the result. It mirrors the Resend adapter in email.ts: it reads
// its key from the environment and never throws, so a provider outage can
// never crash the mutual-accept flow — the caller falls back on { ok: false }.

import {
  buildDailyRoomConfig,
  DAILY_API_ROOMS_URL,
  DAILY_PROVIDER,
} from "../../../mvp/integrations/daily.mjs";

export interface DailyRoom {
  provider: string; // DAILY_PROVIDER
  url: string;
  name: string;
}

export type CreateDailyRoomResult =
  | { ok: true; room: DailyRoom }
  | { ok: false; reason: string };

function toRoom(body: { url?: unknown; name?: unknown }): DailyRoom {
  return {
    provider: DAILY_PROVIDER,
    url: String(body.url ?? ""),
    name: String(body.name ?? ""),
  };
}

// GET an existing room by name. Used only to recover from the "already exists"
// race when a pair's accept is retried; returns null on any failure.
async function fetchDailyRoom(apiKey: string, name: string): Promise<DailyRoom | null> {
  try {
    const res = await fetch(`${DAILY_API_ROOMS_URL}/${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    return toRoom(await res.json());
  } catch {
    return null;
  }
}

export async function createDailyRoom(
  { recommendationId, scheduledAt }: { recommendationId: string; scheduledAt: string | null },
): Promise<CreateDailyRoomResult> {
  const apiKey = Deno.env.get("DAILY_API_KEY");
  if (!apiKey) {
    console.warn("[daily] DAILY_API_KEY not set — cannot create room");
    return { ok: false, reason: "no_api_key" };
  }

  const config = buildDailyRoomConfig({ recommendationId, scheduledAt });

  try {
    const res = await fetch(DAILY_API_ROOMS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      return { ok: true, room: toRoom(await res.json()) };
    }

    // A retried accept can collide with the room created on the first accept.
    // Daily answers 400 with an "already exists" message; reuse that room
    // rather than failing the reveal.
    const errText = await res.text();
    if (res.status === 400 && /already exists/i.test(errText)) {
      const existing = await fetchDailyRoom(apiKey, config.name);
      if (existing) return { ok: true, room: existing };
    }

    console.error(`[daily] create failed ${res.status}: ${errText}`);
    return { ok: false, reason: `http_${res.status}` };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[daily] create threw:", reason);
    return { ok: false, reason };
  }
}
