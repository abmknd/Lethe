// Public signup Edge Function — single backend path for all waitlist
// submissions from the landing page funnel. Deploy with verify_jwt = false.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsPreflightResponse, json } from "../_shared/cors.ts";

const SOURCES = ["hero", "signup", "diagnostic", "founding"] as const;
type Source = typeof SOURCES[number];

interface SignupInput {
  email: string;
  source: Source;
  name?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashEmail(email: string): string {
  // Stable non-reversible-ish digest for logs. Not crypto, just PII reduction.
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

function parseInput(body: unknown): SignupInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const source = b.source as Source;
  const name = typeof b.name === "string" ? b.name.trim() || null : null;
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { error: "Invalid email" };
  }
  if (!SOURCES.includes(source)) return { error: "Invalid source" };
  return { email, source, name };
}

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

  const parsed = parseInput(body);
  if ("error" in parsed) return json({ error: parsed.error }, 400);
  const { email, source, name } = parsed;

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

  const row: Record<string, unknown> = { email, source, country };
  if (name) row.name = name;

  const { error } = await admin.from("waitlist").insert(row);

  if (error) {
    if (error.code === "23505") {
      console.log(`[signup] source=${source} status=duplicate email_h=${hashEmail(email)}`);
      return json({ status: "duplicate", email });
    }
    console.error(`[signup] insert failed source=${source} email_h=${hashEmail(email)}`, error);
    return json({ error: "Internal error" }, 500);
  }

  console.log(`[signup] source=${source} status=created email_h=${hashEmail(email)} country=${country ?? "?"}`);

  // Confirmation email hook — currently a no-op on this branch.
  // PR #22 (intro email infra) will wire a Resend call here, gated on RESEND_API_KEY.

  return json({ status: "created", email });
});
