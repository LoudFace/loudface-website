import type { Series } from '../home-v11/data';

/**
 * Delshad Legal's Google clicks a week (Sanity `clickGrowth`, indexed to the week of 7 June = 100) with the
 * guarantee's bar drawn on it: +25% over the first week, held until month 3 (the first week at least 91 days after
 * the engagement began). One white line on the ink stage, the start pin, the end dot. Labels sit in HTML around
 * the SVG so they stay crisp and editable. The plot is inset by PAD so the dots are never clipped.
 */
const W = 600;
const H = 186;
const PAD = 9;
const BAR = 125;

export function barGeometry(series: Series) {
  const values = series.values;
  const vmax = Math.max(...values, BAR) * 1.06;
  const iw = W - 2 * PAD;
  const ih = H - PAD;
  const x = (i: number) => PAD + (i * iw) / (values.length - 1);
  const y = (v: number) => PAD + ih - (v / vmax) * ih;
  const startMs = Date.parse(`${series.start.slice(0, 10)}T00:00:00Z`);
  const m3 = series.dates.findIndex((d) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`) - startMs >= 91 * 86400000);
  const monthThree = m3 > 0 ? m3 : Math.min(13, values.length - 1);
  return { x, y, monthThree, values };
}

export function ApplyChart({ series, barLabel, barShort }: { series: Series; barLabel: string; barShort: string }) {
  const { x, y, monthThree, values } = barGeometry(series);
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(values.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  const last = values.length - 1;
  const m3x = x(monthThree);
  const barY = y(BAR);
  return (
    <div className="ap-plot">
      <svg viewBox={`0 0 ${W} ${H + 2}`} className="ap-svg" aria-hidden="true" preserveAspectRatio="none">
        <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="rgba(255,255,255,0.10)" />
        <line x1={m3x} y1="0" x2={m3x} y2={H} stroke="rgba(255,255,255,0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1={PAD} y1={barY} x2={m3x} y2={barY} stroke="#b7aaf2" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={line} fill="none" stroke="#ffffff" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Dots as HTML so preserveAspectRatio="none" never squashes them into ovals. */}
      <span className="ap-pin" style={{ left: `${(x(0) / W) * 100}%`, top: `${(y(values[0]) / (H + 2)) * 100}%` }} />
      <span className="ap-dot" style={{ left: `${(x(last) / W) * 100}%`, top: `${(y(values[last]) / (H + 2)) * 100}%` }} />
      <span className="ap-bar-tag" style={{ left: `calc(${(m3x / W) * 100}% + 10px)`, top: `calc(${(barY / (H + 2)) * 100}% - 9px)` }}>
        <span className="ap-wide">{barLabel}</span>
        <span className="ap-narrow">{barShort}</span>
      </span>
    </div>
  );
}

/** "7 Jun", "18 Oct 2026": the chart's first and last weeks. */
export function chartDates(series: Series) {
  const fmt = (iso: string, year: boolean) =>
    new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' });
  return { first: fmt(series.dates[0], false), last: fmt(series.dates[series.dates.length - 1], true) };
}
