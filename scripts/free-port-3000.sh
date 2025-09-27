#!/bin/sh
# POSIX-compliant: frees a TCP port by gracefully killing listeners, then force-killing if needed.
# Usage: sh scripts/free-port-3000.sh [PORT]
PORT="${1:-3000}"

# Find PIDs listening on the port (macOS lsof)
PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)

if [ -n "${PIDS:-}" ]; then
  echo "Port $PORT in use by PID(s): $PIDS"
  echo "Attempting graceful shutdown..."
  # Try graceful termination
  kill -TERM $PIDS 2>/dev/null || true

  # Wait up to 5 seconds for processes to exit and port to free
  i=0
  while [ $i -lt 5 ]; do
    sleep 1
    i=$((i+1))
    STILL=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
    if [ -z "${STILL:-}" ]; then
      break
    fi
  done

  # If still occupied, force kill remaining
  STILL=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "${STILL:-}" ]; then
    echo "Force killing remaining PID(s): $STILL"
    kill -KILL $STILL 2>/dev/null || true
    sleep 1
  fi
else
  echo "Port $PORT is free."
fi

# Final check (non-fatal)
if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  echo "Warning: Port $PORT still appears to be in use."
fi

exit 0
