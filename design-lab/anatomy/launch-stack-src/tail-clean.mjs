
/* ── the website version: one self-running figure, callouts drawn inside it, no controls ── */
A.settle(R, P);
items.sort((a, b) => a.key - b.key);
const groups = items.map((item, index) => {
  const [mx, my, mz] = item.move;
  return `<g class="it" data-piece="${item.piece}"${item.ride !== item.piece ? ` data-ride="${item.ride}"` : ""} data-k="${item.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${index}">${item.svg}</g>`;
});

const LABEL_TEXT =
  "How the LoudFace team runs an engagement, drawn as a two-stage rocket on its launch pad. The launch tower is strategy. The first stage gets you seen: content fills its tanks and feeds three engines, search, AI answers and offsite placements. The second stage gets you chosen: messaging is its tank, development its engine and design its fairing, around a payload of booked calls. A ground station measures it all with Search Console, Peec AI and PostHog, and the engines fire at the end.";
const backSvg = k.figureSvg({ width: W, height: H, label: LABEL_TEXT, body: back, className: "rp-back" });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg rp-front" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="rp-engine">${groups.join("")}</g></svg>`;
const LIP = LIPS.join("");
const glowSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg rp-glow" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="rp-glow-g"><path class="rp-rim rp-rim-soft" d="${LIP}"/><path class="rp-rim" d="${LIP}"/></g></svg>`;

/* ── clouds: a bank the rocket climbs into at liftoff, so it leaves through cloud, not through the frame edge ── */
// puffs as [dx, dy, r] in units of the cloud's scale; drawn twice, stroked then filled, so only the union's outline shows
const PUFFS = [[-0.95, 0.12, 0.34], [-0.52, -0.1, 0.48], [0.02, -0.3, 0.6], [0.56, -0.08, 0.5], [0.98, 0.14, 0.32], [0, 0.16, 0.5]];
const cloud = (cx, cy, s, tag) => {
  const c = PUFFS.map(([dx, dy, r]) => `<circle cx="${(cx + dx * s).toFixed(1)}" cy="${(cy + dy * s).toFixed(1)}" r="${(r * s).toFixed(1)}"/>`).join("");
  const base = `<ellipse cx="${cx}" cy="${(cy + 0.2 * s).toFixed(1)}" rx="${(1.18 * s).toFixed(1)}" ry="${(0.24 * s).toFixed(1)}"/>`;
  return `<g class="ls-cloud ${tag}"><g class="ls-cloud-line">${c}${base}</g><g class="ls-cloud-fill">${c}${base}</g></g>`;
};
const SKY = PORTRAIT ? { back: [[250, 96, 70, "c1"], [726, 140, 52, "c2"], [600, 60, 58, "c3"]], front: [[518, 118, 112, "c4"], [346, 70, 64, "c5"], [694, 84, 62, "c6"]] }
  : { back: [[360, 92, 80, "c1"], [1100, 120, 60, "c2"], [820, 30, 66, "c3"]], front: [[640, 104, 124, "c4"], [470, 44, 74, "c5"], [820, 70, 70, "c6"]] };
const skyDefs = `<defs><linearGradient id="ls-cloud-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--anatomy-face)"/><stop offset="1" stop-color="var(--anatomy-shade-2)"/></linearGradient></defs>`;
const skySvg = (layer) => `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg ls-sky ls-sky-${layer}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${layer === "back" ? skyDefs : ""}${SKY[layer].map(([x, y, s, t]) => cloud(x, y, s, t)).join("")}</svg>`;

/* ── callouts ──────────────────────────────────────────────────────── */
const COL_L = PORTRAIT ? NOTE_W - 14 : 500; // left notes end here (right-aligned)
const COL_R = 826; // right notes start here
const onBooster = (id, s, deg) => G.pointOf(boosterFrame(id), s, B_R, deg * DEG);
// AI answers is the main engine, Search and Offsite the boosters (2026-10-12: the homepage leads with AI answers)
const NOTES = [
  { id: "strategy", side: "right", y: 404, at: [TOWER[0] + TH, TOWER[1] + 4, Z_EXIT + 280], title: "Strategy", body: ["Our strategy team scopes", "it in 48 hours and holds", "the plan steady."] },
  { id: "seen", heading: "Gets you seen", y: 516 },
  { id: "content", y: 574, at: G.pointOf(AX, 140, RR, 64 * DEG), title: "Content", body: ["The fuel every engine burns."] },
  { id: "geo", y: 690, at: G.pointOf(AX, 8, bellR(8), 118 * DEG), title: "AI answers", role: "main engine", body: ["Get named when buyers ask AI."] },
  { id: "seo", y: 764, at: onBooster("seo", 118, 112), title: "Search", role: "booster", body: ["Grow what Google wants to rank."] },
  { id: "offsite", y: 838, at: G.pointOf(boosterFrame("offsite"), 6, bR(6), -8 * DEG), title: "Offsite", role: "booster", body: ["Placements on pages", "AI engines already cite."] },
  { id: "chosen", heading: "Gets you chosen", y: 128 },
  { id: "design", y: 184, at: G.pointOf(AX, 398, RFAIR, 118 * DEG), move: PIECES.design.move, title: "Design", body: ["Pages that earn trust."] },
  { id: "payload", y: 262, at: [0, 12, BUS_Z + 22], title: "Booked calls", role: "payload", body: ["Measured in leads, not traffic."] },
  { id: "messaging", y: 340, at: G.pointOf(AX, 334, R2, 118 * DEG), title: "Messaging", body: ["One clear line, proof beside it."] },
  { id: "development", y: 432, at: G.pointOf(AX, VAC_EXIT + 6, vacR(VAC_EXIT + 6), 112 * DEG), title: "Development", body: ["Webflow or custom Next.js."] },
  { id: "measure", side: "right", y: 968, at: G.add3(YOKE, G.mul3(DA, 9.4)), title: "Measurement", body: ["One report every month."] },
];
if (PORTRAIT) {
  for (const note of NOTES) if (note.at) note.anchor = at(note.at);
  for (const note of NOTES) if (note.id === "measure") { delete note.side; delete note.x; }
  const byId = Object.fromEntries(NOTES.map((note) => [note.id, note]));
  // laid out by hand against the anchors: each note level with its part where the drawing allows
  const Y = { chosen: 108, design: 168, payload: 238, messaging: 308, development: 390, seen: 474, content: 534, seo: 600, geo: 692, measure: 792 };
  for (const [id, y] of Object.entries(Y)) byId[id].y = y;
  // strategy sits above the tower; offsite drops straight down from its booster into a note right of the pad
  Object.assign(byId.strategy, { side: "top", at: [TOWER[0] + 14, TOWER[1] - 14, TOWER_TOP + 4], y: 44 });
  Object.assign(byId.offsite, { side: "drop", x: 632, y: 912 });
}
const f1 = (v) => v.toFixed(1);
function leader(note, anchor) {
  const [ax, ay] = anchor;
  if (note.side === "top") return `M${f1(ax)} ${f1(ay)}L${f1(ax)} ${f1(note.y + 22 + 18 * (note.body.length - 1) + 14)}`;
  if (note.side === "drop") return `M${f1(ax)} ${f1(ay)}L${f1(ax)} ${f1(note.y - 5)}L${f1(note.x - 6)} ${f1(note.y - 5)}`;
  if (note.side === "right") {
    const sx = COL_R - 12;
    const ex = Math.max(ax + Math.abs(ay - (note.y - 5)), ax + 10);
    return `M${f1(ax)} ${f1(ay)}L${f1(Math.min(ex, sx - 4))} ${f1(note.y - 5)}L${f1(sx)} ${f1(note.y - 5)}`;
  }
  const sx = (note.x ?? COL_L) + 12;
  const ny = note.y - 5;
  const ex = Math.max(sx + 4, ax - Math.abs(ay - ny));
  return `M${f1(sx)} ${f1(ny)}L${f1(ex)} ${f1(ny)}L${f1(ax)} ${f1(ay)}`;
}
const noteSvg = NOTES.map((note) => {
  if (note.heading) return `<g class="ls-note ls-heading" data-note="${note.id}"><text x="${COL_L}" y="${note.y}" text-anchor="end">${note.heading}</text><path class="ls-rule" d="M${COL_L - 150} ${note.y + 12}H${COL_L}"/></g>`;
  const anchor = at(note.at);
  note.anchor = anchor;
  const right = note.side === "right";
  const x = note.side === "top" ? W - 14 : note.side === "drop" ? note.x : right ? COL_R : note.x ?? COL_L;
  const anchorText = note.side === "top" ? "end" : right || note.side === "drop" ? "start" : "end";
  const d = leader(note, anchor);
  const role = note.role ? `<tspan class="ls-role"> · ${note.role}</tspan>` : "";
  const lines = note.body.map((line, index) => `<tspan x="${x}" dy="${index ? 18 : 22}">${line}</tspan>`).join("");
  return `<g class="ls-note" data-note="${note.id}"><path class="ls-halo" d="${d}"/><path class="ls-lead" d="${d}" pathLength="1"/><circle class="ls-dot" cx="${f1(anchor[0])}" cy="${f1(anchor[1])}" r="3.4"/><text class="ls-title" x="${x}" y="${note.y}" text-anchor="${anchorText}">${note.title}${role}<tspan class="ls-body">${lines}</tspan></text></g>`;
}).join("");
const notesSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg ls-notes" viewBox="0 0 ${W} ${H}" aria-hidden="true">${noteSvg}</svg>`;

const unit = (vector) => {
  const o = at([0, 0, 0]);
  const p = at(vector);
  return [p[0] - o[0], p[1] - o[1]];
};
const DATA = {
  W,
  H,
  V,
  EX: unit([1, 0, 0]),
  EY: unit([0, 1, 0]),
  EZ: unit([0, 0, 1]),
  camera: glCamera(P),
  exit: at([0, 0, Z_EXIT]),
  zExit: Z_EXIT,
  exitR: 62,
  coneTip: CONE_TIP,
  plumeLength: Z_EXIT - CONE_TIP,
  chamberBar: 300,
  vacuumTf: 240,
  backTf: 10,
  columns: LEGS,
  columnHalf: 3.9,
  columnTop: TABLE_Z,
  pieces: Object.fromEntries(Object.entries(PIECES).map(([id, piece]) => [id, { name: piece.name, say: piece.say }])),
  stagger: STAGGER,
  spring: SPRING,
  order: ORDER,
  notes: NOTES.filter((note) => note.anchor).map((note) => ({ id: note.id, y: note.y, x: note.x ?? null, side: note.side ?? "left", anchor: note.anchor, move: note.move ?? null })),
  colL: COL_L,
  colR: COL_R,
};

const stageHtml = `<div class="rp-stage" role="img" aria-label="${LABEL_TEXT}">${backSvg}${skySvg("back")}<canvas class="rp-plume" aria-hidden="true"></canvas>${frontSvg}${glowSvg}<canvas class="rp-veil" aria-hidden="true"></canvas><div class="rp-flash" aria-hidden="true"></div>${skySvg("front")}${notesSvg}</div>`;
// live.js expects these; they stay hidden
const quiet = `<div hidden aria-hidden="true"><span data-readout></span><span data-live></span><button type="button" data-fire tabindex="-1"><span data-fire-label></span></button></div>`;
const CLEAN_CSS = `
.iso-figure.rp{margin:0}
.iso-figure.rp .iso-plate.ls-plate{padding:0;box-shadow:none;background:transparent}
.ls-notes{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.ls-note{opacity:0;transition:opacity .7s cubic-bezier(.32,.72,0,1)}
.ls-note.on{opacity:1}
.ls-lead{fill:none;stroke:var(--anatomy-hi);stroke-width:1;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .9s cubic-bezier(.32,.72,0,1)}
.ls-note.on .ls-lead{stroke-dashoffset:0}
.ls-halo{fill:none;stroke:var(--anatomy-card);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.ls-dot{fill:var(--anatomy-hi);stroke:var(--anatomy-card);stroke-width:2;transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1)}
.ls-note.on .ls-dot{transform:scale(1)}
.ls-title{font:600 17px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;fill:var(--anatomy-strong);paint-order:stroke;stroke:var(--anatomy-card);stroke-width:5px;stroke-linejoin:round}
.ls-title text,.ls-body{font-weight:400;font-size:14.5px;fill:var(--anatomy-text)}
.ls-role{font-weight:400;fill:var(--anatomy-muted)}
.ls-note text{transform:translateY(5px);transition:transform .7s cubic-bezier(.32,.72,0,1)}
.ls-note.on text{transform:none}
.ls-heading text{font:650 19px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;fill:var(--anatomy-strong);letter-spacing:-.01em}
.ls-rule{stroke:var(--anatomy-mid);stroke-width:1;fill:none}
.iso-solid.ls-paint{--anatomy-paper:#5a52e8;--anatomy-face:#5a52e8;--anatomy-top:#6c65ee;--anatomy-shade-0:#3f37c9;--anatomy-shade-1:#4840d6;--anatomy-shade-2:#5149e0;--anatomy-shade-3:#5a52e8;--anatomy-hi:#2b2391;--anatomy-faint:#7d77f0;--anatomy-lo:#3f37c9}
.ls-sky{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.ls-cloud{opacity:0;transform:translateY(-26px);transition:opacity 1.1s cubic-bezier(.32,.72,0,1),transform 1.6s cubic-bezier(.32,.72,0,1)}
.ls-cloud-line circle,.ls-cloud-line ellipse{fill:none;stroke:var(--anatomy-lo);stroke-width:2.2}
.ls-cloud-fill circle,.ls-cloud-fill ellipse{fill:url(#ls-cloud-g)}
.ls-sky-back .ls-cloud{--o:.75}.ls-sky-front .ls-cloud{--o:1}
.rp-stage.ls-sky-on .ls-cloud{opacity:var(--o);transform:none}
.rp-stage.ls-sky-on .c4{transition-delay:0s}.rp-stage.ls-sky-on .c5,.rp-stage.ls-sky-on .c1{transition-delay:.12s}.rp-stage.ls-sky-on .c6,.rp-stage.ls-sky-on .c2,.rp-stage.ls-sky-on .c3{transition-delay:.22s}
.rp-stage.ls-sky-on .ls-sky-front .ls-cloud{animation:ls-drift 9s ease-in-out 1.6s infinite alternate}
@keyframes ls-drift{to{transform:translateX(10px)}}
/* while it climbs, the rocket, its plume and glow fade out over the top fifth of the frame, under the clouds */
.rp-stage.ls-lifting>.rp-front,.rp-stage.ls-lifting>.rp-plume,.rp-stage.ls-lifting>.rp-glow,.rp-stage.ls-lifting>.rp-veil{-webkit-mask-image:linear-gradient(to bottom,transparent 6%,#000 20%);mask-image:linear-gradient(to bottom,transparent 6%,#000 20%)}
@media (prefers-reduced-motion: reduce){.ls-note,.ls-lead,.ls-dot,.ls-note text,.ls-cloud{transition:none;animation:none}}
`;
const SITE = process.argv.includes("--site");
// loudface.co: v11 type (Satoshi, Neue Montreal) and ink, the indigo accent on the callout dots, the ground from ?ground=
const SITE_CSS = `
@font-face{font-family:Satoshi;src:url(/fonts/Satoshi-Regular.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Satoshi;src:url(/fonts/Satoshi-Bold.woff2) format("woff2");font-weight:700;font-display:swap}
@font-face{font-family:"Neue Montreal";src:url(/fonts/NeueMontreal-Medium.woff2) format("woff2");font-weight:500;font-display:swap}
.iso[data-theme="light"]{--ground:#f6f6f6;--anatomy-page:var(--ground);--anatomy-card:var(--ground);--anatomy-paper:var(--ground);
  --anatomy-strong:#1a1040;--anatomy-text:#4a4466;--anatomy-muted:#6b6788;
  --anatomy-hi:#2a2350;--anatomy-mid:#8a86a6;--anatomy-lo:#bdbad0;--anatomy-faint:#dedce8;--anatomy-lit:#4f46e5;
  --anatomy-face:#ffffff;--anatomy-top:#ffffff;--anatomy-shade-0:#d9d7e5;--anatomy-shade-1:#e3e1ec;--anatomy-shade-2:#ecebf3;--anatomy-shade-3:#f4f3f8;
  --anatomy-halo:#5a5480;--anatomy-dot:#2a2350}
html,body{background:var(--ground)}
.iso-page{width:100%;margin:0}
.ls-plate{--anatomy-paper:var(--ground)}
.ls-dot{fill:#4f46e5}
.ls-title{font:700 17px/1 Satoshi,ui-sans-serif,system-ui,sans-serif;letter-spacing:-.005em}
.ls-body{font-weight:400;font-size:15px}
.ls-heading text{font:500 22px/1 "Neue Montreal",ui-sans-serif,system-ui,sans-serif;letter-spacing:-.02em}
/* phones: the callouts would print at ~7px, so the frame drops them and crops to the rocket's right two thirds (the page frames it at 5:9) */
@media (max-width:600px){html,body{overflow:hidden}.rp-stage>.ls-notes{display:none}.iso-figure.rp .rp-stage{width:150%;margin-left:-50%}}
`;
const SITE_JS = `
const g = new URLSearchParams(location.search).get("ground");
if (g && /^[0-9a-f]{6}$/i.test(g)) document.body.style.setProperty("--ground", "#" + g);
`;
const body = `<figure class="iso-figure rp"><div class="iso-plate ls-plate">${stageHtml}${quiet}</div></figure>`;

/* ── live.js, adapted, then the timeline ───────────────────────────── */
const CSS = readFileSync(join(RAPTOR, "raptor.css"), "utf8");
let LIVE = readFileSync(join(RAPTOR, "live.js"), "utf8");
const swap = (from, to) => {
  if (!LIVE.includes(from)) throw new Error(`live.js patch missing: ${from.slice(0, 60)}`);
  LIVE = LIVE.split(from).join(to);
};
swap(
  "const vec2 COL0=vec2(${D.columns[0][0].toFixed(1)},${D.columns[0][1].toFixed(1)});\nconst vec2 COL1=vec2(${D.columns[1][0].toFixed(1)},${D.columns[1][1].toFixed(1)});",
  "const vec2 COL0=vec2(${D.columns[0][0].toFixed(1)},${D.columns[0][1].toFixed(1)});\nconst vec2 COL1=vec2(${D.columns[1][0].toFixed(1)},${D.columns[1][1].toFixed(1)});\nconst vec2 COL2=vec2(${D.columns[2][0].toFixed(1)},${D.columns[2][1].toFixed(1)});\nconst vec2 COL3=vec2(${D.columns[3][0].toFixed(1)},${D.columns[3][1].toFixed(1)});",
);
swap(
  "float columnsNear(vec3 o,vec3 V){return max(columnNear(o,V,COL0),columnNear(o,V,COL1));}",
  "float columnsNear(vec3 o,vec3 V){return max(max(columnNear(o,V,COL0),columnNear(o,V,COL1)),max(columnNear(o,V,COL2),columnNear(o,V,COL3)));}",
);
swap(
  `float engineR(float z){
  float s=z-ZE;
  float b=36.+29.*(1.-pow(clamp(s,0.,120.)/120.,1.6))+3.;
  return mix(b,48.,smoothstep(108.,124.,s))*smoothstep(-6.,0.,s)*(1.-smoothstep(318.,330.,s));
}`,
  `float engineR(float z){
  float s=z-ZE;
  float b=s<48.?80.:(s<214.?83.:(s<240.?46.:(s<280.?45.:(s<360.?42.:(s<376.?mix(42.,51.,(s-360.)/16.):51.)))));
  float x=clamp((s-${OG0.toFixed(1)})/${OGL.toFixed(1)},0.,1.);
  b=mix(b,${RFAIR.toFixed(1)}*pow(max(0.,1.-x*x),.55)+1.,step(${OG0.toFixed(1)},s));
  return b*smoothstep(-6.,0.,s)*(1.-smoothstep(${(FAIRING[1] - 4).toFixed(1)},${(FAIRING[1] + 2).toFixed(1)},s));
}`,
);
// no tour, no hover, no keys: the timeline below drives it
swap("let touring = !still.matches;", "let touring = false;");
swap("let jitter = [0, 0];", `let jitter = [0, 0];
let LIFT = [0, 0];
const DROP = {};
const ROCKET = new Set(["content", "seo", "geo", "offsite", "frame", "development", "messaging", "payload", "design"]);`);
swap(`    const tx = (D.EX[0] * node.m[0] + D.EY[0] * node.m[1] + D.EZ[0] * node.m[2]) * share;
    const ty = (D.EX[1] * node.m[0] + D.EY[1] * node.m[1] + D.EZ[1] * node.m[2]) * share;
    const text = share === 0 ? "" : \`translate(\${tx.toFixed(2)} \${ty.toFixed(2)})\`;`, `    const up = ROCKET.has(node.piece) ? [LIFT[0] + D.EZ[0] * (DROP[node.piece] || 0), LIFT[1] + D.EZ[1] * (DROP[node.piece] || 0)] : null;
    const tx = (D.EX[0] * node.m[0] + D.EY[0] * node.m[1] + D.EZ[0] * node.m[2]) * share + (up ? up[0] : 0);
    const ty = (D.EX[1] * node.m[0] + D.EY[1] * node.m[1] + D.EZ[1] * node.m[2]) * share + (up ? up[1] : 0);
    const text = share === 0 && !(up && (up[0] || up[1])) ? "" : \`translate(\${tx.toFixed(2)} \${ty.toFixed(2)})\`;`);
swap('  glowGroup.setAttribute("transform", shift);', '  glowGroup.setAttribute("transform", LIFT[1] ? \`translate(\${(jitter[0] + LIFT[0]).toFixed(2)} \${(jitter[1] + LIFT[1]).toFixed(2)})\` : shift);');
swap("    uJit: jitter,", "    uJit: [jitter[0] + LIFT[0], jitter[1] + LIFT[1]],");
swap('stage.addEventListener("pointermove"', 'if (false) stage.addEventListener("pointermove"');
swap('stage.addEventListener("pointerleave"', 'if (false) stage.addEventListener("pointerleave"');
swap('stage.addEventListener("pointerdown"', 'if (false) stage.addEventListener("pointerdown"');
swap('stage.addEventListener("keydown"', 'if (false) stage.addEventListener("keydown"');
LIVE = LIVE.replace("__DATA__", JSON.stringify(DATA));

const TIMELINE = `
/* ── the loop: callouts build bottom up, the fairing lifts on the payload and closes, ignition, liftoff, back on the pad ── */
const notesEl = stage.querySelector(".ls-notes");
const noteEl = (id) => notesEl.querySelector('[data-note="' + id + '"]');
// the page beside the figure lights the matching engagement step (Week 0 call, plan, ship, grow)
const tell = (step) => { try { if (parent !== window) parent.postMessage({ type: "launch-stack", step }, location.origin); } catch (_) {} };
const STEPS = [
  [0.6, "strategy", 1], [1.8, "seen", 2], [2.6, "content"], [3.6, "geo"], [4.4, "seo"], [5.2, "offsite"],
  [6.6, "chosen"], [7.4, "messaging"], [8.4, "development"], [9.4, "design"],
  [10.6, "@open"], [11.4, "payload"], [14.0, "@close"], [14.8, "measure", 3], [15.8, "@fire"],
  [18.6, "@liftoff", 4], [21.4, "@cutoff"], [22.4, "@home"], [26.8, "@restart", 0],
];
const design = D.notes.find((note) => note.id === "design");
const designLead = noteEl("design");
function placeDesign() {
  const share = piece.design.x;
  const ax = design.anchor[0] + D.EZ[0] * design.move[2] * share;
  const ay = design.anchor[1] + D.EZ[1] * design.move[2] * share;
  const sx = D.colL + 12;
  const ny = design.y - 5;
  const ex = Math.max(sx + 4, ax - Math.abs(ay - ny));
  const d = "M" + sx + " " + ny + "L" + ex.toFixed(1) + " " + ny + "L" + ax.toFixed(1) + " " + ay.toFixed(1);
  designLead.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
  const dot = designLead.querySelector("circle");
  dot.setAttribute("cx", ax.toFixed(1));
  dot.setAttribute("cy", ay.toFixed(1));
}
let follow = 0;
function tracking() {
  placeDesign();
  follow = Math.abs(piece.design.x - piece.design.target) > 1e-3 || piece.design.pending ? requestAnimationFrame(tracking) : 0;
}
function fairing(open) {
  piece.design.pending = null;
  piece.design.target = open ? 1 : 0;
  run();
  if (!follow) follow = requestAnimationFrame(tracking);
}
// liftoff: z rises as a constant acceleration; parts and plume shift by the same screen vector
const rocketEls = nodes.filter((node) => ROCKET.has(node.piece)).map((node) => node.el);
let liftAt = -1;
let liftFrame = 0;
function climb(now) {
  if (liftAt < 0) liftAt = now;
  const t = (now - liftAt) / 1000;
  const z = 0.5 * 240 * t * t;
  LIFT = [D.EZ[0] * z, D.EZ[1] * z];
  place();
  if (!frame) run();
  liftFrame = z < 1400 ? requestAnimationFrame(climb) : 0;
}
// rebuild: after it flies off, a new rocket is stacked on the pad part by part, bottom up, each dropping in from above
const BUILD = ["content", "geo", "seo", "offsite", "frame", "development", "messaging", "payload", "design"];
const BUILD_H = 240, BUILD_GAP = 0.34, BUILD_DUR = 0.62;
const partEls = Object.fromEntries(BUILD.map((id) => [id, nodes.filter((node) => node.piece === id).map((node) => node.el)]));
let buildAt = -1;
let buildFrame = 0;
function build(now) {
  if (buildAt < 0) buildAt = now;
  const t = (now - buildAt) / 1000;
  let done = true;
  BUILD.forEach((id, index) => {
    const u = Math.min(1, Math.max(0, (t - index * BUILD_GAP) / BUILD_DUR));
    if (u < 1) done = false;
    DROP[id] = BUILD_H * Math.pow(1 - u, 3);
    const o = Math.min(1, u * 2.4).toFixed(3);
    partEls[id].forEach((el) => { el.style.opacity = o; });
  });
  place();
  buildFrame = done ? 0 : requestAnimationFrame(build);
}
function built() {
  cancelAnimationFrame(buildFrame);
  buildFrame = 0;
  BUILD.forEach((id) => { DROP[id] = 0; partEls[id].forEach((el) => { el.style.opacity = "1"; }); });
  place();
}
function home() {
  cancelAnimationFrame(liftFrame);
  liftFrame = 0;
  liftAt = -1;
  rocketEls.forEach((el) => { el.style.transition = "none"; el.style.opacity = "0"; });
  BUILD.forEach((id) => { DROP[id] = BUILD_H; });
  LIFT = [0, 0];
  place();
  stage.classList.remove("ls-sky-on", "ls-lifting");
  buildAt = -1;
  buildFrame = still.matches ? (built(), 0) : requestAnimationFrame(build);
}
let timers = [];
let playing = false;
function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  notesEl.querySelectorAll(".ls-note").forEach((el) => el.classList.remove("on"));
  if (burn.on) shutdown();
  if (liftFrame || LIFT[1]) { home(); built(); }
  if (buildFrame) built();
  piece.design.target = 0;
  run();
  tell(0);
}
function play() {
  reset();
  playing = true;
  for (const [time, action, step] of STEPS) {
    timers.push(setTimeout(() => {
      if (step !== undefined) tell(step);
      if (action === "@open") fairing(true);
      else if (action === "@close") { fairing(false); noteEl("payload").classList.remove("on"); }
      else if (action === "@fire") ignite(false);
      else if (action === "@liftoff") { notesEl.querySelectorAll(".ls-note").forEach((el) => el.classList.remove("on")); stage.classList.add("ls-sky-on", "ls-lifting"); liftFrame = requestAnimationFrame(climb); }
      else if (action === "@cutoff") shutdown();
      else if (action === "@home") home();
      else if (action === "@restart") play();
      else noteEl(action).classList.add("on");
    }, time * 1000));
  }
}
function settled() {
  notesEl.querySelectorAll(".ls-note").forEach((el) => el.classList.add("on"));
  piece.design.target = 1;
  piece.design.x = 1;
  place();
  placeDesign();
}
if (still.matches || new URLSearchParams(location.search).has("still")) settled();
else
  new IntersectionObserver(
    (entries) => {
      const seen = entries[entries.length - 1].isIntersecting;
      if (seen && !playing) play();
      if (!seen && playing) {
        playing = false;
        reset();
      }
    },
    { threshold: 0.25 },
  ).observe(stage);
`;

const page = k.pageHtml({ title: "The LoudFace launch stack", theme: THEME, body: `<style>${CSS}${CLEAN_CSS}${SITE ? SITE_CSS : ""}</style>${body}`, script: (SITE ? SITE_JS : "") + glScript() + LIVE + TIMELINE, width: 1200 });
mkdirSync(OUT, { recursive: true });
const fileName = SITE ? (PORTRAIT ? "launch-stack-portrait.html" : "launch-stack.html") : THEME === "light" ? "launch-stack-annotated-light.html" : "launch-stack-annotated.html";
writeFileSync(join(OUT, fileName), page);
console.log("wrote", fileName, `${(page.length / 1024).toFixed(0)} KB`, `${items.length} items`);
