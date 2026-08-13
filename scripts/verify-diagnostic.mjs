// Guards the diagnostic survey.
//
// Two things are checked, and the second matters more than the first.
//
//   1. SCORING. The extracted logic still classifies and scores as it did.
//   2. SINGLE DECLARATION SITE. This content used to exist twice, once in the
//      app modal and once in the rebrand shell. Nothing failed when the copies
//      diverged; the survey just quietly measured different things in
//      different places. A paraphrased question is especially dangerous
//      because scoring maps by option LETTER, so reordering options computes a
//      different archetype while still looking correct on screen.
//
//   npx tsx scripts/verify-diagnostic.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyCommunity,
  computeArchetype,
  RESULT_COPY,
  QUESTIONS,
  OPT_KEYS,
} from '../src/lib/diagnostic.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let fail = 0;
const eq = (got, want, what) => {
  if (got !== want) {
    console.error(`  FAIL ${what}: got ${got}, want ${want}`);
    fail++;
  }
};

// ---- 1. scoring ----------------------------------------------------------

eq(classifyCommunity('leaving a stable career to build a startup'), 'independents', 'community/builder');
eq(classifyCommunity('trying to research and understand a hard theory'), 'epistemics', 'community/thinker');
eq(classifyCommunity('working on climate policy and systemic justice'), 'social_impact', 'community/impact');
eq(classifyCommunity(''), 'independents', 'community/empty falls back');

eq(computeArchetype({ q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A' }), 'signal_seeker', 'archetype/all-A');
eq(computeArchetype({ q1: 'D', q2: 'D', q3: 'C', q4: 'A', q5: 'C' }), 'isolated_practitioner', 'archetype/isolated');
eq(computeArchetype({ q1: 'B', q2: 'A', q3: 'D', q4: 'D', q5: 'D' }), 'blocked_mover', 'archetype/blocked');

const COMMUNITIES = ['independents', 'epistemics', 'social_impact'];
let combos = 0;
for (const a of Object.keys(RESULT_COPY)) {
  for (const c of COMMUNITIES) {
    const v = RESULT_COPY[a].variants[c];
    if (!v?.gap || !v?.who || !RESULT_COPY[a].tagline) {
      console.error(`  FAIL empty result ${a}/${c}`);
      fail++;
    }
    combos++;
  }
}
eq(combos, 12, 'result matrix size');
eq(QUESTIONS.length, 5, 'question count');
QUESTIONS.forEach((q, i) => eq(q.options.length, OPT_KEYS.length, `q${i + 1} option count`));

// ---- 2. drift guard ------------------------------------------------------

const OWNED = ['QUESTIONS', 'RESULT_COPY', 'TEASER', 'PROGRESS', 'OPT_KEYS', 'classifyCommunity', 'computeArchetype'];
const SOURCE = 'src/lib/diagnostic.ts';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
  return out;
}

let consumers = 0;
for (const file of walk(join(ROOT, 'src'))) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (rel === SOURCE) continue;
  const text = readFileSync(file, 'utf8');
  if (text.includes('lib/diagnostic')) consumers++;
  for (const name of OWNED) {
    if (new RegExp(`^\\s*(export\\s+)?(const|function|let)\\s+${name}\\b`, 'm').test(text)) {
      console.error(`  FAIL ${rel} declares ${name} locally. It belongs to ${SOURCE}.`);
      fail++;
    }
  }
}

if (consumers < 2) {
  console.error(`  FAIL expected both modals to import from ${SOURCE}, found ${consumers}`);
  fail++;
}

console.log(
  fail === 0
    ? `PASS  ${combos} result variants, scoring intact, ${consumers} consumers, one declaration site`
    : `${fail} FAILURES`,
);
process.exit(fail ? 1 : 0);
