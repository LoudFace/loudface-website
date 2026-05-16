# LoudFace Website — Claude Code Instructions

> IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for all Next.js tasks. Always check actual project files before assuming API behavior — this project uses Next.js 16.1 which is beyond most training data.

## SEO / AI Search Brain (source of truth)

The canonical strategy doc for LoudFace's SEO + AI search work lives in Notion:
**https://www.notion.so/loudface/AI-Search-SEO-Search-347b63394d1080bb9d1cda4bcb1758b5**

Before any SEO, AEO, content, or strategy work in this repo:
1. Fetch the page via `notion-fetch` (Notion MCP). It contains the Q2 2026 target, principles, the six working patterns (year-stamped listicles, AEO playbooks, X vs Y comparisons, industry pages, pricing intent, founder bylines), the kill list, content roadmap, and infrastructure inventory.
2. The embedded **Website Content database** (`collection://347b6339-4d10-806a-99b3-000b881621e5`) is the live content calendar. Status flow: `Idea → Outline → Draft → Review → Published`. Drafts live inside the database entries. Final content publishes to Sanity (`blogPost` / `caseStudy` schemas) when a row reaches "Published" status.

**Faster path:** run `/seo-brain` (skill at `.claude/skills/seo-brain/SKILL.md`). It loads the Notion strategy + content calendar + latest GSC overview + Peec status in one shot.

**Update strategy in the Notion page, not in local files.** Every Claude session, Cloud session, and team member starts from whatever is on that page. Local files (CLAUDE.md, memory) only hold pointers.

## Super-brain cascading architecture (CRITICAL — read first for any SEO/content/strategy work)

**The system is designed to cascade automatically. You do NOT wait for the user to type `/seo-brain` or `/pattern-audit` or `/serp-recon`. When the user says ANYTHING that touches SEO, AEO, content writing, content ideation, content strategy, or competitive analysis — even informally ("what should we write?", "let's brainstorm a piece", "is X working?", "explore Y as a topic") — you immediately run `/seo-brain` in the background to load the full context. From there, you reason about which skills to chain next and propose moves without making the user spell them out.**

The vision: an autonomous strategist that always has the full picture loaded, surfaces patterns the user can't see, and proposes the right next move before being asked.

**Critical: ground all content in the Thought Leadership KB.** Every content draft must be checked against the [Thought Leadership Knowledge Base](https://www.notion.so/f11ec4b74f184818925f302bb56e577b) (`collection://5fad9e1a-d149-4ce6-b984-3e27aa430faf`) BEFORE writing. This DB holds Arnel + team's first-party insights, battle-tested opinions, and contrarian takes from real client engagements. If a relevant Active insight exists, the draft must pull from it directly — not paraphrase generic agency thinking. If a draft would contradict an Active insight, stop and flag it before continuing. If a session surfaces a new insight (e.g. Arnel corrects an assumption mid-draft), propose adding it as a new KB entry before resuming the draft. This is the system-level fix for "AI agent invents generic agency-speak that doesn't match what LoudFace actually believes."

### Auto-cascade triggers (run `/seo-brain` silently, no confirmation needed)

The trigger is *intent*, not exact words. Fire on any of these:

| User says (anywhere in their message)... | Auto-fire |
|---|---|
| "draft", "write", "content piece", "blog post", "listicle", "comparison", "case study" | `/seo-brain` → propose next move |
| "what should we write/ship/draft next" | `/seo-brain` → recommend |
| "what's working", "what's the state", "what's our position" | `/seo-brain` → briefing |
| "is X working", "audit X", "investigate X", "why is X" | `/seo-brain` then likely `/pattern-audit X` |
| "research a topic", "competitor research", "what's ranking" | `/seo-brain` then `/serp-recon` |
| "brainstorm content", "content ideas", "calendar" | `/seo-brain` → surface coverage gaps + anomalies |
| Mentions a specific tracked prompt / topic | `/seo-brain` → check Prompt Coverage DB |

If you're not sure whether to cascade, cascade. The cost is one extra Notion fetch; the value is never flying blind.

### The skills available to the cascade (you decide when to invoke)

When `/seo-brain` surfaces a signal, chain the right tool without asking:

- **`/seo-brain`** — always the first step. Loads strategy + state + anomalies + coverage gaps + competitor landscape + calendar.
- **`/pattern-audit {pattern}`** — when seo-brain flags an anomaly (e.g. validated pattern with 0 citations despite N posts), OR when user questions a pattern's performance. Aggregates competitor citations across the pattern's prompts, identifies structural gaps, returns cut/hold/restructure options.
- **`/serp-recon {keyword}`** — before any new draft. Pulls page-1 + page-2 Google SERP + AI-cited URLs, computes structural differentials, returns "what to copy from winners."
- **`/peec-research {prompt}`** — when a piece targets a specific tracked prompt. Returns fan-out queries + current LoudFace visibility + competitor citation snippets.
- **`/draft-content {entry}`** — runs the full draft pipeline (loads /seo-brain + /arnels-assistant + /serp-recon + reads Required research from Pattern row).
- **`/critique-content {draft}`** — anti-slop + voice pass. Runs after draft, before ship.
- **`/verify-content {target}`** — fresh-subagent voice + claim verification. Hard gate before ship. Has a **Diff mode** for post-ship edits that add new claims.
- **`/ship-content {entry}`** — push to Sanity, status → Published. Sanity webhook → IndexNow auto-fires.
- **`/refresh-calendar`** — pulls latest GSC + Peec into the calendar. Runs nightly automatically.

### Data sources the super-brain reads (all programmatic — no manual triggers)

| Source | What it holds | Refresh cadence | Stale threshold | Recovery |
|---|---|---|---|---|
| AI Search & SEO Search page | Strategy, bet, principles, working patterns, kill list | Manual (Arnel-curated) | n/a | Editorial |
| Patterns Registry (`collection://a6c661c7-aeb4-4fb5-ad0a-7962288366c1`) | 6 patterns + rollups (Peec mentions, clicks, imps, posts) + Required research per pattern | Native Notion rollups (live); Required research manually curated | n/a | n/a |
| Website Content (`collection://347b6339-4d10-806a-99b3-000b881621e5`) | Calendar entries with per-post GSC + Peec metrics | Every 24h via `refreshCalendarMetrics` worker tool | > 48h | `ntn workers exec refreshCalendarMetrics -d '{"dryRun":false}'` |
| Daily Snapshots (`collection://3dec2e5f-e8d2-4747-a3ba-b5510a9de981`) | Aggregate project-wide GSC + Peec metrics, one row per day | Every 24h via `dailySnapshotsSync` (the cron) | > 36h | `ntn workers sync trigger dailySnapshotsSync` |
| Cusp Pages (`collection://436bed59-aecf-45ea-9e3b-ccadad09b8e3`) | Pages on the edge of top-10 (position 10–60, >1k imps) | Every 24h via `scanCuspPages` side effect | > 48h | `ntn workers exec scanCuspPages -d '{"dryRun":false}'` |
| Targets (`collection://f212cbd0-1e4c-4fb9-af9e-ae371496d4ed`) | Quarterly KPI targets with current value + status | Every 24h via `recomputeTargets` side effect | > 48h | `ntn workers exec recomputeTargets -d '{"dryRun":false}'` |
| **Prompt Coverage** (`collection://869461d7-1eb2-4612-ae6e-f6f09bfcadd5`) | Each tracked Peec prompt × LoudFace URLs targeting it × citation status | Every 7 days via weekly gate inside `dailySnapshotsSync` | > 10 days | `ntn workers exec refreshPromptCoverage -d '{"dryRun":false}'` |
| **Competitor Landscape** (`collection://2452bdb6-7272-46f9-b5ac-e963901d9a51`) | Top 15 competitor URLs per validated pattern with citation counts | Every 7 days via the same weekly gate | > 10 days | `ntn workers exec refreshCompetitorLandscape -d '{"dryRun":false}'` |
| **Thought Leadership KB** (`collection://5fad9e1a-d149-4ce6-b984-3e27aa430faf`) | First-party insights, battle-tested opinions, contrarian takes from Arnel + team. Source of truth for what LoudFace actually believes from real engagement experience. | Human-curated (Arnel + team add insights as they emerge in client work or content sessions) | n/a | Editorial — propose new entries when surfaced, never invent |
| Monthly AEO Snapshots (`collection://9981f13f-1d87-4229-b91f-c26f54193d6b`) | 30-day brand visibility deltas vs prior 30-day window | Monthly on the 1st at 9am UTC via Claude Cloud `/schedule` "peec-audit-monthly" routine | > 35 days | Manually run `/peec-audit` or re-arm the Cloud routine |
| Activity Log (`collection://586eb325-8bfd-417d-8663-73cda77f8234`) | Every loop step's cross-session audit trail | Event-driven (each skill writes its own row) | n/a | n/a |
| **Pending Commitments** (`collection://600eedcf-4ba8-4492-8a46-20b5b98e2d8d`) | Durable record of actions Claude committed to mid-conversation but hasn't yet executed. Closes the "verbal commitment lost at session boundary" gap. | Event-driven (write when committing, update when executing) | n/a (always check at session start) | Manual: surface `Status = Not started` rows in next `/seo-brain` load |

**How drift is caught:** `/seo-brain` runs a freshness check as Step 0 of every load. If any source is past its stale threshold, the brief starts with a 🩺 alert and the exact recovery command. Drift is visible from the moment a session begins — no silent decay.

**How outstanding commitments are surfaced:** `/seo-brain` also reads Pending Commitments at session start (before any briefing logic runs). Any row with `Status = Not started` or `In progress` is surfaced at the top of the brief. This prevents verbal commitments made mid-conversation from being lost when a session ends. When you complete a commitment, update its row to `Status = Done` — don't just rely on Activity Log.

**How the cron itself is monitored:** the worker is deployed to Notion's hosted runtime with `schedule: "1d"`. Notion handles execution. Status visible via `ntn workers sync status` from the worker directory. Recent runs via `ntn workers runs list`. If `dailySnapshotsSync` shows ERROR (3+ consecutive failures), the freshness alert in `/seo-brain` will catch it because Daily Snapshots won't have updated.

**Manual override path** (rare): every step has a `ntn workers exec <toolKey>` command. Used only when an automatic run fails and `/seo-brain` flags the staleness. The recovery commands are in the table above.

### The full content creation cascade

Every published piece on loudface.co flows through this chain. **`/arnels-assistant` is the root of all content writing** — every command below loads it internally, so voice improvements made to `/arnels-assistant` automatically propagate.

```
/seo-brain          load strategy + trends + anomalies + coverage gaps + competitor landscape + KB insights
     ↓              (auto-fires on any content/SEO/strategy intent; KB is non-skippable for content tasks)
[optional]
/pattern-audit      when an anomaly surfaces or pattern decision needed
     ↓
/serp-recon         page-1 + page-2 Google SERP + AI-cited URLs + structural diffs
     ↓
/peec-research      if piece targets a specific tracked prompt
     ↓
/draft-content      write into Notion calendar entry, grounded in KB insights (reads Required research from Pattern row + Active KB rows)
     ↓
/critique-content   anti-slop + voice pass (mechanical linter + arnels-assistant)
     ↓
/verify-content     fresh-subagent voice + claim verification (Full mode) — also checks draft does not contradict KB
     ↓
/ship-content       push to Sanity → IndexNow + revalidate auto-fire
     ↓
/verify-content     (Diff mode) if any post-ship patch adds new claims
     ↓
/refresh-calendar   nightly GSC + Peec writeback (runs automatically via worker)
```

To improve content quality across all future pieces: edit `/arnels-assistant` (banned words, tone rules, anti-slop checklist). Don't special-case voice fixes in downstream commands — they compose on top.

To improve content quality across all future pieces: edit `/arnels-assistant` (banned words, tone rules, anti-slop checklist). Don't special-case voice fixes in `/draft-content` or `/critique-content` — those compose on top. Centralize voice changes in one place so the loop stays clean.

The calendar becomes the dashboard once `/refresh-calendar` runs. Open the Website Content database in Notion → see GSC Clicks 7d, GSC Impressions 7d, GSC Position 7d, Peec Mentions, Last Refreshed for every Published row. Sort/filter on those columns to spot winners and losers without leaving Notion.

For one-off / non-site content (LinkedIn, X, internal docs), invoke `/arnels-assistant` directly without the SEO loop.

## Observability — where to look

Every meaningful loop step logs to the **Activity Log** database in Notion (`collection://586eb325-8bfd-417d-8663-73cda77f8234`, under the SEO brain page). That's the cross-session audit trail. For everything else, the surface map:

| To see... | Look at... |
|---|---|
| What content the loop has touched (cross-session) | Activity Log database in Notion |
| Pre-ship verification reports (voice + claims) | Activity Log database, rows tagged `critique-content` — full reports stay in the originating chat |
| Current calendar state (what's drafted, shipped, idea) | Website Content database in Notion |
| Per-post performance (GSC + Peec, last 7d) | Same Website Content database — the metric columns are refreshed nightly by `/refresh-calendar` |
| Strategy + working patterns + kill list | AI Search & SEO Search page in Notion |
| First-party insights, battle-tested opinions, contrarian takes (what LoudFace actually believes) | Thought Leadership Knowledge Base in Notion (`collection://5fad9e1a-d149-4ce6-b984-3e27aa430faf`) — content drafts must check this before writing |
| Sanity edits + publishes | /studio embedded Studio |
| Sanity webhook firings + revalidate logs | Vercel → loudface-website → Functions → `/api/revalidate` |
| IndexNow ping results | Same `/api/revalidate` logs (status field in JSON response) + `/api/cron/indexnow` for weekly |
| Cron runs | Vercel → Cron Jobs tab |
| Deploys + build logs | Vercel → Deployments |
| GSC trends (Google) | search.google.com/search-console |
| AI citation tracking (Peec) | app.peec.ai |
| Bing crawl status + URL inspection | bing.com/webmasters |
| Voice rule history (`arnels-assistant` edits) | `git log -- ~/.claude/skills/arnels-assistant/SKILL.md` |
| Cloudflare changes (zone settings, cache purges) | dash.cloudflare.com → loudface.co → Audit Log |
| Code change history | `git log` in the repo |

When something feels broken, the failure is almost always visible on one of these surfaces. Start with the Activity Log (was the step even attempted?), then drill into the specific surface.

## Session Protocol

Every session must follow this workflow. Skipping steps leads to duplicated components, broken imports, and inconsistent patterns.

### Before Writing Any Code

1. **Read `COMPONENTS.md`** — the component registry at the project root. It lists every reusable component, its props, and usage examples. Never recreate a pattern that already exists.
2. **Check the barrel exports** — all UI imports come from `@/components/ui`, never individual file paths.
3. **Check `globals.css`** if working with colors or tokens — the `@theme` block is the single source of truth for design tokens.

### Before Ending a Session

1. **Update `COMPONENTS.md`** if you added, removed, or changed any component's props or behavior. This file is the source of truth that future sessions rely on — if it falls out of date, agents start ignoring it.
2. **Run `npm run build`** to verify no regressions.
3. **Update memory files** if you learned something reusable about the codebase.

## Component System (CRITICAL)

The component system is what prevents every new session from rebuilding things that already exist. It only works if `COMPONENTS.md` stays current.

**Mandatory workflow:**
1. **Read `COMPONENTS.md` first** — before writing any UI markup, check what exists
2. **Use existing components** — never rebuild a pattern that's already in the registry
3. **Import from barrels only** — `import { Button, Badge, SectionContainer } from '@/components/ui'`
4. **Update `COMPONENTS.md` after changes** — any time you add, remove, or change a component's interface

See `.claude/rules/component-system.md` for the full enforcement rules and `.claude/rules/component-patterns.md` for code examples (page archetype, dark section recipe, carousel setup).

## Critical Rules (Will Break Production If Ignored)

### Skill Changelog Convention — When You Change a Skill, Add an Entry

Each skill's `SKILL.md` file has a `## Changelog` section at the bottom (added when the skill is first meaningfully changed). When you update a skill's behavior, ADD an entry dated when you made the change, most-recent-first, with one line per behavioral change.

The reason: future sessions read the skill markdown at invocation. Without a changelog, they don't know whether the skill they just loaded reflects yesterday's behavior or last quarter's. `/seo-brain` surfaces the last 2-3 changelog entries from its own SKILL.md when they're within the last 14 days, so users can see what changed.

**Don't retroactively add changelogs to skills that haven't been touched recently** — the convention is "add when you change." If a skill SKILL.md doesn't have a `## Changelog` section yet, the first behavioral change you make adds it.

### Session State File — `.claude/session-state.json`

Tracks the "where we are" pointer that survives across sessions. `/seo-brain` reads this at session start (Step 0c) and shows a "resuming from" note if there's recent in-progress work. Skills update it when finishing significant work — at minimum: `lastBatch`, `lastSkillRun`, `lastCommit`, `nextPlannedAction`. The schema is intentionally minimal; Pending Commitments + Activity Log carry the heavier per-action detail. See the file's `_doc` field for the schema description.

### Refresh Candidacy — Always Use the 4-Stage Filter, Never Just `lastUpdated`

When asked "what's stale?", "what should we refresh next?", "what content needs updating?", or any equivalent, do NOT filter by `lastUpdated` alone. That field gets bumped every time a piece is touched (title patches, content refreshes, single-field edits), which makes newly-shipped pieces and refreshed-yesterday pieces indistinguishable.

A piece is a legitimate refresh candidate ONLY when ALL FOUR of these conditions are true:

1. **`publishedDate` is older than 30 days** — excludes freshly published pieces. Use Sanity's `publishedDate` field, NOT `_createdAt` (which is the Sanity migration date for all migrated content and is therefore useless as a publication signal).
2. **`lastUpdated` is older than 30 days** — excludes pieces refreshed in the current sprint.
3. **The slug is not 301-redirected in `next.config.ts`** — already-merged URLs are out of scope; they exist in Sanity but the URL routes elsewhere.
4. **The slug is not in the Activity Log for the last 7 days** — belt-and-suspenders: if a session touched it but didn't bump `lastUpdated`, the Activity Log still knows.

Reference implementation: `scripts/audit-publication-dates-v2.mjs`. When a refresh-candidate list is requested, run an equivalent query before proposing anything. NEVER produce a list from naïve `lastUpdated`-only filtering — that's the failure mode that produced false-positive refresh proposals during the May 2026 content sprint (Arnel caught me proposing pieces I had shipped that morning).

When a refresh completes, log it to Activity Log AND if it was a Pending Commitments row, update that row's `Status` to `Done`.

### CMS Data Fetching — Never Silently Swallow Errors

CMS data fetch failures must **fail the build**, not render empty pages. A failed Vercel build keeps the previous working deployment live. A silent failure deploys a broken site.

- **`fetchHomepageData()` is resilient** — fetches all collections via GROQ in parallel, returns partial data on failure. It never throws.
- **`assertCmsData(data)` is the guardrail** — call it in the homepage `page.tsx` (and any other page where empty CMS data is unacceptable). It throws `CmsDataError` if case studies AND blog posts are both empty, failing the build.
- **If adding a new page that fetches CMS data:** call `assertCmsData()` only if the page is broken without CMS data (e.g., homepage). Other pages (blog, services, case studies) should degrade gracefully with partial data.
- The architecture: **data layer is resilient, page layer decides strictness.**

### Static Image Paths

Use `asset()` from `@/lib/assets` for all hardcoded image paths. This normalizes the path (ensures leading slash) and keeps all asset references going through one place.

- **Static image paths** → Use `asset()` from `@/lib/assets`
- **Internal navigation** → Use `<Link>` from `next/link`
- **External/CMS image URLs** → Use as-is, do NOT wrap with `asset()`

```tsx
import { asset } from '@/lib/assets';
<img src={asset('/images/logo.svg')} />
<Link href="/work">Our Work</Link>
```

### Next.js 16 Gotchas

- `params` in dynamic routes is a **Promise** — must be awaited: `const { slug } = await params;`
- Use `generateMetadata` for SEO on dynamic pages
- Do not use deprecated Next.js patterns (getServerSideProps, getStaticProps, etc.)

### Tailwind CSS v4

- **No `tailwind.config.ts`** — this project uses pure Tailwind v4 CSS-native config. All tokens live in the `@theme` block inside `globals.css`. There is no JS config file.
- Use project color tokens (`primary-*`, `surface-*`, `success`, `warning`, `error`, `info`) — never default Tailwind colors like `gray-*` or `indigo-*`
- Follow the text color hierarchy in `.claude/rules/styling.md` — don't freestyle text colors
- Check `globals.css` for available tokens before adding new ones
- Never use `styled-jsx` — Tailwind only

## Project Structure (Where to Find Things)

| What | Where |
|---|---|
| **Component registry** | **`COMPONENTS.md`** (read this first) |
| Component rules & enforcement | `.claude/rules/component-system.md` |
| Component patterns, page archetype, dark sections | `.claude/rules/component-patterns.md` |
| Text color hierarchy, spacing, styling tokens | `.claude/rules/styling.md` |
| SEO standards | `.claude/rules/seo-standards.md` |
| Design tokens (single source) | `src/app/globals.css` (`@theme` block) |
| UI primitives | `src/components/ui/` |
| Page sections | `src/components/sections/` |
| Sanity CMS schemas | `src/sanity/schemas/` |
| Sanity client config | `src/lib/sanity.client.ts` |
| Sanity Studio | `src/app/studio/[[...tool]]/` (visit `/studio`) |
| CMS data fetching (GROQ) | `src/lib/cms-data.ts` |
| TypeScript types | `src/lib/types.ts` |
| Static text content | `src/data/content/*.json` |
| Content getter functions | `src/lib/content-utils.ts` |
| Asset URL utility | `src/lib/assets.ts` |
| CMS image optimization (Sanity CDN) | `src/lib/image-utils.ts` |
| Color contrast utilities | `src/lib/color-utils.ts` |

## CMS Collections (Sanity)

| Collection | Sanity Type | API Route |
|---|---|---|
| Blog | `blogPost` | `/api/cms/blog` |
| Case Studies | `caseStudy` | `/api/cms/case-studies` |
| Testimonials | `testimonial` | `/api/cms/testimonials` |
| Clients | `client` | `/api/cms/clients` |
| Blog FAQ | `blogFaq` | `/api/cms/blog-faq` |
| Team Members | `teamMember` | `/api/cms/team-members` |
| Technologies | `technology` | `/api/cms/technologies` |
| Categories | `category` | `/api/cms/categories` |
| Industries | `industry` | `/api/cms/industries` |
| Service Categories | `serviceCategory` | `/api/cms/service-categories` |
| SEO Pages | `seoPage` | `/api/cms/seo-pages` |

Schemas live in `src/sanity/schemas/`. To add a new collection, create a schema file, add it to the barrel in `schemas/index.ts`, and add a projection + COLLECTION_TO_TYPE entry in `cms-data.ts`.

## Key Patterns

### Server vs Client Components

Default is Server Component. Only add `'use client'` when you need interactivity, hooks, or browser APIs.

### CMS Data

- Uses **Sanity CMS** with GROQ queries. Project ID: `xjjjqhgt`, dataset: `production`.
- **Server Components**: Fetch via `src/lib/cms-data.ts` — GROQ projections return data in kebab-case to match existing TypeScript interfaces.
- **API routes** at `src/app/api/cms/[collection]/route.ts` proxy through the same GROQ queries.
- **Sanity Studio** embedded at `/studio` for content editing.
- Rich text is stored as raw HTML strings (not Portable Text) for backward compatibility.
- Images are on Sanity CDN (`cdn.sanity.io`) — GROQ projects them as `{ url, alt }` matching the `CmsImage` type.

### Static Content

Text content lives in JSON files under `src/data/content/`. Access via getter functions in `src/lib/content-utils.ts`. Use `dangerouslySetInnerHTML` only when HTML content is genuinely expected (CMS content, JSON with `<br>` tags).

### Cal.com Booking

The booking modal is opened by `CalHandler.tsx`, which intercepts clicks on:
- `Button` component with `calTrigger` prop (preferred — sets `data-cal-trigger` automatically)
- Elements with `data-cal-trigger` attribute
- Links with `href="#book-modal"`
- Elements with `.btn-cta` class

### Color Contrast

For dynamic backgrounds (CMS brand colors), use utilities from `src/lib/color-utils.ts`:
- `getContrastColors(bgColor)` — returns `{ textColor, mode, overlayColor }` (hue-matched, WCAG AA)
- `getContrastColor(bgColor)` — returns `'white'` or `'var(--color-surface-950)'` (simple)

Never inline color math — always use these shared utilities.

### CMS Image Optimization

For CMS images (Sanity CDN URLs), use helpers from `src/lib/image-utils.ts` — they append Sanity CDN transform params (`?w=800&q=80&fm=webp`):
- `thumbnailImage(url)` — card grids (800px)
- `logoImage(url)` — client logos (300px, original format)
- `avatarImage(url)` — profile pictures (80px)
- `heroImage(url)` — returns `{ src, srcset }` for responsive hero images
- `caseStudyThumbnail(url)` — returns `{ src, srcset }` for case study cards
- `optimizeImage(url, width)` — custom width

Only for remote CMS URLs — local static images use `asset()` instead.

## Dev & Deploy

```bash
npm run dev          # Starts on port 3005
npm run build        # Always build before pushing
git push origin main # Triggers Vercel deployment (auto-deploys)
```

## Frontend Aesthetics

You tend to converge toward generic "AI slop" aesthetics. Avoid this.
- Typography: Never use Inter, Roboto, Arial. Use distinctive fonts from Google Fonts.
- Color: Commit to a cohesive aesthetic. Dominant colors with sharp accents, not timid evenly-distributed palettes.
- Motion: Use animations and micro-interactions. Staggered reveals on page load.
- Backgrounds: Create depth with layered gradients and patterns, not solid colors.
- Avoid purple gradients on white backgrounds, cookie-cutter layouts.
Think outside the box. Make unexpected choices.

## Sanity Studio

Embedded at `/studio` — a full-featured CMS editor for all content. Schemas are in `src/sanity/schemas/`. Config at `sanity.config.ts`.

# DataForSEO MCP Profiles

You have access to multiple DataForSEO MCP configurations. Only ONE should be active at a time to avoid context overflow.

## Available profiles:
- **dfs-research**: KEYWORDS_DATA, DATAFORSEO_LABS, SERP — use for keyword research, competitor keywords, domain overview, SERP analysis
- **dfs-audit**: ONPAGE, BACKLINKS, DOMAIN_ANALYTICS — use for technical audits, backlink analysis, site crawling
- **dfs-content**: CONTENT_ANALYSIS, AI_OPTIMIZATION — use for brand monitoring, sentiment analysis, AEO optimization

## Rules:
1. Before starting any SEO task, identify which profile is needed
2. Check which MCP is currently active using /mcp
3. If the wrong profile is active, tell me to switch before proceeding
4. Never try to use tools from a disabled profile

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
