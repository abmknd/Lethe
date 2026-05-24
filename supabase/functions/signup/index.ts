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
