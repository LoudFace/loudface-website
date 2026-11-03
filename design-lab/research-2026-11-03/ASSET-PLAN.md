# LoudFace /research — asset plan (3 Nov 2026)

Arnel asked for a research section distinct from the blog, studied against Graphite (graphite.io/research), and
waived the harvest gate ("Go for your picks, or do it all"). Three directions, each a **hub** and a **paper** page,
1440 desktop and 390 phone. Tiles are named `<group>-<letter>` from
`design-lab/harvest/2026-11-03-research/mobbin/contact-sheets.pdf`.

**Shared (never redefine):** `shared/base.css` (v11 tokens, fonts, header, footer, closing, crosshair cells),
`shared/research.js` (`STUDIES`: the 12 published studies with real numbers; `BENCH`: the benchmark's tables;
`<div data-chart="<id>" data-size="sm|md">` draws a study's chart). People: `shared/img/*` (real team photos and
avatars). Every paper is bylined **Arnel Bukva, Founder and Head of Growth** (the live byline). Do not invent
co-authors, credentials, numbers, download counts or press logos.

**The paper page in every direction is the benchmark** ("Company websites win half of all AI citations",
1 June 2026, 160,240 citations, 23,545 conversations, 5 projects, 3 engines; tables in `BENCH`), so the three
paper pages compare like for like.

**Out (DESIGN.md §2.6 and the model's defaults):** dark research stage, monospace labels, numbered 01/02/03
section labels (a paper's own "Figure 2" is fine), italic accent words, cream page, gradient text, glow,
side-stripe borders, status pills or tag rows on every card, tilted or paper-clipped sheets, decorative device
photos. Grounds alternate white and `--warm`; one saturated accent per section; buttons are pills (house rule).

## A · Findings wall (tiles 01-A, 01-B, 01-D, 03-A, 03-B)
Light v11. Every paper's cover is its own lead chart; the title states the finding.

| Page | Section | Picture (non-DOM asset) | Tile | Ground |
|---|---|---|---|---|
| hub | Hero: "Research." + lede; beside it the newest finding as a large card | `agree` chart, md | 01-B (Epoch featured) | white |
| hub | The wall: 12 cards, 3 columns, date + kind, finding as title, chart as cover; series filter above | 12 real charts, sm | 01-A, 01-B | warm |
| hub | How a paper is made: data → checks → publish → re-run | drawn method flow (SVG) | 08-A | white |
| hub | Who writes them: byline people | real portraits | — | warm |
| hub | Closing (Cal) + footer | closing terrain photo | homepage | stage |
| paper | Hero: kind + date, finding as H1, byline, lead chart full width with source | `bench` chart, lg | 01-D | white |
| paper | Key numbers in crosshair cells + key takeaways | crosshair cells, figures | homepage results | white |
| paper | Reading column + contents rail; findings with Figures 2–4 (domains table with bars, engine mix small multiples, citation vs retrieval slope) | 3 real figures from BENCH | 03-A, 03-B | white |
| paper | Method as a measurement sheet; limitations; versions; download data; cite this | MeasureSheet-style document | 03-B | warm |
| paper | More papers: 3 chart cards | 3 real charts | 01-A | white |

## B · Journal archive (tiles 02-A, 02-B, 02-C, 03-A, 03-C)
Editorial, calm, white. Reads as a publication: dates, researchers, abstracts, figures.

| Page | Section | Picture | Tile | Ground |
|---|---|---|---|---|
| hub | Masthead: "LoudFace Research", what we publish, counts measured from the data (12 papers, 160,240 citations in the largest) | the featured paper's figure | 02-B (Circuits) | white |
| hub | Featured paper: large figure left, abstract right | `bench` chart, md | 02-A | warm |
| hub | Archive by month: date column, title + byline + abstract, figure thumb right | 11 charts, sm | 02-A, 02-B, 02-C | white |
| hub | Series index: AI Visibility Index, State of B2B SaaS, AI search behaviour, Measurement — counts | small chart per series | — | warm |
| paper | Title, abstract, byline, published/updated/data rows (Distill header) | — (byline photo) | 02-A, 03-C | white |
| paper | Body with figures breaking wider than the column and margin notes | BENCH figures | 03-A | white |
| paper | Appendix: method, limitations, versions, "Cite this paper" block with the citation text | citation block | 02-A | warm |

## C · Flagship report (tiles 04-A, 04-B, 04-C, 07-A, 07-B)
Documents on the brand plate (DESIGN.md §4): the research as reports and indexes people keep.

| Page | Section | Picture | Tile | Ground |
|---|---|---|---|---|
| hub | Hero: the benchmark as a report cover on the plate, cover chart on the sheet | document on plate | 04-A (State of AI) | white |
| hub | The AI Visibility Index series: 4 index covers (Fintech, HR Tech, Cybersecurity, DevTools), each with its #1 and ranking | 4 document covers with real charts | 04-B, 07-A | warm |
| hub | Studies: giant figure + finding sentence in crosshair cells | figures + sm charts | homepage KeyResults | white |
| hub | The method we hold every paper to (drawn flow) | drawn flow | 08-B | warm |
| paper | Cover on the plate, then the executive summary sheet | document on plate | 04-A, 04-D | white |
| paper | Chapters: each finding as a spread — giant number, one sentence, the figure at size | BENCH figures | 04-E | alternating |
| paper | Ranking table of cited domains (leaderboard) | table with bars | 07-A, 07-B | white |
| paper | Method, limitations, download the data, cite | measurement sheet | 03-B | warm |

## Build checks (tick per section when screenshotted at native size and compared with its tile)
- [x] A hub  - [x] A paper  - [x] B hub  - [x] B paper  - [x] C hub  - [x] C paper
