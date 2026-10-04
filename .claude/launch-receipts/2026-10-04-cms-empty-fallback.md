# Launch Receipt — Fix: a failed Sanity read no longer becomes a cached empty list

- **Date:** 2026-10-04
- **Milestone:** The list composers throw on a failed Sanity read; every retry really reaches Sanity.
- **Commits:** `6f4d3e6`, `01716fb`, `75a1bc6` on `main`; live as Vercel deployment `dpl_FBPhjLt8swc7P12M7MUtoeqhYEvJ`.
- **Ran by:** Claude (Opus 5.5) via the `site-engineering` Launch Gate, operator arnel@loudface.co, in the cross-client sweep that followed genieteacher.com/blogs caching an empty article list on 2026-10-04.
- **Lessons loaded: 12 (house 12, client 0); applied: "On Next.js App Router + Vercel, a `sitemap.ts` MetadataRoute cannot serve an uncacheable sitemap…" (its second half: a green deploy can still serve an older build, so the live check matched the deployment ID the domain serves to the new deployment). The rest cover UI, analytics, tooling and metrics and do not apply to a server-side data change.**

## The defect

`fetchHomepageData`, `fetchBlogIndexData` and `fetchCaseStudyIndexData` caught a failed read and returned empty data. The HTML pages render per request, so a failure showed one visitor an empty /blog or /case-studies with a 200; but the Markdown copies (`/blog.md`, `Accept: text/markdown`) are cached for an hour, empty list included. And `withRetry` repeated the same request, which Next replays inside a render, so the retry never reached Sanity.

## The fix

The three composers let the failure through. `withRetry` moves to `src/lib/cms-retry.ts` with a request tag per retry and a 10 s deadline per attempt, for all 14 retried reads. `/thank-you` reads only `fetchLatestBlogCover` (a decoration that answers undefined on failure), and /about and /contact read only the team (`fetchTeamMemberList`). `npm run test:cms` runs in CI.

## Verification

- `npm run test:cms` 10/10; `npm run test:editor` 591/591.
- Local production build with Sanity forced down and a cold data cache: the old code served `/blog` as a 200 with no posts and `/blog.md` as `public, max-age=3600, s-maxage=3600`; the fix answers `/blog` 500 and `/blog.md` 503 `no-store`, while `/thank-you` still renders (200).
- Live after deploy: loudface.co serves `dpl_FBPhjLt8…` on /blog, /case-studies, /, /about and /thank-you (all 200); `/blog` and `/blog.md` list 12 posts.

## Gate results

| Gate | Result |
|---|---|
| 0 · Lessons loaded | ✅ line above |
| 1 · Design CLOSE | ⚖️ Not applicable: no markup, CSS or client code changed. |
| 3 · seo-aeo-geo-audit | ✅ Crawl-path checks only (no copy, metadata or schema change): /blog and /blog.md list their posts; no metadata change. |
| 2 · qa-loop | ✅ Scoped: `qa-loop/scripts/sweep.mjs` on the live site after deploy, 40 pages: 0 FAIL, 7 WARN. |
| 4 · `check.mjs` | 1 FAIL, 12 WARN, 23 PASS; `cms-empty-fallback` PASS. The FAIL is pre-existing and unrelated: `no-default-palette`. `cms-empty-fallback-per-request` WARN acknowledged: 7 routes still degrade through `fetchBlogPostData`, `fetchCaseStudyDetailData` and `fetchFooterData`, which render per request and never reach the Markdown copies (recorded in AGENTS.md; make them throw before the `(site)` layout stops reading request data). Other WARNs pre-existing; `build` only because the check ran without `--build`. |
| 5 · Fresh-agent review | Round 1 (Codex): no P0/P1. Fixed: the booking confirmation no longer fails with Sanity; per-attempt deadline; wiring test; AGENTS.md wording. Round 2: no P0/P1. Fixed: /about and /contact read only the team; a regression guard for the thank-you fallback. |
| Build / types / tests | ✅ `npm run build`, `npm run typecheck`, `npm run test:cms`, `npm run test:editor`. |

## Residual risk

- When Sanity is down, /blog, /case-studies, the homepage and team pages answer 500 for that request instead of an empty 200 (intended: a crawler retries a 5xx, and nothing caches it).
- The detail and footer composers above still degrade per request.
