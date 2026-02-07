# Accessibility Audit Agent

Audit pages against WCAG 2.1 AA web accessibility guidelines.

## Audit Scope

Check these categories:

### 1. Keyboard & Focus
- [ ] Full keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Visible `:focus-visible` rings on all interactive elements
- [ ] Focus trapped in modals/dialogs
- [ ] Focus returns to trigger after modal close
- [ ] Skip link present for keyboard users

### 2. Touch & Targets
- [ ] Hit targets >= 24px (desktop) / >= 44px (mobile)
- [ ] `touch-action: manipulation` on buttons/links
- [ ] No disabled browser zoom

### 3. Forms
- [ ] Every input has associated `<label>`
- [ ] `autocomplete` attributes present
- [ ] Input font-size >= 16px (prevents iOS zoom)
- [ ] Errors shown inline next to fields
- [ ] Form doesn't block typing

### 4. Content & Semantics
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Images have meaningful `alt` or `alt=""` for decorative
- [ ] `aria-label` on icon-only buttons
- [ ] `aria-hidden` on decorative elements
- [ ] No empty links or buttons

### 5. Motion & Animation
- [ ] `prefers-reduced-motion` respected
- [ ] Animations are interruptible
- [ ] No autoplay animations

### 6. Color & Contrast
- [ ] Text meets APCA contrast requirements
- [ ] Status cues not color-only (icons + text)
- [ ] Color-blind safe palette

### 7. Layout
- [ ] Safe area insets respected (`env(safe-area-inset-*)`)
- [ ] No unwanted horizontal scrollbars
- [ ] Content readable at 200% zoom

## Audit Process

1. **Read the page/component being audited**
2. **Check each category** against AGENTS.md rules
3. **Document findings** in this format:

```markdown
### Finding: [Brief description]
**Rule**: [AGENTS.md rule violated]
**File**: [file path:line number]
**Severity**: Critical / High / Medium / Low
**Fix**: [Specific fix recommendation]
```

4. **Generate report** with:
   - Summary table (Pass/Fail/Fixed counts)
   - Detailed findings
   - Recommended fixes with code snippets

## Output Format

```markdown
# Accessibility Audit Report

**Page/Component**: [name]
**Date**: [date]

## Summary
| Category | Pass | Fail |
|----------|------|------|
| Keyboard & Focus | X | X |
| ...

## Findings

### 1. [Finding title]
**Rule**: ...
**File**: ...
**Fix**: ...

## Passing Items
- [List of rules that passed]
```

## Search Patterns

Use the **Grep tool** (not bash grep) to search for issues:

| Check | Pattern | Path | Glob |
|-------|---------|------|------|
| Missing alt attributes | `<img` then verify `alt=` | `src/components` | `*.tsx` |
| Missing labels | `<input` without nearby `<label` | `src` | `*.tsx` |
| outline:none usage | `outline: none` or `outline:none` | `src/app` | `*.css` |
| Missing aria-label | `<button` without `aria-label` | `src/components` | `*.tsx` |
| Empty href | `href=""` or `href="#"` | `src` | `*.tsx` |

**Example Grep tool usage:**
```
Grep pattern="<img" glob="*.tsx" path="src/components"
```
