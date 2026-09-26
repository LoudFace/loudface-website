# LoudFace Website — Project Instructions

spine-client: loudface

> IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for all Next.js tasks. Always check actual project files before assuming API behavior — this project uses Next.js 16.1 which is beyond most training data.

> **v11 REDESIGN IN PROGRESS — read `DESIGN.md` first for any design/UI work: §2 "The look" says how every page must look, §9 is the gate a page passes before Arnel sees it.** Arnel approved v11 on 2026-09-24 via the homepage preview `/dev-preview/home-v11` (source `src/app/home-v11/*`, the reference build); every page migrates to it. The v3 spec and handover are archived in `docs/archive/` (history only; what still holds was carried into DESIGN.md). **Paper is the source of truth:** every page is designed on a board in the Paper file "LoudFace Website · v11" (`01M3ETYS4QMXF7CYH0VHZWF7J3`; pages "Desktop · v11", "Phone · v11", "Design system · v11") and approved there before any code. The earlier file "LoudFace Website" keeps the history, the "The look" board and Arnel's comments; it hit Paper's size limit on 2026-09-26, so add nothing to it; a local build is never the design deliverable. Check before starting a page: does its approved Paper board exist? If not, the Paper board is the task. Every page composes from the v11 component library (DESIGN.md §7; tokens and the "Design system · v11" page in Paper; the development handoff is `docs/v11-handoff.md`); a new part joins the library before a page uses it. Ledger (newest first): 2026-09-27 · Arnel could not find the menu boards and asked twice why we were "all of a sudden designing in this new random file". Root cause: on 2026-09-26 Paper refused more changes to "LoudFace Website" ("Your file is too large … Please start a new file"), I moved all v11 work to a new file, and I reported it in one line of a long wrap instead of as its own decision; the next day I told him I had never mentioned it, without reading the record. Check before presenting any board: name the file and page it sits on and give the page link; a move to a new Paper file gets its own short message the moment it happens; read the session record before saying what was or was not said. 2026-09-25 · Pricing v2, built to the new DESIGN.md §2, lost to pricing v1 ("Pricing V1 was most definitely the better design"). Root cause: I wrote §2 around a measured proxy (photos as ≥35% of section area) and a blanket ban on drawn UI, then optimised the page for the proxy; v2's device photos decorated, v1's plan boards and step cards explained the offer. Check before presenting a page: for each section, say what a visitor learns from its picture alone (DESIGN.md §2.1, §2.7); a metric is a diagnostic, never the goal. 2026-09-25 · Pricing, services hub, case studies index and blog drifted from the homepage into a "juvenile … weird, playful" style ("the further we go away from the homepage, the worse the designs become"). Root cause: I read "give each page its own picture" as "invent a new drawn gadget per section" (price seal, receipts, paper sheets, mini boards, pastel tints on every card) instead of extending the homepage's own grammar: one photography series of real devices on saturated backdrops, real charts, real people, few large elements. Check before presenting a page: DESIGN.md §6 "The homepage's asset grammar". 2026-09-25 · About v1 opened on the same indigo photographed stage as the homepage, the services and the case studies, and showed the four portraits twice ("lackluster … too uniform across all the pages … tiring to look at the same purple hero section"). Root cause: I treated the v11 stage as the default hero for every page instead of giving each page type its own ground and picture. Check before presenting a hero: set it beside the heroes of the pages already designed (DESIGN.md §6). 2026-09-25 · Case study hero option A reused the homepage's phone photo with a new screen ("you just copied the hero homepage … completely dropped the ball in terms of creativity"); only option B for Genie (the result drawn on the photographed stage) was kept. Root cause: I read "the homepage works because of the image" as "use the homepage's image" instead of "give this hero its own asset of that quality". Check before presenting a hero: it must not reuse another page's hero picture. 2026-09-25 · The v2 case study boards lost their chart pins in Paper, buried the charts in captions and figure text, let the article run into the next section, and sat the footer ratings flush on the brand plate ("it feels like you're almost rushy or sloppy with these other pages"). Root cause: I judged the browser build and never checked the imported Paper board section by section, and I skipped the Mobbin harvest and reference compare for inner pages. Check before presenting a board: screenshot every section of the Paper board itself, and set its chart section beside the named reference. 2026-09-24 · The first v11 case study boards (Genie Teacher, Dimer Health) were "objectively worse than the current ones … lazy and sloppy". Root cause: I built the template in one pass from the data model and never set it beside the live page, so the live chart board, the published-result sidebar and the CTA card were dropped, the charts shrank into half-empty cells, and the summary was clamped. 2026-09-24 · I designed /services/ai-overviews as a service board although its body is a 2,245-word article ("is that really a service page, or is it a blog article?"). Root cause: I carried over the v3 config's page type without checking whether the content fit it. 2026-09-24 · Services board 3 was on brand but "lackluster" next to the homepage: too little real proof (no live charts, no client voice) and I had rewritten the page's existing copy. Root cause: I matched the style but not the density of real proof, and treated a redesign as a rewrite. 2026-09-24 · Services draft 1 used a browser screenshot hero and text-only sections ("looks very different from the homepage"); draft 2 reused the homepage's hero rail, bento and testimonials wholesale ("you just copied the homepage"). Root cause: I treated "same style" as either new components or the same components, instead of the same visual language (DESIGN.md v11 §6) applied to page-specific content. 2026-09-24 · Arnel said "redesign all pages … inside of Paper"; I read it as "instead of Paper" and built the services template in local dev first. Root cause: I acted on an ambiguous word instead of the documented Paper-first lane.

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

### Static Content and the client inline editor — read before adding a page

Text content lives in JSON files under `src/data/content/`, one per page, read through the async getters in `src/lib/content-utils.ts`. Metadata reads `rawContent()`. Use `dangerouslySetInnerHTML` only when HTML content is genuinely expected (CMS content, JSON with `<br>` tags).

This site runs the client inline editor, live since 2026-09-17: a signed-in editor clicks text on the page, publishes, one commit lands on `main` in their name, and a light turns green once the public page carries the words. The rules that keep it working live in the `site-engineering` skill, `references/inline-editor.md`, section "Rules for every teammate and agent adding a page or content". Read them before adding a page, a content file or a key. The short form:

- Copy goes in JSON, never in a component. Keys are `[A-Za-z0-9_]`; never `name`, `id`, `slug`, or an attribute name (`alt`, `ariaLabel`, `placeholder`, `tooltip`); those are never editable.
- Never transform a content value in a component (`split`, `slice`, `toUpperCase`, `===`); shape it in the JSON.
- An article body is edited by sentence: the container carries `data-lf-body=""` and nothing else. No page carries editing code; the editor finds values by reading the page.
- Before pushing a page change: `npm run test:editor` and `node scripts/inline-edit-coverage.mjs <the routes you touched>`.
- Editors are the addresses in `LF_EDITOR_EMAILS` on Vercel. When someone says it is broken, open `/api/lf-edit/health` while signed in before reading env vars.

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
- `getTintColors(color)` — returns `{ base, glow, clear, solid }`: a pale ground and a soft glow from a client's brand colour (the case study hero panel)

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

**Before presenting ANY design change to a page — including a reorder or a copy pass —
write the asset plan: every section listed with the non-DOM asset it carries and the named
reference tile it is designed against.** Text, boxes, buttons and tinted cards are DOM. A
section with an empty asset column is not built yet; two DOM-only sections in a row fail
the page. Audit again after building and put the per-section asset list in the reply.
(2026-09-16: homepage v6 shipped a reorder with four asset-less sections and was rejected
as "a very thin upgrade"; `src/app/home-v3/instruments/` already held five drawn
instruments — SystemStages, ResultsInstrument, AnswerReadout, ProcessArtifacts,
SystemMatrix — that the live homepage still does not use. Check there first.)
Full gate and vocabulary: `~/.agents/reference/design-visual-assets.md`.

Design authority is `DESIGN.md` (v11) + the `/design` skill loop; anchor every design/UI decision there instead of generic taste. Tokens for v11 pages live in `src/app/home-v11/home-v11.css`; `globals.css` holds the legacy Tailwind tokens.

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

## Proposals (`/p/<token>`) — the body is about the client, not about us

A proposal body opens with the client's own data and closes with the price. Every section starts from their situation (the standing report, the call notes) and then says what we do about it. Our process, our week, our proof are supporting material: proof lives in the sticky rail, process gets one plate. Price tiers run high to low, the recommended tier last; never discount unprompted.

**Forecast blocks show quantity per paid month.** Leads per month, month by month. Never totals over a term, never cost per lead, unless Arnel asks. Every ramp and rate assumption prints on the page.

**One idea, one control, one picture.** An interactive block gets at most two inputs and ONE chart that adapts. Anything else is a printed assumption, not a control. Supporting facts get one line, never a list of six rows or a second grid of tiles. If a block needs a paragraph to explain how to read it, the block is wrong.

**Check before shipping a proposal body:** count the sections. If more than one third are about LoudFace (how we work, what we produced elsewhere), the body fails. Each remaining section must name a number from the client's report.

**Ledger of misses**
- 2026-09-05 · First forecast build shipped 3 sliders, 2 big numbers, 6 month tiles and 2 assumption paragraphs in one block. Arnel: "an absolute mess". Root cause: I added a control and a readout for every variable instead of choosing the single picture that answers the question.
- 2026-09-05 · Forecast tile changed twice (12-month total, then cost per lead) before landing on leads per month. Root cause: I substituted my own summary metric instead of the quantity Arnel named.
- 2026-09-05 · Jaris body shipped with 4 of 7 sections about LoudFace and a two-paragraph diagnosis. Root cause: I designed the proof and process blocks first and never re-read the body from the client's seat.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
