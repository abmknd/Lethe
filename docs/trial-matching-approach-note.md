# Trial Matching Approach (MVP V1)

Approach:
- Deterministic matching only for trial.
- Pipeline: filter candidates -> score candidates -> rank -> return top 5 per user -> optional admin review.

Hard filters:
- User is active.
- Matching consent/matching enabled is true.
- Availability overlap exists.
- Preference compatibility passes minimum threshold.
- Exclude blocked users.
- Exclude recent intros.
- Exclude prior rejects during cooldown window.

Weighted scoring:
- Intent overlap.
- Interest overlap.
- Intro/profile text similarity.
- Timezone and schedule fit.
- Novelty/diversity penalty.

Output requirements:
- Up to 5 recommendations per user per run.
- Each recommendation stores score, rank, and `why_matched` explanation fields.

Review mode:
- Human review can approve/reject recommendations before intro.
- Rejected recommendations are excluded from immediate re-surface.

Explicit non-goals for trial:
- No custom model training.
- No synthetic-data-based learned ranking.
- No claims of production-grade ML personalization.
