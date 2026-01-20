# Styling Tokens & Patterns

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
| Headings | `font-heading font-medium` (Neue Montreal) |
| Body | `font-sans` (Satoshi) |
| Code | `font-mono` (Geist Mono) |
| Nav text | `text-nav font-sans font-medium` (15px) |
| Lead text | `text-lg text-surface-600` |
| Caption | `text-sm text-surface-500` |
| Small UI | `text-2xs` (13px) or `text-xs` (12px) |

## Spacing (8px Grid)

| Use | Not |
|-----|-----|
| `p-2, p-4, p-6, p-8, p-12, p-16, p-20, p-24` | `p-[23px]`, `p-5`, `p-7` |
| `gap-2, gap-4, gap-6, gap-8` | `gap-[10px]` |

## Transitions

| Use | Not |
|-----|-----|
| `transition-colors` | `transition-all` |
| `transition-opacity` | `transition` (unspecified) |
| `transition-transform` | `transition-[color,background]` |
| `duration-200` | `duration-[150ms]` |

Combine: `transition-colors duration-200`

**Exception:** `transition-all` is acceptable for elements with multiple animated properties (e.g., carousel nav buttons with scale + background).

## Shadows

| Use | Purpose |
|-----|---------|
| `shadow-sm` | Subtle cards, inputs |
| `shadow` | Default cards |
| `shadow-md` | Card hover state |
| `shadow-lg` | Elevated modals, dropdowns |
| `shadow-xl` | Popovers, tooltips |

## Border Radius

| Use | Purpose |
|-----|---------|
| `rounded-lg` | Inputs, buttons, small cards, nav links |
| `rounded-xl` | Medium cards, case study cards |
| `rounded-2xl` | Large cards, sections |
| `rounded-full` | Pill buttons (header CTA), avatars, icon buttons |

---

## Component Patterns

### Buttons

**Standard button (Button.astro):**
```
Primary:   px-6 py-3 bg-surface-900 hover:bg-surface-800 text-white font-medium rounded-lg transition-colors
Secondary: px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors
Ghost:     px-6 py-3 bg-transparent hover:bg-surface-100 text-surface-700 font-medium rounded-lg transition-colors
Outline:   px-6 py-3 border border-surface-200 bg-transparent hover:bg-surface-100 text-surface-900 font-medium rounded-lg transition-colors
```

**Pill button (header CTA only):**
```
px-5 py-2 bg-surface-900 hover:bg-surface-800 text-white text-sm font-medium rounded-full transition-colors
```

### Cards

**Light card (standard):**
```
bg-white rounded-xl border border-surface-200 p-6
hover:border-surface-300 hover:shadow-md transition-all duration-200
```

**Dark card:**
```
bg-surface-900 rounded-xl p-6
```

**Glass card (dark backgrounds only):**
```
bg-white/5 hover:bg-white/[0.08] rounded-xl p-6 transition-colors
```

### Card Links

```
<a class="block transition-opacity duration-200 hover:opacity-75
  focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4 rounded-lg">
```

### Inputs

```
w-full px-4 py-3 border border-surface-300 rounded-lg
focus:ring-2 focus:ring-primary-500 focus:border-primary-500
outline-none transition-shadow bg-white text-surface-900
```

### Focus States

**Always use `focus-visible` (not `focus`):**
```
focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2
```

### Section Containers

```astro
<section class="py-16 md:py-20 lg:py-24">
  <div class="px-4 md:px-8 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <!-- content -->
    </div>
  </div>
</section>
```

### Carousel Nav Buttons

```
<button class="flex items-center justify-center w-12 h-12 rounded-full
  bg-surface-100 text-surface-700 transition-all duration-200
  hover:bg-surface-200 hover:scale-105 active:scale-95
  focus-visible:outline-2 focus-visible:outline-primary-500">
```

Dark variant: `bg-surface-700 text-white hover:bg-surface-600`

### Links

**Navigation links:**
```
text-nav font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors
```

**Footer links (dark background):**
```
text-sm text-surface-400 hover:text-white transition-colors
```

**Prose links (rich text):**
```
text-primary-600 underline hover:text-primary-700
```

---

## Responsive Breakpoints

| Breakpoint | Width | Use For |
|------------|-------|---------|
| `xs:` | 475px | Small phones → phones |
| `sm:` | 640px | Phone → large phone |
| `md:` | 768px | Phone → tablet |
| `lg:` | 1024px | Tablet → desktop |
| `xl:` | 1280px | Desktop → wide |
| `2xl:` | 1536px | Wide → ultra-wide |

**Pattern:** Mobile-first, add breakpoints for larger screens.

---

## DON'T

- Hex values (`#171717`) - use `surface-900`
- Arbitrary values (`p-[23px]`) - use grid values
- Raw Tailwind colors (`gray-500`) - use `surface-500`
- `transition-all` without good reason - specify properties
- `shadow-[custom]` - use scale values
- `focus:` for keyboard focus - use `focus-visible:`

## Acceptable Arbitrary Values

These specific arbitrary values are approved:
- `h-[calc(100dvh-61px)]` - mobile menu height
- `white/[0.08]` - glass card hover (dark themes only)
- `scale-[0.98]` - button active state

## Reference

See `/design-system` page for visual examples.
