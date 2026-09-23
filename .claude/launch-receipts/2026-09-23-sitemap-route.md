# Launch receipt — 2026-09-23 — uncached /sitemap.xml route handler

Scope: route change only (src/app/sitemap.ts metadata route → src/app/sitemap.xml/route.ts + src/lib/sitemap-entries.ts; fetchSitemapData = one GROQ query on the CDN client with cache: 'no-store', cacheMode: 'noStale').

Why: on 2026-09-23 the live sitemap (edge HIT, 172 URLs) omitted /blog/ai-visibility-audit and /blog/directive-consulting-alternatives hours after publish while /llms.txt listed both. Same fault as the approved house lesson on sitemap.ts MetadataRoute caching (TradeMomentum, Pond).

Lessons loaded: 11 (house 10, client 1); applied: "On Next.js App Router + Vercel, a sitemap.ts MetadataRoute cannot serve an uncacheable sitemap…", "after a main-push rebuild the FIRST request … returns the OLD cached HTML…", "Before blaming authority or Google … check the blog index's crawl path…"

Checks:
- check.mjs --build: 0 FAIL, 12 WARN, 21 PASS. All 12 WARN pre-date this change and touch no file in it.
- npx tsc --noEmit: pass. .next/prerender-manifest.json does not list /sitemap.xml (dynamic).
- Local render (production CDN path) = live sitemap byte for byte + the two missing <url> blocks (174 vs 172 URLs, nothing removed).
- Fresh review 1 (clean context): SHIP; P2 4 uncached reads per hit → fixed (one CDN query); P2 audit-skill greps pointed at the deleted file → fixed; P3s noted.
- Fresh review 2 (delta): SHIP; P3 noStale → applied; P3 500-on-Sanity-outage → accepted, documented in cms-data.ts.
- Design / qa-loop / seo-aeo-geo-audit gates: not applicable (no UI or page content change).

Run by: Claude (Opus 5.5) in Arnel's session.
