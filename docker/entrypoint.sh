#!/usr/bin/env bash
set -euo pipefail

# read from environment variable or use default-session if not set
SESSION_ID="${SESSION_ID:-default-session}"

node src/data_backup.js &

# Start your app (port 80 inside the container)
echo "Starting app with SESSION_ID=${SESSION_ID}"
exec node src/chat/slack_read.js "${SESSION_ID}"
