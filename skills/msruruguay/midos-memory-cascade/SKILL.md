---
name: midos-memory-cascade
description: 5-tier self-tuning memory for AI agents. Routes queries from sub-ms cache to full-text search, with shortcuts that evolve from usage.
version: 1.0.2
---

# midos-memory-cascade

A 5-tier memory system that routes every query through the fastest possible path — and learns from your usage to get faster over time.

Most agent memory systems are flat: one store, one lookup. When that store grows past a few hundred entries, every query pays the same cost whether it's a cache hit or a deep semantic search. midos-memory-cascade fixes this with **tiered routing** and **self-tuning shortcuts**.

## Architecture

```
Query → [Shortcut Check] → T0 → T1 → T2 → T3 → T4 → (no result)
              ↓                ↓     ↓     ↓     ↓     ↓
          Skip to Tn        <1ms   <5ms  <5ms  <1ms   ~3s
              ↓
         Direct hit (learned from history)
```

### The 5 Tiers

| Tier | Store | Latency | Best For |
|------|-------|---------|----------|
| **T0** | In-memory dict | <1ms | Session state, recent lookups, hot keys |
| **T1** | JSON files | <5ms | Structured config, project metadata, key-value state |
| **T2** | SQLite | <5ms | Scored chunks, relational queries, metadata filtering |
| **T3** | SQLite FTS | <1ms | Keyword search across 22K+ indexed rows |
| **T4** | Grep fallback | ~3s | Brute-force search when everything else misses |

Each tier has a **confidence score**. If T0 returns a match with confidence 1.0, the cascade stops immediately. If T2 returns 0.7, it still tries T3. The cascade only escalates when confidence is below the threshold for the current tier.

### Confidence Thresholds

```
T0 session_cache  → 1.0  (exact match, always trust)
T1 json_state     → 0.9  (structured key match)
T2 sqlite         → 0.7  (SQL match, may miss semantic)
T3 sqlite_fts     → 0.75 (keyword match on scored chunks)
T4 grep           → 0.4  (brute force, lowest confidence)
```

## Self-Tuning (evolve)

The cascade tracks every query and which tier resolved it. After enough history accumulates, the `evolve()` function learns two things:

### 1. Shortcuts

If a query signature (first 3 words normalized) resolves at the same tier **80%+ of the time** across **3+ queries**, a shortcut is created. Next time a matching query arrives, the cascade skips directly to the winning tier.

```
Example: "what is {topic}" → always resolves at T2:sqlite
         → shortcut created → T2 checked first, saving 2 tier lookups
```

### 2. Tier Skips

If a tier has **<5% hit rate** across **20+ cascades**, it gets marked for skip. The cascade won't waste time checking a tier that never returns results for your workload.

### How it learns

```
Query arrives → compute signature → check shortcuts
  ↓
Cascade runs → record which tier resolved → update stats
  ↓
evolve() runs (hourly or manual) → analyze sig_resolutions
  ↓
If 80%+ dominance → add shortcut
If <5% hit rate → add tier skip
  ↓
Save to cascade_stats.json → loaded on next import
```

## Quick Start

### Standalone Mode (zero dependencies)

Add these instructions to your agent:

```markdown
## Memory Protocol

When you need to recall information:
1. Check session state first (in-memory notes from this conversation)
2. Search JSON state files for structured data (config, metadata)
3. Query SQLite for scored/indexed content
4. Fall back to grep for full-text search across all files

When storing information:
- Session-only data → in-memory dict (lost on restart)
- Structured state → JSON file (project_state.json, config.json)
- Knowledge worth searching → SQLite with tags and score
- Everything else → markdown files in a known directory

Track which lookups succeed at which tier. After 20+ lookups, review
your hit patterns. If certain query types always resolve at the same
store, go there first next time.
```

### With the cascade engine

```python
# Query — automatically routes through all tiers
from tools.memory_cascade import query
result = query("how does the auth middleware work")
# Returns: {"tier": "T2:sqlite", "content": "...", "confidence": 0.82}

# Store — routes writes to the appropriate tier
from tools.memory_cascade import store
store("knowledge", "Auth uses JWT with 24h expiry", tags=["auth", "security"])

# Evolve — learn from accumulated history
from tools.memory_cascade import evolve
stats = evolve()
# Returns: {"shortcuts_added": 3, "skips_added": 1}
```

### Integration with hooks

Wire the cascade to your agent's tool lifecycle:

```bash
# After every Read or Grep, log what was found (for shortcut learning)
# Hook: PostToolUse → memory_feedback.py
# Tracks: query → tier → hit/miss → confidence

# On session start, load shortcuts from cascade_stats.json
# Hook: SessionStart → load_shortcuts()
```

## Usage Patterns

### Pattern 1: Session State Management

```python
# Store session state (T0, ephemeral)
store("state", "user prefers dark mode", durability="session")

# Query it back (hits T0 instantly)
result = query("user preferences")
# → T0:session_cache, confidence 1.0, <1ms
```

### Pattern 2: Project Knowledge

```python
# Store durable knowledge (routed to SQLite or files)
store("knowledge", "API rate limit is 100 req/min for free tier",
      tags=["api", "limits"], searchable=True)

# Later queries find it via FTS
result = query("what are the API rate limits")
# → T3:sqlite_fts, confidence 0.75, <1ms
```

### Pattern 3: Cross-Session Memory

```python
# Store patterns that should survive restarts
store("pattern", "Always run preflight before creating chunks",
      durability="permanent", tags=["workflow"])

# Found via grep when other tiers miss
result = query("preflight chunks workflow")
# → T4:grep, confidence 0.4, ~3s (first time)
# After evolve(): T3:sqlite_fts via shortcut, <1ms
```

### Pattern 4: Write Routing

The `store()` function routes writes based on data type:

| Data Type | Routed To | Why |
|-----------|-----------|-----|
| `state` | T0 (session) or T1 (JSON) | Fast access, structured |
| `pattern` | docs/patterns/ → eventually chunks/ | Needs maturation before knowledge base |
| `knowledge` | chunks/ or SQLite | Searchable, scored |
| `log` | topic files | Append-only, reference |
| `event` | JSON state | Timestamped, queryable |

## How It Compares

| Feature | midos-memory-cascade | elite-longterm-memory | byterover | proactive-agent |
|---------|---------------------|----------------------|-----------|-----------------|
| Tiers | 5 (auto-routed) | 6 (manual) | 1 (CLI) | 2 (manual) |
| Self-tuning | Yes (shortcuts + skips) | No | No | No |
| External deps | None (core tiers) | OpenAI key required | npm + LLM provider | None |
| Latency tracking | Per-tier confidence | None | None | None |
| Cascade fallback | Auto-escalation | Manual tier selection | Single store | Manual |
| Write routing | Type-based auto | Manual per-layer | `brv curate` only | Manual SESSION-STATE |
| Evolution | `evolve()` learns patterns | Static | Static | Static |
| Data stays local | Yes | Cloud sync optional | Cloud sync | Yes |

## Configuration

The cascade works out of the box with sensible defaults. For customization:

```python
# Adjust confidence thresholds (higher = more aggressive escalation)
_CONFIDENCE["T2:sqlite"] = 0.8  # require higher confidence from SQL

# Control evolution sensitivity
# In evolve(): dominance >= 0.8 (80%) and total >= 3 queries for shortcuts
# In evolve(): hit_rate < 0.05 (5%) for tier skips

# Stats file location
CASCADE_STATS_PATH = "knowledge/SYSTEM/cascade_stats.json"
```

## Diagnostics

```python
# Check current shortcuts and skips
import json
stats = json.load(open("knowledge/SYSTEM/cascade_stats.json"))
print(f"Shortcuts: {len(stats.get('shortcuts', {}))}")
print(f"Tier skips: {stats.get('tier_skip', [])}")
print(f"Total cascades: {stats.get('cascades', {}).get('total', 0)}")

# Per-tier hit rates
for tier, hits in stats.get("cascades", {}).get("by_tier", {}).items():
    total = stats["cascades"]["total"]
    print(f"  {tier}: {hits}/{total} ({hits/total*100:.1f}%)")
```

## MidOS-Connected Mode

When running inside the MidOS ecosystem, the cascade gains:

- **T3 backed by 670K vectors** via LanceDB with semantic search
- **Quality scoring** on stored knowledge (GEPA + ML pipeline)
- **Automatic promotion** from docs/patterns/ to chunks/ with evidence gates
- **Memory feedback hook** that auto-tracks every Read and Grep across all tools
- **Scheduled evolution** running hourly via your agent's cron/heartbeat system
- **Memory router** with 14 specialized stores and situational routing
- **MCP tools**: `memory_query`, `memory_store`, `memory_evolve` exposed via MCP server

The standalone mode captures 80% of the value. The ecosystem captures the remaining 20% through deeper integration, larger vector stores, and automated quality gates.

---

Built with [MidOS](https://midos.dev) — MCP Community Library.
This is 1 of 200+ skills in the MidOS ecosystem.

Free MCP access: [midos.dev/dev](https://midos.dev/dev) (500 queries/mo)
Full ecosystem: [midos.dev/pro](https://midos.dev/pro) ($20/mo)
