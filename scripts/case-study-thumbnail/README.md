# Case-study thumbnail template

The shared template behind every `/case-studies/*` thumbnail: brand-gradient
ground, two browser panels of **real screenshots**, one white stat card.

Before this existed, each thumbnail was hand-composed. The sixth
(`stealth-fintech-ai-visibility`) shipped as a generic AI illustration and broke
the set — that is what this script prevents.

## Render one

```bash
node scripts/case-study-thumbnail/render.mjs configs/<slug>.json
node scripts/case-study-thumbnail/render.mjs configs/<slug>.json --variant b
node scripts/case-study-thumbnail/render.mjs configs/<slug>.json --no-cache
```

Output: `out/<slug>[-<variant>].png` at **2880×1800**, matching the existing set.
Screenshots are cached under `out/.shots`; the cache key covers url, scroll,
viewport and clip, so change any of those and it re-shoots. `--no-cache` forces it.

## Config shape

See `configs/stealth-fintech-ai-visibility.json`. Panels are ordered back-to-front;
`style` positions each one in a 1440×900 coordinate space and panels are meant to
bleed off the canvas edges. `clipHeight` trims the screenshot — keep panels dense,
an untrimmed shot leaves a dead white block.

## Rules that hold across the set

- **Real screenshots, never illustrations.** The panels are the evidence.
- Front-left panel is the client's homepage; back-right is the page that won
  (article, results row). One stat card, bottom-right, overlapping the front panel.
- The card carries one number the reader can check, its label, and its window.
- **NDA / stealth clients:** no client name, domain or site screenshot — and do
  not substitute loudface.co either. Use `"wireframe": "app" | "page"` from
  `wireframes.mjs`: anonymous placeholder bars where text would be, an empty URL
  bar, no logo. The redaction is the message. Presets are authored in a 1440-wide
  space and scaled with CSS `zoom`, so the panel crops tight to the content.
