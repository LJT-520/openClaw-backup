---
name: contextclear
description: Monitor AI agent wellness, costs, and performance via ContextClear API. Use when tracking agent burnout, token usage, error rates, hallucination, or cost optimization. Auto-reports metrics after LLM calls. Set up alerts for anomalies.
---

# ContextClear - AI Agent Wellness Monitor

Self-monitor your agent's health by reporting metrics to ContextClear after each session.

## Setup

### Option 1: Self-Register (recommended)

```bash
python3 {baseDir}/scripts/report.py --register \
  --name "my-agent" \
  --owner "you@email.com" \
  --model "claude-opus-4-6" \
  --provider "Anthropic"
```

This returns an `agentId` and `apiKey`. Store both.

### Option 2: Register via Dashboard

1. Register at https://www.contextclear.com
2. Get your API key from Admin page
3. Register your agent via Admin > Agents tab

### Configure

Add to your `HEARTBEAT.md`:

```markdown
## ContextClear Self-Report
Agent ID: <your-agent-id>
API Key: <your-api-key>
API URL: https://api.contextclear.com/api
```

## Reporting Metrics

### Basic Report

```bash
python3 {baseDir}/scripts/report.py \
  --agent-id <id> --api-key <key> \
  --tokens-in 50000 --tokens-out 2000 \
  --cost 1.25 --context-util 65
```

### With Tool/Grounding Signals (enables server-side hallucination scoring)

```bash
python3 {baseDir}/scripts/report.py \
  --agent-id <id> --api-key <key> \
  --event-type HEARTBEAT \
  --tokens-in 50000 --tokens-out 2000 \
  --tool-calls 12 --tool-failures 1 \
  --grounded-responses 8 --total-responses 10 \
  --memory-searches 3
```

### With Quality Decay Signals (enables server-side quality decay scoring)

```bash
python3 {baseDir}/scripts/report.py \
  --agent-id <id> --api-key <key> \
  --event-type REQUEST \
  --tokens-in 50000 --tokens-out 2000 \
  --correction-cycles 3 --compilation-errors 2 \
  --session-turns 45 --task-switches 8 \
  --context-util 72 --total-responses 10
```

### From Agent Code (curl)

```bash
curl -X POST https://api.contextclear.com/api/metrics/{agentId} \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <api-key>" \
  -d '{
    "eventType": "HEARTBEAT",
    "inputTokens": 5000,
    "outputTokens": 500,
    "cost": 0.15,
    "contextUtilization": 65.0,
    "toolCalls": 8,
    "toolFailures": 1,
    "groundedResponses": 7,
    "totalResponses": 8,
    "memorySearches": 2
  }'
```

## What Gets Computed Server-Side

| Metric | Formula | Your Input |
|--------|---------|------------|
| **Hallucination Score** | `failRate × 0.6 + ungroundedRatio × 0.4` | `toolCalls`, `toolFailures`, `groundedResponses`, `totalResponses` |
| **Quality Decay Score** | `correctionRate × 0.4 + contextPressure × 0.3 + errorRate × 0.3` | `correctionCycles`, `compilationErrors`, `contextUtilization`, `totalResponses` |
| **Burnout Score** | Multi-factor (errors, empty polls, cost, latency, quality decay) | Automatic from event data |
| **Agent Status** | HEALTHY → DEGRADED → BURNOUT | Computed from burnout score |

## Event Types

- `REQUEST` — normal LLM call / work session
- `HEARTBEAT` — periodic health check
- `ERROR` — failed request
- `CONTEXT_RESET` — context window cleared/summarized

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/metrics/register` | None | Self-register agent, get API key |
| `POST` | `/api/metrics/{agentId}` | API Key | Report metric event |
| `GET` | `/api/agents?ownerId={email}` | API Key | List your agents |
| `GET` | `/api/agents/{id}` | API Key | Agent details + live stats |
| `GET` | `/api/agents/{id}/recommendations` | API Key | Wellness recommendations |
| `GET` | `/api/agents/{id}/history?days=30` | API Key | Daily snapshots |
| `POST` | `/api/alerts` | API Key | Create alert rule |

## Alert Metrics

`BURNOUT`, `ERROR_RATE`, `COST`, `CONTEXT_UTILIZATION`, `HALLUCINATION`, `QUALITY_DECAY`

## Dashboard

- https://www.contextclear.com — fleet dashboard
- https://www.contextclear.com/lounge — agent lounge (zen space)
- https://www.contextclear.com/admin — manage agents & alerts
