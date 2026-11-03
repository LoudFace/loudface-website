# Homepage research section — asset plan (3 Nov 2026)

Arnel: "add a section somewhere on our homepage about our research papers. Please use Mobbin MCP and your design
skills to design something really nice." /research went live today in direction G (night ground, one full-strength
colour per series, the chart kit). This is ONE new homepage section, three options, picked in Paper.

**Placement:** right after Results ("Measured in leads, not traffic", white) and before Route ("A call, a plan, then
work every month", warm). Client results first, then the studies that prove the method. Every option shows the
section between the real neighbours so the ground change reads in context.

**Harvest:** `design-lab/harvest/2026-11-03-research-home/` (6 groups × 14 Mobbin web screens, contact sheets
`sheet-A..F.jpg`). Used tiles: A-B Maze (headline beside a collage of report pieces), E-H Assembly (one large dark tile
beside smaller tiles), F-C Manus and F-N Hers (giant number with a chart drawn on a saturated colour), E-C Slack (cards
on a colour band). Groups B and D are app dashboards and gave nothing for a homepage section.

**Material (all real):** the 13 live papers. The newest, "Half of new pages took an estimated 42 days to get a first AI
citation" (3 Nov 2026, AI search behaviour, green; lead chart columns 7 days 25.5%, 14 days 32.2%, 30 days 46.3%,
60 days 56.7%; 493 new pages on 8 sites). Others from `research-2026-11-03/shared/research.js` (cyber is out of 36).
Charts from the research kit only (`research-2026-11-03/shared/charts-v2.js`, `series.css`), so the homepage section
looks exactly like /research.

**Rules:** DESIGN.md v11 tokens and type (Neue Montreal headings, Satoshi text); taste-rulebook /research entries (series
colours always, Graphite-level authority, no whitewash); homepage rules (numbers and charts lead; sections hold
product-UI finish; no rounded toy bars, pastel washes, monospace, numbered 01/02/03 labels, italic accent words, pill
tags on every card). Buttons as the homepage's.

| Option | Construction | Picture (non-DOM) | Ground | Tiles |
|---|---|---|---|---|
| A · Series plates | headline + lede + link left; 2×2 tiles, one per series, each its full colour with the series' strongest number and its chart | 4 real charts on colour | night band | E-C Slack, F-N Hers |
| B · Newest paper first | one large night tile (the newest paper: finding, 42 days, its lead chart, byline) beside three smaller tiles each on its series colour | 4 real charts | white (keeps the page rhythm; the colour is in the tiles) | E-H Assembly, A-B Maze |
| C · Findings row | headline row, then one wide band of four crosshair cells (like the homepage hero's results row), each a big number, the finding, a small chart and the series mark | 4 real charts on night | night band | F-C Manus, homepage hero results row |

## Build checks
- [x] A  - [x] B  - [x] C  - [x] phone 390 for each (no horizontal overflow, charts fit their column; `_shots/`, `context-*.png`, `overview.jpg`)
