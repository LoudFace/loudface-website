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

## Status (2026-07-14)

**DONE:**
- **/contact = v3, NET-NEW page, fully componentized (2026-07-15).**
  `src/app/(site)/contact/page.tsx` composes `src/app/contact-v3/*` (HeroContact
  electric hero + "engagement card" booking panel, LogosMarquee indigo strip,
  NextSteps 4-step engagement thread + decorative calendar companion, OfficesBand
  SF+Dubai tiles with live local clocks + fact tiles + founder quote with the REAL
  Sanity headshot (arnel-bukva, initials fallback), Faq accordion, CoverCTA compact
  close, shared FooterV3, Scripts for reveals+clocks). Port of the approved
  `contact-v3/first-move.html` concept. **This route never existed before** — the
  `/contact → /` 301 was REMOVED from `next.config.ts` AND the `LEGACY_URL_MAP`
  in `seo-utils.ts` (do-not-re-add comments left in both, same playbook as
  /services 2026-07-12). Bespoke CSS scoped `:where(.ctv3)`, keyframes
  ctv3-prefixed, hero pulled under the sticky header `margin-top:-64px`, carries
  `.hero` so the shared dark Header keys its scroll flip off it. Header
  dark-variant + shared-footer suppression extended to `/contact` in
  `(site)/layout.tsx`; `/contact` added to `sitemap.ts`. Every booking CTA is
  `href="#book-modal"` + `data-cal-trigger` (CalHandler modal — no second booking
  mechanism), plus a `mailto:hello@loudface.co` escape hatch. NO contact form and
  NO newsletter form (the newsletter API is a silent no-op — do not add a form
  posting to it). Claims: safe set only (200+, 4+ years, 2h response, 30-min
  call); no slots/scarcity. JSON-LD: BreadcrumbList + **ContactPage carrying BOTH
  office PostalAddresses** (first machine-readable SF address anywhere on the
  site) + contactPoint/email + FAQPage (single-sourced with the accordion) +
  WebPage/Speakable. Verified: 200 (redirect gone), one h1, all sections SSR'd,
  20 Cal triggers, all JSON-LD parses, founder headshot loads from Sanity, other
  pages still 200; tsc + build clean.
- **/blog (index) + /blog/[slug] (post template) = v3, fully componentized (2026-07-14).**
  `src/app/(site)/blog/page.tsx` + `.../blog/[slug]/page.tsx` compose `src/app/blog-v3/*`
  (Lead electric band, AnswerCard citation surface, BlogBodyV3 prose+visuals, MobileToc,
  ReadingRail, Faq, AuthorBento, RelatedGallery/PostCard night exhibit cards, CoverCTA,
  Scripts, shared FooterV3). Port of the approved `blog-v3/answer-first.html` concept as a
  DYNAMIC template over all 108 live posts. **Signature move:** the AEO `direct-answer` is
  lifted into an elevated white citation card straddling the electric→light seam
  (`.answer-wrap` negative margin), `data-speakable` on the answer `<p>` (94% of posts;
  degrades to plain header flow + no empty card on the 6% without one — verified on
  `60-word-block-ai-overviews`). Bespoke CSS scoped `:where(.blogv3)`, all vars + fonts
  declared here (loads ONLY on blog); the electric band carries `.hero` so the shared dark
  Header keys its scroll flip off it; hero pulled under the sticky header `margin-top:-64px`;
  keyframes blg-prefixed; `.ft` FooterV3 skin re-scoped under `.blogv3`. Body renders into a
  FRESH `.prose` class (never `.blog-prose`) so the old template's global blog-prose rules
  can't bleed in; the visuals[] splice pipeline is preserved (verified on the 7-visual
  share-of-answer post). **Reveal is gated on `@media (scripting: enabled)`** (NOT a
  pre-hydration DOM class) → zero hydration mismatch + no-JS crawlers see full opacity.
  **Must-keeps carried:** TOC (mobile `<details>` + sticky rail w/ scroll-spy), embedded
  `faq[]` accordion + FAQPage schema (≥2 items), author block, existing two-tier related
  selection, share row (X/copy/LinkedIn), H2-anchor structure, and all 5 JSON-LD
  (BlogPosting + BreadcrumbList + FAQPage + WebPage/Speakable always; ItemList fires only on
  ranked listicles — verified present on `top-10-webflow-agency-templates`, absent otherwise).
  generateMetadata title ≤60 / desc ≤160 pipeline preserved verbatim; one h1. **Judge-nit
  fix:** wide tables get a CSS scroll-shadow (Lea-Verou 4-layer trick) + a mobile "Scroll for
  the full table" cue. The 13%-no-thumbnail case: index + related cards fall to an indigo
  gradient plate w/ faint monogram (never a gray box); the post's featured-image block is
  simply omitted (clean text-only hero — verified on `aeo-consultant-vs-agency-2026`). The
  concept's bespoke mid-article "night takeaway stage" (hand-authored quote + 30/3/1 facts,
  specific to one post) is NOT ported — no per-post data source across the archive; rhythm is
  carried by electric lead → night related → night cover. Header dark-variant + shared-footer
  suppression extended to `/blog` + `/blog/*` in `(site)/layout.tsx`. Verified: `/blog` + 3
  posts (with-answer+faq+thumb / no-answer / no-thumb) all 200, one h1 each, citation card
  present/absent correctly, console clean, other pages still 200. Build compiles clean; tsc clean.
- **/case-studies/[slug] (case-study DETAIL template) = v3, fully componentized (2026-07-14).**
  `src/app/(site)/case-studies/[slug]/page.tsx` composes `src/app/case-detail-v3/*`
  (HeroDetail electric split-screen with the signature two-state answer object,
  ResultsLedger, BuildStory article + sticky sidebar, NightCharts, ProofQuote,
  FaqDetail, RelatedWork marquee+cards, CoverCTADetail, shared FooterV3). Port of
  the approved `case-detail-v3/before-after.html` concept, rebuilt as a DYNAMIC
  template that renders all 26 live studies from their Sanity fields. Bespoke CSS
  scoped `:where(.csv3)` with ALL vars declared under `.csv3` (NOT :root) so a
  client-nav between the `.wkv3` gallery and a `.csv3` detail can't clobber the
  other file's `--ink`/`--acc`; keyframes csd-prefixed (`csdpulse`/`csdslide`);
  hero pulled under the sticky header with `margin-top:-64px`; the `.ft` FooterV3
  skin is ported/re-scoped here (FooterV3 renders inside `.csv3`). Header
  dark-variant + shared-footer suppression extended to `/case-studies/*` (startsWith)
  in `(site)/layout.tsx`. **Signature binding:** the two-state hero (BEFORE→NOW +
  delta) only appears when `result-1-number` itself encodes a transition (parsed on
  `→`/`->`; live = Toku "0 → 86%", LoudFace "0.18% → 10.4%" — the only 2 of 26);
  every other study degrades to a single-state result card (same glass family, one
  column). **Sparse-degradation (all verified live):** ledger is cols-1/2/3 by how
  many result fields are populated; NightCharts renders only when `charts.length>0`
  (growthCurve stays axis-free — the reused `CaseStudyCharts` must-keep — with a
  privacy note); ProofQuote only when a testimonial body resolves; FaqDetail when
  ≥2 items (100% today); industry badge/tech pills optional. **Must-keeps carried:**
  TOC anchors (H2-id injection, mobile pills + sticky sidebar), services/tech pills
  (tech `?tech=` dead link fixed → points at gallery), project facts, related-work
  industry(+3)/service(+2) scoring util, and BreadcrumbList+Article+FAQPage+Speakable
  (+Review when testimonial) JSON-LD. generateMetadata truncation (title ≤60 / desc
  ≤160 via seo-utils) preserved; one h1 (data-speakable). Dead fields NOT rendered
  (clientLogo/clientLogoInversed/secondaryClientColor); the broken "Visit site"
  button (undefined `websiteUrl`) stays gone. Zero page-level client JS — every
  section is a Server Component; the dark→scrolled nav flip is owned by the shared
  Header. Verified live: Toku (richest, two-state, 3 charts/8 FAQ), CodeOp (medium,
  2 stats+charts), LIQID (sparse, single-state, 1 stat, no charts/testimonial) — all
  200, correct data, one h1, JSON-LD present, no empty sections; gallery + other
  pages still 200. Build: 188/188 static pages, tsc clean.
- **/case-studies (Our Work gallery) = v3, fully componentized (2026-07-14).**
  `src/app/(site)/case-studies/page.tsx` composes `src/app/work-v3/*` (HeroWork
  electric-marquee stage — a "now showing" tab-switcher cycling the 4 flagships
  Toku/Dimer/LIQID/Eraser on a shared night mat; LogosMarquee crisp-white band;
  Archive discipline-filtered grid — the AI group leads with a full-width showcase
  card + big cards, CRO/Web as standard cards; Proof night stat band; Receipts;
  CoverCTA; shared FooterV3). Port of the approved `work-v3/marquee-stage.html`
  concept. Bespoke CSS scoped `:where(.wkv3)` (same pattern as `.hpv3`/`.svv3`);
  hero pulled under the sticky header with `margin-top:-64px`; keyframes wk-prefixed
  (`wkmarq`/`wklivedot`/`wkpfade`) to avoid cross-route collision. Header dark-variant
  + shared-footer suppression extended to `/case-studies` in `(site)/layout.tsx`.
  **LIVE Sanity:** hero flagship screenshots via `getWorkImages()` (= homepage
  `getHomeV3Images`, hardcoded CDN fallback); the ARCHIVE is the full gallery-reachable
  set via `fetchHomepageData()` (respects `HIDDEN_CASE_STUDY_SLUGS`) — 26 studies,
  grouped by discipline, filter buttons + counts computed from live data; every study
  stays SSR'd in the default "All" view for crawlers/AI engines. Card links →
  `/case-studies/[slug]` (detail routes untouched, still 200). SEO: metadata/canonical
  preserved + CollectionPage/ItemList + BreadcrumbList JSON-LD ported; one h1. Claims:
  hero + proof carry ONLY safe stats (200+, 4+ yrs, ~2h, Toku 0→86%, Dimer 288%); the
  old work.json hero stats (147%/3.2x) are gone; per-card stats come straight from
  Sanity as they do on the live gallery today. Old `CaseStudyGallery.tsx` removed.
  Client components: HeroWork (tabs) + Archive (filters); everything else server.
  **Client-boundary gotcha (cost a build):** pure content + types live in
  `work-v3/content.ts` (imports nothing server-only) so the `'use client'` components
  don't drag `next/headers` into the browser bundle; `work-v3/data.ts` (getWorkImages)
  is server-only — import it ONLY from Server Components.
- **/services = v3, fully componentized + NET-NEW hub (2026-07-12).**
  `src/app/(site)/services/page.tsx` composes `src/app/services-v3/*` (HeroServices
  "work is the pitch" electric-recipe stage + counter-drifting work wall, LogosMarquee
  indigo strip, Exhibits — the signature: LIQID/Toku/Eraser each crediting the services
  that shipped it via chips routing to child pages, stat interlude, ServicesIndex
  Build|Growth two-track directory, Clarifier SEO/AEO-vs-GEO, Faq, CoverCTA, shared
  FooterV3). Port of the approved `services-v3/proof-stack.html` concept. Bespoke CSS
  scoped `:where(.svv3)` (same pattern as `.hpv3`/`.abv3`/`.prv3`); hero pulled under the
  sticky header with `margin-top:-64px`. **The `/services` → `/services/webflow` 301 in
  `next.config.ts` was REMOVED** so the hub resolves (do NOT re-add; browsers that cached
  the old 301 clear only by time/hard-reload — nothing to do server-side). Header
  dark-variant + shared-footer suppression extended to `/services` in `(site)/layout.tsx`;
  `/services` added to `sitemap.ts`. Live Sanity: hero work-wall + exhibit screenshots via
  `getHomeV3Images()` (same helper/slugs as homepage SelectedWork, hardcoded fallback);
  logo marquee reuses `home-v3/_logos.ts`. SEO: canonical `/services`, BreadcrumbList +
  ItemList (7 services → child URLs) + FAQPage JSON-LD (FAQ single-sourced with the
  accordion). QA (P12+P7) folded in: decorative mono cleanup (`.track-num`, `.svc-both
  .glyph`, `.ex-tag`, `.ex-out em` → Satoshi/sentence-case); mono kept on citation chip,
  browser-bar URLs, and the $5k/mo pill. Child routes (`/services/webflow` etc.) untouched
  and still 200. Only dollar figure: $5k/mo (once).
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
- **Other pages are still pre-v3** (old light design): the **child** service pages
  `/services/webflow` · `/services/seo-aeo` · `/services/geo-agency` · `/services/cro` ·
  `/services/ux-ui-design` · `/services/copywriting` · `/services/growth-autopilot` (the
  `/services` HUB is now v3 — see DONE) and `/seo-for/*` (the `/case-studies`
  gallery + `/case-studies/[slug]` detail, `/blog` + `/blog/[slug]`, AND the net-new
  `/contact` are now v3 — see DONE).
  Their headers still show the old white bar + green CTA. These are the rollout.
- **`case-detail-v3/*` components live in a route folder** (like `work-v3`/`home-v3`/`services-v3`),
  deliberately unregistered in COMPONENTS.md, matching the established v3-route-folder precedent.
- **`services-v3/*` components live in a route folder** (like `home-v3`/`about-v3`/`pricing-v3`),
  not `src/components/sections/` — deliberately unregistered in COMPONENTS.md, matching the
  established v3-route-folder precedent.
- The `home-v3/*` components live in a route folder, not `src/components/sections/`. Move + register in
  COMPONENTS.md when convenient (update `/` imports on the move).

## Next steps (the page rollout)
Redesign each page to v3 **through the design loop** (`/design` → it routes to the `design-loop` skill;
it anchors on `DESIGN.md` + the taste-rulebook + rejections). Agreed order: **1) /about (DONE 2026-07-06)
→ 2) /pricing (DONE 2026-07-08) → 3) /services (DONE 2026-07-12) → 4) /case-studies gallery
(DONE 2026-07-14) → 5) case-study detail template `/case-studies/[slug]` (DONE 2026-07-14) → 6) /blog index + /blog/[slug] post template (DONE 2026-07-14) → 7) /contact (DONE 2026-07-15, net-new) → 8) the /services child pages (NEXT).**

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
