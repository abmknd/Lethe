# Trial Scope Lock (10 Working Days)

Timebox:
- Trial window: April 20, 2026 to May 1, 2026 (10 working days).

Locked decisions:
- No bespoke ML during the trial.
- No synthetic-data-based model training during the trial.
- Local-only delivery is acceptable.
- Seeded users are acceptable for demo.
- Matching engine for trial is deterministic: hard filters + weighted scoring + optional human review.
- Freeze non-essential UI polish and non-critical product areas.

Rescope update (April 21, 2026):
- Keep the trial focused on one intro-loop slice only: onboarding -> weekly/manual deterministic matching -> admin review -> user response/follow-through -> events.
- Prioritize matching credibility over breadth: ask-offer complementarity, role/domain fit, availability, and deterministic explainability.
- Keep delivery local-first for demo, but maintain service/repository boundaries for portability.

In scope:
- Thin local V1 intro loop only.
- Onboarding capture for intent, preferences, availability, intro/profile fields.
- Weekly/manual recommendation generation.
- Human-in-the-loop approve/reject flow.
- Event + feedback capture for core lifecycle.
- Deterministic scoring signals with stored `why_matched` reasons.

Deferred (explicitly out of trial scope):
- Bespoke model training and evaluation pipelines.
- Synthetic training datasets for production matching claims.
- Advanced AI personalization and premium AI features.
- Broad redesign/polish outside trial-critical screens.
- Non-critical social/community feature expansion.
- Calibration/experimentation work that does not directly improve trial intro-loop credibility.

Trial demo success definition:
- Fresh checkout can initialize local data, seed demo users, run matching, review approvals, and show resulting outcomes.
- Demo path uses persisted data, not hardcoded recommendation mocks.
- Team can explain scope, deferred items, and why this MVP is credible.
- Demo operator can run the scripted smoke check and follow runbook steps (`trial:smoke` + trial demo runbook docs).
