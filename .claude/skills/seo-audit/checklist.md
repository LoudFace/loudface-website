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

### Global Schemas (src/app/layout.tsx)

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

## Next.js-Specific SEO Pitfalls

### JSON-LD Rendering

| Check | Requirement |
|-------|-------------|
| Schema tags | Must use native `<script>`, NOT `<Script>` from next/script |
| Global schemas | In layout.tsx using native `<script>` |
| Page schemas | In page.tsx using native `<script>` |
| FAQ schemas | In FAQ component using native `<script>` |

### Metadata Inheritance (CRITICAL)

| Check | Requirement |
|-------|-------------|
| Twitter meta in child pages | Must be explicitly set — doesn't inherit from layout when OG is set |
| OG complete replacement | Child `openGraph` **replaces** parent entirely — must re-specify `siteName`, `locale`, `images`, `type` |
| Title template | Layout uses `%s | LoudFace` — child pages provide only the page part |
| CMS titles | Must strip existing brand suffix before passing to template (use `truncateSeoTitle`) |
| OG images | Root `opengraph-image.tsx` provides fallback; explicit images override |
| Fallback metadata | Error/404 returns in `generateMetadata` must include `robots: { index: false }` |

### Heading Hierarchy

| Check | Requirement |
|-------|-------------|
| Nav dropdown titles | Must use `<span>`, not `<h4>` |
| Footer nav labels | Must use `<span>`, not `<h3>` — these are presentational labels |
| Sidebar labels | Use `<span>` for labels like "On this page", "Written by", "Services", "Technologies" |
| Card titles in grids | Must be `<h3>` (not `<h2>`) when inside a section that already has an `<h2>` header |
| "Key Results" sections | Use `<h2>` if it's a major page section |
| Component headings | Non-content headings (labels, nav items) must not use heading tags |

### Images & Performance

| Check | Requirement |
|-------|-------------|
| LCP image `fetchPriority` | Hero/featured images need BOTH `loading="eager"` AND `fetchPriority="high"` |
| Client component `<img>` dimensions | `width` and `height` required on `<img>` tag even if parent div has dimensions |
| Below-fold avatars | Sidebar, testimonial, and footer images must have `loading="lazy"` |
| `loading` attribute explicit | Every `<img>` should have explicit `loading` — don't rely on browser defaults |

### Internal Linking

| Check | Requirement |
|-------|-------------|
| Blog in header nav | Blog page must be linked from main navigation |
| Service names in case studies | Must be `<Link>` components, not `<span>` elements |
| Cross-linking between sections | Service pages link to related blog posts and case studies |
| About page outbound links | Links to services, case studies, or blog from about page |
| Anchor text quality | No "View all →", "click here", "Read more" as standalone link text — use descriptive text |

### CMS Data Layer

| Check | Requirement |
|-------|-------------|
| `normalizeItem()` field access | Only `id` + `fieldData` fields available — Webflow system fields dropped |
| Date fields in schemas | Use CMS-level dates (`published-date`) not Webflow system dates (`createdOn`) |
| Draft filtering | `isPublished()` filter applied before normalization |
| Missing data fallbacks | Dynamic pages must handle null/undefined CMS data gracefully |

## Post-Migration SEO Checklist

When auditing after a Webflow-to-Next.js (or any) migration:

### Redirects
- [ ] All old URL patterns have 301 redirects in `next.config.ts`
- [ ] No redirect chains or loops (A → B → C should be A → C)
- [ ] Wildcard redirects for nested paths (e.g., `/work/:slug*` → `/case-studies/:slug*`)
- [ ] Common Webflow URL patterns covered:
  - [ ] `/work` → `/case-studies` (portfolio rename)
  - [ ] `/about-us` → `/about` (slug simplification)
  - [ ] `/policy-pages/*` → `/terms`, `/privacy`, `/cookies` (flattened structure)
  - [ ] `/services` → specific service page (if index removed)
  - [ ] `/contact` → homepage or booking URL (if contact page removed)
  - [ ] `/careers` → `/about` (if careers removed)
- [ ] No-longer-indexed pages (thank-you, dev routes) disallowed in robots.txt

### Google Search Console
- [ ] Google Search Console verification file present (`public/google*.html`)
- [ ] Old Webflow sitemap deleted from GSC
- [ ] New sitemap submitted to GSC
- [ ] Key pages requested for re-indexing via URL Inspection tool
- [ ] Search analytics monitored for impression/click drops post-migration
- [ ] Coverage report checked for new crawl errors

### Sitemap & Robots
- [ ] Sitemap generated correctly with all new URLs
- [ ] Sitemap `lastModified` uses dynamic dates (build time), not hardcoded
- [ ] robots.txt references correct sitemap URL
- [ ] AI crawler bots (GPTBot, ClaudeBot, PerplexityBot, Bytespider) allowed in robots.txt
- [ ] Utility pages (`/thank-you`, `/dev/`) disallowed in robots.txt

### Content Parity
- [ ] All old pages have equivalent new pages (nothing dropped without redirect)
- [ ] No soft 404s (pages returning 200 with error/placeholder content)
- [ ] CMS content rendering correctly (field name mapping between Webflow and Next.js)
- [ ] Rich text / HTML content from CMS displays properly (not escaped)
- [ ] Image CDN URLs still resolving (Webflow assets-global.website-files.com)

### Structured Data
- [ ] All JSON-LD uses native `<script>`, not Next.js `<Script>`
- [ ] Global schemas (WebSite, Organization) present in layout
- [ ] Page-specific schemas use correct URLs (new paths, not old Webflow paths)
- [ ] Schema `url` fields use absolute URLs with canonical domain
