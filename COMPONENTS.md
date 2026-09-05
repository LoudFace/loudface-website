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
| `Header` | `Header.tsx` | Site navigation with dropdowns (client component). Props: `content` (server-provided nav copy/links), `heroTheme?` (`"dark"`) |
| `Footer` | `Footer.tsx` | Site footer with nav, newsletter, socials |
| `CalHandler` | `CalHandler.tsx` | Cal.com booking modal integration |
| `NewsletterForm` | `NewsletterForm.tsx` | Email signup form |
| `ConsentManager` | `ConsentManager.tsx` | Cookie-consent banner + consent-gated loader for GTM/RB2B (client). Props: `requiresConsent: boolean` (server-derived from geo headers). Mounted once in `(site)/layout.tsx`; PostHog gates itself via `@/lib/consent`. **Below 640px it renders as a compact ~65px single-line bar flush to the bottom edge** (detail copy behind a toggle; both consent choices stay visible and one-tap) — it must stay short because every v3 hero puts its primary CTA in the bottom band. Unchanged floating card at >=640px. **Owns the bottom band — see the contract below.** |
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
| `ProposalDocument` | `ProposalDocument.tsx` | Server component. Renders one unlocked proposal: dark `night` header, the price card overlapping it, then the CMS `sections` array (text / table / pricing tiers / timeline / bullet list / results / case studies / ask-the-AI / standing / forecast / tracks / gate / months). Props: `proposal: Proposal`. **Two layouts:** with a `proofRail` or `clipStrip` on the document it goes two-column on `lg` (document left, sticky rail right, page 1180px) and sections render `boxed`; without one it stays a single 4xl column. The two `timelineSection` / `bulletListSection` variants (`engagementLoop`, `workingTogether`) render as hairline rows on the page ground — no containers. **House rule for this surface: a box only where a number lives.** Every block carries `data-proposal-section`, `data-print-keep` and `data-proposal-card` — keep those if you restyle it. |
| `ProofRail` / `ProofSection` / `isProofSection` | `ProposalSocialProof.tsx` | Server components. `ProofRail` is the sticky margin note — ratings card, the clips stacked at 16:9, and every review in a CSS marquee that pauses on hover/focus and is a plain list on touch, reduced-motion and paper. No toolbar, no inner scrollbar, no accordion (a widget-style rail was tried and rejected as mentally loaded). Rendered twice by `ProposalDocument` — sticky `aside` on `lg`, inline copy for phones and print; `proposal.css` shows one. `ProofSection` is the numbers row that stays in the body. Platform brand colours live in this file on purpose and must NOT enter `globals.css` `@theme`. |
| `AskAiBlock` / `StandingBlock` / `ForecastBlock` / `TracksBlock` / `GateBlock` / `MonthsBlock` | `ProposalBlocks.tsx` | Server components — the client-first body (2026-09-05). Each block opens with the CLIENT's own numbers and only then says what we do; the house rule is that no more than a third of a proposal's sections may be about LoudFace. `StandingBlock` reuses `StatChip` for three numbers and one sentence. The engagement section carries the review gate and the week strip so three headings became one. `TracksBlock` and `MonthsBlock` keep their supporting facts to one line each: a long list here was rejected as cognitive load. |
| `ProposalAskAi` / `ProposalForecast` | `ProposalInteractive.tsx` | The only two client components in the body. `ProposalAskAi` is a HORIZONTAL tab row of two-or-three-word labels over one panel (question + a short ranked bar list). Two earlier shapes were rejected on sight: a column of full-width question pills over a chart, and a grid of five small-multiple bar lists. `ProposalForecast` is TWO sliders and one bar row of **leads per paid month** — never a term total, never cost per lead. Its bars are drawn against a FIXED ceiling (the most the sliders can produce) because a Bklit chart re-scales its own axis and drew the same picture at every slider position. Conversion is a printed assumption, not a third control. |
| `ProposalCaseProof` / `ProposalCaseChart` | `ProposalCaseProof.tsx`, `ProposalCaseCharts.tsx` | Real case studies in the body, read **live from the public dataset by slug** (`src/sanity/lib/caseProof.ts`, incl. `instruments`). Drawn with the **same Bklit charts as the case pages** (`@/components/charts` BarChart/AreaChart, card-less on dotted paper, house indigo — the 2026-08-19 rule); never the old `CaseStudyCharts` bar renderer. One plot per case: a daily Google series first, else the weekly AI climb, else the first structured chart. `ProposalCaseChart` is the client half and imports `instruments-board.css` for the chart tokens. |
| `EngagementLoopPlate` / `WorkingWeek` / `PlateDefs` | `ProposalFigures.tsx` | Server components. The engagement loop is a **blueprint plate** (DESIGN.md §8 idiom, adapted from approved FIG.002) — five stations, three lanes braiding through execution, a return arc; it replaces a five-row list. The working week is a **calendar strip** in DOM, not a plate (a plate for a cadence was tried and rejected on sight). `PlateDefs` emits the shared arrowhead + hatch once per page. Plate CSS is scoped in `proposal.css`. |
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
