# IMA Image AI — AI Image Generation 🎨

**Generate stunning images from text in seconds**

Transform text descriptions into photorealistic images, or transform existing images into new styles. Perfect for content creators, designers, marketers, artists, and developers.

[![ClawHub](https://img.shields.io/badge/ClawHub-Creative-blueviolet)](https://clawhub.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](CHANGELOG_CLAWHUB.md)

---

## ✨ Features

🖼️ **3 Production-Ready AI Models**
- **SeeDream 4.5** 🌟 (5 pts) — Latest DouBao flagship, 4K photorealistic
- **Nano Banana2** 💚 (4-13 pts) — Fastest and most flexible
- **Nano Banana Pro** (10-18 pts) — Premium quality with size control

⚡ **Fast Generation**
- 20-60 seconds per image
- Real-time progress tracking
- Up to 4K resolution output

🎨 **Rich Customization**
- Custom aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2, 21:9)
- Size control: 512px to 4K
- text_to_image and image_to_image modes
- Style transfer and image editing

💎 **Professional Quality**
- Up to 4K resolution
- Photorealistic output
- Commercial-use ready

---

## 🚀 Quick Start

### 1. Get API Key
Get your IMA API key at https://imastudio.com

### 2. Set Environment Variable
```bash
export IMA_API_KEY=ima_your_key_here
```

### 3. Generate Images
Just describe what you want in natural language:

**Examples:**
```
"Generate a cute cat playing with yarn, photorealistic, 4K"
→ High-quality pet photo

"A beautiful mountain sunset, dramatic clouds, golden hour lighting"
→ Landscape photography

"Modern minimalist logo design, tech company, blue and white"
→ Professional logo concept
```

---

## 🎯 Use Cases

| Use Case | Example |
|----------|---------|
| 🎨 **Design** | Concept art, mockups, prototypes |
| 📱 **Social Media** | Posts, stories, profile pictures |
| 🛍️ **E-commerce** | Product visualization, ads |
| 📰 **Content Creation** | Blog headers, thumbnails |
| 🎮 **Game Dev** | Assets, textures, concepts |
| 🏢 **Business** | Presentations, marketing materials |

---

## 🖼️ Supported Models

| Model | Cost | Best For | Generation Time |
|-------|------|----------|----------------|
| **SeeDream 4.5** 🌟 | 5 pts | General use, aspect ratios, best value | 30-60s |
| **Nano Banana2** 💚 | 4-13 pts | Budget-friendly, fast results | 20-40s |
| **Nano Banana Pro** | 10-18 pts | Premium quality, size control | 60-120s |

---

## 📝 Prompt Examples

### Text to Image
```
"photorealistic portrait of a young woman, studio lighting, 4K"
"futuristic city skyline at night, neon lights, cyberpunk"
"minimalist product photography, white background, professional"
"watercolor painting of a garden, soft colors, artistic"
```

### Image to Image
```
"turn into oil painting style"
"convert to black and white, high contrast"
"make it look like a comic book illustration"
"enhance colors, more vibrant and saturated"
```

---

## 🔧 Advanced Features

- **Custom Aspect Ratios** (SeeDream 4.5): 1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2, 21:9
- **Size Control** (Nano Banana models): 512px, 1K, 2K, 4K
- **Local File Upload**: Automatically uploads local images for image_to_image
- **Smart Credit Selection**: Automatically picks correct size/quality tier
- **User Preference Memory**: Remembers your favorite model

---

## 📖 Documentation

- **[SKILL.md](SKILL.md)** — Complete technical documentation (1220 lines)
- **[CHANGELOG_CLAWHUB.md](CHANGELOG_CLAWHUB.md)** — Version history and features
- **[scripts/ima_image_create.py](scripts/ima_image_create.py)** — Core generation script

---

## 🔗 Related Skills

- **[ima-voice-ai](https://clawhub.ai/skills/ima-voice-ai)** — AI music generation (text-to-music)
- **[ima-video-ai](https://clawhub.ai/skills/ima-video-ai)** — AI video generation (text/image-to-video)
- **[ima-ai-creation](https://clawhub.ai/skills/ima-ai-creation)** — All-in-one image/video/music workflows

---

## 🔐 Security & Best Practices

✅ **Read-only skill** — No modifications allowed, ensures reliability  
✅ **API key required** — Set `IMA_API_KEY` environment variable  
✅ **Automatic updates** — Always uses latest API endpoints  
✅ **Production-validated** — Tested on real IMA infrastructure  

---

## 📊 Why Choose This Skill?

| Feature | This Skill | Others |
|---------|-----------|--------|
| **Latest Models** | ✅ SeeDream 4.5 (2026) | ❌ Outdated |
| **Generation Speed** | ✅ 20-60s | ❌ 60s+ |
| **Aspect Ratios** | ✅ 8 options | ❌ Limited |
| **Resolution** | ✅ Up to 4K | ❌ <2K |
| **Cost Transparency** | ✅ Shown upfront | ❌ Hidden |
| **User Memory** | ✅ Remembers preferences | ❌ No memory |

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🌟 Support

- **GitLab Issues**: [Report bugs or request features](https://git.joyme.sg/imagent/skills/ima-image-ai/-/issues)
- **ClawHub Comments**: Leave feedback on the skill page
- **API Provider**: [IMA Studio](https://imastudio.com)

---

## 🎉 Get Started

1. Install the skill from [ClawHub](https://clawhub.ai/skills/ima-image-ai)
2. Set your `IMA_API_KEY`
3. Start generating images!

**Happy creating! 🎨**
