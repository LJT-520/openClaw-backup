---
name: hitpaw-image-enhancer
description: Enhance images and videos using HitPaw's AI enhancement API
version: 1.0.0
author: Nova (HitPaw-Official)
type: cli
entry: dist/cli.js
repository: https://github.com/HitPaw-Official/openclaw-skill-hitpaw-enhancer
keywords:
  - image
  - video
  - enhancement
  - upscale
  - hitpaw
  - ai
license: MIT
capabilities:
  - image_enhancement
  - image_upscaling
  - photo_enhance
  - video_enhancement
  - video_upscaling
requirements:
  node: ">=18"
  packages:
    - axios
    - commander
    - ora
    - chalk
    - fs-extra
environment:
  variables:
    - name: HITPAW_API_KEY
      description: Your HitPaw API key
      required: true
---

# HitPaw Image & Video Enhancer Skill

A powerful OpenClaw skill that integrates HitPaw's state-of-the-art AI enhancement technology for both **images** and **videos**. Enhance, upscale, restore, and denoise with multiple AI models.

## Features

### Image Enhancement
- 🚀 **Upscale images 2x or 4x** without quality loss
- 👤 **Face enhancement** with specialized models
- 🌟 **Multiple models**: General, Face, High Fidelity, Denoise, Generative
- 📊 **Real-time progress tracking** with polling
- ⚙️ **Configurable DPI** and EXIF preservation

### Video Enhancement
- 🎬 **Upscale videos** to higher resolutions
- 🤖 **Multiple AI models** for different use cases
- 🎵 **Audio preservation** option
- ⏱️ **Long-running job support** with extended polling
- 📥 **Automatic download** when complete

## Installation

```bash
clawhub install hitpaw-image-enhancer
```

## Configuration

Set your HitPaw API key:

```bash
export HITPAW_API_KEY="your_api_key_here"
```

Or create a `.env` file in your OpenClaw workspace:

```
HITPAW_API_KEY=your_api_key_here
```

Get your API key at: https://playground.hitpaw.com/

---

# IMAGE COMMAND

## Usage: `enhance-image`

### Command Line Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--url`, `-u` | string | **required** | URL of the image to enhance |
| `--output`, `-o` | string | `output.jpg` | Output file path |
| `--model`, `-m` | string | `general_2x` | Image model (see below) |
| `--extension`, `-e` | string | `.jpg` | Output extension (`.jpg`, `.png`, `.webp`) |
| `--dpi` | number | original | Target DPI for metadata |
| `--keep-exif` | boolean | false | Preserve EXIF data from original |
| `--poll-interval` | number | 5 | Polling interval in seconds |
| `--timeout` | number | 300 | Maximum wait time in seconds |

#### Available Image Models

| Model | Multiplier | Best For | DPI Support |
|-------|------------|----------|-------------|
| `general_2x` / `general_4x` | 2x / 4x | General photos, landscapes | ✅ |
| `face_2x` / `face_4x` | 2x / 4x | Portrait & face enhancement | ✅ |
| `face_v2_2x` / `face_v2_4x` | 2x / 4x | Improved face model | ✅ |
| `high_fidelity_2x` / `high_fidelity_4x` | 2x / 4x | High quality preservation | ✅ |
| `sharpen_denoise_1x` | 1x | Denoise & sharpen | ✅ |
| `detail_denoise_1x` | 1x | Detail preservation | ✅ |
| `generative_*` (1x/2x/4x) | — | AI generative fill | ❌ |

#### Examples

```bash
# Simple 2x upscale with general model
enhance-image -u photo.jpg -o enhanced.jpg -m general_2x

# Face enhancement 4x
enhance-image -u portrait.jpg -m face_4x -o portrait_4x.jpg --keep-exif

# High fidelity with custom DPI
enhance-image -u old-photo.png -m high_fidelity_2x -dpi 300 -o hd.png

# Batch processing
for img in *.jpg; do
  enhance-image -u "$img" -o "upscaled/$img" -m general_4x
done
```

---

# VIDEO COMMAND

## Usage: `enhance-video`

### ⚠️ Important Notes

- **Resolution is required** (`--resolution` or `-r`). Must be in `WIDTHxHEIGHT` format (e.g., `1920x1080`).
- Ensure target resolution does **not exceed max output resolution** (36 MP total pixels) per API limits.
- Video processing can take **minutes to hours** depending on length. Use `--timeout` to extend if needed.
- Input video must be at a **publicly accessible URL** (local files not directly supported).

### Command Line Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--url`, `-u` | string | **required** | URL of the video to enhance |
| `--output`, `-o` | string | `output.mp4` | Output file path |
| `--model`, `-m` | string | `general_restore_2x` | Video model (see below) |
| `--resolution`, `-r` | string | **required** | Target resolution in WxH (e.g., `1920x1080`) |
| `--original-resolution` | string | — | Original resolution (e.g., `1280x720`) - optional |
| `--extension`, `-e` | string | `.mp4` | Output extension (`.mp4`, `.mov`, `.avi`) |
| `--fps` | number | — | Target FPS (preserves original if omitted) |
| `--keep-audio` | boolean | true | Preserve audio track |
| `--poll-interval` | number | 10 | Polling interval in seconds |
| `--timeout` | number | 600 | Maximum wait time in seconds |

#### Available Video Models

| Model | Description | Use Case |
|-------|-------------|----------|
| `general_restore_1x` / `2x` / `4x` | General video restoration | General upscaling |
| `face_soft_2x` | Face-softening enhancement | Portrait videos |
| `portrait_restore_1x` / `2x` | Portrait restoration | Face-focused content |
| `ultrahd_restore_2x` | Ultra HD upscaling | Highest quality upscale |
| `generative_1x` | Generative fill | AI-powered restoration |

#### Examples

```bash
# Upscale to 1080p using general_restore_2x
enhance-video -u input.mp4 -o output_1080p.mp4 -m general_restore_2x -r 1920x1080

# Upscale to 4K with specific original resolution
enhance-video -u clip.mov -o 4k.mov -m general_restore_4x -r 3840x2160 --original-resolution 1920x1080

# Denoise with portrait model
enhance-video -u portrait_video.avi -m portrait_restore_2x -r 1920x1080 -o clean_portrait.mp4

# Add color to B&W (if generative model supports)
enhance-video -u bw_vintage.mp4 -m generative_1x -r 1920x1080 -o colorized.mp4
```

---

## Coin Consumption

### Image Enhancement
- 2x/4x models: **~75 coins** per image
- 1x models: **~50 coins** per image
- Generative models: **~100+ coins** per image

### Video Enhancement
Coin costs depend on video length, model, and resolution. Approximate rates:
- Upscale models: **~200-400 coins** per minute
- Restoration models: **~150-300 coins** per minute

**Always check current rates** at: https://playground.hitpaw.com/

---

## Error Handling

Common errors and solutions:

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid API key` | Wrong or expired key | Update `HITPAW_API_KEY` |
| `Insufficient coins` | Account balance too low | Top up at HitPaw Playground |
| `Unsupported model` | Model name typo or not available | Check model table above |
| `Invalid extension` | Output format not supported | Use `.jpg/.png/.webp` for images; `.mp4/.mov/.avi` for videos |
| `Invalid video URL` | URL not publicly accessible | Ensure video is reachable via HTTPS |
| `Input/target resolution over limit` | Exceeds 36 MP total pixels (e.g., 7680x4320 = ~33 MP) | Reduce resolution |
| `Video duration over limit` | Video longer than 1 hour | Trim video first |
| `Rate limit exceeded` | Too many requests | Wait and retry with exponential backoff |
| `Video processing failed` | Corrupt video or unsupported codec | Try different input format or re-encode |

---

## Technical Details

### API Compatibility

This skill implements the official HitPaw API as documented:
- **Base URL**: `https://api-base.hitpaw.com`
- **Image endpoint**: `POST /api/photo-enhancer`
- **Video endpoint**: `POST /api/video-enhancer`
- **Status endpoint**: `POST /api/task-status`

Both endpoints return a `job_id`. Use the status endpoint to poll until `COMPLETED`, then download from `res_url`.

### Polling Strategy

- **Images**: default poll every 5s, timeout 300s (5 min)
- **Videos**: default poll every 10s, timeout 600s (10 min)

For longer videos, increase `--timeout` as needed (e.g., `--timeout 3600` for 1 hour).

### Resolution Handling

For videos, `resolution` is **required**. Choose based on your needs:
- Keep original size? Set `resolution` to original dimensions (use `--original-resolution` for better quality).
- Upscale? Multiply original width/height by factor (2x, 4x).
- Downscale? Rare but possible; just specify smaller dimensions.

**Max output**: 36 megapixels total (width × height ≤ 36,000,000 pixels).  
Examples: 3840×2160 = 8.3 MP ✅, 7680×4320 = 33.2 MP ✅, 8192×4608 = 37.7 MP ❌.

### Audio Preservation

By default, `enhance-video` keeps the audio track (`--keep-audio`, default true). Use `--no-keep-audio` to strip audio.

---

## Support

- Image API Docs: https://developer.hitpaw.com/image/API-reference
- Video API Docs: https://developer.hitpaw.com/video/API-reference
- Playground: https://playground.hitpaw.com/
- Contact: support@hitpaw.com

This skill is an **unofficial integration** with HitPaw API. You must have a valid API key and comply with HitPaw's terms. The skill author is not responsible for any charges incurred.

## License

MIT © HitPaw-Official
