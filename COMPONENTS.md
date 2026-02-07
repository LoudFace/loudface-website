# Component Registry

Quick-reference for every reusable component. **Check here before writing any markup** — if a component exists, use it. If you add or change a component, update this file.

Import all UI primitives from the barrel:
```tsx
import { AICitationVisual, Badge, BulletLabel, Button, Card, CarouselNav, ComponentAssemblyVisual, CopyFirstVisual, ConversionSplitVisual, DesignSystemVisual, PixelBreakpointAnimation, ScalableGridAnimation, SectionContainer, SectionHeader } from '@/components/ui';
```

---

## UI Primitives (`src/components/ui/`)

### AICitationVisual

Animated browser frame mimicking an AI engine response where the brand is highlighted as a cited source. Cycles through Perplexity, ChatGPT, and Google AI. Shows a question, skeleton response lines with a real brand citation, and source pills. Floating badges show "Cited" checkmark and citation count on completion. Client component (no props).

```tsx
<AICitationVisual />
```

### Badge

Pill-shaped label for categories, tags, and eyebrow text.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Label text |
| `variant` | `'subtle' \| 'outline'` | `'subtle'` | `subtle` = filled bg + border, `outline` = border only |
| `size` | `'sm' \| 'md'` | `'sm'` | `sm` = compact (px-3 py-1), `md` = standard (px-4 py-2) |
| `icon` | `ReactNode` | — | Optional leading icon |
| `className` | `string` | `''` | Additional classes |

```tsx
<Badge variant="outline">Uncategorized</Badge>
<Badge size="md" icon={<img src={asset('/images/icon.svg')} alt="" className="w-6 h-6" />}>
  Webflow Enterprise Partner
</Badge>
```

### BulletLabel

Dot-prefixed label used as section eyebrows or small headings.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Label text |
| `as` | `'span' \| 'h2' \| 'h3'` | `'span'` | HTML element for the text |
| `variant` | `'light' \| 'dark'` | `'light'` | Text color scheme |
| `className` | `string` | `''` | Additional classes |

```tsx
<BulletLabel>Our Journey</BulletLabel>
<BulletLabel as="h2" variant="dark">Performance Metrics</BulletLabel>
```

### Button

Multi-variant button that renders as `<button>`, `<Link>`, or `<a>` depending on props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Button text |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding/text size |
| `href` | `string` | — | Makes it a link (internal = `<Link>`, external = `<a>`) |
| `calTrigger` | `boolean` | — | Marks as Cal.com booking trigger |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type (ignored when `href` is set) |
| `onClick` | `() => void` | — | Click handler (ignored when `href` is set) |
| `fullWidth` | `boolean` | `false` | Stretches to fill container |
| `disabled` | `boolean` | `false` | Disables interaction |
| `ariaLabel` | `string` | — | Accessible label for icon-only buttons |
| `className` | `string` | `''` | Additional classes |

```tsx
<Button variant="primary" size="lg" calTrigger>Book an intro call</Button>
<Button variant="outline" href="/work">View case studies</Button>
```

### Card

Consistent card surface for content containers. Use instead of writing raw card markup.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Card content |
| `variant` | `'default' \| 'dark' \| 'glass'` | `'default'` | `default` = white + border, `dark` = solid dark, `glass` = frosted (dark sections) |
| `padding` | `'sm' \| 'md' \| 'lg' \| 'none'` | `'md'` | Inner padding (`sm` = p-4, `md` = p-6, `lg` = p-8) |
| `hover` | `boolean` | `true` | Enable hover interaction styles |
| `className` | `string` | `''` | Additional classes |

```tsx
<Card>Content on light bg</Card>
<Card variant="dark">Content in dark container</Card>
<Card variant="glass">Content inside dark section</Card>
<Card padding="lg" hover={false}>Static large card</Card>
```

### CarouselNav

Prev/next arrow buttons for Embla carousels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'light' \| 'dark'` | required | Color scheme matching background |
| `onPrevClick` | `() => void` | required | Previous slide callback |
| `onNextClick` | `() => void` | required | Next slide callback |
| `className` | `string` | — | Additional classes |

```tsx
<CarouselNav variant="light" onPrevClick={scrollPrev} onNextClick={scrollNext} />
```

### CopyFirstVisual

Animated browser frame where copy appears first (headline, value prop, CTA, proof), then page wireframe structure crystallizes around the text. Demonstrates the Copy → Design → Dev workflow. Cycles through three scenarios: Homepage, Pricing, Product. Annotation pills (H1, Value prop, CTA, Proof) connected by dashed lines are the signature differentiator. Floating badges show "Copy-led" checkmark and "288% best result" on completion. Client component (no props).

```tsx
<CopyFirstVisual />
```

### DesignSystemVisual

Animated browser frame where design tokens (color, type, spacing, radius) appear first, then component blocks materialize with dashed connection lines, then a full page wireframe composes from those components. Token sidebar annotations in the right margin are the signature differentiator. Cycles through three scenarios: Tokens, Components, Live. Floating badges show "42 components" and "100% Consistency" on completion. Client component (no props).

```tsx
<DesignSystemVisual />
```

### ConversionSplitVisual

Animated browser frame showing an A/B split test playing out in real time. Two page variants appear side by side, metrics count up, a winner is declared, then the cycle resets with a new test scenario. Cycles through three pages: landing, pricing, and signup. Floating badges show conversion lift and tests-won count on completion. Client component (no props).

```tsx
<ConversionSplitVisual />
```

### ComponentAssemblyVisual

Animated browser frame where website sections (nav, hero, cards, CTA) slide in one by one, demonstrating component-first architecture. On completion, the browser frame glows with a primary-colored border. Status text toggles between "Assembling components..." and "Ready to launch." Client component (no props).

```tsx
<ComponentAssemblyVisual />
```

### PixelBreakpointAnimation

Animated pixel grid that morphs between mobile / tablet / desktop layout representations. Chunky retro pixels dissolve and reform in a wave pattern. Client component (no props).

```tsx
<PixelBreakpointAnimation />
```

### ScalableGridAnimation

Animated 4x2 grid of mini-page wireframes that progressively fills in (2 → 4 → 8 tiles) with spring pop-in animation. Each tile has distinct wireframe content (accent bars, nav dots, headers, image blocks, text lines). Includes a page counter. Designed for dark backgrounds. Client component (no props).

```tsx
<ScalableGridAnimation />
```

### SectionContainer

Wrapper providing consistent padding, max-width, and horizontal gutters for page sections.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Section content |
| `padding` | `'none' \| 'sm' \| 'default' \| 'lg'` | `'default'` | Vertical padding scale |
| `as` | `'section' \| 'div' \| 'article' \| 'aside' \| 'footer'` | `'section'` | HTML tag |
| `className` | `string` | `''` | Outer element classes |
| `innerClassName` | `string` | `''` | Inner max-width container classes |
| `id` | `string` | — | Anchor link target |

```tsx
<SectionContainer padding="lg" className="bg-surface-50">
  {/* content */}
</SectionContainer>
```

### SectionHeader

Standardized section heading with optional eyebrow label, highlighted word, and subtitle.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Heading text |
| `highlightWord` | `string` | — | Word to style differently (primary color) |
| `subtitle` | `string` | — | Description below heading (supports HTML) |
| `eyebrow` | `string` | — | BulletLabel rendered above the heading |
| `variant` | `'light' \| 'dark'` | `'light'` | Color scheme |
| `align` | `'left' \| 'center'` | `'left'` | Text alignment |
| `as` | `'h1' \| 'h2' \| 'h3'` | `'h2'` | Heading level |
| `className` | `string` | `''` | Container classes |

```tsx
<SectionHeader
  eyebrow="Our Team"
  title="Meet the Creators"
  highlightWord="Creators"
  subtitle="The team behind your next successful project."
/>
```

---

## Section Components (`src/components/sections/`)

All section components are exported from `@/components/sections` (or `@/components` top-level barrel).

| Component | File | Description | Client? |
|-----------|------|-------------|---------|
| `Hero` | `Hero.tsx` | Homepage hero with scrolling case study cards | No |
| `Partners` | `Partners.tsx` | Client logos marquee + testimonials | Yes |
| `CaseStudySlider` | `CaseStudySlider.tsx` | Embla carousel of case study cards | Yes |
| `Audit` | `Audit.tsx` | Website audit CTA section | No |
| `Results` | `Results.tsx` | Bento grid of results/metrics | No |
| `Marketing` | `Marketing.tsx` | Marketing services feature section | No |
| `Approach` | `Approach.tsx` | Process steps carousel + stats | Yes |
| `Knowledge` | `Knowledge.tsx` | Blog post carousel | Yes |
| `FAQ` | `FAQ.tsx` | Accordion FAQ section | No |
| `CTA` | `CTA.tsx` | Final call-to-action section | No |

**"Client?"** = requires `'use client'` directive (has hooks/interactivity).

---

## Layout Components (`src/components/`)

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `Header.tsx` | Site navigation with dropdowns (client component) |
| `Footer` | `Footer.tsx` | Site footer with nav, newsletter, socials |
| `CalHandler` | `CalHandler.tsx` | Cal.com booking modal integration |
| `NewsletterForm` | `NewsletterForm.tsx` | Email signup form |

---

## Barrel Exports

```
src/components/index.ts        → re-exports everything
src/components/ui/index.ts     → AICitationVisual, Badge, BulletLabel, Button, Card, CarouselNav, ComponentAssemblyVisual, CopyFirstVisual, ConversionSplitVisual, PixelBreakpointAnimation, ScalableGridAnimation, SectionContainer, SectionHeader
src/components/sections/index.ts → Hero, Partners, CaseStudySlider, Audit, Results, Marketing, Approach, Knowledge, FAQ, CTA
```

---

## Rules for AI Agents

1. **Always check this file first** before creating any UI markup
2. **Use existing components** — never rebuild a pattern that already exists here
3. **Update this file** when you add, remove, or change any component's props
4. **Import from barrels** — use `@/components/ui` or `@/components`, not individual file paths
5. **Server by default** — only add `'use client'` when hooks or event handlers are needed
6. **Use `asset()`** for all static image paths (see `@/lib/assets`)
7. **Use `<Link>`** for all internal navigation (handles basePath)
8. **Use `Card`** for all card surfaces — never write raw card markup with `bg-white rounded-xl border...`
9. **Follow the page archetype** in `component-patterns.md` when creating new pages
10. **Follow the text color hierarchy** in `styling.md` — don't freestyle text colors
