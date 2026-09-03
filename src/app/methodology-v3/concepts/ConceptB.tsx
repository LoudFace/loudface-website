/**
 * CONCEPT B: "the instrument".
 *
 * Spine: the deliverable IS the page. The hero opens on a miniature per-engine
 * report with the blended row struck through, the retrieve-cite-name chain is
 * drawn as a funnel of ONE sample so the three bars share a unit, the eight
 * stages are a dense ledger the reader opens rather than eight cards, and the
 * measurement table is promoted to the page's centrepiece on a night stage.
 *
 * Different from concept A in spine, not palette: A is a narrative rail with the
 * table as a supporting section; B is a report with the table as the argument.
 *
 * THIS IS THE PICKED CONCEPT (Arnel, 2026-09-03), and it now renders at the
 * live /methodology route. Two changes came with the pick:
 *  - The short answer uses CONCEPT A's block, not B's flat band. See AnswerB.
 *  - The stage ledger opens its first three rows, not one. See StagesB.
 *
 * Harvest notes: the funnel, ledger and spec sheet are house-built. beUI's
 * virtualized data table was rejected for this section precisely because B
 * leans on the table hardest, and a virtualized table serves three of eight
 * rows to anything that does not scroll. Magic UI's NumberTicker was rejected
 * for the same reason it was rejected in A: it server-renders 0.
 *
 * The copy is fixed. This file only decides which slot each approved string
 * sits in.
 */
import Link from 'next/link';
import { FooterV3 } from '../../home-v3/FooterV3';
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
const SlopeUp = () => (
  <svg viewBox="0 0 20 12" aria-hidden="true">
    <path d="M2 10 10 6.5 18 2" />
  </svg>
);
const SlopeDown = () => (
  <svg viewBox="0 0 20 12" aria-hidden="true">
    <path d="M2 2 10 5.5 18 10" />
  </svg>
);
const SlopeFlat = () => (
  <svg viewBox="0 0 20 12" aria-hidden="true">
    <path d="M2 6.4 18 5.6" />
  </svg>
);

function HeroB() {
  return (
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
          {/* The stages line used to sit here as a hero subline. It now travels
              with the short-answer card below, which is where concept A keeps
              it. The sentence is not duplicated and not dropped: it moved. */}
          <div className="hero-cta rv" style={{ '--d': '.16s' } as React.CSSProperties}>
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

        {/* The report, as the reader would receive it. Three readings the copy
            gives, and the blend struck through because the argument is that it
            hides both directions. */}
        <div className="report rv" style={{ '--d': '.1s' } as React.CSSProperties}>
          <div className="rp-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>Share of answers, per engine</span>
          </div>
          <div className="rp-in">
            <div className="rp-cap">
              <b>Our own domain</b>
              <u>{ENGINE_DIVERGENCE.caption}</u>
            </div>
            <div className="rp-rows">
              {ENGINE_DIVERGENCE.rows
                .filter((r) => r.dir !== 'hidden')
                .map((r) => (
                  <div key={r.engine} className="rp-row" data-dir={r.dir}>
                    <em>{r.engine}</em>
                    <u>{r.from}</u>
                    {r.dir === 'up' ? <SlopeUp /> : <SlopeDown />}
                    <b>{r.to}</b>
                  </div>
                ))}
              {ENGINE_DIVERGENCE.rows
                .filter((r) => r.dir === 'hidden')
                .map((r) => (
                  <div key={r.engine} className="rp-row is-blend">
                    <em>{r.engine}</em>
                    <u>{r.from}</u>
                    <SlopeFlat />
                    <b>{r.to}</b>
                  </div>
                ))}
            </div>
            <p className="rp-note">{ENGINE_DIVERGENCE.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The short answer, in concept A's treatment.
 *
 * Arnel's pick, 2026-09-03: "Let's go with option B, but the short answer: I
 * want to use the option A design." So B's original flat full-width band is
 * gone and A's block stands in its place, unchanged in structure: its own card
 * on a light ground, the labelled "THE SHORT ANSWER" pill, and the stages line
 * carried under a hairline inside the same card. The card straddles the seam
 * where the electric hero meets paper, exactly as it does in A.
 *
 * Adapted for B's ground in one place only: the strip behind the card is B's
 * own hero gradient (150deg), not A's (158deg), so the card sits on THIS
 * page's hero and does not read as a foreign element. See concept-b.css.
 *
 * The copy is untouched.
 */
function AnswerB() {
  return (
    <section className="seam" id="short-answer">
      <div className="container">
        <div className="answer rv" data-speakable>
          <span className="alab">
            <i />
            {SHORT_ANSWER.label}
          </span>
          <p>{SHORT_ANSWER.body}</p>
          <p className="stages-line">{SHORT_ANSWER.stagesLine}</p>
        </div>
      </div>
      <div className="seam-tail" />
    </section>
  );
}

function FunnelB() {
  return (
    <section className="funnel" id="retrieve-cite-name">
      <div className="container">
        <div className="funnel-head rv">
          <h2 className="sec">{CHAIN.heading}</h2>
          <p className="lede">{CHAIN.lede}</p>
        </div>

        {/* One sample, one unit. 40 answers in, 24 retrieved, 7 named. The
            citation step carries no bar because this read did not sample it. */}
        <div className="fn rv">
          <div className="fn-cap">
            <span>ChatGPT, 40 answers sampled</span>
            <span>Retrieve, cite, name</span>
          </div>
          <div className="fn-bars">
            <div className="fn-bar" data-tone="sample">
              <em>Answers sampled</em>
              <div className="fn-track">
                <div className="fn-fill" style={{ width: '100%' }} />
              </div>
              <b>40</b>
            </div>
            <div className="fn-bar">
              <em>Retrieved a page</em>
              <div className="fn-track">
                <div className="fn-fill" style={{ width: '60%' }} />
              </div>
              <b>24</b>
            </div>
            <div className="fn-bar" data-tone="stall">
              <em>Named LoudFace</em>
              <div className="fn-track">
                <div className="fn-fill" style={{ width: '17.5%' }} />
              </div>
              <b>7</b>
            </div>
          </div>
          <p className="fn-legend">{CHAIN.failLine}</p>
          <p className="fn-note">
            The citation step is not drawn: this read counted answers, not citations.
          </p>
        </div>

        <div className="funnel-body">
          <div>
            <p className="copy rv">{CHAIN.measured}</p>
            <p className="copy rv">{CHAIN.close}</p>
          </div>
          <div className="dual rv">
            <p className="dl-cap">{CHAIN.divergence.caption}</p>
            {CHAIN.divergence.rows.map((r) => (
              <div key={r.label} className="dl-row" data-flat={r.moved ? undefined : ''}>
                <div>
                  <h4>{r.label}</h4>
                  <p>
                    from {r.from} {r.moved ? 'moved' : 'flat'}
                  </p>
                </div>
                <b>{r.to}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueB() {
  return (
    <section className="rev" id="revenue-frame">
      <div className="container">
        <div className="rev-top rv">
          <h2 className="sec">{REVENUE.heading}</h2>
          <p className="lift" data-speakable>
            {REVENUE.liftable}
          </p>
        </div>
        <div className="rungs rv">
          {REVENUE.ladder.map((r, i) => (
            <div key={r.step} className="rung">
              <span className="rg-i">{i + 1}</span>
              <b>{r.step}</b>
              <span>{r.note}</span>
            </div>
          ))}
        </div>
        <div className="rev-close">
          <p className="copy rv">{REVENUE.paras[0]}</p>
          <p className="copy rv">{REVENUE.paras[1]}</p>
          <p className="copy rv">{REVENUE.paras[2]}</p>
        </div>
      </div>
    </section>
  );
}

function LedgerFigure({ stage }: { stage: Stage }) {
  if (stage.n === 4) {
    return (
      <div className="lg-fig">
        <p className="lf-cap">128,515 citations, 90 days, B2B SaaS growth-agency category</p>
        <div className="lf-bar">
          <b style={{ width: '52.76%' }}>52.76%</b>
          <span>Every other page type</span>
        </div>
        <p className="lf-note">
          Listicles carried more of every citation than every other page type combined.
        </p>
      </div>
    );
  }
  if (stage.n === 6) {
    return (
      <div className="lg-fig">
        <p className="lf-cap">Third-party pages the three engines cited, 30 days</p>
        <div className="lf-pair">
          <b>4 of 975</b>
          <span>cited third-party pages that mention LoudFace</span>
        </div>
        <p className="lf-note">A brand that is only ever named from its own pages has a ceiling.</p>
      </div>
    );
  }
  if (stage.n === 8) {
    return (
      <div className="lg-fig">
        <p className="lf-cap">{ENGINE_DIVERGENCE.caption}</p>
        <div className="lf-rows">
          {ENGINE_DIVERGENCE.rows.map((r) => (
            <div key={r.engine} className="lf-row" data-dir={r.dir}>
              <em>{r.engine}</em>
              <u>{r.from}</u>
              <b>{r.to}</b>
            </div>
          ))}
        </div>
        <p className="lf-note">{ENGINE_DIVERGENCE.note}</p>
      </div>
    );
  }
  return null;
}

function StagesB() {
  return (
    <section className="stages" id="stages">
      <div className="container">
        <div className="stages-head rv">
          <h2 className="sec on-dark">The eight stages</h2>
          <p>
            Each stage opens onto the same three things: what we do, what it outputs, and the
            reading that says whether it worked.
          </p>
        </div>

        <div className="ledger rv">
          <div className="lg-head" aria-hidden="true">
            <div>The eight stages, in order</div>
            <div />
          </div>
          {/* The first three stages open by default (Arnel, 2026-09-03): one
              open row read as a fluke, three read as a ledger the reader is
              already inside. The other five stay collapsed. Every stage is in
              the served HTML either way, open or closed, which is what the
              <details> element buys on a page that AI crawlers read. */}
          {STAGES.map((s, i) => (
            <details key={s.n} open={i < 3}>
              <summary>
                {/* The approved heading, verbatim ("Stage 4. Artifact"). An
                    earlier version showed only the short name, which dropped the
                    approved stage headings out of the served HTML. */}
                <span className="lg-name">
                  <b>{s.name}</b>
                  <span>{s.first}</span>
                </span>
                <span className="mk" aria-hidden="true" />
              </summary>
              <div className="lg-body">
                <div>
                  {s.n === 8 ? (
                    <>
                      <p className="copy">{s.blocks[0].text}</p>
                      <ol style={{ marginTop: 16 }}>
                        {s.blocks
                          .filter((b) => b.kind === 'lead')
                          .map((b) => (
                            <li key={b.lead}>
                              <b>{b.lead}</b> {b.text}
                            </li>
                          ))}
                      </ol>
                      <p className="copy" style={{ marginTop: 16 }}>
                        {s.blocks[s.blocks.length - 1].text}
                      </p>
                    </>
                  ) : (
                    s.blocks.map((b, bi) => (
                      <p className="copy" key={bi} style={bi > 0 ? { marginTop: 16 } : undefined}>
                        {b.kind === 'lead' && <b>{b.lead} </b>}
                        {b.text}
                      </p>
                    ))
                  )}
                  <LedgerFigure stage={s} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function MeasureB() {
  return (
    <section className="meas" id="what-we-measure">
      <div className="container">
        <div className="meas-head rv">
          <h2 className="sec on-dark">{MEASURE.heading}</h2>
          <p className="lede on-dark">
            Eight readings, each with the question it answers and the source it comes from. Two of
            them are floors rather than totals, and the table says which.
          </p>
        </div>
        <div className="rv">
          <MeasureTable dark />
        </div>
        <div className="floors rv">
          <span className="fl-chip">{MEASURE.floorLabel}</span>
          <p className="copy on-dark">{MEASURE.floors}</p>
        </div>
      </div>
    </section>
  );
}

function EnginesB() {
  return (
    <section className="eng" id="engines">
      <div className="container">
        <div className="eng-head rv">
          <h2 className="sec">{ENGINES.heading}</h2>
        </div>

        <div className="spec rv">
          <div className="sp-head">
            <div>
              <b>Read</b>
            </div>
            <div>
              <b>{ENGINES.tracked.title}</b>
              <span>{ENGINES.tracked.kicker}</span>
            </div>
            <div>
              <b>{ENGINES.untracked.title}</b>
              <span>{ENGINES.untracked.kicker}</span>
            </div>
          </div>
          <dl>
            <div className="sp-row">
              <dt>Scope</dt>
              <dd>{ENGINES.tracked.lede}</dd>
              <dd>{ENGINES.untracked.lede}</dd>
            </div>
            {ENGINES.tracked.rows.map((row, i) => (
              <div className="sp-row" key={row}>
                <dt>{['Cadence', 'Granularity', 'Baseline', 'Metrics'][i]}</dt>
                <dd>{row}</dd>
                <dd>{ENGINES.untracked.rows[i]}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="sp-note">
          <div>
            {ENGINES.paras.map((t) => (
              <p className="copy rv" key={t.slice(0, 24)}>
                {t}
              </p>
            ))}
          </div>
          <p className="sp-ask rv">{ENGINES.ask}</p>
        </div>
      </div>
    </section>
  );
}

function ProofB() {
  return (
    <section className="proof" id="proof">
      <div className="container">
        <div className="proof-head rv">
          <h2 className="sec on-dark">{PROOF.heading}</h2>
        </div>
        <div className="exhibits">
          {PROOF.cards.map((c) => (
            <article key={c.id} className="exhibit rv">
              <div>
                <span className="ex-lab">{c.label}</span>
                <p className="ex-fig">{c.figure}</p>
                <p className="ex-figlab">{c.figureLabel}</p>
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
                <p className="ex-body">{c.body}</p>
                <p className="ex-go">
                  <Link href={c.href} className="tlink">
                    {c.linkText}
                    <ArrowIcon />
                  </Link>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromiseB() {
  return (
    <section className="prom" id="what-we-do-not-promise">
      <div className="container">
        <div className="prom-grid">
          <div className="rv">
            <h2 className="sec on-dark">{NO_PROMISE.heading}</h2>
            <p className="copy on-dark" style={{ marginTop: 18 }}>
              {NO_PROMISE.paras[0]}
            </p>
            <p className="copy on-dark" style={{ marginTop: 18 }}>
              {NO_PROMISE.googleLede}
            </p>
          </div>
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
        </div>

        <div className="quotes rv">
          {NO_PROMISE.googleQuotes.map((q) => (
            <div key={q.slice(0, 24)} className="quote">
              <blockquote>&ldquo;{q}&rdquo;</blockquote>
              <cite>Google Search Central</cite>
            </div>
          ))}
          <div className="quote">
            <blockquote>
              {NO_PROMISE.googleQuoteLlms.prefix} &ldquo;{NO_PROMISE.googleQuoteLlms.quote}&rdquo;
            </blockquote>
            <cite>Google Search Central</cite>
          </div>
        </div>
        <p className="copy on-dark prom-close rv">{NO_PROMISE.correction}</p>
      </div>
    </section>
  );
}

function PricingB() {
  return (
    <section className="price" id="what-it-costs">
      <div className="container">
        <div className="price-strip rv">
          <div>
            <span className="anchor">
              <u>{PRICING.bandPrefix}</u>
              <b>{PRICING.bandDisplay}</b>
              <span>{PRICING.bandSuffix}</span>
            </span>
            <h2>{PRICING.heading}</h2>
            <p className="copy" style={{ marginTop: 16 }}>
              {PRICING.lede} {PRICING.body}
            </p>
          </div>
          <dl className="terms">
            {PRICING.terms.map((t) => (
              <div key={t.k}>
                <dt>{t.k}</dt>
                <dd>{t.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function StartB() {
  return (
    <section className="start" id="where-to-start">
      <div className="container start-grid">
        <div>
          <h2 className="rv">{START.heading}</h2>
          <p className="copy rv" style={{ marginTop: 18 }}>
            {START.lede} {START.body}
          </p>
          <div className="start-cta rv">
            <Link href={START.ctaHref} className="btn btn-ink btn-pill btn-lg">
              {START.ctaLabel}
            </Link>
          </div>
        </div>
        <div className="auditcard rv">
          <p className="ac-lab">What comes back</p>
          <ul>
            {START.items.map((it) => (
              <li key={it}>
                <CheckIcon />
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FaqB() {
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="faq-head rv">
          <h2 className="sec">Nine questions buyers actually ask</h2>
          <p className="lede">
            Every answer here carries the same readings as the page above, and the numbers that are
            floors rather than totals say so.
          </p>
        </div>
        <div className="rv">
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}

export function MethodologyConceptB() {
  return (
    <>
      <HeroB />
      <AnswerB />
      <FunnelB />
      <RevenueB />
      <StagesB />
      <MeasureB />
      <EnginesB />
      <ProofB />
      <PromiseB />
      <PricingB />
      <StartB />
      <FaqB />
      <FooterV3 />
    </>
  );
}
