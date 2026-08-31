# v5 — reference-cloned homepage sections (spec)

Written 2026-08-30 after the founder rejected v4 as "a regurgitated version of
what we already had." The rule for v5: **every section clones the COMPOSITION of
a named reference section** — its layout skeleton, density, and artifact types —
rebuilt with LoudFace content and tokens. Nothing from the old concept pages is
reused: no `.ci`/`.ip` plates, no instruments.css structures, no old section
components. Fresh CSS namespace `.v5`.

Palette: LoudFace indigo (electric #4f46e5, night #171445→#241f66, ramp
eef2ff→1e1b4b), white ground, Neue Montreal headings / Satoshi everything else.
Two fonts only. No mono. No 01/02 numbered markers (house ban) — dated or named
gates do that job. Real marks only (ChatGPT/Claude/Perplexity/Google/Grok chips
exist in `home-v3/_chips.ts`; client logos exist in `home-v3/_logos.ts`; case
study screenshots via `getHomeV3Images()` / HeroV3 fallbacks). Real metrics
only: Toku 0→97.8% AI visibility; Dimer Health +288% conversions. Everything
else name-only or explicitly illustrative.

Reference source: trailblazermktg.com (captured 2026-08-30, the founder's named
bar), bklit.com charts (installed at `@/components/charts`), beautifului.dev
shadow/radius tokens (`src/components/harvested/beautifului-tokens.css`).

---

## S1 — Case-study proof band (clones Trailblazer's hero-adjacent case card row)
Reference structure, measured from their render:
- Full-width thin **stat strip** first: 4 inline stats on one hairline-boxed row
  (label right of number, muted). Ours: use ONLY real figures — "97.8% AI
  visibility · Toku", "+288% conversions · Dimer Health", "10+ SaaS teams
  grown" is NOT real → use "B2B SaaS · our lane" text cell and "2h response
  time" (exists on live hero). If a stat can't be real, drop the cell — 3 cells
  beat a fake fourth.
- Under it, one **big case card**: left 60% = huge claim headline in plain words
  with the KEY PHRASE in electric indigo ("We took Toku from absent to cited on
  97.8% of the prompts that decide their category."), client logo+name row
  above it, 3 small square-corner tag chips under it (AEO · Schema · Content),
  right 40% = a boxed **Results sidebar** on tinted indigo-50 ground: two stat
  blocks stacked (97.8% / "AI visibility, core prompt set" and 0 / "where they
  started"), each with a hairline divider, plus a "Read full results →" link.
- Below the card: a row of 3 slim **preview rails** (next case studies:
  Dimer Health, Hoxhunt, LIQID) — name + one-line claim, no metrics.

## S2 — The system, tabbed (clones their OWN CATEGORY / RANKING PAGES tab section)
- Section head: kicker "THE SYSTEM", H2 "That's exactly where we come in" énergy
  but OUR copy: "One system, from the term your homepage must own to the answer
  AI gives your buyers."
- **Tab row**: 4 square-corner tab buttons full-width row, active = solid
  electric indigo, inactive = white with hairline border. Tabs: Own the term ·
  Build the pages · Get cited · Convert.
- Panel: **left 45% = artifact collage** — TWO overlapping mini-cards on a
  tinted indigo-50 field (not one chart): for tab 1, a "Competitor gap" card
  (3 rows: competitor-a.com 78% bar, competitor-b.com 64% bar, yourbrand.com
  12% bar with a small "Gap to close" chip) OVERLAPPED at bottom-right by a
  "Narrowing it down" card (4 keyword rows w/ tabular volumes: real-shaped
  e.g. "project management tool 33K/mo" struck-through row included, caption
  "+59 more terms shortlisted"). These are bklit-free hand-drawn HTML rows —
  fine — the reference's craft is in the DENSITY and the overlap, not the
  chart lib. All volumes illustrative → caption says so once.
  Tabs 2–4 get their own two-card collages: (2) page-tree card + "one page one
  job" checklist card; (3) citation share card (bklit BarChart, 4 assistants,
  real marks in the card header) + "Answer sources" mini list; (4) A/B card
  (control vs rebuilt bars + "+288% · Dimer Health") + booked-calls funnel card.
- **Right 55% = step copy**: eyebrow "STEP — OWN THE TERM" style (no numbers),
  H3, 2-sentence body, "Includes:" + 3 check rows, then an inline **client
  quote card** (hairline box: quote, name, org) — Anthony Dean on tabs 1–2,
  Daan Smit on tabs 3–4.

## S3 — Testimonial stage (clones their cream full-bleed quote w/ logo switcher)
- Full-bleed NIGHT-indigo band (our version of their cream): centered H2 "What
  founders say about working with LoudFace."
- One huge centered quote card (white, square corners, generous padding): the
  Radisson quote at display size, author + org under it.
- Under the card, a **3-cell logo tab rail** (Radisson · Brandfirm · Toku):
  active cell white/full-opacity, inactive dimmed — clicking swaps the quote
  (Brandfirm = Daan Smit quote; Toku cell shows the 97.8% line as a "result
  quote" — factual, no invented person). All three stay in the DOM server-side.

## S4 — Process, four columns (clones their 01–04 process with mini-browser mocks)
- Light ground. Kicker "THE PROCESS", H2 "What working with us looks like",
  sub "Structured, transparent, built to move fast."
- **4 equal columns**, each: a dated gate label (Week 0 / Weeks 1–4 / Weeks 4–6
  / Month 3+) sitting on one shared hairline rail with a node dot; under it a
  **browser-chrome mini-mock** (three chrome dots + tinted body) — each column a
  DIFFERENT artifact type:
  1. onboarding form: one question visible ("What's your positioning?"), an OK
     button, progress bar, caption "Question 3 of 31"
  2. strategy plan: "Channels" row with Google + ChatGPT chips (real marks),
     black progress bar "Strategy planning", plan pills "D 1–2 · D 3–4 · D 5–6"
  3. execution: three stacked pills "Content — LIVE · 8 pages", "Authority —
     LIVE · 4 links", "CRO — LIVE · 2 tests" (counts illustrative, say so once
     per section footer)
  4. reporting: Slack-style message card — avatar square "L", "LoudFace ·
     1:39pm", "Here's your monthly report:" + three tiny stat chips
- Under each mock: bold gate title + 3 check rows (reuse v4's real copy).

## S5 — Comparison (clones their "The whole system, not units" table)
- Centered kicker + H2 "The whole system, not the pieces", sub 2 lines.
- Column header row: 5 criteria labels. Then 4 **row-cards** separated by gaps
  (not one continuous table): row 1 = LoudFace on solid electric indigo, white
  logo + 2-line descriptor + white checks; rows 2–4 = white cards with icon
  square, name + descriptor, muted ✕/– marks (hatched cell for "not part of
  this route"). Footer line with a small dot: "Every path can work — one comes
  with the whole system."

## S6 — Selected work grid (keep v4's bento ONLY as content source; recompose)
- Clone the reference case-study row instead: one WIDE feature card (Dimer
  Health screenshot right, claim + tags + 288% stat left) + a vertical stack of
  3 compact cards (Toku w/ 97.8%, Montblanc, Hoxhunt — name + one-liner).
  "Explore all case studies →" button top-right of the section head.

## Gate
Build → I screenshot per section → compare against the reference crop by eye →
name remaining gaps → fix round → only then show the founder.
