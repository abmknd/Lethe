# Lethe Branching Strategy (Trial Phase)

## Branch model

### `main` (protected)
- Purpose: production-ready or near-production-ready code only.
- Rule: no direct development and no direct pushes.
- Promotion: code is promoted here intentionally from `demo` after stabilization.

### `demo` (integration + demo branch)
- Purpose: stable integration branch for the trial.
- Used for: founder demos, investor demos, internal walkthroughs, and MVP integration.
- Rule: should stay runnable at all times.

### short-lived working branches (from `demo`)
- All trial implementation work branches from `demo` and targets `demo` via PR.
- Examples:
  - `feat/persistence-schema`
  - `feat/onboarding-persistence`
  - `feat/deterministic-matching`
  - `feat/admin-review-queue`
  - `feat/event-logging`
  - `fix/admin-queue-state`
  - `chore/docs-branching-strategy`

## Trial-specific integration rules for `demo`
- Deterministic matching first.
- Backend/core restructuring is allowed.
- Aggressive descoping is allowed when it improves delivery confidence.
- Speculative ML, synthetic training pipelines, and non-critical breadth stay out of `demo` unless explicitly approved.

## PR targets during trial
- Base branch for trial PRs: `demo`.
- `main` should only receive intentionally promoted, stable code.

## Recommended branch protections

### `main`
- Require pull request before merge.
- Disallow direct pushes.
- Require at least one review (if practical).
- Require status checks before merge (once checks exist).

### `demo`
- Prefer pull-request-only merges.
- Can be lighter than `main`, but avoid arbitrary direct pushes.
- Keep minimum checks required for demo stability.

## Naming conventions
- `feat/...` for new work.
- `fix/...` for bug fixes.
- `chore/...` for maintenance/docs/tooling.
- Use short, descriptive, kebab-case names.

## Standard ticket workflow

```bash
git checkout demo
git pull origin demo
git checkout -b feat/<ticket-name>
```

```bash
git add .
git commit -m "<clear commit message>"
git push -u origin feat/<ticket-name>
```

Open PR:
- base: `demo`
- compare: `feat/<ticket-name>`

Only promote `demo` -> `main` when stable and explicitly approved.
