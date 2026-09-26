import Link from 'next/link';
import type { HomeV11Content, ServicesContent } from '@/lib/content-utils';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, Eyebrow, LfMark, SectionHeadNode, img } from '../home-v11/ui';
import { artifactSrc, SHOTS } from '../service-v3/data';
import { TRACK_BY_SLUG } from '../services-v3/data';
import { Browser } from '../service-v11/kit';
import { Lines } from '../service-v11/pages/seo-aeo';
import { EnginePanel } from '../service-v11/pages/geo-agency';
import { strip } from '@/lib/inline-edit/mark';

/**
 * The /services hub in v11 (DESIGN.md §6, §7). Copy is the live hub's (src/data/content/services.json).
 * References from the 2026-09-25 harvest (design-lab/harvest/2026-09-25/services-hub): the headline over a row of
 * coloured category cards with pictures (hub-hero 11, Contra), work shown large with the services that shipped it
 * (work-tagged 133, Instrument) and one idea set against another in two halves (difference 287, Framer vs Ploy).
 * The hero is the menu itself: every service with its photograph from the device series (the work on a screen), on
 * one ground (2026-09-25; replaced nine tints holding shrunken hero captures). The exhibits sit on the plain ground.
 */

const CROP_WORK = '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82';
/** The three exhibits: which site, and which service pages its credits open (labels are in services.json). */
const WORK = [
  { shot: SHOTS.liqid, href: '/case-studies/liqid', credits: ['/services/webflow', '/services/ux-ui-design', '/services/cro'] },
  { shot: SHOTS.toku, href: '/case-studies/toku-ai-cited-pipeline', credits: ['/services/seo-aeo', '/services/geo-agency', '/services/growth-autopilot'] },
  { shot: SHOTS.eraser, href: '/case-studies/eraser', credits: ['/services/webflow', '/services/copywriting', '/services/ux-ui-design'] },
];
/** Each service's photograph from the device series (SEO + AEO shows loudface.co, the site its figure is about). */
const PHOTO_FILE: Record<string, string> = { 'seo-aeo': 'seo-aeo-lf' };

export function ServicesHubV11({ c, home, images }: { c: ServicesContent; home: HomeV11Content; images: Record<string, string> }) {
  const h = c.hero;
  const ix = c.index;
  const cl = c.clarifier;
  // growth first, then build, as the index lists them by track
  const entries = [...ix.entries.filter((e) => TRACK_BY_SLUG[e.slug] === 'grow'), ...ix.entries.filter((e) => TRACK_BY_SLUG[e.slug] !== 'grow')];
  return (
    <div className="v11 sh">
      {/* 1 · the headline over the menu: every service with its photograph (hub-hero 11) */}
      <section className="sh-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="sh-hero-top">
            <div>
              <div className="sh-hero-eyebrow"><span>{h.eyebrowBrand}</span><span className="is-sub">{h.eyebrowYears}</span></div>
              <h1>{h.headline} <span className="ghost">{h.headlineHighlight}</span></h1>
            </div>
            <div className="sh-hero-side">
              <p>{h.description}</p>
              <div className="sh-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{h.ctaText}</span></a>
                <a href="#work" className="v11-link sh-tap"><span>{c.exhibits.eyebrow}</span><ArrowRight /></a>
              </div>
            </div>
          </div>

          <div className="sh-tracks-head">
            <div><span className="sh-track-pill is-grow">{ix.growNum}</span><b>{ix.growLabel}</b><span>{ix.growTagline}</span></div>
            <div><span className="sh-track-pill is-build">{ix.buildNum}</span><b>{ix.buildLabel}</b><span>{ix.buildTagline}</span></div>
          </div>
          <div className="sh-menu">
            {entries.map((e) => {
              const grow = TRACK_BY_SLUG[e.slug] === 'grow';
              return (
                <Link key={e.slug} href={`/services/${e.slug}`} className="sh-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="sh-card-pic"><img src={img(`services/photo-${PHOTO_FILE[e.slug] ?? e.slug}.webp`)} alt="" width={1800} height={1344} loading="lazy" /></div>
                  <div className="sh-card-copy">
                    <span className={`sh-track-dot ${grow ? 'is-grow' : 'is-build'}`}>{grow ? ix.growLabel : ix.buildLabel}</span>
                    <b>{e.serviceName}</b>
                    <span>{e.blurb}</span>
                  </div>
                  <span className="sh-card-go" aria-hidden="true"><ArrowUpRight /></span>
                </Link>
              );
            })}
          </div>
          <div className="sh-menu-foot">
            <p><b>{ix.bothGlyph}</b>{ix.bothText}</p>
            <span className="sh-amt"><span>{ix.amtPrefix}</span><b>{ix.amtValue}</b></span>
          </div>
        </div>
      </section>

      <LogoGrid c={{ ...home.logos, body: c.logos.lead }} />

      {/* 2 · the work, large, each credited to the services that shipped it (work-tagged 133) */}
      <section className="v11-sec v11-white" id="work">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.exhibits.eyebrow} title={<>{c.exhibits.headline} <span className="ghost">{c.exhibits.headlineHighlight}</span></>} body={c.exhibits.intro} bodyWidth={440} />
          <div className="sh-work">
            {c.exhibits.items.map((it, i) => {
              const w = WORK[i];
              return (
                <article key={it.clientName} className={`sh-ex ${i % 2 ? 'is-flip' : ''}`}>
                  <div className="sh-ex-pic">
                    {/* Toku's work is an AI answer, so its picture is the library's answer window (its own Toku answer);
                        the CMS image for that study is a collage of framed screens */}
                    {i === 1 ? <div className="sh-ex-chat"><ChatWindow c={home.bento.chat} className="is-hero" /></div> : <Browser src={artifactSrc({ ...w.shot, alt: it.clientName }, images, CROP_WORK)} domain={w.shot.domain} alt={strip(`${it.clientName} website`)} />}
                  </div>
                  <div className="sh-ex-copy">
                    <div className="sh-ex-meta"><span className="sh-track-dot is-quiet">{it.tag}</span><span>{it.dom}</span></div>
                    <h3><Link href={w.href}>{it.clientName}</Link></h3>
                    <p>{it.what}</p>
                    <div className="sh-ex-credits">
                      <span className="is-label">{c.exhibits.creditsLabel}</span>
                      <div>{it.credits.map((cr, k) => <Link key={cr.label} href={w.credits[k]} className="sh-credit"><span>{cr.label}</span><ArrowUpRight /></Link>)}</div>
                    </div>
                    <div className="sh-ex-out">
                      <span className="is-label">{c.exhibits.outcomeLabel}</span>
                      <p data-paper-runs="">{it.outPrefix}<b>{it.outHighlight}</b>{it.outSuffix}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="sh-stats">
            {c.exhibits.stats.map((s) => (
              <div key={s.label}><b>{s.value}</b><span>{s.label}</span>{s.source && <small>{s.source}</small>}</div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · two kinds of AI visibility, set against each other in two halves (difference 287) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={cl.kicker} title={<>{cl.headlineLine1} <span className="ghost">{cl.headlineHighlight}{cl.headlineSuffix}</span></>} body={cl.intro} bodyWidth={440} />
          <div className="sh-diff">
            <div className="sh-half sv-tint is-mint">
              <span className="sh-half-abbr">{cl.seo.abbr}</span>
              <h3>{cl.seo.question}</h3>
              <div className="sh-half-pic">
                <div className="sk-browser sh-serp">
                  <div className="sk-browser-bar"><span className="v11-lights" aria-hidden="true"><span /><span /><span /></span><span className="sk-browser-url">google.com/search</span></div>
                  <div className="sh-serp-body">
                    <div className="sv-hit"><i className="sk-bar" style={{ width: 110, marginBottom: 8 }} /><Lines w={['74%', '90%']} /></div>
                    <div className="sv-hit is-us"><div className="is-url">yourcompany.com</div><div className="is-title">yourcompany</div><Lines w={['92%', '66%']} /></div>
                    <div className="sv-hit"><i className="sk-bar" style={{ width: 90, marginBottom: 8 }} /><Lines w={['80%']} /></div>
                  </div>
                </div>
              </div>
              <p data-paper-runs="">{cl.seo.bodyPrefix}<b>{cl.seo.bodyBold}</b>{cl.seo.bodySuffix}</p>
              <p className="is-unit" data-paper-runs="">{cl.seo.unitPrefix}<b>{cl.seo.unitBold}</b>{cl.seo.unitSuffix}</p>
              <Link href="/services/seo-aeo" className="v11-link sh-tap"><span>{cl.seo.linkText}</span><ArrowRight /></Link>
            </div>
            <div className="sh-half sv-tint is-aqua">
              <span className="sh-half-abbr">{cl.geo.abbr}</span>
              <h3>{cl.geo.question}</h3>
              <div className="sh-half-pic"><div className="sh-engines"><EnginePanel rows={[[0, '34%', 'pos 2.4'], [1, '41%', 'pos 1.9'], [3, '22%', 'pos 3.6']]} /></div></div>
              <p data-paper-runs="">{cl.geo.bodyPrefix}<b>{cl.geo.bodyBold}</b>{cl.geo.bodySuffix}</p>
              <p className="is-unit" data-paper-runs="">{cl.geo.unitPrefix}<b>{cl.geo.unitBold}</b>{cl.geo.unitSuffix}</p>
              <Link href="/services/geo-agency" className="v11-link sh-tap"><span>{cl.geo.linkText}</span><ArrowRight /></Link>
            </div>
          </div>
          <p className="sh-diff-note"><LfMark size={18} />{cl.geo.proof}</p>
        </div>
      </section>

      {/* 4 · questions */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap v11-faq sh-faq">
          <div className="v11-faq-head">
            <Eyebrow>{c.coverCta.eyebrowRight}</Eyebrow>
            <h2 className="v11-h2">{c.faq.headline} <span className="ghost">{c.faq.headlineHighlight}</span></h2>
            <div className="sh-faq-team">
              <div className="v11-stack is-34">
                {['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'].map((w) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img loading="lazy" key={w} src={img(`avatars/${w}.png`)} alt="" width={34} height={34} className="v11-av" />
                ))}
              </div>
              <span>{c.coverCta.responseTime}</span>
            </div>
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.coverCta.ctaText}</span></a>
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
