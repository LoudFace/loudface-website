# Launch receipt: /methodology (the Answer Chain)

- **Date:** 2026-09-03
- **Milestone:** first production launch of the `/methodology` route
- **Commit gated:** `fb17309` on `design/methodology-page` (PR #32)
- **Run by:** Claude Code session, on Arnel's instruction "ship it and link it in footer"
- **Scope:** one new route, three dev-preview routes deleted, one footer link, one sitemap entry

## Gate 1: design CLOSE gate logged

**PASS.** `.claude/design/picks-log.jsonl` carries the 2026-09-03 entry for route `/methodology`,
pick `B+A-short-answer`, with Arnel's own words as the feedback field. `.claude/design/taste-rulebook.md`
gained the matching rule. Desktop and mobile screenshots sit in `design-loop/methodology-2026-09-03/`.

## Gate 2: qa-loop

**PASS. Converged clean, no outstanding P0/P1.** Two independent runs agreed.

Verified: all eight stage `<details>` present in the served HTML with JavaScript off, stages 1 to 3
carrying `open` and 4 to 8 not; no horizontal overflow at 390px; every image carries alt text;
25 links checked, none broken; the shared footer renders identically on `/methodology` and `/pricing`.

Open non-blocking findings, carried forward as follow-ups:
- P2: one skipped heading level. An `h2` is followed directly by two `h4` elements
  ("Mentions of LoudFace", "Citations of our URLs") with no `h3` between them.
- P3: Sanity Live CORS console errors against `localhost`. Local-dev artifact only, present on
  every page, not introduced here.

Could not perform: a visual screenshot of the `/pricing` footer at 1440 (browser tool contention).
Substituted DOM and computed-style verification.

## Gate 3: seo-aeo-geo-audit

**PASS. Zero open P0/P1.**

Observed values: title "The Answer Chain: our AI search methodology | LoudFace", 54 characters.
Canonical `https://www.loudface.co/methodology`. Robots `index, follow`. Open Graph and Twitter
complete, OG image resolves 200. Exactly one `h1`. Six JSON-LD blocks, all valid: WebSite,
Organization, Article, BreadcrumbList, FAQPage, WebPage. FAQPage carries exactly nine questions and
all nine match the visible body text verbatim. Seven internal content links, all 200. Page listed in
the sitemap at priority 0.9. Readable in full with JavaScript off.

Open non-blocking findings, carried forward as follow-ups:
- P2: meta description is 198 characters, past the 160 upper guidance in `.claude/rules/seo-standards.md`.
- P2: the same skipped heading level gate 2 found.
- P2: no outbound links to third-party sources backing factual claims.
- P3: the three AI-engine links use `rel="noopener"` without `noreferrer`.

## Gate 4: deterministic check

`node scripts/check.mjs . --build` (from the site-engineering skill).

**Summary: 1 FAIL, 11 WARN, 14 PASS.** `[PASS] build: npm run build succeeded.`

**The single FAIL is pre-existing and unrelated to this change, and is acknowledged, not fixed.**
`no-default-palette` reports 15 default Tailwind palette classes in
`src/components/charts/tooltip/date-ticker.tsx` and `src/components/harvested/aceternity/*`.
Every hit is in a file that exists on `main` and that this change does not touch. Zero hits are in
any methodology file. Fixing it means editing unrelated components, which was outside the brief for
this ship. Recorded here so it is not lost.

WARNs acknowledged, each pre-existing and outside this change:
- `sanity-image-bandwidth` (39 raw `<img>`), `sanity-fetch-ttl` (2), `sanity-read-budget` (26),
  `link-component` (17 raw internal `<a>`) — all repo-wide, none in methodology files.
- `readme-real`, `no-todos` (1, in `src/app/api/newsletter/route.ts`), `error-pages` (no
  `global-error`), `tracked-artifacts` (42), `package-manager-pin` — all repo-level handover items
  that predate this change.

## Gate 5: fresh-agent review

**PASS. Zero P0/P1.** Two independent fresh-context reviewers, neither of which built the page.

Both confirmed: no dangling reference to any deleted module anywhere in `src/`; `SiteChrome.tsx`
carries no leftover `/dev-preview/methodology-` registration; the footer diff is exactly one `<li>`
in the existing Site column with nothing else touched; exactly one `h1`; `next/link` used for
internal navigation; `COMPONENTS.md` correctly has no entry, matching every other v3 route bundle.

Remaining P3, judgment call, not fixed:
- `methodology-base.css` declares local hex custom properties rather than `@theme` tokens. This is a
  byte-for-byte copy of the same block in `pricing-v3.css` and `service-v3.css`. It is an existing
  repo pattern, so changing it here alone would create inconsistency, not remove it.
- Four exported TypeScript interfaces in `data.tsx` are unused outside that file.

## Gate 6 and 7: fix and re-run

No P0/P1 and no new FAIL, so there was nothing to fix and no re-run was required.

## Local pre-merge verification (production build, JavaScript off)

Title, the labelled short answer, the liftable sentence
"LoudFace measures AI search work against revenue outcomes, not vanity metrics.",
all eight stage headings, FAQPage schema with nine questions, the footer link rendering on
`/pricing`, the sitemap entry, and all three preview URLs returning 404.

Em-dashes in the served HTML: 2, both the shared `FooterV3` Webflow Enterprise Partner line, which
this change deliberately leaves alone.

## Follow-ups opened by this gate

1. Fix the skipped heading level on `/methodology` (`h2` to `h4`).
2. Shorten the `/methodology` meta description to under 160 characters.
3. Add `/methodology` to `llms.txt` and `llms-full.txt`, which list core pages and were not touched here.
4. Repo-wide: clear the `no-default-palette` FAIL in the chart and harvested components.
