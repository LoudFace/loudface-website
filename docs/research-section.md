# /research — build spec (direction G, approved 3 Nov 2026)

Arnel picked direction G on 3 Nov 2026 ("Yes, build G"): D Night lab's authority, F Indigo stage's hero and big-number
band, E Colour plates' four series colours. Design boards in Paper "LoudFace Website · v11": "Desktop · v11" →
"Proposed · Research hub · G Night lab + colour · desktop" and "… paper …"; "Phone · v11" → "Proposed · Research hub · G ·
phone" and "… paper …". Reference build (HTML, exact CSS and markup): `design-lab/research-2026-11-03/G-hub.html`,
`G-paper.html`, `shared/series.css`, `shared/charts-v2.js`, `shared/research.js`. Taste rule: `.claude/design/taste-rulebook.md`
(2026-11-03 entries). Shared types: `src/app/research-v11/contract.ts`.

## What ships
- `/research`: the hub. Sections as the G hub board: stage, series strip, featured paper, latest findings, all papers
  (series filter), researchers, closing, footer.
- `/research/<slug>`: the paper. Sections as the G paper board: hero on the series colour with the lead figure, key
  numbers, takeaways + contents rail, reading column with figures, one figure band, method sheet, limitations /
  versions / data / cite, more research, closing, footer.
- The 12 studies now published as blog posts move to `/research/<same slug>` with a permanent redirect from
  `/blog/<slug>`. Their blogPost documents stay in Sanity (no deletion); the blog stops listing a post once a
  research document names it in `movedFromBlog`.

## Data (Sanity `research`, extended)
`name` is the finding, short (the H1 and every card title, as the boards show it); the paper's formal title moves to
the new `paperTitle` ("What AI actually cites: the B2B SaaS AI-Citation Benchmark (2026)") and `metaTitle` keeps the
live SEO title unchanged. New fields on the existing `research` type: `paperTitle`, `series` (index | saas | ai | meas), `kind` (Study | Report | Index |
Benchmark), `leadNumber` {value, label}, `keyNumbers[]` {value, label, note}, `figures[]` {title, source, note,
spec (JSON text, a ChartSpec), placement, h2Index}, `dataWindow` (string), `engines[]` (strings), `versions[]`
{version, date, note}, `movedFromBlog` (string). Existing fields keep their meaning (headlineFinding,
keyTakeaways, content, sampleSummary, methodology, limitations, appendix, dataFiles, faq, datasetMeta,
supersedes/superseded, authors, featured, dates, meta).

Every number in the migration comes from the live study (copied in `shared/research.js` on 2 Nov 2026) or from the
study's own Sanity body. Nothing is invented.

## Rules that hold
- CMS reads on /research throw; never catch into an empty list (AGENTS.md "CMS Data Fetching").
- Copy in JSON under `src/data/content/`, editable by the inline editor (AGENTS.md "Static Content").
- Charts are SVG rendered on the server (crawlers and no-JS readers see them) and redrawn on the client at the
  measured width. Every figure also carries its numbers as an accessible table.
- Structured data: ScholarlyArticle (+ Dataset when `datasetMeta` is set), BreadcrumbList; the headline finding is
  Speakable. Each page has its `.md` twin, a sitemap entry and an llms.txt line.
- Bans (DESIGN.md + rulebook): monospace, numbered 01/02/03 labels, italic accent words, gradient text, glow, pill tags
  on every card, rounded toy bars, pastel washes. Two fonts only.

## Checks before push
`npm run typecheck`, `npm run build`, `npm run test:cms`, `npm run test:editor`, inline-edit coverage on the new
routes, desktop 1440 and phone 390 screenshots compared with the Paper boards, the seo-aeo-geo-audit, the Launch Gate,
and a curl of every old `/blog/<slug>` returning 308 to `/research/<slug>`.
