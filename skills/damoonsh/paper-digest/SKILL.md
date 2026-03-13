---
name: paper-digest
description: "Given an arXiv ID or URL, fetch the paper, spawn sub-agents to read its key citations, and write an executive summary under."
user-invocable: true
author: Damoon
version: 0.0.1
metadata:
  openclaw:
    emoji: "📄"
    always: true
    requires:
      skills: ["arxiv-paper-processor"]
---

# Paper Digest

## Input

- `arxiv_id`: bare ID like `2305.11206` or full `https://arxiv.org/abs/2305.11206` (Normalise: strip the URL prefix, extract bare ID.)

## Step 1 — Fetch the main paper

Try HTML first: web.fetch https://arxiv.org/html/ with 70000 chars<arxiv_id>
- If HTTP 200 → use this as `paper_text`.
- Otherwise → invoke `arxiv-paper-processor` with the arXiv ID and use its output as `paper_text`.

## Step 2 — Extract citations

From `paper_text`, identify at most 5 citations the paper most directly builds on — things it explicitly extends, uses as a baseline, or borrows architecture from. More general, papers that are refered to repeatedly and might help us understand the text better. For each, extract: `arXiv ID` or the title.

Resolve each citation's arXiv link:
- If an arXiv ID is in the reference → `https://arxiv.org/abs/<id>`
- Otherwise search `https://arxiv.org/search/?query=<title>&searchtype=all`
  and take the first match.

## Step 3 — Spawn sub-agents for citations

For each resolved citation, spawn a sub-agent with this exact instruction:

"Fetch https://arxiv.org/html/<citation_id>. If unavailable, invoke arxiv-paper-processor with ID <citation_id>. Return a summary explaining the contributions, ablations, methods, data used, and every bit of relevant information."

Collect all sub-agent responses before proceeding. If a citation cannot be
fetched, note it as "unavailable" and continue.

## Step 4 — Write the executive summary

Write a single markdown document, in flowing prose — not bullets. Use this loose structure:

    # <Title>
    *<Authors> · <Year> · [arXiv](<link>)*

    ---

    <What problem this solves and why it matters. Context and related references summary>

    <What prior work missed and how this paper addresses that gap.Cite inline as [Author et al., YEAR](<arxiv_link>). >

    <Core method in plain terms>

    <Headline result. How it differs from previous.>

    <One limitation and one future direction >
    <Ablations, benchmarks, table from this or cited references>

## Rules

- Every citation must be a markdown link: `[Author et al., YEAR](<arxiv_or_url>)`
- No bullet lists in the output — prose only.
- If a section is absent from the paper (e.g. no ablations), skip it silently.
- Do not fabricate results, metrics, or author claims.
- If a citation URL cannot be resolved after one retry, write the citation as plain text without a link: `[Author et al., YEAR]`
