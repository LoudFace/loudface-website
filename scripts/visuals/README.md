# Visuals Pipeline

Generates inline visuals (AI illustrations, data charts, live screenshots) for LoudFace blog posts and attaches them to Sanity drafts for human review.

## What it does

1. **Plan** — reads a blog post from Sanity, calls Claude to produce a Zod-validated shot list (5–10 visuals) with positions anchored to H2 headings.
2. **Illustrate** — generates each illustration shot via fal.ai (Nano Banana Pro / Nano Banana 2). Caches by `sha(model + prompt)` so re-runs are free.
3. **Screenshot** — captures screenshot shots via headless Playwright. Caches by `sha(url + selector + viewport)` under `.visuals-cache/_screenshot-cache/`.
4. **Compose** — uploads generated + captured images to Sanity's asset pipeline and writes a draft of the blog post with the `visuals` array populated. **Never publishes.**
5. **Render** — the blog page (`src/app/blog/[slug]/page.tsx`) reads `post.visuals` and splices them into the article body at their H2-anchored positions.

All steps are local. Nothing deploys to Vercel. Individual shot failures soft-fail — one bad URL or a fal timeout won't abort the run; the pipeline continues with the remaining visuals and prints a summary at the end.

## First-time setup

The screenshot worker needs Chromium installed locally. Run once per machine:

```bash
npm run visuals:setup   # downloads Chromium via Playwright (~150MB)
```

If you skip this and try to run the pipeline, the worker fails with a clear "run `npm run visuals:setup`" message rather than a cryptic Playwright error.

## Quick start

```bash
# Full pipeline (inconsistent style across shots — text-to-image)
npm run visuals:generate -- saas-seo-agencies

# Style-locked run — every illustration uses the reference as its style anchor
# (routes to fal's /edit variant of nano-banana-pro / nano-banana-2)
npm run visuals:generate -- saas-seo-agencies --reference https://cdn.sanity.io/.../anchor.png
npm run visuals:generate -- saas-seo-agencies --reference ./local-anchor.png

# Just plan (no API cost for fal.ai)
npm run visuals:generate -- saas-seo-agencies --plan-only

# Re-run from a specific step
npm run visuals:generate -- saas-seo-agencies --skip-plan
npm run visuals:generate -- saas-seo-agencies --skip-plan --skip-illustrate
npm run visuals:generate -- saas-seo-agencies --skip-plan --skip-illustrate --skip-screenshot

# Re-run and preserve hand-edits you made in Sanity Studio
# (captions tweaked, assets swapped, visuals manually removed)
npm run visuals:generate -- saas-seo-agencies --merge
```

### Merge mode

By default, compose overwrites the draft's entire `visuals` array with whatever the current plan produces. That's fine for the first run, but if you've opened the draft in Studio and hand-tuned a caption or swapped an image, re-running the pipeline will silently discard those edits.

Pass `--merge` to keep existing draft entries whose `_key` matches a plan slot:

- **Matching slot exists in draft → kept as-is** (your Studio edits survive).
- **New slot not in draft → added** (fresh fal/playwright output).
- **Slot in draft but gone from new plan → kept anyway**, with a warning. Safer than silent deletion; delete manually in Studio if you don't want it.

### Style consistency

Without `--reference`, each shot is generated independently — styles will drift.
With `--reference`, all shots go through fal's `/edit` endpoint with the reference
as `image_urls`, so outputs stay visually on-brand.

Bootstrap workflow for a new brand: run once without `--reference` to seed a hero,
upload that hero to Sanity, then use its CDN URL as `--reference` for every
subsequent post.

Then visit `/studio` → Blog Posts → your post. Review each visual, regenerate any that miss, and publish from Studio.

## Env vars

Add to `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=xjjjqhgt
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<write-access token>
OPENROUTER_API_KEY=sk-or-v1-...
FAL_KEY=...
```

## File layout

```
scripts/visuals/
├── plan.ts               CLI: planner (Sanity → Claude → shot list)
├── illustrate.ts         CLI: illustration worker (fal.ai)
├── screenshot.ts         CLI: screenshot worker (Playwright)
├── compose.ts            CLI: Sanity draft composer
├── run.ts                Orchestrator
├── types.ts              Zod schemas (Position, Shot, ShotList, CaptureSpec, ...)
├── prompts/
│   ├── planner-system.md     System prompt — iterate this; it's the biggest lever
│   └── illustrations/
│       ├── hero.md           Hero template (nano-banana-pro, 16:9)
│       ├── spot.md           Spot template (nano-banana-2, 4:3)
│       └── diagram.md        Diagram template (nano-banana-pro, 16:9)
├── lib/
│   ├── env.ts            dotenv bootstrap
│   ├── sanity.ts         @sanity/client wrapper, asset upload, draft helpers
│   ├── claude.ts         OpenRouter chat-completions wrapper (Claude Sonnet 4.6)
│   ├── fal.ts            @fal-ai/client wrapper with sha-keyed cache
│   ├── browser.ts        Playwright launcher + viewport presets (desktop/tablet/mobile)
│   ├── prompts.ts        template loader (parses frontmatter, interpolates)
│   └── article.ts        HTML → outline (H2s, word count) for planner input
└── README.md
```

## Cache

Everything local lives under `.visuals-cache/` (gitignored):

```
.visuals-cache/
├── _fal-cache/              Global image cache keyed by sha(model+prompt)
├── _screenshot-cache/       Global screenshot cache keyed by sha(url+selector+viewport)
└── <slug>/
    ├── plan.json            Validated shot list
    ├── plan.md              Human-readable preview
    ├── illustrations.json   Illustration results with generation metadata
    ├── illustrations/       Illustration PNGs per slot
    ├── screenshots.json     Screenshot results with capture metadata
    └── screenshots/         Screenshot PNGs per slot
```

Re-running the whole pipeline on the same slug with no prompt/template changes = 0 API cost.

## Adding a new illustration template

1. Create `scripts/visuals/prompts/illustrations/<name>.md` with frontmatter:
   ```
   ---
   model: fal-ai/nano-banana-pro
   aspectRatio: 16:9
   resolution: 2K
   ---
   ```
2. Two required sections: `## Prompt template` and `## Negative prompt`. Use `{{subject}}` where Claude's subject description gets interpolated.
3. Add the template name to the `IllustrationTemplateSchema` enum in `types.ts`.
4. Update `planner-system.md` to tell Claude when to pick this template.

## Editing the planner

The system prompt at `prompts/planner-system.md` is the biggest quality lever. Iterate on it every few articles. The Zod schema in `types.ts` guards the output shape — if you loosen or tighten the schema, update both sides.

## Failure recovery

Both workers **soft-fail per shot** — a single bad URL or fal timeout skips that slot and keeps going. The pipeline prints a summary of failed slots at the end and compose just omits them from the draft.

- **Zod validation fails** — Claude returned a malformed shot list. Re-run the planner; if it happens twice, tighten the system prompt.
- **fal.ai fails on one shot** — the rest of the illustrations still generate. Completed slots are cached by `sha(model + prompt)`. Re-run with `--skip-plan` to retry only the failed ones; cache hits on successful slots are free.
- **Playwright fails on a capture** — usually a bad `waitFor` selector, a page that never fires `networkidle`, or a blocked target (auth wall, Cloudflare bot challenge). That slot is skipped; the rest capture normally. Fix the shot in `plan.json` and re-run with `--skip-plan --skip-illustrate`; cached screenshots return from the shared cache.
- **Chromium binary missing** — the worker will tell you to run `npm run visuals:setup`. One-time install per machine.
- **Sanity compose fails** — images are already uploaded (Sanity dedupes by content hash, so re-uploads are instant). Re-run with `--skip-plan --skip-illustrate --skip-screenshot` to just retry the draft write.
- **Lost hand-edits in draft** — re-running the pipeline overwrites the draft's `visuals` array by default. Use `--merge` on every re-run after you've tweaked captions in Studio.

## Screenshot worker

Captures live web pages via headless Playwright (Chromium). Designed for public URLs — no auth.

**Good targets:** Perplexity search URLs, Google AI Overviews on public queries, public shared ChatGPT conversations, any public landing/product page.

**Bad targets:** authenticated ChatGPT/Claude/Gemini (will capture the login wall), gated SaaS dashboards, anything behind a paywall.

Each shot's `capture` object on the plan supports:

- `sourceUrl` (required) — the page to load.
- `selector` (optional) — CSS selector to crop the capture to one element.
- `waitFor` (optional) — CSS selector to wait for before capturing (essential for streamed AI answers).
- `viewport` (optional) — `desktop` (1440×900, default), `tablet` (1024×768), `mobile` (390×844).

Captures are cached globally by `sha256(sourceUrl + selector + viewport)` — the same URL/selector/viewport combo re-runs for free. Delete `.visuals-cache/_screenshot-cache/<sha>.png` to force a refresh.

## What's NOT here (yet)

- **Auto-publish** — by design. Every visual run lands a draft for human review.
- **Regeneration of individual slots** — for now, delete the cache entry and re-run; future work is per-slot regeneration.
- **Authenticated captures** — for sites that need login (ChatGPT, Claude, Gemini private chats), we'd need a hosted browser service with persistent cookies. Not a v2 priority.
