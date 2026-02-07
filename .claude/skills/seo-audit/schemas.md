# JSON-LD Schema Examples

Ready-to-use structured data schemas for LoudFace website (Next.js App Router).

## Global Schemas (src/app/layout.tsx)

These are already implemented in the root layout.

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

### FAQ Schema (for FAQ component)

Add this to the FAQ section component:

```tsx
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

// Add inside the component JSX
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

### Article Schema (for Case Studies)

Add to `src/app/work/[slug]/page.tsx`:

```tsx
// In the page component, after fetching case study data
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
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.loudface.co/" },
    { "@type": "ListItem", "position": 2, "name": "Work", "item": "https://www.loudface.co/work" },
    { "@type": "ListItem", "position": 3, "name": study.name }
  ]
};

// Add inside the component JSX
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
/>
```

### BlogPosting Schema (for Blog Posts)

For blog post pages at `src/app/blog/[slug]/page.tsx`:

```tsx
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

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
/>
```

### Service Schema (Optional)

```tsx
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
  "areaServed": { "@type": "Country", "name": "United States" },
  "serviceType": "Web Development"
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
/>
```

### LocalBusiness Schema (Optional)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "LoudFace",
  "description": "Creative agency specializing in Webflow development",
  "url": "https://www.loudface.co",
  "logo": "https://www.loudface.co/images/loudface.svg",
  "image": "https://www.loudface.co/images/og-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "addressCountry": "US"
  }
}
```

## Schema Validation

### Testing Tools

1. **Google Rich Results Test** - https://search.google.com/test/rich-results
2. **Schema.org Validator** - https://validator.schema.org/
3. **JSON-LD Playground** - https://json-ld.org/playground/

### Common Errors to Avoid

| Error | Solution |
|-------|----------|
| Invalid JSON | Use `JSON.stringify()` with `dangerouslySetInnerHTML` |
| Missing required properties | Check schema.org docs |
| Relative URLs | Always use absolute URLs |
| HTML in text fields | Strip tags from CMS content |
| Wrong date format | Use ISO 8601 format |

## Implementation Pattern

### Next.js Best Practice

```tsx
// Build schema object in the component
const schema = {
  "@context": "https://schema.org",
  "@type": "...",
  // ... properties
};

// Use dangerouslySetInnerHTML for proper escaping
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

### Multiple Schemas on One Page

```tsx
{[articleSchema, breadcrumbSchema].map((schema, i) => (
  <script
    key={i}
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
))}
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
