# Trial Data and Events Note

Local persistence entities:
- `users`
- `preferences`
- `availability_slots`
- `recommendations`
- `recommendation_runs`
- `admin_decisions`
- `events`
- `outcomes`

Minimum event taxonomy:
- `recommendation_generated`
- `admin_approved`
- `admin_rejected`
- `user_accept`
- `user_pass`
- `intro_sent`
- `follow_through_updated`

Event logging rules:
- Every trial-critical action writes an event with actor, timestamp, and entity reference.
- Recommendation events must link back to recommendation run and user.
- Admin decisions must persist rationale/notes.
- Outcome updates must be traceable through event history.
- Event history must support filtering by `recommendationId` for row-level traceability from admin/recommendations views.

Feedback and outcomes:
- Accept/pass actions must persist.
- Follow-through state must persist and be updateable.
- Event history must be inspectable locally for demo and learnings.

Definition of done for data/events:
- End-to-end flow produces coherent local records from onboarding to recommendation to admin decision to user feedback/outcome.
- Reload/restart does not lose trial-critical state.
- Admin decision conflicts and rationale validation return deterministic error messages for predictable UI handling.

Weekly reporting:
- Use `npm run trial:report:weekly` to generate a local snapshot from persisted recommendations/events/outcomes.
- Snapshot includes generated volume, decision rates, response rates, outcome counts, and median generated-to-decision latency.
