/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';

/**
 * Round two of the offer visual (Arnel, 2026-09-23). His favourite was the
 * figure-8 (V2): "beautiful, much more in the direction I imagined". He liked
 * how the blueprint (V3) broke down what we do, but it and the UI collage (V1)
 * were too busy "for less sophisticated buyers". The report card (V4) is out.
 *
 * So every visual here keeps V2's rules: one bold shape, big quiet type, calm
 * motion, no wiring, no tiles, no nodes with leader lines (the ring's rejected
 * version). V3's clarity survives only as three plain words per side.
 *
 * Same words in all three, so the shape is the only variable:
 *   Get found  — SEO for Google, GEO for ChatGPT, reviews and listings
 *   Get chosen — design, development, split tests
 *   Leads      — calls, quote requests, bookings
 * plus Arnel's two promises: no designer or developer to hire; measured in
 * leads, not traffic.
 *
 * Every visual carries its own phone drawing (portrait geometry), so nothing
 * falls back to plain cards below 640px.
 */

export const FOUND = { eyebrow: 'Your search team', title: 'Get found', items: ['SEO for Google', 'GEO for ChatGPT', 'Reviews and listings'] };
export const CHOSEN = { eyebrow: 'Your web team', title: 'Get chosen', items: ['Design', 'Development', 'Split tests'] };
export const PROMISES = ['No designer or developer to hire', 'Measured in leads, not traffic'];
export const TITLE =
  'Two sides of one retainer. Get found: SEO for Google, GEO for ChatGPT, reviews and listings. Get chosen: design, development and split tests. Both end in leads: calls, quote requests and bookings.';

export function Promises() {
  return (
    <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
      {PROMISES.map((p) => (
        <li key={p} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13.5px] font-medium text-white ring-1 ring-inset ring-white/20">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-primary-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5l3 3 7-7" />
          </svg>
          {p}
        </li>
      ))}
    </ul>
  );
}

/** A centred text stack: optional eyebrow, title, items. y is the title baseline. */
export function Stack({ x, y, side, eyebrow = true, mobile = false }: { x: number; y: number; side: typeof FOUND; eyebrow?: boolean; mobile?: boolean }) {
  const t = mobile ? 'vx-t-m' : 'vx-t';
  const i = mobile ? 'vx-i-m' : 'vx-i';
  const gap = mobile ? 22 : 26;
  const first = mobile ? 30 : 36;
  return (
    <g textAnchor="middle">
      {eyebrow && <text x={x} y={y - (mobile ? 30 : 36)} className="vx-eb">{side.eyebrow}</text>}
      <text x={x} y={y} className={t}>{side.title}</text>
      {side.items.map((it, n) => (
        <text key={it} x={x} y={y + first + n * gap} className={i}>{it}</text>
      ))}
    </g>
  );
}

/* ── V5 · Overlap ─────────────────────────────────────────────────────────
   Two circles, one per side, sliding together; where they overlap, the
   result. The plainest possible picture of "two things make one outcome". */
function VennDesktop() {
  const L = { cx: 405, cy: 230 };
  const R = { cx: 595, cy: 230 };
  const r = 190;
  return (
    <svg viewBox="0 0 1000 460" className="hidden w-full sm:block" role="img" aria-labelledby="v5d-t">
      <title id="v5d-t">{TITLE}</title>
      <defs>
        <linearGradient id="v5d-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0e7ff" stopOpacity=".34" />
          <stop offset="1" stopColor="#a5b4fc" stopOpacity=".14" />
        </linearGradient>
        <linearGradient id="v5d-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".24" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".05" />
        </linearGradient>
        <clipPath id="v5d-clip"><circle cx={L.cx} cy={L.cy} r={r} /></clipPath>
        <filter id="v5d-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26" /></filter>
      </defs>
      <g className="v5-in-l">
        <circle cx={L.cx} cy={L.cy} r={r} fill="url(#v5d-l)" stroke="#c7d2fe" strokeWidth="2" />
        <Stack x={318} y={200} side={FOUND} />
      </g>
      <g className="v5-in-r">
        <circle cx={R.cx} cy={R.cy} r={r} fill="url(#v5d-r)" stroke="#fff" strokeWidth="2" />
        <Stack x={682} y={200} side={CHOSEN} />
      </g>
      <g className="v5-lens">
        <g filter="url(#v5d-glow)" opacity=".55"><circle cx={R.cx} cy={R.cy} r={r} clipPath="url(#v5d-clip)" fill="#fff" /></g>
        <circle cx={R.cx} cy={R.cy} r={r} clipPath="url(#v5d-clip)" fill="#fff" />
        <path transform="translate(488 150)" d="M12 2v14M5 9l7-7 7 7" fill="none" stroke="#4F39F6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="500" y="222" textAnchor="middle" className="vx-core-d">Leads</text>
        {['calls', 'quote requests', 'bookings'].map((w, n) => (
          <text key={w} x="500" y={252 + n * 19} textAnchor="middle" className="vx-cs-d">{w}</text>
        ))}
      </g>
    </svg>
  );
}
export function VennMobile() {
  const T = { cx: 200, cy: 200 };
  const B = { cx: 200, cy: 400 };
  const r = 150;
  return (
    <svg viewBox="0 0 400 570" className="w-full sm:hidden" role="img" aria-labelledby="v5m-t">
      <title id="v5m-t">{TITLE}</title>
      <defs>
        <linearGradient id="v5m-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0e7ff" stopOpacity=".34" />
          <stop offset="1" stopColor="#a5b4fc" stopOpacity=".14" />
        </linearGradient>
        <linearGradient id="v5m-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".24" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".05" />
        </linearGradient>
        <clipPath id="v5m-clip"><circle cx={T.cx} cy={T.cy} r={r} /></clipPath>
        <filter id="v5m-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>
      <g className="v5-in-t">
        <circle cx={T.cx} cy={T.cy} r={r} fill="url(#v5m-l)" stroke="#c7d2fe" strokeWidth="2" />
        <Stack x={200} y={142} side={FOUND} mobile />
      </g>
      <g className="v5-in-b">
        <circle cx={B.cx} cy={B.cy} r={r} fill="url(#v5m-r)" stroke="#fff" strokeWidth="2" />
        <Stack x={200} y={424} side={CHOSEN} mobile />
      </g>
      <g className="v5-lens">
        <g filter="url(#v5m-glow)" opacity=".55"><circle cx={B.cx} cy={B.cy} r={r} clipPath="url(#v5m-clip)" fill="#fff" /></g>
        <circle cx={B.cx} cy={B.cy} r={r} clipPath="url(#v5m-clip)" fill="#fff" />
        <text x="200" y="302" textAnchor="middle" className="vx-core-d-m">Leads</text>
        <text x="200" y="324" textAnchor="middle" className="vx-cs-d">calls · quotes · bookings</text>
      </g>
    </svg>
  );
}
export function VisualOverlap() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <VennDesktop />
      <VennMobile />
      <Promises />
    </div>
  );
}

/* ── V6 · Two streams ─────────────────────────────────────────────────────
   Two ribbons flow in from the left and become one, which ends in Leads.
   Small dots ride each ribbon into the badge: people arriving. */
const S_TOP = 'M60,140 H460 C580,140 590,196 700,196 H846';
const S_BOT = 'M60,300 H460 C580,300 590,244 700,244 H846';
const S_TOP_RUN = 'M60,140 H460 C580,140 590,196 700,196 H850';
const S_BOT_RUN = 'M60,300 H460 C580,300 590,244 700,244 H850';
export function Dots({ path, n = 3, dur = 7, fill = '#4F39F6' }: { path: string; n?: number; dur?: number; fill?: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <circle key={k} r="3.6" fill={fill} opacity="0" className="c-traveller">
          <animateMotion dur={`${dur}s`} begin={`${-(k * dur) / n}s`} repeatCount="indefinite" path={path} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.86;1" dur={`${dur}s`} begin={`${-(k * dur) / n}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}
function StreamsDesktop() {
  return (
    <svg viewBox="0 0 1000 420" className="hidden w-full sm:block" role="img" aria-labelledby="v6d-t">
      <title id="v6d-t">{TITLE}</title>
      <defs>
        <linearGradient id="v6d-top" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="240" y2="0">
          <stop offset="0" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="1" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="v6d-bot" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="240" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="v6d-glow"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <g textAnchor="start">
        <text x="60" y="62" className="vx-t">{FOUND.title}</text>
        <text x="60" y="94" className="vx-i">{FOUND.items.join('  ·  ')}</text>
        <text x="60" y="366" className="vx-t">{CHOSEN.title}</text>
        <text x="60" y="398" className="vx-i">{CHOSEN.items.join('  ·  ')}</text>
      </g>
      {/* The two ribbons end side by side, lavender over white, straight into
          the badge: one band made of both, no seam to hide. */}
      <path d={S_TOP} fill="none" stroke="url(#v6d-top)" strokeWidth="48" />
      <path d={S_BOT} fill="none" stroke="url(#v6d-bot)" strokeWidth="48" />
      <Dots path={S_TOP_RUN} />
      <Dots path={S_BOT_RUN} />
      <circle cx="880" cy="220" r="110" fill="url(#v6d-glow)" />
      <circle cx="880" cy="220" r="76" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="880" y="214" textAnchor="middle" className="vx-core">Leads</text>
      <text x="880" y="238" textAnchor="middle" className="vx-cs">calls, quote requests</text>
      <text x="880" y="254" textAnchor="middle" className="vx-cs">and bookings</text>
    </svg>
  );
}
const M_L = 'M105,150 V250 C105,330 178,330 178,400 V530';
const M_R = 'M295,150 V250 C295,330 222,330 222,400 V530';
const M_L_RUN = 'M105,150 V250 C105,330 178,330 178,400 V520';
const M_R_RUN = 'M295,150 V250 C295,330 222,330 222,400 V520';
export function StreamsMobile() {
  return (
    <svg viewBox="0 0 400 660" className="w-full sm:hidden" role="img" aria-labelledby="v6m-t">
      <title id="v6m-t">{TITLE}</title>
      <defs>
        <linearGradient id="v6m-l" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="250">
          <stop offset="0" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="1" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="v6m-r" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="250">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="v6m-glow"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <Stack x={105} y={44} side={FOUND} eyebrow={false} mobile />
      <Stack x={295} y={44} side={CHOSEN} eyebrow={false} mobile />
      <path d={M_L} fill="none" stroke="url(#v6m-l)" strokeWidth="44" />
      <path d={M_R} fill="none" stroke="url(#v6m-r)" strokeWidth="44" />
      <Dots path={M_L_RUN} dur={6} />
      <Dots path={M_R_RUN} dur={6} />
      <circle cx="200" cy="566" r="84" fill="url(#v6m-glow)" />
      <circle cx="200" cy="566" r="60" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="200" y="562" textAnchor="middle" className="vx-core-m">Leads</text>
      <text x="200" y="582" textAnchor="middle" className="vx-cs">calls, quotes</text>
      <text x="200" y="596" textAnchor="middle" className="vx-cs">and bookings</text>
    </svg>
  );
}
export function VisualStreams() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <StreamsDesktop />
      <StreamsMobile />
      <Promises />
    </div>
  );
}

/* ── V7 · Figure-8, broken down ───────────────────────────────────────────
   V2 as Arnel liked it, with the one thing V3 did better: each loop names
   what is inside it, three plain words, nothing wired. */
export const F_R = 'M450,190 C505,105 580,42 655,42 C745,42 805,110 805,190 C805,270 745,338 655,338 C580,338 505,275 450,190';
export const F_L = 'M450,190 C395,275 320,338 245,338 C155,338 95,270 95,190 C95,110 155,42 245,42 C320,42 395,105 450,190';
const Fm_T = 'M200,350 C125,302 62,237 62,158 C62,82 125,30 200,30 C275,30 338,82 338,158 C338,237 275,302 200,350';
const Fm_B = 'M200,350 C125,398 62,463 62,542 C62,618 125,670 200,670 C275,670 338,618 338,542 C338,463 275,398 200,350';
export function Icon({ x, y, kind }: { x: number; y: number; kind: 'search' | 'site' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="20" fill="rgba(255,255,255,0.14)" />
      {kind === 'search' ? (
        <path transform="translate(-9 -9) scale(.78)" d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      ) : (
        <path transform="translate(-9 -9) scale(.78)" d="M4 5h7v14H4zM13 5h7v14h-7z" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinejoin="round" />
      )}
    </g>
  );
}
function LoopDesktop() {
  return (
    <svg viewBox="0 0 900 400" className="hidden w-full sm:block" role="img" aria-labelledby="v7d-t">
      <title id="v7d-t">{TITLE}</title>
      <defs>
        <linearGradient id="v7d-l" x1="0" x2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
        <radialGradient id="v7d-glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <path d={`${F_L}Z`} fill="rgba(199,210,254,0.10)" />
      <path d={`${F_R}Z`} fill="rgba(255,255,255,0.08)" />
      <path d={F_L} fill="none" stroke="url(#v7d-l)" strokeWidth="9" strokeLinecap="round" />
      <path d={F_R} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <path d="M242,34 l10,8 -10,8" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M662,346 l-10,-8 10,-8" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle r="7" fill="#fff" className="c-traveller"><animateMotion dur="9s" repeatCount="indefinite" path={F_L} /></circle>
      <circle r="7" fill="#312e81" stroke="#fff" strokeWidth="2" className="c-traveller"><animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path={F_R} /></circle>
      <Icon x={250} y={104} kind="search" />
      <Stack x={250} y={160} side={FOUND} eyebrow={false} />
      <Icon x={650} y={104} kind="site" />
      <Stack x={650} y={160} side={CHOSEN} eyebrow={false} />
      <circle cx="450" cy="190" r="74" fill="url(#v7d-glow)" />
      <circle cx="450" cy="190" r="52" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="450" y="187" textAnchor="middle" className="vx-core-s">Leads</text>
      <text x="450" y="205" textAnchor="middle" className="vx-cs-s">calls, quotes</text>
      <text x="450" y="219" textAnchor="middle" className="vx-cs-s">&amp; bookings</text>
    </svg>
  );
}
export function LoopMobile() {
  return (
    <svg viewBox="0 0 400 700" className="w-full sm:hidden" role="img" aria-labelledby="v7m-t">
      <title id="v7m-t">{TITLE}</title>
      <defs>
        <linearGradient id="v7m-l" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
        <radialGradient id="v7m-glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <path d={`${Fm_T}Z`} fill="rgba(199,210,254,0.10)" />
      <path d={`${Fm_B}Z`} fill="rgba(255,255,255,0.08)" />
      <path d={Fm_T} fill="none" stroke="url(#v7m-l)" strokeWidth="8" strokeLinecap="round" />
      <path d={Fm_B} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <path d="M196,22 l9,8 -9,8" fill="none" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M196,662 l9,8 -9,8" fill="none" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle r="6" fill="#fff" className="c-traveller"><animateMotion dur="9s" repeatCount="indefinite" path={Fm_T} /></circle>
      <circle r="6" fill="#312e81" stroke="#fff" strokeWidth="2" className="c-traveller"><animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path={Fm_B} /></circle>
      <Icon x={200} y={92} kind="search" />
      <Stack x={200} y={146} side={FOUND} eyebrow={false} mobile />
      <Icon x={200} y={458} kind="site" />
      <Stack x={200} y={512} side={CHOSEN} eyebrow={false} mobile />
      <circle cx="200" cy="350" r="64" fill="url(#v7m-glow)" />
      <circle cx="200" cy="350" r="44" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="200" y="357" textAnchor="middle" className="vx-core-s">Leads</text>
    </svg>
  );
}
export function VisualLoopPlus() {
  return (
    <div className="mx-auto max-w-[980px]">
      <LoopDesktop />
      <LoopMobile />
      <Promises />
    </div>
  );
}

export const VISUALS2: Record<string, () => React.ReactElement> = {
  v5: VisualOverlap,
  v6: VisualStreams,
  v7: VisualLoopPlus,
};
export type { ReactNode };
