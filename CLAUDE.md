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

See `.claude/rules/component-system.md` for the full enforcement rules and `.claude/rules/component-patterns.md` for code examples.

## Critical Rules (Will Break Production If Ignored)

### Deployment Files — NEVER Delete

These files are required for Webflow Cloud deployment. Do not remove or rename them.

**webflow.json:**
```json
{
  "cloud": {
    "framework": "nextjs"
  }
}
```

**open-next.config.ts:**
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig({});
```

**wrangler.jsonc:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "loudface-website",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

If any of these get corrupted, restore them exactly as shown above. `@opennextjs/cloudflare` must be in devDependencies.

### basePath Handling

Webflow Cloud mounts the app at `/customsite`. The basePath in `next.config.ts` is **conditional** — only applied in production. Do not hardcode it.

- **Static image paths** → Use `asset()` from `@/lib/assets` (adds `/customsite` prefix in production)
- **Internal navigation** → Use `<Link>` from `next/link` (handles basePath automatically)
- **External/CMS image URLs** → Use as-is, do NOT wrap with `asset()`

```tsx
// ✅ Correct
import { asset } from '@/lib/assets';
<img src={asset('/images/logo.svg')} />
<Link href="/work">Our Work</Link>

// ❌ Wrong — will 404 in production
<img src="/images/logo.svg" />
```

### Next.js 16 Gotchas

- `params` in dynamic routes is a **Promise** — must be awaited: `const { slug } = await params;`
- Use `generateMetadata` for SEO on dynamic pages
- Do not use deprecated Next.js patterns (getServerSideProps, getStaticProps, etc.)

### Tailwind CSS v4

- Custom colors/fonts are defined in a `@theme` block inside `globals.css` — do NOT use `@config` directive (it doesn't work with Tailwind v4 PostCSS plugin)
- Use project color tokens (`primary-*`, `surface-*`, `success`, `warning`, `error`, `info`) — never default Tailwind colors like `gray-*` or `indigo-*`
- Check `globals.css` for available tokens before adding new ones
- Never use `styled-jsx` — Tailwind only

## Project Structure (Where to Find Things)

| What | Where |
|---|---|
| **Component registry** | **`COMPONENTS.md`** (read this first) |
| Component enforcement rules | `.claude/rules/component-system.md` |
| Component patterns & examples | `.claude/rules/component-patterns.md` |
| UI primitives | `src/components/ui/` |
| Page sections | `src/components/sections/` |
| CMS collection IDs & helpers | `src/lib/constants.ts` |
| CMS data fetching | `src/lib/cms-data.ts` |
| TypeScript types | `src/lib/types.ts` |
| Static text content | `src/data/content/*.json` |
| Content getter functions | `src/lib/content-utils.ts` |
| Asset URL utility | `src/lib/assets.ts` |
| Color contrast utilities | `src/lib/color-utils.ts` |
| Design tokens | `src/app/globals.css` (`@theme` block) |
| Styling rules | `.claude/rules/styling.md` |
| SEO standards | `.claude/rules/seo-standards.md` |

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

These IDs are also in `src/lib/constants.ts`. If you add a new collection, update both places.

## Key Patterns

### Server vs Client Components

Default is Server Component. Only add `'use client'` when you need interactivity, hooks, or browser APIs.

### CMS Data

- Uses Webflow API v2 — field data is nested in `fieldData` object
- Fetch using functions in `src/lib/cms-data.ts`
- API routes at `src/app/api/cms/[collection]/route.ts` normalize the response format

### Static Content

Text content lives in JSON files under `src/data/content/`. Access via getter functions in `src/lib/content-utils.ts`. Use `dangerouslySetInnerHTML` only when HTML content is genuinely expected (CMS content, JSON with `<br>` tags).

### Cal.com Booking

Booking modal triggers: `data-cal-trigger` attribute, `href="#book-modal"`, or any CTA button. Config is in `CalHandler.tsx`.

### Color Contrast

For dynamic backgrounds (CMS brand colors), use utilities from `src/lib/color-utils.ts`:
- `getContrastColors(bgColor)` — returns `{ textColor, mode, overlayColor }` (hue-matched, WCAG AA)
- `getContrastColor(bgColor)` — returns `'white'` or `'var(--color-surface-950)'` (simple)

Never inline color math — always use these shared utilities.

## Dev & Deploy

```bash
npm run dev          # Starts on port 3005
npm run build        # Always build before pushing
git push origin main # Triggers Webflow Cloud deployment (no CLI deploy)
```

## Webflow MCP Tools

When available, use MCP tools for read operations (listing sites, collections, items, schemas). Use direct Webflow API v2 calls in code for runtime data fetching in Server Components.
