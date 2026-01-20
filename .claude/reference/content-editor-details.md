# Content Editor Reference

Detailed documentation for the JSON-based content editor system. This file is loaded on-demand, not on every request.

## Content Files Inventory

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

```astro
---
import { getMySectionContent } from '../../lib/content-utils';
const content = getMySectionContent();
const { title = content.title } = Astro.props;
---

<h2 set:html={title} />
```

## Rendering Rules

| Content Type | Syntax | When to Use |
|--------------|--------|-------------|
| May have line breaks | `set:html={content.field}` | Headlines, descriptions |
| Single-line only | `{content.field}` | Button text, labels |

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/content-utils.ts` | Getters and types |
| `src/pages/api/dev/content.ts` | Save API (dev-only) |
| `src/pages/dev/editor.astro` | Editor UI |
| `src/data/content/*.json` | Content storage |

## Dev-Only Guards

All editor features blocked in production via `import.meta.env.PROD` checks:
- `/dev/editor` → 404
- `/api/dev/content` → 403
