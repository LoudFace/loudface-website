/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ConceptShell, FIGMA_URL, WORK, plain } from './Shell';

/**
 * A · Instruments. Every section is a heading plus one instrument drawn in the
 * case-chart language: dotted paper, indigo ink, card-less, tabular numbers.
 * References (Mobbin 2026-09-23): Craft Agency number cells (ME08), Wild phase
 * line (TI02), Vizcom before/after columns (PR10), Dovetail "what we
 * recommend" (PR03), Apollo next step (CL12).
 */

const dots = 'c-dots';

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={`text-[22px] font-medium leading-tight tracking-[-0.03em] sm:text-[26px] ${dark ? 'text-white' : 'text-surface-950'}`}>
      {children}
    </h2>
  );
}

function Check({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

export function ConceptA({ proposal }: { proposal: Proposal }) {
  const sections = proposal.sections ?? [];
  const months = (sections.find((s) => s._type === 'monthsSection') as any)?.months ?? [];

  const renderLight = (section: ProposalSection) => {
    const s = section as any;
    const wrap = 'border-b border-surface-950/[0.07] py-12 sm:py-14';

    if (s.heading === 'Where you are') {
      const [today, why] = plain(s.body);
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          <div className={`mt-6 grid overflow-hidden rounded-xl border border-surface-950/[0.08] sm:grid-cols-2 ${dots}`}>
            <div className="p-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-surface-500">Today</p>
              <p className="mt-3 text-[16px] leading-relaxed text-surface-800">{today}</p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-surface-600">{why}</p>
            </div>
            <div className="border-t border-surface-950/[0.08] bg-white/70 p-6 sm:border-l sm:border-t-0">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-primary-700">In 90 days</p>
              <ul className="mt-3 space-y-3">
                {months.map((m: any) => (
                  <li key={m._key} className="flex gap-3">
                    <span className="proposal-num mt-0.5 inline-flex h-[22px] flex-none items-center rounded-[5px] bg-primary-600 px-1.5 text-[12px] font-semibold text-white">
                      {m.label.replace('Month ', 'M')}
                    </span>
                    <span className="text-[15px] leading-snug text-surface-900">{m.proves}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      );
    }

    if (s.heading === 'Our design work') {
      const [, brief] = plain(s.body);
      return (
        <section className={wrap}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <H>{s.heading}</H>
            <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-primary-700 underline-offset-4 hover:underline">
              See every design in Figma →
            </a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            {WORK.map((w) => (
              <figure key={w.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.src} alt={`${w.name} website design`} className="aspect-[16/10] w-full rounded-lg border border-surface-950/[0.08] object-cover object-top" />
                <figcaption className="mt-2 flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="font-medium text-surface-950">{w.name}</span>
                  <span className="text-surface-500">{w.kind}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-[15px] leading-relaxed text-surface-700">{brief}</p>
        </section>
      );
    }

    if (s._type === 'tracksSection') {
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className={`mt-6 grid rounded-xl border border-surface-950/[0.08] sm:grid-cols-3 ${dots}`}>
            {s.tracks.map((t: any, i: number) => (
              <div key={t._key} className={`p-5 ${i > 0 ? 'border-t border-surface-950/[0.08] sm:border-l sm:border-t-0' : ''}`}>
                <p className="proposal-num text-[24px] font-medium leading-none tracking-[-0.03em] text-primary-600">{t.items[0]?.count}</p>
                <p className="mt-2 text-[15px] font-medium text-surface-950">{t.label}</p>
                <ul className="mt-4 space-y-2 border-t border-surface-950/[0.08] pt-4">
                  {t.items.map((it: any, j: number) => (
                    <li key={it._key} className="flex items-start gap-2 text-[14px] leading-snug text-surface-800">
                      <Check className="mt-[3px] text-primary-600" />
                      <span>
                        {it.text}
                        {j > 0 && it.count && <span className="proposal-num mt-0.5 block text-[12px] text-surface-500">{it.count}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (s.heading === 'What you asked on the call') {
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          <dl className="mt-6 divide-y divide-surface-950/[0.08] border-y border-surface-950/[0.08]">
            {s.items.map((it: any) => (
              <div key={it._key} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-8">
                <dt className="text-[16px] font-medium leading-snug text-surface-950">{it.lead}</dt>
                <dd className="text-[15px] leading-relaxed text-surface-700">{it.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }

    if (s._type === 'monthsSection') {
      // A rising phase line: each month's node sits higher than the last.
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className={`mt-6 rounded-xl border border-surface-950/[0.08] p-5 ${dots}`}>
            <svg viewBox="0 0 600 70" className="hidden h-[70px] w-full sm:block" preserveAspectRatio="none" aria-hidden="true">
              <polyline points="0,62 100,56 300,34 500,10 600,4" fill="none" stroke="var(--color-primary-600)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="grid gap-6 sm:-mt-2 sm:grid-cols-3">
              {s.months.map((m: any) => (
                <div key={m._key}>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-primary-700">{m.label}</p>
                  <p className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-surface-950">{m.title}</p>
                  <ul className="mt-3 space-y-1.5">
                    {m.items.map((it: string) => (
                      <li key={it} className="text-[13.5px] leading-snug text-surface-700">{it}</li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-lg bg-primary-50 px-3 py-2 text-[13px] leading-snug text-primary-900">
                    <span className="font-semibold">Proves: </span>
                    {m.proves}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {s.note && <p className="mt-4 text-[14.5px] text-surface-600">{s.note}</p>}
        </section>
      );
    }

    if (s.heading === 'How we measure') {
      const label = (it: any) => it.lead ?? 'Every Friday';
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-surface-950/[0.08] bg-surface-950/[0.08] sm:grid-cols-2">
            {s.items.map((it: any, i: number) => (
              <div key={it._key} className={`p-5 ${i === 0 ? 'bg-primary-600 text-white' : 'bg-surface-50'}`}>
                <p className={`text-[22px] font-medium leading-tight tracking-[-0.03em] ${i === 0 ? 'text-white' : 'text-surface-950'}`}>{label(it)}</p>
                <p className={`mt-3 text-[14px] leading-relaxed ${i === 0 ? 'text-white/80' : 'text-surface-600'}`}>{it.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    return null;
  };

  const renderDark = (section: ProposalSection) => {
    const s = section as any;
    if (s._type === 'pricingTiersSection') {
      const rec = s.tiers.find((t: any) => t.recommended) ?? s.tiers[0];
      const others = s.tiers.filter((t: any) => t !== rec);
      return (
        <section className="grid gap-10 border-b border-white/12 py-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <H dark>{s.heading}</H>
            <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.08em] text-primary-200">We recommend</p>
            <p className="mt-1 text-[20px] font-medium text-white">{rec.name}</p>
            <p className="proposal-num mt-2 text-[56px] font-medium leading-none tracking-[-0.04em] text-white">
              {rec.price}
              <span className="ml-2 text-[16px] font-normal tracking-normal text-white/60">{rec.cadence}</span>
            </p>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-white/70">{s.note}</p>
          </div>
          {/* Each back tier keeps a full 40px row visible above the front card
              (a stack tuned for white-on-white hides them on a dark ground). */}
          <div className="relative" style={{ paddingTop: `${others.length * 40}px` }}>
            {others.map((t: any, i: number) => (
              <div
                key={t._key}
                className="absolute rounded-2xl border border-white/15 bg-white/[0.06] px-5 pb-8 pt-2.5"
                style={{ top: `${i * 40}px`, left: `${(others.length - i) * 14}px`, right: `${(others.length - i) * 14}px` }}
              >
                <div className="flex items-baseline justify-between text-[13px] text-white/60">
                  <span>{t.name}</span>
                  <span className="proposal-num">{t.price}</span>
                </div>
              </div>
            ))}
            <div className="relative rounded-2xl bg-white p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-medium text-surface-950">{rec.name}</span>
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-primary-700">Recommended</span>
              </div>
              <p className="proposal-num mt-3 text-[30px] font-medium tracking-[-0.03em] text-surface-950">{rec.price}<span className="ml-1 text-[13px] font-normal text-surface-500">/mo</span></p>
              <p className="mt-3 text-[14px] leading-relaxed text-surface-600">{rec.description}</p>
              <p className="mt-4 border-t border-surface-200 pt-3 text-[13px] text-surface-500">{s.anchor}</p>
            </div>
          </div>
        </section>
      );
    }
    if (s.heading === 'Terms and next step') {
      return (
        <section className="grid gap-8 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <H dark>{s.heading}</H>
            <p className="mt-3 text-[15px] text-white/60">Reply to my email with a yes.</p>
          </div>
          <dl className="divide-y divide-white/12 border-y border-white/12">
            {s.items.map((it: any) => (
              <div key={it._key} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-[14.5px] font-medium text-white">{it.lead}</dt>
                <dd className="text-[14.5px] leading-relaxed text-white/65">{it.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }
    return null;
  };

  return <ConceptShell proposal={proposal} concept="a" renderLight={renderLight} renderDark={renderDark} />;
}
