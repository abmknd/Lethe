const RESEND_API = "https://api.resend.com/emails";

function fromAddress(): string {
  return Deno.env.get("RESEND_FROM_EMAIL") ?? "Relethe <intros@mail.relethe.com>";
}

function buildIntroHtml({
  recipientName,
  otherName,
  otherBio,
  otherIntroText,
  insightText,
}: {
  recipientName: string;
  otherName: string;
  otherBio?: string | null;
  otherIntroText?: string | null;
  insightText?: string | null;
}): string {
  const why = insightText || otherIntroText || otherBio || "";
  return `
<p>Hi ${recipientName},</p>
<p>
  We thought you and <strong>${otherName}</strong> should meet.
</p>
${why ? `<blockquote>${why}</blockquote>` : ""}
<p>
  Reply to this email to get in touch, or log in to Relethe to view their full profile.
</p>
<p>— The Relethe team</p>
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
}: {
  requesterProfile: {
    user: { name: string; email: string | null; bio?: string | null };
    preferences?: { introText?: string | null } | null;
  };
  candidateProfile: {
    user: { name: string; email: string | null; bio?: string | null };
    preferences?: { introText?: string | null } | null;
  };
  insightText?: string | null;
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
