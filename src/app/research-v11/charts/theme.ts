/**
 * Chart colour themes, ported from the board kit (design-lab/research-2026-11-03/shared/charts-v2.js `theme`) with
 * shared/series.css's corrections built in: the colour grounds are the full series colours (indigo #3d38cf, coral
 * #ec6c48, green #0f5a46, butter #e2ad3c), green is the indigo stage retinted to mint, and the kit's 62-70% labels
 * are raised to 82% (white, on indigo and green) and 86% (ink, on coral and butter).
 *
 * The tone decides the colours. `stage` takes indigo, night and navy; `colour` takes coral, butter, green and indigo
 * (the series colours). A colour tone on `stage`, or a stage tone on `colour`, draws that tone's theme.
 */
import type { ChartGround, ChartTone } from "../contract";

export interface Theme {
  /** The ground the chart sits on. The chart does not paint it (the page does); knockouts use it. */
  bg: string;
  ink: string;
  body: string;
  muted: string;
  axis: string;
  grid: string;
  base: string;
  hi: string;
  rest: string;
  line2: string;
  hatch: string;
  hatchEdge: string;
  callBg: string;
  callInk: string;
  onHi: string;
  water: string;
  /** Bar fade on stage grounds: [opacity at the base, opacity at the value end]. Null: solid bars. */
  fade: { hi: [number, number]; rest: [number, number] } | null;
  band: string;
  eng: [string, string, string];
  cellHi: string;
  cellHiInk: string;
  cellA: string;
  /** 'outline' draws the cell as a hairline box. */
  cellB: string;
  cellInk: string;
}

const INK = "#1a1040";
export const SERIES_COLOURS = {
  indigo: "#3d38cf",
  coral: "#ec6c48",
  green: "#0f5a46",
  butter: "#e2ad3c",
  night: "#0b0a2e",
  navy: "#030c5a",
} as const;

function stage(tone: "indigo" | "night" | "navy"): Theme {
  const bg = SERIES_COLOURS[tone];
  const deep = tone !== "indigo";
  return {
    bg,
    ink: "#ffffff",
    body: deep ? "#d6d2f5" : "#e4e1ff",
    muted: deep ? "#a8a2d6" : "#c9c5fb",
    // series.css: white 62% fell to 4.0:1 on indigo; raised to 82%
    axis: deep ? "#8f89c4" : "rgba(255,255,255,0.82)",
    grid: deep ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
    base: deep ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.35)",
    hi: deep ? "#c9bdf5" : "#ffffff",
    rest: deep ? "#6a5fe0" : "#b7aaf2",
    line2: deep ? "rgba(201,189,245,0.45)" : "rgba(255,255,255,0.38)",
    hatch: deep ? "rgba(201,189,245,0.30)" : "rgba(255,255,255,0.30)",
    hatchEdge: deep ? "rgba(201,189,245,0.22)" : "rgba(255,255,255,0.26)",
    callBg: deep ? "#c9bdf5" : "#ffffff",
    callInk: bg,
    onHi: bg,
    water: deep ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.26)",
    // near-opaque from the baseline, so a bar reads as one solid shape against the ground
    fade: { hi: [0.72, 1], rest: [0.62, 0.9] },
    band: "rgba(255,255,255,0.06)",
    eng: ["#ffffff", "#fcd68a", "#f59a7b"],
    cellHi: deep ? "#c9bdf5" : "#ffffff",
    cellHiInk: bg,
    cellA: "rgba(255,255,255,0.14)",
    cellB: "outline",
    cellInk: "#ffffff",
  };
}

/** Green: the indigo stage retinted, as series.css does it (lavender becomes mint). */
function green(): Theme {
  const g = SERIES_COLOURS.green;
  return {
    ...stage("indigo"),
    bg: g,
    callInk: g,
    onHi: g,
    cellHiInk: g,
    rest: "#a6e3c8",
    body: "#e3f3eb",
    muted: "#cfe9dd",
  };
}

/** Coral and butter: ink marks on the series colour. Labels at ink 86% (the kit's 62% and 70% failed contrast). */
function inkOn(tone: "coral" | "butter"): Theme {
  const ink = "rgba(26,16,64,";
  return {
    bg: SERIES_COLOURS[tone],
    ink: INK,
    body: `${ink}0.86)`,
    muted: `${ink}0.86)`,
    axis: `${ink}0.86)`,
    grid: `${ink}0.11)`,
    base: `${ink}0.34)`,
    hi: INK,
    // opaque: any transparency mixes the white with coral into a pale pink that reads as part of the ground
    rest: "#ffffff",
    line2: `${ink}0.30)`,
    hatch: `${ink}0.26)`,
    hatchEdge: `${ink}0.20)`,
    callBg: INK,
    callInk: "#ffffff",
    onHi: "#ffffff",
    water: `${ink}0.22)`,
    fade: null,
    band: "rgba(255,255,255,0.22)",
    eng:
      tone === "butter"
        ? [INK, "#4f39f6", "#e8704c"]
        : [INK, "#ffffff", "#4f39f6"],
    cellHi: INK,
    cellHiInk: "#ffffff",
    cellA: "rgba(255,255,255,0.55)",
    cellB: `${ink}0.09)`,
    cellInk: INK,
  };
}

/**
 * The theme for a ground and tone. `accent` replaces the highlight on stage tones (G's paper draws its night figures
 * with the series colour lit, #86dcb4 for the green series, where the kit had lavender).
 */
export function themeFor(
  _ground: ChartGround,
  tone: ChartTone,
  accent?: string,
): Theme {
  let th: Theme;
  if (tone === "coral" || tone === "butter") th = inkOn(tone);
  else if (tone === "green") th = green();
  else th = stage(tone);
  if (accent && th.ink === "#ffffff")
    th = { ...th, hi: accent, callBg: accent, cellHi: accent };
  return th;
}
