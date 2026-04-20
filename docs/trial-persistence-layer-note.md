# Ticket 2: Local Persistence Layer (SQLite)

This ticket introduces the minimum local persistence foundation for the trial intro loop, with repository/service boundaries so we can later swap storage and runtime layers.

## Local-first persistence (portable by design)

- Database engine now: SQLite (local file)
  - `mvp/data/lethe-trial.sqlite`
- Storage access isolated behind repositories/services
  - `mvp/repositories/interfaces.mjs`
  - `mvp/repositories/sqlite/sqlite-trial-repository.mjs`
- UI does not write directly to SQLite
  - UI -> `src/app/trial/api.ts` -> `mvp/api/server.mjs` -> services -> repository

## Minimal schema implemented

- `users`
- `preferences`
- `availability_slots`
- `recommendation_runs`
- `recommendations`
- `admin_decisions`
- `events`
- `outcomes`

Schema source:
- `mvp/db/schema.mjs`

## Repository abstractions

Implemented interfaces:
- `UserRepository`
- `PreferenceRepository`
- `AvailabilityRepository`
- `RecommendationRepository`
- `EventRepository`
- `AdminDecisionRepository`
- `OutcomeRepository`

Interface source:
- `mvp/repositories/interfaces.mjs`

## Seed dataset

- Seed users: 8 (varied intents, interests, locations, availability)
- Seed source:
  - `mvp/db/seed-data.mjs`
- Lightweight validation:
  - unique user ids
  - required match intents/interests/availability

## Init / reset commands

- Initialize + seed:
  - `npm run trial:init`
- Reset + seed:
  - `npm run trial:init:reset`
- Run weekly batch (manual):
  - `npm run trial:run-weekly`

## What is foundational vs temporary

Foundational:
- repository/service boundaries
- entity schema contracts
- deterministic local data flow for onboarding/recommendation/admin/events

Temporary:
- SQLite local file
- local HTTP API runtime script (`trial:api`)
- seeded demo data
