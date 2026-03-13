# IMA All AI — Unified AI Content Generation 🎨🎬🎵

**Generate images, videos, and music from text in one unified skill**

All-in-one AI content creation skill for multi-media workflows. Use when your task spans multiple content types — images, videos, and music. Perfect for content creators, marketers, designers, and developers who need comprehensive AI generation capabilities.

[![ClawHub](https://img.shields.io/badge/ClawHub-Creative-blueviolet)](https://clawhub.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](CHANGELOG.md)

---

## ✨ Features

🎨 **Image Generation** (3 models)
- **Text to Image** — SeeDream 4.5, Nano Banana2, Nano Banana Pro
- **Image to Image** — Style transfer, variations, editing
- Resolution: 512px to 4K
- 8 aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2, 21:9)

🎬 **Video Generation** (14 models)
- **Text to Video** — Wan 2.6, Kling O1, Hailuo 2.3, Google Veo 3.1, Sora 2 Pro
- **Image to Video** — Bring static images to life
- **First-Last Frame** — Smooth transitions between frames
- **Reference Image** — Style-consistent video generation
- Resolution: 540P to 4K, Duration: 4-15 seconds

🎵 **Music Generation** (3 models)
- **Text to Music** — Suno, DouBao BGM, DouBao Song
- Styles: Instrumental, vocal, background music
- Duration: 1-3 minutes
- Commercial-use ready

⚡ **Smart Features**
- Automatic model selection (newest & most popular)
- User preference memory (remembers your favorites)
- Cost transparency (shows credits upfront)
- Real-time progress tracking
- Automatic image upload for local files

---

## 🚀 Quick Start

### 1. Get API Key
Get your IMA API key at https://imastudio.com

### 2. Set Environment Variable
```bash
export IMA_API_KEY=ima_your_key_here
```

### 3. Generate Content
Just describe what you want in natural language:

**Image Examples:**
```
"A cute puppy running on grass, photorealistic 4K"
→ High-quality image with SeeDream 4.5

"Turn this photo into oil painting style"
→ Image-to-image transformation
```

**Video Examples:**
```
"Generate a video of a puppy dancing, cinematic, 5 seconds"
→ Text-to-video with Wan 2.6

"Bring this image to life, camera slowly zooms in"
→ Image-to-video animation
```

**Music Examples:**
```
"Generate upbeat electronic music, 120 BPM, no vocals"
→ Instrumental track with Suno

"Create relaxing background music for meditation"
→ Ambient BGM with DouBao
```

---

## 🎯 Use Cases

| Use Case | Example |
|----------|---------|
| 📱 **Social Media** | Complete content packages: image + video + music |
| 🎬 **Content Creation** | Multi-media projects with consistent style |
| 📢 **Marketing** | Product visuals, demo videos, promotional music |
| 🎮 **Game Dev** | Concept art, cinematics, soundtracks |
| 🎨 **Creative Arts** | Comprehensive creative workflows |
| 🏢 **Business** | Presentations, training materials, branding |

---

## 📊 Supported Models

### Image Models (3)

| Model | Cost | Features |
|-------|------|----------|
| **SeeDream 4.5** | 5 pts | 4K photorealistic, 8 aspect ratios, best value |
| **Nano Banana2** | 4-13 pts | Flexible sizes (512px-4K), budget-friendly |
| **Nano Banana Pro** | 10-18 pts | Premium quality, size control (1K/2K/4K) |

### Video Models (14+)

| Model | Cost | Best For |
|-------|------|----------|
| **Wan 2.6** | 25-120 pts | Most popular, balanced quality/cost |
| **Kling O1** | 48-120 pts | Latest with audio, reasoning model |
| **Hailuo 2.3** | 38 pts | Latest MiniMax, high quality |
| **Google Veo 3.1** | 70-330 pts | SOTA cinematic, professional |
| **Vidu Q2** | 5-70 pts | Budget-friendly, fast |

### Music Models (3)

| Model | Cost | Best For |
|-------|------|----------|
| **Suno (sonic)** | 25 pts | Highest quality, custom lyrics, vocal control |
| **DouBao BGM** | 30 pts | Background music, instrumental |
| **DouBao Song** | 30 pts | Song generation with vocals |

---

## 🎨 Generation Time & Quality

| Type | Time | Output Format | Resolution |
|------|------|---------------|------------|
| **Image** | 20-60s | JPEG/PNG | 512px-4K |
| **Video** | 60-360s | MP4 + thumbnail | 540P-4K |
| **Music** | 10-45s | MP3 | High-quality audio |

---

## 🔧 Advanced Features

### Image
- 8 aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2, 21:9)
- Size control (512px, 1K, 2K, 4K)
- Style transfer and variations
- Negative prompts

### Video
- Resolution: 540P, 720P, 1080P, 2K, 4K
- Aspect ratios: 16:9, 9:16, 1:1, 4:3
- Duration: 4-15 seconds
- Camera controls, shot types
- Prompt enhancement
- Seed control for reproducibility

### Music
- Custom mode & lyrics (Suno)
- Vocal gender control
- Style and mood specification
- Commercial-use ready

---

## 💻 CLI Usage

### Image Generation
```bash
python3 scripts/ima_create.py \
  --api-key $IMA_API_KEY \
  --task-type text_to_image \
  --model-id doubao-seedream-4.5 \
  --prompt "a cute puppy on grass" \
  --output-json
```

### Video Generation
```bash
python3 scripts/ima_create.py \
  --api-key $IMA_API_KEY \
  --task-type text_to_video \
  --model-id wan2.6-t2v \
  --prompt "a puppy dancing happily" \
  --output-json
```

### Music Generation
```bash
python3 scripts/ima_create.py \
  --api-key $IMA_API_KEY \
  --task-type text_to_music \
  --model-id sonic \
  --prompt "upbeat electronic music, 120 BPM" \
  --output-json
```

### List Available Models
```bash
python3 scripts/ima_create.py \
  --api-key $IMA_API_KEY \
  --task-type text_to_image \
  --list-models
```

---

## 📖 Documentation

- **[SKILL.md](SKILL.md)** — Complete technical documentation
- **[CHANGELOG.md](CHANGELOG.md)** — Version history and updates
- **[examples.md](examples.md)** — Python code examples
- **[scripts/ima_create.py](scripts/ima_create.py)** — Production script

---

## 🔗 Related Skills

- **[ima-image-ai](https://clawhub.ai/skills/ima-image-ai)** — Focused image generation (text-to-image, image-to-image)
- **[ima-video-ai](https://clawhub.ai/skills/ima-video-ai)** — Focused video generation (4 modes, 14 models)
- **[ima-voice-ai](https://clawhub.ai/skills/ima-voice-ai)** — Focused music generation (text-to-music)

💡 **When to use which?**
- Use **ima-all-ai** when your task spans multiple media types
- Use focused skills (image/video/voice) for single-media workflows

---

## 🔐 Security & Best Practices

✅ **Read-only skill** — No modifications allowed, ensures reliability  
✅ **API key required** — Set `IMA_API_KEY` environment variable  
✅ **Transparent file access** — Stores preferences in `~/.openclaw/memory/ima_prefs.json` and logs in `~/.openclaw/logs/`  
✅ **Auto-cleanup** — Logs auto-delete after 7 days  
✅ **User control** — Delete preferences/logs anytime without breaking the skill  
✅ **No personal data** — Only stores model preferences and timestamps  
✅ **Production-validated** — Tested on real IMA infrastructure  

**Full details:** See [SECURITY.md](SECURITY.md) for complete privacy policy and [INSTALL.md](INSTALL.md) for setup instructions.  
✅ **Secure uploads** — Automatic OSS upload with token authentication

---

## 📊 Why Choose This Skill?

| Feature | This Skill | Others |
|---------|-----------|--------|
| **Multi-Media** | ✅ Image + Video + Music | ❌ Single type only |
| **Latest Models** | ✅ 2026 models (Wan 2.6, Kling O1) | ❌ Outdated |
| **Model Coverage** | ✅ 20+ models total | ❌ <5 |
| **Smart Defaults** | ✅ Newest & most popular | ❌ Cheapest only |
| **User Memory** | ✅ Remembers preferences | ❌ No memory |
| **Cost Transparency** | ✅ Shown upfront | ❌ Hidden |
| **Image Upload** | ✅ Automatic OSS | ❌ Manual only |

---

## 📝 Prompt Tips

### Image Prompts
- Be specific about style: "photorealistic", "oil painting", "watercolor"
- Mention composition: "close-up", "wide shot", "portrait"
- Add quality markers: "4K", "high detail", "professional"

### Video Prompts
- Describe camera movement: "camera pans left", "slow zoom in"
- Specify mood: "cinematic", "dramatic", "peaceful"
- Add time/lighting: "sunset", "golden hour", "night time"

### Music Prompts
- Genre: "electronic", "classical", "jazz", "ambient"
- Mood: "upbeat", "melancholic", "energetic", "calm"
- Technical: "120 BPM", "no vocals", "piano solo"

---

## 🌟 Support

- **GitLab Issues**: [Report bugs or request features](https://git.joyme.sg/imagent/skills/ima-all-ai/-/issues)
- **ClawHub Comments**: Leave feedback on the skill page
- **API Provider**: [IMA Studio](https://imastudio.com)

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🎉 Get Started

1. Install the skill from [ClawHub](https://clawhub.ai/skills/ima-all-ai)
2. Set your `IMA_API_KEY`
3. Start creating multi-media content!

**Happy creating! 🎨🎬🎵**
