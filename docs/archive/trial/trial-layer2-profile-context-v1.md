# Layer 2 Profile/Context Support v1 (Deterministic, Admin + Bridge Read APIs)

## Purpose
Improve reviewer understanding and explanation quality in `/trial/admin`, and expose lightweight viewer-safe bridge payloads for recommendation cards, without changing ranking behavior.

## v1 scope
- Deterministic profile/context support only.
- Admin surface and bridge-read API surface only.
- Uses existing persisted entities.
- Adds generation-time explanation snapshot to `recommendation_generated` events for auditability and traceability.
- Computes current reviewer context on read from persisted entities/notes.

## Context corpus (deterministic)
- structured onboarding fields
- free-text onboarding/bio
- calibration choices (`preferences.objectives`)
- admin notes/rationales
- prior intro/follow-up notes/outcomes when available

## API (implemented)
- `GET /api/trial/admin/recommendations/:recommendationId/context`
- `GET /api/trial/recommendations/:recommendationId/participants-context`
- `GET /api/trial/users/:userId/context`
- Returns:
  - `sourceContext`
  - `candidateContext`
  - `explanationSupport`
  - `meta` (`strategy`, `snapshotUsed`)

Bridge payloads return lightweight participant context for card rendering:
- participant identity/context:
  - `id`, `displayName`, `handle`, `location`, `timezone`
  - `summary`
  - `reviewerContextCard`
- extraction subset:
  - `asks`, `offers`, `intents`, `interests`
  - `preferredUserTypes`, `calibrationChoices`, `availabilityDigest`
- explanation subset:
  - `headline`, `highlights`, `alignment`, compact `evidence`
- metadata:
  - `strategy`, `snapshotUsed`

Shared typed contracts:
- `ParticipantContext`
- `RecommendationParticipantsContextResponse`
- `UserContextResponse`

## Evidence reference contract
Each explanation evidence reference must include:
- `entityType`
- `entityId`
- `fieldPath`
- `normalizedValue`
- optional `sourceTimestamp`

## Architecture split
- Generation-time snapshot:
  - Stored under `payload.explanationSupportSnapshot` in `recommendation_generated` events.
  - Prefer this for "what the system thought at generation time".
- Current reviewer context:
  - Computed on read from persisted entities and notes.
  - Used for latest reviewer context card.

## Non-goals
- Does not affect ranking/scoring behavior.
- Does not introduce vector retrieval.
- Does not introduce LLM summarization.
- Does not wire bridge payloads to main UI in this phase.
- Does not create a general-purpose context warehouse.

## Viewer-safe contract rules
- Excludes private/unneeded fields from bridge payloads (for example `email`, `blockedUserIds`).
- Excludes raw extraction internals not needed by cards (for example `freeText`).
- Evidence payload is compact and capped server-side (default: 20 items).
- No auth/session behavior changes in this phase.
- No schema migrations in this phase.
