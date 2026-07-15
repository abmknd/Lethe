// Schema-parity contract between the mvp engine and the Supabase edge repository.
//
// Both encode the preferences schema by hand: the mvp sqlite repo (source of
// truth, unit-tested) and supabase/functions/_shared/repository.ts (production,
// not runnable in this environment). When a matching field was added to the
// engine but forgotten in the edge repo, it silently went dormant in production
// (the whole reason for the parity fix in this branch).
//
// This test needs no Supabase/Deno runtime. It reads the schema and the edge
// repo as text and asserts every matching-relevant preferences column is:
//   1. written by the edge upsert (INSERT ... ON CONFLICT (user_id) DO UPDATE),
//   2. selected by listUsersForMatching (p.<col>), and
//   3. read by mapPreferences (row.<col>).
// Adding a new preferences column therefore forces a matching edge change — or a
// conscious entry in EDGE_OMITTED below.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SCHEMA_SQL } from '../db/schema.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoPath = resolve(here, '../../supabase/functions/_shared/repository.ts');
const repoText = readFileSync(repoPath, 'utf8');

// Structural columns the edge repo handles positionally, not as matching data.
const STRUCTURAL = new Set(['id', 'user_id', 'created_at', 'updated_at']);

// Settings-only preferences columns the edge repo intentionally does NOT persist
// or feed to the matcher. Kept explicit so the allowlist can't rot silently: if
// one of these stops existing in the schema, the guard test below fails.
const EDGE_OMITTED = new Set([
  'languages',
  'meeting_frequency',
  'learn_about',
  'ask_about',
  'who_to_meet',
  'notification_prefs',
]);

function preferencesSchemaColumns() {
  const block = SCHEMA_SQL.match(/CREATE TABLE IF NOT EXISTS preferences \(([\s\S]*?)\n\);/);
  assert.ok(block, 'could not locate preferences table in SCHEMA_SQL');
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(FOREIGN KEY|PRIMARY KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line))
    .map((line) => line.split(/\s+/)[0])
    .filter((col) => /^[a-z_]+$/.test(col));
}

function edgeUpsertInsertColumns() {
  const upsertIdx = repoText.indexOf('ON CONFLICT (user_id) DO UPDATE');
  assert.ok(upsertIdx !== -1, 'could not find the preferences upsert in the edge repo');
  const insertStart = repoText.slice(0, upsertIdx).lastIndexOf('INSERT INTO preferences (');
  assert.ok(insertStart !== -1, 'could not find the upsert INSERT column list');
  const fromStart = repoText.slice(insertStart);
  const cols = fromStart.slice(fromStart.indexOf('(') + 1, fromStart.indexOf(') VALUES'));
  return cols
    .split(',')
    .map((c) => c.replace(/\s+/g, ''))
    .filter(Boolean);
}

const schemaCols = preferencesSchemaColumns();
const requiredCols = schemaCols.filter((c) => !STRUCTURAL.has(c) && !EDGE_OMITTED.has(c));
const insertCols = edgeUpsertInsertColumns();

test('sanity: schema and edge INSERT parsing found the expected shape', () => {
  assert.ok(schemaCols.includes('match_intent'), 'schema parse looks wrong');
  assert.ok(requiredCols.length >= 15, `expected many matching columns, got ${requiredCols.length}`);
  assert.ok(insertCols.includes('match_intent'), 'edge INSERT parse looks wrong');
});

test('EDGE_OMITTED entries still exist in the schema (allowlist has not rotted)', () => {
  for (const col of EDGE_OMITTED) {
    assert.ok(schemaCols.includes(col), `EDGE_OMITTED lists "${col}" but it is not in the schema`);
  }
});

test('every matching preferences column is written by the edge upsert', () => {
  for (const col of requiredCols) {
    assert.ok(
      insertCols.includes(col),
      `preferences.${col} is in the schema but not written by the edge upsert (repository.ts INSERT). ` +
        `Add it to the edge INSERT/VALUES/ON CONFLICT, or add it to EDGE_OMITTED if intentional.`,
    );
  }
});

test('every matching preferences column is selected for matching and read by mapPreferences', () => {
  for (const col of requiredCols) {
    assert.ok(
      repoText.includes(`p.${col}`),
      `preferences.${col} is not selected in listUsersForMatching (p.${col}) — the matcher will never see it.`,
    );
    assert.ok(
      repoText.includes(`row.${col}`),
      `preferences.${col} is not read in mapPreferences (row.${col}).`,
    );
  }
});
