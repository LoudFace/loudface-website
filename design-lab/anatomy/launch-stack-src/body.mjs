
/* ── small helpers on top of the Raptor's ─────────────────────────── */
function discAt(piece, F, s0, s1, r, style = {}, { extra = "", bias = 0, name, owner, bevel = 0 } = {}) {
  const id = nameFor(name ?? `${piece}.disc`);
  put(piece, G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "hi", ...style }) + extra, { bias, name: id, shapes: [record(A.disc(F, s0, s1, r, { name: id, owner }))] });
  return id;
}
function prismAt(piece, F, polygon, s0, s1, style = {}, { extra = "", bias = 0, name, owner } = {}) {
  const id = nameFor(name ?? `${piece}.prism`);
  const cx = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
  const centre = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, cx), G.mul3(F.v, cy)));
  put(piece, centre, S(G.prismOf(F, polygon, s0, s1, P), { tone: "mid", ...style }) + extra, { bias, name: id, shapes: [record(A.prism(F, polygon, s0, s1, { name: id, owner }))] });
}
function extrudedAt(piece, ring, z, h, style = {}, { extra = "", bias = 0, name, owner, bevel = 0.4 } = {}) {
  const id = nameFor(name ?? `${piece}.extruded`);
  const cx = ring.reduce((sum, p) => sum + p[0], 0) / ring.length;
  const cy = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
  put(piece, [cx, cy, z + h / 2], S(k.extrude(ring, z, h, P, { bevel }), { tone: "mid", ...style }) + extra, { bias, name: id, shapes: [record(A.extruded(ring, z, h, { name: id, owner }))] });
}
const flat = (p, d, n, t, w) => [p[0] + d[0] * t + n[0] * w, p[1] + d[1] * t + n[1] * w];

/* ── the pad: the Raptor's own deck, flame cone and deluge ring, so the plume registers ── */
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(DECK, -DECK_H - FOOT_H, DECK_H, P)}"/>`);
const FEET = [[-132, -132], [132, -132], [-132, 132], [132, 132], [0, -132], [0, 132], [-132, 0], [132, 0]].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of FEET) {
  back.push(S(k.cylinder(x, y, 10, -DECK_H - FOOT_H, 2, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 7.5, -DECK_H - FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
}
back.push(S(k.slabOf(DECK, -DECK_H, DECK_H, P, 8, 1.6), { tone: "mid" }));
const FRAME = { owner: "stand.frame" };
record(A.box([DECK.x, DECK.y, -DECK_H], [DECK.x + DECK.w, DECK.y + DECK.d, 0], { name: "stand.deck", ...FRAME }));
back.push(Ln(k.planOutline(k.insetPlan(DECK, 7), 0, P), { tone: "lo" }));
const DECK_SCREWS = k.corners(DECK, 15);
back.push(Ln(DECK_SCREWS.map(([x, y]) => k.ring(x, y, 3, 0, P, 18)).join(""), { tone: "lo" }));
back.push(Dots(DECK_SCREWS.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
const SIDE_TICKS = k.sideTicks(DECK.x + 20, DECK.x + DECK.w - 20, 10, 5, DECK.x + DECK.w, 0, [2.4, 4.6], P, "y");
back.push(Ln(SIDE_TICKS.minor, { tone: "lo" }), Ln(SIDE_TICKS.major, { tone: "mid" }));
const GRATE = { x: -98, y: -98, w: 196, d: 196, r: 6 };
back.push(Ln(k.planOutline(GRATE, 0, P), { tone: "lo" }));
for (let x = GRATE.x + 14; x < GRATE.x + GRATE.w - 4; x += 14) back.push(Ln(k.lineOnTop([x, GRATE.y], [x, GRATE.y + GRATE.d], 0, P), { tone: "faint" }));
const STRIP = { x: -40, y: DECK.y + DECK.d - 15, w: 170, d: 8, r: 1 };
back.push(S(k.slabOf(STRIP, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
const TICKS = k.topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y + 1, 0.8, [2.2, 4.4], P);
back.push(Ln(TICKS.minor, { tone: "lo" }), Ln(TICKS.major, { tone: "mid" }));
back.push(Dots([at([STRIP.x + 2.2, STRIP.y + 4, 0.8]), at([STRIP.x + STRIP.w - 2.2, STRIP.y + 4, 0.8])], { size: 0.45 }));
const LABEL = { x: DECK.x + DECK.w - 21, y: 20, w: 12, d: 66, r: 1.5 };
back.push(S(k.slabOf(LABEL, 0, 1, P, 3), { tone: "mid" }));
back.push(Ln(k.planOutline(k.insetPlan(LABEL, 1.8), 1, P), { tone: "faint" }));
back.push(k.faceTextSvg(k.topMatrix([LABEL.x + 7.4, LABEL.y + LABEL.d - 5], 1, P, "y"), "LOUDFACE", { size: 4.2, tone: "lo" }));
back.push(Ln([0, 1].map((row) => k.onTop([[LABEL.x + 3 + row * 2.2, LABEL.y + 5], [LABEL.x + 3 + row * 2.2, LABEL.y + (row ? 14 : 19)]], 1, P)).join(""), { tone: "lo", free: true }));
back.push(Dots([at([LABEL.x + LABEL.w / 2, LABEL.y + 2.6, 1]), at([LABEL.x + LABEL.w / 2, LABEL.y + LABEL.d - 2.6, 1])], { size: 0.45 }));
const deckTop = k.slabOf(k.insetPlan(DECK, 1), 0, 0.01, P, 8).fill;
const deckCentre = at([0, 0, 0]);
back.push(`<defs><radialGradient id="rp-deck" gradientUnits="userSpaceOnUse" cx="${deckCentre[0].toFixed(1)}" cy="${deckCentre[1].toFixed(1)}" r="${(150 * KS).toFixed(1)}" gradientTransform="translate(${deckCentre[0].toFixed(1)} ${deckCentre[1].toFixed(1)}) scale(1 ${k.cameraOf(P).sinE.toFixed(3)}) translate(${(-deckCentre[0]).toFixed(1)} ${(-deckCentre[1]).toFixed(1)})"><stop offset="0" class="rp-stop-0"/><stop offset=".28" class="rp-stop-1"/><stop offset=".7" class="rp-stop-2"/><stop offset="1" class="rp-stop-3"/></radialGradient></defs><path class="rp-deckglow" fill="url(#rp-deck)" d="${deckTop}"/>`);
back.push(`<path class="iso-halo rp-shadow" d="${k.haloOf({ x: -56, y: -56, w: 112, d: 112, r: 56 }, 0, 0.1, P)}"/>`);
back.push(S(G.disc(0, 4, 56, DECKF, P, { bevel: 1.2 }), { tone: "mid" }));
record(A.disc(DECKF, 0, 4, 56, { name: "stand.cone-plate", ...FRAME }));
back.push(Dots(G.dotsOf(DECKF, 4, 52, 28, P, { all: true }), { size: 0.45, tone: "mid" }));
const CONE_Q = 0.8;
const coneShare = (s) => Math.max(1e-4, 1 - (s - 4) / (CONE_TIP - 4));
const cone = (s) => 48 * coneShare(s) ** CONE_Q;
const coneSlope = (s) => ((-48 * CONE_Q) / (CONE_TIP - 4)) * coneShare(s) ** (CONE_Q - 1);
const CONE = Array.from({ length: 33 }, (_, index) => {
  const s = 4 + (CONE_TIP - 4) * (1 - (1 - index / 32) ** 2);
  return index === 32 ? [CONE_TIP, 0] : [s, cone(s), index ? 1 : 0];
});
back.push(S(G.solidOf(CONE, DECKF, P, { smooth: { slope: coneSlope, rows: 5 } }), { tone: "hi", inner: Ln([13, 22].map((s) => G.arcOf(DECKF, s, cone(s), P, { slope: coneSlope(s) })).join(""), { tone: "faint" }) }));
record(A.solid(DECKF, CONE, { name: "stand.cone", ...FRAME }));
const DELUGE = G.arcPoints(DECKF, 6.4, 68, 0, Math.PI * 2, 72);
for (const part of tubePieces(DELUGE, 2.1, P, { maxLength: 400, spacing: 2, closed: true })) back.push(tubeSvg(part, { tone: "mid" }));
back.push(Dots(G.dotsOf(DECKF, 8.6, 68, 36, P, { all: true }), { size: 0.5, tone: "hi" }));
record(A.tube(DELUGE, 2.1, { name: "stand.deluge", ...FRAME }));
const TEE_DEG = -12;
const TEE_R = 2.9;
const TEE_F = G.frameAlong(G.pointOf(DECKF, 6.4, 68, TEE_DEG * DEG), G.tangentOf(DECKF, TEE_DEG * DEG));
back.push(S(G.disc(-2.4, 2.4, TEE_R, TEE_F, P, { bevel: 0.3 }), { tone: "mid" }));
record(A.disc(TEE_F, -2.4, 2.4, TEE_R, { name: "stand.deluge-tee", ...FRAME }));
const FEED = G.fillet([G.pointOf(DECKF, 6.4, 68 + TEE_R - 0.2, TEE_DEG * DEG), [100, -14, 6.4], [139, -14, 6.4], [139, -14, 1.5]], 6);
for (const part of tubePieces(FEED, 2.1, P, { maxLength: 400, caps: [false, true] })) back.push(tubeSvg(part, { tone: "mid" }));
record(A.tube(FEED, 2.1, { name: "stand.deluge-feed", ...FRAME }));
back.push(S(k.slabOf({ x: 132, y: -22, w: 13, d: 16, r: 2 }, 0, 4, P, 3, 0.6), { tone: "mid" }));
record(A.box([132, -22, 0], [145, -6, 4], { name: "stand.feed-block", ...FRAME }));
back.push(Dots([at([135, -19, 4]), at([142, -9, 4])], { size: 0.45 }));

/* ── launch mount: four hold-down posts on the cone plate, each with a clamp arm under the skirt ── */
for (const deg of MOUNT_DEG) {
  const [x, y] = [MOUNT_R * Math.cos(deg * DEG), MOUNT_R * Math.sin(deg * DEG)];
  const LF = G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  discAt("stand", LF, 0, 2, 4.5, { tone: "mid" }, { name: "stand.post-foot", extra: Dots(G.dotsOf(LF, 2, 4, 6, P, { all: true }), { size: 0.36, tone: "mid" }) });
  discAt("stand", LF, 2, TABLE_Z - 6, 3.2, { tone: "mid" }, { name: "stand.post", extra: Ln([0.3, 0.62].map((f) => G.arcOf(LF, 2 + (TABLE_Z - 8) * f, 3.2, P)).join(""), { tone: "faint" }) });
  const d = dir(deg);
  const n = [-d[1], d[0]];
  const ring = [flat([0, 0], d, n, 38, -3.6), flat([0, 0], d, n, MOUNT_R + 3.6, -3.6), flat([0, 0], d, n, MOUNT_R + 3.6, 3.6), flat([0, 0], d, n, 38, 3.6)];
  extrudedAt("stand", ring, TABLE_Z - 6, 6, { tone: "mid" }, { name: "stand.clamp", extra: Dots([at([...flat([0, 0], d, n, MOUNT_R, 0), TABLE_Z]), at([...flat([0, 0], d, n, 42, 0), TABLE_Z])], { size: 0.45, tone: "hi" }) });
}

/* ── first stage core: content (thrust plate, skirt, tank with one painted band, raceway) ── */
const PAINT = { className: "ls-paint" };
band("content", AX, 45, SKIRT[0], 36, { tone: "mid" }, { name: "content.thrust-plate" });
band("content", AX, SKIRT[0], SKIRT[1], 46.5, { tone: "mid" }, { name: "content.skirt", extra: Faded(G.ribsOf(AX, SKIRT[0] + 2, SKIRT[1] - 2, 46.5, 84, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }) });
const rimsOf = (index, count) => (index === 0 ? "first" : index === count - 1 ? "last" : "none");
const TANK1_CUTS = [TANK1[0], 110, 152, 194, 212, 224, TANK1[1]];
TANK1_CUTS.slice(0, -1).forEach((s0, index, all) => {
  const painted = s0 === 212;
  band("content", AX, s0, TANK1_CUTS[index + 1], RR, painted ? PAINT : {}, { name: painted ? "content.stripe" : "content.tank", rims: painted ? "all" : rimsOf(index, all.length), inner: index && !painted && s0 !== 224 ? G.arcOf(AX, s0, RR, P) : "" });
});
band("content", AX, TANK1[1], TRUSS[0], RR + 1.4, {}, { name: "content.top-ring", extra: Dots(G.dotsOf(AX, TANK1[1] + 2, RR + 1.4, 44, P, { fade: FADE }), { size: 0.38, tone: "mid" }) });
const RACEWAY_DEG = 74;
const RF = G.frameOf([0, 0, Z_EXIT], [0, 0, 1], dir(RACEWAY_DEG), dir(RACEWAY_DEG + 90));
const trayOf = (r, w) => [[r - 0.2, -w], [r + 2.6, -w], [r + 2.6, w], [r - 0.2, w]];
function raceway(piece, r, from, to, straps) {
  const cuts = [from, ...straps.flatMap((s) => [s, s + 2.4]), to];
  for (let index = 0; index < cuts.length; index += 2) prismAt(piece, RF, trayOf(r, 1.7), cuts[index], cuts[index + 1], {}, { name: `${piece}.raceway`, owner: `${piece}.raceway` });
  for (const s of straps) prismAt(piece, RF, [[r - 0.2, -2.6], [r + 3.4, -2.6], [r + 3.4, 2.6], [r - 0.2, 2.6]], s, s + 2.4, {}, { name: `${piece}.strap`, owner: `${piece}.raceway` });
}
raceway("content", RR, 70, 210, [100, 150]);

/* ── the main engine under the core: AI answers (GEO) ─────────────── */
const ENGINE_OFF = 0;
const BELL_TOP = 30;
const bellR = (s) => 9 + 15 * Math.pow(Math.max(0, 1 - (s - 2) / (BELL_TOP - 2)), 1.5);
const bellSlope = (s) => ((-15 * 1.5) / (BELL_TOP - 2)) * Math.pow(Math.max(1e-6, 1 - (s - 2) / (BELL_TOP - 2)), 0.5);
const BELL1 = Array.from({ length: 23 }, (_, index) => {
  const s = 2 + ((BELL_TOP - 2) * index) / 22;
  return [s, bellR(s), index && index < 22 ? 1 : 0];
});
const LIPS = [];
band("geo", AX, 0, 2, 25, {}, { name: "geo.lip", bevel: 0.4 });
LIPS.push(G.arcOf(AX, 0, 25, P, { least: -0.05 }));
const geoBell = nameFor("geo.bell");
put("geo", ex(AX, 16), S(G.solidOf(BELL1, AX, P, { smooth: { slope: bellSlope, rows: 5 } }), { tone: "hi", inner: Ln([9, 19].map((s) => G.arcOf(AX, s, bellR(s), P, { slope: bellSlope(s) })).join(""), { tone: "faint" }) }), { name: geoBell, shapes: [record(A.solid(AX, BELL1, { name: geoBell, radius: bellR }))] });
band("geo", AX, BELL_TOP, 38, 11.5, {}, { name: "geo.chamber", inner: G.arcOf(AX, 34, 11.5, P) });
turned("geo", AX, [[38, 11.5], [39.5, 11], [40.6, 8.5], [41, 6]], {}, { name: "geo.dome" });
ballAt("geo", ex(AX, 43), 2, { tone: "mid", name: "geo.gimbal" });
const SPUMP = G.frameOf(G.pointOf(AX, 0, 15.6, 112 * DEG), [0, 0, 1], [1, 0, 0], [0, 1, 0]);
discAt("geo", SPUMP, 30, 45, 3.6, {}, { name: "geo.pump", extra: Faded(G.ribsOf(SPUMP, 31, 44, 3.6, 16, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }) });

/* ── side boosters: search (SEO) and offsite ───────────────────────── */
const bR = (s) => 5 + 8.2 * Math.pow(Math.max(0, 1 - (s - 1.4) / 16.6), 1.5);
const bSlope = (s) => ((-8.2 * 1.5) / 16.6) * Math.pow(Math.max(1e-6, 1 - (s - 1.4) / 16.6), 0.5);
const BBELL = Array.from({ length: 17 }, (_, index) => {
  const s = 1.4 + (16.6 * index) / 16;
  return [s, bR(s), index && index < 16 ? 1 : 0];
});
const NOSE0 = 168;
const NOSEL = 32;
const noseR = (s) => B_R * Math.pow(Math.max(0, 1 - ((s - NOSE0) / NOSEL) ** 2), 0.6);
const noseSlope = (s) => {
  const x = Math.min(0.9995, (s - NOSE0) / NOSEL);
  return (B_R * 0.6 * Math.pow(1 - x * x, -0.4) * (-2 * x)) / NOSEL;
};
const NOSECONE = Array.from({ length: 25 }, (_, index) => {
  const s = NOSE0 + NOSEL * (1 - (1 - index / 24) ** 1.6);
  return index === 24 ? [NOSE0 + NOSEL, 0] : [s, noseR(s), index ? 1 : 0];
});
const boosterFrame = (id) => G.frameOf(out(BOOSTERS[id], B_OFF, Z_EXIT), [0, 0, 1], [1, 0, 0], [0, 1, 0]);
for (const id of Object.keys(BOOSTERS)) {
  const deg = BOOSTERS[id];
  const BF = boosterFrame(id);
  band(id, BF, 0, 1.4, 13.6, {}, { name: `${id}.lip`, bevel: 0.3 });
  LIPS.push(G.arcOf(BF, 0, 13.6, P, { least: -0.05 }));
  const bellId = nameFor(`${id}.bell`);
  put(id, ex(BF, 10), S(G.solidOf(BBELL, BF, P, { smooth: { slope: bSlope, rows: 4 } }), { tone: "hi", inner: Ln(G.arcOf(BF, 9, bR(9), P, { slope: bSlope(9) }), { tone: "faint" }) }), { name: bellId, shapes: [record(A.solid(BF, BBELL, { name: bellId, radius: bR }))] });
  band(id, BF, 18, 24, 6, {}, { name: `${id}.chamber` });
  turned(id, BF, [[24, 6], [25.4, 5.6], [26.4, 4.4], [27, 3.2]], {}, { name: `${id}.dome` });
  discAt(id, BF, 27, 32, 2.4, { tone: "mid" }, { name: `${id}.mount` });
  band(id, BF, 32, 46, B_R + 1.5, { tone: "mid" }, { name: `${id}.skirt`, extra: Faded(G.ribsOf(BF, 33.5, 44.5, B_R + 1.5, 40, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }) });
  // two fins on the outer side, root on the skirt
  for (const fin of [deg - 48, deg + 48]) {
    const FF = G.frameOf(BF.o, dir(fin + 90), dir(fin), [0, 0, 1]);
    const poly = [[B_R + 1.35, 33], [B_R + 1.35, 47], [B_R + 14, 40], [B_R + 14, 31]];
    const fid = nameFor(`${id}.fin`);
    put(id, G.add3(BF.o, G.add3(G.mul3(dir(fin), B_R + 7), [0, 0, 39])), S(G.prismOf(FF, poly, -1, 1, P), { tone: "hi", crease: "lo" }), { name: fid, shapes: [record(A.prism(FF, poly, -1, 1, { name: fid }))] });
  }
  const cuts = [46, 88, 128, NOSE0];
  cuts.slice(0, -1).forEach((s0, index, all) => band(id, BF, s0, cuts[index + 1], B_R, {}, { name: `${id}.tank`, rims: rimsOf(index, all.length), inner: index ? G.arcOf(BF, s0, B_R, P) : "" }));
  const noseId = nameFor(`${id}.nose`);
  put(id, ex(BF, NOSE0 + NOSEL / 2), S(G.solidOf(NOSECONE, BF, P, { smooth: { slope: noseSlope, rows: 5 } }), { tone: "hi", ...PAINT }), { name: noseId, shapes: [record(A.solid(BF, NOSECONE, { name: noseId }))] });
  // two thrust struts across the gap to the core
  for (const s of [84, 150]) {
    const SF = G.frameAlong(G.pointOf(AX, s, RR - 0.3, deg * DEG), dir(deg));
    discAt(id, SF, 0, B_OFF - B_R - RR + 0.6, 2.6, { tone: "mid" }, { name: `${id}.strut` });
  }
}

/* ── interstage: an open truss, so the second-stage engine shows ───── */
const TRUSS_R = 35;
const BALL = 2.4;
const ROD = 1.15;
const lower = (deg) => G.pointOf(AX, TRUSS[0] + 3 + BALL, TRUSS_R, deg * DEG);
const upper = (deg) => G.pointOf(AX, TRUSS[1] - 3 - BALL, TRUSS_R, deg * DEG);
put("frame", ex(AX, TRUSS[0] + 1.5), S(G.ringBand(TRUSS[0], TRUSS[0] + 3, 26, RR, AX, P), { tone: "mid" }) + `<path class="rp-void" d="${G.circleOf(AX, TRUSS[0] + 3, 26, P)}"/>` + Ln(G.arcOf(AX, TRUSS[0] + 3, 26, P, { inward: true, least: -1 }), { tone: "lo" }) + Dots(G.dotsOf(AX, TRUSS[0] + 3, RR - 2.5, 28, P, { fade: FADE }), { size: 0.38, tone: "mid" }), { name: "frame.lower", shapes: [record(A.ring(AX, TRUSS[0], TRUSS[0] + 3, 26, RR, { name: "frame.lower" }))] });
put("frame", ex(AX, TRUSS[1] - 1.5), S(G.ringBand(TRUSS[1] - 3, TRUSS[1], 26, R2 + 1, AX, P), { tone: "mid" }), { name: "frame.upper", shapes: [record(A.ring(AX, TRUSS[1] - 3, TRUSS[1], 26, R2 + 1, { name: "frame.upper" }))] });
for (let index = 0; index < 6; index++) {
  const a = index * 60 + 15;
  ballAt("frame", lower(a), BALL, { tone: "hi", name: "frame.node" });
  ballAt("frame", upper(a + 30), BALL, { tone: "hi", name: "frame.node" });
  for (const [from, to] of [[lower(a), upper(a + 30)], [lower(a + 60), upper(a + 30)]]) {
    const axis = G.unit3(G.sub3(to, from));
    const span = G.len3(G.sub3(to, from));
    const F = G.frameAlong(from, axis);
    const s0 = Math.sqrt(BALL * BALL - ROD * ROD);
    discAt("frame", F, s0, span - s0, ROD, { tone: "mid" }, { name: "frame.strut" });
  }
}

/* ── second-stage engine: development ──────────────────────────────── */
const VAC_EXIT = TRUSS[0] + 5.5;
const VAC_TOP = 262;
const vacR = (s) => 5 + 15 * Math.pow(Math.max(0, 1 - (s - VAC_EXIT - 1.5) / (VAC_TOP - VAC_EXIT - 1.5)), 1.6);
const vacSlope = (s) => ((-15 * 1.6) / (VAC_TOP - VAC_EXIT - 1.5)) * Math.pow(Math.max(1e-6, 1 - (s - VAC_EXIT - 1.5) / (VAC_TOP - VAC_EXIT - 1.5)), 0.6);
const VAC = Array.from({ length: 19 }, (_, index) => {
  const s = VAC_EXIT + 1.5 + ((VAC_TOP - VAC_EXIT - 1.5) * index) / 18;
  return [s, vacR(s), index && index < 18 ? 1 : 0];
});
band("development", AX, VAC_EXIT, VAC_EXIT + 1.5, 20.6, {}, { name: "development.lip", bevel: 0.4 });
const vacId = nameFor("development.bell");
put("development", ex(AX, (VAC_EXIT + VAC_TOP) / 2), S(G.solidOf(VAC, AX, P, { smooth: { slope: vacSlope, rows: 5 } }), { tone: "hi", inner: Ln(G.arcOf(AX, VAC_EXIT + 6, vacR(VAC_EXIT + 6), P, { slope: vacSlope(VAC_EXIT + 6) }), { tone: "faint" }) }), { name: vacId, shapes: [record(A.solid(AX, VAC, { name: vacId, radius: vacR }))] });
band("development", AX, VAC_TOP, 269, 7, {}, { name: "development.chamber" });
turned("development", AX, [[269, 7], [270.6, 7.6], [272, 6.8], [272.6, 5]], {}, { name: "development.dome" });
discAt("development", AX, 272.6, TRUSS[1], 4.5, { tone: "mid" }, { name: "development.mount" });
const VPUMP = G.frameOf(G.pointOf(AX, 0, 11, 20 * DEG), [0, 0, 1], [1, 0, 0], [0, 1, 0]);
discAt("development", VPUMP, 263, 271, 3, {}, { name: "development.pump" });
pipe("development", [ex(VPUMP, 271), ex(VPUMP, TRUSS[1])], 1.1, { name: "development.feed", free: [false, true], maxLength: 20 });

/* ── second stage: messaging ───────────────────────────────────────── */
band("messaging", AX, TANK2[0], TANK2[0] + 3, R2 + 1.4, {}, { name: "messaging.lower-ring", extra: Dots(G.dotsOf(AX, TANK2[0] + 1.5, R2 + 1.4, 40, P, { fade: FADE }), { size: 0.38, tone: "mid" }) });
const TANK2_CUTS = [TANK2[0] + 3, 320, TANK2[1] - 4];
TANK2_CUTS.slice(0, -1).forEach((s0, index, all) => band("messaging", AX, s0, TANK2_CUTS[index + 1], R2, {}, { name: "messaging.tank", rims: rimsOf(index, all.length), inner: index ? G.arcOf(AX, s0, R2, P) : "" }));
band("messaging", AX, TANK2[1] - 4, TANK2[1], R2 + 1.4, {}, { name: "messaging.top-ring", extra: Dots(G.dotsOf(AX, TANK2[1] - 2, R2 + 1.4, 40, P, { fade: FADE }), { size: 0.38, tone: "mid" }) });
raceway("messaging", R2, TANK2[0] + 4, TANK2[1] - 5, [318]);

/* ── payload: booked calls ─────────────────────────────────────────── */
turned("payload", AX, [[TANK2[1], 26], [368, 16]], { tone: "mid" }, { name: "payload.adapter" });
const BUS = { x: -12, y: -12, w: 24, d: 24, r: 1.2 };
const BUS_Z = Z_EXIT + 368;
boxAt("payload", BUS, BUS_Z, 42, {}, { name: "payload.bus", extra: Ln(k.planOutline(k.insetPlan(BUS, 2.4), BUS_Z + 42, P, 2), { tone: "faint" }) + Dots(k.corners(BUS, 3.4).map(([x, y]) => at([x, y, BUS_Z + 42])), { size: 0.4 }) });
const panelLines = [];
for (const y of [-5, 0, 5]) panelLines.push(k.segment([13.4, y, BUS_Z + 4], [13.4, y, BUS_Z + 38], P));
for (const z of [13, 21, 29]) panelLines.push(k.segment([13.4, -10, BUS_Z + z], [13.4, 10, BUS_Z + z], P));
boxAt("payload", { x: 12, y: -10, w: 1.4, d: 20, r: 0.3 }, BUS_Z + 4, 34, { tone: "mid" }, { name: "payload.panel", extra: Ln(panelLines.join(""), { tone: "lo" }) });
boxAt("payload", { x: -13.4, y: -10, w: 1.4, d: 20, r: 0.3 }, BUS_Z + 4, 34, { tone: "mid" }, { name: "payload.panel" });
const TOPF = G.frameOf([0, 0, BUS_Z + 42], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
discAt("payload", TOPF, 0, 1.6, 7, { tone: "hi" }, { name: "payload.antenna", extra: Ln(G.circleOf(TOPF, 1.6, 4.5, P, 24), { tone: "faint" }) });
discAt("payload", TOPF, 1.6, 6, 1.1, { tone: "mid" }, { name: "payload.feed" });

/* ── hammerhead fairing: design ────────────────────────────────────── */
const OG0 = NOSE;
const OGL = FAIRING[1] - NOSE;
const ogive = (s) => RFAIR * Math.pow(Math.max(0, 1 - ((s - OG0) / OGL) ** 2), 0.55);
const ogiveSlope = (s) => {
  const x = Math.min(0.9995, Math.max(0, (s - OG0) / OGL));
  return (RFAIR * 0.55 * Math.pow(1 - x * x, -0.45) * (-2 * x)) / OGL;
};
const fairR = (s) => (s < BOAT ? R2 + ((RFAIR - R2) * (s - FAIRING[0])) / (BOAT - FAIRING[0]) : s < NOSE ? RFAIR : ogive(s));
const fairSlope = (s) => (s < BOAT ? (RFAIR - R2) / (BOAT - FAIRING[0]) : s < NOSE ? 0 : ogiveSlope(s));
const OGIVE = Array.from({ length: 29 }, (_, index) => {
  const s = OG0 + OGL * (1 - (1 - index / 28) ** 1.6);
  return index === 28 ? [FAIRING[1], 0] : [s, ogive(s), index ? 1 : 0];
});
const FAIR = [[FAIRING[0], R2], [BOAT, RFAIR], ...OGIVE];
const SHELL = [...FAIR.map(([s, r]) => [s, r]), ...FAIR.slice(0, -1).reverse().map(([s, r]) => [s, Math.max(0, r - 1.4)])];
const seamDeg = AZIMUTH + 8;
const seam = Array.from({ length: 40 }, (_, index) => {
  const s = OG0 + OGL * (index / 39) ** 0.8;
  return at(G.pointOf(AX, s, ogive(s), seamDeg * DEG));
});
const fairId = nameFor("design.fairing");
put("design", ex(AX, (FAIRING[0] + FAIRING[1]) / 2), S(G.solidOf(FAIR, AX, P, { smooth: { slope: fairSlope, rows: 6 } }), { tone: "hi", inner: Ln([G.arcOf(AX, 398, RFAIR, P), G.arcOf(AX, OG0 + 18, ogive(OG0 + 18), P, { slope: ogiveSlope(OG0 + 18) })].join(""), { tone: "faint" }) }) + Ln(k.pathOf(seam), { tone: "lo" }) + Ln(k.pathOf([at(G.pointOf(AX, BOAT, RFAIR, seamDeg * DEG)), at(G.pointOf(AX, NOSE, RFAIR, seamDeg * DEG))]), { tone: "lo" }), { name: fairId, shapes: [record(A.lathe(AX, SHELL, { name: fairId }))] });

/* ── the tower: strategy ───────────────────────────────────────────── */
const [TX, TY] = TOWER;
const TH = 11;
boxAt("strategy", { x: TX - 17, y: TY - 17, w: 34, d: 34, r: 3 }, 0, 5, { tone: "mid" }, { name: "strategy.base", extra: Dots(k.corners({ x: TX - 17, y: TY - 17, w: 34, d: 34 }, 4).map(([x, y]) => at([x, y, 5])), { size: 0.45 }) });
const POSTS = [[TX - TH, TY - TH], [TX + TH - 3.2, TY - TH], [TX - TH, TY + TH - 3.2], [TX + TH - 3.2, TY + TH - 3.2]];
for (const [x, y] of POSTS) boxAt("strategy", { x, y, w: 3.2, d: 3.2, r: 0.4 }, 5, TOWER_TOP - 5, { tone: "mid" }, { name: "strategy.post", steps: 2, bevel: 0 });
const LEVELS = [];
for (let z = 52; z < TOWER_TOP - 10; z += 48) LEVELS.push(z);
for (const z of LEVELS) {
  boxAt("strategy", { x: TX - TH + 3.2, y: TY - TH, w: 2 * TH - 6.4, d: 2, r: 0.2 }, z, 2, { tone: "mid" }, { name: "strategy.girt", steps: 2, bevel: 0 });
  boxAt("strategy", { x: TX - TH + 3.2, y: TY + TH - 2, w: 2 * TH - 6.4, d: 2, r: 0.2 }, z, 2, { tone: "mid" }, { name: "strategy.girt", steps: 2, bevel: 0 });
  boxAt("strategy", { x: TX - TH, y: TY - TH + 3.2, w: 2, d: 2 * TH - 6.4, r: 0.2 }, z, 2, { tone: "mid" }, { name: "strategy.girt", steps: 2, bevel: 0 });
  boxAt("strategy", { x: TX + TH - 2, y: TY - TH + 3.2, w: 2, d: 2 * TH - 6.4, r: 0.2 }, z, 2, { tone: "mid" }, { name: "strategy.girt", steps: 2, bevel: 0 });
}
// X-bracing on the two faces that face the viewer, post edge to post edge between girts
const braceFront = [];
const braceSide = [];
const bays = [5, ...LEVELS.map((z) => z + 2)];
for (let index = 0; index < bays.length - 1; index++) {
  const z0 = bays[index] + (index ? 0 : 0);
  const z1 = LEVELS[index];
  const yF = TY + TH;
  braceFront.push(k.segment([TX - TH + 3.2, yF, z0], [TX + TH - 3.2, yF, z1], P), k.segment([TX + TH - 3.2, yF, z0], [TX - TH + 3.2, yF, z1], P));
  const xS = TX + TH;
  braceSide.push(k.segment([xS, TY - TH + 3.2, z0], [xS, TY + TH - 3.2, z1], P), k.segment([xS, TY + TH - 3.2, z0], [xS, TY - TH + 3.2, z1], P));
}
put("strategy", [TX, TY + TH + 0.1, TOWER_TOP / 2], Ln(braceFront.join(""), { tone: "lo" }), { name: "strategy.brace-front", bias: 0.5, shapes: [record(A.box([TX - TH, TY + TH - 0.2, 5], [TX + TH, TY + TH, TOWER_TOP], { name: "strategy.brace-front" }))] });
put("strategy", [TX + TH + 0.1, TY, TOWER_TOP / 2], Ln(braceSide.join(""), { tone: "lo" }), { name: "strategy.brace-side", bias: 0.5, shapes: [record(A.box([TX + TH - 0.2, TY - TH, 5], [TX + TH, TY + TH, TOWER_TOP], { name: "strategy.brace-side" }))] });
boxAt("strategy", { x: TX - 14, y: TY - 14, w: 28, d: 28, r: 1.5 }, TOWER_TOP, 4, { tone: "mid" }, { name: "strategy.cap", extra: Ln(k.planOutline({ x: TX - 11, y: TY - 11, w: 22, d: 22, r: 1 }, TOWER_TOP + 4, P, 2), { tone: "faint" }) });
const MASTF = G.frameOf([TX, TY, TOWER_TOP + 4], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
discAt("strategy", MASTF, 0, 34, 1.3, { tone: "mid" }, { name: "strategy.mast" });
ballAt("strategy", [TX, TY, TOWER_TOP + 4 + 34 + Math.sqrt(2.2 * 2.2 - 1.3 * 1.3)], 2.2, { tone: "hi", name: "strategy.beacon" });
// two swing arms to the rocket, each ending on an umbilical plate against the skin
const L = Math.hypot(TX, TY);
const d = towardRocket;
const n = [-d[1], d[0]];
const armStart = TH / Math.max(Math.abs(d[0]), Math.abs(d[1]));
const faceT = (w) => (TH - n[1] * w) / d[1];
const near = G.dot3([n[0], n[1], 0], V) > 0 ? 4 : -4;
for (const [z, R] of [[Z_EXIT + 230, RR], [Z_EXIT + 344, R2]]) {
  const t1 = L - R - 2.4;
  const ring = [flat(TOWER, d, n, faceT(-4), -4), flat(TOWER, d, n, t1, -4), flat(TOWER, d, n, t1, 4), flat(TOWER, d, n, faceT(4), 4)];
  const lines = [];
  const t0 = Math.max(faceT(-4), faceT(4)) + 3;
  for (let t = t0; t + 12 <= t1 - 2; t += 12) {
    const a = flat(TOWER, d, n, t, near);
    const m = flat(TOWER, d, n, t + 6, near);
    const e = flat(TOWER, d, n, t + 12, near);
    lines.push(k.segment([...a, z - 6], [...m, z], P), k.segment([...m, z], [...e, z - 6], P));
  }
  extrudedAt("strategy", ring, z - 6, 6, { tone: "mid" }, { name: "strategy.arm", extra: Ln(lines.join(""), { tone: "faint" }) });
  const plate = [flat(TOWER, d, n, t1, -6), flat(TOWER, d, n, L - R, -6), flat(TOWER, d, n, L - R, 6), flat(TOWER, d, n, t1, 6)];
  extrudedAt("strategy", plate, z - 8, 10, { tone: "hi" }, { name: "strategy.umbilical", extra: Dots([at([...flat(TOWER, d, n, t1, -3.5), z]), at([...flat(TOWER, d, n, t1, 3.5), z])], { size: 0.4 }) });
}

/* ── ground station: measurement ───────────────────────────────────── */
const [SX, SY] = STATION;
const SPAD = { x: SX - 18, y: SY - 18, w: 36, d: 36, r: 3 };
boxAt("measure", SPAD, 0, 5, { tone: "mid" }, { name: "measure.pad", extra: Dots(k.corners(SPAD, 4).map(([x, y]) => at([x, y, 5])), { size: 0.45 }) + Ln(k.planOutline(k.insetPlan(SPAD, 3), 5, P, 3), { tone: "faint" }) });
const PEDF = G.frameOf([SX, SY, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
discAt("measure", PEDF, 5, 8, 9, { tone: "mid" }, { name: "measure.base", extra: Dots(G.dotsOf(PEDF, 8, 7.6, 8, P, { all: true }), { size: 0.4, tone: "mid" }) });
discAt("measure", PEDF, 8, 26, 5.2, { tone: "mid" }, { name: "measure.pedestal", extra: Ln(G.arcOf(PEDF, 17, 5.2, P), { tone: "faint" }) });
discAt("measure", PEDF, 30, 46, 5.2, { tone: "mid" }, { name: "measure.pedestal", extra: Ln(G.arcOf(PEDF, 38, 5.2, P), { tone: "faint" }) });
discAt("measure", PEDF, 26, 30, 6.8, { tone: "mid" }, { name: "measure.collar" });
const YOKE_R = 4.4;
const YOKE = [SX, SY, 46 + YOKE_R];
ballAt("measure", YOKE, YOKE_R, { tone: "mid", name: "measure.yoke" });
const DA = G.unit3(process.argv.includes("--portrait") ? [0.45, 0.2, 1] : [0.22, 0.5, 1]);
const DF = G.frameAlong(YOKE, DA);
const DISH = [[Math.sqrt(YOKE_R * YOKE_R - 1.8 * 1.8), 1.8], [5, 7, 1], [7, 17, 1], [9.4, 26]];
const dishId = nameFor("measure.dish");
put("measure", G.add3(YOKE, G.mul3(DA, 6)), S(G.solidOf(DISH, DF, P), { tone: "hi" }) + Ln(G.circleOf(DF, 9.4, 21, P, 64) + G.circleOf(DF, 9.4, 13, P, 48), { tone: "faint" }) + Dots(G.dotsOf(DF, 9.4, 24.2, 24, P, { all: true }), { size: 0.4, tone: "mid" }), { name: dishId, shapes: [record(A.solid(DF, DISH, { name: dishId }))] });
discAt("measure", DF, 9.4, 28, 1, { tone: "mid" }, { name: "measure.boom" });
turned("measure", DF, [[28, 2], [32, 4]], { tone: "hi" }, { name: "measure.horn" });
const CONSOLE = { x: SX - 90, y: SY + 2, w: 60, d: 22, r: 2 };
boxAt("measure", CONSOLE, 0, 16, { tone: "mid" }, { name: "measure.console", extra: Ln(k.planOutline(k.insetPlan(CONSOLE, 2.4), 16, P, 2), { tone: "faint" }) + Dots(k.corners(CONSOLE, 2).map(([x, y]) => at([x, y, 16])), { size: 0.4 }) });
const DIAL_X = [SX - 76, SX - 60, SX - 44];
const NEEDLE = [0.62, 0.38, 0.8];
DIAL_X.forEach((x, index) => {
  const y = SY + 13;
  const id = nameFor("measure.gauge");
  const top = 17.8;
  const ticks = k.radialTicks(x, y, 5.2, 20, 5, top, [0.8, 1.6], P, -Math.PI * 0.75, Math.PI * 1.5);
  const a = -Math.PI * 0.75 + NEEDLE[index] * Math.PI * 1.5;
  const needle = k.lineOnTop([x, y], [x + Math.sin(a) * 4.8, y - Math.cos(a) * 4.8], top, P);
  put("measure", [x, y, 16.9], S(k.cylinder(x, y, 6.4, 16, 1.8, P, 40, 0.3), { tone: "hi" }) + Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid" }) + Ln(k.ring(x, y, 6.4 - 0.9, top, P, 40), { tone: "lo" }) + Ln(needle, { tone: "hi", free: "end" }) + Dots([at([x, y, top])], { size: 0.55, tone: "hi" }), { bias: 0.2, name: id, shapes: [record(A.cylinder(x, y, 6.4, 16, 1.8, { name: id }))] });
});
cable("measure", [[CONSOLE.x + CONSOLE.w, SY + 13, 8], [CONSOLE.x + CONSOLE.w + 6, SY + 13, 8], [CONSOLE.x + CONSOLE.w + 6, SY + 13, 1], [SPAD.x, SY + 13, 1]], { name: "measure.cable", bend: 2.4 });
