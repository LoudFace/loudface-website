/**
 * How LoudFace works, as two streams (Arnel's pick, 2026-09-23, "C2 V6").
 *
 * Get found (SEO, GEO, reviews) and Get chosen (design, development, split
 * tests) flow in as two ribbons and run side by side into Leads; small dots
 * ride into the badge. Picked over a figure-8, a Venn, a report card, a UI
 * collage and a wiring blueprint: one bold shape, few words, nothing wired
 * (the last two were "too busy for less sophisticated buyers").
 *
 * Two drawings: a landscape one for the hero's right column (viewBox 600
 * wide, rendered near 1:1 so type stays full size) and a portrait one for
 * phones. The ribbons end side by side instead of merging into a third band;
 * a separate merged band left a hard seam.
 */

const FOUND = { title: 'Get found', items: ['SEO for Google', 'GEO for ChatGPT', 'Reviews and listings'] };
const CHOSEN = { title: 'Get chosen', items: ['Design', 'Development', 'Split tests'] };
const LABEL =
  'Two sides of one retainer. Get found: SEO for Google, GEO for ChatGPT, reviews and listings. Get chosen: design, development and split tests. Both end in leads: calls, quote requests and bookings.';

function Dots({ path, dur }: { path: string; dur: number }) {
  return (
    <>
      {[0, 1, 2].map((k) => (
        <circle key={k} r="3.6" fill="#4F39F6" opacity="0" className="pc-traveller">
          <animateMotion dur={`${dur}s`} begin={`${-(k * dur) / 3}s`} repeatCount="indefinite" path={path} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.86;1" dur={`${dur}s`} begin={`${-(k * dur) / 3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

const TOP = 'M20,130 H200 C290,130 300,180 380,180 H470';
const BOT = 'M20,290 H200 C290,290 300,220 380,220 H470';

function Landscape() {
  return (
    <svg viewBox="0 0 600 400" className="hidden w-full sm:block" role="img" aria-labelledby="pc-streams-l">
      <title id="pc-streams-l">{LABEL}</title>
      <defs>
        <linearGradient id="pc-st-top" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="150" y2="0">
          <stop offset="0" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="1" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="pc-st-bot" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="150" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="pc-st-glow">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <text x="20" y="54" className="pc-vt">{FOUND.title}</text>
      <text x="20" y="80" className="pc-vi">{FOUND.items.join('  ·  ')}</text>
      <text x="20" y="346" className="pc-vt">{CHOSEN.title}</text>
      <text x="20" y="372" className="pc-vi">{CHOSEN.items.join('  ·  ')}</text>
      <path d={TOP} fill="none" stroke="url(#pc-st-top)" strokeWidth="40" />
      <path d={BOT} fill="none" stroke="url(#pc-st-bot)" strokeWidth="40" />
      <Dots path={TOP} dur={6} />
      <Dots path={BOT} dur={6} />
      <circle cx="520" cy="200" r="90" fill="url(#pc-st-glow)" />
      <circle cx="520" cy="200" r="64" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="520" y="196" textAnchor="middle" className="pc-vcore">Leads</text>
      <text x="520" y="216" textAnchor="middle" className="pc-vcs">calls, quotes</text>
      <text x="520" y="230" textAnchor="middle" className="pc-vcs">and bookings</text>
    </svg>
  );
}

const M_L = 'M105,150 V250 C105,330 178,330 178,400 V530';
const M_R = 'M295,150 V250 C295,330 222,330 222,400 V530';

function Portrait() {
  const stack = (x: number, side: typeof FOUND) => (
    <g textAnchor="middle">
      <text x={x} y={44} className="pc-vt">{side.title}</text>
      {side.items.map((it, n) => (
        <text key={it} x={x} y={74 + n * 22} className="pc-vi">{it}</text>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 400 660" className="w-full sm:hidden" role="img" aria-labelledby="pc-streams-p">
      <title id="pc-streams-p">{LABEL}</title>
      <defs>
        <linearGradient id="pc-sm-l" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="250">
          <stop offset="0" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="1" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="pc-sm-r" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="250">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="pc-sm-glow">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {stack(105, FOUND)}
      {stack(295, CHOSEN)}
      <path d={M_L} fill="none" stroke="url(#pc-sm-l)" strokeWidth="44" />
      <path d={M_R} fill="none" stroke="url(#pc-sm-r)" strokeWidth="44" />
      <Dots path={M_L} dur={6} />
      <Dots path={M_R} dur={6} />
      <circle cx="200" cy="566" r="84" fill="url(#pc-sm-glow)" />
      <circle cx="200" cy="566" r="60" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="200" y="562" textAnchor="middle" className="pc-vcore">Leads</text>
      <text x="200" y="582" textAnchor="middle" className="pc-vcs">calls, quotes</text>
      <text x="200" y="596" textAnchor="middle" className="pc-vcs">and bookings</text>
    </svg>
  );
}

export function ProposalOfferStreams() {
  return (
    <figure className="m-0" data-print-keep>
      <Landscape />
      <Portrait />
    </figure>
  );
}
