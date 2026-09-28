/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import type { Proposal } from '@/sanity/lib/proposalsClient';
import { HowWeWorkRing } from '@/components/proposal/HowWeWorkRing';
import { ProposalLogoStrip } from '@/components/proposal/ProposalLogoStrip';
import { WORK } from './Shell';

/**
 * Hero variants on concept C. All four open on the ELECTRIC indigo stage the
 * rulebook sets for page heroes (2026-07-12 tonality law, recipe from
 * /pricing), not the night indigo the live proposal uses. Night stays on the
 * close and the footer.
 *
 * References (Mobbin 2026-09-23): Framer for Agencies (HW08), OFF+BRAND client
 * cards (HW02), Framer pricing card beside the headline (HC05), Railway plan
 * card in the hero (HC01), Riverside rating badge (OF02), Aboard and Superpower
 * centred heroes (OF08, OF04), pricing-v3 eyebrow and $5k anchor.
 */

const page = 'relative z-[1] mx-auto max-w-[1180px] px-5 sm:px-8';

function validUntil(p: Proposal) {
  const d = Date.parse(`${p.validUntil}T12:00:00Z`);
  return Number.isFinite(d)
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)
    : p.validUntil;
}

function Logo() {
  // The white wordmark the site header uses on dark heroes; the square mark
  // is indigo and disappears on the electric stage.
  return <img src="/images/loudface-inversed.svg" alt="LoudFace" width={133} height={27} className="h-[26px] w-auto" />;
}

function Eyebrow({ proposal }: { proposal: Proposal }) {
  return (
    <p className="c-eyebrow">
      Prepared for <b>{proposal.preparedFor?.join(', ')}</b>
      <em>Valid until {validUntil(proposal)}</em>
    </p>
  );
}

function PricePill({ proposal }: { proposal: Proposal }) {
  const [amt, ...rest] = (proposal.priceLine ?? '').split(', ');
  return (
    <p className="c-anchor proposal-num">
      <span className="amt">{amt}</span>
      <span className="lbl">{rest.join(', ')}</span>
    </p>
  );
}

const PLATFORM: Record<string, string> = { clutch: 'Clutch', google: 'Google', trustpilot: 'Trustpilot' };
function Ratings({ proposal }: { proposal: Proposal }) {
  const ps = (proposal.proofRail?.platforms ?? []) as any[];
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {ps.map((p) => (
        <li key={p._key} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] text-white ring-1 ring-inset ring-white/15">
          <span className="font-medium">{PLATFORM[p.platform] ?? p.platform}</span>
          <span className="text-amber-300" aria-hidden="true">★</span>
          <span className="proposal-num font-semibold">{Number(p.rating).toFixed(1)}</span>
        </li>
      ))}
    </ul>
  );
}

function Title({ proposal, className = '' }: { proposal: Proposal; className?: string }) {
  return (
    <h1 className={`text-[34px] font-medium leading-[1.04] tracking-[-0.04em] text-white sm:text-[52px] ${className}`}>
      {proposal.title}
    </h1>
  );
}

const RING_NOTE = 'Design and development are part of the retainer, never billed by the hour.';

/* ── H1 · Ring card ─────────────────────────────────────────────────────
   Title, price and ratings on the left; the approved ring on the right in a
   deep night card, so its colours stay exactly as signed off. */
export function HeroRing({ proposal }: { proposal: Proposal }) {
  return (
    <header className="c-electric">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <Logo />
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-14">
          <div className="min-w-0">
            <Eyebrow proposal={proposal} />
            <Title proposal={proposal} className="mt-6 max-w-[18ch]" />
            <PricePill proposal={proposal} />
            <Ratings proposal={proposal} />
          </div>
          <div className="rounded-[24px] bg-night/90 p-5 shadow-[0_30px_60px_-30px_rgba(15,10,60,0.8)] ring-1 ring-white/10 sm:p-6">
            <HowWeWorkRing />
            <p className="mt-1 text-center text-[12.5px] text-white/55">{RING_NOTE}</p>
          </div>
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── H2 · Real work ─────────────────────────────────────────────────────
   Frank asked to see our style. Three real sites from the Figma file in
   browser frames, bleeding off the stage, beside the title and price. */
function Browser({ src, name, className = '' }: { src: string; name: string; className?: string }) {
  return (
    <figure className={`overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-24px_rgba(15,10,60,0.65)] ring-1 ring-black/5 ${className}`}>
      <div className="flex h-7 items-center gap-1.5 border-b border-black/5 bg-surface-50 px-3">
        <span className="h-2 w-2 rounded-full bg-surface-200" />
        <span className="h-2 w-2 rounded-full bg-surface-200" />
        <span className="h-2 w-2 rounded-full bg-surface-200" />
      </div>
      <img src={src} alt={`${name} website, designed by LoudFace`} className="block w-full" />
    </figure>
  );
}
export function HeroWork({ proposal }: { proposal: Proposal }) {
  const [a, b, c] = WORK;
  return (
    <header className="c-electric overflow-hidden">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <Logo />
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0">
            <Eyebrow proposal={proposal} />
            <Title proposal={proposal} className="mt-6 max-w-[16ch]" />
            <PricePill proposal={proposal} />
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/75">{RING_NOTE} A few sites we have designed:</p>
          </div>
          <div className="relative h-[300px] sm:h-[420px]">
            <Browser src={b.src} name={b.name} className="absolute left-[4%] top-[14%] w-[62%] opacity-95" />
            <Browser src={c.src} name={c.name} className="absolute right-[-6%] top-0 w-[58%]" />
            <Browser src={a.src} name={a.name} className="absolute bottom-[-8%] left-[20%] w-[72%]" />
          </div>
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── H3 · Offer card ────────────────────────────────────────────────────
   The price answered in the first screen (rulebook, 2026-07-07): the
   recommended plan as a white card beside the title. */
export function HeroOffer({ proposal }: { proposal: Proposal }) {
  const sections = (proposal.sections ?? []) as any[];
  const pricing = sections.find((s) => s._type === 'pricingTiersSection');
  const tracks = sections.find((s) => s._type === 'tracksSection')?.tracks ?? [];
  const rec = pricing?.tiers?.find((t: any) => t.recommended);
  return (
    <header className="c-electric">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <Logo />
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
          <div className="min-w-0">
            <Eyebrow proposal={proposal} />
            <Title proposal={proposal} className="mt-6 max-w-[18ch]" />
            <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-white/75">{RING_NOTE}</p>
            <Ratings proposal={proposal} />
          </div>
          {rec && (
            <div className="rounded-[24px] bg-white p-6 text-surface-950 shadow-[0_30px_60px_-28px_rgba(15,10,60,0.75)] sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">{rec.name}</span>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-primary-700">Right for Faith</span>
              </div>
              <p className="proposal-num mt-4 text-[52px] font-medium leading-none tracking-[-0.045em]">
                {rec.price}
                <span className="ml-1.5 text-[15px] font-normal tracking-normal text-surface-500">/month</span>
              </p>
              <p className="mt-2 text-[14px] text-surface-600">Capped at three months, $15,000 total. Then we decide together.</p>
              <ul className="mt-5 space-y-2.5 border-t border-surface-200 pt-5">
                {tracks.map((t: any) => (
                  <li key={t._key} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                      </span>
                      {t.label}
                    </span>
                    <span className="proposal-num text-[12.5px] text-surface-500">{t.items?.[0]?.count}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-surface-50 px-3.5 py-2.5 text-[12.5px] text-surface-600">No setup fee, no build fee, no separate design invoice.</p>
            </div>
          )}
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── H4 · Centred ───────────────────────────────────────────────────────
   One column: eyebrow, title, price pill, then the ring large and centred,
   recoloured for the electric stage. */
export function HeroCentred({ proposal }: { proposal: Proposal }) {
  return (
    <header className="c-electric">
      <div className={`${page} pb-12 pt-10 sm:pt-12`}>
        <Logo />
        <div className="mx-auto mt-10 flex max-w-[860px] flex-col items-center text-center">
          <Eyebrow proposal={proposal} />
          <Title proposal={proposal} className="mt-6 max-w-[20ch] text-balance" />
          <PricePill proposal={proposal} />
          <div className="c-ring-electric mt-8 w-full max-w-[640px]">
            <HowWeWorkRing />
          </div>
          <p className="mt-1 text-[12.5px] text-white/60">{RING_NOTE}</p>
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

export const HEROES: Record<string, (p: { proposal: Proposal }) => React.ReactElement> = {
  h1: HeroRing,
  h2: HeroWork,
  h3: HeroOffer,
  h4: HeroCentred,
};
