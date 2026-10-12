# Launch receipt · homepage What we do: launch stack figure

- Date: 2026-10-12
- Commits: 137120c (section), plus the review-fix commit that carries this receipt
- Lessons loaded: not run. The spine server (plugin:loudface-skills:loudface-spine) needs authorisation through /mcp, so get_client_context could not be called. The session banner's 12 house lessons were read; the applicable one ("press every clickable element on desktop and phone") was applied as a desktop, tablet and phone check.
- check.mjs: 1 FAIL, 12 WARN, 25 PASS. The FAIL (no-default-palette, 4 hits) is in files this change does not touch; the changed files have no default palette classes. The WARNs are pre-existing site-wide items, none introduced here.
- Build: `npm run build` passes; `npx tsc --noEmit` passes; `npm run test:editor` passes. Inline-edit coverage on `/`: unreachable home-v11 values are the three removed photo tiles only.
- Design gate: Paper boards "A v3 · Homepage · two columns, steps" (LoudFace Website · v11, page "Launch stack · pick a placement"); Arnel approved the homepage preview in chat ("Looks good. Let's get this live.").
- Runtime checks: three full loops on the homepage (26.9 s cycle), clean state at each restart (no clouds, no offsets, every part opaque); scrolling away during liftoff and during the rebuild resets to a complete rocket; phone (375px) shows the rocket cropped with no callouts, frame 5:9, no sideways scroll; tablet (1024px) centres the figure; headers: /figures/* SAMEORIGIN + noindex, indexifembedded; / keeps DENY.
- Fresh-agent review (Opus, clean context): no P0/P1. Fixed: indexifembedded (P2), tablet centring (P3), reduced-motion on step colours (P3).
- Open P2/P3, accepted: the four steps also appear in the Route section lower on the page (Arnel's call); the figure is ~930 KB raw / ~130 KB brotli, lazy-loaded; figure copy lives in the generated HTML, edited through design-lab/anatomy/launch-stack-src, not the inline editor; LaunchSteps accepts a step message from any same-origin frame (harmless); bento.tiles 1-3 stay in home-v11.json unused on `/`.
- Ran by: Claude (session b0293157), 2026-10-12.
