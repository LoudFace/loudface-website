/**
 * The competitive landscape's geometry: the y-axis top and where each brand's label sits beside its dot.
 * x = discovery visibility (0–100), y = share of voice (0–yTop), both in percent.
 */

export interface LandPoint { label: string; x: number; y: number; self: boolean }
/** Label side relative to the dot: right, left, above, below, above-right, below-right. */
export type Side = 'r' | 'l' | 'a' | 'b' | 'ar' | 'br';
export interface PlacedPoint extends LandPoint { side: Side }

/** The smallest round top for the share-of-voice axis that leaves headroom above the highest share. */
export function yTop(maxShare: number): number {
  for (const top of [20, 40, 60, 80, 100]) if (maxShare * 1.1 <= top) return top;
  return 100;
}

/** Rough label width in px: the brand at 15px medium, then the two values at 13.5px ("90% · 32%"). */
const labelWidth = (p: LandPoint) => p.label.length * 8.6 + 8 + `${p.x}% · ${p.y}%`.length * 7.4;
const LABEL_H = 20;
const GAP = 13;

type Box = { l: number; t: number; r: number; b: number };
const hit = (a: Box, z: Box) => a.l < z.r && z.l < a.r && a.t < z.b && z.t < a.b;

/**
 * Puts each label beside its dot where it overlaps no other label and no dot, trying right, left, above, below.
 * Computed on the narrowest plot the chart is shown at (644 × 400 px: a 768px screen, less the 44px y-axis column):
 * wider screens only move dots further apart horizontally and the plot height never shrinks, so a layout that fits
 * there fits everywhere. The brand itself is placed first so its label always gets the best side.
 */
export function placeLabels(points: LandPoint[], top: number, W = 644, H = 400): PlacedPoint[] {
  const at = (p: LandPoint) => ({ cx: (p.x / 100) * W, cy: H - (Math.min(p.y, top) / top) * H });
  const dots: Box[] = points.map((p) => {
    const { cx, cy } = at(p);
    const r = p.self ? 11 : 8;
    return { l: cx - r, t: cy - r, r: cx + r, b: cy + r };
  });
  const taken: Box[] = [];
  const order = [...points].sort((a, z) => Number(z.self) - Number(a.self) || z.x - a.x);
  const side = new Map<LandPoint, Side>();
  for (const p of order) {
    const { cx, cy } = at(p);
    const w = labelWidth(p);
    const boxes: [Side, Box][] = [
      ['r', { l: cx + GAP, t: cy - LABEL_H / 2, r: cx + GAP + w, b: cy + LABEL_H / 2 }],
      ['l', { l: cx - GAP - w, t: cy - LABEL_H / 2, r: cx - GAP, b: cy + LABEL_H / 2 }],
      ['ar', { l: cx + 8, t: cy - 10 - LABEL_H, r: cx + 8 + w, b: cy - 10 }],
      ['br', { l: cx + 8, t: cy + 10, r: cx + 8 + w, b: cy + 10 + LABEL_H }],
      ['a', { l: cx - w / 2, t: cy - GAP - LABEL_H, r: cx + w / 2, b: cy - GAP }],
      ['b', { l: cx - w / 2, t: cy + GAP, r: cx + w / 2, b: cy + GAP + LABEL_H }],
    ];
    const own = dots[points.indexOf(p)];
    const fits = boxes.find(([, b]) =>
      b.l >= 0 && b.r <= W && b.t >= 0 && b.b <= H
      && !taken.some((z) => hit(b, z))
      && !dots.some((d) => d !== own && hit(b, d)));
    const [s, box] = fits ?? boxes[0];
    side.set(p, s);
    taken.push(box);
  }
  return points.map((p) => ({ ...p, side: side.get(p) ?? 'r' }));
}
