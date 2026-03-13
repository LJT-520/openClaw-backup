---
name: dream-avatar
description: "Generate digital human talking avatar videos from images and audio using DreamAvatar 3.0 Fast API. Use when user wants to create a talking avatar video. API resources: https://api.newportai.com/api-reference/get-started"
metadata: {"openclaw": {"emoji": "🎬", "requires": {"env": ["DREAM_API_KEY"]}, "primaryEnv": "DREAM_API_KEY"}}
---

# DreamAvatar - Digital Human Video Generator

Generate talking avatar videos from images and audio using DreamAvatar 3.0 Fast API.

## Quick Start

### 1. Get API Key

Before using this skill, you need a DreamAPI API key. Visit **https://api.newportai.com/api-reference/get-started** to sign up and get your API key.

### 2. Configure API Key

Users must set their DreamAPI key in OpenClaw config:

```bash
openclaw config patch --json '{"skills": {"entries": {"dream-avatar": {"env": {"DREAM_API_KEY": "your-api-key-here"}}}}}'
```

Or add to `~/.openclaw/openclaw.json`:
```json
{
  "skills": {
    "entries": {
      "dream-avatar": {
        "env": {
          "DREAM_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

### 2. Generate Video

Provide:
- **image**: URL to a publicly accessible image (jpg, jpeg, png, webp, gif)
- **audio**: URL to a publicly accessible audio (mp3, wav, mp4, max 3 minutes)
- **prompt**: Description of the expression/behavior
- **resolution** (optional): "480p" or "720p", default "480p"

## API Details

### Endpoint
```
POST https://api.newportai.com/api/async/dreamavatar/image_to_video/3.0fast
```

### Headers
```
Authorization: Bearer {DREAM_API_KEY}
Content-Type: application/json
```

### Request Body
```json
{
  "image": "https://example.com/photo.jpg",
  "audio": "https://example.com/speech.mp3",
  "prompt": "a person smiling and speaking",
  "resolution": "480p"
}
```

### Response (Task Submission)
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "aa4bf173ffd84c2f8734d536d6a7b5a7"
  }
}
```

### Polling for Result
Use the taskId to poll for results:
```
POST https://api.newportai.com/api/getAsyncResult
```

Request body:
```json
{
  "taskId": "your-task-id"
}
```

### Response When Complete
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task": {
      "taskId": "aa4bf173ffd84c2f8734d536d6a7b5a7",
      "status": 3,
      "taskType": "dreamavatar/image_to_video/3.0fast"
    },
    "videos": [
      {
        "videoType": "mp4",
        "videoUrl": "https://...video.mp4"
      }
    ]
  }
}
```

## Implementation Notes

- Image and audio URLs must be publicly accessible (not behind authentication)
- Audio duration cannot exceed 3 minutes
- The API is async - you must poll for results
- Poll every 2-3 seconds, with a timeout of ~60 seconds
- Status 0 = pending, 1 = processing, 2 = failed, 3 = completed
