import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { email, source, name } = await req.json();

    if (!email || !source) {
      return new Response(JSON.stringify({ status: "error" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const country = req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ?? null;

    const { error } = await supabase.from("waitlist").insert({
      email,
      source,
      name: name ?? null,
      country,
    });

    if (error) {
      if (error.code === "23505") {
        return new Response(JSON.stringify({ status: "duplicate", email }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("insert error:", error);
      return new Response(JSON.stringify({ status: "error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send confirmation email via Resend (best-effort — don't fail signup if email fails)
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
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
      console.error("email send failed:", emailErr);
    }

    return new Response(JSON.stringify({ status: "created", email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("unexpected error:", err);
    return new Response(JSON.stringify({ status: "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
