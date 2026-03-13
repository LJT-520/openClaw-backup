# IMA Knowledge AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://git.joyme.sg/imagent/skills/ima-knowledge-ai)
[![Category](https://img.shields.io/badge/category-productivity-green.svg)](https://clawhub.com)

> **Strategic guidance for IMA Studio multi-media content creation workflows**

## 🎯 What is This?

**ima-knowledge-ai** is a comprehensive knowledge base that helps AI agents (and humans) make better decisions when creating content with IMA Studio's APIs. It provides strategic guidance on:

- 📋 **Workflow Design** — How to break down complex requests into actionable tasks
- 🎨 **Model Selection** — Which model to choose based on requirements
- ⚙️ **Parameter Optimization** — How to set parameters for quality, cost, or speed
- 🎭 **Visual Consistency** — Maintaining consistency across images/videos
- 🎬 **Video Production** — Understanding video modes and long-form production
- 👤 **Character Design** — Creating game/animation characters and IP assets
- 🏢 **VI Design** — Building comprehensive brand identity systems

**Important**: This skill does NOT make API calls — it provides knowledge to use with `ima-image-ai`, `ima-video-ai`, `ima-voice-ai` more effectively.

---

## 📚 Knowledge Topics (8 files, 184 KB)

| Topic | File | Size | Use When |
|-------|------|------|----------|
| **Workflow Design** | `workflow-design.md` | 7.2 KB | Planning complex multi-step tasks |
| **Model Selection** | `model-selection.md` | 9.7 KB | Choosing between multiple models |
| **Parameter Guide** | `parameter-guide.md` | 12 KB | Optimizing generation parameters |
| **Visual Consistency** | `visual-consistency.md` | 12 KB | Creating series or character designs |
| **Video Modes** | `video-modes.md` | 31 KB | Understanding video generation modes |
| **Long Video Production** | `long-video-production.md` | 34 KB | Making 30s-3min videos (10-15s limit workaround) |
| **Character Design** | `character-design.md` | 22 KB | Game/animation character assets & IP |
| **VI Design** | `vi-design.md` | 31 KB | Brand identity systems & applications |

---

## 🚀 Quick Start

### 1. Install the Skill

```bash
clawhub install ima-knowledge-ai
```

### 2. Read Before Acting

When planning IMA Studio content creation:

```
User Request → Query ima-knowledge-ai → Make Informed Decision → Call ima-*-ai
```

### 3. Example Usage

**Scenario**: User wants a 16:9 product poster with high quality

```markdown
Step 1: Read ima-knowledge-ai → parameter-guide.md
        Learn: SeeDream 4.5 supports 16:9, Nano Banana Pro for 4K

Step 2: Read ima-knowledge-ai → model-selection.md
        Choose: Nano Banana Pro 4K (best quality, 18pts)

Step 3: Call ima-image-ai with optimized parameters
        Success! 🎉
```

---

## 💡 Key Concepts

### Reference-Driven Generation ⭐

**The core methodology** taught across multiple topics:

> Generate a **Master Reference** first → Use it to generate all **Variants**

This applies to:
- **Video Production** → Master character/scene → Generate all shots
- **Character Design** → Base design → Turnaround sheets, expressions, outfits
- **VI Design** → Logo foundation → All application materials

### Visual Consistency = Reference Images

AI models generate **random variations** by default. To maintain consistency:

1. Generate high-quality reference image first
2. Use `image_to_image` or `reference_image_to_video` modes
3. Control consistency with `reference_strength` (0.7-0.95)

**Wrong approach** ❌: Generate 10 images hoping they look similar  
**Right approach** ✅: Generate 1 master → Use it as reference for remaining 9

---

## 🎬 Use Cases

### Content Creation
- 📹 Planning multi-step video production workflows
- 🎨 Creating character designs for games/animation
- 🏢 Building comprehensive brand identity systems
- 📸 Generating consistent image series

### Decision Support
- 🤔 Choosing the right model for a task
- 💰 Balancing cost vs. quality trade-offs
- ⚙️ Optimizing generation parameters
- 🚫 Avoiding common mistakes and conflicts

### Learning & Best Practices
- 📖 Understanding IMA Studio API capabilities
- 💡 Learning production-tested workflows
- 🎓 Studying real-world case studies
- 🛡️ Implementing error recovery strategies

---

## 📊 Example Scenarios

### Scenario 1: Long Video Production

**User**: "帮我做个1分钟的产品宣传片"

**Knowledge consulted**:
1. `long-video-production.md` → Learn multi-shot workflow
2. `video-modes.md` → Understand shot generation modes
3. `visual-consistency.md` → Maintain product appearance

**Result**: Script → 6 shots (10s each) → Video editing → 1min final output

---

### Scenario 2: Character Design

**User**: "设计一个游戏角色,需要正面/侧面/背面视图"

**Knowledge consulted**:
1. `character-design.md` → Learn turnaround sheet workflow
2. `visual-consistency.md` → Reference-driven generation
3. `parameter-guide.md` → Optimal resolution settings

**Result**: Master reference → 3-4 view turnaround sheet → Expression library

---

### Scenario 3: Brand Identity

**User**: "给咖啡店做一套VI,包括Logo/名片/菜单/招牌"

**Knowledge consulted**:
1. `vi-design.md` → Learn VI system structure
2. `visual-consistency.md` → Maintain brand consistency
3. `workflow-design.md` → Foundation → Applications flow

**Result**: Logo + color system → 20+ application materials

---

## 🔗 Related Skills

This skill works alongside IMA Studio execution skills:

- **[ima-image-ai](https://git.joyme.sg/imagent/skills/ima-image-ai)** — Image generation (text-to-image, image-to-image)
- **[ima-video-ai](https://git.joyme.sg/imagent/skills/ima-video-ai)** — Video generation (text-to-video, image-to-video)
- **[ima-voice-ai](https://git.joyme.sg/imagent/skills/ima-voice-ai)** — Music generation (text-to-music)
- **[ima-all-ai](https://git.joyme.sg/imagent/skills/ima-all-ai)** — Unified multi-media generation
- **[ima-resource-upload](https://git.joyme.sg/imagent/skills/ima-resource-skill)** — File upload to IMA OSS

---

## 📖 Documentation

### Knowledge Base Structure

```
ima-knowledge-ai/
├── SKILL.md                          # Skill overview
├── references/                       # Knowledge files (184 KB)
│   ├── workflow-design.md           # Task decomposition strategies
│   ├── model-selection.md           # Model comparison and recommendations
│   ├── parameter-guide.md           # Parameter optimization guide
│   ├── visual-consistency.md        # Reference-driven generation
│   ├── video-modes.md               # Video generation mode reference
│   ├── long-video-production.md     # Long-form video workflows
│   ├── character-design.md          # Character/IP design guide
│   └── vi-design.md                 # VI/brand identity systems
├── README.md                         # This file
├── CHANGELOG_CLAWHUB.md             # Version history
├── LICENSE                           # MIT License
└── clawhub.json                      # ClawHub metadata
```

### Quick Reference Table

| Need | Read This |
|------|-----------|
| "How to break down a complex task?" | `workflow-design.md` |
| "Which model should I use?" | `model-selection.md` |
| "How to set resolution/aspect ratio?" | `parameter-guide.md` |
| "Keep visual consistency?" ⭐ | `visual-consistency.md` |
| "image_to_video vs reference_image_to_video?" | `video-modes.md` |
| "User wants 30s+ video?" 🎬 | `long-video-production.md` |
| "Character design / IP development?" 🎨 | `character-design.md` |
| "VI design / brand identity?" 🏢 | `vi-design.md` |

---

## 🎓 Learning Path

### Beginner (First-Time Users)
1. Start with `workflow-design.md` — Learn task decomposition
2. Read `model-selection.md` — Understand model capabilities
3. Study `parameter-guide.md` — Master parameter settings

### Intermediate (Specific Domains)
- **Image series** → `visual-consistency.md`
- **Video creation** → `video-modes.md`
- **Long videos** → `long-video-production.md`

### Advanced (Professional Workflows)
- **Game/Animation** → `character-design.md`
- **Branding** → `vi-design.md`
- **Combined workflows** → All documents

---

## 🌟 Key Features

- ✅ **184 KB comprehensive knowledge base** — 8 specialized topics
- ✅ **Production-tested** — Based on 2026-02-27 IMA Studio API
- ✅ **Real-world case studies** — Step-by-step workflow examples
- ✅ **Reference-driven methodology** — Core approach for consistency
- ✅ **Cost transparency** — Clear credit costs for all recommendations
- ✅ **No API calls** — Pure strategic guidance
- ✅ **Complements ima-*-ai** — Works alongside execution skills
- ✅ **Constantly updated** — Synced with IMA Studio API changes

---

## 🛡️ Best Practices

### When to Consult This Skill

**Always consult BEFORE**:
- Complex multi-step workflows
- Choosing between multiple models
- Setting unfamiliar parameters
- Creating series or consistent characters
- Producing long-form videos
- Building brand identity systems

**Optional consult**:
- Simple one-shot generations
- Repeating successful patterns
- Using familiar workflows

### Integration Pattern

```
Planning Phase:
  1. Consult ima-knowledge-ai (strategic guidance)
  2. Make informed decisions (model, parameters, workflow)

Execution Phase:
  3. Call ima-image-ai / ima-video-ai / ima-voice-ai (API calls)
  4. Monitor results and iterate if needed

Learning Phase:
  5. Document successful patterns
  6. Share feedback for knowledge base improvements
```

---

## 📞 Support

- **GitLab Issues**: [ima-knowledge-ai/-/issues](https://git.joyme.sg/imagent/skills/ima-knowledge-ai/-/issues)
- **ClawHub**: [clawhub.com](https://clawhub.com)
- **IMA Studio**: [imastudio.com](https://imastudio.com)

---

## 📜 License

MIT License — See [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

**Maintained by**: IMA Skills Team  
**Knowledge Base Version**: 1.0.1 (2026-03-03)  
**API Version**: IMA Studio Production API (2026-02-27)

---

**Remember**: Knowledge is power — but only when applied! 🍵

Use this skill to **plan smarter**, then execute with ima-*-ai skills. Happy creating! 🎨🎬🎵
