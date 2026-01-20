# CMS Component Creation

Create Astro components that render Webflow CMS data with proper filtering and control panel support.

## Required Imports

```astro
---
// From src/components/ui/: use '../../lib/'
import { createCMS } from '../../lib/cms';
import { asset } from '../../lib/assets';  // For static image paths
import type { CaseStudy, Client } from '../../lib/types';
---
```

## Component Template

```astro
---
import { createCMS } from '../../lib/cms';
import { asset } from '../../lib/assets';
import type { CaseStudy, Client } from '../../lib/types';

interface Props {
  caseStudies: CaseStudy[];
  clients?: Map<string, Client>;
}

const { caseStudies: rawCaseStudies, clients = new Map() } = Astro.props;

// Create CMS helper - auto-generates section IDs
const cms = createCMS('MyComponent');

// For multi-item sections (sliders, grids)
const slider = cms.section(rawCaseStudies as (CaseStudy & { id: string })[], 'case-studies', 'Case Studies');

// For single-item sections (featured slots)
// const featured = cms.slot(rawCaseStudies as (CaseStudy & { id: string })[], 'case-studies', 'Featured Item');

// Build reference lookups for displaying names
const referenceLookups = { clients };
---

<!-- Multi-item section -->
<section>
  <div {...slider.attrs}>
    {slider.items.map(item => (
      <a
        href={`/work/${item.slug}`}
        class="item-class"
        {...cms.item(item, 'case-studies', referenceLookups)}
      >
        <h3>{item.name}</h3>
        <img src={item['main-project-image-thumbnail']?.url || asset('/images/placeholder.webp')} alt={item.name} />
      </a>
    ))}
  </div>
</section>
```

## API Reference

**`createCMS(componentName: string)`**
Creates a CMS helper instance. Section IDs are auto-generated as `{component-name}-{collection}-{index}`.

**`cms.section(items, collection, label?)`**
For multi-item sections (sliders, grids). Returns:
```typescript
{ items: T[], sectionId: string, attrs: Record<string, string> }
```

**`cms.slot(items, collection, label?)`**
For single-item sections (featured slots). Returns:
```typescript
{ item: T | undefined, sectionId: string, attrs: Record<string, string> }
```

**`cms.item(item, collection, lookups?)`**
Generates data attributes for a single CMS item. Spread onto the item element.

## Collection IDs

See `CLAUDE.md` → "CMS Collection IDs Reference" for the full table of collection IDs and API routes.

## Checklist

When creating a CMS component:

- [ ] Import `createCMS` from `../../lib/cms`
- [ ] Create CMS helper: `const cms = createCMS('ComponentName')`
- [ ] Use `cms.section()` for multi-item sections or `cms.slot()` for single items
- [ ] Spread `{...section.attrs}` on the container element
- [ ] Spread `{...cms.item(item, collection, lookups)}` on each item element
- [ ] Build reference lookups for any reference fields
- [ ] Use `asset()` for fallback image paths

## Field Access Patterns

```javascript
// Direct fields (normalized by API)
item.name
item.slug
item.id

// Kebab-case fields
item['project-title']
item['result-1---number']

// Reference fields (need lookup)
const client = clients.get(item.client);
const clientName = client?.name;

// Image fields with fallback
item.thumbnail?.url || asset('/images/placeholder.webp')
item['profile-image']?.url || asset('/images/placeholder-avatar.svg')
```

## Empty State Handling

Always handle empty collections:

```astro
{slider.items.length > 0 ? (
  <div {...slider.attrs}>
    {slider.items.map(item => (
      <div {...cms.item(item, 'collection', lookups)}>
        {/* content */}
      </div>
    ))}
  </div>
) : (
  <p class="text-surface-500 text-center py-12">No items found.</p>
)}
```

## Single-Item Slots

For independently configurable single items (e.g., featured case study):

```astro
---
// Multiple slots from the same collection - each independently configurable
const slot1 = cms.slot(rawCaseStudies as (CaseStudy & { id: string })[], 'case-studies', 'Featured 1');
const slot2 = cms.slot(rawCaseStudies as (CaseStudy & { id: string })[], 'case-studies', 'Featured 2');
---

{slot1.item && (
  <div {...slot1.attrs}>
    <div {...cms.item(slot1.item, 'case-studies', referenceLookups)}>
      <h3>{slot1.item.name}</h3>
    </div>
  </div>
)}
```

## Static Text vs CMS Data

| Content Type | Solution | Editable Via |
|--------------|----------|--------------|
| Hardcoded text (headlines, CTAs) | JSON content layer | `/dev/editor` |
| Webflow CMS items | This skill's patterns | CMS Control Panel |

For static text in components (section titles, button labels, descriptions), use the JSON content layer.

### Adding Static Text Support

1. **Create JSON file** in `src/data/content/my-section.json`
2. **Register in** `src/lib/content-utils.ts` (import, type, getter function)
3. **Import in component** and use as default prop values

```astro
---
import { createCMS } from '../../lib/cms';
import { getMySectionContent } from '../../lib/content-utils';
const content = getMySectionContent();

const { title = content.title, description = content.description } = Astro.props;
---

<!-- Use set:html for text that may have line breaks -->
<h2 set:html={title} />
<p set:html={description} />

<!-- Use regular interpolation for single-line text (buttons, labels) -->
<button>{content.ctaText}</button>
```

### Line Breaks

The `/dev/editor` automatically converts Enter key presses to `<br>` tags:
- **Editing**: Type normally, press Enter for line breaks
- **JSON**: Stores proper `<br>` HTML tags
- **Rendering**: Use `set:html={content.field}` for fields that may have line breaks

See `.claude/rules/component-patterns.md` for full documentation.
