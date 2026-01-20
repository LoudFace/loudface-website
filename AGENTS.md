# Web Interface Guidelines

Project-specific rules for building UIs. Uses MUST/SHOULD/NEVER for clarity.

For comprehensive web development guidelines, see `.claude/reference/web-guidelines.md`.

---

## Project-Specific Rules

### CSS & Tailwind

- NEVER: Universal selector resets (`* { margin: 0; padding: 0; }`)
- NEVER: `transition: all` - list properties explicitly
- NEVER: Broad element selectors (`div { }`, `section { }`)
- MUST: Use Tailwind utility classes or `@apply` abstractions
- MUST: Only `*, *::before, *::after { box-sizing: border-box; }` acceptable for resets
- MUST: Define reusable components in `src/styles/components.css`

### Tailwind Component Pattern

- MUST: Use semantic class names (`.nav-header`, `.card-title`)
- SHOULD: Keep utilities in templates, abstractions in CSS
- SHOULD: Use responsive modifiers (`md:`, `lg:`) over custom media queries

### CSS Changes Verification

- MUST: Screenshot affected pages BEFORE CSS changes
- MUST: Compare AFTER on breakpoints: 1440px, 1280px, 768px, 375px
- MUST: Test navigation, grids, and CMS content after changes

---

## Key Interaction Rules

### Focus States
- MUST: Visible `:focus-visible` rings (not `:focus`)
- NEVER: `outline: none` without visible replacement

### Touch Targets
- MUST: Hit target >=24px desktop, >=44px mobile
- MUST: `touch-action: manipulation` on interactive elements

### Forms
- MUST: Every control has associated `<label>`
- MUST: Input font-size >=16px (prevents iOS zoom)
- NEVER: Block paste in inputs

### Modals
- MUST: Use native `<dialog>` or ARIA dialog pattern
- MUST: Trap focus, return on close, close on Escape
- MUST: `overscroll-behavior: contain`

### Animation
- MUST: Honor `prefers-reduced-motion`
- MUST: Animate only `transform`, `opacity`
- NEVER: Animate layout props (`top`, `left`, `width`, `height`)

---

## Quick Reference

| Category | Key Rule |
|----------|----------|
| CSS Resets | Never `* { margin/padding: 0 }` |
| Tailwind | Use utilities + `@apply` for components |
| Focus | `:focus-visible` not `:focus` |
| Targets | >=24px desktop, >=44px mobile |
| Animation | Only `transform`/`opacity` |
| Forms | Every input needs a label |

---

## Audits

For detailed audit checklists, see:
- `.claude/agents/accessibility-audit.md`
- `.claude/agents/performance-audit.md`
