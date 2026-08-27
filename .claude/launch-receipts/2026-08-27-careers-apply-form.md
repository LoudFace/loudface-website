# Launch receipt — /careers/apply

- **Date:** 2026-08-27
- **Milestone:** Careers application form (first real form on the site)
- **Commit:** 840e62c on `main`
- **Run by:** Claude (Fable 5) session, at Arnel's instruction

## Scope judgment

This is a single noindex page added to an already-live site, not a first launch
or major relaunch. The full Launch Gate ceremony (qa-loop, fresh-agent review,
design CLOSE log) was NOT run. What was run is below, with the reasoning for
each skip. If this page grows into a public careers section, run the full gate.

## Checks run

- `scripts/check.mjs` — 1 FAIL, 11 WARN, 14 PASS.
  - The FAIL (`no-default-palette`) is entirely in `src/app/home-v3/concepts/**`,
    untracked in-progress work from another session, and the matches are inside
    code comments. Not shipped in this commit. The three careers files were
    grepped directly and use only project tokens.
  - WARNs are all pre-existing repo-wide items (missing global-error, tracked
    .claude artifacts, no packageManager pin, newsletter TODO). None introduced
    here; none block this page.
- `npm run build` — exit 0, both `/careers/apply` and `/api/careers-apply` registered.
- `npx tsc --noEmit` — clean for the careers files.
- Visual check on the local dev server at desktop AND mobile (375x812) — no
  overflow, fields full-width, role preselect works from the URL param.
- Role-question switching verified across designer / developer / seo via rendered HTML.
- End-to-end write verified twice: once on the preview deploy, once against
  production after launch. Both rows landed in the Notion Candidates DB with
  Role and Source set purely from the link params. Both test rows trashed.

## Skipped, with reasons

- **seo-aeo-geo-audit** — the page is `robots: { index: false, follow: false }`.
  There is no search surface to audit. Re-run if the page ever becomes indexable.
- **design CLOSE gate** — no new visual language was introduced; the page reuses
  the existing partners-form pattern and project tokens, per the component-system
  rule against recreating existing patterns.
- **qa-loop / fresh-agent review** — disproportionate for one hidden page. A
  cross-family stop-time review by Codex DID run and caught a real P0 (the
  endpoint confirmed applications it had failed to store); fixed in commit 60dde30
  before launch.

## Known follow-ups

- Spam protection is a honeypot + 3-second time trap only. If spam appears, add
  Cloudflare Turnstile (no Turnstile/reCAPTCHA exists anywhere in the repo today).
- A failed Notion write returns an honest 502 and logs `[careers-apply] RECOVERY`
  with the full submission. Nobody is alerted on that log line — wiring it to
  PostHog error capture is the obvious next hardening step.
