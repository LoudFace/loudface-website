/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import type { Proposal } from '@/sanity/lib/proposalsClient';
import { ProposalLogoStrip } from '@/components/proposal/ProposalLogoStrip';

/**
 * Four ways to draw the offer (Arnel, 2026-09-23): on one side design,
 * development and conversion work (split tests), so the client needs no
 * designer or dev team; on the other SEO and GEO that bring real leads,
 * reported as pipeline, never vanity metrics. Every visual sits in the same
 * hero frame: centred title and price, the review ratings Arnel kept from H1.
 *
 * References (Mobbin 2026-09-23): Tines UI cards (VU01), Figma connected flow
 * (VU09), Plain and Steep report cards (VR10, VR09), Mixpanel chart hero
 * (VR05), HubSpot journey loop (VL07), Cloudflare Workers blueprint (VL10).
 *
 * Real data only where a number appears: Faith's Google rating (4.9, 1,371
 * reviews) is from faithautoglass.com, read 2026-09-23; the weekly cadence
 * (5 pieces, 2–3 placements) is from the proposal. Everything else is shown
 * as an example of the format, labelled as such.
 */

const page = 'relative z-[1] mx-auto max-w-[1180px] px-5 sm:px-8';

function validUntil(p: Proposal) {
  const d = Date.parse(`${p.validUntil}T12:00:00Z`);
  return Number.isFinite(d)
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)
    : p.validUntil;
}

const PLATFORM: Record<string, string> = { clutch: 'Clutch', google: 'Google', trustpilot: 'Trustpilot' };

/* ── the shared frame ─────────────────────────────────────────────────── */
export function VisualHero({ proposal, children }: { proposal: Proposal; children: ReactNode }) {
  const [amt, ...rest] = (proposal.priceLine ?? '').split(', ');
  const ps = (proposal.proofRail?.platforms ?? []) as any[];
  return (
    <header className="c-electric overflow-hidden">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <img src="/images/loudface-inversed.svg" alt="LoudFace" width={133} height={27} className="h-[26px] w-auto" />
        <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-center text-center">
          <p className="c-eyebrow">
            Prepared for <b>{proposal.preparedFor?.join(', ')}</b>
            <em>Valid until {validUntil(proposal)}</em>
          </p>
          <h1 className="mt-6 max-w-[22ch] text-balance text-[34px] font-medium leading-[1.04] tracking-[-0.04em] text-white sm:text-[50px]">
            {proposal.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <p className="c-anchor proposal-num !mt-0">
              <span className="amt">{amt}</span>
              <span className="lbl">{rest.join(', ')}</span>
            </p>
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {ps.map((p) => (
              <li key={p._key} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] text-white ring-1 ring-inset ring-white/15">
                <span className="font-medium">{PLATFORM[p.platform] ?? p.platform}</span>
                <span className="text-amber-300" aria-hidden="true">★</span>
                <span className="proposal-num font-semibold">{Number(p.rating).toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12">{children}</div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── small parts ──────────────────────────────────────────────────────── */
const I = {
  search: <path d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5" />,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />,
  pen: <path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" />,
  code: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />,
  split: <path d="M4 5h7v14H4zM13 5h7v14h-7z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
  doc: <path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" />,
  cal: <path d="M5 6h14v14H5zM5 10h14M9 3v4M15 3v4" />,
  pin: <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  star: <path d="M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 16.2 7 19l1.2-5.6L4 9.6l5.6-.6z" />,
};
function Glyph({ d, className = 'h-4 w-4' }: { d: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
const card = 'rounded-[20px] bg-white text-left text-surface-950 shadow-[0_30px_60px_-30px_rgba(15,10,60,0.7)]';
function Pill({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'night' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${tone === 'indigo' ? 'bg-primary-50 text-primary-700' : 'bg-night text-white'}`}>
      {children}
    </span>
  );
}

/* ── V1 · Two engines, one pipeline ───────────────────────────────────── */
export function VisualEngines() {
  return (
    <div className="relative mx-auto grid max-w-[1080px] items-center gap-4 lg:grid-cols-[1fr_1.08fr_1fr] lg:gap-0">
      {/* left engine */}
      <div className={`${card} p-5 lg:mr-[-8px] lg:rotate-[-1.2deg]`}>
        <Pill>SEO + GEO</Pill>
        <p className="mt-2 text-[17px] font-semibold tracking-[-0.02em]">Found on Google and ChatGPT</p>
        <div className="mt-4 rounded-2xl bg-surface-50 p-3">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-surface-200/80 px-3 py-2 text-[12.5px]">Who does the best windshield replacement in Temecula?</p>
          <div className="mt-2.5 flex gap-2">
            <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-950 text-white"><Glyph d={I.spark} className="h-3.5 w-3.5" /></span>
            <p className="text-[12.5px] leading-snug text-surface-700">
              <b className="text-surface-950">Faith Auto Glass</b> is rated 4.9 on Google and handles windshields, ADAS calibration and tinting.
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 rounded-2xl border border-surface-200 px-3 py-2.5">
          <span className="text-primary-600"><Glyph d={I.search} /></span>
          <div className="min-w-0 text-[12px] leading-tight">
            <p className="truncate font-semibold text-surface-950">Faith Auto Glass &amp; Window Tinting</p>
            <p className="text-surface-500"><span className="text-amber-500">★</span> 4.9 · 1,371 Google reviews</p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-surface-500">The goal for month three: ChatGPT names Faith.</p>
      </div>

      {/* the middle: pipeline */}
      <div className="relative z-[1] rounded-[24px] bg-night p-5 text-left text-white shadow-[0_40px_80px_-30px_rgba(10,6,40,0.9)] ring-1 ring-white/10 lg:p-6">
        <div className="flex items-center justify-between">
          <Pill tone="indigo">Pipeline</Pill>
          <span className="text-[11.5px] text-white/50">Your Friday report</span>
        </div>
        <p className="mt-2 text-[19px] font-semibold tracking-[-0.02em]">Leads, not traffic</p>
        <ul className="mt-4 space-y-2">
          {[
            { g: I.doc, t: 'Quote request', s: 'Windshield · Tesla Model Y' },
            { g: I.phone, t: 'Call', s: 'Chip repair · Temecula' },
            { g: I.cal, t: 'Booking', s: 'Window tint · second location' },
          ].map((r) => (
            <li key={r.t} className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-3 py-2.5 ring-1 ring-inset ring-white/10">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary-600 text-white"><Glyph d={r.g} /></span>
              <span className="min-w-0 text-[13px] leading-tight">
                <b className="block font-semibold">{r.t}</b>
                <span className="text-white/60">{r.s}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-white/55">Example entries. We report calls, quote requests and bookings, per location.</p>
      </div>

      {/* right engine */}
      <div className={`${card} p-5 lg:ml-[-8px] lg:rotate-[1.2deg]`}>
        <Pill>Design · Dev · CRO</Pill>
        <p className="mt-2 text-[17px] font-semibold tracking-[-0.02em]">A site that turns visits into bookings</p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-200">
          <div className="flex h-6 items-center gap-1 border-b border-surface-200 bg-surface-50 px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-surface-300" /><span className="h-1.5 w-1.5 rounded-full bg-surface-300" /><span className="h-1.5 w-1.5 rounded-full bg-surface-300" />
            <span className="ml-auto rounded-full bg-primary-600 px-1.5 py-[1px] text-[9.5px] font-semibold text-white">Split test · B</span>
          </div>
          <div className="p-3">
            <p className="text-[13px] font-semibold leading-tight">Auto glass and tint, done right in Temecula</p>
            <div className="mt-2.5 flex gap-1.5">
              <span className="rounded-full bg-primary-600 px-2.5 py-1 text-[10.5px] font-semibold text-white">Get a quote</span>
              <span className="rounded-full border border-surface-200 px-2.5 py-1 text-[10.5px] font-medium">Book a slot</span>
            </div>
          </div>
        </div>
        <ul className="mt-3 space-y-1.5 text-[12.5px] text-surface-700">
          <li className="flex gap-2"><span className="text-primary-600">✓</span>No designer or dev team to hire</li>
          <li className="flex gap-2"><span className="text-primary-600">✓</span>Landing pages the day you ask</li>
          <li className="flex gap-2"><span className="text-primary-600">✓</span>Split tests on the pages that sell</li>
        </ul>
      </div>
    </div>
  );
}

/* ── V2 · Figure-8 ────────────────────────────────────────────────────── */
const RIGHT = 'M450,190 C505,105 580,42 655,42 C745,42 805,110 805,190 C805,270 745,338 655,338 C580,338 505,275 450,190';
const LEFT = 'M450,190 C395,275 320,338 245,338 C155,338 95,270 95,190 C95,110 155,42 245,42 C320,42 395,105 450,190';
export function VisualLoop() {
  return (
    <div className="mx-auto max-w-[980px]">
      <svg viewBox="0 0 900 400" className="hidden w-full sm:block" role="img" aria-labelledby="v2t">
        <title id="v2t">Two loops that meet in the middle: SEO and GEO get Faith found, design, development and split tests get Faith chosen, and both end in leads.</title>
        <defs>
          <linearGradient id="v2l" x1="0" x2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
          <radialGradient id="v2glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        {/* soft fills so each loop reads as a region */}
        <path d={`${LEFT}Z`} fill="rgba(199,210,254,0.10)" />
        <path d={`${RIGHT}Z`} fill="rgba(255,255,255,0.08)" />
        <path d={LEFT} fill="none" stroke="url(#v2l)" strokeWidth="9" strokeLinecap="round" />
        <path d={RIGHT} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        {/* direction marks */}
        <path d="M242,34 l10,8 -10,8" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M662,346 l-10,-8 10,-8" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* travellers */}
        <circle r="7" fill="#fff" className="c-traveller"><animateMotion dur="9s" repeatCount="indefinite" path={LEFT} /></circle>
        <circle r="7" fill="#312e81" stroke="#fff" strokeWidth="2" className="c-traveller"><animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path={RIGHT} /></circle>
        {/* left region */}
        <g transform="translate(245 160)" textAnchor="middle">
          <circle cy="-40" r="22" fill="rgba(255,255,255,0.14)" />
          <path transform="translate(-10 -50) scale(.85)" d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
          <text y="8" className="v2-h">Get found</text>
          <text y="32" className="v2-s">SEO and GEO: articles,</text>
          <text y="50" className="v2-s">listings, reviews, AI answers</text>
        </g>
        {/* right region */}
        <g transform="translate(655 160)" textAnchor="middle">
          <circle cy="-40" r="22" fill="rgba(255,255,255,0.14)" />
          <path transform="translate(-10 -50) scale(.85)" d="M4 5h7v14H4zM13 5h7v14h-7z" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round" />
          <text y="8" className="v2-h">Get chosen</text>
          <text y="32" className="v2-s">design, development</text>
          <text y="50" className="v2-s">and split tests</text>
        </g>
        {/* the crossing */}
        <circle cx="450" cy="190" r="70" fill="url(#v2glow)" />
        <circle cx="450" cy="190" r="46" fill="#171445" stroke="#fff" strokeWidth="2" />
        <text x="450" y="187" textAnchor="middle" className="v2-core">Leads</text>
        <text x="450" y="206" textAnchor="middle" className="v2-cs">pipeline</text>
      </svg>
      <p className="mt-2 hidden text-center text-[14px] text-white/75 sm:block">
        One retainer, two teams. Both loops end in the same number: calls, quote requests and bookings.
      </p>
      <MobileExplainer />
    </div>
  );
}

/* ── V3 · Blueprint ───────────────────────────────────────────────────── */
function Tile({ x, y, label, sub, icon }: { x: number; y: number; label: string; sub: string; icon: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="250" height="58" rx="14" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.28)" />
      <rect x="12" y="13" width="32" height="32" rx="9" fill="#fff" />
      <g transform="translate(18 19) scale(.84)" fill="none" stroke="#4F39F6" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</g>
      <text x="56" y="26" className="v3-t">{label}</text>
      <text x="56" y="44" className="v3-s">{sub}</text>
    </g>
  );
}
export function VisualBlueprint() {
  return (
    <div className="mx-auto max-w-[1060px]">
      <svg viewBox="0 0 1000 470" className="hidden w-full sm:block" role="img" aria-labelledby="v3t">
        <title id="v3t">Two teams we supply: a web team (design, development, conversion) and a search team (SEO, GEO, content and reviews). Both work on your website, and it produces calls, quote requests and bookings.</title>
        <defs>
          <pattern id="v3dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.14)" /></pattern>
        </defs>
        <rect width="1000" height="470" rx="24" fill="url(#v3dots)" />
        {/* groups */}
        <rect x="24" y="36" width="302" height="262" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeDasharray="5 6" />
        <text x="44" y="64" className="v3-g">Your web team</text>
        <text x="44" y="82" className="v3-gs">so you never hire a designer or developer</text>
        <rect x="674" y="36" width="302" height="262" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeDasharray="5 6" />
        <text x="694" y="64" className="v3-g">Your search team</text>
        <text x="694" y="82" className="v3-gs">so buyers find you before a competitor</text>
        <Tile x={50} y={100} label="Design" sub="modern, subtle, on brand" icon={I.pen} />
        <Tile x={50} y={166} label="Development" sub="quote tool, booking, portal" icon={I.code} />
        <Tile x={50} y={232} label="Conversion" sub="split tests on key pages" icon={I.split} />
        <Tile x={700} y={100} label="SEO" sub="5 pieces a week" icon={I.search} />
        <Tile x={700} y={166} label="GEO · AI search" sub="named by ChatGPT and Gemini" icon={I.spark} />
        <Tile x={700} y={232} label="Reviews and listings" sub="2–3 placements a week" icon={I.star} />
        {/* wires into the site */}
        {[129, 195, 261].map((y) => (
          <path key={`l${y}`} d={`M300,${y} C360,${y} 360,168 408,168`} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" />
        ))}
        {[129, 195, 261].map((y) => (
          <path key={`r${y}`} d={`M700,${y} C640,${y} 640,168 592,168`} fill="none" stroke="rgba(199,210,254,0.8)" strokeWidth="1.6" />
        ))}
        {/* the site */}
        <g transform="translate(408 96)">
          <rect width="184" height="144" rx="16" fill="#fff" />
          <rect width="184" height="24" rx="16" fill="#f1f1f4" />
          <rect y="12" width="184" height="12" fill="#f1f1f4" />
          <circle cx="16" cy="12" r="3" fill="#d4d4d8" /><circle cx="27" cy="12" r="3" fill="#d4d4d8" /><circle cx="38" cy="12" r="3" fill="#d4d4d8" />
          <text x="16" y="52" className="v3-site">faithautoglass.com</text>
          <rect x="16" y="64" width="120" height="8" rx="4" fill="#e4e4e7" />
          <rect x="16" y="78" width="92" height="8" rx="4" fill="#e4e4e7" />
          <rect x="16" y="100" width="70" height="24" rx="12" fill="#4F39F6" />
          <text x="51" y="116" textAnchor="middle" className="v3-btn">Get a quote</text>
          <rect x="92" y="100" width="72" height="24" rx="12" fill="none" stroke="#d4d4d8" />
          <text x="128" y="116" textAnchor="middle" className="v3-btn2">Book</text>
        </g>
        {/* down to pipeline */}
        <path d="M500,240 L500,322" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 5" />
        <circle cx="500" cy="322" r="4" fill="#fff" />
        <g transform="translate(310 330)">
          <rect width="380" height="112" rx="20" fill="#171445" stroke="rgba(255,255,255,0.16)" />
          <text x="190" y="32" textAnchor="middle" className="v3-p">Pipeline, reported every Friday</text>
          {([['Calls', 24, 86], ['Quote requests', 122, 124], ['Bookings', 258, 98]] as const).map(([t, x, w]) => (
            <g key={t} transform={`translate(${x} 52)`}>
              <rect width={w} height="38" rx="19" fill="#4F39F6" />
              <text x={w / 2} y="24" textAnchor="middle" className="v3-o">{t}</text>
            </g>
          ))}
        </g>
      </svg>
      <MobileExplainer />
    </div>
  );
}

/* ── V4 · The Friday report ───────────────────────────────────────────── */
function Spark({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 120 36" className="mt-3 h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L120,36 L0,36 Z`} fill="rgba(79,57,246,0.10)" />
      <path d={d} fill="none" stroke="#4F39F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
export function VisualReport() {
  return (
    <div className={`${card} mx-auto max-w-[1000px] overflow-hidden p-0`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <img src="/images/loudface.svg" alt="LoudFace" width={133} height={28} className="h-[18px] w-auto" />
          <span className="text-[13px] text-surface-400">×</span>
          <span className="text-[13.5px] font-semibold">Faith Auto Glass</span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="rounded-full bg-surface-100 px-2.5 py-1 font-medium text-surface-700">Both locations</span>
          <Pill>Every Friday</Pill>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.6fr_1fr]">
        <div className="p-5 sm:p-6">
          <p className="text-[12.5px] font-medium text-primary-700">What we lead with</p>
          <p className="mt-1 text-[20px] font-semibold tracking-[-0.02em]">Pipeline</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { t: 'Quote requests', g: I.doc, d: 'M0,30 C20,28 30,24 45,22 C60,20 70,14 85,12 C98,10 108,6 120,4' },
              { t: 'Calls', g: I.phone, d: 'M0,32 C18,30 32,29 48,24 C62,20 78,18 92,12 C104,8 112,8 120,6' },
              { t: 'Bookings', g: I.cal, d: 'M0,33 C20,32 34,30 50,27 C66,24 80,18 96,14 C106,12 114,9 120,8' },
            ].map((k) => (
              <div key={k.t} className="rounded-2xl border border-surface-200 p-3.5">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Glyph d={k.g} /></span>
                  {k.t}
                </div>
                <Spark d={k.d} />
                <p className="text-[11.5px] text-surface-500">per location, week on week</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-surface-50 px-3.5 py-3 text-[12.5px]">
            <span className="font-semibold">AI answers</span>
            {['ChatGPT', 'Gemini', 'Google AI'].map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-surface-200">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                {m} names Faith?
              </span>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-surface-500">
            Not what we lead with: <s>impressions</s> · <s>rankings</s> · <s>traffic</s>
          </p>
        </div>
        <div className="border-t border-surface-200 bg-surface-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[12.5px] font-medium text-primary-700">Shipped this week</p>
          <ul className="mt-3 space-y-2.5 text-[13.5px]">
            {[
              ['Search', '5 articles and service pages'],
              ['Search', '2–3 placements on other sites'],
              ['Site', 'Split test on the quote button'],
              ['Site', 'Landing page for the new location'],
            ].map(([k, t]) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-[3px] flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary-600 text-[9px] text-white">✓</span>
                <span>
                  {t}
                  <span className="block text-[11.5px] text-surface-500">{k === 'Site' ? 'Design · development · CRO' : 'SEO · GEO'}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11.5px] text-surface-400">Illustration of the report format.</p>
        </div>
      </div>
    </div>
  );
}

/* ── phone fallback for the two SVG diagrams ──────────────────────────── */
function MobileExplainer() {
  const row = 'rounded-2xl bg-white/10 p-4 text-left ring-1 ring-inset ring-white/15';
  return (
    <div className="space-y-2.5 sm:hidden">
      <div className={row}>
        <p className="text-[15px] font-semibold text-white">Get found</p>
        <p className="mt-1 text-[13.5px] text-white/75">SEO and GEO: articles, listings, reviews, answers in ChatGPT and Google.</p>
      </div>
      <div className={row}>
        <p className="text-[15px] font-semibold text-white">Get chosen</p>
        <p className="mt-1 text-[13.5px] text-white/75">Design, development and split tests. No designer or dev team to hire.</p>
      </div>
      <div className="rounded-2xl bg-night p-4 text-left ring-1 ring-white/15">
        <p className="text-[15px] font-semibold text-white">Leads</p>
        <p className="mt-1 text-[13.5px] text-white/75">Calls, quote requests and bookings, reported every Friday.</p>
      </div>
    </div>
  );
}

export const VISUALS: Record<string, () => React.ReactElement> = {
  v1: VisualEngines,
  v2: VisualLoop,
  v3: VisualBlueprint,
  v4: VisualReport,
};
