#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv, loadEnvFiles } from './env-loader.mjs';

loadEnvFiles();

const email = process.env.STAGE7_MAGIC_LINK_EMAIL ?? process.argv[2];
if (!email) {
  console.error('Provide an email with STAGE7_MAGIC_LINK_EMAIL=<email> or as the first argument.');
  process.exit(1);
}

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

const { error } = await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: false },
});

if (error) {
  console.error('✗ Magic-link request was rejected by Supabase Auth');
  console.error(`  ${error.message}`);
  process.exit(1);
}

console.log(`✓ Magic-link request accepted by Supabase Auth for ${email}`);
console.log('Confirm receipt in that inbox to complete the real email-delivery gate.');
