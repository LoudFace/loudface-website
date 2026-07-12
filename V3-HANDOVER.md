# v3 Redesign — Handover

Self-contained state + next steps for the LoudFace **v3 site redesign**. Written so a fresh Claude
session (even on a different machine/account, with none of the local memory) can pick up and continue.
Everything here is in the repo (git). Read `DESIGN.md` (the v3 spec) alongside this.

---

## What this project is
Rolling the site over to a new design language ("**v3**") — deep-indigo art-directed **stages**
alternating with **crisp-light** sections (FlowNinja-style color-blocking), Neue Montreal / Satoshi /
Geist Mono, blueprint-figure diagrams. The **homepage is the reference build** and is DONE + LIVE at `/`.
Now migrating the other pages to match. `DESIGN.md` §0–10 is the authority.

## Status (2026-07-08)

**DONE:**
- **/pricing = v3, fully componentized (2026-07-08).** `src/app/(site)/pricing/page.tsx` composes
  `src/app/pricing-v3/*` (HeroPricing tier-deck stage, LogosMarquee, HowItWorks stepper plate, Tracks,
  Compare table, Includes + SpecialArrangements, Exhibits testimonials, Faq, CoverCTA, shared FooterV3).
  Port of the approved `pricing-v3/hybrid.html` "stage-tiers" concept. Bespoke CSS scoped
  `:where(.prv3)` (same pattern as `.hpv3`/`.abv3`); hero pulled under the sticky header with
  `margin-top:-64px` (same trick as `.abv3 .hero`). Testimonials LIVE from Sanity
  (`getPricingTestimonials()` — Kenneth O'Friel/Toku, Shin Kim/Eraser, Pierre Landoin/Icypeas matched
  by name, backfill-safe); logo marquee reuses the homepage `home-v3/_logos.ts` set. FAQPage JSON-LD
  generated from `PRICING_FAQ` (single source with the accordion). Header dark-variant + shared-footer
  suppression extended to `/pricing` in `(site)/layout.tsx`. Metadata/canonical preserved from the old
  pricing page. Only dollar figure: $5k/mo.
- **/about = v3, fully componentized.** `src/app/(site)/about/page.tsx` composes `src/app/about-v3/*`
  (HeroAbout team-mosaic stage, Ledger, Story, Team ladder, Values, Awards, Faq, CoverCTA, FooterAbout).
  Bespoke CSS scoped `:where(.abv3)` (same pattern as `.hpv3`). Team is LIVE from Sanity (`getAboutTeam()`,
  ordered by `TEAM_ORDER`, balanced 2/3/2 columns at 6-8 people; fact/quote copy in `TEAM_COPY` by slug).
  Header dark-variant + shared-footer suppression extended to `/about` in `(site)/layout.tsx`. Composite
  mockup + picker archived in the design-loop scratchpad; concepts A/B/C logged to rejections/rulebook.
- **Homepage `/` = v3, fully componentized.** `src/app/(site)/page.tsx` composes `src/app/home-v3/*`
  (HeroV3, LogosTicker, ProblemSection+BlueprintPlate, WhatWeDo, SelectedWork, ResultsNumbers,
  ProcessSteps, FaqSection, CoverCTA, FooterV3). Copy humanized + verified against live Sanity.
  Case-study screenshots wired from Sanity by slug (`home-v3/data.ts`, hardcoded fallback).
- **Nav (shared `Header.tsx`) = v3, homepage only:** transparent over hero → **deep night-indigo bar
  on scroll** (`rgba(23,20,69,.92)`) → **deep-indigo dropdown mega-menus** (night gradient, glass rows,
  `primary-300` line-icons). Gated via `heroTheme="dark"` (passed for `pathname === "/"` in
  `(site)/layout.tsx`) + a `data-hero-scrolled` scroll flag. Homepage footer = `FooterV3` (shared footer
  suppressed on `/`).
- **`DESIGN.md`** rewritten with the v3 spec on top (§0–10), old detail kept below as legacy.
- Design-loop picks logged to `.claude/design/taste-rulebook.md`.

**NOT done / important:**
- **NOTHING is deployed.** All changes are in the working tree, **not committed, not pushed.** Production
  changes only on `git push` (Vercel auto-deploys). Old homepage is in git history if a revert is wanted.
- **Other pages are still pre-v3** (old light design): `/services/*`, `/seo-for/*`,
  `/work` + `/work/[slug]`, `/blog` + `/blog/[slug]`, `/contact`. Their headers still show the old white
  bar + green CTA. These are the rollout.
- The `home-v3/*` components live in a route folder, not `src/components/sections/`. Move + register in
  COMPONENTS.md when convenient (update `/` imports on the move).

## Next steps (the page rollout)
Redesign each page to v3 **through the design loop** (`/design` → it routes to the `design-loop` skill;
it anchors on `DESIGN.md` + the taste-rulebook + rejections). Agreed order: **1) /about (DONE 2026-07-06)
→ 2) /pricing (DONE 2026-07-08) → 3) /services → 4) /work → 5) /blog.**

### /about — planned v3 mapping (current sections → v3 treatments)
Current `/about` (`src/app/(site)/about/page.tsx`, ~341 lines): intro + SectionHeaders + a **wine-palette**
stats block + client `LogoImage`s + `FAQ` + `CTA`.
| Current | → v3 |
|---|---|
| Intro | deep-indigo stage hero ("the team behind 200+ B2B SaaS sites") + a **structured** visual (team grid / work marquee) — not a founder portrait |
| Story / who we are | crisp-light, items-with-figures (blueprint plates) or a deep floating card |
| Wine stats block | v3 **Numbers** — big indigo stat tiles (drop the wine palette) |
| Team | crisp-light grid of **real team photos** (the one place portraits belong) |
| Values / how we work | deep stage or the night-runway |
| FAQ | v3 FAQ (deep panel + light `<details>` accordion) |
| CTA | v3 cover-stack |

## Gotchas that WILL bite you (all learned the hard way)
- **CSS coexistence — THE big one.** The bespoke `home-v3.css` (fonts + tokens global; resets scoped)
  must NOT leak onto the shared Tailwind chrome. It's scoped under a `.hpv3` wrapper using
  **`:where(.hpv3)`** — zero-specificity so resets confine to the wrapper but never override component
  classes. **Plain `.hpv3 a` descendant scoping RAISES specificity and silently breaks component colors**
  (it turned the AI chips black). Any new bespoke-CSS page needs the same `.hpv3` + `:where()` pattern.
- **`surface-900` (#22302e) has a green-teal undertone** → NEVER a CTA/accent on the indigo v3 site. CTAs
  = `primary-600` or a white pill on a dark stage.
- **Geist Mono is technical-only** (stats + blueprint plates) — never a nav/dropdown kicker or mono-caps
  micro-label ("deviates from our chosen fonts").
- **Tailwind arbitrary opacity `bg-white/[0.06]` renders SOLID** in this setup — use the percentage form
  `bg-white/6`.
- **Dark-hero `[data-cal-trigger]` CSS whitens nested dropdown CTAs** — scope it to the nav pill only
  (`[data-nav-cta]`). And the "hide Accepting-Bookings tab" rule must be **direct-child** `> .absolute.top-full`
  or it also hides the dropdown panels (breaks the dropdowns).
- **globals.css edited via bash `cat >>` does NOT trigger a Next recompile** — use the Edit tool (tracked write).
- **Verification is flaky.** The Claude_Preview tab intermittently reports `innerWidth: 0` after reloads +
  won't scroll (eval-measured heights bogus; screenshots pin to hero). `shot.py` CANNOT render `(site)`
  routes (SanityLive keeps the connection open → headless never idles). So: verify structure via DOM
  queries + `curl` for compile/HTML; use `preview_resize` to explicit W×H (not the 'desktop' preset) to
  un-stick the tab; use `shot.py` only on ISOLATED html mockups. `tsc --noEmit` for the type gate.

## Portability — what to copy if moving to a new account
- **In git (carries automatically):** `DESIGN.md`, `.claude/design/taste-rulebook.md`, `CLAUDE.md`, this
  file, all `home-v3/*` code, `public/homepage-v3/{brand.css,fonts,assets}`.
- **LOCAL — copy these or they're lost:** `~/.atelier/rejections.md` + `~/.atelier/taste-laws.md` (the
  design loop's anti-slop memory — the loop falls back to bundled bans without them but is sharper with
  them), and the `.claude/skills/blueprint-figures/` skill (currently **untracked** — `git add` it to
  carry the house diagram style + its feedback ledger).

## Working method
Design-generation (any page/section) → run the **design loop** (do NOT freehand HTML variants — it ships
slop). Explanatory graphics → the **blueprint-figures** skill. Content/copy → keep it plain + factual +
humanized (see `DESIGN.md` §1). Dev server on port 3005 (`npm run dev`); portless URL
`https://loudface.localhost`.
