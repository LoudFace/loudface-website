# Web Interface Guidelines

Concise rules for building accessible, fast, delightful UIs. Use MUST/SHOULD/NEVER to guide decisions.

---

## Interactions

### Keyboard

- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
- MUST: Manage focus (trap, move, return) per APG patterns
- NEVER: `outline: none` without visible focus replacement

### Targets & Input

- MUST: Hit target >=24px (mobile >=44px); if visual <24px, expand hit area
- MUST: Mobile `<input>` font-size >=16px to prevent iOS zoom
- NEVER: Disable browser zoom (`user-scalable=no`, `maximum-scale=1`)
- MUST: `touch-action: manipulation` to prevent double-tap zoom
- SHOULD: Set `-webkit-tap-highlight-color` to match design

### Forms

- MUST: Hydration-safe inputs (no lost focus/value)
- NEVER: Block paste in `<input>`/`<textarea>`
- MUST: Loading buttons show spinner and keep original label
- MUST: Enter submits focused input; in `<textarea>`, Cmd/Ctrl+Enter submits
- MUST: Keep submit enabled until request starts; then disable with spinner
- MUST: Accept free text, validate after - don't block typing
- MUST: Allow incomplete form submission to surface validation
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- SHOULD: Disable spellcheck for emails/codes/usernames
- SHOULD: Placeholders end with `...` and show example pattern
- MUST: Warn on unsaved changes before navigation
- MUST: Compatible with password managers & 2FA; allow pasting codes
- MUST: Trim values to handle text expansion trailing spaces
- MUST: No dead zones on checkboxes/radios; label+control share one hit target
- MUST: Every control has a `<label>` or is associated with one
- MUST: Clicking a `<label>` focuses the associated control

### State & Navigation

- MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels)
- MUST: Back/Forward restores scroll position
- MUST: Links use `<a>`/`<Link>` for navigation (support Cmd/Ctrl/middle-click)
- NEVER: Use `<div onClick>` for navigation

### Feedback

- SHOULD: Optimistic UI; reconcile on response; on failure rollback or offer Undo
- MUST: Confirm destructive actions or provide Undo window
- MUST: Use polite `aria-live` for toasts/inline validation
- SHOULD: Ellipsis (`...`) for options opening follow-ups ("Rename...") and loading states ("Loading...")

### Touch & Drag

- MUST: Generous targets, clear affordances; avoid finicky interactions
- MUST: Delay first tooltip; subsequent peers instant
- MUST: `overscroll-behavior: contain` in modals/drawers
- MUST: During drag, disable text selection and set `inert` on dragged elements
- MUST: If it looks clickable, it must be clickable

### Modals & Dialogs

- MUST: Use native `<dialog>` element or proper ARIA dialog pattern
- MUST: Trap focus inside modal while open
- MUST: Return focus to trigger element on close
- MUST: Close on Escape key press
- MUST: Close on backdrop click (unless modal is critical)
- MUST: `overscroll-behavior: contain` to prevent background scroll
- MUST: Set `inert` on background content while modal is open
- SHOULD: Animate in/out with transform (not layout properties)
- NEVER: Nest modals - close first before opening second

### Scroll Behavior

- MUST: `scroll-margin-top` accounts for sticky header height
- MUST: `scroll-behavior: smooth` only with `prefers-reduced-motion` check
- MUST: Anchor links scroll target into view with proper offset
- SHOULD: Preserve scroll position on route changes (SPA)
- SHOULD: Reset scroll to top on new page navigation
- MUST: `scroll-padding-top` on scroll containers with sticky headers

### Autofocus

- SHOULD: Autofocus on desktop with single primary input; rarely on mobile

---

## Animation

- MUST: Honor `prefers-reduced-motion` (provide reduced variant or disable)
- SHOULD: Prefer CSS > Web Animations API > JS libraries
- MUST: Animate compositor-friendly props (`transform`, `opacity`) only
- NEVER: Animate layout props (`top`, `left`, `width`, `height`)
- NEVER: `transition: all` - list properties explicitly
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations interruptible and input-driven (no autoplay)
- MUST: Correct `transform-origin` (motion starts where it "physically" should)
- MUST: SVG transforms on `<g>` wrapper with `transform-box: fill-box`

---

## Layout

- SHOULD: Optical alignment; adjust +/-1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges - no accidental placement
- SHOULD: Balance icon/text lockups (weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (`env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars; fix overflows
- SHOULD: Flex/grid over JS measurement for layout

---

## Content & Accessibility

- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans (`text-wrap: balance`)
- MUST: `font-variant-numeric: tabular-nums` for number comparisons
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Accessible names exist even when visuals omit labels
- MUST: Use `...` character (not `...` as three periods)
- MUST: `scroll-margin-top` on headings; "Skip to content" link; hierarchical `<h1>`-`<h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- MUST: Accurate `aria-label`; decorative elements `aria-hidden`
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- MUST: Non-breaking spaces: `10&nbsp;MB`, `Cmd&nbsp;K`, brand names

---

## Content Handling

- MUST: Text containers handle long content (`truncate`, `line-clamp-*`, `break-words`)
- MUST: Flex children need `min-w-0` to allow truncation
- MUST: Handle empty states - no broken UI for empty strings/arrays

---

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid reflows/repaints
- MUST: Mutations (`POST`/`PATCH`/`DELETE`) target <500ms
- SHOULD: Prefer uncontrolled inputs; controlled inputs cheap per keystroke
- MUST: Virtualize large lists (>50 items)
- MUST: Preload above-fold images; lazy-load the rest
- MUST: Prevent CLS (explicit image dimensions)
- SHOULD: `<link rel="preconnect">` for CDN domains
- SHOULD: Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

---

## Dark Mode & Theming

- MUST: `color-scheme: dark` on `<html>` for dark themes
- SHOULD: `<meta name="theme-color">` matches page background
- MUST: Native `<select>`: explicit `background-color` and `color` (Windows fix)

---

## Hydration

- MUST: Inputs with `value` need `onChange` (or use `defaultValue`)
- SHOULD: Guard date/time rendering against hydration mismatch

---

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child <= parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast - prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover`/`:active`/`:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid dark color gradient banding (use background images when needed)

---

## CSS & Styling

### General Best Practices

- NEVER: Use universal selector resets (`* { margin: 0; padding: 0; }`)
- NEVER: Use `transition: all` - list properties explicitly
- NEVER: Use broad element selectors (`div { }`, `section { }`) without context
- MUST: Use Tailwind utility classes or component abstractions via `@apply`
- MUST: Only `*, *::before, *::after { box-sizing: border-box; }` is acceptable for resets
- SHOULD: Prefer composition over inheritance in component styles
- SHOULD: Prefer class selectors over element selectors

### Tailwind Component Pattern

- MUST: Define reusable components in `src/styles/components.css` using `@apply`
- MUST: Use semantic class names (e.g., `.nav-header`, `.card-title`)
- SHOULD: Keep utility classes in templates, abstractions in CSS
- SHOULD: Use Tailwind's responsive modifiers (`md:`, `lg:`) over custom media queries

### Verification Checklist

- MUST: Screenshot affected pages BEFORE CSS changes
- MUST: Visually compare AFTER CSS changes on these breakpoints:
  - Desktop (1440px, 1280px)
  - Tablet (768px)
  - Mobile (375px)
- MUST: Test navigation, grids, and CMS-driven content after changes
- SHOULD: Use browser DevTools responsive mode for quick checks

---

## Copywriting

- MUST: Active voice ("Install the CLI" not "The CLI will be installed")
- MUST: Title Case for headings & buttons; sentence case for marketing
- MUST: Be clear & concise - use as few words as possible
- SHOULD: Prefer `&` over `and`
- MUST: Action-oriented language ("Install the CLI" not "You will need the CLI")
- MUST: Keep nouns consistent - introduce few unique terms
- MUST: Write in second person; avoid first person
- MUST: Use numerals for counts ("8 deployments" not "eight deployments")
- MUST: Separate numbers & units with non-breaking space (`10&nbsp;MB`)
- MUST: Default to positive language, even for errors
- MUST: Error messages guide the exit - tell users how to fix it
- MUST: Avoid ambiguity - labels are clear & specific ("Save API Key" not "Continue")

---

## Minimum Loading State Duration

- SHOULD: Add show-delay (~150-300ms) for spinners/skeletons
- SHOULD: Add minimum visible time (~300-500ms) to avoid flicker on fast responses

---

## Quick Reference

| Category | Key Rule |
|----------|----------|
| Keyboard | Full WAI-ARIA APG support |
| Focus | Visible `:focus-visible` rings |
| Targets | >=24px desktop, >=44px mobile |
| Forms | Don't block typing, validate after |
| Navigation | URL reflects state, links are `<a>` |
| Modals | Use `<dialog>`, trap focus, return focus |
| Scroll | `scroll-margin-top` for sticky headers |
| Animation | Honor `prefers-reduced-motion` |
| Layout | Respect safe areas, no overflow bugs |
| Content | No dead ends, design all states |
| Performance | <500ms mutations, virtualize >50 items |
| Contrast | APCA over WCAG 2 |
| CSS Resets | Never `* { margin/padding: 0 }` |
| Tailwind | Use utilities + `@apply` for components |
