#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "Installing dependencies..."
npm install

echo "Seeding data directories..."
OC_SETUP_NO_DEV=1 node scripts/setup.mjs

echo "Session start complete."
