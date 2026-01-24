# LoudFace Website - Claude Code Instructions

## Project Overview

This is the LoudFace agency website built with **Next.js 16.1** + Webflow Cloud integration. The site uses:
- **Framework**: Next.js 16.1 with App Router
- **Runtime**: Edge runtime via OpenNext Cloudflare adapter
- **CMS**: Webflow CMS (via API v2)
- **Styling**: Tailwind CSS v4 with custom `@theme` block

## Webflow Cloud Deployment (CRITICAL)

### Required Configuration Files

Webflow Cloud requires these files for Next.js deployment:

| File | Purpose |
|------|---------|
| `webflow.json` | Framework detection (`{"cloud":{"framework":"nextjs"}}`) |
| `open-next.config.ts` | OpenNext Cloudflare adapter configuration |
| `wrangler.jsonc` | Cloudflare Workers configuration |
| `next.config.ts` | Next.js config with conditional basePath |

**NEVER delete these files** - they are required for Webflow Cloud deployment.

### webflow.json (Required)

```json
{
  "cloud": {
    "framework": "nextjs"
  }
}
```

### open-next.config.ts (Required)

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
```

### wrangler.jsonc (Required)

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

### Required Dependencies

```bash
npm install --save-dev @opennextjs/cloudflare
```

The `@opennextjs/cloudflare` package MUST be in devDependencies for Webflow Cloud to build.

### Deployment Process

Webflow Cloud automatically deploys when you push to `main` on GitHub:

```bash
# Build first to verify no errors
npm run build

# Push to trigger deployment
git push origin main
```

**Note:** There is no CLI deployment command. Deployment is git-based only.

## Webflow Tooling Decision Matrix

### When to Use Webflow MCP (Claude Code Integration)
Use the Webflow MCP tools for **read operations** and **quick queries**:
- Listing sites, collections, pages
- Reading CMS collection items
- Getting site information
- Inspecting collection schemas
- Quick data lookups without leaving Claude

**MCP Tools Available:**
- `list_sites` - List all Webflow sites
- `get_site` - Get site details
- `list_collections` - List CMS collections
- `get_collection` - Get collection schema
- `list_collection_items` - Get items from a collection
- `get_collection_item` - Get a specific item
- `list_pages` - List site pages

### When to Use Webflow CLI (Terminal Commands)

The Webflow CLI is used for **project setup and authentication**, not deployment:

```bash
# Check authentication status
webflow auth status

# Re-authenticate if needed
webflow auth logout && webflow auth login

# Initialize/link a project (one-time setup)
webflow cloud init
```

### When to Use Direct API Calls (Code)
Use direct Webflow API v2 calls in the Next.js codebase for:
- Runtime data fetching (Server Components)
- API routes that serve CMS data
- Any data needed at request time

## Base Path Configuration (CRITICAL)

Webflow Cloud mounts the Next.js app at `/customsite`. This requires special handling.

### next.config.ts

```typescript
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Only apply basePath in production
  ...(isProduction && {
    basePath: "/customsite",
    assetPrefix: "/customsite",
  }),
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets-global.website-files.com" },
      { protocol: "https", hostname: "images.weserv.nl" },
    ],
  },
};

export default nextConfig;
```

**IMPORTANT:** The `basePath` must be conditional (`isProduction`) so development works without the prefix.

### The `asset()` Utility

For static image paths, use the `asset()` function from `src/lib/assets.ts`:

```tsx
import { asset } from '@/lib/assets';

// CORRECT - uses asset()
<img src={asset('/images/logo.svg')} alt="Logo" />

// WRONG - will 404 in production
<img src="/images/logo.svg" alt="Logo" />
```

The `asset()` function automatically adds `/customsite` prefix in production.

### When to Use `asset()`

| Scenario | Use `asset()`? |
|----------|----------------|
| Hardcoded image paths (`/images/...`) | ✅ Yes |
| Image paths from JSON content files | ✅ Yes |
| Image URLs from Webflow CMS (full URLs) | ❌ No |
| External URLs (https://...) | ❌ No |

### Internal Links

Next.js `<Link>` component automatically handles basePath. Use it for all internal navigation:

```tsx
import Link from 'next/link';

// CORRECT - Link handles basePath automatically
<Link href="/work">Our Work</Link>

// WRONG for internal links - use Link instead
<a href="/work">Our Work</a>
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with Header/Footer |
| `src/app/page.tsx` | Homepage |
| `src/app/work/[slug]/page.tsx` | Dynamic case study pages |
| `src/app/blog/[slug]/page.tsx` | Dynamic blog post pages |
| `src/app/api/cms/[collection]/route.ts` | CMS collection API |
| `src/app/api/cms/[collection]/[slug]/route.ts` | Single item API |
| `src/app/globals.css` | Global styles with Tailwind @theme |
| `src/lib/cms-data.ts` | Consolidated CMS data fetching |
| `src/lib/assets.ts` | Static asset URL utility |
| `src/lib/types.ts` | CMS type definitions |
| `src/lib/constants.ts` | Collection IDs and helpers |
| `src/lib/content-utils.ts` | Static content getters |
| `src/data/content/*.json` | Static text content files |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind configuration |
| `webflow.json` | Webflow Cloud framework config |
| `open-next.config.ts` | OpenNext adapter config |
| `wrangler.jsonc` | Cloudflare Workers config |

## CMS Collection IDs Reference

| Collection | ID | API Route |
|------------|-----|-----------|
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

## Environment Variables

### Local Development (`.env`)

```env
WEBFLOW_SITE_API_TOKEN=<your-site-token>
WEBFLOW_SITE_ID=loudface
NEXT_PUBLIC_BASE_PATH=
```

### Webflow Cloud Production

These are automatically available at runtime:
- `WEBFLOW_SITE_ID` - Auto-injected
- `WEBFLOW_SITE_API_TOKEN` - Auto-injected

Access pattern in code:

```typescript
const accessToken = process.env.WEBFLOW_SITE_API_TOKEN;
```

## Component Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles + Tailwind @theme
│   ├── work/[slug]/       # Case study pages
│   ├── blog/[slug]/       # Blog post pages
│   └── api/               # API routes
├── components/
│   ├── Header.tsx         # Site header (Client Component)
│   ├── Footer.tsx         # Site footer
│   ├── sections/          # Page section components
│   │   ├── Hero.tsx
│   │   ├── Partners.tsx
│   │   ├── CaseStudySlider.tsx
│   │   └── ...
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── SectionContainer.tsx
│       └── ...
├── hooks/
│   └── useCarousel.ts     # Embla carousel hook
├── lib/
│   ├── cms-data.ts        # CMS data fetching
│   ├── assets.ts          # Asset URL utility
│   ├── types.ts           # TypeScript types
│   └── constants.ts       # Collection IDs
└── data/
    └── content/           # JSON content files
```

### Server vs Client Components

| Component Type | Directive | Use For |
|---------------|-----------|---------|
| Server Component | (default) | Data fetching, static rendering |
| Client Component | `'use client'` | Interactivity, hooks, browser APIs |

**Client Components in this project:**
- `Header.tsx` - Mobile menu toggle, dropdowns
- `NewsletterForm.tsx` - Form state
- `CalHandler.tsx` - Cal.com modal
- Carousel wrappers using `useCarousel` hook

## Component Inventory

### Section Components (src/components/sections/)

| Component | CMS Collections Used |
|-----------|---------------------|
| Hero | case-studies, clients |
| Partners | testimonials, clients |
| CaseStudySlider | case-studies, clients |
| Results | case-studies, testimonials |
| Knowledge | blog, categories, team-members |
| Marketing | (static content) |
| Approach | (static content) |
| Audit | (static content) |
| FAQ | (static content) |
| CTA | (static content) |

### UI Components (src/components/ui/)

| Component | Purpose |
|-----------|---------|
| Button | Standardized CTA buttons |
| CarouselNav | Prev/next navigation for Embla carousels |
| SectionContainer | Consistent section padding/max-width |
| SectionHeader | Section H2 with optional highlight |

## Tailwind CSS v4 Configuration (CRITICAL)

### Using `@theme` Block

Tailwind v4 with PostCSS plugin requires custom colors in a `@theme` block inside `globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary-500: #6366f1;
  --color-surface-900: #22302e;
  /* ... all custom colors ... */

  --font-sans: "Satoshi", system-ui, sans-serif;
  --font-heading: "Neue Montreal", system-ui, sans-serif;
}
```

**IMPORTANT:** Do NOT use `@config` directive with Tailwind v4 PostCSS plugin - it doesn't work reliably. Use `@theme` blocks with CSS variables instead.

### Available Color Tokens

| Token | Use For |
|-------|---------|
| `primary-*` | Brand colors (50-950) |
| `surface-*` | Neutral/background colors (50-950) |
| `success/warning/error/info` | Semantic status colors |

**Never use:** `gray-*`, `indigo-*`, or other default Tailwind colors.

### Current Fonts

- **Satoshi** - Body text (400, 500, 700 weights)
- **Neue Montreal** - Headings (500 weight)
- **Geist Mono** - Code/monospace

Font files location: `public/fonts/`

## Cal.com Integration

The site uses Cal.com for booking calls. Configuration is in `CalHandler.tsx`:

```tsx
Cal("modal", {
  calLink: "arnelbukva/loudface-intro-call",
  config: { layout: "month_view" }
});
```

Triggering the booking modal:

```html
<button className="btn-cta">Book a call</button>
<a data-cal-trigger href="#">Schedule meeting</a>
<a href="#book-modal">Book now</a>
```

## API Response Format

The CMS API routes normalize Webflow v2 response format:

```typescript
// Input from Webflow v2 API
{ items: [{ id: "...", fieldData: { slug: "...", name: "..." } }] }

// Output from our API (normalized)
{ id: "...", slug: "...", name: "...", fieldData: { ... } }
```

## Common Tasks

### Adding a New Dynamic Page

1. Create `src/app/[collection-name]/[slug]/page.tsx`
2. Use `generateMetadata` for SEO
3. Fetch data using `fetchHomepageData()` from `src/lib/cms-data.ts`

```tsx
import { fetchHomepageData } from '@/lib/cms-data';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ... return metadata
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await fetchHomepageData(process.env.WEBFLOW_SITE_API_TOKEN!);
  const item = data.items.find(i => i.slug === slug);
  if (!item) notFound();
  return <div>...</div>;
}
```

**Note:** In Next.js 16, `params` is a Promise and must be awaited.

### Testing CMS Locally

```bash
# Start dev server
npm run dev

# Test collection endpoint
curl http://localhost:3005/api/cms/case-studies

# Test single item
curl http://localhost:3005/api/cms/case-studies/[slug]
```

### Deploying Changes

```bash
# Build first to catch errors
npm run build

# Commit and push to trigger deployment
git add .
git commit -m "Your commit message"
git push origin main
```

Webflow Cloud will automatically detect the push and deploy.

## Webflow MCP Usage Examples

```
# List all collections to verify IDs
Use Webflow MCP: list_collections for site loudface

# Get case study items
Use Webflow MCP: list_collection_items for collection 67bcc512271a06e2e0acc70d

# Inspect collection schema
Use Webflow MCP: get_collection for collection 67bcc512271a06e2e0acc70d
```

## Static Content (JSON Layer)

Static text content is stored in `src/data/content/*.json` and accessed via `src/lib/content-utils.ts`:

```tsx
import { getHeroContent } from '@/lib/content-utils';

const content = getHeroContent();
// content.headline, content.description, etc.
```

Available content files:
- `hero.json`, `cta.json`, `faq.json`, `faq-items.json`
- `approach.json`, `marketing.json`, `partners.json`, `knowledge.json`
- `results.json`, `audit.json`, `case-study-slider.json`, `newsletter.json`
- `work.json`, `about.json`

### Rendering Content with HTML

For text that may contain `<br>` tags, use `dangerouslySetInnerHTML`:

```tsx
<h1 dangerouslySetInnerHTML={{ __html: content.headline }} />
```

For single-line text (button labels), use regular interpolation:

```tsx
<button>{content.ctaText}</button>
```

## Notes

- Always use Webflow API v2 (`/v2/collections/...`)
- Field data is nested in `fieldData` object in v2 responses
- Build must pass before deploying: `npm run build`
- Dev server runs on port 3005: `npm run dev`
- Use `Link` from `next/link` for internal navigation
- Use `asset()` from `@/lib/assets` for static image paths
- In Next.js 16, dynamic route `params` is a Promise - must await it
