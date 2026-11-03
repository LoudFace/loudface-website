/**
 * The board's charts as ChartSpecs, for the data migration and the tests.
 *
 * STUDY_CHART_SPECS: STUDIES[].chart from design-lab/research-2026-11-03/shared/research.js (numbers copied verbatim),
 * plus the board's annotations from charts-v2.js SPEC (`axis`, `call`, `heads`, `unit` on dots). One label differs:
 * agree's notes carry "names" ("3,019 names"), which the board added at draw time.
 *
 * BENCH and BENCH_FIGURE_SPECS: the benchmark's own tables (research.js BENCH, copied verbatim) and their mapping to the
 * three ChartSpec shapes the benchmark paper uses: bench-domains → table, bench-engines → multiples,
 * bench-rates → slope. The only change to BENCH's values is a label: source type "You" is shown as "Owned" in the
 * table and "You (owned)" in the multiples, as the board drew them.
 */
import type { ChartSpec } from "../contract";
import type { AnnotatedChartSpec } from "./draw";

export const STUDY_CHART_SPECS: Record<string, AnnotatedChartSpec> = {
  agree: {
    type: "bars",
    unit: "%",
    max: 100,
    rows: [
      ["One engine only", 71.3, "3,019 names"],
      ["Two engines", 20.9, "884 names"],
      ["All three engines", 7.8, "332 names"],
    ],
    axis: "Share of 4,235 agency names",
  },
  "seo-time": {
    type: "funnel",
    rows: [
      ["Published", 336],
      ["Seen in Google", 318],
      ["Clicked by day 28", 101],
    ],
    axis: "New pages, first 28 days",
  },
  "state-seo": {
    type: "bars",
    unit: "",
    max: 180,
    rows: [
      ["AI Overview shown", 180],
      ["Cited YouTube", 133],
      ["Cited the #1 result", 40],
    ],
    axis: "Searches, of 180",
    call: "Every search",
  },
  "state-content": {
    type: "columns",
    unit: "%",
    max: 100,
    rows: [
      ["Share of posts", 18.5],
      ["Impressions", 53.1],
      ["Clicks", 66.7],
    ],
    axis: "Ranked lists, share of each total",
    call: "From 18.5% of posts",
  },
  "state-ai": {
    type: "split",
    a: ["Same top pick", 13.8],
    b: ["Different top pick", 86.2],
    axis: "Weekly top pick across the three engines",
  },
  sov: {
    type: "matrix",
    cols: ["ChatGPT", "Perplexity", "AI Overviews"],
    rows: [
      [
        "Visibility",
        ["Omniscient 44.6%", "Omniscient 34.1%", "Omniscient 33.7%"],
      ],
      [
        "Mention share",
        ["Omniscient 12.7%", "Omniscient 14.9%", "Omniscient 11.4%"],
      ],
      ["Citation share", ["LoudFace 11.3%", "LoudFace 6.6%", "LoudFace 3.5%"]],
      [
        "Average position",
        ["Discovered Labs 3.16", "LoudFace 2.73", "LoudFace 2.45"],
      ],
    ],
    axis: "First place, by formula and engine",
  },
  hr: {
    type: "bars",
    unit: "",
    max: 36,
    rows: [
      ["Rippling", 25],
      ["Deel", 18],
      ["Gusto", 18],
      ["BambooHR", 15],
      ["ADP", 14],
      ["HiBob", 10],
    ],
    axis: "Answers naming the vendor, of 36",
    call: "25 of 36 answers",
  },
  devtools: {
    type: "list",
    rows: [
      ["API development", "Postman"],
      ["CI/CD", "GitHub Actions"],
      ["Observability", "Datadog"],
      ["Feature flags", "LaunchDarkly"],
      ["API docs", "ReadMe"],
      ["Error monitoring", "Sentry"],
    ],
    heads: ["Category", "Named first by ChatGPT"],
    axis: "First tool ChatGPT names, by category",
  },
  cyber: {
    type: "bars",
    unit: "",
    max: 36,
    rows: [
      ["SentinelOne", 14],
      ["Palo Alto Networks", 12],
      ["Microsoft Defender", 11],
      ["Wiz", 11],
      ["Rapid7", 10],
      ["CrowdStrike", 8],
    ],
    axis: "Combined score (ChatGPT named-count × 2 + Google top-10 count), of 36",
    call: "Leads at 14",
  },
  fintech: {
    type: "dots",
    cols: ["ChatGPT", "AI Overviews", "Perplexity"],
    max: 70,
    rows: [
      ["Remote", [62.61, 48.9, 49.44]],
      ["Deel", [61.48, 60.61, 36.75]],
      ["Papaya Global", [34.63, 15.31, 22.66]],
      ["Toku", [15.67, 36.19, 7.92]],
      ["Bitwage", [10.4, 14.01, 5.55]],
    ],
    unit: "%",
    axis: "Visibility per engine",
  },
  gap: {
    type: "columns",
    unit: "",
    max: 20,
    rows: [
      ["Under 3%", 7],
      ["Under 5%", 8],
      ["Under 8%", 10],
      ["Under 10%", 11],
      ["Under 15%", 16],
    ],
    hi: 3,
    axis: "Buyer questions with no agency above the threshold, of 90",
    call: "10% threshold",
  },
  bench: {
    type: "bars",
    unit: "%",
    max: 60,
    rows: [
      ["Corporate", 50.7],
      ["UGC", 13.2],
      ["Editorial", 11.1],
      ["Reference", 8.0],
      ["Competitor", 7.9],
      ["You (owned)", 5.0],
      ["Other", 2.0],
      ["Institutional", 2.0],
    ],
    axis: "Share of all citations, by source type",
    call: "Half of every citation",
  },
};

/** research.js BENCH, verbatim. */
export const BENCH = {
  total: 160240,
  conversations: 23545,
  projects: 5,
  engines: ["ChatGPT", "Perplexity", "Google AI Overviews"],
  window: "30 days to 1 June 2026",
  domains: [
    ["reddit.com", "UGC", 11237, 7.0, "ChatGPT 80.5%"],
    ["toku.com", "You", 5766, 3.6, "ChatGPT 53.7%"],
    ["riseworks.io", "Competitor", 2518, 1.6, "AI Overviews 43.5%"],
    ["remote.com", "Competitor", 2011, 1.3, "ChatGPT 81.7%"],
    ["youtube.com", "UGC", 2005, 1.3, "AI Overviews 72.4%"],
    ["investopedia.com", "Editorial", 1839, 1.1, "AI Overviews 71.0%"],
    ["businessinsider.com", "Editorial", 1782, 1.1, "Perplexity 37.6%"],
    ["deel.com", "Competitor", 1197, 0.7, "ChatGPT 59.2%"],
    ["loudface.co", "You", 1097, 0.7, "ChatGPT 58.5%"],
  ] as [string, string, number, number, string][],
  engines_mix: [
    ["ChatGPT", [48.0, 15.0, 10.2, 10.3, 7.4, 5.4], 80608],
    ["AI Overviews", [53.4, 14.0, 10.7, 3.5, 8.4, 4.6], 42147],
    ["Perplexity", [53.4, 8.4, 13.6, 8.3, 8.3, 4.8], 37485],
  ] as [string, number[], number][],
  mix_keys: ["Corporate", "UGC", "Editorial", "Reference", "Competitor", "You"],
  rates: [
    ["You (owned)", 2.038, 0.775],
    ["Competitor", 0.946, 0.315],
    ["UGC", 0.901, 0.413],
    ["Institutional", 0.774, 0.058],
    ["Editorial", 0.74, 0.206],
    ["Corporate", 0.715, 0.091],
    ["Reference", 0.676, 0.127],
    ["Other", 0.598, 0.037],
  ] as [string, number, number][],
};

export type BenchTables = typeof BENCH;

/** Maps the benchmark's tables to the paper's three figure specs. */
export function benchFigureSpecs(b: BenchTables): {
  domains: ChartSpec & { type: "table" };
  engines: ChartSpec & { type: "multiples" };
  rates: ChartSpec & { type: "slope" };
} {
  return {
    domains: {
      type: "table",
      cols: ["Domain", "Source type", "Citations", "Share", "Most from"],
      bar: 3,
      unit: "%",
      rows: b.domains.map(([dom, type, cit, share, eng]) => [
        dom,
        type === "You" ? "Owned" : type,
        cit,
        share,
        eng,
      ]),
      highlight: b.domains.flatMap((r, i) => (r[1] === "You" ? [i] : [])),
    },
    engines: {
      type: "multiples",
      keys: b.mix_keys.map((k) => (k === "You" ? "You (owned)" : k)),
      unit: "%",
      groups: b.engines_mix.map(([name, values, n]) => [
        name,
        values,
        `${n.toLocaleString("en-US")} citations`,
      ]),
    },
    rates: {
      type: "slope",
      from: "Citation rate",
      to: "Retrieval rate",
      rows: b.rates.map(([label, a, r]): [string, number, number] => [label, a, r]),
    },
  };
}

export const BENCH_FIGURE_SPECS = benchFigureSpecs(BENCH);
