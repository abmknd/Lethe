const RESEND_API = "https://api.resend.com/emails";

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fromAddress(): string {
  return Deno.env.get("RESEND_FROM_EMAIL") ?? "Relethe <intros@mail.relethe.com>";
}

function appOrigin(): string {
  return Deno.env.get("APP_ORIGIN") ?? "https://relethe.com";
}

export interface ProfileSlot {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  timezone?: string;
}

export interface MeetingDetails {
  meetingUrl: string;
  startUtc: Date;
  endUtc: Date;
  slot: ProfileSlot | null;
}

// First overlapping availability slot across the two users, in either user's
// timezone-naïve weekly grid. Conservative: if no slot data exists we return
// null and the email falls back to "reply to coordinate" copy.
export function firstOverlapSlot(slotsA: ProfileSlot[], slotsB: ProfileSlot[]): ProfileSlot | null {
  const sorted = [...slotsA].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startHour - b.startHour);
  for (const a of sorted) {
    for (const b of slotsB) {
      if (a.dayOfWeek !== b.dayOfWeek) continue;
      const start = Math.max(a.startHour, b.startHour);
      const end = Math.min(a.endHour, b.endHour);
      if (end > start) return { dayOfWeek: a.dayOfWeek, startHour: start, endHour: end, timezone: a.timezone };
    }
  }
  return null;
}

// Returns the UTC Date corresponding to a local wall-clock time in the given
// IANA timezone. Works by treating the wall components as UTC, formatting that
// guess back through the zone, and shifting by the resulting offset — this
// gives the right answer for normal times and is within an hour for the two
// DST transition gaps each year (acceptable for an intro calendar invite).
function wallTimeInZoneToUtc(y: number, m: number, d: number, h: number, tz: string): Date {
  const utcGuess = new Date(Date.UTC(y, m - 1, d, h, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(utcGuess);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const seen = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return new Date(utcGuess.getTime() + (utcGuess.getTime() - seen));
}

// Local Y-M-D and day-of-week for a given UTC instant in the given zone.
function ymdInZone(d: Date, tz: string): { year: number; month: number; day: number; dow: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    dow: dowMap[get('weekday')],
  };
}

// Next concrete UTC instant that lands on slot.dayOfWeek at slot.startHour in
// the slot's IANA timezone (defaults to UTC). Walks forward a day at a time
// because day-of-week and DST mean naive arithmetic on UTC components can
// drift by 1 day twice a year in either direction.
export function nextOccurrenceUtc(slot: ProfileSlot, from: Date = new Date()): { startUtc: Date; endUtc: Date } {
  const tz = slot.timezone && slot.timezone.trim() ? slot.timezone : 'UTC';
  const durationMs = Math.max(1, slot.endHour - slot.startHour) * 60 * 60 * 1000;
  // Search starts tomorrow to mirror the prior `% 7 || 7` semantics (never
  // schedule for the same day) and caps at 14 days as a safety bound.
  for (let i = 1; i <= 14; i++) {
    const candidate = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const { year, month, day, dow } = ymdInZone(candidate, tz);
    if (dow !== slot.dayOfWeek) continue;
    const startUtc = wallTimeInZoneToUtc(year, month, day, slot.startHour, tz);
    return { startUtc, endUtc: new Date(startUtc.getTime() + durationMs) };
  }
  // Defensive fallback — should be unreachable given a 14-day window over a 7-day
  // cycle. Returns the legacy UTC-treats-local-as-UTC behaviour rather than throwing.
  const todayDow = from.getUTCDay();
  const daysUntil = ((slot.dayOfWeek - todayDow) + 7) % 7 || 7;
  const target = new Date(Date.UTC(
    from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + daysUntil,
    slot.startHour, 0, 0,
  ));
  return { startUtc: target, endUtc: new Date(target.getTime() + durationMs) };
}

function toGoogleCalendarDate(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildCalendarUrl(
  meeting: MeetingDetails,
  requesterEmail: string,
  candidateEmail: string,
  names: string,
): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Relethe intro — ${names}`,
    dates: `${toGoogleCalendarDate(meeting.startUtc)}/${toGoogleCalendarDate(meeting.endUtc)}`,
    details: `Join the video call: ${meeting.meetingUrl}\n\nRelethe scheduled this introduction. Reply to the intro email to reschedule if needed.`,
    location: meeting.meetingUrl,
    add: `${requesterEmail},${candidateEmail}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// whyMatched is stored TEXT in Postgres but used as string[] in the app.
// Tolerate both shapes so the email never breaks on a raw row.
function asReasonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
    } catch {
      // not JSON — fall through, treat as a single reason
    }
    return [value];
  }
  return [];
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function buildIntroHtml({
  recipientName,
  otherName,
  otherBio,
  otherIntroText,
  insightText,
  whyMatched,
  meeting,
  calendarUrl,
  profileUrl,
}: {
  recipientName: string;
  otherName: string;
  otherBio?: string | null;
  otherIntroText?: string | null;
  insightText?: string | null;
  whyMatched?: string[];
  meeting: MeetingDetails;
  calendarUrl?: string | null;
  profileUrl: string;
}): string {
  const why = insightText || otherIntroText || otherBio || "";
  const reasons = (whyMatched ?? []).slice(0, 4);
  const slot = meeting.slot;
  const slotLine = slot
    ? `${DAY_LABELS[slot.dayOfWeek] ?? 'Soon'}s at ${slot.startHour}:00${slot.timezone ? ` (${slot.timezone})` : ''}`
    : null;

  return `
<p>Hi ${escapeHtml(recipientName)},</p>
<p>
  We thought you and <strong>${escapeHtml(otherName)}</strong> should meet.
</p>
${why ? `<blockquote>${escapeHtml(why)}</blockquote>` : ""}
${reasons.length ? `
<p style="margin-top:16px;"><strong>Why you two:</strong></p>
<ul style="padding-left:18px;line-height:1.6;">
  ${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("\n  ")}
</ul>` : ""}
${slotLine ? `<p style="margin-top:16px;">Suggested time based on your overlapping availability: <strong>${escapeHtml(slotLine)}</strong>.</p>` : ""}
<p style="margin-top:20px;">
  <a href="${meeting.meetingUrl}" style="display:inline-block;padding:10px 18px;background:#7FFF00;color:#050705;text-decoration:none;border-radius:8px;font-weight:600;letter-spacing:0.04em;">Join call</a>
  ${calendarUrl ? `&nbsp;<a href="${calendarUrl}" style="display:inline-block;padding:10px 18px;background:transparent;color:#7FFF00;border:1px solid #7FFF00;text-decoration:none;border-radius:8px;font-weight:600;letter-spacing:0.04em;">Add to calendar</a>` : ""}
  &nbsp;<a href="${profileUrl}" style="color:#7FFF00;text-decoration:none;font-size:13px;">View profile →</a>
</p>
<p style="margin-top:20px;color:#666;font-size:13px;">
  Reply to this email to reschedule or coordinate an in-person meet instead.
</p>
<p style="color:#666;font-size:13px;">— The Relethe team</p>
  `.trim();
}

async function sendOne(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ id: string }> {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

// Wrap sendOne so a single send failure can't reject the whole Promise.all
// and crash the admin approval flow. The caller (admin approval) records
// intro_sent only when at least one recipient was successfully notified.
async function sendOneSafe(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  try {
    const result = await sendOne(apiKey, to, subject, html);
    return { ok: true, id: result.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[email] send failed:", reason);
    return { ok: false, reason };
  }
}

export async function sendIntroEmails({
  requesterProfile,
  candidateProfile,
  insightText,
  whyMatched,
  meeting,
}: {
  requesterProfile: {
    user: { id?: string; name: string; email: string | null; bio?: string | null };
    preferences?: { introText?: string | null } | null;
  };
  candidateProfile: {
    user: { id?: string; name: string; email: string | null; bio?: string | null; handle?: string | null };
    preferences?: { introText?: string | null } | null;
  };
  insightText?: string | null;
  whyMatched?: unknown;
  meeting: MeetingDetails;
}): Promise<{ ok: boolean; ids?: string[]; reason?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping intro emails");
    return { ok: false, reason: "no_api_key" };
  }

  const requester = requesterProfile.user;
  const candidate = candidateProfile.user;

  if (!requester.email || !candidate.email) {
    console.warn("[email] Missing email on one or both users — skipping intro emails");
    return { ok: false, reason: "missing_email" };
  }

  const reasons = asReasonList(whyMatched);
  // Only offer the calendar add-to-calendar link when we actually picked a
  // real overlapping slot. Otherwise the email still includes the Jitsi
  // "Join call" button — users can hit reply to coordinate a time.
  const calendarUrl = meeting.slot
    ? buildCalendarUrl(meeting, requester.email, candidate.email, `${requester.name} & ${candidate.name}`)
    : null;
  const origin = appOrigin();
  const candidateProfileUrl = `${origin}/u/${encodeURIComponent(candidate.handle ?? candidate.id ?? '')}`;
  const requesterProfileUrl = `${origin}/u/${encodeURIComponent(requester.id ?? '')}`;

  const [r1, r2] = await Promise.all([
    sendOneSafe(
      apiKey,
      requester.email,
      `Meet ${candidate.name} on Relethe`,
      buildIntroHtml({
        recipientName: requester.name,
        otherName: candidate.name,
        otherBio: candidate.bio,
        otherIntroText: candidateProfile.preferences?.introText,
        insightText,
        whyMatched: reasons,
        meeting,
        calendarUrl,
        profileUrl: candidateProfileUrl,
      }),
    ),
    sendOneSafe(
      apiKey,
      candidate.email,
      `${requester.name} would like to meet you on Relethe`,
      buildIntroHtml({
        recipientName: candidate.name,
        otherName: requester.name,
        otherBio: requester.bio,
        otherIntroText: requesterProfile.preferences?.introText,
        insightText,
        whyMatched: reasons,
        meeting,
        calendarUrl,
        profileUrl: requesterProfileUrl,
      }),
    ),
  ]);

  const ids = [r1, r2].filter((r) => r.ok).map((r) => (r as { ok: true; id: string }).id);
  const failures = [r1, r2].filter((r) => !r.ok) as { ok: false; reason: string }[];

  if (ids.length === 0) {
    return { ok: false, reason: failures[0]?.reason ?? "all_sends_failed" };
  }
  if (failures.length > 0) {
    console.warn(`[email] partial send: ${ids.length} of 2 succeeded`);
  }
  return { ok: true, ids };
}
