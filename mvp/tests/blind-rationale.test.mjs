// Blind rationale generator (alignment plan, Phase 1).
// Regression intent: the abstracted rationale can never carry identifying
// detail about the other person, and confidence is a band, never a percentage.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBlindRationale,
  confidenceBandFromScore,
  roleCategoryLabel,
  assertNoBlindIdentityLeak,
  isIdentityVisible,
} from '../context/blind-rationale.mjs';

function viewer() {
  return {
    user: { id: 'viewer', name: 'Viewer Person', handle: '@viewer' },
    preferences: {
      userType: 'builder',
      asks: ['fundraising', 'go-to-market'],
      offers: ['engineering', 'hiring'],
      interests: ['climate', 'ai'],
      objectives: ['raise-seed'],
    },
    availability: [{ dayOfWeek: 1, startHour: 9, endHour: 11, timezone: 'UTC' }],
  };
}

function candidate() {
  return {
    user: {
      id: 'cand',
      name: 'Priya Nair',
      displayName: 'Priya Nair',
      handle: '@priya',
      email: 'priya@acme.com',
      location: 'Berlin',
      bio: 'Angel investor and former operator at a fintech.',
    },
    preferences: {
      userType: 'investor',
      introText: 'Angel investor and former operator at a fintech.',
      asks: ['engineering', 'design'],
      offers: ['fundraising', 'intros'],
      interests: ['ai', 'fintech'],
      objectives: ['deploy-capital'],
    },
    availability: [{ dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' }],
  };
}

test('rationale carries role category, overlap themes, and a confidence band', () => {
  const rationale = buildBlindRationale({
    recommendation: { score: 72, whyMatched: ['Availability overlap 1.0h (timezone-normalized)'] },
    viewerProfile: viewer(),
    candidateProfile: candidate(),
  });

  assert.equal(rationale.roleCategory, 'An investor');
  assert.equal(rationale.confidenceBand, 'high');
  assert.equal(rationale.availabilityCompatibility, 'You share open time this week');
  // viewer asks fundraising ↔ candidate offers fundraising
  assert.ok(rationale.overlapThemes.some((t) => t.kind === 'they_help'));
  // viewer interest ai ↔ candidate interest ai
  assert.ok(rationale.overlapThemes.some((t) => t.kind === 'shared_interest'));
  assert.ok(rationale.overlapThemes.length <= 3);
});

test('no identifying value from the candidate appears anywhere in the rationale', () => {
  const cand = candidate();
  const rationale = buildBlindRationale({
    recommendation: { score: 50 },
    viewerProfile: viewer(),
    candidateProfile: cand,
  });
  const blob = JSON.stringify(rationale).toLowerCase();
  for (const leak of ['priya', 'nair', '@priya', 'acme', 'berlin', 'fintech and former']) {
    assert.ok(!blob.includes(leak.toLowerCase()), `rationale must not contain "${leak}"`);
  }
});

test('the guard throws if a builder ever injects an identifying value', () => {
  const cand = candidate();
  // Simulate a future bug: a theme accidentally built from the candidate name.
  const poisoned = { roleCategory: 'An investor', note: 'meet Priya Nair' };
  assert.throws(() => assertNoBlindIdentityLeak(poisoned, cand), /leaked identifying value/i);
});

test('confidence is banded, never a percentage', () => {
  assert.equal(confidenceBandFromScore(80), 'high');
  assert.equal(confidenceBandFromScore(60), 'high');
  assert.equal(confidenceBandFromScore(45), 'medium');
  assert.equal(confidenceBandFromScore(35), 'medium');
  assert.equal(confidenceBandFromScore(10), 'low');
  assert.equal(confidenceBandFromScore(0), 'low');
});

test('role category falls back gracefully and never returns empty', () => {
  assert.equal(roleCategoryLabel('operator'), 'An operator');
  assert.equal(roleCategoryLabel('agritech founder'), 'An Agritech Founder');
  assert.equal(roleCategoryLabel(''), 'Someone new to meet');
});

test('identity is only visible from revealed onward', () => {
  assert.equal(isIdentityVisible('offered_blind'), false);
  assert.equal(isIdentityVisible('mutual_accepted'), false);
  assert.equal(isIdentityVisible('revealed'), true);
  assert.equal(isIdentityVisible('scheduled'), true);
  assert.equal(isIdentityVisible('declined_silent'), false);
});
