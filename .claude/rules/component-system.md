# Component System Enforcement Rules

This project uses a component registry (`COMPONENTS.md`) as the single source of truth for all reusable UI. Every Claude Code session must follow these rules to prevent drift, duplication, and inconsistency.

## The Core Loop

```
READ COMPONENTS.md → USE existing components → UPDATE COMPONENTS.md after changes
```

If you skip any step, the system breaks. Reading prevents duplication. Using prevents inconsistency. Updating prevents future sessions from going blind.

## Before Writing Any UI Markup

1. **Read `COMPONENTS.md`** at the project root
2. Check if the pattern you need already exists as a component
3. If it exists, use it exactly as documented — don't recreate it inline
4. If it doesn't exist and you need a reusable pattern, create a proper component

## Import Rules

**Always import UI primitives from the barrel:**
```tsx
// CORRECT
import { Button, Badge, SectionContainer, SectionHeader } from '@/components/ui';

// WRONG — bypasses the barrel, creates inconsistent imports
import { Button } from '@/components/ui/Button';
import { SectionContainer } from '@/components/ui/SectionContainer';
```

**Section components from their barrel:**
```tsx
import { Hero, Partners, CaseStudySlider } from '@/components/sections';
```

## When to Use Existing Components

| If you need... | Use this | Don't... |
|---|---|---|
| Section wrapper with padding | `SectionContainer` | Write manual `<section>` + padding + gutters + max-width |
| Section heading with highlight | `SectionHeader` | Rebuild title splitting logic inline |
| Card surface (any variant) | `Card` | Write raw `bg-white rounded-xl border...` markup |
| Dot-prefixed label | `BulletLabel` | Create a `<span>` with a dot character |
| Category/tag pill | `Badge` | Build a custom pill with inline styles |
| Any button or link-button | `Button` | Use raw `<button>` or `<a>` for CTAs |
| Carousel navigation | `CarouselNav` | Build custom prev/next arrow buttons |
| Color contrast on dynamic bg | `getContrastColors()` from `@/lib/color-utils` | Inline luminance/contrast math |

## After Changing Components

If you did ANY of the following, you MUST update `COMPONENTS.md`:

- Added a new component to `src/components/ui/` or `src/components/sections/`
- Removed a component
- Added, removed, or renamed a prop on an existing component
- Changed a prop's type or default value
- Changed a component's behavior in a way that affects usage
- Added a new barrel export

### What to Update

1. **Props table** — add/remove/modify rows to match the actual interface
2. **Usage example** — update if the API changed
3. **Section components table** — add/remove rows, update "Client?" column
4. **Barrel exports section** — update the list if exports changed

### COMPONENTS.md Format

Follow the existing format exactly. Each UI primitive gets:
- Description (one line)
- Props table (Prop | Type | Default | Description)
- Usage example (tsx code block)

Each section component gets a row in the table (Component | File | Description | Client?).

## Creating New Components

1. Create the file in the appropriate directory:
   - Reusable primitives → `src/components/ui/`
   - Page sections → `src/components/sections/`
   - One-off layout parts → `src/components/`
2. Export from the appropriate barrel (`src/components/ui/index.ts` or `src/components/sections/index.ts`)
3. Add documentation to `COMPONENTS.md`
4. Use TypeScript interfaces for all props
5. Follow the naming convention: PascalCase, named export (not default)

## Anti-Patterns to Avoid

- **Inline reimplementation** — if SectionHeader does title splitting, don't write your own `formatTitle()` in a page component
- **Direct file imports** — `from '@/components/ui/Button'` instead of `from '@/components/ui'`
- **Undocumented components** — adding a component without updating COMPONENTS.md
- **styled-jsx** — never use `<style jsx>`, Tailwind only
- **Default Tailwind colors** — use `surface-*`, `primary-*` tokens, never `gray-*`, `indigo-*`
- **Inline color contrast math** — always use `getContrastColors()` / `getContrastColor()` from `@/lib/color-utils`
- **Hardcoded image paths** — always use `asset()` for static images
- **Raw `<a>` for internal links** — always use `<Link>` from `next/link`
