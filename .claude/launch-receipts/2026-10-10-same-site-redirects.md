# Launch Receipt — Fix: a redirect to a value from the URL stays on www.loudface.co

- **Date:** 2026-10-10
- **Milestone:** The draft-mode exit, the editor's pause, resume and verify routes, and the feedback link only redirect to this site.
- **Commits:** `c95d4e2`, `30ee2a9` (merged with main as `32e8db5`) on `main`; live as Vercel deployment 6979072461 (`loudface-website-fvgt4uq5q-loud-face.vercel.app`). The review's P2 fix (a test only) lands in the same commit as this receipt.
- **Ran by:** Claude (Opus 5.5) via the `site-engineering` Launch Gate, operator arnel@loudface.co, after Arnel measured the draft-mode open redirect on 2026-10-10. Eight Strands got the same fix that day.
- **Lessons loaded: 12 (house 12, client 0); applied: none. They cover CMS reads, phone menus, button labels, PostHog, Intercom, image caching and Spine tooling; none covers redirects.**

## The defect

- `/api/draft-mode/disable` did `NextResponse.redirect(new URL(searchParams.get('redirect') || '/', url.origin))`. Measured 2026-10-10: `?redirect=https%3A%2F%2Fexample.com%2Fx` and `?redirect=%2F%5Cexample.com` answered 307 to example.com, an open redirect a phishing link could borrow.
- The editor's `safeNext` checked prefixes only. `/api/lf-edit/pause?next=%2F%09%2Fexample.com`, which needs no sign-in, answered `Location: /<tab>/example.com`; a browser drops the tab and landed on https://example.com/ (seen in a browser the same day).
- `/fb/<token>?to=` had the same prefix check. It runs only for a valid private token, so no outsider could use it.

## The fix

- `sameSiteRedirect(value, origin)` in `src/lib/same-site-redirect.ts` resolves the value against the origin, keeps it only when the origin still matches, and returns the full URL. The draft-mode exit and the feedback link use it.
- `safeNext` keeps its prefix rules, then reads the value the way a browser does, compares origins and answers the normalised path, never one that starts with `//`. The editor routes keep their relative redirects, so a real page path behaves as before.
- Tests: `npm run test:same-site` (new, a CI step) and new `safeNext` cases in `npm run test:editor`.

## Verification

- Local: `npm run typecheck`; eslint on the changed files; `test:same-site` 6/6, `test:editor` 594/594, `test:cms` 10/10, `test:redirects` 4/4; `check:editor` 5 PASS; `npm run build` passed (299 static pages). The local production server (`next start`) sent every off-site value home and kept `/blog`, `/blog?x=1#faq` and `/pricing?x=1`.
- The old route logic and the old `safeNext`, run on the test inputs, sent every one of them off the site, so the new tests fail on the old code.
- Live after the deploy (09:48 UTC): both measured values answer 307 to `https://www.loudface.co/`; `?redirect=/blog` answers 307 to `https://www.loudface.co/blog`; the tab, `//` and userinfo values go home; the pause route's tab value lands on https://www.loudface.co/ in a browser. Responses were uncached (`cf-cache-status: DYNAMIC`, `age: 0`).
- CI run 38042609508 passed, the new same-site step included.

## Gate results

| Gate | Result |
|---|---|
| 0 · Lessons loaded | ✅ line above |
| 1 · Design CLOSE | ⚖️ Not applicable: no markup, CSS or client code changed. |
| 2 · qa-loop | ⚖️ Not applicable as a site sweep: three API routes changed and no page did. The changed routes were checked live, value by value (above). |
| 3 · seo-aeo-geo-audit | ⚖️ Not applicable: no page, copy, metadata or schema changed. |
| 4 · `check.mjs` | 1 FAIL, 12 WARN, 24 PASS. The FAIL (`no-default-palette`) and the WARNs are the ones the 2026-10-04 receipt lists, and none is in the changed files. `build` WARNs only because the check ran without `--build`; `npm run build` passed on the same tree. |
| 5 · Fresh-agent review | Round 1 (a separate Claude agent with a clean context, Opus 5.5): no P0 or P1. By its own count it ran 400k values through both helpers and resolved each answer by browser (WHATWG) rules; none left the site. In a browser, the tab value and `/a/..//example.com` on the live pause route land on `/`. It found no regression: old and new `safeNext` agree on all 93 app routes, and four edge cases normalise to the same page (`/blog?` and `/blog#` become `/blog`, `'` becomes `%27`, `über` becomes `%C3%BC`). P2 fixed: the wiring test now also reads the three editor routes, and it fails when pause skips `safeNext` (checked by breaking the route). P3 left for Arnel: `sameSiteRedirect` also keeps `blob:https://www.loudface.co/x` (a 307 to an error page) and a same-host URL with a username. Neither leaves the site, and the helper is the one Arnel specified, so a stricter check (same protocol, no username or password) waits for his yes. P3, older than this fix: the CI workflow has no lint or build step; Vercel builds every push. |
| Build / types / tests | ✅ `npm run build`, `npm run typecheck`, `npm run test:same-site`, `npm run test:editor`, `npm run test:cms`, `npm run test:redirects`, `npm run check:editor`. |

## Residual risk

- One rule lives in two helpers: `sameSiteRedirect` answers a full URL for routes that know their origin, `safeNext` a path for the editor's relative redirects. AGENTS.md tells a new route to use one of them; no test finds a new route that uses neither.
