# Relethe Branching Strategy (post-cutover)

> Updated 2026-07-01 after Reconciliation 3a. `main` and `mvp` were reconciled
> in PR #94: `main` now reflects the launched product and is the single
> integration + production branch. `mvp` is retired (see below).

## Branch model

### `main` (protected, default)
- Purpose: production. Reflects the launched product.
- Integration: all feature and fix work is merged here via PR.
- Deploys: pushes to `main` publish to GitHub Pages (`deploy.yml`). Vercel
  production also deploys from `main` once the production branch is switched
  over (Reconciliation 3b).
- Rule: no direct pushes; changes land through PRs.

### `mvp` (retired)
- Historical Stage 2 / MVP integration branch. Promoted into `main` on
  2026-07-01 via PR #94, so `main` == `mvp` in content.
- Do not open new work against `mvp`. It is frozen and slated for deletion
  once Vercel production is repointed to `main` and smoke-tested
  (Reconciliation 3b/3d). Until then it is kept in sync with `main`.

### `demo` (stable demo branch)
- Purpose: stable runnable demo branch for founder / investor walkthroughs.
- Rule: should stay runnable at all times.
- Refresh intentionally from `main` when a demo cut is needed. (It is currently
  a stale offshoot of the old `mvp` lineage and unrelated to `main` history; a
  fresh cut from `main` is needed next time it is refreshed.)

### short-lived working branches (from `main`)
- All implementation work branches from `main` and targets `main` via PR.
- Examples:
  - `feat/local-first-insights`
  - `feat/cep-lite-weekly-intent`
  - `fix/trial-meeting-state`
  - `chore/<maintenance>`

## PR targets
- Base branch for all ticket PRs: `main`.
- `demo` should only receive intentional demo refreshes from `main`.

## CI
- `ci.yml` (`.github/workflows/mvp-ci.yml`) runs backend tests + build on push
  and PR to `main` (and, transitionally, `mvp`). Drop `mvp` from its triggers
  once the branch is deleted.
- `supabase-keepalive.yml` runs on a daily schedule from the default branch
  (`main`); it is not branch-specific.

## Recommended branch protections

### `main`
- Require pull request before merge.
- Disallow direct pushes.
- Require at least one review (if practical).
- Consolidate the classic branch-protection rule and the "Protect main" ruleset
  so there is a single source of truth for the merge policy.

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
git checkout main
git pull origin main
git checkout -b feat/<ticket-name>
```

```bash
git add .
git commit -m "<clear commit message>"
git push -u origin feat/<ticket-name>
```

Open PR:
- base: `main`
- compare: `feat/<ticket-name>`

Refresh `demo` from `main` only when a stable demo cut is explicitly approved.
