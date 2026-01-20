# CMS Component Creation

Create Astro components that render Webflow CMS data with proper filtering and control panel support.

## Required Imports

```astro
---
// Adjust path depth based on component location
// From src/components/ui/: use '../lib/'
// From src/pages/: use '../lib/'
import { generateCMSAttributes } from '../lib/cms-attributes';
import { applyCMSConfig } from '../lib/cms-utils';
---
```

## Component Template

```astro
---
// 1. Fetch CMS items
const response = await fetch(`${Astro.url.origin}/api/cms/[collection-name]`);
const rawItems = await response.json();

// 2. Apply server-side filter/sort config
const items = applyCMSConfig(rawItems, 'section-id', 'collection-name');

// 3. Build reference lookups (if needed for reference fields)
const clientsResponse = await fetch(`${Astro.url.origin}/api/cms/clients`);
const clientsList = await clientsResponse.json();
const clients = new Map(clientsList.map(c => [c.id, c]));
const referenceLookups = { clients };
---

<section data-cms-section="unique-section-id" data-cms-label="Display Name">
  {items.map(item => (
    <a
      href={`/[route]/${item.slug}`}
      class="item-class"
      {...generateCMSAttributes(item, 'collection-name', referenceLookups)}
    >
      <!-- Item content -->
      <h3>{item.name}</h3>
      <p>{item.fieldData.description}</p>
    </a>
  ))}
</section>
```

## Collection IDs Reference

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

## Checklist

When creating a CMS component:

- [ ] Use `applyCMSConfig(items, sectionId, collection)` for server-side filtering
- [ ] Use `generateCMSAttributes(item, collection, lookups)` on each item element
- [ ] Add `data-cms-section="section-id"` to the container
- [ ] Add `data-cms-label="Display Name"` for custom panel label (optional)
- [ ] Build reference lookups for any reference fields

## Field Access Patterns

```javascript
// Direct fields (normalized by API)
item.name
item.slug
item.id

// Nested field data
item.fieldData.description
item.fieldData['custom-field']

// Reference fields (need lookup)
const clientName = clients.get(item.fieldData.client)?.name;

// Image fields
item.fieldData.thumbnail?.url
item.fieldData.thumbnail?.alt
```

## Empty State Handling

Always handle empty collections:

```astro
{items.length > 0 ? (
  items.map(item => (
    <div {...generateCMSAttributes(item, 'collection', lookups)}>
      {/* content */}
    </div>
  ))
) : (
  <p class="text-surface-500 text-center py-12">No items found.</p>
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
