import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInsightText } from '../context/insight-generation.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';

function makeProfile({ name, handle, location, userType, preferredUserTypes, asks, offers, matchIntent, interests, objectives } = {}) {
  return {
    user: {
      id: `user_${handle ?? name ?? 'x'}`,
      displayName: name ?? 'Test User',
      handle: handle ?? 'test',
      email: `${handle ?? 'test'}@example.com`,
      location: location ?? 'Paris, France',
      timezone: 'Europe/Paris',
      isActive: true,
      matchingEnabled: true,
    },
    preferences: {
      userType: userType ?? '',
      preferredUserTypes: preferredUserTypes ?? [],
      asks: asks ?? [],
      offers: offers ?? [],
      matchIntent: matchIntent ?? [],
      interests: interests ?? [],
      objectives: objectives ?? [],
      introText: '',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
    },
    availability: [{ dayOfWeek: 1, startHour: 9, endHour: 11, timezone: 'Europe/Paris' }],
    updatedAt: new Date().toISOString(),
  };
}

test('generateInsightText — mutual ask/offer bridge produces grounded sentence', () => {
  const source = makeProfile({ name: 'Maya', asks: ['design feedback'], offers: ['fundraising advice'] });
  const candidate = makeProfile({ name: 'Lucas', offers: ['design feedback'], asks: ['fundraising advice'] });

  const insight = generateInsightText(source, candidate);

  assert.ok(insight.includes('Lucas'), 'mentions candidate first name');
  assert.ok(insight.includes('Maya'), 'mentions source first name');
  assert.ok(insight.includes('design feedback'), 'grounds in specific ask');
  assert.ok(insight.includes('fundraising advice'), 'grounds in specific offer');
  assert.ok(insight.length > 40, 'produces non-trivial output');
});

test('generateInsightText — one-way ask/offer bridge', () => {
  const source = makeProfile({ name: 'Sara', asks: ['investor introductions'] });
  const candidate = makeProfile({ name: 'James', offers: ['investor introductions'] });

  const insight = generateInsightText(source, candidate);

  assert.ok(insight.includes('investor introductions'), 'grounds in specific ask/offer');
  assert.ok(insight.includes('Sara') || insight.includes('James'), 'names a participant');
});

test('generateInsightText — mutual role fit when no ask/offer overlap', () => {
  const source = makeProfile({ name: 'Ana', userType: 'founder', preferredUserTypes: ['investor'] });
  const candidate = makeProfile({ name: 'Raj', userType: 'investor', preferredUserTypes: ['founder'] });

  const insight = generateInsightText(source, candidate);

  assert.ok(insight.includes('founder') || insight.includes('investor'), 'mentions role types');
  assert.ok(insight.length > 20, 'produces non-trivial output');
});

test('generateInsightText — shared intents appear in sentence 2', () => {
  const source = makeProfile({ name: 'Leila', matchIntent: ['collaboration', 'mentorship'] });
  const candidate = makeProfile({ name: 'Theo', matchIntent: ['collaboration', 'partnerships'] });

  const insight = generateInsightText(source, candidate);

  assert.ok(insight.includes('collaboration'), 'shared intent surfaces');
});

test('generateInsightText — same location triggers location sentence', () => {
  const source = makeProfile({ name: 'Nour', location: 'Berlin, Germany' });
  const candidate = makeProfile({ name: 'Kai', location: 'Berlin, Germany' });

  const insight = generateInsightText(source, candidate);

  assert.ok(insight.includes('Berlin'), 'includes shared location');
});

test('generateInsightText — always produces at least 2 sentences', () => {
  const source = makeProfile({ name: 'Alice' });
  const candidate = makeProfile({ name: 'Bob' });

  const insight = generateInsightText(source, candidate);
  const sentences = insight.split(/(?<=[.!?])\s+/).filter(Boolean);

  assert.ok(sentences.length >= 2, `expected >= 2 sentences, got: ${insight}`);
});

test('generateInsightText — output is stored in recommendation after weekly matching', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });

  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });

    assert.ok(pending.length > 0, 'expected pending recommendations after matching');

    for (const rec of pending) {
      assert.ok(typeof rec.insightText === 'string', `insightText should be a string, got ${typeof rec.insightText}`);
      assert.ok(rec.insightText.length > 0, `insightText should not be empty for rec ${rec.id}`);
    }
  } finally {
    cleanup();
  }
});

test('generateInsightText — insight is available on user-facing recommendation list', () => {
  const { app, cleanup } = createIsolatedApp({ seed: true });

  try {
    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
    const pending = app.services.adminReview.listQueue({ status: 'pending_review' });
    assert.ok(pending.length > 0, 'expected pending recommendations');

    const rec = pending[0];
    app.services.adminReview.decide({
      recommendationId: rec.id,
      adminId: 'admin_system',
      decision: 'approve',
      rationale: 'Insight generation test approval.',
    });

    const userRecs = app.services.recommendations.listForUser(rec.userId);
    const found = userRecs.find((r) => r.id === rec.id);

    assert.ok(found, 'recommendation found in user list');
    assert.ok(typeof found.insightText === 'string', 'insightText is a string on user-facing rec');
    assert.ok(found.insightText.length > 0, 'insightText is non-empty on user-facing rec');
  } finally {
    cleanup();
  }
});
