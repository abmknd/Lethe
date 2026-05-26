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
const ALICE_EMAIL   = `rls-alice-${TS}@lethe-test.invalid`;
const BOB_EMAIL     = `rls-bob-${TS}@lethe-test.invalid`;
const CHARLIE_EMAIL = `rls-charlie-${TS}@lethe-test.invalid`;
const ALICE_ID    = `test_alice_${TS}`;
const BOB_ID      = `test_bob_${TS}`;
const CHARLIE_ID  = `test_charlie_${TS}`;
const RUN_ID      = `run_rls_test_${TS}`;
const REC_ID      = `rec_rls_test_${TS}`;
const MEETING_ID  = `meeting_rls_test_${TS}`;
const EVENT_ID    = `evt_rls_test_${TS}`;
const ALICE_READINESS_ID = `readiness_rls_test_alice_${TS}`;
const BOB_READINESS_ID = `readiness_rls_test_bob_${TS}`;
const ALICE_CEP_ID = `cep_rls_test_alice_${TS}`;
const BOB_CEP_ID   = `cep_rls_test_bob_${TS}`;
const CONV_ID      = `conv_rls_test_${TS}`;
const MSG_ALICE_ID = `msg_rls_alice_${TS}`;
const MSG_BOB_ID   = `msg_rls_bob_${TS}`;
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
  const aliceSession   = await createSessionViaMagicLink(ALICE_EMAIL);
  const bobSession     = await createSessionViaMagicLink(BOB_EMAIL);
  const charlieSession = await createSessionViaMagicLink(CHARLIE_EMAIL);
  const aliceAuthId   = aliceSession.authId;
  const bobAuthId     = bobSession.authId;
  const charlieAuthId = charlieSession.authId;

  // Insert Relethe user rows via service role (bypasses RLS).
  const now = nowIso();
  for (const [id, authId, name] of [
    [ALICE_ID,   aliceAuthId,   "Alice Test"],
    [BOB_ID,     bobAuthId,     "Bob Test"],
    [CHARLIE_ID, charlieAuthId, "Charlie Test"],
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
  for (const [userId] of [[ALICE_ID], [BOB_ID], [CHARLIE_ID]]) {
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

  for (const [id, userId, status] of [
    [ALICE_READINESS_ID, ALICE_ID, "good"],
    [BOB_READINESS_ID, BOB_ID, "low"],
  ]) {
    const { error } = await admin.from("connection_readiness").insert({
      id,
      user_id: userId,
      provider: "manual_link",
      tested_at: now,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status,
      score: status === "good" ? 82 : 42,
      can_use_camera: true,
      can_use_mic: true,
      device_warnings: [],
      recommendation: status === "good" ? "Ready for video." : "Audio-first recommended.",
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(`Insert connection_readiness ${userId}: ${error.message}`);
  }

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

  // ── conversations + messages seed (Alice <> Bob, Charlie excluded) ─────────
  // participant_a < participant_b is required by the CHECK constraint;
  // ALICE_ID/BOB_ID/CHARLIE_ID derive from "test_alice|bob|charlie_${TS}",
  // which already sort in that order.
  const [pA, pB] = ALICE_ID < BOB_ID ? [ALICE_ID, BOB_ID] : [BOB_ID, ALICE_ID];
  const { error: convErr } = await admin.from("conversations").insert({
    id: CONV_ID,
    participant_a: pA,
    participant_b: pB,
    unlocked_by_recommendation_id: REC_ID,
    created_at: now,
    last_message_at: now,
  });
  if (convErr) throw new Error(`Insert conversation: ${convErr.message}`);

  const { error: msgAErr } = await admin.from("messages").insert({
    id: MSG_ALICE_ID,
    conversation_id: CONV_ID,
    sender_id: ALICE_ID,
    body: "hello from alice",
    created_at: now,
  });
  if (msgAErr) throw new Error(`Insert seed message (alice): ${msgAErr.message}`);

  const { error: msgBErr } = await admin.from("messages").insert({
    id: MSG_BOB_ID,
    conversation_id: CONV_ID,
    sender_id: BOB_ID,
    body: "hello from bob",
    created_at: now,
  });
  if (msgBErr) throw new Error(`Insert seed message (bob): ${msgBErr.message}`);

  return {
    aliceAuthId, bobAuthId, charlieAuthId,
    alice: aliceSession.client,
    bob: bobSession.client,
    charlie: charlieSession.client,
  };
}

// ── teardown ──────────────────────────────────────────────────────────────────

async function teardown(aliceAuthId, bobAuthId, charlieAuthId) {
  await admin.from("events").delete().eq("id", EVENT_ID);
  await admin.from("connection_readiness").delete().in("id", [ALICE_READINESS_ID, BOB_READINESS_ID]);
  await admin.from("weekly_cep").delete().in("id", [ALICE_CEP_ID, BOB_CEP_ID]);
  // messages + conversation_reads cascade from conversations.
  await admin.from("conversations").delete().eq("id", CONV_ID);
  await admin.from("meetings").delete().eq("id", MEETING_ID);
  await admin.from("recommendations").delete().eq("id", REC_ID);
  await admin.from("recommendation_runs").delete().eq("id", RUN_ID);

  // Deleting auth users cascades to the users table via ON DELETE CASCADE.
  if (aliceAuthId)   await admin.auth.admin.deleteUser(aliceAuthId);
  if (bobAuthId)     await admin.auth.admin.deleteUser(bobAuthId);
  if (charlieAuthId) await admin.auth.admin.deleteUser(charlieAuthId);
}

// ── tests ─────────────────────────────────────────────────────────────────────

async function runTests({ alice, bob, charlie }) {
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

  // ── connection_readiness ───────────────────────────────────────────────────

  console.log("\nconnection_readiness");

  const { data: aliceReadiness } = await alice.from("connection_readiness").select("user_id, status");
  assert(
    aliceReadiness?.length === 1 && aliceReadiness[0].user_id === ALICE_ID,
    "Alice can read only her own readiness entry",
    `got: ${JSON.stringify(aliceReadiness)}`,
  );

  const { data: bobReadinessViaAlice } =
    await alice.from("connection_readiness").select("user_id").eq("user_id", BOB_ID);
  assert(bobReadinessViaAlice?.length === 0, "Alice cannot read Bob's readiness entry");

  const { error: insertReadinessErr } = await alice.from("connection_readiness").insert({
    id: `readiness_bad_${Date.now()}`,
    user_id: ALICE_ID,
    provider: "manual_link",
    tested_at: nowIso(),
    expires_at: new Date(Date.now() + 1000).toISOString(),
    status: "good",
    can_use_camera: true,
    can_use_mic: true,
    device_warnings: [],
    recommendation: "bad write",
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  assert(insertReadinessErr != null, "Alice cannot write readiness directly");

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

  // ── conversations (Phase 8 messaging) ──────────────────────────────────────

  console.log("\nconversations");

  const { data: aliceConvs } = await alice.from("conversations").select("id");
  assert(
    aliceConvs?.some((c) => c.id === CONV_ID),
    "Alice can read her own conversation",
    `got: ${JSON.stringify(aliceConvs)}`,
  );

  const { data: bobConvs } = await bob.from("conversations").select("id");
  assert(
    bobConvs?.some((c) => c.id === CONV_ID),
    "Bob can read the same conversation (he is a participant)",
  );

  const { data: charlieConvs } = await charlie.from("conversations").select("id").eq("id", CONV_ID);
  assert(
    charlieConvs?.length === 0,
    "Charlie (non-participant) cannot read the conversation",
    `got: ${JSON.stringify(charlieConvs)}`,
  );

  // No client INSERT policy exists; insert must be rejected.
  const { error: clientConvInsertErr } = await alice.from("conversations").insert({
    id: `conv_bad_${Date.now()}`,
    participant_a: ALICE_ID < CHARLIE_ID ? ALICE_ID : CHARLIE_ID,
    participant_b: ALICE_ID < CHARLIE_ID ? CHARLIE_ID : ALICE_ID,
    created_at: nowIso(),
  });
  assert(
    clientConvInsertErr != null,
    "Alice cannot create a conversation directly (must go through edge function)",
  );

  // ── messages ───────────────────────────────────────────────────────────────

  console.log("\nmessages");

  const { data: aliceMsgs } = await alice.from("messages").select("id, sender_id");
  assert(
    aliceMsgs?.length === 2 &&
      aliceMsgs.some((m) => m.id === MSG_ALICE_ID) &&
      aliceMsgs.some((m) => m.id === MSG_BOB_ID),
    "Alice can read both messages in her conversation",
    `got: ${JSON.stringify(aliceMsgs)}`,
  );

  const { data: charlieMsgs } = await charlie.from("messages").select("id").eq("conversation_id", CONV_ID);
  assert(
    charlieMsgs?.length === 0,
    "Charlie cannot read messages in a conversation he is not in",
    `got: ${JSON.stringify(charlieMsgs)}`,
  );

  const { error: aliceSendOwnErr } = await alice.from("messages").insert({
    id: `msg_alice_own_${Date.now()}`,
    conversation_id: CONV_ID,
    sender_id: ALICE_ID,
    body: "alice sends in her own conversation",
    created_at: nowIso(),
  });
  assert(
    !aliceSendOwnErr,
    "Alice can send a message in her own conversation",
    aliceSendOwnErr?.message,
  );

  const { error: aliceImpersonateBobErr } = await alice.from("messages").insert({
    id: `msg_alice_as_bob_${Date.now()}`,
    conversation_id: CONV_ID,
    sender_id: BOB_ID,
    body: "alice impersonating bob",
    created_at: nowIso(),
  });
  assert(
    aliceImpersonateBobErr != null,
    "Alice cannot send a message with sender_id = Bob",
  );

  const { error: charlieSendErr } = await charlie.from("messages").insert({
    id: `msg_charlie_intrudes_${Date.now()}`,
    conversation_id: CONV_ID,
    sender_id: CHARLIE_ID,
    body: "charlie intrudes",
    created_at: nowIso(),
  });
  assert(
    charlieSendErr != null,
    "Charlie cannot send a message in a conversation he is not in",
  );

  // ── conversation_reads (read watermark) ────────────────────────────────────

  console.log("\nconversation_reads");

  const { error: aliceWatermarkErr } = await alice.from("conversation_reads").insert({
    conversation_id: CONV_ID,
    user_id: ALICE_ID,
    last_read_at: nowIso(),
  });
  assert(
    !aliceWatermarkErr,
    "Alice can insert her own read watermark for her conversation",
    aliceWatermarkErr?.message,
  );

  const { error: aliceWriteBobWatermarkErr } = await alice.from("conversation_reads").insert({
    conversation_id: CONV_ID,
    user_id: BOB_ID,
    last_read_at: nowIso(),
  });
  assert(
    aliceWriteBobWatermarkErr != null,
    "Alice cannot insert a read watermark for Bob",
  );

  // Bob seeds his own watermark via service role, then we verify Alice cannot see it.
  await admin.from("conversation_reads").upsert({
    conversation_id: CONV_ID,
    user_id: BOB_ID,
    last_read_at: nowIso(),
  });

  const { data: aliceReads } = await alice.from("conversation_reads")
    .select("user_id")
    .eq("conversation_id", CONV_ID);
  assert(
    aliceReads?.length === 1 && aliceReads[0].user_id === ALICE_ID,
    "Alice can only read her own watermark (not Bob's)",
    `got: ${JSON.stringify(aliceReads)}`,
  );

  const { data: charlieReads } = await charlie.from("conversation_reads")
    .select("user_id")
    .eq("conversation_id", CONV_ID);
  assert(
    charlieReads?.length === 0,
    "Charlie cannot read any watermarks in a conversation he is not in",
    `got: ${JSON.stringify(charlieReads)}`,
  );

  const newWatermark = new Date(Date.now() + 60_000).toISOString();
  const { data: updatedRows, error: aliceUpdateErr } = await alice.from("conversation_reads")
    .update({ last_read_at: newWatermark })
    .match({ conversation_id: CONV_ID, user_id: ALICE_ID })
    .select("user_id, last_read_at");
  const updatedTs = updatedRows?.[0]?.last_read_at;
  const updatedMatches = updatedTs && new Date(updatedTs).getTime() === new Date(newWatermark).getTime();
  assert(
    !aliceUpdateErr && updatedMatches,
    "Alice can update her own watermark",
    aliceUpdateErr?.message ?? `want: ${newWatermark} got: ${JSON.stringify(updatedRows)}`,
  );

  const { data: aliceUpdateBobAttempt } = await alice.from("conversation_reads")
    .update({ last_read_at: nowIso() })
    .eq("conversation_id", CONV_ID)
    .eq("user_id", BOB_ID)
    .select("user_id");
  assert(
    !aliceUpdateBobAttempt || aliceUpdateBobAttempt.length === 0,
    "Alice cannot update Bob's watermark",
    `got: ${JSON.stringify(aliceUpdateBobAttempt)}`,
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log("Setting up test users…");
let aliceAuthId, bobAuthId, charlieAuthId;
try {
  const ctx = await setup();
  aliceAuthId   = ctx.aliceAuthId;
  bobAuthId     = ctx.bobAuthId;
  charlieAuthId = ctx.charlieAuthId;

  console.log("Running RLS checks…");
  await runTests(ctx);
} catch (err) {
  console.error("\nSetup failed:", err.message);
  process.exit(1);
} finally {
  if (aliceAuthId || bobAuthId || charlieAuthId) {
    console.log("\nCleaning up…");
    await teardown(aliceAuthId, bobAuthId, charlieAuthId);
  }
}

console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
