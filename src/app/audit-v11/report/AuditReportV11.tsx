import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import servicesContent from '@/data/content/services.json';
import type { AuditReportV11Content, HomeV11Content } from '@/lib/content-utils';
import type { BenchmarkContext } from '@/lib/audit/benchmarks';
import { getTrafficLight } from '@/lib/audit/scoring';
import type { ActionItem, AIPlatform, AuditResults, OverallGrade, PlatformResult, TrafficLight } from '@/lib/audit/types';
import { formatWrongEntity, type EntityConfidenceSignal } from '../../(audit)/audit/_components/EntityConfidenceBanner';
import { ChatWindow } from '../../home-v11/Bento';
import { Closing } from '../../home-v11/Closing';
import { ArrowRight, Eyebrow, img } from '../../home-v11/ui';
import { Queries, Scorecard, type QueryView, type ScoreView } from '../AuditPageV11';
import { placeLabels, yTop, type LandPoint } from './landscape';

/**
 * AuditReportV11: the automated audit report (/audit/<id>) in v11 (2026-09-26). The same results and the same
 * logic as the slide deck (AuditDeck), set as one light report page instead of fifteen dark slides: the verdict and
 * scorecard first, then each phase with its own query table and what it means, the landscape, the engines, the plan.
 * Copy and labels live in audit-report-v11.json; sentences built from results render each copy fragment in its own span.
 *
 * Review fixes 2026-09-26: every brand chart plots one measure (the Phase 3 mention rate, "discovery visibility");
 * the method is folded into each phase's head; the landscape is a grid-aligned chart with ticks and values (a ranked
 * list on phones); the engines sit in one table; the plan is grouped by priority and each link names its service.
 */

type Tone = 'good' | 'warn' | 'bad';
const TONE: Record<TrafficLight, Tone> = { green: 'good', amber: 'warn', red: 'bad' };
const GRADE_TONE: Record<OverallGrade, Tone> = { A: 'good', B: 'good', C: 'warn', D: 'bad', F: 'bad' };
const ENGINE: Record<AIPlatform, { name: string; icon: string }> = {
  chatgpt: { name: 'ChatGPT', icon: 'fav-chatgpt.webp' },
  claude: { name: 'Claude', icon: 'fav-claude.png' },
  gemini: { name: 'Gemini', icon: 'fav-gemini.png' },
  perplexity: { name: 'Perplexity', icon: 'fav-perplexity.png' },
};
const ORDER: AIPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];
const PRIORITIES: ActionItem['priority'][] = ['high', 'medium', 'low'];

/** A plan item's service, named as the services hub names it (services.json), keyed by the page it links to. */
const SERVICE_NAME = new Map(servicesContent.index.entries.map((e) => [`/services/${e.slug}`, e.serviceName]));

/** A question's row: whether each engine (in ORDER) named the brand. */
const hits = (results: PlatformResult[]) => ORDER.map((p) => results.find((r) => r.platform === p)?.mentioned ?? false);

function Head({ eyebrow, title, method, lede }: { eyebrow: string; title: string; method?: ReactNode; lede?: ReactNode }) {
  return (
    <div className="sv-head ar-head">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="v11-h2">{title}</h2>
        {method && <p className="ar-method">{method}</p>}
      </div>
      {lede && <p>{lede}</p>}
    </div>
  );
}

/** A phase's protocol line under its heading: how many questions this audit asked, and what they cover. */
function Method({ n, unit, detail }: { n: number; unit: string; detail: string }) {
  return <><span>{n}</span> <span>{unit}</span><span aria-hidden="true"> · </span><span>{detail}</span></>;
}

function Engine({ p, size = 20 }: { p: AIPlatform; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img(`logos/${ENGINE[p].icon}`)} alt="" width={size} height={size} style={{ borderRadius: size * 0.28 }} />;
}

export interface AuditReportProps {
  results: AuditResults;
  companyName: string;
  domain: string;
  auditDate: string;
  entityConfidence?: EntityConfidenceSignal;
  partialDataReason?: string;
  benchmarkContext?: BenchmarkContext | null;
}

export function AuditReportV11({ r, c, home }: { r: AuditReportProps; c: AuditReportV11Content; home: HomeV11Content }) {
  const { results, companyName: name } = r;
  const s = results.scores;
  const b = results.brandBaseline;
  const cc = results.competitorContext;
  const cv = results.categoryVisibility;
  const L = c.scorecard;
  const st = (t: TrafficLight) => L.status[t];
  const date = new Date(r.auditDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const host = r.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const signal: EntityConfidenceSignal = r.entityConfidence ?? { low: false, brandRecognitionScore: b.brandRecognitionScore };
  const engines = ORDER.map((p) => ENGINE[p].name);

  // Discovery visibility for every tracked brand: the share of the Phase 3 category answers that name it. The brand's
  // is scores.discoveryVisibility; a competitor's is its shareOfVoiceByCompetitor entry, which the pipeline fills with
  // that competitor's mention rate on the same answers (pipeline.ts, "Phase 3 SoV Population"). Share of voice is a
  // different measure (the brand's slice of all those mentions), so it stays in the scorecard and the landscape's y.
  const rates = Object.entries(cc.shareOfVoiceByCompetitor);
  const named = [
    { brand: name, value: s.discoveryVisibility, self: true },
    ...rates.map(([brand, value]) => ({ brand, value, self: false })),
  ].sort((a, z) => z.value - a.value || Number(z.self) - Number(a.self));
  const leader = named[0];

  const standingLight: TrafficLight = s.competitiveStandingAvailable
    ? getTrafficLight(s.competitorsTracked > 0 ? 100 - (s.competitiveStanding / s.competitorsTracked) * 100 : 0)
    : 'amber';
  const score: ScoreView = {
    label: c.cover.eyebrow,
    company: name,
    scorecardTitle: L.title,
    grade: s.overallGrade,
    gradeLabel: L.gradeLabel,
    gradeTone: GRADE_TONE[s.overallGrade],
    metrics: [
      { label: L.metrics.brand, value: `${s.brandRecognition}%`, status: st(getTrafficLight(s.brandRecognition, 'discoveryVisibility')), tone: TONE[getTrafficLight(s.brandRecognition, 'discoveryVisibility')] },
      { label: L.metrics.discovery, value: `${s.discoveryVisibility}%`, status: st(getTrafficLight(s.discoveryVisibility, 'discoveryVisibility')), tone: TONE[getTrafficLight(s.discoveryVisibility, 'discoveryVisibility')] },
      { label: L.metrics.voice, value: `${s.shareOfVoice}%`, status: st(getTrafficLight(s.shareOfVoice, 'shareOfVoice')), tone: TONE[getTrafficLight(s.shareOfVoice, 'shareOfVoice')] },
      { label: L.metrics.standing, value: s.competitiveStandingAvailable ? `#${s.competitiveStanding}` : L.unranked, status: st(standingLight), tone: TONE[standingLight], note: s.competitiveStandingAvailable ? undefined : L.unrankedNote },
      { label: L.metrics.coverage, value: `${s.platformCoverage}/4`, status: st(getTrafficLight(s.platformCoverage * 25)), tone: TONE[getTrafficLight(s.platformCoverage * 25)] },
    ],
    voiceTitle: L.metrics.voice,
    // the brands are compared in phase 3, so the hero card leaves the bars out
    voice: [],
  };
  const table = (title: string, note: string, value: number, queries: { prompt: string; results: PlatformResult[] }[]): QueryView => ({
    label: c.cover.eyebrow, company: name, queriesTitle: title,
    queriesNote: note, queriesScore: `${value}%`, scoreTone: TONE[getTrafficLight(value)],
    engines, queries: queries.map((q) => ({ prompt: q.prompt, hits: hits(q.results) })),
  });
  const baselineTable = table(c.baseline.tableTitle, c.baseline.scoreLabel, b.brandRecognitionScore, b.queries);
  const competitorTable = table(c.competitors.tableTitle, c.competitors.rateLabel, cc.competitiveRecommendationRate, cc.queries);
  const categoryTable = table(c.category.tableTitle, cv.inferredCategory, cv.categoryDiscoveryRate, cv.queries);

  // the landscape (as MarketPositionSlide): x = discovery visibility, y = share of the mention pool (share of voice)
  const pool = s.discoveryVisibility + rates.reduce((t, [, v]) => t + v, 0);
  const land: LandPoint[] = [
    { label: name, x: s.discoveryVisibility, y: s.shareOfVoice, self: true },
    ...rates.map(([label, v]) => ({ label, x: v, y: pool > 0 ? Math.round((v / pool) * 100) : 0, self: false })),
  ];
  const top = yTop(Math.max(...land.map((p) => p.y)));
  const placed = placeLabels(land, top);
  const ranked = [...land].sort((a, z) => z.y - a.y || z.x - a.x || Number(z.self) - Number(a.self));

  // why it matters: the first unbranded question where an engine answered without naming the brand (ChatGPT first)
  const missed = (() => {
    for (const p of ORDER) {
      for (const q of cv.queries) {
        const res = q.results.find((x) => x.platform === p && !x.mentioned && x.snippet.trim().length > 40);
        if (!res) continue;
        const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
        const src = res.sources.map((x) => hostOf(x.url)).filter(Boolean);
        return {
          engine: ENGINE[p].name,
          chat: { ...home.bento.chat, model: ENGINE[p].name, question: q.prompt, answerLead: res.snippet.trim(), answerBrand: '', answerTail: '', sourceOne: src[0] ?? '', sourceTwo: src[1] ?? '' },
        };
      }
    }
    return null;
  })();

  const plan = PRIORITIES.map((p) => ({ p, items: results.actionItems.filter((a) => a.priority === p) })).filter((g) => g.items.length > 0);

  const banners = (
    <>
      {signal.low && (
        <div className="ar-banner is-warn">
          <b>{signal.wrongEntityDescription ? c.confidence.wrongTitle : c.confidence.lowTitle}</b>
          <p>
            {signal.wrongEntityDescription
              ? `${formatWrongEntity(signal.wrongEntityDescription)} Numeric results below reflect mentions of that other entity, not your brand.`
              : `Only ${signal.brandRecognitionScore}% of branded queries recognized this brand, and the category could not be inferred with confidence. Share-of-voice and competitor numbers below should be read as a starting baseline, not a verdict.`}
          </p>
        </div>
      )}
      {r.partialDataReason && <div className="ar-banner is-info"><b>{c.confidence.partialTitle}</b><p>{r.partialDataReason}</p></div>}
    </>
  );

  // The sections between the verdict and the closing, in order; grounds alternate warm and white whatever is skipped.
  const sections: { id: string; body: (bg: string) => ReactNode }[] = [];

  // Phase 1: what AI says when asked by name, then what it gets right and wrong
  sections.push({ id: 'baseline', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head
          eyebrow={c.baseline.eyebrow}
          title={c.baseline.title}
          method={<Method n={b.queries.length} unit={c.method.queriesUnit} detail={c.baseline.method} />}
          lede={<><span>{c.baseline.ledeLead}</span> <span>{b.queries.length}</span> <span>{c.baseline.ledeTail}</span> <span>{name}</span>.</>}
        />
        <div className="ar-split">
          <div className="au-q-pic"><Queries x={baselineTable} /></div>
          <div className="ar-facts">
            <h3>{c.baseline.rightTitle}</h3>
            {b.accurateInfo.length > 0
              ? <ul className="ar-list is-good">{b.accurateInfo.map((t) => <li key={t}>{t}</li>)}</ul>
              : <p className="ar-empty">{c.baseline.rightEmpty}</p>}
            {b.gaps.length > 0 && <><h3>{c.baseline.gapsTitle}</h3><ul className="ar-list is-warn">{b.gaps.map((t) => <li key={t}>{t}</li>)}</ul></>}
            {b.inaccuracies.length > 0 && <><h3>{c.baseline.wrongTitle}</h3><ul className="ar-list is-bad">{b.inaccuracies.map((t) => <li key={t}>{t}</li>)}</ul></>}
            {b.gaps.length === 0 && b.inaccuracies.length === 0 && <p className="ar-empty">{c.baseline.wrongEmpty}</p>}
          </div>
        </div>
      </div>
    </section>
  ) });

  // Phase 2: alternative-to questions, the recommendation rate they give, and the competitors behind them
  sections.push({ id: 'competitors', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head
          eyebrow={c.competitors.eyebrow}
          title={c.competitors.title}
          method={<Method n={cc.queries.length} unit={c.method.queriesUnit} detail={c.competitors.method} />}
          lede={<><span>{c.competitors.ledeLead}</span> <span>{name}</span> <span>{c.competitors.ledeTail}</span></>}
        />
        <div className="ar-split">
          <div className="au-q-pic"><Queries x={competitorTable} /></div>
          <div className="ar-facts">
            <h3><span>{c.competitors.trackedTitle}</span> <span className="ar-count">({cc.competitors.length})</span></h3>
            <ul className="ar-comps">
              {cc.competitors.map((m) => (
                <li key={m.domain}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=64`} alt="" width={20} height={20} />
                  <b>{m.name}</b><span>{m.domain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  ) });

  // Phase 3: unbranded category questions, then every tracked brand on the same measure
  sections.push({ id: 'category', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head
          eyebrow={c.category.eyebrow}
          title={c.category.title}
          method={<Method n={cv.queries.length} unit={c.method.queriesUnit} detail={c.category.method} />}
          lede={<><span>{c.category.ledeLead}</span> <span>{cv.inferredCategory}</span> <span>{c.category.ledeMid}</span> <span>{name}</span> <span>{c.category.ledeTail}</span></>}
        />
        <div className={rates.length > 0 ? 'ar-split' : 'ar-wide'}>
          <div className="au-q-pic"><Queries x={categoryTable} /></div>
          {rates.length > 0 && (
            <div className="ar-voice">
              <h3>{c.category.chartTitle}</h3>
              <p>
                <span>{c.category.chartBody}</span> <span>{name}</span> <span>{c.category.chartSelfA}</span> <span>{s.discoveryVisibility}%</span>{' '}
                <span>{c.category.chartSelfB}</span> <span>{s.shareOfVoice}%</span> <span>{c.category.chartSelfC}</span>
              </p>
              <div className="ar-bars">
                {named.map((v) => (
                  <div key={v.brand} className={`ar-bar ${v.self ? 'is-self' : ''}`}>
                    <span className="is-n">{v.brand}</span>
                    <span className="is-t"><i style={{ width: `${Math.max(v.value, 1)}%` }} /></span>
                    <span className="is-v">{v.value}%</span>
                  </div>
                ))}
              </div>
              {named.length > 1 && !leader.self && (
                <p className="ar-lead">
                  <b>{leader.brand}</b> <span>{c.category.leadA}</span> <span>{leader.value}%</span> <span>{c.category.leadB}</span>
                  {s.discoveryVisibility < leader.value && (
                    <> <span>{name}</span> <span>{c.category.gapA}</span> <span>{leader.value - s.discoveryVisibility}</span><span>{c.category.gapB}</span></>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  ) });

  // The landscape, drawn from the same numbers: a chart from tablet up, a ranked list on phones
  if (rates.length > 0) sections.push({ id: 'position', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head
          eyebrow={c.position.eyebrow}
          title={c.position.title}
          lede={<><span>{c.position.ledeLead}</span> <span>{name}</span> <span>{c.position.ledeTail}</span></>}
        />
        <figure className="ar-land">
          <div className="ar-land-top">
            <span className="ar-land-ytitle"><span>{c.position.y}</span><span aria-hidden="true"> ↑</span></span>
            <span className="ar-land-key"><span>{c.position.valuesKey}</span> <span>{c.position.x}</span><span aria-hidden="true"> · </span><span>{c.position.y}</span></span>
          </div>
          <div className="ar-land-body" aria-hidden="true">
            <div className="ar-land-yaxis">
              {[0, top / 2, top].map((v) => <span key={v} style={{ bottom: `${(v / top) * 100}%` }}>{v}%</span>)}
            </div>
            <div className="ar-land-plot">
              <span className="ar-land-grid is-v" />
              <span className="ar-land-grid is-h" />
              {placed.map((p) => (
                <span key={p.label} className={`ar-land-pt ${p.self ? 'is-self' : ''}`} style={{ left: `${p.x}%`, bottom: `${(Math.min(p.y, top) / top) * 100}%` }}>
                  <i />
                  <span className={`ar-land-lb is-${p.side}`}><b>{p.label}</b> <span>{p.x}% · {p.y}%</span></span>
                </span>
              ))}
            </div>
            <div className="ar-land-xaxis"><span>0%</span><span>50%</span><span>100%</span></div>
            <div className="ar-land-xtitle"><span>{c.position.x}</span><span> →</span></div>
          </div>
          <ol className="ar-land-list">
            {ranked.map((p) => (
              <li key={p.label} className={p.self ? 'is-self' : ''}>
                <span className="is-n">{p.label}</span>
                <span className="is-v">{p.y}%</span>
                <span className="is-t"><i style={{ width: `${Math.max(p.y, 1)}%` }} /></span>
                <span className="is-x"><span>{c.position.x}</span> <span>{p.x}%</span></span>
              </li>
            ))}
          </ol>
          <figcaption className="ar-note">{c.position.note}</figcaption>
        </figure>
      </div>
    </section>
  ) });

  // Each engine on one row of one table: mentions and own-site citations on the same 0–100 axis
  sections.push({ id: 'platforms', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head eyebrow={c.platforms.eyebrow} title={c.platforms.title} lede={c.platforms.lede} />
        <p className="ar-pt-basis"><span>{c.platforms.basisLead}</span> <span>{b.queries.length}</span> <span>{c.platforms.basisTail}</span></p>
        <div className="ar-pt" role="table">
          <div className="ar-pt-row is-head" role="row">
            <span role="columnheader" className="is-eng">{c.platforms.engineLabel}</span>
            <span role="columnheader" className="is-bars">
              <span className="ar-pt-legend">
                <span><i className="is-m" /><span>{c.platforms.mentions}</span></span>
                <span><i className="is-c" /><span>{c.platforms.cites}</span></span>
              </span>
              <span className="ar-pt-ticks" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></span>
            </span>
            <span role="columnheader" className="is-sent">{c.platforms.sentimentLabel}</span>
            <span role="columnheader" className="is-note">{c.platforms.insightLabel}</span>
            <span role="columnheader" className="is-src">{c.platforms.sourcesTitle}</span>
          </div>
          {ORDER.map((p) => {
            const x = results.platformBreakdown[p];
            const src = x.topCitedDomains ?? [];
            return (
              <div key={p} className="ar-pt-row" role="row">
                <span role="cell" className="is-eng"><Engine p={p} size={28} /><b>{ENGINE[p].name}</b></span>
                <span role="cell" className="is-bars">
                  <span className="ar-pt-bar is-m"><span className="is-t"><i style={{ width: `${x.mentionRate}%` }} /></span><span className="is-v">{x.mentionRate}%</span></span>
                  <span className="ar-pt-bar is-c"><span className="is-t"><i style={{ width: `${x.citationRate}%` }} /></span><span className="is-v">{x.citationRate}%</span></span>
                </span>
                <span role="cell" className={`is-sent is-${x.sentiment}`}>{c.platforms.sentiment[x.sentiment]}</span>
                <span role="cell" className="is-note">{x.insight}</span>
                <span role="cell" className={`is-src ${src.length > 0 ? '' : 'is-empty'}`}>
                  {src.length > 0
                    ? src.slice(0, 3).map((d) => <span key={d.domain} className={d.isOwn ? 'is-own' : ''}><span>{d.domain}</span><span>×{d.count}</span></span>)
                    : <span className="is-none">–</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="ar-note"><b>{c.method.noteTitle}.</b> <span>{c.method.note}</span></p>
      </div>
    </section>
  ) });

  // Why it matters, shown with this company's own evidence: an unbranded answer that named others, not them
  sections.push({ id: 'why', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head eyebrow={c.why.eyebrow} title={c.why.title} lede={c.why.lede} />
        {missed && (
          <figure className="ar-why">
            <div className="au-q-pic ar-why-ground"><ChatWindow c={missed.chat} sourceIcon={null} /></div>
            <figcaption>
              <span>{c.why.answerFrom}</span> <span>{missed.engine}</span>, <span>{c.why.answerSearch}</span> <span>{name}</span> <span>{c.why.notNamed}</span>
            </figcaption>
          </figure>
        )}
        <p className="ar-why-line"><span>{c.why.lineLead}</span> <span>{name}</span> <span>{c.why.lineTail}</span></p>
      </div>
    </section>
  ) });

  // The plan, one heading per priority
  sections.push({ id: 'plan', body: (bg) => (
    <section className={`v11-sec ${bg}`}>
      <div className="v11-wrap">
        <Head eyebrow={c.actions.eyebrow} title={c.actions.title} lede={c.actions.lede} />
        <div className="ar-plan">
          {plan.map((g) => (
            <div key={g.p} className="ar-plan-group">
              <h3 className={`ar-plan-k is-${g.p}`}>{c.actions.priority[g.p]}</h3>
              <ul className="ar-actions">
                {g.items.map((a, i) => {
                  const service = a.linkedService ? SERVICE_NAME.get(a.linkedService) : undefined;
                  return (
                    <li key={`${a.title}-${i}`}>
                      <h4>{a.title}</h4>
                      <p>{a.description}</p>
                      {a.linkedService && (
                        <p className="ar-svc">
                          {service && <span className="ar-svc-k">{c.actions.serviceLead}</span>}
                          <Link className="v11-link" href={a.linkedService}><span>{service ?? c.actions.serviceLink}</span><ArrowRight /></Link>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) });

  return (
    <div className="v11 au ar">
      {/* the verdict: who, when, the one-sentence reading, how it was tested, and the scorecard */}
      <section className="ar-hero" data-hero="light">
        <div className="v11-wrap ar-hero-grid">
          <div>
            <Eyebrow>{c.cover.eyebrow}</Eyebrow>
            <h1>{name}</h1>
            <p className="ar-meta">{date} · <span>{c.cover.domainLabel}</span> {host}</p>
            <p className="ar-sum">
              {/* brand recognition is the share of branded answers that name the brand, not a share of platforms */}
              {name} is named in {s.brandRecognition}% of AI answers when asked about directly, but appears in only{' '}
              {s.discoveryVisibility}% of unbranded category searches.
              {s.competitiveStandingAvailable && <> Competitive standing is {s.competitiveStanding} of {s.competitorsTracked + 1} tracked brands.</>}
            </p>
            {banners}
            {r.benchmarkContext && (
              <div className="ar-bench">
                <div className="ar-k">{c.benchmark.eyebrow} · {r.benchmarkContext.categoryLabel}</div>
                <p>Against {r.benchmarkContext.sampleSize} other {r.benchmarkContext.categoryLabel} audits — here&apos;s where you land.</p>
                <div className="ar-bench-row">
                  {([['discovery', r.benchmarkContext.percentiles.discoveryVisibility], ['voice', r.benchmarkContext.percentiles.shareOfVoice], ['brand', r.benchmarkContext.percentiles.brandRecognition]] as const).map(([k, p]) => (
                    <div key={k}><span>{c.benchmark[k]}</span><b>{p >= 95 ? `Top ${100 - p}%` : p >= 50 ? `${p}th percentile` : `Bottom ${100 - p}%`}</b></div>
                  ))}
                </div>
              </div>
            )}
            <p className="ar-grade-note">{L.gradeNote}</p>
            <div className="ar-proto">
              <span className="ar-proto-icons" aria-hidden="true">{ORDER.map((p) => <Engine key={p} p={p} size={24} />)}</span>
              <p>{c.method.lede}</p>
            </div>
          </div>
          <div className="au-ground"><Scorecard x={score} /></div>
        </div>
      </section>

      {sections.map((x, i) => <Fragment key={x.id}>{x.body(i % 2 === 0 ? 'v11-warm' : 'v11-white')}</Fragment>)}

      <Closing c={{ ...home.closing, heading: c.cta.title, agenda: [] }} lede={`Our AEO experts will build a custom strategy to get ${name} showing up in AI conversations that matter for your business. ${c.cta.note}`} />
    </div>
  );
}
