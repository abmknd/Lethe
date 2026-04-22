import { DEFAULT_ADMIN_ID, SEEDED_USERS } from './seed-data.mjs';
import { nowIso, normalizeProfilePayload } from '../domain/models.mjs';

export function clearAllTrialData(db) {
  db.exec(`
    DELETE FROM events;
    DELETE FROM outcomes;
    DELETE FROM admin_decisions;
    DELETE FROM recommendations;
    DELETE FROM recommendation_runs;
    DELETE FROM availability_slots;
    DELETE FROM preferences;
    DELETE FROM users;
  `);
}

export function seedTrialData(repository) {
  validateSeedDataset(SEEDED_USERS);

  for (const seed of SEEDED_USERS) {
    repository.upsertUserProfile(
      normalizeProfilePayload({
        ...seed,
        preferences: {
          ...seed.preferences,
          offers: seed.preferences.offers ?? [],
          asks: seed.preferences.asks ?? [],
          preferredLocations: seed.preferences.preferredLocations ?? [seed.user.location],
          preferredUserTypes: seed.preferences.preferredUserTypes ?? ['builder', 'operator', 'researcher'],
          objectives: seed.preferences.objectives ?? seed.preferences.matchIntent ?? [],
        },
      }),
    );
  }

  repository.appendEvents([
    {
      id: `evt_seed_${Date.now()}`,
      eventType: 'seed_initialized',
      actorUserId: DEFAULT_ADMIN_ID,
      payload: {
        users: SEEDED_USERS.length,
      },
      createdAt: nowIso(),
    },
  ]);

  return {
    usersSeeded: SEEDED_USERS.length,
  };
}

function validateSeedDataset(seeds) {
  const ids = new Set();

  for (const seed of seeds) {
    if (!seed.user?.id) {
      throw new Error('Seed user is missing id.');
    }
    if (ids.has(seed.user.id)) {
      throw new Error(`Duplicate seed user id: ${seed.user.id}`);
    }
    ids.add(seed.user.id);

    if (!seed.user?.displayName && !seed.user?.name) {
      throw new Error(`Seed user ${seed.user.id} is missing a name/displayName.`);
    }
    if (!seed.preferences?.matchIntent?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing matchIntent.`);
    }
    if (!seed.preferences?.interests?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing interests.`);
    }
    if (!seed.preferences?.offers?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing offers.`);
    }
    if (!seed.preferences?.asks?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing asks.`);
    }
    if (!seed.preferences?.preferredUserTypes?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing preferredUserTypes.`);
    }
    if (!seed.availability?.length) {
      throw new Error(`Seed user ${seed.user.id} is missing availability slots.`);
    }
  }
}
