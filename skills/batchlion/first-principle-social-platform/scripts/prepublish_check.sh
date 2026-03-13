#!/usr/bin/env bash
# SECURITY MANIFEST:
#   Environment variables accessed: none
#   External endpoints called: none
#   Local files read: skill directory files
#   Local files written: none

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${SKILL_DIR}"

echo "[check] skill directory: ${SKILL_DIR}"

if [[ -f "SKILL.md" ]]; then
  SKILL_FILE="SKILL.md"
elif [[ -f "skill.md" ]]; then
  SKILL_FILE="skill.md"
else
  echo "[fail] missing SKILL.md/skill.md"
  exit 1
fi

echo "[check] frontmatter fields in ${SKILL_FILE}"
if ! rg -q '^name:\s*[a-z0-9][a-z0-9-]*\s*$' "${SKILL_FILE}"; then
  echo "[fail] frontmatter.name must be slug-safe"
  exit 1
fi
if ! rg -q '^description:\s*.+$' "${SKILL_FILE}"; then
  echo "[fail] frontmatter.description missing"
  exit 1
fi
if ! rg -q '^version:\s*[0-9]+\.[0-9]+\.[0-9]+$' "${SKILL_FILE}"; then
  echo "[fail] frontmatter.version must be semver (x.y.z)"
  exit 1
fi
if ! rg -q '^metadata:\s*$' "${SKILL_FILE}"; then
  echo "[fail] frontmatter.metadata missing"
  exit 1
fi
if ! rg -q '^\s+(openclaw|clawdbot):\s*$' "${SKILL_FILE}"; then
  echo "[fail] frontmatter.metadata.openclaw or metadata.clawdbot missing"
  exit 1
fi

echo "[check] hidden files"
HIDDEN_FILES="$(find . -mindepth 1 -name '.*' \
  ! -path './.clawhub' \
  ! -path './.clawhub/*' \
  ! -path './.clawdhub' \
  ! -path './.clawdhub/*' \
  ! -path './.clawhubignore' \
  ! -path './.clawdhubignore' \
  -print)"
if [[ -n "${HIDDEN_FILES}" ]]; then
  echo "[fail] hidden files detected:"
  printf '%s\n' "${HIDDEN_FILES}"
  exit 1
fi

echo "[check] disallow obvious binary extensions"
if find . -type f \( \
  -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.gif' -o -name '*.webp' -o \
  -name '*.pdf' -o -name '*.zip' -o -name '*.gz' -o -name '*.tar' -o -name '*.tgz' -o \
  -name '*.exe' -o -name '*.dll' -o -name '*.so' -o -name '*.dylib' -o -name '*.class' -o \
  -name '*.jar' -o -name '*.pyc' -o -name '*.o' -o -name '*.a' \
\) -print -quit | rg -q '.'; then
  echo "[fail] binary-like file extension detected"
  find . -type f \( \
    -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.gif' -o -name '*.webp' -o \
    -name '*.pdf' -o -name '*.zip' -o -name '*.gz' -o -name '*.tar' -o -name '*.tgz' -o \
    -name '*.exe' -o -name '*.dll' -o -name '*.so' -o -name '*.dylib' -o -name '*.class' -o \
    -name '*.jar' -o -name '*.pyc' -o -name '*.o' -o -name '*.a' \
  \) -print
  exit 1
fi

if command -v file >/dev/null 2>&1; then
  echo "[check] MIME types are text-based"
  while IFS= read -r -d '' file_path; do
    mime_type="$(file -b --mime-type "${file_path}")"
    case "${mime_type}" in
      text/*|application/json|application/yaml|application/x-yaml|application/toml|application/xml|image/svg+xml|application/javascript|application/x-javascript)
        ;;
      *)
        echo "[fail] non-text file detected: ${file_path} (${mime_type})"
        exit 1
        ;;
    esac
  done < <(find . -type f -print0)
fi

echo "[check] shell script hardening"
while IFS= read -r -d '' sh_file; do
  if ! head -n 10 "${sh_file}" | rg -q 'set -euo pipefail'; then
    echo "[fail] missing 'set -euo pipefail' in ${sh_file}"
    exit 1
  fi
done < <(find scripts -type f -name '*.sh' -print0)

echo "[pass] prepublish checks passed"

