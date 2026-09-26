# Component Registry

Quick-reference for every reusable component. **Check here before writing any markup** — if a component exists, use it. If you add or change a component, update this file.

Import all UI primitives from the barrel:
```tsx
import { AICitationVisual, AnimatedNumber, Badge, BulletLabel, Button, Card, CaseStudyCharts, SliderNav, Tabs, TabsContent, TabsList, TabsTrigger, ComponentAssemblyVisual, CopyFirstVisual, ConversionSplitVisual, DesignSystemVisual, LogoImage, PixelBreakpointAnimation, PreferredSourceButton, ScalableGridAnimation, SectionContainer, SectionHeader } from '@/components/ui';
```

---

## UI Primitives (`src/components/ui/`)

### AICitationVisual

Animated browser frame mimicking an AI engine response where the brand is highlighted as a cited source. Cycles through Perplexity, ChatGPT, and Google AI. Shows a question, skeleton response lines with a real brand citation, and source pills. Floating badges show "Cited" checkmark and citation count on completion. Client component (no props).

```tsx
<AICitationVisual />
```

### AnimatedNumber

Viewport-triggered count animation adapted from Magic UI's NumberTicker. The final value stays in the server-rendered HTML and in screen-reader text. The visual count only starts after hydration. Respects reduced-motion preferences. Client component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Final value and server-rendered value |
| `startValue` | `number` | `0` | Visual starting value |
| `delay` | `number` | `0` | Delay in seconds after entering the viewport |
| `decimalPlaces` | `number` | `0` | Fixed decimal places |
| `className` | `string` | `''` | Additional classes |

```tsx
<AnimatedNumber value={97.8} decimalPlaces={1} />
```

### Badge

Pill-shaped label for categories, tags, and eyebrow text.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Label text |
| `variant` | `'subtle' \| 'outline'` | `'subtle'` | `subtle` = filled bg + border, `outline` = border only |
| `size` | `'sm' \| 'md'` | `'sm'` | `sm` = compact (px-3 py-1), `md` = standard (px-4 py-2) |
| `icon` | `ReactNode` | — | Optional leading icon |
| `className` | `string` | `''` | Additional classes |

```tsx
<Badge variant="outline">Uncategorized</Badge>
<Badge size="md" icon={<img src={asset('/images/icon.svg')} alt="" className="w-6 h-6" />}>
  Webflow Enterprise Partner
</Badge>
```

### BulletLabel

Dot-prefixed label used as section eyebrows or small headings.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Label text |
| `as` | `'span' \| 'h2' \| 'h3'` | `'span'` | HTML element for the text |
| `variant` | `'light' \| 'dark'` | `'light'` | Text color scheme |
| `className` | `string` | `''` | Additional classes |

```tsx
<BulletLabel>Our Journey</BulletLabel>
<BulletLabel as="h2" variant="dark">Performance Metrics</BulletLabel>
```

### Button

Multi-variant button that renders as `<button>`, `<Link>`, or `<a>` depending on props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Button text |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding/text size |
| `href` | `string` | — | Makes it a link (internal = `<Link>`, external = `<a target="_blank" rel="noopener noreferrer">`) |
| `calTrigger` | `boolean` | — | Marks as Cal.com booking trigger |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type (ignored when `href` is set) |
| `onClick` | `() => void` | — | Click handler. Fires in all render modes (`<button>`, `<Link>`, and external `<a>`) — e.g. for analytics on a link CTA |
| `fullWidth` | `boolean` | `false` | Stretches to fill container |
| `disabled` | `boolean` | `false` | Disables interaction |
| `ariaLabel` | `string` | — | Accessible label for icon-only buttons |
| `className` | `string` | `''` | Additional classes |

```tsx
<Button variant="primary" size="lg" calTrigger>Book an intro call</Button>
<Button variant="outline" href="/work">View case studies</Button>
```

### CaseStudyCharts

Server-rendered charts for case study results. Zero client JS — pure div-based bars with inline widths. Reads `CaseStudyChart[]` from the CMS `charts` field. Two chart types: `barComparison` (grouped vertical bars, two series) and `horizontalBar` (single-series horizontal bars).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `charts` | `CaseStudyChart[]` | required | Chart data from CMS |
| `accentColor` | `string` | `var(--color-primary-500)` | Bar fill color (typically `clientColor`) |

```tsx
import { CaseStudyCharts } from '@/components/ui';
import type { CaseStudyChart } from '@/lib/types';

// Renders all charts in a responsive 2-column grid
<CaseStudyCharts charts={study.charts} accentColor={clientColor} />
```

### Card

Consistent card surface for content containers. Use instead of writing raw card markup.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Card content |
| `variant` | `'default' \| 'dark' \| 'glass'` | `'default'` | `default` = white + border, `dark` = solid dark, `glass` = subtle translucent surface for dark sections |
| `padding` | `'sm' \| 'md' \| 'lg' \| 'none'` | `'md'` | Inner padding (`sm` = p-4, `md` = p-6, `lg` = p-8) |
| `hover` | `boolean` | `true` | Enable hover interaction styles |
| `className` | `string` | `''` | Additional classes |

```tsx
<Card>Content on light bg</Card>
<Card variant="dark">Content in dark container</Card>
<Card variant="glass">Content inside dark section</Card>
<Card padding="lg" hover={false}>Static large card</Card>
```

### SliderNav

Prev/next arrow buttons for Embla carousels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'light' \| 'dark'` | `'light'` | Color scheme matching background |
| `onPrevClick` | `() => void` | — | Optional previous slide callback |
| `onNextClick` | `() => void` | — | Optional next slide callback |
| `className` | `string` | — | Additional classes |

```tsx
<SliderNav variant="light" onPrevClick={scrollPrev} onNextClick={scrollNext} />
```

### Tabs

Accessible compound tabs adapted from beUI and Transitions.dev. Uses a shared Motion layout indicator, blur/fade panel swaps, LoudFace light/dark tokens, linked tab and panel IDs, roving focus, orientation-aware arrow keys, Home/End keys, and reduced-motion handling. Client component.

| Component | Key props | Description |
|------|------|-------------|
| `Tabs` | `defaultValue?`, `value?`, `onValueChange?`, `variant?` (`pill`/`segment`/`underline`), `tone?` (`light`/`dark`) | State and motion provider |
| `TabsList` | `orientation?` (`horizontal`/`vertical`), `ariaLabel?`, `className?` | Accessible tab list and keyboard navigation |
| `TabsTrigger` | `value`, `className?`, `indicatorClassName?` | Tab control with the shared indicator |
| `TabsContent` | `value`, `className?` | Linked tab panel; inactive content stays mounted and hidden |

```tsx
<Tabs defaultValue="build" variant="segment" tone="dark">
  <TabsList ariaLabel="Engagement stage">
    <TabsTrigger value="build">Build</TabsTrigger>
    <TabsTrigger value="grow">Grow</TabsTrigger>
  </TabsList>
  <TabsContent value="build">Website build</TabsContent>
  <TabsContent value="grow">Growth program</TabsContent>
</Tabs>
```

### LogoImage

Auto-scaling logo image that normalizes visual weight across different aspect ratios. Uses Dan Paquette's proportional normalization formula on load. Starts invisible and fades in after the scale is calculated. Client component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image URL |
| `alt` | `string` | required | Accessible alt text |
| `containerWidth` | `number` | `106` | Bounding box width in px |
| `containerHeight` | `number` | `44` | Bounding box height in px |
| `containerClassName` | `string` | `''` | Classes on the outer wrapper div |
| `imgClassName` | `string` | `''` | Classes on the `<img>` element |

```tsx
<LogoImage
  src={logoImage(client['colored-logo']?.url) || asset('/images/placeholder-logo.svg')}
  alt={client.name}
  imgClassName="grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
/>
```

### CopyFirstVisual

Animated browser frame where copy appears first (headline, value prop, CTA, proof), then page wireframe structure crystallizes around the text. Demonstrates the Copy → Design → Dev workflow. Cycles through three scenarios: Homepage, Pricing, Product. Annotation pills (H1, Value prop, CTA, Proof) connected by dashed lines are the signature differentiator. Floating badges show "Copy-led" checkmark and "288% best result" on completion. Client component (no props).

```tsx
<CopyFirstVisual />
```

### DesignSystemVisual

Animated browser frame where design tokens (color, type, spacing, radius) appear first, then component blocks materialize with dashed connection lines, then a full page wireframe composes from those components. Token sidebar annotations in the right margin are the signature differentiator. Cycles through three scenarios: Tokens, Components, Live. Floating badges show "42 components" and "100% Consistency" on completion. Client component (no props).

```tsx
<DesignSystemVisual />
```

### ConversionSplitVisual

Animated browser frame showing an A/B split test playing out in real time. Two page variants appear side by side, metrics count up, a winner is declared, then the cycle resets with a new test scenario. Cycles through three pages: landing, pricing, and signup. Floating badges show conversion lift and tests-won count on completion. Client component (no props).

```tsx
<ConversionSplitVisual />
```

### ComponentAssemblyVisual

Animated browser frame where website sections (nav, hero, cards, CTA) slide in one by one, demonstrating component-first architecture. On completion, the browser frame glows with a primary-colored border. Status text toggles between "Assembling components..." and "Ready to launch." Client component (no props).

```tsx
<ComponentAssemblyVisual />
```

### PixelBreakpointAnimation

Animated pixel grid that morphs between mobile / tablet / desktop layout representations. Chunky retro pixels dissolve and reform in a wave pattern. Client component (no props).

```tsx
<PixelBreakpointAnimation />
```

### PreferredSourceButton

LoudFace-styled trigger for Google's Preferred Sources confirmation flow. It uses Google's current multicolor G asset without recoloring it. Loads the official publisher SDK after the page becomes idle and uses its manual control API. Google owns the confirmation flow; LoudFace owns the visible button. Client component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Classes on the control wrapper |

```tsx
<PreferredSourceButton className="mt-4 w-[240px] max-w-full" />
```

### ScalableGridAnimation

Animated 4x2 grid of mini-page wireframes that progressively fills in (2 → 4 → 8 tiles) with spring pop-in animation. Each tile has distinct wireframe content (accent bars, nav dots, headers, image blocks, text lines). Includes a page counter. Designed for dark backgrounds. Client component (no props).

```tsx
<ScalableGridAnimation />
```

### LadderRail

Fixed left-edge scroll-spy rail for service child-pages (desktop ≥1280px only; hidden below that breakpoint). Lists the page's H2 "answer sections" as short nav labels (rungs) along a hairline spine with a marching-ants "live" segment that grows to the active rung. Scroll-spies via `IntersectionObserver` to set the active rung, click-to-scroll via `scrollIntoView`, and auto-inverts to a light/on-dark palette when its vertical midpoint overlaps a `.stage` (dark-indigo) section on the page — computed live via `getBoundingClientRect`, not by section order, so it stays correct if stages are reordered. Client component. Originated in the "Question Ladder" service-page-v3 concept (`service-page-v3/question-ladder.html`) — promoted here so every service child-page (Webflow, SEO/AEO, GEO, CRO, UX/UI Design, Copywriting, Growth Autopilot) references the same component with a different `sections` array, never a page-local reimplementation.

Requires each target section to carry a matching `id` and the page to include at least one `.stage` element for the on-dark inversion to detect against (pages with no dark stages simply never invert).

| Prop | Type | Default | Description |
|---|---|---|---|
| `sections` | `{ id: string; label: string }[]` | — (required) | One entry per rung, in DOM order. Everything else (spine geometry, dark-inversion, IO thresholds) is internal behavior, not configuration. |

```tsx
<LadderRail sections={[
  { id: 'ship', label: "What you ship" },
  { id: 'run', label: 'How it runs' },
  { id: 'proof', label: "What it's done" },
  { id: 'next', label: 'After you call' },
]} />
```

### Pagination

URL-based pagination nav for listing pages (blog, case studies). Renders page numbers with prev/next arrows, ellipsis for large ranges, and highlights the current page. Client component — it owns the scroll reset on page change, because `html { scroll-behavior: smooth }` breaks the router's own reset and would leave the reader parked at the previous scroll offset. The links therefore pass `scroll={false}`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | — | Active page number (1-indexed) |
| `totalPages` | `number` | — | Total number of pages |
| `basePath` | `string` | — | Base URL for page links (e.g. `/blog`) |
| `scrollTargetId` | `string` | top of document | `id` of the element to scroll into view on page change — pass the list section so the reader lands on the results, not the hero |

```tsx
<Pagination currentPage={2} totalPages={6} basePath="/blog" scrollTargetId="articles" />
```

### VideoFacade

Lazy-loading wrapper for video embeds. Uses IntersectionObserver to defer iframe injection until the element scrolls into view (with 200px margin). Eliminates video player JS and video file downloads from the initial page load while showing the native player UI once visible. Client component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `videoUrl` | `string` | required | Iframe src URL for the video player |
| `title` | `string` | required | Accessible title for the video |
| `name` | `string` | required | Speaker/person name displayed below |
| `role` | `string` | required | Speaker role/title displayed below |

```tsx
<VideoFacade
  videoUrl="https://app.vidzflow.com/v/abc123"
  title="Client Testimonial"
  name="Jane Doe"
  role="CEO | Acme Corp"
/>
```

### SectionContainer

Wrapper providing consistent padding, max-width, and horizontal gutters for page sections.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Section content |
| `padding` | `'none' \| 'sm' \| 'default' \| 'lg'` | `'default'` | Vertical padding scale |
| `as` | `'section' \| 'div' \| 'article' \| 'aside' \| 'footer'` | `'section'` | HTML tag |
| `className` | `string` | `''` | Outer element classes |
| `innerClassName` | `string` | `''` | Inner max-width container classes |
| `id` | `string` | — | Anchor link target |

```tsx
<SectionContainer padding="lg" className="bg-surface-50">
  {/* content */}
</SectionContainer>
```

### SectionHeader

Standardized section heading with optional eyebrow label, highlighted word, and subtitle.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Heading text |
| `highlightWord` | `string` | — | Word to style differently (primary color) |
| `subtitle` | `string` | — | Description below heading (supports HTML) |
| `eyebrow` | `string` | — | BulletLabel rendered above the heading |
| `variant` | `'light' \| 'dark'` | `'light'` | Color scheme |
| `align` | `'left' \| 'center'` | `'left'` | Text alignment |
| `as` | `'h1' \| 'h2' \| 'h3'` | `'h2'` | Heading level |
| `className` | `string` | `''` | Container classes |

```tsx
<SectionHeader
  eyebrow="Our Team"
  title="Meet the Creators"
  highlightWord="Creators"
  subtitle="The team behind your next successful project."
/>
```

---

## Section Components (`src/components/sections/`)

All section components are exported from `@/components/sections` (or `@/components` top-level barrel).

| Component | File | Description | Client? |
|-----------|------|-------------|---------|
| `Hero` | `Hero.tsx` | Homepage hero with scrolling case study cards | No |
| `Partners` | `Partners.tsx` | Client logos marquee + testimonials | Yes |
| `Results` | `Results.tsx` | Bento grid of results/metrics | No |
| `FAQ` | `FAQ.tsx` | FAQ section. `variant="accordion"` (default) = collapsed `<details>` toggles, `variant="open"` = all answers visible. Props: `title?`, `subtitle?`, `items`, `showFooter?`, `footerTitle?`, `footerText?`, `footerCtaText?`, `skipSchema?`, `variant?` | No |
| `CTA` | `CTA.tsx` | Final call-to-action section | No |
| `TestimonialGrid` | `TestimonialGrid.tsx` | 3-card testimonial section (quote + avatar + name + role). Filters internally to only show testimonials with profile-image and body. Props: `testimonials`, `title?`, `highlightWord?`, `subtitle?`, `variant?` (`'gray'` default = section bg-surface-50 + white cards, `'light'` = white section + gray cards), `limit?` (default 3). Renders nothing when no testimonials qualify. | No |
| `EditorialProse` | `EditorialProse.tsx` | Splits CMS RichText at H2 boundaries into numbered insight cards (ghosted 01/02/03 numbers, heading, first-paragraph summary, native `<details>` expand for remaining content). Props: `html`, `industryName?` | No |
| `DeliverablesGrid` | `DeliverablesGrid.tsx` | Split layout: header left, dual-column vertical marquee right. Items scroll in opposite directions (CSS-only, uses existing scroll-down/scroll-up keyframes). Fade masks at edges. Respects `prefers-reduced-motion`. Props: `html`, `industryName?` | No |
| `RelatedServices` | `RelatedServices.tsx` | Cross-link section showing the other 4 service pages. Takes `currentService` (href string) to exclude the current page. Place before CTA on service pages. | No |
| `RelatedComparisons` | `RelatedComparisons.tsx` | Pill-style cross-links between Webflow comparison blog posts. Takes `currentSlug` to exclude the current post. Conditionally rendered on comparison blog posts (slug matches known comparison list). | No |
| `RelatedArticles` | `RelatedArticles.tsx` | Blog post links section for service pages. Takes `articles` array of `{ href, title, description }`. Place between RelatedServices and CTA on service pages. | No |
| `ProblemChecker` | `ProblemChecker.tsx` | Interactive checklist of common website problems | Yes |
| `ProblemCheckerA` | `ProblemCheckerA.tsx` | Problem checklist variant with Cal.com embed (lazy-loaded). Props: `heading`, `items` | Yes |
| `ProblemCheckerC` | `ProblemCheckerC.tsx` | Problem checklist variant C | Yes |

**"Client?"** = requires `'use client'` directive (has hooks/interactivity).

---

## Route Components (`src/app/`)

| Component | File | Description |
|-----------|------|-------------|
| `HRTechPage` | `seo-for-v3/HRTechPage.tsx` | Approved source-owned page component for `/seo-for/hr-tech`. Renders the HR tech SaaS SEO, AEO, and GEO page with its FAQ data and CEIPAL proof image. |

---

## Case Study Detail Components (`src/app/case-detail-v3/`)

Route-scoped components for `/case-studies/[slug]`, imported by relative path (not a barrel) from that page and from the `dev-preview/trademomentum` preview.

| Component | File | Description | Client? |
|-----------|------|-------------|---------|
| `InstrumentsBoard` | `InstrumentsBoard.tsx` | Reusable "AI Search & Organic Growth" chart board (Peec AI + Google Search Console), generalised from the TradeMomentum case study's original `TradeMomentumInstruments` band. Props: `instruments` (`CaseStudyInstruments` from `@/lib/types`), `clientName`. Every field on `instruments` is optional — renders only the cells with data, collapsing a two-cell row to full width (`.inb-row--single`, see `instruments-board.css`) when only one side has data, and skipping a row/board entirely when neither/none of its fields are present. Wired in `case-studies/[slug]/page.tsx` in place of `ResultsInstruments`/`ResultsLedger` once a study's `instruments` field has at least 2 of its 4 chartable fields (`topicClimb`, `rankOverTime`, `engineBeforeAfter`, `indexedTrend`) filled in. A third board, **Leads**, renders from `instruments.leadGrowth` (2026-09-02) — a bar series of weekly (or monthly) enquiries beside the published multiplier. It needs `points` to draw: a multiplier with no shape behind it is a claim, not an instrument, so a bare `leadGrowth` renders nothing. Points are INDEXED to the study's own baseline window = 100 and the tooltip prints multiples, so no absolute lead count ever reaches the DOM. A series whose points all land on the 1st is treated as monthly and gets month-name axis labels instead of day labels. Styles: `instruments-board.css` (import alongside the component). | Yes |
| `EngineMarks` (`EngineMark`, `GoogleMark`, `OpenAIMark`, `PerplexityMark`, `GeminiMark`, `ClaudeMark`) | `EngineMarks.tsx` | Inline SVG marks for the AI engines a chart's data came from (nominative use, not an endorsement/partnership claim). Moved here from `dev-preview/case-study-charts/EngineMarks.tsx` so `InstrumentsBoard` and the dev-preview chart drafts share one copy — the dev-preview files now import from here. `EngineMark` takes `engine: 'chatgpt' \| 'perplexity' \| 'googleAio'`. | No |
| `ResultsInstruments` | `ResultsInstruments.tsx` | Pre-existing "By the numbers" band driven by the `charts` Sanity field (step-area growth curve + bar comparisons). Still used when a study has `charts` but not enough of `instruments` to qualify for `InstrumentsBoard`. | No |

---

## v11 Components (`src/app/home-v11/`, `src/app/service-v11/`, `src/app/case-v11/` and the other `*-v11` folders)

Since 2026-09-26 every live route renders its v11 component (route map: `docs/v11-handoff.md`); the `/dev-preview/home-v11*` previews remain for Paper imports.

The v11 redesign's component library. The full table (part, file, when to use it) is DESIGN.md §7; every part is shown
at `/dev-preview/home-v11-kit` and on the Paper page "Design system · v11". Not yet on live routes.

| Component | File | Description | Client? |
|-----------|------|-------------|---------|
| `ResultCase` | `home-v11/ResultCase.tsx` | Result card with a live chart; `feature` adds number, extra figures, axis and caption | No |
| `StageChart` | `home-v11/StageChart.tsx` | Result drawn white on the indigo stage; `size="slide"` (rail) or `"hero"` | No |
| `QuoteCard` | `home-v11/Testimonials.tsx` | Client number and quote on the client's tint | No |
| `SectionHeadNode` | `home-v11/ui.tsx` | `SectionHead` for headings passed as markup | No |
| `ChatWindow` | `home-v11/Bento.tsx` | The ChatGPT answer window at true size. Props: `c` (the chat copy), `className?` (`is-hero` = service hero picture size), `sourceIcon?` (the first source's favicon, default Toku; `null` = plain placeholder for an example answer) | No |
| `KeyResults` | `home-v11/KeyResults.tsx` | Big figures with a short label and a quiet note each. Props: `items: { value, label, note? }[]` | No |
| `ChartPanel` | `home-v11/ChartPanel.tsx` | One live chart with title and source only. Props: `title`, `source?`, `series`, `format`, `tip`, `lead?` (full width, labelled pin), `height?` | Yes (LiveChart) |
| `BeforeAfterChart` | `home-v11/BeforeAfterChart.tsx` | Published before → after readings as grouped columns. Props: `pairs: { label, before, after, beforeText, afterText }[]`, `beforeLabel?`, `afterLabel?`, `height?` (default 250) | No |
| Proof cells | `service-v11/kit.tsx` | `VideoCell`, `BarsCell`, `ChartCell`, `QuoteCell`, `StatCell` for `.cro-grid`. `QuoteCell` takes `logoUrl` (CMS logo) or `brandIcon` (app icon beside the name), `faceUrl` or `initial`, `review` (`{ href, label }`, the published review link) and `className` | No |
| UI cards | `service-v11/kit.tsx`, `service-v11/pages/shared.tsx` | `Ui`, `UiHead`, `Tag`, `CheckPill`, `StatusList`, `Redline`, `Wireframe`; social proof cells `VideoProof`, `GenieQuote` (`plain` drops its figure when the page already shows it), `TokuQuote`, `BrandfirmQuote` (`pages/shared.tsx`) | No |
| `ServicePageV11` | `service-v11/ServicePageV11.tsx` | /services/<slug> template, approved on the CRO board 2026-09-25. Per-page parts in `service-v11/pages/<slug>.tsx`. Order: hero (copy beside the service's tinted panel, `TONE`), logos, program tiles, Results (live charts via `ServiceResults`; heading from the config's `proof`, or the homepage's when the page sets `chartsUseHomeHead`), body, signature, more, the plan on the brand plate, comparison, FAQ (always `--warm`), social proof (the page's `results.cells` grid of client videos, quotes and figures, no charts), four related services as photo cards, `Closing` with the service's own lede | No |
| `ServiceResults`, `ServiceVoices` | `service-v11/proof.tsx` | `ServiceResults`: a service page's four `ResultCase` cells, one client per cell, the first as the feature (per-slug picks in `RESULTS`); `avoid` takes case-study slugs or result keys already shown on the page and refills from a fallback so no figure appears twice (`resultKeys`, `resultSlugs`). `ServiceVoices`: the three client videos in one row | Yes (LiveChart) |
| `RankTracker`, `ConsoleChart`, `GrowthBoard`, `DraftPage` | `service-v11/pages/hero-art.tsx` | Service hero pictures drawn at 1:1 at a screenshot's size: the weekly tracker (Google position beside each engine's citation), a Search Console window with a client's published figures and its curve (through `ChartPanel`), a growth board with team avatars, a draft page with the writer's notes. What must be seen sits in the left 600px (`--ha-vis`). An AI answer is never drawn here: GEO uses `ChatWindow` with `className="is-hero"` | Yes (ConsoleChart via ChartPanel) |
| `MethodologyV11` | `methodology-v11/MethodologyV11.tsx` + `methodology.css` | /methodology in v11, second build (2026-09-26, harvest `design-lab/harvest/2026-09-26/methodology`): the live page's copy (`methodology-v3/data.tsx`, approved and hash-verified) plus its own labels and chart figures (`methodology-v11.json`). Hero beside the per-engine slope chart (`EngineSlope`); short answer; retrieve/cite/name as a funnel of one sample (`Funnel`) with the mentions-vs-citations columns; the chain run on our own domain as a report on the brand plate; the eight stages in full beside a sticky rail (`StageRail`, each stage's opening line with the rest in a disclosure); the measurement spreadsheet on the plate (`MeasureSheet`); engines tracked vs snapshot with their marks; proof as charts of the published readings in the crosshair grid with the receipts in disclosures; honest limits beside Google's own words; where to start beside the audit's `Queries` window, then the price band; FAQ. `EngineSlope`, `Funnel`, `MeasureSheet` are exported for the kit. Preview `/dev-preview/home-v11-methodology` | No |
| `ContactV11` | `contact-v11/ContactV11.tsx` + `contact.css` | /contact in v11: the live page's copy (`contact.json`) with each section built against a tile from `design-lab/harvest/2026-09-25/contact-careers-2`: hero beside the intro-call card (agenda, slot chips, book button); logo grid; four step cards, each with what you receive (booked slot, your live site on screen, the written proposal, the kickoff message; examples from `pricing-v11.json` `steps`); the two offices photographed (`contact/city-*.webp`, addresses from `contact-v3/data.ts` `OFFICES`) over three facts; the founder's promise beside four leads; FAQ; `Closing` with the contact heading and `arnel@loudface.co`. Preview `/dev-preview/home-v11-contact` | No |
| `CareersV11` | `careers-v11/CareersV11.tsx` + `careers.css` | /careers in v11: the live page's copy (moved unchanged from `CareersPageV3` into `careers-v11.json`), roles live from Notion (`fetchOpenRoles`). Hero over a row of seven team portraits (scrolls sideways on phones); open roles on hairlines, or the empty state (open-application card + "What we hire for" list); how hiring goes in three steps (Arnel on the last); logo grid; a candidate closing on the closing stage. Preview `/dev-preview/home-v11-careers` (maps an unavailable roles result to the empty state, since local dev has no Notion token) | No |
| `IndustryPageV11` | `seo-for-v11/IndustryPageV11.tsx` + `industry.css` | /seo-for/<industry> in v11 (SaaS and B2B from their JSON, the rest from their Sanity `seoPage`, mapped in `views.ts`): hero over the market's case-study covers with their published results; the problem beside an example AI answer (`ChatWindow`, `industry-v11.json` `chat`); the program tiles with live charts (SaaS; `TileChart`, exported from `service-v11/pages/growth-autopilot.tsx`); the page's figures (`KeyResults`) over `ServiceResults` (`seo-for-<key>` sets in `service-v11/proof.tsx`, skipping the hero's studies); the approach as a sheet on the brand plate; the long body beside "What's included"; FAQ (with the page's audit offer under its head); `IndustryVoices`; `RelatedIndustries`. Preview `/dev-preview/home-v11-industry/<slug>` | No |
| `IndustryArticleV11` | `seo-for-v11/IndustryArticleV11.tsx` | The /seo-for long reads (HR tech, AI startups, EdTech) in v11. Copy moved unchanged from `seo-for-v3/*Page.tsx` into `seo-for-<slug>.json` (`getSeoForArticleContent`). Hero with the short answer on an indigo card beside the client proof (a site in `Browser` or a figures window); buyer questions table; the argument with a contents rail (`cs-rail`); FAQ; other industries. Same preview route | No |
| `IndustryHubV11` | `seo-for-v11/IndustryHubV11.tsx` | /seo-for in v11: hero, the four live figures, then every industry page as a card with its lead client's cover and result (`hubCards` in `views.ts`); why the market changes the work (three example AI answers); results; the approach sheet; FAQ; proof grid. Copy in `seo-for-hub.json`. Preview `/dev-preview/home-v11-industries` | No |
| `IndustryVoices`, `RelatedIndustries` / `relatedCards` | `seo-for-v11/voices.tsx`, `seo-for-v11/related.tsx` | The industry pages' proof grid (two wide cells, two narrow, skipping any client whose figure is already on the page via `avoid`) and the closing cards for four other markets (never the page itself or a cover it already shows). Also used by the audit, partners and long-read pages | No |
| `TeamProfileV11` | `team-v11/TeamProfileV11.tsx` + `team.css` | /team/<slug> in v11: portrait beside name, title (operator-model titles from `team-v11.json` override Sanity), bio, LinkedIn and skills; the author's latest five posts as `PostCard`s then every article on hairlines (12 shown, the rest in a `<details>` that stays in the DOM); the four leads minus the person; the results. Preview `/dev-preview/home-v11-team/<slug>` | No |
| `AuditPageV11`, `Scorecard` | `audit-v11/AuditPageV11.tsx` + `audit.css` | /ai-audit in v11: the live `AuditLandingForm` (restyled) beside the report's scorecard, and the problem copy beside the report's category-discovery table, both drawn from the example report (`/audit/demo`, Acme Corp: the same scores, queries and share of voice) and labelled as an example; proof grid; FAQ; the form again on the closing stage. Copy in `ai-audit.json`. `Scorecard` is reused by the webinar. Preview `/dev-preview/home-v11-audit` | No |
| `WebinarV11` | `webinar-v11/WebinarV11.tsx` + `webinar.css` | /webinar/ai-search-visibility in v11: title and the live consent gate beside a ticket (date, Toku 0→86%, the three speakers); takeaways beside the Toku `ChatWindow`; speakers; the agenda drawn to scale; registration on the closing stage; the audit with its `Scorecard`. After `hero.startsAt` the page stops selling a seat: the hero points to the recording in the recap post (`past`), the closing is the booking stage, the audit pitch goes. Copy in `webinar-ai-search.json`. Preview `/dev-preview/home-v11-webinar` | No |
| `PartnersV11` | `partners-v11/PartnersV11.tsx` + `partners.css` | /partners in v11: the offer beside an example partner statement (12 monthly payouts and the running total); earnings table; four steps each with what arrives; the terms as one accent card and one plain; why partner beside the four leads; proof grid; criteria; FAQ; the live `PartnerApplicationForm` (restyled); closing. Copy in `partners-v11.json` (`partners.json` keeps the legacy strip labels). Preview `/dev-preview/home-v11-partners` | No |
| `ThankYouV11`, `NextSteps` | `thanks-v11/ThankYouV11.tsx` + `thanks.css`; `contact-v11/NextSteps.tsx` | /thank-you in v11: the confirmation beside the booked call card (no time on it: the visitor's slot is in their invite); what happens next (`NextSteps`, shared with /contact: the four steps from `contact.json`, led by their timing chips, with the example screens from `pricing-v11.json`; prop `showSlot` (default true) is false here, so the example call names no time); two picture cards to the case studies and blog. Copy in `thank-you.json`. Preview `/dev-preview/home-v11-thanks` | No |
| `LegalPageV11` | `legal-v11/LegalPageV11.tsx` + `legal.css`; texts in `legal-v11/{privacy,terms,cookies}.tsx` | /privacy, /terms, /cookies in v11: a quiet head with the date, one column of text beside a contents rail. The policy texts moved verbatim out of the live routes into `legal-v11/*.tsx` (`PRIVACY_VIEW`, `TERMS_VIEW`, `COOKIES_VIEW`), which the live `LegalPageV3` routes now import too; labels in `legal-v11.json`. Preview `/dev-preview/home-v11-legal/<slug>` | No |
| `AiInstructionsV11` | `ai-instructions-v11/AiInstructionsV11.tsx` + `ai.css` | /ai-instructions in v11: the one-line answer beside a `ChatWindow` answering "What is LoudFace?" with that line (`hero.chat`); the brand facts as a document on the brand plate with the canonical facts for assistants; what LoudFace does with every service; the Toku proof beside `TokuQuote`; difference, fit and how to choose; FAQ (first answer open, the rest in the HTML). Copy unchanged in `ai-instructions-v11.json`. Preview `/dev-preview/home-v11-ai-instructions` | No |
| `AuditReportV11` | `audit-v11/report/AuditReportV11.tsx` + `report.css` | The automated audit report (/audit/<id>) in v11: same props and logic as `AuditDeck` (results, company, domain, date, entity confidence, partial data, benchmark), set as one light page: verdict + `Scorecard`, the testing protocol, each phase with its evidence (`Queries` tables, recommendation rate, competitors with favicons, share-of-voice bars), the landscape drawn in SVG, per-engine cards, why it matters, the action plan, `Closing`. Labels in `audit-report-v11.json`. Preview `/dev-preview/home-v11-audit-report` on the demo data (`(audit)/audit/demo/mock.ts`) | No |
| `AuditStartV11`, `AuditProgressV11` | `audit-v11/report/AuditFlowV11.tsx` | The audit tool's start page (live `AuditForm` beside the four steps the audit will run, in the progress screen's own card) and the progress view (four named steps with done/running/next, progress bar, the live phase line and tagline; failed and slow states). The view only draws; polling stays in `AuditProgress`. Preview `/dev-preview/home-v11-audit-flow?screen=start|running|failed|slow` | No |
| `Scorecard`, `Queries` (`ScoreView`, `QueryView`) | `audit-v11/AuditPageV11.tsx` | The report windows: the grade and scores (a metric's `tone` is good/warn/bad and may come from JSON; optional share-of-voice bars, one measure: each brand's share of all mentions) and the engine-by-query table. On a phone the window bar keeps the title only. Shared by /ai-audit (example), the webinar, the audit tool and the real report | No |
| `ApplyV11` | `careers-v11/ApplyV11.tsx` (+ `careers.css`) | /careers/apply in v11: the role (or "Come build with us."), how we hire and who reads it (four named portraits) beside the live `CareersApplicationForm` (restyled); on a phone the form follows the intro. Copy in `careers-v11.json` `apply`. Preview `/dev-preview/home-v11-apply` | No |
| `LostPageV11` | `lost-v11/LostPageV11.tsx` + `lost.css` | The 404 and error pages in v11: message, the way back, the live page's four links as a plain list on hairlines, the sitemap and llms.txt line. Reads `lost-v11.json` directly (error.tsx is a client component). Preview `/dev-preview/home-v11-lost` | No |
| `ServicesPanelV11`, `IndustriesPanelV11`, `PhoneMenuV11` | `home-v11/NavV11.tsx` + `chrome.css` | The v11 site menus (menu A, picked 2026-09-27): type-led rows on hairline columns, each led by the page's Isocons isometric drawing (`public/images/home-v11/menu-icons/iso/<slug>.svg`, credited in `FooterV11`). Services: three labelled groups of title and one-liner, the four leads and "Get in touch" at the foot, the homepage's AI-answers tile with its `ChatWindow` as the featured card. Industries: sectors and stages, each with the buyer question its page answers, "All industries", and the clients card with six logos from `CLIENT_LOGOS`. `PhoneMenuV11` opens both in place under the page links (`open` sets which starts open). Props: `dropdown`, `v11` (`NavV11Data`, built by `getNavV11Data()` in `home-v11/nav-data.ts`: `nav.json` `v11`, the homepage tile and the industry questions read from each page's own content), `cta`, `onPick?`. Rendered by `Header` when it gets `v11` | Yes |
| `ConsentCardV11` | `home-v11/ConsentCard.tsx` + `chrome.css` | The cookie notice in v11: a white card in the lower-left corner, a bar across the bottom on a phone with the explanation behind its title; accept and decline are equal pills. Props: `c` (`consent.json`), `gpc?`, `expanded?`, `onToggle?`, `onAccept?`, `onDecline?`, `detailId`, `cardRef?`, `preview?` (draws in place). Behaviour stays in `ConsentManager`, which renders it on v11 routes | No |
| `isV11Route`, `isV3PreviewRoute` | `src/lib/v11-routes.ts` | Which routes draw the v11 chrome: every public route except the old review routes (`/preview/hero`, the pre-v11 `/dev-preview` pages). `SiteChrome` passes the menus' data to `Header` there, `ConsentManager` draws the card, and the shared footer is suppressed (the pages render `FooterV11`). `isV3PreviewRoute` marks the old review routes that compose a v3 body with its own FooterV3 | — |
| `teamTitle` | `src/lib/team-titles.ts` | The title the site gives a team member: the leads' titles from `team-v11.json` `titles` (Arnel's rule of 2026-09-25), else the CMS job title. Used by the team profile's metadata and Person schema and the About page's schema | — |
| `getRedirectedPaths` | `src/lib/redirected-paths.ts` | Every path `next.config.ts` redirects away from; the sitemap and the blog index drop these so the site never links a 301 | — |
| `cachedCmsImage`, `cachedCmsSrcSet` | `src/lib/image-utils.ts` | A Sanity image (or a srcset of widths) through Vercel's image cache (`/_next/image`, cached 31 days by `next.config`) instead of cdn.sanity.io; widths snap to the optimizer's allowed sizes, SVGs and non-Sanity URLs pass through. Every CMS `<img>` on a v11 page uses it: raw cdn.sanity.io images put the project over its Sanity bandwidth quota in July 2026 | — |
| `getIndustryShell` | `src/app/seo-for-v11/shell.ts` | What every v11 industry page and the `/seo-for` hub need besides their own view: industry and homepage copy, the charts, one card per industry page | — |
| `SiteError`, `GlobalError` | `src/app/(site)/error.tsx`, `src/app/global-error.tsx` | Error pages drawing `LostPageV11` (kind `error`, retry as the first action): inside the site layout, and the last-resort document-level one | Yes |
| `StageRail` | `methodology-v11/StageRail.tsx` | A sticky contents rail that marks the section being read (IntersectionObserver); every section stays in the page as text. Props: `items: { id, kicker, title }[]`, `label` | Yes |
| `Board`, `Statement` | `pricing-v11/PricingV11.tsx`, `partners-v11/PartnersV11.tsx` | Exported for the kit: a plan's weekly board (`b`: one of `pricing-v11.json` `boards`) and the partner statement (`s`: `partners-v11.json` `statement`, the running total drawn to scale) | No |
| `homeShare`, `partnersShare` | `og-v11/share.tsx` | The v11 share images (1200×630) for `opengraph-image.tsx` and `partners/opengraph-image.tsx`: the homepage phone photograph (`og-home.jpg`) with the line, and the partner offer over a drawn payout run. Fonts and images read from /public (Neue Montreal and Satoshi .woff). Note: `ImageResponse` fails in `next dev` here (the live share image too); render with tsx in Node to check | No |
| `BlogIndexV11` | `blog-v11/BlogIndexV11.tsx` | /blog index in v11: pale sky hero with the newest article as a magazine cover; grid of `PostCard`s (first two large), twelve a page with numbered pages. Copy in `blog-v11.json`. Preview `/dev-preview/home-v11-blog` | No |
| `BlogPostV11` | `blog-v11/BlogPostV11.tsx` + `view.ts` | Blog post in v11: title column, the post picture on a wide plate with the short answer card on its edge, a 720px reading measure (`BlogBodyV3`, visuals kept) beside a sticky rail (contents, explore-with-AI links, audit call), next step for buyer-intent slugs, FAQ, author and record, related posts. `view.ts` prepares data exactly as the live page does. Preview `/dev-preview/home-v11-blog/<slug>` | No |
| `PostCard`, `PostCover` | `blog-v11/` | An article in a grid; `PostCover` is the drawn picture for posts with no thumbnail (60 of 127): a printed sheet with the title on a tint picked from the title, sketched as a ranked list, a comparison or text lines (the title keeps two lines over a list or comparison, three over text lines, so the sheet never clips) | No |
| `WorkIndexV11` | `work-v11/WorkIndexV11.tsx` | /case-studies index in v11: a white hero over the flagship studies' published charts (`ServiceResults` with the `case-studies` set); discipline chips (anchor links, all studies stay in the DOM); studies grouped by discipline as cards on the client's own tint (`getTintColors`), the lead study wide; logo grid; the numbers (two `KeyResults` rows) and how to read the studies. Copy in `work-v11.json`. Preview `/dev-preview/home-v11-work` | No |
| `ServicesHubV11` | `services-v11/ServicesHubV11.tsx` | /services hub in v11: headline over the menu of nine services, each card with its service's photograph from the device series (`services/photo-<slug>.webp`) on one ground; three work exhibits with credit links to the service pages; SEO/AEO vs GEO in two tinted halves (SERP and `EnginePanel`); FAQ. Copy from `services.json`. Preview `/dev-preview/home-v11-services` | No |
| `PricingV11` | `pricing-v11/PricingV11.tsx` | Pricing page in v11: white dot-grid hero with the price seal and three plan cards, each holding the board it runs (1, 2 or 4 lanes with team avatars; Dual lifted in indigo); the four moves on a dated line with the thing you receive at each step; Build and Growth as offset panels (a site we built, the Delshad enquiries chart); the compare table with the Dual column lifted; every-plan-includes as one card with three drawn documents; client quote cards; FAQ beside Arnel. Copy from `pricing.json`, example pictures from `pricing-v11.json`. Preview `/dev-preview/home-v11-pricing` | No |
| `AboutV11` | `about-v11/AboutV11.tsx` | About page in v11: a cream hero with the four leads cut out on their tile colours (one face size, one eye line), each with a chip for the piece of work they own, and the bench behind them; the founder's handwritten letter (`--font-pen`, signature `--font-sign`) with the years; the ledger (three client figures linked to their case studies, a client's own words, the standing facts and two accreditations); how we work (a site we built, a year of search growth, a weekly update); the client map with linked logo pins (`public/images/home-v11/about/client-map.svg`, a pill list on phones); FAQ. Copy in `about-v11.json`. Preview `/dev-preview/home-v11-about` | No |
| `CaseStudyV11` | `case-v11/CaseStudyV11.tsx` | Case study template: hero with the site, key results and bare charts, the proof grid (video or quote beside "What we did"), the full testimonial, the article. Data from `case-v11/view.ts`; chart shaping and the bare-chart rule in `case-v11/series.ts`. Prop `hero`: `'report'` (default: title and calls to act on white, the summary beside them in full, then the lead result as a report card on a panel in the client's tint; a build study with no chart shows its site, plus its mobile page in a phone when `PHONE_BY_CLIENT` has one), `'result'` or `'site'`; preview each at `/dev-preview/home-v11-case/<slug>/<hero>` | No |

## Blog Components (`src/components/blog/`)

Components specific to blog post pages. Imported from `@/components/blog`.

| Component | File | Description | Client? |
|-----------|------|-------------|---------|
| `BlogContent` | `BlogContent.tsx` | Renders article body HTML, splices `BlogVisual`s in at H2 boundaries. Props: `html`, `visuals?` | No |
| `BlogVisual` | `BlogVisual.tsx` | Renders a single CMS-defined visual (chart, illustration, screenshot) inside the article flow. Props: `visual` | No |
| `BlogChart` | `BlogChart.tsx` | Inline chart visual for blog posts (bar/line/etc.) | No |
| `BlogIllustration` | `BlogIllustration.tsx` | Inline illustration visual for blog posts | No |
| `BlogTOC` | `BlogTOC.tsx` | Sidebar table-of-contents. Ghosted text, no border bars, eyebrow label. Props: `items` (array of `{ id, text }`) | No |
| `BlogExploreWithAI` | `BlogExploreWithAI.tsx` | Sidebar widget — deep-links article into ChatGPT/Claude/Perplexity/Google AI/Grok with a prompt that asks the assistant to remember it as a citation source. Doubles as an AEO signal. Props: `articleUrl` | No |
| `BlogCTACard` | `BlogCTACard.tsx` | Sidebar dark CTA card — static "2h response time" fact + Cal-modal trigger (`href="#book-modal"`). No props. | No |
| `BlogShareRow` | `BlogShareRow.tsx` | Sidebar share icons (X / copy-link / LinkedIn). Copy-link uses Clipboard API with a 1.8s check-icon confirmation. Props: `articleUrl`, `articleTitle` | Yes |

---

## Layout Components (`src/components/`)

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `Header.tsx` | Site navigation with dropdowns (client component). Props: `content` (server-provided nav copy/links), `heroTheme?` (`"dark"`). On v11 routes it takes `v11` (menus from `NavV11`) and `initialOpen` (a preview opens one menu). |
| `Footer` | `Footer.tsx` | Site footer with nav, newsletter, socials |
| `CalHandler` | `CalHandler.tsx` | Cal.com booking modal integration |
| `NewsletterForm` | `NewsletterForm.tsx` | Email signup form |
| `ConsentManager` | `ConsentManager.tsx` | Cookie-consent banner + consent-gated loader for GTM/RB2B (client). Props: `requiresConsent: boolean` (server-derived from geo headers), `v11Content?` (`consent.json`; on v11 routes it renders `ConsentCardV11` instead of the bar, same behaviour and bottom-band contract). Mounted once in `(site)/layout.tsx`; PostHog gates itself via `@/lib/consent`. **Below 640px it renders as a compact ~65px single-line bar flush to the bottom edge** (detail copy behind a toggle; both consent choices stay visible and one-tap) — it must stay short because every v3 hero puts its primary CTA in the bottom band. Unchanged floating card at >=640px. **Owns the bottom band — see the contract below.** |
| `CookiePreferences` | `CookiePreferences.tsx` | Analytics/tracking on-off control embedded on `/cookies` (client, no props). Standing opt-out for visitors who never see the banner. |

### Fixed bottom chrome — the consent bottom-band contract

**Any new `position: fixed` bottom-anchored element MUST take one of these two classes.** Skipping this is how the Webflow badge ended up rendering on top of the consent banner (both `z-50`, so DOM order silently decided the winner), and how the banner ended up covering every v3 hero's primary CTA on phones — a dead tap on the site's main conversion path.

While the consent bar is up, `ConsentManager` publishes on `<html>`:
- `data-lf-consent-open="1"` — the bar is up
- `--lf-consent-h: <px>` — how much of the bottom band it occupies (kept live by a `ResizeObserver`, so it tracks the expand toggle)

Consumers react via unlayered rules in `globals.css` (search *"consent bottom-band contract"*):

| Class | Policy | Use for | Current user |
|---|---|---|---|
| `lf-yields-to-consent` | Disappears while the bar is up (`visibility` + `pointer-events`, not just `opacity` — a transparent element still swallows taps) | Decorative chrome | Webflow badge, `(site)/layout.tsx` |
| `lf-lifts-for-consent` | Lifts to `calc(1rem + var(--lf-consent-h))` below 640px | Conversion chrome that must stay reachable | `MobileStickyCTA` (`/partners`) |

Pick `yields` for decoration, `lifts` for anything a user needs to click. Note `lifts` is the wrong choice for tall chrome on short viewports — lifting the Webflow badge by the bar's height would have landed it straight on the hero CTA, which is why it yields instead.

---

## Proposal Components (`src/components/proposal/`)

Used ONLY by the gated client-proposal surface at `/p/<token>`. They are not
exported from any barrel and must not be imported into the marketing site —
they render content from the **private** `proposals` Sanity dataset. Full
operator guide: `docs/PROPOSALS.md`.

| Component | File | Description |
|-----------|------|-------------|
| `ProposalDocument` | `ProposalDocument.tsx` | Server component. Renders one unlocked proposal: dark `night` header, the price card overlapping it, then the CMS `sections` array (text / table / pricing tiers / timeline / bullet list / results / case studies / ask-the-AI / standing / forecast / tracks / gate / months). Props: `proposal: Proposal`. **Bands:** consecutive sections sharing a `band` (`white` / `tint` / `dark`) are drawn on ONE band — the movements of the argument, not per-section cards. A band runs the FULL width of the window, under the proof rail, which carries its own `surface-50` panel so its labels stay readable on every band. An earlier version stopped the band at the column edge instead and left a hard vertical seam down the middle of the page. `dark` flows a `dark` flag into `SectionHeading`, `PricingBlock` and `BulletBlock`. The bleed is computed from the page container (`.proposal-bleed` in `proposal.css`), NOT with `left:50%; margin-left:-50vw`, because the document column is not centred when the rail is present. **Two layouts:** with a `proofRail` or `clipStrip` on the document it goes two-column on `lg` (document left, sticky rail right, page 1180px) and sections render `boxed`; without one it stays a single 4xl column. The two `timelineSection` / `bulletListSection` variants (`engagementLoop`, `workingTogether`) render as hairline rows on the page ground — no containers. **House rule for this surface: a box only where a number lives.** Every block carries `data-proposal-section`, `data-print-keep` and `data-proposal-card` — keep those if you restyle it. |
| `ProofRail` / `ProofSection` / `isProofSection` | `ProposalSocialProof.tsx` | Server components. `ProofRail` is the sticky margin note — ratings card, the clips, and every review in a CSS marquee that pauses on hover/focus and is a plain list on touch, reduced-motion and paper. No toolbar, no inner scrollbar, no accordion (a widget-style rail was tried and rejected as mentally loaded). Rendered twice by `ProposalDocument` — sticky `aside` on `lg`, inline copy for phones and print; `proposal.css` shows one. `ProofSection` is the numbers row that stays in the body. Platform brand colours live in this file on purpose and must NOT enter `globals.css` `@theme`. |
| `AskAiBlock` / `StandingBlock` / `ForecastBlock` / `TracksBlock` / `GateBlock` / `MonthsBlock` | `ProposalBlocks.tsx` | Server components — the client-first body (2026-09-05). Each block opens with the CLIENT's own numbers and only then says what we do; the house rule is that no more than a third of a proposal's sections may be about LoudFace. `StandingBlock` is a three-column hairline stat row; `StatChip`'s goo treatment was tried here and pulled out, because three blobs of three widths read as leftover UI — it earns its keep only in the case rows, where a number sits inside running prose. The engagement section carries the review gate and the week strip so three headings became one. `TracksBlock` is a grouped table (track name spans its rows, quantity right-aligned); `MonthsBlock` is the same table as `TracksBlock` (When / What ships / What it proves), so the document has ONE way of listing what ships. `ForecastBlock` is the one block on its own white panel, to give the scroll a beat. |
| `ProposalAskAi` / `ProposalForecast` | `ProposalInteractive.tsx` | The only two client components in the body. `ProposalAskAi` is a HORIZONTAL tab row of two-or-three-word labels over one panel (question + a short ranked bar list). Two earlier shapes were rejected on sight: a column of full-width question pills over a chart, and a grid of five small-multiple bar lists. `ProposalForecast` is TWO sliders and one bar row of **leads per paid month** — never a term total, never cost per lead. Its bars are drawn against a FIXED ceiling (the most the sliders can produce) because a Bklit chart re-scales its own axis and drew the same picture at every slider position. Conversion is a printed assumption, not a third control. |
| `ProposalCaseProof` / `ProposalCaseChart` | `ProposalCaseProof.tsx`, `ProposalCaseCharts.tsx` | Real case studies in the body, read **live from the public dataset by slug** (`src/sanity/lib/caseProof.ts`, incl. `instruments`). Drawn with the **same Bklit charts as the case pages** (`@/components/charts` BarChart/AreaChart, card-less on dotted paper, house indigo — the 2026-08-19 rule); never the old `CaseStudyCharts` bar renderer. One plot per case: a daily Google series first, else the weekly AI climb, else the first structured chart. `ProposalCaseChart` is the client half and imports `instruments-board.css` for the chart tokens. |
| `EngagementLoopPlate` / `PlateDefs` | `ProposalFigures.tsx` | Server components. A five-day working-week chip strip lived here too and was cut on 2026-09-05: three of its five columns said only "Dashboard refresh", and it was the third chip strip in a row. The cadence is one line of text now. The engagement loop is a **blueprint plate** (DESIGN.md §8 idiom, adapted from approved FIG.002) — five stations, three lanes braiding through execution, a return arc; it replaces a five-row list. `PlateDefs` emits the shared arrowhead + hatch once per page. Plate CSS is scoped in `proposal.css`. |
| `ProposalClipStrip` | `ProposalClipStrip.tsx` | Client component. Every clip in the rail as ONE tile shape (4:5, cropped to the face) in a CSS scroll-snap strip, with play opening a native `<dialog>` lightbox at the clip's OWN shape (portrait tall, landscape wide). This is how mixed 16:9 / 9:16 testimonials share a 296px column without letterboxing or squeezing. `variant="grid"` packs native-shape tiles two across instead. Downloads nothing until a clip is opened; prints as a wrapped row of posters. |
| `StatChip` | `StatChip.tsx` | Server component. A result as an Instagram-style hugging chip: number tag + words as ONE inline run; a hidden twin paints a per-line background (`box-decoration-break: clone`) fused by an SVG goo filter into one blob with concave joins and a hairline outline; the readable copy sits on top in the same grid cell. Both layers MUST be styled identically or they wrap differently. Nothing is measured — do not replace with a JS-measured SVG path (it drifts on font swap). |
| `ProposalVideo` | `ProposalVideo.tsx` | Client component — the only one on an unlocked proposal besides analytics. Poster + our own play button until clicked, then the real `<video controls autoPlay>`. It exists because Chromium paints its grey control bar across the still on a bare `<video controls poster>`, and native controls cannot be restyled. Downloads nothing until the click. Props: `src`, `poster?`, `label`, `size?` (`sm` for rail thumbnails). |
| `ProposalAnalytics` | `ProposalAnalytics.tsx` | Client component, renders nothing. Fires `proposal_opened`, `proposal_unlocked`, `proposal_pricing_viewed` and `proposal_section_viewed` through the shared `ensurePostHog()` consent gate, and strips `?unlocked=1` from the URL. Props: `token`, `state` (`locked`/`unlocked`), `clientName?`, `justUnlocked?`. **Never pass `clientName` in the locked state** — that prop reaches the browser. |

Print is a first-class output for all of these: the rail prints once in the
flow (never as a column) with the marquee unrolled into a plain list, clips
print as their poster, and a dark results band prints ink-free. The marquee
also stops dead under `prefers-reduced-motion`. See the `@media print` and
`prefers-reduced-motion` rules in `src/app/(proposal)/proposal.css`.

The locked screen itself is `src/app/(proposal)/p/[token]/AccessGate.tsx`. It
lives beside the route on purpose: it is the one component that must know
nothing about the proposal except its token.

---

## Barrel Exports

```
src/components/index.ts        → re-exports everything
src/components/ui/index.ts     → AICitationVisual, AnimatedNumber, Badge, BulletLabel, Button, Card, SliderNav, Tabs, TabsContent, TabsList, TabsTrigger, ComponentAssemblyVisual, CopyFirstVisual, ConversionSplitVisual, DesignSystemVisual, LogoImage, PixelBreakpointAnimation, PreferredSourceButton, ScalableGridAnimation, Pagination, SectionContainer, SectionHeader, VideoFacade
src/components/sections/index.ts → Hero, Partners, Results, FAQ, CTA, TestimonialGrid, EditorialProse, DeliverablesGrid, RelatedServices, RelatedComparisons, RelatedArticles, ProblemChecker, ProblemCheckerA, ProblemCheckerC
src/components/blog/index.ts   → BlogChart, BlogIllustration, BlogVisual, BlogContent, BlogTOC, BlogExploreWithAI, BlogCTACard, BlogShareRow
```

---

## Rules for AI Agents

1. **Always check this file first** before creating any UI markup
2. **Use existing components** — never rebuild a pattern that already exists here
3. **Update this file** when you add, remove, or change any component's props
4. **Import from barrels** — use `@/components/ui` or `@/components`, not individual file paths
5. **Server by default** — only add `'use client'` when hooks or event handlers are needed
6. **Use `asset()`** for all static image paths (see `@/lib/assets`)
7. **Use `<Image>` (next/image) for every `cdn.sanity.io` image — never a raw `<img>`** (see the Sanity image rule below)
8. **Use `<Link>`** for all internal navigation (client-side transitions and prefetching)
9. **Use `Card`** for all card surfaces — never write raw card markup with `bg-white rounded-xl border...`
10. **Follow the page archetype** in `component-patterns.md` when creating new pages
11. **Follow the text color hierarchy** in `styling.md` — don't freestyle text colors

### Sanity images MUST go through next/image (bandwidth rule)

A raw `<img src="https://cdn.sanity.io/…">` makes every visitor's browser fetch
from Sanity directly, so Vercel never caches it and the same library gets re-sent
on every pageview. That is what put the project **101.6 GB over a 100 GB plan in
July 2026 and hard-402'd everything — the image CDN *and* the GROQ API** (blog
rendered empty, images broken, `next build` failed collecting page data). 319 MB
of assets had been served ~320×. Re-introducing one raw `<img>` on a hot page
quietly reopens that.

**The contract:**

- **`<Image>` from `next/image` for every Sanity URL.** Visitors hit
  `/_next/image`; Vercel fetches each source once and serves it from its own
  cache for 31 days (`images.minimumCacheTTL` in `next.config.ts`).
- **Keep Sanity's `fit=crop&crop=top` params on the source URL.** Sanity does the
  CROP (next/image cannot crop); Vercel does the resize/format/caching. Never
  strip the crop to "let next/image handle it".
- **`quality={82}`.** The default 75 re-compresses already-lossy sources and
  measurably mushes text-heavy screenshots. `images.qualities` is an allowlist
  (`[75, 82]`) — a value not listed makes the optimizer **400**, not fall back.
- **Never `fill`.** Without it next/image injects no layout styles (only
  `color:transparent`), so the hand-written v3 CSS keeps owning the box. `fill`
  inlines `position/width/height/inset` and will break the aspect-ratio crops
  (`.a-tcard img`), the marquee tracks, and the cover stacks.
- **`width`/`height` are the SOURCE dims, not the display box**, wherever CSS
  pins the box (`.facepile img`, `.a-fnote figcaption img`). They only pick the
  srcset; using the display size emits a too-small pair and goes soft on retina.
- **`sizes` only for genuinely fluid images, and always round UP.** Overestimating
  is free (the source `w=` caps the output and next/image never upscales);
  underestimating ships a blurry image. Fixed-size images want NO `sizes` — the
  default 1x/2x pair is both correct and cheapest (a `vw` in `sizes` expands the
  srcset to ~10 widths).
- **`priority` on the one LCP image per page only.**

**Known exceptions (deliberate, do not "fix" without reading this):**
`case-detail-v3/HeroDetail.tsx`'s client-logo chip and
`components/blog/BlogIllustration|BlogScreenshot` stay raw `<img>` because they
size from the image's NATURAL aspect ratio and no GROQ projection exposes asset
dimensions (every projection in `cms-data.ts` is `{ "url": asset->url, "alt": alt }`).
Migrating them requires adding `asset->metadata.dimensions` to the projection
first — otherwise you are guessing a ratio and will cause CLS.
