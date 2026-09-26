import Link from 'next/link';
import type { HomeV11Content, PricingContent, PricingV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from '../home-v11/data';
import { ChartPanel } from '../home-v11/ChartPanel';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { QuoteCard } from '../home-v11/Testimonials';
import { ArrowRight, Eyebrow, LfMark, SectionHeadNode, img } from '../home-v11/ui';
import { Browser, Tag, Ui, UiHead } from '../service-v11/kit';
import { SHOTS } from '../service-v3/data';
import { strip } from '@/lib/inline-edit/mark';

/**
 * Pricing v11 (DESIGN.md §6, §7). Copy is the live page's (src/data/content/pricing.json); the example pictures
 * are src/data/content/pricing-v11.json. Every section is built against a tile from the 2026-09-25 pricing harvest
 * (design-lab/harvest/2026-09-25/pricing, ASSET-PLAN.md there): the price seal (01-D Shopify Plus), a picture on every
 * plan card (02-B Cofounder), the dated steps (04-A Fruitful), the offset track panels (08-A Retool), the lifted column
 * (03-A Function), one card with three columns (05-A Superpower) and a person beside the questions (07-A Fiasco).
 * The hero is light on white "plan paper": the indigo stage is the homepage's alone.
 */

const TONE = ['is-lav', 'is-ind', 'is-peach'];
/** Who runs each lane in the plan pictures, by lane position (the same four lanes grow from Solo to Scale). */
const LANE_WHO = ['rezwan-nahid', 'andrea-van-wyk', 'abhay-tyagi', 'david-dobrijevic'];
/** The seven "every plan" items, grouped under the three column heads in pricing-v11.json includes.groups. */
const INCLUDE_GROUPS = [[0, 1, 6], [2, 5], [3, 4]];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.14" /><path d="M4.8 8.3 7 10.4l4.2-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** A plan's glyph: its number of parallel lanes. */
function Lanes({ n }: { n: number }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x="2" y={2 + i * 5} width="18" height="3" rx="1.5" fill="currentColor" opacity={i < n ? 1 : 0.18} />
      ))}
    </svg>
  );
}

/** A plan's weekly board: one lane per initiative, the person who runs it, its state. Library part (DESIGN.md §7). */
export function Board({ b }: { b: PricingV11Content['boards'][number] }) {
  return (
    <div className="pr-board">
      <div className="pr-board-head"><span className="v11-lights" aria-hidden="true"><span /><span /><span /></span><span>{b.label}</span></div>
      <div className="pr-board-rows">
        {b.lanes.map((l, i) => (
          <div key={`${l.task}${i}`} className="pr-lane">
            <Tag tone={strip(l.track) === 'Build' ? 'warn' : 'ind'}>{l.track}</Tag>
            <span className="is-task">{l.task}</span>
            <span className={`is-state ${strip(l.state) === 'Live' ? 'is-live' : ''}`}>{l.state}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(`avatars/${LANE_WHO[i]}.png`)} alt="" width={22} height={22} />
          </div>
        ))}
        {/* the rows this plan does not run yet: queued work, waiting for a free lane */}
        {Array.from({ length: 4 - b.lanes.length }, (_, i) => (
          <div key={`q${i}`} className="pr-lane is-queued" aria-hidden="true"><i /><i /></div>
        ))}
      </div>
    </div>
  );
}

export function PricingV11({ c, x, home, data }: { c: PricingContent; x: PricingV11Content; home: HomeV11Content; data: HomeV11Data | null }) {
  const h = c.hero;
  const hw = c.howItWorks;
  const st = x.steps;
  const radisson = SHOTS.radisson;
  return (
    <div className="v11 pr">
      {/* 1 · the price, then the three plans, each with the board it runs (01-D seal, 02-B picture per card, 01-C cards) */}
      <section className="pr-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="pr-hero-top">
            <div className="pr-hero-copy">
              <div className="pr-hero-eyebrow"><span>{h.eyebrowBrand}</span><span className="is-sub">{h.eyebrowSub}</span></div>
              <h1>{h.headline} <span className="ghost">{h.headlineHighlight}</span></h1>
              <p className="pr-hero-desc" data-speakable="">{h.description}</p>
              <div className="pr-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{hw.ctaText}</span></a>
                <a href="#compare" className="v11-link pr-tap"><span>{c.compare.eyebrow}</span><ArrowRight /></a>
              </div>
            </div>
            <div className="pr-seal" role="img" aria-label={strip(`${h.anchorLabel} ${h.anchorPrice} a ${h.anchorPeriod}`)}>
              <svg className="pr-seal-ring" viewBox="0 0 300 300" aria-hidden="true">
                <circle cx="150" cy="150" r="146" fill="none" stroke="#1a1040" strokeOpacity="0.14" />
                <circle cx="150" cy="150" r="124" fill="#ffffff" stroke="#1a1040" strokeOpacity="0.1" />
                {Array.from({ length: 72 }, (_, i) => {
                  const a = (i / 72) * Math.PI * 2;
                  const r1 = 132, r2 = i % 6 === 0 ? 142 : 137;
                  return <line key={i} x1={150 + r1 * Math.cos(a)} y1={150 + r1 * Math.sin(a)} x2={150 + r2 * Math.cos(a)} y2={150 + r2 * Math.sin(a)} stroke="#4f46e5" strokeOpacity={i % 6 === 0 ? 0.85 : 0.4} strokeWidth={i % 6 === 0 ? 1.8 : 1.2} />;
                })}
              </svg>
              <div className="pr-seal-copy">
                <span className="is-lead">{h.anchorLabel}</span>
                <span className="is-price"><span>{h.anchorPrice}</span><span className="is-per">/{h.anchorPeriod}</span></span>
                <span className="is-note">{x.seal.note}</span>
              </div>
            </div>
          </div>

          <div className="pr-plans">
            {h.tiers.map((t, i) => (
              <article key={t.tierName} className={`pr-plan ${TONE[i]} ${t.featured ? 'is-featured' : ''}`}>
                <div className="pr-plan-head">
                  <span className="pr-plan-glyph"><Lanes n={[1, 2, 4][i]} /></span>
                  <h2 className="pr-plan-name">{t.tierName}</h2>
                  {t.badge && <span className="pr-plan-badge">{t.badge}</span>}
                </div>
                <p className="pr-plan-tag">{t.tagline}</p>
                <div className="pr-plan-pic"><Board b={x.boards[i]} /></div>
                <p className="pr-plan-desc">{t.description}</p>
                <ul className="pr-plan-list">
                  {t.features.map((f) => <li key={f}><Check /><span>{f}</span></li>)}
                </ul>
                <div className="pr-plan-foot">
                  {t.hint && <p className="pr-plan-hint">{t.hint}</p>}
                  <a href="#book-modal" data-cal-trigger="" className={`v11-btn ${t.featured ? 'is-white' : 'is-ink'}`}><span>{t.ctaText}</span></a>
                </div>
              </article>
            ))}
          </div>
          <p className="pr-qualifier" data-paper-runs="">{h.qualifierPrefix}<b>{h.qualifierHighlight}</b></p>
        </div>
      </section>

      <LogoGrid c={{ ...home.logos, body: c.logos.lead }} />

      {/* 2 · from the call to shipping, dated, each step with the thing you receive (04-A Fruitful, 04-B Ramp) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <SectionHeadNode title={<>{hw.headline} <span className="ghost">{hw.headlineHighlight}</span></>} body={hw.intro} bodyWidth={440} />
          <ol className="pr-steps">
            {hw.steps.map((s, i) => (
              <li key={s.title} className={`pr-step ${i === 0 ? 'is-now' : ''}`}>
                <div className="pr-step-when"><i aria-hidden="true" /><span>{st.when[i]}</span></div>
                <div className="pr-step-card">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <div className="pr-step-ui">
                    {i === 0 && (
                      <Ui className="pr-mini">
                        <div className="pr-mini-row is-head"><span className="pr-cal" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M1.5 6h11M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span><b>{st.call.title}</b></div>
                        <div className="pr-mini-row"><span>{st.call.slot}</span></div>
                        <div className="pr-mini-row is-quiet"><span>{st.call.with}</span><Tag tone="good">{st.call.status}</Tag></div>
                      </Ui>
                    )}
                    {i === 1 && (
                      <Ui className="pr-mini">
                        <UiHead left={st.proposal.title} />
                        {st.proposal.rows.map((r) => <div key={r.k} className="pr-mini-kv"><span>{r.k}</span><b>{r.v}</b></div>)}
                        <div className="pr-mini-kv is-total"><span>{st.proposal.total}</span><LfMark size={16} /></div>
                      </Ui>
                    )}
                    {i === 2 && (
                      <Ui className="pr-mini">
                        <div className="pr-msg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img loading="lazy" src={img('avatars/tamara-pavlovic.png')} alt="" width={28} height={28} />
                          <div><div className="pr-msg-head"><b>{st.kickoff.from}</b><span>{st.kickoff.time}</span></div><p>{st.kickoff.message}</p></div>
                        </div>
                      </Ui>
                    )}
                    {i === 3 && (
                      <Ui className="pr-mini">
                        <UiHead left={st.showcase.subject} right={<LfMark size={16} />} />
                        {st.showcase.rows.map((r) => <div key={r} className="pr-mini-check"><Check /><span>{r}</span></div>)}
                      </Ui>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="pr-steps-foot">
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{hw.ctaText}</span></a>
            <span className="pr-reply"><i aria-hidden="true" />{hw.responseTime}</span>
          </div>
        </div>
      </section>

      {/* 3 · the two tracks as offset panels, each with its proof (08-A Retool) */}
      <section className="v11-sec v11-warm" id="tracks">
        <div className="v11-wrap">
          <SectionHeadNode title={<>{c.tracks.headline} <span className="ghost">{c.tracks.headlineHighlight}</span></>} body={c.tracks.intro} bodyWidth={440} />
          <div className="pr-tracks">
            <div className="pr-track is-build">
              <div className="pr-track-copy">
                <span className="pr-track-badge">{c.tracks.build.badge}</span>
                <h3>{c.tracks.build.title}</h3>
                <p className="is-tag">{c.tracks.build.tagline}</p>
                <p>{c.tracks.build.description}</p>
                <div className="pr-tags">{c.tracks.build.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
              <div className="pr-track-pic">
                <Browser src={`https://cdn.sanity.io/images/xjjjqhgt/production/${radisson.asset}?w=1400&h=900&fit=crop&crop=top&fm=webp&q=82`} domain={radisson.domain} alt={strip(x.tracks.buildLabel)} />
                <span className="pr-track-cap">{x.tracks.buildLabel}</span>
              </div>
            </div>
            <div className="pr-track is-growth">
              <div className="pr-track-copy">
                <span className="pr-track-badge">{c.tracks.growth.badge}</span>
                <h3>{c.tracks.growth.title}</h3>
                <p className="is-tag">{c.tracks.growth.tagline}</p>
                <p>{c.tracks.growth.description}</p>
                <div className="pr-tags">{c.tracks.growth.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
              <div className="pr-track-pic">
                <Ui className="pr-chart">
                  {data && <ChartPanel title={x.tracks.growthChartTitle} source={x.tracks.growthChartSource} series={data.hero.delshad} format="index" tip={home.hero.slides[2].tip} height={190} />}
                </Ui>
              </div>
            </div>
          </div>
          <p className="pr-tracks-note"><b>{c.tracks.connectorGlyph}</b>{c.tracks.connectorText}</p>
        </div>
      </section>

      {/* 4 · compare the tiers, the popular column lifted (03-A Function) */}
      <section className="v11-sec v11-white" id="compare">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.compare.eyebrow} title={<>{c.compare.headline} <span className="ghost">{c.compare.headlineHighlight}</span></>} body={c.compare.intro} bodyWidth={440} />
          <div className="pr-table" role="table" aria-label={strip(c.compare.eyebrow)} tabIndex={0}>
            <div className="pr-row is-head" role="row">
              <span role="columnheader">{c.compare.columns.feature}</span>
              {(['solo', 'dual', 'scale'] as const).map((k, i) => (
                <span key={k} role="columnheader" className={`pr-col-head ${i === 1 ? 'is-lift' : ''}`}>
                  <span className="pr-plan-glyph"><Lanes n={[1, 2, 4][i]} /></span>
                  <b>{c.compare.columns[k]}</b>
                  <small>{c.compare.columns[`${k}Tag` as 'soloTag']}</small>
                </span>
              ))}
            </div>
            {c.compare.rows.map((r, ri) => (
              <div key={r.label} role="row" className={`pr-row ${r.emph ? 'is-emph' : ''} ${ri === c.compare.rows.length - 1 ? 'is-last' : ''}`}>
                <span role="rowheader" className="is-label">{r.label}</span>
                <span role="cell">{r.solo}</span>
                <span role="cell" className="is-lift">{r.dual}</span>
                <span role="cell">{r.scale}</span>
              </div>
            ))}
            <div className="pr-row is-tail" aria-hidden="true"><span /><span /><span className="is-lift" /><span /></div>
          </div>
          <p className="pr-foot">{c.compare.footnote}</p>
        </div>
      </section>

      {/* 5 · what every plan includes, one card, three columns headed by the documents you get (05-A Superpower) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.includes.eyebrow} title={<>{c.includes.headline} <span className="ghost">{c.includes.headlineHighlight}</span></>} body={c.includes.intro} bodyWidth={440} />
          <div className="pr-inc">
            {INCLUDE_GROUPS.map((g, gi) => (
              <div key={gi} className="pr-inc-col">
                <div className={`pr-inc-pic is-${gi}`}>
                  {gi === 0 && (
                    <Ui className="pr-doc">
                      <UiHead left={c.includes.items[0].title} right={<Tag tone="good">{x.includes.ownershipState}</Tag>} />
                      {x.boards[1].lanes.map((l, i) => (
                        <div key={l.task} className="pr-mini-check"><Check /><span>{l.task}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img loading="lazy" src={img(`avatars/${LANE_WHO[i]}.png`)} alt="" width={20} height={20} />
                        </div>
                      ))}
                    </Ui>
                  )}
                  {gi === 1 && (
                    <Ui className="pr-doc">
                      <UiHead left={x.includes.scoreboard.title} right={<span className="pr-live"><i />{x.includes.scoreboard.live}</span>} />
                      <div className="pr-score">
                        {[[x.includes.scoreboard.shipped, x.includes.scoreboard.shippedCount, 'is-done'], [x.includes.scoreboard.doing, x.includes.scoreboard.doingCount, 'is-doing'], [x.includes.scoreboard.next, x.includes.scoreboard.nextCount, '']].map(([k, v, cls]) => (
                          <div key={k} className={`pr-score-col ${cls}`}><span>{k}</span><b>{v}</b><i /></div>
                        ))}
                      </div>
                    </Ui>
                  )}
                  {gi === 2 && (
                    <div className="pr-docs">
                      <div className="pr-sheet">
                        <div className="pr-sheet-head"><LfMark size={16} /><span>{x.includes.memo.title}</span></div>
                        {x.includes.memo.lines.map((l) => <div key={l} className="pr-sheet-line"><b>{l}</b><i /><i /></div>)}
                      </div>
                      <div className="pr-focus"><span>{x.includes.focus.title}</span><b>{x.includes.focus.objective}</b></div>
                    </div>
                  )}
                </div>
                <h3 className="pr-inc-title">{x.includes.groups[gi]}</h3>
                <ul className="pr-inc-list">
                  {g.map((n) => (
                    <li key={n}><Check /><div><b>{c.includes.items[n].title}</b><span>{c.includes.items[n].description}</span></div></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pr-special">
            <div className="pr-special-copy">
              <h3>{c.specialArrangements.title}</h3>
              <p>{c.specialArrangements.description}</p>
              <a href="#book-modal" data-cal-trigger="" className="v11-link pr-tap"><span>{c.specialArrangements.ctaText}</span><ArrowRight /></a>
            </div>
            {c.specialArrangements.options.map((o, i) => (
              <div key={o.title} className={`pr-special-tile ${i === 0 ? 'is-lav' : 'is-peach'}`}>
                <b>{o.title}</b>
                <p>{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · clients' own words and numbers (06-A Amplemarket; the library's quote cards) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <SectionHeadNode title={<>{c.exhibits.headline} <span className="ghost">{c.exhibits.headlineHighlight}</span></>} right={<Link href="/case-studies" className="v11-link pr-tap"><span>{x.proof.linkText}</span><ArrowRight /></Link>} />
          <div className="pr-quotes">
            {home.testimonials.cards.map((k, i) => <QuoteCard key={k.person} k={k} i={i} />)}
          </div>
        </div>
      </section>

      {/* 7 · questions, beside a person you can write to (07-A Fiasco) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap v11-faq pr-faq">
          <div className="v11-faq-head">
            <Eyebrow>{c.coverCta.eyebrowRight}</Eyebrow>
            <h2 className="v11-h2"><span className="ghost">{c.faq.panelTitleHighlight}</span> {c.faq.panelTitleRest}</h2>
            <p className="pr-faq-sub">{c.faq.panelText}</p>
            <div className="pr-person">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img('avatars/arnel-bukva.png')} alt="" width={44} height={44} />
              <div><b>{x.faq.personName}</b><span>{x.faq.personRole}</span><a href={`mailto:${strip(x.faq.email)}`}>{x.faq.email}</a></div>
            </div>
            <div className="pr-stats">
              {c.faq.stats.map((s) => (
                <div key={s.label}><div className="pr-stat-v"><b>{s.value}</b>{s.period && <small>/{s.period}</small>}</div><span>{s.label}</span></div>
              ))}
            </div>
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.faq.ctaText}</span></a>
          </div>
          <div className="v11-faq-list">
            {c.faq.items.map((f, i) => (
              <details key={f.question} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: c.coverCta.headline }} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
