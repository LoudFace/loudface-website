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
  "description": "LoudFace is a B2B SaaS web design, SEO, AEO, and growth agency. Webflow Enterprise Partners with 7+ years of experience building conversion-optimized websites.",
  "disambiguatingDescription": "LoudFace is a Dubai-based B2B SaaS web design and growth agency, not to be confused with other entities sharing a similar name.",
  "foundingDate": "2019",
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

### Person Schema (for Blog Post Authors)

Add to blog post pages alongside BlogPosting schema. Strengthens E-E-A-T signals for AI citation (96% of AI Overview content comes from E-E-A-T verified sources).

```tsx
const authorSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": post.author?.name || "LoudFace Team",
  "url": post.author?.url || "https://www.loudface.co/about",
  "jobTitle": post.author?.role || undefined,
  "worksFor": {
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co"
  },
  ...(post.author?.linkedin && {
    "sameAs": [post.author.linkedin]
  }),
  ...(post.author?.image?.url && {
    "image": post.author.image.url
  })
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
/>
```

**Why Person schema matters for AEO**: AI engines use Person schema to verify author expertise. A named author with a LinkedIn profile and job title gets significantly more AI citations than a generic "Team" byline. The r=0.81 correlation between E-E-A-T signals and AI citation makes this one of the highest-impact structured data additions.

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

### HowTo Schema (for Process/Methodology Sections)

Add to pages with step-by-step processes. Research shows FAQ + HowTo + Article combinations deliver 73% higher AI Overview selection rates.

```tsx
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How LoudFace Builds High-Converting Webflow Websites",
  "description": "Our proven 5-step process for designing and developing conversion-optimized Webflow websites for B2B SaaS companies.",
  "totalTime": "PT8W",  // ISO 8601 duration (8 weeks)
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Discovery & Strategy",
      "text": "We audit your current site, analyze competitors, and define conversion goals. This phase includes stakeholder interviews and data analysis.",
      "url": "https://www.loudface.co/services/webflow#discovery"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "UX Research & Wireframing",
      "text": "Information architecture and wireframes based on user research and conversion best practices.",
      "url": "https://www.loudface.co/services/webflow#wireframing"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Visual Design",
      "text": "High-fidelity designs that align with your brand while optimizing for conversion and accessibility.",
      "url": "https://www.loudface.co/services/webflow#design"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Webflow Development",
      "text": "Pixel-perfect implementation in Webflow with clean CMS architecture, responsive design, and performance optimization.",
      "url": "https://www.loudface.co/services/webflow#development"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Launch & Optimization",
      "text": "QA testing, SEO setup, analytics configuration, and post-launch CRO based on real user data.",
      "url": "https://www.loudface.co/services/webflow#launch"
    }
  ]
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
/>
```

**When to use HowTo**: Any page that describes a multi-step process — service methodologies, implementation guides, onboarding flows. The `totalTime` field is optional but recommended. Each step should have a clear `name` and descriptive `text`.

### Speakable Schema (for Voice Assistant Optimization)

Marks key passages for voice assistant extraction. Sites with Speakable markup see 127% increase in voice search referrals.

```tsx
const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      ".speakable-intro",     // First paragraph / executive summary
      ".speakable-definition", // Key definition or answer
      ".speakable-cta"        // Call-to-action / key takeaway
    ]
  },
  "url": "https://www.loudface.co/page-path"
};

// Alternative: use xpath instead of cssSelector
const speakableSchemaXpath = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xpath": [
      "/html/body/main/section[1]/p[1]",
      "/html/body/main/section[2]/h2[1]"
    ]
  }
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
/>
```

**Implementation notes**:
- Mark 2-3 passages per page maximum — quality over quantity
- Best candidates: opening summary paragraph, key definition, primary CTA
- Add corresponding CSS classes to the HTML elements you want voice assistants to read
- Speakable content should be self-contained sentences that make sense when read aloud
- Keep speakable passages under 2-3 sentences each

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

## Schema Stacking for Maximum AI Extraction

Pages with multiple applicable schema types should include ALL relevant schemas. Research shows stacking schemas (e.g., FAQ + HowTo + Article) delivers 73% higher AI Overview selection rates.

### Stacking Rules

1. **Every schema gets its own `<script>` tag** — don't nest unrelated schemas
2. **Shared context**: All schemas on a page should reference the same canonical URL
3. **No conflicts**: If two schemas describe the same property differently, pick one source of truth
4. **BreadcrumbList goes everywhere**: Every page below the homepage gets it

### Recommended Stacks

| Page Pattern | Schema Stack |
|--------------|-------------|
| Service + FAQ | Service + FAQPage + BreadcrumbList |
| Service + Process | Service + HowTo + BreadcrumbList |
| Blog + FAQ | BlogPosting + FAQPage + BreadcrumbList + Person |
| Case Study | Article + BreadcrumbList |
| About + Team | AboutPage + Organization + Person[] |
| Any key page | Add Speakable to mark voice-readable passages |

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
| Blog post detail | BlogPosting, BreadcrumbList, Person (author) |
| Blog listing | CollectionPage |
| Service page | Service, BreadcrumbList, HowTo (if process section) |
| Service page with FAQ | Service, FAQPage, BreadcrumbList |
| SEO industry hub | Service, BreadcrumbList, ItemList |
| SEO industry detail | Service, BreadcrumbList |
| FAQ section | FAQPage |
| About page | AboutPage, BreadcrumbList, Person (team members) |
| Any key page | Speakable (mark 2-3 passages for voice assistants) |
