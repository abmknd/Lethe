// Public signup Edge Function — single backend path for all waitlist
// submissions from the landing page funnel. Deploy with verify_jwt = false.
//
// Pure input/output contract lives in ./contract.mjs so it can be tested
// from Node CI without Supabase credentials.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsPreflightResponse, json } from "../_shared/cors.ts";
import {
  buildWaitlistRow,
  classifyInsertResult,
  hashEmail,
  parseSignupInput,
} from "./contract.mjs";

async function enrichCountry(req: Request): Promise<string | null> {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  if (!ip) return null;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.country_name === "string" ? data.country_name : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return corsPreflightResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = parseSignupInput(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const { email, source, name, handle } = parsed.value;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[signup] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const country = await enrichCountry(req);
  const row = buildWaitlistRow({ email, source, name, country, handle });

  const { error } = await admin.from("waitlist").insert(row);
  const outcome = classifyInsertResult(error);

  if (outcome.status === "duplicate") {
    console.log(`[signup] source=${source} status=duplicate email_h=${hashEmail(email)}`);
    return json({ status: "duplicate", email });
  }

  if (outcome.status === "error") {
    console.error(`[signup] insert failed source=${source} email_h=${hashEmail(email)}`, error);
    return json({ error: "Internal error" }, 500);
  }

  console.log(`[signup] source=${source} status=created email_h=${hashEmail(email)} country=${country ?? "?"}`);

  await sendConfirmationEmail(email);

  return json({ status: "created", email });
});

async function sendConfirmationEmail(email: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Abi from Relethe <abi@mail.relethe.com>",
        reply_to: "abiola@relethe.com",
        to: [email],
        subject: "You signed up. Good call.",
        text: `You're on the Relethe waitlist.\nWe'll reach out when it's time. Don't hold your breath, but don't forget about us either.\n\nStay gracious,\n\nAbi\nCo-founder, Relethe`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    body { margin:0; padding:0; font-family:Georgia,serif; color:#111111; }
    .body-text { color:#111111; }
    .sub-text { color:#555555; }
    .mono-text { color:#777777; }
    .divider { border-top:1px solid #dddddd; }
    @media (prefers-color-scheme: dark) {
      .body-text { color:#e8e8e8 !important; }
      .sub-text { color:#999999 !important; }
      .mono-text { color:#666666 !important; }
      .divider { border-top-color:#333333 !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr><td style="padding-bottom:40px">
          <img src="https://raw.githubusercontent.com/abmknd/relethe/main/public/logomark.png" width="32" height="32" alt="Relethe" style="display:block">
        </td></tr>
        <tr><td style="padding-bottom:32px">
          <p class="body-text" style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#111111">You're on the Relethe waitlist.</p>
          <p class="body-text" style="margin:0;font-size:16px;line-height:1.7;color:#111111">We'll reach out when it's time. Don't hold your breath, but don't forget about us either.</p>
        </td></tr>
        <tr><td style="padding-bottom:48px">
          <p class="sub-text" style="margin:0 0 20px;font-size:14px;color:#555555;font-style:italic">Stay gracious,</p>
          <p class="body-text" style="margin:0;font-size:14px;color:#111111;font-weight:600">Abi</p>
          <p class="mono-text" style="margin:4px 0 0;font-size:12px;color:#777777;font-family:monospace;letter-spacing:.05em">Co-founder, Relethe</p>
        </td></tr>
        <tr><td class="divider" style="border-top:1px solid #dddddd;padding-top:24px">
          <p class="mono-text" style="margin:0;font-size:11px;color:#777777;font-family:monospace;letter-spacing:.05em;text-decoration:none"><span style="color:inherit;text-decoration:none">relethe.com</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });
  } catch (emailErr) {
    console.error("[signup] confirmation email send failed:", emailErr);
  }
}
