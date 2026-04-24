import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsolatedTrialApp } from './helpers/trial-test-harness.mjs';
import { buildProfileFixture } from './fixtures/profile-fixtures.mjs';

test('schema initializes with required trial tables', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });

  try {
    const tables = app.db
      .prepare(
        `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
      `,
      )
      .all()
      .map((row) => row.name);

    const expectedTables = [
      'users',
      'preferences',
      'availability_slots',
      'recommendation_runs',
      'recommendations',
      'admin_decisions',
      'events',
      'outcomes',
    ];

    for (const table of expectedTables) {
      assert.ok(tables.includes(table), `missing required table: ${table}`);
    }
  } finally {
    cleanup();
  }
});

test('onboarding persists users, preferences, and availability', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });

  try {
    const payload = buildProfileFixture({
      user: {
        id: 'user_persist_1',
        displayName: 'Persist One',
        handle: 'persist.one',
      },
    });

    const saved = app.services.onboarding.saveUserProfile(payload);

    assert.equal(saved.user.id, 'user_persist_1');
    assert.equal(saved.user.name, 'Persist One');
    assert.deepEqual(saved.preferences.offers, ['design feedback', 'product strategy']);
    assert.equal(saved.availability.length, 2);
    assert.equal(saved.availability[0].startTime, '17:00');
  } finally {
    cleanup();
  }
});

test('onboarding save-reload survives app restart on isolated db', () => {
  const first = createIsolatedTrialApp({ seed: false });
  const dbPath = first.dbPath;

  try {
    const payload = buildProfileFixture({
      user: {
        id: 'user_reload_1',
        displayName: 'Reload User',
        handle: 'reload.user',
      },
      preferences: {
        introText: 'Persistent intro text',
        objectives: ['calibration_choice_a'],
      },
    });

    first.app.services.onboarding.saveUserProfile(payload);

    first.app.close();

    const reopened = createIsolatedTrialApp({ seed: false, reset: false, dbPath });
    try {
      const profile = reopened.app.services.onboarding.getUserProfile('user_reload_1');
      assert.ok(profile, 'expected persisted profile after restart');
      assert.equal(profile.user.name, 'Reload User');
      assert.equal(profile.preferences.introText, 'Persistent intro text');
      assert.deepEqual(profile.preferences.objectives, ['calibration_choice_a']);
    } finally {
      reopened.app.close();
    }
  } finally {
    first.cleanup();
  }
});

test('settings updates persist across subsequent saves', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });

  try {
    const userId = 'user_settings_1';
    app.services.onboarding.saveUserProfile(
      buildProfileFixture({
        user: { id: userId, displayName: 'Settings User', handle: 'settings.user' },
      }),
    );

    const current = app.services.onboarding.getUserProfile(userId);
    assert.ok(current, 'expected profile to exist');

    const updated = app.services.onboarding.saveUserProfile({
      ...current,
      preferences: {
        ...current.preferences,
        localOnly: true,
        matchEnabled: false,
        introText: 'Updated intro text for persistence test',
      },
      user: {
        ...current.user,
        matchingEnabled: false,
      },
    });

    assert.equal(updated.preferences.localOnly, true);
    assert.equal(updated.preferences.matchEnabled, false);
    assert.equal(updated.user.matchingEnabled, false);
    assert.equal(updated.preferences.introText, 'Updated intro text for persistence test');
  } finally {
    cleanup();
  }
});

test('calibration choices persist with normalization rules', () => {
  const { app, cleanup } = createIsolatedTrialApp({ seed: false });

  try {
    const payload = buildProfileFixture({
      user: {
        id: 'user_calibration_1',
        displayName: 'Calibration User',
        handle: 'calibration.user',
      },
      preferences: {
        objectives: ['Taste Fit', 'taste fit', '  Speed ', '', 'Depth'],
      },
    });

    app.services.onboarding.saveUserProfile(payload);
    const profile = app.services.onboarding.getUserProfile('user_calibration_1');

    assert.ok(profile, 'expected profile to exist');
    assert.deepEqual(profile.preferences.objectives, ['Taste Fit', 'taste fit', 'Speed', 'Depth']);
    assert.equal(new Set(profile.preferences.objectives).size, 4);
  } finally {
    cleanup();
  }
});
