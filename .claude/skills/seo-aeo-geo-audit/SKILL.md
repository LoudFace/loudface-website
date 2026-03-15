---
name: seo-aeo-geo-audit
description: Comprehensive SEO, AEO & GEO audit of pages, components, or the entire site. Use before publishing content, after major changes, or for periodic SEO health checks.
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[file, directory, or 'site' for full audit]"
---

# SEO, AEO & GEO Audit

Perform a comprehensive audit covering traditional SEO, AI Engine Optimization (AEO), and Generative Engine Optimization (GEO).

**Target**: $ARGUMENTS (file path, directory, or "site" for full audit)

## Audit Process

### Step 1: Determine Scope

Based on the argument:
- **Single file** (`src/app/page.tsx`): Audit that page only
- **Directory** (`src/app/work/`): Audit all pages in directory
- **"site"**: Full site-wide audit

### Step 2: Technical SEO Audit

For each page, check:

#### Meta Tags
- [ ] `<title>` present and 50-60 characters
- [ ] `<meta name="description">` present and 150-160 characters
- [ ] `<link rel="canonical">` present
- [ ] `<meta name="robots">` set appropriately

#### Open Graph
- [ ] `og:title` present
- [ ] `og:description` present
- [ ] `og:image` present (ideally unique per page)
- [ ] `og:url` matches canonical

#### Twitter Cards
- [ ] `twitter:card` present
- [ ] `twitter:title` present
- [ ] `twitter:description` present
- [ ] `twitter:image` present

### Step 3: Content Structure Audit

#### Headings
- [ ] Exactly one H1 per page
- [ ] H1 contains primary keyword
- [ ] Heading hierarchy correct (no skipped levels)
- [ ] H2s used for major sections

#### Content
- [ ] Content length appropriate for page type
- [ ] First 100 words hook reader and include keyword
- [ ] Internal links present (3-5 minimum)
- [ ] Anchor text descriptive (not "click here")

### Step 4: Image Audit

- [ ] All images have `alt` attribute
- [ ] Decorative images use `alt=""`
- [ ] Alt text is descriptive and includes keywords where natural
- [ ] Below-fold images use `loading="lazy"`
- [ ] Static images use `asset()` function

### Step 5: Structured Data Audit

- [ ] WebSite schema present (src/app/layout.tsx)
- [ ] Organization schema present (src/app/layout.tsx)
- [ ] Page-specific schemas where needed:
  - FAQ sections -> FAQPage schema
  - Case studies -> Article + BreadcrumbList schemas
  - Blog posts -> BlogPosting + BreadcrumbList schemas
- [ ] All schemas valid JSON-LD syntax
- [ ] Schema stacking applied: pages with multiple applicable types include all relevant schemas (e.g., Service + FAQ + BreadcrumbList on a service page with FAQ section)
- [ ] HowTo schema used for step-by-step process sections (73% AI Overview selection boost when combined with FAQ + Article)
- [ ] Speakable schema marks key content passages for voice assistant extraction

### Step 6: Site Infrastructure (for "site" audit)

- [ ] `sitemap.xml` exists and is valid
- [ ] `robots.txt` exists with sitemap reference
- [ ] No broken internal links
- [ ] All pages accessible (no 404s)
- [ ] HTTPS enforced

### Step 7: Canonical & Pagination Audit

- [ ] All pages have `alternates.canonical` set in metadata
- [ ] Canonical URLs use relative paths (Next.js `metadataBase` resolves them to absolute)
- [ ] No canonical mismatches (canonical URL must match the page's actual URL)
- [ ] Paginated listing pages (`?page=2`, `?page=3`) are NOT in the sitemap
- [ ] Paginated pages either self-canonicalize or canonical to page 1 (pick a strategy)
- [ ] No duplicate `description` across pages -- each must be unique

### Step 8: SSR & Rendering Audit

Crawlers only see server-rendered HTML. Content behind client-side JS may be invisible.

- [ ] Key page content (H1, body text, internal links) is server-rendered, not client-only
- [ ] `'use client'` components still render meaningful HTML on the server (not empty shells)
- [ ] No hydration errors that cause content mismatch between SSR and client
- [ ] Dynamic imports (`next/dynamic`) have `ssr: true` (default) -- not `ssr: false` for content

To verify: `curl -s https://www.loudface.co/[page] | grep -c '<h1'` should return 1.

### Step 9: AEO (AI Engine Optimization) Audit

AI engines (ChatGPT, Perplexity, Claude, Gemini) extract content differently from traditional crawlers. This step ensures the site is structured for AI citation.

#### 9a. Entity Identity & Disambiguation

AI engines must unambiguously identify WHO you are before they can recommend you.

- [ ] Organization schema includes `sameAs` with all social/directory profiles
- [ ] About page has a clear entity declaration in the first paragraph: who, what, where, expertise, founding year
- [ ] Entity name is identical across: schema JSON-LD, OG metadata, page content, social bios, directory listings
- [ ] Organization schema includes `foundingDate`, `address`, `logo`, and `description`
- [ ] Team member names, roles, and credentials are in server-rendered HTML (not hidden behind JS tabs)
- [ ] AboutPage schema present with `mainEntity` linking to Organization
- [ ] Organization schema includes `disambiguatingDescription` for AI entity resolution (e.g., "Not to be confused with LoudFace cosmetics brand")

#### 9b. Category Membership & Positioning

AI uses explicit category claims to match entities to queries like "best [category] in [location]."

- [ ] Service pages contain clear category-membership statements ("LoudFace is a B2B SaaS web design agency")
- [ ] Category claims appear in first 100 words of key pages (AI extracts opening paragraphs first)
- [ ] Multiple pages reinforce the same category positioning (homepage, about, services, case studies)
- [ ] Industry vertical pages exist for niche targeting (`/seo-for/saas`, `/seo-for/ecommerce`)
- [ ] Location signals are present where relevant (schema address, "based in Dubai" in content)

#### 9c. Content Structure for AI Extraction

AI engines extract self-contained chunks, not full pages. Structure content so chunks are independently meaningful.

- [ ] First paragraph of each page is a self-contained summary that answers the implicit query
- [ ] Key pages have question-answer patterns: H2/H3 as question, immediate answer paragraph follows
- [ ] FAQ sections use proper FAQPage schema
- [ ] Content includes specific claims with evidence: stats, timeframes, case study references
- [ ] No hedging language on core service descriptions ("We provide X" not "X might help")
- [ ] Each H2 section can stand alone as a meaningful answer without reading the rest of the page

#### 9d. Comparison & Recommendation Readiness

AI engines field "best X", "X vs Y", and "alternative to Z" queries constantly.

- [ ] Service pages clearly state differentiators (what makes this offering different from competitors)
- [ ] Case studies include measurable outcomes with specific numbers and timeframes
- [ ] Content addresses "vs" and "alternative to" queries where relevant
- [ ] Comparison content uses structured formats: tables, pros/cons lists, side-by-side breakdowns
- [ ] Definitive ranking language present: "best for", "ideal when", "recommended if"

#### 9e. Technical AEO Signals

- [ ] robots.txt allows AI bots: GPTBot, ChatGPT-User, ClaudeBot, Anthropic-ai, PerplexityBot, Google-Extended, Bytespider
- [ ] All citable content is in server-rendered HTML (AI scrapers don't execute JS)
- [ ] No content gates, paywalls, or interstitials blocking AI from reading
- [ ] Structured data provides machine-readable entity relationships via JSON-LD
- [ ] `llms.txt` file present at site root — plain-text site summary for LLM crawlers (proposed standard, ~15% adoption among tech sites in 2026)
- [ ] `llms.txt` contains: site name, purpose, key services, primary topics, and preferred citation format

#### 9f. Content Freshness Signals

AI engines weight recency heavily. Research shows content >14 days without updates sees 23% citation decline. Content updated within 3 months receives 2x more AI citations. By week 27+ without updates, content becomes effectively invisible to AI engines.

- [ ] Blog posts have `datePublished` and `dateModified` in BlogPosting schema
- [ ] Visible "Last updated" or "Published on" dates in blog post markup (not hidden)
- [ ] Service pages show recent proof: current-year case studies, up-to-date stats
- [ ] Content references recent events, tools, or data (not outdated examples from 2+ years ago)
- [ ] Sitemap `lastModified` uses actual modification dates, not hardcoded values

#### 9g. E-E-A-T Signals for AI Citation

96% of AI Overview content comes from E-E-A-T verified sources (r=0.81 correlation). AI engines heavily weight author expertise and entity credibility.

- [ ] Blog posts have named author bylines with credentials (not just "LoudFace Team")
- [ ] Author Person schema present for blog post authors (links to author profile/LinkedIn)
- [ ] Service pages reference specific team expertise: years of experience, certifications, named tools mastered
- [ ] Case studies demonstrate Experience (first-hand work) and Expertise (specialized knowledge)
- [ ] External validation signals present: client testimonials, partner badges (e.g., "Webflow Enterprise Partner"), industry awards
- [ ] About page includes team credentials, founding story, and measurable track record
- [ ] Content demonstrates original research or unique data not available elsewhere

### Step 10: GEO (Generative Engine Optimization) Audit

GEO focuses on how well content performs when processed by generative AI -- how quotable, extractable, and authoritative it appears to language models.

#### 10a. Quotability & Extractability

AI engines select text passages to quote. Quotable content is concise, specific, and self-contained.

- [ ] Key claim sentences are under 30 words and contain the full claim (no pronouns requiring prior context)
- [ ] Statistics include context: "147% increase in organic traffic over 6 months" not just "147% increase"
- [ ] Definitions and explanations lead with the answer, details follow
- [ ] Lists and enumerations use clear markup (HTML lists, not comma-separated paragraphs)
- [ ] Each major section ends with a clear takeaway sentence (AI often grabs closing statements)
- [ ] Critical claim sentences are under 40 words — research shows text blocks under 40 words are extracted at 2.7x the rate of longer blocks
- [ ] Key content sections are 134-167 words — the optimal semantic unit length for AI extraction and citation
- [ ] Entity name appears in quotable passages (attribution survives when text is extracted out of context)

#### 10b. Authoritative Tone & Confidence

Language models assess confidence level when deciding what to cite. Definitive language gets cited; hedging gets skipped.

- [ ] Service pages use definitive language: "We build", "We deliver", "Our process includes"
- [ ] No hedging on core claims: avoid "might", "could potentially", "may or may not"
- [ ] Credentials and proof accompany claims: "with 200+ projects delivered" not just "experienced"
- [ ] Active voice over passive: "We grew their traffic 3x" not "Traffic was grown"
- [ ] Consistent first-person plural ("we") on agency pages -- AI attributes claims to entities that own them

#### 10c. Source Citation Within Content

AI engines give higher authority to content that references external sources -- it signals original synthesis, not regurgitation.

- [ ] Blog posts cite specific sources: studies, data points, official documentation
- [ ] Case studies reference client-verifiable outcomes (named clients with permission, or anonymized with specifics)
- [ ] Methodology claims reference frameworks: "using the ICE prioritization framework" not "using our framework"
- [ ] External links to authoritative sources present where claims need backing

#### 10d. Structured Knowledge Formats

Certain content formats are dramatically more extractable by AI than prose paragraphs.

- [ ] Comparison tables use actual `<table>` markup (not divs styled as tables)
- [ ] Step-by-step processes use ordered lists with clear step labels
- [ ] Feature/service matrices use structured markup that AI can parse
- [ ] FAQ sections use semantic Q&A markup with FAQPage schema
- [ ] "What is X" definitions appear near the top of relevant pages (featured snippet + AI extraction)
- [ ] HowTo schema for step-by-step process content (service methodologies, implementation guides)
- [ ] Speakable schema marks 2-3 key passages per page for voice assistant reading (127% increase in voice search referrals)
- [ ] Schema stacking: pages combine multiple schema types (Article + FAQ + BreadcrumbList) for maximum AI extraction surface

#### 10e. Topical Authority & Content Depth

AI engines evaluate topical authority -- a site that covers a topic thoroughly across multiple interlinked pages gets cited over a site with one shallow mention.

- [ ] Core service topics are covered across multiple content types: service page + blog posts + case studies + FAQ
- [ ] Internal links connect related content: service pages link to blog deep-dives, blog posts link to case studies
- [ ] Content covers both broad and specific angles: "What is CRO?" and "A/B testing setup using confidence intervals"
- [ ] No thin pages that dilute authority: every indexed page has substantial, unique content
- [ ] Pillar page + cluster content architecture for primary topics

#### 10f. Brand Consistency Across Surfaces

AI engines match entities across sources. Inconsistencies create confusion and reduce citation confidence.

- [ ] Brand name identical: schema, OG tags, content, footer, social profiles
- [ ] Brand description consistent: schema description matches about page first paragraph
- [ ] Service list consistent: same services named the same way across all pages
- [ ] Contact/location info consistent: same address in schema, footer, about page, Google Business Profile
- [ ] Social profile links in schema `sameAs` are valid and resolve to active profiles

#### Important: AI Overview ≠ Traditional Rankings

Only 38% of pages cited in Google AI Overviews rank in the traditional top 10 (down from 76% in 2024). This means AEO/GEO optimization is increasingly independent of traditional SEO rankings. A page can rank #30 organically but still be cited in AI Overviews if it has strong E-E-A-T signals, quotable content, and proper structured data.

### Step 11: Font & Resource Loading Audit

- [ ] Critical fonts have `font-display: swap` or `optional` (prevents FOIT)
- [ ] Above-fold fonts are preloaded via `<link rel="preload">`
- [ ] No render-blocking CSS or JS in the critical path
- [ ] Third-party scripts (analytics, chat, etc.) are deferred or loaded after interaction

### Step 12: External Link Audit

- [ ] External links with `target="_blank"` have `rel="noopener noreferrer"`
- [ ] Sponsored/affiliate links have `rel="nofollow sponsored"`
- [ ] No broken external links (links to domains that no longer exist)
- [ ] Social media links in footer/header are correct and resolve

### Step 13: Duplicate Content & Meta Audit

- [ ] No two pages share the same `<title>` tag
- [ ] No two pages share the same `<meta name="description">`
- [ ] OG image file (`opengraph-image.tsx` or equivalent) exists and generates correctly
- [ ] Dynamic pages don't produce thin/empty content when CMS data is missing (caught by noindex fallback)

### Step 14: Migration & Redirect Audit

When auditing after a site migration:
- [ ] All old URLs redirect (301) to new equivalents
- [ ] No redirect chains (A -> B -> C should be A -> C)
- [ ] Sitemap resubmitted to Google Search Console
- [ ] Key pages requested for re-indexing via GSC
- [ ] Old sitemap deleted from GSC
- [ ] No soft 404s (pages that return 200 but show error content)

## Critical Gotchas (Learned the Hard Way)

### 1. `<Script>` vs `<script>` for JSON-LD

**CRITICAL**: Next.js `<Script>` from `next/script` defers loading. Crawlers that only see initial HTML will MISS your structured data.

```tsx
// WRONG -- deferred, crawlers may miss it
import Script from 'next/script';
<Script id="schema" type="application/ld+json" ... />

// CORRECT -- rendered in initial HTML, visible to all crawlers
<script type="application/ld+json" ... />
```

Always use native `<script>` for JSON-LD structured data.

### 2. Blog Title Double-Suffix

CMS editors sometimes include " | LoudFace" in their meta-title field. When the layout template adds it again, you get "Title | LoudFace | LoudFace". Always strip existing brand suffixes before passing titles to the template:

```tsx
import { truncateSeoTitle } from '@/lib/seo-utils';
// truncateSeoTitle strips existing " | LoudFace" suffix automatically
```

### 3. Twitter Meta Inheritance

Next.js `twitter` metadata does NOT automatically inherit from parent layouts when a child page defines `openGraph` without `twitter`. Always explicitly set `twitter` in `generateMetadata`:

```tsx
return {
  openGraph: { title, description, images: [...] },
  twitter: { card: 'summary_large_image', title, description, images: [...] },
};
```

### 4. Heading Hierarchy in Components

Non-content headings in shared components (nav dropdowns, sidebar labels) should use `<span>` elements, not `<h4>` or `<h3>`. Real heading hierarchy is:

```
H1: Page title (one per page)
  H2: Major content sections
    H3: Subsections within H2
```

Sidebar labels ("Services", "Technologies", "On this page") are **not** content sections -- use `<h3>` only when they're inside an article context under an `<h2>`.

### 5. Internal Link Equity

Service names in case study sidebars, technology tags, and similar elements should be `<Link>` components to their respective pages, not plain `<span>` elements. Every missed link is lost internal link equity.

### 6. OG/Twitter Complete Replacement (Not Merge)

When a child page defines its own `openGraph` object in Next.js metadata, it **completely replaces** the parent layout's OG -- it does NOT merge. This means `siteName`, `locale`, `images`, and `type` from the layout are all lost. Every page that sets `openGraph` must re-specify all fields:

```tsx
openGraph: {
  title: '...',
  description: '...',
  type: 'website',
  url: '/page-path',
  siteName: 'LoudFace',       // MUST re-specify
  locale: 'en_US',            // MUST re-specify
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '...' }],  // MUST re-specify
},
```

### 7. CMS Data Normalization Drops System Fields

The `normalizeItem()` function in `cms-data.ts` only carries `id` + `fieldData`. Webflow system fields (`createdOn`, `lastPublished`, `lastUpdated`) are **dropped** during normalization and unavailable on TypeScript types. If you need dates for structured data schemas (e.g., `datePublished`, `dateModified`), you must either:
- Add the system fields to the normalization function
- Use CMS-level date fields (like `published-date` on BlogPost) instead
- Omit the date fields from the schema rather than using incorrect data

### 8. Fallback Metadata Must Include `noindex`

When `generateMetadata` for dynamic pages (blog/[slug], case-studies/[slug]) returns fallback metadata because CMS data is unavailable, always add `robots: { index: false }`. Otherwise, Google may index a thin/broken page with generic metadata.

```tsx
// When CMS data fails or slug not found
return {
  title: 'Page Not Found',
  robots: { index: false },  // CRITICAL
};
```

### 9. `fetchPriority="high"` on LCP Elements

The Largest Contentful Paint element (usually the hero/featured image) needs both `loading="eager"` AND `fetchPriority="high"`. Many migrations set `loading="eager"` but forget `fetchPriority`, which tells the browser preload scanner to prioritize the resource.

### 10. CLS from Client Components Without Dimensions

Client components that calculate dimensions in JS (like logo normalizers) must still set `width` and `height` on the `<img>` tag for the pre-JS render. Otherwise, CLS occurs during hydration. The wrapper `<div>` having dimensions is not sufficient -- the browser needs them on the `<img>` itself for aspect ratio calculation.

### 11. Sitemap `lastModified` Must Be Dynamic

Never hardcode sitemap dates. Use `new Date()` (current build time) for static pages. For CMS content, use the item's published/modified date if available, falling back to build time.

### 12. Webflow URL Structure Changes Need Exhaustive Redirects

Common Webflow -> Next.js URL changes that need 301 redirects:
- `/work` -> `/case-studies` (portfolio section rename)
- `/about-us` -> `/about`
- `/policy-pages/terms-of-service` -> `/terms`
- `/policy-pages/privacy-policy` -> `/privacy`
- `/services` (index page) -> `/services/webflow` (if index removed)
- `/contact` -> `/` (if contact page merged into homepage CTA)
- `/careers` -> `/about` (if careers removed)

Use wildcard patterns for nested paths: `/work/:slug*` -> `/case-studies/:slug*`

### 13. Canonical Must Be Set on Every Indexable Page

Every page that should appear in search results needs `alternates.canonical` in its metadata. Without it, search engines may pick the wrong URL (with query params, trailing slashes, etc.) as the canonical version. Next.js resolves relative canonical paths against `metadataBase`.

```tsx
alternates: {
  canonical: '/services/webflow',  // relative -- metadataBase makes it absolute
},
```

### 14. Paginated Pages Need Careful Canonical Strategy

Blog and case study listing pages support `?page=2`. These paginated URLs should NOT be in the sitemap and should self-canonicalize (each page canonicals to itself, not page 1). Google dropped `rel="prev/next"` support, so canonical is the main signal.

### 15. SSR Verification for AI and Traditional Crawlers

Both Google and AI scrapers (GPTBot, ClaudeBot) primarily read server-rendered HTML. Content that only appears after client-side JS execution may be invisible. Verify with:

```bash
curl -s https://www.loudface.co/ | grep '<h1' | head -5
```

If H1 or key content is missing from the curl output, it's client-rendered only and needs to move to a Server Component.

### 16. AEO: Self-Contained Opening Paragraphs

AI engines frequently extract only the first paragraph of a page or section. If that paragraph uses pronouns ("We do this...") without establishing who "we" is, the extracted text loses all meaning.

Every key page's opening paragraph should be a complete, self-contained answer:
- BAD: "We offer comprehensive web design services for growing companies."
- GOOD: "LoudFace is a B2B SaaS web design agency that builds conversion-optimized websites on Webflow for Series A+ companies."

The second version works as a standalone AI citation. The first is meaningless without context.

### 17. GEO: Quotable Claim Format

AI engines select text passages to quote in their responses. The ideal quotable claim is:
- **Under 30 words**
- **Contains the entity name** (so attribution survives extraction)
- **Includes a specific metric or credential** (makes it worth citing)
- **Can stand alone** (no pronouns or references requiring prior context)

Example: "LoudFace has delivered 200+ Webflow websites for B2B SaaS companies, with an average 40% improvement in conversion rates within 90 days."

### 18. GEO: Thin Pages Dilute Topical Authority

AI engines evaluate topical authority at the domain level. Pages with little content (under 300 words) on a topic you claim expertise in actually hurt your authority signal. Either:
- Expand thin pages to be genuinely useful (800+ words)
- Consolidate thin pages into a comprehensive resource
- Noindex pages that don't contribute to topical authority

### 19. AEO: Category Membership Statements

AI engines match entities to categories ("best Webflow agency", "top B2B SaaS agency"). These matches depend on explicit category-membership claims in content. The claim must appear in:
1. Schema `description` field
2. About page first paragraph
3. Homepage H1 or opening text
4. At least 2 service pages

If any of these are missing, the entity-category association is weaker.

### 20. Font Loading Affects LCP and CLS

If fonts load late, the browser shows invisible text (FOIT) or swaps fonts (FOUT), both of which hurt Core Web Vitals. Check that:
- `font-display: swap` is set on all `@font-face` declarations
- Critical fonts are preloaded in `<head>` via layout.tsx
- Font files are self-hosted (not loaded from Google Fonts CDN, which adds an extra connection)

### 21. External Links Must Have `rel` Attributes

Every `<a>` with `target="_blank"` needs `rel="noopener noreferrer"` for security (prevents tab-napping) and signals. Next.js `<Link>` handles this automatically for internal links, but external `<a>` tags need it manually.

### 22. llms.txt — The New robots.txt for AI

The `llms.txt` standard (proposed by Jeremy Howard) is a plain-text file at the site root that tells LLMs how to interpret and cite your content. Unlike robots.txt (which controls access), llms.txt provides context: what the site is, what it does, and how it should be referenced. Adoption is ~15% among tech sites as of 2026, but growing. Include: site name, purpose, key services/topics, preferred citation format, and contact.

### 23. E-E-A-T Is the Top AI Citation Signal

Research shows 96% of AI Overview content comes from E-E-A-T verified sources. The correlation between E-E-A-T signals and AI citation is r=0.81 — stronger than any single traditional ranking factor. This means:
- Author bylines with credentials matter more for AI citation than for traditional SEO
- Person schema for authors directly impacts whether AI engines cite your content
- "LoudFace Team" as an author is significantly weaker than a named expert with a LinkedIn profile
- Demonstrating Experience (first-hand work) is as important as Expertise (knowledge)

### 24. Content Freshness Decay Is Exponential for AI

AI engines have much steeper freshness decay curves than Google organic search:
- **Day 0-14**: Full citation potential
- **Day 15-30**: 23% decline in citation frequency
- **Month 2-3**: Still viable but losing ground to fresher sources (2x disadvantage)
- **Month 4-6**: Significant decline — only cited when no fresher alternative exists
- **Week 27+**: Effectively invisible to AI engines

This means content that was "evergreen" for Google SEO may need quarterly updates to maintain AI citation viability. Add visible "Last updated" dates and actually update content — don't just change the date.

## Search Commands

Use these to find issues:

```
# --- TECHNICAL SEO ---

# Find pages with metadata exports
Grep pattern="export (const metadata|async function generateMetadata)" glob="*.tsx" path="src/app"

# Count H1 tags per file
Grep pattern="<h1" glob="*.tsx" path="src"

# Find images potentially missing alt text
Grep pattern="<img" glob="*.tsx" path="src/components"

# Find hardcoded image paths (should use asset())
Grep pattern="src=\"/images" glob="*.tsx" path="src"

# Check for JSON-LD schemas -- should use native <script>, not <Script>
Grep pattern="application/ld\\+json" glob="*.tsx" path="src"

# CRITICAL: Find deferred schemas (bug -- should be native <script>)
Grep pattern="<Script.*application/ld\\+json" glob="*.tsx" path="src"

# Find heading tags in non-content components (potential hierarchy issues)
Grep pattern="<h[1-6]" glob="*.tsx" path="src/components"

# Find pages missing twitter metadata
Grep pattern="generateMetadata" glob="*.tsx" path="src/app"

# Check for brand suffix in CMS title handling
Grep pattern="truncateSeoTitle|meta-title" glob="*.tsx" path="src"

# Find pages with openGraph but missing twitter (inheritance bug)
Grep pattern="openGraph:" glob="*.tsx" path="src/app"
# Then cross-check each result for twitter: in the same metadata block

# Find pages with openGraph missing siteName/locale (replacement bug)
Grep pattern="openGraph:" glob="*.tsx" path="src/app"
# Each must also have siteName and locale

# Find images missing width/height (CLS risk)
Grep pattern="<img" glob="*.tsx" path="src"
# Cross-check each for width= and height= attributes

# Find LCP candidates missing fetchPriority
Grep pattern='loading="eager"' glob="*.tsx" path="src"
# Cross-check for fetchPriority="high"

# Find fallback metadata returns missing noindex
Grep pattern="generateMetadata" glob="*.tsx" path="src/app"
# Check all early returns / error paths for robots: { index: false }

# Find hardcoded dates in sitemap (should be dynamic)
Grep pattern="new Date\(" glob="sitemap.ts" path="src/app"

# --- CANONICAL & PAGINATION ---

# Find pages missing canonical
Grep pattern="canonical:" glob="*.tsx" path="src/app"

# Check if paginated URLs are in sitemap (they shouldn't be)
Grep pattern="page=" glob="sitemap.ts" path="src/app"

# Find duplicate meta descriptions (compare description strings across files)
Grep pattern="description:" glob="*.tsx" path="src/app" -A 1

# --- SSR VERIFICATION ---

# Find client components that render key content (potential SSR gap)
Grep pattern="'use client'" glob="*.tsx" path="src/components/sections"

# Find dynamic imports with ssr: false (content won't be server-rendered)
Grep pattern="ssr:\s*false" glob="*.tsx" path="src"

# --- AEO: ENTITY & AUTHORITY ---

# Check robots.txt allows AI bots
Grep pattern="GPTBot|ClaudeBot|PerplexityBot|Anthropic|Google-Extended|Bytespider" glob="robots.ts" path="src/app"

# Check Organization schema has sameAs (social profiles for entity disambiguation)
Grep pattern="sameAs" glob="layout.tsx" path="src/app"

# Check Organization schema has foundingDate, address, description
Grep pattern="foundingDate|addressLocality|@type.*Organization" glob="layout.tsx" path="src/app"

# Check AboutPage schema exists
Grep pattern="AboutPage" glob="*.tsx" path="src/app/about"

# Find hedging language in service pages (weak for AI citation)
Grep pattern="might help|could be|possibly|may or may not|we think|we believe" glob="*.tsx" path="src/app/services"

# Find hedging language site-wide in content JSON
Grep pattern="might|could potentially|may or may not" glob="*.json" path="src/data"

# Check FAQ sections exist and have schema
Grep pattern="FAQPage|faqSchema" glob="*.tsx" path="src"

# --- AEO: CATEGORY MEMBERSHIP ---

# Check for category-membership claims (entity + category in same sentence)
Grep pattern="LoudFace is|LoudFace, a|LoudFace provides|LoudFace delivers" glob="*.tsx" path="src/app"

# Check schema description for category claims
Grep pattern="description.*agency|description.*Webflow|description.*SaaS" glob="layout.tsx" path="src/app"

# Check if industry vertical pages exist
Glob pattern="src/app/seo-for/**/*.tsx"

# --- AEO: CONTENT FRESHNESS ---

# Check blog posts have datePublished/dateModified in schema
Grep pattern="datePublished|dateModified" glob="*.tsx" path="src/app/blog"

# Check for visible date markup in blog posts
Grep pattern="published-date|last-updated|dateTime" glob="*.tsx" path="src/app/blog"

# Check sitemap uses dynamic dates
Grep pattern="lastModified" glob="sitemap.ts" path="src/app"

# --- GEO: QUOTABILITY ---

# Find pages without specific numbers (potential vague claims)
# Check service pages for metric-backed claims
Grep pattern="[0-9]+%|[0-9]+x|[0-9]+ (clients|projects|websites|companies)" glob="*.tsx" path="src/app/services"

# Check case studies for measurable outcomes
Grep pattern="result|increase|decrease|improve|growth|revenue|traffic" glob="*.tsx" path="src/app/case-studies"

# --- GEO: STRUCTURED FORMATS ---

# Find actual table elements (preferred for comparisons)
Grep pattern="<table|<thead|<tbody" glob="*.tsx" path="src"

# Find ordered lists (preferred for processes)
Grep pattern="<ol" glob="*.tsx" path="src/app"

# Find definition patterns
Grep pattern="What is|Definition|refers to" glob="*.tsx" path="src/app"

# --- GEO: TOPICAL AUTHORITY ---

# Count content pages per topic cluster
Grep pattern="webflow|Webflow" glob="*.tsx" path="src/app" output_mode="count"
Grep pattern="SEO|seo|search engine" glob="*.tsx" path="src/app" output_mode="count"
Grep pattern="CRO|conversion" glob="*.tsx" path="src/app" output_mode="count"

# Find thin pages (might need manual review)
# Check blog posts for content length indicators

# --- GEO: BRAND CONSISTENCY ---

# Check brand name appears consistently
Grep pattern="LoudFace" glob="*.tsx" path="src/app/layout.tsx"
Grep pattern="LoudFace" glob="*.tsx" path="src/app/about"
Grep pattern="LoudFace" glob="*.json" path="src/data"

# Check social profile links are consistent
Grep pattern="instagram|linkedin|dribbble|webflow" glob="layout.tsx" path="src/app"

# --- GEO: SOURCE CITATIONS ---

# Check blog posts cite external sources
Grep pattern='href="https?://' glob="*.tsx" path="src/app/blog"

# Check for external authority references in service pages
Grep pattern='href="https?://' glob="*.tsx" path="src/app/services"

# --- FONT LOADING ---

# Check font-display is set
Grep pattern="font-display" glob="*.css" path="src"

# Check for font preloads in layout
Grep pattern="preload.*font|font.*preload" glob="layout.tsx" path="src/app"

# --- EXTERNAL LINKS ---

# Find external links missing rel attributes
Grep pattern='target="_blank"' glob="*.tsx" path="src"

# --- OG IMAGE ---

# Verify OG image generator exists
Glob pattern="src/app/opengraph-image*"

# --- AEO: E-E-A-T & ENTITY ---

# Check for llms.txt file
Glob pattern="public/llms.txt"

# Check for Person schema (author entities)
Grep pattern="Person|author.*schema|authorSchema" glob="*.tsx" path="src"

# Check for Speakable schema
Grep pattern="speakable|Speakable" glob="*.tsx" path="src"

# Check for HowTo schema
Grep pattern="HowTo|howToSchema" glob="*.tsx" path="src"

# Check for disambiguatingDescription in schema
Grep pattern="disambiguatingDescription" glob="*.tsx" path="src/app"

# Check for author bylines in blog posts
Grep pattern="author|byline|written.by" glob="*.tsx" path="src/app/blog"

# Check for E-E-A-T credential signals
Grep pattern="certified|certification|years.*experience|expert|specialist" glob="*.tsx" path="src"

# --- DUPLICATE META ---

# Extract all title strings to compare for duplicates
Grep pattern="title:" glob="*.tsx" path="src/app" -A 0
```

## Output Format

Generate a report in this format:

```markdown
# SEO, AEO & GEO Audit Report

**Target**: [file/directory/site]
**Date**: [current date]
**Auditor**: Claude SEO/AEO/GEO Reviewer

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Meta Tags | X/10 | Pass/Warn/Fail |
| Content Structure | X/10 | Pass/Warn/Fail |
| Images | X/10 | Pass/Warn/Fail |
| Structured Data | X/10 | Pass/Warn/Fail |
| Internal Links | X/10 | Pass/Warn/Fail |
| Site Infrastructure | X/10 | Pass/Warn/Fail |
| Canonicals & Pagination | X/10 | Pass/Warn/Fail |
| SSR & Rendering | X/10 | Pass/Warn/Fail |
| AEO Readiness | X/20 | Pass/Warn/Fail |
| GEO Readiness | X/20 | Pass/Warn/Fail |

**Overall Score**: X/130

## Critical Issues (Must Fix)

### 1. [Issue Title]
**File**: `path/to/file.tsx:line`
**Problem**: [Description]
**Impact**: [SEO/AEO/GEO impact]
**Fix**: [Specific fix with code example]

## Warnings (Should Fix)

### 1. [Issue Title]
**Problem**: [Description]
**Fix**: [Recommendation]

## Suggestions (Nice to Have)

1. [Suggestion]
2. [Suggestion]

## Passing Items

- [Pass] [What's working well]
- [Pass] [What's working well]

## Action Items

Priority order for fixes:
1. [ ] [Critical fix 1]
2. [ ] [Critical fix 2]
3. [ ] [Warning fix 1]
```

## Scoring Guide

| Score | Meaning |
|-------|---------|
| 10 (or 20) | Perfect, no issues |
| 8-9 (or 16-19) | Minor issues only |
| 6-7 (or 12-15) | Some issues to address |
| 4-5 (or 8-11) | Significant issues |
| 0-3 (or 0-7) | Critical problems |

AEO and GEO are scored out of 20 (not 10) because they cover more ground, include E-E-A-T and freshness decay signals, and are weighted higher for sites that sell these services.

## Post-Audit: AI Citation Monitoring

After implementing audit fixes, track AI citation performance over time. This is not a one-time audit — it's an ongoing measurement practice.

### What to Monitor

| Metric | Tool | Frequency |
|--------|------|-----------|
| AI citation share (brand mentions in AI responses) | Otterly AI, Peec AI, Siftly | Weekly |
| AI sentiment (how AI engines describe your brand) | Manual prompting + Siftly | Monthly |
| Zero-click displacement (traffic lost to AI answers) | GSC + GA4 comparison | Monthly |
| Content freshness score (% of pages updated in last 90 days) | Internal audit | Quarterly |
| Schema validation (no errors in structured data) | Google Rich Results Test | After deploys |

### Monitoring Prompts

Test these queries in ChatGPT, Perplexity, Claude, and Gemini:
- "Best [your category] agency" (e.g., "Best B2B SaaS web design agency")
- "[Your brand] vs [competitor]"
- "Who should I hire for [your service]?"
- "[Your service] agency in [your location]"

Track whether your brand appears, how it's described, and whether the citation includes accurate information from your structured data.

## Reference Files

For detailed checklists and schema examples:
- [Detailed Checklist](checklist.md)
- [Schema Examples](schemas.md)
- [SEO Standards](../../rules/seo-standards.md)
