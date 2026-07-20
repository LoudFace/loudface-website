/**
 * ServicePageV3 — the parameterized /services/<slug> child template. One config
 * (SERVICE_CONFIGS[slug]) fills every slot: electric split-hero with a shipped
 * artifact → indigo logo marquee → deliverables object-wall (bento) → process
 * runway (zig-zag rows + blueprint plates) → full-bleed cinematic exhibit
 * (flagship artifact + 3 Satoshi-uppercase annotations + attributed outcome) →
 * proof band (safe attributed claims) → FAQ accordion → related-services rail +
 * hub link → cover-stack CTA → giant-wordmark FooterV3.
 *
 * Server component. Case-study screenshots resolve LIVE from Sanity by slug
 * (images prop from getServiceImages) with hardcoded CDN fallbacks. The shared
 * (site) Header renders above in its dark-hero variant (heroTheme="dark", wired
 * in (site)/layout.tsx for /services/*); the shared Footer is suppressed there so
 * only FooterV3 (same component as home/About/Pricing) renders inside .svcv3.
 */
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGOS } from '../home-v3/_logos';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from './Scripts';
import {
  type ServiceConfig,
  type Artifact,
  type DeliverTile,
  type HomeImages,
  artifactSrc,
} from './data';
import { SERVICES } from '../services-v3/data';

/* image crops (match the approved mockup) */
const CROP_HERO = '?w=1080&h=836&fit=crop&crop=top&fm=webp&q=82';
const CROP_SUB = '?w=760&h=522&fit=crop&crop=top&fm=webp&q=82';
const CROP_FRAG = '?w=640&h=424&fit=crop&crop=top&fm=webp&q=82';
const CROP_CANVAS = '?w=1800&h=1000&fit=crop&crop=top&fm=webp&q=80';
const CROP_COVER_BG = '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82';
const CROP_COVER_OBJ = '?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82';

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* deliverable glyphs (cycled by index) */
const GLYPHS: ReactNode[] = [
  <path key="g0" d="M4 19V5M4 19h16M8 16v-4M13 16V8M18 16v-6" />,
  <>
    <rect key="a" x="3" y="4" width="7" height="7" rx="2" />
    <rect key="b" x="14" y="13" width="7" height="7" rx="2" />
    <path key="c" d="M9 12a3 3 0 0 0 3 3M15 12a3 3 0 0 0-3-3" />
  </>,
  <path key="g2" d="M4 6h16M4 10h10M4 14h16M4 18h7" />,
  <>
    <rect key="a" x="3" y="4" width="18" height="16" rx="2" />
    <path key="b" d="M3 9h18M8 4v5M8 13h9M8 16h6" />
  </>,
  <>
    <rect key="a" x="2" y="5" width="14" height="10" rx="2" />
    <rect key="b" x="17" y="8" width="5" height="11" rx="1.5" />
    <path key="c" d="M6 19h6" />
  </>,
  <path key="g5" d="M12 3v18M5 10l7-7 7 7M7 21h10" />,
  <>
    <circle key="a" cx="12" cy="12" r="9" />
    <path key="b" d="M9 12l2 2 4-4" />
  </>,
  <path key="g7" d="M3 12h4l3 8 4-16 3 8h4" />,
];

/* runway supporting-card glyphs */
const RC_GLYPHS: ReactNode[] = [
  <path key="r0" d="M13 2 4 14h7l-1 8 10-12h-7l1-8z" />,
  <>
    <circle key="a" cx="12" cy="12" r="9" />
    <path key="b" d="M12 7v5l3 2" />
  </>,
  <path key="r2" d="M4 17l6-6 4 4 6-8" />,
];

/* three reusable blueprint figures (aria-hidden, decorative) */
function Blueprint({ v }: { v: 0 | 1 | 2 }) {
  if (v === 0) {
    return (
      <svg viewBox="0 0 460 268" role="img">
        <text className="bp-label" x="24" y="34">REUSABLE BLOCKS</text>
        <rect className="bp-fill" x="24" y="52" width="150" height="40" rx="8" />
        <rect className="bp-fill" x="24" y="104" width="150" height="40" rx="8" />
        <rect className="bp-fill" x="24" y="156" width="150" height="40" rx="8" />
        <circle className="bp-node" cx="42" cy="72" r="4" />
        <circle className="bp-node" cx="42" cy="124" r="4" />
        <circle className="bp-node" cx="42" cy="176" r="4" />
        <path className="bp-stroke dash" d="M174 72 H250 M174 124 H250 M174 176 H250" />
        <text className="bp-label" x="300" y="34">ASSEMBLED SYSTEM</text>
        <rect className="bp-stroke dim" x="286" y="52" width="150" height="176" rx="10" />
        <rect className="bp-fill" x="304" y="70" width="114" height="30" rx="6" />
        <rect className="bp-fill" x="304" y="110" width="114" height="30" rx="6" />
        <rect className="bp-fill" x="304" y="150" width="114" height="30" rx="6" />
        <rect className="bp-stroke dash" x="304" y="190" width="114" height="22" rx="6" />
        <circle className="bp-live" cx="422" cy="201" r="4" />
      </svg>
    );
  }
  if (v === 1) {
    return (
      <svg viewBox="0 0 460 268" role="img">
        <circle className="bp-node" cx="60" cy="134" r="6" />
        <text className="bp-label" x="30" y="168">SOURCE</text>
        <path className="bp-stroke" d="M66 134 C120 134 130 74 190 74" />
        <path className="bp-stroke" d="M66 134 C120 134 130 194 190 194" />
        <rect className="bp-stroke" x="192" y="46" width="150" height="56" rx="8" />
        <path className="bp-stroke dim" d="M192 62 H342" />
        <text className="bp-label" x="206" y="40">VARIANT A</text>
        <rect className="bp-fill" x="204" y="74" width="60" height="16" rx="4" />
        <rect className="bp-stroke" x="192" y="166" width="150" height="56" rx="8" />
        <path className="bp-stroke dim" d="M192 182 H342" />
        <text className="bp-label" x="206" y="160">VARIANT B</text>
        <rect className="bp-fill" x="204" y="194" width="90" height="16" rx="4" />
        <path className="bp-stroke dash" d="M342 74 C392 74 392 134 410 134" />
        <path className="bp-stroke dash" d="M342 194 C392 194 392 134 410 134" />
        <circle className="bp-live" cx="414" cy="134" r="6" />
        <text className="bp-label" x="366" y="168">MEASURE</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 460 268" role="img">
      <text className="bp-label" x="24" y="34">YOUR PAGES</text>
      <rect className="bp-fill" x="24" y="50" width="120" height="34" rx="7" />
      <rect className="bp-fill" x="24" y="94" width="120" height="34" rx="7" />
      <rect className="bp-fill" x="24" y="138" width="120" height="34" rx="7" />
      <circle className="bp-node" cx="152" cy="67" r="4" />
      <circle className="bp-node" cx="152" cy="111" r="4" />
      <circle className="bp-node" cx="152" cy="155" r="4" />
      <path className="bp-stroke dash" d="M156 67 C210 67 205 134 250 134" />
      <path className="bp-stroke dash" d="M156 111 C210 111 210 134 250 134" />
      <path className="bp-stroke dash" d="M156 155 C210 155 205 134 250 134" />
      <circle className="bp-stroke dim" cx="286" cy="134" r="34" />
      <text className="bp-label" x="262" y="200">RETRIEVAL</text>
      <path className="bp-stroke" d="M320 134 H372" />
      <rect className="bp-stroke" x="374" y="104" width="62" height="60" rx="9" />
      <path className="bp-stroke dim" d="M374 122 H436" />
      <text className="bp-label" x="382" y="98">ANSWER</text>
      <rect className="bp-fill" x="386" y="130" width="38" height="10" rx="3" />
      <circle className="bp-live" cx="405" cy="152" r="4" />
    </svg>
  );
}

/* ---- span auto-assignment for text-only bento (webflow authors its own) ---- */
function spanFor(count: number, i: number): NonNullable<DeliverTile['span']> {
  if (count === 3) return 'third';
  if (count === 6) return 'half';
  // 5 (or other): two halves + three thirds
  return i < 2 ? 'half' : 'third';
}

function Frag({ art, images }: { art: Artifact; images?: HomeImages }) {
  return (
    <div className="dt-frag" aria-hidden="true">
      <div className="mat">
        <div className="plate">
          <div className="bar">
            <b></b>
            <b></b>
            <b></b>
            <span>{art.domain}</span>
          </div>
          <div className="shot">
            <Image src={artifactSrc(art, images, CROP_FRAG)} alt="" width={640} height={424} quality={82} loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicePageV3({ config, images }: { config: ServiceConfig; images?: HomeImages }) {
  const c = config;
  const track = c.proof.track;
  const siblings = SERVICES.filter((s) => s.slug !== c.slug);

  return (
    <>
      {/* NOTE: (site)/layout.tsx already wraps children in <main id="main-content">,
          so this template must not add a second <main>. */}
      {/* ============ HERO — electric split-stage ============ */}
        <section className="hero" aria-label={c.ariaLabel}>
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow rv">
                {c.hero.eyebrow}
                {c.hero.eyebrowTag ? <em>{c.hero.eyebrowTag}</em> : null}
              </span>
              <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
                {c.hero.h1}
              </h1>
              <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
                {c.hero.blurb}
              </p>
              <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
                <a href="#book" data-cal-trigger className="btn btn-white btn-lg btn-pill">
                  Book an intro call
                </a>
                <Link href={c.hero.secondary.href} className="tlink">
                  {c.hero.secondary.label}
                  <Arrow />
                </Link>
              </div>
            </div>

            <div className="stage-zone rv" style={{ ['--d' as string]: '.14s' }} aria-label="A LoudFace client site">
              <span className="stage-chip">
                <i></i>
                <b>{c.hero.chip.value}</b>
                <span>{c.hero.chip.label}</span>
              </span>
              <div className="mat stage-main">
                <div className="plate">
                  <div className="bar" aria-hidden="true">
                    <b></b>
                    <b></b>
                    <b></b>
                    <span>{c.hero.main.domain}</span>
                  </div>
                  <div className="shot">
                    <Image
                      src={artifactSrc(c.hero.main, images, CROP_HERO)}
                      alt={c.hero.main.alt}
                      width={1080}
                      height={836}
                      quality={82}
                      priority
                    />
                  </div>
                  <span className="rpill">
                    <i></i>
                    <b>{c.hero.main.rpillLabel}</b>
                    <span>{c.hero.main.rpillClient}</span>
                  </span>
                </div>
              </div>
              <div className="mat stage-sub" aria-hidden="true">
                <div className="plate">
                  <div className="bar">
                    <b></b>
                    <b></b>
                    <b></b>
                    <span>{c.hero.frag.domain}</span>
                  </div>
                  <div className="shot">
                    <Image src={artifactSrc(c.hero.frag, images, CROP_SUB)} alt="" width={760} height={522} quality={82} loading="eager" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ LOGO MARQUEE (indigo canon) ============ */}
        <section className="logos" aria-label="Trusted by">
          <p className="logos-lead">{c.logosLead}</p>
          <div className="marq">
            <div className="marq-track">
              {LOGOS.map((l) => (
                <span className="marq-logo" key={l.alt}>
                  <Image src={l.src} alt={l.alt} loading="lazy" width={l.w} height={l.h} quality={82} />
                </span>
              ))}
              {LOGOS.map((l) => (
                <span className="marq-logo" key={`${l.alt}-dup`}>
                  <Image src={l.src} alt="" aria-hidden="true" loading="lazy" width={l.w} height={l.h} quality={82} />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ DELIVERABLES — object wall ============ */}
        <section className="deliver" id="whats-included" aria-label="What's included">
          <div className="container">
            <div className="deliver-head rv">
              <h2 className="display">{c.deliver.title}</h2>
              <p className="lede">{c.deliver.lede}</p>
            </div>
            <div className="wall-grid">
              {c.deliver.tiles.map((t, i) => {
                const span = t.span ?? spanFor(c.deliver.tiles.length, i);
                const isWide = span === 'wide';
                const body = (
                  <div className={isWide ? 'dt-body' : undefined}>
                    <div className="dt-top">
                      <span className="dt-glyph" aria-hidden="true">
                        <svg viewBox="0 0 24 24">{GLYPHS[i % GLYPHS.length]}</svg>
                      </span>
                      <h3>{t.title}</h3>
                    </div>
                    <p>{t.desc}</p>
                    {t.chips && t.chips.length > 0 ? (
                      <div className="dt-chips">
                        {t.chips.map((ch) => (
                          <span className="dt-chip" key={ch}>
                            {ch}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
                return (
                  <article
                    className={`dtile ${span} rv`}
                    style={i % 2 ? { ['--d' as string]: '.06s' } : undefined}
                    key={t.title}
                  >
                    {body}
                    {isWide && t.frag ? <Frag art={t.frag} images={images} /> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ PROCESS RUNWAY ============ */}
        <section className="runway" id="how-we-work" aria-label="How we work">
          <div className="container">
            <div className="runway-head rv">
              <h2 className="display on-dark">{c.runway.title}</h2>
              <p className="lede on-dark">{c.runway.lede}</p>
            </div>
            <div className="run-list">
              {c.runway.pillars.map((p, i) => {
                if (p.kind === 'card') {
                  return (
                    <div className="run-cards rv" key={p.title}>
                      <article className="rcard">
                        <span className="rc-glyph" aria-hidden="true">
                          <svg viewBox="0 0 24 24">{RC_GLYPHS[i % RC_GLYPHS.length]}</svg>
                        </span>
                        <h3>{p.title}</h3>
                        <p>{p.desc}</p>
                      </article>
                    </div>
                  );
                }
                const alt = i >= 2; // second blueprint row mirrors
                return (
                  <div className={`run-row rv${alt ? ' alt' : ''}`} key={p.title}>
                    <div className="run-txt">
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                    </div>
                    <div className="run-fig" aria-hidden="true">
                      <Blueprint v={p.fig ?? 0} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ FEATURED EXHIBIT — cinematic stage ============ */}
        <section className="exhibit" id="featured" aria-label={`Featured work — ${c.exhibit.h2}`}>
          {/* Full-bleed cinematic canvas ⇒ sizes="100vw". The w=1800 source caps it. */}
          <Image
            className="ex-canvas"
            src={artifactSrc(c.exhibit.art, images, CROP_CANVAS)}
            alt={c.exhibit.art.alt}
            width={1800}
            height={1000}
            sizes="100vw"
            quality={82}
            loading="lazy"
          />
          <div className="ex-veil" aria-hidden="true"></div>

          {c.exhibit.annots.map((a, i) => (
            <span className={`ex-annot ex-a${i + 1}`} aria-hidden="true" key={a.em}>
              <em>{a.em}</em>
              <span>{a.span}</span>
            </span>
          ))}

          <div className="container ex-in">
            <div className="ex-body">
              <span className="eyebrow glass rv">
                <i></i>
                {c.exhibit.eyebrow}
              </span>
              <h2 className="rv" style={{ ['--d' as string]: '.06s' }}>
                {c.exhibit.h2}
              </h2>
              <p className="ex-dom rv" style={{ ['--d' as string]: '.1s' }}>
                {c.exhibit.domLine}
              </p>
              <p className="ex-what rv" style={{ ['--d' as string]: '.14s' }}>
                {c.exhibit.what}
              </p>
              <div className="ex-chips rv" style={{ ['--d' as string]: '.16s' }} aria-hidden="true">
                {c.exhibit.annots.map((a) => (
                  <span className="ex-chip" key={a.em}>
                    {a.em}
                  </span>
                ))}
              </div>
              {c.exhibit.out ? (
                <div className="ex-out rv" style={{ ['--d' as string]: '.18s' }}>
                  <span className="ex-num">{c.exhibit.out.num}</span>
                  <span className="ex-out-txt">
                    <b>{c.exhibit.out.label}</b>
                    <span className="ex-src">
                      <i></i>
                      {c.exhibit.out.src}
                    </span>
                  </span>
                </div>
              ) : c.exhibit.outText ? (
                <p className="ex-what rv" style={{ ['--d' as string]: '.18s', color: '#fff', fontWeight: 600 }}>
                  {c.exhibit.outText}
                </p>
              ) : null}
              <div className="ex-cta rv" style={{ ['--d' as string]: '.22s' }}>
                <Link href={c.exhibit.ctaHref} className="tlink">
                  {c.exhibit.ctaLabel}
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROOF BAND ============ */}
        <section className="proof" aria-label="Why teams trust the work">
          <div className="container">
            <div className="proof-head rv">
              <h2 className="display">{c.proof.title}</h2>
              <p className="lede">{c.proof.lede}</p>
            </div>
            <div className="proof-grid">
              <article className="pcard pc-hero rv">
                <span className="pk">{c.proof.hero.num}</span>
                <div>
                  <span className="pl">{c.proof.hero.label}</span>
                  {c.proof.hero.src ? (
                    <span className="pc-src">
                      <i></i>
                      {c.proof.hero.src}
                    </span>
                  ) : null}
                </div>
              </article>
              <div className="proof-col">
                <div className="proof-row">
                  <article className="pcard pc-a rv" style={{ ['--d' as string]: '.06s' }}>
                    <span className="pk">200+</span>
                    <span className="pl">
                      {track === 'grow' ? 'B2B brands grown across SaaS, fintech & AI' : 'B2B SaaS websites shipped'}
                    </span>
                  </article>
                  <article className="pcard pc-b rv" style={{ ['--d' as string]: '.1s' }}>
                    <span className="pk">{c.proof.extra.num}</span>
                    <span className="pl">{c.proof.extra.label}</span>
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
                  <span className="pl">Webflow Enterprise Partner — our primary platform</span>
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

        {c.comparison ? (
          <section className="comparison" aria-labelledby="service-comparison-title">
            <div className="container">
              <div className="comparison-head rv">
                <h2 className="display" id="service-comparison-title">
                  {c.comparison.highlightWord && c.comparison.title.endsWith(c.comparison.highlightWord) ? (
                    <>
                      {c.comparison.title.slice(0, -c.comparison.highlightWord.length)}
                      <span className="ghost">{c.comparison.highlightWord}</span>
                    </>
                  ) : (
                    c.comparison.title
                  )}
                </h2>
                <p className="lede">{c.comparison.intro}</p>
              </div>
              <div className="comparison-table-wrap rv">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      {c.comparison.columns.map((column) => (
                        <th scope="col" key={column}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.comparison.rows.map((row) => (
                      <tr key={row.discipline}>
                        <th scope="row">{row.discipline}</th>
                        <td>{row.optimizesFor}</td>
                        <td>{row.whereWeShowUp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {/* ============ FAQ ============ */}
        <section className="faq" aria-label="Frequently asked questions">
          <div className="container">
            <div className="faq-in">
              <div className="faq-head rv">
                <h2 className="display">{c.faq.title}</h2>
              </div>
              <div className="faq-list rv">
                {c.faq.items.map((item, i) => (
                  <details className="qa" key={item.q} open={i === 0}>
                    <summary>
                      {item.q}
                      <span className="x" aria-hidden="true"></span>
                    </summary>
                    <div className="a" dangerouslySetInnerHTML={{ __html: item.aHtml }} />
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* ============ RELATED SERVICES RAIL ============ */}
      <section className="rel" aria-label="Explore our other services">
        <div className="container">
          <div className="rel-head rv">
            <div>
              <span className="klabel on-dark">
                <i></i>One of seven
              </span>
              <h2 className="display on-dark">{c.rel.title}</h2>
            </div>
            <Link className="rel-hub" href="/services">
              See all services
              <Arrow />
            </Link>
          </div>
          <div className="rel-grid">
            {siblings.map((s) => (
              <Link className="rel-row" href={`/services/${s.slug}`} key={s.slug}>
                <span className="rr-txt">
                  <b>{s.name}</b>
                  <span>{s.blurb}</span>
                </span>
                <span className="rr-go" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
          <div className="rel-note rv">
            <p>{c.rel.note}</p>
            <span className="amt">
              <b>Engagements from</b>
              <em>$5k/mo</em>
            </span>
          </div>
        </div>
      </section>

      {/* ============ COVER CTA — cover-stack ============ */}
      <section className="cover" id="book">
        {/* Full-bleed ⇒ sizes="100vw"; the w=1600 source caps the output. */}
        <Image
          className="cover-img"
          src={artifactSrc(c.cover.obj, images, CROP_COVER_BG)}
          alt=""
          aria-hidden="true"
          width={1600}
          height={1000}
          sizes="100vw"
          quality={82}
          loading="lazy"
        />
        <div className="cover-veil" aria-hidden="true"></div>
        <div className="container cover-in">
          <div className="cover-meta rv">
            <span>LoudFace — intro call</span>
            <span>{c.cover.metaRight}</span>
          </div>
          <div className="cover-mid">
            <div className="cover-obj" aria-hidden="true">
              <div className="mat" style={{ padding: '14px' }}>
                <div className="plate">
                  <div className="bar">
                    <b></b>
                    <b></b>
                    <b></b>
                    <span>{c.cover.obj.domain}</span>
                  </div>
                  <div className="shot">
                    <Image src={artifactSrc(c.cover.obj, images, CROP_COVER_OBJ)} alt="" width={1000} height={640} quality={82} loading="lazy" />
                  </div>
                  <span className="rpill">
                    <i></i>
                    <b>{c.cover.obj.rpillLabel}</b>
                    <span>{c.cover.obj.rpillClient}</span>
                  </span>
                </div>
              </div>
            </div>
            <h2 className="rv">{c.cover.h2}</h2>
            <p className="rv" style={{ ['--d' as string]: '.08s' }}>
              {c.cover.p}
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
            <span>{c.cover.creditLeft}</span>
            <span>loudface.co</span>
          </div>
        </div>
      </section>

      <FooterV3 />
      <ServiceV3Scripts />
    </>
  );
}
