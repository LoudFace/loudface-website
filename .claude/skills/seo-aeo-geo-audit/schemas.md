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
    "addressLocality": "Dubai",
    "addressCountry": "AE"
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

Add to `src/app/case-studies/[slug]/page.tsx`:

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
    "@id": `https://www.loudface.co/case-studies/${study.slug}`
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.loudface.co/" },
    { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": "https://www.loudface.co/case-studies" },
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

### AboutPage Schema (for About Page)

Add to `src/app/about/page.tsx` — strengthens entity identity for AEO:

```tsx
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About LoudFace",
  "description": "Learn about LoudFace, our mission, and the team behind your next successful web project.",
  "url": "https://www.loudface.co/about",
  "mainEntity": {
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co",
    "description": "B2B SaaS web design, SEO, AEO, and growth agency. Webflow Enterprise Partners with 7+ years of experience.",
    "foundingDate": "2019",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressCountry": "AE"
    },
    // Include team members if available from CMS
    ...(teamMembers.length > 0 && {
      "employee": teamMembers.map(member => ({
        "@type": "Person",
        "name": member.name,
        "jobTitle": member['job-title'] || undefined,
      })),
    }),
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.loudface.co" },
    { "@type": "ListItem", "position": 2, "name": "About" },
  ],
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
    "addressLocality": "Dubai",
    "addressCountry": "AE"
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

**CRITICAL**: Always use native `<script>`, never `<Script>` from `next/script`. The `<Script>` component defers loading, which means crawlers that render only initial HTML will miss your structured data entirely.

```tsx
// CORRECT — rendered in initial SSR HTML, visible to all crawlers
const schema = {
  "@context": "https://schema.org",
  "@type": "...",
  // ... properties
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>

// WRONG — deferred, crawlers may miss it
import Script from 'next/script';
<Script id="schema" type="application/ld+json" ... />
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
| Case study detail | Article, BreadcrumbList |
| Case studies listing | CollectionPage |
| Blog post detail | BlogPosting, BreadcrumbList |
| Blog listing | CollectionPage |
| Service page | Service, BreadcrumbList |
| SEO industry hub | Service, BreadcrumbList, ItemList |
| SEO industry detail | Service, BreadcrumbList |
| FAQ section | FAQPage |
| About page | AboutPage, BreadcrumbList |
