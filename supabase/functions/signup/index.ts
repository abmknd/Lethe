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
          text: `You're on the Relethe waitlist.\nWe'll reach out when it's time. Don't hold your breath, but don't forget about us either.\n\nStay gracious,\n\nAbiola Makinde\nCo-founder, Relethe`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; }
    body { background-color: #0a0a0a !important; color: #e8e8e8 !important; }
    .wrapper { background-color: #0a0a0a !important; }
    .inner { background-color: #0a0a0a !important; }
  </style>
</head>
<body bgcolor="#0a0a0a" style="margin:0;padding:0;background-color:#0a0a0a !important;font-family:Georgia,serif;">
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0a0a0a" style="background-color:#0a0a0a !important;padding:48px 24px">
    <tr><td align="center">
      <table class="inner" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0a0a0a" style="max-width:480px;background-color:#0a0a0a !important">
        <tr><td style="padding-bottom:40px">
          <img src="https://raw.githubusercontent.com/abmknd/relethe/main/public/logomark.png" width="32" height="32" alt="Relethe" style="display:block">
        </td></tr>
        <tr><td style="padding-bottom:32px">
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#e8e8e8">You're on the Relethe waitlist.</p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#e8e8e8">We'll reach out when it's time. Don't hold your breath, but don't forget about us either.</p>
        </td></tr>
        <tr><td style="padding-bottom:48px">
          <p style="margin:0 0 20px;font-size:14px;color:#888;font-style:italic">Stay gracious,</p>
          <p style="margin:0;font-size:14px;color:#e8e8e8;font-weight:600">Abiola Makinde</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;font-family:monospace;letter-spacing:.05em">Co-founder, Relethe</p>
        </td></tr>
        <tr><td style="border-top:1px solid #222;padding-top:24px">
          <p style="margin:0;font-size:11px;color:#444;font-family:monospace;letter-spacing:.05em">relethe.com</p>
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
