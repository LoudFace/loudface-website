import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { thumbnailImage, cachedCmsImage } from '@/lib/image-utils';
import { getTintColors } from '@/lib/color-utils';
import { asset } from '@/lib/assets';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { Marks } from '../home-v11/ResultCase';
import { KeyResults } from '../home-v11/KeyResults';
import { ChartPanel } from '../home-v11/ChartPanel';
import { BeforeAfterChart } from '../home-v11/BeforeAfterChart';
import { ArrowRight, ArrowUpRight, SectionHeadNode, img } from '../home-v11/ui';
import { Browser, QuoteCell, VideoCell } from '../service-v11/kit';
import { StageChart } from '../home-v11/StageChart';
import { EngineIcon } from '../service-v11/pages/shared';
import { SHOTS } from '../service-v3/data';
import { caseSeries, leadKind, publishedPairs, sourceName, splitTitle, standaloneCharts, type CaseSeries, type ChartKind, type PublishedPairs } from './series';
import { dropShortAnswer, markWideFigures } from './story';
import type { CaseView } from './view';
import { strip as stripMarks } from '@/lib/inline-edit/mark';

/**
 * CaseStudyV11: /case-studies/<slug> in the v11 system, composed from the component library (DESIGN.md §7).
 * Order, from the Mobbin case-study harvest (design-lab/harvest/2026-09-25/case-study) and Graphite's Fourthwall
 * study: the headline and the client's site, then the key results as big figures, then the charts alone, then the
 * client's voice beside what we did, then the story. Everything is the study's own Sanity record.
 */

const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];
const ENGINE: Record<string, { name: string; i: number }> = {
  chatgpt: { name: 'ChatGPT', i: 0 }, perplexity: { name: 'Perplexity', i: 1 }, googleAio: { name: 'Google AI Overviews', i: 2 }, gemini: { name: 'Gemini', i: 3 },
};
/** Client videos recorded for the homepage, by client name. */
const VIDEO_BY_CLIENT: Record<string, { key: 'maksim' | 'sarig' | 'elizabete'; n: number }> = {
  'Outbound Specialist': { key: 'maksim', n: 0 },
  'Dimer Health': { key: 'sarig', n: 1 },
  Reiterate: { key: 'elizabete', n: 2 },
};
/** Live-site captures made for these boards, where the CMS has no plain site screenshot. */
const SITE_BY_SLUG: Record<string, { src: string; domain: string }> = {
  'genie-teacher-organic-growth': { src: '/images/home-v11/cases/genie-site.webp', domain: 'genieteacher.com' },
};
/** The published review each client's words come from (Clutch's own share link, Trustpilot's review page). */
const REVIEW_BY_CLIENT: Record<string, { href: string; label: string }> = {
  'Genie Teacher': { href: 'https://clutch.co/go-to-review/0b257a96-f556-4380-9e58-ba62f822638b/484569', label: 'Read the review on Clutch' },
  'Dimer Health': { href: 'https://www.trustpilot.com/reviews/6759ad2adfddca7fc7a30297', label: 'Read the review on Trustpilot' },
};
/** The mobile site we built, cropped from the study's own mockups, for the build hero's phone (2026-09-25). */
const PHONE_BY_CLIENT: Record<string, { src: string; alt: string }> = {
  'Dimer Health': { src: '/images/home-v11/cases/dimer-mobile.webp', alt: 'Dimer Health mobile page for recovering from a cough after hospital' },
};
/** App icons for clients with no wordmark in the CMS. */
const BRAND_ICON: Record<string, string> = { 'Genie Teacher': 'logos/genie-icon.png' };
const TIP: Record<ChartKind, string> = { ai: 'of AI answers', google: 'of the baseline day', leads: 'of the baseline weeks' };

const strip = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** A chart's title without its cadence suffix ("…, weekly"). */
const chartTitle = (t: string) => t.replace(/,\s*(weekly|daily|indexed)$/i, '').split('·')[0].trim();

function Charts({ s, lead, pairs, pairsSource, skipLead = false }: { s: CaseSeries; lead: ChartKind; pairs: PublishedPairs | null; pairsSource?: string; skipLead?: boolean }) {
  const rest = (['google', 'ai', 'leads'] as ChartKind[]).filter((k) => k !== lead && s[k]);
  const engines = s.engines;
  const cells = rest.length + (engines ? 1 : 0) + (pairs ? 1 : 0);
  // One supporting chart sits beside the lead at the lead's height (2:1); two or three sit in a row under it.
  // With the lead in the hero, the supporting charts share one height.
  const pair = !skipLead && cells === 1;
  const even = skipLead ? 300 : undefined;
  const panel = (k: ChartKind, isLead: boolean) => {
    const height = !isLead && pair ? 380 : even;
    if (k === 'google' && s.google) return <ChartPanel key={k} lead={isLead} height={height} title="Google impressions per day" source={sourceName(s.google.source)} series={s.google.series} format="index" tip={TIP.google} />;
    if (k === 'ai' && s.ai) return <ChartPanel key={k} lead={isLead} height={height} title={chartTitle(s.ai.title)} source={sourceName(s.ai.source)} series={s.ai.series} format="pct" tip={TIP.ai} />;
    if (k === 'leads' && s.leads) return <ChartPanel key={k} lead={isLead} height={height} title={chartTitle(s.leads.title)} source={sourceName(s.leads.source)} series={s.leads.series} format="index" tip={TIP.leads} />;
    return null;
  };
  const max = engines ? Math.max(...engines.rows.map((x) => Math.max(x.before, x.after)), 0.01) : 1;
  const notes = [
    s.google && { k: 'Google impressions', src: s.google.source, cap: s.google.caption },
    s.ai && { k: chartTitle(s.ai.title), src: s.ai.source, cap: s.ai.caption },
    s.leads && { k: chartTitle(s.leads.title), src: s.leads.source, cap: s.leads.caption },
    engines && { k: 'By engine', src: `${engines.beforeLabel} → ${engines.afterLabel}`, cap: engines.caption },
    pairs && { k: 'In AI answers', src: pairsSource, cap: pairs.caption },
  ].filter(Boolean) as { k: string; src?: string; cap: string }[];
  return (
    <>
      <div className={`cs-charts is-rest-${cells} ${skipLead ? 'is-nolead' : ''}`}>
        {!skipLead && <div className="cs-chart is-lead"><Marks />{panel(lead, true)}</div>}
        {rest.map((k) => <div key={k} className="cs-chart"><Marks />{panel(k, false)}</div>)}
        {pairs && (
          <div className="cs-chart">
            <Marks />
            <figure className="v11-cpanel">
              <figcaption className="v11-cpanel-head"><span className="is-title">In AI answers</span>{pairsSource && <span className="is-src">{pairsSource}</span>}</figcaption>
              <BeforeAfterChart pairs={pairs.pairs} beforeLabel={pairs.beforeLabel} afterLabel={pairs.afterLabel} height={pair ? 380 : even ?? 216} />
            </figure>
          </div>
        )}
        {engines && (
          <div className="cs-chart">
            <Marks />
            <figure className="v11-cpanel">
              <figcaption className="v11-cpanel-head"><span className="is-title">Share of AI answers by engine</span><span className="is-src">{`${engines.beforeLabel} → ${engines.afterLabel}`}</span></figcaption>
              <div className="cs-engines-grid">
                {engines.rows.map((r) => {
                  const e = ENGINE[r.engine] ?? { name: r.engine, i: 0 };
                  return (
                    <div key={r.engine} className="cs-engine-row">
                      <span className="is-name"><EngineIcon i={e.i} size={20} />{e.name}</span>
                      <span className="is-bar"><i style={{ width: `${(r.before / max) * 100}%` }} /><b>{`${(r.before * 100).toFixed(1)}%`}</b></span>
                      <span className="is-bar is-after"><i style={{ width: `${(r.after / max) * 100}%` }} /><b>{`${(r.after * 100).toFixed(1)}%`}</b></span>
                    </div>
                  );
                })}
              </div>
            </figure>
          </div>
        )}
      </div>
      <details className="cs-notes">
        <summary><span>How these were measured</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
        <dl>
          {notes.map((n) => <div key={n.k}><dt>{n.k}{n.src ? ` · ${n.src}` : ''}</dt><dd>{n.cap}</dd></div>)}
        </dl>
      </details>
    </>
  );
}

type Home = HomeV11Content;

/**
 * The hero. `report` (default, 2026-09-25): the title on white, then a wide panel in the client's own tint holding the
 * lead result as a report card (data studies) or the site we built with its result (build studies). `result` is the
 * earlier indigo-stage version and `site` the plain browser frame; both stay for comparison boards.
 */
export type CaseHero = 'report' | 'result' | 'site';

export function CaseStudyV11({ v, home, hero = 'report' }: { v: CaseView; home: Home; hero?: CaseHero }) {
  const { study, client } = v;
  const name = (client?.name ?? study.name).split(':')[0].trim();
  const s = standaloneCharts(caseSeries(v.instruments));
  const isData = Boolean(s.ai || s.google || s.leads);
  const lead = isData ? leadKind(s, v.result1.title) : null;
  const heroKind: CaseHero = hero;
  const leadChart = lead === 'google' ? s.google : lead === 'ai' ? s.ai : lead === 'leads' ? s.leads : undefined;
  // Published before → after figures stand in for an AI series that cannot be shown bare.
  const pairs = s.ai ? null : publishedPairs(s);
  const pairsSource = sourceName(v.instruments?.aiSource) ?? pairs?.caption.match(/Source:\s*([^,.]+)/)?.[1];
  const video = VIDEO_BY_CLIENT[name];
  const vq = video ? home.testimonials.videos[video.n] : undefined;
  const card = home.testimonials.cards.find((c) => [c.brand, c.jobTitle, c.person].some((x) => x && stripMarks(x).toLowerCase().includes(stripMarks(name).toLowerCase())));
  const summary = study['paragraph-summary'];
  const colorLogo = client?.['colored-logo']?.url;
  const { html: storyHtml } = dropShortAnswer(v.linkedBody);
  const disciplines = study.disciplines ?? [];
  const longQuote = v.testimonialQuote && strip(v.testimonialQuote).length > 200 ? v.testimonialQuote : undefined;

  const sources = [v.instruments?.aiSource, v.instruments?.gscSource, v.instruments?.leadGrowth?.source].filter(Boolean).join(' ');
  const measured = [
    /peec/i.test(sources) && { icon: 'peec-icon.png', name: 'Peec AI' },
    /search console/i.test(sources) && { icon: 'fav-google-g.png', name: 'Google Search Console' },
    /posthog/i.test(sources) && { icon: 'posthog-icon.png', name: 'PostHog' },
    /cal\.com/i.test(sources) && { icon: 'fav-calcom.png', name: 'Cal.com' },
  ].filter(Boolean) as { icon: string; name: string }[];

  const sections: { key: string; node: ReactNode }[] = [];

  /* key results, then the charts alone */
  if (isData && lead) {
    sections.push({
      key: 'numbers',
      node: (
        <div className="v11-wrap">
          <SectionHeadNode eyebrow="Key results" title={<>What changed for <span className="ghost">{`${name}.`}</span></>} />
          <KeyResults items={v.results.slice(0, 3).map((r) => ({ value: r.number, ...splitTitle(r.title) }))} />
          <Charts s={s} lead={lead} pairs={pairs} pairsSource={pairsSource} skipLead={heroKind === 'report' && Boolean(leadChart)} />
        </div>
      ),
    });
  }

  /* the client's voice beside what we did (the CRO board's proof grid). Voice cells stack on the left: the client's
     video, then their full review; a study with neither gets its short quote. What we did runs down the right. */
  const review = REVIEW_BY_CLIENT[name];
  // with the result hero, a build study's video is the hero picture, so the grid does not show it again
  // Arnel, 2026-09-25: the video hero did not work; a build study keeps its video in the grid and shows its site on the stage
  const videoInHero = false;
  const resultInHero = heroKind === 'report' && !leadChart;
  const voice: ReactNode[] = [];
  if (video && vq && !videoInHero) {
    voice.push(<VideoCell key="video" who={video.key} big={resultInHero ? undefined : v.result1.number} cap={resultInHero ? undefined : v.result1.title} quote={vq.quote} person={vq.person} role={vq.jobTitle} duration={vq.duration} />);
  }
  if (longQuote) {
    voice.push(
      <QuoteCell
        key="review"
        wide
        className="cs-review"
        logoUrl={video && !videoInHero ? undefined : colorLogo}
        logoAlt={name}
        logoW={120}
        logoH={24}
        quote={strip(longQuote)}
        person={v.testimonial?.name ?? ''}
        role={v.testimonial?.role ?? ''}
        faceUrl={v.avatarUrl}
        review={review}
      />,
    );
  } else if (!video && card) {
    voice.push(<QuoteCell key="card" wide logoUrl={colorLogo} brandIcon={BRAND_ICON[name]} logoAlt={name} logoW={120} logoH={24} quote={card.quote} person={card.person} role={card.jobTitle} initial={card.initial} review={review} tone="ind" />);
  }
  const whatWeDid = (
    <div className={`cro-cell cs-did ${voice.length ? `is-rows-${voice.length}` : 'is-full'}`}>
      <Marks />
      <div className="cro-tag"><span className="is-tag">What we did</span></div>
      <dl className="cs-did-facts">{v.facts.filter((f) => f.k !== 'Client').map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      {(v.servicePills.length > 0 || disciplines.length > 0) && (
        <div className="cs-did-group">
          <div className="cs-did-k">Services</div>
          <div className="cs-pills">
            {v.servicePills.length > 0
              ? v.servicePills.map((p) => <Link key={p.name} href={p.href}>{p.name}</Link>)
              : disciplines.map((d) => <span key={d}>{d}</span>)}
          </div>
        </div>
      )}
      {v.techPills.length > 0 && (
        <div className="cs-did-group">
          <div className="cs-did-k">Built with</div>
          <div className="cs-pills is-quiet">{v.techPills.map((p) => <span key={p.name}>{p.name}</span>)}</div>
        </div>
      )}
      {measured.length > 0 && (
        <div className="cs-did-group">
          <div className="cs-did-k">Measured with</div>
          <div className="cs-measured">
            {measured.map((m) => (
              <span key={m.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={img(`logos/${m.icon}`)} alt="" width={18} height={18} />
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  sections.push({
    key: 'project',
    node: (
      <div className="v11-wrap">
        <SectionHeadNode eyebrow="The project" title={<>Who we worked with <span className="ghost">and what we did.</span></>} />
        <div className="cro-grid cs-grid">
          {voice}
          {whatWeDid}
        </div>
      </div>
    ),
  });

  /* the article, with its contents and the call to book beside it */
  sections.push({
    key: 'story',
    node: (
      <div className="v11-wrap">
        <SectionHeadNode eyebrow="The story" title="Inside the work." />
        <div className="cs-story">
          <aside className="cs-rail">
            <nav className="sv-toc" aria-label="On this page">
              <div className="sv-toc-k">On this page</div>
              {v.toc.map((h) => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
            </nav>
            <div className="cs-cta">
              <div className="v11-stack is-34">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {TEAM.map((w) => <img loading="lazy" key={w} src={img(`avatars/${w}.png`)} alt="" width={30} height={30} className="v11-av" />)}
              </div>
              <div className="cs-cta-h">Want results like this?</div>
              <p>A 30-minute call on where your category’s growth is going.</p>
              <a href="#book-modal" data-cal-trigger="" className="v11-btn is-white"><span>Book an intro call</span></a>
            </div>
          </aside>
          <div className="v11-prose sv-article-body cs-body" dangerouslySetInnerHTML={{ __html: markWideFigures(storyHtml) }} />
        </div>
      </div>
    ),
  });

  if (v.faqItems.length >= 2) {
    sections.push({
      key: 'faq',
      node: (
        <div className="v11-wrap v11-faq">
          <div className="v11-faq-head">
            <h2 className="v11-h2">Key insights</h2>
            <p className="cs-faq-sub">{`The questions buyers and founders ask about the ${name} project, answered.`}</p>
          </div>
          <div className="v11-faq-list">
            {v.faqItems.map((f, i) => (
              <details key={i} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a" dangerouslySetInnerHTML={{ __html: f.answer }} />
              </details>
            ))}
          </div>
        </div>
      ),
    });
  }

  sections.push({
    key: 'related',
    node: (
      <div className="v11-wrap">
        <SectionHeadNode title="Related work" right={<Link href="/case-studies" className="v11-link cs-all"><span>See all case studies</span><ArrowRight /></Link>} />
        <div className="cs-related">
          {v.relatedCards.map((r) => (
            <Link key={r.slug} href={`/case-studies/${r.slug}`} className="cs-rel">
              <span className="cs-rel-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {v.relatedImages[r.slug] && <img src={cachedCmsImage(thumbnailImage(v.relatedImages[r.slug]), 828)} alt="" loading="lazy" />}
              </span>
              <span className="cs-rel-tag">{r.clientName}</span>
              <span className="cs-rel-t">{r.title}</span>
              {r.resultNumber && (
                <span className="cs-rel-result"><b>{r.resultNumber}</b><span>{r.resultTitle}</span></span>
              )}
              <span className="cs-rel-go">Read the case study <ArrowUpRight /></span>
            </Link>
          ))}
        </div>
      </div>
    ),
  });

  const shot = Object.values(SHOTS).find((x) => x.slug === study.slug);
  const captured = SITE_BY_SLUG[study.slug];
  // Cropped by the CDN to the desktop frame's own proportions (924×520 beside a phone, 1152×520 alone), so nothing
  // is left for object-fit to trim: Paper ignores object-position and would crop from the middle, cutting the top.
  const crop = `?w=1720&h=${PHONE_BY_CLIENT[name] ? 968 : 776}&fit=crop&crop=top&fm=webp&q=82`;
  const siteSrc = captured?.src ?? (shot ? `https://cdn.sanity.io/images/xjjjqhgt/production/${shot.asset}${crop}` : v.heroImage ? `${v.heroImage}${crop}` : undefined);
  const siteDomain = captured?.domain ?? shot?.domain ?? name;
  const head = splitTitle(v.result1.title);
  const copy = (
    <div className="cs-hero-copy">
      <div className="cs-crumbs"><Link href="/case-studies">Case studies</Link><span aria-hidden="true">/</span><span>{name}</span></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {v.clientLogoUrl && <img className="cs-hero-logo" src={cachedCmsImage(v.clientLogoUrl, 256)} alt={name} />}
      <h1>{v.projectTitle}</h1>
      {summary && <p className="cs-hero-summary" data-speakable="">{summary}</p>}
      <div className="v11-hero-ctas">
        <a href="#book-modal" data-cal-trigger="" className="v11-btn is-white"><span>Book an intro call</span></a>
        <Link href="/case-studies" className="v11-btn is-ghost"><span>All case studies</span></Link>
      </div>
    </div>
  );
  let heroNode: ReactNode;
  if (heroKind === 'report') {
    const t = getTintColors(v.clientColor);
    const brandIcon = BRAND_ICON[name];
    const brand = colorLogo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="cs-hero3-logo" src={cachedCmsImage(colorLogo, 384)} alt={name} />
    ) : (
      <span className="cs-hero3-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {brandIcon && <img src={img(brandIcon)} alt="" width={30} height={30} />}
        <span>{name}</span>
      </span>
    );
    heroNode = (
      <section className="cs-hero3" data-hero="light" style={{ '--c-base': t.base, '--c-glow': t.glow, '--c-clear': t.clear } as CSSProperties}>
        <div className="v11-wrap">
          <div className="cs-crumbs is-light"><Link href="/case-studies">Case studies</Link><span aria-hidden="true">/</span><span>{name}</span></div>
          {/* the title and the calls to act on the left, the summary in full on the right (it is never clamped) */}
          <div className="cs-hero3-top">
            <div>
              {brand}
              <h1>{v.projectTitle}</h1>
              <div className="cs-hero3-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>Book an intro call</span></a>
                <Link href="/case-studies" className="v11-btn is-line"><span>All case studies</span></Link>
              </div>
            </div>
            {summary && <div className="cs-hero3-side"><p data-speakable="">{summary}</p></div>}
          </div>
          {leadChart && lead ? (
            <div className="cs-hero3-stage">
              {/* the chart alone: its figure leads the key results right below, so it is not printed twice */}
              <div className="cs-report">
                <ChartPanel lead title={head.label} source={sourceName(leadChart.source)} series={leadChart.series} format={lead === 'ai' ? 'pct' : 'index'} tip={TIP[lead]} height={340} />
              </div>
            </div>
          ) : (
            <div className={`cs-hero3-stage is-site ${PHONE_BY_CLIENT[name] ? 'has-phone' : ''}`}>
              {siteSrc && <Browser src={siteSrc} domain={siteDomain} alt={`${name} website`} priority />}
              {PHONE_BY_CLIENT[name] && (
                <div className="cs-hero3-phone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(PHONE_BY_CLIENT[name].src)} alt={PHONE_BY_CLIENT[name].alt} width={421} height={876} />
                </div>
              )}
              <div className="sk-card cs-hero3-card">
                <div className="sk-card-head"><b>{name}</b><span>The result</span></div>
                <div className="sk-card-num">{v.result1.number}</div>
                <div className="cs-hero3-card-t">{v.result1.title}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  } else if (heroKind === 'result') {
    const pic = leadChart && lead ? (
      <StageChart size="hero" tag={head.label} client={name} metric={v.result1.number} series={leadChart.series} format={lead === 'ai' ? 'pct' : 'index'} tip={TIP[lead]} caption={head.note ?? ''} />
    ) : siteSrc ? <Browser src={siteSrc} domain={siteDomain} alt={`${name} website`} priority /> : null;
    heroNode = (
      <section className="v11-hero cs-hero is-result">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset('/images/home-v11/cases/stage-backdrop-1920.webp')} srcSet={`${asset('/images/home-v11/cases/stage-backdrop-1280.webp')} 1280w, ${asset('/images/home-v11/cases/stage-backdrop-1920.webp')} 1920w, ${asset('/images/home-v11/cases/stage-backdrop-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt="" className="v11-hero-photo is-backdrop" fetchPriority="high" />
        <div className="v11-hero-veil" aria-hidden="true" />
        <div className="v11-wrap"><div className="cs-hero-grid">{copy}<div className="cs-hero-pic">{pic}</div></div></div>
      </section>
    );
  } else {
    heroNode = (
      <section className={`sv-hero cs-hero is-site ${isData ? 'is-data' : 'is-build'}`}>
        <div className="v11-wrap">
          <div className="cs-hero-grid">
            {copy}
            <div className="cs-hero-site">
              {siteSrc && <Browser src={siteSrc} domain={siteDomain} alt={`${name} website`} priority />}
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <div className="v11" aria-label={`${v.projectTitle}, a LoudFace case study`}>
      {heroNode}
      {sections.map((sec, i) => (
        <section key={sec.key} className={`v11-sec ${i % 2 === 0 ? 'v11-white' : 'v11-warm'} is-${sec.key}`}>{sec.node}</section>
      ))}
      {/* a soft hyphen between the words of a joined-up name (LegacyRemembered) lets it break on a phone instead of running off */}
      <Closing c={{ ...home.closing, heading: `Want results like ${name.replace(/([a-z])([A-Z])/g, '$1&shy;$2')}’s? <br />Let’s build your pipeline.` }} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
