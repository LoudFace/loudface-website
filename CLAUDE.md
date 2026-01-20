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

### When to Use Webflow CLI (Terminal Commands)
Use the Webflow CLI for **deployment** and **CI/CD operations**:
```bash
# Deploy to Webflow Cloud
webflow cloud deploy

# Deploy with verbose output (for debugging)
webflow cloud deploy --verbose

# Check authentication status
webflow auth status

# Re-authenticate if needed
webflow auth logout && webflow auth login
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
```bash
# Build first to catch errors
npm run build

# Deploy to Webflow Cloud
webflow cloud deploy
```

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

See `.claude/rules/component-patterns.md` for detailed patterns.

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

## Content Editor (Dev-Only)

The site has a form-based content editor at `/dev/editor` for editing static text content in components. This is **separate from the CMS Control Panel** - it handles hardcoded component defaults, not Webflow CMS data.

### How It Works

1. **JSON Content Files**: Static text is stored in `src/data/content/*.json`
2. **Components Import**: Components use `getXContent()` functions to import defaults
3. **Editor UI**: Form at `/dev/editor` reads/writes these JSON files
4. **Hot Reload**: Vite reloads automatically when JSON files change

### Content Files

| File | Component | Fields |
|------|-----------|--------|
| `cta.json` | CTA.astro | title, subtitle, ctaText |
| `hero.json` | Hero.astro | headline, description, ctaText, aiLinks |
| `faq.json` | FAQ.astro | title, subtitle, footerTitle, footerText, footerCtaText |
| `approach.json` | Approach.astro | title, highlightWord, subtitle, steps[], statsHeading, stats[] |
| `marketing.json` | Marketing.astro | title, titleHighlight, subtitle, description, cards[], ctaText |
| `partners.json` | Partners.astro | starRatingPrefix, starRatingSuffix, tagline |
| `knowledge.json` | Knowledge.astro | title, highlightWord, description, readTime |
| `results.json` | Results.astro | title, subtitle, videoTestimonials[], ctaText, ctaHref |
| `audit.json` | Audit.astro | title, highlightText, description, challenges[] |
| `case-study-slider.json` | CaseStudySlider.astro | title, ctaText |
| `newsletter.json` | NewsletterForm.astro | placeholder, buttonText, loadingText, successMessage, errorMessage, networkErrorMessage |

All files are located in `src/data/content/`.

### File Reference

| File | Purpose |
|------|---------|
| `src/lib/content-utils.ts` | Content getters and type definitions |
| `src/pages/api/dev/content.ts` | Dev-only API for reading/writing content |
| `src/pages/dev/editor.astro` | Form-based editor UI |

### Adding New Editable Content

1. Create JSON file in `src/data/content/`
2. Add import to `src/lib/content-utils.ts`
3. Add type interface and getter function
4. Update component to import defaults from JSON:

```typescript
// Before (hardcoded)
const { title = "Ready to scale?" } = Astro.props;

// After (JSON defaults)
import { getCTAContent } from '../../lib/content-utils';
const content = getCTAContent();
const { title = content.title } = Astro.props;
```

### Dev-Only Guards

All content editor features are blocked in production:
- `/dev/editor` returns 404
- `/api/dev/content` returns 403
- Uses `import.meta.env.PROD` checks

## Notes

- Always use Webflow API v2 (`/v2/collections/...`) - v1 returns errors
- Field data is nested in `fieldData` object in v2 responses
- The API routes normalize this for easier template access
- Build must pass before deploying: `npm run build`
- CMS schemas auto-regenerate on build - add new collections to `scripts/generate-cms-schemas.ts` COLLECTION_IDS
