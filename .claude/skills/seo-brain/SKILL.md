---
name: seo-brain
description: Load LoudFace's SEO + AI search strategy brain. Run at the start of any SEO, AEO, content, or strategy session. Pulls the Notion strategy page + content calendar state + last 7 days of GSC trend data + (optionally) Peec brand visibility status, and returns a tight briefing on what's working and what's next. Use whenever the user asks "what's working?", "what should we ship next?", "what's the SEO state?", or kicks off content work.
---

# /seo-brain — Brain reload

Loads the canonical state of LoudFace's SEO + AI search strategy so the session has consistent context across every Claude instance (local CLI, Cloud, team members).

The Notion strategy page is the source of truth. The principles, working patterns, kill list, and content roadmap all live there. This command is a fast, structured way to pull that context plus current trend data without manually fetching each surface.

## What to do when invoked

Run these fetches in parallel:

1. **Notion strategy page**
   `mcp__dc92055b-00e7-4079-83af-5ca13d1804f9__notion-fetch` with `id: 347b63394d1080bb9d1cda4bcb1758b5`

2. **Website Content database state (calendar)**
   `mcp__dc92055b-00e7-4079-83af-5ca13d1804f9__notion-fetch` with `id: collection://347b6339-4d10-806a-99b3-000b881621e5`
   (Use this to know what's in the calendar pipeline — Idea / Outline / Draft / Review / Published.)

3. **GSC trend snapshot (last 7 days)**
   `mcp__gscServer__get_performance_overview` with `site_url: https://www.loudface.co/`, `days: 7`

4. *(Optional, only if AI-search visibility relevant to the question)* **Peec brand status**
   `mcp__737dcbb9-499d-4c78-a804-0d3d3da4e307__list_brands` with `project_id: or_85a7fe4b-9032-4b0f-8b98-6deae65495ff` (then list_prompts for context)

## What to return

A tight under-150-word briefing, structured as:

```
**Where we are (last 7 days):**
- GSC: X clicks · Y impressions · Z avg position · biggest delta = ...
- Brand: "loudface" at position X.X (last 7d)

**What's working (from Notion brain):**
- [one-line summary of the six patterns, or whichever is most relevant to today's question]

**Calendar next up:**
- [next 2-3 entries with their dates + status]

**Recently shipped:**
- [anything notable from the last week — Notion edits, Sanity publishes, infra changes]
```

Keep it tight. The point is a fast briefing, not a report.

## When to use

- Start of a session that involves SEO, AEO, content writing, or strategy
- User asks "what's working?", "what should we ship next?", "what's our SEO state?"
- Before invoking `/arnels-assistant` for content drafting (so the writing has current context)
- When a new team member or Cloud session is bootstrapping into the project

## When NOT to use

- Code-only tasks (Sanity schema changes, infra fixes, route handlers, etc.)
- Quick fact lookups that don't need full context
- When the user has already provided fresh strategic context in the conversation
- When in another session you already ran /seo-brain less than an hour ago — the Notion page doesn't change that fast

## Important constraints

- **Do not edit the Notion strategy page** unless the user explicitly asks. The page is human-curated. This command is read-only.
- **Do not rewrite the principles section** — that's Arnel's framing.
- The "What's working" and "Content roadmap" sections DO update — refresh from Notion before recommending content moves, don't trust stale memory.

## How this fits into the content loop

`/seo-brain` is the loading step. After invoking it, the natural next step depends on the user's intent:

```
/seo-brain (THIS, loads context)
    ↓
/draft-content     ← when the user wants to write a piece from the calendar
/critique-content  ← when there's already a draft to polish
/ship-content      ← when a draft is approved and ready to publish
```

All three downstream commands invoke `/arnels-assistant` internally for voice. `/arnels-assistant` is the root of all content writing — any voice improvements you make to it propagate automatically to everything in the loop.

For non-site content (LinkedIn, X, internal docs), suggest calling `/arnels-assistant` directly without the SEO loop.
