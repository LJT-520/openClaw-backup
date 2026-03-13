---
name: close-crm
description: "Close CRM — manage leads, contacts, opportunities, tasks, and activities. Sales CRM with built-in calling and email."
homepage: https://www.agxntsix.ai
license: MIT
compatibility: Python 3.10+ (stdlib only — no dependencies)
metadata: {"openclaw": {"emoji": "📞", "requires": {"env": ["CLOSE_API_KEY"]}, "primaryEnv": "CLOSE_API_KEY", "homepage": "https://www.agxntsix.ai"}}
---

# 📞 Close CRM

Sales CRM with built-in calling and email — leads, contacts, opportunities, tasks.

## Features

- **Leads** — list, create, get details
- **Contacts** — manage contact info
- **Opportunities** — track deals and values
- **Tasks** — create and manage tasks
- **Activities** — view activity feed

## Requirements

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOSE_API_KEY` | ✅ | API key/token for Close CRM |

## Quick Start

```bash
python3 {baseDir}/scripts/close-crm.py leads --limit 10
python3 {baseDir}/scripts/close-crm.py lead-create "Acme Corp" --contact-name John --contact-email john@acme.com
python3 {baseDir}/scripts/close-crm.py opportunities
python3 {baseDir}/scripts/close-crm.py me
```

## Credits
Built by [M. Abidi](https://www.linkedin.com/in/mohammad-ali-abidi) | [agxntsix.ai](https://www.agxntsix.ai)
[YouTube](https://youtube.com/@aiwithabidi) | [GitHub](https://github.com/aiwithabidi)
Part of the **AgxntSix Skill Suite** for OpenClaw agents.

📅 **Need help setting up OpenClaw for your business?** [Book a free consultation](https://cal.com/agxntsix/abidi-openclaw)
