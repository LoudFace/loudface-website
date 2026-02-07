# Styling Tokens

Quick reference for design tokens. For component patterns (buttons, cards, etc.), see `component-patterns.md`.

## Colors

| Use | Not |
|-----|-----|
| `primary-*` | `indigo-*`, `blue-*`, `violet-*` |
| `surface-*` | `gray-*`, `neutral-*`, `zinc-*` |
| `success/warning/error/info` | `green-*`, `red-*`, `yellow-*` |

**Never use hardcoded hex values** - always use Tailwind tokens.

### Special: Wine Palette (About Page)

The `wine-*` tokens are a branded dark palette used for the About page counter/stats section:

| Token | Value | Use For |
|-------|-------|---------|
| `wine-950` | `#231421` | Section background |
| `wine-900` | `#382235` | Card/inner backgrounds |
| `wine-text` | `#c8e0f7` | Text on wine backgrounds |
| `wine-border` | `#cadbd9` | Borders on wine backgrounds |

Only use these for dark branded sections that need a different feel from the standard `surface-800/900` dark pattern.

## Text Color Hierarchy

Consistent text colors across the site. Pick from this table — don't freestyle.

### On Light Backgrounds (`bg-white`, `bg-surface-50`, `bg-surface-100`)

| Role | Class | Use For |
|------|-------|---------|
| **Heading** | `text-surface-900` | H1, H2, H3, card titles, primary labels |
| **Body** | `text-surface-600` | Paragraphs, descriptions, subtitles |
| **Muted** | `text-surface-500` | Captions, timestamps, helper text |
| **Subtle** | `text-surface-400` | Placeholder text, disabled states |
| **Interactive default** | `text-surface-700` | Ghost buttons, nav controls (pre-hover state only) |

### On Dark Backgrounds (`bg-surface-800`, `bg-surface-900`, `bg-surface-950`)

| Role | Class | Use For |
|------|-------|---------|
| **Heading** | `text-white` | H1, H2, H3, card titles, stat numbers |
| **Body** | `text-surface-300` | Paragraphs, descriptions, subtitles |
| **Muted** | `text-surface-500` | Captions, secondary info, highlight words |
| **Subtle** | `text-surface-400` | Placeholder text, disabled states |

**Don't use** `text-surface-700` or `text-surface-800` for body text or headings on light backgrounds — they're too close to `surface-900` and muddle the hierarchy. Exception: `text-surface-700` is used in interactive controls (ghost buttons, carousel arrows) as a default state that hovers to `surface-900`.

## Typography

| Element | Classes |
|---------|---------|
| **Section H2** | `text-2xl sm:text-3xl md:text-4xl font-medium` |
| **Hero H1** | `text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium` |
| Headings (general) | `font-heading font-medium` (Neue Montreal) |
| Body | `font-sans` (Satoshi) |
| Code | `font-mono` (Geist Mono) |
| Nav text | `text-nav font-sans font-medium` (15px) |
| Lead text | `text-lg text-surface-600` |
| Caption | `text-sm text-surface-500` |
| Small UI | `text-2xs` (13px) or `text-xs` (12px) |

### Standard Section H2 Pattern

All section headings use the same responsive scale:

```html
<h2 class="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
  Section Title
</h2>
```

For dark backgrounds, use `text-white` instead of `text-surface-900`.

## Section Layout (CRITICAL)

**Use the `SectionContainer` component** for all page sections. This ensures consistent padding and max-width.

```tsx
import { SectionContainer } from '@/components/ui';

<SectionContainer>
  {/* content */}
</SectionContainer>

{/* With padding variant */}
<SectionContainer padding="lg">
  {/* content */}
</SectionContainer>
```

### Padding Variants

| Variant | Classes | Use For |
|---------|---------|---------|
| `default` | `py-16 md:py-20 lg:py-24` | Standard sections |
| `sm` | `py-12 md:py-16` | Compact sections |
| `lg` | `py-16 md:py-24 lg:py-32` | Hero-adjacent, feature sections |
| `none` | (no padding) | Custom padding needs |

### Manual Section Pattern (if not using component)

```tsx
<section className="py-16 md:py-20 lg:py-24">
  <div className="px-4 md:px-8 lg:px-12">
    <div className="max-w-7xl mx-auto">
      {/* content */}
    </div>
  </div>
</section>
```

## Spacing (8px Grid)

| Use | Not |
|-----|-----|
| `p-2, p-4, p-6, p-8, p-12, p-16, p-20, p-24` | `p-[23px]`, `p-5`, `p-7` |
| `gap-2, gap-4, gap-6, gap-8` | `gap-[10px]` |

### Approved Half-Steps

These values are used in specific UI contexts:

| Value | Purpose |
|-------|---------|
| `py-2.5`, `px-2.5` | Button medium size, input padding |
| `gap-2.5` | Tight component spacing |
| `mt-2.5`, `mb-2.5` | Fine-tuned vertical rhythm |

## Section Inner Spacing

Spacing between elements *within* a section follows predictable patterns.

### SectionHeader to Content

The gap between `SectionHeader` and the first content block:

| Method | Classes | When to Use |
|--------|---------|-------------|
| Grid gap | `grid gap-8 xs:gap-16` | Section header and content are siblings in a grid |
| Margin | `mb-8 lg:mb-12` | Section header has a bottom margin before freeform content |

Pick one per section — don't mix both.

### Content Grid Gaps

| Context | Gap | Example |
|---------|-----|---------|
| Card grids | `gap-6` or `gap-8` | 2-3 column layouts of cards |
| Carousel slides | `gap-4` to `gap-6` | Horizontal scroll carousels |
| Tight UI elements | `gap-2` to `gap-3` | Tags, pills, inline groups |
| Stacked text blocks | `gap-4` | Title + description pairs |

### Vertical Rhythm Between Elements

| Between | Spacing |
|---------|---------|
| Section heading → subheading | `mt-4` (built into SectionHeader) |
| Heading → paragraph | `mt-4` |
| Paragraph → paragraph | `mb-6` (via prose styles) |
| Content block → CTA button | `mt-8` to `mt-12` |

## Button Shapes

| Shape | Use For |
|-------|---------|
| `rounded-lg` | Standard buttons (Button component default) |
| `rounded-full` | Pill CTAs (header nav, tab pills, special emphasis) |

**Rule:** Use the `Button` component for standard buttons. Use inline `rounded-full` only for pill-style CTAs in header/nav.

## Transitions

| Use | Not |
|-----|-----|
| `transition-colors` | `transition-all` |
| `transition-opacity` | `transition` (unspecified) |
| `transition-transform` | `transition-[color,background]` |
| `duration-200` | `duration-[150ms]` |

**Exception:** `transition-all` acceptable for multi-property animations (carousel nav, clickable cards with border + shadow + transform).

## Motion & Animation

| Effect | Classes | Use For |
|--------|---------|---------|
| Image zoom on hover | `group-hover:scale-105 duration-500` | Card thumbnails (via `group` on parent) |
| Card lift on hover | `hover:-translate-y-1 duration-200` | Clickable card links only |
| Button press | `active:scale-[0.98]` | Button component (built-in) |
| Fade in | `animate-fade-in` (defined in @theme) | Page-level entrance |

**Rules:**
- Stick to `transform` and `opacity` for animations — they don't trigger layout reflow
- Always respect `prefers-reduced-motion` for entrance animations: `motion-safe:animate-fade-in`
- No scroll-triggered animations, parallax, or autoplay motion unless explicitly requested
- Carousel autoplay is opt-in via `useCarousel({ autoplay: true })`, never default

## Shadows

| Token | Purpose |
|-------|---------|
| `shadow-sm` | Subtle cards, inputs |
| `shadow` | Default cards |
| `shadow-md` | Card hover state |
| `shadow-lg` | Modals, dropdowns |
| `shadow-xl` | Popovers, tooltips |

## Border Radius

| Token | Purpose |
|-------|---------|
| `rounded-lg` | Inputs, buttons, small cards |
| `rounded-xl` | Medium cards |
| `rounded-2xl` | Large cards, sections |
| `rounded-full` | Pill buttons, avatars |

## Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| `xs:` | 475px |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

## DON'T

- Hex values (`#171717`) → use `surface-900`
- Arbitrary values (`p-[23px]`) → use grid values
- Raw colors (`gray-500`) → use `surface-500`
- `focus:` → use `focus-visible:`
- Inline section containers → use `SectionContainer` component

## Approved Arbitrary Values

- `h-[calc(100dvh-61px)]` - mobile menu height
- `white/[0.08]` - glass card hover
- `scale-[0.98]` - button active state

## Reference

- `/design-system` page for visual examples
- `component-patterns.md` for implementation patterns
