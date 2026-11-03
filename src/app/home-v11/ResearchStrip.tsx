import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import type { ResearchStudy, TeamMember } from '@/lib/types';
import { ResearchChart } from '../research-v11/charts';
import { SERIES, type SeriesKey } from '../research-v11/contract';
import { researchers } from '../research-v11/people';
import { hubView, isoDay, shortDate, type PaperCard } from '../research-v11/view';
import { ArrowRight, Eyebrow, personAvatar } from './ui';

/**
 * Homepage research strip (design T2, picked by Arnel on 3 Nov 2026; Paper "Proposed · Homepage research section · T2
 * Strip", desktop and phone; reference build design-lab/research-home-2026-11-03/T2.html). A thin band on night between
 * Results and Route: the heading, a one-line lede with the paper count, the researchers' avatars and See all research,
 * beside the three newest papers as hairline cards (series square and date, the finding, the lead figure drawn thin with
 * the series colour as its only accent). Every paper, count and person is read from Sanity (fetchResearchIndexData,
 * which throws on a failed read); the copy is home-v11.json `research`. Phone: the cards swipe (CSS scroll-snap).
 */

/** The series colours lit for night, as the board draws them (kit/grid.css: WCAG 2 on #0b0a2e, 8.3 to 11.8:1). */
const ACCENT: Record<SeriesKey, string> = { index: '#a5a1ff', saas: '#f8936f', ai: '#86dcb4', meas: '#f3c565' };
/** Every mark that is not the accent (kit/grid.css --rest; a graphic, never text). */
const REST = '#625f8f';
/** The chart's height and the width it is drawn at before the card is measured (a card is 261 px inside at 1440). */
const CHART_H = 118;
const CHART_W = 260;

type C = HomeV11Content['research'];

function Card({ p }: { p: PaperCard }) {
  const f = p.leadFigure;
  return (
    <article className="v11-rstrip-card">
      <div className="v11-rstrip-meta">
        <span><i className="v11-rstrip-mark" style={{ background: ACCENT[p.series] }} aria-hidden="true" /><span>{SERIES[p.series].name}</span></span>
        <time dateTime={isoDay(p.date)}>{shortDate(p.date)}</time>
      </div>
      <h3 className="v11-rstrip-title"><Link href={p.href}>{p.name}</Link></h3>
      {f && (
        <div className="v11-rstrip-fig">
          <p className="v11-rstrip-axis">{(f.spec as { axis?: string }).axis ?? f.title}</p>
          <ResearchChart
            spec={f.spec}
            ground="stage"
            tone="night"
            size="sm"
            variant="thin"
            height={CHART_H}
            initialWidth={CHART_W}
            accent={ACCENT[p.series]}
            rest={REST}
            title={f.title}
            className="v11-rstrip-chart"
          />
        </div>
      )}
    </article>
  );
}

export function ResearchStrip({ c, team, studies, members }: {
  c: C;
  team: HomeV11Content['team'];
  studies: ResearchStudy[];
  members: Map<string, TeamMember>;
}) {
  const v = hubView(studies);
  const papers = v.papers.slice(0, 3);
  // The /research hub's researchers (people.ts): the papers' authors, then the leads; only people with a picture.
  const people = researchers(studies, members, team)
    .map(({ person }) => ({ name: person.name, src: person.avatar ?? (person.slug ? personAvatar(person.slug) : undefined) }))
    .filter((x): x is { name: string; src: string } => !!x.src);

  return (
    <section className="v11-rstrip" data-paper-name="Home · research · T2 Strip">
      <div className="v11-wrap v11-rstrip-grid">
        <div className="v11-rstrip-intro">
          <Eyebrow dot="#c9bdf5">{c.eyebrow}</Eyebrow>
          <h2 className="v11-rstrip-h2"><span>{c.heading}</span> <span className="is-soft">{c.headingSoft}</span></h2>
          <p className="v11-rstrip-lede"><span>{v.papers.length}</span> <span>{c.lede}</span></p>
          <div className="v11-rstrip-foot">
            {/* a group of named images, not a list: the Markdown twin would print a list of pictures as empty bullets */}
            {people.length > 0 && (
              <div className="v11-rstrip-stack" role="group" aria-label={c.researchersAriaLabel}>
                {people.map((x) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={x.name} src={x.src} alt={x.name} title={x.name} width={32} height={32} loading="lazy" decoding="async" />
                ))}
              </div>
            )}
            <Link href="/research" className="v11-rstrip-link"><span>{c.linkLabel}</span> <ArrowRight /></Link>
          </div>
        </div>
        <div className="v11-rstrip-papers">
          <div className="v11-rstrip-row">
            {papers.map((p) => <Card key={p.slug} p={p} />)}
          </div>
          <p className="v11-rstrip-swipe">{c.swipe}</p>
        </div>
      </div>
    </section>
  );
}
