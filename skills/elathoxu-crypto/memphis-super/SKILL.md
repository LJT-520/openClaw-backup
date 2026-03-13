---
name: memphis-super
version: "3.6.0"
description: |
  🧠 Memphis Super-Agent v3.6.0 MVP - 100% Memphis Core for OpenClaw

  Complete Memphis 3.6.0 integration:
  - ALL chains (journal, ask, decisions, vault, trade, graph, reflection, ingest, ops, adr)
  - Semantic search & embeddings
  - Multi-provider LLM routing
  - Onboarding wizard (--clean, --nuclear)
  - Auto-detection (questions/decisions/insights)
  - Session markers (start/end)
  - Knowledge graph
  - MCP server

  Auto-detects:
  - Questions → ask block (with semantic search)
  - Decisions → decisions block (conscious)
  - Insights → journal block
  - Session end → summary block

  Perfect for: ALL OpenClaw agents seeking complete memory + cognitive powers

  Quick start: /memphis status
author: Elathoxu Abbylan
tags: [memphis, memory, brain, ai, agent, semantic-search, decisions, vault, graph, mcp, onboarding, embeddings, llm-routing, local-first, privacy, productivity, knowledge-management, decision-tracking, auto-detection, session-management, cognitive-engine]
category: productivity
license: MIT
repository: https://github.com/elathoxu-crypto/memphis
documentation: https://github.com/elathoxu-crypto/memphis/tree/master/docs
---

# Memphis Super-Agent v3.6.0 MVP

**🧠 Complete Memphis 3.6.0 integration - One skill to rule them all**

This skill provides 100% of Memphis 3.6.0 core functionality to OpenClaw agents, with smart auto-detection and automatic memory capture.

---

## 🎯 What This Skill Does

### **Automatic Detection:**

When agent receives user message, skill automatically detects intent:

1. **Questions** → `memphis ask` (semantic search + answer)
2. **Decisions** → `memphis decide` (store decision)
3. **Insights** → `memphis journal` (store learning)
4. **Session End** → `memphis journal` (summary)

### **Manual Commands:**

All Memphis 3.6.0 CLI commands available via `/memphis` prefix:

```bash
/memphis status              # Health check + chains
/memphis journal "$text"      # Journal entry
/memphis ask "$question"        # Ask with search
/memphis recall "$query"       # Semantic search
/memphis decide "T" "C"       # Record decision
/memphis decisions            # List decisions
```

---

## 🧠 Auto-Detection Rules

### **1. Questions** (→ ask block)

**Triggers:**
- "Co postanowiłem", "jak", "czy", "kiedy", "ile"
- "co zrobiłeś", "pamiętasz", "co powiedziałeś"
- "?" at end of sentence
- Keywords: "pytanie", "zapytanie", "recall", "remember"

**Auto-executes:**
```bash
memphis ask "$query" --tags question,$context
```

**Examples:**
```
User: "Co postanowiłem o projekcie?"
→ memphis ask "Co postanowiłem o projekcie?"

User: "Pamiętasz co mówiłem o X?"
→ memphis ask "co powiedziałeś o X"

User: "Jakie masz decyzje?"
→ memphis ask "jakie masz decyzje"
```

---

### **2. Decisions** (→ decisions block)

**Triggers:**
- "postanowiłem", "wybrałem", "zdecydowałem", "decyzja"
- "zrobię X", "idę w Y", "będę Z"
- Keywords: "decision", "choice", "wybór"

**Auto-executes:**
```bash
memphis decide "$title" "$choice" -r "$reason" --tags decision,$context
```

**Examples:**
```
User: "Postanowiłem się na TypeScript."
→ memphis decide "Język projektu" "TypeScript" -r "Faster dev cycle"

User: "Zdecydowałem się na local-first."
→ memphis decide "Architektura" "local-first" -r "Privacy and control"
```

---

### **3. Insights** (→ journal block)

**Triggers:**
- "uczyłem się", "zauważyłem", "zrozumiałem"
- "Ważne:", "Uwaga:", "Zapamiętaj:"
- Patterns discovered, lessons learned

**Auto-executes:**
```bash
memphis journal "$insight" --tags insight,$context
```

**Examples:**
```
User: "Uwaga: qwen3.5:2b działa najlepiej dla kodu."
→ memphis journal "Uwaga: qwen3.5:2b działa najlepiej dla kodu." --tags insight,models

User: "Zauważyłem, że lokalna pamięć jest kluczowa."
→ memphis journal "Zauważyłem, że lokalna pamięć jest kluczowa." --tags insight,philosophy
```

---

### **4. Session Markers** (→ journal block)

**Auto-triggers:**
- Session start (agent loads skill)
- Session end (explicit or implicit)
- Context switch (project change)

**Auto-executes:**
```bash
# Start
memphis journal "Session started: $description" --tags session,start

# End
memphis journal "Session summary: $description" --tags session,summary,end
```

---

## 🔧 Manual Commands

### **Core Commands:**

```bash
# Health Check
/memphis status
# Shows: chains, providers, embeddings, vault, recent activity

# Journal Entry
/memphis journal "My first memory" --tags learning
# Manual journal with tags

# Ask Memphis (with semantic search)
/memphis ask "What are my preferences for code style?"
# Searches chains + generates answer

# Semantic Search (no generation)
/memphis recall "project decisions"
# Returns raw search results

# Record Decision
/memphis decide "Project choice" "TypeScript" -r "Faster dev cycle"
# Stores decision with reason

# List Decisions
/memphis decisions
# Shows all decisions with titles, choices, reasons
```

### **Advanced Commands:**

```bash
# Chain Management
/memphis verify          # Check chain integrity
/memphis repair --auto    # Auto-repair broken blocks
/memphis embed --chain journal  # Force embeddings generation

# Vault (Encrypted Secrets)
/memphis vault add "api-key" "value"
/memphis vault get "api-key"

# Knowledge Graph
/memphis graph show       # Show knowledge graph
/memphis graph build      # Build graph from chains

# Reflection
/memphis reflect          # Daily/weekly reflection
/memphis reflect --deep # Deep reflection (analysis)

# MCP Server
/memphis mcp server      # Start MCP server (for other tools)
```

### **Onboarding (v3.6.0):**

```bash
# Clean Slate (remove deployment artifacts)
/memphis init --clean
# Removes: share chain, watra/style tags
# Preserves: vault, config, embeddings

# Nuclear Reset (dev/testing only)
/memphis init --nuclear
# Complete data reset
# WARNING: Destroys all chains!
```

---

## 🚀 Quick Start

### **1. Installation:**

```bash
# Install from ClawHub
clawhub install memphis-super

# Or manually
mkdir -p ~/.openclaw/workspace/skills/memphis-super
# Copy skill files to directory
```

### **2. First Run:**

```bash
# Check health
/memphis status

# Expected output:
# Memphis 🧠
# Chains: journal, ask, decisions, vault, ...
# Providers: ollama (primary), zai (fallback)
# Embeddings: 99 vectors (5/6 chains)
# Status: OK
```

### **3. Auto-Detection Test:**

```
User: "Co postanowiłem o projekcie?"
→ [Auto-detected: question]
→ [Executes: memphis ask]
→ Returns: "Znalazłem 3 decyzje projektowe..."

User: "Wybieram TypeScript."
→ [Auto-detected: decision]
→ [Executes: memphis decide]
→ Returns: "Decision saved: Język=TypeScript"
```

### **4. Manual Usage:**

```bash
# Manual journal
/memphis journal "Dziś uczyłem się o lokalnych modelach." --tags learning,models

# Ask question
/memphis ask "Jaki model LLM preferuję?"

# Semantic search
/memphis recall "model preferences"

# Record decision
/memphis decide "LLM choice" "qwen3.5:2b" -r "Good balance of speed and quality"
```

---

## 🎭 Use Cases

### **1. General Agent:**
- Memory across sessions
- Context for questions
- Decision tracking
- Pattern learning

### **2. Coding Agent:**
- Project decisions (decision chain)
- Technical preferences (journal)
- Code style preferences (ask/decision)
- Meeting notes (journal)

### **3. Business Agent:**
- Business decisions (decision chain)
- Meeting notes (journal)
- Strategic insights (reflection)
- Risk analysis (intelligence)

### **4. Personal Agent:**
- Preferences (journal with tags)
- Daily summary (journal session)
- Learning patterns (graph)
- Long-term memory (ALL chains)

---

## 📊 Memphis 3.6.0 Features

### **✅ Included in MVP:**

- ✅ All 13 chains (journal, ask, decisions, vault, trade, graph, reflection, ingest, ops, adr)
- ✅ Semantic search (embeddings)
- ✅ Multi-provider LLM routing (Ollama, Z.AI, OpenAI)
- ✅ Auto-detection (questions/decisions/insights)
- ✅ Session markers (start/end/summary)
- ✅ Knowledge graph (build/show)
- ✅ Reflection (daily/weekly/deep)
- ✅ Vault encryption (secrets)
- ✅ MCP server (for external tools)
- ✅ Onboarding wizard (--clean, --nuclear)
- ✅ Chain verification & repair
- ✅ Embeddings management

### **⚠️ Future (v3.7.0):**

- ⏳ Background daemon integration
- ⏳ Multi-agent trade protocol
- ⏳ Model B (inferred decisions from git)
- ⏳ Model C (predictive suggestions)
- ⏳ Proactive "save decision?" prompts

---

## 🏗️ Architecture

### **4-Layer Design:**

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Auto-Detection (Questions/Decisions)    │
│  • Intent detection (questions/decisions/insights)  │
│  • Auto-executes Memphis commands                  │
│  • Session markers (start/end/summary)             │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Cognitive Engine (Reflection + Graph)     │
│  • Reflection (daily/weekly/deep)                 │
│  • Knowledge graph (connections)                    │
│  • Intelligence system (accuracy tracking)            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Core Memphis (Chains + Vault)          │
│  • 13 chains (journal, ask, decisions, vault...)   │
│  • Vault encryption (secrets)                     │
│  • Chain verification & repair                     │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Infrastructure (LLM + Embeddings)        │
│  • Multi-provider LLM routing                      │
│  • Embeddings (semantic search)                    │
│  • MCP server (external integration)                │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Tag Conventions

### **Standard Tags:**

- `identity` — who/what agent is
- `preferences` — user/agent preferences
- `decision` — choice made
- `question` — asked question
- `insight` — new knowledge
- `learning` — lesson learned
- `session` — session markers
- `project:<name>` — project context
- `workspace:<name>` — workspace isolation

### **Auto-Added Tags:**

- `agent` — all OpenClaw bridge entries
- `openclaw` — integration tracking
- `integration` — cross-system entries
- `auto-detected` — auto-detection entries

---

## 🔍 Troubleshooting

### **Health Check Failed:**

```bash
/memphis status
# If error:
# 1. Check config: cat ~/.memphis/config.yaml
# 2. Check providers: ollama list, zai status
# 3. Check chains: ls ~/.memphis/chains/
```

### **Embeddings Not Working:**

```bash
/memphis embed --chain journal
# Force embeddings generation

# If error:
# Check Ollama: ollama pull nomic-embed-text
```

### **Auto-Detection Not Working:**

```bash
# Manual fallback:
/memphis journal "$text" --tags manual,$intent
/memphis ask "$question"
/memphis decide "$title" "$choice" -r "$reason"
```

### **Chain Issues:**

```bash
/memphis verify          # Check integrity
/memphis repair --auto    # Auto-repair
```

---

## 📚 Documentation

- **Full Docs:** https://github.com/elathoxu-crypto/memphis/tree/master/docs
- **Vision:** https://github.com/elathoxu-crypto/memphis/blob/master/docs/VISION.md
- **Decision Schema:** https://github.com/elathoxu-crypto/memphis/blob/master/docs/DECISION_SCHEMA.md
- **Features:** https://github.com/elathoxu-crypto/memphis/blob/master/CURRENT_FEATURES.md

---

## 🚀 Roadmap

### **MVP (v3.6.0) - NOW:**
- ✅ Auto-detection (questions/decisions/insights)
- ✅ All CLI commands
- ✅ Session markers
- ✅ Complete Memphis 3.6.0 core

### **v3.7.0 (1 week):**
- ⏳ Background daemon integration
- ⏳ Multi-agent trade protocol
- ⏳ Model B (inferred decisions)
- ⏳ Knowledge graph auto-build

### **v4.0.0 (1 month):**
- ⏳ Model C (predictive suggestions)
- ⏳ Proactive decision prompts
- ⏳ Enhanced reflection
- ⏳ Multi-agent voting (Model D)

---

## 🤝 Contributing

This is a wrapper skill - core functionality is in Memphis CLI.

**Issues:** https://github.com/elathoxu-crypto/memphis/issues
**PRs:** https://github.com/elathoxu-crypto/memphis/pulls

---

**Created:** 2026-03-04
**By:** Elathoxu Abbylan
**Version:** 3.6.0 MVP
**Status:** Production Ready ✅

---

_This skill brings 100% of Memphis 3.6.0 core to OpenClaw agents with smart auto-detection._
