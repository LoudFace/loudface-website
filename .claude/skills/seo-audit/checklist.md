# SEO Audit Detailed Checklist

Complete checklist for thorough SEO audits.

## Technical SEO

### Meta Tags

| Check | Required | Notes |
|-------|----------|-------|
| `<title>` tag | ✅ | 50-60 characters, includes keyword |
| `<meta name="description">` | ✅ | 150-160 chars, compelling CTA |
| `<meta name="robots">` | ✅ | Usually "index, follow" |
| `<meta name="viewport">` | ✅ | For mobile responsiveness |
| `<link rel="canonical">` | ✅ | Self-referencing or to canonical |
| `<html lang="en">` | ✅ | Language declaration |

### Open Graph Tags

| Tag | Required | Notes |
|-----|----------|-------|
| `og:title` | ✅ | Can differ from title tag |
| `og:description` | ✅ | Can differ from meta description |
| `og:image` | ✅ | 1200x630px recommended |
| `og:url` | ✅ | Canonical URL |
| `og:type` | ✅ | Usually "website" or "article" |
| `og:site_name` | ⚠️ | "LoudFace" |
| `og:locale` | ⚠️ | "en_US" |

### Twitter Cards

| Tag | Required | Notes |
|-----|----------|-------|
| `twitter:card` | ✅ | "summary_large_image" |
| `twitter:title` | ✅ | |
| `twitter:description` | ✅ | |
| `twitter:image` | ✅ | Same as OG image |
| `twitter:site` | ⚠️ | @loudface |

## Content Structure

### Headings

| Check | Requirement |
|-------|-------------|
| H1 count | Exactly 1 per page |
| H1 content | Contains primary keyword |
| H1 position | First major heading |
| Hierarchy | H1 → H2 → H3 (no skips) |
| H2 count | 3-5 for standard pages |
| H2 content | Describe major sections |

### Content Quality

| Check | Requirement |
|-------|-------------|
| Word count | Appropriate for page type |
| First paragraph | Hook + keyword + value prop |
| Keyword density | 1-2% (natural) |
| Readability | Short paragraphs, bullet lists |
| Unique content | No duplicate from other pages |

### Page Type Word Counts

| Type | Target | Minimum |
|------|--------|---------|
| Homepage | 500-1000 | 300 |
| Service page | 800-1200 | 500 |
| Case study | 1000-1500 | 800 |
| Blog post | 1500-2500 | 1000 |
| Landing page | 300-800 | 200 |

## Images

### Alt Text

| Scenario | Alt Text |
|----------|----------|
| Informative image | Descriptive, includes context |
| Product screenshot | Describe what's shown |
| Decorative/pattern | `alt=""` (empty) |
| Logo | "Company Name logo" |
| Icon | Describe function if interactive |

### Technical

| Check | Requirement |
|-------|-------------|
| `alt` attribute | Present on all `<img>` |
| `loading` attribute | "lazy" for below-fold |
| `width`/`height` | Set to prevent CLS |
| Format | WebP preferred |
| Static paths | Use `asset()` function |

## Internal Linking

### Requirements

| Check | Requirement |
|-------|-------------|
| Links per page | 3-5 minimum |
| Anchor text | Descriptive, keyword-rich |
| Relevance | Links make contextual sense |
| Broken links | None (all resolve) |

### Anchor Text Examples

| Good | Bad |
|------|-----|
| "Webflow development services" | "click here" |
| "view our case studies" | "here" |
| "conversion rate optimization guide" | "this article" |
| "contact our team" | "more info" |

## Structured Data

### Global Schemas (Layout.astro)

| Schema | Status | Notes |
|--------|--------|-------|
| WebSite | Required | Site name, URL |
| Organization | Required | Name, logo, social links |

### Page-Specific Schemas

| Page Type | Schemas Needed |
|-----------|----------------|
| Case study | Article, BreadcrumbList |
| Blog post | BlogPosting, BreadcrumbList |
| FAQ section | FAQPage |
| Service page | Service (optional) |
| Team page | Person (optional) |

### Schema Validation

- [ ] Valid JSON syntax
- [ ] Required properties present
- [ ] URLs are absolute
- [ ] No console errors
- [ ] Passes Google Rich Results Test

## Site Infrastructure

### Required Files

| File | Location | Purpose |
|------|----------|---------|
| sitemap.xml | /sitemap-index.xml | Page discovery |
| robots.txt | /robots.txt | Crawler directives |

### Sitemap Requirements

- [ ] Includes all indexable pages
- [ ] Excludes noindex pages
- [ ] Valid XML format
- [ ] Submitted to Google Search Console
- [ ] Updated on new content

### Robots.txt Requirements

```
User-agent: *
Allow: /

Sitemap: https://www.loudface.co/sitemap-index.xml
```

## Performance (SEO Impact)

### Core Web Vitals

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | PageSpeed Insights |
| FID | < 100ms | PageSpeed Insights |
| CLS | < 0.1 | PageSpeed Insights |

### Quick Checks

- [ ] Fonts preloaded
- [ ] Hero image prioritized (`fetchpriority="high"`)
- [ ] Below-fold images lazy loaded
- [ ] No render-blocking resources
- [ ] Minified CSS/JS

## URL Structure

### Requirements

| Check | Requirement |
|-------|-------------|
| Format | Lowercase, hyphens |
| Length | Under 60 chars preferred |
| Keywords | Include where natural |
| Trailing slashes | Consistent (pick one) |

### URL Examples

| Good | Bad |
|------|-----|
| /work/acme-redesign | /work/123 |
| /services/webflow | /services/service_webflow |
| /blog/seo-tips | /blog?id=456 |

## Mobile SEO

### Requirements

- [ ] Viewport meta tag set
- [ ] Text readable without zoom
- [ ] Tap targets 44px minimum
- [ ] No horizontal scroll
- [ ] Mobile-friendly test passes

## Security (SEO Impact)

### Requirements

- [ ] HTTPS enabled
- [ ] No mixed content warnings
- [ ] Valid SSL certificate
- [ ] Security headers present
