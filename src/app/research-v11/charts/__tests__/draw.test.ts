/** npx tsx --test src/app/research-v11/charts/__tests__/draw.test.ts */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  ChartGround,
  ChartSize,
  ChartSpec,
  ChartTone,
} from "../../contract";
import {
  chartLabels,
  chartTable,
  drawChart,
  isStack,
  THIN_HEIGHT,
  ticksFor,
} from "../draw";
import { BENCH, BENCH_FIGURE_SPECS } from "../fixtures";
import { STUDY_CHART_SPECS } from "../fixtures";
import { ChartSpecError, parseChartSpec, validateChartSpec } from "../parse";
import { esc } from "../text";

const SPECS: [string, ChartSpec][] = [
  ...Object.entries(STUDY_CHART_SPECS),
  ["bench-domains", BENCH_FIGURE_SPECS.domains],
  ["bench-engines", BENCH_FIGURE_SPECS.engines],
  ["bench-rates", BENCH_FIGURE_SPECS.rates],
];
const THEMES: [ChartGround, ChartTone][] = [
  ["stage", "indigo"],
  ["stage", "night"],
  ["stage", "navy"],
  ["colour", "coral"],
  ["colour", "butter"],
  ["colour", "green"],
  ["colour", "indigo"],
];
const WIDTHS = [320, 390, 700, 1200];
const SIZES: ChartSize[] = ["sm", "md", "lg"];

/** Every number the SVG writes into a geometry attribute. */
function geometry(svg: string): { name: string; value: string }[] {
  const out: { name: string; value: string }[] = [];
  const re = /\s(x|y|x1|x2|y1|y2|cx|cy|r|width|height|rx)="([^"]*)"/g;
  for (let m = re.exec(svg); m; m = re.exec(svg))
    out.push({ name: m[1], value: m[2] });
  return out;
}

describe("drawChart", () => {
  it("covers every ChartSpec type", () => {
    const types = new Set(SPECS.map(([, s]) => s.type));
    for (const t of [
      "bars",
      "columns",
      "funnel",
      "split",
      "matrix",
      "list",
      "dots",
      "table",
      "multiples",
      "slope",
    ])
      assert.ok(types.has(t as ChartSpec["type"]), `no fixture for ${t}`);
  });

  for (const [id, spec] of SPECS) {
    it(`${id} (${spec.type}) draws on every ground and tone at every width and size`, () => {
      for (const [ground, tone] of THEMES)
        for (const width of WIDTHS)
          for (const size of SIZES) {
            const where = `${id} ${ground}/${tone} ${size} @${width}`;
            const { svg, height } = drawChart(spec, {
              width,
              ground,
              tone,
              size,
              idPrefix: "t",
            });
            assert.ok(
              Number.isFinite(height) && height > 0,
              `${where}: height ${height}`,
            );
            assert.ok(
              !/NaN|Infinity|undefined/.test(svg),
              `${where}: NaN, Infinity or undefined in the SVG`,
            );
            assert.match(
              svg,
              new RegExp(
                `^<svg [^>]*width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"`,
              ),
              `${where}: svg box`,
            );
            for (const g of geometry(svg)) {
              const n = Number(g.value);
              assert.ok(Number.isFinite(n), `${where}: ${g.name}="${g.value}"`);
              if (["width", "height", "r", "rx"].includes(g.name))
                assert.ok(n >= 0, `${where}: negative ${g.name}="${g.value}"`);
            }
            // the text the SVG shows, in order; a label wrapped over two lines reads back as one
            const shown = ` ${[...svg.matchAll(/>([^<]+)</g)].map((m) => m[1].trim()).join(" ")} `;
            for (const label of chartLabels(spec))
              assert.ok(
                shown.includes(` ${esc(label)} `),
                `${where}: label "${label}" missing`,
              );
          }
    });
  }

  it("escapes every text value", () => {
    const spec: ChartSpec = {
      type: "list",
      rows: [['<script>alert("x")</script>', "A & B"]],
    };
    const { svg } = drawChart(spec, {
      width: 400,
      ground: "stage",
      tone: "night",
    });
    assert.ok(!svg.includes("<script>"));
    assert.ok(
      svg.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"),
    );
    assert.ok(svg.includes("A &amp; B"));
  });

  it("is deterministic for the same input (server and client draw the same SVG)", () => {
    const a = drawChart(BENCH_FIGURE_SPECS.domains, {
      width: 700,
      ground: "stage",
      tone: "night",
      size: "lg",
      idPrefix: "x",
    });
    const b = drawChart(BENCH_FIGURE_SPECS.domains, {
      width: 700,
      ground: "stage",
      tone: "night",
      size: "lg",
      idPrefix: "x",
    });
    assert.equal(a.svg, b.svg);
  });

  it("steps lg down to md on a phone, and stacks the multiples one engine per panel", () => {
    assert.equal(
      drawChart(STUDY_CHART_SPECS.bench, {
        width: 390,
        ground: "stage",
        tone: "indigo",
        size: "lg",
      }).size,
      "md",
    );
    const wide = drawChart(BENCH_FIGURE_SPECS.engines, {
      width: 1200,
      ground: "stage",
      tone: "night",
      size: "lg",
    });
    const phone = drawChart(BENCH_FIGURE_SPECS.engines, {
      width: 390,
      ground: "stage",
      tone: "night",
      size: "lg",
    });
    const count = (svg: string, s: string) => svg.split(`>${s}<`).length - 1;
    assert.equal(
      count(wide.svg, "Corporate"),
      1,
      "one key column when side by side",
    );
    assert.equal(
      count(phone.svg, "Corporate"),
      3,
      "keys repeated per stacked panel",
    );
    assert.ok(phone.height > wide.height * 2);
  });

  it("draws the board figures with their numbers", () => {
    const { svg } = drawChart(STUDY_CHART_SPECS["seo-time"], {
      width: 700,
      ground: "colour",
      tone: "butter",
      size: "md",
    });
    assert.ok(svg.includes("101 of 336"));
    assert.ok(svg.includes("235 lost"));
    const dots = drawChart(STUDY_CHART_SPECS.fintech, {
      width: 700,
      ground: "stage",
      tone: "indigo",
      size: "md",
    }).svg;
    assert.ok(dots.includes("4.6×"), "Toku swing");
    const table = drawChart(BENCH_FIGURE_SPECS.domains, {
      width: 1200,
      ground: "stage",
      tone: "night",
      size: "lg",
    }).svg;
    assert.ok(
      table.includes(">7.0%<") &&
        table.includes(">11,237<") &&
        table.includes(">80.5%<"),
    );
    const rates = drawChart(BENCH_FIGURE_SPECS.rates, {
      width: 1200,
      ground: "colour",
      tone: "green",
      size: "lg",
    }).svg;
    assert.ok(rates.includes(">2.04<") && rates.includes(">0.78<"));
  });

  it("chooses the board ticks and forms", () => {
    assert.deepEqual(ticksFor(180), [0, 45, 90, 135, 180]);
    assert.deepEqual(ticksFor(36), [0, 9, 18, 27, 36]);
    assert.deepEqual(ticksFor(24), [0, 6, 12, 18, 24]);
    assert.deepEqual(ticksFor(60), [0, 20, 40, 60]);
    assert.deepEqual(ticksFor(100), [0, 25, 50, 75, 100]);
    assert.deepEqual(ticksFor(20), [0, 5, 10, 15, 20]);
    assert.deepEqual(ticksFor(70), [0, 10, 20, 30, 40, 50, 60, 70]);
    assert.equal(isStack(STUDY_CHART_SPECS.agree), true);
    assert.equal(isStack(STUDY_CHART_SPECS.bench), false);
  });

  it("carries the same numbers as an accessible table", () => {
    const t = chartTable(BENCH_FIGURE_SPECS.engines);
    assert.deepEqual(t.head, ["", "ChatGPT", "AI Overviews", "Perplexity"]);
    assert.deepEqual(t.rows[0], ["Corporate", "48.0%", "53.4%", "53.4%"]);
    for (const [, spec] of SPECS) assert.ok(chartTable(spec).rows.length > 0);
  });
});

/** The homepage research strip's three papers (3 Nov 2026), as stored in Sanity. cite-wait has no fixture. */
const CITE_WAIT: ChartSpec = {
  type: "columns",
  unit: "%",
  max: 100,
  rows: [
    ["7 days", 25.5],
    ["14 days", 32.2],
    ["30 days", 46.3],
    ["60 days", 56.7],
  ],
};
const STRIP: [string, ChartSpec][] = [
  ["cite-wait", CITE_WAIT],
  ["seo-time", STUDY_CHART_SPECS["seo-time"]],
  ["state-seo", STUDY_CHART_SPECS["state-seo"]],
];
const THIN_WIDTHS = [240, 280, 320, 360, 420];
/** What the strip passes: night stage, the series colour lit as the accent, the rest grey-lavender. */
const STRIP_OPTS = {
  ground: "stage",
  tone: "night",
  size: "sm",
  variant: "thin",
  accent: "#86dcb4",
  rest: "#625f8f",
  idPrefix: "t",
} as const;
const shownText = (svg: string) =>
  ` ${[...svg.matchAll(/>([^<]+)</g)].map((m) => m[1].trim()).join(" ")} `;

describe("drawChart, thin variant (homepage research strip)", () => {
  for (const [id, spec] of [...SPECS, ["cite-wait", CITE_WAIT] as [string, ChartSpec]]) {
    it(`${id} (${spec.type}) draws thin at 240-420px with every label and no NaN`, () => {
      for (const [ground, tone] of [
        ["stage", "night"],
        ["stage", "indigo"],
        ["colour", "coral"],
      ] as [ChartGround, ChartTone][])
        for (const width of THIN_WIDTHS) {
          const where = `${id} thin ${ground}/${tone} @${width}`;
          const { svg, height } = drawChart(spec, {
            ...STRIP_OPTS,
            ground,
            tone,
            width,
          });
          assert.ok(Number.isFinite(height) && height > 0, `${where}: height ${height}`);
          assert.ok(!/NaN|Infinity|undefined/.test(svg), `${where}: NaN, Infinity or undefined`);
          for (const g of geometry(svg)) {
            const n = Number(g.value);
            assert.ok(Number.isFinite(n), `${where}: ${g.name}="${g.value}"`);
            if (["width", "height", "r", "rx"].includes(g.name))
              assert.ok(n >= 0, `${where}: negative ${g.name}="${g.value}"`);
          }
          const shown = shownText(svg);
          for (const label of chartLabels(spec))
            assert.ok(shown.includes(` ${esc(label)} `), `${where}: label "${label}" missing`);
          // no callout, no axis line above the chart
          const a = spec as { call?: string; axis?: string };
          if (a.call) assert.ok(!shown.includes(` ${esc(a.call)} `), `${where}: callout drawn`);
          if (a.axis) assert.ok(!shown.includes(` ${esc(a.axis)} `), `${where}: axis line drawn`);
        }
    });
  }

  it("holds the fixed height for the strip's three papers at every card width", () => {
    for (const [id, spec] of STRIP)
      for (const width of THIN_WIDTHS) {
        assert.equal(drawChart(spec, { ...STRIP_OPTS, width }).height, THIN_HEIGHT, `${id} @${width}`);
        assert.equal(drawChart(spec, { ...STRIP_OPTS, width, height: 96 }).height, 96, `${id} @${width} h96`);
      }
  });

  it("draws no y-axis ticks and no legend, and prints the figures on the marks", () => {
    const cw = drawChart(CITE_WAIT, { ...STRIP_OPTS, width: 262 }).svg;
    for (const tick of ["0%", "25%", "50%", "75%", "100%"])
      assert.ok(!shownText(cw).includes(` ${tick} `), `tick ${tick}`);
    for (const fig of ["25.5%", "32.2%", "46.3%", "56.7%"]) assert.ok(cw.includes(`>${fig}<`), fig);
    // the highlighted (last) column is the accent; the others take the rest colour
    assert.ok(cw.includes('stop-color="#86dcb4"') && cw.includes('stop-color="#625f8f"'));
    // the matrix's "leads" key is dropped (the cells name the leader); dots keep the engine key, which nothing else names
    const sov = drawChart(STUDY_CHART_SPECS.sov, { ...STRIP_OPTS, width: 320 }).svg;
    assert.ok(!sov.includes(" leads<"), "matrix legend");
    const fintech = drawChart(STUDY_CHART_SPECS.fintech, { ...STRIP_OPTS, width: 320 }).svg;
    assert.ok(fintech.includes(">ChatGPT<"), "dots key");
  });

  it("draws the funnel, the split and short bar lists as columns of the same numbers", () => {
    const funnel = drawChart(STUDY_CHART_SPECS["seo-time"], { ...STRIP_OPTS, width: 262 }).svg;
    assert.ok(!funnel.includes("<pattern"), "no hatched losses");
    assert.ok(!funnel.includes(" of 336"), "counts only");
    for (const n of ["336", "318", "101"]) assert.ok(funnel.includes(`>${n}<`), n);
    // the two-line label is balanced, as the board draws it ("Clicked / by day 28")
    assert.ok(funnel.includes(">Clicked<") && funnel.includes(">by day 28<"));
    const seo = drawChart(STUDY_CHART_SPECS["state-seo"], { ...STRIP_OPTS, width: 262 }).svg;
    for (const n of ["180", "133", "40"]) assert.ok(seo.includes(`>${n}<`), n);
    const split = drawChart(STUDY_CHART_SPECS["state-ai"], { ...STRIP_OPTS, width: 262 }).svg;
    assert.ok(!split.includes("<pattern") && split.includes(">13.8%<"));
  });

  it("leaves the default rendering alone", () => {
    for (const [id, spec] of SPECS)
      for (const width of [320, 700])
        assert.equal(
          drawChart(spec, { width, ground: "stage", tone: "night", size: "sm", idPrefix: "d" }).svg,
          drawChart(spec, { width, ground: "stage", tone: "night", size: "sm", idPrefix: "d", variant: "default", height: 90 }).svg,
          id,
        );
  });
});

describe("BENCH_FIGURE_SPECS", () => {
  it("keeps every benchmark number", () => {
    assert.deepEqual(
      BENCH_FIGURE_SPECS.domains.rows.map((r) => [r[2], r[3]]),
      BENCH.domains.map((r) => [r[2], r[3]]),
    );
    assert.deepEqual(BENCH_FIGURE_SPECS.domains.highlight, [1, 8]);
    assert.deepEqual(
      BENCH_FIGURE_SPECS.engines.groups.map((g) => g[1]),
      BENCH.engines_mix.map((e) => e[1]),
    );
    assert.deepEqual(
      BENCH_FIGURE_SPECS.engines.groups.map((g) => g[2]),
      ["80,608 citations", "42,147 citations", "37,485 citations"],
    );
    assert.deepEqual(BENCH_FIGURE_SPECS.rates.rows, BENCH.rates);
    for (const spec of Object.values(BENCH_FIGURE_SPECS))
      assert.doesNotThrow(() => parseChartSpec(JSON.stringify(spec)));
  });
});

describe("parseChartSpec", () => {
  it("accepts every fixture as JSON", () => {
    for (const [id, spec] of SPECS)
      assert.deepEqual(parseChartSpec(JSON.stringify(spec)), spec, id);
  });

  const bad: [string, unknown, RegExp][] = [
    ["empty text", "", /spec is empty/],
    ["broken JSON", '{"type":', /not valid JSON/],
    ["not an object", [], /spec must be an object/],
    ["unknown type", { type: "pie" }, /spec\.type must be one of/],
    [
      "unknown field",
      { type: "funnel", rows: [["a", 1]], colour: "red" },
      /spec\.colour is not a field of a funnel chart/,
    ],
    ["missing rows", { type: "bars", max: 10 }, /spec\.rows must be an array/],
    [
      "empty rows",
      { type: "list", rows: [] },
      /spec\.rows must have at least 1 item/,
    ],
    [
      "string value",
      { type: "bars", max: 10, rows: [["a", "5"]] },
      /spec\.rows\[0\]\[1\] must be a finite number/,
    ],
    [
      "value above max",
      { type: "bars", max: 10, rows: [["a", 50]] },
      /spec\.rows\[0\]\[1\] is 50, above max 10/,
    ],
    [
      "zero max",
      { type: "columns", max: 0, rows: [["a", 0]] },
      /spec\.max must be greater than 0/,
    ],
    [
      "bad hi",
      { type: "columns", max: 10, rows: [["a", 1]], hi: 3 },
      /spec\.hi must be a whole number from 0 to 0/,
    ],
    [
      "empty label",
      { type: "funnel", rows: [["", 4]] },
      /spec\.rows\[0\]\[0\] must not be empty/,
    ],
    [
      "funnel grows",
      {
        type: "funnel",
        rows: [
          ["a", 4],
          ["b", 9],
        ],
      },
      /spec\.rows\[1\]\[1\] is above the first step/,
    ],
    [
      "split over 100",
      { type: "split", a: ["a", 120], b: ["b", 0] },
      /spec\.a\[1\] is 120, above 100/,
    ],
    [
      "matrix width",
      { type: "matrix", cols: ["A", "B"], rows: [["r", ["x 1"]]] },
      /spec\.rows\[0\]\[1\] has 1 cells for 2 columns/,
    ],
    [
      "dots width",
      { type: "dots", cols: ["A", "B"], max: 10, rows: [["r", [1]]] },
      /spec\.rows\[0\]\[1\] has 1 values for 2 columns/,
    ],
    [
      "table bar index",
      { type: "table", cols: ["A", "B"], bar: 5, rows: [["a", 1]] },
      /spec\.bar must be a whole number from 0 to 1/,
    ],
    [
      "table bar text",
      { type: "table", cols: ["A", "B"], bar: 1, rows: [["a", "x"]] },
      /spec\.rows\[0\]\[1\] must be a finite number/,
    ],
    [
      "table highlight",
      {
        type: "table",
        cols: ["A", "B"],
        bar: 1,
        rows: [["a", 1]],
        highlight: [2],
      },
      /spec\.highlight\[0\]/,
    ],
    [
      "multiples width",
      { type: "multiples", keys: ["a", "b"], groups: [["g", [1]]] },
      /spec\.groups\[0\]\[1\] has 1 values for 2 keys/,
    ],
    [
      "slope row",
      { type: "slope", from: "a", to: "b", rows: [["x", 1]] },
      /spec\.rows\[0\] must have at least 3 items/,
    ],
    [
      "bad unit",
      { type: "bars", unit: "pct", max: 10, rows: [["a", 1]] },
      /spec\.unit must be "%" or ""/,
    ],
    [
      "negative",
      { type: "slope", from: "a", to: "b", rows: [["x", -1, 2]] },
      /spec\.rows\[0\]\[1\] must not be negative/,
    ],
  ];
  for (const [name, input, msg] of bad)
    it(`rejects ${name}`, () => {
      assert.throws(
        () =>
          typeof input === "string"
            ? parseChartSpec(input)
            : parseChartSpec(JSON.stringify(input)),
        (e: unknown) => e instanceof ChartSpecError && msg.test(e.message),
      );
    });

  it("validates an already-parsed object the same way", () => {
    assert.throws(
      () => validateChartSpec({ type: "bars", max: 10, rows: [["a", NaN]] }),
      /must be a finite number/,
    );
  });
});
