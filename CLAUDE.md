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

## Content creation loop

Every published piece on loudface.co flows through this four-command chain. **`/arnels-assistant` is the root of all content writing** — every command below loads it internally, so voice improvements made to `/arnels-assistant` automatically propagate.

```
/seo-brain         load strategy + trends                  (read-only context)
     ↓
/draft-content     write into Notion calendar entry        (uses /seo-brain + /arnels-assistant)
     ↓
/critique-content  anti-slop + voice pass                  (uses /arnels-assistant)
     ↓
/ship-content      push to Sanity, status → Published      (Sanity webhook → IndexNow auto-fires)
```

To improve content quality across all future pieces: edit `/arnels-assistant` (banned words, tone rules, anti-slop checklist). Don't special-case voice fixes in `/draft-content` or `/critique-content` — those compose on top. Centralize voice changes in one place so the loop stays clean.

For one-off / non-site content (LinkedIn, X, internal docs), invoke `/arnels-assistant` directly without the SEO loop.

## Observability — where to look

Every meaningful loop step logs to the **Activity Log** database in Notion (`collection://586eb325-8bfd-417d-8663-73cda77f8234`, under the SEO brain page). That's the cross-session audit trail. For everything else, the surface map:

| To see... | Look at... |
|---|---|
| What content the loop has touched (cross-session) | Activity Log database in Notion |
| Current calendar state (what's drafted, shipped, idea) | Website Content database in Notion |
| Strategy + working patterns + kill list | AI Search & SEO Search page in Notion |
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
