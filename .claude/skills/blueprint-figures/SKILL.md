---
name: blueprint-figures
description: Draw LoudFace's house technical-diagram style — "blueprint plates" — indigo engineering-manual SVG figures on dotted-grid paper with mono leader-line annotations, marching-ants motion, and one flickering live element. Use this skill whenever a LoudFace surface needs ANY explanatory graphic, diagram, illustration, figure, or visual — homepage/service/landing sections, blog post diagrams, case-study process visuals, "explain X with a graphic", "add a visual to this section", "makingsoftware style", or when content reads as walls of text and needs figures. Also use when asked to REVIEW or fix an existing blueprint figure. Do not freehand diagram styles from memory — this skill carries the client-approved system and its accumulated feedback.
---

# Blueprint figures — the LoudFace technical plate system

The house style for explanatory graphics: engineering-manual plates in the makingsoftware.com
idiom, reskinned to LoudFace indigo. Client-approved on the homepage problem section
(2026-07-03, verdict: "these graphics look pretty neat. I like them"). A plate is a **real
explanatory drawing** — an exploded view, a pipeline, a chart, a cross-section — never a
decorative icon. Figures do the talking; captions shrink to a title + one line.

This skill is **self-improving**: it carries a feedback ledger that every use appends to, and
stable lessons get folded back into the rules below. Follow the protocol at the bottom — a
plate shipped without logging the verdict wastes the learning.

## Step 0 — load the system (every invocation, in this order)

1. Read `references/measured-spec.md` — ground truth measured from the reference site
   (client-supplied deep capture). The mechanics below derive from it.
2. Read the tail of `feedback.md` (last ~10 entries) — what recent users praised/rejected.
   Newer entries outrank older rules if they conflict.
3. **THIS IS THE SPEC — study the approved SOURCE, not just prose.** Read
   `exemplars/approved-plates.html` (the 5 client-approved plates FIG.001–005, extracted
   VERBATIM from probvar-d.html) AND look at `exemplars/approved-plates.png` (their render — the
   visual quality bar). These carry what prose cannot: exact proportions, spacing, and the detail
   recipes that make them read as hand-crafted — the oblique wireframe with a *sheared content
   grid*, the *folded-corner* ticket, the *stacked* queue, the chart's *filled area + axis scale
   + thick dashed "tape" baseline*, the *two-bar + pill* result rows, the *bezier* funnel walls.
   **Start every plate by ADAPTING the nearest approved plate's code** — copy its geometry, node
   recipes, and detail density, then change the content. Do NOT regenerate shapes from the rules
   below; the rules are the index, the source + screenshot are the spec. (Learned 2026-07-04:
   prose-only regeneration is lossy — it drifts on proportion and drops detail, and lost to these
   approved plates every single time.)
4. Grab the canonical CSS + shared SVG defs from `references/plate-css.md` — reuse, don't
   re-derive.
5. Read `references/source-svg-techniques.md` — the reference figure SVGs **decompiled from
   the client's raw source capture**: the isometric-matrix tile recipe, the exact depth ramp,
   pattern-fill defs, the full motion vocabulary, and the end-to-end build recipe. This is the
   concrete *how* behind rule #0 (dimensional). When drawing a 3D object, this is the file you
   copy geometry from — don't re-derive the projection.
6. Grab `references/iso-helpers.py` — **correct-by-construction primitives**. The geometry rules
   the skill learned the hard way (depth-ramped cube, back-to-front floor, bottom-to-top vstack,
   iso-aligned face detail, gutter labels, labels-emitted-last) are baked into functions there,
   so composing with them can't reintroduce the bugs a human already caught. Prefer these to
   hand-placed coordinates; if you build inline (JS), mirror the same guarantees.

## Anatomy of a plate

```
<figure class="fig">                     ← grid cell; gets .in from an IntersectionObserver
  <div class="plate">                    ← the paper: texture tile + inherited annotation voice
    <span class="fig-id">FIG.001</span>       ← vertical, top-left
    <span class="fig-meta">[ OBJECT NAME ]</span>  ← vertical, top-right
    <span class="fig-yr">[ 2026 ]</span>           ← vertical, bottom-right
    <svg viewBox="0 0 640 320">…</svg>   ← the drawing
  </div>
  <figcaption><h3>Title.</h3><p>One consequence line.</p></figcaption>
</figure>
```

Why each piece matters:
- **The paper is a mechanism, not decoration**: one 12px repeating SVG dot-tile as
  `background-image` on `.plate` — never hand-drawn dot grids inside the SVG (measured from
  the reference; keeps every plate's paper identical and cheap).
- **One annotation voice, one CSS rule**: `.plate` sets mono / 10px / uppercase / 60%-alpha
  ink; every `<text>` inherits it (`fill:currentColor`). Emphasized labels opt into full ink
  with class `tk`. Per-label font styling is a smell.
- **Plate furniture** (FIG number, bracketed object meta, year stamp) makes it read as a
  manual page. Genuine figure numbering is sanctioned here — it IS the idiom; the decorative
  01/02/03 ban applies to section headers, not figure plates.

## The ramp discipline (what makes it look engineered, not clip-art)

Map to the host brand's color ramp. LoudFace: the `--primary-*` indigo scale.

- **Fills**: ONLY light ramp steps — 50/100/200/300 — plus **400 for at most 1-2 emphasized
  solids** per plate. Hatched fills via the shared `url(#fx-hatch)` pattern.
- **Strokes**: every line is **ramp-600** — width 1 (detail), 2 (primary contour). Nothing else.
  One thick accent allowed per plate: stroke-width 6 "tape" (solid, or dotted `dasharray="1 2"`).
- **Corners**: small rects use `rx="1"` — sharp technical corners, not friendly rounding.
- **Leader lines end in the shared arrowhead** `marker-end="url(#fx-arr)"`.
- Off-ramp hexes anywhere in a plate = fail. This single-hue discipline is why plates read as
  one hand; the moment a second hue appears they read as stock illustration.

## Drawing method — compose a REAL diagram

0. **DEPICT THE ACTUAL THING — concrete + richly detailed beats abstract. Fit the projection to
   the concept; don't default to isometric.** (Recalibrated 2026-07-04 after a real mistake —
   read the note below before drawing anything.) The single biggest quality lever is NOT the
   projection — it is whether the plate DRAWS THE SPECIFIC OBJECT, recognizably, with dense
   meaningful detail. The failure mode is an abstract geometric block that could be anything (a
   blank iso cube, a generic slab field with two labels). The win is the real object:
   - a browser **WIREFRAME** (nav bar + content grid + text lines), exploded to expose a missing layer;
   - a labelled **FLOWCHART** with real nodes and icons — a ticket stack, a padlock, a clock, an X;
   - a real **CHART** with axes + ticks + a flat "actual" line against a hatched "expected" wedge;
   - a ranked **ANSWER-SHEET UI** — prompt, numbered cited rows, your "NOT CITED" row, fed by source docs;
   - a **FUNNEL** of flowing hatched bands narrowing, with labelled leaks.

   **Pick the projection that best SHOWS the concept, per plate — not by rule:** FLAT for charts,
   flows, UI panels, timelines (this is MOST plates); EXPLODED / ISOMETRIC only to reveal stacked
   LAYERS or to show SCALE (a field of many units). A spec-clean iso block with no concrete detail
   is WORSE than a flat-but-specific diagram. Density of MEANINGFUL detail (icons, axis ticks, list
   rows, hatch, labelled parts) is what reads as manual-grade; blank faces read as unfinished.

   > **The mistake this corrects (don't repeat it):** the client's own approved baseline — the
   > `probvar-d.html` FIG.001–005 — is FOUR-of-five FLAT, yet reads as clearly better than an
   > all-isometric rebuild of the same five. Earlier this skill mis-diagnosed "the reference /
   > baseline looks better" as *dimensionality* and pushed everything into iso (changelog c/d).
   > Wrong variable. The good plates win on CONCRETENESS + DETAIL + right-projection, not on being
   > 3-D. Isometric is one tool in the kit; use it when depth genuinely helps (layers, scale), not
   > as the goal.

   When depth IS the right call, the exact construction (iso matrix, depth-ramped faces, gutters,
   paint order) lives in `references/iso-helpers.py` + `references/source-svg-techniques.md` — use
   it so the geometry is correct. But choose the archetype for FIT first (rule #1), detail it
   richly, and only then decide flat vs dimensional.
1. **Pick the archetype that FITS the concept** (not dimensional-by-default): labelled
   **flow / pipeline** (a process, a routing) · **axis chart** on grid paper (a trend, data) ·
   annotated **UI / answer sheet** (a screen, a ranked list) · **exploded view** (the layers of
   one object) · **cutaway** (the inside of a thing) · **isometric field** (scale — many units).
   MOST concepts want a FLAT archetype (flow / chart / UI); reach for exploded or iso only when
   *layers* or *scale* is the actual point. If none fits, invent one a 1980s technical manual
   would have printed for THIS specific thing — a flowchart is a perfectly good object.
2. **Draw 12+ real, SPECIFIC elements** — the recognizable object and its named parts, plus the
   small meaningful detail that makes it read as manual-grade: icons (padlock, clock, X, doc,
   ticket stack), axis ticks + a scale, list rows, hatch fills, guide lines (dashed), and
   leader-line annotations pointing AT parts. A blank shape with a label under it is an
   icon-blob — the failure mode this skill exists to prevent; density of *meaningful* detail is
   the cure, in flat OR dimensional. When the archetype IS dimensional, use the ramp for depth
   (front faces light, side/top one step darker) so the eye reads 3-D.
3. **Annotations are content**: uppercase mono, ≤4 words, saying something TRUE — part names,
   states ("LOCKED", "NEVER RETRIEVED"), real numbers from the project's kit, or neutral
   qualitative labels ("NO LIFT", "GROWING"). **STRUCTURAL numbers are fine and often needed** —
   a chart's axis scale (6K/4K/2K/0), an axis range (−6…+6), a real duration ("2–6 WEEKS"): the
   approved FIG.003 uses all three and is better for them. The ban is ONLY on invented,
   fake-precise CLAIM numbers in a callout ("10,000 VISITORS/MO" was rejected; "GROWING"
   shipped). Don't strip a chart of its axis to satisfy a rule that never meant that.
4. **One story per plate**: a single focal composition, quiet around it. Crowding was
   explicitly rejected ("too much cognitive overload").
5. **Compose with ambition — fidelity is the floor, not the composition** (learned 2026-07-03:
   spec-perfect plates lost a taste test to freer baselines on creativity). The moves that won:
   - **Show scale with element fields**: a pool of many small repeated units (documents, pages,
     tiles) makes "most/few/thousands" FELT, not just labeled.
   - **Run the story across the whole canvas**: one continuous flow with a clear reading
     direction, not disconnected boxes.
   - **Encode states visually**: muted → active → highlighted/cited across the same element
     family; add a 3-swatch legend when states carry the message.
   - Still one story, still quiet around the focal move — ambitious ≠ crowded.
6. viewBox ~640×320 (wide plates ~1280×280); text must stay legible when the plate renders
   at ~560px wide.

## Placement & z-order — clean by construction (learned 2026-07-03: "concept great, details off")

The two things that make a good figure look sloppy are **text sitting on top of shapes** and
**wrong stacking order**. Don't "watch out for" them — make them impossible:

- **Label gutters.** Every `<text>` lives in a LEFT or RIGHT margin gutter, NEVER over the
  drawing. Keep the object in the middle third; reserve ~90px each side for labels; a thin
  leader reaches from the gutter into the object. Titles → top-left margin, the one caption
  line → bottom-centre. With labels quarantined in the margins, text-on-shape can't happen.
  Watch label LENGTH vs gutter width — a long label ("YOU · NOT CITED") clips the edge;
  shorten it ("NOT CITED"), the caption already carries the full sentence. Build a `shapes`
  list and a `labels` list separately.
- **Strict paint order.** Emit back-to-front in fixed layers, ALWAYS: (1) paper / cast-shadow
  tiles → (2) far faces → (3) near faces (depth-sorted) → (4) guide / flow lines →
  (5) leaders → (6) **LABELS LAST**, on top of everything. Concatenate the labels list last.
  Never interleave a label between object parts — that's the z-order bug.
  - **The depth key depends on the layout — pick the right one:** an iso FLOOR of tiles sorts by
    `ix+iy` (farther cells first). A **VERTICAL exploded STACK** (same footprint, stepped in
    height) sorts by **HEIGHT** — paint **bottom-to-top**, because the raised/upper part is
    nearer the camera and must occlude the one below. (Caught 2026-07-04: a stack drawn
    top-slab-last put the *lowest* slab on top of the middle one — reversed. Bottom-to-top fixes
    it.) When two parts overlap on screen, ask "which is nearer the camera?" and draw it later.
- **A generator, not hand-placed coords.** Compute tile/face/label positions from formulas
  (the iso matrix, gutter x-slots) so placement is systematic, not eyeballed — eyeballed coords
  are exactly what drift 10px and read as "off."

## Motion — the plates are alive (CSS only, never SMIL)

The reference uses SMIL `<animate>`, which ignores `prefers-reduced-motion`. We rebuild the
same three mechanics as CSS so the global reduced-motion kill covers them (self-healing:
verify the page has one; add it if missing):

- **Marching ants** — class `ants` on flow lines that MEAN movement (pipeline flow, scan
  path, retrieval, funnel flow): `stroke-dasharray:4 4` + dashoffset 16→-16, 1s linear
  infinite. Static pointer leaders stay static.
- **Flicker** — class `flick` on **exactly ONE** lit element per plate, where "live" means
  something (the lock, the flag, the NOT-CITED mark, the leak): opacity 1→.5→1, .15s
  infinite. Opacity only — never blur/glow. Two flickers = noise (learned rule).
- **Settle-in** — class `settle` (+ optional `--sx/--sy` offsets) on the focal part;
  translates into place once when the `.fig` scrolls into view (IntersectionObserver adds
  `.in`). ~1.3s, `cubic-bezier(.25,.1,.25,1)`, fill-mode both.

All keyframes + observer snippet are in `references/plate-css.md`.

## Bans (each traces to a real rejection or law)

- No invented/fake-precise numbers in annotations (caught in review, 2026-07-03)
- No icon-blobs / clip-art / decorative squiggles — manual-grade drawings only
- No second hue, no gradients-as-decoration (single-hue tonal fields inside the band CTA are
  the page's business, not the plate's), no gradient text, no glow/halo (flicker = opacity)
- No SMIL; no motion that survives `prefers-reduced-motion: reduce`
- No paragraph blocks in captions — title + ONE line ("walls of text" rejection, 2026-07-03)
- Don't restyle the plate voice per-figure — coherence across plates = one hand

## Verify before returning (self-healing loop — never ship unrendered)

1. Render the page/file containing the plates:
   - Preferred: `python3 ~/.claude/skills/design-loop/shot.py <file> --out-dir <tmp> --desktop-only`
   - Fallback (shot.py missing or lying): Playwright from this repo —
     `node` + `playwright-core` (`chromium.launch()`, viewport 1440, `page.screenshot`)
   - Last resort: any headless Chrome `--screenshot`. If NOTHING can render, say so and do
     not claim the figures verified.
2. **Read the render — zoom EACH plate alone**, not the multi-up thumbnail. Crop every plate
   to ~800–1000px and read it on its own; 10px text-on-shape overlaps and stacking errors hide
   at thumbnail scale (a montage of the crops, read once, works). Check each against this list:
   texture lattice visible · all strokes one ramp color w1/w2 · fills only light steps ·
   labels in gutters (none over shapes) · leaders land on their target · no clipped label at
   the plate edge ·
   arrowheads present (shared defs included ONCE on the page!) · annotations legible +
   truthful · FIG furniture present · exactly one `flick` per plate · `ants` only on
   movement lines · captions ≤ title + 1 line · reduced-motion kill present · no overlap/
   clipped text at target width.
2b. **Dimensional-correctness pass — interrogate the 3D, don't just scan discipline.** This is
   the class of bug the HUMAN kept catching (reversed stacking, marks floating off a tilted
   face) because step 2 only checks discipline. Run it yourself, per zoomed plate:
   - **Overlap / stacking:** for every pair of parts that overlap on screen, is the NEARER one
     drawn LATER? A vertical stack must paint bottom-to-top. (Reversed stacking shipped — caught
     by the client, not by me.)
   - **Surface detail:** is every line / tick / on-object label ISO-ALIGNED (parallel to a face
     edge)? No screen-horizontal/vertical marks on a tilted plane — they float and read as
     stray. (Shipped once — caught by the client.)
   - **Faces:** top lightest, sides darker; no inside-out cube; cast-shadow tiles on the ground
     plane only.
   - **Leaders / labels:** every leader actually touches its target; every label sits in a
     gutter, clear of shapes AND the plate edge (watch label length vs gutter width).
   Composing with `references/iso-helpers.py` makes most of these pass by construction.
2c. **Compare to the bar — put your render beside `exemplars/approved-plates.png`.** Does yours
   match its DETAIL DENSITY, proportion, and polish for the same kind of concept? If it looks
   sparser, looser, or more abstract than the approved plate, it is NOT done — go back and adapt
   more from the source (more specific parts, tuned spacing, the signature details). This is the
   check that actually catches the craft gap; the discipline checklist above does not.
2d. **Micro-artifact pass — the small quirks a proper QA hunts (learned 2026-07-04, 7-archetype
   range QA).** Discipline + dimension can pass while tiny quirks remain. Per zoomed plate:
   - **Repeated units (gauges, bars, dials, cards):** the one `flick`/live marker must be drawn
     on ALL sibling units and pulse just ONE — a lone mark on a single unit (a dot on only one
     gauge's arc) reads as a stray artifact, not "live." Give every unit the same indicator;
     animate one. (Fixed C: moved the pulse to a value-dot at each needle tip, LCP's pulses.)
   - **Chip/tag under an icon (a SCHEMA tag under a doc, a badge under a card):** size the chip to
     its TEXT and leave a ≥10px clear gap from the icon, else the two merge into one blob and the
     text bleeds past the chip. (Fixed D: chip widened to text, dropped clear of the doc.)
   - **Endpoint label on a line/curve:** lift it ≥16px clear of the terminal arrowhead/dot so the
     leader doesn't stab the text. (Fixed E: raised "ORGANIC + AI" off the curve's end arrow.)
   - **Cycle/loop arrows:** an arrowhead on EACH leg; occluded/behind-box arrowheads read as
     missing, so route legs so their heads land in open space.
   - **Area fill under a curve/line:** bound the fill with the SAME point list as the line, not a
     straight chord between endpoints — a straight edge leaks past a concave/convex curve (the
     hatch sliver above the line). (Fixed E: rebuilt the compounding wedge from the curve points.)
2e. **Adversarial cold-read — the general catch for quirk classes NOT yet on any list** (added
   2026-07-04 after the human caught a hatch-fill leak that steps 2–2d all passed). Steps 2–2d only
   find classes they name; a NEW defect class ships silently until a human names it, then becomes a
   rule — so the skill is always one human-catch behind. Shrink that gap with a checklist-INDEPENDENT
   pass: pretend you did NOT draw the plate. For each zoomed plate, name every mark, state what it
   represents, and re-derive its geometry from that intent — each fill bounded by its OWN edge, each
   stack ordered, each mark on its surface, each leader touching its target. Diff INTENT-vs-render,
   not render-vs-checklist (the checklist is the blinder: you scan for the things you already fixed
   and miss the new one). **Best run as a FRESH subagent** given only the render + "assume there are
   bugs, find anything that looks wrong, geometry/craft only" — it isn't anchored to what you just
   fixed. **Then verify EACH flag against the render/coords before acting** — an adversarial eye
   over-flags (at ~1.7× crops it will call clean corner-meetings "gaps" and in-band needles "wrong");
   confirm at higher zoom or in the source numbers, keep the real ones, discard the resolution
   artifacts. Fold every genuinely-new class it surfaces into 2d as a standing rule.
3. Fix and re-render until clean. A common failure: forgetting the shared `<defs>` block —
   hatch fills and arrowheads silently vanish (bit this skill's own exemplar once).
4. Run `npx -y ui-craft-detect <file> --json` if available — zero critical findings.

## Self-improvement protocol (what keeps this skill getting better)

After EVERY use where a human reacts to the figures:
1. Append to `feedback.md` (same folder): date · surface · what was made · the verdict
   (quote the user) · the lesson in one durable line.
2. If the lesson generalizes (would change how the NEXT figure is drawn), fold it into the
   relevant rule section above — don't let the ledger and the rules drift apart. When a new
   verdict contradicts an existing rule, the newer human verdict wins: update the rule.
3. Add a dated entry to the Changelog below for any behavioral change (project convention —
   future sessions must know which vintage of the skill they loaded).
4. If the design-loop skill is installed (`~/.claude/skills/design-loop/log_reject.py`),
   mirror hard rejections there too so the global design memory learns.

New exemplars: when a figure ships and the client praises it, add it to `exemplars/` (or note
its location) — the calibration set should grow from real wins.

## Reusing outside this repo

The mechanics are portable; the ramp is not. Map `--primary-*` to the host brand's scale
(reference-site original was a cobalt ramp — see measured-spec), keep the discipline
identical: light fills, single stroke color, mono annotations, one flicker.

## Changelog

- 2026-07-04 (k): Attacked the META-limit the FIG.E hatch leak exposed — the verify checklist only
  catches classes already on it, so a NEW quirk class slips through until a human names it. Two
  structural fixes, not another reactive checklist line. (1) verify step **2e** — an adversarial
  COLD-READ that reverse-engineers each plate from intent with NO checklist, ideally via a FRESH
  subagent that didn't draw it (diffing intent-vs-render defeats the confirmation-scan that blinds
  the author), plus the discipline of VERIFYING each flag before acting (adversarial eyes over-flag
  at crop resolution). (2) `references/iso-helpers.py` **`area_under()` / `area_between()`** — a
  correct-by-construction chart fill bounded by the line's OWN points, so the straight-chord-across-
  a-curve leak is impossible to hand-write again. VALIDATED same day: ran a real fresh-subagent pass
  on the 7-plate range test — it surfaced 6 flags; verifying each against render+coords showed all 6
  were already-fixed or resolution false-positives (0 new real bugs), which both confirms the 7 are
  solid and demonstrates why the verify-each-flag step matters.
- 2026-07-04 (j): Micro-artifact QA fold. A full per-plate zoom-QA of a 7-archetype range test
  (timeline · comparison matrix · gauge trio · retrieval flow · rising chart · exploded pricing ·
  CRO cycle) surfaced three recurring small quirks — added as verify step 2d: (1) a live/`flick`
  marker on a SET of repeated units must appear on all units and pulse one (a lone mark reads as a
  stray artifact); (2) a labeled chip under an icon must be text-width + ≥10px gap or it merges
  into the icon; (3) an endpoint label on a line must sit ≥16px clear of its terminal arrow. All 7
  passed after fixes (0 detector critical). The range test itself is evidence the reference-driven
  skill (i) GENERALIZES to new archetypes, not just the approved 5.
- 2026-07-04 (i): Made the skill REFERENCE-DRIVEN, not prose-driven — the actual root cause of
  the quality gap. Client kept finding the approved originals better than every rebuild; the
  reason is that a text rulebook can't transmit proportion, spacing, and detail density, and the
  skill had never even carried the approved plates' SOURCE — it regenerated from prose each time
  (lossy). Fixes: (1) extracted the 5 approved plates VERBATIM into
  `exemplars/approved-plates.html` + a render `exemplars/approved-plates.png`; Step-0 item 3 now
  says "adapt the nearest approved plate's code; the source + screenshot ARE the spec, the rules
  are the index." (2) verify step 2c: compare your render beside approved-plates.png for
  detail-density / proportion / polish. (3) fixed rule #3 — structural numbers (axis scales,
  real ranges) are fine; the ban is only on invented fake-precise claim numbers (it had wrongly
  stripped chart axes). Meta-lesson: for VISUAL craft, ship the source code + a screenshot as the
  exemplar and adapt from it; prose alone is insufficient.
- 2026-07-04 (h): CORRECTED a wrong north-star (the biggest fix in this skill's history).
  Client set the original approved `probvar-d.html` FIG.001–005 (four-of-five FLAT, concrete,
  richly detailed) beside an all-isometric rebuild and said the originals "still LOOK much
  better." Root error: the skill had mis-attributed earlier "reference/baseline looks better"
  verdicts to *dimensionality* (rule #0, changelog c/d) and pushed every plate into abstract iso
  blocks — cleaner but generic and empty. Rewrote **rule #0**: the top lever is DEPICTING THE
  ACTUAL OBJECT with dense meaningful detail and fitting the projection to the concept (flat for
  charts/flows/UI = most plates; iso only for layers/scale). Rewrote **rule #1** (fit-first;
  flat is not a "fallback"; a flowchart is a fine object) and **rule #2** (specific detail +
  icons, not "depth"). Iso mechanics (iso-helpers, source-svg techniques) stay as a TOOL, not
  the default. The original probvar-d plates remain the approved quality bar — match them, don't
  replace them. Meta-lesson banked: when a human says "X looks better," verify WHICH variable
  actually differs before generalizing a rule — I overfit a whole direction off one abstract
  figure.
- 2026-07-04 (g): Structural upgrade in response to "can we learn something to improve the
  skill?" The pattern across the section work: the human kept catching GEOMETRY bugs (reversed
  stacking, marks floating off a tilted face) because self-verify checked discipline, not 3D
  correctness — and prose rules got skimmed and re-broken by hand. Two fixes: (1) added
  `references/iso-helpers.py` — correct-by-construction primitives (cube/floor/vstack/face_rows/
  gutter-labels/emit-labels-last) that bake the hard-won rules into functions so they can't be
  hand-rolled wrong; wired into Step 0. (2) added a **Dimensional-correctness verify pass** (2b)
  — an explicit geometry checklist (overlap→nearer-later, surface-detail-iso-aligned, faces,
  leaders/labels) to interrogate the 3D before showing a human. The deeper lesson: when the same
  *class* of defect recurs, don't just add another prose rule — encode it as a helper + a verify
  gate so it's caught by construction, not by the client.
- 2026-07-04 (f): Z-order sharpening. Client caught FIG.001 (exploded homepage) stacking
  reversed — the lowest slab painted on top of the middle one. Root cause: the (e) paint-order
  rule said "depth-sorted by ix+iy", which is right for an iso floor but WRONG for a vertical
  exploded stack (that sorts by height). Fixed the figure (paint bottom-to-top) and sharpened
  the rule: the depth key depends on the layout; for a height-stack the raised part is nearer
  and must draw last. "When two parts overlap, draw the nearer one later." Same session: also
  banked that **surface detail on an iso face must be iso-aligned** (parallel to a face edge),
  never screen-horizontal/vertical — screen-flat "content rows" on the exploded slabs floated
  and read as stray marks; removed. Folded into `source-svg-techniques.md` §1.
- 2026-07-03 (e): Perfecting pass. Client on the 5-plate section: "concept looks great, just a
  lot of small details that look off — texts overlap with the shapes, the z-index/layering
  looks wrong." Added the **Placement & z-order** section (label gutters so text never sits on
  shapes; strict back-to-front paint order with labels emitted last; compute coords from
  formulas, don't eyeball) and a **per-plate zoom-verify** step (read each plate cropped to
  ~800px, not the multi-up thumbnail — small overlaps hide at thumbnail scale). These two rules
  make the two most common "looks sloppy" defects impossible by construction.
- 2026-07-03 (d): Eval round 3 CONFIRMED — the isometric citation figure got "yes this looks
  better now"; the dimensional rule is validated, not provisional. Client then supplied a
  SECOND deep capture: the **raw inline SVG source** of six reference figures. Decompiled it
  into `references/source-svg-techniques.md` and added it to the Step-0 load order: the exact
  iso-matrix tile recipe (`matrix(0.86603 0.5 -0.86603 0.5 …)` on a unit square), the depth
  ramp (source display-p3 → `--primary-*`), reusable `#grid`/`#stripes` pattern-fill defs, the
  full CSS motion vocabulary (draw-on, travel, spin, wobble, mask-wipe, staggered settle), and
  a 7-step "how a dimensional plate gets built" recipe. Rule #0 now points at this file for
  geometry so future figures stamp a real lattice instead of hand-drawing a few boxes.
- 2026-07-03 (c): Second feedback fold (eval round 2). Added drawing-method rule #0
  "dimensional beats flat" — isometric/axonometric exploded-object drawing is the top tier and
  the default; flat 2D schematics are the floor, allowed only for genuinely-2D subjects.
  Reordered the archetype list dimensional-first. This was the named gap between the skill's
  (spec-perfect but flat) output and the reference / homepage plates.
- 2026-07-03 (b): First live feedback fold (eval round 1). Added drawing-method #5 "compose
  with ambition" — scale-showing element fields, full-canvas flow, visual state encoding,
  optional legend — after spec-faithful plates lost a taste test to freer baselines on
  creativity while winning on style fidelity. Exemplar-refresh rule: when new figures beat
  the current exemplars in review, they become the calibration set.
- 2026-07-03: Skill created from the LoudFace homepage figure work (FIG.001–005). Seeded
  rules from the session's real verdicts: figures-over-text, no invented numerals, one
  flicker per plate, CSS-not-SMIL, texture-tile paper, ramp discipline. Exemplar = the five
  approved plates; spec = client-supplied deep capture of makingsoftware.com.
