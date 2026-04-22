# Layer 2 Profile/Context Support v1 (Deterministic, Admin-First)

## Purpose
Improve reviewer understanding and explanation quality in `/trial/admin` without changing ranking behavior.

## v1 scope
- Deterministic profile/context support only.
- Admin-first surface only.
- Uses existing persisted entities.
- Adds generation-time explanation snapshot to `recommendation_generated` events for auditability and traceability.
- Computes current reviewer context on read from persisted entities/notes.

## Context corpus (deterministic)
- structured onboarding fields
- free-text onboarding/bio
- calibration choices (`preferences.objectives`)
- admin notes/rationales
- prior intro/follow-up notes/outcomes when available

## API (admin-first)
- `GET /api/trial/admin/recommendations/:recommendationId/context`
- Returns:
  - `sourceContext`
  - `candidateContext`
  - `explanationSupport`
  - `meta` (`strategy`, `snapshotUsed`)

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
- Does not expose context on `/trial/connect`.
- Does not create a general-purpose context warehouse.
