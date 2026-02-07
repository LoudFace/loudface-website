---
name: bento-visuals
version: 1.0.0
description: When the user wants to build bento grid sections with inline visuals, infographics, data visualizations, or decorative UI mockups inside cards. Use when you hear "bento grid," "visual cards," "infographic section," "capability cards," "feature cards with visuals," or "illustrated bento." This skill produces production-grade inline visuals using only SVG + HTML/CSS — no external images, no icon libraries, no illustration assets.
---

# Bento Grid Visuals

Build bento grid sections where each card contains a **miniature functional visual** paired with a title and description. The visuals are built entirely from inline SVG and HTML/CSS — no images, no icons, no external assets.

## The Core Principle

> **Show the thing, not about the thing.**

Every visual must be a miniature functional representation of the concept it describes. Not an icon. Not an illustration. Not a decorative shape. The visual for "analytics" is a chart. The visual for "CMS" is an editor wireframe. The visual for "responsive design" is layouts morphing between breakpoints.

If you can't build a visual that IS the concept, use a different approach for that card (skeleton UI, realistic wireframe, or data display).

## Before Building

1. **Read `COMPONENTS.md`** — use `Card`, `SectionContainer`, `SectionHeader`
2. **Read `globals.css`** — check available keyframes (`marquee`, `fadeIn`) and tokens
3. **Check `.claude/rules/styling.md`** — color hierarchy, spacing, typography
4. **Decide server vs client** — static visuals are server components. Animated visuals need `'use client'` and should be extracted to `src/components/ui/`

## Card Anatomy

Every bento card follows the same structure:

```tsx
<Card padding="none" hover={false}>
  {/* Visual zone — decorative, hidden from screen readers */}
  <div className="p-5" aria-hidden="true">
    <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 {layout-specific}">
      {/* The visual goes here */}
    </div>
  </div>

  {/* Text zone */}
  <div className="px-5 pb-5">
    <h3 className="text-lg font-medium text-surface-900">{title}</h3>
    <p className="mt-2 text-surface-600">{description}</p>
  </div>
</Card>
```

### Fixed Rules

| Element | Value | Why |
|---------|-------|-----|
| Visual container height | `h-40` (160px) | Consistent visual rhythm across all cards |
| Visual container style | `rounded-xl bg-surface-50 border border-surface-100` | Creates a "screen" or "viewport" frame |
| Visual wrapper | `p-5` with `aria-hidden="true"` | Padding + accessibility |
| Text wrapper | `px-5 pb-5` | Consistent text spacing |
| Card props | `padding="none" hover={false}` | Card manages border/radius, we manage inner layout |
| Title | `text-lg font-medium text-surface-900` | Standard card heading |
| Description | `mt-2 text-surface-600` | Standard card body |

### Wide Cards (2-col span)

For cards spanning 2 columns, use a side-by-side layout:

```tsx
<Card padding="none" hover={false} className="md:col-span-2">
  <div className="grid grid-cols-1 sm:grid-cols-2">
    <div className="p-5" aria-hidden="true">
      <div className="h-full min-h-[12rem] rounded-xl bg-surface-50 border border-surface-100 overflow-hidden">
        {/* Visual */}
      </div>
    </div>
    <div className="p-5 flex flex-col justify-center">
      <h3 className="text-lg font-medium text-surface-900">{title}</h3>
      <p className="mt-2 text-surface-600">{description}</p>
    </div>
  </div>
</Card>
```

### Full-Width Dark Card (3-col span)

For a dramatic closer spanning the full grid:

```tsx
<div className="md:col-span-3 rounded-xl bg-surface-900 overflow-hidden">
  <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
    <div className="px-6 pt-8 sm:py-10 sm:pl-10" aria-hidden="true">
      {/* Visual — use lighter tokens (primary-400/500, surface-200/500) */}
    </div>
    <div className="p-6 sm:p-8">
      <h3 className="text-xl font-medium text-white">{title}</h3>
      <p className="mt-2 text-surface-300 max-w-md">{description}</p>
    </div>
  </div>
</div>
```

## Grid Layout

Use a 3-column grid with strategic spanning for rhythm:

```tsx
<div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
  {/* Row 1: three 1×1 cards — uniform, establishes rhythm */}
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>

  {/* Row 2: one 2×1 + one 1×1 — breaks monotony */}
  <Card className="md:col-span-2">...</Card>
  <Card>...</Card>

  {/* Row 3: full-width dark closer */}
  <div className="md:col-span-3">...</div>
</div>
```

**Layout variations** (pick one per section):

| Pattern | Grid spans | Feel |
|---------|------------|------|
| Uniform top, wide bottom | `1+1+1`, `2+1`, `3` | Progressive widening, dramatic close |
| Wide top, uniform bottom | `2+1`, `1+1+1`, `3` | Leads with a showcase |
| Alternating | `1+1+1`, `3`, `1+1+1` | Full-width separator in middle |
| All uniform | `1+1+1`, `1+1+1` | Clean, no hierarchy |

## Visual Types Catalog

### 1. Data Chart (SVG)

For metrics, analytics, performance, growth concepts.

```tsx
<div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 relative">
  {/* Metric callout — floating card in corner */}
  <div className="absolute top-3 right-3 bg-white rounded-lg shadow-sm border border-surface-200 px-3 py-2 z-10">
    <span className="block text-2xs text-surface-500">Label</span>
    <div className="flex items-baseline gap-1 mt-0.5">
      <span className="text-base font-mono font-semibold text-surface-900">+147%</span>
      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
        <path d="M7 3L12 9H2L7 3Z" fill="var(--color-success)" />
      </svg>
    </div>
  </div>

  {/* Area chart */}
  <svg className="w-full h-full" viewBox="0 0 320 120" fill="none">
    <defs>
      <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0.02" />
      </linearGradient>
    </defs>
    {/* Dashed grid lines */}
    {[30, 55, 80].map((y) => (
      <line key={y} x1="0" y1={y} x2="320" y2={y}
        stroke="var(--color-surface-200)" strokeWidth="1" strokeDasharray="4 4" />
    ))}
    {/* Filled area */}
    <path d="M0,95 C40,85 80,75 120,60 C160,45 200,35 240,20 C270,12 300,6 320,4 L320,120 L0,120Z"
      fill="url(#chart-fill)" />
    {/* Stroke line */}
    <path d="M0,95 C40,85 80,75 120,60 C160,45 200,35 240,20 C270,12 300,6 320,4"
      stroke="var(--color-primary-500)" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" />
    {/* Endpoint glow */}
    <circle cx="320" cy="4" r="6" fill="var(--color-primary-500)" fillOpacity="0.2" />
    <circle cx="320" cy="4" r="3.5" fill="var(--color-primary-500)" />
  </svg>
</div>
```

**Layers:** Grid lines -> gradient fill -> stroke line -> endpoint glow. Each layer adds depth.

**Adapt for:** bar charts (rects instead of path), donut charts (circle strokes), sparklines (simpler path).

### 2. Score Gauge (SVG)

For scores, ratings, performance metrics, compliance.

```tsx
<div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 flex items-center gap-4">
  {/* Ring gauge */}
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="flex-shrink-0">
    <circle cx="44" cy="44" r="36" stroke="var(--color-surface-200)" strokeWidth="6" />
    <circle cx="44" cy="44" r="36"
      stroke="var(--color-success)" strokeWidth="6" strokeLinecap="round"
      strokeDasharray={`${(score / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
      transform="rotate(-90 44 44)" />
    <text x="44" y="40" textAnchor="middle"
      style={{ fontSize: '22px', fontWeight: 600, fill: 'var(--color-surface-900)', fontFamily: 'var(--font-mono)' }}>
      {score}
    </text>
    <text x="44" y="56" textAnchor="middle"
      style={{ fontSize: '10px', fill: 'var(--color-surface-500)' }}>
      / 100
    </text>
  </svg>

  {/* Checklist beside gauge */}
  <div className="flex flex-col gap-2">
    {items.map((item) => (
      <div key={item} className="flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
          <path d="M5 8l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-surface-700">{item}</span>
      </div>
    ))}
  </div>
</div>
```

### 3. Editor / UI Wireframe (HTML/CSS)

For CMS, dashboards, admin interfaces, editing experiences.

Build with real HTML elements styled to look like a UI:

```tsx
<div className="h-full min-h-[12rem] rounded-xl bg-surface-50 border border-surface-100 overflow-hidden">
  {/* Toolbar — traffic light dots + address bar skeleton */}
  <div className="px-4 py-2.5 border-b border-surface-200 flex items-center gap-2">
    <div className="flex gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
    </div>
    <div className="flex-1 h-5 bg-white rounded border border-surface-200 flex items-center px-2">
      <div className="h-1.5 w-20 bg-surface-200 rounded-full" />
    </div>
  </div>

  {/* Content fields — mix real text with skeleton bars */}
  <div className="p-4 flex flex-col gap-3">
    <div>
      <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">title</div>
      <div className="h-9 rounded-lg bg-white border border-surface-200 flex items-center px-3">
        <span className="text-sm font-medium text-surface-900">Actual text here</span>
      </div>
    </div>
    <div>
      <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">body</div>
      <div className="h-16 rounded-lg bg-white border border-surface-200 p-3 space-y-2">
        <div className="h-2 w-full bg-surface-200 rounded-full" />
        <div className="h-2 w-4/5 bg-surface-200 rounded-full" />
        <div className="h-2 w-3/5 bg-surface-100 rounded-full" />
      </div>
    </div>
  </div>
</div>
```

**Key techniques:**
- Monospace field labels (`text-2xs font-mono font-medium text-surface-400`) sell "code/CMS" feel
- Mix 1-2 real text values with skeleton `rounded-full` bars for believability
- Traffic-light dots (3x `w-2.5 h-2.5 rounded-full bg-surface-300`) signal "app window"
- Status badges with colored dots add realism: `<span className="w-1.5 h-1.5 rounded-full bg-success" />`

### 4. Logo Marquee (HTML/CSS + animation)

For integrations, partners, tech stacks, ecosystem concepts.

Requires the `animate-marquee` keyframe from `globals.css`.

```tsx
<div className="h-40 rounded-xl bg-surface-50 border border-surface-100 flex flex-col justify-center gap-2.5 overflow-hidden">
  {/* Each row: edge-faded, infinite scroll */}
  <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    <div className="flex gap-2.5 animate-marquee" style={{ animationDuration: '18s' }}>
      {/* Duplicate items 2x for seamless loop */}
      {[...Array(2)].flatMap((_, dup) =>
        brands.map((b, i) => (
          <span key={`${dup}-${i}`}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-surface-200 shadow-sm whitespace-nowrap">
            <img src={`https://cdn.brandfetch.io/${b.domain}/icon/fallback/transparent/...`}
              alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
            <span className="text-sm font-medium text-surface-700">{b.name}</span>
          </span>
        ))
      )}
    </div>
  </div>

  {/* Row 2: reverse direction, different speed */}
  {/* Row 3: forward again, even slower */}
</div>
```

**Key techniques:**
- Edge fade via `[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]`
- Each row gets a different `animationDuration` for organic feel
- Reverse rows via `[animation-direction:reverse]`
- 2-3 rows creates the "wall of integrations" effect
- Duplicate items `[...Array(2)]` for seamless CSS loop

### 5. Skeleton Stack (HTML/CSS)

For component architecture, layout systems, modular design concepts.

Stacked cards with slight rotation, simulating layered UI components:

```tsx
<div className="relative w-full max-w-sm h-80">
  {/* Layer 1 — back */}
  <div className="absolute top-0 left-4 right-8 bg-white rounded-xl border border-surface-200 shadow-md p-4 rotate-[-2deg]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-100" />
      <div className="h-2.5 w-24 bg-surface-100 rounded-full" />
    </div>
  </div>

  {/* Layer 2 — middle (slightly larger, more shadow) */}
  <div className="absolute top-16 left-0 right-4 bg-white rounded-xl border border-surface-200 shadow-lg p-6 rotate-[1deg]">
    {/* Skeleton content lines */}
  </div>

  {/* Layer 3 — front */}
  <div className="absolute bottom-0 left-8 right-0 bg-white rounded-xl border border-surface-200 shadow-md p-5 rotate-[-1deg]">
    {/* CTA skeleton */}
  </div>
</div>
```

**Key techniques:**
- Absolute positioning with offset `top`/`left`/`right` values
- Subtle rotation (`rotate-[-2deg]`, `rotate-[1deg]`) prevents sterile alignment
- Shadow escalation: `shadow-md` -> `shadow-lg` -> `shadow-md` makes middle layer pop
- Each "card" represents a different component type (nav, hero, CTA)

### 6. Animated Grid / Counter (Client Component)

For scalability, growth, multi-page concepts.

Extract to a separate `'use client'` component in `src/components/ui/`.

**Pattern:** Items appear one by one via `setTimeout` chain, pause when full, fade out, restart.

```tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export function MyAnimation() {
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cycle = useCallback(() => {
    let current = 0;
    setCount(0);
    const addNext = () => {
      current++;
      setCount(current);
      if (current < TOTAL) {
        timerRef.current = setTimeout(addNext, 350);
      } else {
        timerRef.current = setTimeout(() => {
          // Fade out, then restart
          timerRef.current = setTimeout(cycle, 400);
        }, 1800);
      }
    };
    timerRef.current = setTimeout(addNext, 500);
  }, []);

  useEffect(() => {
    cycle();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [cycle]);

  // render...
}
```

**Rules for animated visuals:**
- Always clean up timers in the effect return
- Use `useRef` for timer IDs, not state
- Use `useCallback` for the cycle function to prevent re-creating on every render
- Keep frame rate low (350ms+ between steps) — these are ambient, not attention-grabbing
- Add `aria-hidden="true"` to the container

## Color Palette for Visuals

Only use project tokens. Never introduce new colors.

### On Light Backgrounds (default cards)

| Purpose | Token |
|---------|-------|
| Visual container | `bg-surface-50 border-surface-100` |
| Skeleton bars | `bg-surface-100`, `bg-surface-200` |
| Skeleton text | `bg-surface-200 rounded-full` (use height + width utilities) |
| Accent fills | `bg-primary-100`, `bg-primary-200` |
| Active/brand strokes | `var(--color-primary-500)` or `var(--color-primary-600)` |
| Success indicators | `var(--color-success)` |
| Real text inside visuals | `text-surface-900` (headings), `text-surface-700` (labels) |
| Monospace labels | `text-2xs font-mono font-medium text-surface-400` |

### On Dark Backgrounds (full-width closer)

| Purpose | Token |
|---------|-------|
| Card backgrounds | `rgba(255,255,255,0.93)` or `bg-white/5` |
| Accent bars | `var(--color-primary-400)` through `var(--color-primary-600)` |
| Skeleton content | `var(--color-surface-200)`, `var(--color-surface-700)` |
| Title text | `text-white` |
| Body text | `text-surface-300` |

## Selective Realism Technique

The key to believable visuals is mixing real content with skeleton shapes.

| Element | Real | Skeleton |
|---------|------|----------|
| Field values | 1-2 actual strings (e.g., "How We Scaled Revenue 3x") | Grey bars (`h-2 w-3/4 bg-surface-200 rounded-full`) |
| Metrics | Actual number + label ("Conversions", "+147%") | Chart area is synthetic |
| Tags/badges | Real labels ("SaaS", "B2B", "Published") | Never skeleton these |
| Logos | Real via Brandfetch CDN or inline SVG | Never skeleton these |
| Body text | Never — always skeleton | `h-2 w-full`, `h-2 w-4/5`, `h-2 w-3/5` (diminishing widths) |

**The ratio:** ~30% real content, ~70% skeleton. Enough to sell it, not enough to overcommit.

## Motion Decision Tree

```
Does the concept involve change, movement, or growth?
  YES -> Animate it. The animation IS the visual metaphor.
         Extract to 'use client' component in src/components/ui/.
  NO  -> Keep it static. A well-composed SVG or wireframe is enough.
         Build inline in the page component.
```

Animations should be **ambient** (low frame rate, infinite loop) not **attention-grabbing** (fast, one-shot). They run in the background while the user reads the text below.

## SVG Best Practices

- Always use `viewBox` for responsive scaling — never fixed `width`/`height` on the SVG itself (use container sizing)
- Reference project CSS variables: `var(--color-primary-500)`, not hex values
- Use `<defs>` for gradients and filters — define once, reference with `url(#id)`
- Unique `id` attributes for gradient definitions (they're global in the DOM)
- `strokeLinecap="round"` and `strokeLinejoin="round"` on all strokes — prevents harsh joins
- Layer from back to front: grid lines -> fills -> strokes -> highlights -> labels

## Checklist

Before building:
- [ ] Read `COMPONENTS.md` — use `Card`, `SectionContainer`, `SectionHeader`
- [ ] Plan which visual type fits each concept (chart, gauge, wireframe, marquee, skeleton, animation)
- [ ] Decide grid layout pattern and column spans

For each card:
- [ ] Visual container is `h-40 rounded-xl bg-surface-50 border border-surface-100`
- [ ] Visual wrapped in `p-5` with `aria-hidden="true"`
- [ ] Text zone is `px-5 pb-5` with `h3` + `p`
- [ ] Only project color tokens used (no hex, no default Tailwind colors)
- [ ] At least 3 layers of detail in the visual
- [ ] 1-2 pieces of real content mixed with skeleton shapes
- [ ] SVG gradients have unique `id` attributes

For animated cards:
- [ ] Extracted to separate `'use client'` component in `src/components/ui/`
- [ ] Timer cleanup in `useEffect` return
- [ ] `useRef` for timer IDs
- [ ] Frame rate is ambient (350ms+ between steps)
- [ ] `aria-hidden="true"` on animation container
- [ ] Exported from `src/components/ui/index.ts` barrel
- [ ] Added to `COMPONENTS.md`

After building:
- [ ] Grid has visual rhythm (not all same width)
- [ ] Run `npm run build` to verify
- [ ] Update `COMPONENTS.md` if new components were created

## References

- **Working example:** `src/app/services/webflow/page.tsx` — Section 4 (Capabilities Bento Grid)
- **Animated components:** `src/components/ui/PixelBreakpointAnimation.tsx`, `src/components/ui/ScalableGridAnimation.tsx`
- **Component registry:** `COMPONENTS.md`
- **Design tokens:** `src/app/globals.css` (`@theme` block)
- **Styling rules:** `.claude/rules/styling.md`
- **Marquee keyframe:** `globals.css` line 416 (`@keyframes marquee`)
