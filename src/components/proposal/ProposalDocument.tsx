import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ProofRail, ProofSection, isProofSection } from './ProposalSocialProof';
import { ProposalCaseProof } from './ProposalCaseProof';
import { EngagementLoopPlate, PlateDefs, WorkingWeek } from './ProposalFigures';
import { AskAiBlock, ForecastBlock, GateBlock, MonthsBlock, StandingBlock, TracksBlock } from './ProposalBlocks';

/**
 * The readable proposal. Server component, zero client JS — the only script on
 * an unlocked proposal is ProposalAnalytics.
 *
 * Design follows the report surface we already send clients: a dark stage for
 * the header, a light ground for the document, hairline tables, tabular
 * numbers, and no decoration that does not carry information. Every block
 * carries data-proposal-section so the analytics observer can see it, and
 * data-print-keep so it does not break across a page.
 */

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-[15.5px] leading-relaxed text-surface-700">{children}</p>,
    h3: ({ children }) => <h3>{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="space-y-2 text-[15.5px] leading-relaxed text-surface-700">{children}</ul>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        rel="noopener noreferrer"
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
      >
        {children}
      </a>
    ),
  },
};

function Prose({ value, className = '' }: { value: PortableTextBlock[]; className?: string }) {
  return (
    <div className={`proposal-prose ${className}`.trim()}>
      <PortableText value={value} components={portableTextComponents} />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[22px] sm:text-[26px] font-medium tracking-[-0.03em] leading-tight text-surface-950">
      {children}
    </h2>
  );
}

/* ── Blocks ───────────────────────────────────────────────────────────── */

function TableBlock({ section }: { section: Extract<ProposalSection, { _type: 'tableSection' }> }) {
  const columns = section.columns?.filter(Boolean) ?? [];
  return (
    <>
      <div
        data-proposal-card
        data-print-keep
        className="mt-5 overflow-x-auto rounded-xl border border-surface-200 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
      >
        <table className="w-full border-collapse text-[14.5px]">
          {columns.length > 0 && (
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="border-b border-surface-200 bg-surface-50 px-4 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-surface-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {section.rows?.map((row) => (
              <tr key={row._key} className="border-b border-surface-200 last:border-b-0">
                {row.cells?.map((cell, index) => (
                  <td
                    key={index}
                    className={`px-4 py-3 align-top text-surface-700 ${
                      index === 0 ? 'font-medium text-surface-950 whitespace-nowrap' : ''
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.note && <p className="mt-3 text-[13.5px] text-surface-500">{section.note}</p>}
    </>
  );
}

function PricingBlock({
  section,
}: {
  section: Extract<ProposalSection, { _type: 'pricingTiersSection' }>;
}) {
  return (
    <>
      {section.anchor && (
        <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-700">{section.anchor}</p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {section.tiers?.map((tier) => (
          <div
            key={tier._key}
            data-proposal-card
            data-print-keep
            className={`rounded-xl border bg-white p-5 ${
              tier.recommended
                ? 'border-primary-600 shadow-[0_1px_2px_rgba(79,57,246,0.10),0_12px_28px_-16px_rgba(79,57,246,0.45)]'
                : 'border-surface-200'
            }`}
          >
            {/* Wraps rather than overflows: on a narrow print column the badge
                and the tier name will not fit on one line. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
              <span className="text-[13.5px] font-medium text-surface-950">{tier.name}</span>
              {tier.recommended && (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-primary-700">
                  Recommended
                </span>
              )}
            </div>
            <p className="proposal-num mt-2 text-[26px] font-medium leading-none tracking-[-0.03em] text-surface-950">
              {tier.price}
            </p>
            {tier.cadence && <p className="mt-1 text-[12.5px] text-surface-500">{tier.cadence}</p>}
            {tier.description && (
              <p className="mt-3 text-[13.5px] leading-relaxed text-surface-600">{tier.description}</p>
            )}
          </div>
        ))}
      </div>
      {section.note && (
        <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-surface-700">{section.note}</p>
      )}
    </>
  );
}

function TimelineBlock({
  section,
}: {
  section: Extract<ProposalSection, { _type: 'timelineSection' }>;
}) {
  return (
    <>
      {section.intro && <p className="mt-3 text-[14px] text-surface-500">{section.intro}</p>}
      <ol className="mt-5 space-y-0 border-t border-surface-200">
        {section.items?.map((item) => (
          <li
            key={item._key}
            data-print-keep
            className="grid gap-1 border-b border-surface-200 py-4 last:border-b-0 last:pb-0 sm:grid-cols-[128px_1fr] sm:gap-6"
          >
            <span className="text-[13.5px] font-semibold uppercase tracking-[0.05em] text-surface-950">
              {item.label}
            </span>
            <p className="text-[15px] leading-relaxed text-surface-700">{item.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function EngagementLoopBlock({
  section,
  clientName,
}: {
  section: Extract<ProposalSection, { _type: 'timelineSection' }>;
  clientName: string;
}) {
  return (
    <>
      {section.intro && <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-700">{section.intro}</p>}
      {section.gate?.body && (
        <div data-print-keep className="mt-5 border-l-2 border-primary-600 pl-4">
          <p className="max-w-[64ch] text-[15.5px] font-medium leading-relaxed text-surface-950">{section.gate.body}</p>
          {section.gate.items && section.gate.items.length > 0 && (
            <p className="mt-2 max-w-[64ch] text-[14px] leading-relaxed text-surface-600">
              {section.gate.items.join(' ')}
            </p>
          )}
        </div>
      )}
      <div className="mt-6">
        <EngagementLoopPlate clientName={clientName} gateLabel={section.gateLabel} />
      </div>
      {section.showWeek && (
        <div className="mt-8">
          <WorkingWeek />
        </div>
      )}
    </>
  );
}

function BulletBlock({
  section,
}: {
  section: Extract<ProposalSection, { _type: 'bulletListSection' }>;
}) {
  return (
    <>
      {section.intro && (
        <p className="mt-3 max-w-[68ch] text-[15.5px] leading-relaxed text-surface-700">
          {section.intro}
        </p>
      )}
      <ul className="mt-4 space-y-2.5">
        {section.items?.map((item) => (
          <li key={item._key} data-print-keep className="flex gap-3">
            <span
              aria-hidden
              className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full bg-primary-600"
            />
            <p className="max-w-[66ch] text-[15.5px] leading-relaxed text-surface-700">
              {item.lead && <strong className="font-semibold text-surface-950">{item.lead} </strong>}
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function WorkingTogetherBlock({
  section,
}: {
  section: Extract<ProposalSection, { _type: 'bulletListSection' }>;
}) {
  return (
    <>
      <div className="mt-6">
        <WorkingWeek />
      </div>
    </>
  );
}

function SectionBody({ section, clientName }: { section: ProposalSection; clientName: string }) {
  switch (section._type) {
    case 'richTextSection':
      return <Prose value={section.body} className="mt-4" />;
    case 'tableSection':
      return <TableBlock section={section} />;
    case 'pricingTiersSection':
      return <PricingBlock section={section} />;
    case 'timelineSection':
      return section.variant === 'engagementLoop'
        ? <EngagementLoopBlock section={section} clientName={clientName} />
        : <TimelineBlock section={section} />;
    case 'bulletListSection':
      return section.variant === 'workingTogether'
        ? <WorkingTogetherBlock section={section} />
        : <BulletBlock section={section} />;
    case 'askAiSection':
      return <AskAiBlock section={section} clientName={clientName} />;
    case 'standingSection':
      return <StandingBlock section={section} />;
    case 'forecastSection':
      return <ForecastBlock section={section} />;
    case 'tracksSection':
      return <TracksBlock section={section} />;
    case 'gateSection':
      return <GateBlock section={section} />;
    case 'monthsSection':
      return <MonthsBlock section={section} />;
    default:
      return null;
  }
}

/* ── Document ─────────────────────────────────────────────────────────── */

function formatDate(value: string): string {
  const parsed = Date.parse(`${value}T12:00:00Z`);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function ProposalDocument({ proposal, clipsVariant = 'strip' }: { proposal: Proposal; clipsVariant?: 'strip' | 'grid' }) {
  const sections = proposal.sections ?? [];
  const rail = proposal.proofRail;
  const clips = (proposal.clipStrip?.clips ?? []).filter((clip) => clip.videoUrl || clip.posterUrl || clip.name);

  // A rail only earns the second column if it has something in it.
  const hasRail = Boolean(
    (rail?.platforms?.length ?? 0) > 0 || (rail?.quotes?.length ?? 0) > 0 || clips.length > 0
  );

  // With a rail the page is wider, so the document column keeps roughly the
  // measure it has today and the rail sits in space the window already had.
  const page = hasRail ? 'mx-auto max-w-[1180px] px-5 sm:px-8' : 'mx-auto max-w-4xl px-5 sm:px-8';

  const priceCard = proposal.priceLine ? (
    <div
      data-proposal-card
      data-print-keep
      data-proposal-pricing
      data-proposal-section="Price line"
      data-proposal-type="priceLine"
      className="-mt-11 rounded-xl border border-surface-200 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_16px_36px_-22px_rgba(10,10,10,0.35)]"
    >
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-surface-500">
        Investment
      </p>
      <p className="proposal-num mt-2 text-[19px] font-medium leading-snug tracking-[-0.02em] text-surface-950 sm:text-[21px]">
        {proposal.priceLine}
      </p>
    </div>
  ) : null;

  const renderSections = (boxed: boolean) =>
    sections.map((section, index) =>
      section._type === 'caseProofSection' ? (
        <ProposalCaseProof
          key={section._key}
          heading={section.heading}
          intro={section.intro}
          slugs={section.slugs}
          chartsPerCase={section.chartsPerCase}
          index={index}
        />
      ) : isProofSection(section) ? (
        <ProofSection key={section._key} section={section} index={index} boxed={boxed} />
      ) : (
        <section
          key={section._key}
          id={`section-${index + 1}`}
          data-proposal-section={section.heading || section._type}
          data-proposal-type={section._type}
          data-proposal-pricing={section._type === 'pricingTiersSection' ? '' : undefined}
          className={
            boxed
              ? 'border-b border-surface-200 py-9 last:border-b-0 sm:py-11'
              : 'mx-auto max-w-4xl border-b border-surface-200 px-5 py-9 last:border-b-0 sm:px-8 sm:py-11'
          }
        >
          {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
          <SectionBody section={section} clientName={proposal.clientName} />
        </section>
      )
    );

  return (
    <main className="pb-0">
      <PlateDefs />
      <header className="bg-night text-white">
        <div className={`${page} pt-12 pb-20 sm:pt-16`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lf-logo.svg" alt="LoudFace" className="h-6 w-auto opacity-90" />
          <p className="mt-9 text-[13px] tracking-[0.02em] text-white/55">
            Proposal for {proposal.clientName}
          </p>
          <h1 className="mt-2.5 max-w-[20ch] text-[30px] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
            {proposal.title}
          </h1>
          {proposal.heroSummary && proposal.heroSummary.length > 0 && (
            <div className="proposal-lede mt-5 max-w-[62ch] text-[16.5px] leading-relaxed text-white/75 [&_a]:text-white [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_strong]:text-white">
              <PortableText value={proposal.heroSummary} />
            </div>
          )}

          {proposal.heroQuote && (
            <figure className="mt-7 max-w-[60ch] border-l-2 border-white/40 pl-4">
              <blockquote className="text-[16px] leading-relaxed text-white/85">&ldquo;{proposal.heroQuote}&rdquo;</blockquote>
              {proposal.heroQuoteBy && <figcaption className="mt-2 text-[12.5px] text-white/55">{proposal.heroQuoteBy}</figcaption>}
            </figure>
          )}

          <dl className="mt-8 flex flex-wrap gap-x-9 gap-y-3 border-t border-white/15 pt-6 text-[13px] text-white/55">
            {proposal.preparedFor && proposal.preparedFor.length > 0 && (
              <div>
                <dt className="inline">Prepared for </dt>
                <dd className="inline font-medium text-white">{proposal.preparedFor.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt className="inline">Valid until </dt>
              <dd className="inline font-medium text-white">{formatDate(proposal.validUntil)}</dd>
            </div>
            {proposal.contactEmail && (
              <div>
                <dt className="inline">Questions </dt>
                <dd className="inline font-medium text-white">
                  <a href={`mailto:${proposal.contactEmail}`}>{proposal.contactEmail}</a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      {proposal.priceLine && (
        <div className={page}>
          <div className={hasRail ? 'lg:max-w-[calc(100%-352px)]' : ''}>{priceCard}</div>
        </div>
      )}

      {hasRail ? (
        <div className={page}>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-14">
            <div className="min-w-0">{renderSections(true)}</div>
            {/* Sticky, so the ratings are still on screen at the price. */}
            <aside data-proposal-rail="aside" className="hidden lg:block">
              <div className="sticky top-8 pt-9">
                <ProofRail rail={rail} clips={clips} clipsVariant={clipsVariant} />
              </div>
            </aside>
          </div>
          {/* No column on a phone, and none on paper. Same content, in flow. */}
          <div data-proposal-rail="inline" className="border-t border-surface-200 py-9 lg:hidden">
            <ProofRail rail={rail} clips={clips} clipsVariant={clipsVariant} />
          </div>
        </div>
      ) : (
        <div>{renderSections(false)}</div>
      )}

      <footer className="mt-4 bg-night px-5 py-10 text-white/60 sm:px-8">
        <div className={`flex flex-wrap items-baseline justify-between gap-3 text-[13px] ${hasRail ? 'mx-auto max-w-[1180px]' : 'mx-auto max-w-4xl'}`}>
          <p>
            Prepared by LoudFace for {proposal.clientName}. Confidential — please do not
            circulate outside your team.
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
