/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import type { Proposal } from '@/sanity/lib/proposalsClient';
import { ProposalLogoStrip } from '@/components/proposal/ProposalLogoStrip';
import {
  CHOSEN, Dots, F_L, F_R, FOUND, Icon, LoopMobile, PROMISES, Stack, StreamsMobile, TITLE, VennMobile,
} from './Visuals2';

/**
 * Round three (Arnel, 2026-09-23): "all three speak to me", try them two
 * columns, title on the left, visual on the right. The full-width drawings
 * would shrink to ~60% in a half column and the words to ~9px, so each is
 * redrawn at column size (viewBox ~600 wide, rendered near 1:1). Phones keep
 * the portrait drawings from round two.
 */

const page = 'relative z-[1] mx-auto max-w-[1180px] px-5 sm:px-8';
const PLATFORM: Record<string, string> = { clutch: 'Clutch', google: 'Google', trustpilot: 'Trustpilot' };

function validUntil(p: Proposal) {
  const d = Date.parse(`${p.validUntil}T12:00:00Z`);
  return Number.isFinite(d)
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)
    : p.validUntil;
}

export function TwoColHero({ proposal, children }: { proposal: Proposal; children: ReactNode }) {
  const [amt, ...rest] = (proposal.priceLine ?? '').split(', ');
  const ps = (proposal.proofRail?.platforms ?? []) as any[];
  return (
    <header className="c-electric overflow-hidden">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <img src="/images/loudface-inversed.svg" alt="LoudFace" width={133} height={27} className="h-[26px] w-auto" />
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="c-eyebrow">
              Prepared for <b>{proposal.preparedFor?.join(', ')}</b>
              <em>Valid until {validUntil(proposal)}</em>
            </p>
            <h1 className="mt-6 max-w-[16ch] text-[34px] font-medium leading-[1.04] tracking-[-0.04em] text-white sm:text-[50px]">
              {proposal.title}
            </h1>
            <p className="c-anchor proposal-num">
              <span className="amt">{amt}</span>
              <span className="lbl">{rest.join(', ')}</span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ps.map((p) => (
                <li key={p._key} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] text-white ring-1 ring-inset ring-white/15">
                  <span className="font-medium">{PLATFORM[p.platform] ?? p.platform}</span>
                  <span className="text-amber-300" aria-hidden="true">★</span>
                  <span className="proposal-num font-semibold">{Number(p.rating).toFixed(1)}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[15px] font-medium text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── V5 · Overlap, column size ── */
function VennCol() {
  const r = 150;
  const L = { cx: 225, cy: 190 };
  const R = { cx: 375, cy: 190 };
  return (
    <svg viewBox="0 0 600 380" className="hidden w-full sm:block" role="img" aria-labelledby="v5c-t">
      <title id="v5c-t">{TITLE}</title>
      <defs>
        <linearGradient id="v5c-l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e0e7ff" stopOpacity=".34" /><stop offset="1" stopColor="#a5b4fc" stopOpacity=".14" /></linearGradient>
        <linearGradient id="v5c-r" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".24" /><stop offset="1" stopColor="#ffffff" stopOpacity=".05" /></linearGradient>
        <clipPath id="v5c-clip"><circle cx={L.cx} cy={L.cy} r={r} /></clipPath>
        <filter id="v5c-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      <g className="v5-in-l">
        <circle cx={L.cx} cy={L.cy} r={r} fill="url(#v5c-l)" stroke="#c7d2fe" strokeWidth="2" />
        <Stack x={160} y={170} side={FOUND} mobile />
      </g>
      <g className="v5-in-r">
        <circle cx={R.cx} cy={R.cy} r={r} fill="url(#v5c-r)" stroke="#fff" strokeWidth="2" />
        <Stack x={440} y={170} side={CHOSEN} mobile />
      </g>
      <g className="v5-lens">
        <g filter="url(#v5c-glow)" opacity=".55"><circle cx={R.cx} cy={R.cy} r={r} clipPath="url(#v5c-clip)" fill="#fff" /></g>
        <circle cx={R.cx} cy={R.cy} r={r} clipPath="url(#v5c-clip)" fill="#fff" />
        <path transform="translate(288 122)" d="M12 2v14M5 9l7-7 7 7" fill="none" stroke="#4F39F6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="300" y="186" textAnchor="middle" className="vx-core-d-m">Leads</text>
        {['calls', 'quote requests', 'bookings'].map((w, n) => (
          <text key={w} x="300" y={210 + n * 17} textAnchor="middle" className="vx-cs-d">{w}</text>
        ))}
      </g>
    </svg>
  );
}

/* ── V6 · Two streams, column size ── */
const C_TOP = 'M20,130 H200 C290,130 300,180 380,180 H470';
const C_BOT = 'M20,290 H200 C290,290 300,220 380,220 H470';
function StreamsCol() {
  return (
    <svg viewBox="0 0 600 400" className="hidden w-full sm:block" role="img" aria-labelledby="v6c-t">
      <title id="v6c-t">{TITLE}</title>
      <defs>
        <linearGradient id="v6c-top" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="150" y2="0"><stop offset="0" stopColor="#c7d2fe" stopOpacity="0" /><stop offset="1" stopColor="#c7d2fe" /></linearGradient>
        <linearGradient id="v6c-bot" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="150" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#ffffff" /></linearGradient>
        <radialGradient id="v6c-glow"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <text x="20" y="54" className="vx-t-m">{FOUND.title}</text>
      <text x="20" y="80" className="vx-i-m">{FOUND.items.join('  ·  ')}</text>
      <text x="20" y="346" className="vx-t-m">{CHOSEN.title}</text>
      <text x="20" y="372" className="vx-i-m">{CHOSEN.items.join('  ·  ')}</text>
      <path d={C_TOP} fill="none" stroke="url(#v6c-top)" strokeWidth="40" />
      <path d={C_BOT} fill="none" stroke="url(#v6c-bot)" strokeWidth="40" />
      <Dots path={C_TOP} dur={6} />
      <Dots path={C_BOT} dur={6} />
      <circle cx="520" cy="200" r="90" fill="url(#v6c-glow)" />
      <circle cx="520" cy="200" r="64" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="520" y="196" textAnchor="middle" className="vx-core-m">Leads</text>
      <text x="520" y="216" textAnchor="middle" className="vx-cs">calls, quotes</text>
      <text x="520" y="230" textAnchor="middle" className="vx-cs">and bookings</text>
    </svg>
  );
}

/* ── V7 · Figure-8, column size: V2's loops at two thirds, type at full size ── */
function LoopCol() {
  const k = 600 / 900;
  return (
    <svg viewBox="0 0 600 270" className="hidden w-full sm:block" role="img" aria-labelledby="v7c-t">
      <title id="v7c-t">{TITLE}</title>
      <defs>
        <linearGradient id="v7c-l" x1="0" x2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
        <radialGradient id="v7c-glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`scale(${k})`}>
        <path d={`${F_L}Z`} fill="rgba(199,210,254,0.10)" />
        <path d={`${F_R}Z`} fill="rgba(255,255,255,0.08)" />
        <path d={F_L} fill="none" stroke="url(#v7c-l)" strokeWidth="10" strokeLinecap="round" />
        <path d={F_R} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        <circle r="9" fill="#fff" className="c-traveller"><animateMotion dur="9s" repeatCount="indefinite" path={F_L} /></circle>
        <circle r="9" fill="#312e81" stroke="#fff" strokeWidth="2.5" className="c-traveller"><animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path={F_R} /></circle>
      </g>
      <Icon x={165} y={70} kind="search" />
      <Stack x={165} y={116} side={FOUND} eyebrow={false} mobile />
      <Icon x={435} y={70} kind="site" />
      <Stack x={435} y={116} side={CHOSEN} eyebrow={false} mobile />
      <circle cx="300" cy="127" r="58" fill="url(#v7c-glow)" />
      <circle cx="300" cy="127" r="40" fill="#171445" stroke="#fff" strokeWidth="2" />
      <text x="300" y="134" textAnchor="middle" className="vx-core-s">Leads</text>
    </svg>
  );
}

function Col({ children, mobile }: { children: ReactNode; mobile: ReactNode }) {
  return (
    <div>
      {children}
      {mobile}
    </div>
  );
}

export const VISUALS3: Record<string, () => React.ReactElement> = {
  v5: () => <Col mobile={<VennMobile />}><VennCol /></Col>,
  v6: () => <Col mobile={<StreamsMobile />}><StreamsCol /></Col>,
  v7: () => <Col mobile={<LoopMobile />}><LoopCol /></Col>,
};
