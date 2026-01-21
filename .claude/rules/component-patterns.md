# Component Development Patterns

## File Structure

Every UI component follows this structure:

```astro
---
// 1. Library imports
import { createCMS } from '../../lib/cms';
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

// 5. Create CMS helper (auto-generates section IDs)
const cms = createCMS('MyComponent');

// 6. Apply CMS configuration
const slider = cms.section(rawItems as (CaseStudy & { id: string })[], 'case-studies', 'Case Studies');

// 7. Reference lookups for CMS attributes
const referenceLookups = { clients: clientsMap };
---

<!-- Template with CMS attributes -->
<div {...slider.attrs}>
  {slider.items.map(item => (
    <div {...cms.item(item, 'case-studies', referenceLookups)}>
      <!-- item content -->
    </div>
  ))}
</div>
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

## Internal Route Links (CRITICAL)

**ALWAYS use a `route()` helper for hardcoded internal links.** This is required for Webflow Cloud deployment.

```astro
---
// Helper to prefix internal routes with base URL
const base = import.meta.env.BASE_URL || '/';
const route = (path: string) => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};
---

<!-- CORRECT - uses route() -->
<a href={route('/work')}>Our Work</a>

<!-- WRONG - will 404 in production -->
<a href="/work">Our Work</a>
```

### When to Use `route()`

| Link Type | Use `route()`? |
|-----------|----------------|
| Hardcoded internal links (`href="/work"`) | ✅ Yes |
| Links from JSON content files | ✅ Yes |
| External URLs (https://...) | ❌ No |
| Anchor links (`href="#section"`) | ❌ No |
| Dynamic slugs in templates | ❌ No (Astro handles these) |

### Example: Header.astro

See `Header.astro` for a complete example of the `route()` helper pattern used for navigation links.

## CMS Section IDs

Section IDs are **automatically generated** by the `createCMS()` helper. No manual constants needed!

The format is: `{component-name}-{collection}-{index}`

Examples:
- `hero-case-studies-0` - First case studies section in Hero
- `results-case-studies-0` - First case study slot in Results
- `results-case-studies-1` - Second case study slot in Results
- `partners-testimonials-0` - First testimonials section in Partners

```typescript
// The createCMS helper auto-generates section IDs
const cms = createCMS('Hero');
const slider = cms.section(items, 'case-studies', 'Hero Case Studies');
// slider.sectionId === 'hero-case-studies-0'
```

## CMS Control Panel Integration

**Container element** (automatically handled by `cms.section()` or `cms.slot()`):
```astro
<div {...slider.attrs}>
  <!-- slider.attrs includes data-cms-section and data-cms-label -->
```

**Item elements:**
```astro
{slider.items.map(item => (
  <div {...cms.item(item, 'collection-name', referenceLookups)}>
    <!-- item content -->
  </div>
))}
```

**For single-item slots:**
```astro
{slot.item && (
  <div {...slot.attrs}>
    <div {...cms.item(slot.item, 'collection-name', referenceLookups)}>
      <!-- item content -->
    </div>
  </div>
)}
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

## Section Layout Components

### SectionContainer (CRITICAL)

**ALWAYS use `SectionContainer` for page sections.** This ensures consistent padding, max-width, and horizontal gutters.

```astro
---
import SectionContainer from './SectionContainer.astro';
---

<!-- Standard section -->
<SectionContainer>
  <!-- content -->
</SectionContainer>

<!-- With padding variant -->
<SectionContainer padding="lg">
  <!-- content -->
</SectionContainer>

<!-- With custom classes -->
<SectionContainer class="bg-surface-900" innerClass="text-white">
  <!-- content -->
</SectionContainer>
```

**Padding variants:**

| Variant | Classes | Use For |
|---------|---------|---------|
| `default` | `py-16 md:py-20 lg:py-24` | Standard sections |
| `sm` | `py-12 md:py-16` | Compact sections |
| `lg` | `py-16 md:py-24 lg:py-32` | Hero-adjacent, feature sections |
| `none` | (no padding) | Custom padding needs |

**Props:**
- `padding` - Padding variant (default: `'default'`)
- `as` - HTML tag: `'section'` | `'div'` | `'article'` | `'aside'` | `'footer'` (default: `'section'`)
- `class` - Classes for outer element
- `innerClass` - Classes for inner max-width container
- `id` - Section ID for anchor links

### SectionHeader

**Use `SectionHeader` for consistent H2 patterns** with optional highlighted word and subtitle.

```astro
---
import SectionHeader from './SectionHeader.astro';
---

<!-- Basic -->
<SectionHeader title="Our Services" />

<!-- With highlighted word -->
<SectionHeader title="Our Growth Process" highlightWord="Process" />

<!-- With subtitle -->
<SectionHeader
  title="Frequently Asked Questions"
  highlightWord="Questions"
  subtitle="Find answers to common questions about our services."
/>

<!-- Dark background -->
<SectionHeader title="Our Approach" variant="dark" />

<!-- Centered -->
<SectionHeader title="Meet the Team" align="center" />
```

**Props:**
- `title` - Section title text (required)
- `highlightWord` - Word to highlight with accent color
- `subtitle` - Optional description below title
- `variant` - `'light'` | `'dark'` (default: `'light'`)
- `align` - `'left'` | `'center'` (default: `'left'`)
- `as` - Heading level: `'h1'` | `'h2'` | `'h3'` (default: `'h2'`)
- `class` - Additional classes for container

### Manual Pattern (if not using components)

Only use this when components don't fit your needs:

```astro
<section class="py-16 md:py-20 lg:py-24">
  <div class="px-4 md:px-8 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
        Section Title
      </h2>
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

For carousels using Embla, use the `CarouselNav` component for navigation:

```astro
---
import CarouselNav from './CarouselNav.astro';
---

<!-- Light variant (default) - for light backgrounds -->
<CarouselNav variant="light" />

<!-- Dark variant - for dark backgrounds -->
<CarouselNav variant="dark" />

<!-- With custom gap -->
<CarouselNav variant="dark" class="gap-3" />
```

**CarouselNav variants:**
- `light` - `bg-surface-100 text-surface-700` (use on light backgrounds)
- `dark` - `bg-surface-700 text-white` (use on dark backgrounds like Approach section)

**Important:** The buttons have classes `embla__prev` and `embla__next` which are used by the carousel initialization script in `src/lib/carousel.ts`.

For Embla-specific CSS, keep it in a scoped `<style>` block:

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
- `cta.json`, `hero.json`, `faq.json`, `faq-items.json`, `approach.json`
- `marketing.json`, `partners.json`, `knowledge.json`
- `results.json`, `audit.json`, `case-study-slider.json`, `newsletter.json`

## Adding New Components

1. Create file in `src/components/ui/`
2. Import types from `../../lib/types`
3. **Import `createCMS` from `../../lib/cms` if using CMS data**
4. **Import `asset` from `../../lib/assets` if using static images**
5. **Add `route()` helper if using internal links** (see Internal Route Links above)
6. Define only `Props` interface locally
7. **Use `SectionContainer` for layout** (see Section Layout Components above)
8. **Use `SectionHeader` for section headings** with consistent H2 typography
9. Use styling tokens from `styling.md`
10. **Use `cms.section()` or `cms.slot()` for CMS Control Panel support**
11. **For static text:** Use JSON content layer (see above)
12. **For static images:** Use `asset('/images/...')` for all hardcoded paths
13. **For internal links:** Use `route('/path')` for all hardcoded hrefs
