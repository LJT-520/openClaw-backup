---
name: ima-knowledge-ai
description: >
  IMA Studio content creation knowledge base providing workflow design, model selection, 
  and parameter optimization guidance. Use when: (1) Planning multi-step IMA content 
  creation workflows and need to decompose user requests into actionable tasks; 
  (2) Choosing between ima-voice-ai, ima-image-ai, ima-video-ai models and need 
  recommendations based on task requirements; (3) Optimizing generation parameters 
  (resolution, aspect ratio, quality, cost) for specific use cases; (4) Before calling 
  any ima-*-ai skills to ensure best practices and avoid common mistakes. This skill 
  provides strategic guidance, not API calls.
---

# IMA Knowledge AI

> **Purpose**: This skill provides strategic knowledge to help agents make better decisions when using IMA Studio's content creation APIs. It does NOT make API calls directly — instead, it guides you to use `ima-voice-ai`, `ima-image-ai`, `ima-video-ai` more effectively.

## When to Use This Skill

**Read this skill BEFORE calling any ima-*-ai skill** if you need guidance on:

1. **Workflow Design** — How to break down complex user requests into atomic tasks
2. **Model Selection** — Which model to choose based on task requirements
3. **Parameter Optimization** — How to set parameters for quality, cost, or speed

**Example scenarios**:
- User: "帮我做个宣传视频" → Read `workflow-design.md` first
- User: "用最好的模型生成" → Read `model-selection.md` to pick the right one
- User: "生成16:9的图片" → Read `parameter-guide.md` for aspect ratio support

---

## Knowledge Structure

This skill contains 8 reference files:

### 1. [workflow-design.md](references/workflow-design.md)
**When to read**: Complex user requests that need task decomposition

- Task decomposition strategies
- Dependency identification (e.g., script → voiceover → video)
- Multi-step workflow templates
- Common creation patterns

### 2. [model-selection.md](references/model-selection.md)
**When to read**: Choosing between multiple models for a task

- Model capability matrix (image/video/voice)
- Cost vs. quality trade-offs
- Use case recommendations (budget/balanced/premium)
- Model limitations and workarounds

### 3. [parameter-guide.md](references/parameter-guide.md)
**When to read**: Optimizing parameters for a specific task

- Resolution/aspect ratio guidelines
- Quality vs. speed trade-offs
- Common mistakes and fixes
- Parameter compatibility matrix

### 4. [visual-consistency.md](references/visual-consistency.md) ⭐ **NEW**
**When to read**: Any image/video generation task involving series, characters, or scenes

- Why AI generation lacks visual consistency by default
- Identifying implicit consistency requirements
- Reference image workflow (Image-to-Image / Video-to-Video)
- Multi-shot coherence strategies
- Common mistakes and best practices

### 5. [video-modes.md](references/video-modes.md) ⭐⭐ **CRITICAL**
**When to read**: ANY video generation task (MANDATORY before calling ima-video-ai)

- image_to_video vs reference_image_to_video (DIFFERENT concepts!)
- image_to_video = first frame to video (input becomes frame 1)
- reference_image_to_video = reference appearance to video (can change scene)
- Traditional two-step vs modern one-step workflow
- Fallback strategy when primary method fails
- Common mistakes (旺财案例)

### 6. [long-video-production.md](references/long-video-production.md) 🎬 **ESSENTIAL FOR LONG VIDEOS**
**When to read**: User requests video longer than 15 seconds (30s ad, 1min short, 3min promo)

- Why models are limited to 10-15 seconds
- Multi-shot capability (2-4 camera angles in one generation) 🆕
- Three-step workflow: Script → Generate shots → Edit/Stitch
- Visual asset preparation (characters, scenes, props)
- Shot-by-shot generation strategy
- Video editing and stitching techniques
- Complete case study: 1-minute fantasy short film

### 7. [character-design.md](references/character-design.md) 🎨 **CHARACTER DESIGN / IP DEVELOPMENT**
**When to read**: User needs character design, IP development, game/animation assets, turnaround sheets

- Character Design industry overview (games, animation, manga, IP)
- Reference-driven workflow (Master Reference → Variants)
- Turnaround sheets (front/side/back/3-4 views)
- Expression library (happy/angry/sad/surprised...)
- Outfit variants (casual/armor/costumes)
- Props & weapons reference images
- Action poses (idle/walk/run/attack...)
- Complete case study: RPG game character "Aria"

### 8. [vi-design.md](references/vi-design.md) 🏢 **VI DESIGN / BRAND IDENTITY**
**When to read**: User needs VI design, brand identity, logo applications, visual guidelines

- VI (Visual Identity) system overview
- Foundation system (Logo / Color / Typography / Auxiliary graphics)
- Application system (Office / Store / Packaging / Advertising / Digital / Uniform)
- Reference-driven workflow (Foundation → Applications)
- Logo consistency requirements (highest level)
- Color palette management (Primary / Secondary / Neutral / Functional)
- Complete case study: "Morning Light Coffee" cafe VI (20+ deliverables)

### 9. [best-practices/](references/best-practices/) ⭐⭐⭐ **COMMERCIAL TEMPLATES (On-Demand)**
**When to read**: Commercial advertising or artistic photography tasks

**Structure**: Index + 4 scenario files (load only what you need)

- `README.md` — Index with keyword matching (2 KB)
- `jewelry.md` — Jewelry & accessories commercial ads (3 KB)
- `skincare.md` — Skincare & cosmetics commercial ads (3 KB)
- `perfume.md` — Perfume & fragrance commercial ads (3 KB)
- `cinematic-art.md` — Cinematic vintage art photography (4 KB)

**Usage**: Read index first → Load only relevant scenario file

**Token savings**: 60-85% compared to loading all scenarios
- Logo consistency requirements (highest level)
- Color palette management (Primary / Secondary / Neutral / Functional)
- Complete case study: "Morning Light Coffee" cafe VI (20+ deliverables)

---

## Usage Pattern

```
User Request
  ↓
[ima-knowledge-ai] Query relevant knowledge
  ↓
Make informed decision
  ↓
[ima-*-ai] Execute API call with optimized parameters
  ↓
Success!
```

**Example flow**:
```
User: "帮我生成一张16:9的产品海报，要高质量"

Step 1: Read ima-knowledge-ai → parameter-guide.md
        → Learn: SeeDream 4.5 supports 16:9, Nano Banana Pro native support
        
Step 2: Read ima-knowledge-ai → model-selection.md
        → Choose: Nano Banana Pro 4K (best quality, 18pts)
        
Step 3: Call ima-image-ai with:
        --model-id gemini-3-pro-image
        --extra-params '{"aspect_ratio": "16:9", "size": "4K"}'
        
Step 4: Success! 🎉
```

---

## Important Notes

1. **This skill does NOT replace ima-*-ai skills**  
   Use it as a consultant before executing tasks

2. **Knowledge is based on production IMA Studio API (2026-02-27)**  
   Models and parameters may change; always verify with `list-models`

3. **Cost transparency**  
   All recommendations include credit cost for user decision-making

4. **No scripts in this skill**  
   Pure knowledge — implementation is handled by other ima-*-ai skills

---

## Quick Reference

| Need | Read This |
|------|-----------|
| "How to break down a complex task?" | `workflow-design.md` |
| "Which model should I use?" | `model-selection.md` |
| "How to set resolution/aspect ratio?" | `parameter-guide.md` |
| "What's the cost difference?" | `model-selection.md` |
| "Why did my parameter get ignored?" | `parameter-guide.md` |
| **"How to keep visual consistency across images/videos?"** ⭐ | **`visual-consistency.md`** |
| **"Generate series/multiple shots with same subject?"** | **`visual-consistency.md`** |
| **"image_to_video vs reference_image_to_video?"** ⭐⭐ | **`video-modes.md`** |
| **"Which video mode should I use?"** | **`video-modes.md`** |
| **"User wants 30s+ video / short film / ad?"** 🎬 | **`long-video-production.md`** |
| **"How to make 1min+ video with 10s limit?"** | **`long-video-production.md`** |
| **"Multi-shot video (2-4 camera angles in one gen)?"** 🆕 | **`long-video-production.md`** |
| **"Character design / IP development?"** 🎨 | **`character-design.md`** |
| **"Game/animation character assets?"** | **`character-design.md`** |
| **"Turnaround sheet / expression library?"** | **`character-design.md`** |
| **"How to maintain character consistency?"** | **`character-design.md`** |
| **"VI design / brand identity / logo applications?"** 🏢 | **`vi-design.md`** |
| **"Coffee shop / restaurant / retail brand design?"** | **`vi-design.md`** |
| **"Business card / menu / packaging / signage?"** | **`vi-design.md`** |
| **"How to ensure brand consistency?"** | **`vi-design.md`** |
| **"Jewelry ad / skincare ad / perfume ad?"** ⭐⭐⭐ | **`best-practices/`** (index first) |
| **"Commercial advertising templates?"** | **`best-practices/jewelry|skincare|perfume.md`** |
| **"Cinematic art photography / editorial style?"** | **`best-practices/cinematic-art.md`** |

---

**Last Updated**: 2026-03-03  
**Version**: 1.0.1  
**Maintainer**: IMA Studio Skills Team
