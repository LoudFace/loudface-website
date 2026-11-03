# LoudFace /research — round 3, direction G (3 Nov 2026)

Arnel on round 2: "I align most with D Night lab and F Indigo stage, but I really love color palettes, the E version,
because I love the use of colors and everything. Let's just save that and bring it along."
Logged in `.claude/design/taste-rulebook.md` (2026-11-03, round 2 pick).

**G = D's authority + F's stage + E's colours.** One direction, a hub and a paper, 1440 and 390.

## The series colour system (from E, kept verbatim)
| Series | Ground | Ink on ground | Chart on ground |
|---|---|---|---|
| AI Visibility Index | indigo `#3d38cf` | white | white bars, lavender `#c9bdf5` secondary |
| State of B2B SaaS | coral `#ec6c48` | ink `#1a1040` or white (pick by contrast, check it) | ink/white |
| AI search behaviour | green `#0f5a46` | white | white, mint secondary |
| Measurement and Search | butter `#e2ad3c` | ink `#1a1040` | ink bars |
Colour is how a reader tells the series apart, everywhere: the series index, every paper card, every paper hero,
every figure panel's accent. Define these once in `shared/series.css` as `--s-index`, `--s-saas`, `--s-ai`, `--s-meas`
(+ their ink tokens) and use them in both pages. Never pastel washes; full-strength colour only.

## Ground rules
- Night `#0b0a2e` (D) is the section's base ground. Electric indigo stage (F, homepage hero, `#3d38cf`/`#4f46e5`)
  opens the hub. White appears only as a reading surface in a figure card or the calendar, never as a page band.
- Charts only from `shared/charts-v2.js` (`data-chart2`, grounds `stage|light|colour`, tones). Data from `shared/research.js`.
- Kept from D: square hairline cards, lit charts, the researchers row, reading on night, method as a dark sheet.
- Kept from F: the indigo stage hero with a strip of white charts in crosshair cells; the ink band of very large numbers.
- Kept from E: the colours above, giant number + chart drawn on the colour, the four-colour series strip.
- Out: E's full-bleed colour band per series as the hub's whole structure (logged rejection). Monospace, numbered
  01/02/03 labels, italic accent words, gradient text, glow, pill tags on every card, rounded progress bars.

## Hub (G-hub.html)
| Section | Picture | From |
|---|---|---|
| header + stage: "Research", lede, counts; strip of 4 newest papers' white charts in crosshair cells | 4 charts on stage | F stage |
| series strip: four full-strength colour tiles (name, one line, paper count, latest date), each with its strongest number | colour tiles | E masthead strip |
| featured paper: the benchmark on its series colour (green), giant 50.7% + lead chart drawn on the colour, byline | chart on colour | E band + D featured |
| latest findings: ink/night band, one very large number per paper, each number's small colour mark = its series | big numbers | F latest findings |
| all papers: night grid of square hairline cards, cover = the chart drawn on its series colour, title states finding; series filter row | 12 charts on colour | D papers + E colours |
| researchers (real photos), closing, footer | portraits | D |

## Paper (G-paper.html) — the benchmark, series = AI search behaviour (green)
| Section | Picture | From |
|---|---|---|
| header + hero on the series colour: finding as H1, byline, download/cite, lead figure at full width drawn on the colour | chart on green | E hero + F stage layout |
| key numbers in crosshair cells on night | big numbers | D |
| takeaways + contents rail, reading column on night | — (text) | D |
| Figures 2–4 on night panels with a series-colour figure label and accent series | 3 BENCH charts | D figures |
| one full-bleed series-colour figure band (Figure 3 or 4) breaking the column | chart on green | E figure band |
| method as a dark measurement sheet; limitations, versions, data, cite | sheet | D/F |
| more research: 3 cards, each on its own series colour | 3 charts on colour | E more research |
| closing, footer | | |

## Build checks
- [x] G hub  - [x] G paper  - [x] phones fit (no sideways scroll inside figures at 390)
