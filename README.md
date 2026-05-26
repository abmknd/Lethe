# Relethe

Relethe is a deliberately slow, curated professional intro platform. Content decays over time. Connections are earned through a weekly matching loop with human-in-the-loop review — not instant follows.

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
git clone https://github.com/abmknd/relethe.git
cd relethe
git checkout demo
npm run demo
```

Installs dependencies, seeds the local SQLite database, and starts both servers.

| Surface | URL |
|---|---|
| Product UI | http://localhost:5173 |
| MVP loop | http://localhost:5173/mvp |
| API | http://localhost:8787 |

Press **Ctrl+C** to stop.

---

## Demo commands

```bash
npm run demo            # keep existing database, start servers
npm run demo:reset      # wipe database, reseed, start servers
npm run demo:smoke      # wipe, reseed, smoke check, then start servers
```

---

## Run the MVP branch locally for QA (non-technical guide)

Use this when you want to test the live Relethe MVP on your own computer, against the real Supabase database, without touching the production website. This is the right setup for cohort rehearsals and QA.

You only do steps 1–3 once. After that, every QA session is just steps 4–6.

### 1. Install the tools you need (one time)

**macOS**

1. Open the **Terminal** app (Command+Space, type "Terminal", press Return).
2. Install Git and Node by copy-pasting these one at a time into Terminal and pressing Return after each:
   ```bash
   xcode-select --install
   ```
   (If a window pops up, click "Install" and wait until it finishes.)
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```
   Close Terminal, reopen it, then:
   ```bash
   nvm install 20
   ```

**Windows**

1. Install Git: download from https://git-scm.com/download/win, run the installer, accept all defaults.
2. Install Node 20: download from https://nodejs.org/en/download (LTS version), run the installer, accept all defaults.
3. Open **PowerShell** from the Start menu for all the steps below.

### 2. Get the code (one time)

In Terminal / PowerShell, copy-paste:

```bash
git clone https://github.com/abmknd/relethe.git
cd relethe
```

### 3. Set up your environment file (one time)

1. Switch to the MVP branch and install dependencies:
   ```bash
   git checkout mvp
   npm install
   ```
2. Make a copy of the example environment file:
   ```bash
   cp .env.example .env
   ```
   (On Windows PowerShell: `Copy-Item .env.example .env`)
3. Open the Supabase dashboard → **Project Settings → API**. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ…`)
4. Open the `.env` file in any text editor (TextEdit on Mac, Notepad on Windows). Replace the placeholders so it looks like:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ…
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ…
   ```
   Save and close the file.

### 4. Get the latest MVP code (every QA session)

```bash
cd relethe
git checkout mvp
git pull
npm install
```

### 5. Start the app

```bash
npm run dev
```

Wait until you see a line that says `Local: http://localhost:5173/`. Open that link in your browser. You're now running the MVP branch locally, talking to the real Supabase database.

### 6. Stop the app

Click back in the Terminal / PowerShell window and press **Ctrl+C**.

### Troubleshooting

- **"command not found: npm" or "git"** — close and reopen Terminal / PowerShell. If still broken, redo step 1.
- **The app loads but says "Signups not allowed for otp"** — that's a Supabase setting, not your computer. Ping Nabil.
- **You see "Lethe" instead of "Relethe" somewhere** — that's a bug to log, not a setup problem.
- **Anything else broken** — screenshot Terminal + the browser and send to Nabil.

---

## All commands

| Command | What it does |
|---|---|
| `npm run demo` | Install → seed → start API + frontend |
| `npm run demo:reset` | Reset DB → seed → start API + frontend |
| `npm run demo:smoke` | Reset → seed → smoke check → start API + frontend |
| `npm run mvp:test:backend` | Run all backend unit tests (20/20) |
| `npm run mvp:run-weekly` | Run the matching engine manually |
| `npm run mvp:report:weekly` | Print metrics snapshot to terminal |
| `npm run mvp:smoke` | Smoke check: init → match → admin → response → outcome |

---

## Branch model

```
feature/* → mvp → demo/main
```

`mvp` is the Stage 2 integration branch. MVP work lands there by PR from a feature branch. `demo` is refreshed intentionally from `mvp` for stable demo cuts; `main` is promoted only at milestone checkpoints.

---

## CI

The `MVP CI` workflow (`.github/workflows/mvp-ci.yml`) runs on every PR targeting `mvp` and every push to `mvp`. It installs dependencies, runs the backend test suite, and builds the frontend. Reproduce locally with:

```
npm ci
node --test "mvp/tests/**/*.test.mjs"
npm run build
```

The workflow is intended to be added as a required status check on the `mvp` branch in GitHub branch protection settings.

---

## Further reading

- [Product & Intelligence Roadmap](./docs/) — product direction, intelligence sequencing, engineering phases
- [Demo runbook](./docs/archive/trial/trial-demo-runbook.md) — full walkthrough and acceptance checklist
- [Local-first architecture](./docs/archive/trial/trial-local-first-architecture.md) — why SQLite, why local-only for trial
