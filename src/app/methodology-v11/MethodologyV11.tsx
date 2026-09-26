import Link from 'next/link';
import type { AiAuditContent, HomeV11Content, MethodologyV11Content } from '@/lib/content-utils';
import { ChatWindow } from '../home-v11/Bento';
import { BeforeAfterChart } from '../home-v11/BeforeAfterChart';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Marks } from '../home-v11/ResultCase';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, Eyebrow, LfMark, img } from '../home-v11/ui';
import { Queries } from '../audit-v11/AuditPageV11';
import {
  CHAIN,
  ENGINES,
  ENGINE_DIVERGENCE,
  MEASURE,
  METHODOLOGY_FAQ,
  NO_PROMISE,
  PAGE,
  PRICING,
  PROOF,
  REVENUE,
  SHORT_ANSWER,
  START,
  STAGES,
} from '../methodology-v3/data';
import { StageRail } from './StageRail';
import { strip } from '@/lib/inline-edit/mark';

/**
 * /methodology in v11, second build (2026-09-26), from the named-site harvest in
 * design-lab/harvest/2026-09-26/methodology (contact-sheets.pdf). The first build (2026-09-25) came from a weaker
 * function-query harvest; its proof section was 3,300px of text. The copy is the live page's, unchanged
 * (methodology-v3/data.tsx, approved and hash-verified); this page's own labels and chart figures are in
 * methodology-v11.json, every figure taken from that copy. The tile each section is built against is named above it.
 */

const ENGINE_ICON: Record<string, string> = {
  ChatGPT: 'logos/fav-chatgpt.webp',
  'Google AI Overviews': 'logos/fav-google-g.png',
  Perplexity: 'logos/fav-perplexity.png',
  Gemini: 'logos/fav-gemini.png',
  Claude: 'logos/fav-claude.png',
  Copilot: 'logos/fav-copilot.svg',
};

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.4 11.2 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
);

function Head({ eyebrow, title, lede }: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode }) {
  return (
    <div className="sv-head">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="v11-h2">{title}</h2>
      </div>
      {lede && <p>{lede}</p>}
    </div>
  );
}

/**
 * The per-engine reading as a slope chart (38 Origin "Line of sight into your spending": the chart card beside the
 * headline). Two readings per engine, so a slope says it best: ChatGPT up, AI Overviews down, the blend in between.
 */
export function EngineSlope({ c }: { c: MethodologyV11Content['hero'] }) {
  const W = 460;
  const H = 236;
  const top = 20;
  const bottom = 206;
  const x0 = 76;
  const x1 = 384;
  const lo = 4;
  const hi = 17;
  const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
  const num = (s: string) => Number.parseFloat(s);
  const tone = { up: '#4f46e5', down: '#d4502f', hidden: '#a3a0bd' } as const;
  return (
    <figure className="mt-slope">
      <figcaption className="mt-slope-head">
        <span className="is-brand"><LfMark size={18} /><span>{c.chartTitle}</span></span>
        <span className="is-meta">{ENGINE_DIVERGENCE.caption}</span>
      </figcaption>
      <div className="mt-slope-legend">
        {ENGINE_DIVERGENCE.rows.map((r) => (
          <span key={r.engine} className={`is-${r.dir}`}>
            {ENGINE_ICON[strip(r.engine)] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img(ENGINE_ICON[strip(r.engine)])} alt="" width={16} height={16} />
            ) : null}
            {r.engine}
            <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true"><line x1="1" y1="2" x2="17" y2="2" stroke={tone[r.dir]} strokeWidth="3" strokeLinecap="round" strokeDasharray={r.dir === 'hidden' ? '4 3' : undefined} /></svg>
          </span>
        ))}
      </div>
      <div className="mt-slope-plot">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {[5, 10, 15].map((g) => (
            <line key={g} x1={x0 - 8} x2={x1 + 8} y1={y(g)} y2={y(g)} stroke="#eeedf4" strokeWidth="1" />
          ))}
          <line x1={x0 - 8} x2={x1 + 8} y1={bottom} y2={bottom} stroke="#dcdbe6" strokeWidth="1" />
          <line x1={x0} x2={x0} y1={top - 6} y2={bottom} stroke="#e4e4ea" strokeWidth="1" />
          <line x1={x1} x2={x1} y1={top - 6} y2={bottom} stroke="#e4e4ea" strokeWidth="1" />
          {ENGINE_DIVERGENCE.rows.map((r) => (
            <g key={r.engine}>
              <line x1={x0} y1={y(num(r.from))} x2={x1} y2={y(num(r.to))} stroke={tone[r.dir]} strokeWidth={r.dir === 'hidden' ? 2 : 3} strokeDasharray={r.dir === 'hidden' ? '5 5' : undefined} strokeLinecap="round" />
              <circle cx={x0} cy={y(num(r.from))} r="5" fill="#ffffff" stroke={tone[r.dir]} strokeWidth="2.5" />
              <circle cx={x1} cy={y(num(r.to))} r="5.5" fill={r.dir === 'hidden' ? '#ffffff' : tone[r.dir]} stroke={tone[r.dir]} strokeWidth="2.5" />
            </g>
          ))}
        </svg>
        {ENGINE_DIVERGENCE.rows.map((r) => (
          <span key={`f${r.engine}`} className={`mt-slope-v is-from is-${r.dir}`} style={{ left: `${((x0 - 14) / W) * 100}%`, top: `${(y(num(r.from)) / H) * 100}%` }}>{r.from}</span>
        ))}
        {ENGINE_DIVERGENCE.rows.map((r) => (
          <span key={`t${r.engine}`} className={`mt-slope-v is-to is-${r.dir}`} style={{ left: `${((x1 + 14) / W) * 100}%`, top: `${(y(num(r.to)) / H) * 100}%` }}>{r.to}</span>
        ))}
        <span className="mt-slope-x" style={{ left: `${(x0 / W) * 100}%` }}>{c.fromLabel}</span>
        <span className="mt-slope-x" style={{ left: `${(x1 / W) * 100}%` }}>{c.toLabel}</span>
      </div>
      <p className="mt-slope-note">{ENGINE_DIVERGENCE.note}</p>
    </figure>
  );
}

/** Retrieve and name as a funnel of the same 40 answers (61 Mixpanel funnel, 63 Mixpanel conversion bars): what is lost at each step stays visible, hatched. */
export function Funnel({ c }: { c: MethodologyV11Content['funnel'] }) {
  const [retrieve, , name] = CHAIN.links;
  const steps = [
    { label: c.base, n: 40, fig: '40' },
    { label: c.retrieved, n: 24, fig: retrieve.figure },
    { label: c.named, n: 7, fig: name.figure },
  ];
  return (
    <figure className="mt-funnel">
      <figcaption className="mt-funnel-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="is-brand"><img loading="lazy" src={img(ENGINE_ICON.ChatGPT)} alt="" width={18} height={18} /><span>{c.title}</span></span>
      </figcaption>
      <div className="mt-funnel-plot">
        {steps.map((s) => (
          <div key={s.label} className="mt-funnel-col">
            <b className="mt-funnel-fig">{s.fig}</b>
            <svg className="mt-funnel-track" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden="true">
              <defs><pattern id={`mt-h-${s.n}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4f46e5" strokeOpacity="0.3" strokeWidth="2" /></pattern></defs>
              <rect x="0.5" y="0.5" width="99" height="199" rx="6" fill={`url(#mt-h-${s.n})`} stroke="#4f46e5" strokeOpacity="0.2" />
              <rect x="0" y={200 - (s.n / 40) * 200} width="100" height={(s.n / 40) * 200} rx="6" fill="#4f39f6" />
            </svg>
            <span className="mt-funnel-label">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-funnel-foot">{CHAIN.failLine}</p>
    </figure>
  );
}

/** The chain applied to our own domain, as the report page it produces (55 Midday report, 51 Stripe report card), on the brand plate. */
function ChainReport({ c, floorLabel }: { c: MethodologyV11Content['report']; floorLabel: string }) {
  return (
    <div className="v11-svc-plate mt-plate">
      <div className="v11-sheet mt-report">
        <div className="v11-sheet-head">
          <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
          <span className="is-meta">{c.title} · {c.meta}</span>
        </div>
        <div className="mt-report-cols"><span>{c.linkHead}</span><span>{c.readingHead}</span></div>
        <ol className="mt-report-rows">
          {REVENUE.ladder.map((l, i) => {
            const r = c.rows[i];
            return (
              <li key={l.step} className={i === REVENUE.ladder.length - 1 ? 'is-last' : ''}>
                <span className="mt-report-dot" aria-hidden="true" />
                <div className="mt-report-link"><b>{l.step}</b><span>{l.note}</span></div>
                <div className="mt-report-read">
                  {r?.reading && <b>{r.reading}</b>}
                  <span>{r?.detail}</span>
                  {r?.floor && <em className="mt-floor">{floorLabel}</em>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** What we measure as the working sheet itself (237 Rows spreadsheet): column letters, row numbers, the floor rows flagged. */
export function MeasureSheet({ c }: { c: MethodologyV11Content['sheet'] }) {
  return (
    <div className="v11-svc-plate mt-plate">
      <div className="mt-xls" role="table" aria-label={MEASURE.heading}>
        <div className="mt-xls-bar">
          <span className="is-brand"><LfMark size={18} /><span>{c.file}</span></span>
          <span className="is-meta">{c.meta}</span>
        </div>
        <div className="mt-xls-row is-letters" aria-hidden="true"><span /><span>A</span><span>B</span><span>C</span></div>
        <div className="mt-xls-row is-head" role="row">
          <span className="is-n" aria-hidden="true">1</span>
          {MEASURE.columns.map((col) => <span key={col} role="columnheader">{col}</span>)}
        </div>
        {MEASURE.rows.map((r, i) => (
          <div key={r.metric} className="mt-xls-row" role="row">
            <span className="is-n" aria-hidden="true">{i + 2}</span>
            <span role="rowheader" className="is-metric">{r.metric}{'floor' in r && r.floor && <em className="mt-floor">{MEASURE.floorLabel}</em>}</span>
            <span role="cell">{r.answers}</span>
            <span role="cell" className="is-src">{r.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MethodologyV11({ c, home, audit }: { c: MethodologyV11Content; home: HomeV11Content; audit: AiAuditContent }) {
  const card = (id: string) => PROOF.cards.find((p) => p.id === id)!;
  const own = card('own-domain');
  const study = card('category-study');
  const toku = card('client');
  const charts = c.proofCharts;
  /** Proof card ids (methodology-v3/data.tsx) to their chart keys in methodology-v11.json (keys must be [A-Za-z0-9_]). */
  const CHART_OF = { 'own-domain': 'ownDomain', 'genie-teacher': 'genieTeacher', 'stealth-fintech': 'stealthFintech', trademomentum: 'trademomentum' } as const;
  // a render helper, not a component: a component declared inside this render would be re-created on every render
  const proofChart = (id: keyof typeof CHART_OF) => {
    const x = charts[CHART_OF[id]];
    return <div className="mt-proof-chart"><BeforeAfterChart pairs={x.pairs} beforeLabel={x.beforeLabel} afterLabel={x.afterLabel} height={x.pairs.length > 1 ? 210 : 200} /></div>;
  };

  return (
    <div className="v11 mt">
      {/* 1 · the method's name beside the per-engine reading it produces (38 Origin, 01-J Vercel) */}
      <section className="mt-hero" data-hero="light">
        <div className="v11-wrap mt-hero-grid">
          <div className="mt-hero-copy">
            <Eyebrow>{PAGE.eyebrow} · {PAGE.eyebrowTag}</Eyebrow>
            <h1>{PAGE.h1Lead}: <span className="ghost">{PAGE.h1Rest}</span></h1>
            <div className="mt-hero-ctas">
              <Link href={START.ctaHref} className="v11-btn is-ink"><span>{START.ctaLabel}</span></Link>
              <span className="mt-price"><small>{PRICING.bandPrefix}</small> <b>{PRICING.bandDisplay}</b> <small>{PRICING.bandSuffix}</small></span>
            </div>
          </div>
          <EngineSlope c={c.hero} />
        </div>
      </section>

      {/* 2 · the short answer, before the detail (344 Attio: the label left, the statement right, on hairlines) */}
      <section className="v11-sec v11-warm mt-answer" id="short-answer">
        <div className="v11-wrap">
          <div className="mt-answer-grid">
            <div className="mt-answer-label"><LfMark size={20} /><span>{SHORT_ANSWER.label}</span></div>
            <div>
              <p className="mt-answer-body" data-speakable="">{SHORT_ANSWER.body}</p>
              <p className="mt-answer-stages">{SHORT_ANSWER.stagesLine}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · retrieve, cite, name: one sample carried through (61 / 63 Mixpanel funnels) */}
      <section className="v11-sec v11-white" id="retrieve-cite-name">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.chain} title={CHAIN.heading} lede={CHAIN.lede} />
          <div className="mt-chain">
            <Funnel c={c.funnel} />
            <div className="mt-links">
              {CHAIN.links.map((l) => (
                <div key={l.title} className="mt-link">
                  <b>{l.title}</b>
                  <p>{l.body}</p>
                  <span className="is-fig">{l.figure}</span>
                  <span className="is-cap">{l.figureLabel}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-chain-foot">
            <p>{CHAIN.measured}</p>
            <figure className="mt-diverge">
              <figcaption>{CHAIN.divergence.caption}</figcaption>
              <BeforeAfterChart pairs={c.divergence.pairs} height={210} />
            </figure>
          </div>
          <p className="mt-lift" data-paper-runs="">{CHAIN.liftLine} <span className="ghost">{CHAIN.close}</span></p>
        </div>
      </section>

      {/* 4 · the revenue frame: the chain on our own domain, as the report (55 Midday, 51 Stripe; DESIGN.md §5 documents) */}
      <section className="v11-sec v11-warm" id="revenue-frame">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.revenue} title={REVENUE.heading} lede={REVENUE.liftable} />
          <ChainReport c={c.report} floorLabel={MEASURE.floorLabel} />
          <div className="mt-cols is-2">{REVENUE.paras.slice(0, 2).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
        </div>
      </section>

      {/* 5 · the eight stages, one open at a time beside the list (188 Homerun steps; 100 Linear Method for the reading measure) */}
      <section className="v11-sec v11-white" id="stages">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.stages} title={c.stagesTitle} lede={REVENUE.paras[2]} />
          <div className="mt-stages">
            <StageRail label={strip(c.stagesTitle)} items={STAGES.map((s) => ({ id: `stage-${s.n}`, kicker: `${c.stagePrefix} ${s.n}`, title: s.short }))} />
            <div className="mt-stage-list">
              {STAGES.map((s) => (
                <article key={s.n} id={`stage-${s.n}`} className="mt-stage">
                  <h3>{s.name}</h3>
                  <p className="mt-stage-first">{s.blocks[0].text}</p>
                  {s.blocks.length > 1 && (
                    <details className="mt-stage-more">
                      <summary><span>{c.stageMore}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                      {s.blocks.slice(1).map((b, k) => (
                        <p key={k} data-paper-runs={b.kind === 'lead' ? '' : undefined}>{b.kind === 'lead' && b.lead && <b>{b.lead} </b>}{b.text}</p>
                      ))}
                    </details>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 · what we measure, as the working sheet (237 Rows) on the plate */}
      <section className="v11-sec v11-warm" id="what-we-measure">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.measure} title={MEASURE.heading} />
          <MeasureSheet c={c.sheet} />
          <p className="mt-floors">{MEASURE.floors}</p>
        </div>
      </section>

      {/* 7 · the engines we track and the ones we snapshot (226 Circle / 244 Jitter comparison, engine marks at size) */}
      <section className="v11-sec v11-white" id="engines">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.engines} title={ENGINES.heading} lede={ENGINES.ask} />
          <div className="mt-engines">
            {([['tracked', ENGINES.tracked], ['untracked', ENGINES.untracked]] as const).map(([k, e]) => (
              <div key={k} className={`mt-engine is-${k}`}>
                <div className="mt-engine-marks">
                  {c.engineTiles[k].map((name) => (
                    <span key={name} className="mt-engine-tile">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" src={img(ENGINE_ICON[strip(name)])} alt="" width={30} height={30} />
                      <span>{name}</span>
                    </span>
                  ))}
                </div>
                <span className="is-k">{e.title}</span>
                <b>{e.kicker}</b>
                <p>{e.lede}</p>
                <ul>{e.rows.map((r) => <li key={r}>{k === 'tracked' ? <Check /> : <Cross />}<span>{r}</span></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-cols is-2">{ENGINES.paras.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
        </div>
      </section>

      {/* 8 · proof as charts of the published readings, receipts one click away (328 Ramp result cards, 308 Webflow) */}
      <section className="v11-sec v11-warm" id="proof">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.proof} title={PROOF.heading} />
          <div className="cro-grid mt-proof">
            <div className="cro-cell is-wide">
              <Marks />
              <div className="cro-tag"><span className="is-tag">{own.label}</span></div>
              <div className="mt-proof-wide">
                <div className="mt-proof-lead">
                  <div className="cro-big is-ind">{own.figure}</div>
                  <div className="cro-cap">{own.figureLabel}</div>
                  <Link href={own.href} className="v11-link mt-tap"><span>{own.linkText}</span><ArrowRight /></Link>
                </div>
                <div>
                  {proofChart('own-domain')}
                  <div className="mt-engine-bars">
                    <span className="is-k">{charts.ownDomain.perEngineTitle}</span>
                    {charts.ownDomain.perEngine.map((e) => (
                      <div key={e.label} className="mt-engine-bar">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <span className="is-n"><img loading="lazy" src={img(ENGINE_ICON[strip(e.label)])} alt="" width={16} height={16} />{e.label}</span>
                        <span className="is-track"><i style={{ width: `${(e.value / 20) * 100}%` }} /></span>
                        <b>{e.text}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="cro-cell mt-proof-chat">
              <Marks />
              <div className="cro-tag"><span className="is-tag">{toku.label}</span><span>· {home.bento.chat.answerBrand}</span></div>
              <div className="cro-big">{toku.figure}</div>
              <div className="cro-cap">{toku.figureLabel}</div>
              <Link href={toku.href} className="v11-link mt-tap"><span>{toku.linkText}</span><ArrowRight /></Link>
              <div className="mt-proof-ui"><ChatWindow c={home.bento.chat} /></div>
            </div>
            {(['genie-teacher', 'stealth-fintech', 'trademomentum'] as const).map((id) => {
              const p = card(id);
              return (
                <div key={id} className="cro-cell">
                  <Marks />
                  <div className="cro-tag"><span className="is-tag">{p.label}</span></div>
                  <p className="mt-proof-h">{p.headline}</p>
                  {proofChart(id)}
                  <div className="cro-cap">{p.figureLabel}</div>
                  <Link href={p.href} className="v11-link mt-tap"><span>{p.linkText}</span><ArrowRight /></Link>
                </div>
              );
            })}
            <div className="cro-cell mt-proof-study">
              <Marks />
              <div className="cro-tag"><span className="is-tag">{study.label}</span></div>
              <div className="mt-proof-figs">
                <div>
                  <p className="mt-proof-h">{study.headline}</p>
                  <Link href={study.href} className="v11-link mt-tap"><span>{study.linkText}</span><ArrowRight /></Link>
                </div>
                <div><div className="cro-big">{study.figure}</div><div className="cro-cap">{study.figureLabel}</div></div>
                <div><div className="cro-big is-ind">{c.studyFigure}</div><div className="cro-cap">{c.studyFigureLabel}</div></div>
              </div>
            </div>
          </div>
          <div className="mt-recs">
            {PROOF.cards.map((p) => (
              <details key={p.id} className="mt-rec">
                <summary><span className="is-k">{c.receiptsLabel}</span><b>{p.headline}</b><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="mt-rec-body">
                  <p>{p.body}</p>
                  {p.receipts && (
                    <dl>{p.receipts.map((r) => <div key={r.term}><dt>{r.term}</dt><dd>{r.detail}</dd></div>)}</dl>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9 · what we do not promise: our refusals beside Google's own words (365 Intercom press rows) */}
      <section className="v11-sec v11-white" id="what-we-do-not-promise">
        <div className="v11-wrap">
          <Head eyebrow={c.eyebrows.limits} title={NO_PROMISE.heading} lede={NO_PROMISE.paras[0]} />
          <div className="mt-limits">
            <div className="mt-refusals">
              {NO_PROMISE.refusals.map((r) => (
                <div key={r.title}><span className="is-x"><Cross /></span><b>{r.title}</b><p>{r.body}</p></div>
              ))}
            </div>
            <div className="mt-google">
              <p className="mt-google-lede">{NO_PROMISE.googleLede}</p>
              {NO_PROMISE.googleQuotes.map((q) => (
                <blockquote key={q}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="mt-g"><img loading="lazy" src={img('logos/fav-google-g.png')} alt="" width={22} height={22} /></span>
                  <p>&ldquo;{q}&rdquo;</p>
                  <cite>{c.googleSource}</cite>
                </blockquote>
              ))}
              <blockquote>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="mt-g"><img loading="lazy" src={img('logos/fav-google-g.png')} alt="" width={22} height={22} /></span>
                <p>{NO_PROMISE.googleQuoteLlms.prefix} &ldquo;{NO_PROMISE.googleQuoteLlms.quote}&rdquo;</p>
                <cite>{c.googleSource}</cite>
              </blockquote>
            </div>
          </div>
          <p className="mt-correction">{NO_PROMISE.correction}</p>
        </div>
      </section>

      {/* 10 · where to start, beside the report the free audit returns; then what it costs (390 Stripe price rows) */}
      <section className="v11-sec v11-warm" id="where-to-start">
        <div className="v11-wrap">
          <div className="mt-start">
            <div className="mt-start-copy">
              <Eyebrow>{c.eyebrows.start}</Eyebrow>
              <h2 className="v11-h2">{START.heading}</h2>
              <p className="mt-start-lede">{START.lede}</p>
              <p>{START.body}</p>
              <ul>{START.items.map((it) => <li key={it}><Check /><span>{it}</span></li>)}</ul>
              <Link href={START.ctaHref} className="v11-btn is-ink"><span>{START.ctaLabel}</span></Link>
            </div>
            <figure className="mt-start-pic">
              <div className="au-q-pic"><Queries x={audit.example} /></div>
              <figcaption>{audit.example.caption}</figcaption>
            </figure>
          </div>
          <div className="mt-cost" id="what-it-costs">
            <div className="mt-cost-band">
              <span className="is-k">{PRICING.heading}</span>
              <div><small>{PRICING.bandPrefix}</small><b>{PRICING.bandDisplay}</b><small>{PRICING.bandSuffix}</small></div>
            </div>
            <p className="mt-cost-body" data-paper-runs="">{PRICING.body}</p>
            <dl className="mt-cost-terms">{PRICING.terms.map((t) => <div key={t.k}><dt>{t.k}</dt><dd>{t.v}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      {/* 11 · the questions buyers ask (the v11 FAQ) */}
      <section className="v11-sec v11-white" id="faq">
        <div className="v11-wrap v11-faq">
          <div className="v11-faq-head"><h2 className="v11-h2">{c.faqTitle}</h2></div>
          <div className="v11-faq-list">
            {METHODOLOGY_FAQ.map((f, i) => (
              <details key={f.q} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.q}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
