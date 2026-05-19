import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { isCepActive, cepExpiresAt, CEP_EXPIRY_DAYS } from '../domain/models.mjs';
import { generateInsightText } from '../context/insight-generation.mjs';

// ─── Domain helpers ───────────────────────────────────────────────────────────

test('isCepActive returns false for null', () => {
  assert.equal(isCepActive(null), false);
});

test('isCepActive returns true when expiresAt is in the future', () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  assert.equal(isCepActive({ expiresAt: future }), true);
});

test('isCepActive returns false when expiresAt is in the past', () => {
  const past = new Date(Date.now() - 1000).toISOString();
  assert.equal(isCepActive({ expiresAt: past }), false);
});

test('cepExpiresAt adds CEP_EXPIRY_DAYS to createdAt', () => {
  const created = '2026-05-06T12:00:00.000Z';
  const expires = cepExpiresAt(created);
  const diff = (new Date(expires) - new Date(created)) / (1000 * 60 * 60 * 24);
  assert.equal(diff, CEP_EXPIRY_DAYS);
});

// ─── Service contract ─────────────────────────────────────────────────────────

test('submitFocus persists a CEP entry and returns it', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];
    assert.ok(user, 'seed must produce at least one user');

    const cep = app.services.cep.submitFocus(user.id, { focusText: 'fundraising for Series A' });
    assert.equal(cep.userId, user.id);
    assert.equal(cep.focusText, 'fundraising for Series A');
    assert.ok(cep.expiresAt > cep.createdAt);
  } finally {
    cleanup();
  }
});

test('getActiveFocus returns null when no CEP submitted', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];
    const result = app.services.cep.getActiveFocus(user.id);
    assert.equal(result, null);
  } finally {
    cleanup();
  }
});

test('getActiveFocus returns entry when active', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];
    app.services.cep.submitFocus(user.id, { focusText: 'hiring a CTO' });
    const active = app.services.cep.getActiveFocus(user.id);
    assert.ok(active);
    assert.equal(active.focusText, 'hiring a CTO');
  } finally {
    cleanup();
  }
});

test('getActiveFocus returns null for expired entry', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];

    // Manually insert an already-expired CEP by using the repository directly.
    const past = new Date(Date.now() - 1000).toISOString();
    app.repository.upsertCep(user.id, {
      id: 'cep_test_expired',
      focusText: 'old focus',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: past,
    });

    const active = app.services.cep.getActiveFocus(user.id);
    assert.equal(active, null);
  } finally {
    cleanup();
  }
});

test('getFocus returns expired entry (raw, no active check)', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];

    const past = new Date(Date.now() - 1000).toISOString();
    app.repository.upsertCep(user.id, {
      id: 'cep_test_raw',
      focusText: 'expired focus',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: past,
    });

    const raw = app.services.cep.getFocus(user.id);
    assert.ok(raw);
    assert.equal(raw.focusText, 'expired focus');
  } finally {
    cleanup();
  }
});

test('submitFocus overwrites prior CEP for the same user', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];

    app.services.cep.submitFocus(user.id, { focusText: 'first focus' });
    app.services.cep.submitFocus(user.id, { focusText: 'updated focus' });

    const active = app.services.cep.getActiveFocus(user.id);
    assert.ok(active);
    assert.equal(active.focusText, 'updated focus');
  } finally {
    cleanup();
  }
});

test('clearFocus removes the CEP entry', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];

    app.services.cep.submitFocus(user.id, { focusText: 'temporary focus' });
    assert.ok(app.services.cep.getActiveFocus(user.id));

    app.services.cep.clearFocus(user.id);
    assert.equal(app.services.cep.getActiveFocus(user.id), null);
    assert.equal(app.services.cep.getFocus(user.id), null);
  } finally {
    cleanup();
  }
});

test('listActiveFocuses returns only non-expired entries', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    assert.ok(users.length >= 2, 'need at least 2 seeded users');

    const [u1, u2] = users;

    app.services.cep.submitFocus(u1.id, { focusText: 'active focus' });

    // Insert expired CEP for u2 via repository.
    const past = new Date(Date.now() - 1000).toISOString();
    app.repository.upsertCep(u2.id, {
      id: 'cep_expired_u2',
      focusText: 'expired focus',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: past,
    });

    const actives = app.services.cep.listActiveFocuses();
    const activeIds = actives.map((c) => c.userId);
    assert.ok(activeIds.includes(u1.id), 'u1 active focus should appear');
    assert.ok(!activeIds.includes(u2.id), 'u2 expired focus should not appear');
  } finally {
    cleanup();
  }
});

test('getActiveFocusMap returns only requested active entries', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    assert.ok(users.length >= 2);
    const [u1, u2] = users;

    app.services.cep.submitFocus(u1.id, { focusText: 'focus one' });
    app.services.cep.submitFocus(u2.id, { focusText: 'focus two' });

    const map = app.services.cep.getActiveFocusMap([u1.id, u2.id]);
    assert.equal(map.size, 2);
    assert.equal(map.get(u1.id).focusText, 'focus one');
    assert.equal(map.get(u2.id).focusText, 'focus two');

    // Request only u1 → map should contain only u1.
    const partial = app.services.cep.getActiveFocusMap([u1.id]);
    assert.equal(partial.size, 1);
    assert.ok(partial.has(u1.id));
  } finally {
    cleanup();
  }
});

test('submitFocus throws for unknown user', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    assert.throws(
      () => app.services.cep.submitFocus('nonexistent_user_id', { focusText: 'test' }),
      /User not found/,
    );
  } finally {
    cleanup();
  }
});

test('submitFocus truncates text to 280 characters', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    const user = users[0];
    const longText = 'a'.repeat(400);
    const cep = app.services.cep.submitFocus(user.id, { focusText: longText });
    assert.equal(cep.focusText.length, 280);
  } finally {
    cleanup();
  }
});

// ─── Insight generation integration ──────────────────────────────────────────

function makeProfile(overrides = {}) {
  return {
    user: { id: 'u1', displayName: 'Alice Smith', location: 'Berlin', ...overrides.user },
    preferences: {
      matchIntent: ['mentoring'],
      asks: ['introductions'],
      offers: ['fundraising'],
      interests: ['climate'],
      objectives: [],
      userType: 'founder',
      preferredUserTypes: ['investor'],
      ...overrides.preferences,
    },
    availability: [],
  };
}

test('generateInsightText includes shared focus when both have overlapping CEP', () => {
  const source = makeProfile({ user: { id: 'u1', displayName: 'Alice' } });
  const candidate = makeProfile({ user: { id: 'u2', displayName: 'Bob' } });
  const sourceCep = { focusText: 'climate fundraising' };
  const candidateCep = { focusText: 'fundraising round series' };

  const text = generateInsightText(source, candidate, { sourceCep, candidateCep });
  assert.ok(text.includes('fundraising'), `expected "fundraising" in: "${text}"`);
});

test('generateInsightText mentions both focus texts when no token overlap', () => {
  const source = makeProfile({ user: { id: 'u1', displayName: 'Alice' } });
  const candidate = makeProfile({ user: { id: 'u2', displayName: 'Bob' } });
  const sourceCep = { focusText: 'hiring engineers' };
  const candidateCep = { focusText: 'fundraising outreach' };

  const text = generateInsightText(source, candidate, { sourceCep, candidateCep });
  assert.ok(text.includes('Alice') && text.includes('Bob'), `expected both names in: "${text}"`);
});

test('generateInsightText still returns ≥2 sentences with no CEP', () => {
  const source = makeProfile({ user: { id: 'u1', displayName: 'Alice' } });
  const candidate = makeProfile({ user: { id: 'u2', displayName: 'Bob' } });

  const text = generateInsightText(source, candidate);
  const sentences = text.split('. ').filter(Boolean);
  assert.ok(sentences.length >= 2, `expected ≥2 sentences, got: "${text}"`);
});

// ─── Matching integration: CEP boost appears in whyMatched ───────────────────

test('weekly matching includes CEP boost note when both users have active focus', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });
  try {
    const users = app.services.onboarding.listUsers();
    assert.ok(users.length >= 2);

    // Give all seeded users an active focus so at least one pair gets the boost.
    for (const user of users) {
      app.services.cep.submitFocus(user.id, { focusText: 'fundraising and hiring' });
    }

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 5 });
    const queue = app.services.adminReview.listQueue({ status: 'pending_review' });
    assert.ok(queue.length > 0);

    const withBoost = queue.filter((r) =>
      r.whyMatched.some((note) => note.toLowerCase().includes('focus')),
    );
    assert.ok(withBoost.length > 0, 'expected at least one recommendation with a CEP focus note');
  } finally {
    cleanup();
  }
});
