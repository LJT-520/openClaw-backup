---
name: app-legal-pages
description: Generate and deploy app Privacy Policy and Terms of Service static websites from an app feature document. Use when a user provides app requirements/feature docs and wants production-ready legal pages published via GitHub + Cloudflare Pages, including draft generation, consistency checks, and deployment-ready output URLs.
---

# App Legal Pages

Generate a complete legal mini-site for an app:

- `index.html` (legal home)
- `privacy.html` (Privacy Policy)
- `terms.html` (Terms of Service)
- `styles.css` (shared styles)

## Workflow

1. Collect required legal/product inputs.
2. Generate draft legal pages from feature documentation.
3. Validate consistency and disclosure coverage.
4. Publish via GitHub + Cloudflare Pages.
5. Return URLs + legal review TODOs.

## 1) Collect Inputs

Collect or confirm:

- App name
- Company/entity name (or individual publisher name)
- Contact email
- Governing law jurisdiction (country/region)
- Effective date
- App feature document (markdown/text)
- Data behavior details:
  - Analytics events
  - Crash/error logs
  - Identifiers (device/user IDs)
  - Third-party SDKs/services
  - Permissions used (camera/location/photos/mic/contacts/tracking/notifications)

If facts are unknown, keep explicit placeholders such as `TODO_LEGAL_REVIEW`.

## 2) Generate Draft Site

Run:

```bash
python3 scripts/generate_legal_site.py \
  --input /path/to/app-feature.md \
  --out ./out/legal-site \
  --app-name "Your App" \
  --company "Your Company" \
  --email "support@example.com" \
  --effective-date "2026-03-03" \
  --jurisdiction "California, United States"
```

The script auto-detects likely data categories/permissions from the feature text. Manually review and adjust output if app behavior is more specific than heuristic detection.

## 3) Validate Draft Quality

Check before publishing:

- `privacy.html` and `terms.html` both exist.
- App/company/email/effective date are consistent across pages.
- Privacy disclosures match actual permissions and data behavior.
- User rights and contact/deletion request path are present.
- No unverifiable legal claims.
- Unknown legal points remain marked as `TODO_LEGAL_REVIEW`.

If the app uses sensitive permissions or SDKs, verify these are explicitly disclosed in Privacy Policy.

## 4) Publish with GitHub + Cloudflare Pages

Follow `references/cloudflare-github-deploy.md`.
For publishing this skill itself to public ClawHub, use `references/publish-to-clawhub.md`.

Default Cloudflare Pages setup for this static output:

- Framework preset: None
- Build command: *(empty)*
- Build output directory: `/`

## 5) Returnables

Return:

- GitHub repository URL
- Cloudflare Pages project URL
- Privacy Policy URL
- Terms of Service URL
- Remaining legal/legal-team review TODOs

## Guardrails

- Do not claim legal compliance guarantees.
- Keep wording plain and readable.
- Keep deterministic page structure for easy future edits.
- Recommend human legal review before production app-store submission.
