/**
 * IsometricSystem — the growth system as an exploded isometric stack.
 *
 * Reference anchor: Mercury's platform diagram
 * (design-lab/harvest/2026-09-16/isometric/Mercury.webp) — four labelled layers
 * drawn in isometric wireframe, exploded vertically on a dark indigo ground,
 * each layer tied to its caption by a hairline leader. Rox does the same with
 * two slabs; Cloudflare Workers does the technical version on cream.
 *
 * Mercury's stack reads bottom-up: the regulated foundation at Layer 1, the
 * customer-facing automation at Layer 4. Ours follows the same logic — the
 * technical surface holds everything, and the compounding sits on top.
 *
 * Drawn as SVG geometry, not CSS transforms: Paper drops `perspective`,
 * `rotateX` and `rotateY` on import, so an isometric built from transformed divs
 * arrives flat on the canvas. Every face here is a polygon.
 *
 * Asset: authored isometric SVG geometry, four layers with drawn content on each
 * top face.
 */

type Layer = {
  id: string;
  label: string;
  title: string;
  body: string;
  top: string;
  topHi: string;
  side: string;
};

/* Bottom (foundation) first — drawn in this order so upper slabs overlap lower. */
const LAYERS: Layer[] = [
  {
    id: 'l1',
    label: 'Layer 1',
    title: 'The technical surface',
    body: 'Crawlable, fast, structured.',
    top: '#2c2a6e',
    topHi: '#3b379a',
    side: '#1b1950',
  },
  {
    id: 'l2',
    label: 'Layer 2',
    title: 'Search and content',
    body: 'The terms buyers use, and the pages that own them.',
    top: '#35328a',
    topHi: '#4a45bd',
    side: '#211f63',
  },
  {
    id: 'l3',
    label: 'Layer 3',
    title: 'AI answer presence',
    body: 'Cited when an assistant draws the shortlist.',
    top: '#413ead',
    topHi: '#5b56dd',
    side: '#282680',
  },
  {
    id: 'l4',
    label: 'Layer 4',
    title: 'Conversion, compounding',
    body: 'Visits become calls, month over month.',
    top: '#4f4ad1',
    topHi: '#7a74ff',
    side: '#312e9c',
  },
];

const CX = 300;
const W = 380;
const H = 190;
const T = 26;
const BASE_Y = 560;
const STEP = 118;

function Slab({ layer, i }: { layer: Layer; i: number }) {
  const cy = BASE_Y - i * STEP;
  const hw = W / 2;
  const hh = H / 2;

  const top = `${CX},${cy - hh} ${CX + hw},${cy} ${CX},${cy + hh} ${CX - hw},${cy}`;
  const left = `${CX - hw},${cy} ${CX},${cy + hh} ${CX},${cy + hh + T} ${CX - hw},${cy + T}`;
  const right = `${CX},${cy + hh} ${CX + hw},${cy} ${CX + hw},${cy + T} ${CX},${cy + hh + T}`;

  /* Drawn content on the face: hairlines parallel to the near edges, plus two
     small marks. A bare slab reads as a placeholder block, which the gate
     explicitly fails. */
  const rows = [0.34, 0.52, 0.7].map((t) => {
    const x1 = CX - hw + hw * t;
    const y1 = cy - hh + hh * t;
    const x2 = CX + hw * (1 - t) * 0.62;
    const y2 = cy + hh * (1 - t) * 0.62;
    return { x1, y1, x2, y2, key: t };
  });

  return (
    <g className="iso-slab" style={{ transitionDelay: `${i * 0.09}s` }}>
      <polygon points={left} fill={layer.side} />
      <polygon points={right} fill={layer.side} opacity="0.82" />
      <polygon points={top} fill={`url(#${layer.id}-g)`} />
      <polygon points={top} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1" />
      {rows.map((r) => (
        <line
          key={r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="rgba(255,255,255,.22)"
          strokeWidth="1"
        />
      ))}
      <circle cx={CX - hw * 0.34} cy={cy + hh * 0.3} r="4.5" fill="rgba(255,255,255,.55)" />
      <rect
        x={CX + hw * 0.16}
        y={cy - hh * 0.3}
        width="42"
        height="9"
        rx="2"
        fill="rgba(255,255,255,.3)"
        transform={`skewY(-26.6) translate(0 ${(CX + hw * 0.16) * 0.5})`}
      />
      {/* Leader from the slab's right vertex out to its caption. */}
      <line
        x1={CX + hw}
        y1={cy + T / 2}
        x2={700}
        y2={cy + T / 2}
        stroke="rgba(255,255,255,.26)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <circle cx={CX + hw} cy={cy + T / 2} r="3" fill="rgba(255,255,255,.7)" />
    </g>
  );
}

export function IsometricSystem() {
  return (
    <section className="iso" aria-labelledby="iso-h">
      <div className="container">
        <div className="iso-head">
          <span className="iso-eyebrow rv">
            <i aria-hidden="true"></i>What we do
          </span>
          <h2 id="iso-h" className="rv">
            One system, four layers<span className="ghost">.</span>
          </h2>
          <p className="iso-lede rv">
            Each layer only works because the one under it does. Most agencies sell you a single
            slice and call it a strategy.
          </p>
        </div>

        <div className="iso-plate rv">
          <svg viewBox="0 0 980 680" role="img" aria-labelledby="iso-svg-t">
            <title id="iso-svg-t">
              The LoudFace growth system drawn as four stacked layers: the technical surface, search
              and content, AI answer presence, and conversion.
            </title>
            <defs>
              {LAYERS.map((l) => (
                <linearGradient key={l.id} id={`${l.id}-g`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={l.topHi} />
                  <stop offset="100%" stopColor={l.top} />
                </linearGradient>
              ))}
              <radialGradient id="iso-pool" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(79,70,229,.42)" />
                <stop offset="100%" stopColor="rgba(11,9,32,0)" />
              </radialGradient>
            </defs>

            <ellipse cx={CX} cy={BASE_Y + 92} rx="330" ry="86" fill="url(#iso-pool)" />

            {LAYERS.map((l, i) => (
              <Slab key={l.id} layer={l} i={i} />
            ))}

            {LAYERS.map((l, i) => {
              const cy = BASE_Y - i * STEP + T / 2;
              return (
                <g key={`${l.id}-cap`}>
                  <text x="716" y={cy - 14} className="iso-cap-label">
                    {l.label}
                  </text>
                  <text x="716" y={cy + 6} className="iso-cap-title">
                    {l.title}
                  </text>
                  <text x="716" y={cy + 26} className="iso-cap-body">
                    {l.body}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
