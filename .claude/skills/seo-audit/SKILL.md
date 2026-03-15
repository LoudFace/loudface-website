---
name: seo-audit
description: Comprehensive SEO audit of pages, components, or the entire site. Use before publishing content, after major changes, or for periodic SEO health checks.
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[file, directory, or 'site' for full audit]"
---

# SEO Audit Skill

Perform a comprehensive SEO audit of the specified target.

**Target**: $ARGUMENTS (file path, directory, or "site" for full audit)

## Audit Process

### Step 1: Determine Scope

Based on the argument:
- **Single file** (`src/app/page.tsx`): Audit that page only
- **Directory** (`src/app/work/`): Audit all pages in directory
- **"site"**: Full site-wide SEO audit

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
  - FAQ sections → FAQPage schema
  - Case studies → Article + BreadcrumbList schemas
  - Blog posts → BlogPosting + BreadcrumbList schemas
- [ ] All schemas valid JSON-LD syntax

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
- [ ] No duplicate `description` across pages — each must be unique

### Step 8: SSR & Rendering Audit

Crawlers only see server-rendered HTML. Content behind client-side JS may be invisible.

- [ ] Key page content (H1, body text, internal links) is server-rendered, not client-only
- [ ] `'use client'` components still render meaningful HTML on the server (not empty shells)
- [ ] No hydration errors that cause content mismatch between SSR and client
- [ ] Dynamic imports (`next/dynamic`) have `ssr: true` (default) — not `ssr: false` for content

To verify: `curl -s https://www.loudface.co/[page] | grep -c '<h1'` should return 1.

### Step 9: AEO (AI Engine Optimization) Audit

AI engines (ChatGPT, Perplexity, Claude, Gemini) extract content differently from traditional crawlers. This step ensures the site is structured for AI citation.

#### Entity & Authority Signals
- [ ] Organization schema includes `sameAs` with all social/directory profiles
- [ ] About page has clear entity description (who, what, where, expertise)
- [ ] Team member pages/sections include names, roles, and credentials
- [ ] Service pages use definitive language ("We provide X" not "X might help")

#### Content Structure for AI Extraction
- [ ] Key pages have clear Q&A patterns (question as H2/H3, answer immediately follows)
- [ ] FAQ sections use proper FAQPage schema (already checked in Step 5)
- [ ] Content includes specific claims with evidence (stats, timeframes, case study references)
- [ ] Avoid hedging language ("might", "could", "possibly") on core service descriptions
- [ ] First paragraph of each page is a self-contained summary (AI often extracts just this)

#### Technical AEO Signals
- [ ] robots.txt allows AI bots: GPTBot, ChatGPT-User, ClaudeBot, Anthropic-ai, PerplexityBot, Google-Extended, Bytespider
- [ ] Content is in server-rendered HTML (AI scrapers don't execute JS)
- [ ] No excessive paywall or gate patterns that block AI from reading content
- [ ] Structured data provides machine-readable entity relationships

#### Comparison & Recommendation Readiness
- [ ] Service pages clearly state what differentiates the offering (AI uses this for "best X" queries)
- [ ] Case studies include measurable outcomes (AI cites specific numbers)
- [ ] Content addresses "vs" and "alternative to" queries where relevant
- [ ] Industry-specific pages exist for vertical targeting (seo-for/[slug] pattern)

### Step 10: Font & Resource Loading Audit

- [ ] Critical fonts have `font-display: swap` or `optional` (prevents FOIT)
- [ ] Above-fold fonts are preloaded via `<link rel="preload">`
- [ ] No render-blocking CSS or JS in the critical path
- [ ] Third-party scripts (analytics, chat, etc.) are deferred or loaded after interaction

### Step 11: External Link Audit

- [ ] External links with `target="_blank"` have `rel="noopener noreferrer"`
- [ ] Sponsored/affiliate links have `rel="nofollow sponsored"`
- [ ] No broken external links (links to domains that no longer exist)
- [ ] Social media links in footer/header are correct and resolve

### Step 12: Duplicate Content & Meta Audit

- [ ] No two pages share the same `<title>` tag
- [ ] No two pages share the same `<meta name="description">`
- [ ] OG image file (`opengraph-image.tsx` or equivalent) exists and generates correctly
- [ ] Dynamic pages don't produce thin/empty content when CMS data is missing (caught by noindex fallback)

### Step 13: Migration & Redirect Audit

When auditing after a site migration:
- [ ] All old URLs redirect (301) to new equivalents
- [ ] No redirect chains (A → B → C should be A → C)
- [ ] Sitemap resubmitted to Google Search Console
- [ ] Key pages requested for re-indexing via GSC
- [ ] Old sitemap deleted from GSC
- [ ] No soft 404s (pages that return 200 but show error content)

## Critical Gotchas (Learned the Hard Way)

### 1. `<Script>` vs `<script>` for JSON-LD

**CRITICAL**: Next.js `<Script>` from `next/script` defers loading. Crawlers that only see initial HTML will MISS your structured data.

```tsx
// WRONG — deferred, crawlers may miss it
import Script from 'next/script';
<Script id="schema" type="application/ld+json" ... />

// CORRECT — rendered in initial HTML, visible to all crawlers
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

Sidebar labels ("Services", "Technologies", "On this page") are **not** content sections — use `<h3>` only when they're inside an article context under an `<h2>`.

### 5. Internal Link Equity

Service names in case study sidebars, technology tags, and similar elements should be `<Link>` components to their respective pages, not plain `<span>` elements. Every missed link is lost internal link equity.

### 6. OG/Twitter Complete Replacement (Not Merge)

When a child page defines its own `openGraph` object in Next.js metadata, it **completely replaces** the parent layout's OG — it does NOT merge. This means `siteName`, `locale`, `images`, and `type` from the layout are all lost. Every page that sets `openGraph` must re-specify all fields:

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

Client components that calculate dimensions in JS (like logo normalizers) must still set `width` and `height` on the `<img>` tag for the pre-JS render. Otherwise, CLS occurs during hydration. The wrapper `<div>` having dimensions is not sufficient — the browser needs them on the `<img>` itself for aspect ratio calculation.

### 11. Sitemap `lastModified` Must Be Dynamic

Never hardcode sitemap dates. Use `new Date()` (current build time) for static pages. For CMS content, use the item's published/modified date if available, falling back to build time.

### 12. Webflow URL Structure Changes Need Exhaustive Redirects

Common Webflow → Next.js URL changes that need 301 redirects:
- `/work` → `/case-studies` (portfolio section rename)
- `/about-us` → `/about`
- `/policy-pages/terms-of-service` → `/terms`
- `/policy-pages/privacy-policy` → `/privacy`
- `/services` (index page) → `/services/webflow` (if index removed)
- `/contact` → `/` (if contact page merged into homepage CTA)
- `/careers` → `/about` (if careers removed)

Use wildcard patterns for nested paths: `/work/:slug*` → `/case-studies/:slug*`

### 13. Canonical Must Be Set on Every Indexable Page

Every page that should appear in search results needs `alternates.canonical` in its metadata. Without it, search engines may pick the wrong URL (with query params, trailing slashes, etc.) as the canonical version. Next.js resolves relative canonical paths against `metadataBase`.

```tsx
alternates: {
  canonical: '/services/webflow',  // relative — metadataBase makes it absolute
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

### 16. AEO Content Patterns That Get Cited

AI engines prefer content that:
- **Leads with a direct answer** — first paragraph answers the query, details follow
- **Uses specific numbers** — "147% increase in 6 months" not "significant improvement"
- **States things definitively** — "We provide X" not "X might help"
- **Includes structured comparisons** — tables, pros/cons, "X vs Y" sections
- **Has clear entity attribution** — "LoudFace, a B2B SaaS agency based in Dubai, specializes in..."

Content that hedges, uses filler, or buries the answer deep in the page rarely gets cited.

### 17. Font Loading Affects LCP and CLS

If fonts load late, the browser shows invisible text (FOIT) or swaps fonts (FOUT), both of which hurt Core Web Vitals. Check that:
- `font-display: swap` is set on all `@font-face` declarations
- Critical fonts are preloaded in `<head>` via layout.tsx
- Font files are self-hosted (not loaded from Google Fonts CDN, which adds an extra connection)

### 18. External Links Must Have `rel` Attributes

Every `<a>` with `target="_blank"` needs `rel="noopener noreferrer"` for security (prevents tab-napping) and signals. Next.js `<Link>` handles this automatically for internal links, but external `<a>` tags need it manually.

## Search Commands

Use these to find issues:

```
# Find pages with metadata exports
Grep pattern="export (const metadata|async function generateMetadata)" glob="*.tsx" path="src/app"

# Count H1 tags per file
Grep pattern="<h1" glob="*.tsx" path="src"

# Find images potentially missing alt text
Grep pattern="<img" glob="*.tsx" path="src/components"

# Find hardcoded image paths (should use asset())
Grep pattern="src=\"/images" glob="*.tsx" path="src"

# Check for JSON-LD schemas — should use native <script>, not <Script>
Grep pattern="application/ld\\+json" glob="*.tsx" path="src"

# CRITICAL: Find deferred schemas (bug — should be native <script>)
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

# Find images missing loading attribute (should be explicit)
Grep pattern="<img(?!.*loading=)" glob="*.tsx" path="src"

# Find LCP candidates missing fetchPriority
Grep pattern='loading="eager"' glob="*.tsx" path="src"
# Cross-check for fetchPriority="high"

# Find fallback metadata returns missing noindex
Grep pattern="generateMetadata" glob="*.tsx" path="src/app"
# Check all early returns / error paths for robots: { index: false }

# Verify redirects cover old Webflow URLs
# Check next.config.ts redirects() section

# Find hardcoded dates in sitemap (should be dynamic)
Grep pattern="new Date\(" glob="sitemap.ts" path="src/app"

# --- CANONICAL & PAGINATION ---

# Find pages missing canonical
Grep pattern="canonical:" glob="*.tsx" path="src/app"
# Every page with metadata/generateMetadata should have alternates.canonical

# Check if paginated URLs are in sitemap (they shouldn't be)
Grep pattern="page=" glob="sitemap.ts" path="src/app"

# Find duplicate meta descriptions (compare description strings across files)
Grep pattern="description:" glob="*.tsx" path="src/app" -A 1

# --- SSR VERIFICATION ---

# Find client components that render key content (potential SSR gap)
Grep pattern="'use client'" glob="*.tsx" path="src/components/sections"
# Cross-check: do these contain H1/H2 tags or main page content?

# Find dynamic imports with ssr: false (content won't be server-rendered)
Grep pattern="ssr:\s*false" glob="*.tsx" path="src"

# --- AEO READINESS ---

# Check robots.txt allows AI bots
Grep pattern="GPTBot|ClaudeBot|PerplexityBot|Anthropic|Google-Extended|Bytespider" glob="robots.ts" path="src/app"

# Check Organization schema has sameAs (social profiles for entity disambiguation)
Grep pattern="sameAs" glob="layout.tsx" path="src/app"

# Find hedging language in service pages (weak for AI citation)
Grep pattern="might help|could be|possibly|may or may not" glob="*.tsx" path="src/app/services"

# Check FAQ sections exist and have schema
Grep pattern="FAQPage|faqSchema" glob="*.tsx" path="src"

# --- FONT LOADING ---

# Check font-display is set
Grep pattern="font-display" glob="*.css" path="src"

# Check for font preloads in layout
Grep pattern="preload.*font|font.*preload" glob="layout.tsx" path="src/app"

# --- EXTERNAL LINKS ---

# Find external links missing rel attributes
Grep pattern='target="_blank"' glob="*.tsx" path="src"
# Cross-check each for rel="noopener" or rel="noopener noreferrer"

# Find all external <a> tags (not Link components)
Grep pattern='<a href="http' glob="*.tsx" path="src"

# --- OG IMAGE ---

# Verify OG image generator exists
Glob pattern="src/app/opengraph-image*"

# --- DUPLICATE META ---

# Extract all title strings to compare for duplicates
Grep pattern="title:" glob="*.tsx" path="src/app" -A 0
```

## Output Format

Generate a report in this format:

```markdown
# SEO Audit Report

**Target**: [file/directory/site]
**Date**: [current date]
**Auditor**: Claude SEO Reviewer

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Meta Tags | X/10 | ✅/⚠️/❌ |
| Content Structure | X/10 | ✅/⚠️/❌ |
| Images | X/10 | ✅/⚠️/❌ |
| Structured Data | X/10 | ✅/⚠️/❌ |
| Internal Links | X/10 | ✅/⚠️/❌ |
| Site Infrastructure | X/10 | ✅/⚠️/❌ |
| AEO Readiness | X/10 | ✅/⚠️/❌ |
| Canonicals & Pagination | X/10 | ✅/⚠️/❌ |
| SSR & Rendering | X/10 | ✅/⚠️/❌ |

**Overall Score**: X/90

## Critical Issues (Must Fix)

### 1. [Issue Title]
**File**: `path/to/file.tsx:line`
**Problem**: [Description]
**Impact**: [SEO impact]
**Fix**: [Specific fix with code example]

## Warnings (Should Fix)

### 1. [Issue Title]
**Problem**: [Description]
**Fix**: [Recommendation]

## Suggestions (Nice to Have)

1. [Suggestion]
2. [Suggestion]

## Passing Items

- ✅ [What's working well]
- ✅ [What's working well]

## Action Items

Priority order for fixes:
1. [ ] [Critical fix 1]
2. [ ] [Critical fix 2]
3. [ ] [Warning fix 1]
```

## Scoring Guide

| Score | Meaning |
|-------|---------|
| 10 | Perfect, no issues |
| 8-9 | Minor issues only |
| 6-7 | Some issues to address |
| 4-5 | Significant issues |
| 0-3 | Critical problems |

## Reference Files

For detailed checklists and schema examples:
- [Detailed Checklist](checklist.md)
- [Schema Examples](schemas.md)
- [SEO Standards](../../rules/seo-standards.md)
