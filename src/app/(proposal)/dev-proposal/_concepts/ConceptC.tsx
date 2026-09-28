/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ConceptShell, FIGMA_URL, WORK, plain } from './Shell';

/**
 * C · Soft cards. Arnel's stated web taste: tinted low-chroma panels holding
 * white cards, real work at true scale, friendly and dense. Frank's own
 * questions render as the chat they were.
 * References (Mobbin 2026-09-23): Superpower "what's included" card (WH05,
 * WH11), Humble stepped roadmap (TI11), Figma quote bubbles (PR04), Intercom
 * next-step cards (CL04), Circle/Homerun pricing (PR10, PR12). Code harvest:
 * Aceternity BentoGrid (layout) and FocusCards (hover, rebuilt in CSS).
 */

const panel = 'mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4';
const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={`text-[22px] font-medium leading-tight tracking-[-0.03em] sm:text-[26px] ${dark ? 'text-white' : 'text-surface-950'}`}>
      {children}
    </h2>
  );
}

function Tick() {
  return (
    <span className="mt-[2px] flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary-100 text-primary-700">
      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </span>
  );
}

const ICONS = [
  <path key="a" d="M4 5h16v11H4zM9 20h6M12 16v4" />,
  <path key="b" d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />,
  <path key="c" d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5" />,
  <path key="d" d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
];
function Icon({ i }: { i: number }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[i % ICONS.length]}
      </svg>
    </span>
  );
}

export function ConceptC({ proposal, hero }: { proposal: Proposal; hero?: React.ReactNode }) {
  const sections = proposal.sections ?? [];
  const months = (sections.find((s) => s._type === 'monthsSection') as any)?.months ?? [];

  const renderLight = (section: ProposalSection) => {
    const s = section as any;
    const wrap = 'py-12 sm:py-14';

    if (s.heading === 'Where you are') {
      const [a, b] = plain(s.body);
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          <div className={`${panel} grid gap-3 sm:grid-cols-[1.15fr_1fr]`}>
            <div className={`${card} p-6`}>
              <p className="text-[12.5px] font-medium text-surface-500">Today</p>
              <p className="mt-2 text-[17px] leading-relaxed text-surface-900">{a}</p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-surface-600">{b}</p>
            </div>
            <div className={`${card} p-6`}>
              <p className="text-[12.5px] font-medium text-primary-700">Where we take it</p>
              <ul className="mt-3 space-y-3">
                {months.map((m: any) => (
                  <li key={m._key} className="flex gap-2.5 text-[15px] leading-snug text-surface-900">
                    <Tick />
                    <span>
                      {m.proves}
                      <span className="block text-[12.5px] text-surface-500">{m.label}</span>
                    </span>
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
          <H>{s.heading}</H>
          <div className={panel}>
            <div className="c-focus grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
              {WORK.slice(0, 5).map((w, i) => (
                <figure key={w.name} className={`c-focus-item ${card} overflow-hidden ${i === 0 ? 'col-span-2 sm:row-span-2' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.src} alt={`${w.name} website design`} className={`w-full object-cover object-left-top ${i === 0 ? 'aspect-[16/10] sm:h-[calc(100%-40px)] sm:aspect-auto' : 'aspect-[16/10]'}`} />
                  <figcaption className="flex h-10 items-center justify-between gap-2 truncate px-3 text-[12.5px]">
                    <span className="truncate font-medium text-surface-950">{w.name}</span>
                    {i === 0 && <span className="text-surface-500">{w.kind}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
              <p className="text-[14.5px] leading-relaxed text-surface-700">{brief}</p>
              <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-surface-950 px-4 py-2 text-[13.5px] font-medium text-white">
                Open the Figma file
              </a>
            </div>
          </div>
        </section>
      );
    }

    if (s._type === 'tracksSection') {
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
            {s.tracks.map((t: any, i: number) => (
              <div key={t._key} className={`${card} p-5`}>
                <Icon i={i} />
                <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{t.label}</p>
                <span className="proposal-num mt-1.5 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium text-primary-700">{t.items[0]?.count}</span>
                <ul className="mt-4 space-y-2.5">
                  {t.items.map((it: any, j: number) => (
                    <li key={it._key} className="flex gap-2.5 text-[14px] leading-snug text-surface-800">
                      <Tick />
                      <span>
                        {it.text}
                        {j > 0 && it.count && <span className="proposal-num block text-[12px] text-surface-500">{it.count}</span>}
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
      const first = proposal.preparedFor?.[0]?.split(' ')[0] ?? 'You';
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          <div className={`${panel} space-y-5 px-4 py-6 sm:px-6`}>
            {s.items.map((it: any) => (
              <div key={it._key} className="space-y-2.5">
                <div className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-200 text-[12px] font-semibold text-surface-700">{first[0]}</span>
                  <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] font-medium text-surface-950 shadow-[0_1px_2px_rgba(10,10,10,0.05)]">
                    {it.lead}
                  </p>
                </div>
                <div className="flex items-end justify-end gap-2.5">
                  <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary-600 px-4 py-2.5 text-[14.5px] leading-relaxed text-white">{it.text}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/lf-logo.svg" alt="LoudFace" className="h-8 w-8 flex-none rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (s._type === 'monthsSection') {
      // Stepped: each month's card starts higher than the last, so the row
      // itself reads as growth.
      const lift = ['sm:mt-16', 'sm:mt-8', 'sm:mt-0'];
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className={`${panel} grid items-start gap-3 sm:grid-cols-3`}>
            {s.months.map((m: any, i: number) => (
              <div key={m._key} className={`${card} p-5 ${lift[i] ?? ''} ${i === 2 ? 'ring-1 ring-primary-600' : ''}`}>
                <p className="text-[12.5px] font-medium text-primary-700">{m.label}</p>
                <p className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-surface-950">{m.title}</p>
                <ul className="mt-3 space-y-1.5">
                  {m.items.map((it: string) => (
                    <li key={it} className="text-[13.5px] leading-snug text-surface-700">{it}</li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl bg-primary-50 px-3 py-2.5 text-[13px] leading-snug text-primary-900">{m.proves}</p>
              </div>
            ))}
          </div>
          {s.note && <p className="mt-4 text-[14.5px] text-surface-600">{s.note}</p>}
        </section>
      );
    }

    if (s.heading === 'How we measure') {
      return (
        <section className={wrap}>
          <H>{s.heading}</H>
          {s.intro && <p className="mt-2 text-[15px] text-surface-600">{s.intro}</p>}
          <div className={`${panel} grid gap-3 sm:grid-cols-2`}>
            {s.items.map((it: any, i: number) => (
              <div key={it._key} className={`${card} flex gap-4 p-5`}>
                <Icon i={i === 0 ? 3 : i === 1 ? 2 : i === 2 ? 0 : 1} />
                <div>
                  <p className="text-[15.5px] font-semibold text-surface-950">{it.lead ?? 'Every Friday'}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-surface-600">{it.text}</p>
                </div>
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
      const num = (t: any) => Number(String(t.price).replace(/[^\d]/g, ''));
      const rec = s.tiers.filter((t: any) => t.recommended);
      const tiers = [...rec, ...s.tiers.filter((t: any) => !t.recommended).sort((a: any, b: any) => num(a) - num(b))];
      return (
        <section className="py-14">
          <H dark>{s.heading}</H>
          <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-white/70">{s.anchor}</p>
          <div className="mt-7 grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr]">
            {tiers.map((t: any) => (
              <div
                key={t._key}
                className={`rounded-2xl p-6 ${t.recommended ? 'bg-primary-600 text-white shadow-[0_24px_48px_-24px_rgba(79,57,246,0.8)]' : 'border border-white/12 bg-white/[0.05] text-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium">{t.name}</span>
                  {t.recommended && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">Right for Faith</span>}
                </div>
                <p className={`proposal-num mt-4 font-medium leading-none tracking-[-0.04em] ${t.recommended ? 'text-[48px]' : 'text-[30px] text-white/85'}`}>{t.price}</p>
                <p className={`mt-1 text-[13px] ${t.recommended ? 'text-white/75' : 'text-white/50'}`}>{t.cadence}</p>
                <p className={`mt-4 text-[14px] leading-relaxed ${t.recommended ? 'text-white/90' : 'text-white/55'}`}>{t.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed text-white/70">{s.note}</p>
        </section>
      );
    }
    if (s.heading === 'Terms and next step') {
      return (
        <section className="border-t border-white/12 pb-16 pt-14">
          <H dark>{s.heading}</H>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {s.items.map((it: any) => {
                const next = it.lead?.startsWith('Next');
                return (
                  <div key={it._key} className={`rounded-2xl p-5 ${next ? 'bg-white text-surface-950' : 'bg-white/[0.05] text-white'}`}>
                    <p className="text-[15px] font-semibold">{it.lead}</p>
                    <p className={`mt-1.5 text-[14px] leading-relaxed ${next ? 'text-surface-600' : 'text-white/60'}`}>{it.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    return null;
  };

  return <ConceptShell proposal={proposal} concept="c" renderLight={renderLight} renderDark={renderDark} hero={hero} />;
}
