#!/usr/bin/env bash
# demo.sh — local demo runner for the Lethe trial branch
#
# Usage:
#   bash scripts/demo.sh          — full setup + start
#   bash scripts/demo.sh --reset  — force-reset DB before starting
#   bash scripts/demo.sh --smoke  — run smoke check before starting
#
# What it does:
#   1. Checks Node.js is present
#   2. Installs dependencies if needed
#   3. Seeds the local SQLite database (--reset wipes and reseeds)
#   4. Optionally runs the smoke check
#   5. Starts the trial API (localhost:8787) and frontend (localhost:5173)
#   6. Cleans up both processes on Ctrl+C

set -euo pipefail

# ── colours ───────────────────────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

log()  { echo -e "${BOLD}${GREEN}▸${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $*"; }
err()  { echo -e "${RED}✗${RESET}  $*" >&2; }
dim()  { echo -e "${DIM}$*${RESET}"; }

# ── banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  L E T H E  —  local demo${RESET}"
echo -e "${DIM}  trial backend + UI, running entirely on your machine${RESET}"
echo ""

# ── args ──────────────────────────────────────────────────────────────────────
DO_RESET=false
DO_SMOKE=false
for arg in "$@"; do
  case $arg in
    --reset) DO_RESET=true ;;
    --smoke) DO_SMOKE=true ;;
    --help|-h)
      echo "Usage: bash scripts/demo.sh [--reset] [--smoke]"
      echo ""
      echo "  --reset   Wipe and reseed the local database before starting"
      echo "  --smoke   Run the smoke check before starting both servers"
      echo ""
      echo "URLs once running:"
      echo "  Frontend  →  http://localhost:5173"
      echo "  Trial UI  →  http://localhost:5173/trial"
      echo "  API       →  http://localhost:8787"
      exit 0
      ;;
  esac
done

# ── cd to repo root ───────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# ── prerequisites ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  err "Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  err "Node.js v18+ required (found $(node --version))"
  exit 1
fi
dim "  Node $(node --version)"

# ── install dependencies ──────────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  npm install --silent
else
  dim "  node_modules present — skipping install (run npm install manually if stale)"
fi

# ── seed database ─────────────────────────────────────────────────────────────
if [ "$DO_RESET" = true ]; then
  log "Resetting and seeding database..."
  npm run trial:init:reset
else
  log "Seeding database (use --reset to wipe first)..."
  npm run trial:init
fi

# ── smoke check ───────────────────────────────────────────────────────────────
if [ "$DO_SMOKE" = true ]; then
  log "Running smoke check..."
  npm run trial:smoke
  echo ""
fi

# ── process management ────────────────────────────────────────────────────────
API_PID=""
DEV_PID=""

cleanup() {
  echo ""
  log "Shutting down..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null && wait "$API_PID" 2>/dev/null || true
  [ -n "$DEV_PID" ] && kill "$DEV_PID" 2>/dev/null && wait "$DEV_PID" 2>/dev/null || true
  log "Done."
}
trap cleanup INT TERM

# ── start trial API ───────────────────────────────────────────────────────────
log "Starting trial API on http://localhost:8787 ..."
npm run trial:api &
API_PID=$!

# Give the API a moment to bind before the frontend starts hitting it
sleep 1

# ── start frontend ────────────────────────────────────────────────────────────
log "Starting frontend on http://localhost:5173 ..."
npm run dev -- --host 127.0.0.1 &
DEV_PID=$!

# ── ready ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  Ready.${RESET}"
echo ""
echo -e "  ${BOLD}Frontend${RESET}   →  http://localhost:5173"
echo -e "  ${BOLD}Trial UI${RESET}   →  http://localhost:5173/trial"
echo -e "  ${BOLD}API${RESET}        →  http://localhost:8787"
echo ""
echo -e "${DIM}  Demo path: /trial → onboarding → connect → admin → events${RESET}"
echo -e "${DIM}  Press Ctrl+C to stop both servers.${RESET}"
echo ""

# ── wait ──────────────────────────────────────────────────────────────────────
wait "$API_PID" "$DEV_PID"
