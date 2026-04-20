# Visuals Pipeline

Generates inline visuals (AI illustrations + data charts) for LoudFace blog posts and attaches them to Sanity drafts for human review.

## What it does

1. **Plan** — reads a blog post from Sanity, calls Claude to produce a Zod-validated shot list (5–10 visuals) with positions anchored to H2 headings.
2. **Illustrate** — generates each illustration shot via fal.ai (Nano Banana Pro / Nano Banana 2). Caches by `sha(model + prompt)` so re-runs are free.
3. **Compose** — uploads generated images to Sanity's asset pipeline and writes a draft of the blog post with the `visuals` array populated. **Never publishes.**
4. **Render** — the blog page (`src/app/blog/[slug]/page.tsx`) reads `post.visuals` and splices them into the article body at their H2-anchored positions.

All steps are local. Nothing deploys to Vercel.

## Quick start

```bash
# Full pipeline
npm run visuals:generate -- saas-seo-agencies

# Just plan (no API cost for fal.ai)
npm run visuals:generate -- saas-seo-agencies --plan-only

# Re-run from a specific step
npm run visuals:generate -- saas-seo-agencies --skip-plan
npm run visuals:generate -- saas-seo-agencies --skip-plan --skip-illustrate
```

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
├── compose.ts            CLI: Sanity draft composer
├── run.ts                Orchestrator
├── types.ts              Zod schemas (Position, Shot, ShotList, ...)
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
│   ├── prompts.ts        template loader (parses frontmatter, interpolates)
│   └── article.ts        HTML → outline (H2s, word count) for planner input
└── README.md
```

## Cache

Everything local lives under `.visuals-cache/` (gitignored):

```
.visuals-cache/
├── _fal-cache/           Global image cache keyed by sha(model+prompt)
└── <slug>/
    ├── plan.json         Validated shot list
    ├── plan.md           Human-readable preview
    ├── illustrations.json  Results with generation metadata
    └── illustrations/    PNG files per slot
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

- **Zod validation fails** — Claude returned a malformed shot list. Re-run the planner; if it happens twice, tighten the system prompt.
- **fal.ai fails mid-batch** — images already generated are cached. Re-run with `--skip-plan` to resume; completed slots return from cache.
- **Sanity compose fails** — images are uploaded; re-run with `--skip-plan --skip-illustrate` to just retry the draft write.

## What's NOT here (yet)

- **Screenshot worker (Playwright)** — for live ChatGPT / Perplexity / Google AI Overview screenshots. Deliberately deferred to v2 once illustrations + charts prove out.
- **Auto-publish** — by design. Every visual run lands a draft for human review.
- **Regeneration of individual slots** — for now, delete the cache entry and re-run; future work is per-slot regeneration.
