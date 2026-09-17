import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { Audit, AuditSection, ProposalBand } from '@/sanity/lib/proposalsClient';

/**
 * The readable audit. Server component, zero client JS.
 *
 * Design is the proposal surface, deliberately: a dark stage for the masthead,
 * a light ground for the document, hairline tables, tabular numbers, and no
 * decoration that does not carry information. It reuses proposal.css for the
 * print rules, so Cmd+P produces the same clean PDF.
 *
 * What an audit adds over a proposal is evidence furniture: a two-number
 * verdict, a scorecard, findings, comparison tables where one row is the
 * reader, bar rankings, and a provenance table. Every block carries
 * data-proposal-section and data-print-keep so it does not break across a page.
 */

/* ── Prose ────────────────────────────────────────────────────────────── */

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
      <a href={value?.href} rel="noopener noreferrer" target={value?.href?.startsWith('http') ? '_blank' : undefined}>
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

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`text-[22px] sm:text-[26px] font-medium tracking-[-0.03em] leading-tight ${
        dark ? 'text-white' : 'text-surface-950'
      }`}
    >
      {children}
    </h2>
  );
}

function Intro({ text, dark = false }: { text?: string; dark?: boolean }) {
  if (!text) return null;
  return (
    <p className={`mt-3 max-w-[68ch] text-[15.5px] leading-relaxed ${dark ? 'text-white/70' : 'text-surface-700'}`}>
      {text}
    </p>
  );
}

/* ── Pills ────────────────────────────────────────────────────────────── */

/**
 * Tone is read from the cell text so the writer never has to pick a colour.
 * Keep the vocabularies small and literal — a pill that guesses wrong is worse
 * than a plain cell.
 */
const ALERT_WORDS = ['absent', 'no', 'none', '404', 'missing', 'does not exist', 'fail', 'blocked', '0'];
const GOOD_WORDS = ['yes', 'live', 'present', 'clean', 'pass', 'ok', 'good'];

function pillTone(value: string): 'alert' | 'good' | 'neutral' {
  const v = value.trim().toLowerCase();
  if (ALERT_WORDS.some((w) => v === w || v.startsWith(`${w} `) || v.startsWith(`${w},`))) return 'alert';
  if (GOOD_WORDS.some((w) => v === w || v.startsWith(`${w} `))) return 'good';
  return 'neutral';
}

function Pill({ value }: { value: string }) {
  const tone = pillTone(value);
  const cls =
    tone === 'alert'
      ? 'bg-warning-light text-warning-dark'
      : tone === 'good'
        ? 'bg-primary-50 text-primary-700'
        : 'bg-surface-100 text-surface-600';
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${cls}`}
    >
      {value}
    </span>
  );
}

/* ── Verdict ──────────────────────────────────────────────────────────── */

function VerdictBlock({ section }: { section: Extract<AuditSection, { _type: 'auditVerdictSection' }> }) {
  return (
    <div
      data-proposal-card
      data-print-keep
      className="mt-5 grid items-center gap-6 rounded-xl border border-surface-200 bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.04)] sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:p-7"
    >
      <div className="min-w-0">
        <p className="proposal-num text-[34px] font-medium leading-none tracking-[-0.03em] text-primary-600 sm:text-[44px]">
          {section.leftValue}
        </p>
        {section.leftLabel && (
          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-surface-700">{section.leftLabel}</p>
        )}
        {section.leftSource && <p className="mt-2 text-[12px] text-surface-500">{section.leftSource}</p>}
      </div>

      <p className="text-[14px] italic text-surface-400 sm:px-2">{section.connector || 'versus'}</p>

      <div className="min-w-0">
        <p className="proposal-num text-[34px] font-medium leading-none tracking-[-0.03em] text-warning-dark sm:text-[44px]">
          {section.rightValue}
        </p>
        {section.rightLabel && (
          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-surface-700">{section.rightLabel}</p>
        )}
        {section.rightSource && <p className="mt-2 text-[12px] text-surface-500">{section.rightSource}</p>}
      </div>
    </div>
  );
}

/* ── Scorecard ────────────────────────────────────────────────────────── */

function ScorecardBlock({ section }: { section: Extract<AuditSection, { _type: 'auditScorecardSection' }> }) {
  const tiles = section.tiles ?? [];
  return (
    <div
      data-proposal-card
      data-print-keep
      className="mt-5 grid gap-px overflow-hidden rounded-xl border border-surface-200 bg-surface-200 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tiles.map((tile) => (
        <div key={tile._key} className="bg-white p-5">
          <p
            className={`proposal-num text-[27px] font-medium leading-none tracking-[-0.03em] ${
              tile.tone === 'good'
                ? 'text-primary-600'
                : tile.tone === 'neutral'
                  ? 'text-surface-950'
                  : 'text-warning-dark'
            }`}
          >
            {tile.value}
          </p>
          <p className="mt-2.5 text-[13px] leading-snug text-surface-600">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Finding ──────────────────────────────────────────────────────────── */

function FindingBlock({ section }: { section: Extract<AuditSection, { _type: 'auditFindingSection' }> }) {
  const ok = section.tone === 'ok';
  return (
    <div
      data-print-keep
      className={`mt-5 rounded-r-lg border-l-[3px] py-4 pl-5 pr-5 ${
        ok ? 'border-primary-600 bg-primary-50' : 'border-warning-dark bg-warning-light'
      }`}
    >
      <p
        className={`mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${
          ok ? 'text-primary-700' : 'text-warning-dark'
        }`}
      >
        {section.tag}
      </p>
      {section.body && <Prose value={section.body} className="[&_p]:text-surface-800" />}
    </div>
  );
}

/* ── Comparison table ─────────────────────────────────────────────────── */

function TableBlock({ section }: { section: Extract<AuditSection, { _type: 'auditTableSection' }> }) {
  const columns = section.columns?.filter(Boolean) ?? [];
  const numeric = new Set(section.numericColumns ?? []);
  const pills = new Set(section.pillColumns ?? []);

  return (
    <>
      <Intro text={section.intro} />
      <div
        data-proposal-card
        data-print-keep
        className="mt-5 overflow-x-auto rounded-xl border border-surface-200 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
      >
        <table className="w-full border-collapse text-[14.5px]">
          {columns.length > 0 && (
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`border-b border-surface-200 bg-surface-50 px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-surface-500 whitespace-nowrap ${
                      numeric.has(index) ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {section.rows?.map((row) => (
              <tr
                key={row._key}
                className={`border-b border-surface-200 last:border-b-0 ${row.highlight ? 'bg-primary-50' : ''}`}
              >
                {row.cells?.map((cell, index) => (
                  <td
                    key={index}
                    className={`px-4 py-3 align-top ${
                      numeric.has(index) ? 'proposal-num text-right whitespace-nowrap' : ''
                    } ${
                      index === 0
                        ? `font-medium text-surface-950 ${numeric.has(index) ? '' : 'whitespace-nowrap'}`
                        : 'text-surface-700'
                    } ${row.highlight ? 'font-medium text-surface-950' : ''}`}
                  >
                    {pills.has(index) ? <Pill value={cell} /> : cell}
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

/* ── Bar ranking ──────────────────────────────────────────────────────── */

function BarsBlock({ section }: { section: Extract<AuditSection, { _type: 'auditBarsSection' }> }) {
  return (
    <>
      <Intro text={section.intro} />
      <div data-print-keep className="mt-5 flex flex-col gap-2">
        {section.bars?.map((bar) => (
          <div
            key={bar._key}
            className="grid items-center gap-3 [grid-template-columns:96px_1fr_52px] sm:[grid-template-columns:150px_1fr_64px] sm:gap-4"
          >
            <span
              className={`truncate text-right text-[12.5px] sm:text-[13.5px] ${
                bar.self ? 'font-semibold text-primary-700' : 'text-surface-600'
              }`}
            >
              {bar.label}
            </span>
            <span className="h-[18px] overflow-hidden rounded-[3px] bg-surface-100">
              <span
                className={`block h-full rounded-[3px] ${bar.self ? 'bg-primary-600' : 'bg-surface-400'}`}
                style={{ width: `${Math.max(1, Math.min(100, bar.fraction))}%` }}
              />
            </span>
            <span
              className={`proposal-num text-right text-[12.5px] ${
                bar.self ? 'font-semibold text-primary-700' : 'text-surface-500'
              }`}
            >
              {bar.value}
            </span>
          </div>
        ))}
      </div>
      {section.note && <p className="mt-4 max-w-[68ch] text-[14px] leading-relaxed text-surface-700">{section.note}</p>}
    </>
  );
}

/* ── Evidence quote ───────────────────────────────────────────────────── */

/** `[[Pisano]]` in the quote marks the client's own name inside the answer. */
function markedQuote(quote: string) {
  return quote.split(/(\[\[[^\]]+\]\])/g).map((part, index) =>
    part.startsWith('[[') && part.endsWith(']]') ? (
      <mark key={index} className="rounded-[3px] bg-primary-100 px-1 py-0.5 text-primary-800">
        {part.slice(2, -2)}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function QuoteBlock({ section }: { section: Extract<AuditSection, { _type: 'auditQuoteSection' }> }) {
  return (
    <>
      <figure
        data-proposal-card
        data-print-keep
        className="mt-5 rounded-xl border border-surface-200 bg-white p-5 shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
      >
        <figcaption className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-surface-500">
          {section.attribution}
        </figcaption>
        <blockquote className="text-[14.5px] leading-relaxed text-surface-700">
          {markedQuote(section.quote)}
        </blockquote>
      </figure>
      {section.note && <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-surface-700">{section.note}</p>}
    </>
  );
}

/* ── Plan ─────────────────────────────────────────────────────────────── */

function PlanBlock({ section }: { section: Extract<AuditSection, { _type: 'auditPlanSection' }> }) {
  return (
    <>
      <Intro text={section.intro} />
      <div
        data-proposal-card
        data-print-keep
        className="mt-5 flex flex-col gap-px overflow-hidden rounded-xl border border-surface-200 bg-surface-200"
      >
        {section.moves?.map((move, index) => (
          <div key={move._key} className="grid grid-cols-[auto_1fr] gap-4 bg-white p-5 sm:grid-cols-[auto_1fr_auto] sm:gap-5">
            <span className="proposal-num pt-0.5 text-[12.5px] font-semibold text-primary-600">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="text-[15.5px] font-semibold leading-snug text-surface-950">{move.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-surface-700">{move.body}</p>
            </div>
            {move.meta && (
              <span className="col-start-2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-surface-500 sm:col-start-3 sm:pt-1 sm:text-right">
                {move.meta}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Method ───────────────────────────────────────────────────────────── */

function MethodBlock({ section }: { section: Extract<AuditSection, { _type: 'auditMethodSection' }> }) {
  return (
    <>
      <div
        data-proposal-card
        data-print-keep
        className="mt-5 overflow-x-auto rounded-xl border border-surface-200 bg-white"
      >
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {['Measurement', 'Source', 'Pulled'].map((column) => (
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
          <tbody>
            {section.rows?.map((row) => (
              <tr key={row._key} className="border-b border-surface-200 last:border-b-0">
                <td className="px-4 py-2.5 align-top font-medium text-surface-950">{row.measurement}</td>
                <td className="px-4 py-2.5 align-top text-surface-700">{row.source}</td>
                <td className="whitespace-nowrap px-4 py-2.5 align-top text-surface-600">{row.pulled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.note && <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-surface-500">{section.note}</p>}
    </>
  );
}

/* ── Section switch ───────────────────────────────────────────────────── */

function SectionBody({ section, dark }: { section: AuditSection; dark: boolean }) {
  switch (section._type) {
    case 'auditVerdictSection':
      return <VerdictBlock section={section} />;
    case 'auditScorecardSection':
      return <ScorecardBlock section={section} />;
    case 'richTextSection':
      return section.body ? <Prose value={section.body} className={dark ? '[&_p]:text-white/75' : 'mt-3'} /> : null;
    case 'auditTableSection':
      return <TableBlock section={section} />;
    case 'auditBarsSection':
      return <BarsBlock section={section} />;
    case 'auditFindingSection':
      return <FindingBlock section={section} />;
    case 'auditQuoteSection':
      return <QuoteBlock section={section} />;
    case 'auditPlanSection':
      return <PlanBlock section={section} />;
    case 'auditMethodSection':
      return <MethodBlock section={section} />;
    default:
      return null;
  }
}

/* ── Document ─────────────────────────────────────────────────────────── */

const bandClass: Record<Exclude<ProposalBand, 'plain'>, string> = {
  white: 'border-y border-surface-200 bg-white',
  tint: 'border-y border-primary-100 bg-primary-50',
  dark: 'bg-night text-white',
};

export function AuditDocument({ audit }: { audit: Audit }) {
  const sections = audit.sections ?? [];
  const page = 'mx-auto max-w-4xl px-5 sm:px-8';

  const bandOf = (section: AuditSection): ProposalBand => {
    const value = (section as { band?: ProposalBand }).band;
    return value === 'white' || value === 'tint' || value === 'dark' ? value : 'plain';
  };

  /** Sections are numbered so the reader and the caller can say "section 3".
   *  A finding belongs to the section above it, so it never takes a number. */
  let numbered = 0;
  const numberFor = (section: AuditSection) =>
    section._type === 'auditFindingSection' || section._type === 'auditMethodSection'
      ? null
      : String(++numbered).padStart(2, '0');

  const renderOne = (section: AuditSection, index: number, banded: boolean, dark = false) => {
    const number = numberFor(section);
    const headingText = (section as { heading?: string }).heading;

    return (
      <section
        key={section._key}
        id={`section-${index + 1}`}
        data-proposal-section={headingText || section._type}
        data-proposal-type={section._type}
        className={
          banded
            ? `border-b py-11 last:border-b-0 sm:py-14 ${dark ? 'border-white/12' : 'border-surface-950/[0.07]'}`
            : 'mx-auto max-w-4xl border-b border-surface-200 px-5 py-9 last:border-b-0 sm:px-8 sm:py-11'
        }
      >
        {headingText && (
          <div className="flex items-baseline gap-3">
            {number && (
              <span className="proposal-num shrink-0 text-[12.5px] font-semibold text-primary-600">{number}</span>
            )}
            <SectionHeading dark={dark}>{headingText}</SectionHeading>
          </div>
        )}
        <SectionBody section={section} dark={dark} />
      </section>
    );
  };

  const renderSections = () => {
    const groups: { band: ProposalBand; items: { section: AuditSection; index: number }[] }[] = [];
    sections.forEach((section, index) => {
      const band = bandOf(section);
      const last = groups[groups.length - 1];
      if (last && last.band === band) last.items.push({ section, index });
      else groups.push({ band, items: [{ section, index }] });
    });

    return groups.map((group, groupIndex) => {
      if (group.band === 'plain') {
        return (
          <div key={`band-${groupIndex}`} className="contents">
            {group.items.map(({ section, index }) => renderOne(section, index, false))}
          </div>
        );
      }
      const dark = group.band === 'dark';
      return (
        <div key={`band-${groupIndex}`} data-proposal-band={group.band} className={bandClass[group.band]}>
          <div className="mx-auto max-w-4xl px-5 py-4 sm:px-8">
            {group.items.map(({ section, index }) => renderOne(section, index, true, dark))}
          </div>
        </div>
      );
    });
  };

  return (
    <main className="pb-0">
      <header className="bg-night text-white">
        <div className={`${page} pt-12 pb-14 sm:pt-16`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lf-logo.svg" alt="LoudFace" className="h-6 w-auto opacity-90" />

          {(audit.eyebrow || audit.subject || audit.measuredOn) && (
            <div className="mt-9 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {audit.eyebrow && <span>{audit.eyebrow}</span>}
              {audit.subject && <span>{audit.subject}</span>}
              {audit.measuredOn && <span>Measured {audit.measuredOn}</span>}
            </div>
          )}

          <div className="min-w-0 max-w-[62ch]">
            <h1 className="mt-5 max-w-[22ch] text-[30px] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
              {audit.headline}
            </h1>
            {audit.standfirst && audit.standfirst.length > 0 && (
              <div className="proposal-lede mt-5 max-w-[62ch] text-[16.5px] leading-relaxed text-white/75 [&_a]:text-white [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_strong]:text-white">
                <PortableText value={audit.standfirst} />
              </div>
            )}
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-9 gap-y-3 border-t border-white/15 pt-6 text-[13px] text-white/55">
            {audit.preparedFor && audit.preparedFor.length > 0 && (
              <div>
                <dt className="inline">Prepared for </dt>
                <dd className="inline font-medium text-white">{audit.preparedFor.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt className="inline">Prepared by </dt>
              <dd className="inline font-medium text-white">LoudFace</dd>
            </div>
          </dl>
        </div>
      </header>

      <div>{renderSections()}</div>

      <footer className="border-t border-white/10 bg-night px-5 py-10 text-white/60 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-baseline justify-between gap-3 text-[13px]">
          <p>
            Prepared by LoudFace for {audit.clientName}. Confidential — please do not circulate
            outside your team.
          </p>
          {audit.contactEmail && (
            <a href={`mailto:${audit.contactEmail}`} className="font-medium text-white">
              {audit.contactEmail}
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}
