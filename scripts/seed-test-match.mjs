#!/usr/bin/env node
// Seed / reset / tear down a test match between two real accounts, for
// repeatable manual + RLS testing of the blind gate and reveal flow.
//
// This writes to whatever SUPABASE_URL points at, using the service-role key.
// Keep it OFF CI and prefer a local/staging project once one exists (see the
// note at the bottom of the file). Every row it creates is prefixed
// `seedtest_<pair>_`, and re-running always deletes those exact ids first, so
// it never duplicates and never touches real data.
//
// Setup (once): put the service-role key in .env.local (gitignored):
//   SUPABASE_SERVICE_ROLE_KEY=<your service_role or sb_secret_ key>
//
// Usage:
//   node scripts/seed-test-match.mjs                         # revealed match, default pair
//   node scripts/seed-test-match.mjs --state=offered_blind   # blind (identity hidden)
//   node scripts/seed-test-match.mjs --state=one_sided       # viewer accepted, waiting
//   node scripts/seed-test-match.mjs --meeting               # include a scheduled call
//   node scripts/seed-test-match.mjs --viewer=a@x.com --candidate=b@y.com
//   node scripts/seed-test-match.mjs --login=a@x.com         # also print a browser login snippet
//   node scripts/seed-test-match.mjs --teardown              # remove the seeded rows
//   node scripts/seed-test-match.mjs --list                  # show seeded rows for the pair
//
// State maps to what the viewer sees:
//   offered_blind : rec 'approved', match 'offered_blind', no responses     -> identity HIDDEN
//   one_sided     : as above + viewer's own blind_accept recorded           -> identity HIDDEN, "waiting"
//   revealed      : rec 'accepted', match 'revealed', both accepted         -> identity SHOWN

import { createClient } from '@supabase/supabase-js';
import { loadEnvFiles, getSupabasePublicEnv } from './env-loader.mjs';

loadEnvFiles();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const { url } = getSupabasePublicEnv();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = getSupabasePublicEnv().anonKey;

if (!url || !serviceKey) {
  console.error('Missing config. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Put SUPABASE_SERVICE_ROLE_KEY in .env.local (gitignored), then re-run.');
  process.exit(1);
}

const REF = new URL(url).hostname.split('.')[0];
const VIEWER_EMAIL = (args.viewer ?? 'abmknd@gmail.com').toString().toLowerCase();
const CANDIDATE_EMAIL = (args.candidate ?? 'ceradellace@gmail.com').toString().toLowerCase();
const STATE = (args.state ?? 'revealed').toString();
const WITH_MEETING = Boolean(args.meeting);

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function resolveUid(email) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`No auth user for ${email}. Have them sign in once first.`);
}

const viewer = await resolveUid(VIEWER_EMAIL);
const candidate = await resolveUid(CANDIDATE_EMAIL);

// Deterministic ids per unordered pair -> idempotent re-runs.
const [x, y] = [viewer, candidate].sort();
const pk = `${x.slice(0, 8)}_${y.slice(0, 8)}`;
const runId = `seedtest_${pk}_run`;
const recId = `seedtest_${pk}_rec`;
const matchId = `seedtest_${pk}_match`;
const meetingId = `seedtest_${pk}_meeting`;

async function teardown() {
  // Delete children first; ignore "no rows" outcomes.
  await admin.from('meetings').delete().eq('id', meetingId);
  await admin.from('matches').delete().eq('id', matchId);
  await admin.from('recommendations').delete().eq('id', recId);
  await admin.from('recommendation_runs').delete().eq('id', runId);
}

if (args.list) {
  for (const t of ['recommendation_runs', 'recommendations', 'matches', 'meetings']) {
    const idCol = 'id';
    const { data } = await admin.from(t).select('*').eq(idCol, { recommendation_runs: runId, recommendations: recId, matches: matchId, meetings: meetingId }[t]);
    console.log(`${t}:`, data?.length ? JSON.stringify(data[0]) : '(none)');
  }
  process.exit(0);
}

if (args.teardown) {
  await teardown();
  console.log(`Torn down seed rows for pair ${pk}.`);
  process.exit(0);
}

// --- seed (reset-first so state is always clean) ---
await teardown();

const now = new Date().toISOString();
const [userA, userB] = [viewer, candidate].sort(); // orderPair: lower id is user_a
const why = [
  "You offer what they're looking for: Truth",
  'They can help with Play',
  'Both working toward Love',
  'You share open time this week',
];

const STATE_MAP = {
  offered_blind: { recStatus: 'approved', matchState: 'offered_blind', aResp: null, bResp: null },
  one_sided: { recStatus: 'approved', matchState: 'offered_blind', aResp: 'accepted', bResp: null },
  revealed: { recStatus: 'accepted', matchState: 'revealed', aResp: 'accepted', bResp: 'accepted' },
};
const cfg = STATE_MAP[STATE];
if (!cfg) {
  console.error(`Unknown --state=${STATE}. Use: ${Object.keys(STATE_MAP).join(', ')}`);
  process.exit(1);
}

// Which side is the viewer (a or b) so one_sided records the viewer's response.
const viewerSide = viewer === userA ? 'a' : 'b';
const aResponse = cfg.aResp && (viewerSide === 'a' || cfg.bResp) ? cfg.aResp : (viewerSide === 'a' ? cfg.aResp : null);
// For one_sided, put the accepted response on the viewer's side specifically:
let aResp = cfg.aResp, bResp = cfg.bResp;
if (STATE === 'one_sided') { aResp = viewerSide === 'a' ? 'accepted' : null; bResp = viewerSide === 'b' ? 'accepted' : null; }

function die(label, error) { if (error) { console.error(`FAIL ${label}: ${error.message}`); process.exit(1); } }

die('run', (await admin.from('recommendation_runs').insert({
  id: runId, run_type: 'seedtest', status: 'completed', started_at: now,
})).error);

die('recommendation', (await admin.from('recommendations').insert({
  id: recId, run_id: runId, source_user_id: viewer, target_user_id: candidate,
  rank: 1, score: 72, why_matched: JSON.stringify(why), status: cfg.recStatus,
  created_at: now, updated_at: now,
})).error);

die('match', (await admin.from('matches').insert({
  id: matchId, recommendation_id: recId, reverse_recommendation_id: null,
  user_a_id: userA, user_b_id: userB, state: cfg.matchState,
  a_response: aResp, a_responded_at: aResp ? now : null,
  b_response: bResp, b_responded_at: bResp ? now : null,
  created_at: now, updated_at: now,
})).error);

if (WITH_MEETING) {
  const callAt = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
  die('meeting', (await admin.from('meetings').insert({
    id: meetingId, recommendation_id: recId, provider: 'jitsi',
    meeting_url: `https://meet.jit.si/relethe-${recId}`, scheduled_at: callAt,
    status: 'scheduled', metadata: {}, created_at: now, updated_at: now,
  })).error);
}

console.log(`Seeded ${STATE} match for pair ${pk}.`);
console.log(`  viewer=${VIEWER_EMAIL}  candidate=${CANDIDATE_EMAIL}`);
console.log(`  reveal path (as viewer): /matches/${recId}`);

// Optional: mint a session and print a browser-console login snippet.
if (args.login) {
  const loginEmail = args.login.toString().toLowerCase();
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email: loginEmail });
  die('generateLink', linkErr);
  const otp = link?.properties?.email_otp;
  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let session = null;
  for (const type of ['email', 'magiclink']) {
    const { data, error } = await anon.auth.verifyOtp({ email: loginEmail, token: otp, type });
    if (!error && data?.session) { session = data.session; break; }
  }
  if (!session) { console.error('Could not mint a session.'); process.exit(1); }
  const key = `sb-${REF}-auth-token`;
  console.log('\nBrowser login: open the app, then paste this in the devtools console:');
  console.log(`localStorage.setItem('${key}', ${JSON.stringify(JSON.stringify(session))}); location.reload();`);
  console.log('(session expires in ~1h; it is a real token for that account)');
}

// Sustainability note: this writes to prod when SUPABASE_URL is prod. For heavy
// or automated testing, stand up a local stack (`supabase start`) or a separate
// staging project and point .env.local there, so seed data never pollutes the
// real cohort, metrics, or a real user's account.
