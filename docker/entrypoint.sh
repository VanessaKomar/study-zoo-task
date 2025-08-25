#!/usr/bin/env bash
set -euo pipefail

if [[  $# -lt 1 ]]; then
  echo "Usage: zoo-task <SESSION_ID>"
  echo "Example: docker compose run --rm --service-ports zoo-task s01"
  exit 1
fi

SESSION_ID="$1"

# Start your app (port 80 inside the container)
echo "Starting app with SESSION_ID=${SESSION_ID}"
exec node src/chat/slack_read.js "${SESSION_ID}"
