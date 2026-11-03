# LoudFace /research — round 2 (3 Nov 2026)

Round 1 (A, B, C) was rejected whole. Arnel, in his words: "really bad", "don't come close to the authority that
exudes from Graphite's own designs", "juvenile and unserious", "the charts look very bad compared to the other charts
that we have on the website and also Graphite's own charts", "everything looks whitewashed. It's just white
everywhere. There are no differences in colors anywhere." Logged in `.claude/design/taste-rulebook.md` and
`~/.atelier/rejections.md`.

**What changes:**
- **Colour carries the page.** No direction may be mostly white. Each has a dominant coloured or dark ground; white
  is a reading surface, not the default. This overrides DESIGN.md §2.3 ("grounds alternate white and warm") for the
  research section only, on Arnel's instruction.
- **Charts from `shared/charts-v2.js` only** (rebuilt to the homepage and Graphite standard). The round-1 drawer
  (`research.js` `data-chart`) is not used for drawing; its `STUDIES`/`BENCH` data still is.
- **Authority:** big confident type, few elements, generous space, figures given room like a published paper;
  numbered "Figure 2" captions, sources and sample sizes under every figure, named researcher and method.
  No pill tags on every card, no toy-like rounded progress bars, no pastel washes.

References: `design-lab/harvest/2026-11-03-research-r2/mobbin/contact-sheets.pdf` (tiles D-*, E-*, F-*), Graphite
captures (`harvest/2026-11-03-research/live/graphite-*`), the LoudFace homepage (`harvest/2026-11-03-research-r2/live/lf-home-long.png`).

## D · Night lab — tiles D-A..D-J (Fey, Supabase, Pitch, Basedash, Gemini, Cursor, Vapi, GitBook, SoundCloud) + Graphite
The whole section on a deep night ground (#0b0a2e, #030C5A tokens), charts lit in white, lavender and one peach
accent. Graphite's authority with LoudFace's palette, not their green. Hub: big "Research" on night, the featured
finding as a huge lit chart, a grid of chart-cover cards on night. Paper: dark hero with the finding as H1 and the lead
figure at full width; reading column on night (Graphite does this) with figures on a lighter night panel; method and
limitations as a dark measurement sheet.

## E · Colour plates — tiles E-A..E-H (MasterClass, Hers, Manus, Hims, Behance, Gamma, Quicken)
Each series owns one saturated colour, used full bleed: AI Visibility Index = electric indigo #3d38cf, State of
B2B SaaS = coral #ec6c48, AI search behaviour = deep green #0f5a46, Measurement / Search = butter #e2ad3c on ink.
Charts drawn on the colour (MasterClass curve on green, Hers annotated chart on green). Hub: one band per series, the
series' strongest finding as a giant number + chart on its colour, the other papers as a list in the band. Paper:
the hero on the paper's series colour with the giant number and lead chart; reading on white between full-bleed
colour figure bands.

## F · Indigo stage editorial — tiles F-A..F-G (Unity, NYT, Hex, Fey, Posh, Railway) + the LoudFace homepage
The homepage's electric indigo stage (#3d38cf / #4f46e5) with white charts in a crosshair strip (like the homepage
hero results row) opens the hub; then an ink (#1a1040) "latest findings" band with big numbers; then the archive.
Paper: indigo stage hero with the finding, byline and a white lead chart; editorial reading on white with ink figure
bands breaking full width; ends on an ink method sheet.

## Build checks
- [x] D hub  - [x] D paper  - [x] E hub  - [x] E paper  - [x] F hub  - [x] F paper
