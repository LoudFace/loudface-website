/**
 * /research (direction G, approved by Arnel 3 Nov 2026): the shared contract between the CMS data
 * (src/sanity/schemas/research.ts → cms-data.ts → ResearchStudy), the chart drawer (./charts) and the
 * pages (ResearchIndexV11, ResearchPaperV11). Design boards: Paper "LoudFace Website · v11", pages
 * "Desktop · v11" and "Phone · v11", boards "Proposed · Research hub/paper · G". Reference build:
 * design-lab/research-2026-11-03/G-hub.html and G-paper.html. Spec: docs/research-section.md.
 */

/** Every paper belongs to one series; the series owns one full-strength colour (E's palette, kept on Arnel's word). */
export const SERIES = {
  index: { name: 'AI Visibility Index', ground: '#3d38cf', ink: '#ffffff', chartTone: 'indigo' },
  saas: { name: 'State of B2B SaaS', ground: '#ec6c48', ink: '#1a1040', chartTone: 'coral' },
  ai: { name: 'AI search behaviour', ground: '#0f5a46', ink: '#ffffff', chartTone: 'green' },
  meas: { name: 'Measurement and Search', ground: '#e2ad3c', ink: '#1a1040', chartTone: 'butter' },
} as const;
export type SeriesKey = keyof typeof SERIES;

export const PAPER_KINDS = ['Study', 'Report', 'Index', 'Benchmark'] as const;
export type PaperKind = (typeof PAPER_KINDS)[number];

/**
 * A chart, as data. The shapes are the board kit's (design-lab/research-2026-11-03/shared/research.js
 * STUDIES[].chart and BENCH), so the 12 migrated papers keep their exact numbers. Stored in Sanity as
 * JSON text on a figure (`spec`) and parsed by parseChartSpec in ./charts. A stored spec may also carry the
 * drawer's optional annotations (`axis`, `call`, `heads`, `unit` on dots, `form: 'stack'`; see
 * `AnnotatedChartSpec` in ./charts/draw.ts). The 12 migrated papers use `STUDY_CHART_SPECS` and
 * `BENCH_FIGURE_SPECS` from ./charts/fixtures.ts, which match the approved boards.
 */
export type ChartSpec =
  | { type: 'bars'; unit?: '%' | ''; max: number; rows: [label: string, value: number, note?: string][] }
  | { type: 'columns'; unit?: '%' | ''; max: number; rows: [label: string, value: number][]; hi?: number }
  | { type: 'funnel'; rows: [label: string, value: number][] }
  | { type: 'split'; a: [label: string, value: number]; b: [label: string, value: number] }
  | { type: 'matrix'; cols: string[]; rows: [label: string, cells: string[]][] }
  | { type: 'list'; rows: [label: string, value: string][] }
  | { type: 'dots'; cols: string[]; max: number; rows: [label: string, values: number[]][] }
  /** A ranked table; `bar` is the index of the column drawn as a bar, scaled to that column's largest value
   *  (the benchmark's nine most-cited domains). */
  | { type: 'table'; cols: string[]; bar: number; unit?: '%' | ''; rows: (string | number)[][]; highlight?: number[] }
  /** Small multiples: one bar panel per group (the benchmark's source mix by engine). */
  | { type: 'multiples'; keys: string[]; unit?: '%' | ''; groups: [name: string, values: number[], note?: string][] }
  /** Two points per row joined by a line (the benchmark's citation rate against retrieval rate). */
  | { type: 'slope'; from: string; to: string; rows: [label: string, a: number, b: number][] };

/** Where a chart is drawn. `light` is never used on /research; it exists for other pages. */
export type ChartGround = 'stage' | 'colour';
export type ChartTone = 'indigo' | 'night' | 'navy' | 'coral' | 'butter' | 'green';
export type ChartSize = 'sm' | 'md' | 'lg';

export interface ResearchChartProps {
  spec: ChartSpec;
  ground: ChartGround;
  tone: ChartTone;
  size?: ChartSize;
  /** Accessible name; the visible title is drawn by the page, not the chart. */
  title: string;
  /** The series colour lit on night (e.g. #86dcb4 for green), replacing the highlight on white-ink tones. */
  accent?: string;
  /** Draw the spec's `axis` line above the chart (default: at sm only). */
  showAxis?: boolean;
  className?: string;
}

/** One figure in a paper. `placement` decides where the page draws it. */
export interface ResearchFigure {
  key: string;
  title: string;
  /** Source line under the figure ("Source: Peec AI, 160,240 citations, 23,545 conversations"). */
  source?: string;
  /** A sentence under the source, for what the figure leaves out. */
  note?: string;
  spec: ChartSpec;
  /** lead: the hero figure; band: a full-width figure band on the series colour; afterH2: after the nth H2 of the body (0-based). */
  placement: 'lead' | 'band' | 'afterH2';
  h2Index?: number;
}

export interface ResearchNumber {
  value: string;
  label: string;
  note?: string;
}

export interface ResearchVersion {
  version: string;
  date: string;
  note: string;
}
