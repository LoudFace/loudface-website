# makingsoftware.com figure system — MEASURED spec (from client's UI-Grabber deep capture, 2026-07-03)

Ground truth extracted from two captured figure SVGs on https://www.makingsoftware.com/ (Next.js + Tailwind v4).

## Plate (the <figure> wrapper)
- `<figure class="relative w-full bg-[url('/texture.svg')] bg-repeat font-mono text-[10px] text-black/50 uppercase">`
- The dotted-grid paper = a small SVG texture TILE, background-repeat — not hand-drawn dots per figure.
- EVERY annotation inherits from the figure wrapper: mono font, 10px, uppercase, ink at 50% alpha (`text-black/50`, computed oklab(0 0 0 / 0.5)).
- Figure SVG: inline, `fill="none"` on root, `max-w-[830px]`, centered (`grid justify-items-center`).
- Layout around figures: 3-col grid `lg:grid-cols-3 lg:gap-x-[6%]`, figure spans 2 cols (`lg:col-span-2`), prose in the third.

## Palette mechanics (custom cobalt ramp as CSS vars — map to LoudFace indigo ramp)
- --color-cobalt-50:  oklch(97.05% .0054 274.97)   -> use --primary-50
- --color-cobalt-100: oklch(94.22% .0275 274.66)   -> --primary-100
- --color-cobalt-200: oklch(83.76% .0774 273.32)   -> --primary-200
- --color-cobalt-300: oklch(76.12% .1218 272.4)    -> --primary-300
- --color-cobalt-400: oklch(63.79% .1899 269.89)   -> --primary-400
- --color-cobalt-500: oklch(57.66% .2443 267.62)   -> --primary-500
- --color-cobalt-600: oklch(50.58% .2886 264.84)   -> --primary-600  (THE line-work color)
- --color-cobalt-700: oklch(47.65% .3102 264.11)   -> --primary-700
- USAGE RULE observed: soft shape fills = 50/200/300 (+400 for emphasized solids); ALL outlines/strokes = cobalt-600 at stroke-width 1 (detail) or 2 (primary contour). Small rects rx=1 (sharp technical corners, ~1px radius).
- Thick "tape"/spine accents: stroke-width 6, and dotted variant `stroke-dasharray="1 2"` stroke-width 6.

## Motion INSIDE figures (the liveliness — rebuild as CSS, honor prefers-reduced-motion)
1. MARCHING ANTS leader/flow lines: `stroke-dasharray="4 4"` + animate stroke-dashoffset values 16 -> -16, dur 1s, infinite, linear. (CSS: @keyframes ants { to { stroke-dashoffset:-16 } }.)
2. FLICKER accent (projector/live feel): opacity 1 -> 0.5 -> 1, dur 0.15s, infinite — applied to ONE lit element (a beam, a gradient stop, an active node). Sparingly: one per figure max.
3. SETTLE-IN entrance: exploded part translates into place, e.g. translate 158,-240 -> 0,-140 -> 0,0 over 1.5s with spline easing, begin ~1.5s, fill freeze. (CSS: keyframed translate with cubic-bezier(.25,.1,.25,1), animation-fill-mode both, triggered on scroll-into-view.)
4. Light-cone gradients: linearGradient fills with a stop-opacity flicker for "projection" effects.
- Their impl = SVG SMIL <animate>; OUR impl = CSS animations (SMIL ignores prefers-reduced-motion; CSS respects it via media query kill).

## Type in figures
- Their labels are drawn as pixel-font paths (departureMono glyphs). WE use real Geist Mono <text>/HTML labels instead (brand font) at the same optical size (~10-11px, uppercase, 50-60% alpha ink for secondary, full primary-600 for emphasized).
- FIG numbers rotated vertical beside plates; bracket meta right side, e.g. "[ 3.5" FLOPPY DISK ]" "( 1986 )".

## Body context (theirs; do NOT copy fonts)
- Serif body ("arizona"), pixel display font for the site title — LoudFace keeps Neue Montreal/Satoshi/Geist Mono.
