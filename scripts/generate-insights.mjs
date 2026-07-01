#!/usr/bin/env node
/**
 * Offline insight enrichment — upgrades empty or template insights to LLM-generated ones.
 * Requires ANTHROPIC_API_KEY in environment.
 * Usage: node scripts/generate-insights.mjs [--db path/to/db.sqlite]
 */

import { createTrialAppContext } from '../mvp/services/app-context.mjs';
import { generateInsightTextLlm } from '../mvp/context/insight-generation-llm.mjs';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY not set. Exiting.');
  process.exit(1);
}

const dbArg = process.argv.indexOf('--db');
const dbPath = dbArg !== -1 ? process.argv[dbArg + 1] : process.env.DB_PATH ?? 'lethe.db';

const app = createTrialAppContext({ dbPath });
const { repository } = app;

const stale = repository.listRecommendationsWithEmptyInsight();
if (stale.length === 0) {
  console.log('No recommendations with empty insight. Nothing to do.');
  process.exit(0);
}

console.log(`Generating LLM insights for ${stale.length} recommendation(s)…`);

let updated = 0;
let failed = 0;

for (const row of stale) {
  const sourceProfile = repository.getUserProfile(row.source_user_id);
  const candidateProfile = repository.getUserProfile(row.target_user_id);

  if (!sourceProfile || !candidateProfile) {
    console.warn(`  Skipping ${row.id} — missing profile`);
    failed++;
    continue;
  }

  try {
    const insightText = await generateInsightTextLlm(
      sourceProfile,
      candidateProfile,
      {},
      apiKey,
    );
    repository.updateRecommendationInsightText(row.id, insightText);
    console.log(`  ✓ ${row.id}: "${insightText.slice(0, 80)}…"`);
    updated++;
  } catch (err) {
    console.error(`  ✗ ${row.id}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`);
