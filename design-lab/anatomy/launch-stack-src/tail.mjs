
/* ── assemble ──────────────────────────────────────────────────────── */
A.settle(R, P);
items.sort((a, b) => a.key - b.key);
const groups = items.map((item, index) => {
  const [mx, my, mz] = item.move;
  return `<g class="it" data-piece="${item.piece}"${item.ride !== item.piece ? ` data-ride="${item.ride}"` : ""} data-k="${item.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${index}">${item.svg}</g>`;
});

const LABEL_TEXT =
  "A two-stage rocket on its launch pad, standing for one LoudFace engagement. The first stage gets a company seen: its tanks are the content, and its three engines are search, AI answers and offsite placements. An open truss carries the second stage, which gets the company chosen: its tank is messaging, its engine is development and its fairing is design, around a payload of booked calls. A launch tower with two swing arms is the strategy, and a ground station with a dish and three gauges is the measurement.";
const backSvg = k.figureSvg({ width: W, height: H, label: LABEL_TEXT, body: back, className: "rp-back" });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg rp-front" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="rp-engine">${groups.join("")}</g></svg>`;
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
  exitR: 40,
  coneTip: CONE_TIP,
  plumeLength: Z_EXIT - CONE_TIP,
  chamberBar: 300,
  vacuumTf: 240,
  backTf: 10,
  columns: LEGS,
  columnHalf: 3.9,
  columnTop: TABLE_Z,
  pieces: Object.fromEntries(Object.entries(PIECES).map(([id, piece]) => [id, { name: piece.name, say: piece.say }])),
  stations: STATIONS,
  stagger: STAGGER,
  spring: SPRING,
  order: ORDER,
};

const PARTS = ORDER.map((id, index) => `<button type="button" class="rp-part" data-part="${id}"><span class="rp-num">${String(index + 1).padStart(2, "0")}</span>${PIECES[id].name}</button>`).join("");
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">Fig 1</span><span class="iso-plate-corner" data-corner="title">The LoudFace launch stack</span><span class="iso-plate-corner" data-corner="readout" data-readout>on the pad</span></div>`;
const controls = `<div class="rp-controls"><button type="button" class="rp-fire" data-fire><span class="rp-lamp" aria-hidden="true"></span><span data-fire-label>Launch</span></button><span class="rp-hint">Hover the rocket to take it apart</span><span class="rp-live" aria-live="polite" data-live></span></div>`;
const LIP = LIPS.join("");
const glowSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg rp-glow" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="rp-glow-g"><path class="rp-rim rp-rim-soft" d="${LIP}"/><path class="rp-rim" d="${LIP}"/></g></svg>`;
const stageHtml = `<div class="rp-stage" tabindex="0" role="slider" aria-label="The LoudFace launch stack. Hover or use the arrow keys to take the rocket apart station by station; press L or the Launch button to run the engagement timeline, Escape to put it back together." aria-valuemin="0" aria-valuemax="${ORDER.length}" aria-valuenow="0" aria-valuetext="On the pad">${backSvg}<canvas class="rp-plume" aria-hidden="true"></canvas>${frontSvg}${glowSvg}<canvas class="rp-veil" aria-hidden="true"></canvas><div class="rp-flash" aria-hidden="true"></div></div>`;
const caption =
  "One team, one retainer, one rocket. The first stage gets you seen: content is the propellant, and search, AI answers and offsite placements are the engines it feeds. The second stage gets you chosen: messaging, development and design on your own site carry the buyer the rest of the way to the payload, booked calls. The tower is the strategy that holds the stack steady before launch, and the ground station reads Search Console, Peec AI and PostHog into one monthly report. Launch runs the timeline: strategy call, growth plan in weeks 1 to 4, ship and measure in weeks 4 to 6, then grow every month from month 3.";
const STATION_CSS = `.ls-station{margin:14px 0 0;min-height:5.8em;font:14px/1.55 system-ui,-apple-system,sans-serif;color:var(--anatomy-strong)}.ls-station .ls-half{display:block;font:11px/1.4 var(--anatomy-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--anatomy-muted)}.ls-station .ls-who{color:var(--anatomy-text)}`;
const body = `<figure class="iso-figure rp"><div class="iso-plate">${corners}${stageHtml}${controls}</div><figcaption class="iso-legend"><span class="rp-parts">${PARTS}</span><p class="ls-station" data-station></p><span class="iso-caption">${caption}</span></figcaption></figure>`;

/* ── the Raptor's live script, adapted: rocket outline, four table legs, the engagement timeline ── */
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
  float b=mix(42.,40.,smoothstep(44.,50.,s));
  float x=clamp((s-${OG0.toFixed(1)})/${OGL.toFixed(1)},0.,1.);
  b=mix(b,39.*pow(max(0.,1.-x*x),.55)+1.,step(${OG0.toFixed(1)},s));
  return b*smoothstep(-6.,0.,s)*(1.-smoothstep(${(FAIRING[1] - 4).toFixed(1)},${(FAIRING[1] + 2).toFixed(1)},s));
}`,
);
swap('if (id === "stand") id = null;', "if (id && !D.order.includes(id)) id = null;");
swap(
  '  stage.setAttribute("aria-valuenow", String(id ? D.order.indexOf(id) + 1 : 0));',
  '  stage.setAttribute("aria-valuenow", String(id ? D.order.indexOf(id) + 1 : 0));\n  stationLine(id);',
);
swap("function select(id) {", `const stationEl = root.querySelector("[data-station]");
function stationLine(id) {
  if (!stationEl) return;
  const s = id && D.stations[id];
  stationEl.innerHTML = s ? '<span class="ls-half">' + s[0] + " · " + String(D.order.indexOf(id) + 1).padStart(2, "0") + '</span><b>' + D.pieces[id].name + '</b> — <span class="ls-who">' + s[1] + ".</span> " + s[2] : '<span class="ls-half">Hover a part or pick a station</span>Ten stations, one team: the tower and the ground station run the whole flight, the first stage gets you seen, the second gets you chosen.';
}
function select(id) {`);
swap('"Assembled, cold"', '"On the pad"');
swap('"apart · 11 assemblies"', '"apart · 10 stations"');
swap('"1,630 kg · cold"', '"on the pad"');
swap('say("closing up · arming");', 'say("countdown · strategy call");');
swap('announce("arming");', 'announce("countdown, strategy call");');
swap('say(burn.pc > 0.01 ? `shutdown · ${bar} bar` : "shutdown · purging");', 'say(burn.pc > 0.01 ? "monthly report · what moved" : "monthly report · what we do next");');
swap('announce("shutdown");', 'announce("monthly report");');
swap('say("chill-down · venting");', 'say("weeks 1–4 · growth plan");');
swap('announce("chill-down, venting");', 'announce("weeks 1 to 4, growth plan");');
swap("say(`spin-up · preburners lit · ${bar} bar`);", 'say("weeks 4–6 · ship and measure");');
swap('announce("preburners lit");', 'announce("weeks 4 to 6, ship and measure");');
swap("say(`Pc ${bar} bar · ${thrust} tf`);", 'say("month 3 on · grow every month");');
swap('announce("main stage");', 'announce("month 3 onward, grow every month");');
swap('fireLabel.textContent = "Shut down";', 'fireLabel.textContent = "Stop";');
swap('fireLabel.textContent = "Ignite";', 'fireLabel.textContent = "Launch";');
swap('event.key === "i" || event.key === "I"', 'event.key === "l" || event.key === "L"');
swap('"Tap to take apart" : "Hover the engine to take it apart"', '"Tap to take apart" : "Hover the rocket to take it apart"');
swap("place();\nsay(idleText());", "place();\nsay(idleText());\nstationLine(null);");
LIVE = LIVE.replace("__DATA__", JSON.stringify(DATA));

const page = k.pageHtml({ title: "The LoudFace launch stack", theme: THEME, body: `<style>${CSS}${STATION_CSS}</style>${body}`, script: glScript() + LIVE, width: 930 });
mkdirSync(OUT, { recursive: true });
const fileName = THEME === "light" ? "launch-stack-light.html" : "launch-stack.html";
writeFileSync(join(OUT, fileName), page);
console.log("wrote", fileName, `${(page.length / 1024).toFixed(0)} KB`, `${items.length} items`, `${R.solids.length} shapes`);

A.auditOrExit(R, P, { crowd: [] });
