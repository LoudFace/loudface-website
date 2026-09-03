/**
 * CONCEPT C: "the dossier".
 *
 * Spine: the page is a document, and a sticky contents rail rides with the
 * reader the whole way down. The hero's focal object is the short answer set the
 * way an engine lifts it, with our own source line attached. Everything else
 * runs in one editorial column beside the rail, and the eight stages are entries
 * in that document rather than cards (A) or a ledger (B).
 *
 * Why the rail is legitimate here: the project rule is that an orientation
 * device has to be earned by content length, and this page runs about 15,000
 * pixels at 1440. That is the case the rule was written for.
 *
 * Harvest notes: the sticky index is a rebuild of Aceternity's `StickyScroll`.
 * See ContentsRail.tsx for the five defects that made its mechanism unusable,
 * the worst of which is that it serves non-active content at opacity 0.
 *
 * The copy is fixed. This file only decides which slot each approved string
 * sits in.
 */
import Link from 'next/link';
import { FooterV3 } from '../../home-v3/FooterV3';
import { ContentsRail, type RailItem } from '../ContentsRail';
import {
  CHAIN,
  ENGINES,
  ENGINE_DIVERGENCE,
  MEASURE,
  NO_PROMISE,
  PAGE,
  PRICING,
  PROOF,
  REVENUE,
  SHORT_ANSWER,
  START,
  STAGES,
  type Stage,
} from '../data';
import { FaqAccordion, MeasureTable } from '../shared';

const RAIL: RailItem[] = [
  { id: 'short-answer', label: 'The short answer' },
  { id: 'retrieve-cite-name', label: 'Retrieve, cite, name' },
  { id: 'revenue-frame', label: 'Measured against revenue' },
  { id: 'stages', label: 'The eight stages' },
  { id: 'what-we-measure', label: 'What we measure' },
  { id: 'engines', label: 'Engines we track' },
  { id: 'proof', label: 'Proof' },
  { id: 'what-we-do-not-promise', label: 'What we do not promise' },
  { id: 'what-it-costs', label: 'What it costs' },
  { id: 'where-to-start', label: 'Where to start' },
  { id: 'faq', label: 'Questions' },
];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const BanIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M6 18 18 6" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12.5 9 17.5 20 6.5" />
  </svg>
);

function EntryFigure({ stage }: { stage: Stage }) {
  if (stage.n === 4) {
    return (
      <div className="efig">
        <p className="ef-cap">128,515 citations, 90 days, B2B SaaS growth-agency category</p>
        <div className="ef-bar">
          <b style={{ width: '52.76%' }}>52.76%</b>
          <span>Every other page type</span>
        </div>
        <p className="ef-note">
          Listicles carried more of every citation than every other page type combined.
        </p>
      </div>
    );
  }
  if (stage.n === 6) {
    return (
      <div className="efig">
        <p className="ef-cap">Third-party pages the three engines cited, 30 days</p>
        <div className="ef-pair">
          <b>4 of 975</b>
          <span>cited third-party pages that mention LoudFace</span>
        </div>
        <p className="ef-note">A brand that is only ever named from its own pages has a ceiling.</p>
      </div>
    );
  }
  if (stage.n === 8) {
    return (
      <div className="efig">
        <p className="ef-cap">{ENGINE_DIVERGENCE.caption}</p>
        <div className="ef-rows">
          {ENGINE_DIVERGENCE.rows.map((r) => (
            <div key={r.engine} className="ef-row" data-dir={r.dir}>
              <em>{r.engine}</em>
              <u>{r.from}</u>
              <b>{r.to}</b>
            </div>
          ))}
        </div>
        <p className="ef-note">{ENGINE_DIVERGENCE.note}</p>
      </div>
    );
  }
  return null;
}

export function MethodologyConceptC() {
  return (
    <>
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow glass rv">
              <i />
              {PAGE.eyebrow}
              <em>{PAGE.eyebrowTag}</em>
            </span>
            <h1 className="rv" style={{ '--d': '.06s' } as React.CSSProperties}>
              {PAGE.h1}
            </h1>
            <div className="hero-cta rv" style={{ '--d': '.14s' } as React.CSSProperties}>
              <Link href={START.ctaHref} className="btn btn-white btn-pill btn-lg">
                {START.ctaLabel}
              </Link>
              <span className="anchor">
                <u>{PRICING.bandPrefix}</u>
                <b>{PRICING.bandDisplay}</b>
                <span>{PRICING.bandSuffix}</span>
              </span>
            </div>
          </div>

          {/* Our own short answer, set the way an engine lifts one, with our own
              URL as the source. No engine marks: a mock carrying ChatGPT's logo
              would be a claim about an output we did not actually get. */}
          <div className="lifted rv" style={{ '--d': '.1s' } as React.CSSProperties}>
            <div className="lf-top">
              <b>{SHORT_ANSWER.label}</b>
              <span>The block engines lift</span>
            </div>
            <div className="lf-in">
              <p>{SHORT_ANSWER.body}</p>
              <div className="lf-src">
                <u>Source</u>
                <span className="lf-chip">
                  <i />
                  loudface.co/methodology
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="doc">
        <div className="container doc-grid">
          <ContentsRail items={RAIL} />

          <div className="doc-col">
            <section id="short-answer">
              <div className="docanswer rv" data-speakable>
                <span className="alab">
                  <i />
                  {SHORT_ANSWER.label}
                </span>
                <p>{SHORT_ANSWER.body}</p>
                <p style={{ marginTop: 14, fontSize: 15, color: 'var(--body)', lineHeight: 1.62 }}>
                  {SHORT_ANSWER.stagesLine}
                </p>
              </div>
            </section>

            <section id="retrieve-cite-name">
              <h2 className="sec rv">{CHAIN.heading}</h2>
              <p className="lede rv">{CHAIN.lede}</p>

              <div className="vchain rv">
                {CHAIN.links.map((l, i) => (
                  <div key={l.title} className={`vc-step${i === 2 ? ' is-break' : ''}`}>
                    <h3>{l.title}</h3>
                    <p>{l.body}</p>
                    {i !== 1 && (
                      <span className="vc-read">
                        <b>{l.figure}</b>
                        <span>{l.figureLabel}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <p className="vc-fail rv">{CHAIN.failLine}</p>
              <p className="copy rv" style={{ marginTop: 18 }}>
                {CHAIN.measured}
              </p>

              <div className="pair rv">
                {CHAIN.divergence.rows.map((r) => (
                  <div key={r.label} data-flat={r.moved ? undefined : ''}>
                    <h4>{r.label}</h4>
                    <b>{r.to}</b>
                    <span>
                      from {r.from}, {r.moved ? 'moved' : 'flat'}
                    </span>
                  </div>
                ))}
              </div>

              <p className="copy rv" style={{ marginTop: 20 }}>
                {CHAIN.close}
              </p>
            </section>

            <section id="revenue-frame">
              <h2 className="sec rv">{REVENUE.heading}</h2>
              <p className="lift rv" data-speakable>
                {REVENUE.liftable}
              </p>
              <p className="copy rv" style={{ marginTop: 20 }}>
                {REVENUE.paras[0]}
              </p>
              <p className="copy rv" style={{ marginTop: 18 }}>
                {REVENUE.paras[1]}
              </p>
              <div className="ladder rv">
                {REVENUE.ladder.map((r, i) => (
                  <div key={r.step}>
                    <em>{i + 1}</em>
                    <div>
                      <b>{r.step}</b>
                      <span>{r.note}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="copy rv" style={{ marginTop: 20 }}>
                {REVENUE.paras[2]}
              </p>
            </section>

            <section id="stages">
              <h2 className="sec rv">The eight stages</h2>
              {STAGES.map((s) => (
                <article key={s.n} className="entry rv">
                  <div className="en-head">
                    <b>Stage {s.n}</b>
                  </div>
                  <h3>{s.name}</h3>
                  {s.n === 8 ? (
                    <>
                      <p className="copy">{s.blocks[0].text}</p>
                      <ol>
                        {s.blocks
                          .filter((b) => b.kind === 'lead')
                          .map((b) => (
                            <li key={b.lead}>
                              <b>{b.lead}</b> {b.text}
                            </li>
                          ))}
                      </ol>
                      <p className="copy">{s.blocks[s.blocks.length - 1].text}</p>
                    </>
                  ) : (
                    s.blocks.map((b, bi) => (
                      <p className="copy" key={bi}>
                        {b.kind === 'lead' && <b>{b.lead} </b>}
                        {b.text}
                      </p>
                    ))
                  )}
                  <EntryFigure stage={s} />
                </article>
              ))}
            </section>

            <section id="what-we-measure">
              <h2 className="sec rv">{MEASURE.heading}</h2>
              <div className="breakout rv">
                <MeasureTable />
              </div>
              <div className="floors rv">
                <span className="fl-chip">{MEASURE.floorLabel}</span>
                <p className="copy">{MEASURE.floors}</p>
              </div>
            </section>

            <section id="engines">
              <h2 className="sec rv">{ENGINES.heading}</h2>
              <div className="etwo rv">
                {[ENGINES.tracked, ENGINES.untracked].map((p) => (
                  <div key={p.title} className="ecol">
                    <p className="ec-lab">{p.title}</p>
                    <h3>{p.kicker}</h3>
                    <p>{p.lede}</p>
                    <ul>
                      {p.rows.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {ENGINES.paras.map((t) => (
                <p className="copy rv" key={t.slice(0, 24)} style={{ marginTop: 18 }}>
                  {t}
                </p>
              ))}
              <p className="eask rv">{ENGINES.ask}</p>
            </section>

            <section id="proof">
              <h2 className="sec rv">{PROOF.heading}</h2>
              {PROOF.cards.map((c) => (
                <article key={c.id} className="pexhibit rv">
                  <div>
                    <span className="px-lab">{c.label}</span>
                    <p className="px-fig">{c.figure}</p>
                    <p className="px-figlab">{c.figureLabel}</p>
                    {c.id === 'own-domain' && (
                      <div className="ptraj">
                        <div>
                          <b>0.18%</b>
                          <span>April 2026</span>
                        </div>
                        <div>
                          <b>10.4%</b>
                          <span>June 2026</span>
                        </div>
                        <div>
                          <b>12.84%</b>
                          <span>30 days to 2 Sep</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="px-body">{c.body}</p>
                    <p className="px-go">
                      <Link href={c.href} className="tlink on-dark">
                        {c.linkText}
                        <ArrowIcon />
                      </Link>
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <section id="what-we-do-not-promise">
              <h2 className="sec rv">{NO_PROMISE.heading}</h2>
              <div className="refusals rv">
                {NO_PROMISE.refusals.map((r) => (
                  <div key={r.title} className="refusal">
                    <h3>
                      <BanIcon />
                      {r.title}
                    </h3>
                    <p>{r.body}</p>
                  </div>
                ))}
              </div>
              <p className="copy rv" style={{ marginTop: 20 }}>
                {NO_PROMISE.paras[0]}
              </p>
              <p className="copy rv" style={{ marginTop: 18 }}>
                {NO_PROMISE.googleLede}
              </p>
              <div className="quotes rv">
                {NO_PROMISE.googleQuotes.map((q) => (
                  <div key={q.slice(0, 24)} className="quote">
                    <blockquote>&ldquo;{q}&rdquo;</blockquote>
                    <cite>Google Search Central</cite>
                  </div>
                ))}
                <div className="quote">
                  <blockquote>
                    {NO_PROMISE.googleQuoteLlms.prefix} &ldquo;
                    {NO_PROMISE.googleQuoteLlms.quote}&rdquo;
                  </blockquote>
                  <cite>Google Search Central</cite>
                </div>
              </div>
              <p className="copy rv" style={{ marginTop: 20 }}>
                {NO_PROMISE.correction}
              </p>
            </section>

            <section id="what-it-costs">
              <h2 className="sec rv">{PRICING.heading}</h2>
              <div className="pricebox rv">
                <span className="anchor on-light">
                  <u>{PRICING.bandPrefix}</u>
                  <b>{PRICING.bandDisplay}</b>
                  <span>{PRICING.bandSuffix}</span>
                </span>
                <p className="copy">
                  {PRICING.lede} {PRICING.body}
                </p>
                <dl className="terms">
                  {PRICING.terms.map((t) => (
                    <div key={t.k}>
                      <dt>{t.k}</dt>
                      <dd>{t.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section id="where-to-start">
              <h2 className="sec rv">{START.heading}</h2>
              <div className="startbox rv">
                <h3>{START.lede}</h3>
                <p>{START.body}</p>
                <ul>
                  {START.items.map((it) => (
                    <li key={it}>
                      <CheckIcon />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link href={START.ctaHref} className="btn btn-white btn-pill btn-lg">
                  {START.ctaLabel}
                </Link>
              </div>
            </section>

            <section id="faq">
              <h2 className="sec rv">Nine questions buyers actually ask</h2>
              <div className="faqwrap rv">
                <FaqAccordion />
              </div>
            </section>
          </div>
        </div>
      </div>

      <FooterV3 />
    </>
  );
}
