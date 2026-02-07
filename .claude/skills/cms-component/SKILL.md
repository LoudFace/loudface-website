# CMS Component Creation

Create React components that render Webflow CMS data. For general component patterns (templates, carousel setup, server vs client decisions), see `.claude/rules/component-patterns.md` — it's always loaded in context.

This skill covers **CMS-specific** patterns only.

## Quick Start

```tsx
import { asset } from '@/lib/assets';
import type { CaseStudy, Client } from '@/lib/types';
import { SectionContainer, SectionHeader, Card } from '@/components/ui';
import Link from 'next/link';
```

**Always check `COMPONENTS.md` first** before writing any markup.

## CMS Type Imports

**ALWAYS import CMS types from `@/lib/types`:**

Available types: `CaseStudy`, `Client`, `Testimonial`, `BlogPost`, `Category`, `Industry`, `TeamMember`, `Technology`, `ServiceCategory`, `WebflowImage`

## Field Access Patterns

```typescript
// Direct fields (normalized by API route)
item.name
item.slug
item.id

// Kebab-case fields (Webflow field names)
item['project-title']
item['result-1---number']

// Reference fields (need lookup map)
const clientsMap = new Map(clients.map(c => [c.id, c]));
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
      <Card key={item.id}>
        {/* content */}
      </Card>
    ))}
  </div>
) : (
  <p className="text-surface-500 text-center py-12">No items found.</p>
)}
```

## Static Text vs CMS Data

| Content Type | Solution |
|--------------|----------|
| Static text (headlines, CTAs) | JSON content layer (`src/data/content/`) |
| Webflow CMS items | CMS data fetching (`src/lib/cms-data.ts`) |

### Adding Static Text Support

1. **Create JSON file** in `src/data/content/my-section.json`
2. **Register in** `src/lib/content-utils.ts` (import, type, getter function)
3. **Import in component** and use as default prop values

```tsx
import { getMySectionContent } from '@/lib/content-utils';

export function MySection() {
  const content = getMySectionContent();

  return (
    <SectionContainer>
      <h2 dangerouslySetInnerHTML={{ __html: content.title }} />
      <p dangerouslySetInnerHTML={{ __html: content.description }} />
      <button>{content.ctaText}</button>
    </SectionContainer>
  );
}
```

## Checklist

- [ ] Read `COMPONENTS.md` first — use existing components
- [ ] Import types from `@/lib/types`
- [ ] Use `asset()` for fallback image paths only (not CMS URLs)
- [ ] Use `Link` from `next/link` for internal navigation
- [ ] Handle empty collections gracefully
- [ ] Build lookup maps for reference fields
- [ ] Add `key` prop to all mapped elements

## References

- **Component patterns**: `.claude/rules/component-patterns.md` (templates, server vs client, carousel setup)
- **Styling tokens**: `.claude/rules/styling.md` (colors, typography, spacing)
- **Collection IDs**: `CLAUDE.md` → "CMS Collection IDs" table
- **Component registry**: `COMPONENTS.md` (read before writing any markup)
