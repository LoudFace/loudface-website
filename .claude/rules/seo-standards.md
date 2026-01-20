# SEO Standards for LoudFace Website

Mandatory SEO requirements for all content and pages.

## Meta Tags

### Title Tags
- **Length**: 50-60 characters (displays fully in SERPs)
- **Format**: `[Page Topic] | LoudFace` or `[Page Topic] - Agency Name`
- **Include**: Primary keyword naturally, near the beginning
- **Unique**: Every page must have a unique title

### Meta Descriptions
- **Length**: 150-160 characters
- **Include**: Primary keyword, value proposition, call-to-action
- **Tone**: Compelling, action-oriented (not just descriptive)
- **Unique**: Every page must have a unique description

### Implementation
```astro
---
const title = "Case Study Title | LoudFace";
const description = "How we helped [Client] achieve [Result]. See the full case study with metrics and approach.";
---
<Layout title={title} description={description}>
```

## Heading Structure

### H1 Tags
- **One per page** - never more, never fewer
- **Include primary keyword** naturally
- **Match user intent** - what they searched for
- **First heading on page** (visually prominent)

### Heading Hierarchy
```
H1: Page Title (one only)
├── H2: Major Section
│   ├── H3: Subsection
│   └── H3: Subsection
├── H2: Major Section
│   └── H3: Subsection
└── H2: Major Section
```

**Never skip levels** (H1 → H3 is invalid, must be H1 → H2 → H3)

### Heading Classes (from styling.md)
```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium">
<h2 class="text-2xl sm:text-3xl md:text-4xl font-medium">
<h3 class="text-lg font-medium">
```

## Content Guidelines

### Page Length by Type
| Page Type | Target Length | Notes |
|-----------|---------------|-------|
| Homepage | 500-1000 words | Scannable, benefit-focused |
| Service pages | 800-1200 words | Problem-solution format |
| Case studies | 1000-1500 words | Results-heavy, metrics |
| Blog posts | 1500-2500 words | In-depth, comprehensive |
| Landing pages | 300-800 words | Conversion-focused |

### First 100 Words
- Hook the reader immediately
- Include primary keyword naturally
- State the value proposition
- Address user intent directly

### Keyword Usage
- **Density**: 1-2% (natural, not forced)
- **Placement**: Title, H1, first paragraph, H2s, conclusion
- **Variations**: Use synonyms and long-tail variations
- **Never**: Keyword stuff or force unnatural phrasing

## Case Study Requirements

Every case study must include:

### Required Sections
1. **Client & Industry** - Named prominently, industry context
2. **Challenge/Problem** - What they faced before
3. **Solution/Approach** - What we did, how we did it
4. **Results/Metrics** - Quantified outcomes with numbers
5. **Timeline** - Project duration where relevant
6. **Testimonial** - Client quote (when available)

### Metrics Format
- Use specific numbers: "147% increase" not "significant increase"
- Include timeframes: "in 6 months" not "quickly"
- Compare before/after when possible
- Bold or highlight key metrics

### Case Study Meta
```astro
const title = `${client.name} Case Study | LoudFace`;
const description = `How we helped ${client.name} achieve ${primaryResult}. ${industry} case study with metrics.`;
```

## Internal Linking

### Requirements
- **3-5 internal links** per page minimum
- **Descriptive anchor text** (not "click here" or "read more")
- **Link to important pages** (services, case studies, blog)
- **Contextually relevant** - links make sense in context

### Anchor Text Examples
```html
<!-- Good -->
<a href="/services/webflow">Webflow development services</a>
<a href="/work/client-name">view the full case study</a>

<!-- Bad -->
<a href="/services/webflow">click here</a>
<a href="/work/client-name">here</a>
```

## Image Optimization

### Alt Text
- **Descriptive**: Describe what's in the image
- **Contextual**: Include relevant keywords naturally
- **Concise**: 125 characters or fewer
- **Decorative images**: Use `alt=""` (empty, not missing)

### Examples
```html
<!-- Informative image -->
<img src={asset('/images/case-study-hero.jpg')}
     alt="Before and after website redesign for Acme Corp showing 3x conversion improvement" />

<!-- Decorative image -->
<img src={asset('/images/pattern.svg')} alt="" />

<!-- Logo -->
<img src={asset('/images/client-logo.svg')} alt="Acme Corp logo" />
```

### Technical Requirements
- Use `loading="lazy"` for below-fold images
- Use `loading="eager"` for hero/LCP images
- Include `width` and `height` attributes
- Use WebP format where possible

## Structured Data (JSON-LD)

### Required Schemas

**All pages** (in Layout.astro):
- `WebSite` schema
- `Organization` schema

**Case study pages**:
- `Article` or `CreativeWork` schema
- `BreadcrumbList` schema

**FAQ sections**:
- `FAQPage` schema with `Question` items

**Blog posts**:
- `BlogPosting` schema
- `BreadcrumbList` schema

### Schema Location
Global schemas: `src/layouts/Layout.astro`
Page-specific schemas: Individual page files

## Technical SEO Checklist

### Every Page Must Have
- [ ] Unique `<title>` tag (50-60 chars)
- [ ] Unique `<meta name="description">` (150-160 chars)
- [ ] Canonical URL (`<link rel="canonical">`)
- [ ] One H1 tag only
- [ ] Proper heading hierarchy
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags

### Site-Wide Requirements
- [ ] `sitemap.xml` generated and submitted
- [ ] `robots.txt` with sitemap reference
- [ ] SSL/HTTPS enabled
- [ ] Mobile-responsive design
- [ ] Fast page load (< 3s)
- [ ] No broken links (404s)

## URL Structure

### Requirements
- **Lowercase**: `/work/case-study` not `/Work/Case-Study`
- **Hyphens**: `/web-design` not `/web_design` or `/webdesign`
- **Descriptive**: `/services/webflow-development` not `/services/123`
- **Short**: Keep under 60 characters when possible
- **No trailing slashes**: Consistent format site-wide

### Examples
```
Good:
/work/acme-corp-redesign
/services/webflow-development
/blog/conversion-rate-optimization

Bad:
/work/123
/services/service_1
/blog/post?id=456
```

## Performance Impact on SEO

### Core Web Vitals Targets
| Metric | Target | Impact |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Ranking factor |
| FID (First Input Delay) | < 100ms | Ranking factor |
| CLS (Cumulative Layout Shift) | < 0.1 | Ranking factor |

### Quick Wins
- Preload critical fonts
- Lazy load below-fold images
- Use `fetchpriority="high"` on hero images
- Minimize JavaScript bundles

## Pre-Publish Checklist

Before publishing any page:

1. [ ] Title tag optimized (50-60 chars, keyword included)
2. [ ] Meta description written (150-160 chars, CTA included)
3. [ ] H1 present and includes keyword
4. [ ] Heading hierarchy correct (no skipped levels)
5. [ ] Images have alt text
6. [ ] Internal links added (3-5 minimum)
7. [ ] Content length appropriate for page type
8. [ ] Structured data added if required
9. [ ] URL is clean and descriptive
10. [ ] Mobile preview checked
