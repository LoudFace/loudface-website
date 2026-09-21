# Launch receipt — /services/ai-overviews

- **Date:** 2026-09-21
- **Milestone:** new Google AI Overviews service page
- **Run by:** Claude Fable 5.1 (agent session), content-engine + loudface-website
- **Commit:** see `git log` for "Add the Google AI Overviews service page"

## Step 0 — lessons

`Lessons loaded: 11 (house 10, client 1); applied: none at >=0.80`

Highest-confidence lessons were 0.78, so none bind as a checklist item. Three were
treated as context and followed anyway, because the task touches exactly what they
describe:

- "after a main-push rebuild the FIRST request to a changed page often returns the OLD
  cached HTML" (0.75) — the live check polls the URL three times, 20s apart.
- "a `sitemap.ts` MetadataRoute cannot serve an uncacheable sitemap" (0.78) — the new URL
  was confirmed present in the live sitemap, not only in the local one.
- "Before blaming authority or Google ... check the blog index's crawl path" (0.77) — the
  page is linked from the services hub directory, the header dropdown, the footer, the
  related-services rail, `llms.txt`, `/ai-instructions` and the sitemap.

## Step 1 — design CLOSE gate

Logged in `.claude/design/picks-log.jsonl`, entry `2026-09-21T06:58:58+00:00`,
pick `reuse-existing-approved`. No new design was generated: the page is the approved
v3 service template plus the existing `.svcv3 .sf-prose` / `.sf-body` reading block from
`seo-for-v3.css`, already live on `/seo-for/*`, `/privacy`, `/terms` and `/cookies`.
Arnel has not eyeballed the page — flagged to him in the session report.

## Step 2 — QA

Checked on the local dev server at 1440x900 and 390x844 with real screenshots:

- HTTP 200 at both widths; `document.scrollWidth === clientWidth` at both, so no
  horizontal page overflow.
- Console: only the Sanity live-events CORS error, which is a localhost-origin dev
  artifact and does not occur on the production origin.
- All 39 internal links on the page resolve 200 locally. All 7 external citation links in
  the body resolve 200. Two `support.google.com` links return 404 to `curl` — a control
  test against two long-standing Google help pages returned 404 the same way, so that is
  an artifact of the check, not a broken link.
- **Defect found and fixed in the loop:** the four-column "three readings" table was
  clipped on mobile with no way to scroll it. Fixed by putting it inside the existing
  house `.comparison-table-wrap` scroller. Re-measured: wrapper 342px, content 396px,
  scrollable, no page overflow.

## Step 3 — seo-aeo-geo-audit

Run in site mode against the new page. **Zero P0, zero P1.**

- `<title>` 43 chars, meta description 150 chars, canonical absolute and correct,
  OG and Twitter complete, `robots: index, follow`.
- Exactly one `<h1>`; 10 `<h2>`, 4 `<h3>`, hierarchy intact.
- 5 JSON-LD blocks, all valid: WebSite, Organization, Service, BreadcrumbList,
  FAQPage with all 9 questions.
- 40 images, 0 missing `alt`. All `target="_blank"` links carry `rel="noopener"`.
- The rendered body text was diffed against the verified source: identical apart from 7
  whitespace artifacts of the tag-stripping. The hero sub is byte-identical to the
  verified `directAnswer`; the on-page FAQ and the FAQPage JSON-LD are byte-identical to
  the verified `faq[]`.

## Step 4 — deterministic check

`node scripts/check.mjs . --build` → **1 FAIL, 12 WARN, 20 PASS**, including
`[PASS] build: npm run build succeeded`. Run against an isolated checkout carrying only
this change set, because the main working tree holds another session's unrelated
work-in-progress.

**The single FAIL is a false positive in the checker, not a fault in the site.**
`check.mjs:370` detects the inline editor with `/<InlineEditor\s*\/>/`, which matches only
the self-closing form. This repo mounts it in the wrapping form at
`src/app/(site)/layout.tsx:128`, on `origin/main`, correctly gated behind `draftMode()`:
`{isDraftMode ? <InlineEditor>{site}</InlineEditor> : site}`. A follow-up task to widen the
checker has been raised.

All 12 WARNs are pre-existing on `origin/main` and none is in a file this change touched:
`no-hex-in-markup` (27, mostly dev-preview pages), `internal-link-next-link` (raw anchors
in existing components), `readme-real`, `no-todos` (1, newsletter route),
`error-pages` (no `global-error`), `tracked-artifacts` (274), `package-manager-pin`,
`sanity-image-bandwidth`, `inline-editor-no-transforms` (2, seo-for pages).
Acknowledged as out of scope for a single-page addition; each is a pre-existing
repo-level item, not something this change introduced or worsened.

## Step 5 — fresh-agent review

An independent agent with clean context reviewed the isolated change set against the
Engineering Review Checklist. It ran `tsc --noEmit` (exit 0), `npm run build` (pass),
`eslint` (no new findings), `inline-edit-check.mjs` (0 FAIL) and inspected the rendered
page. **P0: none.** It returned two P1s, both real, both fixed below.

## Step 6 — fixes applied

- **P1 — the page was missing from the services registry.** It was absent from the
  `/services` hub directory and from the hub's ItemList JSON-LD, because the hub reads
  `src/data/content/services.json` → `index.entries`, which still held 8 entries.
  Added the entry, plus `'ai-overviews': 'grow'` in `TRACK_BY_SLUG` (without it the
  directory's `===` track split would have dropped the row from both columns).
  Verified: the hub now links the page from its own directory and the ItemList carries 9
  items. **This takes the public services directory from 8 services to 9** — a positioning
  change, flagged to Arnel.
- **P1 — the site-wide `OfferCatalog` in `src/app/layout.tsx` still listed 8 services.**
  Added Google AI Overviews Optimization. On a page selling entity clarity, the
  organization schema not naming the service was the wrong evidence to ship.
- **P2 — the related rail said "One of seven" while listing eight rows.** The label was a
  hardcoded word at `ServicePageV3.tsx`. It is derived from the sibling count now. With
  the registry fixed there are 9 services, so every service page reads "One of eight",
  which is what each one actually lists.
- **P3 — the body table's `<th>` carried no `scope`.** Added `scope="col"`, matching the
  house comparison table.
- **P3 — stale comment** in `src/lib/content-utils.ts` ("The 8 individual /services/<slug>
  pages") corrected to 9.

### Judgment calls written down, not silently skipped

- **P2 — the copy publishes our own zero.** The verified body states, of the prompt this
  page sells optimization for, that no loudface.co page was among the 296 cited sources.
  It is honest and it is dual-verified copy; publishing it on the money page is a
  positioning call for Arnel, not an engineering one. Shipped as verified, flagged to him.
- **P3 — the body's five internal links are raw `<a>`, not `next/link`.** Unavoidable
  inside `dangerouslySetInnerHTML`; 11 existing `aHtml` fields in `service-v3/data.tsx`
  already do the same. Cost is a full reload and no prefetch on those five links.
- **P3 — the body section carries no non-DOM visual asset.** 2,245 words of prose and one
  table. Arnel's visual-asset gate would fail a section on that. It is the direct
  consequence of shipping verified article copy verbatim rather than reshaping it into
  template slots. Named here so the design lane owns the call.
- **The copy is deliberately outside `src/data/content/`.** Putting it in the content layer
  would let the inline editor silently change dual-verified claims and invalidate the
  verification. `content-utils.ts` already excludes the whole service-v3 template from the
  layer, so this is not a new violation.
- **`Clarifier.tsx` and `Exhibits.tsx` were left alone.** Both have fixed three-item
  layouts; adding a fourth is a design change, not a touchpoint update.

## Step 7 — re-run after fixes

`tsc --noEmit` clean, `eslint` no new findings, `check.mjs --build` re-run: same
1 FAIL / 12 WARN / 20 PASS with `[PASS] build`, the FAIL being the checker false positive
above. Hub, ItemList, OfferCatalog and rail label re-verified on the rendered pages.
Services hub re-screenshotted at both widths with the 9th row in place: no layout break,
no horizontal overflow.

## Copy provenance

Body read from the content-engine private spine body store, spine-id
`a2a04f97-6633-4f55-ae3c-00f21c24a213`, sha256
`6e36476dfeb207abd2aa426123bf9ec15d947a0c2e438d6e617910ed5dd9a4cb` — matched the expected
hash exactly. Fields from
`.claude/research/loudface/2026-09-20-ai-overviews.fields.json`. Two independent verifiers
signed the text off on 2026-09-20. No word was changed. Two blocks were moved rather than
rewritten: the H1 became the page `<h1>`, and the "Short answer" paragraph became the hero
sub so the direct answer is the first block on the page. The only markup-level addition is
the scroll wrapper and `scope` on the table.
