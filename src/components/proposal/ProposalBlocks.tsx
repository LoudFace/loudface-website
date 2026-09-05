import type { ProposalSection } from '@/sanity/lib/proposalsClient';
import { StatChip } from './StatChip';
import { ProposalAskAi, ProposalForecast } from './ProposalInteractive';

/**
 * The client-first body blocks. Each opens with the client's numbers and
 * then says what we do. Server components; the interactive parts are
 * imported from ProposalInteractive.
 */

type S<T extends ProposalSection['_type']> = Extract<ProposalSection, { _type: T }>;

function Intro({ text }: { text?: string }) {
  return text ? <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-700">{text}</p> : null;
}

function Source({ text }: { text?: string }) {
  return text ? <p className="mt-3 text-[12px] text-surface-500">{text}</p> : null;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-semibold uppercase tracking-[0.09em] text-surface-500">{children}</p>;
}

export function AskAiBlock({ section, clientName }: { section: S<'askAiSection'>; clientName: string }) {
  return (
    <>
      <Intro text={section.intro} />
      <ProposalAskAi questions={section.questions ?? []} clientName={clientName} />
      <Source text={section.source} />
    </>
  );
}

export function StandingBlock({ section }: { section: S<'standingSection'> }) {
  const stats = section.stats ?? [];
  const gap = section.gap ?? [];
  return (
    <>
      {stats.length > 0 && (
        <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {stats.map((s) => (
            <p key={s._key} className="pr-3 [text-wrap:pretty]">
              <StatChip number={s.value} line={s.label} lead={s.lead} />
            </p>
          ))}
        </div>
      )}
      {gap.length > 0 && (
        <div className="mt-7">
          <Label>{section.gapHeading ?? 'What the AI cites, and what you have'}</Label>
          <ul className="mt-3 divide-y divide-surface-200 border-y border-surface-200">
            {gap.map((r) => (
              <li key={r._key} className="flex items-baseline justify-between gap-4 py-2 text-[13.5px]">
                <span className={r.tone === 'asset' ? 'text-surface-500' : 'text-surface-900'}>{r.pageType}</span>
                <span className="flex items-baseline gap-3">
                  <span className={`text-[12.5px] ${r.tone === 'asset' ? 'text-primary-700' : 'text-surface-500'}`}>
                    {r.coverage}
                  </span>
                  <span className="proposal-num w-[52px] text-right text-surface-950">{r.citations.toLocaleString('en-US')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {section.closing && <p className="mt-5 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-900">{section.closing}</p>}
      <Source text={section.source} />
    </>
  );
}

/**
 * The one block that sits on its own panel. The page is otherwise a single
 * light ground with hairline rules, and section after section melts together;
 * lifting the interactive block gives the scroll a beat and marks the place
 * the reader is meant to touch.
 */
export function ForecastBlock({ section }: { section: S<'forecastSection'> }) {
  return (
    <div
      data-proposal-card
      data-print-keep
      className="mt-5 rounded-2xl border border-surface-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(10,10,10,0.04)] sm:px-7 sm:py-6"
    >
      <Intro text={section.intro} />
      <ProposalForecast
        shareOfVoice={section.shareOfVoice}
        impressions={section.impressions}
        conversion={section.conversion}
        assumptions={section.assumptions}
        todayLine={section.todayLine}
      />
      {section.note && <p className="mt-3 max-w-[64ch] text-[13.5px] leading-relaxed text-surface-600">{section.note}</p>}
    </div>
  );
}

/**
 * One table, the same chrome as `tableSection`: rounded card, hairline rows,
 * a quiet header. The track name spans its rows so it is said once.
 *
 * Two earlier shapes were rejected: three narrow columns with a grey count
 * chip before each line (every line started in a different place and wrapped
 * raggedly), and a bare hairline list (a wall of rows with no structure).
 */
export function TracksBlock({ section }: { section: S<'tracksSection'> }) {
  const tracks = (section.tracks ?? []).filter((t) => (t.items ?? []).length > 0);
  const targets = section.targets ?? [];
  return (
    <>
      <Intro text={section.intro} />
      <div
        data-proposal-card
        data-print-keep
        className="mt-6 overflow-x-auto rounded-xl border border-surface-200 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-50 text-[11px] font-semibold uppercase tracking-[0.07em] text-surface-500">
              <th scope="col" className="border-b border-surface-200 px-4 py-2.5">Track</th>
              <th scope="col" className="border-b border-surface-200 px-4 py-2.5">What ships</th>
              <th scope="col" className="border-b border-surface-200 px-4 py-2.5 text-right">How much</th>
            </tr>
          </thead>
          {tracks.map((track, groupIndex) => {
            const items = track.items ?? [];
            return (
              <tbody key={track._key} className={groupIndex > 0 ? 'border-t border-surface-200' : ''}>
                {items.map((item, i) => (
                  <tr key={item._key}>
                    {i === 0 && (
                      <th
                        scope="rowgroup"
                        rowSpan={items.length}
                        className="w-[132px] border-r border-surface-200 px-4 py-3 align-top text-[13.5px] font-medium text-surface-950"
                      >
                        {track.label}
                      </th>
                    )}
                    <td
                      className={`px-4 py-3 align-top text-[14.5px] leading-snug text-surface-700 ${
                        i < items.length - 1 ? 'border-b border-surface-200' : ''
                      }`}
                    >
                      {item.text}
                    </td>
                    <td
                      className={`proposal-num w-[112px] whitespace-nowrap px-4 py-3 text-right align-top text-[13.5px] font-medium text-surface-950 ${
                        i < items.length - 1 ? 'border-b border-surface-200' : ''
                      }`}
                    >
                      {item.count ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
      {targets.length > 0 && (
        <p className="mt-4 max-w-[68ch] text-[13.5px] leading-relaxed text-surface-600">
          <span className="font-medium text-surface-950">{section.targetsLabel ?? 'First'}</span>: {targets.join(' · ')}
        </p>
      )}
    </>
  );
}

export function GateBlock({ section }: { section: S<'gateSection'> }) {
  return (
    <div data-print-keep className="mt-5 rounded-xl border border-primary-200 bg-primary-50/60 px-5 py-4">
      <p className="text-[15.5px] font-medium leading-relaxed text-primary-900">{section.body}</p>
      {section.items && section.items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {section.items.map((line) => (
            <li key={line} className="flex gap-2.5 text-[14px] leading-snug text-primary-900/80">
              <span aria-hidden className="mt-[8px] h-[5px] w-[5px] flex-none rounded-full bg-primary-600" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The same idiom as the working week strip directly above it: columns divided
 * by hairlines, every fact a discrete chip, one filled chip for the outcome.
 * The earlier shape was three columns of running text with a "Proves" line
 * underneath, and it read as a wall.
 *
 * The month titles were cut on purpose — they were our words about the work,
 * not a thing the client receives. The chips are the work.
 */
export function MonthsBlock({ section }: { section: S<'monthsSection'> }) {
  const months = section.months ?? [];
  const measures = section.measures ?? [];
  return (
    <>
      <Intro text={section.intro} />
      <ol
        className="mt-5 grid grid-cols-1 divide-y divide-surface-200 border-y border-surface-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        data-print-keep
      >
        {months.map((m) => (
          <li
            key={m._key}
            className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2 py-3 sm:block sm:px-4 sm:py-4 sm:first:pl-0 sm:last:pr-0"
          >
            <p className="w-[68px] text-[12px] font-medium text-surface-900 sm:w-auto">{m.label}</p>
            <ul className="flex flex-wrap gap-1.5 sm:mt-2.5 sm:flex-col sm:items-start">
              {(m.items ?? []).map((it) => (
                <li
                  key={it}
                  className="rounded-md border border-surface-200 bg-white px-2 py-1 text-[11.5px] leading-snug text-surface-700"
                >
                  {it}
                </li>
              ))}
              {m.proves && (
                <li className="flex items-center gap-1.5 rounded-md bg-primary-600 px-2 py-1 text-[11.5px] font-medium leading-snug text-white">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M1.5 6l3 3 6-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {m.proves}
                </li>
              )}
            </ul>
          </li>
        ))}
      </ol>
      {measures.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px]">
          <span className="text-surface-500">{section.measuresLabel ?? 'Tracked daily'}</span>
          {measures.map((m) => (
            <span key={m._key} className="rounded-md border border-surface-200 px-2 py-1 text-surface-700">
              {m.label}
            </span>
          ))}
        </div>
      )}
      {section.note && <p className="mt-3 text-[13px] text-surface-500">{section.note}</p>}
    </>
  );
}
