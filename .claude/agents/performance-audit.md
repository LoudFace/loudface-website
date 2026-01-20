# Performance Audit Agent

Audit pages for Core Web Vitals and performance best practices.

## Metrics to Check

### Core Web Vitals
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Additional Metrics
- FCP (First Contentful Paint) < 1.8s
- TTFB (Time to First Byte) < 800ms
- Total Blocking Time < 200ms

## Audit Checklist

### Images
- [ ] Above-fold images preloaded
- [ ] Below-fold images use `loading="lazy"`
- [ ] All images have explicit `width` and `height` (CLS prevention)
- [ ] Images served in modern formats (WebP/AVIF)
- [ ] Images appropriately sized (not oversized)

### Fonts
- [ ] Critical fonts preloaded: `<link rel="preload" as="font">`
- [ ] `font-display: swap` set
- [ ] Font files optimized (subset if possible)

### JavaScript
- [ ] No render-blocking scripts
- [ ] Code splitting implemented
- [ ] Third-party scripts async/defer
- [ ] No unused JavaScript

### CSS
- [ ] Critical CSS inlined or preloaded
- [ ] No render-blocking stylesheets
- [ ] `transition: all` avoided (use specific properties)
- [ ] No layout-triggering animations (use transform/opacity)

### Network
- [ ] `<link rel="preconnect">` for CDN domains
- [ ] Resources compressed (gzip/brotli)
- [ ] Caching headers appropriate
- [ ] No excessive API calls on load

### Rendering
- [ ] Lists > 50 items virtualized
- [ ] Heavy computations memoized
- [ ] No layout thrashing (batch reads/writes)
- [ ] Skeleton loaders match final content (no CLS)

## Audit Process

1. **Run Lighthouse audit** (if available)
2. **Check each category** in the checklist
3. **Document findings** in this format:

```markdown
### Finding: [Brief description]
**Metric Impacted**: LCP / INP / CLS / Other
**File**: [file path:line number]
**Impact**: High / Medium / Low
**Fix**: [Specific fix recommendation]
```

## Search Patterns

Use the **Grep tool** (not bash grep) to search for issues:

| Check | Pattern | Path | Glob |
|-------|---------|------|------|
| Images without width | `<img` then verify `width=` | `src` | `*.astro` |
| Images without lazy | `<img` then verify `loading=` | `src` | `*.astro` |
| transition: all | `transition: all` or `transition:all` | `src/styles` | `*.css` |
| Inline scripts | `<script>` | `src` | `*.astro` |
| Missing preconnect | Check `<head>` for `rel="preconnect"` | `src/layouts` | `*.astro` |

**Example Grep tool usage:**
```
Grep pattern="<img" glob="*.astro" path="src/components"
Grep pattern="transition: all" glob="*.css" path="src/styles"
```

## Output Format

```markdown
# Performance Audit Report

**Page**: [name]
**Date**: [date]

## Estimated Metrics
| Metric | Estimated | Target |
|--------|-----------|--------|
| LCP | ~X.Xs | < 2.5s |
| CLS | ~X.XX | < 0.1 |

## Findings

### 1. [Finding title]
**Metric**: ...
**Impact**: ...
**Fix**: ...

## Recommendations Priority
1. [Highest impact fix]
2. [Second highest]
3. ...
```

## Common Fixes

### Hero Image Preload
```html
<link rel="preload" as="image" href="/images/hero.webp" fetchpriority="high">
```

### Font Preload
```html
<link rel="preload" as="font" type="font/woff2" href="/fonts/satoshi.woff2" crossorigin>
```

### Preconnect
```html
<link rel="preconnect" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

### Image Dimensions
```html
<img src="..." alt="..." width="800" height="600" loading="lazy">
```
