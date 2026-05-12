import Anthropic from '@anthropic-ai/sdk';
import { generateInsightText } from './insight-generation.mjs';

function buildPrompt(sourceProfile, candidateProfile, { sourceCep = null, candidateCep = null } = {}) {
  const src = sourceProfile.user;
  const srcP = sourceProfile.preferences ?? {};
  const cnd = candidateProfile.user;
  const cndP = candidateProfile.preferences ?? {};

  const lines = [
    `Person A: ${src.displayName ?? src.name}`,
    src.location ? `  Location: ${src.location}` : null,
    srcP.userType ? `  Role: ${srcP.userType}` : null,
    srcP.asks?.length ? `  Looking for: ${srcP.asks.slice(0, 3).join(', ')}` : null,
    srcP.offers?.length ? `  Can offer: ${srcP.offers.slice(0, 3).join(', ')}` : null,
    srcP.interests?.length ? `  Interests: ${srcP.interests.slice(0, 3).join(', ')}` : null,
    srcP.introText ? `  Bio: ${srcP.introText.slice(0, 150)}` : null,
    sourceCep?.focusText ? `  This week: ${sourceCep.focusText.slice(0, 80)}` : null,
    '',
    `Person B: ${cnd.displayName ?? cnd.name}`,
    cnd.location ? `  Location: ${cnd.location}` : null,
    cndP.userType ? `  Role: ${cndP.userType}` : null,
    cndP.asks?.length ? `  Looking for: ${cndP.asks.slice(0, 3).join(', ')}` : null,
    cndP.offers?.length ? `  Can offer: ${cndP.offers.slice(0, 3).join(', ')}` : null,
    cndP.interests?.length ? `  Interests: ${cndP.interests.slice(0, 3).join(', ')}` : null,
    cndP.introText ? `  Bio: ${cndP.introText.slice(0, 150)}` : null,
    candidateCep?.focusText ? `  This week: ${candidateCep.focusText.slice(0, 80)}` : null,
  ].filter((l) => l !== null);

  return lines.join('\n');
}

/**
 * Generate a "why you should meet" insight using Claude.
 * Falls back to the deterministic template if the API call fails.
 */
export async function generateInsightTextLlm(
  sourceProfile,
  candidateProfile,
  cepContext = {},
  apiKey,
) {
  const client = new Anthropic({ apiKey });

  const profileContext = buildPrompt(sourceProfile, candidateProfile, cepContext);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system:
        'You write concise, specific introductions explaining why two professionals should meet. ' +
        'Write exactly 2–3 sentences. Be concrete — name the actual asks, offers, or shared context. ' +
        'No fluff, no generic praise. Do not start with "I" or mention Lethe.',
      messages: [
        {
          role: 'user',
          content: `Write a 2–3 sentence explanation of why these two people should meet:\n\n${profileContext}`,
        },
      ],
    });

    const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '';
    if (text.length > 30) return text;
    return generateInsightText(sourceProfile, candidateProfile, cepContext);
  } catch {
    return generateInsightText(sourceProfile, candidateProfile, cepContext);
  }
}
