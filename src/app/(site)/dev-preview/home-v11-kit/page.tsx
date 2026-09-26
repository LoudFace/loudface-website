import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import '../../../audit-v11/audit.css';
import '../../../contact-v11/contact.css';
import '../../../seo-for-v11/industry.css';
import '../../../blog-v11/blog.css';
import '../../../pricing-v11/pricing.css';
import '../../../partners-v11/partners.css';
import '../../../methodology-v11/methodology.css';
import './kit.css';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import {
  getAiAuditContent, getConsentContent, getContactContent, getHomeV11Content, getIndustryV11Content, getMethodologyV11Content,
  getNavContent, getPartnersV11Content, getPricingV11Content, getSeoForArticleContent, SEO_FOR_ARTICLE_SLUGS,
} from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { Marks, ResultCase } from '../../../home-v11/ResultCase';
import { KeyResults } from '../../../home-v11/KeyResults';
import { ChartPanel } from '../../../home-v11/ChartPanel';
import { BeforeAfterChart } from '../../../home-v11/BeforeAfterChart';
import { StageChart } from '../../../home-v11/StageChart';
import { ChatWindow } from '../../../home-v11/Bento';
import { LogoGrid } from '../../../home-v11/LogoGrid';
import { Testimonials } from '../../../home-v11/Testimonials';
import { Chip, Eyebrow, LfMark, SectionHead, SectionHeadNode, ArrowLink, img } from '../../../home-v11/ui';
import { BarsCell, ChartCell, CheckPill, QuoteCell, Tag, Ui, UiHead, VideoCell } from '../../../service-v11/kit';
import { Redline, StatusList, Wireframe } from '../../../service-v11/pages/shared';
import { TileChart } from '../../../service-v11/pages/growth-autopilot';
import { ServiceResults } from '../../../service-v11/proof';
import { IndustriesPanelV11, PhoneMenuV11, ServicesPanelV11 } from '../../../home-v11/NavV11';
import { ConsentCardV11 } from '../../../home-v11/ConsentCard';
import { Queries, Scorecard } from '../../../audit-v11/AuditPageV11';
import { NextSteps } from '../../../contact-v11/NextSteps';
import { IndustryVoices } from '../../../seo-for-v11/voices';
import { RelatedIndustries } from '../../../seo-for-v11/related';
import { hubCards } from '../../../seo-for-v11/views';
import type { SeoForArticle } from '../../../seo-for-v11/types';
import { PostCard } from '../../../blog-v11/PostCard';
import { Board } from '../../../pricing-v11/PricingV11';
import { Statement } from '../../../partners-v11/PartnersV11';
import { EngineSlope, Funnel, MeasureSheet } from '../../../methodology-v11/MethodologyV11';
import { getNavV11Data } from '../../../home-v11/nav-data';

export const metadata: Metadata = { title: 'v11 component library', robots: { index: false, follow: false } };
export const revalidate = 3600;

/**
 * The v11 component library: every building block a page may use, rendered from the same components the pages use,
 * each labelled with its file. Imported into Paper as the "Design system · v11" page. DESIGN.md, "v11 component library".
 */

const COLORS: [string, string, string][] = [
  ['--color-ink', '#1A1040', 'Headings, figures'],
  ['--color-body', '#4A4466', 'Body copy'],
  ['--color-muted', '#6B6788', 'Labels, eyebrows'],
  ['--color-quiet', '#6F6C88', 'Captions, sources'],
  ['--color-ghost', '#8A86A6', 'Heading second half (3:1)'],
  ['--color-line', '#E4E4EA', 'Hairlines, crosshairs'],
  ['--color-warm', '#F6F6F6', 'Warm ground'],
  ['--color-indigo', '#4F46E5', 'Primary'],
  ['--color-chart', '#4F39F6', 'Chart ink'],
  ['--color-indigo-tint', '#EEF0FF', 'Tags, pills'],
  ['--color-stage', '#3D38CF', 'Stage'],
  ['--color-stage-top', '#030C5A', 'Stage top'],
  ['--color-lavender', '#EBE6FD', 'Tile'],
  ['--color-peach', '#FDE6DC', 'Tile'],
  ['--color-sand', '#FCEFCF', 'Tile'],
  ['--color-hand', '#E0572F', 'Handwriting'],
];

function Block({ name, file, rule, children, ground = 'white' }: { name: string; file: string; rule: string; children: ReactNode; ground?: 'white' | 'warm' | 'stage' }) {
  return (
    <section className={`kit-sec is-${ground}`}>
      <div className="v11-wrap">
        <div className="kit-label">
          <span className="kit-name">{name}</span>
          <span className="kit-file">{file}</span>
          <span className="kit-rule">{rule}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function KitPage() {
  const [c, data, nav, consent, audit, contact, pricing, partners, industry, meth, blog] = await Promise.all([
    getHomeV11Content(), getHomeV11Data(), getNavContent(), getConsentContent(), getAiAuditContent(), getContactContent(),
    getPricingV11Content(), getPartnersV11Content(), getIndustryV11Content(), getMethodologyV11Content(), fetchBlogIndexData(),
  ]);
  const navV11 = await getNavV11Data();
  const heads = Object.fromEntries(await Promise.all(SEO_FOR_ARTICLE_SLUGS.map(async (sl) => [sl, (await getSeoForArticleContent<SeoForArticle>(sl)).hero.h1] as const)));
  const cards = (await hubCards(industry.other, heads)).slice(0, 3);
  const posts = blog.blogPosts.slice(0, 3).map((p) => ({
    href: `/blog/${p.slug}`,
    title: p.name,
    categoryName: p.category ? blog.categories.get(p.category)?.name : undefined,
    thumbnailUrl: p.thumbnail?.url,
    readTime: formatReadTime(p['time-to-read']),
    date: p['published-date'],
  }));
  const s = c.hero.slides;
  const r = c.results.cases;
  const t = c.testimonials;
  return (
    <div className="v11 kit">
      <section className="kit-cover">
        <div className="v11-wrap">
          <Eyebrow dot="#ffffff" color="#dcd9fe">LoudFace · v11</Eyebrow>
          <h1>Design system</h1>
          <p>Every page is built from these parts. The homepage is the reference; a new part is added here, at homepage quality, before a page uses it.</p>
        </div>
      </section>

      <Block name="Colour" file="Paper tokens · src/app/home-v11/home-v11.css (:root of .v11)" rule="Sections alternate warm and white. One stage per page: the hero, and the closing call.">
        <div className="kit-swatches">
          {COLORS.map(([n, hex, use]) => (
            <div key={n} className="kit-swatch">
              <span style={{ background: hex }} />
              <b>{n.replace('--color-', '')}</b>
              <em>{hex} · {use}</em>
            </div>
          ))}
        </div>
      </Block>

      <Block name="Type" file="Neue Montreal 500 for headings and figures · Satoshi 400/500 for everything else" rule="Sentence case. Headings balance; body copy wraps pretty. No italics, no monospace labels." ground="warm">
        <div className="kit-type">
          <div><em>Display 84 · -0.047em</em><span className="t-display">Growth you can see.</span></div>
          <div><em>H1 62 · -0.045em</em><span className="t-h1">Your traffic is worth more.</span></div>
          <div><em>H2 52 · -0.037em</em><span className="t-h2">What the program <span className="ghost">covers.</span></span></div>
          <div><em>Tile title 26 · -0.025em</em><span className="t-tile">Conversion clarity</span></div>
          <div><em>Card title 22 · -0.02em</em><span className="t-card"><b>Delshad Legal</b> <span>grew case enquiries 2.5×</span></span></div>
          <div><em>Body 17 / 1.5</em><span className="t-body">Every page, layout decision, and line of copy gets evaluated through one filter.</span></div>
          <div><em>Label 14 · 500</em><span className="t-label">By the numbers</span></div>
          <div><em>Caption 12.5</em><span className="t-cap">Source: Peec AI, weekly readings.</span></div>
          <div><em>Figure 96 · -0.05em</em><span className="t-metric">6.3×</span></div>
        </div>
      </Block>

      <Block name="Section head" file="SectionHead / SectionHeadNode · src/app/home-v11/ui.tsx" rule="Every section opens with it: eyebrow, H2 with a quieter second half, a lede to the right.">
        <SectionHead eyebrow={c.results.eyebrow} heading={c.results.heading} body={c.results.body} bodyWidth={420} />
        <SectionHeadNode eyebrow="By the numbers" title={<>What changed for <span className="ghost">Genie Teacher.</span></>} />
      </Block>

      <Block name="Buttons, links, chips, eyebrows" file="src/app/home-v11/ui.tsx · .v11-btn, .v11-link, Chip, Eyebrow" rule="Pill buttons only on the stage (white + ghost). On light grounds the action is an arrow link." ground="warm">
        <div className="kit-row">
          <div className="kit-stage-mini">
            <a className="v11-btn is-white"><span>Book a strategy call</span></a>
            <a className="v11-btn is-ghost"><span>View our work</span></a>
          </div>
          <div className="kit-col">
            <ArrowLink href="/case-studies">See all case studies</ArrowLink>
            <Chip metric="97.8%" label="AI visibility on its top prompt" />
            <Chip metric="150×" label="Google impressions a day" lead={false} />
            <Eyebrow>The program</Eyebrow>
            <div className="kit-row is-tight"><Tag>Live</Tag><Tag tone="ind">In review</Tag><Tag tone="grey">Queued</Tag><Tag tone="warn">403</Tag></div>
          </div>
        </div>
      </Block>

      <Block name="Stage chart" file="StageChart · src/app/home-v11/StageChart.tsx" rule="A result drawn white on the stage. Size 'slide' in the homepage rail; size 'hero' as the picture of an inner-page hero." ground="stage">
        <div className="kit-stage-grid">
          <StageChart tag={s[1].tag} client={s[1].client} metric={s[1].metric} series={data?.hero.genie} format="index" tip={s[1].tip} periodStart={s[1].periodStart} periodEnd={s[1].periodEnd} caption={s[1].caption} href="/case-studies/genie-teacher-organic-growth" />
          <StageChart size="hero" tag={s[2].tag} client={s[2].client} metric={s[2].metric} series={data?.hero.delshad} format="index" tip={s[2].tip} periodStart={s[2].periodStart} periodEnd={s[2].periodEnd} caption={s[2].caption} />
        </div>
      </Block>

      <Block name="Result card" file="ResultCase · src/app/home-v11/ResultCase.tsx" rule="Result charts on a light ground use this card, or ChartCell inside a proof grid. Feature: claim, number and extra figures left, chart with axis right. Small: claim over a quiet chart.">
        <div className="v11-rgrid">
          <ResultCase feature icon="logos/delshad-icon.jpeg" href="/case-studies/delshad-legal-content-engine" linkLabel={c.results.caseLink} client={r[0].client} claim={r[0].claim} metric={r[0].metric} metricLabel={r[0].metricLabel} chartLabel={r[0].chartLabel} source={r[0].source} series={data?.results.delshad} format="index" tip={r[0].tip} />
          <ResultCase icon="logos/genie-icon.png" href="/case-studies/genie-teacher-organic-growth" linkLabel={c.results.caseLink} client={r[1].client} claim={r[1].claim} chartLabel={r[1].chartLabel} source={r[1].source} series={data?.results.genie} format="index" tip={r[1].tip} />
          <ResultCase icon="logos/trademomentum-icon.png" square href="/case-studies/trademomentum-niche-aeo-organic-growth" linkLabel={c.results.caseLink} client={r[2].client} claim={r[2].claim} chartLabel={r[2].chartLabel} source={r[2].source} series={data?.hero.tm} format="indexWeek" tip={r[2].tip} />
          <ResultCase href="/case-studies/loudface-aeo-case-study" linkLabel={c.results.caseLink} client={r[3].client} claim={r[3].claim} chartLabel={r[3].chartLabel} source={r[3].source} series={data?.results.lf} format="pct" tip={r[3].tip} pin={false} />
        </div>
      </Block>

      <Block name="Proof grid" file="VideoCell · BarsCell · ChartCell · QuoteCell · StatCell · src/app/service-v11/kit.tsx (.cro-grid)" rule="A service page's results: one wide client video, then numbers, live charts and named quotes in the crosshair grid. Approved on the CRO board, 2026-09-24." ground="warm">
        <div className="cro-grid">
          <VideoCell who="maksim" big="$1M+" cap="in sales from one landing page we designed" quote={t.videos[0].quote} person={t.videos[0].person} role={t.videos[0].jobTitle} duration={t.videos[0].duration} />
          <BarsCell tag="Conversion rate" client="Dimer Health" big="288%" cap="Best conversion increase from a LoudFace program" before="Before" after="After six months" />
          <ChartCell slide={s[2]} series={data?.hero.delshad} />
          <ChartCell slide={s[5]} series={data?.hero.genieLeads} />
          <QuoteCell logo="logos/brandfirm.png" logoAlt="Brandfirm" logoW={108} logoH={22} big={t.cards[2].metric} cap={t.cards[2].caption} quote={t.cards[2].quote} person={t.cards[2].person} role={t.cards[2].jobTitle} face="people/daan-smit.webp" tone="orange" />
        </div>
      </Block>

      <Block name="Tiles with product UI" file="Program tiles · .sv-tile in src/app/service-v11/svc.css · UI cards in src/app/service-v11/kit.tsx and pages/shared.tsx" rule="Four grounds: indigo (lead tile only), lavender, peach, sand, each with a bottom-right glow. Every tile carries real UI at true size; anything illustrative says 'example'.">
        <div className="sv-tiles">
          <div className="sv-tiles-row">
            <div className="sv-tile is-ind is-wide">
              <div className="sv-tile-tag"><i /><span>Clarity</span></div>
              <div className="sv-tile-title">Conversion clarity</div>
              <p className="sv-tile-desc">Message hierarchy, information architecture, and UX designed for comprehension and decision-making.</p>
              <div className="sv-tile-art"><Wireframe pills={['Headline states the outcome', 'One next step above the fold']} /></div>
            </div>
            <div className="sv-tile is-lav is-narrow">
              <div className="sv-tile-tag"><i /><span>Answer window</span></div>
              <div className="sv-tile-title">The ChatGPT window</div>
              <p className="sv-tile-desc">The homepage’s own answer UI (ChatWindow in src/app/home-v11/Bento.tsx). Use it wherever a page shows an AI answer.</p>
              <div className="sv-tile-art"><ChatWindow c={c.bento.chat} /></div>
            </div>
          </div>
          <div className="sv-tiles-row">
            <div className="sv-tile is-peach">
              <div className="sv-tile-tag"><i /><span>Copy</span></div>
              <div className="sv-tile-title">Redline</div>
              <div className="sv-tile-art"><Redline head="Example · hero headline" right="v1 → v2" before="Innovative finance solutions for modern teams" after="Close your books in two days, not ten." why="Names the problem, then the outcome" /></div>
            </div>
            <div className="sv-tile is-sand">
              <div className="sv-tile-tag"><i /><span>Status</span></div>
              <div className="sv-tile-title">Status list</div>
              <div className="sv-tile-art"><StatusList head="Test log · example" right="Measured on demo starts" rows={[{ k: 'Hero headline', tag: 'Winner shipped' }, { k: 'Pricing page proof', tag: 'Running · day 9', tone: 'ind' }, { k: 'Demo form', tag: 'Queued', tone: 'grey' }]} /></div>
            </div>
            <div className="sv-tile is-lav">
              <div className="sv-tile-tag"><i /><span>Annotation</span></div>
              <div className="sv-tile-title">Pills and cards</div>
              <div className="sv-tile-art">
                <Ui><UiHead left="Card · example" right={<Tag tone="good">Live</Tag>} /><div style={{ fontSize: 13 }}>White card, 14px radius, soft two-layer shadow.</div></Ui>
                <div style={{ marginTop: 12 }}><CheckPill>Proof on the first screen</CheckPill></div>
              </div>
            </div>
          </div>
        </div>
      </Block>

      <Block name="Client voice" file="Testimonials · src/app/home-v11/Testimonials.tsx" rule="Video cards on their client tint, quote cards with the client's number. Reuse these cards; never a bare text quote." ground="warm">
        <div className="kit-embed"><Testimonials c={c.testimonials} /></div>
      </Block>

      <Block name="Document on the plate" file=".v11-svc-plate + .v11-sheet · src/app/home-v11/home-v11.css (section 6)" rule="How LoudFace shows its own process: a written document on the brand plate, never a feature list.">
        <div className="v11-svc-plate">
          <div className="v11-sheet is-program">
            <div className="v11-sheet-head">
              <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
              <span className="is-meta">Conversion Rate Optimization · Your company</span>
            </div>
            <div className="v11-program">
              <div className="v11-program-row is-row"><div className="v11-program-title">Conversion audit</div><p>We map your current funnel: where visitors land, where they drop off, where friction kills momentum.</p></div>
              <div className="v11-program-row is-card"><div className="v11-program-title">90-day roadmap</div><p>Three to five measurable goals tied to pipeline outcomes, on a shared Scoreboard.</p></div>
            </div>
          </div>
        </div>
      </Block>

      <Block name="Logo grid" file="LogoGrid · src/app/home-v11/LogoGrid.tsx" rule="Crosshair grid of client logos, count on the left. Reused as-is on every page with a page-specific line." ground="warm">
        <div className="kit-embed"><LogoGrid c={c.logos} /></div>
      </Block>

      <Block name="Crosshair grid and marks" file=".v11-m, .v11-rgrid · src/app/home-v11/home-v11.css" rule="Proof sits in a hairline grid with a small cross at every corner. Cards float; proof sits in the grid.">
        <div className="v11-rgrid kit-cross">
          {['Number', 'Chart', 'Quote'].map((t) => (
            <div key={t} className="v11-rcase"><i className="v11-m is-tl" /><i className="v11-m is-tr" /><i className="v11-m is-bl" /><i className="v11-m is-br" /><p className="v11-rcase-title"><span className="is-client">{t}.</span> <span className="is-claim">One cell, one idea.</span></p></div>
          ))}
        </div>
      </Block>

      <Block name="Key results and bare charts" file="KeyResults · ChartPanel · BeforeAfterChart · src/app/home-v11/ · grid .cs-charts in src/app/case-v11/case.css" rule="A case study's numbers: three big figures with one short label each, then the charts alone, each with a title and its source and no caption. A chart whose shape contradicts its claim is not drawn; the published before → after figures stand in. Reference: Graphite's Fourthwall study.">
        <KeyResults items={[
          { value: '150×', label: 'Google impressions per day', note: 'May 2026 average → 1–15 Sep 2026' },
          { value: '28×', label: 'Google clicks per week', note: 'May 2026 average → week ending 15 Sep 2026' },
          { value: '7.8×', label: 'Lead requests per week', note: 'seven tracked weeks to 5 Sep → first full week of Sep 2026 (PostHog)' },
        ]} />
        {data && (
          <div className="cs-charts is-rest-2">
            <div className="cs-chart is-lead"><Marks /><ChartPanel lead title="Google impressions per day" source="Google Search Console" series={data.results.genie} format="index" tip="of the baseline day" /></div>
            <div className="cs-chart"><Marks /><ChartPanel title="Lead requests per week" source="PostHog" series={data.hero.genieLeads} format="index" tip="of the baseline weeks" /></div>
            <div className="cs-chart">
              <Marks />
              <figure className="v11-cpanel">
                <figcaption className="v11-cpanel-head"><span className="is-title">In AI answers</span><span className="is-src">Peec AI</span></figcaption>
                <BeforeAfterChart
                  pairs={[
                    { label: 'AI visibility', before: 5.26, after: 9.88, beforeText: '5.26%', afterText: '9.88%' },
                    { label: 'Share of voice', before: 2.26, after: 13.6, beforeText: '2.26%', afterText: '13.6%' },
                  ]}
                  beforeLabel="Week of 25 May"
                  afterLabel="Week of 7 Sep"
                  height={216}
                />
              </figure>
            </div>
          </div>
        )}
      </Block>

      <Block name="Case study parts" file="src/app/case-v11/CaseStudyV11.tsx · .cs-did, .cs-review, .cs-cta in src/app/case-v11/case.css" rule="In the proof grid, the client's video and full review (or short quote) stack on the left, with a link to the published review; a 'What we did' cell runs down the right: facts, services, and what it was built or measured with. The booking card rides the article's sticky rail." ground="warm">
        <div className="kit-row">
          <div className="cro-grid" style={{ gridTemplateColumns: '1fr', width: 432 }}>
            <div className="cro-cell cs-did">
              <Marks />
              <div className="cro-tag"><span className="is-tag">What we did</span></div>
              <dl className="cs-did-facts"><div><dt>Industry</dt><dd>Education</dd></div><div><dt>Country</dt><dd>Canada</dd></div></dl>
              <div className="cs-did-group"><div className="cs-did-k">Services</div><div className="cs-pills"><span>AI Search &amp; Organic Growth</span></div></div>
              <div className="cs-did-group">
                <div className="cs-did-k">Measured with</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="cs-measured"><span><img src={img('logos/peec-icon.png')} alt="" width={18} height={18} />Peec AI</span><span><img src={img('logos/fav-google-g.png')} alt="" width={18} height={18} />Google Search Console</span></div>
              </div>
            </div>
          </div>
          <div className="cs-cta" style={{ width: 280 }}>
            <div className="v11-stack is-34">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'].map((w) => <img key={w} src={img(`avatars/${w}.png`)} alt="" width={30} height={30} className="v11-av" />)}
            </div>
            <div className="cs-cta-h">Want results like this?</div>
            <p>A 30-minute call on where your category’s growth is going.</p>
            <a className="v11-btn is-white"><span>Book an intro call</span></a>
          </div>
        </div>
      </Block>

      <Block name="Site menus" file="ServicesPanelV11 · IndustriesPanelV11 · src/app/home-v11/NavV11.tsx, chrome.css" rule="The header's two menus: grouped rows with a line of description, the people you would talk to at the foot, and one card whose picture explains the menu (the answer window; the clients). Live on v11 routes only until go-live (src/lib/v11-routes.ts)." ground="warm">
        <div className="kit-menus">
          <ServicesPanelV11 dropdown={nav.dropdowns.services} v11={navV11} cta={nav.dropdownCta} />
          <IndustriesPanelV11 dropdown={nav.dropdowns.industries} v11={navV11} cta={nav.dropdownCta} />
        </div>
      </Block>

      <Block name="Phone menu and cookie notice" file="PhoneMenuV11 · src/app/home-v11/NavV11.tsx · ConsentCardV11 · src/app/home-v11/ConsentCard.tsx" rule="On a phone the menus open in place under the page links, then one ink pill books the call. The cookie notice is a white card in the lower-left corner (a bar across the bottom on a phone); accepting and declining carry equal weight.">
        <div className="kit-row">
          <div className="kit-phone"><PhoneMenuV11 links={nav.links} services={nav.dropdowns.services} industries={nav.dropdowns.industries} v11={navV11} ctaText={nav.ctaText} open="industries" /></div>
          <ConsentCardV11 c={consent} detailId="kit-consent" preview />
        </div>
      </Block>

      <Block name="Report windows" file="Scorecard · Queries · src/app/audit-v11/AuditPageV11.tsx" rule="The audit's own report pages at true size, on a pale tint: the scorecard, and which engine names the company for each buyer question. Used by the audit landing, the report and the methodology page. Example data says 'Example report'." ground="warm">
        <div className="kit-row is-top">
          <div className="au-ground kit-w460"><Scorecard x={audit.example} /></div>
          <div className="au-q-pic kit-w560"><Queries x={audit.example} /></div>
        </div>
      </Block>

      <Block name="Readings as charts" file="EngineSlope · Funnel · src/app/methodology-v11/MethodologyV11.tsx · TileChart · src/app/service-v11/pages/growth-autopilot.tsx" rule="Two readings per series are a slope; one sample carried through steps is a funnel with the lost part hatched; a tile's small number chart is TileChart. Every one names its window and source.">
        <div className="kit-row is-top">
          <div className="kit-w560"><EngineSlope c={meth.hero} /></div>
          <div className="kit-w560"><Funnel c={meth.funnel} /></div>
          <div className="kit-w300"><TileChart head="Google impressions a day" client="Genie Teacher" num="150×" series={data?.hero.genie} format="index" tip={s[1].tip} /></div>
        </div>
      </Block>

      <Block name="Working documents" file="MeasureSheet · src/app/methodology-v11/MethodologyV11.tsx · Statement · src/app/partners-v11/PartnersV11.tsx · Board · src/app/pricing-v11/PricingV11.tsx" rule="What we hand over, drawn as the thing itself: the measurement spreadsheet, the partner statement, a plan's weekly board. On the brand plate when it is the section's one document." ground="warm">
        <MeasureSheet c={meth.sheet} />
        <div className="kit-row is-top" style={{ marginTop: 32 }}>
          <div className="kit-w460"><Statement s={partners.statement} /></div>
          <div className="kit-w460"><Board b={pricing.boards[1]} /></div>
        </div>
      </Block>

      <Block name="What happens next" file="NextSteps · src/app/contact-v11/NextSteps.tsx" rule="After someone books: four steps, each with the thing that arrives (the slot, the call on their own site, the proposal, the kickoff message). Used by /contact and /thank-you; the examples are pricing-v11.json's.">
        <NextSteps n={contact.nextSteps} steps={pricing.steps} />
      </Block>

      <Block name="Results set" file="ServiceResults · src/app/service-v11/proof.tsx" rule="A page's published results in the crosshair grid, picked per page (resultKeys) so no figure repeats on the same page." ground="warm">
        <ServiceResults slug="case-studies" home={c} data={data} />
      </Block>

      <Block name="Client voices set" file="IndustryVoices · src/app/seo-for-v11/voices.tsx" rule="Two wide and two narrow cells of client video and quotes, skipping any client the page already shows.">
        <IndustryVoices t={c.testimonials} avoid={[]} />
      </Block>

      <Block name="Cards that lead elsewhere" file="RelatedIndustries · src/app/seo-for-v11/related.tsx · PostCard · src/app/blog-v11/PostCard.tsx" rule="A link to another page carries that page's picture: the industry's lead client site, or the post's cover (PostCover when it has none)." ground="warm">
        <RelatedIndustries c={industry} cards={cards} />
        <div className="bl-grid kit-posts">{posts.map((p) => <PostCard key={p.href} p={p} />)}</div>
      </Block>
    </div>
  );
}
