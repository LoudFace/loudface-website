# Component Development Patterns

## File Structure

Every UI component follows this structure:

```astro
---
// 1. Library imports
import { applyCMSConfig } from '../../lib/cms-utils';
import { generateCMSAttributes } from '../../lib/cms-attributes';
import { CMS_SECTIONS } from '../../lib/constants';
import { asset } from '../../lib/assets';  // For static image paths

// 2. Type imports (always from centralized types.ts)
import type { CaseStudy, Client, Testimonial } from '../../lib/types';

// 3. Component-specific interfaces (Props only)
interface Props {
  title?: string;
  items: CaseStudy[];
}

// 4. Props destructuring with defaults
const { title = "Default Title", items: rawItems } = Astro.props;

// 5. CMS config application
const items = applyCMSConfig(rawItems, CMS_SECTIONS.SECTION_NAME, 'collection-name');

// 6. Reference lookups for CMS attributes
const referenceLookups = { clients: clientsMap };
---

<!-- Template -->
```

## Type Imports

**ALWAYS import CMS types from `src/lib/types.ts`:**

```typescript
// CORRECT
import type { CaseStudy, Client, Testimonial, BlogPost } from '../../lib/types';

// WRONG - Don't define local interfaces
interface CaseStudy { ... }
```

Available types in `types.ts`:
- `CaseStudy` - Case study items
- `Client` - Client items with logos
- `Testimonial` - Testimonial items
- `BlogPost` - Blog post items
- `Category` - Blog categories
- `Industry` - Industry items
- `TeamMember` - Team member items
- `Technology` - Technology items
- `ServiceCategory` - Service category items
- `WebflowImage` - Image field structure

## Static Images (CRITICAL)

**ALWAYS use `asset()` for hardcoded image paths.** This is required for Webflow Cloud deployment.

```astro
---
import { asset } from '../../lib/assets';
---

<!-- CORRECT - uses asset() -->
<img src={asset('/images/logo.svg')} alt="Logo" />
<img src={asset('/images/icon.svg')} class="w-6 h-6" />

<!-- WRONG - will 404 in production -->
<img src="/images/logo.svg" alt="Logo" />
```

### When to Use `asset()`

| Image Source | Use `asset()`? |
|--------------|----------------|
| Hardcoded paths (`/images/...`) | ✅ Yes |
| JSON content paths | ✅ Yes |
| Webflow CMS URLs (full https://...) | ❌ No |
| External URLs | ❌ No |

### JSON Content Images

When image paths come from JSON content files, apply `asset()` at render time:

```astro
{content.items.map((item) => (
  <img src={asset(item.icon)} alt={item.title} />
))}
```

### Fallback Images

For CMS images with fallbacks, use `asset()` only for the fallback:

```astro
<img src={item['profile-image']?.url || asset('/images/placeholder-avatar.svg')} />
```

## CMS Section IDs

**ALWAYS use constants from `src/lib/constants.ts`:**

```typescript
// CORRECT
import { CMS_SECTIONS } from '../../lib/constants';
const items = applyCMSConfig(rawItems, CMS_SECTIONS.HERO_SLIDER, 'case-studies');

// WRONG - Don't use magic strings
const items = applyCMSConfig(rawItems, 'hero-slider', 'case-studies');
```

Available section IDs:
- `CMS_SECTIONS.HERO_SLIDER`
- `CMS_SECTIONS.RESULTS_CASE_STUDIES`
- `CMS_SECTIONS.RESULTS_TESTIMONIALS`
- `CMS_SECTIONS.CASE_STUDY_SLIDER`
- `CMS_SECTIONS.KNOWLEDGE_SLIDER`
- `CMS_SECTIONS.PARTNERS_TESTIMONIALS`
- `CMS_SECTIONS.PARTNERS_CLIENTS`
- `CMS_SECTIONS.FOOTER_CASE_STUDIES`
- `CMS_SECTIONS.FOOTER_BLOG_POSTS`

## CMS Control Panel Integration

**Container element:**
```astro
<div
  data-cms-section={CMS_SECTIONS.SECTION_NAME}
  data-cms-label="Human-Readable Label"
>
```

**Item elements:**
```astro
{items.map(item => (
  <div {...generateCMSAttributes(item, 'collection-name', referenceLookups)}>
    <!-- item content -->
  </div>
))}
```

## Button Usage

**Use the Button component when possible:**
```astro
import Button from './Button.astro';

<Button variant="primary" size="lg" href="/contact">
  Get Started
</Button>
```

**Button variants:**
- `primary` - Dark background (surface-900)
- `secondary` - Brand color (primary-600)
- `ghost` - Transparent with hover
- `outline` - Border only

**Inline buttons only for:**
- Carousel navigation buttons (custom hover/scale)
- Icon-only buttons with special styling
- Header pill CTA (rounded-full)

## Section Container Pattern

All sections follow this structure:

```astro
<section class="py-16 md:py-20 lg:py-24">
  <div class="px-4 md:px-8 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <!-- content -->
    </div>
  </div>
</section>
```

## Card Patterns

**Standard card:**
```html
<div class="bg-white rounded-xl border border-surface-200 p-6
  hover:border-surface-300 hover:shadow-md transition-all duration-200">
```

**Dark card:**
```html
<div class="bg-surface-900 rounded-xl p-6">
```

**Glass card (dark backgrounds only):**
```html
<div class="bg-white/5 hover:bg-white/[0.08] rounded-xl p-6 transition-colors">
```

## Link Patterns

**Clickable card:**
```astro
<a
  href={item.url}
  class="block transition-opacity duration-200 hover:opacity-75
    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4 rounded-lg"
>
```

**Nav link:**
```html
<a class="text-nav font-medium text-surface-600 hover:text-surface-900
  hover:bg-surface-50 rounded-lg px-3 py-2 transition-colors">
```

## Carousel Components

For carousels using Embla, keep the Embla-specific CSS in a scoped `<style>` block:

```astro
<style>
  .embla { overflow: hidden; }
  .embla__container { display: flex; }
  .embla__slide { flex: 0 0 auto; min-width: 0; }
</style>
```

## Accessibility Requirements

1. **Focus states:** Always use `focus-visible:` (not `focus:`)
2. **Skip link:** Include skip link in Layout
3. **ARIA labels:** Required for icon-only buttons
4. **Color contrast:** Use semantic color tokens (they're WCAG AA compliant)
5. **Interactive elements:** Use `touch-action: manipulation` (in base CSS)

## Content Editor Integration (Static Text)

For components with hardcoded static text (headlines, descriptions, button labels), use the JSON content layer to make them editable via `/dev/editor`.

**This is SEPARATE from CMS data** - use this for component defaults, not Webflow CMS items.

### When to Use Content Editor

| Content Type | Solution |
|--------------|----------|
| Static text in component (headline, CTA text) | JSON content layer |
| Dynamic data from Webflow CMS | CMS Control Panel |

### Adding Content Editor Support

**1. Create JSON content file** in `src/data/content/`:

```json
{
  "title": "Ready to scale your site?",
  "subtitle": "Don't let another day pass...",
  "ctaText": "Book an intro call"
}
```

**2. Add to content-utils.ts:**

```typescript
// Add import at top
import myContent from '../data/content/my-section.json';

// Add type interface
export interface MySectionContent {
  title: string;
  subtitle: string;
  ctaText: string;
}

// Add to registry
const contentRegistry: Record<string, unknown> = {
  // ... existing entries
  'my-section': myContent,
};

// Add getter function
export function getMySectionContent(): MySectionContent {
  return myContent as MySectionContent;
}
```

**3. Update component to use JSON defaults:**

```astro
---
import { getMySectionContent } from '../../lib/content-utils';

// Load content from JSON file (editable via /dev/editor)
const content = getMySectionContent();

interface Props {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

// Props can still override JSON defaults
const {
  title = content.title,
  subtitle = content.subtitle,
  ctaText = content.ctaText
} = Astro.props;
---
```

### Line Breaks in Content

The content editor automatically converts line breaks to proper HTML `<br>` tags when you save. This means:

- **In the editor**: Press Enter to add a line break (shows as a new line)
- **In the JSON**: Stored as `<br>` tags (proper HTML markup)
- **In components**: Use `set:html` to render the HTML

```astro
---
import { getHeroContent } from '../../lib/content-utils';
const content = getHeroContent();
---

<!-- Use set:html for text fields that may contain <br> tags -->
<h1 set:html={content.headline} />
<p set:html={content.description} />

<!-- For fields that never have HTML (like button text), use regular interpolation -->
<button>{content.ctaText}</button>
```

This keeps the JSON clean with proper HTML markup - no CSS workarounds needed.

### Key Points

- **Props still work:** Parent components can override JSON defaults
- **Hot reload:** Vite reloads automatically when JSON changes
- **Type-safe:** TypeScript infers types from JSON structure
- **Zero runtime cost:** JSON is bundled at build time
- **Dev-only editing:** `/dev/editor` is blocked in production
- **Line breaks:** Editor converts to `<br>` tags automatically, use `set:html` to render

### Existing Content Files

See `src/data/content/` for examples. Current files:
- `cta.json`, `hero.json`, `faq.json`, `approach.json`
- `marketing.json`, `partners.json`, `knowledge.json`
- `results.json`, `audit.json`, `case-study-slider.json`, `newsletter.json`

## Adding New Components

1. Create file in `src/components/ui/`
2. Import types from `../../lib/types`
3. Import `CMS_SECTIONS` if using CMS data
4. **Import `asset` from `../../lib/assets` if using static images**
5. Define only `Props` interface locally
6. Follow section container pattern
7. Use styling tokens from `styling.md`
8. Add `data-cms-section` for CMS Control Panel support
9. **For static text:** Use JSON content layer (see above)
10. **For static images:** Use `asset('/images/...')` for all hardcoded paths
