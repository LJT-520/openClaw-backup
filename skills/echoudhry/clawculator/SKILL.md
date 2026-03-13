---
name: clawculator
description: Analyze OpenClaw costs and detect billing issues. Source code is fully bundled — nothing is fetched at runtime. Requires only the node binary.
homepage: https://github.com/echoudhry/clawculator
user-invocable: true
metadata: {"openclaw":{"emoji":"🦞","requires":{"bins":["node"]}}}
---

## clawculator

Cost forensics for OpenClaw. Finds billing issues in your config, sessions, and workspace. Pure deterministic logic — no AI, no network calls, no external dependencies.

**Source code is fully bundled in this skill folder.** Nothing is fetched at runtime. You can audit every file before running.

**Files this skill reads:**
- `~/.openclaw/openclaw.json` — your OpenClaw config
- `~/.openclaw/agents/main/sessions/sessions.json` — session token usage
- `~/clawd/` — workspace root file count only (no file contents read)
- `/tmp/openclaw` — log directory (read only, if present)

**Files this skill may write (only when `--md` is used):**
- `./clawculator-report.md` — markdown report
- Custom path via `--out=PATH`

**No network requests are made. No shell commands are spawned.**

**Session keys are truncated in all output** (first 8 chars + ellipsis) to avoid exposing sensitive identifiers.

---

**Usage**

When the user types `clawculator`, `check my costs`, `analyze spend`, or `cost report`, run:

```bash
node {baseDir}/run.js --md
```

Return the full markdown report to the user inline.

**Flags**
- `--md` — write markdown report and print to stdout
- `--json` — machine-readable JSON to stdout
- `--out=PATH` — custom output path for `--md`
- `node {baseDir}/run.js --help` — full usage

**What it catches**
- 💓 Heartbeat running on paid model instead of Ollama
- 🔧 Skill polling loops on paid model
- 📱 WhatsApp groups auto-joined on primary model
- 🪝 Hooks (boot-md, command-logger, session-memory) on Sonnet
- 💬 Orphaned sessions still holding tokens
- 🤖 maxConcurrent too high — burst cost multiplier
- 📁 Workspace root bloat inflating context
- ⚙️ Primary model cost awareness

All findings include exact fix commands.
