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

export function ForecastBlock({ section }: { section: S<'forecastSection'> }) {
  return (
    <>
      <Intro text={section.intro} />
      <ProposalForecast
        shareOfVoice={section.shareOfVoice}
        impressions={section.impressions}
        conversion={section.conversion}
        assumptions={section.assumptions}
        todayLine={section.todayLine}
      />
      {section.note && <p className="mt-3 max-w-[64ch] text-[13.5px] leading-relaxed text-surface-600">{section.note}</p>}
    </>
  );
}

export function TracksBlock({ section }: { section: S<'tracksSection'> }) {
  const tracks = section.tracks ?? [];
  const targets = section.targets ?? [];
  return (
    <>
      <Intro text={section.intro} />
      <div className="mt-5 grid gap-0 border-y border-surface-200 sm:grid-cols-3 sm:divide-x sm:divide-surface-200">
        {tracks.map((t) => (
          <div key={t._key} data-print-keep className="border-b border-surface-200 py-4 last:border-b-0 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
            <Label>{t.label}</Label>
            <ul className="mt-3 space-y-2.5">
              {(t.items ?? []).map((it) => (
                <li key={it._key} className="flex items-start gap-2.5 text-[14px] leading-snug text-surface-700">
                  {it.count && (
                    <span className="proposal-num inline-flex h-[22px] shrink-0 items-center rounded-[5px] bg-surface-200 px-1.5 text-[12.5px] font-semibold tracking-[-0.02em] text-surface-950">
                      {it.count}
                    </span>
                  )}
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {targets.length > 0 && (
        <p className="mt-5 max-w-[68ch] text-[13.5px] leading-relaxed text-surface-600">
          <span className="font-medium text-surface-950">{section.targetsLabel ?? 'First'}</span> · {targets.join(' · ')}
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

export function MonthsBlock({ section }: { section: S<'monthsSection'> }) {
  const months = section.months ?? [];
  const measures = section.measures ?? [];
  return (
    <>
      <Intro text={section.intro} />
      <ol className="mt-5 grid border-y border-surface-200 sm:grid-cols-3 sm:divide-x sm:divide-surface-200">
        {months.map((m) => (
          <li
            key={m._key}
            data-print-keep
            className="flex flex-col border-b border-surface-200 py-4 last:border-b-0 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:pr-0"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-700">{m.label}</p>
            <p className="mt-1 text-[15px] font-medium text-surface-950">{m.title}</p>
            <ul className="mt-2.5 flex-1 space-y-1 text-[13.5px] leading-snug text-surface-600">
              {(m.items ?? []).map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            {m.proves && (
              <p className="mt-3 text-[12.5px] text-surface-950">
                <span className="text-surface-400">Proves · </span>
                {m.proves}
              </p>
            )}
          </li>
        ))}
      </ol>
      {measures.length > 0 && (
        <p className="mt-5 text-[13.5px] leading-relaxed text-surface-600">
          <span className="font-medium text-surface-950">{section.measuresLabel ?? 'Tracked daily'}</span> ·{' '}
          {measures.map((m) => m.label).join(' · ')}
        </p>
      )}
      {section.note && <p className="mt-3 text-[13px] text-surface-500">{section.note}</p>}
    </>
  );
}
