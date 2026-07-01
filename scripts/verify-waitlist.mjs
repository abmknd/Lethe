#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv, loadEnvFiles } from './env-loader.mjs';

loadEnvFiles();

const { url, anonKey } = getSupabasePublicEnv();

if (!url || !anonKey) {
  console.error(
    'Missing Supabase public env. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  );
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = Date.now();
const email = `stage7-waitlist-${now}@relethe.test`;

function fail(label, error) {
  console.error(`✗ ${label}`);
  if (error) {
    console.error(`  ${error.code ?? 'ERROR'}: ${error.message ?? error}`);
  }
  process.exit(1);
}

console.log(`Checking waitlist insert with ${email}`);

const { error: insertError } = await supabase.from('waitlist').insert({ email });
if (insertError) fail('waitlist accepts anonymous insert', insertError);
console.log('✓ waitlist accepts anonymous insert');

const { error: duplicateError } = await supabase.from('waitlist').insert({ email });
if (!duplicateError) {
  fail('waitlist rejects duplicate email with unique constraint', {
    code: 'DUPLICATE_ACCEPTED',
    message:
      'Second insert succeeded. Add or verify a unique constraint on waitlist.email so duplicate submissions do not create duplicate rows.',
  });
}

if (duplicateError.code !== '23505') {
  fail('waitlist duplicate email returns Postgres unique violation 23505', duplicateError);
}

console.log('✓ waitlist duplicate email returns 23505, matching frontend success handling');
console.log('\nWaitlist verification passed.');
