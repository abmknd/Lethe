# Trial Slice: Local-First, Production-Portable

This implementation keeps the MVP demo local while isolating business logic so storage, scheduling, and serving layers can be swapped later.

## Foundational (intended to carry forward)

- Domain + service boundaries:
  - `mvp/matching/deterministic-matcher.mjs`
  - `mvp/services/weekly-matching-service.mjs`
  - `mvp/services/admin-review-service.mjs`
  - `mvp/services/recommendation-service.mjs`
  - `mvp/services/onboarding-service.mjs`
- Repository boundary:
  - `mvp/repositories/interfaces.mjs`
  - `mvp/repositories/sqlite/sqlite-trial-repository.mjs` (SQLite adapter)
  - explicit repository interfaces: `UserRepository`, `PreferenceRepository`, `AvailabilityRepository`, `RecommendationRepository`, `EventRepository`, `AdminDecisionRepository`, `OutcomeRepository`
- Event model + persisted taxonomy:
  - `recommendation_generated`, `admin_approved`, `admin_rejected`, `user_accept`, `user_pass`, `intro_sent`, `follow_through_updated`
- Layer 2 Profile/Context Support v1 (Deterministic, Admin-First):
  - Generation-time explanation snapshots in `recommendation_generated` payloads for auditability
  - Read-time reviewer context derivation for `/trial/admin`
- Callable application service for matching:
  - `WeeklyMatchingService.runWeeklyMatching()`
- Thin API boundary between UI and services:
  - `mvp/api/server.mjs`
  - `src/app/trial/api.ts`

## Temporary (trial-local choices)

- SQLite file at `mvp/data/lethe-trial.sqlite`
- Local Node HTTP server for API (`scripts/trial-api-server.mjs`)
- Seeded demo users (`mvp/db/seed-data.mjs`)
- Minimal trial UI routes under `/trial/*`

## Portability path after trial

- Replace only adapter + wiring:
  - Keep services/matcher unchanged.
  - Swap `sqlite-trial-repository.mjs` for a Postgres-backed repository implementation.
- Replace scheduler trigger only:
  - Keep `runWeeklyMatching()` unchanged.
  - Move from local script trigger to cron/worker job.
- Replace local API host only:
  - Keep API contracts from `src/app/trial/api.ts` and service contracts stable.

## Local runbook (clean checkout)

1. Install deps:
   - `npm ci`
2. Initialize and seed local DB:
   - `npm run trial:init`
3. Run a matching batch manually:
   - `npm run trial:run-weekly`
4. Run deterministic smoke validation:
   - `npm run trial:smoke`
5. Start API server:
   - `npm run trial:api`
6. In another terminal, start UI:
   - `npm run dev`
7. Open trial pages:
   - `/lethe/trial`
   - `/lethe/trial/onboarding`
   - `/lethe/trial/connect`
   - `/lethe/trial/admin`
   - `/lethe/trial/events`

## Notes

- The production-portable design is in service/repository separation, not in infrastructure scale.
- No bespoke ML or synthetic-data training is used in this slice.
- Demo operator guides live in:
  - `docs/trial-demo-runbook.md`
  - `docs/trial-learnings-memo-template.md`
