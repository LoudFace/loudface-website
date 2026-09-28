/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ConceptShell, FIGMA_URL, WORK, plain } from './Shell';

/**
 * B · Big type. Frank skims, so the type carries each section: one large
 * sentence per section, detail underneath in small grey, lots of air.
 * References (Mobbin 2026-09-23): Dropbox two-tone pull quote (PR01),
 * Analogue oversized numeral (ME12), Equals (WH10), Coda and Square closes
 * (CL07, CL03), Typeform quote (PR11).
 */

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={`text-[14px] font-medium tracking-[-0.01em] ${dark ? 'text-primary-200' : 'text-primary-700'}`}>{children}</h2>
  );
}

const big = 'text-[28px] font-medium leading-[1.18] tracking-[-0.035em] sm:text-[36px]';

export function ConceptB({ proposal }: { proposal: Proposal }) {
  const renderLight = (section: ProposalSection) => {
    const s = section as any;
    const wrap = 'border-b border-surface-950/[0.07] py-14 sm:py-20';

    if (s.heading === 'Where you are') {
      const [a, b] = plain(s.body);
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <p className={`mt-5 ${big}`}>
            <span className="text-surface-950">{a} </span>
            <span className="text-surface-400">{b}</span>
          </p>
        </section>
      );
    }

    if (s.heading === 'Our design work') {
      const [, brief] = plain(s.body);
      const [lead, ...rest] = WORK;
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <p className={`mt-5 ${big} text-surface-950`}>
            Everything we have designed,{' '}
            <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline decoration-primary-200 decoration-2 underline-offset-[6px] hover:decoration-primary-600">
              in one file
            </a>
            .
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lead.src} alt={`${lead.name} website design`} className="mt-8 aspect-[16/10] w-full rounded-xl border border-surface-950/[0.08] object-cover object-top" />
          <div className="mt-3 grid grid-cols-5 gap-3">
            {rest.map((w) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={w.name} src={w.src} alt={`${w.name} website design`} className="aspect-[16/10] w-full rounded-md border border-surface-950/[0.08] object-cover object-top" />
            ))}
          </div>
          <p className="mt-6 text-[16px] leading-relaxed text-surface-600">{brief}</p>
        </section>
      );
    }

    if (s._type === 'tracksSection') {
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <p className={`mt-5 ${big} text-surface-950`}>{s.intro}</p>
          <div className="mt-8 divide-y divide-surface-950/[0.08] border-y border-surface-950/[0.08]">
            {s.tracks.map((t: any) => (
              <div key={t._key} className="grid gap-3 py-6 sm:grid-cols-[220px_1fr] sm:gap-8">
                <div>
                  <p className="text-[22px] font-medium tracking-[-0.03em] text-surface-950">{t.label}</p>
                  <p className="proposal-num mt-1 text-[13.5px] font-medium text-primary-600">{t.items[0]?.count}</p>
                </div>
                <p className="text-[16px] leading-[1.7] text-surface-600">
                  {t.items.map((it: any) => it.text).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (s.heading === 'What you asked on the call') {
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <div className="mt-5 space-y-10">
            {s.items.map((it: any) => (
              <div key={it._key}>
                <p className="text-[24px] font-medium leading-snug tracking-[-0.03em] text-surface-950 sm:text-[28px]">“{it.lead}”</p>
                <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-surface-600">{it.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (s._type === 'monthsSection') {
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <p className={`mt-5 ${big} text-surface-950`}>{s.intro}</p>
          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {s.months.map((m: any, i: number) => (
              <div key={m._key}>
                <p className="proposal-num text-[88px] font-medium leading-[0.8] tracking-[-0.06em] text-primary-600">{i + 1}</p>
                <p className="mt-5 text-[20px] font-medium tracking-[-0.02em] text-surface-950">{m.title}</p>
                <p className="mt-2 text-[15px] leading-snug text-surface-800">{m.proves}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-surface-500">{m.items.join(' · ')}</p>
              </div>
            ))}
          </div>
          {s.note && <p className="mt-10 text-[15px] text-surface-600">{s.note}</p>}
        </section>
      );
    }

    if (s.heading === 'How we measure') {
      return (
        <section className={wrap}>
          <Label>{s.heading}</Label>
          <p className={`mt-5 ${big} text-surface-950`}>{s.intro}</p>
          <ul className="mt-8 space-y-4">
            {s.items.map((it: any) => (
              <li key={it._key} className="text-[18px] leading-relaxed text-surface-600">
                {it.lead && <span className="font-medium text-surface-950">{it.lead} </span>}
                {it.text}
              </li>
            ))}
          </ul>
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
        <section className="border-b border-white/12 py-16 sm:py-24">
          <Label dark>{s.heading}</Label>
          <p className="proposal-num mt-6 text-[72px] font-medium leading-[0.9] tracking-[-0.055em] text-white sm:text-[128px]">{rec.price}</p>
          <p className="mt-4 text-[22px] font-medium tracking-[-0.02em] text-white sm:text-[28px]">a month, for three months. Then we decide together.</p>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-white/60">{s.anchor}</p>
          <p className="mt-8 text-[14px] text-white/45">
            Also available: {others.map((t: any) => `${t.name} ${t.price}`).join(' · ')} per month.
          </p>
        </section>
      );
    }
    if (s.heading === 'Terms and next step') {
      const next = s.items.find((it: any) => it.lead?.startsWith('Next'));
      const terms = s.items.filter((it: any) => it !== next);
      return (
        <section className="py-16 sm:py-24">
          <Label dark>{s.heading}</Label>
          <p className="mt-6 text-[44px] font-medium leading-none tracking-[-0.045em] text-white sm:text-[64px]">Reply with a yes.</p>
          {/* The headline already says "reply with a yes"; the line under it
              carries only what happens after, from the same term. */}
          {next && (
            <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-white/65">
              {(() => {
                const rest = next.text.replace(/^reply to my email with a yes,\s*/i, '');
                return rest.charAt(0).toUpperCase() + rest.slice(1);
              })()}
            </p>
          )}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {terms.map((it: any) => (
              <div key={it._key} className="border-t border-white/15 pt-4">
                <p className="text-[15px] font-medium text-white">{it.lead}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/55">{it.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    return null;
  };

  return <ConceptShell proposal={proposal} concept="b" renderLight={renderLight} renderDark={renderDark} />;
}
