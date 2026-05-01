# Lethe

Lethe is a deliberately slow, curated professional intro platform. Content decays over time. Connections are earned through a weekly matching loop with human-in-the-loop review — not instant follows.

**Status:** Trial complete and accepted. Now building Stage 2 / MVP for first real users.

---

## What is built

| Layer | What |
|---|---|
| Layer 1 | Structured profile state — role, location, timezone, asks, offers, availability |
| Layer 2 | Profile/context support — summaries, ask/offer extraction, reviewer context |
| Layer 3 | Deterministic matching engine — hard filters, weighted scoring, `why_matched`, HITL review |
| Layer 4 | Events and outcomes — full event chain, outcome tracking, weekly metrics |

---

## Quick start (local demo)

```bash
git clone https://github.com/abmknd/lethe.git
cd lethe
git checkout demo
npm run demo
```

Installs dependencies, seeds the local SQLite database, and starts both servers.

| Surface | URL |
|---|---|
| Product UI | http://localhost:5173 |
| Trial (real data) | http://localhost:5173/trial |
| Trial API | http://localhost:8787 |

Press **Ctrl+C** to stop.

---

## Demo commands

```bash
npm run demo            # keep existing database, start servers
npm run demo:reset      # wipe database, reseed, start servers
npm run demo:smoke      # wipe, reseed, smoke check, then start servers
```

## All commands

| Command | What it does |
|---|---|
| `npm run demo` | Install → seed → start API + frontend |
| `npm run demo:reset` | Reset DB → seed → start API + frontend |
| `npm run demo:smoke` | Reset → seed → smoke check → start API + frontend |
| `npm run trial:test:backend` | Run all backend unit tests (20/20) |
| `npm run trial:run-weekly` | Run the matching engine manually |
| `npm run trial:report:weekly` | Print metrics snapshot to terminal |
| `npm run trial:smoke` | Smoke check: init → match → admin → response → outcome |

---

## Branch model

```
feature/* → demo → main
```

`demo` is the integration branch. All work lands here first via PR. `main` is promoted from `demo` at milestone checkpoints.

---

## Further reading

- [Product & Intelligence Roadmap](./docs/) — product direction, intelligence sequencing, engineering phases
- [Demo runbook](./docs/trial-demo-runbook.md) — full walkthrough and acceptance checklist
- [Local-first architecture](./docs/trial-local-first-architecture.md) — why SQLite, why local-only for trial
