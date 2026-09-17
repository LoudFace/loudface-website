/**
 * How LoudFace works, drawn once for every proposal.
 *
 * Arnel, 2026-09-18: prospects could not tell whether we are a content
 * agency, a backlink agency or a web-design agency. The answer is one
 * sentence — GEO brings the buyers, the site converts them — and this figure
 * draws it: a ring in two halves, three things we do on each half, the
 * result in the middle.
 *
 * Drawn straight on the hero ground, no plate. Labels sit OUTSIDE the ring
 * in two columns so nothing is squeezed into a wedge, and the column headers
 * are what give the halves their meaning. The first draft put nine-point
 * caps inside pie wedges under blueprint furniture and was rejected on sight.
 */

const CX = 230;
const CY = 156;
const R = 82;

function pt(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

/** Arc from a0 to a1 degrees (clockwise from 12 o'clock) on radius R. */
function arc(a0: number, a1: number) {
  const [x0, y0] = pt(a0, R);
  const [x1, y1] = pt(a1, R);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

type Node = { deg: number; label: string; how: string };

const SITE: Node[] = [
  { deg: 30, label: 'Design', how: 'top designers' },
  { deg: 90, label: 'Development', how: 'same-day pages' },
  { deg: 150, label: 'Conversion', how: 'split tests' },
];

const GEO: Node[] = [
  { deg: 330, label: 'GEO', how: 'content and off-site' },
  { deg: 270, label: 'Organic visibility', how: 'pages that rank' },
  { deg: 210, label: 'Trust', how: 'reviews and listings' },
];

const COL_L = 138; // right edge of the left label column
const COL_R = 322; // left edge of the right label column

export function HowWeWorkRing() {
  const node = (n: Node, side: 'geo' | 'site') => {
    const [x, y] = pt(n.deg, R);
    const dir = side === 'site' ? 1 : -1;
    const colX = side === 'site' ? COL_R : COL_L;
    // Leader: out of the node along its radius, then level to the column.
    const [ex, ey] = pt(n.deg, R + 14);
    return (
      <g key={n.label}>
        <path d={`M${ex.toFixed(1)} ${ey.toFixed(1)}L${(colX - dir * 10).toFixed(1)} ${ey.toFixed(1)}`} className="lead" />
        <circle cx={x} cy={y} r="6" className={`node node-${side}`} />
        <text x={colX} y={ey - 2} textAnchor={side === 'site' ? 'start' : 'end'} className="lbl">
          {n.label}
        </text>
        <text x={colX} y={ey + 12} textAnchor={side === 'site' ? 'start' : 'end'} className="how">
          {n.how}
        </text>
      </g>
    );
  };

  return (
    <figure className="how-ring" data-print-keep>
      <svg viewBox="0 0 460 300" role="img" aria-labelledby="how-ring-title">
        <title id="how-ring-title">
          How LoudFace works: GEO, organic visibility and trust bring the buyers; design, development and conversion work turn them into leads on your site.
        </title>

        {/* column headers: the two outcomes */}
        <text x={COL_L} y="24" textAnchor="end" className="hdr hdr-geo">GEO brings the buyers</text>
        <text x={COL_R} y="24" textAnchor="start" className="hdr hdr-site">The site converts them</text>

        {/* the ring, two halves, a small gap at top and bottom */}
        <path d={arc(184, 356)} className="arc arc-geo" />
        <path d={arc(4, 176)} className="arc arc-site" />
        {/* flow: buyers move from the GEO half into the site half */}
        <path d={`M${CX - 3} ${CY - R - 5}l4.5 5-4.5 5`} className="chev" />
        <path d={`M${CX + 3} ${CY + R + 5}l-4.5-5 4.5-5`} className="chev" />

        {GEO.map((n) => node(n, 'geo'))}
        {SITE.map((n) => node(n, 'site'))}

        {/* the result */}
        <text x={CX} y={CY + 3} textAnchor="middle" className="core">Leads</text>
        <text x={CX} y={CY + 22} textAnchor="middle" className="core-sub">from AI and Google search</text>
      </svg>
    </figure>
  );
}
