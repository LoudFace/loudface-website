/**
 * Blueprint plates for the proposal surface — the house explanatory-graphic
 * idiom (DESIGN.md §8, `.claude/skills/blueprint-figures`): indigo line-work
 * on dotted paper, light ramp fills, one annotation voice, figure furniture.
 * Both plates are adapted from the client-approved FIG.002 pipeline plate —
 * same node recipe (rx=1 boxes, folded ticket, hatched box, stacked queue),
 * same detail density, new content.
 *
 * They replace two stacked lists that each ate half a screen. A plate says
 * the same thing in a third of the height and is the one thing on this page
 * a prospect has not seen in another agency's proposal.
 *
 * Pure SVG, no client JS. Marching ants and the single flicker are CSS and
 * die under `prefers-reduced-motion` and in print (proposal.css).
 */

/** Shared arrowhead + hatch. Emitted once per page by ProposalDocument. */
export function PlateDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <marker id="fx-arr" viewBox="0 0 8 8" markerWidth="7.5" markerHeight="7.5" refX="6.2" refY="4" orient="auto-start-reverse">
          <path d="M1 .8 6.6 4 1 7.2" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <pattern id="fx-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" className="f50" />
          <path d="M0 0V7" className="s1" />
        </pattern>
      </defs>
    </svg>
  );
}

function Plate({
  id,
  meta,
  title,
  viewBox,
  children,
}: {
  id: string;
  meta: string;
  title: string;
  viewBox: string;
  children: React.ReactNode;
}) {
  const labelId = `plate-${id.replace(/\W/g, '').toLowerCase()}`;
  return (
    <div className="plate-scroll" data-print-keep>
    <div className="plate">
      <span className="fig-id" aria-hidden="true">{id}</span>
      <span className="fig-meta" aria-hidden="true">[ {meta} ]</span>
      <span className="fig-yr" aria-hidden="true">[ 2026 ]</span>
      <svg viewBox={viewBox} role="img" aria-labelledby={labelId}>
        <title id={labelId}>{title}</title>
        {children}
      </svg>
    </div>
    </div>
  );
}

/* A tiny rising chart drawn inside a node — the "data" and "results" boxes. */
function MiniChart({ x, y, lit = false }: { x: number; y: number; lit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 30V0M0 30H52" className="s1" />
      <polyline points="6,24 16,20 26,21 36,13 46,6" className="s1" />
      <circle cx="46" cy="6" r="2.6" className={`f600${lit ? ' flick' : ''}`} />
    </g>
  );
}

/**
 * FIG.001 — the engagement loop. Five stations left to right, three lanes
 * braiding through the execution box (that is the "in parallel"), and the
 * return path arcing back over the top: results set the next priority.
 */
export function EngagementLoopPlate({ clientName, gateLabel }: { clientName: string; gateLabel?: string }) {
  const client = clientName.toUpperCase();
  const gate = (gateLabel || 'REVIEW GATE').toUpperCase();
  return (
    <Plate id="FIG.001" meta="THE LOOP" viewBox="0 0 1150 236" title={`How the engagement moves: LoudFace reads the data, sets the priority, executes content, design and development in parallel, and the results set the next priority. ${clientName} reviews the calibration articles in the first two weeks; reviews after that are optional.`}>
      {/* return path — results feed the next cycle */}
      <path d="M973 108C973 40 900 30 575 30 190 30 111 40 111 108" className="ants s1" markerEnd="url(#fx-arr)" />
      <text x="575" y="22" textAnchor="middle" className="tk">WHAT WE LEARN SETS THE NEXT PRIORITY</text>

      {/* 1 · data */}
      <rect x="52" y="114" width="118" height="70" rx="1" className="f50 s2" />
      <MiniChart x={84} y={126} />
      <text x="111" y="200" textAnchor="middle" className="tk">DATA</text>

      <path className="ants s1" d="M176 149H254" markerEnd="url(#fx-arr)" />

      {/* 2 · LoudFace sets the priority */}
      <g className="settle" style={{ ['--sx' as string]: '-18px', ['--sy' as string]: '0px' }}>
        <path d="M262 122H380L396 138V176H262Z" className="fw s2" strokeLinejoin="round" />
        <path d="M380 122V138H396" className="s1" />
        <text x="329" y="152" textAnchor="middle" className="t9">THE PRIORITY</text>
        <text x="329" y="165" textAnchor="middle" className="t9">WITH THE EVIDENCE</text>
      </g>
      <text x="329" y="200" textAnchor="middle" className="tk">LOUDFACE SETS IT</text>

      {/* three lanes fan out, run in parallel, and converge */}
      <path className="ants s1" d="M402 149C470 149 470 128 520 128H552" markerEnd="url(#fx-arr)" />
      <path className="ants s1" d="M402 149H552" markerEnd="url(#fx-arr)" />
      <path className="ants s1" d="M402 149C470 149 470 170 520 170H552" markerEnd="url(#fx-arr)" />

      {/* 3 · execution — one hatched box, three lanes inside it */}
      <rect x="560" y="104" width="180" height="90" rx="1" className="fh s2" />
      <rect x="572" y="118" width="156" height="18" rx="1" className="fw" />
      <rect x="572" y="140" width="156" height="18" rx="1" className="fw" />
      <rect x="572" y="162" width="156" height="18" rx="1" className="fw" />
      <text x="650" y="130.5" textAnchor="middle" className="t9">CONTENT</text>
      <text x="650" y="152.5" textAnchor="middle" className="t9">DESIGN</text>
      <text x="650" y="174.5" textAnchor="middle" className="t9">DEVELOPMENT</text>
      <text x="650" y="212" textAnchor="middle" className="tk">LOUDFACE EXECUTES · IN PARALLEL</text>

      {/* the client's review gate — a branch into execution, not a station on the line */}
      <rect x="570" y="58" width="160" height="30" rx="1" className="fw s1" strokeDasharray="4 3" />
      <text x="650" y="77" textAnchor="middle" className="t9 tk">{client} · {gate}</text>
      <path d="M650 88V98" className="s1" strokeDasharray="2 2" markerEnd="url(#fx-arr)" />
      <text x="560" y="70" textAnchor="end" className="t9">CALIBRATION ARTICLES · WEEKS 1–2</text>
      <text x="560" y="82" textAnchor="end" className="t9">OPTIONAL AFTER THAT</text>

      <path className="ants s1" d="M746 128C790 128 790 149 830 149" />
      <path className="ants s1" d="M746 149H830" />
      <path className="ants s1" d="M746 170C790 170 790 149 830 149" />
      <path className="ants s1" d="M830 149H906" markerEnd="url(#fx-arr)" />

      {/* 4 · results */}
      <rect x="914" y="114" width="118" height="70" rx="1" className="f50 s2" />
      <MiniChart x={947} y={126} lit />
      <text x="973" y="200" textAnchor="middle" className="tk">RESULTS · WE OWN THEM</text>
    </Plate>
  );
}
