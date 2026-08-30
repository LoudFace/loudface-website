/**
 * SeoForPageV3 — the v3 template for the programmatic `/seo-for/<industry>`
 * pages (and reusable by the bespoke siblings). Every slot is filled from one
 * Sanity `seoPage` document, and every slot degrades independently: a document
 * carrying only a headline still renders a complete page (hero + logo strip +
 * proof + cover), and a fully-populated one renders the whole rhythm.
 *
 * Rhythm (DESIGN.md §2 — pages OPEN electric, night is mid-page depth only):
 *   ELECTRIC hero → indigo logo strip → challenges (light tint) → long-form
 *   prose (light) → NIGHT strategy runway w/ blueprint plates → deliverables
 *   (light) → proof band → NIGHT testimonial → related work (light) → related
 *   insights (light tint) → FAQ (light) → NIGHT cover-stack → FooterV3.
 *
 * The visual layer is service-v3/service-v3.css, imported by the route and
 * rendered inside a `.svcv3` wrapper — those class names (.hero/.logos/.deliver/
 * .runway/.proof/.faq/.cover) are generic to the v3 language, not service-
 * specific, so reusing them keeps these pages pixel-identical to the approved
 * /services/* build instead of forking a second stylesheet. Only genuinely new
 * furniture (`.sf-*`) lives in seo-for-v3.css.
 *
 * Server Component — zero page-level client JS beyond the shared reveal script.
 * The dark→scrolled nav flip is owned by the shared (site) Header.
 */
import Image from 'next/image';
import Link from 'next/link';
import { LOGOS } from '../home-v3/_logos';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';
import { Blueprint } from '../service-v3/ServicePageV3';
import type { FaqItem, Pair, Stat } from './data';

/* image crops — match the approved /services build */
const CROP_HERO = '?w=1080&h=836&fit=crop&crop=top&fm=webp&q=82';
const CROP_CARD = '?w=760&h=476&fit=crop&crop=top&fm=webp&q=82';
const CROP_COVER_BG = '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82';
const CROP_COVER_OBJ = '?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82';

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

/* runway supporting-card glyphs (same set as the services template) */
const RC_GLYPHS = [
  <path key="r0" d="M13 2 4 14h7l-1 8 10-12h-7l1-8z" />,
  <>
    <circle key="a" cx="12" cy="12" r="9" />
    <path key="b" d="M12 7v5l3 2" />
  </>,
  <path key="r2" d="M4 17l6-6 4 4 6-8" />,
];

/* ── view-model ──────────────────────────────────────────────────────── */

export interface RelatedCard {
  href: string;
  title: string;
  /** client name (work) or category (insight) — rendered as the sub-line/tag */
  meta?: string;
  imageUrl?: string;
}

export interface QuoteSource {
  bodyHtml: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface Deliverable {
  title: string;
  description?: string;
}

export interface SeoForView {
  /** eyebrow — "SEO for Healthcare" */
  eyebrow: string;
  /** short qualifier riding the eyebrow when BOTH subtitle and description exist */
  eyebrowTag?: string;
  h1: string;
  /** the single hero sub — keeps the hero to the 4-part copy budget (DESIGN.md §7) */
  sub?: string;
  /** floating hero artifact: the strongest related case-study screenshot */
  heroShot?: { url: string; domain: string; alt: string; client?: string };
  logosLead: string;
  painTitle: string;
  painLede: string;
  painPoints: Pair[];
  proseTitle?: string;
  proseHtml?: string;
  strategyTitle: string;
  strategyLede?: string;
  strategySteps: Pair[];
  deliverables: Deliverable[];
  resultsTitle: string;
  resultsLede: string;
  stats: Stat[];
  quote?: QuoteSource;
  relatedWork: RelatedCard[];
  relatedWorkTitle: string;
  relatedPosts: RelatedCard[];
  faqTitle: string;
  faqItems: FaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  /** cover-stack background + floating object (reuses the hero shot when present) */
  coverShot?: { url: string; domain: string; client?: string };
}

/* ── template ────────────────────────────────────────────────────────── */

export function SeoForPageV3({ view }: { view: SeoForView }) {
  const v = view;
  const heroChip = v.stats[0];
  // Strategy: first two steps become blueprint rows, the rest supporting cards.
  const runRows = v.strategySteps.slice(0, 2);
  const runCards = v.strategySteps.slice(2);

  return (
    <>
      {/* NOTE: (site)/layout.tsx already wraps children in <main id="main-content">,
          so this template must not add a second <main>. */}

      {/* ============ HERO — electric stage ============ */}
      <section className="hero" aria-label={v.h1}>
        <div className={`hero-grid${v.heroShot ? '' : ' sf-solo'}`}>
          <div className="hero-copy">
            <span className="hero-eyebrow rv">
              {v.eyebrow}
              {v.eyebrowTag ? <em>{v.eyebrowTag}</em> : null}
            </span>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
              {v.h1}
            </h1>
            {v.sub ? (
              <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
                {v.sub}
              </p>
            ) : null}
            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg btn-pill">
                Get a free SEO audit
              </a>
              <Link href="#approach" className="tlink">
                See our approach
                <Arrow />
              </Link>
            </div>
          </div>

          {v.heroShot ? (
            <div className="stage-zone rv" style={{ ['--d' as string]: '.14s' }} aria-label="A LoudFace client site">
              {heroChip ? (
                <span className="stage-chip">
                  <i></i>
                  <b>{heroChip.value}</b>
                  <span>{heroChip.label}</span>
                </span>
              ) : null}
              <div className="mat stage-main">
                <div className="plate">
                  <div className="bar" aria-hidden="true">
                    <b></b>
                    <b></b>
                    <b></b>
                    <span>{v.heroShot.domain}</span>
                  </div>
                  <div className="shot">
                    <Image
                      src={v.heroShot.url + CROP_HERO}
                      alt={v.heroShot.alt}
                      width={1080}
                      height={836}
                      quality={82}
                      priority
                    />
                  </div>
                  {v.heroShot.client ? (
                    <span className="rpill">
                      <i></i>
                      <b>Client</b>
                      <span>{v.heroShot.client}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ============ LOGO MARQUEE — saturated indigo strip (canon) ============ */}
      <section className="logos" aria-label="Trusted by">
        <p className="logos-lead">{v.logosLead}</p>
        <div className="marq">
          <div className="marq-track">
            {LOGOS.map((l) => (
              <span className="marq-logo" key={l.alt}>
                <Image src={l.src} alt={l.alt} loading="lazy" width={l.w} height={l.h} quality={82} />
              </span>
            ))}
            {LOGOS.map((l) => (
              <span className="marq-logo" key={`${l.alt}-dup`}>
                {/* The loop duplicate keeps aria-hidden so screen readers do not hear the
                    client list twice, but it MUST carry the same alt as the original:
                    crawlers ignore aria-hidden and read empty alt as a missing description. */}
                <Image src={l.src} alt={l.alt} aria-hidden="true" loading="lazy" width={l.w} height={l.h} quality={82} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHALLENGES — crisp light, tinted ============ */}
      {v.painPoints.length > 0 ? (
        <section className="sf-pain" aria-label={v.painTitle}>
          <div className="container">
            <div className="sf-pain-head rv">
              <h2 className="display">{v.painTitle}</h2>
              <p className="lede">{v.painLede}</p>
            </div>
            <div className="sf-pain-list">
              {v.painPoints.map((p, i) => (
                <article className="sf-pain-row rv" style={{ ['--d' as string]: `${i * 0.06}s` }} key={p.title}>
                  <span className="sf-pain-k" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ LONG-FORM CMS PROSE — crisp light ============ */}
      {v.proseHtml ? (
        <section className="sf-prose" aria-label={v.proseTitle || 'Overview'}>
          <div className="container">
            <div className="sf-prose-in">
              {v.proseTitle ? (
                <div className="sf-prose-head rv">
                  <h2 className="display">{v.proseTitle}</h2>
                </div>
              ) : null}
              <div className="sf-body rv" dangerouslySetInnerHTML={{ __html: v.proseHtml }} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ STRATEGY RUNWAY — night stage ============ */}
      {v.strategySteps.length > 0 ? (
        <section className="runway" id="approach" aria-label={v.strategyTitle}>
          <div className="container">
            <div className="runway-head rv">
              <h2 className="display on-dark">{v.strategyTitle}</h2>
              {v.strategyLede ? <p className="lede on-dark">{v.strategyLede}</p> : null}
            </div>
            <div className="run-list">
              {runRows.map((s, i) => (
                <div className={`run-row rv${i === 1 ? ' alt' : ''}`} key={s.title}>
                  <div className="run-txt">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                  <div className="run-fig" aria-hidden="true">
                    <Blueprint v={i === 0 ? 2 : 1} />
                  </div>
                </div>
              ))}
              {runCards.length > 0 ? (
                <div className="run-cards rv">
                  {runCards.map((s, i) => (
                    <article className="rcard" key={s.title}>
                      <span className="rc-glyph" aria-hidden="true">
                        <svg viewBox="0 0 24 24">{RC_GLYPHS[i % RC_GLYPHS.length]}</svg>
                      </span>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ DELIVERABLES — crisp light ============ */}
      {v.deliverables.length > 0 ? (
        <section className="deliver" id="whats-included" aria-label="What's included">
          <div className="container">
            <div className="deliver-head rv">
              <h2 className="display">What&rsquo;s included</h2>
              <p className="lede">Everything that ships as part of the program — no line-item surprises.</p>
            </div>
            <div className="sf-dlist">
              {v.deliverables.map((d) => (
                <div className="sf-ditem rv" key={d.title}>
                  <Check />
                  <span>
                    <b>{d.title}</b>
                    {d.description ? <span>{d.description}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ PROOF BAND ============ */}
      <section className="proof" aria-label={v.resultsTitle}>
        <div className="container">
          <div className="proof-head rv">
            <h2 className="display">{v.resultsTitle}</h2>
            <p className="lede">{v.resultsLede}</p>
          </div>
          <div className="proof-grid">
            <article className="pcard pc-hero rv">
              <span className="pk">{v.stats[0]?.value ?? '200+'}</span>
              <div>
                <span className="pl">{v.stats[0]?.label ?? 'B2B SaaS websites shipped'}</span>
              </div>
            </article>
            <div className="proof-col">
              <div className="proof-row">
                <article className="pcard pc-a rv" style={{ ['--d' as string]: '.06s' }}>
                  <span className="pk">{v.stats[1]?.value ?? '200+'}</span>
                  <span className="pl">{v.stats[1]?.label ?? 'B2B brands grown across SaaS, fintech & AI'}</span>
                </article>
                <article className="pcard pc-b rv" style={{ ['--d' as string]: '.1s' }}>
                  <span className="pk">{v.stats[2]?.value ?? '~2h'}</span>
                  <span className="pl">{v.stats[2]?.label ?? 'Typical first response'}</span>
                </article>
              </div>
              <article className="pcard pc-partner rv" style={{ ['--d' as string]: '.06s' }}>
                <span className="pk">4+ years</span>
                <img
                  src="/images/Enterprise-Blue-Badge.webp"
                  alt="Webflow Enterprise Partner badge"
                  width={660}
                  height={85}
                  loading="lazy"
                />
                <span className="pl">Webflow Enterprise Partner — 4+ years of delivery experience.</span>
              </article>
              <article className="pcard pc-badges rv" style={{ ['--d' as string]: '.1s' }}>
                <span className="bl">Recognized by the platforms that set the bar</span>
                <span className="bset">
                  <img src="/images/Awwwards.svg" alt="Awwwards Honorable Nominee" width={36} height={36} loading="lazy" />
                  <img src="/images/Trustpilot.svg" alt="Trustpilot Top-Rated Agency" width={36} height={36} loading="lazy" />
                </span>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL — night band ============ */}
      {v.quote ? (
        <section className="sf-quote" aria-label="Client testimonial">
          <div className="container">
            <div className="sf-quote-in rv">
              <blockquote dangerouslySetInnerHTML={{ __html: v.quote.bodyHtml }} />
              <span className="sf-cite">
                {v.quote.avatarUrl ? (
                  <img src={v.quote.avatarUrl} alt="" aria-hidden="true" width={38} height={38} loading="lazy" />
                ) : null}
                <span>
                  <b>{v.quote.name}</b>
                  {v.quote.role ? <span>{v.quote.role}</span> : null}
                </span>
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ RELATED WORK — crisp light ============ */}
      {v.relatedWork.length > 0 ? (
        <section className="sf-rel" aria-label={v.relatedWorkTitle}>
          <div className="container">
            <div className="sf-rel-head rv">
              <div>
                <h2 className="display">{v.relatedWorkTitle}</h2>
              </div>
              <Link className="sf-rel-all" href="/case-studies">
                See all work
                <Arrow />
              </Link>
            </div>
            <div className="sf-cards">
              {v.relatedWork.map((c) => (
                <Link className="sf-card rv" href={c.href} key={c.href}>
                  <span className="sf-card-shot">
                    {c.imageUrl ? (
                      <Image src={c.imageUrl + CROP_CARD} alt="" aria-hidden="true" width={760} height={476} quality={82} loading="lazy" />
                    ) : (
                      <span className="sf-card-plate" aria-hidden="true">
                        <span>{c.title.slice(0, 2).toUpperCase()}</span>
                      </span>
                    )}
                  </span>
                  <span className="sf-card-body">
                    <h3>{c.title}</h3>
                    {c.meta ? <p>{c.meta}</p> : null}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ RELATED INSIGHTS — crisp light, tinted ============ */}
      {v.relatedPosts.length > 0 ? (
        <section className="sf-rel tint" aria-label="Related insights">
          <div className="container">
            <div className="sf-rel-head rv">
              <div>
                <h2 className="display">Related insights</h2>
              </div>
              <Link className="sf-rel-all" href="/blog">
                All blog posts
                <Arrow />
              </Link>
            </div>
            <div className="sf-cards">
              {v.relatedPosts.map((c) => (
                <Link className="sf-card rv" href={c.href} key={c.href}>
                  <span className="sf-card-shot">
                    {c.imageUrl ? (
                      <Image src={c.imageUrl + CROP_CARD} alt="" aria-hidden="true" width={760} height={476} quality={82} loading="lazy" />
                    ) : (
                      <span className="sf-card-plate" aria-hidden="true">
                        <span>{c.title.slice(0, 2).toUpperCase()}</span>
                      </span>
                    )}
                  </span>
                  <span className="sf-card-body">
                    {c.meta ? <span className="sf-card-tag">{c.meta}</span> : null}
                    <h3>{c.title}</h3>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ FAQ ============ */}
      {v.faqItems.length > 0 ? (
        <section className="faq" aria-label="Frequently asked questions">
          <div className="container">
            <div className="faq-in">
              <div className="faq-head rv">
                <h2 className="display">{v.faqTitle}</h2>
              </div>
              <div className="faq-list rv">
                {v.faqItems.map((item, i) => (
                  <details className="qa" key={item.question} open={i === 0}>
                    <summary>
                      {item.question}
                      <span className="x" aria-hidden="true"></span>
                    </summary>
                    <div className="a" dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ COVER CTA — cover-stack ============ */}
      <section className="cover" id="book">
        {v.coverShot ? (
          <>
            {/* Full-bleed ⇒ sizes="100vw"; the w=1600 source caps the output. */}
            <Image
              className="cover-img"
              src={v.coverShot.url + CROP_COVER_BG}
              alt=""
              aria-hidden="true"
              width={1600}
              height={1000}
              sizes="100vw"
              quality={82}
              loading="lazy"
            />
            <div className="cover-veil" aria-hidden="true"></div>
          </>
        ) : null}
        <div className="container cover-in">
          <div className="cover-meta rv">
            <span>LoudFace — intro call</span>
            <span>30 minutes</span>
          </div>
          <div className="cover-mid">
            {v.coverShot ? (
              <div className="cover-obj" aria-hidden="true">
                <div className="mat" style={{ padding: '14px' }}>
                  <div className="plate">
                    <div className="bar">
                      <b></b>
                      <b></b>
                      <b></b>
                      <span>{v.coverShot.domain}</span>
                    </div>
                    <div className="shot">
                      <Image src={v.coverShot.url + CROP_COVER_OBJ} alt="" width={1000} height={640} quality={82} loading="lazy" />
                    </div>
                    {v.coverShot.client ? (
                      <span className="rpill">
                        <i></i>
                        <b>Client</b>
                        <span>{v.coverShot.client}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
            <h2 className="rv">{v.ctaTitle}</h2>
            <p className="rv" style={{ ['--d' as string]: '.08s' }}>
              {v.ctaSubtitle}
            </p>
            <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">
                Book an intro call
              </a>
              <span className="slots">
                <span className="dot"></span>One team — build and growth
              </span>
            </div>
          </div>
          <div className="cover-credit rv">
            <span>Typical first response — around 2 hours</span>
            <span>loudface.co</span>
          </div>
        </div>
      </section>

      <FooterV3 />
      <ServiceV3Scripts />
    </>
  );
}
