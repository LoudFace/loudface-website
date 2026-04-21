---
name: blog-visuals
version: 1.0.0
description: |
  Generate blog post visuals via the LoudFace pipeline — AI illustrations
  (fal.ai gpt-image-1.5 with brand references), live web screenshots
  (Playwright), and data charts. Also covers posting to Sanity and
  publishing. Use whenever the user asks to: add visuals to a blog post,
  generate a hero image, add a screenshot, run the visuals pipeline,
  illustrate an article, create charts for a post, or any workflow around
  blog article visual content. Handles the hard-won rules about prompt
  shape, reference images, bot-walled URLs, and pipeline recovery that
  aren't documented elsewhere.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# Blog Visuals: Playwright + fal.ai pipeline

Full reference lives at `scripts/visuals/README.md`. This skill is the
decision guide — when to use what, what to avoid, and the rules that are
not obvious from reading the code.

## The pipeline at a glance

```
plan.ts         Claude reads the article → Zod-validated shot list (5–10)
illustrate.ts   fal.ai gpt-image-1.5 /edit with brand references
screenshot.ts   Playwright (Chromium) captures live web pages
compose.ts      Uploads assets + writes Sanity draft (never publishes)
publish-draft   Promotes draft to published when you're ready
```

Each step is resumable, caches aggressively, and soft-fails per shot.

## Happy-path workflow for a new article

```bash
# One-time per machine
npm run visuals:setup   # installs Chromium via Playwright

# Full run with brand-locked illustrations
npm run visuals:generate -- <slug> \
  --reference scripts/visuals/references/thumbnail-folders.png \
  --reference scripts/visuals/references/thumbnail-mountain.png \
  --reference scripts/visuals/references/thumbnail-bars.png

# Review draft in Sanity Studio at /studio/structure/blogPost;<id>

# If all good:
npm run visuals:publish -- <slug>
```

Expect ~60–90s per illustration + ~10–30s per screenshot + a few seconds
for compose. A 7-visual article takes roughly 4–6 minutes.

## Choosing visuals: screenshot vs illustration vs chart

This is the single biggest quality lever.

| Use case | Pick |
|---|---|
| Article claims "Google AI Overview shows X" | **Screenshot** of that SERP |
| Article cites client results with numbers | **Screenshot** of the case study page |
| Article references a product's landing page | **Screenshot** of that page |
| Article has a statistic (%, time series, ranking) | **Chart** |
| Article explains a concept without data | **Illustration** |
| Article has a framework / three pillars / selection logic | **Illustration** of a single concrete 3D object |

**Screenshots beat illustrations for listicles, comparisons, and evidence-
driven posts.** The AEO agencies listicle went from "generic abstract
illustrations" to "real LoudFace case study pages with 49% / 53% / 26%
stat blocks visible" — night and day difference.

**Illustrations are best for conceptual/editorial openers.** Hero images,
section openers for abstract frameworks, articles without hard data.

**Charts for anything quantitative in the article.** Even two data points
deserve a `stat` chart rather than being buried in prose.

## The hard-won rules for illustrations

### 1. Use MULTIPLE references, always

Pass `--reference` multiple times. 2–3 brand thumbnails give the model
more anchors than any one image; outputs stay cohesive with the brand.

Three brand thumbnails are committed at `scripts/visuals/references/`:
- `thumbnail-folders.png`
- `thumbnail-mountain.png`
- `thumbnail-bars.png`

Use all three by default.

### 2. Simple subjects, not detailed ones

The model renders one concrete 3D object cleanly. It does NOT render a
multi-node diagram with labels, arrows, or branches well — fal ends up
producing muddled text and ambiguous shapes.

**Good subject:**
```
A gold medal on a three-tiered podium, centered in the lower half
of the frame.
```

**Bad subject:**
```
A vertical decision tree with four numbered nodes connected by
arrows. Node 1: "What is your share of answer today?" branching to
"Known" or "Unknown". Node 2: ...
```

If the article is ABOUT a process or decision flow, render the CONCLUSION
as a concrete object (a clipboard with four ticked boxes, a medal, a
stool with three legs) — not the process diagram itself.

### 3. The prompt is the subject verbatim in reference mode

When `--reference` is attached, `renderPrompt()` returns the subject
verbatim — no template wrapping, no composition/mood, no style block,
no exclusion clauses, no "match the reference" directive.

This is intentional. Those extra paragraphs fight the reference images
and produce worse output. If you're editing prompts and think "let me
add more detail about composition / negative space / mood", don't —
that's the pre-fix behavior that produced the muddled illustrations.

### 4. Use the planner, but feel free to hand-tune the plan

Run `--plan-only` to get a Zod-validated shot list as JSON. If Claude's
subjects are too detailed or its slot choices feel off, edit
`.visuals-cache/<slug>/plan.json` directly, then run
`--skip-plan` to continue. This is faster than prompt-engineering the
planner.

## The hard-won rules for screenshots

### 1. Never propose direct Perplexity search URLs

`https://www.perplexity.ai/search?q=...` is always Cloudflare-walled.
It captures only the "Verify you are human" bot-challenge page.

The planner prompt has this as a hard rule. The plan.ts validator has a
runtime guard that throws if any shot has a `perplexity.ai/search?q=`
URL. Don't try to work around it.

**Instead:**
- Google AI Overview SERP (`google.com/search?q=...`) — the worker
  bypasses consent cookies and forces `hl=en&gl=us`
- Perplexity SHARE permalinks (`perplexity.ai/search/<slug>-<id>`) —
  these aren't bot-walled
- A chart or illustration of the same concept

### 2. Google SERPs work cleanly — use them aggressively

The screenshot worker does three things to make Google captures reliable:
- Pre-sets `CONSENT` and `SOCS` cookies (bypasses EU consent modal)
- Sends `Accept-Language: en-US,en;q=0.9`
- Auto-appends `hl=en&gl=us` to any `/search` URL via `normalizeUrl()`

Result: clean English-language SERPs regardless of IP geolocation.
Perfect for showing AI Overview answers for buyer-intent queries.

### 3. Case study pages are the highest-ROI screenshot target

If you're writing about a client result, screenshot the case study page
itself. The stat blocks, branding, and real product names do more work
than any illustration.

Pattern for self-referential posts:
```json
{
  "slot": "loudface-codeop-case-study",
  "type": "screenshot",
  "capture": { "sourceUrl": "https://www.loudface.co/case-studies/codeop" }
}
```

### 4. Omit selectors by default

The planner prompt warns Claude not to guess selectors for volatile SPAs
(Perplexity, Google, ChatGPT, etc.). If a selector misses, the worker
falls through to a full-viewport capture rather than crashing. Don't
set `selector` unless you have strong evidence the selector is stable
(e.g. `article` on a news site).

## Pipeline recovery

### Soft-fail per shot

One bad URL or fal timeout doesn't kill the run. The pipeline logs the
failure, skips the shot, and continues. Compose emits the article with
the surviving visuals.

### Common failure patterns

| Symptom | Cause | Fix |
|---|---|---|
| `Executable doesn't exist at .../chromium` | Playwright browser not installed | `npm run visuals:setup` |
| All illustrations fail "Forbidden" + fetch errors | fal credits exhausted | Top up account, re-run |
| Illustration muddy / generic | Subject too detailed | Simplify to one concrete object; ensure `--reference` flags present |
| Illustration ignores brand palette | No reference attached | Add `--reference scripts/visuals/references/thumbnail-folders.png` (and others) |
| Screenshot shows Cloudflare verify | Perplexity live query URL | Drop that shot, use Google SERP or chart |
| Google SERP in wrong language | `normalizeUrl` regression | Check `screenshot.ts` still appends `hl=en&gl=us` |
| Studio caption edits lost after re-run | Default compose overwrites | Re-run with `--merge` |
| Draft replaced your curated visuals | Plan changed, different slots | Use the rebase-draft-on-published pattern (see references/) |
| Live page not updating after CMS edit | ISR cache | Wait 60s; ISR revalidate is `revalidate = 60` |

### Re-running specific stages

```bash
--skip-plan                        # re-use existing .visuals-cache/<slug>/plan.json
--skip-illustrate                  # skip fal.ai (cached illustrations reused)
--skip-screenshot                  # skip Playwright (cached screenshots reused)
--skip-compose                     # don't touch Sanity
--plan-only                        # stop after planner
--merge                            # preserve existing draft visuals by _key
```

Cache busting:
- One illustration slot: delete `.visuals-cache/<slug>/illustrations/<slot>.png`
  AND the corresponding `.visuals-cache/_fal-cache/<sha>.png`
- One screenshot: delete `.visuals-cache/<slug>/screenshots/<slot>.png`
  AND `.visuals-cache/_screenshot-cache/<sha>.png`
- Full restart on a slug: delete `.visuals-cache/<slug>/`

## Sanity integration

- Pipeline writes DRAFTS only (`drafts.<id>`). Published documents are
  never touched automatically.
- `npm run visuals:publish -- <slug>` runs the transactional
  draft→published swap.
- The blog page at `/blog/[slug]` is ISR-revalidated every 60s, so CMS
  changes propagate without a code push.
- Rendered by `src/components/blog/BlogContent.tsx`, which splits the
  article HTML at H2 boundaries and slots visuals in at the positions
  specified in `position.anchor` / `position.h2Index`.
- Three types of visuals render through three components: `BlogChart`,
  `BlogIllustration`, `BlogScreenshot`.

## When NOT to use this skill

- User wants to manually edit an existing image → image-editing tool,
  not this pipeline.
- User wants stock photography → this is editorial generation only.
- User wants to batch-regenerate EVERY post's visuals → that's a huge
  cost; it's almost always more targeted to regenerate specific slots.
- User wants new illustration templates beyond `hero` / `spot` / `diagram`
  → add one to `scripts/visuals/prompts/illustrations/` and update the
  `IllustrationTemplateSchema` enum in `types.ts`.

## References

- Full README: `scripts/visuals/README.md`
- Planner system prompt: `scripts/visuals/prompts/planner-system.md` (the
  biggest quality lever — iterate this when outputs drift)
- Zod schemas: `scripts/visuals/types.ts`
- Illustration templates: `scripts/visuals/prompts/illustrations/*.md`
- Brand references: `scripts/visuals/references/`
- Why simpler prompts: `references/prompt-shape.md`
- Edge cases and workarounds: `references/troubleshooting.md`
