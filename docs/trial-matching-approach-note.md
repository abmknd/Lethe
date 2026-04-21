# Trial Matching Approach (MVP V1)

Approach:
- Deterministic matching only for trial.
- Pipeline: filter candidates -> score candidates -> rank -> return top 5 per user -> optional admin review.
- No custom training loop; use explicit, inspectable rules and scoring only.

Hard filters:
- User is active.
- Matching consent/matching enabled is true.
- Availability overlap exists.
- Preference compatibility passes minimum threshold.
- Exclude blocked users.
- Exclude recent intros.
- Exclude prior rejects during cooldown window.

Weighted scoring:
- Ask-offer complementarity (top signal).
- Role/domain fit (`preferred_user_types`).
- Intent overlap.
- Interest overlap (secondary signal).
- Intro/profile text similarity.
- Timezone-normalized schedule overlap.
- Novelty/diversity penalty.

Current weighting target (trial):
- Ask-offer fit: 30%
- Role/domain fit: 15%
- Intent overlap: 20%
- Interest overlap: 15%
- Intro/profile similarity: 10%
- Availability overlap: 10%

Output requirements:
- Up to 5 recommendations per user per run.
- Each recommendation stores score, rank, and `why_matched` explanation fields.

Review mode:
- Human review can approve/reject recommendations before intro.
- Rejected recommendations are excluded from immediate re-surface.
- Only `pending_review` recommendations can be decided.
- Both approve and reject require rationale (`>= 10` chars).
- Decision conflicts return deterministic message: `Recommendation is no longer pending review.`

Explicit non-goals for trial:
- No custom model training.
- No synthetic-data-based learned ranking.
- No claims of production-grade ML personalization.
