# LoudFace Website - Claude Code Instructions

## Project Overview
This is the LoudFace agency website built with Astro + Webflow Cloud integration. The site uses:
- **Framework**: Astro with SSR (`output: 'server'`)
- **Adapter**: `@astrojs/cloudflare` for Webflow Cloud deployment
- **CMS**: Webflow CMS (via API v2)
- **Styling**: Tailwind CSS with custom component classes

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

### Deployment (Git-Based)

Webflow Cloud automatically deploys when you push to `main` on GitHub. No CLI deployment command exists.

```bash
# Build first to verify no errors
npm run build

# Push to trigger deployment
git push origin main
```

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
Use direct Webflow API v2 calls in the Astro codebase for:
- Runtime data fetching (SSR pages)
- API routes that serve CMS data
- Any data needed at request time

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
```

### Webflow Cloud Production
These are automatically available at runtime:
- `WEBFLOW_SITE_ID` - Auto-injected
- `WEBFLOW_SITE_API_TOKEN` - Auto-injected

Access pattern in code:
```typescript
// Works in both local and production
const accessToken = (locals as any).runtime?.env?.WEBFLOW_SITE_API_TOKEN
  || import.meta.env.WEBFLOW_SITE_API_TOKEN;
```

## Key Files

| File | Purpose |
|------|---------|
| `src/layouts/Layout.astro` | Main layout with Tailwind CSS |
| `src/pages/index.astro` | Homepage |
| `src/pages/work/[slug].astro` | Dynamic case study pages |
| `src/pages/api/cms/[collection].ts` | CMS collection API |
| `src/pages/api/cms/[collection]/[slug].ts` | Single item API |
| `src/pages/design-system.astro` | Design system reference page |
| `src/pages/dev/editor.astro` | Content editor (dev-only) |
| `src/data/content/*.json` | Static text content files |
| `src/lib/content-utils.ts` | Content getter utilities |
| `astro.config.mjs` | Astro configuration |
| `src/lib/assets.ts` | Static asset URL utility |
| `src/lib/cms-data.ts` | Consolidated CMS data fetching |
| `src/lib/api-utils.ts` | API response utilities |
| `src/lib/icons.ts` | Shared icon definitions |
| `src/lib/types.ts` | CMS type definitions |

## Component Inventory

### CMS-Driven Components

Components that display data from Webflow CMS collections.

| Component | CMS Collection | Section ID |
|-----------|----------------|------------|
| Hero | case-studies, clients, industries | `HERO_SLIDER` |
| Partners | testimonials, clients | `PARTNERS_TESTIMONIALS`, `PARTNERS_CLIENTS` |
| CaseStudySlider | case-studies, clients, industries, testimonials | `CASE_STUDY_SLIDER` |
| Results | case-studies, testimonials, clients | `RESULTS_CASE_STUDIES`, `RESULTS_TESTIMONIALS` |
| Knowledge | blog, categories, team-members | `KNOWLEDGE_SLIDER` |
| Footer | case-studies, blog | `FOOTER_CASE_STUDIES`, `FOOTER_BLOG_POSTS` |

### Static Content Components

Components that use JSON content layer (editable via `/dev/editor`).

| Component | Content File |
|-----------|--------------|
| Hero | `hero.json` |
| Marketing | `marketing.json` |
| Approach | `approach.json` |
| Audit | `audit.json` |
| CTA | `cta.json` |
| FAQ | `faq.json`, `faq-items.json` |
| Knowledge | `knowledge.json` |
| Results | `results.json` |
| Partners | `partners.json` |
| CaseStudySlider | `case-study-slider.json` |
| Newsletter | `newsletter.json` |

### Reusable UI Components

| Component | Purpose |
|-----------|---------|
| Button | Standardized CTA buttons with Cal.com integration |
| CarouselNav | Prev/next navigation for Embla carousels (light/dark variants) |

## Static Assets (CRITICAL for Webflow Cloud)

Webflow Cloud mounts the Astro app at `/customsite`. This means **all static asset paths must be prefixed** or they will 404 in production.

### The `asset()` Utility

**ALWAYS use the `asset()` function for static image paths:**

```astro
---
import { asset } from '../../lib/assets';
---

<!-- CORRECT - uses asset() -->
<img src={asset('/images/logo.svg')} alt="Logo" />

<!-- WRONG - will 404 in production -->
<img src="/images/logo.svg" alt="Logo" />
```

### When to Use `asset()`

| Scenario | Use `asset()`? |
|----------|----------------|
| Hardcoded image paths in templates | ✅ Yes |
| Image paths from JSON content files | ✅ Yes |
| Image URLs from Webflow CMS (full URLs) | ❌ No |
| External URLs (https://...) | ❌ No |

### How It Works

```typescript
// src/lib/assets.ts
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Handles leading/trailing slashes
  return `${base}${path}`;
}
```

- **Development:** Returns `/images/logo.svg` (no prefix)
- **Production:** Returns `/customsite/images/logo.svg` (with prefix)

### JSON Content with Images

When loading image paths from JSON content files, apply `asset()` at render time:

```astro
---
import { getAuditContent } from '../../lib/content-utils';
import { asset } from '../../lib/assets';
const content = getAuditContent();
---

{content.challenges.map((item) => (
  <img src={asset(item.icon)} alt={item.title} />
))}
```

### Why This Is Needed

**Webflow Cloud Architecture:** When you deploy a custom code app (like Astro) alongside a Webflow-designed site, Webflow Cloud mounts your app at `/customsite` to avoid URL conflicts with Webflow's own pages. This means:

- Your Webflow pages: `www.example.com/`, `www.example.com/about`
- Your Astro app: `www.example.com/customsite/`, `www.example.com/customsite/work`
- Your static assets: `www.example.com/customsite/images/logo.svg`

**The Problem:** Astro's `base` config (set to `/customsite`) only affects:
- Route generation (`/work` → `/customsite/work`)
- JS/CSS imports via build tools

It does **NOT** rewrite hardcoded HTML paths like `<img src="/images/logo.svg">`. These will 404 because the browser requests `/images/logo.svg` instead of `/customsite/images/logo.svg`.

**The Solution:** The `asset()` utility reads `import.meta.env.BASE_URL` and prefixes paths at runtime, bridging this gap.

## Cal.com Integration

The site uses Cal.com for booking calls. The embed is configured in `Layout.astro`.

### How It Works

1. **Cal.com SDK** is loaded in `<head>` (Layout.astro)
2. **Click handler** listens for `.btn-cta`, `[data-cal-trigger]`, or `#book-modal` links
3. **Modal opens** via `Cal("modal", { calLink: "..." })`

### Configuration

```javascript
// In Layout.astro
Cal("modal", {
  calLink: "arnelbukva/loudface-intro-call",  // Change this to your Cal.com link
  config: { layout: "month_view" }
});
```

### Triggering the Booking Modal

Any of these will open the Cal.com booking modal:

```html
<!-- Class-based trigger -->
<button class="btn-cta">Book a call</button>

<!-- Attribute-based trigger -->
<a data-cal-trigger href="#">Schedule meeting</a>

<!-- Hash link trigger -->
<a href="#book-modal">Book now</a>
```

## CSS Architecture

### Tailwind-Native Styling
- All styling via Tailwind utility classes in templates
- Custom components defined in `src/styles/components.css` using `@apply`
- No external CSS dependencies

### Current Fonts
- **Satoshi** - Body text (400, 500, 700 weights)
- **Neue Montreal** - Headings (500 weight)
- **Geist Mono** - Code/monospace

Font files location: `public/fonts/`

### Tailwind Configuration

**CRITICAL: Tailwind v4 with `@config` directive**

This project uses Tailwind v4 with the Vite plugin (`@tailwindcss/vite`). Unlike Tailwind v3, the custom theme in `tailwind.config.mjs` is **not automatically loaded**. The CSS file MUST include the `@config` directive:

```css
@import "tailwindcss";
@config "../../tailwind.config.mjs";  /* Required for custom colors/theme */
```

Without this directive, custom colors like `bg-surface-900` and `text-primary-500` will not work, causing invisible text and missing styles.

**Config file:** `tailwind.config.mjs`
- Modern color system (primary, surface, semantic)
- Custom font families configured
- 8px base grid spacing system
- Custom animations (fade, slide, marquee)

### Design System Reference

Before creating UI components, read `src/pages/design-system.astro` for approved patterns.
See `.claude/rules/styling.md` for token mappings.

## API Response Format

The CMS API routes normalize Webflow v2 response format:
```typescript
// Input from Webflow v2 API
{
  items: [{
    id: "...",
    fieldData: { slug: "...", name: "...", ... }
  }]
}

// Output from our API (normalized)
{
  id: "...",
  slug: "...",
  name: "...",
  fieldData: { ... }, // Still available if needed
  ...
}
```

## Common Tasks

### Adding a New Dynamic Page for a Collection
1. Create `src/pages/[collection-name]/[slug].astro`
2. Set `export const prerender = false;` for SSR
3. Fetch data using the collection ID from the table above
4. Use `item.fieldData.slug` to match URL slug

### Testing CMS Locally
```bash
# Start dev server
npm run dev

# Test collection endpoint
curl http://localhost:4321/api/cms/case-studies

# Test single item
curl http://localhost:4321/api/cms/case-studies/[slug]
```

### Deploying Changes

Webflow Cloud automatically deploys when you push to the `main` branch on GitHub.

```bash
# Build first to catch errors
npm run build

# Commit and push to trigger deployment
git add .
git commit -m "Your commit message"
git push origin main
```

Webflow will automatically detect the push and deploy the site. There is no `webflow cloud deploy` CLI command.

## Webflow MCP Usage Examples

```
# List all collections to verify IDs
Use Webflow MCP: list_collections for site loudface

# Get case study items
Use Webflow MCP: list_collection_items for collection 67bcc512271a06e2e0acc70d

# Inspect collection schema
Use Webflow MCP: get_collection for collection 67bcc512271a06e2e0acc70d
```

## Content Editor (Static Text)

The site has a JSON-based content editor at `/dev/editor` (dev-only) for editing static text in components.

**This is SEPARATE from Webflow CMS** - use this for hardcoded component defaults (headlines, CTAs, descriptions), not for Webflow CMS items.

### How It Works

1. **JSON files** in `src/data/content/` store static text
2. **Components** import content via `src/lib/content-utils.ts` getters
3. **Editor** at `/dev/editor` provides a form UI to edit JSON files
4. **Line breaks**: Editor converts Enter → `<br>` tags automatically

### Creating New Editable Content

1. Create `src/data/content/my-section.json`:
   ```json
   { "title": "My Title", "description": "My description" }
   ```

2. Register in `src/lib/content-utils.ts`:
   - Import the JSON file
   - Add type interface
   - Add to `contentRegistry`
   - Create getter function

3. Use in component:
   ```astro
   ---
   import { getMySectionContent } from '../../lib/content-utils';
   const content = getMySectionContent();
   const { title = content.title } = Astro.props;
   ---
   <h2 set:html={title} />
   ```

### Rendering Content

| Field Type | Rendering |
|------------|-----------|
| Text with possible line breaks | `set:html={content.field}` |
| Single-line text (buttons, labels) | `{content.field}` |

See `.claude/reference/content-editor-details.md` for content files inventory and detailed examples.

## CMS Control Panel Development Rules (MUST FOLLOW)

The site has a schema-driven CMS Control Panel that enables visual filtering/sorting of CMS items in dev mode. **These rules are MANDATORY when working with CMS components.**

### Schema Files (Auto-Generated - DO NOT EDIT)

| File | Purpose |
|------|---------|
| `src/data/cms-schemas.json` | Auto-generated Webflow collection schemas |
| `src/data/cms-config.json` | User-configured filter/sort settings |

**`cms-schemas.json` is auto-generated on build via `npm run prebuild`.** Never edit this file manually. If Webflow collection fields change, run `npm run generate:schemas` to update.

### MANDATORY: Rendering CMS Items

When rendering any CMS collection items, you **MUST** use the `generateCMSAttributes()` function to add data attributes. This enables the CMS Control Panel to filter/sort items visually.

```astro
---
import { generateCMSAttributes } from '../lib/cms-attributes';
import { applyCMSConfig } from '../lib/cms-utils';

// Fetch CMS items
const rawItems = await fetchCaseStudies();

// Apply server-side filter/sort config (field mapping auto-generated from schema)
const items = applyCMSConfig(rawItems, 'section-id', 'collection-name');

// Build reference lookups for displaying reference field names
const clients = new Map(clientsList.map(c => [c.id, c]));
const referenceLookups = { clients };
---

{items.map(item => (
  <a
    href={`/work/${item.slug}`}
    class="item-class"
    {...generateCMSAttributes(item, 'collection-name', referenceLookups)}
  >
    <!-- item content -->
  </a>
))}
```

**Key points:**
- `applyCMSConfig(items, sectionId, collection)` - section ID for config, collection for schema lookup
- `generateCMSAttributes(item, collection, lookups)` - ALWAYS spread onto the CMS item element
- Reference lookups are optional but enable displaying reference names instead of IDs

### AUTOMATIC: Adding New CMS Sections

CMS sections are **auto-discovered from the DOM** - no manual registration needed! Just add these attributes:

1. **Container**: Add `data-cms-section="unique-section-id"` to the container element
2. **Items**: Use `generateCMSAttributes()` on each item (this adds `data-cms-collection`)
3. **Optional label**: Add `data-cms-label="Display Name"` for a custom panel label

```astro
<section data-cms-section="my-blog-posts" data-cms-label="Blog Posts">
  {items.map(item => (
    <div {...generateCMSAttributes(item, 'blog', lookups)}>
      ...
    </div>
  ))}
</section>
```

The CMS Control Panel will:
- Auto-detect the section from `data-cms-section`
- Read the collection from child items' `data-cms-collection`
- Load filter/sort options from the schema
- Generate the label from section ID (or use `data-cms-label` if provided)

### File Reference for CMS Control Panel

| File | Purpose |
|------|---------|
| `src/lib/cms-utils.ts` | Server-side filter/sort application |
| `src/lib/cms-attributes.ts` | Generate data attributes from schema |
| `src/lib/dev/cms-panel.ts` | Section definitions, types, operator config |
| `src/lib/dev/cms-panel-init.ts` | Panel UI initialization (client-side) |
| `src/styles/dev-panel.css` | Panel styling |
| `scripts/generate-cms-schemas.ts` | Schema generation from Webflow API |

### Filter Operators by Field Type

| Field Type | Available Operators |
|------------|---------------------|
| `text` | equals, not_equals |
| `reference` | equals, not_equals, is_set, is_not_set |
| `image` | is_set, is_not_set |
| `boolean` | equals |
| `date` | equals, not_equals, is_set, is_not_set |

### Quick Reference: CMS Development Checklist

When creating/modifying CMS components:
- [ ] Use `applyCMSConfig(items, sectionId, collection)` for server-side filtering
- [ ] Use `generateCMSAttributes(item, collection, lookups)` on each item element
- [ ] Add `data-cms-section="section-id"` to the container
- [ ] (Optional) Add `data-cms-label="Display Name"` for custom panel label
- [ ] Build reference lookups for any reference fields you want to display names for

**No manual registration needed!** Sections are auto-discovered from `data-cms-section` attributes.

## Notes

- Always use Webflow API v2 (`/v2/collections/...`) - v1 returns errors
- Field data is nested in `fieldData` object in v2 responses
- The API routes normalize this for easier template access
- Build must pass before deploying: `npm run build`
- CMS schemas auto-regenerate on build - add new collections to `scripts/generate-cms-schemas.ts` COLLECTION_IDS
