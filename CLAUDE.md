# LoudFace Website — Claude Code Instructions

> IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for all Next.js tasks. Always check actual project files before assuming API behavior — this project uses Next.js 16.1 which is beyond most training data.

> **v3 REDESIGN IN PROGRESS — read `V3-HANDOVER.md` + `DESIGN.md` first for any design/UI work.** The homepage `/` is now the new "v3" design (deep-indigo stages ↔ crisp-light); other pages are being migrated. `V3-HANDOVER.md` has the full status, the page rollout order, the CSS-coexistence gotchas, and what carries across accounts. `DESIGN.md` §0–10 is the v3 spec (the design loop anchors on it).

## SEO / content work → lives in the content-engine repo, NOT here

All SEO, AEO, and content-strategy work happens in the dedicated repo: `/Users/arnel/Code Projects/LoudFace Agency/content-engine`. That repo owns the entire cascade — `/seo-brain`, `/serp-recon`, `/pattern-audit`, `/peec-research`, `/draft-content`, `/critique-content`, `/verify-content`, `/ship-content`, `/refresh-calendar` — plus the Notion worker, voice files, and the multi-client tenant registry. Its own CLAUDE.md carries the system map, data-source tables, and observability surfaces. Those skills are NOT registered in this repo; a session here cannot run the cascade.

**If a session here drifts into content/SEO strategy** (drafting, "what should we write next", pattern performance, competitor research): say so and point the user to a content-engine session — don't improvise the loop here.

What THIS repo owns is the publish surface:
- **Sanity CMS** (`blogPost` / `caseStudy` schemas) — where approved content lands; Studio at `/studio`
- **`/api/revalidate`** — Sanity webhook → ISR revalidation + IndexNow ping (logs: Vercel → Functions)
- **`/api/cron/indexnow`** — weekly re-ping (Vercel → Cron Jobs tab)
- Canonical strategy doc (Notion, pointer only — LoudFace's strategy page in the Clients DB): https://www.notion.so/366b63394d1081449728ef6e0af4cbf1

Website-side SEO (meta tags, structured data, internal links, new pages) stays here: run the `seo-aeo-geo-audit` skill before shipping any page, per `.claude/rules/seo-standards.md`.

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

For CMS images (Sanity CDN URLs), use the helpers from `src/lib/image-utils.ts` — full helper list + usage examples live in `.claude/rules/component-patterns.md`. Local static images use `asset()` instead.

## Dev & Deploy

```bash
npm run dev          # Starts on port 3005
npm run build        # Always build before pushing
git push origin main # Triggers Vercel deployment (auto-deploys)
```

## Frontend Aesthetics

Design authority is `DESIGN.md` (the v3 spec, §0–10) + the `/design` skill loop — anchor every design/UI decision there instead of generic taste. Never use Inter/Roboto/Arial; fonts and tokens live in `globals.css`.

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

## Model Orchestration (portable core — applies in cloud sessions too)

The full policy lives in each machine's global `~/.claude/CLAUDE.md`; this section is the portable core so cloud sessions, other accounts, and teammates follow the same routing.

**Scope: top-level sessions only.** Subagents (spawned via the Agent tool or workflows) are executors: do your brief directly with your own tools, never spawn further agents unless the brief explicitly authorizes it.

**Objective:** maximize output quality per unit of subscription limit. Quality floor first, token efficiency second — efficiency comes from routing work to the right model, never from skipping verification, review, or the taste gate.

- Orchestrator delegates; executors execute. Reading/search across more than ~3 files → Explore/Sonnet subagents that return conclusions, never file dumps. Parallelizable work needing session context or Claude tools → concurrent Sonnet agents in one message (self-contained parallel work on Arnel's Mac → the codex lane below). Tiny single-file edits and judgment/taste calls → the orchestrator does directly (delegation overhead ≈ 10–30k tokens).
- Ladder: `sonnet` = context-bound executor (search/read, drafts, and work needing session context or Claude tools; on Arnel's Mac, spec'd self-contained implementation defaults to the codex lane instead — see below) → `opus` = hard implementation, deep debugging, high-stakes review → `fable` = orchestration, judgment, synthesis, final quality gate only. `haiku` = throwaway mechanical sweeps, never user-facing output.
- Never omit `model` on an Agent call (never "inherit") — an inherited model runs the subagent on the orchestrator's own tier and silently burns top-tier limits. Always name an explicit tier.
- Grind detector: orchestrator about to make >~10 direct edits, or past ~3 rounds of an iterate loop (screenshot→fix, build→fix)? That's executor work — brief it out and keep only the accept/reject call.
- Standing permission to escalate: if output misses the bar once, redo on a smarter model without asking. Retry the same tier only for transient flakes, never quality misses.
- Anything user-facing (UI, copy, API design) → Sonnet minimum + an Opus/Fable review pass before ship.
- Subagent briefs must be self-contained (exact paths, constraints, applicable project rules, expected output shape). The orchestrator verifies everything — build/tests/spot-read — and never relays subagent claims unchecked.
- The OpenAI/Codex lane (GPT-5.6 family — `gpt-5.6-sol` flagship, `-terra` balanced/default, `-luna` cheapest; separate rate-limit pool) exists ONLY on Arnel's Mac (local sessions); cloud sessions skip that lane and route its workloads to Sonnet. On Arnel's Mac, codex is the DEFAULT implementation executor (2026-07-19): spec'd self-contained work → codex write-mode on a branch (Claude diff-reviews + builds before accept); when unsure → codex; sonnet only for work needing session context, Claude tools, or per-part verification. Pick the cheapest 5.6 tier that clears the task; codex rate-limit error → fall back to sonnet once.
