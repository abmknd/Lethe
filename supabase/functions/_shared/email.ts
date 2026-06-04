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

// Next concrete date at the given UTC day-of-week + hour, expressed as a UTC
// ISO timestamp. Approximation: the slot's local hour is treated as UTC.
// TODO: respect slot.timezone — currently a user with availability stored
// in America/Los_Angeles gets a calendar event at that hour in UTC.
export function nextOccurrenceUtc(slot: ProfileSlot, from: Date = new Date()): { startUtc: Date; endUtc: Date } {
  const todayDow = from.getUTCDay();
  const daysUntil = ((slot.dayOfWeek - todayDow) + 7) % 7 || 7;
  const target = new Date(Date.UTC(
    from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + daysUntil,
    slot.startHour, 0, 0,
  ));
  const end = new Date(target.getTime() + (Math.max(1, slot.endHour - slot.startHour) * 60 * 60 * 1000));
  return { startUtc: target, endUtc: end };
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
