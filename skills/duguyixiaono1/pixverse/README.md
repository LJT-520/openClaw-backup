# PixVerse Skills

Video generation skills for Claude Code, OpenClaw and other AI assistants powered by [PixVerse](https://platform.pixverse.ai).

Generate high-quality AI videos directly from your terminal with simple commands!

## Features

- 🎬 **Text-to-Video**: Generate videos from text descriptions
- 🖼️ **Image-to-Video**: Animate static images
- ⏩ **Video Extension**: Extend existing videos seamlessly

## Installation

### Prerequisites

- **Node.js 20+**
- **PixVerse API key** — get one at [PixVerse Platform](https://platform.pixverse.ai). See [API_KEY_GUIDE.md](./API_KEY_GUIDE.md) for details.

Set your API key (required for all use cases):

```bash
# macOS/Linux
export PIXVERSE_API_KEY="sk-your-api-key-here"

# Windows (PowerShell)
$env:PIXVERSE_API_KEY="sk-your-api-key-here"
```

Or create a `.env` file in the project root: `PIXVERSE_API_KEY=sk-your-api-key-here`

---

### Install via NPM

Install globally from npm:

```bash
npm install -g pixverse
```

Then link the package into your assistant’s skills directory and set your API key:

**Claude Code:**
```bash
ln -s "$(npm root -g)/pixverse" ~/.claude/skills/pixverse
export PIXVERSE_API_KEY="sk-your-api-key"
```

**OpenClaw:**
```bash
ln -s "$(npm root -g)/pixverse" ~/.openclaw/skills/pixverse
export PIXVERSE_API_KEY="sk-your-api-key"
```

> **Note for macOS users with nvm:** If OpenClaw was installed via Homebrew, its gateway process uses Homebrew's Node.js and may not see binaries installed by nvm's npm. If the skill shows as `blocked` after install, run:
> ```bash
> ln -s "$(npm root -g)/pixverse/pixverse" /opt/homebrew/bin/pixverse
> ```
> Then click **Refresh** in the OpenClaw Dashboard → Skills.

Restart your assistant so it picks up the skill.

---

### Install via Clawhub (OpenClaw)

If you use [OpenClaw](https://openclaw.ai/) and the skill is published on [ClawHub](https://clawhub.ai), install with:

```bash
npx clawhub install pixverse
```

Then set your API key: `export PIXVERSE_API_KEY="sk-your-api-key"` (or add to your shell profile / `.env`). No manual build or link step needed.

---

### Install from source (Claude Code)

1. Clone or download this repo, then build:
   ```bash
   cd PixVerse-Skills
   npm install
   npm run build
   ```
2. Link the skill into Claude Code’s skills directory:
   ```bash
   # macOS/Linux
   ln -s "$(pwd)" ~/.claude/skills/pixverse

   # Or copy instead of link
   cp -r "$(pwd)" ~/.claude/skills/pixverse
   ```
3. Ensure `PIXVERSE_API_KEY` is set in your environment (or in a `.env` file in the skill directory).
4. Restart Claude Code; it will load `skill.json` and expose the PixVerse tools.

---

### Install from source (OpenClaw)

1. Clone or download this repo, then build:
   ```bash
   cd PixVerse-Skills
   npm install
   npm run build
   ```
2. Link the skill into OpenClaw's skills directory:
   ```bash
   # macOS/Linux
   ln -s "$(pwd)" ~/.openclaw/skills/pixverse

   # Or copy instead of link
   cp -r "$(pwd)" ~/.openclaw/skills/pixverse
   ```
3. Register the `pixverse` binary so OpenClaw's gateway process can find it:

   > **Why this step is needed:** OpenClaw's gateway runs under its own Node.js runtime (typically Homebrew's node on macOS), which has a different `PATH` from your shell. Simply having the binary in your shell's `PATH` is not sufficient.

   **macOS with Homebrew (recommended):**
   ```bash
   ln -s "$(pwd)/pixverse" /opt/homebrew/bin/pixverse
   ```

   **macOS/Linux without Homebrew (requires sudo):**
   ```bash
   sudo ln -s "$(pwd)/pixverse" /usr/local/bin/pixverse
   ```

4. Ensure `PIXVERSE_API_KEY` is set in your environment (or in a `.env` file in the skill directory).
5. In the OpenClaw Dashboard → Skills, click **Refresh**. The skill status should change from `blocked` to enabled.
6. OpenClaw will read `SKILL.md` (and `skills.json`), and use the `pixverse` CLI as the skill entrypoint. You can use natural language (e.g. "generate a video of a cat playing piano") or the `pixverse` command: `pixverse gen_video`, `pixverse img2video`, `pixverse extend_video`.

## Usage

### Generate Video from Text

```bash
/gen-video --prompt "a cat playing piano" --aspect_ratio 16:9 --duration 5 --resolution 720p --model v4.5 --motion_mode normal --negative_prompt "blurry, distorted"
```

**Parameters:**
- `--prompt` (required): Text description of the video
- `--aspect_ratio` (optional): 16:9, 9:16, 1:1, 4:3, 3:4 (default: 16:9)
- `--duration` (optional): 5 or 8 seconds (default: 5)
- `--resolution` (optional): 360p, 540p, 720p, 1080p (default: 720p)
- `--model` (optional): v4.5 or v5 (default: v4.5)
- `--motion_mode` (optional): normal or fast (default: normal)
- `--negative_prompt` (optional): Elements to exclude from the video

### Image to Video

```bash
/img2video --image path/to/image.jpg --prompt "zoom in slowly" --motion_mode normal --duration 5 --aspect_ratio 16:9 --resolution 720p --model v4.5
```

**Parameters:**
- `--image` (required): Path to image file or URL
- `--prompt` (optional): Description of desired motion
- `--motion_mode` (optional): normal or fast (default: normal)
- `--duration` (optional): 5 or 8 seconds (default: 5)
- `--aspect_ratio` (optional): 16:9, 9:16, 1:1, 4:3, 3:4 (default: 16:9)
- `--resolution` (optional): 360p, 540p, 720p, 1080p (default: 720p)
- `--model` (optional): v4.5 or v5 (default: v4.5)

### Extend Video

```bash
/extend-video --video path/to/video.mp4 --extend_seconds 5 --prompt "continue the action"
# OR use video_id from previous generation
/extend-video --video_id 123456789 --extend_seconds 5 --prompt "continue the action"
```

**Parameters:**
- `--video` (optional): Path to video file (if not using video_id)
- `--video_id` (optional): Video ID from previous generation (if not using video file)
- `--extend_seconds` (optional): 5 or 8 seconds (default: 5)
- `--prompt` (optional): Guide for continuation
- `--aspect_ratio` (optional): 16:9, 9:16, 1:1, 4:3, 3:4
- `--resolution` (optional): 360p, 540p, 720p, 1080p (default: 720p)
- `--model` (optional): v4.5 or v5 (default: v4.5)
- `--motion_mode` (optional): normal or fast

## Examples

### Example 1: Create a cinematic scene
```bash
/gen-video --prompt "a futuristic city at sunset, flying cars, cyberpunk style" --aspect_ratio 16:9 --duration 8 --resolution 1080p
```

### Example 2: Animate a product photo
```bash
/img2video --image product.jpg --prompt "rotate 360 degrees" --motion_mode normal --resolution 1080p
```

### Example 3: Extend a short clip
```bash
/extend-video --video_id 389040986088643 --extend_seconds 5 --prompt "camera pulls back to reveal the full scene"
```

## API Documentation

See [PixVerse API Docs](https://docs.pixverse.ai) for more details on capabilities and limits.

## Troubleshooting

**"apiKey is not registered" (Error 10005)**
- API key is not registered or invalid
- See [API_KEY_GUIDE.md](./API_KEY_GUIDE.md) for instructions to get a valid API key
- Ensure your account is activated with available credits

**"PIXVERSE_API_KEY is required"**
- Make sure you've set the environment variable
- On macOS/Linux: `export PIXVERSE_API_KEY="sk-your-key"`
- On Windows: `set PIXVERSE_API_KEY=sk-your-key`
- Or create `.env` file in project root

**"Video generation timed out"**
- Video generation typically takes 60-120 seconds
- Complex prompts or high resolutions may take longer
- Check your API quota at pixverse.ai

**"File not found"**
- Use absolute paths or paths relative to current directory
- For images/videos, ensure file exists before uploading

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.

## License

MIT

## Support

- Documentation: https://docs.pixverse.ai
- Issues: https://github.com/PixVerseAI/PixVerse-Skills/issues
- MCP Server: https://github.com/PixVerseAI/PixVerse-MCP
