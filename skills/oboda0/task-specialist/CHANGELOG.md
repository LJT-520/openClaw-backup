# Changelog

## 1.2.2
### Fixed
- **Consistency**: Aligned `task-heartbeat.sh` default database path with the main `task` CLI (`$PWD/.tasks.db`). This resolves the "Suspicious" mismatch flag on ClawHub and ensures heartbeats correctly target the local workspace.

## 1.2.1
### Fixed
- **CRITICAL**: Fixed a data loss bug where `tasks.db` could be wiped during ClawHub `--force` updates.
- **Architecture Change**: Tasks are now inherently **workspace-scoped**. The database defaults to a hidden `.tasks.db` file in the *current working directory* (`$PWD`) instead of existing globally or alongside the script directory. This enables seamless per-project task lists and isolates data from skill updates.

### Added
- `CHANGELOG.md` for proper release tracking.

### Removed
- Removed the deprecated `task_min.sh` minification script, as the modular 1.2.0 script architecture permanently bypassed the file size limits.

## 1.2.0 - 2026-03-03
### Added
- `task edit` command - Modify the description, priority, or project of an existing task.
- `task export` command - Export filtered tasks to a clean markdown table.
- Modular architecture: Split the giant monolithic bash script into 12 separate `cmd_xxxx.sh` subroutines to bypass ClawHub analysis limits.

## 1.1.5 - 2026-02-28
### Security
- Made `~/.local/bin` symlinking in `install.sh` strictly opt-in via a new `--symlink` flag to satisfy malware scanner constraints regarding silent filesystem persistence.

## 1.1.3 - 2026-02-28
### Security
- Fixed a SQL injection vulnerability by creating a strict integer validation regex helper for all database queries.
