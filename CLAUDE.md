# LoudFace Website — Claude Code Instructions

> IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for all Next.js tasks. Always check actual project files before assuming API behavior — this project uses Next.js 16.1 which is beyond most training data.

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
| CMS collection IDs & helpers | `src/lib/constants.ts` |
| CMS data fetching & normalization | `src/lib/cms-data.ts` |
| TypeScript types | `src/lib/types.ts` |
| Static text content | `src/data/content/*.json` |
| Content getter functions | `src/lib/content-utils.ts` |
| Asset URL utility | `src/lib/assets.ts` |
| CMS image optimization (weserv.nl proxy) | `src/lib/image-utils.ts` |
| Color contrast utilities | `src/lib/color-utils.ts` |

## CMS Collection IDs

| Collection | ID | API Route |
|---|---|---|
| Blog | `67b46d898180d5b8499f87e8` | `/api/cms/blog` |
| Case Studies | `67bcc512271a06e2e0acc70d` | `/api/cms/case-studies` |
| Testimonials | `67bd0c6f1a9fdd9770be5469` | `/api/cms/testimonials` |
| Clients | `67c6f017e3221db91323ff13` | `/api/cms/clients` |
| Blog FAQ | `67bd3732a35ec40d3038b40a` | `/api/cms/blog-faq` |
| Team Members | `68d819d1810ef43a5ef97da4` | `/api/cms/team-members` |
| Technologies | `67be3e735523f789035b6c56` | `/api/cms/technologies` |
| Categories | `67b46e2d70ec96bfb7787071` | `/api/cms/categories` |
| Industries | `67bd0a772117f7c7227e7b4d` | `/api/cms/industries` |
| Service Categories | `67bcfb9cdb20a1832e2799c3` | `/api/cms/service-categories` |
| SEO Pages | `6988a63150526a37d700fae3` | `/api/cms/seo-pages` |

These IDs are also in `src/lib/constants.ts`. If you add a new collection, update both places.

## Key Patterns

### Server vs Client Components

Default is Server Component. Only add `'use client'` when you need interactivity, hooks, or browser APIs.

### CMS Data

- Uses Webflow API v2 — raw items have field data nested in a `fieldData` object
- **Server Components**: Fetch and normalize via `src/lib/cms-data.ts` (merges `fieldData` into root, filters drafts)
- **API routes** at `src/app/api/cms/[collection]/route.ts` are pass-through proxies — they return raw Webflow responses without normalization
- Single-item route: `src/app/api/cms/[collection]/[slug]/route.ts`

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

For CMS images (Webflow CDN URLs), use helpers from `src/lib/image-utils.ts` — they route through weserv.nl for real resizing and WebP conversion:
- `thumbnailImage(url)` — card grids (800px)
- `logoImage(url)` — client logos (200px)
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

## Webflow MCP Tools

When available, use MCP tools for read operations (listing sites, collections, items, schemas). Use direct Webflow API v2 calls in code for runtime data fetching in Server Components.

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