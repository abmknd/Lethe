# Lethe Branching Strategy (Stage 2 / MVP)

## Branch model

### `main` (protected)
- Purpose: production-ready or near-production-ready code only.
- Rule: no direct development and no direct pushes.
- Promotion: code is promoted here intentionally at milestone checkpoints after stabilization.

### `mvp` (integration branch)
- Purpose: active Stage 2 / MVP integration branch.
- Used for: MVP tickets, local-first implementation, backend hardening, and PR validation before demo refreshes.
- Rule: no direct feature pushes unless Nabil explicitly asks for a direct push in that turn.
- All MVP ticket work targets `mvp` via PR.

### `demo` (stable demo branch)
- Purpose: stable runnable demo branch.
- Used for: founder demos, investor demos, and internal walkthroughs.
- Rule: should stay runnable at all times.
- Refresh intentionally from `mvp` when a demo cut is needed.

### short-lived working branches (from `mvp`)
- All MVP implementation work branches from `mvp` and targets `mvp` via PR.
- Examples:
  - `feat/local-first-insights`
  - `feat/cep-lite-weekly-intent`
  - `feat/profile-completeness-gates`
  - `fix/trial-meeting-state`
  - `chore/docs-branching-strategy`

## MVP integration rules for `mvp`
- Deterministic matching first.
- Backend/core restructuring is allowed.
- Aggressive descoping is allowed when it improves delivery confidence.
- Speculative ML, synthetic training pipelines, and non-critical breadth stay out of `mvp` unless explicitly approved.

## PR targets during MVP
- Base branch for MVP ticket PRs: `mvp`.
- `demo` should only receive intentional demo refreshes.
- `main` should only receive intentionally promoted, stable code.

## Recommended branch protections

### `main`
- Require pull request before merge.
- Disallow direct pushes.
- Require at least one review (if practical).
- Require status checks before merge (once checks exist).

### `mvp`
- Require pull request before merge.
- Disallow direct pushes when branch protection is available.
- Require status checks before merge.

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
git checkout mvp
git pull origin mvp
git checkout -b feat/<ticket-name>
```

```bash
git add .
git commit -m "<clear commit message>"
git push -u origin feat/<ticket-name>
```

Open PR:
- base: `mvp`
- compare: `feat/<ticket-name>`

Refresh `demo` from `mvp` only when a stable demo cut is explicitly approved.
