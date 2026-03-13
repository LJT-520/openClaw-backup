---
name: memory-organizer
description: Organize and compress memory files to reduce context loading in new sessions. Automatically identify important information and discard redundant content.
metadata:
  {
    "openclaw": { "emoji": "🧠" }
  }
---

# Memory Organizer Skill

Tool for organizing and compressing memory files.

## Features

1. **Scan memory files** - View all memories in memory/ directory
2. **Analyze content** - Identify important info (user preferences, project config, todos)
3. **Compress & organize** - Summarize lengthy content, keep core info
4. **Clean up** - Delete outdated or unnecessary content
5. **Security** - Path validation to prevent directory traversal

## Installation

This skill is pre-installed in OpenClaw workspace. To use directly:

```bash
# Link to local bin (optional)
ln -sf ~/.openclaw/workspace-main/skills/memory-organizer/memory-organizer.js ~/.local/bin/memory-organizer

# Or run directly
node ~/.openclaw/workspace-main/skills/memory-organizer/memory-organizer.js <command>
```

## Workspace Configuration

Default workspace: `~/.openclaw/workspace-main`

Custom workspace:
```bash
# Via command line
memory-organizer scan --workspace /path/to/workspace

# Via environment variable
OPENCLAW_WORKSPACE=/path/to/workspace memory-organizer scan
```

## Use Cases

- Memory files too large, slow to load each session
- Want to extract key info, discard details
- Need regular memory maintenance

## Commands

### Scan memories

```bash
memory-organizer scan
```

### Classify by topic

```bash
memory-organizer classify
```

### Find redundant memories

```bash
memory-organizer redundant
```

### Discard redundant memories

```bash
memory-organizer discard redundant --force
```

### Compress a memory file

```bash
memory-organizer compress 2026-01-01.md        # Keep titles and key lines
memory-organizer compress 2026-01-01.md --titles  # Keep titles only
memory-organizer compress 2026-01-01.md --aggressive  # Aggressive compression
```

### Merge to main memory

```bash
memory-organizer merge 2026-01-01.md
```

### View memory content

```bash
memory-organizer view 2026-01-01.md
```

### Cleanup backups

```bash
memory-organizer clean
```

## Topic Classification

The organizer automatically classifies memories into:

- **User Preferences** - name, timezone, preferences
- **Project Config** - agents, cron jobs, workspaces
- **Skills** - installed skills, tools
- **Money Ideas** - side hustle ideas, projects
- **Todos** - tasks, plans, next steps
- **Tech Notes** - code, commands, solutions
- **Daily** - daily logs, routine

## Security

- **Path validation**: All file operations are validated to prevent directory traversal attacks
- **Filename restrictions**: Only `.md` files allowed, no path components (`..`, `/`, `\`)
- **Workspace isolation**: Operations scoped to memory directory only

## Best Practices

1. Run organization daily or weekly
2. Keep key info: user preferences, project config, todos
3. Discard details: logs, temporary thoughts
4. Keep MEMORY.md concise (< 100 lines)

## Recommended File Structure

```
# User Preferences
- Name, how to address
- Timezone
- Key preferences

# Project Config
- Agent configurations
- Scheduled tasks
- Important file paths

# Todos
- Current tasks
- Next steps
```
