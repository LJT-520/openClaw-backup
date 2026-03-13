# 🎯 LinkedIn B2B Buying Signal Detector

**Slug:** `linkedin-buying-signal-detector`  
**Category:** Sales Intelligence / Lead Generation  
**Powered by:** [Apify](https://www.apify.com?fpr=dx06p) + Claude AI

> Detect **who is ready to buy RIGHT NOW** by analyzing LinkedIn job postings, company growth signals, tech stack changes, and hiring patterns — then auto-generate hyper-personalized outreach messages.

---

## 💡 Why This Skill Dominates

Most lead gen tools find *who* to contact. This skill tells you *when* to contact them — at the exact moment they have **budget, urgency, and intent**. No SaaS equivalent under $2,000/month.

**Buying signals detected:**
- 🚀 Company hiring Sales/Marketing roles → scaling, has budget
- 🔧 Hiring DevOps/Cloud Engineers → infrastructure investment incoming
- 📈 Headcount growth > 20% in 90 days → expansion phase
- 💼 New C-level hire (CMO, CTO, VP Sales) → new budget owner, new priorities
- 📣 Job descriptions mentioning competitor tools → switching signal
- 🏆 Recent funding round mention in job posts → fresh cash to spend

---

## 🛠️ Apify Actors Used

> **Get your Apify API key here:** [https://www.apify.com?fpr=dx06p](https://www.apify.com?fpr=dx06p)

| Actor | ID | Purpose |
|---|---|---|
| LinkedIn Jobs Scraper | `curious_coder/linkedin-jobs-scraper` | Scrape job postings by company/keyword |
| LinkedIn Company Scraper | `anchor/linkedin-company-scraper` | Extract headcount, growth, funding info |
| Google News Scraper | `apify/google-news-scraper` | Detect funding rounds, press releases |
| LinkedIn Profile Scraper | `dev_fusion/linkedin-profile-scraper` | Find decision-makers + contact info |

---

## ⚙️ Workflow

```
INPUT: Target niche + location + ICP criteria
        ↓
STEP 1 — Scrape LinkedIn Jobs (last 30 days)
  └─ Filter by: hiring roles = buying signals
        ↓
STEP 2 — Scrape Company Profiles
  └─ Extract: headcount, growth %, tech stack, funding
        ↓
STEP 3 — Score each company (0–100 intent score)
  └─ Weighted signals → Hot / Warm / Cold
        ↓
STEP 4 — Find Decision Makers
  └─ CEO / VP Sales / CMO / CTO profiles + emails
        ↓
STEP 5 — Claude AI generates personalized outreach
  └─ Email + LinkedIn message referencing the exact signal
        ↓
OUTPUT: Scored lead list + ready-to-send messages (CSV / JSON / Notion / CRM)
```

---

## 📥 Inputs

```json
{
  "niche": "SaaS companies",
  "location": "France",
  "hiring_signals": ["Sales Manager", "Growth Hacker", "DevOps Engineer"],
  "min_employees": 10,
  "max_employees": 500,
  "days_lookback": 30,
  "max_companies": 50,
  "apify_token": "YOUR_APIFY_TOKEN",
  "output_format": "csv"
}
```

---

## 📤 Output Example

```json
{
  "companies": [
    {
      "name": "ScaleUp SAS",
      "website": "scaleup.fr",
      "linkedin_url": "linkedin.com/company/scaleup-sas",
      "headcount": 87,
      "growth_90d": "+34%",
      "intent_score": 91,
      "intent_label": "🔥 HOT",
      "signals_detected": [
        "Hiring VP Sales (posted 3 days ago)",
        "Hiring 4 SDRs simultaneously",
        "Job post mentions switching from HubSpot to Salesforce"
      ],
      "decision_makers": [
        {
          "name": "Marie Dupont",
          "title": "CEO",
          "linkedin": "linkedin.com/in/marie-dupont",
          "email": "m.dupont@scaleup.fr"
        }
      ],
      "ai_outreach": {
        "email_subject": "ScaleUp × [Votre outil] — timing parfait ?",
        "email_body": "Bonjour Marie, j'ai remarqué que ScaleUp recrute activement un VP Sales et 4 SDRs en ce moment...",
        "linkedin_message": "Marie, votre croissance de 34% en 90 jours est impressionnante..."
      }
    }
  ],
  "summary": {
    "total_companies_analyzed": 50,
    "hot_leads": 8,
    "warm_leads": 19,
    "cold_leads": 23,
    "run_date": "2025-02-28"
  }
}
```

---

## 🧠 Claude AI Prompt (Scoring + Outreach)

```
You are a B2B sales intelligence expert. 

Given this company data:
- Company: {{company_name}}
- Recent job postings: {{job_titles}}
- Headcount growth: {{growth_pct}}% in 90 days
- Signals detected: {{signals}}
- Target decision maker: {{dm_name}}, {{dm_title}}

1. Calculate an intent score from 0-100 based on the signals.
2. Label as: 🔥 HOT (80+), ⚡ WARM (50-79), ❄️ COLD (<50)
3. Write a personalized cold email (subject + 5 lines max) referencing 
   the MOST compelling signal.
4. Write a LinkedIn message (300 chars max) that feels human, not spammy.

Return valid JSON only.
```

---

## 💰 Cost Estimate (Apify Compute Units)

| Volume | Estimated CU | Apify Cost |
|---|---|---|
| 10 companies | ~15 CU | ~$0.15 |
| 50 companies | ~60 CU | ~$0.60 |
| 200 companies | ~220 CU | ~$2.20 |
| 1,000 companies | ~1,000 CU | ~$10 |

> 💡 **Start free:** Apify offers $5 free credits/month — enough to test 500 companies.  
> 👉 [Create your free Apify account here](https://www.apify.com?fpr=dx06p)

---

## 🚀 Setup Instructions

### 1. Get Your Apify API Token
1. Sign up at [https://www.apify.com?fpr=dx06p](https://www.apify.com?fpr=dx06p)
2. Go to **Settings → Integrations → API Token**
3. Copy your token

### 2. Configure the Skill
Paste your Apify token in the `apify_token` field when running the skill.

### 3. Define Your ICP
Specify your Ideal Customer Profile:
- Industry / niche
- Company size range
- Location
- Hiring roles that signal buying intent for YOUR product

### 4. Run & Export
Results are exported as **CSV, JSON, or pushed directly to Notion / Airtable / your CRM**.

---

## 🔗 Integrations

| Platform | Action |
|---|---|
| **Slack** | Alert when 🔥 HOT lead detected |
| **Notion** | Auto-populate leads database |
| **Airtable** | CRM-ready structured output |
| **HubSpot / Pipedrive** | Direct lead import via webhook |
| **Email** | Weekly digest of top signals |

---

## 📊 Competitive Advantage vs Existing Skills

| Feature | B2B Lead Gen (yours) | Google Maps (yours) | **This Skill** |
|---|---|---|---|
| Finds contact info | ✅ | ✅ | ✅ |
| Scores buying intent | ❌ | ❌ | ✅ |
| Detects timing signals | ❌ | ❌ | ✅ |
| AI-personalized outreach | ❌ | ❌ | ✅ |
| Tracks competitor mentions | ❌ | ❌ | ✅ |
| Monitors headcount growth | ❌ | ❌ | ✅ |

---

## ⚠️ Limitations & Best Practices

- LinkedIn may rate-limit heavy scraping → recommended max 200 companies/run
- Email accuracy: ~70-80% (cross-reference with Hunter.io for best results)  
- Re-run weekly on the same target list to catch new signals
- GDPR: Only use publicly available LinkedIn data, personalize responsibly

---

## 🏷️ Tags

`lead-generation` `sales-intelligence` `linkedin` `buying-signals` `b2b` `outreach` `apify` `intent-data` `prospecting` `crm-enrichment`

---

*Powered by [Apify](https://www.apify.com?fpr=dx06p) — The Web Scraping & Automation Platform*
