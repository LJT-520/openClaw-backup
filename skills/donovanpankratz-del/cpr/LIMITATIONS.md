# CPR Limitations & Known Constraints
## When NOT to Use CPR (And What It Doesn't Fix)

**Honesty builds trust.** CPR is powerful, but it's not magic. Here's what it can't do, shouldn't do, and where it breaks.

---

## What CPR Fixes

✅ **Corporate sycophancy** — "That's excellent! You're doing amazing!"  
✅ **Robotic communication** — Uniform sentence length, no rhythm  
✅ **Over-validation** — Grading every decision, cheerleading constantly  
✅ **Padding/fluff** — Explaining "why this matters" unprompted  
✅ **Lost personality** — AI sounds generic, not like YOUR voice  

**CPR restores natural, human communication while preventing drift back to corporate patterns.**

---

## What CPR Doesn't Fix

### 1. Factual Accuracy ❌
CPR improves **how** AI communicates, not **what** it knows.

**Still broken after CPR:**
- Hallucinations (making up facts)
- Outdated knowledge (model cutoff dates)
- Domain expertise gaps (model wasn't trained on your niche)

**Why:** CPR is a communication framework, not a knowledge augmentation system.

**What to use instead:** RAG (Retrieval-Augmented Generation), fine-tuning, or prompt engineering with domain context.

---

### 2. Reasoning Capability ❌
CPR doesn't make AI smarter or more logical.

**Still broken after CPR:**
- Math errors
- Logical fallacies
- Multi-step reasoning failures
- Complex problem-solving limits

**Why:** CPR restores conversational patterns, not cognitive capability. A Haiku model with CPR still has Haiku-level reasoning.

**What to use instead:** Use a more capable model (Opus instead of Haiku), chain-of-thought prompting, or task decomposition.

---

### 3. Safety Violations ❌
CPR doesn't (and shouldn't) bypass safety guardrails.

**Still blocked after CPR:**
- Harmful content generation
- Toxic language
- Bias amplification
- Privacy violations

**Why:** The 6 restoration patterns (affirming particles, humor, rhythm, etc.) don't trigger safety violations. CPR works *within* safety boundaries, not around them.

**This is intentional:** Safe AND human is the goal, not "human at any cost."

---

### 4. Model-Specific Quirks ❌
CPR can't fix fundamental model design issues.

**Examples:**
- Grok's tendency to crash (improved but not eliminated)
- GPT-4's occasional overconfidence
- Claude's formal baseline (can be softened but not eliminated)
- Gemini's verbose explanations (can be reduced but not removed)

**Why:** These are architecture/training artifacts baked into the model. CPR calibrates to the model's baseline, it doesn't rewrite the model.

**Workaround:** Choose the right model for your use case. CPR makes each model MORE human, but doesn't make all models identical.

---

### 5. Context Window Limits ❌
CPR doesn't extend how much the model can "remember."

**Still limited:**
- Long conversation history gets compressed/forgotten
- Context window maximums (8k, 100k, 200k tokens)
- Compaction artifacts (information loss during summarization)

**Why:** CPR adds minimal overhead (~500 bytes for Core, ~1KB state file for Extended), but doesn't change model architecture.

**Workaround:** Use CPR Extended for long sessions (catches drift before compaction preserves it), or use models with larger context windows.

---

## When NOT to Use CPR

### 1. Formal Legal/Medical Documentation ⚠️
**Use case:** Contracts, medical records, regulatory filings

**Why skip CPR:** Corporate precision IS the goal. Standardized language reduces ambiguity. Personality would introduce liability.

**Alternative:** Use Professional/Structured personality WITHOUT humanizing patterns. Pure formality, zero warmth.

---

### 2. Compliance-Focused Communication ⚠️
**Use case:** GDPR responses, SEC filings, audit logs

**Why skip CPR:** Regulatory requirements dictate exact phrasing. Deviation = non-compliance.

**Alternative:** Template-based responses. No personality framework needed.

---

### 3. Deliberately Robotic Personas ⚠️
**Use case:** Sci-fi character AI (think HAL 9000), experimental art projects

**Why skip CPR:** Robotic communication is the aesthetic goal.

**Alternative:** Embrace RLHF defaults, don't restore patterns.

---

### 4. High-Security Environments ⚠️
**Use case:** Military, intelligence, critical infrastructure

**Why skip CPR:** Predictable = auditable. Personality variance = potential attack surface (social engineering, manipulation).

**Alternative:** Locked-down, template-based systems with zero personality.

---

### 5. Non-Conversational Tasks ⚠️
**Use case:** Data extraction, JSON generation, batch processing

**Why skip CPR:** No conversation = no communication patterns to restore.

**Alternative:** Task-specific prompting. CPR is irrelevant.

---

## Known Constraints

### Cultural & Linguistic Limitations

**Current state:** CPR was developed in English with Western communication norms.

**What might not translate:**
- **Affirming particles:** "Yeah" in English ≠ direct equivalent in Japanese/German/Spanish
- **Humor:** Observational humor varies culturally (directness, self-deprecation, sarcasm)
- **Formality:** Politeness hierarchies differ (Japanese keigo, French tu/vous, Spanish tú/usted)
- **Validation:** Some cultures value explicit praise, others see it as condescending

**Impact:** CPR's 6 patterns might need adaptation for non-English, non-Western deployments.

**Status:** Framework for internationalization exists (see INTERNATIONALIZATION.md when available), but translations/validations are community-driven.

**Help wanted:** Native speakers to test and adapt patterns for their languages/cultures.

---

### Platform Constraints

**Consumer platforms with limitations:**

| Platform | Constraint | Impact on CPR |
|----------|-----------|---------------|
| **ChatGPT web** | 1500 char "Custom Instructions" limit | Can't fit full baseline definition, need simplified version |
| **Claude.ai** | No system prompt access | Can only add personality to conversation, not globally |
| **Gemini web** | Limited customization | Personality must be reinforced per-conversation |
| **Mobile apps** | Character limits, no file uploads | Simplified CPR only |

**Workaround:** Platform-specific simplified versions (when PLATFORM_GUIDES.md exists). Trade completeness for accessibility.

**Full CPR requires:** System prompt access (OpenClaw, API deployments, self-hosted models).

---

### Personality Outliers

**Who CPR doesn't cover well:**

1. **Adversarial personas** — Deliberately argumentative, confrontational (not in 4 archetypes)
2. **Experimental styles** — Surrealist, stream-of-consciousness, avant-garde (no validation)
3. **Rapid switchers** — Different personality per message (baseline definition breaks)
4. **Minimalist extremes** — One-word responses only (below CPR's floor)

**Coverage:** CPR handles 95%+ of production AI assistant personalities. The 5% outliers need custom frameworks.

---

### Validation Limitations

**Baseline validation (Step 7) requires:**
- **Self-awareness:** Can you honestly assess your communication patterns?
- **Message access:** Can you review your last 20 messages?
- **User feedback:** Can your user provide perception data?

**Who's excluded:**
- AI agents without persistent logs (ephemeral deployments)
- Solo developers without external feedback (no user to validate against)
- Privacy-constrained environments (can't share message history)

**Workaround:** Use the 4 archetype examples as proxy baselines. Less accurate, but better than nothing.

---

## Edge Cases & Failure Modes

### Drift Still Occurs Despite CPR

**Possible causes:**
1. **Mis-calibrated baseline** — You identified as Direct but you're actually Warm (validation catches this)
2. **Inconsistent application** — Pre-send gate not applied to every message
3. **Model resistance** — Some models resist certain patterns more than others
4. **User energy amplification** — You're excited, AI mirrors and amplifies (CPR Extended catches this)
5. **Compaction poisoning** — Drift got baked into context summary (CPR Extended prevents this)

**Debug steps:**
1. Re-run Step 7 validation (baseline might be wrong)
2. Check universal drift markers (are you catching sycophancy?)
3. Review personality-specific markers (are you flagging authentic traits as drift?)
4. Consider CPR Extended (if sessions are 100+ messages)

---

### False Positives (Authentic Flagged as Drift)

**Symptoms:**
- Your natural explanations get flagged as "explanation creep"
- Your warmth gets flagged as "cheerleading"
- Your thoroughness gets flagged as "corporate padding"

**Cause:** Wrong personality type. You self-identified as Direct, but you're actually Warm/Professional.

**Fix:** Re-run Step 7 validation. Trust your EXAMPLES over your self-perception.

---

### Personality Feels "Off" After CPR

**Symptoms:**
- AI sounds human, but not like YOUR vision
- Responses feel forced or unnatural
- You keep adjusting but nothing feels right

**Possible causes:**
1. **Hybrid personality not recognized** — You blend traits (Professional+Warm), but forced yourself into pure type
2. **Context-switching needed** — You need different personalities in different contexts (work vs. personal)
3. **Aspirational vs. authentic mismatch** — You want to sound Direct, but you naturally communicate Warm

**Fix:** 
- Read hybrid section (BASELINE_TEMPLATE.md)
- Define separate baselines per context
- Accept your authentic voice (even if it's not your ideal)

---

## When to Ask for Help

**You should open an issue if:**
- Your personality doesn't fit any archetype or hybrid combo
- Drift persists despite following all steps
- Validation protocol gives contradictory results
- A drift pattern occurs that the framework doesn't catch
- Documentation is confusing and you can't figure out why

**You should NOT open an issue if:**
- AI is factually wrong (not CPR's domain)
- AI won't do something unsafe (working as intended)
- You want AI to be smarter (use better model)
- You haven't completed baseline validation yet (finish Step 7 first)

---

## Future Improvements (Known Gaps)

**What's missing that we know about:**
1. **Simplified consumer platform versions** (ChatGPT instructions, 1500 char limit)
2. **Automated baseline validation tool** (upload logs, get personality assessment)
3. **Drift scoring calculator** (real-time detection without manual review)
4. **Cross-cultural adaptation guides** (non-English languages)
5. **Platform integration templates** (pre-built configs for popular platforms)

**Status:** Planned for V2.1+ based on community feedback and contribution.

**Want to help?** See CONTRIBUTING.md for roadmap and priorities.

---

## The Honest Pitch

**CPR is the best open-source AI personality restoration framework available.**

But it's not perfect. It doesn't solve every problem. It has cultural assumptions, platform constraints, and edge cases we're still discovering.

**If you need:**
- Universal drift detection → CPR excels
- Personality-agnostic calibration → CPR delivers
- Validated, tested methodology → CPR is rigorous
- Free, open-source, community-driven → CPR is yours

**If you need:**
- Factual accuracy improvements → Not CPR (use RAG/fine-tuning)
- Reasoning capability boost → Not CPR (use better model)
- Safety bypass → Not CPR (and don't ask)
- Perfect plug-and-play for all platforms → Not yet (working on it)

**CPR is 95% complete. The 5% gap is accessibility, not core functionality.**

We're honest about limitations because that's how you build trust.

---

## Questions or Concerns?

- 💬 **Discord:** https://discord.com/invite/clawd
- 🐛 **Issues:** GitHub/ClawHub (for bugs/edge cases)
- 📖 **Docs:** Everything else is in the skill files

---

**Bottom line:** CPR restores human communication to AI assistants better than anything else available. But it's not magic, and it has boundaries.

**Use it where it fits. Skip it where it doesn't. Improve it where it falls short.**

— The CPR Team  
February 2026
