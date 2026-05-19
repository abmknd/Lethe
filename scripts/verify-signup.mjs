#!/usr/bin/env node
// Smoke-test the public signup Edge Function.
// Run after `supabase functions deploy signup` and the waitlist
// columns migration is applied.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   node scripts/verify-signup.mjs
//
// Service-role key is only used to clean up test rows after the run.

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const FN_URL = `${SUPABASE_URL}/functions/v1/signup`;
const RUN_ID = Math.random().toString(36).slice(2, 8);
const TEST_EMAILS = [
  `verify-hero-${RUN_ID}@example.invalid`,
  `verify-signup-${RUN_ID}@example.invalid`,
  `verify-dup-${RUN_ID}@example.invalid`,
];

let passed = 0;
let failed = 0;
const ok = (l) => { console.log(`  ✓  ${l}`); passed++; };
const fail = (l, d) => { console.error(`  ✗  ${l}`); if (d) console.error(`     ${d}`); failed++; };

async function call(body) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "apikey": SUPABASE_ANON_KEY, "authorization": `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* leave null */ }
  return { status: res.status, json, text };
}

console.log(`\nsignup verification — run ${RUN_ID}\n`);

// 1. Happy path: hero
{
  const r = await call({ email: TEST_EMAILS[0], source: "hero" });
  r.status === 200 && r.json?.status === "created"
    ? ok("hero signup → 200 created")
    : fail("hero signup", `got ${r.status} ${r.text}`);
}

// 2. Happy path: bottom signup
{
  const r = await call({ email: TEST_EMAILS[1], source: "signup" });
  r.status === 200 && r.json?.status === "created"
    ? ok("bottom signup → 200 created")
    : fail("bottom signup", `got ${r.status} ${r.text}`);
}

// 3. Duplicate: same email twice
{
  await call({ email: TEST_EMAILS[2], source: "hero" });
  const r = await call({ email: TEST_EMAILS[2], source: "hero" });
  r.status === 200 && r.json?.status === "duplicate"
    ? ok("duplicate email → 200 duplicate")
    : fail("duplicate email", `got ${r.status} ${r.text}`);
}

// 4. Case-insensitive duplicate
{
  const r = await call({ email: TEST_EMAILS[2].toUpperCase(), source: "signup" });
  r.status === 200 && r.json?.status === "duplicate"
    ? ok("case-insensitive duplicate → 200 duplicate")
    : fail("case-insensitive duplicate", `got ${r.status} ${r.text}`);
}

// 5. Validation: malformed email
{
  const r = await call({ email: "not-an-email", source: "hero" });
  r.status === 400 ? ok("malformed email → 400") : fail("malformed email", `got ${r.status} ${r.text}`);
}

// 6. Validation: unknown source
{
  const r = await call({ email: `verify-bad-${RUN_ID}@example.invalid`, source: "bogus" });
  r.status === 400 ? ok("unknown source → 400") : fail("unknown source", `got ${r.status} ${r.text}`);
}

// 7. Validation: missing email
{
  const r = await call({ source: "hero" });
  r.status === 400 ? ok("missing email → 400") : fail("missing email", `got ${r.status} ${r.text}`);
}

// 8. Method: GET should not be allowed
{
  const res = await fetch(FN_URL, {
    method: "GET",
    headers: { "apikey": SUPABASE_ANON_KEY, "authorization": `Bearer ${SUPABASE_ANON_KEY}` },
  });
  res.status === 405 ? ok("GET → 405") : fail("GET method", `got ${res.status}`);
}

// 9. CORS preflight
{
  const res = await fetch(FN_URL, {
    method: "OPTIONS",
    headers: { "apikey": SUPABASE_ANON_KEY, "authorization": `Bearer ${SUPABASE_ANON_KEY}` },
  });
  res.status === 204 && res.headers.get("access-control-allow-origin")
    ? ok("OPTIONS preflight → 204 with CORS header")
    : fail("CORS preflight", `got ${res.status}`);
}

// Cleanup
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { error: delErr } = await admin
  .from("waitlist")
  .delete()
  .in("email", TEST_EMAILS.map((e) => e.toLowerCase()));
if (delErr) console.warn(`\n(cleanup warning: ${delErr.message})`);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
