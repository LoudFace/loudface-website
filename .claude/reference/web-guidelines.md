# Web Interface Guidelines (Reference)

Comprehensive web development guidelines. Loaded on-demand for audits and reviews.

For quick reference of project-specific rules, see `AGENTS.md`.

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

### Forms
- MUST: Every control has a `<label>` or is associated with one
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: Accept free text, validate after - don't block typing
- MUST: Warn on unsaved changes before navigation
- NEVER: Block paste in `<input>`/`<textarea>`

### State & Navigation
- MUST: URL reflects state (deep-link filters/tabs/pagination)
- MUST: Back/Forward restores scroll position
- MUST: Links use `<a>`/`<Link>` for navigation
- NEVER: Use `<div onClick>` for navigation

### Modals & Dialogs
- MUST: Use native `<dialog>` or proper ARIA dialog pattern
- MUST: Trap focus inside modal while open
- MUST: Return focus to trigger on close
- MUST: Close on Escape key press
- MUST: `overscroll-behavior: contain` to prevent background scroll

### Scroll Behavior
- MUST: `scroll-margin-top` accounts for sticky header height
- MUST: `scroll-behavior: smooth` only with `prefers-reduced-motion` check

---

## Animation

- MUST: Honor `prefers-reduced-motion`
- MUST: Animate compositor-friendly props only (`transform`, `opacity`)
- NEVER: Animate layout props (`top`, `left`, `width`, `height`)
- NEVER: `transition: all` - list properties explicitly

---

## Content & Accessibility

- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- MUST: Redundant status cues (not color-only)
- MUST: Accessible names exist even when visuals omit labels
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics before ARIA

---

## Performance

- MUST: Preload above-fold images; lazy-load the rest
- MUST: Prevent CLS (explicit image dimensions)
- MUST: Virtualize large lists (>50 items)
- MUST: Mutations target <500ms
- SHOULD: `<link rel="preconnect">` for CDN domains
- SHOULD: Critical fonts preloaded with `font-display: swap`

---

## Design

- MUST: Meet contrast - prefer APCA over WCAG 2
- MUST: Increase contrast on `:hover`/`:active`/`:focus`
- MUST: Accessible charts (color-blind-friendly palettes)

---

## Copywriting

- MUST: Active voice, clear & concise
- MUST: Error messages guide the exit - tell users how to fix
- MUST: Action-oriented language
- MUST: Use numerals for counts ("8 deployments" not "eight")
