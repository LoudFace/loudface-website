import Link from 'next/link';
import { Mrs_Saint_Delafield, Nothing_You_Could_Do } from 'next/font/google';
import { rawContent, type AboutV11Content, type HomeV11Content } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import type { HomeV11Data } from '../home-v11/data';
import { ChartPanel } from '../home-v11/ChartPanel';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { QuoteCard } from '../home-v11/Testimonials';
import { ArrowRight, ArrowUpRight, LfMark, SectionHeadNode, img } from '../home-v11/ui';
import { Browser, Tag, Ui, UiHead } from '../service-v11/kit';
import { SHOTS } from '../service-v3/data';
import { strip } from '@/lib/inline-edit/mark';

/**
 * About v11: the people and the record, in the v11 language with its own pictures (DESIGN.md §6, §7).
 * The story runs: who we are (the leads, once) → why (the founder's handwritten letter) → proof (five figures, each
 * linked to its case study, with a client's own words) → how we work → where our clients are → questions.
 * References from the 2026-09-25 Mobbin harvests (design-lab/harvest/2026-09-25/about, about-letter): the leads on
 * their own colour grounds (02-A Ragged Edge, 02-C Miro), the handwritten letter (VEED, Daylight, Ada), figures on
 * tinted tiles (04-D Clay), the client map (06-H Shopify). The hero is light on purpose: the indigo stage is the
 * homepage's ("tiring to look at the same purple hero section", 2026-09-25). All copy is src/data/content/about-v11.json.
 */

/** The founder's own hand for the letter (a ballpoint print) and his signature. The letter is the page's one document. */
const pen = Nothing_You_Could_Do({ subsets: ['latin'], weight: ['400'], variable: '--font-pen' });
const sign = Mrs_Saint_Delafield({ subsets: ['latin'], weight: ['400'], variable: '--font-sign' });

const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];
/** Each lead's ground: the v11 tile tints. */
const GROUND = ['is-lav', 'is-peach', 'is-sand', 'is-mint'];
const LEDGER_TONE = ['is-lav', 'is-peach', 'is-sand'];
const LEDGER: Record<string, { logo: string; w: number; h: number; href: string }> = {
  'Dimer Health': { logo: 'logos/color-dimer.png', w: 82, h: 28, href: '/case-studies/dimer-health' },
  Toku: { logo: 'logos/color-toku.png', w: 62, h: 20, href: '/case-studies/toku-ai-cited-pipeline' },
  'Outbound Specialist': { logo: 'logos/color-outbound.png', w: 75, h: 30, href: '/case-studies/outbound-specialist' },
};
/** Client pins on the map, in percent of the map box (from the projection that drew client-map.svg), each with the
 * side its label sits on. `w` is the logo's width in the pin, set by eye so the six marks weigh the same. */
const PINS: { name: string; logo?: string; icon?: string; w: number; x: number; y: number; side: 'up' | 'down' | 'left' | 'right'; href: string }[] = [
  { name: 'Eraser', logo: 'logos/color-eraser.png', w: 84, x: 6.58, y: 60.13, side: 'up', href: '/case-studies/eraser' },
  { name: 'Genie Teacher', icon: 'logos/genie-icon.png', w: 0, x: 27.91, y: 51.03, side: 'up', href: '/case-studies/genie-teacher-organic-growth' },
  { name: 'Dimer Health', logo: 'logos/color-dimer.png', w: 66, x: 29.61, y: 55.6, side: 'down', href: '/case-studies/dimer-health' },
  { name: 'Montblanc', logo: 'logos/color-montblanc.png', w: 92, x: 67.56, y: 37, side: 'left', href: '/case-studies/montblanc' },
  { name: 'Outbound Specialist', logo: 'logos/color-outbound.png', w: 58, x: 67.73, y: 28.96, side: 'up', href: '/case-studies/outbound-specialist' },
  { name: 'Hoxhunt', logo: 'logos/color-hoxhunt.png', w: 78, x: 73.22, y: 28.64, side: 'right', href: '/case-studies/hoxhunt' },
];
const DUBAI = { x: 90.2, y: 80.9 };
/** The US office (LoudFace, LLC, 2261 Market Street, San Francisco), just below Eraser's pin, which is also in SF. */
const SAN_FRANCISCO = { x: 5.9, y: 67.5 };
const BADGE_ICON = ['/images/webflow.svg', '/images/Awwwards.svg'];

export function AboutV11({ c, home, data }: { c: AboutV11Content; home: HomeV11Content; data: HomeV11Data | null }) {
  const montblanc = SHOTS.montblanc;
  return (
    <div className={`v11 ab ${pen.variable} ${sign.variable}`}>
      {/* 1 · the leads, each on their own colour, with the piece of the work they own */}
      <section className="ab-hero2" data-hero="light">
        <div className="v11-wrap">
          <div className="ab-hero2-top">
            <div>
              <div className="ab-hero-eyebrow is-light"><span>{c.hero.eyebrowBrand}</span><span className="is-since">{c.hero.eyebrowSince}</span></div>
              <h1>{c.hero.headline} <span className="ghost">{c.hero.headlineHighlight}</span></h1>
            </div>
            <div className="ab-hero2-side">
              <p data-speakable="">{c.hero.description}</p>
              <div className="ab-hero2-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.hero.ctaText}</span></a>
                <Link href="/case-studies" className="v11-link ab-tap"><span>{c.hero.secondaryText}</span><ArrowRight /></Link>
              </div>
              <div className="ab-hero-reply"><span className="is-dot" aria-hidden="true" />{c.hero.responseTime}</div>
            </div>
          </div>
          <div className="ab-crew">
            {c.team.people.map((p, i) => (
              <figure key={p.person} className={`ab-member is-${i + 1} ${GROUND[i]}`}>
                <div className="ab-member-card">
                  {/* the photo is cropped so every face is the same size and on the same line; its head may rise above the card. No role chips: every lead runs the whole account (Arnel, 2026-09-25) */}
                  <div className="ab-member-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="ab-member-cut" src={img(`about/cut-${TEAM[i]}.webp`)} alt="" width={580} height={704} fetchPriority={i === 0 ? 'high' : undefined} />
                  </div>
                </div>
                <figcaption>
                  {/* the name links to the lead's profile, the author page their articles point to (the v3 About linked every profile) */}
                  <Link href={`/team/${TEAM[i]}`} className="is-name">{p.person}</Link>
                  <div className="is-role">{p.jobTitle}</div>
                  <p>{p.fact}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="ab-bench">
            <span className="ab-bench-plus" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
            <div className="ab-bench-copy">
              <div className="is-head">{c.team.benchHeading}</div>
              <p>{c.team.benchBody}</p>
            </div>
            <ul className="ab-bench-roles">{c.team.benchRoles.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* 2 · the founder's letter, handwritten and signed on paper, and the years behind it
          (references: VEED's handwritten careers letter, Daylight's signed note, Ada's CEO letter; about-letter harvest) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap ab-story">
          <div className="ab-desk">
            <div className="ab-sheet is-under" aria-hidden="true" />
            <article className="ab-sheet" aria-label={strip(c.story.founderHeadline)}>
              <div className="ab-sheet-head">
                <LfMark size={20} />
                <span>{c.story.letterhead}</span>
              </div>
              <p className="ab-pen" data-paper-runs="">
                {c.story.founderQuotePrefix}<span className="is-em">{c.story.founderQuoteEmphasis}</span>{c.story.founderQuoteSuffix}
              </p>
              <p className="ab-pen">{c.story.founderQuoteClose}</p>
              <div className="ab-sheet-sign">
                <span className="is-sig">{c.story.founderSignature}</span>
                <span className="is-name">{c.story.founderName}</span>
                <span className="is-role">{c.story.founderRole}</span>
              </div>
            </article>
            <figure className="ab-polaroid" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img('about/cut-arnel-bukva.webp')} alt="" width={150} height={182} loading="lazy" />
            </figure>
            <svg className="ab-clip" width="26" height="74" viewBox="0 0 26 74" fill="none" aria-hidden="true">
              <path d="M8 18v38a5 5 0 0 0 10 0V12a8 8 0 0 0-16 0v46a11 11 0 0 0 22 0V22" stroke="#9aa0ad" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M8 18v38a5 5 0 0 0 10 0V12a8 8 0 0 0-16 0v46a11 11 0 0 0 22 0V22" stroke="#e9ebf0" strokeWidth="1" strokeLinecap="round" transform="translate(-0.6 -0.6)" />
            </svg>
          </div>
          <div className="ab-story-side">
            <div className="v11-eyebrow"><span>{c.story.eyebrow}</span></div>
            <h2 className="v11-h2">{c.story.founderHeadline}</h2>
            <ol className="ab-years">
              {c.story.timeline.map((t) => (
                <li key={t.year}>
                  <span className="is-year">{t.year}</span>
                  <p>{t.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 3 · the ledger: three client results, each linked to its case study, then a client's own words beside the
          standing facts and the two accreditations */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.ledger.eyebrow} title={<>{c.ledger.headline} <span className="ghost">{c.ledger.headlineHighlight}</span></>} body={c.ledger.intro} bodyWidth={440} />
          <div className="ab-ledger">
            {c.ledger.rows.slice(0, 3).map((r, i) => {
              // the logo lookup reads the unmarked client name: in editing mode the visible value carries markers
              const client = rawContent<AboutV11Content>('about-v11').ledger.rows[i]?.chipClient;
              const l = client ? LEDGER[client] : undefined;
              return (
                <Link key={r.title} href={l?.href ?? '/case-studies'} className={`sv-tile ab-fig ${LEDGER_TONE[i]}`}>
                  <div className="ab-fig-top">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l && <img loading="lazy" src={img(l.logo)} alt={client} width={l.w} height={l.h} style={{ height: l.h, width: 'auto' }} />}
                    {r.chipTag && <Tag tone="ind">{r.chipTag}</Tag>}
                  </div>
                  <div className="ab-fig-value">{r.fig}</div>
                  <div className="ab-fig-title">{r.title}</div>
                  <p className="ab-fig-desc">{r.description}</p>
                  <div className="ab-fig-foot">
                    <span>{r.period}</span>
                    <span className="is-go">{c.ledger.caseLinkText}<ArrowUpRight /></span>
                  </div>
                </Link>
              );
            })}
            <div className="ab-ledger-quote"><QuoteCard k={home.testimonials.cards[2]} i={2} /></div>
            <div className="ab-facts">
              <div className="ab-facts-row">
                {c.ledger.rows.slice(3, 5).map((r) => (
                  <div key={r.title} className="ab-fact">
                    <div className="ab-fig-value">{r.fig}</div>
                    <div className="ab-fig-title">{r.title}</div>
                    <p className="ab-fig-desc">{r.description}</p>
                  </div>
                ))}
              </div>
              <div className="ab-badges">
                {c.ledger.badges.map((b, i) => (
                  <span key={b} className="ab-badge">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" src={asset(BADGE_ICON[i])} alt="" width={22} height={22} />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="ab-ledger-foot">
            <span>{c.ledger.closingText}</span>
            <Link href="/case-studies" className="v11-link ab-tap"><span>{c.ledger.closingLinkText}</span><ArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* 4 · how we work: one wide lead tile with a site we built, then the growth report and the weekly update */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.values.eyebrow} title={<>{c.values.headline} <span className="ghost">{c.values.headlineHighlight}</span></>} />
          <div className="ab-ways">
            <div className="sv-tile is-ind ab-way-build">
              <div className="ab-way-build-copy">
                <div className="sv-tile-tag"><i /><span>{c.values.build.label}</span></div>
                <p className="sv-tile-desc">{c.values.build.description}</p>
                <span className="ab-way-cap">{c.values.build.siteLabel}</span>
              </div>
              <div className="ab-way-build-site">
                <Browser src={`https://cdn.sanity.io/images/xjjjqhgt/production/${montblanc.asset}?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82`} domain={montblanc.domain} alt={strip(c.values.build.siteLabel)} />
              </div>
            </div>
            <div className="sv-tile is-lav">
              <div className="sv-tile-tag"><i /><span>{c.values.grow.label}</span></div>
              <p className="sv-tile-desc">{c.values.grow.description}</p>
              <div className="sv-tile-art">
                <Ui className="ab-grow-ui">
                  {/* a year of one client's search growth; the Genie curve leads its own case study and the organic growth page */}
                  {data && <ChartPanel title={c.values.grow.chartTitle} source={c.values.grow.chartSource} series={data.results.tm} format="indexWeek" tip={home.hero.slides[3].tip} height={200} />}
                </Ui>
              </div>
            </div>
            <div className="sv-tile is-peach">
              <div className="sv-tile-tag"><i /><span>{c.values.oneTeam.label}</span></div>
              <p className="sv-tile-desc">{c.values.oneTeam.description}</p>
              <div className="sv-tile-art">
                <Ui className="ab-thread">
                  <UiHead left={c.values.oneTeam.thread.channel} right={<Tag tone="grey">{c.values.oneTeam.thread.label}</Tag>} />
                  <div className="ab-msg">
                    <span className="ab-msg-av is-lf" aria-hidden="true"><LfMark size={16} /></span>
                    <div>
                      <div className="ab-msg-head"><b>{c.values.oneTeam.thread.from}</b><span>{c.values.oneTeam.thread.time}</span></div>
                      <p>{c.values.oneTeam.thread.message}</p>
                    </div>
                  </div>
                  <div className="ab-msg is-reply">
                    <span className="ab-msg-av" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.4" /><path d="M2.2 12.5c.6-2.3 2.5-3.6 4.8-3.6s4.2 1.3 4.8 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
                    <div>
                      <div className="ab-msg-head"><b>{c.values.oneTeam.thread.replyFrom}</b></div>
                      <p>{c.values.oneTeam.thread.reply}</p>
                    </div>
                  </div>
                </Ui>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · where our clients are: a few of them pinned, drawn from Dubai */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.place.eyebrow} title={<>{c.place.headline} <span className="ghost">{c.place.headlineHighlight}</span></>} body={c.place.description} bodyWidth={440} />
          <div className="ab-map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img('about/client-map.svg')} alt="A map of LoudFace clients across North America and Europe, drawn from Dubai" width={1296} height={500} loading="lazy" />
            <div className="ab-pins">
              {PINS.map((p) => (
                <Link key={p.name} href={p.href} className={`ab-pin is-${p.side}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={`${p.name} case study`}>
                  <span className="ab-pin-label">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.logo ? <img loading="lazy" src={img(p.logo)} alt="" width={p.w} style={{ width: p.w, height: 'auto' }} /> : <>{p.icon && <img loading="lazy" src={img(p.icon)} alt="" width={18} height={18} className="is-icon" />}<b>{p.name}</b></>}
                  </span>
                </Link>
              ))}
              <span className="ab-home" style={{ left: `${DUBAI.x}%`, top: `${DUBAI.y}%` }}><LfMark size={22} /><b>{c.place.home}</b></span>
              <span className="ab-home" style={{ left: `${SAN_FRANCISCO.x}%`, top: `${SAN_FRANCISCO.y}%` }}><LfMark size={22} /><b>{c.place.homeUs}</b></span>
            </div>
          </div>
          <div className="ab-pins-list" aria-label={strip(c.place.pinsLabel)}>
            {PINS.map((p) => (
              <Link key={p.name} href={p.href} className="ab-pin-label">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.logo ? <img loading="lazy" src={img(p.logo)} alt={p.name} width={p.w} style={{ width: p.w, height: 'auto' }} /> : <>{p.icon && <img loading="lazy" src={img(p.icon)} alt="" width={18} height={18} className="is-icon" />}<b>{p.name}</b></>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · questions (the client logos live on the map above, so the logo strip is left to the homepage) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap v11-faq ab-faq">
          <div className="v11-faq-head">
            <h2 className="v11-h2">{c.faq.headline}</h2>
            <p className="ab-faq-sub">{c.faq.panelText}</p>
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

      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
