# Lethe — demo branch

Lethe is a deliberately slow, curated professional intro platform. Content decays over time. Connections are earned through a weekly matching loop with human-in-the-loop review — not instant follows.

This branch (`demo`) is the integration branch. It contains the full product shell **and** the working trial backend: real persistence, a deterministic matching engine, an admin review queue, and event logging. Everything runs locally — no cloud, no external database.

---

## Quick start (testers)

```bash
git clone https://github.com/abmknd/lethe.git
cd lethe
git checkout demo
npm run demo
```

That single command installs dependencies, seeds the local database, and starts both servers. Once running:

| Surface | URL |
|---|---|
| Product UI | http://localhost:5173 |
| Trial (real data) | http://localhost:5173/trial |
| Trial API | http://localhost:8787 |

Press **Ctrl+C** to stop everything cleanly.

---

## Demo variants

```bash
npm run demo            # keep existing database, start servers
npm run demo:reset      # wipe database, reseed, start servers
npm run demo:smoke      # wipe, reseed, run smoke check, then start servers
```

Use `demo:reset` if you want a clean slate. Use `demo:smoke` before recording a walkthrough or screen share — it validates the full intro loop end to end before the servers start.

---

## What to demo

The trial path (`/trial/*`) runs on real persisted data. Use this for any meaningful walkthrough.

### Recommended order

1. **`/trial`** — home panel. Shows seeded users and API status.
2. **`/trial/onboarding`** — pick a user, edit their intent, asks, offers, availability. Save and reload to confirm persistence.
3. **`/trial/connect`** — run the weekly matcher. See generated recommendations with `why_matched` explanations.
4. **`/trial/admin`** — open the pending queue. Approve one recommendation with a rationale, reject another. Watch row status update.
5. **`/trial/events`** — filter events by user, type, or recommendation ID. Verify the full event chain: `recommendation_generated` → admin decision → user response → outcome.
6. **Back to `/trial/connect`** — accept or pass on an approved suggestion. Mark intro sent. Confirm follow-through persists on reload.
7. **Terminal** — run `npm run trial:report:weekly` for a metrics snapshot: generation volume, decision rates, response rates, median latency.

### Product shell (UI only, no backend)

The main UI routes (`/feed`, `/connect`, `/matches`, `/profile`, etc.) are the product visual shell. They use hardcoded mock data — no persistence, no auth. They demonstrate the product aesthetic and content decay mechanic, not the intro engine.

---

## All commands

| Command | What it does |
|---|---|
| `npm run demo` | Install → seed → start API + frontend |
| `npm run demo:reset` | Reset DB → seed → start API + frontend |
| `npm run demo:smoke` | Reset → seed → smoke check → start API + frontend |
| `npm run trial:init` | Seed DB (skip if data exists) |
| `npm run trial:init:reset` | Wipe and reseed DB |
| `npm run trial:api` | Start trial API on port 8787 |
| `npm run dev` | Start frontend on port 5173 |
| `npm run trial:run-weekly` | Run the matching engine manually |
| `npm run trial:report:weekly` | Print metrics snapshot to terminal |
| `npm run trial:smoke` | Smoke check: init → match → admin → user response → outcome |
| `npm run trial:test:backend` | Run backend unit tests |

---

## If something breaks

```bash
npm run demo:reset      # wipe DB and start fresh
npm run trial:smoke     # validate the full loop without starting servers
```

The most common issue is a stale database. `demo:reset` fixes it.

---

## Branch model

```
feature/* → demo → main
```

`demo` is the integration branch. All trial backend work and UI wiring lands here first. Once stable, `demo` promotes to `main`. Never develop directly on `demo` — open a PR from a feature branch.

---

## Further reading

- [Intelligence plan](./docs/intelligence-plan.md) — product + engineering strategy, staged rollout, what's deferred and why
- [Repo architecture](./docs/architecture/repo-architecture.md) — directory ownership and boundary rules
- [Demo runbook](./docs/trial-demo-runbook.md) — detailed walkthrough and acceptance checklist
- [Local-first architecture](./docs/trial-local-first-architecture.md) — why SQLite, why local-only for now
