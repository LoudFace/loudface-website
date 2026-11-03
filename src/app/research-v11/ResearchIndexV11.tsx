import Link from 'next/link';
import type { HomeV11Content, ResearchV11Content } from '@/lib/content-utils';
import { strip } from '@/lib/inline-edit/mark';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { SERIES, type ResearchFigure, type SeriesKey } from './contract';
import { Big, Byline, Chart, Cover, Go, Head, Mark, Right, X, bigClass } from './parts';
import { PaperFilter } from './PaperFilter';
import { STAGE_CHART, dayMonth, isWide, longDate, onSeries, seriesChart, shortDate, type HubView, type PaperCard, type Person } from './view';

/**
 * /research, the hub (direction G, approved by Arnel on 3 Nov 2026). Paper boards: "LoudFace Website · v11" →
 * "Desktop · v11" → "Proposed · Research hub · G Night lab + colour · desktop", and "Phone · v11" → "… G · phone".
 * Reference build: design-lab/research-2026-11-03/G-hub.html. Sections, top to bottom:
 *   stage       F's indigo stage: the title, counts read from the papers, the four newest findings in crosshair cells
 *   series      E's colour plates: one tile per series with a paper, its number from the paper on the largest sample
 *   featured    the `featured` paper on its series colour, its lead figure and the next one
 *   latest      F's ink band: one very large number per paper not already shown above
 *   papers      D's night grid of square hairline cards, each cover the lead figure on its series colour
 *   researchers the authors (from the papers) and the leads, in their studio portraits
 *   closing, footer  the shipped v11 parts, unchanged
 * The page departs from DESIGN.md §2.3 (no white bands) for /research only, on Arnel's instruction (taste rulebook,
 * 2026-11-03). Copy: src/data/content/research-v11.json; every number, date and count comes from Sanity.
 */

type C = ResearchV11Content['hub'];

const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];

export interface Researcher {
  person: Person;
  papers: PaperCard[];
  /** The line under the role when they wrote no paper (the homepage team line). */
  does?: string;
}

export function ResearchIndexV11({ c, home, v, featuredFigures, people, active }: {
  c: ResearchV11Content;
  home: HomeV11Content;
  v: HubView;
  /** The featured paper's figures after the lead one (the card read carries only the lead). */
  featuredFigures: ResearchFigure[];
  people: Researcher[];
  /** The series chosen with ?series=, or null for every paper. */
  active: SeriesKey | null;
}) {
  const x = c.hub;
  return (
    <div className="v11 rs rs-hub">
      <Stage x={x} v={v} />
      <SeriesStrip x={x} v={v} />
      {v.featured && <Featured x={x} p={v.featured} figures={featuredFigures} author={people.find((r) => r.papers.some((p) => p.slug === v.featured?.slug))?.person} figureLabel={c.paper.figure} />}
      {v.latest.length > 0 && <Latest x={x} papers={v.latest} />}
      <Papers x={x} v={v} active={active} />
      <Researchers x={x} people={people} total={v.papers.length} />
      <Closing c={{ ...home.closing, agenda: [] }} lede={x.closingLede} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}

/* =========================================================== stage */
function Stage({ x, v }: { x: C; v: HubView }) {
  const strip = v.newest;
  return (
    <section className="rs-stage" data-paper-name="G hub · stage">
      <div className="v11-wrap">
        <div className="rs-stage-top">
          <div>
            <h1 className="rs-title">{x.title}</h1>
            <p className="rs-intro">{x.intro}</p>
          </div>
          <div className="rs-stats">
            <div><b>{v.papers.length}</b><span><span>{x.statPapers}</span> {dayMonth(v.oldest)}</span></div>
            <div><b>{v.series.length}</b><span>{x.statSeries}</span></div>
            {v.largest && <div><b>{v.largest.shown}</b><span>{v.largest.unit} <span>{x.statSample}</span></span></div>}
          </div>
        </div>
        <div className="rs-band">
          <div className="rs-band-head">
            <p className="rs-eyebrow">{x.bandLabel}</p>
            <span className="is-note">{shortDate(strip[strip.length - 1].date)} <span>{x.bandTo}</span> {shortDate(strip[0].date)}</span>
          </div>
          <div className="rs-cells">
            {strip.map((p, i) => (
              <Link key={p.slug} href={p.href} className="rs-cell">
                <X at="tl" /><X at="bl" />{i === strip.length - 1 && <><X at="tr" /><X at="br" /></>}
                <div className="rs-cell-head">
                  <span><Mark s={p.series} /><span className="is-kind">{p.kind}</span><span className="is-ser">{SERIES[p.series].name}</span></span>
                  <Go />
                </div>
                {p.lead && <><p className="rs-cell-fig">{p.lead.value}</p><p className="rs-cell-say">{p.lead.label}</p></>}
                {p.leadFigure && (
                  <div className="rs-cell-chart">
                    <Chart f={p.leadFigure} {...STAGE_CHART} size="sm" />
                    {p.leadFigure.source && <p className="rs-src">{p.leadFigure.source}</p>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================== series strip */
function SeriesStrip({ x, v }: { x: C; v: HubView }) {
  return (
    <section className="rs-series-sec" data-paper-name="G hub · series">
      <nav className="rs-series" aria-label={strip(x.seriesAriaLabel)}>
        {v.series.map((s) => (
          <a key={s.key} href={`/research?series=${s.key}#papers`} data-s={s.key} className={`rs-tile ${onSeries(s.key)}`}>
            <h2 className="rs-tile-name">{SERIES[s.key].name}</h2>
            <p className="rs-tile-desc">{x.series[s.key]}</p>
            {s.lead.lead && <p className="rs-tile-big"><Big value={s.lead.lead.value} /></p>}
            <p className="rs-tile-say">{s.lead.name}</p>
            <div className="rs-tile-foot">
              <span><span>{x.seriesLatest}</span> {shortDate(s.latest)}</span>
              <span><b>{s.count}</b> {s.count === 1 ? x.paperOne : x.paperMany}</span>
            </div>
          </a>
        ))}
      </nav>
    </section>
  );
}

/* =========================================================== featured */
function Featured({ x, p, figures, author, figureLabel }: { x: C; p: PaperCard; figures: ResearchFigure[]; author?: Person; figureLabel: string }) {
  const g = seriesChart(p.series);
  const figs = [p.leadFigure, ...figures].filter((f): f is ResearchFigure => !!f).slice(0, 2);
  return (
    <section className="rs-feat-sec" data-paper-name="G hub · featured">
      <div className="v11-wrap">
        <Head
          eyebrow={x.featuredEyebrow}
          title={x.featuredHeading}
          soft={x.featuredHeadingSoft}
          body={p.sample && <><span>{p.sample}</span>{p.engines.length > 0 && <> <span>{x.featuredAcross}</span> <span>{p.engines.join(', ')}</span></>}.</>}
        />
        <article className={`rs-feat ${onSeries(p.series)}`}>
          <div className="rs-feat-copy">
            <div className="rs-meta"><span><b>{p.kind}</b> · {SERIES[p.series].name}</span><span>{shortDate(p.date)}</span></div>
            {p.lead && <p className={`rs-giant${bigClass(p.lead.value)}`}><Big value={p.lead.value} /></p>}
            <h3 className="rs-feat-title"><Link href={p.href}>{p.name}</Link></h3>
            {(p.excerpt || p.finding) && <p className="rs-abs">{p.excerpt || p.finding}</p>}
            <dl className="rs-dl">
              {/* the formal title up to its colon, as the board prints it (the full title is on the paper) */}
              {p.paperTitle && <div><dt>{x.featuredPaper}</dt><dd>{p.paperTitle}</dd></div>}
              {p.sample && <div><dt>{x.featuredSample}</dt><dd>{p.sample}</dd></div>}
              {p.dataWindow && <div><dt>{x.featuredWindow}</dt><dd>{p.dataWindow}</dd></div>}
            </dl>
            <div className="rs-feat-foot">
              {author && <Byline who={author} />}
              <Link href={p.href} className="rs-pill"><span>{x.featuredRead}</span> {p.kind.toLowerCase()} <span className="rs-arr">→</span></Link>
            </div>
          </div>
          <div className="rs-feat-fig">
            {figs.map((f, i) => (
              <figure key={f.key} className="rs-ffig">
                <figcaption className="rs-figtitle"><b>{f.title}</b><span><span>{figureLabel}</span> {i + 1}</span></figcaption>
                <Chart f={f} {...g} size={i === 0 ? 'lg' : 'md'} />
                {f.source && <p className="rs-src">{f.source}</p>}
              </figure>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

/* =========================================================== latest findings */
function Latest({ x, papers }: { x: C; papers: PaperCard[] }) {
  return (
    <section className="rs-ink" data-paper-name="G hub · latest findings">
      <div className="v11-wrap">
        <Head eyebrow={x.latestEyebrow} title={x.latestHeading} soft={x.latestHeadingSoft} body={x.latestBody} />
        <div className="rs-rows">
          {papers.map((p) => (
            <Link key={p.slug} href={p.href} className="rs-row">
              <div className="rs-numcol">
                <p className="rs-row-ser"><Mark s={p.series} />{SERIES[p.series].name}</p>
                {p.lead && <p className="rs-num"><Big value={p.lead.value} /></p>}
              </div>
              <div className="rs-row-text">
                <p className="rs-row-say">{p.name}</p>
                <p className="rs-row-sub"><span>{p.kind}</span> · {longDate(p.date)}{p.sample && <> · <span>{p.sample}</span></>}</p>
              </div>
              <span className="rs-row-go"><span>{x.read}</span> <span className="rs-go is-round"><Right /></span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================== every paper */
function Papers({ x, v, active }: { x: C; v: HubView; active: SeriesKey | null }) {
  const keys = (Object.keys(SERIES) as SeriesKey[]).filter((k) => v.counts[k] > 0);
  return (
    <section className="rs-papers" id="papers" data-paper-name="G hub · papers">
      <div className="v11-wrap">
        <div className="rs-head is-stacked">
          <div>
            <p className="rs-kicker"><span>{x.papersEyebrow}</span></p>
            <h2 className="rs-h2"><span>{x.papersHeading}</span> <span className="is-soft">{x.papersHeadingSoft}</span></h2>
          </div>
          <nav className="rs-filter" aria-label={strip(x.filterAriaLabel)}>
            {/* plain links: they reload the page without JavaScript; PaperFilter takes the press with it */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/research#papers" data-s="" aria-current={active ? undefined : 'true'}><span>{x.filterAll}</span> <span className="is-n">{v.papers.length}</span></a>
            {keys.map((k) => (
              <a key={k} href={`/research?series=${k}#papers`} data-s={k} aria-current={active === k ? 'true' : undefined}>
                <Mark s={k} />{SERIES[k].name} <span className="is-n">{v.counts[k]}</span>
              </a>
            ))}
            <PaperFilter />
          </nav>
        </div>
        <div className="rs-grid" data-grid="" data-filtered={active ? 'true' : 'false'}>
          {v.grid.map((p) => (
            <article key={p.slug} className={`rs-card${isWide(p) ? ' is-wide' : ''}`} data-s={p.series} hidden={!!active && p.series !== active}>
              <div className="rs-meta"><span><Mark s={p.series} /><b>{p.kind}</b></span><span>{shortDate(p.date)}</span></div>
              <h3 className="rs-card-title"><Link href={p.href}>{p.name}</Link></h3>
              <Cover p={p} />
              <div className="rs-card-foot"><span>{p.sample}</span><Link href={p.href} className="rs-readlink" tabIndex={-1}><span>{x.read}</span> <span className="rs-arr">→</span></Link></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================== researchers */
function Researchers({ x, people, total }: { x: C; people: Researcher[]; total: number }) {
  if (!people.length) return null;
  return (
    <section className="rs-people-band" data-paper-name="G hub · researchers">
      <div className="v11-wrap">
        <Head eyebrow={x.peopleEyebrow} title={x.peopleHeading} soft={x.peopleHeadingSoft} body={x.peopleBody} />
        <div className="rs-people">
          {people.map(({ person, papers, does }) => (
            <div key={person.slug ?? person.name} className="rs-person">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {person.photo && <img src={person.photo} alt={person.name} width={306} height={352} loading="lazy" />}
              <h3>{person.slug ? <Link href={`/team/${person.slug}`}>{person.name}</Link> : person.name}</h3>
              {person.title && <p className="role">{person.title}</p>}
              {papers.length > 0 ? (
                <>
                  <p className="does">{papers.length === total ? <span>{x.authorOfAll}</span> : <span>{x.authorOf}</span>} {papers.length} {papers.length === 1 ? x.paperOne : x.paperMany}</p>
                  <div className="papers">
                    {papers.slice(0, 3).map((p) => <Link key={p.slug} href={p.href}><Mark s={p.series} /><span>{p.name}</span></Link>)}
                  </div>
                </>
              ) : does ? <p className="does">{does}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TEAM as RESEARCH_TEAM };
