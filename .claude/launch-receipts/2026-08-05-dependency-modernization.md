# Launch Receipt — Dependency Modernization

- **Date:** 2026-08-05
- **Commit:** 767dee0
- **Milestone:** dependency upgrade sweep (no feature or UI change)
- **Run by:** Claude Opus 5, session with Arnel

## Scope

PostHog SDKs, Next.js 16.1.3 -> 16.3.0, Sanity 5 -> 6 + next-sanity 12 -> 13,
Redis 5 -> 6, AI SDK 6 -> 7 + OpenRouter provider 2 -> 3, @types/node 20 -> 24,
plus within-major bumps and a lockfile-only `npm audit fix`.

Source changes were confined to three mechanical migrations: the partners OG
image off the deprecated Edge Runtime, `redis.quit()` -> `close()` in one
script, and the AI SDK `system` -> `instructions` rename across three call
sites. No UI, copy, routing or metadata changed.

Deliberately NOT upgraded: TypeScript 5 -> 7 and ESLint 9 -> 10. typescript-eslint
supports TypeScript `<6.1.0` and TS7 removed the programmatic compiler API it
depends on; Next.js's own ESLint 10 support PR is still open. Both would break
linting for no security gain.

## Gate results

| Gate | Result |
|---|---|
| 1. Design CLOSE log | **N/A** — no UI work in this release |
| 2. qa-loop | **Not run as a skill.** Manual equivalent performed: 13-route sweep all 200, Studio boots, /blog 12 + /case-studies 26 CMS items render, CMS API routes return live data, browser console clean apart from dev-only HMR socket noise |
| 3. seo-aeo-geo-audit | **N/A** — no page, content or metadata changes |
| 4. `scripts/check.mjs --build` | **0 FAIL, 8 WARN, 16 PASS** (exit 0) |
| 5. Fresh-agent review | **Not run.** Session operating instructions forbid spawning agents unless the user asks. Flagged rather than silently skipped |

## WARN acknowledgements (all pre-existing, none introduced here)

1. `link-component` — 15 raw `<a>` internal hrefs, mostly inside HTML strings in FAQ/prose data. Pre-existing; unrelated to dependencies.
2. `readme-real` — README is framework boilerplate. Pre-existing handover debt.
3. `no-todos` — one TODO in `src/app/api/newsletter/route.ts`. Pre-existing.
4. `error-pages` — no `global-error`. Pre-existing.
5. `tracked-artifacts` — 39 `.claude/` tooling files tracked. Pre-existing, deliberate.
6. `package-manager-pin` — no `packageManager` field. Pre-existing; repo uses npm, not pnpm.
7. (`published-perspective` passed with a spot-check note — draft perspective is gated behind `draftMode()` in `src/lib/sanity.client.ts`, unchanged by this work.)

## Security posture

`npm audit`: 35 advisories (1 critical, 19 high) -> 15 (0 critical, 2 high).
The two remaining highs are js-yaml and undici inside the `@sanity/cli` chain —
build-time CLI code, never served to visitors. npm's suggested remedy is a
downgrade to `sanity@5.14.1`, which would undo the Studio 6 upgrade; waiting on
upstream instead.

## Verification evidence

- `tsc --noEmit` clean after every stage
- `npm run build` exit 0 after every stage
- Real OpenRouter call through AI SDK 7: Zod validation, `instructions`, and
  `usage.inputTokens`/`outputTokens` all behaved as before
- Sanity 6 Studio renders at /studio; CMS reads verified through pages and APIs

## Known gap

Redis 6 was **not** runtime-verified — this machine cannot resolve the Redis
host's DNS. Only the /audit tool uses Redis. Exercise /audit after deploy.
