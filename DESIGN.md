# Design System — LoudFace (v11)

**The one written authority for how loudface.co looks.** Arnel approved v11 on 2026-09-24 on the homepage
(`/dev-preview/home-v11`, source `src/app/home-v11/*`, stylesheet `home-v11.css` scoped under `.v11`); every page
migrates to it. The homepage is the reference build: when this file and the homepage disagree, the homepage wins
and this file is corrected.

**Where each thing lives (one home each, never restated elsewhere):**

| What | Home |
|---|---|
| How the site looks and why (this spec) | `DESIGN.md` |
| Token values | `src/app/home-v11/home-v11.css` (`.v11`), mirrored as Paper tokens in "LoudFace Website · v11" for handoff; §3 lists them |
| The parts, drawn | Paper file "LoudFace Website · v11", page "Design system · v11" (the component board; "The look" board stays in the earlier file "LoudFace Website") |
| The parts, as code (props, files) | `COMPONENTS.md` |
| Picks and rejections, dated | `.claude/design/taste-rulebook.md` (a log; rules graduate into this file) |
| Misses and root causes | `AGENTS.md` banner ledger |
| Legacy Tailwind components (pre-v11 pages) | `.claude/rules/styling.md`; v3 history in `docs/archive/design-legacy-v3.md` |

## 1. What it is
A service firm's site, not a SaaS product page: senior people, judgement and results carry every section. It must
never read as "we sell software", as a cheap freelancer shop, or as playful. The register is **editorial and
creative**: pictures that explain (our deliverables as readable UI, real charts, real people, photographs of
shipped work), used at size, on calm grounds.
Copy is plain and factual, in the customer's words; exact labels ("Book a strategy call"); real, messy numbers,
never invented or rounded-up ones.

## 2. The look (read this before designing any page)
Taken from the homepage, then corrected on 2026-09-25 by a direct comparison: pricing v1 (3% photographs, readable
plan boards, one indigo featured card) beat pricing v2 (30% photographs of devices on desks, built to an earlier
version of this section). v1's pictures explained the offer; v2's decorated it. **What a picture explains matters;
how much of the page it covers does not.**

**2.1 Every picture explains its section.** The test: a visitor who looks only at the picture gets the section's
point (what this plan runs, what you receive at this step, what moved for this client). A picture that would fit any
page is decoration and fails, however polished. Reach for these, in this order:
- **Our own deliverables as readable UI**: the weekly board, the Scoreboard, the proposal, the Monthly Memo, the
  kickoff message, an AI answer (`ChatWindow`), at a size where every word reads (text ≥ 12px at 1440). This is how a
  page shows how we work; the homepage does it with the plan letter, the answer window and the route cards.
- **Real charts** from published data (`ResultCase`, `StageChart`, `ChartPanel`, `KeyResults`) wherever a section
  claims a result: a feature chart at size plus a few small multiples, hatch fill, start pin, sources named.
- **Real people**: client video stills, team portraits (`Team`), cutouts only where a page's hero needs them.
- **The photography series**: a real device showing a **real client site or our real UI**, on one saturated seamless
  paper backdrop (electric indigo, lilac, coral, butter), pale oak desk, soft daylight from the left, fine grain
  (`hero-phone*.jpg`, `bento-*.jpg`; made with `design-directions/scripts/gen_image.py` and `screen.py`). Use it
  where the screen on the device is the point: proof of shipped work, a hero's atmosphere. Never as filler; a page of
  devices on desks reads as stock photography.
- **Drawn things, only these:** the route map (one line drawing, full bleed) and documents on the brand plate
  (plans, reports, letters).

**2.2 One idea per section, few and large elements.** A homepage section is a heading, one lede, and one
composition: four photo tiles; one chart set; one map; one document; three client videos; four portraits. Elements
are large (tiles 636×440, portraits 306×372, video stills 392×250). A section never holds a row of shrunken copies
of other things.

**2.3 Colour is saturated and rare, grounds are calm.** Grounds alternate white and `--warm` (#f6f6f6), nothing else.
Saturated colour appears in few places: the one electric-indigo hero stage, inside photographs (their backdrops),
the brand gradient plate that holds a document, and **one accent card per section** where hierarchy needs it (the
featured plan, the current step). A pale single-hue tint may sit behind a UI picture to lift it off the page
(pricing v1's plan boards; the services hub's "Two kinds of AI visibility" cards, which Arnel picked on
2026-09-25); a tint is never the picture itself, and never a rainbow of tinted cards.

**2.4 Type does the hierarchy.** Neue Montreal 500 with tight negative tracking for display; Satoshi for everything
else. H1 84px, H2 52px (the second half in `.ghost`), tile headings 26px, lede 18px, body 16–17px, labels 14px.
Text inside a picture is the picture's own (a real screen); text we set is ≥ 14px except captions and axis labels.
Buttons are pills (999px), ink or white, 50px tall. Two fonts only; Caveat only for a strategist's handwriting on
a document.

**2.5 Structure is hairlines, not boxes.** Results sit in crosshair cells (hairlines with 1px `--mark` crosses),
logos in the same grid, lists on hairline rows. Cards exist where the reference uses them (bento tiles, quote cards,
plan cards, the booking card), with 24px radii and no border-plus-shadow stacking.

**2.6 Banned.** Decoration in place of explanation: a device photograph whose screen is not the section's point,
the same photo grammar repeated section after section, a picture borrowed from another page. UI too small to read
(text under 12px at 1440) or UI of something we do not deliver. Props and gimmicks: receipts with torn edges, tilted
or paper-clipped sheets, polaroids, dot-grid paper. Status pills and tag rows on every card. The long-standing bans:
gradient text, glow or halo, side-stripe borders, numbered 01/02/03 markers, monospace labels, italic accent words,
Inter/Roboto, clay 3D icons, founder portrait as hero, invented metrics.

**2.7 Checks for every page** (desktop, sections between header and closing):

| Check | How |
|---|---|
| Every picture explains its section | For each section, write what a visitor learns from its picture alone. "It looks good" is not an answer. Reading sections (article bodies, FAQs, comparison tables) are exempt. |
| Tinted grounds each sit behind a picture (§2.3) | `node scripts/design/measure-look.mjs <route>` (dev server up) counts them; above 3, check each one |
| Picture share | the same script reports it as a diagnostic, never a pass mark: pricing v1 measured 3% with 5 tints and beat v2 at 30% with none |
| One composition per section | by eye |
| If the page replaces an earlier design | set both side by side; the new one must win on explanation, not on compliance with this file |

## 3. Tokens (code: `.v11` in `home-v11.css`)
| Token | Value | Role |
|---|---|---|
| `--ink` | `#1a1040` | headings, primary text |
| `--body` / `--muted` / `--quiet` | `#4a4466` / `#6b6788` / `#6f6c88` | body, captions, quiet labels (quiet passes AA on white and `--warm`) |
| `.ghost` | `#8a86a6` (3:1 on white and `--warm`; the Paper token matches since 2026-09-26) | second half of a heading |
| `--ind` | `#4f46e5` | the one accent: links, active states, fills, eyebrow dot |
| `--stage` | `#3d38cf` | the hero stage |
| `--warm` | `#f6f6f6` | the grey ground (never cream or yellow) |
| `--line` | `#e4e4ea` | every divider and border |
| `--mark` | `rgba(26,16,64,.32)` | 1px crosshair marks at grid intersections |
| `--ease` / `--fast` / `--dur` / `--slow` | `cubic-bezier(.2,.7,.2,1)` / .15s / .2s / .5s | all motion |
Section padding 120px top, 124px bottom; content width 1296px; tile radius 24px, card 16–22px, UI 14px.

## 4. Page rhythm
- Sections alternate white and `--warm`, never two of the same in a row; the footer is `--warm`.
- **One electric stage per site: the homepage hero** (indigo field and photograph). Other page types open light,
  but their hero still carries a §2.1 picture that explains the page (pricing: the plans with their weekly boards; a
  service: the work on a device; a case study: the result), never a gadget, and never another page's hero picture. Check: set the hero beside the heroes already designed; if it
  could be mistaken for one of them, it fails. A light hero sets `data-hero="light"` (header text turns ink).
- The brand gradient plate (peach `#fcd68a`/`#f59a7b` → lavender `#c9bdf5` → indigo `#4f46e5`, 28px radius) holds a
  document or product UI; one or two per page.
- Colour runs full width; images and plates cap at 1296px. Three layouts: phone < 768, tablet 768–1279, desktop ≥ 1280.

## 5. Section patterns (reference files in `src/app/home-v11/`)
- **Section head** (`SectionHead`): eyebrow with dot, H2 left, one paragraph right. Headings balance; no orphans.
- **Photo tiles** (`Bento`): a photograph ground with the device in it, the heading and one number on the photo's
  empty side; copy on a mid-tone photo gets a tint of the tile's own colour behind it (≥ 7:1).
- **Results** (`Results`, `ResultCase`): one big figure and a feature chart, then small multiples, in crosshair cells.
- **Route** (`Route`): the map drawing full bleed with real UI cards at size along one path.
- **Documents, not dashboards** (`GrowthPlan`, `PlanTabs`): plans, notes and reports as paper sheets on the plate,
  signed by a named person. No sidebars, tabs-in-app, status pills or Gantt chrome.
- **Voices** (`Testimonials`): client video stills and quote cards with the client's number.
- **People** (`Team`): a few named seniors shown as a sample of a larger team; never a headcount, never role chips
  boxing one person into one job (the operator model: everyone runs the whole account).
- **Closing** (`Closing`): the real Cal.com embed beside the agenda (or, with `lede`, one paragraph about the page's
  own subject in its place); no second CTA button.
- Auto-advancing tabs and the endless rail: behaviour in their components (`PlanTabs`, `HeroSlider`).

## 6. Motion
Entrance: fade up 16px, staggered 70ms, below the first screen only (`Reveal`). Hover: colour, 1–2px lift, arrow
nudge. No parallax, no scroll-jacking. Everything off under `prefers-reduced-motion` and inside `.lf-editing`.

## 7. Component library
The homepage's parts are the library; `COMPONENTS.md` has files and props, the Paper page "Design system · v11"
draws them (rendered from `/dev-preview/home-v11-kit`; re-import when a part changes). A new part is built at
homepage quality and joins the library **before** a page uses it. Two copies of the same idea are a defect.

| Part | Use |
|---|---|
| `SectionHead` / `SectionHeadNode` | every section head |
| `ResultCase`, `StageChart`, `ChartPanel`, `KeyResults`, `BeforeAfterChart`, `LiveChart` | every chart and result figure; `LiveChart` only through the others. A bare chart must read the way its claim does (`trendHolds` in `case-v11/series.ts`); a peaked series shows its published figures in `BeforeAfterChart`. |
| `QuoteCard`, video card (`Testimonials.tsx`) | client voice |
| `ChatWindow` (`Bento.tsx`) | any AI answer shown on a page; no drawn look-alikes |
| `LogoGrid` | client logos with the count |
| Photo tile (`Bento`) | a service or capability with its photograph |
| Brand plate + sheet (`.v11-svc-plate`, `.v11-sheet`) | a written document |
| Photographed stage + sheet (`.sv-stage`, `stage-<colour>.webp`) | a service page's plan: the hero photograph's own backdrop and desk, empty, with the sheet on it |
| Proof grid cells (`service-v11/kit.tsx`, `.cro-grid`) | a service page's results, approved on the CRO board 2026-09-24 |
| Inner-page article parts (`case-v11/case.css`) | contents rail, booking card, full testimonial |
| Plan board (`pricing-v11/PricingV11.tsx`, `Board`) | a plan's weekly work, one lane per initiative, the people who run each lane; chosen over a photographed version on 2026-09-25 |
| `PostCover` (`blog-v11/`) | a post with no thumbnail: a drawn sheet on a tint picked from its title. Kept by Arnel on 2026-09-25 ("I liked the previous blog design more") over a summary-on-grey version |
| Service program tiles (`.sv-tile`, `service-v11/pages/*`), tinted service hero panel (`TONE`) | a service's deliverables, each tile with the work it produces; restored 2026-09-25 after the photo-first rebuild lost to them |
| Site menus (`NavV11.tsx`: `ServicesPanelV11`, `IndustriesPanelV11`, `PhoneMenuV11`) and the cookie card (`ConsentCardV11`) | the header's menus: grouped rows, the people at the foot, one card whose picture explains the menu; the consent card with two equal pills. v11 routes only until go-live (`src/lib/v11-routes.ts`) |
| Report windows (`Scorecard`, `Queries` in `audit-v11/AuditPageV11.tsx`) | the audit's own report at true size: a page about the audit shows what the audit returns. A miss is the strong mark |
| Readings as charts (`EngineSlope`, `Funnel` in `methodology-v11/MethodologyV11.tsx`; `TileChart`) | two readings per series as a slope; one sample through steps as a funnel with the lost part hatched |
| Working documents (`MeasureSheet`, partner `Statement`, plan `Board`) | a spreadsheet, a statement or a board drawn as the thing itself, on the plate when it is the section's one document |
| `NextSteps` (`contact-v11/NextSteps.tsx`), `IndustryVoices`, `RelatedIndustries`, `ServiceResults`, `PostCard` | what happens after booking; a page's client voices; cards to other pages carrying that page's picture; a page's results set; an article card |

## 8. Hard rules
- Every section carries one picture that passes §2.1's test (our deliverable as readable UI, a real chart, real
  people, a document, the route drawing, or a series photograph whose screen is the point); reading sections are exempt.
- Copy lives in JSON (`src/data/content/*.json`), keyed for the inline editor; no transforms in components. A
  redesign keeps the page's existing copy unless Arnel asks.
- Logos in real brand colours at matched optical size. Proof numbers are real and sourced; example documents say
  "example" or "Your company".
- AI is shown as capacity our people direct, never as the product.
- Inner pages share the homepage's look, not its sections: only the header, logo strip, closing and footer are
  reused whole. A page carries homepage-level real proof: a live chart on client data, a client voice, and true-size
  product UI or a document in most sections.
- The live page is the floor: set each new section beside the live section it replaces; sparser fails.
- Page type before design: a service URL whose body is an article is flagged, not designed as a service.

## 9. Check before presenting any page (the gate)
1. Harvest Mobbin for the page, then **filter every tile through §2**: a tile whose pictures decorate rather than
   explain, or that needs props, is out, however good it looks on its own site.
2. Build each section beside the homepage section it is closest to (screenshots side by side at 1440). Fix every
   difference in element count, picture size, type size and colour intensity.
3. Write the §2.7 picture test for every section and run `measure-look.mjs` for the tinted-ground count. If the page
   replaces an earlier design, compare old and new side by side before anything else.
4. Run an independent `design-reviewer` pass against this file and the homepage; fix what it finds.
5. Import to Paper and screenshot every section of the board itself.
Only then show Arnel.
