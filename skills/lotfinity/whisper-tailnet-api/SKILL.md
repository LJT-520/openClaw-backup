---
name: whisper-tailnet-api
description: Consume the shared Whisper speech-to-text API over Tailnet at http://100.92.116.99:19001. Use when an agent needs remote transcription/translation via /transcribe, health checks, request examples, model/task/language form parameters, or troubleshooting response/output.
---

# Whisper STT API over Tailnet

Use this guide on any host to call the shared Whisper transcription server.

## Endpoint

- **Base URL:** `http://100.92.116.99:19001`
- **Health:** `GET /health`
- **Transcribe:** `POST /transcribe` (multipart form)

## Quick health check

```bash
curl -sS http://100.92.116.99:19001/health
```

## Transcribe audio (default model: turbo)

```bash
curl -sS -X POST "http://100.92.116.99:19001/transcribe" \
  -F "file=@/path/to/audio.mp3" \
  -F "model=turbo" \
  -F "task=transcribe"
```

## Translate to English

```bash
curl -sS -X POST "http://100.92.116.99:19001/transcribe" \
  -F "file=@/path/to/audio.m4a" \
  -F "model=turbo" \
  -F "task=translate"
```

## Optional language hint

```bash
curl -sS -X POST "http://100.92.116.99:19001/transcribe" \
  -F "file=@/path/to/audio.wav" \
  -F "model=turbo" \
  -F "task=transcribe" \
  -F "language=ar"
```

## Request fields

- `file` (required): audio file upload
- `model` (optional): `turbo`, `base`, `small`, `medium`, `large`
- `task` (optional): `transcribe` or `translate`
- `language` (optional): language hint (example: `en`, `fr`, `ar`)

## Response shape

```json
{
  "ok": true,
  "model": "turbo",
  "task": "transcribe",
  "language": "en",
  "text": "transcribed text...",
  "segments": []
}
```

## Notes

- Default server model is `turbo` unless overridden.
- If transcription fails, server returns error JSON with stderr/stdout tail for debugging.
