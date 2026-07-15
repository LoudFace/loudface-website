'use client';

/**
 * Archive — the crisp-light case-study archive: oversized-type head, a sticky
 * discipline filter bar, and studies grouped by primary discipline. Every card
 * is resolved server-side (page.tsx) from LIVE Sanity data, so this stays a thin
 * client component whose only job is the filter interaction.
 *
 * The default "All" view renders every group into the DOM (crawlers / AI engines
 * see every study); the filter just toggles group visibility client-side —
 * mirroring the SEO contract of the page it replaces.
 *
 * Within the lead discipline group (AI Search & Organic Growth) the first study
 * gets the full-width "lead showcase" treatment and the rest render as big
 * cards; the other groups use the standard three-up grid.
 */
import { useState } from 'react';
import Link from 'next/link';
import { DISCIPLINE_COPY } from './content';

const LEAD_DISCIPLINE = 'AI Search & Organic Growth';

export type ArchiveCard = {
  slug: string;
  title: string;
  summary?: string;
  disciplines: string[];
  thumbSrc: string;
  thumbSrcset?: string;
  thumbAlt: string;
  industryName?: string;
  technologies: string[];
  barLabel: string;
  clientName?: string;
  result1Number?: string;
  result1Title?: string;
  result2Number?: string;
  result2Title?: string;
  featured?: boolean;
};

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Standard / big archive card (the whole card is the link). */
function Card({ c, big, eager }: { c: ArchiveCard; big?: boolean; eager?: boolean }) {
  const hasStats = c.result1Number || c.result2Number;
  return (
    <Link className={`cs${big ? ' cs-big' : ''}`} href={`/case-studies/${c.slug}`}>
      <div className="cs-frame">
        <div className="cs-bar" aria-hidden="true">
          <b></b>
          <b></b>
          <b></b>
          <span>{c.barLabel}</span>
        </div>
        <div className="cs-shot">
          <img
            src={c.thumbSrc}
            srcSet={c.thumbSrcset}
            sizes="(max-width:768px) 100vw, (max-width:1080px) 50vw, 33vw"
            alt={c.thumbAlt}
            width={800}
            height={500}
            loading={eager ? 'eager' : 'lazy'}
          />
        </div>
        {c.industryName && <span className="cs-badge">{c.industryName}</span>}
      </div>
      <div className="cs-body">
        {c.clientName && <span className="cs-client">{c.clientName}</span>}
        <h3 className="cs-title">{c.title}</h3>
        {c.summary && <p className="cs-sum">{c.summary}</p>}
        {hasStats && (
          <div className="cs-stat">
            {c.result1Number && (
              <span className="cs-stat1">
                <i></i>
                <b>{c.result1Number}</b>
                {c.result1Title}
              </span>
            )}
            {c.result2Number && (
              <span className="cs-stat2">
                <b>{c.result2Number}</b>
                {c.result2Title}
              </span>
            )}
          </div>
        )}
        <div className="cs-foot">
          <div className="cs-tech">
            {c.technologies.slice(0, 3).map((t) => (
              <span className="tp" key={t}>
                {t}
              </span>
            ))}
          </div>
          <span className="cs-go">
            View study <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Full-width flagship showcase for the first study in the lead discipline. */
function LeadCard({ c }: { c: ArchiveCard }) {
  const kicker = [c.clientName, c.industryName].filter(Boolean).join(' · ');
  return (
    <Link className="ld" href={`/case-studies/${c.slug}`}>
      <div className="ld-media">
        <div className="cs-frame ld-frame">
          <div className="cs-bar" aria-hidden="true">
            <b></b>
            <b></b>
            <b></b>
            <span>{c.barLabel}</span>
          </div>
          <div className="cs-shot">
            <img
              src={c.thumbSrc}
              srcSet={c.thumbSrcset}
              sizes="(max-width:1080px) 100vw, 55vw"
              alt={c.thumbAlt}
              width={800}
              height={500}
              loading="eager"
            />
          </div>
        </div>
      </div>
      <div className="ld-label">
        <span className="ld-tag">
          <i></i>Flagship · {c.disciplines[0]}
        </span>
        <div className="ld-name">
          <h3>{c.title}</h3>
        </div>
        {kicker && <span className="cs-client">{kicker}</span>}
        {c.summary && <p className="ld-what">{c.summary}</p>}
        {(c.result1Number || c.result2Number) && (
          <div className="ld-stats">
            {c.result1Number && (
              <div className="ld-stat hot">
                <b>{c.result1Number}</b>
                <span>{c.result1Title}</span>
              </div>
            )}
            {c.result2Number && (
              <div className="ld-stat">
                <b>{c.result2Number}</b>
                <span>{c.result2Title}</span>
              </div>
            )}
          </div>
        )}
        <span className="cs-go big">
          Open the full study <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export function Archive({
  cards,
  disciplineOrder,
  total,
}: {
  cards: ArchiveCard[];
  disciplineOrder: string[];
  total: number;
}) {
  const [active, setActive] = useState<string>('all');

  // Each study counts once, under its PRIMARY (first) discipline.
  const counts: Record<string, number> = {};
  for (const c of cards) {
    const primary = c.disciplines[0];
    if (primary) counts[primary] = (counts[primary] || 0) + 1;
  }
  const groups = disciplineOrder.filter((d) => (counts[d] || 0) > 0);

  const filters = [{ label: 'All', value: 'all', count: total }, ...groups.map((d) => ({ label: d, value: d, count: counts[d] }))];

  return (
    <section className="arch" id="archive" aria-label="All case studies">
      <div className="container">
        <div className="arch-head rv">
          <span className="eyebrow">
            <i></i>The archive
          </span>
          <h2 className="arch-big">
            Every study,
            <br />
            <span className="ghost">on file.</span>
          </h2>
          <p className="arch-sub">
            Filter by what you came for. Each card opens the full story — the problem, the build, and
            the outcome we can put our name next to.
          </p>
        </div>

        <div className="fbar rv" role="group" aria-label="Filter by discipline">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className="fbtn"
              aria-pressed={active === f.value}
              onClick={() => setActive(f.value)}
            >
              {f.label} <span className="fc">{f.count}</span>
            </button>
          ))}
        </div>

        {groups.map((discipline) => {
          const groupCards = cards.filter((c) => c.disciplines[0] === discipline);
          const isLead = discipline === LEAD_DISCIPLINE;
          const n = groupCards.length;
          return (
            <div
              key={discipline}
              className="grp"
              data-disc={discipline}
              hidden={active !== 'all' && active !== discipline}
            >
              <div className="grp-head rv">
                <div>
                  <h2>{discipline}</h2>
                  {DISCIPLINE_COPY[discipline] && <p className="gd">{DISCIPLINE_COPY[discipline]}</p>}
                </div>
                <span className="grp-count">
                  <b>{n}</b> {n === 1 ? 'study' : 'studies'}
                </span>
              </div>

              <div className={`cgrid${isLead ? ' two' : ''}`}>
                {isLead
                  ? groupCards.map((c, i) =>
                      i === 0 ? <LeadCard c={c} key={c.slug} /> : <Card c={c} big key={c.slug} />,
                    )
                  : groupCards.map((c) => <Card c={c} key={c.slug} />)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
