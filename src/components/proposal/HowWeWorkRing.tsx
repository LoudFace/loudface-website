/**
 * FIG.000 — how LoudFace works, drawn once for every proposal.
 *
 * Arnel, 2026-09-18: prospects could not tell whether we are a content
 * agency, a backlink agency or a web-design agency. The answer is one
 * sentence — GEO brings the buyers, the site converts them — and this ring
 * draws it: six things we do, grouped into those two outcomes, with the
 * result in the middle. Pure SVG in the house plate idiom, night variant so
 * it can sit in the hero beside the title without a second surface.
 *
 * Text is deliberately sparse. One label and one "how" line per segment;
 * the offer itself lives in the sections below.
 */

const CX = 180;
const CY = 184;
const R_OUT = 150;
const R_IN = 88;
const R_MID = (R_OUT + R_IN) / 2;

/** Angle in degrees from 12 o'clock, clockwise, to a point on radius r. */
function pt(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

/** An annular wedge from a0 to a1 degrees (clockwise from 12 o'clock). */
function wedge(a0: number, a1: number) {
  const [x0, y0] = pt(a0, R_OUT);
  const [x1, y1] = pt(a1, R_OUT);
  const [x2, y2] = pt(a1, R_IN);
  const [x3, y3] = pt(a0, R_IN);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R_OUT} ${R_OUT} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${R_IN} ${R_IN} 0 ${large} 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
}

type Segment = { a0: number; a1: number; label: string[]; how: string; side: 'geo' | 'site' };

/* Clockwise from 12 o'clock. The right half is the site, the left half is
   GEO, so the two headline capabilities sit at the top, either side of the
   split. */
const SEGMENTS: Segment[] = [
  { a0: 0, a1: 60, label: ['DESIGN'], how: 'top designers', side: 'site' },
  { a0: 60, a1: 120, label: ['DEVELOPMENT'], how: 'same-day pages', side: 'site' },
  { a0: 120, a1: 180, label: ['CONVERSION'], how: 'split tests', side: 'site' },
  { a0: 180, a1: 240, label: ['TRUST'], how: 'reviews · listings', side: 'geo' },
  { a0: 240, a1: 300, label: ['ORGANIC', 'VISIBILITY'], how: 'pages that rank', side: 'geo' },
  { a0: 300, a1: 360, label: ['GEO'], how: 'content · off-site', side: 'geo' },
];

export function HowWeWorkRing() {
  return (
    <figure className="plate plate-night" data-print-keep>
      <span className="fig-id" aria-hidden="true">FIG.000</span>
      <span className="fig-meta" aria-hidden="true">[ HOW WE WORK ]</span>
      <span className="fig-yr" aria-hidden="true">[ 2026 ]</span>
      <svg viewBox="0 0 360 372" role="img" aria-labelledby="plate-howwework">
        <title id="plate-howwework">
          How LoudFace works: GEO, organic visibility and trust bring the buyers; design, development and conversion work turn them into leads on your site. One team, one retainer, no hourly billing.
        </title>

        {/* the two outcomes, one per half */}
        <text x={CX - 12} y="22" textAnchor="end" className="tk">GEO BRINGS THE BUYERS</text>
        <text x={CX + 12} y="22" textAnchor="start" className="tk">THE SITE CONVERTS THEM</text>
        <path d={`M${CX} 12V${CY - R_OUT - 4}`} className="s1" strokeDasharray="2 3" />
        <path d={`M${CX} ${CY + R_OUT + 4}V${CY + R_OUT + 18}`} className="s1" strokeDasharray="2 3" />

        {/* six segments */}
        {SEGMENTS.map((s) => {
          const mid = (s.a0 + s.a1) / 2;
          const [lx, ly] = pt(mid, R_MID);
          const lines = s.label.length;
          const top = ly - (lines - 1) * 5.5 - 2;
          return (
            <g key={s.label.join()}>
              <path d={wedge(s.a0 + 0.6, s.a1 - 0.6)} className={s.side === 'geo' ? 'wedge-geo' : 'wedge-site'} />
              {s.label.map((line, i) => (
                <text key={line} x={lx} y={top + i * 11} textAnchor="middle" className="wl">
                  {line}
                </text>
              ))}
              <text x={lx} y={top + (lines - 1) * 11 + 12} textAnchor="middle" className="wh">
                {s.how}
              </text>
            </g>
          );
        })}

        {/* the result, in the middle */}
        <circle cx={CX} cy={CY} r={R_IN - 8} className="core" />
        <text x={CX} y={CY - 6} textAnchor="middle" className="wc">MORE LEADS</text>
        <text x={CX} y={CY + 9} textAnchor="middle" className="wh">from AI and Google search</text>

        <text x={CX} y="366" textAnchor="middle" className="tk">ONE TEAM · ONE RETAINER · NO HOURLY BILLING</text>
      </svg>
    </figure>
  );
}
