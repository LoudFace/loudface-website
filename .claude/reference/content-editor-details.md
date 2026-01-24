# Content Editor Reference

Detailed documentation for the JSON-based content editor system. This file is loaded on-demand, not on every request.

## Content Files Inventory

| File | Component | Fields |
|------|-----------|--------|
| `cta.json` | CTA.tsx | title, subtitle, ctaText |
| `hero.json` | Hero.tsx | headline, description, ctaText, aiLinks |
| `faq.json` | FAQ.tsx | title, subtitle, footerTitle, footerText, footerCtaText |
| `approach.json` | Approach.tsx | title, highlightWord, subtitle, steps[], statsHeading, stats[] |
| `marketing.json` | Marketing.tsx | title, titleHighlight, subtitle, description, cards[], ctaText |
| `partners.json` | Partners.tsx | starRatingPrefix, starRatingSuffix, tagline |
| `knowledge.json` | Knowledge.tsx | title, highlightWord, description, readTime |
| `results.json` | Results.tsx | title, subtitle, videoTestimonials[], ctaText, ctaHref |
| `audit.json` | Audit.tsx | title, highlightText, description, challenges[] |
| `case-study-slider.json` | CaseStudySlider.tsx | title, ctaText |
| `newsletter.json` | NewsletterForm.tsx | placeholder, buttonText, loadingText, successMessage, errorMessage, networkErrorMessage |

All files located in `src/data/content/`.

## Adding New Content

### 1. Create JSON file

```json
// src/data/content/my-section.json
{
  "title": "My Title",
  "description": "My description",
  "ctaText": "Click here"
}
```

### 2. Register in content-utils.ts

```typescript
// Add import
import myContent from '../data/content/my-section.json';

// Add type
export interface MySectionContent {
  title: string;
  description: string;
  ctaText: string;
}

// Add to registry
const contentRegistry: Record<string, unknown> = {
  // ...existing
  'my-section': myContent,
};

// Add getter
export function getMySectionContent(): MySectionContent {
  return myContent as MySectionContent;
}
```

### 3. Use in component

```tsx
import { getMySectionContent } from '@/lib/content-utils';

export function MySection({ title }: { title?: string }) {
  const content = getMySectionContent();
  const displayTitle = title ?? content.title;

  return (
    <h2 dangerouslySetInnerHTML={{ __html: displayTitle }} />
  );
}
```

## Rendering Rules

| Content Type | Syntax | When to Use |
|--------------|--------|-------------|
| May have line breaks | `dangerouslySetInnerHTML={{ __html: content.field }}` | Headlines, descriptions |
| Single-line only | `{content.field}` | Button text, labels |

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/content-utils.ts` | Getters and types |
| `src/app/api/dev/content/route.ts` | Save API (dev-only) |
| `src/app/dev/editor/page.tsx` | Editor UI |
| `src/data/content/*.json` | Content storage |

## Dev-Only Guards

All editor features blocked in production via `process.env.NODE_ENV` checks:
- `/dev/editor` → 404 in production
- `/api/dev/content` → 403 in production
