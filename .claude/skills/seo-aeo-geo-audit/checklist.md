# SEO, AEO & GEO Audit Detailed Checklist

Complete checklist for thorough SEO, AI Engine Optimization (AEO), and Generative Engine Optimization (GEO) audits.

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
| Blog post | BlogPosting, BreadcrumbList, Person (author) |
| FAQ section | FAQPage |
| Service page | Service, HowTo (if step-by-step process present) |
| Team page | Person |
| Process/methodology | HowTo + BreadcrumbList |
| Key content pages | Speakable (marks passages for voice assistants) |

### Schema Validation

- [ ] Valid JSON syntax
- [ ] Required properties present
- [ ] URLs are absolute
- [ ] No console errors
- [ ] Passes Google Rich Results Test

### Schema Stacking for AI Extraction

Pages with multiple applicable schema types should include ALL relevant schemas. Research shows FAQ + HowTo + Article combinations deliver 73% higher AI Overview selection rates.

| Page Pattern | Recommended Schema Stack |
|--------------|------------------------|
| Service page with FAQ | Service + FAQPage + BreadcrumbList |
| Service page with process | Service + HowTo + BreadcrumbList |
| Blog post with FAQ | BlogPosting + FAQPage + BreadcrumbList + Person |
| Case study | Article + BreadcrumbList |
| About page with team | AboutPage + Organization + Person (employees) |

## Site Infrastructure

### Required Files

| File | Location | Purpose |
|------|----------|---------|
| sitemap.xml | /sitemap-index.xml | Page discovery |
| robots.txt | /robots.txt | Crawler directives |
| llms.txt | /llms.txt | AI engine context (site summary for LLM crawlers) |

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
| LCP (Largest Contentful Paint) | < 2.5s | PageSpeed Insights |
| INP (Interaction to Next Paint) | < 200ms | PageSpeed Insights |
| CLS (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |

> **Note**: INP replaced FID (First Input Delay) as a Core Web Vital in March 2024. INP measures responsiveness across ALL interactions during a page visit, not just the first one. Target < 200ms.

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

## Canonical & Pagination

### Canonical URLs

| Check | Requirement |
|-------|-------------|
| Canonical present | Every indexable page has `alternates.canonical` in metadata |
| Canonical format | Uses relative paths (Next.js `metadataBase` resolves to absolute) |
| Canonical accuracy | Canonical URL matches the page's actual URL (no mismatches) |
| No query param leaks | Canonical doesn't include `?page=`, `?utm_`, or other params |

### Pagination

| Check | Requirement |
|-------|-------------|
| Paginated URLs in sitemap | `?page=2`, `?page=3` etc. should NOT be in sitemap |
| Canonical strategy | Paginated pages self-canonicalize (each page is its own canonical) |
| Pagination component | Links to page 2, 3, etc. are crawlable `<a>` tags (not JS-only navigation) |
| First page canonical | `/blog` and `/blog?page=1` should resolve to the same canonical |

## SSR & Rendering

### Server-Side Rendering Verification

| Check | Requirement |
|-------|-------------|
| H1 in SSR HTML | `curl -s URL \| grep '<h1'` returns the page heading |
| Key content in SSR | Main body text, internal links visible in raw HTML response |
| No empty client shells | `'use client'` components still render meaningful HTML on server |
| No `ssr: false` on content | `next/dynamic` imports with `ssr: false` must not contain indexable content |
| No hydration errors | Console shows no hydration mismatch warnings (causes content flicker) |

### Client Component Audit

| Pattern | Risk | Check |
|---------|------|-------|
| `'use client'` with H1/H2 | Content may not be in SSR HTML | Verify with curl |
| `dynamic(() => ..., { ssr: false })` | Content invisible to crawlers | Only for non-content UI (modals, charts) |
| `useEffect` that sets text content | Text only appears after JS hydration | Use server-side data fetching instead |
| Client-only state for visibility | Content hidden until JS runs | Use CSS, not JS, for show/hide |

## AEO (AI Engine Optimization)

AI engines (ChatGPT, Perplexity, Claude, Gemini) extract content differently from traditional crawlers. These checks ensure the site is structured for AI citation and recommendation.

### 9a. Entity Identity & Disambiguation

AI engines must unambiguously identify WHO you are before they can recommend you.

| Check | Requirement |
|-------|-------------|
| Organization schema `sameAs` | Includes all social/directory profiles (LinkedIn, Instagram, Dribbble, etc.) |
| Organization schema detail | Includes `foundingDate`, `address`, `logo`, and `description` |
| About page entity declaration | First paragraph has clear: who, what, where, expertise, founding year |
| Entity name consistency | Brand name identical across schema JSON-LD, OG metadata, page content, social bios |
| Team member visibility | Names, roles, credentials in server-rendered HTML (not behind JS tabs) |
| AboutPage schema | Present with `mainEntity` linking to Organization |
| About page entity clarity | Clear statement of who, what, where, and expertise |
| disambiguatingDescription | Organization schema includes property to prevent AI entity confusion |

### 9b. Category Membership & Positioning

AI uses explicit category claims to match entities to queries like "best [category] in [location]."

| Check | Requirement |
|-------|-------------|
| Category-membership statements | Service pages contain "LoudFace is a B2B SaaS web design agency" or equivalent |
| Category claim placement | Claims appear in first 100 words of key pages (AI extracts opening paragraphs first) |
| Cross-page reinforcement | Multiple pages reinforce the same positioning (homepage, about, services, case studies) |
| Industry vertical pages | Niche targeting pages exist (`/seo-for/saas`, `/seo-for/ecommerce`) |
| Location signals | Schema address, "based in Dubai" in content where relevant |
| Schema description | Organization schema `description` contains category claims |

### 9c. Content Structure for AI Extraction

AI extracts self-contained chunks, not full pages. Structure content so chunks are independently meaningful.

| Check | Requirement |
|-------|-------------|
| Self-contained first paragraph | Each page opens with a summary that answers the implicit query |
| Q&A patterns | Key pages have question H2/H3 with immediate answer paragraph |
| FAQ schema | FAQ sections use proper FAQPage schema |
| Specific claims with evidence | Stats, timeframes, case study references instead of vague claims |
| No hedging language | "We provide X" not "X might help" on service pages |
| Standalone H2 sections | Each H2 section is independently meaningful without reading rest of page |

### 9d. Comparison & Recommendation Readiness

AI engines field "best X", "X vs Y", and "alternative to Z" queries constantly.

| Check | Requirement |
|-------|-------------|
| Clear differentiators | Service pages state what makes this offering different |
| Measurable outcomes | Case studies include specific numbers and timeframes |
| "vs" and "alternative" content | Addresses comparison queries where relevant |
| Structured comparisons | Tables, pros/cons lists, side-by-side breakdowns |
| Ranking language | "best for", "ideal when", "recommended if" present where appropriate |

### 9e. Technical AEO Signals

| Check | Requirement |
|-------|-------------|
| AI bot access | robots.txt allows GPTBot, ChatGPT-User, ClaudeBot, Anthropic-ai, PerplexityBot, Google-Extended, Bytespider |
| Server-rendered content | All citable content in SSR HTML (AI scrapers don't execute JS) |
| No content gates | No excessive paywalls, login walls, or interstitials blocking AI reading |
| Structured data | Machine-readable entity relationships via JSON-LD schemas |
| llms.txt present | Plain-text site summary at `/llms.txt` for LLM crawler context |
| disambiguatingDescription | Organization schema includes disambiguation to prevent entity confusion |

### 9f. Content Freshness Signals

AI engines weight recency heavily. Content >14 days without updates sees 23% citation decline. Updated within 3 months: 2x more citations. By week 27+ without updates, content becomes effectively invisible to AI engines.

| Check | Requirement |
|-------|-------------|
| Blog schema dates | `datePublished` and `dateModified` in BlogPosting schema |
| Visible date markup | "Last updated" or "Published on" dates visible in blog post HTML |
| Recent proof on services | Current-year case studies, up-to-date stats on service pages |
| Current references | Content references recent events, tools, or data (not 2+ years stale) |
| Dynamic sitemap dates | `lastModified` uses actual modification dates, not hardcoded values |

### Content Patterns That Get Cited

| Pattern | Example | Why AI Prefers It |
|---------|---------|-------------------|
| Direct answer first | "LoudFace is a B2B SaaS agency that..." | AI extracts first paragraph for snippets |
| Specific numbers | "147% increase in 6 months" | Concrete data is more citable than vague claims |
| Structured comparisons | Tables, pros/cons lists | AI engines present structured data more readily |
| Entity attribution | "LoudFace, based in Dubai, specializes in..." | Helps AI associate claims with the right entity |
| Definitive statements | "We build websites on Webflow" | Hedging ("might", "could") weakens citation confidence |

### 9g. E-E-A-T Signals for AI Citation

96% of AI Overview content comes from E-E-A-T verified sources (r=0.81 correlation). AI engines weight author expertise and entity credibility heavily.

| Check | Requirement |
|-------|-------------|
| Named author bylines | Blog posts have named authors with credentials, not just "Team" bylines |
| Author Person schema | JSON-LD Person schema for blog post authors (links to profile/LinkedIn) |
| Team expertise on service pages | References to specific years of experience, certifications, tools mastered |
| Experience demonstration | Case studies show first-hand work and outcomes, not just descriptions |
| External validation | Client testimonials, partner badges ("Webflow Enterprise Partner"), industry awards |
| About page credentials | Team credentials, founding story, measurable track record (projects count, years) |
| Original research | Content includes unique data or insights not available elsewhere |

### Content Freshness Decay Benchmarks

AI engines have steeper freshness decay than traditional search:

| Timeframe | Impact on AI Citations |
|-----------|----------------------|
| 0-14 days | Full citation potential |
| 15-30 days | 23% decline in citation frequency |
| 2-3 months | Still viable but 2x disadvantage vs. fresher sources |
| 4-6 months | Significant decline — cited only when no fresher alternative exists |
| 27+ weeks | Effectively invisible to AI engines |

### llms.txt Requirements

The `llms.txt` standard (proposed by Jeremy Howard) provides LLM-readable context about your site.

| Check | Requirement |
|-------|-------------|
| File present | `llms.txt` exists at site root (`/llms.txt`) |
| Site identity | Contains site name, purpose, and primary domain |
| Key services | Lists core service offerings |
| Primary topics | Lists main content topics/expertise areas |
| Citation format | Specifies preferred citation format (brand name, URL) |
| Contact info | Includes contact or attribution information |

## GEO (Generative Engine Optimization)

GEO focuses on how well content performs when processed by generative AI -- how quotable, extractable, and authoritative it appears to language models.

### 10a. Quotability & Extractability

AI engines select text passages to quote. Quotable content is concise, specific, and self-contained.

| Check | Requirement |
|-------|-------------|
| Concise claim sentences | Key claims under 30 words with full context (no dangling pronouns) |
| Contextualized statistics | "147% increase in organic traffic over 6 months" not just "147% increase" |
| Answer-first structure | Definitions and explanations lead with the answer, details follow |
| Clear list markup | Lists use HTML `<ol>`/`<ul>`, not comma-separated paragraphs |
| Section takeaways | Each major section ends with a clear summary sentence |
| 40-word rule | Critical claim sentences under 40 words — extracted at 2.7x rate vs. longer blocks |
| Optimal semantic units | Key content sections are 134-167 words for maximum AI extraction |
| Entity in quotable text | Brand name appears in quotable passages (attribution survives extraction) |

### 10b. Authoritative Tone & Confidence

Language models assess confidence level when deciding what to cite. Definitive language gets cited; hedging gets skipped.

| Check | Requirement |
|-------|-------------|
| Definitive service language | "We build", "We deliver", "Our process includes" on service pages |
| No hedging on core claims | No "might", "could potentially", "may or may not" on capabilities |
| Credentials with claims | "with 200+ projects delivered" not just "experienced" |
| Active voice | "We grew their traffic 3x" not "Traffic was grown" |
| Consistent first-person plural | "we" on agency pages -- AI attributes claims to entities that own them |

### 10c. Source Citation Within Content

AI engines give higher authority to content that references external sources -- it signals original synthesis.

| Check | Requirement |
|-------|-------------|
| Blog source citations | Posts cite specific studies, data points, official documentation |
| Verifiable case study outcomes | Named clients (with permission) or anonymized with specifics |
| Framework references | Methodology claims reference named frameworks, not generic "our framework" |
| External authority links | Links to authoritative sources present where claims need backing |

### 10d. Structured Knowledge Formats

Certain content formats are dramatically more extractable by AI than prose paragraphs.

| Check | Requirement |
|-------|-------------|
| Comparison tables | Use actual `<table>` markup, not divs styled as tables |
| Step-by-step processes | Ordered lists with clear step labels |
| Feature/service matrices | Structured markup that AI can parse |
| FAQ sections | Semantic Q&A markup with FAQPage schema |
| "What is X" definitions | Appear near top of relevant pages (featured snippet + AI extraction) |
| HowTo schema | Step-by-step process content has HowTo structured data |
| Speakable schema | 2-3 key passages per page marked for voice assistant reading |
| Schema stacking | Multiple schema types per page for maximum AI extraction surface |

### 10e. Topical Authority & Content Depth

AI engines evaluate topical authority -- a site covering a topic thoroughly across multiple interlinked pages gets cited over one with a single shallow mention.

| Check | Requirement |
|-------|-------------|
| Multi-format coverage | Core topics covered via service page + blog posts + case studies + FAQ |
| Internal linking across types | Service pages link to blog deep-dives, blogs link to case studies |
| Broad + specific angles | Both "What is CRO?" and "A/B testing setup using confidence intervals" |
| No thin indexed pages | Every indexed page has substantial, unique content (800+ words preferred) |
| Pillar + cluster architecture | Hub pages linking to detailed subtopic pages for primary topics |

### 10f. Brand Consistency Across Surfaces

AI engines match entities across sources. Inconsistencies reduce citation confidence.

| Check | Requirement |
|-------|-------------|
| Brand name consistency | Identical in schema, OG tags, content, footer, social profiles |
| Brand description alignment | Schema description matches about page first paragraph |
| Service list consistency | Same services named the same way across all pages |
| Contact/location consistency | Same address in schema, footer, about page, Google Business Profile |
| Social profile validity | Schema `sameAs` links are valid and resolve to active profiles |

## Font & Resource Loading

### Font Performance

| Check | Requirement |
|-------|-------------|
| `font-display` | All `@font-face` declarations have `font-display: swap` or `optional` |
| Font preloading | Critical above-fold fonts preloaded via `<link rel="preload">` in layout |
| Self-hosted fonts | Font files served from same origin (not external CDN) to avoid extra connection |
| No FOIT | No Flash of Invisible Text — text renders immediately with fallback font |

### Resource Loading

| Check | Requirement |
|-------|-------------|
| No render-blocking CSS | Critical CSS inlined or loaded with high priority |
| Deferred third-party JS | Analytics, chat widgets, etc. loaded after main content |
| Dynamic imports | Below-fold interactive components use `next/dynamic` to defer JS |
| Preconnect hints | `<link rel="preconnect">` for external origins (CDN, analytics) |

## External Links

### Link Attributes

| Check | Requirement |
|-------|-------------|
| `target="_blank"` security | All external links with `target="_blank"` have `rel="noopener noreferrer"` |
| Sponsored links | Affiliate or paid links have `rel="nofollow sponsored"` |
| UGC links | User-generated content links have `rel="nofollow ugc"` |
| No broken external links | External links resolve (no dead domains or 404s) |

### Social & Directory Links

| Check | Requirement |
|-------|-------------|
| Footer social links | All social media URLs correct and resolve |
| Schema `sameAs` | Organization schema `sameAs` matches actual social profile URLs |
| Consistent profiles | Same brand name, bio, and logo across all platforms |

## Duplicate Content & Meta

### Uniqueness Checks

| Check | Requirement |
|-------|-------------|
| Unique titles | No two pages share the same `<title>` tag |
| Unique descriptions | No two pages share the same `<meta name="description">` |
| No thin pages | Dynamic pages don't render empty/placeholder content when CMS data is missing |
| OG image exists | `opengraph-image.tsx` or equivalent file exists and generates valid images |
| OG image dimensions | Generated OG images are 1200x630px (recommended by all platforms) |

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
