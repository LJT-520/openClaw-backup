# Publish Checklist

Use this checklist before `clawhub publish`.

## Metadata

- `SKILL.md` frontmatter contains:
  - `name`
  - `description`
  - `version` (semver)
  - `metadata.openclaw` runtime requirements
  - `metadata.clawdbot` compatibility block
- Environment variables used by scripts are declared.
- Required binaries are declared (`node`).

## Security

- No private keys or tokens are hardcoded.
- Private key is never sent to HTTP endpoints.
- Shell scripts include `set -euo pipefail`.
- Shell scripts include a SECURITY MANIFEST header.
- Inputs are validated in scripts before use.

## Package Hygiene

- Package is text-only (no binaries/images/archives).
- Hidden files are removed from package (except allowed tooling metadata).
- No `.env` files in the package.
- `SKILL.md`, `README.md`, and `scripts/` are present.

## Docs

- SKILL homepage is documented.
- External endpoints table is documented.
- Privacy & trust statements are documented.
- Install and publish commands are documented.

## Commands

```bash
cd /absolute/path/to/first-principle-social-platform
bash scripts/prepublish_check.sh
bash scripts/publish_skill.sh
```
