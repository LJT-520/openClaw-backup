# Security & Privacy Policy — ima-all-ai

## Overview

This skill generates images, videos, and music via the IMA Open API. This document explains what data is collected, where it's stored, and how to control it.

**🌐 Network Architecture Notice:**
- **Music tasks** (`text_to_music`) use only `api.imastudio.com`.
- **Image/video tasks** use **two IMA-owned domains**: `api.imastudio.com` for task management and `imapi.liveme.com` for image/video uploads.
- Your API key is sent to **both domains** (see "Data Flow" section for details).

---

## Required Permissions

### 1. Network Access ✅

**Purpose:** Call IMA Open API endpoints

**Endpoints accessed:**

| Domain | Owner | Purpose | Used By |
|--------|-------|---------|---------|
| `api.imastudio.com` | IMA Studio | Main API (product list, task creation, polling) | All tasks (image/video/music) |
| `imapi.liveme.com` | IMA Studio | Image/video upload service (presigned URL generation) | Image & video tasks only |
| `*.aliyuncs.com` | Alibaba Cloud (IMA-managed) | Image/video storage (OSS upload via presigned URL) | Image & video tasks only |
| `*.esxscloud.com` | Alibaba Cloud (IMA CDN) | Image/video delivery (CDN download URLs) | Image & video tasks only |

**Data sent:**
- **To `api.imastudio.com`**: API key (Authorization header), generation prompts, model selection, generation parameters
- **To `imapi.liveme.com`**: API key (query parameters: `appUid`, `cmimToken`), file metadata (MIME type, extension)
- **To OSS/CDN**: Raw image/video bytes (via presigned URL, **NO API key**)
- User ID (if provided via --user-id flag) — **stored locally only**, never sent to API

**Verification:**
```bash
# Verify network endpoints in the script:
grep -n "https://" scripts/ima_create.py

# Expected output includes both:
# - api.imastudio.com (main API)
# - imapi.liveme.com (upload service, for image/video tasks)
```

**Network Traffic Verification:**

Monitor live traffic to verify domain usage:

1. **Using tcpdump** (requires root):
   ```bash
   sudo tcpdump -i any -n 'host api.imastudio.com or host imapi.liveme.com' -A
   ```

2. **Using Wireshark**:
   - Capture filter: `host api.imastudio.com or host imapi.liveme.com`
   - Display filter: `http or tls`

3. **Using mitmproxy** (HTTPS inspection):
   ```bash
   mitmproxy --mode transparent --showhost
   # Then run: python scripts/ima_create.py --task-type text_to_image ...
   ```

4. **DNS Verification**:
   ```bash
   dig api.imastudio.com
   dig imapi.liveme.com
   # Verify both domains resolve to IMA Studio's infrastructure
   ```

---

### 2. File Read/Write ✅

**Purpose:** Store user preferences and logs locally

#### Files Created:

**A. User Preferences**
- **Path**: `~/.openclaw/memory/ima_prefs.json`
- **Content**: Model preferences (JSON)
- **Example**:
  ```json
  {
    "user_123": {
      "text_to_image": {
        "model_id": "doubao-seedream-4.5",
        "model_name": "SeeDream 4.5",
        "credit": 5,
        "last_used": "2026-02-27T12:34:56Z"
      },
      "text_to_video": {
        "model_id": "wan2.6-t2v",
        "model_name": "Wan 2.6",
        "credit": 25,
        "last_used": "2026-02-27T12:35:10Z"
      },
      "text_to_music": {
        "model_id": "sonic",
        "model_name": "Suno",
        "credit": 25,
        "last_used": "2026-02-27T12:36:00Z"
      }
    }
  }
  ```
- **Size**: < 1 KB
- **Rotation**: Never (until manually deleted)
- **Purpose**: Remember your favorite model
- **Contains**: Model IDs, credit costs, timestamps
- **Does NOT contain**: API keys, prompts, generated content, personal info

**B. Generation Logs**
- **Path**: `~/.openclaw/logs/ima_skills/ima_create_YYYYMMDD.log`
- **Content**: Timestamped operation logs
- **Example**:
  ```
  2026-02-27 12:34:56 | INFO  | create_task         | Creating image task: model=SeeDream 4.5, credit=5
  2026-02-27 12:35:10 | INFO  | create_task         | Creating video task: model=Wan 2.6, credit=25
  2026-02-27 12:36:00 | INFO  | create_task         | Creating music task: model=Suno, credit=25
  2026-02-27 12:36:23 | INFO  | poll_task           | Task completed: task_id=xxx, duration=27s
  ```
- **Size**: ~10-50 KB per day
- **Rotation**: Auto-delete logs older than 7 days
- **Purpose**: Debug issues, track API usage
- **Contains**: Timestamps, model IDs, task IDs, HTTP status codes
- **Does NOT contain**: API keys, full prompts, user data

---

## Data Flow Diagram

```
User Input (image/video/music prompt)
    ↓
[Agent reads prompt: "Generate a cute puppy image" / "Create a dancing video" / "Generate lo-fi music"]
    ↓
[Script: ima_create.py]
    ↓
├── Read preference: ~/.openclaw/memory/ima_prefs.json (optional)
│
├── ── Music Tasks (text_to_music) ──
│   └── Call API: https://api.imastudio.com
│       - Authorization: Bearer ima_xxx...
│       - Prompt, model ID, generation params
│
├── ── Image/Video Tasks (text_to_image, image_to_image, text_to_video, etc.) ──
│   ├── 1️⃣ Get Upload Token: https://imapi.liveme.com/api/rest/oss/getuploadtoken
│   │   - Query params: appUid=ima_xxx..., cmimToken=ima_xxx...
│   │   - Returns: presigned PUT URL (ful) + CDN URL (fdl)
│   │
│   ├── 2️⃣ Upload Image (if input_images provided): PUT {presigned URL}
│   │   - Destination: *.aliyuncs.com (IMA-managed OSS bucket)
│   │   - No API key sent (presigned URL includes temporary token)
│   │
│   └── 3️⃣ Create Task: https://api.imastudio.com/open/v1/tasks/create
│       - Authorization: Bearer ima_xxx...
│       - Prompt, model ID, CDN URL (fdl), generation params
│
├── Write log: ~/.openclaw/logs/ima_skills/ (optional)
└── Save preference: ~/.openclaw/memory/ima_prefs.json (optional)
    ↓
[API returns image/video/music URL]
    ↓
User receives generated content
```

**Key Points:**
- Your API key is sent to **both `api.imastudio.com` and `imapi.liveme.com`** (both owned by IMA Studio).
- **Music tasks** skip the upload step entirely (single-domain flow).
- Image/video uploads use Alibaba Cloud OSS via presigned URLs (no API key exposed to OSS).

---

## Hardcoded APP_KEY Disclosure

### What It Is

The script `ima_create.py` contains this line:
```python
APP_KEY = "32jdskjdk320eew"  # Public shared key
```

### Why It's There

This `APP_KEY` is a **public identifier** used by IMA Studio's image/video upload service (`imapi.liveme.com`). It is:

1. **Not a secret** — Intentionally shared across all users
2. **Embedded in IMA's web frontend** — Visible in browser DevTools
3. **Used for HMAC signature generation** — Part of upload authentication flow

**Think of it as a "client ID" rather than a "client secret."**

### What It's Used For

When requesting presigned upload URLs from `imapi.liveme.com`, the script generates a temporary HMAC signature:

```python
sign = SHA1("{APP_ID}|{APP_KEY}|{timestamp}|{nonce}").upper()
```

This signature is combined with your **actual IMA API key** (sent as `appUid` and `cmimToken` query parameters) to authenticate the upload request.

### Security Implications

- ✅ **Your API key** (`ima_xxx...`) is the **real credential** — this is what you must protect.
- ✅ `APP_KEY` alone **cannot access your account** — it's just part of the HMAC input.
- ⚠️ If `APP_KEY` changes (unlikely), you'll need to update the script.

### Verification

Confirm `APP_KEY` matches IMA's frontend:
```bash
# 1. Inspect script
grep -n "APP_KEY" scripts/ima_create.py

# 2. Verify against IMA web app
# - Visit https://imastudio.com
# - Open browser DevTools (F12) → Network tab
# - Upload an image → filter for "getuploadtoken"
# - Check request query params for "appKey=32jdskjdk320eew"
```

---

## What This Skill Does NOT Do

❌ **Does NOT collect personal information** — no emails, names, addresses  
❌ **Does NOT store API keys** — only in environment variables (IMA_API_KEY)  
❌ **Does NOT store prompts** — only model preferences  
❌ **Does NOT store generated content** — URLs are ephemeral  
❌ **Does NOT send data to unauthorized third parties** — only IMA-owned domains  
❌ **Does NOT modify other skills** — isolated to its own directory  
❌ **Does NOT require sudo** — runs with user permissions  
❌ **Does NOT install background services** — runs on-demand only  

---

## User Control & Transparency

### View Stored Data

**Check preferences:**
```bash
cat ~/.openclaw/memory/ima_prefs.json
```

**Check logs:**
```bash
ls -lh ~/.openclaw/logs/ima_skills/
tail -20 ~/.openclaw/logs/ima_skills/ima_create_$(date +%Y%m%d).log
```

### Delete Stored Data

**Delete preferences (reset to defaults):**
```bash
rm ~/.openclaw/memory/ima_prefs.json
```

**Delete logs:**
```bash
rm -rf ~/.openclaw/logs/ima_skills/
```

**Delete everything:**
```bash
rm -rf ~/.openclaw/memory/ima_prefs.json ~/.openclaw/logs/ima_skills/
```

---

## Disable File Storage (Optional)

If you don't want local file writes:

### Method 1: Remove Write Permissions
```bash
touch ~/.openclaw/memory/ima_prefs.json
chmod 444 ~/.openclaw/memory/ima_prefs.json  # Read-only

mkdir -p ~/.openclaw/logs/ima_skills
chmod 555 ~/.openclaw/logs/ima_skills  # No write
```

**Effect:** Skill will skip writing preferences/logs, but will still function.

### Method 2: Use Null Device
```bash
ln -s /dev/null ~/.openclaw/memory/ima_prefs.json
```

**Effect:** Writes are discarded silently.

---

## API Key Security

### Best Practices

1. **Never hardcode API keys in code**
   ```bash
   # ❌ BAD
   --api-key ima_abc123xyz

   # ✅ GOOD
   export IMA_API_KEY=ima_abc123xyz
   ```

2. **Use scoped keys** (if provider supports)
   - Request read-only keys for testing
   - Use separate keys for different environments

3. **Rotate keys periodically**
   - Regenerate keys every 90 days
   - Revoke compromised keys immediately

4. **Monitor API key usage**
   - Check `https://imastudio.com/dashboard` for unauthorized activity
   - Review logs: `~/.openclaw/logs/ima_skills/` for unexpected API calls

5. **Verify endpoints**
   ```bash
   # Confirm script calls only IMA-owned domains:
   grep -E "https://[^\"']+" scripts/ima_create.py
   ```

   Expected output:
   ```
   https://api.imastudio.com
   https://imapi.liveme.com
   ```

   **Both domains are owned by IMA Studio.**

---

## Code Transparency

### Inspect the Script

**Review network calls:**
```bash
# Show all HTTP requests:
grep -A 3 "requests\.(get|post|put)" scripts/ima_create.py
```

**Verify endpoints:**
```bash
# Confirm only IMA-owned domains are accessed:
rg "https://" scripts/ima_create.py
```

Expected domains:
- `api.imastudio.com` (main API)
- `imapi.liveme.com` (upload service, for image/video tasks)

**Check file writes:**
```bash
# Find all file operations:
grep -E "(open\(|with open)" scripts/ima_create.py
```

---

## Compliance & Standards

### GDPR (EU)
- ✅ **Right to access**: View files anytime (`cat ~/.openclaw/...`)
- ✅ **Right to erasure**: Delete files anytime (`rm ~/.openclaw/...`)
- ✅ **Data minimization**: Only stores necessary preferences
- ✅ **Transparency**: This document explains everything

### CCPA (California)
- ✅ **Right to know**: Full disclosure in this document
- ✅ **Right to delete**: User can delete all data
- ✅ **No selling data**: Skill never sells user data

### COPPA (Children's Privacy)
- ⚠️ **Not designed for children** — requires API key management
- Parental supervision recommended for users under 13

---

## Third-Party Services

### IMA Open API
- **Provider**: IMA Studio (https://imastudio.com)
- **Privacy Policy**: https://imastudio.com/privacy
- **Data sent**: Prompts, model selections, user IDs (optional)
- **Data received**: Generated music URLs
- **Data retention**: Per IMA's policy (check their website)

**User responsibility:**
- Review IMA's privacy policy before use
- Understand IMA's data retention practices
- Contact IMA support for data deletion requests

---

## Incident Response

### If You Suspect a Security Issue

1. **Stop using the skill immediately**
2. **Revoke your API key** at https://imastudio.com
3. **Report the issue**:
   - GitHub: https://git.joyme.sg/imagent/skills/ima-voice-ai/-/issues
   - Email: security@imastudio.com (for critical vulnerabilities)
4. **Delete local files**:
   ```bash
   rm -rf ~/.openclaw/memory/ima_prefs.json ~/.openclaw/logs/ima_skills/
   ```

### What We Will Do

- Acknowledge report within 24 hours
- Investigate and patch within 7 days
- Publish security advisory if needed
- Notify affected users via ClawHub

---

## Audit Trail

### Version History & Security Changes

| Version | Date | Security Changes |
|---------|------|------------------|
| v1.0.0 | 2026-02-27 | Initial release, basic logging |
| v1.0.1 | 2026-02-27 | Added this SECURITY.md document |
| v1.0.3 | 2026-02-28 | **Security Transparency Update**: Disclosed dual-domain architecture (`api.imastudio.com` + `imapi.liveme.com`), documented hardcoded `APP_KEY`, added network traffic verification guides |

---

## Contact

- **Security Issues**: security@imastudio.com
- **General Support**: https://git.joyme.sg/imagent/skills/ima-voice-ai/-/issues
- **IMA API Support**: https://imastudio.com/support

---

## Acknowledgments

This skill follows security best practices inspired by:
- OWASP Top 10
- CWE/SANS Top 25
- OpenClaw Security Guidelines

---

**Last Updated:** 2026-02-28  
**Review Frequency:** Quarterly
