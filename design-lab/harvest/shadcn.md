# Harvest: ui.shadcn.com + shadcnblocks.com — process/steps and stats/metrics components

Fetched live via WebFetch + the shadcn MCP registry tool on 2026-08-27. Not answered from memory.

## Bottom line

- **ui.shadcn.com (the official registry) has ZERO components or blocks in either target category.** Confirmed by listing all 97 items in the `@shadcn` registry via the shadcn MCP tool (`list_items_in_registries`, `types: ["block"]`) and searching for "stats" and "timeline". The full block inventory is: 16 sidebar variants, 10 login/signup variants, and ~70 chart blocks (area/bar/line/pie/radar/radial/tooltip). No process, steps, stepper, timeline, "how it works", stats, metrics, KPI, counter, or testimonial-grid blocks exist there. There is nothing to copy from this site for either category.
- **shadcnblocks.com (third-party, ui.shadcn.com-adjacent paid site) DOES have both categories**, but it is a commercial product: every block detail page and every `/preview/<slug>` page returns only a preview image, an npm/CLI install command (`npx shadcn add @shadcnblocks/<slug>`), and a login wall. No `<pre>`/`<code>` block or copy-to-clipboard panel is exposed to an unauthenticated fetch — this held true even for blocks explicitly labeled "Free" (e.g. Process 1), not just "Pro" ones (e.g. Stats 1). I did not find any way to get literal source without an account. **No code is reproduced below because none was ever visible — this is not a summarization choice, the site never served it.**

---

## Category A — Process / Steps / Timeline / Stepper / "How It Works"

### ui.shadcn.com
None. Not present in the registry.

### shadcnblocks.com — `/blocks/process` (4 blocks)

| Block | URL | Description |
|---|---|---|
| Process 1 | https://shadcnblocks.com/block/process1 | Sticky sidebar four-step process |
| Process 2 | https://shadcnblocks.com/block/process2 | Scroll-driven process with image transitions |
| Process 3 | https://shadcnblocks.com/block/process3 | Stacked color-band process steps |
| Process 4 | https://shadcnblocks.com/block/process4 | Hover-activated process cards with image popup |

**Code:** Not available without login. Verified directly on `/block/process1` and `/preview/process1` — preview image + install command only, even though the block is tagged "Free".

**Dependencies (from page copy, not verified in code):** shadcn/ui, Tailwind CSS, React/Next.js/Astro support mentioned generically on every block page — nothing block-specific (no confirmation of framer-motion, lucide-react, or cva usage for these specific blocks).

### shadcnblocks.com — `/blocks/timeline` (16 blocks)
Category exists at https://shadcnblocks.com/blocks/timeline — I did not enumerate individual timeline block slugs/descriptions (ran out of scope after confirming the same login-wall pattern on `process1`/`stats1`; every other block on this site follows the identical preview-only pattern). If you need the full 16-item list, that's one more WebFetch call to that URL.

---

## Category B — Stats / Metrics / KPI / Numbers / Counter / Testimonial Grid

### ui.shadcn.com
None. Not present in the registry.

### shadcnblocks.com — `/blocks/stats` (19 blocks)

| Block | URL | Description |
|---|---|---|
| Stats 1 | https://shadcnblocks.com/block/stats1 | Centered three-column performance stats |
| Stats 2 | https://shadcnblocks.com/block/stats2 | Accent cards with trend arrows |
| Stats 4 | https://shadcnblocks.com/block/stats4 | Platform rating bar |
| Stats 5 | https://shadcnblocks.com/block/stats5 | Three-column metric display |
| Stats 6 | https://shadcnblocks.com/block/stats6 | Left-aligned stats with dual buttons |
| Stats 7 | https://shadcnblocks.com/block/stats7 | Weekly stats with progress bars |
| Stats 8 | https://shadcnblocks.com/block/stats8 | Stats grid with heading and link |
| Stats 9 | https://shadcnblocks.com/block/stats9 | Split stats with feature cards |
| Stats 10 | https://shadcnblocks.com/block/stats10 | Stats cards with avatars and logos |
| Stats 11 | https://shadcnblocks.com/block/stats11 | Gradient background + circle decoration |
| Stats 12 | https://shadcnblocks.com/block/stats12 | Split stats with monthly toggle |
| Stats 13 | https://shadcnblocks.com/block/stats13 | Animated competitor bar comparison |
| Stats 14 | https://shadcnblocks.com/block/stats14 | Countdown timer with CTA |
| Stats 15 | https://shadcnblocks.com/block/stats15 | Year-toggle stats with timeline |
| Stats 16 | https://shadcnblocks.com/block/stats16 | Centered stats with line chart |
| Stats 17 | https://shadcnblocks.com/block/stats17 | Radial chart with stacked metrics |
| Stats 18 | https://shadcnblocks.com/block/stats18 | Centered stats with radar chart |
| Stats 19 | https://shadcnblocks.com/block/stats19 | Sticky milestones list |
| Stats 22 | https://shadcnblocks.com/block/stats22 | Yearly metrics with ruler timeline |

**Code:** Not available without login. Verified directly on `/block/stats1` — marked "Pro" tier, preview image + install command + a note that a subscription ("Get All Access") is required to view/use source.

**Dependencies:** Same generic shadcn/ui + Tailwind + React/Next/Astro copy on every page; several stats blocks visually use chart primitives (line/radial/radar), which on ui.shadcn.com's own registry are built on Recharts — but this is inferred from the shadcn chart-block pattern elsewhere, not confirmed against shadcnblocks' actual stats-block code.

### shadcnblocks.com — related categories also found (not enumerated further)
- `/blocks/stats-card` — 10 blocks
- `/blocks/chart-card` — 27 blocks
- `/blocks/chart-group` — 15 blocks
- `/blocks/testimonial` — 39 blocks
- `/blocks/reviews` — 14 blocks
- `/blocks/feedback` — 7 blocks
- `/blocks/leaderboard` — 3 blocks (stats-adjacent)

---

## What this means for adapting anything

Nothing here is copy-pasteable. To actually get literal shadcnblocks.com source you (or codex, which already hit the same wall) would need a paid "All Access" login — that's a purchase decision, not something to route around. The only literal, usable-today code from this pass is: none. If you want to proceed anyway, the realistic paths are (a) pay for shadcnblocks access and re-run this harvest against the authenticated pages, or (b) skip shadcnblocks and hand-build the process/stats sections from scratch against LoudFace's own `COMPONENTS.md` primitives (`SectionContainer`, `SectionHeader`, `Card`) — which is what the design system already expects anyway.
