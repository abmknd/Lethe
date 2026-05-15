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
// Uses Supabase Admin generateLink + verifyOtp, so it does not require
// email+password auth to be enabled. Requires a service role key.

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, loadEnvFiles } from "./env-loader.mjs";

loadEnvFiles();

const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabasePublicEnv();

const missingEnv = [];
if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL or VITE_SUPABASE_URL");
if (!SUPABASE_ANON_KEY) missingEnv.push("SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY");
if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

if (missingEnv.length > 0) {
  console.error(`Missing env vars: ${missingEnv.join(", ")}`);
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
const ALICE_ID    = `test_alice_${TS}`;
const BOB_ID      = `test_bob_${TS}`;
const RUN_ID      = `run_rls_test_${TS}`;
const REC_ID      = `rec_rls_test_${TS}`;
const MEETING_ID  = `meeting_rls_test_${TS}`;
const EVENT_ID    = `evt_rls_test_${TS}`;
const ALICE_CEP_ID = `cep_rls_test_alice_${TS}`;
const BOB_CEP_ID   = `cep_rls_test_bob_${TS}`;
const nowIso      = () => new Date().toISOString();

async function createSessionViaMagicLink(email) {
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError) throw new Error(`Generate magic link for ${email}: ${linkError.message}`);

  const tokenHash = link.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error(`Generate magic link for ${email}: missing hashed token`);
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: session, error: verifyError } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type: link.properties?.verification_type ?? "magiclink",
  });
  if (verifyError) throw new Error(`Verify magic link for ${email}: ${verifyError.message}`);
  if (!session.session?.access_token || !session.user?.id) {
    throw new Error(`Verify magic link for ${email}: missing session`);
  }

  return {
    authId: session.user.id,
    client: anon(session.session.access_token),
  };
}

async function setup() {
  // Create auth users and obtain real authenticated JWTs via generated magic links.
  const aliceSession = await createSessionViaMagicLink(ALICE_EMAIL);
  const bobSession = await createSessionViaMagicLink(BOB_EMAIL);
  const aliceAuthId = aliceSession.authId;
  const bobAuthId = bobSession.authId;

  // Insert Relethe user rows via service role (bypasses RLS).
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

  // Seed service-owned rows that users should read only through RLS.
  const { error: runErr } = await admin.from("recommendation_runs").insert({
    id: RUN_ID,
    run_type: "weekly",
    started_at: now,
    completed_at: now,
    status: "completed",
    summary_json: {},
  });
  if (runErr) throw new Error(`Insert recommendation run: ${runErr.message}`);

  const { error: recErr } = await admin.from("recommendations").insert({
    id: REC_ID,
    run_id: RUN_ID,
    source_user_id: ALICE_ID,
    target_user_id: BOB_ID,
    rank: 1,
    score: 85,
    why_matched: "RLS test match",
    status: "pending_review",
    created_at: now,
    updated_at: now,
  });
  if (recErr) throw new Error(`Insert recommendation: ${recErr.message}`);

  const { error: meetingErr } = await admin.from("meetings").insert({
    id: MEETING_ID,
    recommendation_id: REC_ID,
    provider: "manual_link",
    meeting_url: "https://example.invalid/rls-test",
    status: "scheduled",
    metadata: {},
    created_at: now,
    updated_at: now,
  });
  if (meetingErr) throw new Error(`Insert meeting: ${meetingErr.message}`);

  for (const [id, userId, focusText] of [
    [ALICE_CEP_ID, ALICE_ID, "Alice RLS focus"],
    [BOB_CEP_ID, BOB_ID, "Bob RLS focus"],
  ]) {
    const { error } = await admin.from("weekly_cep").insert({
      id,
      user_id: userId,
      focus_text: focusText,
      created_at: now,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error(`Insert weekly_cep ${userId}: ${error.message}`);
  }

  return {
    aliceAuthId, bobAuthId,
    alice: aliceSession.client,
    bob: bobSession.client,
  };
}

// ── teardown ──────────────────────────────────────────────────────────────────

async function teardown(aliceAuthId, bobAuthId) {
  await admin.from("events").delete().eq("id", EVENT_ID);
  await admin.from("weekly_cep").delete().in("id", [ALICE_CEP_ID, BOB_CEP_ID]);
  await admin.from("meetings").delete().eq("id", MEETING_ID);
  await admin.from("recommendations").delete().eq("id", REC_ID);
  await admin.from("recommendation_runs").delete().eq("id", RUN_ID);

  // Deleting auth users cascades to the users table via ON DELETE CASCADE.
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
    id: EVENT_ID,
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

  // ── weekly_cep ─────────────────────────────────────────────────────────────

  console.log("\nweekly_cep");

  const { data: aliceCep } = await alice.from("weekly_cep").select("user_id, focus_text");
  assert(
    aliceCep?.length === 1 && aliceCep[0].user_id === ALICE_ID,
    "Alice can read only her own CEP entry",
    `got: ${JSON.stringify(aliceCep)}`,
  );

  const { data: bobCepViaAlice } =
    await alice.from("weekly_cep").select("user_id").eq("user_id", BOB_ID);
  assert(bobCepViaAlice?.length === 0, "Alice cannot read Bob's CEP entry");

  const { error: insertBobCepErr } = await alice.from("weekly_cep").insert({
    id: `cep_bad_${Date.now()}`,
    user_id: BOB_ID,
    focus_text: "bad write",
    created_at: nowIso(),
    expires_at: new Date(Date.now() + 1000).toISOString(),
  });
  assert(insertBobCepErr != null, "Alice cannot insert CEP for Bob");

  // ── meetings ───────────────────────────────────────────────────────────────

  console.log("\nmeetings");

  const { data: aliceMeetings } = await alice.from("meetings").select("recommendation_id");
  assert(
    aliceMeetings?.length === 1 && aliceMeetings[0].recommendation_id === REC_ID,
    "Alice can read meeting linked to her recommendation",
    `got: ${JSON.stringify(aliceMeetings)}`,
  );

  const { data: bobMeetings } = await bob.from("meetings").select("recommendation_id");
  assert(
    bobMeetings?.length === 0,
    "Bob cannot read Alice's meeting",
    `got: ${JSON.stringify(bobMeetings)}`,
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
