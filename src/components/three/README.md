# Hero monolith

`HeroMonolithMount` is the integration point. It ships a static SVG poster first, lazy-loads the Three.js scene after hydration on desktop, and never loads WebGL at widths of 767px or below.

`HeroMonolith` is a transparent React Three Fiber scene: a thick indigo glass slab on a soft ground pool, lit by a locally-built Lightformer chamber.

## The one thing to understand before tuning

**`MeshTransmissionMaterial` refracts the rendered scene, not the environment map.** On a transparent canvas that scene is empty black, so the slab renders as a flat dead prism no matter how bright the environment is — which is exactly how this component failed before. The fix is the `background` prop: drei swaps that texture in as `scene.background` for the transmission pass only, so the glass has something to carry while the page canvas stays transparent.

Two consequences worth keeping in mind:

- **`useBackdrop()` is the look.** That vertical gradient *is* the internal strata — it is what you see through the glass. Tune it before you touch the material.
- **Its stops are neutral grey on purpose.** The chamber already casts a strong indigo through the glass. Tinting the backdrop indigo as well stacks blue on blue, crushes the red channel to zero, and the slab reads as electric royal blue instead of smoky indigo-grey.

## Current values

| Knob | Value | Note |
|---|---|---|
| `thickness` / `ior` | `1.1` / `1.55` | |
| `attenuationColor` / `attenuationDistance` | `#818cf8` / `3.2` | Absorption supplies the indigo, not `color` |
| `color` | `#dfe1f0` | Near-neutral by design |
| `roughness` | `0.11` | |
| `clearcoat` / `clearcoatRoughness` | `0.3` / `0.22` | Kept low: clearcoat Fresnel spikes at grazing angles and made the slab flare bright as it turned |
| `chromaticAberration` / `distortion` / `anisotropicBlur` | `0.06` / `0.16` / `0.25` | |
| `resolution` / `samples` / `backsideResolution` | `512` / `6` / `256` | The perf dial — see below |
| Chamber `environmentIntensity` | `1.3` | |
| Key light | `#eef2ff`, intensity `2.6`, upper-left | |
| Violet rim | `#818cf8`, intensity `6`, behind-right | Grazes the right silhouette |

Measured at 1440×900: hue ~234° (on `#818cf8`), saturation ~0.47, no channel above ~235/255 — desaturated, and nothing blows out.

## Tuning knobs

- `FULL_ROTATION_SECONDS` controls the calm continuous turn (60 seconds).
- `MAX_TILT_RADIANS` caps the eased pointer tilt (4 degrees).
- `BASE_YAW_RADIANS` keeps the slab off face-on so it always reads three-quarter.
- `INCLUSIONS` are the dark suspended bars that give refraction parallax. Keep them *darker* than the glass — lit bars inside glass read as neon.

## Constraints this scene holds to

No bloom, glow, halo or postprocessing of any kind; depth comes from refraction, falloff and the contact shadow. Brand indigo only. With `prefers-reduced-motion: reduce` the slab stops turning and its parallax tilt eases back to neutral. The canvas background stays transparent — there is deliberately **no floor mesh**, because a lit ground plane draws a hard horizon across a transparent canvas. The ground is a soft radial pool whose alpha lives in the texture itself (an `alphaMap` ramp that is still faintly opaque at the disc rim draws a visible arc).

## Performance

One transmission FBO at 512 plus a 256 backside pass per frame, a one-shot baked environment (`frames={1}`, no HDRI fetch), and no shadow maps. That is the whole budget — comfortably 60fps on a mid-range laptop, and the first dial to turn if it is not is `resolution`, then `samples`.

## Re-exporting stills

The spin is time-based, so stills need a fixed rotation. Temporarily add a `frozenYawDeg?: number` prop threaded from the `dev-preview/monolith` page (read off a `?angle=` search param) down to `Monolith`, where it replaces the `clock.getElapsedTime()` branch. Screenshot at `deviceScaleFactor: 2` after ~120 rAF ticks so the transmission buffer and contact shadow settle, then remove the prop again. Export on `#09081c` rather than pulling the canvas over transparency — the ground pool is a compositing element and its rim dithers when lifted off its intended background.
