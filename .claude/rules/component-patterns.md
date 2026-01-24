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

**ALWAYS use `asset()` for hardcoded image paths.** This is required for Webflow Cloud deployment.

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

### Fallback Images

For CMS images with fallbacks, use `asset()` only for the fallback:

```tsx
<img src={item['profile-image']?.url || asset('/images/placeholder-avatar.svg')} />
```

## Internal Links (CRITICAL)

**Use Next.js `Link` component for all internal navigation.** It automatically handles the basePath.

```tsx
import Link from 'next/link';

// CORRECT - Link handles basePath automatically
<Link href="/work">Our Work</Link>
<Link href={`/work/${item.slug}`}>View Case Study</Link>

// WRONG - bypasses basePath handling
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

**Padding variants:**

| Variant | Classes | Use For |
|---------|---------|---------|
| `default` | `py-16 md:py-20 lg:py-24` | Standard sections |
| `sm` | `py-12 md:py-16` | Compact sections |
| `lg` | `py-16 md:py-24 lg:py-32` | Hero-adjacent, feature sections |
| `none` | (no padding) | Custom padding needs |

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

**Standard card:**
```tsx
<div className="bg-white rounded-xl border border-surface-200 p-6
  hover:border-surface-300 hover:shadow-md transition-all duration-200">
```

**Dark card:**
```tsx
<div className="bg-surface-900 rounded-xl p-6">
```

**Glass card (dark backgrounds only):**
```tsx
<div className="bg-white/5 hover:bg-white/[0.08] rounded-xl p-6 transition-colors">
```

## Link Patterns

**Clickable card:**
```tsx
<Link
  href={item.url}
  className="block transition-opacity duration-200 hover:opacity-75
    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4 rounded-lg"
>
```

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
  const [emblaRef, emblaApi] = useCarousel({ loop: true });

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
      <CarouselNav emblaApi={emblaApi} variant="light" />
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
