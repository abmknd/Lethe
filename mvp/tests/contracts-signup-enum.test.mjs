// Data-contract smoke: keep the signup function's SOURCES enum in sync with
// the waitlist source CHECK constraint. Drift here caused a production
// migration failure on 2026-05-19 (legacy 'founding-member' rows blocking
// the new check that only allowed 'founding').

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// The signup function's SOURCES enum lives in the pure ESM contract module
// (imported by both the Deno edge handler and the Node contract tests).
const SIGNUP_CONTRACT = resolve(REPO_ROOT, 'supabase/functions/signup/contract.mjs');
const MIGRATIONS_DIR = resolve(REPO_ROOT, 'supabase/migrations');
const WAITLIST_COLUMNS_MIGRATION = resolve(
  MIGRATIONS_DIR,
  '20260518000001_waitlist_signup_columns.sql',
);

function extractStringLiteralArray(text, identifier) {
  // Tolerates both `IDENT = [...]` and `IDENT = Object.freeze([...])`.
  const re = new RegExp(
    `${identifier}\\s*=\\s*(?:Object\\.freeze\\(\\s*)?\\[([^\\]]+)\\]`,
  );
  const match = text.match(re);
  if (!match) return null;
  return [...match[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);
}

function extractSqlInList(text, constraintName) {
  const re = new RegExp(
    `constraint\\s+${constraintName}[\\s\\S]*?in\\s*\\(([^)]+)\\)`,
    'i',
  );
  const match = text.match(re);
  if (!match) return null;
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

test('signup SIGNUP_SOURCES enum matches waitlist_source_check constraint', async () => {
  const contractSrc = await readFile(SIGNUP_CONTRACT, 'utf8');
  const migrationSrc = await readFile(WAITLIST_COLUMNS_MIGRATION, 'utf8');

  const codeSources = extractStringLiteralArray(contractSrc, 'SIGNUP_SOURCES');
  assert.ok(
    codeSources && codeSources.length > 0,
    'Expected to parse SIGNUP_SOURCES from signup/contract.mjs',
  );

  const sqlSources = extractSqlInList(migrationSrc, 'waitlist_source_check');
  assert.ok(sqlSources && sqlSources.length > 0, 'Expected to parse waitlist_source_check IN list from migration');

  assert.deepEqual(
    [...codeSources].sort(),
    [...sqlSources].sort(),
    `signup SIGNUP_SOURCES (${codeSources.join(',')}) drifted from waitlist_source_check (${sqlSources.join(',')})`,
  );
});

test('migration filenames are sortable and unique', async () => {
  // readdir() on Linux (and inside GitHub Actions) does not guarantee
  // alphabetical order, so sort defensively before asserting properties
  // of the sequence.
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .filter((f) => !f.startsWith('_'))
    .sort();

  const timestamps = files.map((f) => {
    const m = f.match(/^(\d{14})_/);
    assert.ok(m, `Migration ${f} must start with a 14-digit timestamp`);
    return m[1];
  });

  const unique = new Set(timestamps);
  assert.equal(
    unique.size,
    timestamps.length,
    `Duplicate migration timestamps detected: ${timestamps.join(', ')}`,
  );
});
