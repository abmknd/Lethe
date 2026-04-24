# Trial Demo Runbook (Ticket 5)

Purpose:
- Run a deterministic, local-first demo of the trial intro loop on screen share.
- Use `/trial/*` routes only for demo truth. Legacy `/connect` and `/matches` are prototype/mock surfaces.

## Pre-demo setup (clean checkout)

1. Install dependencies:
   - `npm install`
2. Initialize and seed local data:
   - `npm run trial:init:reset`
3. Start trial API:
   - `npm run trial:api`
4. Start frontend:
   - `npm run dev`
5. Optional preflight smoke check:
   - `npm run trial:smoke`
6. Optional weekly metrics snapshot:
   - `npm run trial:report:weekly`

## Demo flow (recommended order)

1. Home (`/trial`)
   - Show API base and run controls.
   - Confirm seeded users are present.

2. Onboarding (`/trial/onboarding`)
   - Pick one user.
   - Show/edit intent, offers, asks, meet_who (`preferred user types`), and availability.
   - Save and show success message.

3. Recommendations (`/trial/connect`)
   - Run weekly matcher.
   - Show recommendations with `why_matched` explanations.

4. Admin (`/trial/admin`)
   - Open pending queue.
   - Enter rationale and approve one recommendation.
   - Enter rationale and reject one recommendation.
   - Show row-level status updates.

5. Events (`/trial/events`)
   - Use event filters (user / event type / recommendation id).
   - Verify `recommendation_generated` and admin decision events.

6. Recommendations (`/trial/connect`) again
   - Show downstream status updates.
   - Optionally mark `intro_sent`.

7. Terminal metrics snapshot
   - Run `npm run trial:report:weekly`.
   - Review generated volume, decision rates, response rates, outcomes, and median generated-to-decision latency.

## Demo acceptance checklist

- [ ] Onboarding changes persist after page reload.
- [ ] `npm run trial:run-weekly` creates a completed `recommendation_runs` record with non-zero `summary_json.recommendationsGenerated`.
- [ ] Generated recommendations persist with `run_id` linked to the weekly run.
- [ ] `recommendation_generated` events exist for the weekly run.
- [ ] `POST /api/trial/matching/run-weekly` has parity with CLI behavior (run persisted + recommendations generated).
- [ ] Admin approve/reject requires rationale.
- [ ] Non-pending recommendations cannot be re-decided.
- [ ] Event log is filterable by `recommendationId`.
- [ ] Event log filters by `eventType` remain coherent when combined with `recommendationId`.
- [ ] Accept/pass emits user response events (`user_accept`/`user_pass`).
- [ ] Follow-through updates emit outcome events (`intro_sent` or `follow_through_updated`) and remain traceable by `recommendationId`.
- [ ] Outcome updates are visible in trial flow and persisted on reload.

## Manual smoke checklist (fresh checkout)

1. Run `npm run trial:init:reset`.
2. Run `npm run trial:smoke`.
3. Confirm smoke output includes:
   - non-zero generated recommendations for service and API runs
   - a recommendation id used for event validation
   - persisted outcome status after follow-through updates
4. In `/trial/events`, verify that filtering by the same `recommendationId` shows:
   - `recommendation_generated`
   - admin decision event (`admin_approved` or `admin_rejected`)
   - user response event (`user_accept` or `user_pass`)
   - outcome event (`intro_sent` and/or `follow_through_updated`)

## Recovery steps (if something goes wrong)

- Reset and reseed:
  - `npm run trial:init:reset`
- Re-run matching:
  - `npm run trial:run-weekly`
- Validate trial health quickly:
  - `npm run trial:smoke`
