/**
 * CONCEPT A: "the chain rail".
 *
 * Spine: one narrative column, organised by a hairline chain that recurs at
 * three scales: the hero's three-link plate, the eight stage nodes, the
 * five-rung revenue ladder. Ground rhythm: electric hero, crisp light, night,
 * crisp light, surface-50, night, crisp light, surface-50, night cover, light.
 *
 * Harvest notes for this concept:
 *  - Rail structure stolen from Aceternity's `Timeline` (sticky per-item marker
 *    + a two-column marker/content grid). Its scroll-progress beam was REJECTED:
 *    a purple-to-blue gradient beam (gradient + colour ban), offsets tuned to
 *    their demo (`start 10%` / `end 50%`, the documented dead-beam defect), and
 *    a one-shot useEffect height measurement with no ResizeObserver, so the
 *    track length is wrong after font load. The rail here is static and correct.
 *  - Unequal-span mechanic stolen from Aceternity's `BentoGrid` (its own demo
 *    spans items 3 and 6 across two columns). That is what keeps the proof
 *    section from being a banned three-equal-card row. Its icon-tile-above-a-
 *    heading item shape and 18rem fixed row height were rejected.
 *  - Magic UI's `NumberTicker` was rejected outright: it server-renders
 *    `startValue`, so every figure on this page would reach an AI crawler as
 *    "0". On a page whose whole argument is measured readings, that is the worst
 *    possible defect. Figures here are plain server-rendered text.
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

/** Slope marks. Two shapes only: moved, or flat. Both are the copy's own words. */
const SlopeUp = () => (
  <svg viewBox="0 0 26 14" aria-hidden="true">
    <path d="M2 12 12 8 24 2" />
  </svg>
);
const SlopeFlat = () => (
  <svg viewBox="0 0 26 14" aria-hidden="true">
    <path d="M2 7.6 24 6.6" />
  </svg>
);

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroA() {
  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow glass rv">
            <i />
            {PAGE.eyebrow}
            <em>{PAGE.eyebrowTag}</em>
          </span>
          <h1 className="rv" style={{ '--d': '.06s' } as React.CSSProperties}>
            The Answer Chain:
            <span className="sub">{PAGE.h1Rest}</span>
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

        {/* The hero's one focal object: the chain, with only the two readings
            the copy actually measured. The middle link is deliberately blank,
            the source gives no per-40 citation figure and inventing one is not
            on the table. */}
        <div className="chainplate rv" style={{ '--d': '.1s' } as React.CSSProperties}>
          <div className="cp-head">
            <b>Retrieve, cite, name</b>
            <span>ChatGPT, 40 answers</span>
          </div>
          <div className="cp-links">
            <div className="cp-link">
              <span className="cp-node" aria-hidden="true" />
              <div>
                <h3>{CHAIN.links[0].title}</h3>
                <p>{CHAIN.links[0].body}</p>
              </div>
              <div className="cp-read">
                <b>{CHAIN.links[0].figure}</b>
                <span>answers</span>
              </div>
            </div>
            <div className="cp-link">
              <span className="cp-node" aria-hidden="true" />
              <div>
                <h3>{CHAIN.links[1].title}</h3>
                <p>{CHAIN.links[1].body}</p>
              </div>
              <div className="cp-read empty">
                <b>Not sampled</b>
                <span>answers, not citations</span>
              </div>
            </div>
            <div className="cp-link" data-state="stall">
              <span className="cp-node" aria-hidden="true" />
              <div>
                <h3>{CHAIN.links[2].title}</h3>
                <p>{CHAIN.links[2].body}</p>
              </div>
              <div className="cp-read">
                <b>{CHAIN.links[2].figure}</b>
                <span>answers</span>
              </div>
            </div>
          </div>
          <p className="cp-foot">{CHAIN.failLine}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── The short answer, straddling the seam ────────────────────────── */

function AnswerA() {
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

/* ─── Retrieve / cite / name, and the measurement behind it ────────── */

function ChainA() {
  return (
    <section className="chain" id="retrieve-cite-name">
      <div className="container">
        <div className="chain-head rv">
          <h2 className="sec">
            {CHAIN.heading}
          </h2>
          <p className="lede">{CHAIN.lede}</p>
        </div>

        {/* A flow diagram, not a card row. Three plates of unequal weight on one
            rail: the two the copy measured carry their readings, the middle one
            says plainly that this read did not sample it, and the last join is
            dashed because that is the link that stalls. */}
        <div className="chainflow rv">
          <div className="cf-plate">
            <h3>{CHAIN.links[0].title}</h3>
            <p>{CHAIN.links[0].body}</p>
            <div className="cf-read">
              <b>{CHAIN.links[0].figure}</b>
              <span>{CHAIN.links[0].figureLabel}</span>
            </div>
          </div>

          <div className="cf-join" aria-hidden="true">
            <span className="cf-line" />
            <ArrowIcon />
          </div>

          <div className="cf-plate is-thin">
            <h3>{CHAIN.links[1].title}</h3>
            <p>{CHAIN.links[1].body}</p>
            <div className="cf-read is-empty">
              <b>Not sampled</b>
              <span>this read counted answers, not citations</span>
            </div>
          </div>

          <div className="cf-join is-break" aria-hidden="true">
            <span className="cf-line" />
            <ArrowIcon />
          </div>

          <div className="cf-plate is-stall">
            <h3>{CHAIN.links[2].title}</h3>
            <p>{CHAIN.links[2].body}</p>
            <div className="cf-read">
              <b>{CHAIN.links[2].figure}</b>
              <span>{CHAIN.links[2].figureLabel}</span>
            </div>
          </div>
        </div>

        <p className="chain-fail rv">{CHAIN.failLine}</p>

        <div className="chain-body">
          <p className="copy rv">{CHAIN.measured}</p>

          {/* Bespoke figure: one moved, one stayed flat. Card-less on dotted
              paper, house indigo ink. No derived percentages, the readings are
              printed as the copy gives them and the slope carries the shape. */}
          <div className="diverge rv">
            <p className="dv-cap">{CHAIN.divergence.caption}</p>
            {CHAIN.divergence.rows.map((r) => (
              <div key={r.label} className="dv-row" data-flat={r.moved ? undefined : ''}>
                <h4>{r.label}</h4>
                <div className="dv-vals">
                  <b className="from">{r.from}</b>
                  {r.moved ? <SlopeUp /> : <SlopeFlat />}
                  <b>{r.to}</b>
                  <u>{r.moved ? 'moved' : 'flat'}</u>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="copy chain-close rv">{CHAIN.close}</p>
      </div>
    </section>
  );
}

/* ─── The revenue frame ────────────────────────────────────────────── */

function RevenueA() {
  return (
    <section className="rev" id="revenue-frame">
      <div className="container">
        <div className="rev-head rv">
          <h2 className="sec on-dark">
            {REVENUE.heading}
          </h2>
          {/* The liftable sentence. Its own block, quotable exactly as written. */}
          <p className="lift" data-speakable>
            {REVENUE.liftable}
          </p>
        </div>

        <div className="rev-body">
          <div>
            <p className="copy on-dark rv">{REVENUE.paras[0]}</p>
            <p className="copy on-dark rv">{REVENUE.paras[1]}</p>
          </div>
          <div className="ladder rv">
            <p className="ld-cap">Engine signal to commercial event</p>
            <ol>
              {REVENUE.ladder.map((r) => (
                <li key={r.step}>
                  <b>{r.step}</b>
                  <span>{r.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="copy on-dark rev-close rv">{REVENUE.paras[2]}</p>
      </div>
    </section>
  );
}

/* ─── The eight stages ─────────────────────────────────────────────── */

function StageFigure({ stage }: { stage: Stage }) {
  if (stage.n === 4) {
    return (
      <div className="sfig">
        <p className="sf-cap">128,515 citations, 90 days, B2B SaaS growth-agency category</p>
        <div className="sf-bar">
          <b style={{ width: '52.76%' }}>52.76%</b>
          <span>Every other page type</span>
        </div>
        <p className="sf-note">
          Listicles carried more of every citation than every other page type combined.
        </p>
      </div>
    );
  }
  if (stage.n === 6) {
    return (
      <div className="sfig">
        <p className="sf-cap">Third-party pages the three engines cited, 30 days</p>
        <div className="sf-pair">
          <b>4 of 975</b>
          <span>cited third-party pages that mention LoudFace</span>
        </div>
        <p className="sf-note">
          A brand that is only ever named from its own pages has a ceiling.
        </p>
      </div>
    );
  }
  if (stage.n === 8) {
    return (
      <div className="sfig">
        <p className="sf-cap">{ENGINE_DIVERGENCE.caption}</p>
        <div className="sf-rows">
          {ENGINE_DIVERGENCE.rows.map((r) => (
            <div key={r.engine} className="sf-row" data-dir={r.dir}>
              <em>{r.engine}</em>
              <u>{r.from}</u>
              <b>{r.to}</b>
            </div>
          ))}
        </div>
        <p className="sf-note">{ENGINE_DIVERGENCE.note}</p>
      </div>
    );
  }
  return null;
}

function StagesA() {
  return (
    <section className="stages" id="stages">
      <div className="container">
        <div className="stages-head rv">
          <h2 className="sec">
            The eight stages
          </h2>
        </div>

        <div className="rail">
          {STAGES.map((s) => (
            <article key={s.n} className="stage rv">
              <div className="st-mark">
                <i aria-hidden="true" />
                <b>Stage {s.n}</b>
                <span>{s.short}</span>
              </div>
              <div className="st-body">
                <h3>{s.name}</h3>
                {/* Stage 8's five blocks are an ordered list in the approved
                    copy ("in this order", 1 to 5), so they render as one.
                    Everywhere else the lead-ins are sentence lead-ins. */}
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
                  s.blocks.map((b, i) => (
                    <p className="copy" key={i}>
                      {b.kind === 'lead' && <b>{b.lead} </b>}
                      {b.text}
                    </p>
                  ))
                )}
                <StageFigure stage={s} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What we measure ──────────────────────────────────────────────── */

function MeasureA() {
  return (
    <section className="meas" id="what-we-measure">
      <div className="container">
        <div className="meas-head rv">
          <h2 className="sec">
            {MEASURE.heading}
          </h2>
        </div>
        <div className="rv">
          <MeasureTable />
        </div>
        <div className="floors rv">
          <span className="fl-chip">{MEASURE.floorLabel}</span>
          <p className="copy">{MEASURE.floors}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Engines tracked, and the snapshot ────────────────────────────── */

function EnginesA() {
  return (
    <section className="eng" id="engines">
      <div className="container">
        <div className="eng-head rv">
          <h2 className="sec on-dark">
            {ENGINES.heading}
          </h2>
        </div>

        <div className="eng-two">
          {[ENGINES.tracked, ENGINES.untracked].map((p, i) => (
            <div key={p.title} className="epanel rv" data-kind={i === 0 ? 'tracked' : 'snapshot'}>
              <p className="ep-lab">{p.title}</p>
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

        <div className="eng-notes">
          <div>
            {ENGINES.paras.map((t) => (
              <p className="copy on-dark rv" key={t.slice(0, 24)}>
                {t}
              </p>
            ))}
          </div>
          <p className="eng-ask rv">{ENGINES.ask}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Proof ────────────────────────────────────────────────────────── */

function ProofA() {
  const [lead, ...rest] = PROOF.cards;
  return (
    <section className="proof" id="proof">
      <div className="container">
        <div className="proof-head rv">
          <h2 className="sec on-dark">{PROOF.heading}</h2>
        </div>

        <div className="proof-grid">
          <article className="pcard is-lead rv">
            <div className="pl-left">
              <span className="pc-lab">{lead.label}</span>
              <div className="pc-fig">
                <b>{lead.figure}</b>
                <span>{lead.figureLabel}</span>
              </div>
              {/* The three readings the copy gives for our own domain, in order. */}
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
            </div>
            <div className="pl-right">
              <p className="pc-body">{lead.body}</p>
              <p className="pc-go">
                <Link href={lead.href} className="tlink">
                  {lead.linkText}
                  <ArrowIcon />
                </Link>
              </p>
            </div>
          </article>

          {rest.map((c) => (
            <article key={c.id} className="pcard rv">
              <span className="pc-lab">{c.label}</span>
              <div className="pc-fig">
                <b>{c.figure}</b>
                <span>{c.figureLabel}</span>
              </div>
              <p className="pc-body">{c.body}</p>
              <p className="pc-go">
                <Link href={c.href} className="tlink">
                  {c.linkText}
                  <ArrowIcon />
                </Link>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What we do not promise ───────────────────────────────────────── */

function PromiseA() {
  return (
    <section className="prom" id="what-we-do-not-promise">
      <div className="container">
        <div className="prom-top">
          <div className="rv">
            <h2 className="sec on-dark">{NO_PROMISE.heading}</h2>
            <p className="copy" style={{ marginTop: 18 }}>
              {NO_PROMISE.paras[0]}
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

        <div className="gdocs rv">
          <p className="copy on-dark gd-lede">{NO_PROMISE.googleLede}</p>
          <div className="quotes">
            {NO_PROMISE.googleQuotes.map((q) => (
              <div key={q.slice(0, 24)} className="quote">
                <blockquote>&ldquo;{q}&rdquo;</blockquote>
                <cite>Google Search Central</cite>
              </div>
            ))}
            <div className="quote">
              {/* The connective phrase is copy, so it stays. It sits outside the
                  quotation marks where the sentence actually puts it. */}
              <span className="qlead">{NO_PROMISE.googleQuoteLlms.prefix}</span>
              <blockquote>&ldquo;{NO_PROMISE.googleQuoteLlms.quote}&rdquo;</blockquote>
              <cite>Google Search Central</cite>
            </div>
          </div>
          <p className="copy on-dark prom-close">{NO_PROMISE.correction}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── What it costs ────────────────────────────────────────────────── */

function PricingA() {
  return (
    <section className="price" id="what-it-costs">
      <div className="container">
        <div className="price-card rv">
          <div>
            <span className="anchor on-light">
              <u>{PRICING.bandPrefix}</u>
              <b>{PRICING.bandDisplay}</b>
              <span>{PRICING.bandSuffix}</span>
            </span>
            <h2 className="sec">{PRICING.heading}</h2>
            <p className="copy" style={{ marginTop: 18 }}>
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

/* ─── Where to start ───────────────────────────────────────────────── */

function StartA() {
  return (
    <section className="cover" id="where-to-start">
      <div className="container">
        <div className="cover-meta rv">
          <span>The free audit</span>
          <span>B2B SaaS only</span>
        </div>
        <div className="cover-mid">
          <div>
            <h2 className="rv">{START.heading}</h2>
            <p className="lede rv">
              {START.lede} {START.body}
            </p>
            <div className="cover-cta rv">
              <Link href={START.ctaHref} className="btn btn-white btn-pill btn-lg">
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
        <div className="cover-credit rv">
          <span>One-time snapshot, not the tracked panel</span>
          <span>loudface.co/ai-audit</span>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ──────────────────────────────────────────────────────────── */

function FaqA() {
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <aside className="faq-panel rv">
          <h3>Nine questions buyers actually ask</h3>
          <p className="pl">
            Every answer here carries the same readings as the page above, and the numbers that
            are floors rather than totals say so.
          </p>
          <Link href={START.ctaHref} className="btn btn-white btn-pill btn-md">
            {START.ctaLabel}
          </Link>
          <div className="fstats">
            <div className="fstat">
              <b>{PRICING.bandDisplay}</b>
              <span>from, a month</span>
            </div>
            <div className="fstat">
              <b>3</b>
              <span>engines tracked, never blended</span>
            </div>
          </div>
        </aside>
        <div className="rv">
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}

/* ─── The concept ──────────────────────────────────────────────────── */

export function MethodologyConceptA() {
  return (
    <>
      <HeroA />
      <AnswerA />
      <ChainA />
      <RevenueA />
      <StagesA />
      <MeasureA />
      <EnginesA />
      <ProofA />
      <PromiseA />
      <PricingA />
      <StartA />
      <FaqA />
      <FooterV3 />
    </>
  );
}
