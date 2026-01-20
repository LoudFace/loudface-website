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

## Approved Arbitrary Values

- `h-[calc(100dvh-61px)]` - mobile menu height
- `white/[0.08]` - glass card hover
- `scale-[0.98]` - button active state

## Reference

- `/design-system` page for visual examples
- `component-patterns.md` for implementation patterns
