/**
 * How LoudFace works, drawn once for every proposal.
 *
 * Arnel, 2026-09-18: prospects could not tell whether we are a content
 * agency, a backlink agency or a web-design agency. The answer is one
 * sentence — GEO brings the buyers, the site converts them — and this figure
 * draws it: a ring in two halves, the result in the middle.
 *
 * Arnel, 2026-09-22 (Faith): the first ring carried six labelled nodes with
 * leader lines and two column headers; "too many things happening". A card
 * flow that replaced it was rejected on sight, he wanted this visual style
 * kept. So the ring stays and loses the furniture: one label per half, one
 * line under it, the chevrons that show the direction, the result inside.
 */

const CX = 280;
const CY = 150;
const R = 104;

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

const GAP = 22; // between the arc and its label

export function HowWeWorkRing() {
  return (
    <figure className="how-ring" data-print-keep>
      <svg viewBox="0 0 560 300" role="img" aria-labelledby="how-ring-title">
        <title id="how-ring-title">
          How LoudFace works: GEO brings the buyers, the site converts them, and the result is leads from AI and Google search.
        </title>

        {/* the ring, two halves, a small gap at top and bottom */}
        <path d={arc(184, 356)} className="arc arc-geo" />
        <path d={arc(4, 176)} className="arc arc-site" />
        {/* flow: buyers move from the GEO half into the site half and round again */}
        <path d={`M${CX - 3} ${CY - R - 5}l4.5 5-4.5 5`} className="chev" />
        <path d={`M${CX + 3} ${CY + R + 5}l-4.5-5 4.5-5`} className="chev" />

        {/* left half: what brings them */}
        <text x={CX - R - GAP} y={CY - 6} textAnchor="end" className="lbl lbl-geo">
          GEO brings the buyers
        </text>
        <text x={CX - R - GAP} y={CY + 12} textAnchor="end" className="how">
          content, listings, reviews
        </text>

        {/* right half: what converts them */}
        <text x={CX + R + GAP} y={CY - 6} textAnchor="start" className="lbl">
          The site converts them
        </text>
        <text x={CX + R + GAP} y={CY + 12} textAnchor="start" className="how">
          design, pages, split tests
        </text>

        {/* the result */}
        <text x={CX} y={CY + 3} textAnchor="middle" className="core">Leads</text>
        <text x={CX} y={CY + 22} textAnchor="middle" className="core-sub">from AI and Google search</text>
      </svg>
    </figure>
  );
}
