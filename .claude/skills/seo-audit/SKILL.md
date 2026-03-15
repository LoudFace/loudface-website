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

### Step 7: Migration & Redirect Audit

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

**Overall Score**: X/60

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
