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
- [ ] Weekly run produces recommendations.
- [ ] Admin approve/reject requires rationale.
- [ ] Non-pending recommendations cannot be re-decided.
- [ ] Event log is filterable by `recommendationId`.
- [ ] Outcome updates are visible in trial flow.

## Recovery steps (if something goes wrong)

- Reset and reseed:
  - `npm run trial:init:reset`
- Re-run matching:
  - `npm run trial:run-weekly`
- Validate trial health quickly:
  - `npm run trial:smoke`
