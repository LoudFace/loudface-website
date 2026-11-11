/**
 * The research chart drawer: a ChartSpec in, an SVG string out. Pure functions, no DOM, so the server renders the
 * same chart the browser redraws. Ported from the board kit Arnel approved on 3 Nov 2026
 * (design-lab/research-2026-11-03/shared/charts-v2.js), with series.css's colour corrections (./theme.ts).
 *
 * What the chart draws: the marks, the figures on them, and (at sm, or when asked) the spec's axis line and a legend.
 * What the page draws: the figure title, the big number above it, the source line and the ground colour itself.
 */
import type { ChartGround, ChartSize, ChartSpec, ChartTone } from "../contract";
import {
  clip,
  esc,
  figWidth,
  nf,
  pct,
  r1,
  SANS_FAMILY,
  T,
  textWidth,
  wrap,
  wrapAtHyphens,
  wrapBalanced,
} from "./text";
import { themeFor, type Theme } from "./theme";

/* ------------------------------------------------------------------ the spec's optional annotations */

/**
 * Optional fields a stored spec may carry beside the contract's shape. They are the board's per-figure annotations
 * (charts-v2.js SPEC): `axis` the line above the chart, `call` the callout on the highlighted bar or column, `heads`
 * a list's two column heads, `unit` on dots, and `form: 'stack'` to draw a bars spec as one 100% bar.
 */
export interface ChartAnnotations {
  axis?: string;
  call?: string;
  heads?: [string, string];
  unit?: "%" | "";
  form?: "stack" | "bars";
}
export type AnnotatedChartSpec = ChartSpec & ChartAnnotations;
const notes = (spec: ChartSpec): ChartAnnotations => spec as ChartAnnotations;

/* ------------------------------------------------------------------ options */

export interface DrawOptions {
  /** Content width in px. */
  width: number;
  ground: ChartGround;
  tone: ChartTone;
  size?: ChartSize;
  /** Prefix for gradient, pattern and clip ids; must be unique per chart on a page. */
  idPrefix?: string;
  /** Replaces the highlight on white-ink tones (the series colour lit on night, e.g. #86dcb4 for green). */
  accent?: string;
  /** Draw the spec's `axis` line above the chart. Default: at sm only (the board's cards show it; figures do not). */
  showAxis?: boolean;
  /** The LoudFace mark used in matrix cells. */
  logoHref?: string;
  /**
   * `thin`: the homepage research strip's card chart (design T2, approved 3 Nov 2026; board kit
   * design-lab/research-home-2026-11-03/kit/charts-v2-thin.js). A fixed short height, no y-axis ticks or gridlines
   * (the baseline only), no legend, no callouts, figures printed on the marks, two-line labels balanced. Bars of up
   * to four rows, a 100% bar, a split and a funnel are drawn as plain columns of the same numbers; the other types keep
   * their form without ticks or legend. Default: the /research rendering, unchanged.
   */
  variant?: "default" | "thin";
  /**
   * Thin only: the SVG's height in px (default THIN_HEIGHT). Column forms hold it exactly unless their labels need a
   * third line at a narrow width; row forms (lists, tables, matrices, dots, multiples, slopes) fill it when their rows
   * fit at the minimum row height and grow past it when they do not, so no label is ever dropped.
   */
  height?: number;
  /** Replaces the colour of every non-highlighted mark (the strip draws them grey-lavender, #625f8f, on night). */
  rest?: string;
}

/** Thin charts: the board's card height (data-h="118"), the smallest plot a column form keeps, and the smallest row. */
export const THIN_HEIGHT = 118;
const THIN_MIN_PLOT = 28;
const THIN_MIN_ROW = 18;

export interface DrawResult {
  svg: string;
  height: number;
  /** The size actually drawn: lg steps down to md under 560 px. */
  size: ChartSize;
}

/* ------------------------------------------------------------------ sizes (the kit's SZ) */

interface Size {
  fs: number;
  ax: number;
  val: number;
  fig: number;
  row: number;
  bar: number;
  call: number;
  callH: number;
}
const SZ: Record<ChartSize, Size> = {
  sm: {
    fs: 12,
    ax: 11,
    val: 14,
    fig: 20,
    row: 30,
    bar: 19,
    call: 11.5,
    callH: 22,
  },
  md: {
    fs: 13.5,
    ax: 13,
    val: 17,
    fig: 26,
    row: 40,
    bar: 27,
    call: 13,
    callH: 26,
  },
  lg: {
    fs: 14.5,
    ax: 13,
    val: 19,
    fig: 30,
    row: 48,
    bar: 33,
    call: 13,
    callH: 28,
  },
};

/** Below this width an lg chart is drawn at md (the board's data-phone). */
const LG_MIN = 560;
/** Below this width small multiples stack one panel per group (G paper's phone Figure 3). */
export const MULTIPLES_STACK_BELOW = 560;

/* ------------------------------------------------------------------ the drawing context */

interface Ctx {
  th: Theme;
  s: Size;
  size: ChartSize;
  w: number;
  /** Right margin kept for the vertical LOUDFACE watermark (lg only). */
  wm: number;
  /** The thin card variant (DrawOptions.variant) and its fixed height; 0 when not thin. */
  thin: boolean;
  fixH: number;
  defs: string[];
  fill: (col: string, kind: "hi" | "rest", dir: "h" | "v") => string;
  hatch: () => string;
  callout: (
    x: number,
    y: number,
    text: string,
    o?: {
      anchor?: "start" | "middle" | "end";
      min?: number;
      max?: number;
      to?: number;
      lx?: number;
    },
  ) => string;
  pin: (x: number, y: number, r: number) => string;
}

function makeCtx(
  th: Theme,
  size: ChartSize,
  w: number,
  id: string,
  logo: string,
): Ctx {
  const defs: string[] = [];
  const seen = new Map<string, string>();
  let pins = 0;
  const s = SZ[size];
  const c: Ctx = {
    th,
    s,
    size,
    w,
    wm: 0,
    thin: false,
    fixH: 0,
    defs,
    fill(col, kind, dir) {
      const f = th.fade?.[kind];
      if (!f) return col;
      const k = `${col}|${kind}|${dir}`;
      if (!seen.has(k)) {
        const gid = `${id}-g${seen.size}`;
        seen.set(k, gid);
        const [x1, y1, x2, y2] = dir === "h" ? [0, 0, 1, 0] : [0, 1, 0, 0];
        defs.push(
          `<linearGradient id="${gid}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${col}" stop-opacity="${f[0]}"/><stop offset="1" stop-color="${col}" stop-opacity="${f[1]}"/></linearGradient>`,
        );
      }
      return `url(#${seen.get(k)})`;
    },
    hatch() {
      if (!seen.has("hatch")) {
        seen.set("hatch", `${id}-h`);
        defs.push(
          `<pattern id="${id}-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${th.hatch}" stroke-width="2"/></pattern>`,
        );
      }
      return `url(#${seen.get("hatch")})`;
    },
    callout(x, y, text, o = {}) {
      const fw = textWidth(text, s.call, 500) + 18;
      const h = s.callH;
      let x0 =
        o.anchor === "start" ? x : o.anchor === "end" ? x - fw : x - fw / 2;
      x0 = Math.max(o.min ?? 0, Math.min(x0, (o.max ?? w) - fw));
      const lx = o.lx ?? x;
      const lead =
        o.to != null && o.to > y + h
          ? `<line x1="${r1(lx)}" x2="${r1(lx)}" y1="${r1(y + h)}" y2="${r1(o.to)}" stroke="${th.callBg}" stroke-width="1.5"/>`
          : "";
      return (
        `${lead}<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(fw)}" height="${h}" rx="6" fill="${th.callBg}"/>` +
        T(x0 + 9, y + h / 2 + s.call * 0.36, text, {
          fs: s.call,
          w: 500,
          c: th.callInk,
        })
      );
    },
    pin(x, y, r) {
      const cid = `${id}-p${pins++}`;
      return `<clipPath id="${cid}"><circle cx="${r1(x)}" cy="${r1(y)}" r="${r}"/></clipPath><circle cx="${r1(x)}" cy="${r1(y)}" r="${r + 1.5}" fill="#ffffff"/><image href="${esc(logo)}" x="${r1(x - r)}" y="${r1(y - r)}" width="${r * 2}" height="${r * 2}" clip-path="url(#${cid})"/>`;
    },
  };
  return c;
}

interface Form {
  h: number;
  svg: string;
  legend?: LegendItem[];
}
interface LegendItem {
  label: string;
  color: string;
  dot?: boolean;
  outline?: string;
}

/* ------------------------------------------------------------------ scales */

const NICE = [1, 2, 2.5, 5];
const isNice = (v: number): boolean => {
  if (!(v > 0)) return false;
  const p = 10 ** Math.floor(Math.log10(v));
  return (
    NICE.some((n) => Math.abs(v / p - n) < 1e-9) || Math.abs(v / p - 10) < 1e-9
  );
};
/** Ticks from 0 to max: a 1-2-2.5-5 step that divides max exactly, else max in four equal steps. */
export function ticksFor(max: number): number[] {
  const n = [4, 3, 5, 6, 7, 8, 2].find((k) => isNice(max / k)) ?? 4;
  return Array.from(
    { length: n + 1 },
    (_, i) => Math.round(((max * i) / n) * 1e6) / 1e6,
  );
}
const niceStep = (raw: number, up: boolean): number => {
  const p = 10 ** Math.floor(Math.log10(raw));
  const cands = [...NICE, 10].map((n) => n * p);
  return up
    ? (cands.find((c) => c >= raw - 1e-12) ?? 10 * p)
    : ([...cands].reverse().find((c) => c <= raw + 1e-12) ?? p);
};
const tickText = (t: number, unit?: string): string =>
  `${Number.isInteger(t) ? t : String(t)}${unit === "%" ? "%" : ""}`;

/** A highlighted mark's label is set at medium weight, every other label at regular. */
const labelWeight = (hi: boolean | undefined): number => (hi ? 500 : 400);

/** Space kept between two tick labels along an axis. */
const TICK_GAP = 8;
/**
 * The ticks whose labels fit on an axis `span` px long: every k-th tick, for the smallest k that keeps TICK_GAP
 * between labels. A step that drops the last tick must still leave three labels, so 0–10 in 2.5s thins to 0, 5, 10
 * and never to 0, 7.5. `extent` is a label's length along the axis; the first label starts at its tick when
 * `startFirst` (a horizontal axis), every other label is centred on its tick.
 */
function fitTicks(
  ticks: number[],
  max: number,
  span: number,
  extent: (t: number) => number,
  startFirst: boolean,
): number[] {
  const last = ticks.length - 1;
  const box = (t: number, first: boolean): [number, number] => {
    const p = (t / max) * span;
    const e = extent(t);
    return first && startFirst ? [p, p + e] : [p - e / 2, p + e / 2];
  };
  for (let k = 1; k <= last; k++) {
    const kept = ticks.filter((_, i) => i % k === 0);
    if (last % k !== 0 && kept.length < 3) continue;
    const apart = kept.every(
      (t, i) =>
        i === 0 || box(kept[i - 1], i === 1)[1] + TICK_GAP <= box(t, false)[0],
    );
    if (apart) return kept;
  }
  return ticks.slice(0, 1);
}

/** The ticks labelled under a horizontal value axis `span` px long; a thin chart labels none. */
function valueAxisLabels(
  c: Ctx,
  ticks: number[],
  max: number,
  span: number,
  unit?: string,
): number[] {
  if (c.thin) return [];
  return fitTicks(
    ticks,
    max,
    span,
    (t) => textWidth(tickText(t, unit), c.s.ax),
    true,
  );
}

/* ------------------------------------------------------------------ forms (charts-v2.js, function for function) */

interface BarRow {
  label: string;
  v: number;
  text: string;
  hi: boolean;
}

/** A label column wider than this share of the chart wraps its labels into the bars' room. */
const SIDE_LABEL_MAX_SHARE = 0.42;
/** Side labels that leave the bars less than this share of the chart move above their bars instead. */
const SIDE_BARS_MIN_SHARE = 0.45;
/** Labels above their bars: the gap from the label to its bar, between rows, and the bar's share of the size's bar. */
const STACKED_LABEL_GAP = 6;
const STACKED_ROW_GAP = 16;
const STACKED_BAR_SHARE = 0.8;
/** How far a stacked bar's own gridline stretch reaches past the bar, above and below. */
const STACKED_GRID_OVERSHOOT = 3;
/** A label's first baseline below the top of its line box, in font sizes. */
const LABEL_ASCENT = 0.8;
/**
 * The height a short list of bars grows towards, so four rows fill a figure instead of sitting in its top third.
 * Rows grow at most ROW_GROW_MAX times the size's row; sm (the hub's cards) keeps its rows.
 */
const ROWS_FILL: Record<ChartSize, number> = { sm: 0, md: 220, lg: 300 };
const ROW_GROW_MAX = 1.6;
/** Line height of a wrapped bar label, in font sizes. */
const BAR_LABEL_LH = 1.15;

/**
 * Ranked horizontal bars: label, square bar, the figure at its end. One highlighted mark, one callout. When the label
 * column would crowd the bars (a phone, long labels), each label sits on its own line above a full-width bar.
 */
function hbars(
  c: Ctx,
  o: {
    rows: BarRow[];
    max: number;
    ticks: number[];
    unit?: string;
    call?: string;
  },
): Form {
  const { th, s, w } = c;
  const n = o.rows.length;
  const valW = Math.max(...o.rows.map((r) => figWidth(r.text, s.val))) + 12;
  const labNatural =
    Math.max(
      ...o.rows.map((r) => textWidth(r.label, s.fs, labelWeight(r.hi))),
    ) + 16;
  const stacked =
    !c.thin &&
    (labNatural > w * SIDE_LABEL_MAX_SHARE ||
      w - labNatural - valW - c.wm < w * SIDE_BARS_MIN_SHARE);
  const labW = stacked ? 0 : Math.min(w * SIDE_LABEL_MAX_SHARE, labNatural);
  const x0 = labW;
  const x1 = w - valW - c.wm;
  const bw = Math.max(1, x1 - x0);
  const lines = o.rows.map((r) =>
    wrap(r.label, stacked ? w - c.wm : labW - 10, s.fs, labelWeight(r.hi)),
  );
  const lh = s.fs * BAR_LABEL_LH;
  const top = 6;
  // each row's bar centre and its first label line's baseline
  const slots: { yc: number; ly: number }[] = [];
  let barH: number;
  let bottom: number;
  if (stacked) {
    barH = s.bar * STACKED_BAR_SHARE;
    let y = top;
    lines.forEach((ls) => {
      const barTop = y + ls.length * lh + STACKED_LABEL_GAP;
      slots.push({ yc: barTop + barH / 2, ly: y + s.fs * LABEL_ASCENT });
      y = barTop + barH + STACKED_ROW_GAP;
    });
    bottom = y - STACKED_ROW_GAP + top;
  } else {
    // thin: the rows share the fixed height, down to the minimum row; a wrapped label still gets its lines
    const want = c.thin
      ? Math.min(s.row, Math.max(THIN_MIN_ROW, (c.fixH - top - 4) / n))
      : Math.max(s.row, Math.min(s.row * ROW_GROW_MAX, ROWS_FILL[c.size] / n));
    const row = Math.max(want, ...lines.map((l) => l.length * lh + 8));
    barH = c.thin ? Math.min(s.bar, row - 6) : (s.bar * want) / s.row;
    lines.forEach((ls, i) => {
      const yc = top + i * row + row / 2;
      slots.push({ yc, ly: yc + s.fs * 0.35 - ((ls.length - 1) / 2) * lh });
    });
    bottom = top + n * row;
  }
  const labelled = valueAxisLabels(c, o.ticks, o.max, bw, o.unit);
  let g = "";
  for (const t of o.ticks) {
    if (c.thin && t !== 0) continue;
    const x = x0 + (t / o.max) * bw;
    const stroke = t === 0 ? th.base : th.grid;
    // above-bar labels would be struck through by full-height gridlines; each bar gets its own stretch instead
    g += stacked
      ? slots
          .map(
            ({ yc }) =>
              `<line x1="${r1(x)}" x2="${r1(x)}" y1="${r1(yc - barH / 2 - STACKED_GRID_OVERSHOOT)}" y2="${r1(yc + barH / 2 + STACKED_GRID_OVERSHOOT)}" stroke="${stroke}"/>`,
          )
          .join("")
      : `<line x1="${r1(x)}" x2="${r1(x)}" y1="${top}" y2="${bottom}" stroke="${stroke}"/>`;
    if (labelled.includes(t))
      g += T(x, bottom + 19, tickText(t, o.unit), {
        fs: s.ax,
        c: th.axis,
        a: t === 0 ? "start" : "middle",
      });
  }
  o.rows.forEach((r, i) => {
    const { yc, ly } = slots[i];
    const bl = Math.max(2, (Math.min(r.v, o.max) / o.max) * bw);
    g += `<rect x="${r1(x0)}" y="${r1(yc - barH / 2)}" width="${r1(bl)}" height="${r1(barH)}" fill="${c.fill(r.hi ? th.hi : th.rest, r.hi ? "hi" : "rest", "h")}"/>`;
    lines[i].forEach((l, k) => {
      g += T(0, ly + k * lh, l, {
        fs: s.fs,
        w: labelWeight(r.hi),
        c: r.hi ? th.ink : th.body,
      });
    });
    g += T(x0 + bl + 8, yc + s.val * 0.34, r.text, {
      fs: s.val,
      w: 500,
      c: r.hi ? th.hi : c.thin ? th.body : th.ink,
      fig: true,
    });
    if (r.hi && o.call && c.size !== "sm" && !c.thin) {
      const vx = x0 + bl + 8 + figWidth(r.text, s.val) + 12;
      const fw = textWidth(o.call, s.call, 500) + 18;
      if (vx + fw <= w - c.wm)
        g += c.callout(vx, yc - s.callH / 2, o.call, { anchor: "start" });
    }
  });
  return { h: bottom + (c.thin ? 4 : 26), svg: g };
}

/** A column label may wrap to this many lines; past it, or when a word or a figure is wider than its column, the
 * columns are drawn as rows of bars (except thin, which keeps its columns and shortens the labels). */
const COLUMN_LABEL_MAX_LINES = 3;
/** Clear space kept on each side of a column's label and figure. */
const COLUMN_TEXT_PAD = 3;
/** Space under the plot before the first label line. */
const COLUMN_FOOT = 14;

/** Columns on a y axis: the figure on each column, the chosen column called out. */
function columns(
  c: Ctx,
  o: {
    rows: BarRow[];
    max: number;
    ticks: number[];
    unit?: string;
    call?: string;
  },
): Form {
  const { th, s, w } = c;
  const n = o.rows.length;
  // thin: no y axis (each column prints its own figure), so the plot starts at the left edge
  const axW = c.thin
    ? 0
    : Math.max(...o.ticks.map((t) => textWidth(tickText(t, o.unit), s.ax))) +
      12;
  const x0 = axW;
  const x1 = w - c.wm;
  const band = (x1 - x0) / n;
  const room = band - 2 * COLUMN_TEXT_PAD;
  const cw = Math.max(4, Math.min(band * 0.7, c.size === "lg" ? 124 : 96));
  const lh = s.ax + 4;
  const call = c.thin ? undefined : o.call;
  const top = (call ? s.callH + 16 : 0) + s.val + 10;
  let lines = o.rows.map((r) =>
    (c.thin ? wrapBalanced : wrap)(r.label, room, s.ax, labelWeight(r.hi)),
  );
  if (c.thin) {
    // thin keeps the caller's height: labels give up lines (and over-wide words their tails) before the plot shrinks
    // below its minimum; the sr-only table carries the full labels
    const maxLines = Math.max(
      1,
      Math.floor((c.fixH - top - COLUMN_FOOT - THIN_MIN_PLOT) / lh),
    );
    lines = lines.map((balanced, i) => {
      const wt = labelWeight(o.rows[i].hi);
      const ls = balanced.every((l) => textWidth(l, s.ax, wt) <= room)
        ? balanced
        : wrapAtHyphens(o.rows[i].label, room, s.ax, wt);
      const kept =
        ls.length > maxLines
          ? [
              ...ls.slice(0, maxLines - 1),
              ls.slice(maxLines - 1).join(" "),
            ]
          : ls;
      return kept.map((l) => clip(l, room, s.ax, wt));
    });
  } else {
    const fits =
      lines.every(
        (ls, i) =>
          ls.length <= COLUMN_LABEL_MAX_LINES &&
          ls.every(
            (l) => textWidth(l, s.ax, labelWeight(o.rows[i].hi)) <= room,
          ),
      ) && o.rows.every((r) => figWidth(r.text, s.val) <= room);
    if (!fits) return hbars(c, o);
  }
  const nl = Math.max(...lines.map((l) => l.length));
  const plotH = c.thin
    ? Math.max(THIN_MIN_PLOT, c.fixH - top - COLUMN_FOOT - nl * lh)
    : { sm: 150, md: 230, lg: 300 }[c.size];
  const bottom = top + plotH;
  const y = (v: number) => bottom - (Math.min(v, o.max) / o.max) * plotH;
  const labelled = c.thin
    ? []
    : fitTicks(o.ticks, o.max, plotH, () => s.ax, false);
  let g = "";
  for (const t of o.ticks) {
    if (c.thin && t !== 0) continue;
    g += `<line x1="${r1(x0)}" x2="${r1(x1)}" y1="${r1(y(t))}" y2="${r1(y(t))}" stroke="${t === 0 ? th.base : th.grid}"/>`;
    if (labelled.includes(t))
      g += T(0, y(t) + s.ax * 0.35, tickText(t, o.unit), {
        fs: s.ax,
        c: th.axis,
      });
  }
  o.rows.forEach((r, i) => {
    const cx = x0 + band * i + band / 2;
    const yt = y(r.v);
    g += `<rect x="${r1(cx - cw / 2)}" y="${r1(yt)}" width="${r1(cw)}" height="${r1(bottom - yt)}" fill="${c.fill(r.hi ? th.hi : th.rest, r.hi ? "hi" : "rest", "v")}"/>`;
    g += T(cx, yt - 8, r.text, {
      fs: s.val,
      w: 500,
      c: r.hi ? th.hi : c.thin ? th.body : th.ink,
      fig: true,
      a: "middle",
    });
    lines[i].forEach((l, k) => {
      g += T(cx, bottom + 18 + k * lh, l, {
        fs: s.ax,
        c: r.hi ? th.ink : th.muted,
        w: labelWeight(r.hi),
        a: "middle",
      });
    });
    if (r.hi && call)
      g += c.callout(cx, 2, call, {
        lx: cx,
        to: yt - s.val - 12,
        min: x0,
        max: x1,
      });
  });
  return { h: bottom + COLUMN_FOOT + nl * lh, svg: g };
}

/** A funnel of counts: each step's kept share solid, what was lost hatched. */
function funnel(c: Ctx, o: { rows: [string, number][] }): Form {
  const { th, s, w } = c;
  const n = o.rows.length;
  const first = o.rows[0][1] || 1;
  const gap = { sm: 10, md: 16, lg: 20 }[c.size];
  const x1 = w - c.wm;
  const cw = Math.max(4, (x1 - gap * (n - 1)) / n);
  const plotH = { sm: 150, md: 220, lg: 280 }[c.size];
  const lines = o.rows.map((r) => wrap(r[0], cw, s.fs, 500));
  const nl = Math.max(...lines.map((l) => l.length));
  const lh = s.fs + 5;
  const top = s.fig + 14;
  const bottom = top + plotH;
  const rx = c.size === "sm" ? 4 : 6;
  let g = "";
  o.rows.forEach((r, i) => {
    const x = i * (cw + gap);
    const kept = Math.max(0, Math.min(1, r[1] / first)) * plotH;
    const yt = bottom - kept;
    const last = i === n - 1;
    g += `<rect x="${r1(x + 0.5)}" y="${top + 0.5}" width="${r1(Math.max(0, cw - 1))}" height="${plotH - 1}" rx="${rx}" fill="${c.hatch()}" stroke="${th.hatchEdge}"/>`;
    g += `<rect x="${r1(x)}" y="${r1(yt)}" width="${r1(cw)}" height="${r1(kept)}" rx="${rx}" fill="${th.hi}"/>`;
    // the step's count: "318 of 336" whole when it fits, the "of" smaller when it does not, then a smaller size
    let fs = s.fig;
    const ofText = ` of ${nf(first)}`;
    const whole =
      i > 0 &&
      c.size !== "sm" &&
      figWidth(`${nf(r[1])}${ofText}`, fs, -0.03) <= cw;
    let big: string;
    if (i === 0) big = esc(nf(r[1]));
    else if (whole) big = esc(`${nf(r[1])}${ofText}`);
    else {
      while (
        fs > 11 &&
        figWidth(nf(r[1]), fs, -0.03) + figWidth(ofText, fs * 0.62, -0.01) > cw
      )
        fs -= 1;
      big = `${esc(nf(r[1]))}<tspan font-size="${r1(fs * 0.62)}" fill="${th.muted}" letter-spacing="-0.01em">${esc(ofText)}</tspan>`;
    }
    g += T(x, top - 12, big, {
      fs,
      w: 500,
      c: last ? th.hi : th.ink,
      fig: true,
      raw: true,
      ls: "-0.03em",
    });
    const lost = first - r[1];
    if (lost > 0 && c.size !== "sm" && plotH - kept > 40) {
      const t = `${nf(lost)} lost`;
      const tw0 = textWidth(t, s.ax, 500) + 14;
      if (tw0 < cw) {
        g += `<rect x="${r1(x + cw / 2 - tw0 / 2)}" y="${r1(top + (plotH - kept) / 2 - 11)}" width="${r1(tw0)}" height="22" fill="${th.bg}"/>`;
        g += T(x + cw / 2, top + (plotH - kept) / 2 + s.ax * 0.36, t, {
          fs: s.ax,
          w: 500,
          c: th.muted,
          a: "middle",
        });
      }
    }
    if (c.size !== "sm" && i > 0 && kept > s.ax + 14)
      g += T(x + 10, yt + s.ax + 8, `${((r[1] / first) * 100).toFixed(1)}%`, {
        fs: s.ax,
        w: 500,
        c: th.onHi,
      });
    lines[i].forEach((l, k) => {
      g += T(x, bottom + 20 + k * lh, l, { fs: s.fs, w: 500, c: th.ink });
    });
  });
  return { h: bottom + 16 + nl * lh, svg: g };
}

interface Seg {
  label: string;
  v: number;
  count?: string;
  style: "hi" | "rest" | "hatch";
}
/** A 100% bar: the highlighted share solid, the next plain, the remainder hatched; a key below. */
function stack(c: Ctx, o: { segs: Seg[] }): Form {
  const { th, s } = c;
  const x1 = c.w - c.wm;
  const bh = { sm: 30, md: 44, lg: 56 }[c.size];
  const top = 4;
  let g = "";
  let x = 0;
  const total = o.segs.reduce((a, sg) => a + sg.v, 0);
  const scale = total > 100 ? 100 / total : 1;
  const fillOf = (sg: Seg) =>
    sg.style === "hi" ? th.hi : sg.style === "rest" ? th.rest : c.hatch();
  o.segs.forEach((sg) => {
    const sw = Math.max(0, ((sg.v * scale) / 100) * x1);
    if (sg.style === "hatch")
      g += `<rect x="${r1(x + 0.5)}" y="${top + 0.5}" width="${r1(Math.max(0, sw - 1))}" height="${bh - 1}" fill="${fillOf(sg)}" stroke="${th.hatchEdge}"/>`;
    else
      g += `<rect x="${r1(x)}" y="${top}" width="${r1(sw)}" height="${bh}" fill="${fillOf(sg)}"/>`;
    const tt = pct(sg.v);
    const need = figWidth(tt, s.val) + 16;
    if (sw > need) {
      // a hatched remainder carries its label at its far end, so it never reads as the narrow segment's value
      if (sg.style === "hatch") {
        g += `<rect x="${r1(x + sw - need + 2)}" y="${r1(top + bh / 2 - s.val * 0.62)}" width="${r1(need - 4)}" height="${r1(s.val * 1.24)}" fill="${th.bg}"/>`;
        g += T(x + sw - 10, top + bh / 2 + s.val * 0.34, tt, {
          fs: s.val,
          w: 500,
          c: th.ink,
          fig: true,
          a: "end",
        });
      } else
        g += T(x + 10, top + bh / 2 + s.val * 0.34, tt, {
          fs: s.val,
          w: 500,
          c: sg.style === "hi" ? th.onHi : th.ink,
          fig: true,
        });
    }
    x += sw;
  });
  let y = top + bh;
  [0, 25, 50, 75, 100].forEach((t) => {
    const tx = (t / 100) * x1;
    g += `<line x1="${r1(tx)}" x2="${r1(tx)}" y1="${y}" y2="${y + 6}" stroke="${th.base}"/>`;
    g += T(tx, y + 20, `${t}%`, {
      fs: s.ax,
      c: th.axis,
      a: t === 0 ? "start" : t === 100 ? "end" : "middle",
    });
  });
  y += 40;
  const kh = s.row;
  const valW = Math.max(...o.segs.map((sg) => figWidth(pct(sg.v), s.val)));
  o.segs.forEach((sg, i) => {
    const yc = y + i * kh + kh / 2;
    const sq = 12;
    g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y + i * kh)}" y2="${r1(y + i * kh)}" stroke="${th.grid}"/>`;
    g += `<rect x="0" y="${r1(yc - sq / 2)}" width="${sq}" height="${sq}" fill="${fillOf(sg)}"${sg.style === "hatch" ? ` stroke="${th.hatchEdge}"` : ""}/>`;
    g += T(sq + 10, yc + s.fs * 0.35, sg.label, {
      fs: s.fs,
      w: labelWeight(sg.style === "hi"),
      c: sg.style === "hi" ? th.ink : th.body,
    });
    if (sg.count && c.size !== "sm") {
      const cx = x1 - Math.max(80, valW + 24);
      if (
        cx - textWidth(sg.count, s.fs) >
        sq + 10 + textWidth(sg.label, s.fs, 500) + 12
      )
        g += T(cx, yc + s.fs * 0.35, sg.count, {
          fs: s.fs,
          c: th.muted,
          a: "end",
        });
    }
    g += T(x1, yc + s.val * 0.34, pct(sg.v), {
      fs: s.val,
      w: 500,
      c: sg.style === "hi" ? th.hi : th.ink,
      fig: true,
      a: "end",
    });
  });
  g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y + o.segs.length * kh)}" y2="${r1(y + o.segs.length * kh)}" stroke="${th.grid}"/>`;
  return { h: y + o.segs.length * kh + 2, svg: g };
}

/** Slope: two readings per row, the leading row drawn heavy, labels kept apart. */
function slope(
  c: Ctx,
  o: {
    rows: { label: string; a: number; b: number; hi: boolean }[];
    max: number;
    ticks: number[];
    aTitle: string;
    bTitle: string;
  },
): Form {
  const { th, s, w } = c;
  const H = c.thin
    ? Math.max(c.fixH, s.ax + 22 + o.rows.length * (s.fs + 5) + 24)
    : { sm: 320, md: 380, lg: 460 }[c.size];
  const top = s.ax + 22;
  const bot = H - 14;
  const y = (v: number) => bot - (Math.min(v, o.max) / o.max) * (bot - top);
  const fmt = (v: number) => v.toFixed(2);
  const nameW = Math.max(...o.rows.map((r) => textWidth(r.label, s.fs, 500)));
  const lvW = Math.max(...o.rows.map((r) => figWidth(fmt(r.a), s.val)));
  const rvW = Math.max(...o.rows.map((r) => figWidth(fmt(r.b), s.val)));
  const x0 = Math.max(nameW + lvW + 30, textWidth(o.aTitle, s.ax, 500) / 2);
  const x1 = Math.max(x0 + 24, w - rvW - 16 - c.wm, x0 + 24);
  interface P {
    r: (typeof o.rows)[number];
    y: number;
    ly: number;
  }
  const relax = (arr: P[], gap: number): P[] => {
    const a = arr.slice().sort((p, q) => p.y - q.y);
    for (let k = 0; k < 40; k++)
      for (let i = 1; i < a.length; i++)
        if (a[i].ly - a[i - 1].ly < gap) {
          const d = (gap - (a[i].ly - a[i - 1].ly)) / 2;
          a[i].ly += d;
          a[i - 1].ly -= d;
        }
    const over = a[a.length - 1].ly - (bot + 4);
    if (over > 0) a.forEach((p) => (p.ly -= over));
    for (let i = a.length - 2; i >= 0; i--)
      if (a[i + 1].ly - a[i].ly < gap) a[i].ly = a[i + 1].ly - gap;
    return a;
  };
  const L = relax(
    o.rows.map((r) => ({ r, y: y(r.a), ly: y(r.a) })),
    s.fs + 5,
  );
  const R = relax(
    o.rows.map((r) => ({ r, y: y(r.b), ly: y(r.b) })),
    s.fs + 5,
  );
  let g = "";
  for (const t of o.ticks)
    g += `<line x1="${r1(x0)}" x2="${r1(x1)}" y1="${r1(y(t))}" y2="${r1(y(t))}" stroke="${t === 0 ? th.base : th.grid}"/>`;
  g += `<line x1="${r1(x0)}" x2="${r1(x0)}" y1="${top - 8}" y2="${bot}" stroke="${th.base}"/><line x1="${r1(x1)}" x2="${r1(x1)}" y1="${top - 8}" y2="${bot}" stroke="${th.base}"/>`;
  const bTw = textWidth(o.bTitle, s.ax, 500);
  g += T(x0, s.ax, o.aTitle, { fs: s.ax, w: 500, c: th.muted, a: "middle" });
  g += T(Math.min(x1, w - bTw / 2), s.ax, o.bTitle, {
    fs: s.ax,
    w: 500,
    c: th.muted,
    a: "middle",
  });
  const rows = o.rows.slice().sort((p, q) => (p.hi ? 1 : 0) - (q.hi ? 1 : 0));
  for (const r of rows) {
    const col = r.hi ? th.hi : th.line2;
    const rad = r.hi ? 5.5 : 3.5;
    g += `<line x1="${r1(x0)}" y1="${r1(y(r.a))}" x2="${r1(x1)}" y2="${r1(y(r.b))}" stroke="${col}" stroke-width="${r.hi ? 3 : 1.5}" stroke-linecap="round"/>`;
    g += `<circle cx="${r1(x0)}" cy="${r1(y(r.a))}" r="${rad}" fill="${th.bg}" stroke="${col}" stroke-width="${r.hi ? 2.5 : 1.5}"/>`;
    g += `<circle cx="${r1(x1)}" cy="${r1(y(r.b))}" r="${rad}" fill="${col}" stroke="${r.hi ? col : th.bg}" stroke-width="${r.hi ? 2.5 : 1.5}"/>`;
  }
  for (const p of L) {
    const hi = p.r.hi;
    if (Math.abs(p.ly - p.y) > 3)
      g += `<line x1="${r1(x0 - 5)}" y1="${r1(p.y)}" x2="${r1(x0 - 11)}" y2="${r1(p.ly)}" stroke="${th.line2}"/>`;
    g += T(x0 - 14, p.ly + s.val * 0.34, fmt(p.r.a), {
      fs: s.val,
      w: 500,
      c: hi ? th.hi : th.ink,
      fig: true,
      a: "end",
    });
    g += T(x0 - 22 - lvW, p.ly + s.fs * 0.35, p.r.label, {
      fs: s.fs,
      w: labelWeight(hi),
      c: hi ? th.hi : th.body,
      a: "end",
    });
  }
  for (const p of R)
    if (Math.abs(p.ly - p.y) > 3)
      g += `<line x1="${r1(x1 + 5)}" y1="${r1(p.y)}" x2="${r1(x1 + 11)}" y2="${r1(p.ly)}" stroke="${th.line2}"/>`;
  for (const p of R)
    g += T(x1 + 14, p.ly + s.val * 0.34, fmt(p.r.b), {
      fs: s.val,
      w: 500,
      c: p.r.hi ? th.hi : th.muted,
      fig: true,
    });
  return { h: H, svg: g };
}

/** Dot and range per row: one dot per column on a shared axis, the swing (highest over lowest) at the right. */
function dots(
  c: Ctx,
  o: {
    cols: string[];
    max: number;
    unit?: string;
    rows: { label: string; vals: number[]; hi: boolean }[];
  },
): Form {
  const { th, s, w } = c;
  const n = o.rows.length;
  const swingText = (vals: number[]) => {
    const lo = Math.min(...vals);
    return lo > 0 ? `${(Math.max(...vals) / lo).toFixed(1)}×` : "–";
  };
  const labW =
    Math.max(...o.rows.map((r) => textWidth(r.label, s.fs, 500))) + 16;
  const swW =
    Math.max(
      textWidth("Swing", s.ax, 500),
      ...o.rows.map((r) => figWidth(swingText(r.vals), s.val)),
    ) + 14;
  const x0 = labW;
  const x1 = w - swW - c.wm - 8;
  const bw = Math.max(1, x1 - x0);
  const x = (v: number) => x0 + (Math.min(v, o.max) / o.max) * bw;
  const top = s.ax + 16;
  const rh = c.thin
    ? Math.min(s.row + 2, Math.max(THIN_MIN_ROW + 4, (c.fixH - top - 8) / n))
    : s.row + (c.size === "sm" ? 2 : 6);
  const bottom = top + n * rh;
  const ticks = c.thin ? [0] : ticksFor(o.max);
  const labelled = valueAxisLabels(c, ticks, o.max, bw, o.unit);
  let g = "";
  for (const t of ticks) {
    g += `<line x1="${r1(x(t))}" x2="${r1(x(t))}" y1="${top - 4}" y2="${bottom}" stroke="${t === 0 ? th.base : th.grid}"/>`;
    if (labelled.includes(t))
      g += T(x(t), bottom + 19, tickText(t, o.unit), {
        fs: s.ax,
        c: th.axis,
        a: t === 0 ? "start" : "middle",
      });
  }
  g += T(w - c.wm, s.ax, "Swing", { fs: s.ax, w: 500, c: th.muted, a: "end" });
  const dr = { sm: 5, md: 6, lg: 7 }[c.size];
  o.rows.forEach((r, i) => {
    const yc = top + i * rh + rh / 2;
    const xs = r.vals.map(x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    if (r.hi)
      g += `<rect x="0" y="${r1(top + i * rh + 1)}" width="${r1(w - c.wm)}" height="${rh - 2}" fill="${th.band}"/>`;
    g += `<line x1="${r1(lo)}" x2="${r1(hi)}" y1="${r1(yc)}" y2="${r1(yc)}" stroke="${r.hi ? th.hi : th.line2}" stroke-width="${r.hi ? 3 : 2}"/>`;
    xs.forEach((cx, k) => {
      g += `<circle cx="${r1(cx)}" cy="${r1(yc)}" r="${dr}" fill="${th.eng[k % 3]}" stroke="${th.bg}" stroke-width="2"/>`;
    });
    g += T(8, yc + s.fs * 0.35, r.label, {
      fs: s.fs,
      w: labelWeight(r.hi),
      c: r.hi ? th.ink : th.body,
    });
    g += T(w - c.wm - 8, yc + s.val * 0.34, swingText(r.vals), {
      fs: s.val,
      w: 500,
      c: r.hi ? th.hi : th.ink,
      fig: true,
      a: "end",
    });
  });
  return {
    h: bottom + (c.thin ? 8 : 30),
    svg: g,
    legend: o.cols.map((label, k) => ({
      label,
      color: th.eng[k % 3],
      dot: true,
    })),
  };
}

/** Small multiples: one panel of bars per group, the keys shared down the left. Stacked one panel per row on phones. */
function multiples(
  c: Ctx,
  o: {
    keys: string[];
    panels: { name: string; vals: number[]; note?: string }[];
    max: number;
    hi: number;
  },
): Form {
  const { th, s, w } = c;
  const stacked = w < MULTIPLES_STACK_BELOW && o.panels.length > 1;
  const n = o.keys.length;
  const labW = Math.max(...o.keys.map((k) => textWidth(k, s.fs, 500))) + 14;
  const keys = (top: number, rh: number) =>
    o.keys
      .map((k, i) =>
        T(0, top + i * rh + rh / 2 + s.fs * 0.35, k, {
          fs: s.fs,
          w: labelWeight(i === o.hi),
          c: i === o.hi ? th.ink : th.body,
        }),
      )
      .join("");
  const valW =
    Math.max(
      ...o.panels.flatMap((p) =>
        p.vals.map((v) => figWidth(v.toFixed(1), s.fs)),
      ),
    ) + 8;
  const panel = (
    p: (typeof o.panels)[number],
    px: number,
    pw: number,
    top: number,
    rh: number,
  ) => {
    const bottom = top + n * rh;
    const bw = Math.max(1, pw - valW - 4);
    let g = `<line x1="${r1(px)}" x2="${r1(px)}" y1="${top - 2}" y2="${bottom}" stroke="${th.base}"/>`;
    p.vals.forEach((v, i) => {
      const yc = top + i * rh + rh / 2;
      const bl = (Math.min(v, o.max) / o.max) * bw;
      const hi = i === o.hi;
      const bh = Math.min(s.bar, rh - 8);
      g += `<rect x="${r1(px)}" y="${r1(yc - bh / 2)}" width="${r1(bl)}" height="${r1(bh)}" fill="${c.fill(hi ? th.hi : th.rest, hi ? "hi" : "rest", "h")}"/>`;
      g += T(px + bl + 6, yc + s.fs * 0.36, v.toFixed(1), {
        fs: s.fs,
        w: 500,
        c: hi ? th.hi : th.ink,
        fig: true,
      });
    });
    return g;
  };
  const rh = c.size === "sm" ? 24 : s.row - 4;
  let g = "";
  if (stacked) {
    // G paper, phone: Figure 3 drawn once per engine at full width, a rule between panels
    let y = 0;
    o.panels.forEach((p, j) => {
      if (j > 0) {
        y += 24;
        g += `<line x1="0" x2="${r1(w - c.wm)}" y1="${r1(y)}" y2="${r1(y)}" stroke="${th.grid}"/>`;
        y += 24;
      }
      g += T(labW, y + s.fs, p.name, { fs: s.fs, w: 500, c: th.ink });
      if (p.note)
        g += T(labW, y + s.fs + s.ax + 6, p.note, { fs: s.ax, c: th.muted });
      const top = y + (p.note ? s.fs + s.ax + 18 : s.fs + 12) + 6;
      g += keys(top, rh) + panel(p, labW, w - labW - c.wm, top, rh);
      y = top + n * rh;
    });
    return { h: y + 4, svg: g };
  }
  const m = o.panels.length;
  const gap = { sm: 8, md: 18, lg: 24 }[c.size];
  const pw = (w - labW - c.wm - gap * (m - 1)) / m;
  const withNotes = c.size !== "sm" && o.panels.some((p) => p.note);
  const head = withNotes ? s.fs + s.ax + 18 : s.fs + 10;
  const top = head + 6;
  o.panels.forEach((p, j) => {
    const px = labW + j * (pw + gap);
    g += T(px, s.fs, p.name, { fs: s.fs, w: 500, c: th.ink });
    if (withNotes && p.note)
      g += T(px, s.fs + s.ax + 6, p.note, { fs: s.ax, c: th.muted });
    g += panel(p, px, pw, top, rh);
  });
  g += keys(top, rh);
  return { h: top + n * rh + 4, svg: g };
}

/** Leaders matrix: who comes first in each cell. LoudFace's cells solid with the mark; the next leader tinted. */
function matrix(
  c: Ctx,
  o: { cols: string[]; rows: [string, string[]][] },
  logo: boolean,
): Form {
  const { th, s, w } = c;
  const m = o.cols.length;
  const split = (v: string) => {
    const parts = v.split(" ");
    const num = parts.length > 1 ? (parts.pop() as string) : "";
    return { name: parts.join(" "), num };
  };
  const counts = new Map<string, number>();
  o.rows.forEach((r) =>
    r[1].forEach((v) =>
      counts.set(split(v).name, (counts.get(split(v).name) ?? 0) + 1),
    ),
  );
  const order = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);
  const lead = order.includes("LoudFace") ? "LoudFace" : order[0];
  const second = order.find((nm) => nm !== lead);
  const labWide =
    Math.max(...o.rows.map((r) => textWidth(r[0], s.fs, 500))) + 18;
  const gap = 3;
  const sm = c.size === "sm" || (w - labWide - c.wm - gap * (m - 1)) / m < 130;
  const labW = sm ? 0 : labWide;
  const cw = (w - labW - c.wm - gap * (m - 1)) / m;
  const ch = { sm: 46, md: 62, lg: 72 }[c.size];
  const nfs = sm ? s.ax : s.fs;
  const top = s.ax + 12;
  let g = "";
  let y = top;
  o.cols.forEach((h, i) => {
    g += T(labW + i * (cw + gap) + (sm ? 0 : 12), s.ax, h, {
      fs: s.ax,
      w: 500,
      c: th.muted,
    });
  });
  o.rows.forEach((r) => {
    if (sm) {
      g += T(0, y + s.ax + 2, r[0], { fs: s.ax, w: 500, c: th.body });
      y += s.ax + 10;
    } else
      g += T(0, y + ch / 2 + s.fs * 0.35, r[0], {
        fs: s.fs,
        w: 500,
        c: th.ink,
      });
    r[1].forEach((v, i) => {
      const { name, num } = split(v);
      const isLead = name === lead;
      const isSecond = name === second;
      const x = labW + i * (cw + gap);
      const bg = isLead ? th.cellHi : isSecond ? th.cellA : th.cellB;
      const ink = isLead ? th.cellHiInk : th.cellInk;
      g +=
        bg === "outline"
          ? `<rect x="${r1(x + 0.75)}" y="${r1(y + 0.75)}" width="${r1(cw - 1.5)}" height="${ch - 1.5}" fill="none" stroke="${th.line2}" stroke-width="1.5"/>`
          : `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(cw)}" height="${ch}" fill="${bg}"/>`;
      const pad = sm ? 8 : 12;
      const pr = sm ? 0 : 8;
      let nx = x + pad;
      if (isLead && lead === "LoudFace" && logo && !sm) {
        g += c.pin(nx + pr, y + pad + pr, pr);
        nx += pr * 2 + 7;
      }
      // a name wider than its cell is squeezed to fit, never cut
      const avail = x + cw - pad - nx;
      const squeeze =
        textWidth(name, nfs, 500) > avail
          ? ` textLength="${r1(avail)}" lengthAdjust="spacingAndGlyphs"`
          : "";
      g += T(nx, y + pad + nfs * 0.82 + (sm ? 0 : 1), name, {
        fs: nfs,
        w: 500,
        c: ink,
        extra: squeeze,
      });
      if (num)
        g += T(x + pad, y + ch - pad, num, {
          fs: sm ? s.val - 1 : s.val + 1,
          w: 500,
          c: ink,
          fig: true,
        });
    });
    y += ch + gap;
  });
  const legend: LegendItem[] = [{ label: `${lead} leads`, color: th.cellHi }];
  if (second) legend.push({ label: `${second} leads`, color: th.cellA });
  if (order.length > 2)
    legend.push(
      th.cellB === "outline"
        ? { label: "Others lead", color: "none", outline: th.line2 }
        : { label: "Others lead", color: th.cellB },
    );
  return { h: y, svg: g, legend };
}

/** A ranked table with an inline bar column; highlighted rows banded. Two lines per row when it is narrow. */
function table(
  c: Ctx,
  o: {
    cols: string[];
    bar: number;
    unit?: string;
    rows: (string | number)[][];
    highlight: number[];
  },
): Form {
  const { th, s, w } = c;
  const x1 = w - c.wm;
  const cell = (v: string | number, ci: number) =>
    typeof v === "number"
      ? ci === o.bar && o.unit === "%"
        ? pct(v)
        : nf(v)
      : v;
  const barMax = Math.max(...o.rows.map((r) => Number(r[o.bar]) || 0)) || 1;
  const isNum = o.cols.map((_, ci) =>
    o.rows.every((r) => typeof r[ci] === "number"),
  );
  const colW = o.cols.map((h, ci) =>
    Math.max(
      textWidth(h, s.ax, 500),
      ...o.rows.map((r) =>
        textWidth(cell(r[ci], ci), s.fs, ci === 0 ? 500 : 400),
      ),
    ),
  );
  const valW = Math.max(
    textWidth(o.cols[o.bar], s.ax, 500),
    ...o.rows.map((r) => figWidth(cell(r[o.bar], o.bar), s.val)),
  );
  const top = s.ax + 14;
  // wide layout: leading columns left to right, trailing columns from the right, the bar in between
  const lead = o.cols.map((_, ci) => ci).filter((ci) => ci < o.bar);
  const trail = o.cols.map((_, ci) => ci).filter((ci) => ci > o.bar);
  const x: number[] = [];
  let cur = 0;
  lead.forEach((ci, k) => {
    x[ci] = isNum[ci] ? cur + colW[ci] : cur; // numbers are right-aligned at their column's right edge
    cur += colW[ci] + (k === 0 ? 24 : 22);
  });
  const barX = cur;
  let right = x1;
  [...trail].reverse().forEach((ci) => {
    x[ci] = isNum[ci] ? right : right - colW[ci];
    right -= colW[ci] + 24;
  });
  const valRight = right; // the bar column's figures end where the trailing columns begin, less a gap
  const barW = valRight - valW - 14 - barX;
  const narrow = c.size === "sm" || barW < 80;
  const pctTail = /^(.*?)( [\d.,]+%)$/;
  let g = "";
  const head = (hx: number, t: string, a?: "start" | "end") =>
    T(hx, s.ax, t, { fs: s.ax, w: 500, c: th.muted, a });
  if (narrow) {
    const bx = x1 * 0.5;
    const subW = bx - 12;
    const subs = o.rows.map((r) =>
      wrap(
        r
          .map((v, ci) => (ci === 0 || ci === o.bar ? null : cell(v, ci)))
          .filter((v): v is string => v !== null)
          .join(" · "),
        subW,
        s.ax,
      ),
    );
    g += head(0, o.cols[0]) + head(x1, o.cols[o.bar], "end");
    // what the second line of each row holds, under the first column's head
    const subHead = wrap(
      o.cols.filter((_, ci) => ci !== 0 && ci !== o.bar).join(" · "),
      subW,
      s.ax,
    );
    subHead.forEach((l, k) => {
      g += T(0, s.ax + (k + 1) * (s.ax + 3), l, { fs: s.ax, c: th.muted });
    });
    const ntop = top + subHead.length * (s.ax + 3);
    g += `<line x1="0" x2="${r1(x1)}" y1="${r1(ntop - 4)}" y2="${r1(ntop - 4)}" stroke="${th.base}"/>`;
    let y0 = ntop - 4;
    o.rows.forEach((r, i) => {
      const own = o.highlight.includes(i);
      const lines = subs[i].filter(Boolean);
      const rh = Math.max(40, 10 + s.fs + lines.length * (s.ax + 3) + 8);
      const yc = y0 + rh / 2;
      if (own)
        g += `<rect x="0" y="${r1(y0 + 1)}" width="${r1(x1)}" height="${r1(rh - 1)}" fill="${th.band}"/>`;
      const ty = y0 + 8 + s.fs * 0.85;
      g += T(0, ty, String(cell(r[0], 0)), {
        fs: s.fs,
        w: 500,
        c: own ? th.hi : th.ink,
      });
      lines.forEach((l, k) => {
        g += T(0, ty + (k + 1) * (s.ax + 3) + 1, l, { fs: s.ax, c: th.muted });
      });
      const bw = x1 - 46 - bx;
      const bl = Math.max(2, ((Number(r[o.bar]) || 0) / barMax) * bw);
      const hi = i === 0 || own;
      g += `<rect x="${r1(bx)}" y="${r1(yc - 5)}" width="${r1(bl)}" height="10" fill="${c.fill(hi ? th.hi : th.rest, hi ? "hi" : "rest", "h")}"/>`;
      g += T(x1, yc + s.val * 0.34, cell(r[o.bar], o.bar), {
        fs: s.val,
        w: 500,
        c: hi ? th.hi : th.ink,
        fig: true,
        a: "end",
      });
      y0 += rh;
      g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y0)}" y2="${r1(y0)}" stroke="${th.grid}"/>`;
    });
    return { h: y0 + 2, svg: g };
  }
  lead.forEach((ci) => {
    g += head(x[ci], o.cols[ci], isNum[ci] ? "end" : undefined);
  });
  g += head(valRight, o.cols[o.bar], "end");
  trail.forEach((ci) => {
    g += head(x[ci], o.cols[ci], isNum[ci] ? "end" : undefined);
  });
  g += `<line x1="0" x2="${r1(x1)}" y1="${top - 4}" y2="${top - 4}" stroke="${th.base}"/>`;
  const rh = s.row;
  o.rows.forEach((r, i) => {
    const own = o.highlight.includes(i);
    const y0 = top - 4 + i * rh;
    const yc = y0 + rh / 2;
    if (own)
      g += `<rect x="0" y="${r1(y0 + 1)}" width="${r1(x1)}" height="${rh - 1}" fill="${th.band}"/>`;
    [...lead, ...trail].forEach((ci) => {
      const t = String(cell(r[ci], ci));
      const ty = yc + s.fs * 0.35;
      if (ci === 0)
        g += T(x[ci], ty, t, { fs: s.fs, w: 500, c: own ? th.hi : th.ink });
      else if (isNum[ci])
        g += T(x[ci], ty, t, { fs: s.fs, c: th.body, a: "end" });
      else {
        const m = t.match(pctTail);
        if (m)
          g +=
            T(x[ci], ty, m[1], { fs: s.fs, c: th.body }) +
            T(x[ci] + textWidth(`${m[1]} `, s.fs), ty, m[2].trim(), {
              fs: s.fs,
              c: th.muted,
            });
        else g += T(x[ci], ty, t, { fs: s.fs, c: th.body });
      }
    });
    const hi = i === 0 || own;
    const bl = Math.max(2, ((Number(r[o.bar]) || 0) / barMax) * barW);
    g += `<rect x="${r1(barX)}" y="${r1(yc - 6)}" width="${r1(bl)}" height="12" fill="${c.fill(hi ? th.hi : th.rest, hi ? "hi" : "rest", "h")}"/>`;
    g += T(valRight, yc + s.val * 0.34, cell(r[o.bar], o.bar), {
      fs: s.val,
      w: 500,
      c: hi ? th.hi : th.ink,
      fig: true,
      a: "end",
    });
    g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y0 + rh)}" y2="${r1(y0 + rh)}" stroke="${th.grid}"/>`;
  });
  return { h: top - 4 + o.rows.length * rh + 2, svg: g };
}

/** A ruled list: the label quiet, the value named; the first row marked. */
function list(
  c: Ctx,
  o: { rows: [string, string][]; heads?: [string, string] },
): Form {
  const { th, s, w } = c;
  const x1 = w - c.wm;
  const top = o.heads ? s.ax + 14 : 4;
  const rh = c.thin
    ? Math.min(
        s.row,
        Math.max(THIN_MIN_ROW + 4, (c.fixH - top) / o.rows.length),
      )
    : s.row;
  let g = "";
  if (o.heads)
    g +=
      T(0, s.ax, o.heads[0], { fs: s.ax, w: 500, c: th.muted }) +
      T(x1, s.ax, o.heads[1], { fs: s.ax, w: 500, c: th.muted, a: "end" });
  g += `<line x1="0" x2="${r1(x1)}" y1="${top - 4}" y2="${top - 4}" stroke="${th.base}"/>`;
  o.rows.forEach((r, i) => {
    const y0 = top - 4 + i * rh;
    const yc = y0 + rh / 2;
    g += T(0, yc + s.fs * 0.35, r[0], { fs: s.fs, c: th.body });
    const lw = figWidth(r[1], s.val);
    g += `<rect x="${r1(x1 - lw - 18)}" y="${r1(yc - 4)}" width="8" height="8" fill="${i === 0 ? th.hi : th.rest}"/>`;
    g += T(x1, yc + s.val * 0.34, r[1], {
      fs: s.val,
      w: 500,
      c: i === 0 ? th.hi : th.ink,
      fig: true,
      a: "end",
    });
    g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y0 + rh)}" y2="${r1(y0 + rh)}" stroke="${th.grid}"/>`;
  });
  return { h: top - 4 + o.rows.length * rh + 2, svg: g };
}

/* ------------------------------------------------------------------ spec → form */

const fmtOf = (unit?: string) => (v: number) => (unit === "%" ? pct(v) : nf(v));

/** A bars spec drawn as one 100% bar: its `form`, or a percentage whole (max 100, parts summing to 100). */
export function isStack(spec: ChartSpec): boolean {
  if (spec.type !== "bars") return false;
  const f = notes(spec).form;
  if (f) return f === "stack";
  const sum = spec.rows.reduce((a, r) => a + r[1], 0);
  return (
    spec.unit === "%" &&
    spec.max === 100 &&
    Math.abs(sum - 100) < 0.6 &&
    spec.rows.length <= 4
  );
}

/**
 * Thin cards draw small part-of-a-whole charts as plain columns of the same numbers (the board's THIN and CARD
 * forms): a funnel, a split, a 100% bar and a bar list of up to four rows. At about 120px a funnel's figures and
 * two-line labels leave a plot of about 25px; columns keep 50-60px. Null: the type keeps its own form.
 */
function thinColumns(spec: ChartSpec): {
  rows: BarRow[];
  max: number;
} | null {
  switch (spec.type) {
    case "funnel": {
      const first = spec.rows[0][1] || 1;
      return {
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          v: r[1],
          text: nf(r[1]),
          hi: i === spec.rows.length - 1,
        })),
        max: first,
      };
    }
    case "split":
      return {
        rows: [
          { label: spec.a[0], v: spec.a[1], text: pct(spec.a[1]), hi: true },
          { label: spec.b[0], v: spec.b[1], text: pct(spec.b[1]), hi: false },
        ],
        max: 100,
      };
    case "bars": {
      if (!isStack(spec) && spec.rows.length > 4) return null;
      const f = isStack(spec) ? pct : fmtOf(spec.unit);
      return {
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          v: r[1],
          text: f(r[1]),
          hi: i === 0,
        })),
        max: isStack(spec) ? 100 : spec.max,
      };
    }
    default:
      return null;
  }
}

function drawForm(c: Ctx, spec: ChartSpec, logo: boolean): Form {
  const a = notes(spec);
  if (c.thin) {
    const cols = thinColumns(spec);
    if (cols) return columns(c, { ...cols, ticks: [0, cols.max] });
  }
  switch (spec.type) {
    case "bars": {
      if (isStack(spec)) {
        const styles: Seg["style"][] = ["hi", "rest", "hatch"];
        return stack(c, {
          segs: spec.rows.map((r, i) => ({
            label: r[0],
            v: r[1],
            count: r[2],
            style: styles[Math.min(i, 2)],
          })),
        });
      }
      const f = fmtOf(spec.unit);
      return hbars(c, {
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          v: r[1],
          text: f(r[1]),
          hi: i === 0,
        })),
        max: spec.max,
        ticks: ticksFor(spec.max),
        unit: spec.unit,
        call: a.call,
      });
    }
    case "columns": {
      const f = fmtOf(spec.unit);
      const hi = spec.hi ?? spec.rows.length - 1;
      return columns(c, {
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          v: r[1],
          text: f(r[1]),
          hi: i === hi,
        })),
        max: spec.max,
        ticks: ticksFor(spec.max),
        unit: spec.unit,
        call: a.call,
      });
    }
    case "funnel":
      return funnel(c, { rows: spec.rows });
    case "split":
      return stack(c, {
        segs: [
          { label: spec.a[0], v: spec.a[1], style: "hi" },
          { label: spec.b[0], v: spec.b[1], style: "hatch" },
        ],
      });
    case "matrix":
      return matrix(c, spec, logo);
    case "list":
      return list(c, { rows: spec.rows, heads: a.heads });
    case "dots": {
      const swing = (v: number[]) =>
        Math.min(...v) > 0 ? Math.max(...v) / Math.min(...v) : 0;
      const top = spec.rows.reduce(
        (b, r, i) => (swing(r[1]) > swing(spec.rows[b][1]) ? i : b),
        0,
      );
      return dots(c, {
        cols: spec.cols,
        max: spec.max,
        unit: a.unit,
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          vals: r[1],
          hi: i === top,
        })),
      });
    }
    case "table":
      return table(c, {
        cols: spec.cols,
        bar: spec.bar,
        unit: spec.unit,
        rows: spec.rows,
        highlight: spec.highlight ?? [],
      });
    case "multiples": {
      const all = spec.groups.flatMap((g) => g[1]);
      const peak = Math.max(...all, 0);
      const step = peak > 0 ? niceStep(peak / 4, true) : 1;
      const max = Math.max(step, Math.ceil(peak / step - 1e-9) * step);
      const sums = spec.keys.map((_, i) =>
        spec.groups.reduce((t, g) => t + (g[1][i] ?? 0), 0),
      );
      const hi = sums.indexOf(Math.max(...sums));
      return multiples(c, {
        keys: spec.keys,
        panels: spec.groups.map((g) => ({
          name: g[0],
          vals: g[1],
          note: g[2],
        })),
        max,
        hi,
      });
    }
    case "slope": {
      const peak = Math.max(...spec.rows.flatMap((r) => [r[1], r[2]]), 0) || 1;
      const max = peak * 1.08;
      const step = niceStep(max / 4, false);
      const ticks: number[] = [];
      for (let t = 0; t <= max + 1e-9; t += step)
        ticks.push(Math.round(t * 1e6) / 1e6);
      const hiRow = spec.rows.reduce(
        (b, r, i) => (r[1] > spec.rows[b][1] ? i : b),
        0,
      );
      return slope(c, {
        rows: spec.rows.map((r, i) => ({
          label: r[0],
          a: r[1],
          b: r[2],
          hi: i === hiRow,
        })),
        max,
        ticks,
        aTitle: spec.from,
        bTitle: spec.to,
      });
    }
  }
}

/* ------------------------------------------------------------------ the top line: axis and legend */

function topLine(
  th: Theme,
  size: ChartSize,
  w: number,
  axis: string | undefined,
  legend: LegendItem[] | undefined,
): { h: number; svg: string } {
  const fs = size === "sm" ? 12 : 13;
  const lh = Math.round(fs * 1.4);
  const mb = size === "sm" ? 10 : 14;
  const items = legend ?? [];
  if (!axis && !items.length) return { h: 0, svg: "" };
  let g = "";
  const itemW = (l: LegendItem) => 17 + textWidth(l.label, fs);
  const gap = 16;
  const legendW = items.reduce((t, l, i) => t + itemW(l) + (i ? gap : 0), 0);
  let y = fs;
  let lines = 0;
  if (axis) {
    const al = wrap(axis, w, fs, 500);
    al.forEach((l, k) => {
      g += T(0, fs + k * lh, l, { fs, w: 500, c: th.muted });
    });
    lines = al.length;
    y = fs + (al.length - 1) * lh;
  }
  const drawItem = (l: LegendItem, x: number, yy: number) => {
    const sw = l.dot
      ? `<circle cx="${r1(x + 5)}" cy="${r1(yy - fs * 0.35)}" r="5" fill="${l.color}"/>`
      : `<rect x="${r1(x)}" y="${r1(yy - fs * 0.35 - 5)}" width="10" height="10" rx="2" fill="${l.color}" stroke="${l.outline ?? th.grid}" stroke-width="${l.outline ? 1.5 : 1}"/>`;
    return sw + T(x + 17, yy, l.label, { fs, c: th.muted });
  };
  if (items.length) {
    const lastAxisW = axis
      ? textWidth(wrap(axis, w, fs, 500).slice(-1)[0], fs, 500)
      : 0;
    if (axis && lastAxisW + 20 + legendW <= w) {
      let x = w - legendW;
      items.forEach((l) => {
        g += drawItem(l, x, y);
        x += itemW(l) + gap;
      });
    } else {
      // on their own line(s), from the left, wrapping item by item
      let x = 0;
      y = axis ? y + lh : fs;
      lines += 1;
      items.forEach((l) => {
        if (x > 0 && x + itemW(l) > w) {
          x = 0;
          y += lh;
          lines += 1;
        }
        g += drawItem(l, x, y);
        x += itemW(l) + gap;
      });
    }
  }
  return { h: Math.max(1, lines) * lh - (lh - fs) + 4 + mb, svg: g };
}

/* ------------------------------------------------------------------ the entry point */

/** The vertical LOUDFACE mark in an lg chart's right margin (Ctx.wm). */
const WATERMARK = "LOUDFACE";
const WATERMARK_FS = 14;
const WATERMARK_LS = 0.24;
const WATERMARK_INSET = 2;
const WATERMARK_LENGTH =
  textWidth(WATERMARK, WATERMARK_FS, 700) +
  WATERMARK.length * WATERMARK_LS * WATERMARK_FS;

function hashId(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `rc${(h >>> 0).toString(36)}`;
}

/**
 * Draws a chart. Throws on an unknown type; a spec from the CMS should pass parseChartSpec first.
 * Returns the SVG (width = the given width, height = `height`) with every text value escaped.
 */
export function drawChart(spec: ChartSpec, opts: DrawOptions): DrawResult {
  const width = Math.max(
    120,
    Math.floor(Number.isFinite(opts.width) ? opts.width : 0),
  );
  const thin = opts.variant === "thin";
  const asked = opts.size ?? (thin ? "sm" : "md");
  const size: ChartSize = asked === "lg" && width < LG_MIN ? "md" : asked;
  let th = themeFor(opts.ground, opts.tone, opts.accent);
  if (opts.rest) th = { ...th, rest: opts.rest, cellA: `${opts.rest}80` };
  const id = (
    opts.idPrefix ?? hashId(JSON.stringify(spec) + opts.tone + width + size)
  ).replace(/[^A-Za-z0-9_-]/g, "");
  const c = makeCtx(th, size, width, id, opts.logoHref ?? "/lf-logo.svg");
  c.wm = size === "lg" && !thin ? 30 : 0;
  c.thin = thin;
  c.fixH = thin
    ? Math.max(
        60,
        Number.isFinite(opts.height) ? Number(opts.height) : THIN_HEIGHT,
      )
    : 0;
  const out = drawForm(c, spec, true);
  // thin: the page prints the axis line itself, and a thin chart carries no legend, except dots, whose three
  // engine colours nothing else on the card names
  const showAxis = opts.showAxis ?? (!thin && size === "sm");
  const head = topLine(
    th,
    size,
    width,
    showAxis ? notes(spec).axis : undefined,
    thin && spec.type !== "dots" ? undefined : out.legend,
  );
  // the mark runs up the right margin from the chart's foot; a chart shorter than the mark goes without it, so it never
  // rises into the legend line above
  const water =
    c.wm && out.h >= WATERMARK_LENGTH + WATERMARK_INSET
      ? `<text transform="translate(${r1(width - 4)} ${r1(out.h - WATERMARK_INSET)}) rotate(-90)" font-size="${WATERMARK_FS}" font-weight="700" letter-spacing="${WATERMARK_LS}em" fill="${th.water}">${WATERMARK}</text>`
      : "";
  const H = Math.ceil(head.h + out.h);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" style="display:block;max-width:100%;height:auto;overflow:visible;font-family:${esc(SANS_FAMILY)};font-variant-numeric:tabular-nums" aria-hidden="true" focusable="false">` +
    (c.defs.length ? `<defs>${c.defs.join("")}</defs>` : "") +
    head.svg +
    `<g transform="translate(0 ${r1(head.h)})">${out.svg}${water}</g></svg>`;
  return { svg, height: H, size };
}

/* ------------------------------------------------------------------ the same numbers as a table */

export interface ChartTable {
  head: string[];
  rows: string[][];
}

/** The chart's numbers as rows and columns, for the visually hidden table screen readers and text crawlers read. */
export function chartTable(spec: ChartSpec): ChartTable {
  const f = "unit" in spec ? fmtOf(spec.unit) : fmtOf("");
  switch (spec.type) {
    case "bars": {
      const hasNote = spec.rows.some((r) => r[2] !== undefined);
      return {
        head: hasNote ? ["", "Value", "Note"] : ["", "Value"],
        rows: spec.rows.map((r) => [
          r[0],
          f(r[1]),
          ...(hasNote ? [r[2] ?? ""] : []),
        ]),
      };
    }
    case "columns":
      return {
        head: ["", "Value"],
        rows: spec.rows.map((r) => [r[0], f(r[1])]),
      };
    case "funnel":
      return {
        head: ["Step", "Count", `Share of ${nf(spec.rows[0][1])}`],
        rows: spec.rows.map((r) => [
          r[0],
          nf(r[1]),
          spec.rows[0][1] ? pct((r[1] / spec.rows[0][1]) * 100) : "",
        ]),
      };
    case "split":
      return {
        head: ["", "Share"],
        rows: [
          [spec.a[0], pct(spec.a[1])],
          [spec.b[0], pct(spec.b[1])],
        ],
      };
    case "matrix":
      return {
        head: ["", ...spec.cols],
        rows: spec.rows.map((r) => [r[0], ...r[1]]),
      };
    case "list":
      return {
        head: notes(spec).heads
          ? [...(notes(spec).heads as [string, string])]
          : ["", ""],
        rows: spec.rows.map((r) => [r[0], r[1]]),
      };
    case "dots": {
      const u = notes(spec).unit === "%" ? "%" : "";
      return {
        head: ["", ...spec.cols],
        rows: spec.rows.map((r) => [r[0], ...r[1].map((v) => `${v}${u}`)]),
      };
    }
    case "table":
      return {
        head: spec.cols,
        rows: spec.rows.map((r) =>
          r.map((v, ci) =>
            typeof v === "number"
              ? ci === spec.bar && spec.unit === "%"
                ? pct(v)
                : nf(v)
              : v,
          ),
        ),
      };
    case "multiples":
      return {
        head: ["", ...spec.groups.map((g) => g[0])],
        rows: spec.keys.map((k, i) => [
          k,
          ...spec.groups.map(
            (g) => `${g[1][i].toFixed(1)}${spec.unit === "%" ? "%" : ""}`,
          ),
        ]),
      };
    case "slope":
      return {
        head: ["", spec.from, spec.to],
        rows: spec.rows.map((r) => [r[0], r[1].toFixed(3), r[2].toFixed(3)]),
      };
  }
}

/** Every label the spec carries, as the SVG writes it (escaped). Used by the tests. */
export function chartLabels(spec: ChartSpec): string[] {
  switch (spec.type) {
    case "bars":
    case "columns":
    case "funnel":
      return spec.rows.map((r) => r[0]);
    case "split":
      return [spec.a[0], spec.b[0]];
    case "matrix":
      return [...spec.cols, ...spec.rows.map((r) => r[0])];
    case "list":
      return spec.rows.flatMap((r) => [r[0], r[1]]);
    case "dots":
      return [...spec.cols, ...spec.rows.map((r) => r[0])];
    case "table":
      return [
        ...spec.cols,
        ...spec.rows.flatMap((r) =>
          r
            .filter((v): v is string => typeof v === "string")
            .map((v) => v.replace(/ [\d.,]+%$/, "")),
        ),
      ];
    case "multiples":
      return [...spec.keys, ...spec.groups.map((g) => g[0])];
    case "slope":
      return [spec.from, spec.to, ...spec.rows.map((r) => r[0])];
  }
}
