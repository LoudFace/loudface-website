# Component Development Patterns

## File Structure

### Server Component (Default)

```tsx
// src/components/sections/MySection.tsx
import { asset } from '@/lib/assets';
import type { CaseStudy, Client } from '@/lib/types';
import { SectionContainer, SectionHeader } from '@/components/ui';

interface MySectionProps {
  title?: string;
  caseStudies: CaseStudy[];
  clients: Client[];
}

export function MySection({
  title = "Default Title",
  caseStudies,
  clients
}: MySectionProps) {
  // Build lookup maps for references
  const clientsMap = new Map(clients.map(c => [c.id, c]));

  return (
    <SectionContainer>
      <SectionHeader title={title} />
      <div className="grid gap-6">
        {caseStudies.map(item => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <img
              src={item['main-project-image-thumbnail']?.url || asset('/images/placeholder.webp')}
              alt={item.name}
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
```

### Client Component

```tsx
// src/components/MyInteractiveComponent.tsx
'use client';

import { useState, useEffect } from 'react';

interface Props {
  initialValue?: string;
}

export function MyInteractiveComponent({ initialValue = '' }: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Browser-only code here
  }, []);

  return (
    <button onClick={() => setValue('clicked')}>
      {value}
    </button>
  );
}
```

## Type Imports

**ALWAYS import CMS types from `@/lib/types`:**

```typescript
// CORRECT
import type { CaseStudy, Client, Testimonial, BlogPost } from '@/lib/types';

// WRONG - Don't define local interfaces for CMS types
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

**ALWAYS use `asset()` for hardcoded image paths.** This keeps all asset references going through one place.

```tsx
import { asset } from '@/lib/assets';

// CORRECT - uses asset()
<img src={asset('/images/logo.svg')} alt="Logo" />

// WRONG - will 404 in production
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

```tsx
{content.items.map((item) => (
  <img key={item.id} src={asset(item.icon)} alt={item.title} />
))}
```

### CMS Image Optimization

For CMS images (remote Webflow URLs), use helpers from `@/lib/image-utils` for resizing and WebP conversion:

```tsx
import { thumbnailImage, logoImage, avatarImage, heroImage } from '@/lib/image-utils';

// Cards/grids (800px)
<img src={thumbnailImage(item.thumbnail?.url) || asset('/images/placeholder.webp')} />

// Client logos (200px)
<img src={logoImage(client['colored-logo']?.url)} />

// Profile pictures (80px)
<img src={avatarImage(member['profile-image']?.url)} />

// Hero images (responsive srcset)
const hero = heroImage(item['main-project-image-thumbnail']?.url);
<img src={hero.src} srcSet={hero.srcset} sizes="..." />
```

### Fallback Images

For CMS images with fallbacks, use `asset()` only for the fallback:

```tsx
<img src={thumbnailImage(item.thumbnail?.url) || asset('/images/placeholder.webp')} />
```

## Internal Links (CRITICAL)

**Use Next.js `Link` component for all internal navigation.** It handles client-side transitions and prefetching.

```tsx
import Link from 'next/link';

// CORRECT
<Link href="/work">Our Work</Link>
<Link href={`/work/${item.slug}`}>View Case Study</Link>

// WRONG - loses client-side navigation
<a href="/work">Our Work</a>
```

### When to Use `Link`

| Link Type | Component |
|-----------|-----------|
| Internal pages (`/work`, `/blog`) | `<Link>` |
| Dynamic routes (`/work/${slug}`) | `<Link>` |
| External URLs (https://...) | `<a>` |
| Anchor links (`#section`) | `<a>` |
| Download links | `<a>` |

## Button Usage

**Use the Button component when possible:**

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" href="/contact">
  Get Started
</Button>
```

**Button variants:**
- `primary` - Dark background (surface-900)
- `secondary` - Brand color (primary-600)
- `ghost` - Transparent with hover
- `outline` - Border only

## Section Layout Components

### SectionContainer (CRITICAL)

**ALWAYS use `SectionContainer` for page sections.** This ensures consistent padding, max-width, and horizontal gutters.

```tsx
import { SectionContainer } from '@/components/ui';

// Standard section
<SectionContainer>
  {/* content */}
</SectionContainer>

// With padding variant
<SectionContainer padding="lg">
  {/* content */}
</SectionContainer>

// With custom classes
<SectionContainer className="bg-surface-900" innerClassName="text-white">
  {/* content */}
</SectionContainer>
```

**Padding variants:** See `styling.md` for the full table (`default`, `sm`, `lg`, `none`).

### SectionHeader

**Use `SectionHeader` for consistent H2 patterns:**

```tsx
import { SectionHeader } from '@/components/ui';

// Basic
<SectionHeader title="Our Services" />

// With highlighted word
<SectionHeader title="Our Growth Process" highlightWord="Process" />

// With subtitle
<SectionHeader
  title="Frequently Asked Questions"
  highlightWord="Questions"
  subtitle="Find answers to common questions about our services."
/>

// Dark background
<SectionHeader title="Our Approach" variant="dark" />
```

## Card Patterns

**Use the `Card` component** for all card surfaces. Don't write raw card markup.

```tsx
import { Card } from '@/components/ui';

{/* Light background — default */}
<Card>
  <h3 className="text-lg font-medium text-surface-900">Title</h3>
  <p className="mt-2 text-surface-600">Description text</p>
</Card>

{/* Dark standalone container */}
<Card variant="dark">
  <h3 className="text-lg font-medium">Title</h3>
  <p className="mt-2 text-surface-300">Description text</p>
</Card>

{/* Glass card inside a dark section */}
<Card variant="glass">
  <h3 className="text-lg font-medium text-white">Title</h3>
  <p className="mt-2 text-surface-300">Description text</p>
</Card>

{/* Custom padding and no hover */}
<Card padding="lg" hover={false} className="text-center">
  <p>Static content</p>
</Card>
```

**Card variants:**

| Variant | Background | Border | Hover | Use On |
|---------|------------|--------|-------|--------|
| `default` | `bg-white` | `border-surface-200` | Border lightens + shadow | Light backgrounds |
| `dark` | `bg-surface-900` | none | Lightens to `surface-800` | Standalone dark containers |
| `glass` | `bg-white/5` | none | Opacity increases | Inside dark sections |

**Padding:** `sm` (p-4), `md` (p-6, default), `lg` (p-8), `none`

## Link Patterns

**Clickable card link** (card with image + content that links to a detail page):
```tsx
<Link
  href={`/work/${item.slug}`}
  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden
    transition-all duration-200 hover:border-surface-300 hover:shadow-md
    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
>
  <div className="aspect-video overflow-hidden">
    <img
      src={item.thumbnail?.url || asset('/images/placeholder.webp')}
      alt={item.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  </div>
  <div className="p-6">
    <h3 className="font-medium text-lg text-surface-900">{item.name}</h3>
    <p className="mt-2 text-sm text-surface-600">{item.description}</p>
  </div>
</Link>
```

Use this pattern — not the `Card` component — when the entire card is a link with image cropping and group hover effects. `Card` is for non-interactive content surfaces.

**Nav link:**
```tsx
<Link className="text-nav font-medium text-surface-600 hover:text-surface-900
  hover:bg-surface-50 rounded-lg px-3 py-2 transition-colors">
```

## Carousel Components

For carousels using Embla, use the `CarouselNav` component and `useCarousel` hook:

```tsx
'use client';

import { useCarousel } from '@/hooks/useCarousel';
import { CarouselNav } from '@/components/ui';

export function MyCarousel({ items }) {
  const { emblaRef, scrollPrev, scrollNext } = useCarousel({ loop: true });

  return (
    <div>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {items.map(item => (
            <div key={item.id} className="embla__slide">
              {/* slide content */}
            </div>
          ))}
        </div>
      </div>
      <CarouselNav variant="light" onPrevClick={scrollPrev} onNextClick={scrollNext} />
    </div>
  );
}
```

**CarouselNav variants:**
- `light` - For light backgrounds
- `dark` - For dark backgrounds

## Accessibility Requirements

1. **Focus states:** Always use `focus-visible:` (not `focus:`)
2. **Skip link:** Include skip link in Layout
3. **ARIA labels:** Required for icon-only buttons
4. **Color contrast:** Use semantic color tokens (they're WCAG AA compliant)
5. **Alt text:** Required for all informative images

## Content with HTML (dangerouslySetInnerHTML)

For text that may contain `<br>` tags from the JSON content layer:

```tsx
// Text that may have line breaks
<h1 dangerouslySetInnerHTML={{ __html: content.headline }} />
<p dangerouslySetInnerHTML={{ __html: content.description }} />

// Single-line text (no HTML)
<button>{content.ctaText}</button>
```

## Static Content Integration

For components with static text, use the JSON content layer:

```tsx
import { getHeroContent } from '@/lib/content-utils';

export function Hero() {
  const content = getHeroContent();

  return (
    <section>
      <h1 dangerouslySetInnerHTML={{ __html: content.headline }} />
      <p>{content.description}</p>
      <button>{content.ctaText}</button>
    </section>
  );
}
```

## Dark Section Recipe

When building a section on a dark background, follow this complete recipe. Missing any step creates visual inconsistency.

```tsx
import { SectionContainer, SectionHeader, Card } from '@/components/ui';

export function MyDarkSection() {
  return (
    <SectionContainer padding="lg" className="bg-surface-800 text-surface-300">
      {/* Header uses dark variant — flips text to white + muted highlights */}
      <SectionHeader
        title="Section Title"
        highlightWord="Title"
        subtitle="Description text for this section."
        variant="dark"
      />

      {/* Content gap */}
      <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Use glass cards inside dark sections */}
        <Card variant="glass">
          <h3 className="text-lg font-medium text-white">Card Heading</h3>
          <p className="mt-2">Body text inherits text-surface-300 from parent</p>
        </Card>
      </div>
    </SectionContainer>
  );
}
```

**Checklist for dark sections:**

| Element | Class | Why |
|---------|-------|-----|
| Container bg | `bg-surface-800` or `bg-surface-900` | Dark section background |
| Default text | `text-surface-300` on container | Body text color (inherited) |
| SectionHeader | `variant="dark"` | Flips to white headings, muted highlights |
| Headings inside | `text-white` | Stand out against dark bg |
| Muted text | `text-surface-500` | Stats labels, secondary info |
| Cards | `Card variant="glass"` | Frosted glass effect |
| Dividers | `bg-surface-700` | Visible but subtle borders |
| Focus rings | `focus-visible:outline-primary-500` | Same as light (already set globally) |

**Never use** `bg-surface-50`, `border-surface-200`, or `text-surface-900` inside dark sections — they belong to light contexts.

## Page Template Archetype

Every new page follows the same composition. This ensures structural consistency across the site.

```tsx
// src/app/my-page/page.tsx
import type { Metadata } from 'next';
import { SectionContainer, SectionHeader } from '@/components/ui';
import { CTA } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Page Title',  // 50-60 chars, uses template from layout (" | LoudFace")
  description: 'Compelling meta description with primary keyword and CTA.', // 150-160 chars
};

export default async function MyPage() {
  // 1. Data fetching at the top (CMS or JSON content)
  // const content = getMyPageContent();
  // const cmsData = await fetchMyData(accessToken);

  return (
    <>
      {/* 2. Hero/intro section — one per page */}
      <SectionContainer padding="lg">
        <SectionHeader
          as="h1"
          title="Page Headline"
          highlightWord="Headline"
          subtitle="Supporting description."
        />
        {/* Hero-specific content */}
      </SectionContainer>

      {/* 3. Content sections — as many as needed */}
      <SectionContainer>
        <SectionHeader title="Section Title" highlightWord="Title" />
        <div className="mt-8 lg:mt-12">
          {/* Section content: cards grid, text, etc. */}
        </div>
      </SectionContainer>

      {/* 4. Optional: dark section for visual contrast */}
      <SectionContainer padding="lg" className="bg-surface-800 text-surface-300">
        <SectionHeader title="Dark Section" variant="dark" />
        {/* Dark section content */}
      </SectionContainer>

      {/* 5. CTA — every page ends with this */}
      <CTA />
    </>
  );
}
```

**Page composition rules:**
1. One `h1` per page (use `SectionHeader as="h1"` for the hero heading)
2. All subsequent section headings are `h2` (SectionHeader default)
3. Every page ends with `<CTA />`
4. Metadata uses the `title` template from layout — just provide the page-specific part
5. Data fetching happens at the top of the component, not inline
6. Content sections use `SectionContainer` — never raw `<section>` tags

## Adding New Components

1. Create file in `src/components/sections/` or `src/components/ui/`
2. Import types from `@/lib/types`
3. Import `asset` from `@/lib/assets` if using static images
4. Use `Link` from `next/link` for internal navigation
5. Use `SectionContainer` for layout
6. Use `SectionHeader` for section headings
7. For interactivity, add `'use client'` directive at top
8. Export named function (not default export for sections)

## Server vs Client Decision

| Need | Component Type |
|------|----------------|
| Data fetching | Server |
| Static rendering | Server |
| useState/useEffect | Client |
| Event handlers (onClick) | Client |
| Browser APIs | Client |
| useCarousel hook | Client |
| Form state | Client |

**Rule:** Start with Server Component. Add `'use client'` only when needed.
