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
- **Single file** (`src/pages/index.astro`): Audit that page only
- **Directory** (`src/pages/`): Audit all pages in directory
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

- [ ] WebSite schema present (Layout.astro)
- [ ] Organization schema present (Layout.astro)
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

## Search Commands

Use these to find issues:

```
# Find pages without meta descriptions
Grep pattern="<meta name=\"description\"" glob="*.astro" path="src/pages"

# Count H1 tags per file
Grep pattern="<h1" glob="*.astro" path="src"

# Find images potentially missing alt text
Grep pattern="<img" glob="*.astro" path="src/components"

# Find hardcoded image paths (should use asset())
Grep pattern="src=\"/images" glob="*.astro" path="src"

# Check for JSON-LD schemas
Grep pattern="application/ld\\+json" glob="*.astro" path="src"
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
**File**: `path/to/file.astro:line`
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
