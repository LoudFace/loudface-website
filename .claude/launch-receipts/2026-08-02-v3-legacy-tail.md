# Launch Receipt — v3 legacy-tail migration → main

- **Date:** 2026-08-02
- **Release:** `9c31ebd` (middleware→proxy) + `0deec74` (73-file v3 migration) + gate fixes commit (follows)
- **Run by:** Claude (Fable 5) orchestrating the site-engineering Launch Gate, session 72bc641a
- **Verdict: SHIP** — zero confirmed P0/P1 release findings across all gates.

## Gate results

| gate | result |
|---|---|
| Production build (`npm run build`) | PASS — exit 0, all pages, run 14:31 local |
| `check.mjs` deterministic | **0 FAIL, 9 WARN, 15 PASS** (warns acknowledged below) |
| Design CLOSE log | v3 templates picked 2026-07-14 (case-study, blog, service). Gap: monolith hero has no CLOSE entry — accepted; it ships only on the noindexed, unlinked `/dev-preview/monolith` canvas |
| qa-loop | Sweep: 40 pages, 0 real fails (340 crawler false-positives disproven — entity-decode bug, task filed). 8 lanes × 2 shards run; every P0/P1 candidate adversarially verified. **Zero confirmed release blockers** |
| seo-aeo-geo-audit | **CLEAR** — 0 P0/P1. `/dev-preview/monolith` verified noindexed + orphaned |
| Fresh-agent engineering review | **SHIP** — 0 P0/P1, 5 P2s (3 fixed pre-merge, 2 acknowledged below) |

## P2 fixes applied pre-merge

1. `team-v3.css` — undefined `var(--muted)` → `var(--mut)` (grey was off-token on every team/author date).
2. `HeroMonolith.tsx` — `frameloop={reducedMotion ? "demand" : "always"}` (WebGL no longer burns battery under reduced-motion).
3. `@types/three` moved to devDependencies.

## Acknowledged, not fixed (fast-follows)

- **Brand purple changed sitewide**: `--color-primary-600` `#4f46e5 → #4F39F6` rode inside the migration commit (Arnel's own tree change; contrast passes AA at 6.46:1). Flagged for explicit awareness — repaints every `bg-primary-600` surface.
- **Breadcrumb contrast** ~2.0–2.8:1 on indigo heroes (case-study, team) — below AA 4.5:1; routes to the design lane, not restyled unilaterally. (a11y lane, measured)
- **TOC anchors don't scroll** (blog + legal templates) — CONFIRMED but pre-existing on live production (parity-verified). Task chip filed.
- **Cal.com first-click swallow** — CONFIRMED pre-existing on live (homepage hero affected when cold). Task chip filed.
- **Cookies table** lacks mobile scroll affordance (P2, design lane fast-follow).
- **Stale footer-fetch list** in `(site)/layout.tsx` for /terms + /cookies (wasted GROQ call, invisible) + `/ai-instructions` meta description 174 chars (SEO audit P2s).
- **`/preview/*` mechanism ships inert** — `public/preview/` intentionally left uncommitted; config pointers reference its README. Harmless 404s until that lands.
- **Refuted candidates** (for the record): homepage hero CTA "dead" (= cold-Cal, works warm on live), mobile menu "can't close" (closes fine with real clicks on live AND dev), monolith overlay/header findings (the page IS a bare canvas preview), team avatar 504 (dev-machine network; prod 3.6s/200), 340 sweep image "fails" (crawler entity bug).

## check.mjs WARNs, each acknowledged

focus: usage (6, pre-existing) · 36 raw `<img>` (helpers route CMS images; per-surface rule applied since 933c6e3) · 15 raw internal `<a>` (pre-existing) · build-not-run-in-checker-invocation (run separately, passed) · README boilerplate · 1 TODO in src · missing `global-error` · 38 tracked tooling artifacts in `.claude/` · no `packageManager` pin. All predate this release; candidates for the handover-readiness sweep.

## Process notes

Two crawler/harness defects found while gating (sweep entity-decode, qa-lane tab contention) — task chips filed per the locomotive-engineer rule. Dev server died once mid-lanes under 8 concurrent browser agents; restarted, findings from the outage window were re-verified.
