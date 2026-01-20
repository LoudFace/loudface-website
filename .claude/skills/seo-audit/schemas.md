# JSON-LD Schema Examples

Ready-to-use structured data schemas for LoudFace website.

## Global Schemas (Layout.astro)

These are already implemented in Layout.astro.

### WebSite Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "LoudFace",
  "url": "https://www.loudface.co/"
}
```

### Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LoudFace",
  "url": "https://www.loudface.co",
  "logo": "https://www.loudface.co/images/loudface.svg",
  "description": "LoudFace is a creative agency specializing in Webflow development, brand strategy, and digital marketing.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.instagram.com/loudface.co/",
    "https://www.linkedin.com/company/loudface/",
    "https://dribbble.com/loudface",
    "https://webflow.com/@loudface"
  ]
}
```

## Page-Specific Schemas

### FAQ Schema (for FAQ.astro)

Add this to the FAQ component:

```astro
---
// In FAQ.astro frontmatter
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer.replace(/<[^>]*>/g, '') // Strip HTML tags
    }
  }))
};
---

<!-- Add before closing </section> -->
<script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
```

### Article Schema (for Case Studies)

Add to `src/pages/work/[slug].astro`:

```astro
---
// In frontmatter, after fetching case study data
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": study.name,
  "description": study['project-summary'] || study['short-description'],
  "image": study['main-image']?.url || "https://www.loudface.co/images/og-image.jpg",
  "author": {
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LoudFace",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.loudface.co/images/loudface.svg"
    }
  },
  "datePublished": study['created-on'] || new Date().toISOString(),
  "dateModified": study['updated-on'] || study['created-on'] || new Date().toISOString(),
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://www.loudface.co/work/${study.slug}`
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.loudface.co/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Work",
      "item": "https://www.loudface.co/work"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": study.name
    }
  ]
};
---

<!-- Add in <head> or before </body> -->
<script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
<script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />
```

### BlogPosting Schema (for Blog Posts)

For future blog pages:

```astro
---
const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.excerpt,
  "image": post['featured-image']?.url,
  "author": {
    "@type": "Person",
    "name": post.author?.name || "LoudFace Team",
    "url": post.author?.url || "https://www.loudface.co"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LoudFace",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.loudface.co/images/loudface.svg"
    }
  },
  "datePublished": post['published-on'],
  "dateModified": post['updated-on'] || post['published-on'],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://www.loudface.co/blog/${post.slug}`
  },
  "keywords": post.tags?.join(', ')
};
---

<script type="application/ld+json" set:html={JSON.stringify(blogPostSchema)} />
```

### Service Schema (Optional)

For service pages:

```astro
---
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Webflow Development",
  "description": "Custom Webflow website development and design services.",
  "provider": {
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "serviceType": "Web Development"
};
---

<script type="application/ld+json" set:html={JSON.stringify(serviceSchema)} />
```

### LocalBusiness Schema (Optional)

If emphasizing local presence:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "LoudFace",
  "description": "Creative agency specializing in Webflow development",
  "url": "https://www.loudface.co",
  "logo": "https://www.loudface.co/images/loudface.svg",
  "image": "https://www.loudface.co/images/og-image.jpg",
  "telephone": "+1-XXX-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "postalCode": "90001",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "$$$$"
}
```

## Schema Validation

### Testing Tools

1. **Google Rich Results Test**
   https://search.google.com/test/rich-results

2. **Schema.org Validator**
   https://validator.schema.org/

3. **JSON-LD Playground**
   https://json-ld.org/playground/

### Common Errors to Avoid

| Error | Solution |
|-------|----------|
| Invalid JSON | Use `JSON.stringify()` in Astro |
| Missing required properties | Check schema.org docs |
| Relative URLs | Always use absolute URLs |
| HTML in text fields | Strip tags from CMS content |
| Wrong date format | Use ISO 8601 format |

### Validation Checklist

- [ ] JSON parses without errors
- [ ] All required properties present
- [ ] URLs are absolute (https://...)
- [ ] Dates in ISO 8601 format
- [ ] No HTML in text fields
- [ ] Image URLs resolve
- [ ] No duplicate schemas of same type

## Implementation Pattern

### Astro Best Practice

```astro
---
// Build schema in frontmatter
const schema = {
  "@context": "https://schema.org",
  "@type": "...",
  // ... properties
};
---

<!-- Use set:html with JSON.stringify for proper escaping -->
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### Multiple Schemas on One Page

```astro
---
const schemas = [articleSchema, breadcrumbSchema];
---

{schemas.map(schema => (
  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
))}
```

### Conditional Schemas

```astro
{hasFAQ && (
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
)}
```

## Quick Reference

| Page Type | Schemas to Add |
|-----------|----------------|
| Homepage | WebSite, Organization (global) |
| Case study | Article, BreadcrumbList |
| Blog post | BlogPosting, BreadcrumbList |
| Service page | Service, BreadcrumbList |
| FAQ section | FAQPage |
| About page | Organization (already global) |
| Contact page | LocalBusiness (optional) |
