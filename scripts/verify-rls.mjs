#!/usr/bin/env node
// RLS verification smoke-check.
// Run after Supabase is provisioned and schema + policies are applied.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   SUPABASE_ANON_KEY=... \
//   node scripts/verify-rls.mjs
//
// Requires email+password auth enabled in Supabase Auth settings.

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error("Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = (accessToken) =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

// ── helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓  ${label}`);
  passed++;
}
function fail(label, detail) {
  console.error(`  ✗  ${label}`);
  if (detail) console.error(`     ${detail}`);
  failed++;
}
function assert(condition, label, detail) {
  condition ? ok(label) : fail(label, detail);
}

// ── setup ─────────────────────────────────────────────────────────────────────

const TS = Date.now();
const ALICE_EMAIL = `rls-alice-${TS}@lethe-test.invalid`;
const BOB_EMAIL   = `rls-bob-${TS}@lethe-test.invalid`;
const PASSWORD    = `Lethe-test-${TS}!`;
const ALICE_ID    = `test_alice_${TS}`;
const BOB_ID      = `test_bob_${TS}`;
const nowIso      = () => new Date().toISOString();

async function setup() {
  // Create auth users
  const { data: a, error: ae } = await admin.auth.admin.createUser({
    email: ALICE_EMAIL, password: PASSWORD, email_confirm: true,
  });
  if (ae) throw new Error(`Create Alice auth user: ${ae.message}`);

  const { data: b, error: be } = await admin.auth.admin.createUser({
    email: BOB_EMAIL, password: PASSWORD, email_confirm: true,
  });
  if (be) throw new Error(`Create Bob auth user: ${be.message}`);

  const aliceAuthId = a.user.id;
  const bobAuthId   = b.user.id;

  // Insert Lethe user rows via service role (bypasses RLS)
  const now = nowIso();
  for (const [id, authId, name] of [
    [ALICE_ID, aliceAuthId, "Alice Test"],
    [BOB_ID,   bobAuthId,   "Bob Test"],
  ]) {
    const { error } = await admin.from("users").insert({
      id, auth_id: authId, name,
      bio: "", timezone: "UTC",
      matching_enabled: true, is_active: true,
      created_at: now, updated_at: now,
    });
    if (error) throw new Error(`Insert Lethe user ${id}: ${error.message}`);
  }

  // Insert preferences for each user
  for (const [userId] of [[ALICE_ID], [BOB_ID]]) {
    const { error } = await admin.from("preferences").insert({
      id: `pref_${userId}`, user_id: userId,
      match_intent: [], offers: [], asks: [],
      preferred_locations: [], user_type: "",
      preferred_user_types: [], interests: [],
      objectives: [], intro_text: "",
      meeting_format: "video", local_only: false,
      blocked_user_ids: [],
      created_at: now, updated_at: now,
    });
    if (error) throw new Error(`Insert preferences ${userId}: ${error.message}`);
  }

  // Sign in as each user
  const aliceClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: aliceSession, error: aliceErr } =
    await aliceClient.auth.signInWithPassword({ email: ALICE_EMAIL, password: PASSWORD });
  if (aliceErr) throw new Error(`Alice sign-in: ${aliceErr.message}`);

  const bobClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: bobSession, error: bobErr } =
    await bobClient.auth.signInWithPassword({ email: BOB_EMAIL, password: PASSWORD });
  if (bobErr) throw new Error(`Bob sign-in: ${bobErr.message}`);

  return {
    aliceAuthId, bobAuthId,
    alice: anon(aliceSession.session.access_token),
    bob:   anon(bobSession.session.access_token),
  };
}

// ── teardown ──────────────────────────────────────────────────────────────────

async function teardown(aliceAuthId, bobAuthId) {
  // Deleting auth users cascades to the users table via ON DELETE CASCADE
  await admin.auth.admin.deleteUser(aliceAuthId);
  await admin.auth.admin.deleteUser(bobAuthId);
}

// ── tests ─────────────────────────────────────────────────────────────────────

async function runTests({ alice, bob }) {
  // ── users ──────────────────────────────────────────────────────────────────

  console.log("\nusers");

  const { data: aliceSelf } = await alice.from("users").select("id").eq("id", ALICE_ID);
  assert(aliceSelf?.length === 1, "Alice can read her own user row");

  const { data: aliceSeesBoB } = await alice.from("users").select("id").eq("id", BOB_ID);
  assert(aliceSeesBoB?.length === 0, "Alice cannot read Bob's user row");

  const { data: allUsers } = await alice.from("users").select("id");
  assert(
    allUsers?.every((u) => u.id === ALICE_ID),
    "Alice's users SELECT returns only her own row",
    `got: ${JSON.stringify(allUsers)}`,
  );

  // ── preferences ────────────────────────────────────────────────────────────

  console.log("\npreferences");

  const { data: alicePrefs } = await alice.from("preferences").select("user_id");
  assert(alicePrefs?.length === 1 && alicePrefs[0].user_id === ALICE_ID,
    "Alice can read her own preferences");

  const { data: bobPrefsViaAlice } =
    await alice.from("preferences").select("user_id").eq("user_id", BOB_ID);
  assert(bobPrefsViaAlice?.length === 0, "Alice cannot read Bob's preferences");

  // ── availability_slots ─────────────────────────────────────────────────────

  console.log("\navailability_slots");

  const now = nowIso();
  const { error: insertSlotErr } = await alice.from("availability_slots").insert({
    user_id: ALICE_ID, day_of_week: 1, start_time: "09:00",
    end_time: "10:00", timezone: "UTC", created_at: now,
  });
  assert(!insertSlotErr, "Alice can insert her own availability slot",
    insertSlotErr?.message);

  const { error: insertBobSlotErr } = await alice.from("availability_slots").insert({
    user_id: BOB_ID, day_of_week: 1, start_time: "09:00",
    end_time: "10:00", timezone: "UTC", created_at: now,
  });
  assert(insertBobSlotErr != null, "Alice cannot insert a slot for Bob");

  const { data: aliceSlots } = await alice.from("availability_slots").select("user_id");
  assert(
    aliceSlots?.every((s) => s.user_id === ALICE_ID),
    "Alice's availability SELECT returns only her own slots",
  );

  // ── admin_decisions ────────────────────────────────────────────────────────

  console.log("\nadmin_decisions");

  const { data: adminDecisions, error: admErr } =
    await alice.from("admin_decisions").select("id");
  assert(
    adminDecisions?.length === 0 || admErr != null,
    "Authenticated user cannot read admin_decisions",
    admErr?.message,
  );

  // ── recommendation_runs ────────────────────────────────────────────────────

  console.log("\nrecommendation_runs");

  const { data: runs, error: runsErr } =
    await alice.from("recommendation_runs").select("id");
  assert(
    runs?.length === 0 || runsErr != null,
    "Authenticated user cannot read recommendation_runs",
    runsErr?.message,
  );

  // ── events ─────────────────────────────────────────────────────────────────

  console.log("\nevents");

  // Service role inserts an event for Alice
  const { error: evtInsertErr } = await admin.from("events").insert({
    id: `evt_rls_test_${Date.now()}`,
    event_type: "test.isolation",
    user_id: ALICE_ID,
    payload: {},
    created_at: nowIso(),
  });
  assert(!evtInsertErr, "Service role can insert events", evtInsertErr?.message);

  const { data: aliceEvents } = await alice.from("events").select("user_id");
  assert(
    aliceEvents?.every((e) => e.user_id === ALICE_ID),
    "Alice only sees events targeted at her",
  );

  const { data: bobEvents } = await bob.from("events").select("user_id");
  assert(
    bobEvents?.length === 0,
    "Bob sees no events (none targeted at him)",
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log("Setting up test users…");
let aliceAuthId, bobAuthId;
try {
  const ctx = await setup();
  aliceAuthId = ctx.aliceAuthId;
  bobAuthId   = ctx.bobAuthId;

  console.log("Running RLS checks…");
  await runTests(ctx);
} catch (err) {
  console.error("\nSetup failed:", err.message);
  process.exit(1);
} finally {
  if (aliceAuthId && bobAuthId) {
    console.log("\nCleaning up…");
    await teardown(aliceAuthId, bobAuthId);
  }
}

console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
