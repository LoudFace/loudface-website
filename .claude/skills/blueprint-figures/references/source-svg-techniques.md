# Reference SVG, decompiled — the actual construction techniques

Extracted 2026-07-03 from the client's SECOND deep capture: the raw inline `<svg>` source of
six makingsoftware.com figures (the stacked-slab hero, an iso tile lattice, an iso gem, a
bezier chart, a graph-paper panel, and a giant iso browser mockup). This is the ground-truth
*how*, not just the *what*. The measured-spec.md file has the paper/ramp/voice; THIS file has
the geometry and motion that make the plates read as hand-drawn 3D objects.

Rule #0 in SKILL.md ("dimensional beats flat") is the *what*. This is the *how*.

---

## 1. Isometric construction — the single technique that builds all their depth

Every 3D object in the reference is built from **one unit square run through one fixed
isometric matrix**, stamped many times. Not hand-drawn boxes — a stamped lattice. This is why
their figures read as dense constructed objects and a few chunky hand-boxes do not.

**The tile.** A floor tile / top face is a unit square transformed by the iso matrix:

```html
<!-- 0.86603 = cos(30°), 0.5 = sin(30°). A 50-unit square becomes a 50-unit iso rhombus. -->
<path d="M0 0h50v50H0z"
      transform="matrix(0.86603 0.5 -0.86603 0.5 TX TY)"
      fill="var(--primary-100)" stroke="var(--primary-600)"/>
```

**The grid basis** (how to place the next tile), for a 50-unit tile:
- one step along iso-axis **X** → `TX += 43.30`, `TY += 25`   (43.30 = 50·cos30)
- one step along iso-axis **Y** → `TX -= 43.30`, `TY += 25`   (the negative column)
- one level **up in Z** (stacking) → `TY -= 25` on the same TX (a raised copy)

So a stacked field is a double loop over (ix, iy), optionally a third over height, emitting a
tile per cell with `TX = ORIGIN_X + (ix - iy)*43.30`, `TY = ORIGIN_Y + (ix + iy)*25 - iz*25`.

**Give a tile real thickness** (a cube, not a floor tile): draw the top face with the matrix
above, then a **front face** and a **right face** as two more parallelograms one and two ramp
steps darker. The reference's cube = 3 paths, 3 ramp steps:

```
top   → var(--primary-100)   (lightest)
front → var(--primary-300)   (mid)
right → var(--primary-400)   (darkest visible face)
outline on all three → var(--primary-600) w1
```

Front/right faces are just the top face's edge vertices extruded straight down by the cube
height (a plain vertical drop in screen-Y) and closed — no second matrix needed.

**Cast-shadow tiles.** The reference grounds floating objects with a few tiles in a *muted
off-ramp tint at low opacity* — the ONE sanctioned exception to single-hue, because it reads
as shadow, not a second brand colour:

```html
<path d="M0 0h50v50H0z" transform="matrix(0.86603 0.5 -0.86603 0.5 TX TY)"
      fill="var(--surface-400)" fill-opacity="0.2" stroke="var(--primary-600)"/>
```

(In the source these were `display-p3 0.2275 0.1569 0.4157` / `0.2157 0.4588 0.5137` at
`fill-opacity="0.2"` — desaturated violet/teal. Map to a neutral `--surface-*` at 0.2. Keep it
to the ground plane only.)

**Depth ordering.** Painter's algorithm: emit tiles **back-to-front** = sort by `(ix + iy + iz)`
ascending so nearer tiles overpaint farther ones. Getting this wrong makes the lattice look
inside-out. (For a vertical STACK of same-footprint slabs the key is height — paint
bottom-to-top; the raised part is nearer.)

**Surface detail must be iso-aligned.** Anything drawn ON an iso face — content rows, ticks,
hatching, a label that must sit on the object — has to run PARALLEL to an iso edge (use the
face's in-plane vectors e1/e2), NEVER screen-horizontal or -vertical. A flat line does not lie
on a tilted plane; it floats and reads as a stray mark, worst where faces overlap. (Caught
2026-07-04: screen-horizontal "content rows" on the exploded slabs looked wrong — removed.)
If iso-aligning the detail is fiddly, leave the face clean: a plain face beats a mis-aligned mark.

## 2. The exact tile ramp (source display-p3 → LoudFace `--primary-*`)

The reference cycles faces through these, lightest→darkest. Use them for face depth:

| source `color(display-p3 …)` | ≈ | LoudFace token | role |
|---|---|---|---|
| `0.9569 0.9608 0.9765` | primary-50  | lightest top faces |
| `0.9021 0.9204 1.0000` | primary-100 | top faces |
| `0.7255 0.7804 0.9922` | primary-200/300 | front faces |
| `0.5934 0.6745 0.9988` | primary-300/400 | accent tile / active |
| `0.3761 0.4996 0.9937` | primary-400/500 | deep face / highlighted |
| `0.0731 0.2585 1.0000` | primary-600 | **every outline** (never a fill) |

Discipline unchanged: fills = light steps + 1–2 primary-400 solids; every stroke = primary-600
w1/w2. The tile ramp just tells you WHICH light step a face gets by its depth.

## 3. Pattern fills — engineered surface texture (two reusable defs)

The reference fills panels with SVG `<pattern>`s, not flat colour. Two show up; both belong in
the shared `<defs>` so every plate can reference them:

```html
<defs>
  <!-- graph-paper panel: fill a rect at ~0.4 opacity for a plotted-on surface -->
  <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
    <path d="M10 0H0V10" fill="none" stroke="var(--primary-600)" stroke-width="0.5"/>
  </pattern>
  <!-- diagonal hatch: fill a face at ~0.25 opacity for a "cut"/section surface -->
  <pattern id="stripes" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <line x1="0" y1="10" x2="10" y2="0" stroke="var(--primary-600)" stroke-width="1"/>
  </pattern>
</defs>
```

Usage: `fill="url(#grid)" fill-opacity="0.4"` (paper panel) · `fill="url(#stripes)"
fill-opacity="0.25"` (hatched face). This is a cleaner, tileable alternative to the existing
`fx-hatch` pattern for large filled areas — keep `fx-hatch` for small callouts, use these for
whole faces/panels.

## 4. Motion vocabulary — every verb in the source, and its CSS translation

The source is SMIL; we ship CSS (reduced-motion honoured). Beyond the three we already had
(ants / flicker / settle), the capture revealed these — reach for them when they *mean*
something:

- **Draw-on** (a curve/contour drawing itself in). Source: `animate stroke-dasharray
  "0,1000;430,1000;0,1000"`. CSS: set `stroke-dasharray:<pathLength>` and animate
  `stroke-dashoffset` from `<pathLength>`→0. Use for a hero contour appearing on scroll.
- **Travel** (a dot riding a path — a signal moving through the system). Source: `animateMotion`
  + `<mpath>`. CSS: `offset-path: path('<same d>'); animation: travel Ns linear infinite;`
  with `@keyframes travel { to { offset-distance: 100% } }`. Cleaner than the old approach for
  "one packet flowing."
- **Spin** (a loader / rotating part). Source: `animateTransform type=rotate 0;360 dur=2s`.
  CSS: `@keyframes spin{to{transform:rotate(360deg)}}` + `transform-box:fill-box;
  transform-origin:center` on the group. One per plate, only where rotation is the point.
- **Wobble** (a cursor / hanging part settling). Source: multi-keyframe rotate
  `0;-2;-1;-3;-2;0;1;0;0`. CSS: same keyframe list as small-degree rotations. Subtle life on a
  pointer or tag; not on the main object.
- **Mask-wipe** (a leader line revealing along its length). Source: animated `<rect height>`
  inside a `<mask>`. CSS: `clip-path: inset(...)` animated, or just use draw-on (simpler).

Keep the total honest: ants on the flow lines, ONE flicker, settle on entrance. Draw-on /
travel / spin / wobble are *additions for a specific meaning*, not defaults — a plate with all
of them is noise. All must die under `prefers-reduced-motion: reduce`.

**Stagger the settle.** The hero used begins at 1.5s / 2s / 2.75s / 3s across its exploded
parts — parts arrive in sequence, not all at once. CSS: step `animation-delay` per part
(`--i` custom property × ~0.2s) so an exploded object assembles limb by limb.

## 5. Labels: `<text>` is fine; glyph-paths are the reference's crispness trick

The reference bakes its mono labels as **filled-rectangle glyph paths** (each letter is a
`<path fill=primary-600 d="M…h…v…">`), which is why they're pixel-crisp at any scale. We use
real `<text>` in Geist Mono (brand font) at ~10–11px uppercase — simpler, on-brand, good
enough. Only reach for glyph-paths if a *hero* label must stay razor-crisp when the plate is
scaled way up; never worth it for ordinary annotations.

## 6. The recipe, end to end (how a dimensional plate actually gets built)

1. Pick the object. Decide its footprint on the iso grid (how many tiles W × D) and height.
2. Emit the **ground/shadow tiles** first (back-to-front), a few `--surface-*`/0.2 under where
   the object floats.
3. Emit the object as **stamped iso tiles/cubes** — top+front+right faces per cube, ramp by
   depth, sorted back-to-front. This is the mass that reads as "constructed 3D."
4. **Explode** the parts: offset a layer/part outward along one iso axis and connect it back
   with a dashed guide line — this is what turns a solid block into an *exploded view*.
5. Add **dimension brackets** and **leader lines** (`marker-end="url(#fx-arr)"`) parked in
   clear paper, pointing AT parts — labels never sit on the object (label-on-object collisions
   were the main cleanup cost in the v3 build).
6. Wire motion: ants on the flow line, one flicker on the live part, staggered settle on the
   exploded parts. Add draw-on/travel/spin ONLY if one carries meaning.
7. Verify from the RENDER (SKILL.md verify loop). Shared `<defs>` present ONCE. Detector clean.

Honest ceiling (unchanged): the reference is hand-illustrated by a pro over months. The
iso-matrix lattice + real thickness + exploded parts is what closes most of the flat-vs-
dimensional gap in one shot. It won't perfectly match a master illustrator — it makes the
house style consistently, on-brand, dimensional, and self-improving.
