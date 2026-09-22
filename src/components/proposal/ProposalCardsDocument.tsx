import type { ReactNode } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ProofRail, ProofSection, isProofSection } from './ProposalSocialProof';
import { ProposalCaseProof } from './ProposalCaseProof';
import { PlateDefs } from './ProposalFigures';
import { ProposalLogoStrip } from './ProposalLogoStrip';
import { ProposalOfferStreams } from './ProposalOfferStreams';
import { SectionBody } from './ProposalDocument';

/**
 * The card layout (Arnel's pick, 2026-09-23), opted into per proposal with
 * `design: 'cards'`. Everything sent before it keeps ProposalDocument.
 *
 * Hero: the electric indigo stage from /pricing (rulebook hero tonality law),
 * two columns: prepared-for pill, title, price, two promises on the left; the
 * two-streams visual on the right. The review ratings were dropped from the
 * hero on Arnel's call; the rail below still carries them.
 *
 * Body: each section is a heading plus one tinted panel holding white cards.
 * Shapes are chosen from the section's TYPE and CONTENT, never its heading,
 * so any proposal renders:
 *   richTextSection  a Figma link inside → the design-work mosaic;
 *                    the first one, when a monthsSection exists → Today card
 *                    beside the three monthly outcomes; otherwise one card.
 *   tracksSection    three white cards, icon, cadence pill, checklist.
 *   bulletListSection every item a question → the call as a chat;
 *                    otherwise a 2×2 of cards.
 *   monthsSection    three cards stepping upward, the last one ringed.
 *   pricing (dark)   the recommended tier as a filled electric card.
 *   bullets (dark)   terms as cards, the "Next step" one in white.
 * Anything else falls back to the classic block inside a card.
 */

const page = 'mx-auto max-w-[1180px] px-5 sm:px-8';
const panel = 'mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4';
const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';

const PROMISES = ['No designer or developer to hire', 'Measured in leads, not traffic'];

/* Our own client work from the design-samples Figma file, first screen each. */
const WORK = [
  { src: '/images/proposal-work/eve-roque.jpg', name: 'Eve & Roque', kind: 'Venues' },
  { src: '/images/proposal-work/brandfirm.jpg', name: 'Brandfirm', kind: 'Agency' },
  { src: '/images/proposal-work/ground-up.jpg', name: 'Ground Up', kind: 'Coffee & tea' },
  { src: '/images/proposal-work/urban-umbrella.jpg', name: 'Urban Umbrella', kind: 'Construction' },
  { src: '/images/proposal-work/reiterate.jpg', name: 'Reiterate', kind: 'Finance software' },
];

type Sec<T extends ProposalSection['_type']> = Extract<ProposalSection, { _type: T }>;
type Block = PortableTextBlock & { children?: { text?: string; marks?: string[] }[]; markDefs?: { _key: string; href?: string }[] };

const textOf = (b: Block) => (b.children ?? []).map((c) => c.text ?? '').join('');
const linkIn = (blocks: Block[] | undefined, host: string) =>
  (blocks ?? []).flatMap((b) => b.markDefs ?? []).find((m) => m.href?.includes(host))?.href;

const ptc: PortableTextComponents = {
  block: { normal: ({ children }) => <p className="text-[15px] leading-relaxed text-surface-700 [&+p]:mt-3">{children}</p> },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} rel="noopener noreferrer" target="_blank" className="font-medium text-primary-700 underline underline-offset-4">
        {children}
      </a>
    ),
  },
};

function H({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
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
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-600">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[i % ICONS.length]}
      </svg>
    </span>
  );
}

function validUntil(value: string) {
  const d = Date.parse(`${value}T12:00:00Z`);
  return Number.isFinite(d)
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)
    : value;
}

/* ── hero ─────────────────────────────────────────────────────────────── */
function Hero({ proposal }: { proposal: Proposal }) {
  const [amt, ...rest] = (proposal.priceLine ?? '').split(', ');
  return (
    <header className="pc-electric overflow-hidden text-white">
      <div className={`relative z-[1] ${page} pb-12 pt-10 sm:pt-12`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/loudface-inversed.svg" alt="LoudFace" width={133} height={27} className="h-[26px] w-auto" />
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="min-w-0">
            {proposal.preparedFor && proposal.preparedFor.length > 0 && (
              <p className="pc-eyebrow">
                Prepared for <b>{proposal.preparedFor.join(', ')}</b>
                {proposal.validUntil && <em>Valid until {validUntil(proposal.validUntil)}</em>}
              </p>
            )}
            <h1 className="mt-6 max-w-[16ch] text-[34px] font-medium leading-[1.04] tracking-[-0.04em] sm:text-[50px]">
              {proposal.title}
            </h1>
            {proposal.priceLine && (
              <p data-proposal-pricing data-proposal-section="Price line" data-proposal-type="priceLine" className="pc-anchor proposal-num">
                <span className="amt">{amt}</span>
                {rest.length > 0 && <span className="lbl">{rest.join(', ')}</span>}
              </p>
            )}
            <ul className="mt-6 space-y-2">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[15px] font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <ProposalOfferStreams />
          </div>
        </div>
        <ProposalLogoStrip />
      </div>
    </header>
  );
}

/* ── light sections ───────────────────────────────────────────────────── */
function RichText({ section, months, isFirst }: { section: Sec<'richTextSection'>; months: Sec<'monthsSection'>['months']; isFirst: boolean }) {
  const blocks = (section.body ?? []) as Block[];
  const figma = linkIn(blocks, 'figma.com');

  if (figma) {
    // The paragraph holding the link is the lead-in; the rest is the brief.
    const brief = blocks.filter((b) => !(b.markDefs ?? []).some((m) => m.href === figma)).map(textOf);
    return (
      <div className={panel}>
        <div className="pc-focus grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
          {WORK.map((w, i) => (
            <figure key={w.name} className={`pc-focus-item m-0 overflow-hidden ${card} ${i === 0 ? 'col-span-2 sm:row-span-2' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={w.src}
                alt={`${w.name} website, designed by LoudFace`}
                loading="lazy"
                className={`w-full object-cover object-left-top ${i === 0 ? 'aspect-[16/10] sm:aspect-auto sm:h-[calc(100%-40px)]' : 'aspect-[16/10]'}`}
              />
              <figcaption className="flex h-10 items-center justify-between gap-2 px-3 text-[12.5px]">
                <span className="truncate font-medium text-surface-950">{w.name}</span>
                {i === 0 && <span className="text-surface-500">{w.kind}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
          <div className="max-w-[60ch] space-y-1 text-[14.5px] leading-relaxed text-surface-700">
            {brief.map((t) => <p key={t}>{t}</p>)}
          </div>
          <a href={figma} target="_blank" rel="noopener noreferrer" className="rounded-full bg-surface-950 px-4 py-2 text-[13.5px] font-medium text-white">
            Open the Figma file
          </a>
        </div>
      </div>
    );
  }

  if (isFirst && months && months.length > 0) {
    const [lead, ...rest] = blocks.map(textOf);
    return (
      <div className={`${panel} grid gap-3 sm:grid-cols-[1.15fr_1fr]`}>
        <div className={`${card} p-6`}>
          <p className="text-[12.5px] font-medium text-surface-500">Today</p>
          <p className="mt-2 text-[17px] leading-relaxed text-surface-900">{lead}</p>
          {rest.map((t) => (
            <p key={t} className="mt-3 text-[14.5px] leading-relaxed text-surface-600">{t}</p>
          ))}
        </div>
        <div className={`${card} p-6`}>
          <p className="text-[12.5px] font-medium text-primary-700">Where we take it</p>
          <ul className="mt-3 space-y-3">
            {months.map((m) => (
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
    );
  }

  return (
    <div className={panel}>
      <div className={`${card} p-6`}>
        <PortableText value={blocks} components={ptc} />
      </div>
    </div>
  );
}

function Tracks({ section }: { section: Sec<'tracksSection'> }) {
  const tracks = (section.tracks ?? []).filter((t) => (t.items ?? []).length > 0);
  return (
    <>
      {section.intro && <p className="mt-2 text-[15px] text-surface-600">{section.intro}</p>}
      <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
        {tracks.map((t, i) => (
          <div key={t._key} className={`${card} p-5`}>
            <Icon i={i} />
            <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{t.label}</p>
            {t.items?.[0]?.count && (
              <span className="proposal-num mt-1.5 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium text-primary-700">
                {t.items[0].count}
              </span>
            )}
            <ul className="mt-4 space-y-2.5">
              {(t.items ?? []).map((it, j) => (
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
    </>
  );
}

function Bullets({ section, clientName }: { section: Sec<'bulletListSection'>; clientName: string }) {
  const items = section.items ?? [];
  const asked = items.length > 0 && items.every((it) => it.lead?.trim().endsWith('?'));
  if (asked) {
    const initial = (clientName || '?').trim()[0];
    return (
      <div className={`${panel} space-y-5 px-4 py-6 sm:px-6`}>
        {items.map((it) => (
          <div key={it._key} className="space-y-2.5">
            <div className="flex items-end gap-2.5">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-200 text-[12px] font-semibold text-surface-700">
                {initial}
              </span>
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
    );
  }
  return (
    <>
      {section.intro && <p className="mt-2 text-[15px] text-surface-600">{section.intro}</p>}
      <div className={`${panel} grid gap-3 sm:grid-cols-2`}>
        {items.map((it, i) => (
          <div key={it._key} className={`${card} flex gap-4 p-5`}>
            <Icon i={[3, 2, 0, 1][i % 4]} />
            <div>
              {it.lead && <p className="text-[15.5px] font-semibold text-surface-950">{it.lead}</p>}
              <p className={`${it.lead ? 'mt-1' : ''} text-[14px] leading-relaxed text-surface-600`}>{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Months({ section }: { section: Sec<'monthsSection'> }) {
  const months = section.months ?? [];
  const lift = ['sm:mt-16', 'sm:mt-8', 'sm:mt-0'];
  return (
    <>
      {section.intro && <p className="mt-2 text-[15px] text-surface-600">{section.intro}</p>}
      <div className={`${panel} grid items-start gap-3 sm:grid-cols-3`}>
        {months.map((m, i) => (
          <div key={m._key} className={`${card} p-5 ${months.length === 3 ? lift[i] : ''} ${i === months.length - 1 ? 'ring-1 ring-primary-600' : ''}`}>
            <p className="text-[12.5px] font-medium text-primary-700">{m.label}</p>
            <p className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-surface-950">{m.title}</p>
            <ul className="mt-3 space-y-1.5">
              {(m.items ?? []).map((it) => (
                <li key={it} className="text-[13.5px] leading-snug text-surface-700">{it}</li>
              ))}
            </ul>
            {m.proves && <p className="mt-4 rounded-xl bg-primary-50 px-3 py-2.5 text-[13px] leading-snug text-primary-900">{m.proves}</p>}
          </div>
        ))}
      </div>
      {section.note && <p className="mt-4 text-[14.5px] text-surface-600">{section.note}</p>}
    </>
  );
}

/* ── dark close ───────────────────────────────────────────────────────── */
function Pricing({ section, clientName }: { section: Sec<'pricingTiersSection'>; clientName: string }) {
  const num = (p?: string) => Number(String(p ?? '').replace(/[^\d]/g, '')) || 0;
  const tiers = section.tiers ?? [];
  const ordered = [...tiers.filter((t) => t.recommended), ...tiers.filter((t) => !t.recommended).sort((a, b) => num(a.price) - num(b.price))];
  const short = clientName.split(' ')[0];
  return (
    <>
      {section.anchor && <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-white/70">{section.anchor}</p>}
      <div className="mt-7 grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr]">
        {ordered.map((t) => (
          <div
            key={t._key}
            data-print-keep
            className={`rounded-2xl p-6 ${t.recommended ? 'bg-primary-600 text-white shadow-[0_24px_48px_-24px_rgba(79,57,246,0.8)]' : 'border border-white/12 bg-white/[0.05] text-white'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-medium">{t.name}</span>
              {t.recommended && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">Right for {short}</span>}
            </div>
            <p className={`proposal-num mt-4 font-medium leading-none tracking-[-0.04em] ${t.recommended ? 'text-[48px]' : 'text-[30px] text-white/85'}`}>{t.price}</p>
            {t.cadence && <p className={`mt-1 text-[13px] ${t.recommended ? 'text-white/75' : 'text-white/50'}`}>{t.cadence}</p>}
            {t.description && <p className={`mt-4 text-[14px] leading-relaxed ${t.recommended ? 'text-white/90' : 'text-white/55'}`}>{t.description}</p>}
          </div>
        ))}
      </div>
      {section.note && <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed text-white/70">{section.note}</p>}
    </>
  );
}

function Terms({ section }: { section: Sec<'bulletListSection'> }) {
  return (
    <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {(section.items ?? []).map((it) => {
          const next = it.lead?.toLowerCase().startsWith('next');
          return (
            <div key={it._key} className={`rounded-2xl p-5 ${next ? 'bg-white text-surface-950' : 'bg-white/[0.05] text-white'}`}>
              {it.lead && <p className="text-[15px] font-semibold">{it.lead}</p>}
              <p className={`mt-1.5 text-[14px] leading-relaxed ${next ? 'text-surface-600' : 'text-white/60'}`}>{it.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── document ─────────────────────────────────────────────────────────── */
export function ProposalCardsDocument({ proposal }: { proposal: Proposal }) {
  const sections = proposal.sections ?? [];
  const firstDark = sections.findIndex((s) => (s as { band?: string }).band === 'dark');
  const railEnd = firstDark === -1 ? sections.length : firstDark;
  const months = (sections.find((s) => s._type === 'monthsSection') as Sec<'monthsSection'> | undefined)?.months;
  const firstRich = sections.findIndex((s) => s._type === 'richTextSection');
  const clips = (proposal.clipStrip?.clips ?? []).filter((c) => c.videoUrl || c.posterUrl || c.name);
  const rail = proposal.proofRail;
  const hasRail = Boolean((rail?.platforms?.length ?? 0) > 0 || (rail?.quotes?.length ?? 0) > 0 || clips.length > 0);

  const light = (section: ProposalSection, index: number) => {
    if (section._type === 'caseProofSection') {
      return (
        <ProposalCaseProof
          key={section._key}
          heading={section.heading}
          intro={section.intro}
          slugs={section.slugs}
          chartsPerCase={section.chartsPerCase}
          index={index}
        />
      );
    }
    if (isProofSection(section)) return <ProofSection key={section._key} section={section} index={index} boxed />;
    let body: ReactNode;
    switch (section._type) {
      case 'richTextSection':
        body = <RichText section={section} months={months} isFirst={index === firstRich} />;
        break;
      case 'tracksSection':
        body = <Tracks section={section} />;
        break;
      case 'bulletListSection':
        body = <Bullets section={section} clientName={proposal.preparedFor?.[0] ?? proposal.clientName} />;
        break;
      case 'monthsSection':
        body = <Months section={section} />;
        break;
      default:
        body = (
          <div className={panel}>
            <div className={`${card} p-5 sm:p-6`}>
              <SectionBody section={section} clientName={proposal.clientName} />
            </div>
          </div>
        );
    }
    return (
      <section
        key={section._key}
        id={`section-${index + 1}`}
        data-proposal-section={section.heading || section._type}
        data-proposal-type={section._type}
        className="py-12 sm:py-14"
      >
        {section.heading && <H>{section.heading}</H>}
        {body}
      </section>
    );
  };

  const dark = (section: ProposalSection, index: number, first: boolean) => {
    let body: ReactNode;
    if (section._type === 'pricingTiersSection') body = <Pricing section={section} clientName={proposal.clientName} />;
    else if (section._type === 'bulletListSection') body = <Terms section={section} />;
    else body = <SectionBody section={section} clientName={proposal.clientName} dark />;
    return (
      <section
        key={section._key}
        id={`section-${index + 1}`}
        data-proposal-section={section.heading || section._type}
        data-proposal-type={section._type}
        data-proposal-pricing={section._type === 'pricingTiersSection' ? '' : undefined}
        className={`py-14 ${first ? '' : 'border-t border-white/12'}`}
      >
        {section.heading && <H dark>{section.heading}</H>}
        {body}
      </section>
    );
  };

  return (
    <main className="pb-0">
      <PlateDefs />
      <Hero proposal={proposal} />

      <div className={page}>
        <div className={hasRail ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_328px] lg:gap-14' : ''}>
          <div className="min-w-0">{sections.slice(0, railEnd).map((s, i) => light(s, i))}</div>
          {hasRail && (
            <aside data-proposal-rail="aside" className="hidden lg:block">
              <div className="sticky top-8 mt-10">
                <ProofRail rail={rail} clips={clips} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {railEnd < sections.length && (
        <div data-proposal-band="dark" className="bg-night text-white">
          <div className={page}>{sections.slice(railEnd).map((s, i) => dark(s, railEnd + i, i === 0))}</div>
        </div>
      )}

      {hasRail && (
        <div data-proposal-rail="inline" className={`${page} border-t border-surface-200 py-9 lg:hidden`}>
          <ProofRail rail={rail} clips={clips} />
        </div>
      )}

      <footer className="border-t border-white/10 bg-night px-5 py-10 text-white/60 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline justify-between gap-3 text-[13px]">
          <p>
            Prepared by LoudFace for {proposal.clientName}. Confidential — please do not circulate outside your team.
          </p>
          {proposal.contactEmail && (
            <a href={`mailto:${proposal.contactEmail}`} className="font-medium text-white">
              {proposal.contactEmail}
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}
