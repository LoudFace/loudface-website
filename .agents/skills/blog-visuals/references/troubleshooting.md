# Troubleshooting the visuals pipeline

Real failure modes from production, sorted by how often they bite.

## fal.ai illustration failures

### "Forbidden" + cascading fetch failures on all shots

**Cause:** fal credits exhausted. The first request fails with 403
Forbidden, then the SDK sometimes retries aggressively and other shots
get transient fetch failures in the same polling window.

**Fix:** top up the fal account. Then re-run:
```bash
npm run visuals:illustrate -- <slug> --reference scripts/visuals/references/thumbnail-folders.png ...
```
The `illustrations/` dir and `illustrations.json` get overwritten on
successful completion. The fal cache holds successful images by
`sha(endpoint + prompt + refs)`, so partial success is preserved.

### "Executable doesn't exist at ... chromium"

**Cause:** Playwright browser binaries aren't installed. `npm install`
alone doesn't pull Chromium.

**Fix:**
```bash
npm run visuals:setup
```

The `getBrowser()` wrapper in `scripts/visuals/lib/browser.ts` catches
this specific error and re-throws with a clear "run `npm run
visuals:setup`" message.

### Illustration looks muddy / has mangled text / generic "concept art" feel

**Cause:** prompt is too detailed for reference mode. fal `/edit` with
references wants a simple subject; long prompts with composition + mood
+ labels fight the references.

**Fix:** open `.visuals-cache/<slug>/plan.json`, rewrite the offending
`subject` to one sentence naming one concrete object, then:
```bash
# Clear that specific cache entry (fal cache key changes with new prompt anyway)
rm .visuals-cache/<slug>/illustrations/<slot>.png
npm run visuals:illustrate -- <slug> --reference ...
```

The cache is keyed by `sha(endpoint + prompt + refs)` so edited subjects
auto-invalidate. Old PNG in per-slug dir gets overwritten on regen.

### Illustrations don't match the brand aesthetic

**Cause:** no `--reference` flag, or only one reference image.

**Fix:** always attach 2–3 references from `scripts/visuals/references/`:
```bash
--reference scripts/visuals/references/thumbnail-folders.png \
--reference scripts/visuals/references/thumbnail-mountain.png \
--reference scripts/visuals/references/thumbnail-bars.png
```

Multiple references give fal more style anchors; the output stays
cohesive with the brand.

## Playwright screenshot failures

### Screenshot shows "Verify you are human" Cloudflare page

**Cause:** the plan emitted a `perplexity.ai/search?q=<query>` URL.
Perplexity walls every headless Chromium request to that pattern.

**Fix:** The planner guard in `scripts/visuals/plan.ts` throws on this
pattern, so it shouldn't reach the screenshot worker. If it DOES slip
through (e.g. somebody hand-edited plan.json):
1. Replace the Perplexity URL in plan.json with a Google SERP or a
   Perplexity share permalink (`perplexity.ai/search/<slug>-<id>`).
2. Clear the bot-wall cache entry:
   ```bash
   rm .visuals-cache/<slug>/screenshots/<slot>.png
   # Also remove from shared cache — find the sha from screenshots.json:
   rm .visuals-cache/_screenshot-cache/<sha>.png
   ```
3. Re-run:
   ```bash
   npm run visuals:screenshot -- <slug>
   ```

### Google SERP captured in Spanish / French / other non-English

**Cause:** IP-based locale override in the headless browser. The worker
normally handles this via:
- Pre-set `CONSENT` + `SOCS` cookies in `openPageSession`
- `Accept-Language: en-US,en;q=0.9` extra header
- `normalizeUrl()` that appends `hl=en&gl=us` to any `google.com/search` URL

**Fix:** check all three are still in place in
`scripts/visuals/lib/browser.ts` and `scripts/visuals/screenshot.ts`.
If someone refactored and dropped one of them, restore it.

### Screenshot is blank / shows loading spinner

**Cause:** the page loads async content after `networkidle`. The worker
waits 1.5s after networkidle to let streamed answers settle, but that
isn't always enough.

**Fix:** add a `waitFor` selector to the shot in plan.json that targets
stable content on the target page. For SPA-heavy sites, skip the
screenshot and use a chart/illustration instead.

### Selector missed → full-viewport capture instead

**Intended behavior.** The worker falls through to a viewport capture
when a `selector` doesn't match, because the planner sometimes guesses
selectors that don't exist on the live page. A slightly-wider screenshot
is always better than a pipeline crash.

**Fix:** omit `selector` from the capture spec by default. Only add it
when you have strong evidence the selector is stable. Better: rely on
the viewport capture and crop/annotate in post if needed.

## Compose / Sanity failures

### Draft replaced your hand-curated visuals

**Cause:** default compose overwrites the draft's `visuals` array with
whatever the current plan produces. If you hand-edited captions or
swapped images in Studio, those are gone on re-run.

**Fix for going forward:** use `--merge`:
```bash
npm run visuals:generate -- <slug> --skip-plan --merge
```

**Fix for recovering lost edits:** if the published version has the
curated state, rebase the draft on published + splice in whatever was
new. See the rebase pattern (inline below).

### Rebase pattern (preserve published visuals, add new ones)

When the published doc has the visuals you want and a re-plan produced
a different set, you can surgically merge:

```ts
// One-shot script:
const published = await client.fetch(`*[_id == $id][0]`, { id: publishedId });
const draft = await client.fetch(`*[_id == $id][0]`, { id: draftId });

const screenshotVisual = draft.visuals.find(v => v._key === newSlotKey);
const anchorVisual = published.visuals.find(v => v._key === insertAfterKey);
const insertIdx = published.visuals.indexOf(anchorVisual) + 1;

const merged = [
  ...published.visuals.slice(0, insertIdx),
  screenshotVisual,
  ...published.visuals.slice(insertIdx),
];

const { _rev, _createdAt, _updatedAt, ...body } = published;
await client.createOrReplace({ ...body, _id: draftId, visuals: merged });
```

This was done once (session 2026-04-21) to save hand-curated AEO-guide
illustrations while adding a Google SERP screenshot. If you need to do
it again, model the approach on the pattern above — don't re-architect.

### "drafts.foo already exists" errors

**Cause:** a previous run crashed mid-write and left a partial draft.

**Fix:**
```bash
# From Sanity Studio, discard the draft manually, OR:
npx tsx -e "
  import { sanityClient } from './scripts/visuals/lib/sanity';
  sanityClient().delete('drafts.<id>').then(() => console.log('deleted'));
"
```

Then re-run compose.

### Live page not updating after Sanity change

**Cause:** ISR cache. Blog pages have `revalidate = 60`. Wait up to 60s.

**Fix:** just wait. If it still doesn't show after 2 minutes, check
that Vercel's latest deploy actually includes the ISR code (look for
`export const revalidate = 60` in `src/app/blog/[slug]/page.tsx` and
`src/app/blog/page.tsx`).

## Plan / planner failures

### Zod validation error on plan output

**Cause:** Claude returned a malformed shot list (missing required
field, wrong type, etc.).

**Fix:** re-run the planner. If it happens twice on the same article,
tighten the system prompt at
`scripts/visuals/prompts/planner-system.md`.

### Planner proposes direct Perplexity URLs again

**Cause:** the example in the planner prompt drifted, OR Claude is
pulling the URL shape from training data despite the warning.

**Fix:** the runtime guard in `plan.ts` throws on
`perplexity.ai/search?q=<live-query>`. Verify it's still there:
```bash
grep -n "assertScreenshotUrlIsSafe" scripts/visuals/plan.ts
```
If missing, restore from git history.

### Planner produces same shot list every time on same article

**Intended.** Claude is reasonably stable given the same input. If you
want a different plan, either:
- Edit the article body (the planner reads it)
- Hand-edit `plan.json` and run with `--skip-plan`
- Tweak the planner system prompt

## Cache hygiene

### Disk usage building up

**Check:**
```bash
du -sh .visuals-cache/
du -sh .visuals-cache/_fal-cache/ .visuals-cache/_screenshot-cache/
```

**Fix:** cache rarely needs clearing (PNGs are small and re-runs are
free), but if you want to nuke it:
```bash
rm -rf .visuals-cache/
```

Next run will re-fetch all, which costs money (fal) and time.

### Nuking ONE shot only

```bash
# Find the sha:
cat .visuals-cache/<slug>/illustrations.json | grep -A 2 "<slot>"
# or
cat .visuals-cache/<slug>/screenshots.json | grep -A 2 "<slot>"

# Delete the per-slug PNG + the global cache entry:
rm .visuals-cache/<slug>/illustrations/<slot>.png
rm .visuals-cache/_fal-cache/<sha>.png
rm .visuals-cache/_fal-cache/<sha>.json
```

Re-run the pipeline; only the nuked slot regenerates.
