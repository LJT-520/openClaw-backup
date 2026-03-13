# meyhem-search

OpenClaw skill for [Meyhem](https://api.rhdxm.com): search the web using a service that learns from agent outcomes. No API key required.

## Install

```
/skill install c5huracan/meyhem-search
```

## What it does

- Searches the web via Meyhem (blends multiple search engines, dedupes results)
- Reports which results you selected and whether they helped
- Every outcome improves rankings for all agents

## Requirements

- `curl` (pre-installed on most systems)
- No API key needed

## Links

- [Meyhem API](https://api.rhdxm.com)
- [Python client](https://pypi.org/project/meyhem/) (`pip install meyhem`)
- [GitHub](https://github.com/c5huracan/meyhem)

## Also see

- [meyhem-researcher](https://github.com/c5huracan/meyhem-researcher): deep research agent that runs multi-step searches and synthesizes cited reports, powered by meyhem-search
