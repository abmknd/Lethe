// Pure, runtime-agnostic contract for the public signup edge function.
//
// Lives in plain ESM (no Deno or Node globals) so the same module can be
// imported by:
//   • the Deno edge function in ./index.ts
//   • node --test contract tests under mvp/tests/
//
// Keep this file free of side effects and IO. Anything that touches
// Supabase, fetch, or env vars belongs in index.ts.

export const SIGNUP_SOURCES = Object.freeze(["hero", "signup", "diagnostic", "founding"]);

// Matches the live regex in the prior edge function: one `@`, one `.`, no
// whitespace. Permissive on purpose — strict validation happens server-side
// via Supabase Auth when the user actually signs in.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

/**
 * Validate and normalize a signup request body.
 * Returns either { ok: true, value: { email, source, name } } or
 * { ok: false, error: <string> }.
 */
export function parseSignupInput(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body" };
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = body.source;
  const name = typeof body.name === "string" ? (body.name.trim() || null) : null;

  if (!email || !EMAIL_RE.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "Invalid email" };
  }
  if (!SIGNUP_SOURCES.includes(source)) {
    return { ok: false, error: "Invalid source" };
  }
  return { ok: true, value: { email, source, name } };
}

/**
 * Build the waitlist row sent to Supabase. The country field is always
 * present (possibly null) so callers don't have to remember to add it.
 * Optional name is omitted entirely when not provided, so the DB default
 * applies rather than NULL overriding it.
 */
export function buildWaitlistRow({ email, source, name, country }) {
  const row = { email, source, country: country ?? null };
  if (name) row.name = name;
  return row;
}

/**
 * Classify a Supabase insert outcome into the public response status.
 * `error` is the PostgrestError-shaped object (or null for success).
 */
export function classifyInsertResult(error) {
  if (!error) return { status: "created" };
  if (error.code === "23505") return { status: "duplicate" };
  return { status: "error" };
}

/**
 * Stable non-cryptographic digest for log lines. Not for security — just
 * keeps raw email PII out of logs while preserving correlation.
 */
export function hashEmail(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}
