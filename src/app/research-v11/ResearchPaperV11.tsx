import { Fragment } from 'react';
import Link from 'next/link';
import type { HomeV11Content, ResearchV11Content } from '@/lib/content-utils';
import type { ResearchStudy } from '@/lib/types';
import { strip } from '@/lib/inline-edit/mark';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { img } from '../home-v11/ui';
import { TocSpy } from '../blog-v11/TocSpy';
import { BlogVisual } from '@/components/blog';
import type { BlogVisual as BlogVisualType } from '@/lib/types';
import { SERIES } from './contract';
import { CopyCitation } from './CopyCitation';
import { Big, Byline, Chart, Head, Kicker, SeriesCard, X, bigClass } from './parts';
import { LIT, NIGHT_CHART, apaCitation, fileKind, listOf, longDate, onSeries, seriesChart, shortDate, type BodyView, type NumberedFigure, type PaperCard, type Person } from './view';

/**
 * /research/<slug>, a paper (direction G, approved by Arnel on 3 Nov 2026). Paper boards: "LoudFace Website · v11" →
 * "Desktop · v11" → "Proposed · Research hub · G Night lab + colour · desktop" (the paper board beside the hub) and
 * "Phone · v11" → "… G · phone". Reference build: design-lab/research-2026-11-03/G-paper.html. Sections:
 *   hero          on the series colour: breadcrumb, kind · date · version, the finding as H1, the formal title, the
 *                 byline and data window, the two actions, then the lead number beside the lead figure
 *   key numbers   very large numbers in crosshair cells on night (hidden when the paper has none)
 *   reading       the contents rail beside the takeaways and the body on night; figures placed afterH2 sit between
 *                 the body's sections on night panels under a series-colour label strip
 *   figure band   the `band` figure, full width on the series colour
 *   method        the measurement sheet: sample, window, engines, then the methodology itself
 *   limitations, versions, data and citation (an APA reference built from the paper, with a copy button)
 *   more research three other papers, each on its own series colour
 *   closing, footer  the shipped v11 parts, unchanged
 * The body renders inside one data-lf-body container (the inline editor edits it sentence by sentence); its figures
 * are drawn inside that container between the H2 sections, the way blog-v3/BlogBodyV3 places blog visuals.
 */

type C = ResearchV11Content['paper'];

export interface PaperView {
  study: ResearchStudy;
  card: PaperCard;
  authors: Person[];
  body: BodyView;
  more: PaperCard[];
  /** Slug of the newer edition, when this one is superseded. */
  superseded?: string;
}

const VERSION_ORDER = (a: { date: string }, b: { date: string }) => Date.parse(b.date) - Date.parse(a.date);

export function ResearchPaperV11({ c, home, v }: { c: ResearchV11Content; home: HomeV11Content; v: PaperView }) {
  const t = c.paper;
  const { study: s, card: p, body } = v;
  const versions = [...(s.versions ?? [])].sort(VERSION_ORDER);
  const current = versions[0];
  const files = s['data-files'] ?? [];
  const takeaways = s['key-takeaways'] ?? [];
  const keys = s['key-numbers'] ?? [];
  const faq = s.faq ?? [];
  const download = files[0];
  const kind = fileKind(download?.url);
  const citation = apaCitation({ authors: v.authors.map((a) => a.name), date: s['published-date'], title: p.paperTitle || p.name, publisher: strip(t.citePublisher), slug: p.slug });
  const light = SERIES[p.series].ink !== '#ffffff';
  // Charts and images carried over from the blog post (blogVisual), placed as BlogBodyV3 places them: `hero` after the
  // opening text, `after-h2` after the section of that H2 (counted from 1, as on the blog), `end` after the body.
  const visuals = s.visuals ?? [];
  const visualsAfter = (i: number) =>
    visuals.filter((vis) => (i === 0 ? vis.position?.anchor === 'hero' : vis.position?.anchor === 'after-h2' && vis.position.h2Index === i));


  return (
    <div className={`v11 rs rs-paper is-${p.series}`}>
      <article>
        {/* ===================================================== hero */}
        <header className={`rs-hero ${onSeries(p.series)}`} data-hero={light ? 'light' : undefined} data-paper-name="G paper · hero">
          <div className="v11-wrap">
            {v.superseded && (
              <p className="rs-superseded"><span>{t.supersededLead}</span> <Link href={`/research/${v.superseded}`}><span>{t.supersededLink}</span> <span className="rs-arr">→</span></Link></p>
            )}
            <div className="rs-crumb">
              <nav aria-label="Breadcrumb"><Link href="/research"><b>{t.crumbRoot}</b></Link> / <span>{SERIES[p.series].name}</span></nav>
              <span><b>{p.kind}</b> · {longDate(p.date)}{current && <> · <span>{t.version}</span> {current.version}</>}</span>
            </div>
            <h1 className="rs-h1" data-speakable="">{p.name}</h1>
            <div className="rs-sub">
              <p className="rs-lede">
                {p.paperTitle && <><span>{p.paperTitle}</span>. </>}
                {p.sample && <b>{p.sample}</b>}
                {p.sample && p.engines.length > 0 && <> <span>{t.across}</span> <span>{listOf(p.engines)}</span></>}
                {p.sample && '.'}
              </p>
              <div className="rs-by">
                {v.authors.map((a) => <Byline key={a.slug ?? a.name} who={a} size={48} />)}
                {p.dataWindow && <p className="rs-win"><b>{t.dataWindow}</b><span>{p.dataWindow}</span></p>}
              </div>
            </div>
            <div className="rs-acts">
              <DownloadBtn file={download} kind={kind} label={t.download} className="v11-btn rs-btn-solid" />
              <a href="#data" className="v11-btn rs-btn-out"><span>{t.cite}</span></a>
            </div>
            {(p.lead || body.lead) && (
              <div className={`rs-lead${body.lead ? '' : ' is-solo'}`}>
                <X at="tl" /><X at="tr" />
                {p.lead && (
                  <div className="rs-giant-col">
                    {body.lead && <X at="tr" />}
                    <p className={`rs-giant${bigClass(p.lead.value)}`}><Big value={p.lead.value} /></p>
                    <p className="rs-giant-cap">{p.lead.label}</p>
                    {p.lead.note && <p className="rs-giant-src">{p.lead.note}</p>}
                  </div>
                )}
                {body.lead && (
                  <figure className="rs-lead-fig">
                    <figcaption className="rs-fig-label"><span className="is-n"><span>{t.figure}</span> {body.lead.n}</span><span className="is-t">{body.lead.title}</span></figcaption>
                    <Chart f={body.lead} {...seriesChart(p.series)} size="lg" />
                    <FigFoot f={body.lead} date={p.date} />
                  </figure>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ===================================================== key numbers */}
        {keys.length > 0 && (
          <section className="rs-keys" data-paper-name="G paper · key numbers">
            <div className="v11-wrap">
              <Kicker s={p.series}>{t.keyNumbers}</Kicker>
              <div className={`rs-kcells is-${keys.length}`}>
                {keys.map((k, i) => (
                  <div key={i} className="rs-kcell">
                    <X at="tr" />{i === keys.length - 1 && <X at="br" />}<X at="bl" />
                    <b>{k.value}</b>
                    <p>{k.label}</p>
                    {k.note && <span>{k.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================== takeaways, contents and the body */}
        <section className="rs-read" data-paper-name="G paper · reading">
          <div className="v11-wrap rs-read-in">
            <aside className="rs-rail">
              <p className="rs-rail-h">{t.contents}</p>
              <nav className="rs-toc sv-toc" aria-label={strip(t.contents)}>
                {takeaways.length > 0 && <a href="#takeaways">{t.takeaways}</a>}
                {body.toc.map((h) => (
                  <a key={h.id} href={`#${h.id}`}>{h.text}{h.figures.length > 0 && <span className="is-figs">{figureRange(h.figures, t)}</span>}</a>
                ))}
                <a href="#method">{t.method}</a>
                {s.limitations && <a href="#limitations">{t.limitations}</a>}
                {versions.length > 0 && <a href="#versions">{t.versions}</a>}
                <a href="#data">{t.data}</a>
                <TocSpy />
              </nav>
              <div className="rs-rail-tools">
                <DownloadBtn file={download} kind={kind} label={t.download} className="v11-btn rs-btn-w" />
                <a href="#data" className="v11-btn rs-btn-l"><span>{t.cite}</span></a>
              </div>
              <div className="rs-rail-meta">
                {p.sample && <p><b>{t.sample}</b><span>{p.sample}</span></p>}
                {p.engines.length > 0 && <p><b>{t.engines}</b><span>{p.engines.join(', ')}</span></p>}
                {current && <p><b>{t.version}</b><span>{current.version}, <span>{t.publishedOn}</span> {longDate(current.date)}</span></p>}
              </div>
            </aside>

            {takeaways.length > 0 && (
              <div className="rs-col">
                <p className="rs-label" id="takeaways">{t.takeaways}</p>
                <ul className="rs-take">{takeaways.map((k, i) => <li key={i}>{k}</li>)}</ul>
              </div>
            )}

            <div className="rs-body" data-lf-body="">
              {body.segments.map((seg, i) => (
                <Fragment key={i}>
                  {seg.trim() && <div className="rs-col rs-prose" dangerouslySetInnerHTML={{ __html: seg }} />}
                  {visualsAfter(i).map((vis, j) => <OldVisual key={vis._key ?? `${i}-${j}`} visual={vis} />)}
                  {body.after[i].map((f) => <NightFigure key={f.key} f={f} series={p.series} t={t} date={p.date} />)}
                </Fragment>
              ))}
              {visuals.filter((vis) => vis.position?.anchor === 'end').map((vis, j) => <OldVisual key={vis._key ?? `end-${j}`} visual={vis} />)}
            </div>
          </div>
        </section>

        {/* ===================================================== the figure band */}
        {body.band && (
          <section className={`rs-fband ${onSeries(p.series)}`} data-paper-name="G paper · figure band">
            <figure className="v11-wrap rs-fband-in">
              <figcaption className="rs-fband-cap">
                <p className="rs-fband-n"><span>{t.figure}</span> {body.band.n}</p>
                <h2>{body.band.title}</h2>
                {body.band.note && <p className="rs-fband-note">{body.band.note}</p>}
              </figcaption>
              <div className="rs-fband-chart">
                <Chart f={body.band} {...seriesChart(p.series)} size="lg" />
                <FigFoot f={body.band} date={p.date} />
              </div>
            </figure>
          </section>
        )}

        {/* ===================================================== method */}
        <section className="rs-method" data-paper-name="G paper · method">
          <div className="v11-wrap">
            <Head id="method" s={p.series} eyebrow={t.method} title={t.methodHeading} soft={t.methodHeadingSoft} body={t.methodBody} />
            <div className="rs-sheet">
              <div className={`rs-sheet-bar ${onSeries(p.series)}`}>
                <b><span className="rs-wordmark" role="img" aria-label="LoudFace" style={{ WebkitMaskImage: `url(${img('wordmark-white.svg')})`, maskImage: `url(${img('wordmark-white.svg')})` }} /><i /><span><span>{p.kind}</span>, <span>{t.methodSheet}</span></span></b>
                <span>{current ? <><span>{t.version}</span> {current.version} · {shortDate(current.date)}</> : shortDate(p.date)}</span>
              </div>
              <div className="rs-srow is-head" aria-hidden="true"><span className="f">{t.methodField}</span><span className="v">{t.methodValue}</span></div>
              <dl className="rs-rows-sheet">
                {p.sample && <div className="rs-srow"><dt className="f">{t.sample}</dt><dd className="v"><b>{p.sample}</b></dd></div>}
                {p.dataWindow && <div className="rs-srow"><dt className="f">{t.window}</dt><dd className="v">{p.dataWindow}</dd></div>}
                {p.engines.length > 0 && <div className="rs-srow"><dt className="f">{t.engines}</dt><dd className="v">{p.engines.join(', ')}</dd></div>}
                <div className="rs-srow"><dt className="f">{t.published}</dt><dd className="v">{longDate(p.date)}</dd></div>
                {p.updated && p.updated.slice(0, 10) !== p.date?.slice(0, 10) && <div className="rs-srow"><dt className="f">{t.updated}</dt><dd className="v">{longDate(p.updated)}</dd></div>}
              </dl>
              {s.methodology && <div className="rs-sheet-text rs-prose" dangerouslySetInnerHTML={{ __html: s.methodology }} />}
              {s.appendix && (
                <div className="rs-sheet-text rs-prose is-appendix">
                  <p className="rs-label">{t.appendix}</p>
                  <div dangerouslySetInnerHTML={{ __html: s.appendix }} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================== limitations, versions, data and citation */}
        <section className="rs-after" data-paper-name="G paper · limitations, versions, data, cite">
          <div className="v11-wrap rs-split">
            {s.limitations && (
              <div className="rs-block">
                <h3 id="limitations">{t.limitations}</h3>
                <div className="rs-limits" dangerouslySetInnerHTML={{ __html: s.limitations }} />
              </div>
            )}
            {versions.length > 0 && (
              <div className="rs-block">
                <h3 id="versions">{t.versions}</h3>
                <ul>
                  {versions.map((ver, i) => (
                    <li key={`${ver.version}-${ver.date}`} className="rs-ver">
                      <b><span><span>{t.version}</span> {ver.version} · {shortDate(ver.date)}</span>{i === 0 && <em>{t.current}</em>}</b>
                      {ver.note}
                    </li>
                  ))}
                  {!v.superseded && <li className="rs-ver is-next"><b><span><span>{t.version}</span> {nextVersion(current?.version)}</span></b>{t.nextVersionNote}</li>}
                </ul>
              </div>
            )}
            <div className="rs-block">
              <h3 id="data">{t.data}</h3>
              <ul>
                {files.length ? files.map((f) => <li key={f.url}><a href={f.url} className="rs-file" download>{f.label}</a>{f.note && <span className="rs-file-note">{f.note}</span>}</li>) : <li>{t.dataNone}</li>}
              </ul>
              {download && <div className="rs-btns"><DownloadBtn file={download} kind={kind} label={t.download} className="v11-btn rs-btn-w" /></div>}
              <div className="rs-cite">
                <p id="paper-citation">{citation}</p>
                <div className="rs-cite-bar"><span>{t.citeFormat}</span><CopyCitation target="paper-citation" label={t.copy} done={t.copied} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== questions (the post's FAQ; FAQPage JSON-LD in the route) */}
        {faq.length > 0 && (
          <section className="rs-faq" data-paper-name="G paper · questions">
            <div className="v11-wrap rs-faq-in">
              <div className="rs-faq-head">
                <p className="rs-label">{t.faqEyebrow}</p>
                <h2 id="questions" className="rs-faq-h">{t.faqHeading}</h2>
              </div>
              <dl className="rs-faq-list">
                {faq.map((f) => (
                  <div key={f.question} className="rs-faq-row">
                    <dt>{f.question}</dt>
                    <dd>{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}
      </article>

      {/* ===================================================== more research */}
      {v.more.length > 0 && (
        <section className="rs-more" data-paper-name="G paper · more research">
          <div className="v11-wrap">
            <div className="rs-head">
              <div>
                <p className="rs-kicker"><span>{t.moreEyebrow}</span></p>
                <h2 className="rs-h2"><span>{t.moreHeading}</span> <span className="is-soft">{t.moreHeadingSoft}</span></h2>
              </div>
              <Link href="/research" className="rs-all"><span>{t.allPapers}</span> <span className="rs-arr">→</span></Link>
            </div>
            <div className="rs-scards">{v.more.map((m) => <SeriesCard key={m.slug} p={m} read={t.read} />)}</div>
          </div>
        </section>
      )}

      <Closing c={{ ...home.closing, agenda: [] }} lede={t.closingLede} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}

/** "Figures 1 to 4", "Figures 2 and 3", "Figure 2" for the contents rail. */
function figureRange(ns: number[], t: C) {
  const sorted = [...ns].sort((a, b) => a - b);
  const run = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  if (sorted.length === 1) return <><span>{t.figure}</span> {sorted[0]}</>;
  if (sorted.length === 2) return <><span>{t.figures}</span> {sorted[0]} <span>{t.figuresAnd}</span> {sorted[1]}</>;
  if (run) return <><span>{t.figures}</span> {sorted[0]} <span>{t.figuresTo}</span> {sorted[sorted.length - 1]}</>;
  return <><span>{t.figures}</span> {sorted.join(', ')}</>;
}

/** The version after the current one, for the "next version" line ("1" → "2", "1.1" → "1.2"). */
function nextVersion(v?: string) {
  const m = v?.match(/^(.*?)(\d+)$/);
  return m ? `${m[1]}${Number(m[2]) + 1}` : '';
}

/** The line under a chart: its source, and the paper's date. */
function FigFoot({ f, date }: { f: NumberedFigure; date?: string }) {
  if (!f.source) return null;
  return <p className="rs-figfoot"><span>{f.source}</span><span>{shortDate(date)}</span></p>;
}

/** A body figure: a night panel under a strip in the series colour (figure number and title), the source and note under it. */
function NightFigure({ f, series, t, date }: { f: NumberedFigure; series: PaperCard['series']; t: C; date?: string }) {
  return (
    <figure className="rs-nfig">
      <figcaption className={`rs-nfig-h ${onSeries(series)}`}><span className="is-n"><span>{t.figure}</span> {f.n}</span><span className="is-t">{f.title}</span></figcaption>
      <div className="rs-nfig-b">
        <Chart f={f} {...NIGHT_CHART} size="lg" accent={LIT[series]} />
        <FigFoot f={f} date={date} />
        {f.note && <p className="rs-nfig-note">{f.note}</p>}
      </div>
    </figure>
  );
}

/** A chart or image carried over from the blog post, on a night panel in the reading column. */
function OldVisual({ visual }: { visual: BlogVisualType }) {
  return (
    <figure className="rs-col rs-oldvis">
      <BlogVisual visual={visual} />
    </figure>
  );
}

/** "Download the data (CSV)": only when the paper publishes a data file. */
function DownloadBtn({ file, kind, label, className }: { file?: { url: string }; kind?: string; label: string; className: string }) {
  if (!file) return null;
  return <a href={file.url} className={className} download><span>{label}</span>{kind && ` (${kind})`}</a>;
}
