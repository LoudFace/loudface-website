// Fig 1 · The LoudFace launch stack. How one team runs one engagement, built as a two-stage rocket on its pad.
// First stage gets a company seen: content is the propellant, search, AI answers and offsite are the engines it feeds.
// Second stage gets it chosen: messaging is the tank, development the engine, design the fairing; the payload is booked calls.
// The tower is strategy, the ground station is measurement. Launch runs the engagement timeline.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg, crossingsOf } from "../../kit/tube.mjs";
import * as A from "../../kit/audit.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { glScript } from "../../scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAPTOR = join(HERE, "../raptor-engine");
const OUT = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? HERE;
const THEME = process.argv.includes("--light") ? "light" : "dark";
const DEG = Math.PI / 180;

const PORTRAIT = process.argv.includes("--portrait"); // website two-column section: callouts in a column left of the drawing
const CLEAN = PORTRAIT || process.argv.includes("--clean");
const NOTE_W = PORTRAIT ? 262 : 0;
const W = PORTRAIT ? 800 : CLEAN ? 1240 : 880;
const H = PORTRAIT ? 960 : 1080;
const AZIMUTH = 38;
const ELEVATION = 27;
const Z_EXIT = 118;
const DECK = { x: -150, y: -150, w: 300, d: 300, r: 10 };
const DECK_H = 15;
const FOOT_H = 8;
const CONE_TIP = 32;

// the stack, in s above the engine exit plane
const RR = 44; // core stage, chunkier since 2026-10-12
const R2 = 40; // second stage
const RFAIR = 50; // hammerhead fairing, wider than the stage under it
const SKIRT = [48, 68];
const TANK1 = [68, 236];
const TRUSS = [240, 280];
const TANK2 = [280, 360];
const FAIRING = [360, 480];
const BOAT = 376; // boat-tail cone 360-376, then the fairing's cylinder to 420, then the nose
const NOSE = 420;
const B_OFF = 64; // side boosters: axis distance from the core axis
const B_R = 17;
const TABLE_Z = Z_EXIT + SKIRT[0];
const MOUNT_R = 61;
const MOUNT_DEG = [-7, 83, 173, 263];
const LEGS = MOUNT_DEG.map((deg) => [MOUNT_R * Math.cos((deg * Math.PI) / 180), MOUNT_R * Math.sin((deg * Math.PI) / 180)]);
const TOWER = [56, -112];
const STATION = process.argv.includes("--portrait") ? [-98, 92] : [112, 116];

const EXPLODE_TOP = FAIRING[1] + 120;
const TOWER_TOP = Z_EXIT + 430;
const FIT = k.fitProjection(
  [...k.boxCorners(DECK, -DECK_H - FOOT_H, 0), [0, 0, Z_EXIT + EXPLODE_TOP + 4], [TOWER[0], TOWER[1], TOWER_TOP + 44], [TOWER[0] + 40, TOWER[1] - 40, TOWER_TOP + 44], ...[128, -52].map((deg) => [Math.cos((deg * Math.PI) / 180) * (B_OFF + 34 + 34), Math.sin((deg * Math.PI) / 180) * (B_OFF + 34 + 34), Z_EXIT])],
  W - NOTE_W,
  H,
  { pad: PORTRAIT ? 14 : 26, azimuth: AZIMUTH, elevation: ELEVATION },
);
const P = { ...FIT, origin: [FIT.origin[0] + NOTE_W, FIT.origin[1]] };
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const FADE = [0.04, 0.42];
const Faded = (list, style) => k.fadedSvg(list, style);
const dir = (deg) => [Math.cos(deg * DEG), Math.sin(deg * DEG), 0];
const out = (deg, r, z) => [r * Math.cos(deg * DEG), r * Math.sin(deg * DEG), z];
const AX = G.frameOf([0, 0, Z_EXIT], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const DECKF = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const towardRocket = G.unit3([-TOWER[0], -TOWER[1], 0]);

const BOOSTERS = { seo: 128, offsite: -52 }; // screen-left and screen-right; AI answers is the main engine (2026-10-12)
const PIECES = {
  strategy: { name: "Strategy · the launch tower", say: "strategy · our strategy team · call, scope, plan", move: G.mul3(G.mul3(towardRocket, -1), 34) },
  content: { name: "Content · first-stage tanks", say: "seen · content · fuels every engine", move: [0, 0, 0] },
  seo: { name: "Search (SEO) · side booster", say: "seen · search · lead SEO specialists", move: out(BOOSTERS.seo, 34, -4) },
  geo: { name: "AI answers (GEO / AEO) · main engine", say: "seen · AI answers · lead GEO specialists", move: [0, 0, -40] },
  offsite: { name: "Offsite · side booster", say: "seen · offsite · link builders", move: out(BOOSTERS.offsite, 24, -4) },
  frame: { name: "Interstage", say: "interstage", move: [0, 0, 20] },
  development: { name: "Development · second-stage engine", say: "chosen · development · Webflow or Next.js", move: [0, 0, 27] },
  messaging: { name: "Messaging · second-stage tank", say: "chosen · messaging · positioning and copy", move: [0, 0, 40] },
  payload: { name: "Booked calls · the payload", say: "result · booked calls and pipeline", move: [0, 0, 56] },
  design: { name: "Design · the fairing", say: "chosen · design · designers", move: [0, 0, 120] },
  measure: { name: "Measurement · ground station", say: "measure · Search Console, Peec AI, PostHog", move: [0, 0, 0] },
  stand: { name: "Pad", say: "", move: [0, 0, 0] },
};
// the second-stage engine is bolted to the truss: it rides the truss spring, so the two never wrap each other mid-flight
PIECES.development.move = PIECES.frame.move;
const ORDER = ["strategy", "content", "seo", "geo", "offsite", "messaging", "development", "design", "payload", "measure"];
const STATIONS = {
  strategy: ["Both halves", "Our strategy team", "Runs the 30-minute strategy call, sends a written scope in 48 hours and a growth plan in weeks 1 to 4. Holds the whole stack steady and decides what runs each month."],
  content: ["Seen", "Writers, with your experts", "Answer, comparison and ranked-list pages built from your own data and your experts' corrections, with a source behind every claim. It is the propellant every engine burns."],
  seo: ["Seen", "Lead SEO, AEO and GEO specialists", "Grow the pages Google already wants to rank: technical fixes, keyword strategy, internal links and page updates."],
  geo: ["Seen", "Lead SEO, AEO and GEO specialists", "Get named when buyers ask ChatGPT, Perplexity or Gemini who to shortlist: prompt research, crawler access and one clear description of you everywhere."],
  offsite: ["Seen", "Link builders", "Placements on the third-party pages the engines already cite, ranked by the citations those pages earn. Few placements, chosen to move the number."],
  messaging: ["Chosen", "Strategist and writers", "Positioning and page copy: one sentence that says what you are and for whom, with the proof beside it, so a visitor knows in seconds they are in the right place."],
  development: ["Chosen", "Developers", "A fast Webflow or custom Next.js build your team can edit, with tracking wired to pipeline before month one."],
  design: ["Chosen", "Designers", "Pages that earn trust and lead to the call: layout, proof, the real product, and conversion tests on what to change next."],
  payload: ["Result", "What the whole stack carries", "Booked calls and pipeline, measured in leads, not traffic. Every number is the client's own, from Search Console, Peec AI and their analytics."],
  measure: ["Both halves", "Data analysts, signed off by your lead", "Search Console for Google, Peec AI for AI answers, PostHog for leads. A note every Friday and one monthly report on what moved and what we do next."],
};
const STAGGER = ["design", "payload", "messaging", "development", "frame", "seo", "geo", "offsite", "strategy", "content", "measure", "stand"];
const SPRING = { stagger: 0.05, stiffness: 64, damping: 14.2, substeps: 4 };
const R = A.recorder(P, { order: STAGGER, spring: SPRING });
const { items, nameFor } = R;
const record = R.solid;
