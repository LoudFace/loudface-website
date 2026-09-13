# SCAFFOLD — shared visual contract for ALL four directions (USVC round)

You are building ONE self-contained HTML landing page for **LoudFace** — a B2B creative agency
that builds + grows websites for SaaS companies. This is portfolio work for a top studio. The
safe, templated answer is the failure — it reads as "an AI made this." Take the harder swing:
one memorable, specific, confident page executed with craft. You will NOT be penalized for
ambition; you WILL be penalized for playing it safe or shipping a generic SaaS template.

Read `DATA.md` (same folder) for ALL real copy + real asset URLs + real chart points. Use the
REAL content — never lorem, never invented stats.

## The caliber reference we are stealing from: usvc.com (deep-navy institutional VC site)
The DNA we steal (NOT the navy — see TWIST):
- **One-accent discipline:** a near-monochrome field where a SINGLE saturated accent does ALL
  the energy work. Confidence through restraint, not a rainbow, not effects.
- **Grotesque-sans × serif pairing:** the serif (in *italic*) carries editorial weight on accent
  phrases; the grotesque carries all UI + headlines.
- **Near-square geometry:** 2–4px radius almost everywhere + exactly ONE full pill (the primary
  CTA) so the pill MEANS something. Tight, measured, precise grid.
- **Editorial statement stacks**, **data-as-hero**, **blueprint/constellation diagrams**,
  **duotone portraits**, **vertical edge-labels**, **best-for/not-for cards** — USVC's moves.

### THE TWIST (how we make it LoudFace, not a USVC clone) — MANDATORY
- **Re-key off navy entirely.** The dominant chassis is **WHITE paper** (Arnel's standing love —
  "white reads like modern software"). Ink/dark is used only for *alternating chapters*, and our
  ink is **indigo-tinted near-black, NOT navy**.
- **The one accent = LoudFace indigo `#6366F1`** (brand meaning). One accent only. No second hue
  competing. (A direction may push it more electric — declare it.)
- **Voice = confident creative agency for B2B SaaS, not institutional VC.** Real LoudFace copy,
  real case-study charts, real client logos, real team.

## Re-keyed tokens (use these exact values)
```
--paper:    #FAFAFB   /* barely-tinted white — dominant chassis, NEVER dead #fff */
--paper-2:  #F2F2F5   /* faint inset panels on paper */
--ink:      #0D0D14   /* indigo-tinted near-black — dark-chapter chassis + darkest text. NOT navy, NOT #000 */
--ink-2:    #15151F   /* raised surface on ink chapters */
--text:     #14141C   /* body text on paper */
--muted:    #5B5B6B   /* secondary/caption text (tinted gray) */
--line:     #E6E6EC   /* hairline borders on paper */
--line-ink: rgba(255,255,255,0.10)  /* hairline on ink */
--accent:   #6366F1   /* THE one accent — indigo */
--accent-d: #4F46E5   /* pressed/again indigo */
--accent-soft: #EEF0FF /* faint indigo wash for one chip/fill */
--ok:       #16B364   /* success — best-for checks ONLY (tone-for-meaning) */
--no:       #E5484D   /* error — not-for x's ONLY (tone-for-meaning) */
```
Tinted neutrals only. No pure `#000`/`#fff`. Color = categorical meaning only (the indigo accent;
green/red ONLY on the best-for/not-for block).

## Fonts — load via CDN <link> in <head> (mockup only; prod self-hosts). Pairing = grotesque × serif-italic.
Your specific pairing is named in your concept brief. Loadable options:
- Google: `Geist`, `Space Grotesk`, `Bricolage Grotesque`, `Hanken Grotesk`, `Newsreader` (great italics)
- Fontshare: `Sentient` (editorial serif w/ italic), `Gambarino` (display serif), `General Sans`
  e.g. `<link href="https://api.fontshare.com/v2/css?f[]=sentient@1,2&f[]=general-sans@400,500,600&display=swap" rel="stylesheet">`
- Google example: `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Newsreader:ital,opsz,wght@1,6..72,300..500&display=swap" rel="stylesheet">`
The **serif-italic accent word** (in indigo) inside an otherwise-grotesque headline is a SANCTIONED
LoudFace signature Arnel loves — use it for accent phrases. **NO MONOSPACE ANYWHERE** (hard rule —
Arnel rejected mono twice). Labels/readouts = the grotesque, uppercase, letter-spaced, small.

## BANS (cap the design — never do these)
- No gradient text, no glow/halo/neon, no pure black/white, no rainbow.
- No dash/rule eyebrow kicker ("— WHAT WE DO"). No `01 / 02 / 03` numbered section markers.
  No `LABEL // YEAR`. (Standing vetoes — even though the source copy has 01/02, DROP the numbers.)
- No fabricated/fake-perfect stats — only the real numbers in DATA.md.
- No all-DOM page (lines+text+boxes only). MUST be media-rich (see below).
- No Inter/Roboto/Arial. No mono. No bounce/elastic easing. Tinted neutrals only.
- Cream/beige/paper-dated palettes are rejected. White paper, not cream.

## Media-richness — REQUIRED (this is the deepest anti-AI-tell)
Every page MUST include real media + designed media slots:
- **Real case-study thumbnails** (img the Sanity CDN URLs in DATA.md) in the work/results zone.
- **Real client logos** (img the URLs) — marquee, logo strip, or network-arc.
- **Real team photos** given a duotone/grayscale treatment (CSS `filter: grayscale + contrast`
  or an indigo duotone via blend) to stay on-palette.
- **At least one real data chart** built as inline SVG from the Toku/LoudFace points in DATA.md.
- Where you can't author the media, design an explicit **labeled placeholder slot** with a spec,
  e.g. `[ HERO FILM — B&W founder portrait, 30fps, slow push-in ]` — styled, not a gray box.
  Arnel's team produces these; seeing the creative direction is the point.

## Hard layout requirements (every direction)
1. **8+ distinct sections**, ≥4 different layout families (don't repeat the same row 8×). Full page:
   header → hero → trust/logos → problem → two-tracks(Build/Grow) → work/results(+chart) →
   process → stats → testimonials → (knowledge optional) → closing CTA → footer.
2. **Real header** with the `loudface.svg` wordmark + nav (Work, Services, About, Blog) + the ONE
   pill CTA. **Real multi-column footer** (Services / Company / Connect) with the inverse wordmark
   on ink — modeled on institutional caliber, not a one-liner.
3. **Responsive + mobile.** Must collapse to a clean single column < 768px: drop overlaps/rotations,
   stack splits, tap targets ≥ 44px. Use `clamp()` for fluid type. Hero headline must NOT over-scale
   (≈ `clamp(32px, 4.4vw, 56px)`) — keep each headline phrase on ONE line on desktop, wrap on mobile.
4. **Motion (tasteful):** named cubic-bezier eases only (define `--ease-out: cubic-bezier(.22,1,.36,1)`),
   `transform`+`opacity` only, `:active{transform:scale(.98)}` on buttons, blur/translate-in on
   entrance via IntersectionObserver, hairline rings not heavy shadows. Honor `prefers-reduced-motion`.
   No autoplay loops except a muted hero video slot. No spinners.
5. Self-contained: inline `<style>` + inline `<svg>` + inline `<script>`. Fonts + the Sanity image
   URLs + the two wordmark SVGs (same folder) are the only externals. Must render opening the file.

## Output
Write your finished page to the EXACT path given in your concept brief. One file. Complete — no
`<!-- rest of sections -->` stubs; build every section fully.
