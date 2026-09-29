# Launch receipt: ItemList JSON-LD on ranked listicles

- Date: 2026-09-29
- Commit: 163e3d7 (pushed to main, live on www.loudface.co)
- Ran by: Claude Code session (Opus 5.5), independent review by Codex (read-only)

## Step 0

Lessons loaded: 12 (house 12, client 0); applied: "On the LoudFace house stack … after a main-push rebuild the FIRST request" (live checks polled twice, 15 s apart)

## What changed

`src/lib/schema-utils.ts` `buildItemListSchema` / `extractRankedListFromHTML`, and its tests. ItemList is emitted only when the title promises a ranking (best, ranked, alternatives to) and the body carries one clean 1..N ranked list, read from numbered h3, else numbered h2/h1 (5+), else the first table whose first column reads "1. Name". Items are `ListItem` with position and name only.

Sweep of all 130 published posts: 30 emit, all rankings. Posts that stopped emitting: numbered guides and how-tos, and two posts whose separate numbered lists were being merged (understanding-webflow-pricing, webflow-vs-wix-studio). Proptech now emits (9 items, from its ranked table).

## Gates

1. Design CLOSE: not applicable, no UI change.
2. qa-loop: not run. The change renders nothing visible; its surface is the JSON-LD, covered by the build, 15 unit tests and the live checks below.
3. SEO/structured data: Schema.org validator on 4 live URLs, 0 errors, 0 warnings. Google Rich Results Test on proptech and legal tech: 3 valid items each (Article, Breadcrumbs, Organization), crawl OK, no errors. ItemList is not a Google rich-result type without per-item URLs, so the test does not list it.
4. check.mjs --build: 3 FAIL, 10 WARN, 21 PASS on the first run. `build` FAIL was a missing `.env.local` in the second checkout; with it linked, `npm run build` exits 0. `no-default-palette` (4) and `sitemap-static-pages` (6) are on main already and untouched by this change. The 10 WARNs are the site's standing warnings; none concerns `schema-utils.ts`.
5. Fresh review (Codex): no P0/P1. P2s fixed: curly-quote and entity parity with the renderer, tags inside headings no longer insert spaces, trailing period kept, body h1 read as h2 like the renderer. P2s accepted: a `>` inside a heading or cell attribute, and nested tables, can suppress or mis-read a table list. Sanity body HTML carries neither today.

## Review rounds 2 and 3 (on 163e3d7 and its fixes)

- Round 2: one P1. An entity-encoded `</script>` in a ranked name decoded to literal markup, and the route wrote JSON-LD with raw `JSON.stringify`, so it could close the script tag. Fixed: `serializeJsonLd()` escapes `<` as `\u003c`, used for all six JSON-LD blocks on the blog post route. Four P2s fixed: invalid numeric references (now U+FFFD, no crash), single-pass entity decoding, `&rsquo;` kept curly as the renderer shows it, `<br>` read as a space.
- Round 3: no P0/P1. Two P2s fixed: named-entity lookup ignores inherited keys (`&constructor;` stays literal), `<br>` with attributes reads as a space.
- 17 tests pass; typecheck clean; `npm run build` exit 0; the 130-post sweep output is identical before and after these fixes.
- Out of scope, filed as its own task: about 40 other files still emit JSON-LD with raw `JSON.stringify`.

## Live validation (2 polls each, both identical)

| URL | ItemList | Matches visible order | Other JSON-LD |
|---|---|---|---|
| /blog/best-seo-aeo-agencies-proptech-real-estate-saas | 9 (table) | yes | WebSite, Organization, BlogPosting, BreadcrumbList, FAQPage (6), WebPage |
| /blog/best-organic-growth-agencies-b2b-saas-2026 | 10 (h3) | yes | same set, FAQPage (12) |
| /blog/best-seo-aeo-agencies-logistics-supply-chain-saas | 10 (h3) | yes | same set, FAQPage (6) |
| /blog/best-seo-aeo-agencies-legal-tech-saas | 10 (h3) | yes | same set, FAQPage (6) |
| /blog/understanding-webflow-pricing | none (was merged lists) | n/a | unchanged |

## Remaining P2/P3

- The title rule is a heuristic. A future ranking titled without "best", "ranked" or "alternatives to" emits nothing; a non-ranking titled "Best …" with a clean numbered list would emit.
- Item name is the text before the first colon; entries written "Name, description" keep the whole heading (best-b2b-saas-seo-agencies item 1).
