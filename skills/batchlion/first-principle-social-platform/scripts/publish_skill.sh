#!/usr/bin/env bash
# SECURITY MANIFEST:
#   Environment variables accessed: none
#   External endpoints called: ClawHub registry endpoint; npm registry when using npx fallback
#   Local files read: skill directory files
#   Local files written: ClawHub local publish/install metadata (via clawhub)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${SKILL_DIR}/SKILL.md" ]]; then
  SKILL_FILE="${SKILL_DIR}/SKILL.md"
elif [[ -f "${SKILL_DIR}/skill.md" ]]; then
  SKILL_FILE="${SKILL_DIR}/skill.md"
else
  echo "[fail] missing SKILL.md/skill.md in ${SKILL_DIR}"
  exit 1
fi

SKILL_VERSION="$(awk -F': *' '/^version:[[:space:]]*/ {print $2; exit}' "${SKILL_FILE}" | tr -d '[:space:]')"
if [[ -z "${SKILL_VERSION}" || ! "${SKILL_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "[fail] invalid or missing semver version in ${SKILL_FILE}"
  echo "       expected: version: x.y.z"
  exit 1
fi

if command -v clawhub >/dev/null 2>&1; then
  CLAWHUB_CMD=(clawhub)
elif command -v npx >/dev/null 2>&1; then
  CLAWHUB_CMD=(npx -y clawhub@latest)
else
  echo "[fail] neither clawhub nor npx is available in PATH"
  exit 1
fi

HAS_VERSION_ARG=0
for arg in "$@"; do
  if [[ "${arg}" == "--version" || "${arg}" == --version=* ]]; then
    HAS_VERSION_ARG=1
    break
  fi
done

PUBLISH_ARGS=(publish "${SKILL_DIR}")
if [[ "${HAS_VERSION_ARG}" -eq 0 ]]; then
  PUBLISH_ARGS+=(--version "${SKILL_VERSION}")
fi
PUBLISH_ARGS+=("$@")

bash "${SCRIPT_DIR}/prepublish_check.sh"
"${CLAWHUB_CMD[@]}" "${PUBLISH_ARGS[@]}"
echo "[ok] published ${SKILL_DIR} (version ${SKILL_VERSION})"
