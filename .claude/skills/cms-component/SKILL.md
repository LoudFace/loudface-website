# CMS Component Creation

Create React components that render Webflow CMS data with proper typing and patterns for Next.js.

## Required Imports

```tsx
// For Server Components (default)
import { asset } from '@/lib/assets';  // For static image paths
import type { CaseStudy, Client } from '@/lib/types';

// For Client Components (only when needed)
'use client';
import { useState, useEffect } from 'react';
```

## Server Component Template (Default)

```tsx
// src/components/sections/MySection.tsx
import { asset } from '@/lib/assets';
import type { CaseStudy, Client } from '@/lib/types';
import { SectionContainer, SectionHeader } from '@/components/ui';

interface MySectionProps {
  caseStudies: CaseStudy[];
  clients: Client[];
}

export function MySection({ caseStudies, clients }: MySectionProps) {
  // Build lookup maps for references
  const clientsMap = new Map(clients.map(c => [c.id, c]));

  return (
    <SectionContainer>
      <SectionHeader title="Case Studies" />
      <div className="grid gap-6">
        {caseStudies.map(item => (
          <a
            key={item.id}
            href={`/work/${item.slug}`}
            className="block hover:opacity-75 transition-opacity"
          >
            <h3>{item.name}</h3>
            <img
              src={item['main-project-image-thumbnail']?.url || asset('/images/placeholder.webp')}
              alt={item.name}
            />
          </a>
        ))}
      </div>
    </SectionContainer>
  );
}
```

## Client Component Template

```tsx
// src/components/MyCarousel.tsx
'use client';

import { useCarousel } from '@/hooks/useCarousel';
import { CarouselNav } from '@/components/ui';
import type { CaseStudy } from '@/lib/types';

interface MyCarouselProps {
  items: CaseStudy[];
}

export function MyCarousel({ items }: MyCarouselProps) {
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

## API Reference

### Type Imports

**ALWAYS import CMS types from `@/lib/types`:**

```typescript
import type { CaseStudy, Client, Testimonial, BlogPost } from '@/lib/types';
```

Available types:
- `CaseStudy`, `Client`, `Testimonial`, `BlogPost`
- `Category`, `Industry`, `TeamMember`, `Technology`
- `ServiceCategory`, `WebflowImage`

### Collection IDs

See `CLAUDE.md` → "CMS Collection IDs Reference" for the full table of collection IDs and API routes.

## Checklist

When creating a CMS component:

- [ ] Create as Server Component by default (no `'use client'`)
- [ ] Import types from `@/lib/types`
- [ ] Use `asset()` for fallback image paths
- [ ] Use `SectionContainer` for layout
- [ ] Use `SectionHeader` for section headings
- [ ] Use `Link` from `next/link` for internal navigation
- [ ] Add `'use client'` only if using hooks/state/effects
- [ ] Add `key` prop to all mapped elements

## Field Access Patterns

```typescript
// Direct fields (normalized by API)
item.name
item.slug
item.id

// Kebab-case fields
item['project-title']
item['result-1---number']

// Reference fields (need lookup)
const client = clientsMap.get(item.client);
const clientName = client?.name;

// Image fields with fallback
item.thumbnail?.url || asset('/images/placeholder.webp')
item['profile-image']?.url || asset('/images/placeholder-avatar.svg')
```

## Empty State Handling

Always handle empty collections:

```tsx
{items.length > 0 ? (
  <div className="grid gap-6">
    {items.map(item => (
      <div key={item.id}>
        {/* content */}
      </div>
    ))}
  </div>
) : (
  <p className="text-surface-500 text-center py-12">No items found.</p>
)}
```

## Static Text vs CMS Data

| Content Type | Solution |
|--------------|----------|
| Static text (headlines, CTAs) | JSON content layer |
| Webflow CMS items | CMS data fetching |

### Adding Static Text Support

1. **Create JSON file** in `src/data/content/my-section.json`
2. **Register in** `src/lib/content-utils.ts` (import, type, getter function)
3. **Import in component** and use as default prop values

```tsx
import { getMySectionContent } from '@/lib/content-utils';

export function MySection() {
  const content = getMySectionContent();

  return (
    <section>
      {/* Use dangerouslySetInnerHTML for text that may have line breaks */}
      <h2 dangerouslySetInnerHTML={{ __html: content.title }} />
      <p dangerouslySetInnerHTML={{ __html: content.description }} />

      {/* Use regular interpolation for single-line text */}
      <button>{content.ctaText}</button>
    </section>
  );
}
```

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

See `.claude/rules/component-patterns.md` for full documentation.
