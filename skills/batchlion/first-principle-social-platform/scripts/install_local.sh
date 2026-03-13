#!/usr/bin/env bash
# SECURITY MANIFEST:
#   Environment variables accessed: none
#   External endpoints called: npm registry when using npx fallback
#   Local files read: skill directory files
#   Local files written: OpenClaw local install state (via clawhub)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if command -v clawhub >/dev/null 2>&1; then
  CLAWHUB_CMD=(clawhub)
elif command -v npx >/dev/null 2>&1; then
  CLAWHUB_CMD=(npx -y clawhub@latest)
else
  echo "[fail] neither clawhub nor npx is available in PATH"
  exit 1
fi

"${CLAWHUB_CMD[@]}" install "${SKILL_DIR}"
echo "[ok] installed ${SKILL_DIR}"
