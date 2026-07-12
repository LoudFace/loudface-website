# The plate system CSS — canonical, extracted from the shipped section

Tokens expected on `:root` (map to the host project's brand ramp; these are LoudFace's):
`--primary-50..800` (the ramp), `--paper #fdfdff`, `--paper-line`, `--ink`, `--body`, `--mut`,
`--font-heading/--font-sans/--font-mono`, `--ease-out`.

```css
/* ---------- problem : FIELD-MANUAL FIGURE CATALOG on the crisp light stage. The five failure
   modes are ENGINEERING PLATES (FIG.001–005) in the makingsoftware reference-manual idiom,
   reskinned to LoudFace indigo: dotted-grid paper panels, 1–1.5px line drawings, light tint
   fills + one solid accent, mono UPPERCASE annotations on leader arrows, vertical FIG labels
   and bracketed plate meta. Captions are one title + one consequence line — figures do the
   talking. The catalog closes on the saturated indigo band (the one loud object).          --- */
.problem{position:relative;padding:118px 0 128px;background:var(--paper);}
.problem .container{position:relative;z-index:1;}
/* section eyebrow — ONE repeated page-wide pattern: indigo pill on light grounds,
   the light-ground counterpart of the hero's glassy pill. Same radius (999), same mono label type. */
.eyebrow{display:inline-flex;align-items:center;gap:9px;height:30px;padding:0 15px 0 13px;border-radius:999px;
  background:var(--primary-50);box-shadow:inset 0 0 0 1px var(--primary-200);
  font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.11em;text-transform:uppercase;
  color:var(--primary-700);white-space:nowrap;margin-bottom:22px;}
.eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--primary-500);flex:none;box-shadow:0 0 0 3px rgba(99,102,241,.16);}
/* on-color counterpart — glassy translucent pill (the hero's on-field vocabulary) for deep stages */
.eyebrow.glass{background:rgba(255,255,255,.10);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:rgba(255,255,255,.9);}
.eyebrow.glass i{background:var(--primary-300);box-shadow:0 0 0 3px rgba(165,180,252,.22);}
.display{font-family:var(--font-heading);font-weight:500;font-size:clamp(1.9rem,2.9vw,2.55rem);line-height:1.12;letter-spacing:-.025em;color:var(--ink);max-width:min(24ch,100%);text-wrap:balance;}
.display .ghost{color:var(--primary-600);}
/* hairline rule closing the header — crisp structure on the light stage */
.light-rule{position:relative;margin-top:40px;border-top:1px solid var(--paper-line);}
.rule-tag{position:absolute;right:0;bottom:10px;font-family:var(--font-mono);font-size:10px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--mut);white-space:nowrap;}
/* the figure catalog: five plates, two columns, the funnel cut runs full width */
.figgrid{margin-top:52px;display:grid;grid-template-columns:1fr 1fr;gap:56px 24px;}
.fig{margin:0;min-width:0;}
.fig.wide{grid-column:1/-1;}
/* the plate: paper ground = ONE small repeating SVG texture tile (measured mechanic from the
   reference capture — bg-repeat data-URI, never hand-drawn dot grids) + ONE inherited annotation
   voice: every label on every plate inherits mono / 10px / uppercase / 60%-alpha ink from this
   wrapper. Emphasized labels opt into full line-work ink via .tk. */
.plate{position:relative;border-radius:12px;background-color:#fdfdff;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Crect width='1' height='1' fill='%234f46e5' fill-opacity='.13'/%3E%3C/svg%3E");
  background-repeat:repeat;background-position:50% 50%;
  box-shadow:inset 0 0 0 1px var(--primary-100);
  font-family:var(--font-mono);font-weight:500;font-size:10px;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(10,10,10,.6);}
.plate svg{display:block;width:100%;height:auto;}
.plate text{fill:currentColor;}          /* annotations inherit the wrapper voice — one rule */
.plate text.t9{font-size:9px;}
.plate text.tk{fill:var(--primary-600);} /* emphasized labels: full line-work ink */
/* vertical plate furniture — FIG number, bracketed object meta, year stamp (inherit the plate voice) */
.fig-id,.fig-meta,.fig-yr{position:absolute;writing-mode:vertical-rl;letter-spacing:.14em;user-select:none;pointer-events:none;}
/* ---- plate motion (all CSS, no SMIL; brand.css's global prefers-reduced-motion rule kills it) ----
   MARCHING ANTS — flow lines that mean movement crawl: dasharray 4 4, offset 16 -> -16, 1s linear.
   FLICKER — exactly ONE lit line-work element per plate: opacity 1 -> .5 -> 1, .15s, infinite.
   SETTLE-IN — each plate's focal part translates into place once on scroll-into-view,
   riding the page's existing .rv IntersectionObserver (.fig gets .in). */
.plate .ants{stroke-dasharray:4 4;animation:fig-ants 1s linear infinite;}
@keyframes fig-ants{from{stroke-dashoffset:16;}to{stroke-dashoffset:-16;}}
.plate .flick{animation:fig-flick .15s linear infinite;}
@keyframes fig-flick{0%,100%{opacity:1;}50%{opacity:.5;}}
.fig .settle{--sx:0px;--sy:18px;}
.fig.in .settle{animation:fig-settle 1.3s cubic-bezier(.25,.1,.25,1) both;}
@keyframes fig-settle{from{transform:translate(var(--sx),var(--sy));}to{transform:translate(0,0);}}
.fig-id{top:14px;left:13px;}
.fig-meta{top:14px;right:13px;}
.fig-yr{bottom:14px;right:13px;}
.fig figcaption{margin-top:20px;}
.fig figcaption h3{font-family:var(--font-heading);font-weight:500;font-size:19px;line-height:1.32;letter-spacing:-.012em;color:var(--ink);max-width:36ch;text-wrap:balance;}
.fig figcaption p{margin-top:8px;font-size:14.5px;line-height:1.55;color:var(--body);max-width:64ch;}
/* the saturated indigo band closing the catalog — the one loud object on the white stage */
.pband{position:relative;margin-top:64px;display:flex;align-items:center;justify-content:space-between;
  gap:20px 32px;flex-wrap:wrap;padding:32px 36px;border-radius:18px;overflow:hidden;
  background:var(--primary-600);
  background-image:radial-gradient(120% 160% at 85% 130%, var(--primary-500) 0%, rgba(79,70,229,0) 55%),
    linear-gradient(135deg,var(--primary-800) 0%,var(--primary-600) 100%);
  box-shadow:0 2px 4px rgba(30,27,75,.18),0 28px 56px -20px rgba(30,27,75,.45);}
.pband p{display:flex;align-items:center;gap:16px;font-family:var(--font-heading);font-size:21px;font-weight:500;line-height:1.32;letter-spacing:-.01em;color:#fff;max-width:40ch;text-wrap:balance;}
.pband p i{width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.18);flex:none;}
.pband-btn{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 24px;border-radius:999px;
  background:#fff;color:var(--primary-800);font-size:15px;font-weight:500;white-space:nowrap;
  transition:background-color .2s var(--ease-out),transform .15s var(--ease-out);}
.pband-btn:hover,.pband-btn:focus-visible{background:var(--primary-50);}
.pband-btn:active{transform:scale(.98);}
.pband-btn:focus-visible{outline:2px solid #fff;outline-offset:3px;}
.pband-btn svg{width:14px;height:14px;}
```

Reveal machinery (plates ride an IntersectionObserver that adds `.in` to each `.fig`):
```js
var io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .25 });
document.querySelectorAll('.fig').forEach(f => io.observe(f));
```

A global reduced-motion kill must exist on the page:
```css
@media (prefers-reduced-motion:reduce){ * { animation:none!important; transition:none!important } }
```
