# Design System — LoudFace

## 1. Visual Theme & Atmosphere

LoudFace is a B2B creative agency that builds websites for SaaS companies. The design language walks a line between editorial restraint and confident agency energy — clean enough to let client work breathe, distinctive enough to signal craft. The palette is anchored in deep neutrals (`surface-900` through `surface-50`) with an indigo-violet primary accent (`primary-500: #6366f1`) that shows up in highlights, links, and interactive states but never dominates.

Typography is the personality. Headings use **Neue Montreal** — a geometric grotesk with sharp terminals that reads as modern and intentional without the "tech startup default" feel of Inter or Roboto. Body text uses **Satoshi** — a humanist sans with slightly wider apertures that stays comfortable at long reading lengths. **Geist Mono** appears in stats, technical labels, and code contexts. All three are self-hosted via `next/font/local` with `display: swap` for zero FOUT.

The spatial system is generous. Sections breathe with `py-16 md:py-20 lg:py-24` at standard density, expanding to `py-16 md:py-24 lg:py-32` for hero-adjacent areas. Horizontal gutters step from `px-4` on mobile through `px-8` at medium to `px-12` on desktop, all constrained inside a `max-w-7xl` container. Cards use `rounded-xl` with `border-surface-200` on light backgrounds and frosted glass (`bg-white/5`) on dark. The overall rhythm feels like a well-paced magazine layout — content-dense but never cramped.

Dark sections (`bg-surface-800` or `bg-surface-900`) break up the page and give visual contrast. These use `text-surface-300` as default body color, `text-white` for headings, and glass-variant cards. The About page has a branded "wine" palette (`wine-950: #231421`) for its stats section — a deep burgundy-black that reads as premium and distinct from the standard dark treatment.

**Key Characteristics:**
- Neue Montreal headings with `font-weight: 500` — medium weight creates hierarchy through size, not boldness
- Satoshi body text — humanist warmth without sacrificing geometric clarity
- Indigo-violet primary (`#6366f1`) used sparingly — highlights, links, focus rings, secondary buttons
- Deep neutral surface scale from `#0a0a0a` (950) through `#fafafa` (50) — not true black, not true white
- Glass-morphism cards (`bg-white/5`) inside dark sections — frosted, not floating
- `rounded-xl` cards, `rounded-lg` buttons, `rounded-full` pills and avatars
- Section padding scales responsively — never static
- No default Tailwind color palettes — all disabled, forcing project tokens only
- Accessible focus rings: `2px solid primary-500` with `2px offset` on all interactive elements

## 2. Color Palette & Roles

### Primary (Indigo-Violet)
- **primary-50** (`#eef2ff`): Hover tint on AI icon buttons, subtle badge background
- **primary-100** (`#e0e7ff`): Light interactive hover state
- **primary-200** (`#c7d2fe`): Decorative borders on hover
- **primary-300** (`#a5b4fc`): Icon hover borders
- **primary-400** (`#818cf8`): Medium accent
- **primary-500** (`#6366f1`): Focus rings, SectionHeader highlight text, list bullets, link underlines
- **primary-600** (`#4f46e5`): Secondary button fill, link color, inline code color
- **primary-700** (`#4338ca`): Link hover state
- **primary-800** (`#3730a3`): Deep accent
- **primary-900** (`#312e81`): Darkest accent
- **primary-950** (`#1e1b4b`): Near-black accent

### Surface (Neutral Scale)
- **surface-50** (`#fafafa`): Page background, subtle section tint, blockquote background
- **surface-100** (`#f5f5f5`): Badge `subtle` variant background, inline code background
- **surface-200** (`#e5e5e5`): Card borders (light), dividers, input borders, outline button border
- **surface-300** (`#d4d4d4`): Body text on dark backgrounds, blockquote left-border
- **surface-400** (`#a3a3a3`): BulletLabel dots, h3 dot-markers, placeholder text
- **surface-500** (`#737373`): Muted/caption text, SectionHeader highlight on dark backgrounds
- **surface-600** (`#525252`): Standard body text on light backgrounds, nav links default
- **surface-700** (`#404040`): Ghost button text, carousel button background (dark variant)
- **surface-800** (`#262626`): Dark section backgrounds, card dark variant hover state
- **surface-900** (`#22302e`): Primary button fill, heading text on light backgrounds, dark section backgrounds — note: has a subtle green-teal undertone
- **surface-950** (`#0a0a0a`): Deepest text, body default color

### Semantic
- **success** (`#22c55e`): Positive indicators, success states
- **success-light** (`#dcfce7`): Success badge backgrounds
- **success-dark** (`#166534`): Success text on light backgrounds
- **warning** (`#f59e0b`): Caution indicators
- **warning-light** (`#fef3c7`): Warning badge backgrounds
- **warning-dark** (`#92400e`): Warning text
- **error** (`#ef4444`): Error states, destructive actions
- **error-light** (`#fee2e2`): Error badge backgrounds
- **error-dark** (`#991b1b`): Error text
- **info** (`#3b82f6`): Informational states
- **info-light** (`#dbeafe`): Info badge backgrounds
- **info-dark** (`#1e40af`): Info text

### Wine Palette (About Page — Branded Dark)
- **wine-950** (`#231421`): Section background — deep burgundy-black
- **wine-900** (`#382235`): Inner card/container backgrounds
- **wine-text** (`#c8e0f7`): Text on wine backgrounds — cool blue-white
- **wine-border** (`#cadbd9`): Borders on wine backgrounds — muted sage

### Interactive & Focus
- **Focus ring**: `outline: 2px solid primary-500` with `outline-offset: 2px`
- **Link default**: `primary-600` (`#4f46e5`)
- **Link hover**: `primary-700` (`#4338ca`)

### Shadows & Depth
- **Card hover (light)**: `shadow-md` — standard Tailwind medium shadow
- **Dropdown/popover**: `shadow-xl ring-1 ring-black/5`
- **Header blur**: `bg-white/95 backdrop-blur-md border-b border-surface-100/80`
- No multi-layer shadow stacking — clean single-shadow model

## 3. Typography Rules

### Font Families
- **Headings**: Neue Montreal (`--font-heading`) — geometric grotesk, loaded at 400/500/700
- **Body**: Satoshi (`--font-sans`) — humanist sans, loaded at 400/500/700
- **Mono**: Geist Mono (`--font-mono`) — loaded at 400/500, not preloaded (rare use)
- **Antialiasing**: `-webkit-font-smoothing: antialiased` globally

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Hero H1 | Neue Montreal | 2.25rem (text-hero) at lg, responsive down to text-2xl | 500 | 1.15 | -0.02em | `text-2xl sm:text-3xl md:text-4xl lg:text-hero` |
| Section H2 | Neue Montreal | text-2xl → sm:text-3xl → md:text-4xl | 500 | tight | normal | SectionHeader default |
| Card Title / H3 | Neue Montreal | text-lg | 500 | 1.5 | normal | Inside cards and subsections |
| Body Large | Satoshi | text-lg (1.125rem) | 400 | 1.75 | normal | Lead paragraphs, prose content |
| Body | Satoshi | text-base (1rem) | 400 | 1.5 | normal | Standard paragraphs |
| Body Small | Satoshi | text-sm (0.875rem) | 400 | 1.5 | normal | Descriptions, hero subtext |
| Nav Link | Satoshi | text-nav (0.9375rem / 15px) | 500 | 1.5 | normal | Header navigation |
| Caption / Muted | Satoshi | text-sm | 400 | 1.5 | normal | Timestamps, metadata |
| Micro UI | Satoshi | text-2xs (0.8125rem / 13px) | 400-500 | 1.5 | normal | Small labels |
| Stat Number | Geist Mono | text-3xl md:text-4xl | 500 | tight | normal | Metrics, counters |
| Code | Geist Mono | 0.875em | 400 | 1.5 | normal | Inline code snippets |

### Principles
- **Medium weight headings**: All headings use `font-weight: 500` — hierarchy comes from size changes, not weight jumps. This creates a calm, editorial feel rather than the "bold heading / thin body" contrast of most SaaS sites.
- **Two-font personality split**: Neue Montreal is the "agency voice" (confident, geometric, modern). Satoshi is the "reader voice" (warm, open, comfortable). The pairing works because both share geometric DNA but diverge in personality.
- **Mono for data**: Geist Mono only appears in stat counters, code blocks, and technical labels. Never for body text or navigation.
- **No weight 700 in headings**: Despite loading bold weights, headings stay at 500. Bold (700) only appears in strong/emphasis contexts within prose.

## 4. Component Stylings

### Buttons

**Primary (Dark Fill)**
- Background: `bg-surface-900`
- Text: `text-white`
- Hover: `hover:bg-surface-800`
- Radius: `rounded-lg` (standard), `rounded-full` (CTA contexts like header, CTA section)
- Sizes: `sm` (px-4 py-2 text-sm), `md` (px-5 py-2.5 text-sm), `lg` (px-6 py-3 text-base)
- Active: `active:scale-[0.98]`
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500`
- Disabled: `opacity-50 cursor-not-allowed`
- Use: Primary CTAs, form submits

**Secondary (Brand Fill)**
- Background: `bg-primary-600`
- Text: `text-white`
- Hover: `hover:bg-primary-700`
- Same sizing and radius as primary
- Use: Secondary emphasis, alternative CTAs

**Ghost (Transparent)**
- Background: `bg-transparent`
- Text: `text-surface-700`
- Hover: `hover:bg-surface-100 hover:text-surface-900`
- Use: Tertiary actions, toolbar buttons

**Outline (Border Only)**
- Background: `bg-transparent`
- Border: `border border-surface-200`
- Text: `text-surface-900`
- Hover: `hover:bg-surface-50`
- Use: Secondary actions, paired with primary buttons

### Cards & Containers

**Default (Light)**
- Background: `bg-white`
- Border: `border border-surface-200`
- Radius: `rounded-xl`
- Hover: `hover:border-surface-300 hover:shadow-md`
- Transition: `transition-all duration-200`
- Use: Light background contexts

**Dark**
- Background: `bg-surface-900`
- No border
- Hover: `hover:bg-surface-800`
- Use: Standalone dark containers, stats panels

**Glass (Frosted)**
- Background: `bg-white/5`
- No border
- Hover: `hover:bg-white/[0.08]`
- Use: Inside dark sections — the signature LoudFace dark-section card style

**Padding scale:** `sm` (p-4), `md` (p-6, default), `lg` (p-8), `none`

### Badges & Pills

**Subtle Variant**
- Background: `bg-surface-100`
- Border: `border border-surface-200`
- Text: `text-surface-900`
- Radius: `rounded-full`
- Sizes: `sm` (px-3 py-1 text-sm), `md` (px-4 py-2 text-sm)
- Use: Categories, tags, eyebrow labels

**Outline Variant**
- Background: transparent
- Border: `border border-surface-200`
- Same text and radius
- Use: Lighter emphasis, secondary tags

### Navigation

**Header**
- Sticky: `sticky top-0 z-50`
- Background: `bg-white/95 backdrop-blur-md`
- Bottom border: `border-b border-surface-100/80`
- Padding: `py-3.5 px-4 md:px-8 lg:px-12`
- Nav links: `text-nav font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 rounded-lg px-3 py-2`
- Desktop CTA: `px-5 py-2 bg-surface-900 text-white rounded-full hover:bg-surface-800`
- Mobile: full-screen overlay from `top-[61px]` with `h-[calc(100dvh-61px)]`
- Dropdown: `rounded-2xl shadow-xl ring-1 ring-black/5`

### Section Layout

**SectionContainer** wraps all page sections:
- Outer: semantic HTML element (section/div/article) with vertical padding
- Middle: `px-4 md:px-8 lg:px-12` (horizontal gutters)
- Inner: `max-w-7xl mx-auto` (content constraint)
- Padding variants: `sm` (py-12 md:py-16), `default` (py-16 md:py-20 lg:py-24), `lg` (py-16 md:py-24 lg:py-32), `none`

**SectionHeader** standardizes all section headings:
- Typography: `text-2xl sm:text-3xl md:text-4xl font-medium`
- Light mode: `text-surface-900` with `text-primary-600` highlight word
- Dark mode: `text-white` with `text-surface-500` highlight word
- Subtitle: `mt-4 text-lg` in `text-surface-600` (light) or `text-surface-400` (dark)

### BulletLabel (Eyebrow)
- Layout: `flex items-center gap-3`
- Dot: `w-2 h-2 bg-surface-400 rounded-full`
- Text: `text-lg font-medium` in `text-surface-900` (light) or `text-surface-300` (dark)
- Use: Section eyebrows, category markers

### Carousel Navigation
- Button: `w-12 h-12 rounded-full`
- Light variant: `bg-surface-100 text-surface-700 hover:bg-surface-200 hover:text-surface-900`
- Dark variant: `bg-surface-700 text-white hover:bg-surface-600`
- Animation: `hover:scale-105 active:scale-95 transition-all duration-200`
- Chevron icon: 20px Lucide icons

### Image Treatment
- Card thumbnails: `object-cover` with `group-hover:scale-105 duration-500` zoom
- Hero carousel: vertical auto-scrolling columns with `animate-scroll-down` / `animate-scroll-up`
- Client logos: grayscale via Sanity CDN transforms, contained within hover-interactive containers
- CMS images: optimized via `image-utils.ts` helpers (`thumbnailImage`, `heroImage`, `avatarImage`)
- Fallback: `asset('/images/placeholder.webp')` via the asset utility

### Distinctive Components

**Hero Section**
- Two-column grid: `grid-cols-1 lg:grid-cols-2`
- Container: `border border-surface-200 bg-surface-50 rounded-2xl`
- Left: headline + description + CTAs + AI platform icons
- Right: auto-scrolling case study image carousel (two columns, opposite directions)
- Min-height: `lg:min-h-144 xl:min-h-160`

**CTA Section**
- Every page ends with this component
- Two variants: light (`bg-surface-50`) and dark (`bg-surface-900`)
- Extra generous padding: `py-24 md:py-32 lg:py-40`
- Title: `text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight`
- Single CTA button: `variant="primary" size="lg"` with `rounded-full px-8 py-4`

**Partners/Client Logos**
- Horizontal marquee with `animate-marquee` (30s linear infinite)
- Testimonial tooltips on hover: `280px` popover with `shadow 0 10px 40px rgba(0,0,0,0.15)`
- Hidden on mobile (`max-width: 767px`)

**Case Study Prose**
- Custom prose styling with h2 left-accent borders (gradient), h3 dot markers, animated link underlines
- Ordered list: monospace counters in `primary-500`
- Blockquotes: card-style with `bg-surface-50 rounded-xl border-left: 4px solid surface-300`

## 5. Layout Principles

### Spacing System
- Base unit: **4px** (Tailwind default)
- Primary scale: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40
- Approved half-steps: `py-2.5`, `px-2.5`, `gap-2.5` for fine-tuned button/input padding
- No arbitrary values except: `h-[calc(100dvh-61px)]` (mobile menu), `white/[0.08]` (glass hover), `scale-[0.98]` (button press)

### Grid & Container
- Max content width: `max-w-7xl` (80rem / 1280px)
- Horizontal gutters: `px-4 md:px-8 lg:px-12`
- Card grids: typically `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6` or `gap-8`
- Two-track layout: `grid-cols-1 lg:grid-cols-2` for hero and feature splits
- Stats grids: `grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8`

### Whitespace Philosophy
- **Breathing room over density**: Sections use generous vertical padding (py-16 minimum) that scales up at larger breakpoints. The site reads as editorial — content floats in space rather than stacking tightly.
- **Light-dark alternation**: The page rhythm alternates between light (`bg-white`/`bg-surface-50`) and dark (`bg-surface-800`/`bg-surface-900`) sections. This creates clear visual chapters without relying on borders or dividers.
- **Inner spacing scales with context**: Card grids use `gap-6`–`gap-8`. Tight UI (tags, pills) uses `gap-2`–`gap-3`. SectionHeader to content gap is `mt-8 lg:mt-12`.

### Border Radius Scale
| Token | Size | Use |
|-------|------|-----|
| `rounded-lg` | 0.5rem | Buttons, inputs, small cards, nav link hover states |
| `rounded-xl` | 0.75rem | Standard cards, images, blockquotes |
| `rounded-2xl` | 1rem | Hero container, large cards, dropdown menus |
| `rounded-full` | 9999px | Badges, pills, avatars, CTA buttons, carousel nav |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, text blocks, sections |
| Border (Level 1) | `border border-surface-200` | Cards (light), inputs, dividers |
| Subtle Border (Level 1b) | `border border-surface-100/80` | Header bottom border (through backdrop blur) |
| Hover Lift (Level 2) | `shadow-md` + `border-surface-300` | Card hover states |
| Dropdown (Level 3) | `shadow-xl ring-1 ring-black/5` | Popovers, dropdown menus |
| Tooltip (Level 4) | `shadow 0 10px 40px rgba(0,0,0,0.15)` | Testimonial hover tooltips |
| Frosted Glass | `bg-white/95 backdrop-blur-md` | Sticky header |

**Shadow Philosophy**: LoudFace uses borders as the primary depth cue, not shadows. Cards on light backgrounds use `border-surface-200` at rest and add `shadow-md` on hover — the elevation is earned through interaction, not default. On dark backgrounds, depth comes from opacity layers (`bg-white/5` → `bg-white/[0.08]`) rather than shadows. The only persistent shadow is the header's `backdrop-blur-md`, which creates a frosted glass effect that separates navigation from content without a hard edge.

## 7. Do's and Don'ts

### Do
- Use `SectionContainer` for every page section — never raw `<section>` tags with manual padding
- Use `SectionHeader` for all section H2s — it handles responsive sizing, highlight splitting, and dark/light variants
- Use `Card` component for all card surfaces — it enforces consistent radius, padding, and hover behavior
- Import all UI primitives from `@/components/ui` barrel — never direct file paths
- Use `asset()` from `@/lib/assets` for all hardcoded image paths
- Use `Link` from `next/link` for all internal navigation
- Use `focus-visible:` (not `focus:`) for keyboard focus states
- Use the text color hierarchy: `surface-900` for headings, `surface-600` for body, `surface-500` for muted, `surface-400` for subtle
- On dark backgrounds: `text-white` for headings, `text-surface-300` for body, `text-surface-500` for muted
- Use `Card variant="glass"` inside dark sections — never `Card variant="default"`
- Set `SectionHeader variant="dark"` inside dark sections
- Use `getContrastColors()` from `@/lib/color-utils` for dynamic CMS brand colors — never inline luminance math

### Don't
- Don't use default Tailwind colors (`gray-*`, `indigo-*`, `blue-*`) — they're all disabled at the theme level
- Don't use hardcoded hex values — always use semantic tokens (`surface-*`, `primary-*`)
- Don't use `font-weight: 700` on headings — 500 is the heading weight
- Don't use `text-surface-700` or `text-surface-800` for body text on light backgrounds — they muddle the hierarchy
- Don't use `bg-surface-50`, `border-surface-200`, or `text-surface-900` inside dark sections — they belong to light contexts
- Don't use `transition-all` on simple elements — use `transition-colors` or `transition-opacity` (exception: cards with multi-property hover)
- Don't use `styled-jsx` — Tailwind only
- Don't use arbitrary Tailwind values (`p-[23px]`) — stick to the 8px grid
- Don't use `focus:` — always `focus-visible:`
- Don't create raw card markup — use the `Card` component
- Don't skip heading levels (H1 → H3 is invalid)
- Don't use Inter, Roboto, or Arial — the project uses Satoshi + Neue Montreal

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Default | <475px | Single column, compact padding (px-4), text-2xl headings |
| xs | 475px | Minor layout adjustments |
| sm | 640px | Headings scale to text-3xl, 2-column grids begin |
| md | 768px | Horizontal gutters to px-8, headings to text-4xl, 2-3 column cards |
| lg | 1024px | Gutters to px-12, hero goes 2-column, section padding increases |
| xl | 1280px | Max-width container reached, hero min-height increases |
| 2xl | 1536px | Additional breathing room |

### Touch Targets
- Buttons: minimum 44px touch target via padding (py-2 = 8px + text + 8px)
- Nav links: `px-3 py-2` ensures comfortable tap area
- Carousel nav: `w-12 h-12` (48px) circular buttons
- Mobile menu links: full-width with generous vertical padding
- AI icon buttons: `w-10 h-10` (40px) with border

### Collapsing Strategy
- Hero: 2-column grid → stacked single column (image carousel hidden or below)
- Card grids: 3-column → 2-column → single column
- Stats grid: 4-column → 2-column (maintained at 2 on mobile)
- Navigation: horizontal links + CTA → hamburger menu at `<md`
- Mobile menu: fixed overlay from header bottom, full viewport height
- Section padding: lg variant scales from py-16 (mobile) → py-24 (tablet) → py-32 (desktop)
- Tooltips: hidden on mobile (`max-width: 767px`) — they require hover
- Hero min-height: constrained on desktop (`lg:min-h-144 xl:min-h-160`), unconstrained on mobile

### Animation Behavior
- `prefers-reduced-motion: reduce` disables scroll and marquee animations
- `motion-safe:animate-fade-in` for page entrance
- Carousel autoplay is opt-in, never default
- All animations use `transform` and `opacity` only — no layout-triggering properties

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA button: `bg-surface-900 text-white`
- Secondary CTA button: `bg-primary-600 text-white`
- Page background: `bg-surface-50` (`#fafafa`)
- Heading text (light): `text-surface-900`
- Body text (light): `text-surface-600`
- Heading text (dark): `text-white`
- Body text (dark): `text-surface-300`
- Link: `text-primary-600`
- Focus ring: `outline-2 outline-primary-500 outline-offset-2`
- Card border: `border-surface-200`
- Dark section bg: `bg-surface-800` or `bg-surface-900`
- Glass card: `bg-white/5`

### Example Component Prompts
- "Create a section with a heading and 3-column card grid. Use `SectionContainer` with default padding. `SectionHeader` with title and `highlightWord`. Cards use `Card` component, each with `text-lg font-medium text-surface-900` title and `text-surface-600` description. Grid: `grid-cols-1 md:grid-cols-3 gap-6`, spaced `mt-8 lg:mt-12` below the header."
- "Build a dark section. `SectionContainer padding='lg' className='bg-surface-800 text-surface-300'`. `SectionHeader variant='dark'` for the heading. Cards use `Card variant='glass'` with `text-white` titles. Body text inherits `text-surface-300` from the container."
- "Create a CTA block. `SectionContainer padding='lg' className='bg-surface-50'`. Centered title at `text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 tracking-tight`. Subtitle `mt-6 text-lg text-surface-600`. `Button variant='primary' size='lg'` with `calTrigger` for booking."
- "Design a stat counter grid. `grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8`. Each stat: number in `text-3xl md:text-4xl font-medium font-mono text-surface-900`, label below in `text-sm text-surface-500`."
- "Build a badge row. Use `Badge` component with `variant='subtle'` and `size='sm'`. Tags wrap in `flex flex-wrap gap-2`. Each badge gets `rounded-full` pill shape automatically."

### Iteration Guide
1. Every section uses `SectionContainer` — never write manual padding/max-width wrappers
2. Every section heading uses `SectionHeader` — never manually split highlight words
3. Use `Card` for all card surfaces — match variant to background context (default/dark/glass)
4. Text hierarchy is strict: headings (`surface-900`), body (`surface-600`), muted (`surface-500`) on light; headings (`white`), body (`surface-300`), muted (`surface-500`) on dark
5. Buttons in hero/CTA contexts use `rounded-full`; standard UI buttons use `rounded-lg`
6. Import from barrels: `@/components/ui` and `@/components/sections`
7. CMS images go through `image-utils.ts` helpers; static images go through `asset()`
8. Dark sections follow the full recipe: container bg + text color + SectionHeader variant + glass cards
9. Every page ends with `<CTA />`
10. One H1 per page via `SectionHeader as="h1"`
