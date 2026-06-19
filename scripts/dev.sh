#!/bin/bash
# Dev server — builds and runs, kills old instance first
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PIDFILE="$PROJECT_DIR/.dev-pid"
URLFILE="$PROJECT_DIR/.dev-url"
BINARY="$PROJECT_DIR/keystroke-kingdom"

# Kill existing instance by PID file
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
fi

# Kill any other lingering instances of the binary
pkill -f "$BINARY" 2>/dev/null || true

# Wait for processes to actually die
for i in $(seq 1 10); do
  pgrep -f "$BINARY" >/dev/null 2>&1 || break
  sleep 0.1
done
# Force kill if still alive
pkill -9 -f "$BINARY" 2>/dev/null || true

rm -f "$URLFILE"

# Build
cd "$PROJECT_DIR"
go build -o "$BINARY" . 2>&1

# Run in background
"$BINARY" &
echo $! > "$PIDFILE"

# Wait for URL file to appear
for i in $(seq 1 20); do
  if [ -f "$URLFILE" ]; then
    echo "$(cat "$URLFILE")"
    exit 0
  fi
  sleep 0.1
done

echo "Server started (PID $(cat $PIDFILE)) but URL not yet available"
