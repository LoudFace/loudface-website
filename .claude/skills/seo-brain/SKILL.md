---
name: seo-brain
description: Load LoudFace's SEO + AI search strategy brain. Run at the start of any SEO, AEO, content, or strategy session. Pulls the Notion strategy page + content calendar state + last 7 days of GSC trend data + (optionally) Peec brand visibility status, and returns a tight briefing on what's working and what's next. Use whenever the user asks "what's working?", "what should we ship next?", "what's the SEO state?", or kicks off content work.
---

# /seo-brain — Brain reload

Loads the canonical state of LoudFace's SEO + AI search strategy so the session has consistent context across every Claude instance (local CLI, Cloud, team members).

The Notion strategy page is the source of truth. The principles, working patterns, kill list, and content roadmap all live there. This command is a fast, structured way to pull that context plus current trend data without manually fetching each surface.

## What to do when invoked

The strategy page now stores volatile numbers in dedicated databases, not prose. Read the structured DBs for current state and the page for durable strategy. Run these fetches in parallel.

### Step 0: Session bootstrap (ALWAYS runs)

Three always-on reads:

0a. **Pending Commitments** (`collection://600eedcf-4ba8-4492-8a46-20b5b98e2d8d`) — fetch rows where `Status = Not started` OR `Status = In progress`. These are durable commitments from previous sessions that haven't been executed yet. Surface them at the very top of the brief (after the freshness alert if any). Without this read, verbal mid-conversation commitments vanish at session boundaries.

0b. **Data freshness check** — see the full check below. If any source is stale, the brief starts with a 🩺 row.

0c. **Session state file** — read `.claude/session-state.json` at the project root. Tells you: last session end time, last batch shipped, last commit, current sprint name + summary, next planned action, current infra version (audit logic version, pendingCommitmentsDb ID). Surface a one-line "resuming from" note in the brief if `currentSprint.summary` shows ongoing work. If the file is missing or older than 14 days, mention that the session is starting cold. Skills should UPDATE this file when finishing significant work — at minimum: lastBatch, lastSkillRun, lastCommit, nextPlannedAction.

### Step 0.5: Intent classification (route to the right load profile)

Before loading the full bundle, examine the user's actual question and pick ONE of five load profiles. This keeps context usage proportional to the task. The full bundle loads ~30-50KB; targeted profiles load 3-15KB.

| Profile | Triggered when user asks... | Load only |
|---|---|---|
| `audit` | "what's stale?", "what should we refresh?", "what needs updating?", "audit my content" | Sanity publishedDate + lastUpdated for all blog posts. Next.config.ts redirect map. Activity Log last 7 days. NOTHING else. |
| `briefing` (default) | "what's working?", "what's our SEO state?", "what should we ship next?", or any unspecific kickoff | Full bundle (Steps 1-7 below). |
| `draft prep` | "draft [piece]", "write [piece]", "help me with [calendar entry]" | The single Website Content entry + Patterns Registry row matching its pattern tag + 3-5 most relevant Thought Leadership KB insights. Strategy page narrative ONLY if user explicitly asks for direction. |
| `ship` | "ship [piece]", "publish [piece]", "/ship-content [piece]" | The single Website Content entry + voice rules (arnels-assistant). Pending Commitments check for any related rows. Nothing else. |
| `decision` | "are we on track?", "are we hitting [target]?", "what's the bet?", "what should we kill?" | Strategy page narrative + Targets + Daily Snapshots latest row. Skip patterns, prompt coverage, competitor landscape. |

If the user's intent is ambiguous, ask once: "Are you looking for a (1) general briefing, (2) audit of what's stale, (3) draft prep for a specific piece, (4) decision support, or (5) something else?" Default to `briefing` if no response.

When a profile is selected, the brief output explicitly says which profile was used so the user knows what was (and wasn't) loaded. Example: "Loaded under `audit` profile — strategy page and KB insights NOT loaded. Run `/seo-brain briefing` for the full picture."

### Step 1+ (load profile-specific subset of the following)

The full menu is below. Each profile reads only the subset specified in its row above. Don't load fetches outside the profile's scope unless the user follows up with a question requiring them.

**Always (under `briefing` profile only):**

1. **Notion strategy page** (the narrative — bet, principles, content roadmap, off-site, brand recovery)
   `mcp__dc92055b-00e7-4079-83af-5ca13d1804f9__notion-fetch` with `id: 347b63394d1080bb9d1cda4bcb1758b5`

2. **Daily Snapshots — latest row** (current GSC + Peec aggregate state, typed numeric fields)
   `mcp__dc92055b-00e7-4079-83af-5ca13d1804f9__notion-query-database-view` or `notion-fetch` on `collection://3dec2e5f-e8d2-4747-a3ba-b5510a9de981` sorted by `Captured at` desc, limit 1. **Written nightly by the `loudface-seo-sync` Notion Worker** (managed schema, deterministic TypeScript — no LLM in the write path). This is the canonical "current state" — never parse the strategy page prose for numbers, always read this DB row.

3. **Website Content database** (calendar state — Idea / Outline / Draft / Review / Published)
   `mcp__dc92055b-00e7-4079-83af-5ca13d1804f9__notion-fetch` with `id: collection://347b6339-4d10-806a-99b3-000b881621e5`

**Additional briefing-profile fetches (super-brain cascade):**

4. **Patterns Registry** (`collection://a6c661c7-aeb4-4fb5-ad0a-7962288366c1`) — pull all rows. Filter `Status = validated` for the current playbook. Apply anomaly-detection rules (see below) to surface review candidates in the brief output.

5. **Prompt Coverage** (`collection://869461d7-1eb2-4612-ae6e-f6f09bfcadd5`) — pull rows where `Coverage status` is `no LoudFace coverage` OR `covered but losing`, sorted by `Volume` descending. These are the prompts where buyers are asking and LoudFace is either invisible or being out-cited. Surface the top 3-5 in the brief.

6. **Competitor Landscape** (`collection://2452bdb6-7272-46f9-b5ac-e963901d9a51`) — pull top 10 rows by `Citations 30d`. Surface the top 5 competitor domains across all patterns. These are the domains that need to be on the radar for every `/serp-recon` and `/pattern-audit` going forward.

7. **Thought Leadership Knowledge Base** (`collection://5fad9e1a-d149-4ce6-b984-3e27aa430faf`) — pull all rows where `Status = Active`. This is the central repository of Arnel + team first-party insights, battle-tested opinions, and experience-grounded takes. Surface 3-5 insights most relevant to the user's current intent in the brief. **Every content draft MUST be grounded in entries from this DB** — never generate content from generic agency thinking when a relevant insight exists. If a draft would contradict an Active insight, stop and flag it. New insights surfaced during a session should be proposed as additions (let the user approve before writing).

**Conditional fetches (even within `briefing` profile, only load if the question warrants):**

8. **Cusp Pages** (`collection://436bed59-aecf-45ea-9e3b-ccadad09b8e3`) — when the user asks "what should I optimize next?" or "which page is highest-leverage?" Filter `Status = cusp`.

9. **Targets** (`collection://f212cbd0-1e4c-4fb9-af9e-ae371496d4ed`) — when the user asks "are we on track?" or anything about quarterly goals.

10. **Monthly AEO Snapshots** (`collection://9981f13f-1d87-4229-b91f-c26f54193d6b`) — when the user asks about month-over-month trends.

11. **Peec live data** — only if Daily Snapshots is stale (`Captured at` >24h old) AND the question hinges on current AI-search visibility. The Daily Snapshots row should be fresh — falling back to live Peec means the cron failed.

## What to return

### Data freshness check (FIRST step of every brain load)

Before assembling the briefing, run this 5-line health check. If any source is stale, surface a 🩺 row at the very top of the brief.

| Source | Stale threshold | What to flag |
|---|---|---|
| Daily Snapshots latest `Captured at` | > 36 hours | "Worker cron may be down — ran X hours ago" |
| Prompt Coverage latest `Last refreshed` | > 10 days | "Weekly refresh overdue — ran X days ago" |
| Competitor Landscape latest `Last refreshed` | > 10 days | "Weekly refresh overdue — ran X days ago" |
| Website Content `Last Refreshed` (sample 3 rows) | > 48 hours | "Per-post sync drift — sampled rows last refreshed X hours ago" |

If anything is stale, the brief starts with:

```
🩺 **Data freshness alert:** [list each stale source with how-old + recovery command]
```

Recovery commands the user can run if drift is real:
- Daily sync drift: `ntn workers sync trigger dailySnapshotsSync` (from the worker dir) — re-runs the whole chain
- Per-post metrics drift only: `ntn workers exec refreshCalendarMetrics -d '{"dryRun":false}'`
- Weekly DBs drift only: `ntn workers exec refreshPromptCoverage -d '{"dryRun":false}'` + `ntn workers exec refreshCompetitorLandscape -d '{"dryRun":false}'`

If everything is fresh, omit the 🩺 row entirely and proceed to the standard briefing.

A tight under-200-word briefing, structured as:

```
[🩺 Data freshness alert (only if stale, omit if everything is fresh)]

[📌 Pending commitments — only if any rows exist in Pending Commitments DB with Status = Not started or In progress. Format: "[Status] [Commitment] (Promised in: [Promised In Session])". List ALL pending rows, even if there are many — the user must know about durable outstanding work before any new work starts. If none exist, omit this section entirely.]

**Current state (from Daily Snapshots, captured <date>):**
- GSC 28d: X clicks · Y impressions · Z avg position
- Brand: "loudface" at position X.X
- Peec project-wide: X% visibility, sentiment Y, position-when-cited Z

**What's working (from Patterns Registry, validated patterns ranked by current evidence):**
- [top 2 validated patterns with their measured Peec citations]

⚠️ **Pattern review candidates** (auto-detected anomalies):
- [Any validated pattern where Posts tagged ≥ 3 AND Total Peec mentions = 0 — flagged as "investigate via /pattern-audit"]
- [Any pattern where Total impressions 7d > 1000 AND Total clicks 7d = 0 — "click-through gap"]
- If none, omit this section entirely.

🎯 **Highest-leverage prompts to target** (from Prompt Coverage):
- [top 3 prompts with Coverage status = "no LoudFace coverage" sorted by Volume desc]
- [top 2 prompts with Coverage status = "covered but losing" — closest to a flip]

🥊 **Competitor radar** (from Competitor Landscape, last 30d):
- [top 5 domains across all patterns, with total cite counts and which pattern they dominate]

🧠 **Active first-party insights** (from Thought Leadership KB, relevant to the user's intent):
- [3-5 insight titles, each one line. Full body should be cited when drafting content. Never generate against the grain of these without explicit user override.]

**Calendar next up:**
- [next 2-3 entries with their dates + status]

**Recently shipped:**
- [anything notable from the last week — Activity Log shows it]
```

Keep it tight. The point is a fast briefing, not a report. Skip sections that have no signal (e.g. if no anomalies, drop the ⚠️ section).

### Anomaly detection rules (auto-flag in brain output)

When loading the Patterns Registry rollups, automatically check each validated pattern row against these rules:

| Rule | Trigger | Severity | Recommended next step |
|---|---|---|---|
| Empty citation pattern | Posts tagged ≥ 3 AND Total Peec mentions = 0 over 7d | ⚠️ review | Run `/pattern-audit {pattern name}` to diagnose |
| Click-through gap | Total impressions 7d > 1000 AND Total clicks 7d = 0 | ⚠️ review | Audit titles + meta descriptions for the highest-imp pieces; consider `/pattern-audit` for competitor benchmark |
| Stale evidence | Last reviewed > 60 days ago AND status = validated | 💡 review | Re-audit; pattern evidence may be stale |
| Killed pattern still receiving impressions | Status = killed AND Total impressions 7d > 500 | 💡 review | Consider unkilling, OR audit which pages are leaking attention |

The first two are P0 anomalies — they mean the pattern is producing content but the content isn't winning either surface. Without auto-flagging, these stay hidden in the rollups indefinitely.

If a flagged pattern appears, suggest the natural next action in the brain output (don't run `/pattern-audit` automatically — the user decides which to investigate when).

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

- **Do not edit the strategy page prose** unless the user explicitly asks. The narrative (bet, principles, measurement framework, roadmap, off-site, brand recovery) is human-curated. This command is read-only on prose.
- **Do not rewrite the principles section** — that's Arnel's framing.
- **The databases ARE the source of truth for current state, not the prose.** Daily Snapshots (numbers), Patterns Registry (what's working), Cusp Pages (queue), Targets (KPIs), Monthly AEO Snapshots (trend). When answering "what's our position?" / "are we on track?" / "what should we optimize?" read from the DB rows, not from any narrative paragraph (which may be stale).
- **Auto-refreshed sections write themselves.** `/refresh-calendar` writes a new Daily Snapshots row nightly; `/peec-audit` writes a Monthly AEO Snapshots row monthly. Don't manually update those rows here.
- **Update the durable narrative when strategy shifts.** Add/promote/demote patterns in Patterns Registry, update Target rows when scope changes, edit the strategy page prose for changes to the bet, principles, or roadmap reasoning. Those are deliberate human edits — surface a recommendation, ask for approval, then edit.

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

## Refresh candidacy logic (mandatory 4-stage filter)

When the user asks "what's stale?", "what should we refresh?", "what content needs updating?", or any equivalent, do NOT use `lastUpdated` alone as the filter. `lastUpdated` gets bumped every time a piece is touched (including title patches, content refreshes, and field edits), which makes newly-shipped pieces and refreshed-yesterday pieces look identical.

A piece is a legitimate refresh candidate ONLY if ALL FOUR of these conditions are true:

1. **`publishedDate` is older than 30 days** — excludes freshly published pieces. Use Sanity field `publishedDate`, NOT `_createdAt` (which is uniformly the Sanity migration date for migrated content).
2. **`lastUpdated` is older than 30 days** — excludes pieces refreshed in the current sprint.
3. **The slug is not 301-redirected in `next.config.ts`** — already-merged URLs are out of scope; they exist in Sanity but the URL itself routes elsewhere.
4. **The slug is not in the Activity Log for the last 7 days** — belt-and-suspenders: if a session touched it but didn't bump `lastUpdated`, the Activity Log still knows.

Reference implementation: `scripts/audit-publication-dates-v2.mjs` in the loudface-website repo. If the user requests a stale-candidate list, run an equivalent of that query before proposing anything. NEVER produce a refresh list from naïve `lastUpdated`-only filtering — that's the failure mode that caused the May 2026 brand-overhaul incident.

When you complete a refresh, log it to Activity Log AND if it was a commitment from the Pending Commitments DB, update that row's `Status` to `Done`.

## Logging

After delivering the briefing, append one row to the **Activity Log** database (`collection://586eb325-8bfd-417d-8663-73cda77f8234`):
- Action: `Loaded brain — [1-line headline of what was current]`
- Skill: `seo-brain`
- Target: short context (e.g. "GSC last 7d + calendar state")
- Outcome: `Done`
- Notes: omit unless something notable happened (a surprising trend, a failed fetch)

## Changelog

Behavioral changes to this skill, most-recent-first. When you update the skill, add an entry here. `/seo-brain` should mention the latest 2-3 entries when surfacing the briefing if any are within the last 14 days — so users know what behavior is currently in play.

### 2026-05-16 (site-aware blog drafting)

- Added `scripts/site-inventory.mjs` — outputs every Sanity-published piece (blog posts, case studies, services, industries, SEO pages, team) + every static Next.js route on loudface.co. Runs in seconds, queried live (no caching).
- `/draft-content` skill gained **Step 4.5: Load site inventory** before drafting. The drafting agent now sees the full surface map and is required to ground every internal link in real URLs. No more hallucinated links to pages that don't exist.
- `/critique-content` skill gained **Pass 6: Internal-link validation**. Every internal link in the draft is checked against the inventory. Broken links flagged as 🚨 blockers; missed internal-link opportunities (service pages, case studies, industry pages, audit tool) flagged as ⚠️/💡 suggestions.
- Important gap surfaced by the inventory: Sanity has 18 industries (`industry` collection) but only 3 have shipped Next.js routes (`/seo-for/b2b`, `/seo-for/saas`, and the index). Drafting agents should ONLY link to routes that actually exist, not invent industry URLs.
- Sanity `serviceCategory` slugs (e.g. `seo-62e9c`, `branding-jvbsh`) are stale from the Webflow migration. The real service pages live at `/services/seo-aeo`, `/services/cro`, `/services/webflow`, `/services/copywriting`, `/services/ux-ui-design`, `/services/growth-autopilot` (Next.js static routes). Link to the Next.js routes; don't link to the Sanity-slug `/services/*-XXXXX` URLs.
- This change keeps the strategy blog-focused while making blog drafts site-aware. No expansion of the brain's intelligence layer.

### 2026-05-16 (official Notion plugin installed)

- Installed `makenotion/claude-code-notion-plugin` (notion-workspace-plugin@notion-plugin-marketplace, v0.1.0) at user scope. Adds 6 skills (`/Notion:find`, `/Notion:search`, `/Notion:create-page`, `/Notion:create-database-row`, `/Notion:create-task`, `/Notion:database-query`) + the official Notion MCP server. Always-on cost: ~217 tokens per session.
- For repetitive Notion operations (create a page in a known database, query a database by name, create a task row), prefer the plugin's slash commands over hand-rolling notion-* MCP calls — they're more idiomatic and lower-token.
- The existing Notion MCP we've been using all session still works; the plugin's MCP is the official `https://mcp.notion.com/mcp` endpoint. If sessions show duplicate Notion tools, the user can disable the older one via `claude plugin disable` or the MCP settings.

### 2026-05-16 (Notion content-authoring pattern — clickable links)

- **Important pattern learned the hard way.** Inside Notion callout blocks, markdown link syntax `[text](url)` is stored as literal text — NOT converted to clickable rich-text links. Result: users see the raw markdown in the UI, not a click target. The canonical Notion way to add clickable in-page references is the `<mention-page url="..."/>` tag (self-closing) or `<mention-page url="...">Custom Label</mention-page>` (with override). Notion auto-fetches the page title and icon. Works inside callouts, paragraphs, bullet lists, etc.
- When authoring Notion content with the MCP, use `<mention-page>` for any link to a Notion page OR database. Use markdown `[text](url)` only for external URLs.
- The brain page's "📍 Jump to" navigation callout was rebuilt with `<mention-page>` tags after Arnel pointed out the markdown links weren't clickable. Now every link in the nav is a proper Notion mention with icon + title.

### 2026-05-16 (page restructure — no skill behavior change)

- Notion brain page restructured into 5 sections grouped by reading frequency: Live state (Targets + Daily snapshot + Pending Commitments) → Content operations (Website Content + Patterns Registry + Cusp Pages) → Intelligence (KB + Prompt Coverage + Competitor Landscape) → Strategy (the bet + principles + measurement) → History databases (Activity Log + Infra & Decisions Log + Monthly AEO Snapshots) → Reference sub-pages.
- Tactical content (Tier 0/1/2 priorities, next 5-piece cadence, off-site experiments, brand SERP recovery) moved to a new sub-page: Content Roadmap (page id `362b63394d1081cf82fde48fbf90aed9`).
- "Where to look for X" observability table removed from brain page — already lives on Content Loop Reference sub-page.
- All 12 collection IDs unchanged, all schemas unchanged. Skill reads work without modification.
- Multi-source database rejected as the wrong tool: our 12 DBs have near-zero column overlap (Activity Log vs Daily Snapshots vs KB Insights) so unifying them would create useless views AND would break collection-ID-based reads.

### 2026-05-16 (Day 3 — context scoping + session state)

- Added Step 0.5 intent classification with five load profiles: `audit`, `briefing` (default), `draft prep`, `ship`, `decision`. Each profile loads only the subset of data sources relevant to that intent. Full bundle is now opt-in (under `briefing` only) rather than loaded by default for every invocation. Brief output now declares which profile was selected so users know what was loaded.
- Renamed section headers under the cascade to clarify they're briefing-profile-specific fetches. The "Always" framing was misleading once profiles existed.
- Added Step 0c: read `.claude/session-state.json` at session start. Surfaces a "resuming from" note when there's recent in-progress work. Skills are expected to UPDATE the file when finishing significant work (lastBatch, lastSkillRun, lastCommit, nextPlannedAction). Convention documented in CLAUDE.md "Session State File" section.

### 2026-05-16 (Day 1 — commitment surface + audit logic)

- Added Step 0: Pending Commitments DB read (`collection://600eedcf-4ba8-4492-8a46-20b5b98e2d8d`). Closes the "verbal commitments lost at session boundary" gap. Triggered by the brand-overhaul redirect incident (May 16, 2026).
- Added the 4-stage refresh-candidacy filter as the mandatory audit logic. `lastUpdated`-only filtering is now explicitly banned; the reference impl is `scripts/audit-publication-dates-v2.mjs`. Triggered by Arnel pushback on stale-candidate false positives during the batch 11-13 sprint.
- Added a `📌 Pending commitments` brief section between the freshness alert and the current-state block. Always surfaced when any rows are pending or in progress.
- Added this changelog section as a permanent convention.
