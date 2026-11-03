/**
 * Proof page for the chart port: draws every board chart with drawChart into one HTML file (site fonts embedded from
 * public/fonts) and screenshots it with Playwright, to compare against the board's shots in
 * design-lab/research-2026-11-03/_shots. Not a test and not shipped.
 *
 *   npx tsx src/app/research-v11/charts/__tests__/render-board.ts <out-dir>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import type {
  ChartGround,
  ChartSize,
  ChartSpec,
  ChartTone,
} from "../../contract";
import { drawChart } from "../draw";
import { BENCH_FIGURE_SPECS, STUDY_CHART_SPECS } from "../fixtures";
import { SERIES_COLOURS } from "../theme";

const OUT = resolve(process.argv[2] ?? "charts-port");
const ROOT = resolve(__dirname, "../../../../..");
const font = (f: string) =>
  `data:font/woff2;base64,${readFileSync(join(ROOT, "public/fonts", f)).toString("base64")}`;
const LOGO = `data:image/svg+xml;base64,${readFileSync(join(ROOT, "public/lf-logo.svg")).toString("base64")}`;

/** The G hub's series per paper, and the tone its chart is drawn in. */
const SERIES: Record<string, ChartTone> = {
  hr: "indigo",
  devtools: "indigo",
  cyber: "indigo",
  fintech: "indigo",
  "state-seo": "coral",
  "state-content": "coral",
  "state-ai": "coral",
  agree: "green",
  gap: "green",
  bench: "green",
  sov: "butter",
  "seo-time": "butter",
};
const ORDER = [
  "seo-time",
  "state-seo",
  "state-content",
  "state-ai",
  "sov",
  "agree",
  "hr",
  "devtools",
  "fintech",
  "cyber",
  "gap",
  "bench",
];
const WIDE = ["sov", "fintech", "bench"];
const ink = (t: ChartTone) =>
  t === "coral" || t === "butter" ? "#1a1040" : "#ffffff";

function panel(
  label: string,
  spec: ChartSpec,
  ground: ChartGround,
  tone: ChartTone,
  size: ChartSize,
  width: number,
  extra: { accent?: string; bg?: string; showAxis?: boolean } = {},
) {
  const { svg, size: drawn } = drawChart(spec, {
    width,
    ground,
    tone,
    size,
    accent: extra.accent,
    showAxis: extra.showAxis,
    logoHref: LOGO,
    idPrefix: `p${Math.random().toString(36).slice(2, 8)}`,
  });
  const bg = extra.bg ?? SERIES_COLOURS[tone];
  return `<figure class="p" style="background:${bg};color:${ink(tone)};width:${width + 36}px"><figcaption>${label} · ${tone} · ${size}${drawn !== size ? `→${drawn}` : ""} · ${width}px</figcaption><div style="width:${width}px">${svg}</div></figure>`;
}

const css = `
@font-face{font-family:Satoshi;src:url(${font("Satoshi-Regular.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:Satoshi;src:url(${font("Satoshi-Medium.woff2")}) format("woff2");font-weight:500}
@font-face{font-family:Satoshi;src:url(${font("Satoshi-Bold.woff2")}) format("woff2");font-weight:700}
@font-face{font-family:"Neue Montreal";src:url(${font("NeueMontreal-Medium.woff2")}) format("woff2");font-weight:500}
*{box-sizing:border-box;margin:0}
body{background:#0b0a2e;font-family:Satoshi,sans-serif;padding:32px;color:#fff}
section{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:48px}
h2{font:500 20px Satoshi;margin:0 0 16px;width:100%}
.p{padding:18px}
.p figcaption{font-size:11px;opacity:.6;margin-bottom:12px}`;

function page(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;
}

const sections: Record<string, string> = {
  // the hub's paper cards: sm, axis shown, at the card cover widths measured on the 1440 board (350 and 785)
  cards: `<section><h2>Hub cards (sm, as g-hub-papers)</h2>${ORDER.map((id) => panel(id, STUDY_CHART_SPECS[id], "colour", SERIES[id], "sm", WIDE.includes(id) ? 785 : 350)).join("")}</section>`,
  w1200: `<section><h2>Every study at 1200 (lg)</h2>${ORDER.map((id) => panel(id, STUDY_CHART_SPECS[id], "colour", SERIES[id], "lg", 1200)).join("")}</section>`,
  w390: `<section><h2>Every study at 390</h2>${ORDER.map((id) => panel(id, STUDY_CHART_SPECS[id], "colour", SERIES[id], "lg", 390)).join("")}</section>`,
  bench: `<section><h2>Benchmark figures: night (G paper figures, green lit) and green (band)</h2>
    ${panel("bench (featured, stage indigo→green)", STUDY_CHART_SPECS.bench, "colour", "green", "lg", 696)}
    ${panel("bench-engines (featured)", BENCH_FIGURE_SPECS.engines, "colour", "green", "md", 696)}
    ${panel("bench-domains", BENCH_FIGURE_SPECS.domains, "stage", "night", "lg", 1200, { accent: "#86dcb4", bg: "#121147" })}
    ${panel("bench-engines", BENCH_FIGURE_SPECS.engines, "stage", "night", "lg", 1200, { accent: "#86dcb4", bg: "#121147" })}
    ${panel("bench-rates", BENCH_FIGURE_SPECS.rates, "colour", "green", "lg", 1200)}
    ${panel("bench-domains", BENCH_FIGURE_SPECS.domains, "colour", "green", "lg", 1200)}
    ${panel("bench-engines", BENCH_FIGURE_SPECS.engines, "colour", "green", "lg", 1200)}
    ${panel("bench-rates", BENCH_FIGURE_SPECS.rates, "stage", "night", "lg", 1200, { accent: "#86dcb4", bg: "#121147" })}
  </section>`,
  bench390: `<section><h2>Benchmark figures at 390</h2>
    ${panel("bench-domains", BENCH_FIGURE_SPECS.domains, "stage", "night", "lg", 354, { accent: "#86dcb4", bg: "#121147" })}
    ${panel("bench-engines", BENCH_FIGURE_SPECS.engines, "stage", "night", "lg", 354, { accent: "#86dcb4", bg: "#121147" })}
    ${panel("bench-rates", BENCH_FIGURE_SPECS.rates, "colour", "green", "lg", 354)}
    ${panel("bench-domains", BENCH_FIGURE_SPECS.domains, "colour", "green", "lg", 390)}
    ${panel("bench-engines", BENCH_FIGURE_SPECS.engines, "colour", "green", "lg", 390)}
    ${panel("bench-rates", BENCH_FIGURE_SPECS.rates, "stage", "night", "lg", 390, { accent: "#86dcb4", bg: "#121147" })}
  </section>`,
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    join(OUT, "charts.html"),
    page("Chart port proof", Object.values(sections).join("")),
  );
  const browser = await chromium.launch();
  for (const [name, html] of Object.entries(sections)) {
    const file = join(OUT, `${name}.html`);
    writeFileSync(file, page(name, html));
    const p = await browser.newPage({
      viewport: {
        width:
          name.endsWith("390") || name === "w390"
            ? 1400
            : name === "cards"
              ? 1300
              : 1340,
        height: 900,
      },
      deviceScaleFactor: 1,
    });
    await p.goto(`file://${file}`);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
    await p.close();
  }
  await browser.close();
  console.log(`wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
