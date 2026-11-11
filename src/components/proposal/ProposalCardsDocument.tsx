import { Fragment, type ReactNode } from 'react';
import { ProposalDesignSlider } from './ProposalDesignSlider';
import { ProposalStandingCharts } from './ProposalStandingCharts';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { Proposal, ProposalAudit, ProposalSection, ProposalStrategy, ProposalStrategyBlock } from '@/sanity/lib/proposalsClient';
import { ProofRail, ProofSection, isProofSection } from './ProposalSocialProof';
import { ProposalCaseProof } from './ProposalCaseProof';
import { PlateDefs } from './ProposalFigures';
import { ProposalLogoStrip } from './ProposalLogoStrip';
import { ProposalOfferStreams } from './ProposalOfferStreams';
import { ProposalWhoDoesIt } from './ProposalWhoDoesIt';
import { ProposalTeamSlider } from './ProposalTeamSlider';
import { ProposalMethod } from './ProposalMethod';
import { STAGES } from '@/app/methodology-v3/data';
import { rawContent, type AboutV11Content } from '@/lib/content-utils';
import { personPhoto } from '@/app/home-v11/ui';
import { SectionBody } from './ProposalDocument';
import { STRATEGY_HOUSE } from './strategy-house';
import { ProposalTabs } from './ProposalTabs';
import { card, H, page, panel, Tick } from './cards-ui';
import { PitchExpectations, PitchStory, PitchWhyUs } from './ProposalPitch';

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

/* The About page's leads and bench, so the deck's team slider never drifts from /about. */
function teamFromAbout() {
  const t = rawContent<AboutV11Content>('about-v11').team;
  const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-');
  // The deck's order, set by Arnel on 2026-10-26; anyone new on /about follows these four.
  const FIRST = ['andrea-van-wyk', 'arnel-bukva', 'abhay-tyagi', 'tamara-pavlovic'];
  const rank = (name: string) => {
    const i = FIRST.indexOf(slug(name));
    return i === -1 ? FIRST.length : i;
  };
  const people = [...t.people].sort((a, b) => rank(a.person) - rank(b.person));
  return {
    leads: people.map((p) => ({ slug: slug(p.person), name: p.person, role: p.jobTitle, fact: p.fact, photo: personPhoto(slug(p.person)) })),
    bench: { heading: t.benchHeading, body: t.benchBody, roles: t.benchRoles },
  };
}

/* The Answer Chain's eight stages as /methodology prints them: the short name and the stage's first paragraph. */
function methodStages() {
  return STAGES.map((st) => {
    const p = st.blocks.find((bl) => bl.kind === 'p' && typeof (bl as { text?: unknown }).text === 'string') as { text: string } | undefined;
    return { n: st.n, short: st.short, text: p?.text ?? st.first };
  });
}

/* The house pair. A proposal can replace it with its own `promises` when a line does not fit the lead. */
const PROMISES = ['No designer or developer to hire', 'Measured in leads, not traffic'];

/* Our own client work from the design-samples Figma file, first screen each. */
const WORK = [
  { src: '/images/proposal-work/eve-roque.jpg', name: 'Eve & Roque', kind: 'Venues' },
  { src: '/images/proposal-work/brandfirm.jpg', name: 'Brandfirm', kind: 'Agency' },
  { src: '/images/proposal-work/ground-up.jpg', name: 'Ground Up', kind: 'Coffee & tea' },
  { src: '/images/proposal-work/urban-umbrella.jpg', name: 'Urban Umbrella', kind: 'Construction' },
  { src: '/images/proposal-work/reiterate.jpg', name: 'Reiterate', kind: 'Finance software' },
  /* Our design as shipped, cropped from the case-study image; the live site has since changed. */
  { src: '/images/proposal-work/dimer-health.jpg', name: 'Dimer Health', kind: 'Telehealth' },
];

/* The five tiles a mosaic shows: the section's own `work` order when it names one, else the house five. */
const workFor = (names?: string[]) =>
  names?.length
    ? names.map((n) => WORK.find((w) => w.name === n)).filter((w): w is (typeof WORK)[number] => Boolean(w)).slice(0, 5)
    : WORK.slice(0, 5);

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
  const promises = proposal.promises?.length ? proposal.promises : PROMISES;
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
              {promises.map((p) => (
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
          {workFor(section.work).map((w, i) => (
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
  // Three columns beside the proof rail leave each card about 230px. Items
  // longer than a short phrase wrap to five or six lines there (Arnel,
  // 2026-09-28: "quite cramped"), so long copy gets one wide card per track:
  // the label on the left, the checklist on the right. Same rule as the
  // classic layout's tracks.
  const long = tracks.some((t) => (t.items ?? []).some((it) => (it.text ?? '').length > 60));
  const items = (t: (typeof tracks)[number], className: string) => (
    <ul className={className}>
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
  );
  const pill = (t: (typeof tracks)[number]) =>
    t.items?.[0]?.count && (
      <span className="proposal-num mt-1.5 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium text-primary-700">
        {t.items[0].count}
      </span>
    );

  if (long) {
    return (
      <>
        {section.intro && <p className="mt-2 text-[15px] text-surface-600">{section.intro}</p>}
        <div className={`${panel} space-y-3`}>
          {tracks.map((t, i) => (
            <div key={t._key} className={`${card} p-5 sm:grid sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8 sm:p-6`}>
              <div>
                <Icon i={i} />
                <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{t.label}</p>
                {pill(t)}
              </div>
              {items(t, 'mt-4 space-y-3 sm:mt-1')}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {section.intro && <p className="mt-2 text-[15px] text-surface-600">{section.intro}</p>}
      <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
        {tracks.map((t, i) => (
          <div key={t._key} className={`${card} p-5`}>
            <Icon i={i} />
            <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{t.label}</p>
            {pill(t)}
            {items(t, 'mt-4 space-y-2.5')}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── the Preliminary strategy tab ─────────────────────────────────────── */
/* The strategy for this lead (Arnel, 3 Nov 2026: "a very detailed
   breakdown of a full strategy"), in its own tab so the deck stays short.
   Called preliminary (4 Nov 2026): it is built from public data before
   kickoff, and a note under the heading says it changes after we talk.
   Full width, no proof rail, so the tables have room. A left outline on
   wide screens, then: the summary, the bets, one block per part of the
   plan (tables, lists, a roadmap), quick wins beside longer bets. Every
   block is a heading, an optional "How we decide" line from the house
   method, the lead's own intro, and one card. */
const blockId = (prefix: 'strategy' | 'audit', heading: string) =>
  `${prefix}-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

function TickList({ items, className = 'space-y-2.5' }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((it) => (
        <li key={it} className="flex gap-2.5 text-[14px] leading-snug text-surface-800">
          <Tick />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* Each table column is sized by its own content, never by its position.
   A column whose every cell is short (a number, "Month 2") stays on one
   line; any column with prose wraps, with a floor so it never shrinks to a
   word per line. Headers always wrap. Before 4 Nov 2026 the last column
   never wrapped, so a sentence there ran off the card. */
const SHORT_CELL = 16;
function columnFit(block: ProposalStrategyBlock) {
  return (block.columns ?? []).map((_, i) => {
    const longest = Math.max(0, ...(block.rows ?? []).map((r) => (r.cells[i] ?? '').length));
    if (longest <= SHORT_CELL) return 'whitespace-nowrap';
    return longest > 60 ? 'min-w-[200px]' : 'min-w-[120px]';
  });
}

function StrategyBlockBody({ block }: { block: ProposalStrategyBlock }) {
  if (block.kind === 'table') {
    const cols = block.columns ?? [];
    const fit = columnFit(block);
    return (
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-snug">
          <thead>
            <tr className="border-b border-surface-200">
              {cols.map((c, i) => (
                <th key={c} scope="col" className={`px-4 py-3 text-[12px] font-medium text-surface-500 first:pl-5 last:pr-5 ${fit[i] === 'whitespace-nowrap' ? '' : fit[i]}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(block.rows ?? []).map((r) => (
              <tr key={r._key} className={`border-t border-surface-100 align-top first:border-t-0 ${r.tone === 'skip' ? 'text-surface-400' : 'text-surface-700'}`}>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-4 py-3 first:pl-5 last:pr-5 ${fit[i] ?? ''} ${i === 0 ? `font-medium ${r.tone === 'skip' ? '' : 'text-surface-950'}` : ''} proposal-num`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.kind === 'steps') {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 ${(block.steps ?? []).length === 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {(block.steps ?? []).map((s) => (
          <div key={s._key} className={`${card} p-5`}>
            <span className="proposal-num inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium text-primary-700">{s.label}</span>
            <p className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{s.title}</p>
            {s.items && s.items.length > 0 && <TickList items={s.items} className="mt-3 space-y-2" />}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`${card} px-5 sm:px-6`}>
      {(block.items ?? []).map((it, i) => (
        <div key={it._key} className={`py-4 sm:grid sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 ${i > 0 ? 'border-t border-surface-200' : ''}`}>
          <p className="text-[15px] font-semibold text-surface-950">{it.lead}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-surface-700 sm:mt-0">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

/* The Strategy and Technical audit tabs share one layout: a contents rail on
   the left, a header, optional bets or scorecard, then the blocks in order. */
function PlanTab({
  prefix,
  label,
  heading,
  summary,
  source,
  caveat,
  top,
  blocks,
  tail,
}: {
  prefix: 'strategy' | 'audit';
  label: string;
  heading: string;
  summary?: string;
  source?: string;
  caveat?: string;
  top?: { id: string; label: string; node: ReactNode };
  blocks: ProposalStrategyBlock[];
  tail?: { id: string; label: string; node: ReactNode };
}) {
  const outline = [
    ...(top ? [{ id: top.id, label: top.label }] : []),
    ...blocks.map((b) => ({ id: blockId(prefix, b.heading), label: b.heading })),
    ...(tail ? [{ id: tail.id, label: tail.label }] : []),
  ];
  return (
    <div className={`${page} py-10 sm:py-12`}>
      <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14">
        <nav aria-label={`${label} contents`} className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-0.5 border-l border-surface-200">
            {outline.map((o) => (
              <a key={o.id} href={`#${o.id}`} className="-ml-px border-l-2 border-transparent py-1.5 pl-3 text-[13px] leading-snug text-surface-500 hover:border-primary-300 hover:text-surface-900">
                {o.label}
              </a>
            ))}
          </div>
        </nav>
        <div className="min-w-0 space-y-14">
          <header data-proposal-section={`${label} · Summary`} className="space-y-3">
            <h2 className="text-[26px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[32px]">{heading}</h2>
            {summary && <p className="max-w-[68ch] text-[17px] leading-relaxed text-surface-700">{summary}</p>}
            {source && <p className="max-w-[68ch] text-[13px] text-surface-500">{source}</p>}
            {caveat && (
              <p className="max-w-[68ch] rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-[14px] leading-relaxed text-surface-800">
                <span className="mr-2 inline-block rounded-full bg-white px-2 py-0.5 text-[12px] font-medium text-primary-700">Preliminary</span>
                {caveat}
              </p>
            )}
          </header>

          {top && (
            <section id={top.id} data-proposal-section={`${label} · ${top.label}`} className="scroll-mt-20">
              <H>{top.label}</H>
              {top.node}
            </section>
          )}

          {blocks.map((b) => {
            const house = b.topic ? STRATEGY_HOUSE[b.topic] : undefined;
            return (
              <section key={b._key} id={blockId(prefix, b.heading)} data-proposal-section={`${label} · ${b.heading}`} className="scroll-mt-20">
                <H>{b.heading}</H>
                {house && (
                  <p className="mt-2 max-w-[72ch] text-[14px] leading-relaxed text-surface-500">
                    <span className="font-medium text-surface-700">How we decide: </span>
                    {house.how}
                  </p>
                )}
                {b.intro && <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-surface-700">{b.intro}</p>}
                <div className={panel}>
                  <StrategyBlockBody block={b} />
                </div>
                {b.note && <p className="mt-3 max-w-[72ch] text-[13px] leading-snug text-surface-500">{b.note}</p>}
              </section>
            );
          })}

          {tail && (
            <section id={tail.id} data-proposal-section={`${label} · ${tail.label}`} className="scroll-mt-20">
              <H>{tail.label}</H>
              {tail.node}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

const PRELIMINARY =
  'Built from public data before we have access to your accounts or your team. It will change once we have talked it through with you and dug deeper at kickoff.';

function StrategyTab({ strategy, clientName }: { strategy: ProposalStrategy; clientName: string }) {
  const wins = strategy.quickWins ?? [];
  const later = strategy.longBets ?? [];
  const bets = strategy.bets ?? [];
  return (
    <PlanTab
      prefix="strategy"
      label="Strategy"
      heading={strategy.heading || `A preliminary strategy for ${clientName}`}
      summary={strategy.summary}
      source={strategy.source}
      caveat={strategy.caveat || PRELIMINARY}
      blocks={strategy.blocks ?? []}
      top={
        bets.length > 0
          ? {
              id: 'strategy-bets',
              label: 'The bets',
              node: (
                <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
                  {bets.map((b, i) => (
                    <div key={b._key} className={`${card} p-5`}>
                      <Icon i={i} />
                      <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-surface-950">{b.title}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-surface-700">{b.text}</p>
                    </div>
                  ))}
                </div>
              ),
            }
          : undefined
      }
      tail={
        wins.length > 0 || later.length > 0
          ? {
              id: 'strategy-wins',
              label: 'Quick wins and longer bets',
              node: (
                <div className={panel}>
                  <div className={`${card} grid gap-6 p-5 sm:grid-cols-2 sm:gap-8 sm:p-6`}>
                    {wins.length > 0 && (
                      <div>
                        <p className="text-[15px] font-semibold text-surface-950">Quick wins</p>
                        <TickList items={wins} className="mt-3 space-y-2.5" />
                      </div>
                    )}
                    {later.length > 0 && (
                      <div>
                        <p className="text-[15px] font-semibold text-surface-950">Longer bets</p>
                        <TickList items={later} className="mt-3 space-y-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              ),
            }
          : undefined
      }
    />
  );
}

/* The audit's scorecard: one number per check, toned like the /a/ audit's
   tiles (AuditDocument): a blocker in the warning colour, a pass in indigo. */
const STAT_TONE = { bad: 'text-warning-dark', good: 'text-primary-600', neutral: 'text-surface-950' } as const;

function AuditTab({ audit, clientName }: { audit: ProposalAudit; clientName: string }) {
  const stats = audit.stats ?? [];
  return (
    <PlanTab
      prefix="audit"
      label="Audit"
      heading={audit.heading || `The technical audit of ${clientName}'s site`}
      summary={audit.summary}
      source={audit.source}
      blocks={audit.blocks ?? []}
      top={
        stats.length > 0
          ? {
              id: 'audit-scorecard',
              label: 'The scorecard',
              node: (
                <div className={`${panel} grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4`}>
                  {stats.map((t) => (
                    <div key={t._key} className={`${card} p-4 sm:p-5`}>
                      <p className={`proposal-num text-[26px] font-semibold leading-none tracking-[-0.02em] ${STAT_TONE[t.tone ?? 'neutral']}`}>{t.value}</p>
                      <p className="mt-2 text-[13px] leading-snug text-surface-600">{t.label}</p>
                    </div>
                  ))}
                </div>
              ),
            }
          : undefined
      }
    />
  );
}

/* The cards in the Proposal tab that point at the other tabs. */
function TabPointers({ clientName, strategy, audit }: { clientName: string; strategy: boolean; audit: boolean }) {
  const cards = [
    ...(strategy
      ? [{ href: '#strategy', title: `A preliminary strategy for ${clientName}`, text: 'Where AI answers stand on you today, the pages they read, and what we would do first, in order. It changes after kickoff.' }]
      : []),
    ...(audit
      ? [{ href: '#audit', title: `The technical audit of ${clientName}'s site`, text: 'Broken pages, speed, what AI crawlers can read, and the order we fix it all in, in the Technical audit tab.' }]
      : []),
  ];
  return (
    <section className={`grid gap-3 py-6 ${cards.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {cards.map((c) => (
        <a key={c.href} href={c.href} className={`${card} flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md sm:p-6`}>
          <span>
            <span className="block text-[16px] font-semibold text-surface-950">{c.title}</span>
            <span className="mt-1 block text-[14px] text-surface-600">{c.text}</span>
          </span>
          <span aria-hidden="true" className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-600 text-white">→</span>
        </a>
      ))}
    </section>
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
                <li key={it} className="flex gap-2 text-[13.5px] leading-snug text-surface-700">
                  <span aria-hidden="true" className="mt-[7px] h-1 w-1 flex-none rounded-full bg-primary-500" />
                  <span>{it}</span>
                </li>
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
  // A price in words ("Let's talk") has no number, so it goes last rather than first.
  const rank = (p?: string) => num(p) || Infinity;
  const ordered = [...tiers.filter((t) => t.recommended), ...tiers.filter((t) => !t.recommended).sort((a, b) => rank(a.price) - rank(b.price))];
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
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
              <span className={`proposal-num font-medium leading-none tracking-[-0.04em] ${t.recommended ? 'text-[48px]' : 'text-[30px] text-white/85'}`}>{t.price}</span>
              {t.wasPrice && (
                <s className={`proposal-num font-medium leading-none tracking-[-0.02em] decoration-2 ${t.recommended ? 'text-[24px] text-white/60' : 'text-[18px] text-white/40'}`}>
                  <span className="sr-only">Usually </span>
                  {t.wasPrice}
                </s>
              )}
            </p>
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
/* A pitch (9 Nov 2026) moves the sections about LoudFace, not the lead, to the LoudFace tab. */
const PITCH_TYPES: ProposalSection['_type'][] = ['caseProofSection', 'designSliderSection', 'metricsSection'];
/* The design work a pitch shows when its proposal names none: the house set, as first sent to Bamboo Health. */
const PITCH_DESIGN = {
  heading: "Sites we've designed and built",
  slugs: ['dimer-health', 'institute-of-medical-physics', 'toku-design-messaging-upgrade', 'hoxhunt', 'ceipal-wp-to-wf-migration', 'radisson-hotels-group', 'viaduct', 'montblanc'],
  figmaUrl: 'https://www.figma.com/design/F9eiT6aTU3ntbWc51Jkhu5/LoudFace--Design-Samples?node-id=0-1',
};

export function ProposalCardsDocument({ proposal }: { proposal: Proposal }) {
  const sections = proposal.sections ?? [];
  const firstDark = sections.findIndex((s) => (s as { band?: string }).band === 'dark');
  const railEnd = firstDark === -1 ? sections.length : firstDark;
  const months = (sections.find((s) => s._type === 'monthsSection') as Sec<'monthsSection'> | undefined)?.months;
  const firstRich = sections.findIndex((s) => s._type === 'richTextSection');
  const clips = (proposal.clipStrip?.clips ?? []).filter((c) => c.videoUrl || c.posterUrl || c.name);
  const rail = proposal.proofRail;
  const hasRail = Boolean((rail?.platforms?.length ?? 0) > 0 || (rail?.quotes?.length ?? 0) > 0 || clips.length > 0);
  const pitch = Boolean(proposal.pitch);
  // Each light section keeps its place in `sections`, so its id and analytics index never change with the tab it lands in.
  const lightSections = sections.slice(0, railEnd).map((s, i) => ({ s, i }));
  const ours = pitch ? lightSections.filter(({ s }) => PITCH_TYPES.includes(s._type)) : [];
  const theirs = pitch ? lightSections.filter(({ s }) => !PITCH_TYPES.includes(s._type)) : lightSections;
  // Who does the work sits right after "What we would do"; a proposal without
  // one gets it before the case studies, else after the last light section.
  const lightTypes = theirs.map(({ s }) => s._type);
  const afterTracks = lightTypes.indexOf('tracksSection');
  const beforeCases = lightTypes.indexOf('caseProofSection');
  const whoAt = afterTracks !== -1 ? afterTracks + 1 : beforeCases !== -1 ? beforeCases : lightTypes.length;
  // The Preliminary strategy tab, when the proposal carries one, and where the
  // Proposal tab points at it: just before "What we would do".
  const strategy = (proposal.strategy?.blocks?.length ?? 0) > 0 ? proposal.strategy : undefined;
  const audit = (proposal.audit?.blocks?.length ?? 0) > 0 ? proposal.audit : undefined;
  const tabbed = Boolean(pitch || strategy || audit);
  const pointerAt = afterTracks !== -1 ? afterTracks : whoAt;
  const pointers = (strategy || audit) && <TabPointers clientName={proposal.clientName} strategy={Boolean(strategy)} audit={Boolean(audit)} />;

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
    if (section._type === 'designSliderSection') {
      return <ProposalDesignSlider key={section._key} heading={section.heading} intro={section.intro} slugs={section.slugs} figmaUrl={section.figmaUrl} index={index} />;
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
      case 'chartsSection':
        body = <ProposalStandingCharts section={section} />;
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

  const whoAndMethod = (at: number) => (
    <>
      <ProposalWhoDoesIt index={at} />
      <ProposalMethod index={at} stages={methodStages()} />
    </>
  );
  const team = (at: number) => <ProposalTeamSlider index={at} {...teamFromAbout()} />;

  const clientColumn = (
    <>
      {theirs.slice(0, whoAt).map(({ s, i }, k) => (
        <Fragment key={s._key}>
          {k === pointerAt && pointers}
          {light(s, i)}
        </Fragment>
      ))}
      {pointerAt === whoAt && pointers}
      {!pitch && (
        <>
          {whoAndMethod(whoAt)}
          {team(whoAt)}
        </>
      )}
      {theirs.slice(whoAt).map(({ s, i }) => light(s, i))}
    </>
  );

  // The LoudFace tab, in the order of the 9 Nov drafts: what to expect, results,
  // design work, what we do, how we work, our story, the team, why us. Its own
  // blocks take indexes after the proposal's sections, so no id repeats.
  const after = sections.length;
  const pitchColumn = (
    <>
      <PitchExpectations index={after + 1} />
      {ours.map(({ s, i }) => light(s, i))}
      {!ours.some(({ s }) => s._type === 'designSliderSection') && <ProposalDesignSlider {...PITCH_DESIGN} index={after + 2} />}
      {whoAndMethod(after + 3)}
      <PitchStory index={after + 4} />
      {team(after + 5)}
      <PitchWhyUs index={after + 6} clientName={proposal.clientName} />
    </>
  );

  /* One tab's body: the column beside the proof rail, the dark close when the tab carries the price, and the rail inline on a phone. */
  const deck = (column: ReactNode, withClose: boolean) => (
    <>
      <div className={page}>
        <div className={hasRail ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_328px] lg:gap-14' : ''}>
          <div className="min-w-0">{column}</div>
          {hasRail && (
            <aside data-proposal-rail="aside" className="hidden lg:block">
              <div className={`sticky ${tabbed ? 'top-20' : 'top-8'} mt-10`}>
                <ProofRail rail={rail} clips={clips} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {withClose && railEnd < sections.length && (
        <div data-proposal-band="dark" className="bg-night text-white">
          <div className={page}>{sections.slice(railEnd).map((s, i) => dark(s, railEnd + i, i === 0))}</div>
        </div>
      )}

      {hasRail && (
        <div data-proposal-rail="inline" className={`${page} border-t border-surface-200 py-9 lg:hidden`}>
          <ProofRail rail={rail} clips={clips} />
        </div>
      )}
    </>
  );

  return (
    <main className="proposal-scale pb-0">
      <PlateDefs />
      <Hero proposal={proposal} />

      {tabbed ? (
        <ProposalTabs
          pitch={pitch ? deck(pitchColumn, false) : undefined}
          proposal={deck(clientColumn, true)}
          proposalLabel={pitch ? proposal.clientName : undefined}
          strategy={strategy && <StrategyTab strategy={strategy} clientName={proposal.clientName} />}
          audit={audit && <AuditTab audit={audit} clientName={proposal.clientName} />}
        />
      ) : (
        deck(clientColumn, true)
      )}

      <footer className="border-t border-white/10 bg-night px-5 py-10 text-white/60 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline justify-between gap-3 text-[13px]">
          <p>
            Prepared by LoudFace for {proposal.clientName}. Confidential. Please don&apos;t share it outside your team.
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
