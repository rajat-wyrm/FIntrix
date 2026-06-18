#!/usr/bin/env bash
# Start Fintrix backend (production) and frontend (preview) together.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Fintrix backend on :5000"
cd "$ROOT/backend"
node server.js &
BACK_PID=$!

echo "Starting Fintrix frontend preview on :4173"
cd "$ROOT/frontend"
npm run preview -- --host 0.0.0.0 --port 4173 &
FRONT_PID=$!

echo "Backend PID=$BACK_PID   Frontend PID=$FRONT_PID"
wait
