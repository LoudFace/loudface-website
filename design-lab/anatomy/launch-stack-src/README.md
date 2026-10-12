# The LoudFace launch stack (Fig 1)

Source for `../launch-stack-light.html` and `../launch-stack.html`, built with the Anatomy skill
(https://github.com/wheresryan22/anatomy).

To rebuild: clone that repo, copy this folder to `examples/launch-stack/`, then from the repo root:

    ./examples/launch-stack/assemble.sh
    node examples/launch-stack/build.mjs --light --out=<dir>
    node examples/launch-stack/build.mjs --out=<dir>
    node examples/launch-stack/build.mjs --light --audit --out=<dir>   # must end "audit passed"
    node examples/launch-stack/build-clean.mjs --clean --light --out=<dir>   # the website version
    node scripts/lines.mjs <dir>/launch-stack-light.html               # must print "line ends: 0"

`assemble.sh` joins head, the Raptor example's drawing helpers (lines 92-305 of its build) and body/tail.
The page reuses the Raptor's live.js and raptor.css, patched in tail.mjs (rocket outline in the plume
shader, four hold-down posts as occluders, engagement-timeline wording).

`build-clean.mjs` (from `tail-clean.mjs`) is the website version, `launch-stack-annotated-light.html`: no controls, callouts drawn in the figure, a 28-second loop (callouts draw in bottom up, engines fire, the fairing lifts on the payload, fade, repeat). It pauses off screen and shows the finished state under reduced motion.

2026-10-12, v2: chunkier rocket (core r 44, shorter stack), two side boosters with fins and indigo nose cones (AI answers left, Offsite right), Search as the single main engine, a hammerhead fairing, an indigo band on the core. The website version is now portrait, `--portrait --clean --light --site`, written as `launch-stack-portrait.html` (800 x 960) for a two-column section; callouts sit in one column left of the drawing. The second-stage engine rides the truss spring (`PIECES.development.move = PIECES.frame.move`; assemble.sh patches the helper's `rideOf` so it finds the shared spring). Geometry audit passes; line check 0 of 647.

2026-10-12, v3: AI answers is the main engine (the homepage leads with it); Search and Offsite are the boosters. The loop no longer lifts the fairing mid-burn: it lifts and closes before ignition, then the rocket lifts off (rocket parts and the plume shift by one screen vector, `LIFT`, patched into place() and uJit) and fades back in on the pad. The figure posts `{ type: "launch-stack", step }` (1 call, 2 plan, 3 ship, 4 grow, 0 reset) to its parent; `src/app/home-v11/LaunchSteps.tsx` lights the matching row. Audit passed; line check 0 of 647.

2026-10-12, v4: at liftoff a bank of drawn clouds (`skySvg`, back and front layers) drifts in at the top and the rocket, plume and glow fade over the top fifth of the frame (`.ls-lifting` mask), so the rocket leaves through cloud instead of the frame edge. Clouds sit fully inside the frame and leave on `home()`. Line check 0 of 647.

2026-10-12, v5: after liftoff a new rocket is stacked on the pad bottom up (core, main engine, boosters, truss, second-stage engine, tank, payload, fairing), each part dropping 240 units from above while it fades in (`DROP`, `build()`), about 3.7 s. The loop is now 26.8 s.
