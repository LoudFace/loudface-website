import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { HomeV11Content, WorkV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from '../home-v11/data';
import { ServiceResults } from '../service-v11/proof';
import type { CaseStudy, Client } from '@/lib/types';
import { getTintColors } from '@/lib/color-utils';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { KeyResults } from '../home-v11/KeyResults';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, SectionHeadNode, img } from '../home-v11/ui';
import { caseSeries, leadKind, sourceName, splitTitle, standaloneCharts } from '../case-v11/series';
import { LiveChart, type ValueFormat } from '../home-v11/LiveChart';
import { BeforeAfterChart } from '../home-v11/BeforeAfterChart';
import type { Series } from '../home-v11/data';
import { strip } from '@/lib/inline-edit/mark';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';
import type { ProofKey } from '../home-v11/data';
import { proofValue } from '../home-v11/hero-slides';

/**
 * The /case-studies index in v11 (DESIGN.md §6, §7). Copy in src/data/content/work-v11.json; every card is a live
 * Sanity study. References from the 2026-09-25 harvest (design-lab/harvest/2026-09-25/services-hub, work-tagged):
 * a big title over a mosaic of stories (174 Ramp), cards on the client's own colour (185 Maze) and a filter row over
 * grouped stories (153 Retool). The hero's picture is the page's promise ("receipts attached"): the flagship studies'
 * own published charts, in the result cells the service pages use (2026-09-25; replaced four drawn paper receipts).
 */

type Study = CaseStudy & { id: string };

const DISCIPLINES = ['AI Search & Organic Growth', 'Conversion Optimization', 'Web Design & Branding'];
const DISCIPLINE_ID: Record<string, string> = {
  'AI Search & Organic Growth': 'ai-search', 'Conversion Optimization': 'conversion', 'Web Design & Branding': 'web-design',
};
const FALLBACK = 'Web Design & Branding';
const THUMB = '?w=1000&h=625&fit=crop&crop=top&fm=webp&q=80';

/**
 * The picture a card can draw from the study's own data (Arnel, 2026-09-27: "each case study is instead a chart, at
 * least for the ones that are performance-based"): the chart the study page leads with when its series stands alone,
 * or the study's own "a → b" figures as two columns. Null when the study publishes neither; the card keeps its shot.
 */
type Steps = { title: string; source?: string; points: { label: string; value: string }[] };
type CardChart = { kind: 'steps'; steps: Steps; title: string; source?: string } | { kind: 'series'; series: Series; format: ValueFormat; tip: string; title: string; source?: string } | { kind: 'pair'; before: number; after: number; beforeText: string; afterText: string; title: string; source?: string };
const TIP = { ai: 'of AI answers', google: 'of the baseline day', leads: 'of the baseline weeks' } as const;
function cardChart(s: Study, indexed = false, steps?: Record<string, Steps>): CardChart | null {
  // a study's own published readings over time, from work-v11.json (Toku: three Peec reads, 2026-09-27)
  const st = s.slug ? steps?.[s.slug] : undefined;
  if (st) return { kind: 'steps', steps: st, title: st.title, source: st.source };
  const c = standaloneCharts(caseSeries(s.instruments));
  if (c.ai || c.google || c.leads) {
    const k = leadKind(c, s['result-1---title'] ?? '');
    if (k === 'google' && c.google) return { kind: 'series', series: c.google.series, format: 'index', tip: TIP.google, title: 'Google impressions per day', source: sourceName(c.google.source) };
    if (k === 'ai' && c.ai) return { kind: 'series', series: c.ai.series, format: 'pct', tip: TIP.ai, title: chartTitle(c.ai.title), source: sourceName(c.ai.source) };
    if (k === 'leads' && c.leads) return { kind: 'series', series: c.leads.series, format: 'index', tip: TIP.leads, title: chartTitle(c.leads.title), source: sourceName(c.leads.source) };
  }
  const m = (s['result-1---number'] ?? '').match(/^\s*([\d.]+)(%?)\s*→\s*([\d.]+)(%?)\s*$/);
  if (m) return { kind: 'pair', before: Number(m[1]), after: Number(m[3]), beforeText: `${m[1]}${m[2] || m[4]}`, afterText: `${m[3]}${m[4]}`, title: splitTitle(s['result-1---title'] ?? '').label };
  if (!indexed) return null;
  // A single published growth figure ("+49%", "2×") drawn as start → end, indexed to the start (Arnel, 2026-09-27:
  // "why don't they also have charts?"). Only the ratio is published, so the columns carry no raw counts.
  const title = splitTitle(s['result-1---title'] ?? '').label;
  const pct = (s['result-1---number'] ?? '').match(/^\s*\+\s*([\d.]+)\s*%\s*$/);
  if (pct) return { kind: 'pair', before: 100, after: 100 + Number(pct[1]), beforeText: 'Start', afterText: `+${pct[1]}%`, title, source: 'Indexed to the start' };
  const mult = (s['result-1---number'] ?? '').match(/^\s*([\d.]+)\s*[×x]\s*$/i);
  if (mult) return { kind: 'pair', before: 1, after: Number(mult[1]), beforeText: '1×', afterText: `${mult[1]}×`, title, source: 'Indexed to the start' };
  return null;
}
/** A chart's title without its cadence suffix (", weekly"), as on the study page. */
const chartTitle = (t: string) => t.replace(/,\s*(weekly|daily|indexed)$/i, '').split('·')[0].trim();
const monthYear = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function ChartPic({ chart, lead }: { chart: CardChart; lead?: boolean }) {
  const h = lead ? 400 : 190;
  if (chart.kind === 'steps') return <div className="wk-card-chart is-pair"><StepColumns steps={chart.steps} /></div>;
  if (chart.kind === 'pair') {
    return (
      <div className="wk-card-chart is-pair">
        <BeforeAfterChart pairs={[{ label: '', before: chart.before, after: chart.after, beforeText: chart.beforeText, afterText: chart.afterText }]} height={h} />
      </div>
    );
  }
  const d = chart.series.dates;
  return (
    <div className="wk-card-chart">
      <LiveChart series={chart.series} height={h} margin={{ top: 34, right: 14, bottom: 6, left: 12 }} dots={false} hatch lineWidth={lead ? 2 : 1.75} barGap={chart.series.bars ? 0.42 : 0.5} pin={lead ? 24 : 20} end="halo" tip={chart.tip} format={chart.format} />
      <div className="wk-card-dates"><span>{monthYear(d[0])}</span><span>{monthYear(d[d.length - 1])}</span></div>
    </div>
  );
}

/** Published readings over time as rising columns, the last one lit; heights read from the figures themselves. */
function StepColumns({ steps }: { steps: Steps }) {
  const vals = steps.points.map((p) => parseFloat(strip(p.value)) || 0);
  const max = Math.max(...vals, 0.0001) * 1.18;
  return (
    <div className="wk-steps">
      <div className="wk-steps-plot">
        {steps.points.map((p, i) => (
          <div key={p.label} className={`wk-steps-col ${i === steps.points.length - 1 ? 'is-last' : ''}`}>
            <b>{p.value}</b>
            <i style={{ height: `${(vals[i] / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="wk-steps-keys">{steps.points.map((p) => <span key={p.label}>{p.label}</span>)}</div>
    </div>
  );
}

/**
 * A results study as one wide row (Arnel, 2026-09-27, pointing at graphite.io's case studies): the client, the study
 * and its lead figure on the left; its own chart, with axis and the "LoudFace starts" pin, across the right.
 */
/**
 * The studies' own logos, already white, for the rows on the stage: none of these studies carries a logo in Sanity
 * (Arnel, 2026-09-27: "use the actual logos here of each brand"). Files from the brands' sites (openbrand for Delshad),
 * trimmed; Genie recoloured white. The stealth study keeps its name as text. Delshad's lockup is tall, so it runs larger.
 */
const ROW_LOGOS: Record<string, { file: string; w: number; h: number; size?: number }> = {
  'toku-ai-cited-pipeline': { file: 'logos/toku-white.png', w: 285, h: 80 },
  'loudface-aeo-case-study': { file: 'wordmark-white.svg', w: 133, h: 28 },
  'trademomentum-niche-aeo-organic-growth': { file: 'logos/trademomentum-white.png', w: 380, h: 76, size: 30 },
  'delshad-legal-content-engine': { file: 'logos/delshad-white.png', w: 355, h: 100, size: 44 },
  'genie-teacher-organic-growth': { file: 'logos/genie-white.png', w: 201, h: 64, size: 28 },
};

function StudyRow({ s, clients, chart, onStage }: { s: Study; clients: Map<string, Client>; chart: CardChart; onStage?: boolean }) {
  const name = nameOf(s, clients);
  const logo = s['client-logo']?.url;
  const own = !logo ? ROW_LOGOS[s.slug] : undefined;
  const r = s['result-1---title'] ? splitTitle(s['result-1---title']) : undefined;
  return (
    <Link href={`/case-studies/${s.slug}`} className="wk-row">
      <div className="wk-row-copy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img loading="lazy" className="wk-card-logo" src={cachedCmsImage(logo, 384)} alt={name} /> : own ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" className="wk-card-logo is-own" src={img(own.file)} alt={name} width={own.w} height={own.h} style={{ height: own.size ?? 24 }} />
        ) : <span className="wk-card-name">{name}</span>}
        <p className="wk-row-title">{s['project-title'] || s.name}</p>
        {/* an "a → b" pair runs twice as wide as a single figure, so it takes the smaller size */}
        <div className={`wk-row-num ${(s['result-1---number'] ?? '').length > 7 ? 'is-long' : ''}`}>
          <b>{s['result-1---number']}</b>
          {r && <span>{r.label}</span>}
        </div>
      </div>
      <div className="wk-row-chart">
        <div className="wk-row-k"><span>{chart.title}</span>{chart.source && <span className="is-src">{chart.source}</span>}</div>
        {chart.kind === 'steps' ? <StepColumns steps={chart.steps} /> : chart.kind === 'series' ? (
          <LiveChart series={chart.series} height={300} margin={{ top: 46, right: 18, bottom: 30, left: 14 }} tone={onStage ? 'stage' : 'light'} axis dots={false} hatch lineWidth={2} barGap={chart.series.bars ? 0.42 : 0.5} pin={24} startPrefix="LoudFace starts" end="halo" tip={chart.tip} format={chart.format} />
        ) : (
          <div className="wk-row-pair"><BeforeAfterChart pairs={[{ label: '', before: chart.before, after: chart.after, beforeText: chart.beforeText, afterText: chart.afterText }]} height={300} /></div>
        )}
      </div>
    </Link>
  );
}

/** A smaller results study on the stage: its client, its lead figure, what it measures and the study (2026-09-27). */
function ResultCard({ s, clients }: { s: Study; clients: Map<string, Client> }) {
  const name = nameOf(s, clients);
  const logo = s['client-logo']?.url;
  const r = s['result-1---title'] ? splitTitle(s['result-1---title']) : undefined;
  return (
    <Link href={`/case-studies/${s.slug}`} className="wk-mini">
      <div className="wk-card-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img loading="lazy" className="wk-card-logo" src={cachedCmsImage(logo, 384)} alt={name} /> : <span className="wk-card-name">{name}</span>}
        <span className="wk-card-go" aria-hidden="true"><ArrowUpRight /></span>
      </div>
      <div className="wk-mini-num">
        <b>{s['result-1---number']}</b>
        {r && <span>{r.label}</span>}
      </div>
      <p className="wk-mini-title">{s['project-title'] || s.name}</p>
    </Link>
  );
}

const nameOf = (s: Study, clients: Map<string, Client>) => (s.client && clients.get(s.client)?.name) || s.name.split(':')[0].trim();
const primary = (s: Study) => (Array.isArray(s.disciplines) && s.disciplines[0]) || FALLBACK;

function Card({ s, clients, lead, cta, charts }: { s: Study; clients: Map<string, Client>; lead?: boolean; cta: string; charts?: boolean }) {
  const name = nameOf(s, clients);
  const t = getTintColors(s['client-color']);
  const r = s['result-1---title'] ? splitTitle(s['result-1---title']) : undefined;
  const logo = s['client-logo']?.url;
  const thumb = s['main-project-image-thumbnail']?.url;
  const chart = charts ? cardChart(s) : null;
  return (
    <Link href={`/case-studies/${s.slug}`} className={`wk-card ${lead ? 'is-lead' : ''}`} style={{ '--c-base': t.base, '--c-glow': t.glow, '--c-clear': t.clear } as CSSProperties}>
      <div className={`wk-card-pic ${chart ? 'has-chart' : ''}`}>
        {chart && <ChartPic chart={chart} lead={lead} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {!chart && thumb && <img src={cachedCmsImage(`${thumb}${THUMB}`, 1080)} srcSet={cachedCmsSrcSet(`${thumb}${THUMB}`, [640, 1080])} sizes="(max-width: 767px) 92vw, 50vw" alt={s['main-project-image-thumbnail']?.alt || name} loading="lazy" width={1000} height={625} />}
      </div>
      <div className="wk-card-body">
        <div className="wk-card-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img loading="lazy" className="wk-card-logo" src={cachedCmsImage(logo, 384)} alt={name} /> : <span className="wk-card-name">{name}</span>}
          <span className="wk-card-go" aria-hidden="true"><ArrowUpRight /></span>
        </div>
        {s['result-1---number'] && (
          <div className="wk-card-result">
            <b>{s['result-1---number']}</b>
            {r && <span>{r.label}</span>}
          </div>
        )}
        <p className="wk-card-title">{s['project-title'] || s.name}</p>
        {lead && s['paragraph-summary'] && <p className="wk-card-sum">{s['paragraph-summary']}</p>}
        {lead && <span className="wk-card-cta">{cta}<ArrowRight /></span>}
      </div>
    </Link>
  );
}

/** The client figures in `proof.items` after the three agency facts, in order. */
const CLIENT_PROOF: ProofKey[] = ['toku', 'dimer'];

export function WorkIndexV11({ c, home, data, studies, clients, charts, rows, stage }: { c: WorkV11Content; home: HomeV11Content; data: HomeV11Data | null; studies: Study[]; clients: Map<string, Client>; charts?: boolean; rows?: boolean; stage?: boolean }) {
  const list = studies.filter((s) => s.slug);
  const groups = DISCIPLINES.map((d) => ({
    d,
    items: list
      .filter((s) => (DISCIPLINES.includes(primary(s)) ? primary(s) : FALLBACK) === d)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
  })).filter((g) => g.items.length);
  return (
    <div className="v11 wk">
      {/* 1 · the promise, then its proof: the flagship studies' published charts */}
      <section className="wk-hero" data-hero="light">
        <div className="v11-wrap wk-hero-grid">
          <div className="wk-hero-copy">
            <div className="wk-hero-eyebrow"><span>{c.hero.eyebrow}</span><span className="is-sub">{list.length} {c.hero.studiesLabel}</span></div>
            <h1>{c.hero.headline} <span className="ghost">{c.hero.headlineHighlight}</span></h1>
            <p>{c.hero.description}</p>
            <div className="wk-hero-ctas">
              <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.hero.ctaText}</span></a>
              <a href="#archive" className="v11-link wk-tap"><span>{c.hero.jumpText}</span><ArrowRight /></a>
            </div>
          </div>
        </div>
        <div className="v11-wrap wk-hero-proof" aria-label={strip(c.hero.receiptLabel)}>
          <ServiceResults slug="case-studies" home={home} data={data} />
        </div>
      </section>

      {/* 2 · the archive, grouped by what the study was for (153 Retool filter row, 185 Maze cards) */}
      {(() => {
        const filter = (
          <div className="wk-filter" aria-label={strip(c.archive.filterLabel)}>
            <span className="is-label">{c.archive.filterLabel}</span>
            <a href="#archive" className="wk-chip is-on"><span>{c.archive.allLabel}</span><b>{list.length}</b></a>
            {groups.map((g) => <a key={g.d} href={`#${DISCIPLINE_ID[g.d]}`} className="wk-chip"><span>{g.d}</span><b>{g.items.length}</b></a>)}
          </div>
        );
        const group = (g: (typeof groups)[number], gi: number, onStage = false) => (
          <div key={g.d} className="wk-group" id={DISCIPLINE_ID[g.d]}>
            <div className="wk-group-head"><h2>{g.d}</h2><span>{g.items.length} {c.hero.studiesLabel}</span></div>
            {rows ? (() => {
              // results studies with their own chart as wide rows, the rest as cards under them
              const charted = g.items.map((s) => ({ s, chart: cardChart(s, true) })).filter((x): x is { s: Study; chart: CardChart } => !!x.chart);
              const rest = g.items.filter((s) => !charted.some((x) => x.s === s));
              return (
                <>
                  {charted.length > 0 && <div className="wk-rows">{charted.map(({ s, chart }) => <StudyRow key={s.slug} s={s} clients={clients} chart={chart} onStage={onStage} />)}</div>}
                  {rest.length > 0 && <div className="wk-grid">{rest.map((s) => <Card key={s.slug} s={s} clients={clients} cta={c.archive.caseLinkText} />)}</div>}
                </>
              );
            })() : (
              <div className="wk-grid">
                {g.items.map((s, i) => <Card key={s.slug} s={s} clients={clients} lead={gi === 0 && i === 0} cta={c.archive.caseLinkText} charts={charts} />)}
              </div>
            )}
          </div>
        );
        // stage variant (Arnel, 2026-09-27: "too white"): the results studies on the homepage's indigo stage
        if (stage) {
          // Headline results (a chart of their own) on the stage, then the smaller results as one row of equal cards,
          // then the design studies on white (Arnel, 2026-09-27: "a headline section and then smaller cards").
          const results = groups.filter((g) => g.d !== 'Web Design & Branding').flatMap((g) => g.items);
          const steps: Record<string, Steps> = Object.fromEntries(c.steps.map((x) => [x.slug, x]));
          const headline = results.map((s) => ({ s, chart: cardChart(s, false, steps) })).filter((x): x is { s: Study; chart: CardChart } => !!x.chart);
          const more = results.filter((s) => !headline.some((x) => x.s === s));
          const rest = groups.filter((g) => g.d === 'Web Design & Branding');
          const chips = (
            <div className="wk-filter" aria-label={strip(c.archive.filterLabel)}>
              <span className="is-label">{c.archive.filterLabel}</span>
              <a href="#archive" className="wk-chip is-on"><span>{c.archive.allLabel}</span><b>{list.length}</b></a>
              {/* two tabs, not one per block (Arnel, 2026-09-27): the growth results on the stage, then the design work */}
              <a href="#results" className="wk-chip"><span>{c.archive.growthChip}</span><b>{results.length}</b></a>
              {rest.map((g) => <a key={g.d} href={`#${DISCIPLINE_ID[g.d]}`} className="wk-chip"><span>{c.archive.designChip}</span><b>{g.items.length}</b></a>)}
            </div>
          );
          return (
            <>
              <section className="v11-sec v11-white wk-archive is-top" id="archive"><div className="v11-wrap">{chips}</div></section>
              <section className="wk-stage" id="results">
                <div className="v11-wrap">
                  {/* no heading over the charts (Arnel, 2026-09-27): the rows open the stage on their own */}
                  <div className="wk-group" id="headline">
                    <div className="wk-rows">{headline.map(({ s, chart }) => <StudyRow key={s.slug} s={s} clients={clients} chart={chart} onStage />)}</div>
                  </div>
                  {more.length > 0 && (
                    <div className="wk-group is-more" id="more">
                      <div className="wk-group-head"><h2>{c.archive.moreTitle}</h2><span>{more.length} {c.hero.studiesLabel}</span></div>
                      <div className="wk-minis">{more.map((s) => <ResultCard key={s.slug} s={s} clients={clients} />)}</div>
                    </div>
                  )}
                </div>
              </section>
              <section className="v11-sec v11-white wk-archive is-rest"><div className="v11-wrap">{rest.map((g, i) => group(g, i + 1))}</div></section>
            </>
          );
        }
        return (
          <section className="v11-sec v11-white wk-archive" id="archive">
            <div className="v11-wrap">{filter}{groups.map((g, gi) => group(g, gi))}</div>
          </section>
        );
      })()}

      <LogoGrid c={home.logos} />

      {/* 3 · the numbers we stand behind, and how to read the studies */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.proof.eyebrow} title={<>{c.proof.headline} <span className="ghost">{c.proof.headlineHighlight}</span></>} body={c.proof.body} bodyWidth={440} />
          <KeyResults items={c.proof.items.slice(0, 3).map((k) => ({ value: k.value, label: k.label }))} />
          {/* the client figures (Toku, Dimer Health) are their case studies' published results, never typed copies */}
          <KeyResults items={c.proof.items.slice(3).map((k, i) => ({ value: proofValue(data, CLIENT_PROOF[i]) ?? '', label: k.label, note: k.note }))} />
          <div className="wk-read">
            <div className="wk-read-main">
              <h3>{c.receipts.headline} <span className="ghost">{c.receipts.headlineHighlight}</span></h3>
              <p>{c.receipts.body}</p>
            </div>
            <ul className="wk-read-points">
              {c.receipts.points.map((p) => <li key={p.title}><b>{p.title}</b><span>{p.text}</span></li>)}
            </ul>
          </div>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: c.closing.heading }} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
