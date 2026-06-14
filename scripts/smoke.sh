#!/usr/bin/env bash
#
# Floodlight end-to-end smoke test.
#
# Boots the backend against a throwaway SQLite DB, seeds it, then exercises
# every REST endpoint and the WebSocket feed, asserting expected status codes.
# Exits non-zero on the first failure. Intended for local verification and demos.
#
# Usage:  bash scripts/smoke.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$REPO_ROOT/backend"
PORT="${PORT:-8765}"
BASE="http://127.0.0.1:$PORT/api/v1"
PASS=0
FAIL=0

cd "$BACKEND"
# shellcheck disable=SC1091
source .venv/bin/activate

export DEBUG=false
export DATABASE_URL="sqlite:///./smoke.db"
rm -f smoke.db
alembic upgrade head >/dev/null 2>&1
python -m app.utils.seed >/dev/null 2>&1

uvicorn app.main:app --host 127.0.0.1 --port "$PORT" >/tmp/smoke_uvicorn.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; rm -f "$BACKEND/smoke.db"' EXIT

# Wait for readiness.
for _ in $(seq 1 30); do
  if curl -sf "$BASE/health" >/dev/null 2>&1; then break; fi
  sleep 1
done

check() { # method path expected_code [data]
  local method="$1" path="$2" expected="$3" data="${4:-}"
  local code
  if [ -n "$data" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H 'Content-Type: application/json' -d "$data" "$BASE$path")
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE$path")
  fi
  if [ "$code" = "$expected" ]; then
    echo "  PASS  $method $path -> $code"; PASS=$((PASS + 1))
  else
    echo "  FAIL  $method $path -> $code (expected $expected)"; FAIL=$((FAIL + 1))
  fi
}

echo "== Floodlight smoke test =="
check GET  /health 200
check GET  /reports 200
check POST /reports 201 '{"text":"Family trapped on rooftop in Whitefield","latitude":12.9698,"longitude":77.75}'
check GET  /incidents 200
check GET  /resources 200
check GET  /shelters 200
check GET  /shelters/risk 200
check POST /optimization/run 200 '{}'
check GET  /prediction/risk 200
check POST /command/query 200 '{"query":"Which shelter will overflow?"}'
check POST /simulation/run 200 '{}'
check POST /reports/voice 422  # no multipart body -> validation error

# WebSocket: connect, trigger an event, expect at least one message.
python - <<'PY' && { echo "  PASS  WS /ws receives events"; } || { echo "  FAIL  WS /ws"; exit 1; }
import asyncio, json, urllib.request
from websockets.sync.client import connect
PORT = __import__("os").environ.get("PORT", "8765")
with connect(f"ws://127.0.0.1:{PORT}/api/v1/ws") as ws:
    req = urllib.request.Request(
        f"http://127.0.0.1:{PORT}/api/v1/simulation/run", method="POST")
    urllib.request.urlopen(req, timeout=10)
    msg = json.loads(ws.recv(timeout=10))
    assert "type" in msg, msg
PY

echo "== Result: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
