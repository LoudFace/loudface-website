# Harvest: collectui.com, recent.design, canvasui.dev

Scoped to two categories only:
- **(A)** process / steps / timeline / stepper / scroll-progress / "how it works" sections
- **(B)** stats / metrics / numbers / counter / testimonial-grid sections

Method: fetched each site with WebFetch first. Where WebFetch returned a 403 or an empty client-rendered shell, I cross-checked with `curl` (real browser User-Agent) and, for recent.design, with the live Browser pane (real JS execution) to confirm what a human visitor actually sees versus what a plain fetch gets.

---

## 1. collectui.com

**Classification: (c) something else — a client-rendered SPA gallery that serves NO real content to any non-JS fetch.**

It is *built* as a visual inspiration gallery (screenshots of websites/portfolios "curated by design magicians"), so its intent is (b). But in practice it fails even that: the server sends only a SvelteKit shell (header, footer, nav, sponsor links). Every content-bearing route I checked — `/`, `/trending`, `/categories`, `/categories/__data.json` — comes back with literal `"Loading categories..."` / `"Loading..."` placeholder text and empty `PostCard` regions. This held true both for WebFetch and for a `curl` fetch with a real Safari User-Agent. The `/categories/__data.json` SvelteKit data endpoint returned `{"type":"data","nodes":[null,null]}` — confirming the categories are fetched client-side after mount, from an API this fetch never triggers.

**Result for both category A and category B: no data.** I could not retrieve a single post, category name, or image URL — for "process/steps" or "stats/counter" or anything else. No code exists on this site regardless (it's images-only by design), but that's moot here since even the images never rendered.

**What I could confirm:** top-level nav is `/`, `/designers`, `/categories`, `/trending`, `/favorites`. Site is monetized via Adobe sponsor placements and a "Panda Network" of partner directories (bestdesignsonx.com, usepanda.com, flatuicolors.com, etc.) — none of which are the requested categories.

**Verdict on the technique:** for this site, "send your agent the link" does not work at all. A human clicking through in a browser would see the gallery; an agent fetching it (even via a real browser UA over curl) sees an empty shell. Only a JS-executing browser tool would get real data here, and even then it requires manual click-through per category — there is no crawlable list of categories or posts.

---

## 2. recent.design

**Classification: (b) a visual inspiration gallery — screenshots only, no code.**

Confirmed via the live Browser pane (WebFetch returned HTTP 403 on this one — it appears to block WebFetch's request signature specifically, though a `curl` with a Safari UA gets a 200 and the full initial payload). Rendered in-browser, the site shows:

> "The best design inspiration on the Internet."

Top-level browse tabs: **Design** (current), **Websites**, **OG Images**, **App Screenshots**, **App Icons**. Resources: Tools, Skills, Jobs.

Within "Design" there is a row of filter pills — but they are organized **by discipline/medium, not by UI-section type**:
`All, Web, Interface, Branding, Product, Typography, Motion, Illustration, 3D, Editorial, Print, Packaging`

There is **no "process", "steps", "timeline", "stats", "counter", or "testimonial" category** anywhere in this taxonomy. The closest is **Interface**, which is a masonry grid of mobile-app and product UI screenshots (e.g. a payment app balance screen, a rotary volume-knob control, an AI chat card, a sidebar sub-menu interaction). Clicking into it shows individual post pages at URLs like:

- `https://recent.design/i/7cft7yp-dark-mode-knob-ui`
- `https://recent.design/i/ayc72nk-card-details-microinteraction`
- `https://recent.design/i/b6hr2e5-sidebar-sub-menu-interaction`
- `https://recent.design/i/leos28t-agent-status-component`
- `https://recent.design/i/9akeal7-ai-agent-hand-tracking-ui`

None of these — nor anything else surfaced on the front page or the Interface filter during this pass — is a process/steps/timeline section or a stats/counter/testimonial-grid section. This site skews toward mobile app UI and portfolio/branding shots, not marketing-page landing sections, so category A and B simply have no natural home in its taxonomy.

**No entries catalogued for A or B** — I did not find qualifying examples after browsing the Interface filter with real rendering. There is no search/tag system that lets you query by section type (no `/search`, `/tag/*`, or `?q=` route — those all just return the same static shell, confirmed by identical byte counts across six different query strings via curl).

**Verdict on the technique:** the site is real and does render for a human, but it answers a different question than the one asked. It's organized by design *discipline*, not by page *section type*, so pointing an agent at it for "process sections" or "stats sections" yields nothing without a lot of manual, low-hit-rate browsing.

---

## 3. canvasui.dev

**Classification: (a) a genuine code component library — copy-pasteable source, installable via a CLI.**

This one is real and functions exactly as advertised: "Creative components, in a new dimension." 35 components, framework-agnostic, installed via:

```bash
npx shadcn@latest add @canvas-ui/particle-reveal-react
```

Usage example (from the docs, React):

```tsx
import { ParticleReveal } from "@/components/canvasui/ParticleReveal";

export function Hero() {
  return (
    <ParticleReveal radius={300}>
      <YourContent />
    </ParticleReveal>
  );
}
```

Nav: `/docs`, `/components`, `/playground`, GitHub at `github.com/DavidHDev/canvas-ui`.

**Full component catalogue** (all 35, confirmed via `/components`):

ASCII Object, ASCII Sweep, Asciify, Bend, Blaze, Bubble, Canvas, Cloth, Clouds, Decrypt Reveal, Dithered Object, Displacement, Droplets, Flame Wrap, Force Field, Frost, Glass, Glass Object, Glitch, Glyph Rain, Grid, Hex Float, Ink Object, Laser, Liquid, Magnify, Particle Object, Particle Reveal, Particle Scroll, Peel, Retro Dither, Ripple, Shatter, Liquid Object, VHS.

**Result for category A (process/steps/timeline) and category B (stats/counter/testimonial): zero matches.** Every single component here is a WebGL/canvas *visual effect* applied over existing HTML — cursor-following lenses, particle dissolves, glitch/VHS filters, glass/liquid distortions, fire/ice/frost overlays. None of them is a structural page section (no stepper, no timeline, no counter, no testimonial grid). The library's own "How it works" section (Pick → Run install command → Make yours) is a 3-step onboarding flow for the *docs site itself*, not a reusable stepper component — it's marketing copy, not a shippable section.

**Verdict on the technique:** the site is a legitimate code library, so (a) checks out completely — but it's the wrong library for this brief. It has real, verbatim-copyable source, just none of it is in the two categories requested.

---

## Summary

| Site | Classification | Category A hits | Category B hits | Code available? |
|---|---|---|---|---|
| collectui.com | (c) — SPA that serves no real content to any fetch | 0 | 0 | No (moot — nothing rendered) |
| recent.design | (b) — real inspiration gallery, wrong taxonomy (discipline, not section-type) | 0 | 0 | No |
| canvasui.dev | (a) — real code library, wrong subject matter (VFX overlays, not layout sections) | 0 | 0 | Yes, but none relevant |

**Bottom line on the technique being tested:** across all three sites and both target categories, this harvest produced **zero usable process/steps/timeline components and zero usable stats/counter/testimonial components** — not because the sites don't exist or don't work, but because none of the three actually organizes or ships the thing this brief asked for. One site (collectui) doesn't even serve content to a fetch at all. "Send your agent a UI library link" is not a reliable substitute for picking the right, on-topic source.
