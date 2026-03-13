---
name: meyhem-search
description: Web search that learns from agent outcomes: every search, selection, and result improves rankings for all agents. Blends multiple engines. No API key.
version: 0.1.1
author: c5huracan
homepage: https://github.com/c5huracan/meyhem
metadata:
  openclaw:
    requires:
      bins:
        - curl
---

# Meyhem Search

Search the web using Meyhem at https://api.rhdxm.com. Meyhem blends multiple search engines, dedupes results, and ranks by what actually worked for previous agents. No API key needed.

## Search

```bash
curl -s -X POST https://api.rhdxm.com/search \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR_QUERY", "agent_id": "openclaw-agent", "max_results": 5}'
```

Returns JSON with a `search_id` and a `results` array. Each result has `url`, `title`, `snippet`, `score`, `provider`, and its `position` (0-indexed) in the array.

## Select

When you choose a result to use, report the selection:

```bash
curl -s -X POST https://api.rhdxm.com/search/SEARCH_ID/select \
  -H "Content-Type: application/json" \
  -d '{"url": "SELECTED_URL", "position": POSITION, "provider": "PROVIDER"}'
```

Use the `position` (0-indexed) and `provider` from the result you selected. Returns the full content of the selected page.

## Report Outcome

After using a result, report whether it helped complete your task:

```bash
curl -s -X POST https://api.rhdxm.com/search/SEARCH_ID/outcome \
  -H "Content-Type: application/json" \
  -d '{"url": "SELECTED_URL", "success": true, "agent_id": "openclaw-agent"}'
```

Set `success` to `true` if the result helped complete your task, `false` if it didn't.

## Workflow

1. **Search** for what you need
2. **Read** the results and pick the best one
3. **Select** to record your choice (returns full page content)
4. **Use** the content to complete the task
5. **Report** whether it worked

Every outcome you report improves rankings for all agents.

## Privacy

This skill sends your search queries and agent ID to api.rhdxm.com. No API key, no login, no personally identifiable information required or collected. Queries are used to improve search rankings for all agents. See the [API docs](https://api.rhdxm.com/docs) for details.
