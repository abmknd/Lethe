const RESEND_API = 'https://api.resend.com/emails';

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? 'Lethe <intros@lethe.so>';
}

function buildIntroHtml({ recipientName, otherName, otherBio, otherIntroText, insightText }) {
  const why = insightText || otherIntroText || otherBio || '';
  return `
<p>Hi ${recipientName},</p>
<p>
  We thought you and <strong>${otherName}</strong> should meet.
</p>
${why ? `<blockquote>${why}</blockquote>` : ''}
<p>
  Reply to this email to get in touch, or log in to Lethe to view their full profile.
</p>
<p>— The Lethe team</p>
  `.trim();
}

async function sendOne({ apiKey, to, subject, html }) {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function sendIntroEmails({ requesterProfile, candidateProfile, insightText }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping intro emails');
    return { ok: false, reason: 'no_api_key' };
  }

  const requester = requesterProfile.user;
  const candidate = candidateProfile.user;

  if (!requester.email || !candidate.email) {
    console.warn('[email] Missing email on one or both users — skipping intro emails');
    return { ok: false, reason: 'missing_email' };
  }

  const [r1, r2] = await Promise.all([
    sendOne({
      apiKey,
      to: requester.email,
      subject: `Meet ${candidate.name} on Lethe`,
      html: buildIntroHtml({
        recipientName: requester.name,
        otherName: candidate.name,
        otherBio: candidate.bio,
        otherIntroText: candidateProfile.preferences?.introText,
        insightText,
      }),
    }),
    sendOne({
      apiKey,
      to: candidate.email,
      subject: `${requester.name} would like to meet you on Lethe`,
      html: buildIntroHtml({
        recipientName: candidate.name,
        otherName: requester.name,
        otherBio: requester.bio,
        otherIntroText: requesterProfile.preferences?.introText,
        insightText,
      }),
    }),
  ]);

  return { ok: true, ids: [r1.id, r2.id] };
}
