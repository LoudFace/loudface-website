# Styling Tokens

Quick reference for design tokens. For component patterns (buttons, cards, etc.), see `component-patterns.md`.

## Colors

| Use | Not |
|-----|-----|
| `primary-*` | `indigo-*`, `blue-*`, `violet-*` |
| `surface-*` | `gray-*`, `neutral-*`, `zinc-*` |
| `success/warning/error/info` | `green-*`, `red-*`, `yellow-*` |

**Never use hardcoded hex values** - always use Tailwind tokens.

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

```astro
import SectionContainer from './SectionContainer.astro';

<SectionContainer>
  <!-- content -->
</SectionContainer>

<!-- With padding variant -->
<SectionContainer padding="lg">
  <!-- content -->
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

```astro
<section class="py-16 md:py-20 lg:py-24">
  <div class="px-4 md:px-8 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <!-- content -->
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

**Exception:** `transition-all` acceptable for multi-property animations (carousel nav).

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
