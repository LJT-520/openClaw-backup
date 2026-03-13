# Memphis Super-Agent v3.6.0 MVP

🧠 **Complete Memphis 3.6.0 integration - One skill to rule them all**

---

## 🚀 Quick Start

### **1. Install:**

```bash
clawhub install memphis-super
```

### **2. Check Health:**

```bash
/memphis status
```

**Expected:**
```
Memphis 🧠
Chains: journal, ask, decisions, vault, ...
Providers: ollama (primary), zai (fallback)
Embeddings: 99 vectors (5/6 chains)
Status: OK
```

### **3. Test Auto-Detection:**

```
User: "Co postanowiłem o projekcie?"
→ [Auto-detected: question]
→ [Executes: memphis ask]
→ Returns: "Znalazłem 3 decyzje projektowe..."
```

---

## 🎯 What It Does

### **Automatic Detection:**

When you send a message, Memphis Super-Agent automatically:

1. **Detects intent** (question/decision/insight)
2. **Searches chains** (semantic search)
3. **Executes command** (memphis ask/decide/journal)
4. **Stores result** (appropriate chain)
5. **Updates embeddings** (for future search)

### **Manual Commands:**

```bash
/memphis journal "$text"      # Journal entry
/memphis ask "$question"        # Ask with search
/memphis recall "$query"       # Semantic search
/memphis decide "T" "C"       # Record decision
/memphis decisions            # List decisions
```

---

## 🧠 Auto-Detection Rules

### **Questions** (→ ask block)

**Triggers:**
- "Co postanowiłem", "jak", "czy", "kiedy", "ile"
- "co zrobiłeś", "pamiętasz", "co powiedziałeś"
- "?" at end of sentence

**Examples:**
```
"Co postanowiłem o projekcie?"
"Pamiętasz co mówiłem o X?"
"Jakie masz decyzje?"
```

---

### **Decisions** (→ decisions block)

**Triggers:**
- "postanowiłem", "wybrałem", "zdecydowałem"
- "zrobię X", "idę w Y"

**Examples:**
```
"Postanowiłem się na TypeScript."
"Zdecydowałem się na local-first."
```

---

### **Insights** (→ journal block)

**Triggers:**
- "uczyłem się", "zauważyłem", "zrozumiałem"
- "Ważne:", "Uwaga:", "Zapamiętaj:"

**Examples:**
```
"Uwaga: qwen3.5:2b działa najlepiej dla kodu."
"Zauważyłem, że lokalna pamięć jest kluczowa."
```

---

## 📋 Core Features

### **✅ Included:**

- ✅ All 13 chains (journal, ask, decisions, vault, ...)
- ✅ Semantic search (embeddings)
- ✅ Auto-detection (questions/decisions/insights)
- ✅ Session markers (start/end/summary)
- ✅ Knowledge graph
- ✅ Reflection (daily/weekly/deep)
- ✅ Vault encryption (secrets)
- ✅ MCP server
- ✅ Onboarding (--clean, --nuclear)

### **⚠️ Future (v3.7.0):**

- ⏳ Background daemon
- ⏳ Multi-agent trade protocol
- ⏳ Model B (inferred decisions)

---

## 🔧 Usage Examples

### **General Agent:**

```bash
# User: "Co postanowiłem?"
[Auto-detected: question]
→ memphis ask "Co postanowiłem?"
→ Returns: "Znalazłem 3 decyzje..."

# User: "Wybieram TypeScript."
[Auto-detected: decision]
→ memphis decide "Język" "TypeScript"
→ Returns: "Decision saved"
```

### **Coding Agent:**

```bash
# User: "Jaki styl kodu preferuję?"
→ memphis ask "style kodu"
→ Returns: "Preferujesz: 2 spaces, TypeScript, functional style"

# User: "Decyduję się na test coverage 80%."
→ memphis decide "Test coverage" "80%" -r "Balance of speed and quality"
```

### **Business Agent:**

```bash
# User: "Jakie były moje decyzje strategiczne?"
→ memphis ask "decyzje strategiczne"
→ Returns: "3 decyzje: 1. Local-first, 2. TypeScript, 3. Ollama"

# User: "Wybieram hybrydowy model pracy."
→ memphis decide "Model pracy" "hybrydowy" -r "Flexibility"
```

---

## 📊 Memphis 3.6.0 Commands

### **Core:**

```bash
/memphis status              # Health check
/memphis journal "$text"      # Journal entry
/memphis ask "$question"        # Ask with search
/memphis recall "$query"       # Semantic search
/memphis decide "T" "C"       # Record decision
/memphis decisions            # List decisions
```

### **Advanced:**

```bash
/memphis verify              # Check chains
/memphis repair --auto        # Auto-repair
/memphis embed --chain journal  # Force embeddings
/memphis vault add "$k" "$v"   # Encrypted secret
/memphis graph show          # Knowledge graph
/memphis reflect             # Daily reflection
/memphis mcp server         # MCP server
```

### **Onboarding (v3.6.0):**

```bash
/memphis init --clean       # Remove deployment artifacts
/memphis init --nuclear     # Complete reset (dev only)
```

---

## 🎯 Use Cases

### **1. General Agent:**
- Memory across sessions ✅
- Context for questions ✅
- Decision tracking ✅
- Pattern learning ✅

### **2. Coding Agent:**
- Project decisions (decision chain) ✅
- Technical preferences (journal) ✅
- Code style preferences (ask/decision) ✅
- Meeting notes (journal) ✅

### **3. Business Agent:**
- Business decisions (decision chain) ✅
- Meeting notes (journal) ✅
- Strategic insights (reflection) ✅
- Risk analysis (intelligence) ✅

### **4. Personal Agent:**
- Preferences (journal) ✅
- Daily summary (session) ✅
- Learning patterns (graph) ✅
- Long-term memory (ALL chains) ✅

---

## 📚 Documentation

- **Full Docs:** https://github.com/elathoxu-crypto/memphis/tree/master/docs
- **SKILL.md:** Complete specification (12KB)
- **Vision:** Memphis cognitive engine roadmap

---

## 🚀 Roadmap

### **MVP (v3.6.0) - NOW:**
- ✅ Auto-detection (questions/decisions/insights)
- ✅ All CLI commands
- ✅ Session markers
- ✅ Complete Memphis 3.6.0 core

### **v3.7.0 (1 week):**
- ⏳ Background daemon
- ⏳ Multi-agent trade protocol
- ⏳ Model B (inferred decisions)

---

## 💡 Tips

1. **Start with /memphis status** to check health
2. **Use natural language** - auto-detection is smart
3. **Manual fallback** - if auto-detection fails, use manual commands
4. **Session markers** - always creates start/end entries
5. **Embeddings** - automatically updated after each entry

---

**Created:** 2026-03-04
**By:** Elathoxu Abbylan
**Version:** 3.6.0 MVP
**Status:** Production Ready ✅

---

_One skill, 100% Memphis, smart auto-detection._ 🧠✨
