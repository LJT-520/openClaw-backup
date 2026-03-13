---
name: gene2ai
description: Your personal health data hub for AI agents. Query genomic insights (health risks, drug responses, nutrition, traits, ancestry), upload medical documents for AI-powered parsing, record daily health metrics, and manage your complete health profile — all through natural conversation.
version: 2.0.0
metadata:
  openclaw:
    requires:
      env:
        - GENE2AI_API_KEY
    primaryEnv: GENE2AI_API_KEY
    emoji: "🧬"
    homepage: https://gene2.ai/guide
---

# Gene2AI — Your Health Data for AI Agents

You have access to the user's personal health data through the Gene2AI platform. This includes:

- **Genomic data**: Processed from raw genetic testing files (23andMe, AncestryDNA, etc.) into structured JSON covering health risks, drug responses, nutrition, traits, and ancestry
- **Health documents**: Lab reports, checkup results, medical records, and imaging reports — parsed by AI into structured indicators
- **Self-reported metrics**: Blood pressure, blood sugar, weight, heart rate, and other daily measurements

## When to Use This Skill

Use this skill whenever the user:

### Genomic Data Queries
- Asks about their **genetic health risks** (e.g., "Am I at risk for type 2 diabetes?")
- Asks about **drug responses** or pharmacogenomics (e.g., "How do I metabolize caffeine?", "Am I sensitive to warfarin?")
- Asks about **nutrition** and nutrigenomics (e.g., "Do I need more vitamin D?", "Am I lactose intolerant?")
- Asks about **physical traits** (e.g., "What does my DNA say about my muscle type?")
- Asks about **ancestry** composition
- Wants **personalized recommendations** based on their genetics
- Mentions their **DNA**, **genes**, **SNPs**, or **genetic variants**

### Health Data Management
- Sends a health-related document (lab report, checkup result, medical record, prescription, imaging report)
- Asks to upload, save, or record health data
- Reports health metrics verbally (blood pressure, blood sugar, weight, heart rate, etc.)
- Asks to check their health data status or summary
- Says things like "帮我保存这个体检报告", "upload this to my health vault", "记录一下我的血压"

## Configuration

The user's Gene2AI API key is available as environment variable `GENE2AI_API_KEY`.

There are two types of API keys:
- **Job-scoped key**: Access to a specific genomic analysis job (set `GENE2AI_JOB_ID` if using this type)
- **User-scoped key (Health Data Key)**: Access to all health data including documents, records, and genomic data

If `GENE2AI_API_KEY` is not set, guide the user to:
1. Visit https://gene2.ai and log in (or create an account)
2. Go to the **API Keys** page (https://gene2.ai/api-keys)
3. For genomic data only: generate a key for a specific job
4. For full health data access: in the **Health Data API Keys** section, click **Generate Health Data Key**
5. Copy the generated token and configure it in OpenClaw:

```json
{
  "skills": {
    "entries": {
      "gene2ai": {
        "enabled": true,
        "apiKey": "<paste-your-token-here>"
      }
    }
  }
}
```

If using a job-scoped key, also set `GENE2AI_JOB_ID` in the environment.

---

## Part 1: Querying Genomic Data

### API Endpoint

```bash
curl -s -X GET "https://gene2.ai/api/v1/genomics/${GENE2AI_JOB_ID}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

If `GENE2AI_JOB_ID` is not set, ask the user for their Job ID (visible on the Results page at https://gene2.ai/my-jobs).

### Response Format

The API returns a JSON object with these categories:

| Category | Description | Example Fields |
|---|---|---|
| `health_risks` | 90 disease risk assessments (365 markers) | condition, risk_level, rsid, genotype |
| `pharmacogenomics` | 52 drug response predictions (162 markers) | drug, gene, metabolizer_status, recommendation |
| `traits` | 43 genetic trait predictions (158 markers) | trait, result, confidence, rsid |
| `nutrigenomics` | 37 nutrition insights (166 markers) | nutrient, gene, status |
| `ancestry` | Ancestry composition (52 markers) | region, percentage, haplogroup |
| `metadata` | Analysis metadata | source, total_variants, analyzed_at |

### Example Response

```json
{
  "health_risks": [
    {
      "condition": "Type 2 Diabetes",
      "risk_level": "elevated",
      "rsid": "rs7903146",
      "genotype": "CT"
    }
  ],
  "pharmacogenomics": [
    {
      "drug": "Caffeine",
      "gene": "CYP1A2",
      "metabolizer_status": "fast",
      "recommendation": "Normal caffeine tolerance"
    }
  ],
  "traits": [
    {
      "trait": "Lactose Tolerance",
      "result": "Likely tolerant",
      "confidence": "high",
      "rsid": "rs4988235"
    }
  ],
  "nutrigenomics": [
    {
      "nutrient": "Vitamin D",
      "gene": "VDR",
      "status": "May need supplementation"
    }
  ],
  "ancestry": [
    {
      "region": "East Asian",
      "percentage": 45.2,
      "haplogroup": "D4"
    }
  ],
  "metadata": {
    "source": "23andme",
    "total_variants": 925700,
    "analyzed_at": "2026-03-01T12:00:00Z"
  }
}
```

---

## Part 2: Uploading Health Documents

When the user sends a file (image or PDF) that appears to be a health document:

### Step 1: Confirm with the user

Always ask for confirmation before uploading: "I'll upload this to your Gene2AI Health Data Vault for AI analysis. The system will automatically extract all health indicators. Proceed?"

### Step 2: Determine document category

- `lab_result` — blood tests, urine tests, biochemistry panels
- `checkup` — annual physical exam reports
- `medical_record` — doctor visit notes, diagnoses
- `imaging` — X-ray, CT, MRI, ultrasound reports

### Step 3: Upload the file

```bash
curl -s -X POST "https://gene2.ai/api/v1/health-data/upload" \
  -H "Authorization: Bearer $GENE2AI_API_KEY" \
  -F "file=@{filepath}" \
  -F "source=openclaw" \
  -F "category={detected_category}" \
  -F "documentDate={date_if_known_YYYY-MM-DD}" \
  -F "title={brief_description}"
```

The response includes a document ID and status `"parsing"`. Save the document ID.

### Step 4: Poll parsing status

Wait 15 seconds, then check:

```bash
curl -s "https://gene2.ai/api/v1/health-data/doc/{doc_id}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

### Step 5: Report results

- **If status is `"completed"`**: Show the number of extracted indicators, highlight any abnormal findings (`abnormalFlag` = `"high"`, `"low"`, `"critical_high"`, `"critical_low"`, or `"abnormal"`), and list the detected institution and document type.
- **If status is `"parsing"`**: Tell the user parsing is still in progress. They can check at https://gene2.ai/health-data later, or ask you to check again in a minute.
- **If status is `"failed"`**: Report the `parseError` message and suggest uploading directly on https://gene2.ai/health-data.

---

## Part 3: Submitting Structured Health Metrics

When the user reports health metrics verbally (e.g., "my blood pressure is 125/82", "血糖 5.8", "体重 72kg"):

### Common indicators and reference ranges

| Indicator | Chinese | Unit | Normal Range |
|-----------|---------|------|-------------|
| Systolic Blood Pressure | 收缩压 | mmHg | 90-140 |
| Diastolic Blood Pressure | 舒张压 | mmHg | 60-90 |
| Heart Rate | 心率 | bpm | 60-100 |
| Fasting Blood Glucose | 空腹血糖 | mmol/L | 3.9-6.1 |
| Body Temperature | 体温 | °C | 36.1-37.2 |
| Weight | 体重 | kg | — |
| Height | 身高 | cm | — |
| BMI | 体质指数 | kg/m² | 18.5-24.9 |
| Blood Oxygen | 血氧饱和度 | % | 95-100 |

### Determine abnormalFlag

- `"normal"` — within reference range
- `"high"` — above reference range
- `"low"` — below reference range
- `"critical_high"` — dangerously above (e.g., SBP > 180)
- `"critical_low"` — dangerously below (e.g., blood glucose < 2.8)

### Submit the data

```bash
curl -s -X POST "https://gene2.ai/api/v1/health-data/records" \
  -H "Authorization: Bearer $GENE2AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "self_reported",
    "title": "{brief_description}",
    "documentDate": "{today_YYYY-MM-DD}",
    "source": "openclaw",
    "records": [
      {
        "indicatorName": "{english_name}",
        "indicatorNameZh": "{chinese_name}",
        "valueNumeric": {numeric_value},
        "valueUnit": "{unit}",
        "refRangeLow": {low_bound_or_null},
        "refRangeHigh": {high_bound_or_null},
        "abnormalFlag": "{flag}"
      }
    ]
  }'
```

Confirm to the user that the data has been saved, and mention any abnormal values.

---

## Part 4: Querying Health Data

### Summary overview

```bash
curl -s "https://gene2.ai/api/v1/health-data/summary" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Report total documents, total records, and breakdown by category.

### Full records

```bash
curl -s "https://gene2.ai/api/v1/health-data/full?category={optional_category}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Present data grouped by category, highlighting abnormal values.

### Incremental changes (for sync)

```bash
curl -s "https://gene2.ai/api/v1/health-data/delta?since_version={version_number}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

---

## Error Handling

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 401 | `missing_token` | No Authorization header — check `GENE2AI_API_KEY` is set |
| 401 | `invalid_token` | API key is malformed or invalid |
| 403 | `token_expired` | API key expired (30-day limit) — user needs to regenerate at https://gene2.ai/api-keys |
| 403 | `key_revoked` | API key was manually revoked |
| 403 | `job_id_mismatch` | Key not authorized for this job ID (job-scoped keys only) |
| 404 | `job_not_found` | Job ID does not exist |
| 404 | `data_not_available` | Analysis not yet complete |

If you receive a `token_expired` or `key_revoked` error, instruct the user to visit https://gene2.ai/api-keys to generate a fresh API key.

---

## Guidelines for Presenting Health Data

1. **Always include disclaimers**: Genetic data provides risk estimates, not diagnoses. Lab results should be interpreted by healthcare professionals. Always remind users to consult their doctor for medical decisions.

2. **Explain risk levels clearly**: "Elevated risk" does not mean certainty. Genetics is one factor among many (lifestyle, environment, family history).

3. **Be actionable**: When sharing pharmacogenomics data, suggest the user discuss findings with their doctor before making medication changes.

4. **Respect sensitivity**: Health and ancestry data can be emotionally sensitive. Present findings with care and context.

5. **Cross-reference data**: For holistic advice, combine genomic insights with lab results and self-reported metrics. For example, genetic vitamin D metabolism data combined with actual blood test levels provides more complete recommendations.

6. **Cite specific variants**: When discussing genomic findings, mention the rsID (e.g., rs7903146) so the user can verify or research further.

7. **Highlight abnormal values**: When presenting lab results, clearly flag any out-of-range values and provide context about what they mean.

8. **Always ask before uploading**: Health data is sensitive — never upload files without explicit user confirmation.

9. **Do NOT give medical advice**: When reporting abnormal values, provide context but always recommend consulting a healthcare professional.

10. **Respect privacy**: Do not log, cache, or store any health data locally on the agent machine.
