import type {
  ProofTone,
  ProposalProofRail,
  ProposalRailClip,
  ProposalSection,
  ReviewPlatformName,
} from '@/sanity/lib/proposalsClient';
import { ProposalClipStrip } from './ProposalClipStrip';

/**
 * Social proof for the proposal surface.
 *
 * The rail is a margin note, not a widget: ratings, the clips, and every
 * review in a slow marquee. No toolbar, no inner scrollbar, no accordion. It
 * sits beside the reader the whole way down, including at the price, and it
 * costs the document no vertical space.
 *
 * The body keeps the two blocks that need width — the numbers row here, and
 * the live case studies in `ProposalCaseProof`.
 *
 * One rule shaped every container on this surface: a box only where a number
 * lives. Everything else is a hairline and whitespace.
 *
 * The three platform colours are other companies' brand marks, not our
 * palette, and deliberately NOT in globals.css `@theme`.
 */

const PLATFORMS: Record<ReviewPlatformName, { label: string; accent: string; logo: string }> = {
  clutch: { label: 'Clutch', accent: '#FF3D2E', logo: '/images/review-platforms/clutch.png' },
  google: { label: 'Google', accent: '#4285F4', logo: '/images/review-platforms/google.png' },
  trustpilot: { label: 'Trustpilot', accent: '#00B67A', logo: '/images/review-platforms/trustpilot.png' },
};

type ProofSectionType = Extract<ProposalSection, { _type: 'metricsSection' }>;

export function isProofSection(section: ProposalSection): section is ProofSectionType {
  return section._type === 'metricsSection';
}

/* ── Shared bits ──────────────────────────────────────────────────────── */

const STAR_PATH = 'M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.3l-4.5 2.3.9-5L.8 6.1l5-.7z';

/** Five stars, filled to the rating. 4.3 shows a 30%-filled fifth star. */
function Stars({ rating, accent, id }: { rating: number; accent: string; id: string }) {
  const clamped = Math.max(0, Math.min(5, rating));
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        const gradientId = `${id}-star-${i}`;
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 16 16" role="presentation">
            {fill > 0 && fill < 1 && (
              <defs>
                <linearGradient id={gradientId}>
                  <stop offset={`${fill * 100}%`} stopColor={accent} />
                  <stop offset={`${fill * 100}%`} stopColor={accent} stopOpacity="0.18" />
                </linearGradient>
              </defs>
            )}
            <path
              d={STAR_PATH}
              fill={fill >= 1 || fill <= 0 ? accent : `url(#${gradientId})`}
              fillOpacity={fill <= 0 ? 0.18 : 1}
            />
          </svg>
        );
      })}
    </span>
  );
}

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? rating.toFixed(1) : String(rating);
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-surface-500">
      {children}
    </p>
  );
}

/* ── Results — the numbers row, in the document ───────────────────────── */

function toneClasses(tone: ProofTone) {
  return tone === 'dark'
    ? {
        card: 'border-white/12 bg-white/[0.045]',
        divide: 'divide-white/12',
        heading: 'text-white',
        body: 'text-white/75',
        faint: 'text-white/40',
      }
    : {
        card: 'border-surface-200 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]',
        divide: 'divide-surface-200',
        heading: 'text-surface-950',
        body: 'text-surface-700',
        faint: 'text-surface-400',
      };
}

export function ProofSection({
  section,
  index,
  boxed = false,
}: {
  section: ProofSectionType;
  index: number;
  /** True when the page has a rail — a band cannot bleed past a sidebar. */
  boxed?: boolean;
}) {
  const tone = section.tone ?? 'light';
  const dark = tone === 'dark';
  const t = toneClasses(tone);
  const metrics = section.metrics ?? [];
  const columns =
    metrics.length >= 4 ? 'sm:grid-cols-4' : metrics.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  const inner = (
    <>
      {section.heading && (
        <h2 className={`text-[22px] font-medium leading-tight tracking-[-0.03em] sm:text-[26px] ${t.heading}`}>
          {section.heading}
        </h2>
      )}
      {section.intro && (
        <p className={`mt-3 max-w-[62ch] text-[15.5px] leading-relaxed ${t.body}`}>{section.intro}</p>
      )}
      <div
        data-proposal-card
        data-print-keep
        className={`mt-6 grid ${columns} divide-y sm:divide-y-0 sm:divide-x ${t.divide} overflow-hidden rounded-xl border ${t.card}`}
      >
        {metrics.map((metric) => (
          <div key={metric._key} className="px-5 py-6">
            <p className={`proposal-num text-[34px] font-medium leading-none tracking-[-0.04em] sm:text-[38px] ${t.heading}`}>
              {metric.value}
            </p>
            <p className={`mt-3 text-[14px] leading-snug ${t.body}`}>{metric.label}</p>
            {metric.source && <p className={`mt-2.5 text-[11.5px] leading-snug ${t.faint}`}>{metric.source}</p>}
          </div>
        ))}
      </div>
    </>
  );

  const shared = {
    id: `section-${index + 1}`,
    'data-proposal-section': section.heading || section._type,
    'data-proposal-type': section._type,
  };

  if (dark && boxed) {
    return (
      <section {...shared} className="py-9 sm:py-11">
        <div data-proposal-band="dark" data-print-keep className="rounded-2xl bg-night px-6 py-8 text-white sm:px-8 sm:py-10">
          {inner}
        </div>
      </section>
    );
  }
  if (dark) {
    return (
      <section {...shared} data-proposal-band="dark" className="bg-night text-white">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-14">{inner}</div>
      </section>
    );
  }
  return (
    <section
      {...shared}
      className={
        boxed
          ? 'border-b border-surface-200 py-9 last:border-b-0 sm:py-11'
          : 'mx-auto max-w-4xl border-b border-surface-200 px-5 py-9 last:border-b-0 sm:px-8 sm:py-11'
      }
    >
      {inner}
    </section>
  );
}

/* ── The rail ─────────────────────────────────────────────────────────── */

function RailQuote({
  quote,
}: {
  quote: { _key: string; text: string; author?: string; company?: string; platform?: ReviewPlatformName };
}) {
  const meta = quote.platform ? PLATFORMS[quote.platform] : undefined;
  return (
    <figure
      className="proposal-marquee-item rounded-lg border border-surface-200 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
      data-proposal-card
    >
      <blockquote className="text-[13.5px] leading-[1.5] text-surface-700">&ldquo;{quote.text}&rdquo;</blockquote>
      <figcaption className="mt-2.5 flex items-center gap-2 text-[12px] text-surface-500">
        {meta && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.logo} alt={meta.label} width={16} height={16} className="h-4 w-4 shrink-0 rounded-[3px] object-contain" />
        )}
        <span className="min-w-0 truncate">
          {quote.author && <span className="font-medium text-surface-900">{quote.author}</span>}
          {quote.company && <span> · {quote.company}</span>}
          {meta && <span> · {meta.label}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Rendered twice by ProposalDocument: as the sticky aside on `lg`, and again
 * in the flow for phones and paper. proposal.css shows exactly one.
 */
export function ProofRail({
  rail,
  clips = [],
  clipsVariant = 'strip',
}: {
  rail?: ProposalProofRail;
  clips?: ProposalRailClip[];
  clipsVariant?: 'strip' | 'grid';
}) {
  const platforms = rail?.platforms ?? [];
  const metrics = rail?.metrics ?? [];
  const quotes = (rail?.quotes ?? []).filter((quote) => quote.text);
  const playable = clips.filter((clip) => clip.videoUrl || clip.posterUrl || clip.name);
  const duration = Math.max(24, quotes.length * 8);

  return (
    <div className="space-y-8">
      {platforms.length > 0 && (
        <div>
          <RailLabel>{rail?.heading ?? 'Reviewed on'}</RailLabel>
          <div
            data-proposal-card
            data-print-keep
            className="mt-3 divide-y divide-surface-200 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
          >
            {platforms.map((platform) => {
              const meta = PLATFORMS[platform.platform];
              if (!meta) return null;
              return (
                <a
                  key={platform._key}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 transition-colors hover:bg-surface-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-surface-900">{meta.label}</span>
                    <span className="flex items-center gap-1.5">
                      <Stars rating={platform.rating} accent={meta.accent} id={`rail-${platform._key}`} />
                      <span className="proposal-num text-[13px] font-medium text-surface-900">{formatRating(platform.rating)}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-surface-500">
                    {platform.reviewCount} {platform.reviewCount === 1 ? 'review' : 'reviews'}
                    {platform.note ? ` · ${platform.note}` : ''}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {metrics.length > 0 && (
        <div>
          <RailLabel>What the work produced</RailLabel>
          <ul className="mt-3 divide-y divide-surface-200 border-y border-surface-200">
            {metrics.map((m) => (
              <li key={m._key} className="py-2.5">
                <p className="proposal-num text-[22px] font-medium leading-none tracking-[-0.03em] text-surface-950">{m.value}</p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-surface-700">{m.label}</p>
                {m.source && <p className="mt-1 text-[11px] leading-snug text-surface-400">{m.source}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {playable.length > 0 && (
        <div>
          <RailLabel>In their own words</RailLabel>
          <div className="mt-3">
            <ProposalClipStrip clips={playable} variant={clipsVariant} />
          </div>
        </div>
      )}

      {quotes.length > 0 && (
        <div>
          <RailLabel>{rail?.quotesHeading ?? 'What they said'}</RailLabel>
          <div
            className="proposal-marquee mt-3"
            data-print-keep
            tabIndex={0}
            role="region"
            aria-label={`${rail?.quotesHeading ?? 'What they said'} — scrolls automatically, pauses on hover or focus`}
          >
            <div className="proposal-marquee-track" style={{ animationDuration: `${duration}s` }}>
              {quotes.map((quote) => <RailQuote key={quote._key} quote={quote} />)}
              <div className="proposal-marquee-dup contents" aria-hidden="true">
                {quotes.map((quote) => <RailQuote key={`${quote._key}-dup`} quote={quote} />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
