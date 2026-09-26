import Link from 'next/link';
import { artifactSrc, SHOTS } from '../../service-v3/data';
import type { ExtrasFn } from '../types';
import { Check, QuoteCell, StatCell, Tag, Ui, UiHead, VideoCell } from '../kit';
import { logo } from './shared';

const CLIENTS = [
  { src: 'liqid-ink.png', alt: 'LIQID', h: 16 },
  { src: 'eraser-ink.png', alt: 'Eraser', h: 16 },
  { src: 'dimer-health-ink.png', alt: 'Dimer Health', h: 18 },
  { src: 'toku-ink.png', alt: 'Toku', h: 16 },
  { src: 'montblanc-ink.png', alt: 'Montblanc', h: 12 },
  { src: 'hoxhunt-ink.png', alt: 'Hoxhunt', h: 16 },
];

const INTEGRATIONS = [
  { icon: 'fav-hubspot.png', name: 'HubSpot', what: 'Forms and lifecycle stages' },
  { icon: 'fav-segment.png', name: 'Twilio Segment', what: 'Every event, one pipe' },
  { icon: 'gtm-icon.svg', name: 'Google Tag Manager', what: 'Tags without a deploy' },
  { icon: 'fav-zapier.png', name: 'Zapier', what: 'Hand-offs to the rest of the stack' },
  { icon: 'fav-calcom.png', name: 'Cal.com', what: 'Booking inside the page' },
];

const COMPONENTS = ['Hero', 'Logo strip', 'Feature grid', 'Case study card', 'Pricing table', 'FAQ', 'Comparison', 'Closing CTA'];

/** Webflow: the sites themselves are the proof. Signature: a wall of real builds at true size. */
export const webflow: ExtrasFn = ({ home, images }) => {
  const t = home.testimonials;
  const shot = (k: keyof typeof SHOTS, h: number) => artifactSrc({ ...SHOTS[k], alt: '' }, images, `?w=880&h=${h * 2}&fit=crop&crop=top&fm=webp&q=80`);
  return {
    heroCard: (
      <div className="sk-card">
        <div className="sk-card-head">
          <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo('webflow-icon.png')} alt="" width={20} height={20} style={{ borderRadius: 5 }} />
            Webflow
          </b>
          <Tag tone="ind">Enterprise Partner</Tag>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Component library', 'CMS your team runs', 'Analytics wired on day one'].map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 99, background: 'var(--ind)' }}><Check /></span>{k}
            </div>
          ))}
        </div>
        <div className="sk-card-foot"><span>Published to production</span><span>Ready for your team</span></div>
      </div>
    ),
    band: [
      { k: 'Kickoff to launch', v: '4–8 weeks', s: 'Scoped with you on the intro call' },
      { k: 'New landing pages', v: 'Hours', s: 'Assembled from your own components' },
      { k: 'Typical response', v: '2h', s: 'In working hours, from the team that built it' },
    ],
    tiles: [
      {
        tag: 'Analytics',
        art: (
          <Ui>
            <UiHead left="Event stream · example" right={<Tag tone="good">Live</Tag>} />
            {[
              ['demo_started', '/pricing', 'HubSpot'],
              ['pricing_viewed', '/pricing', 'Segment'],
              ['cta_clicked', '/', 'GA4'],
              ['form_submitted', '/contact', 'HubSpot'],
            ].map(([e, p, d]) => (
              <div key={e} className="sk-row"><span className="is-k sk-mono">{e}</span><span className="is-v" style={{ fontSize: 12, color: 'var(--quiet)' }}>{p} → {d}</span></div>
            ))}
            <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
              {['Events', 'Funnels', 'Attribution'].map((c) => <Tag key={c} tone="ind">{c}</Tag>)}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Integrations',
        art: (
          <Ui style={{ gap: 0 }}>
            <UiHead left="Connected" right="5 of 5" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
              {INTEGRATIONS.slice(0, 4).map((x) => (
                <div key={x.name} className="sk-row">
                  <span className="is-k" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo(x.icon)} alt="" width={20} height={20} style={{ borderRadius: 5 }} />
                    <span>{x.name}</span>
                  </span>
                  <Tag tone="good">Connected</Tag>
                </div>
              ))}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Search',
        art: (
          <Ui style={{ gap: 8 }}>
            <UiHead left="Page outline · /pricing" right="Example" />
            {[
              ['H1', 'Pricing that scales with your team', 0],
              ['H2', 'Compare plans', 1],
              ['H3', 'What every plan includes', 2],
              ['H2', 'Questions about pricing', 1],
            ].map(([h, txt, d]) => (
              <div key={`${h}${txt}`} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: Number(d) * 16, fontSize: 12.5 }}>
                <span className="sk-tag is-grey" style={{ minWidth: 26, justifyContent: 'center' }}>{h}</span><span>{txt}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, paddingTop: 6, borderTop: '1px solid #efeef5' }}><Tag tone="ind">FAQPage schema</Tag><Tag tone="good">LCP 1.4 s</Tag></div>
          </Ui>
        ),
      },
      {
        tag: 'CMS',
        art: (
          <Ui style={{ gap: 0 }}>
            <UiHead left="Collection · Case studies" right="Example" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
              {[['Fintech onboarding rebuild', 'Published', 'good'], ['Health platform launch', 'Published', 'good'], ['Payroll comparison hub', 'Draft', 'grey'], ['Security training site', 'Scheduled', 'ind']].map(([n, s, tone]) => (
                <div key={n} className="sk-row"><span className="is-k">{n}</span><Tag tone={tone as 'good'}>{s}</Tag></div>
              ))}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Responsive',
        art: (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            {[{ w: 190, h: 124 }, { w: 92, h: 124 }, { w: 54, h: 104 }].map((d, i) => (
              <Ui key={i} style={{ width: d.w, height: d.h, padding: 10, gap: 6, borderRadius: i === 2 ? 12 : 10 }}>
                <i className="sk-bar is-ink" style={{ width: '40%', height: 5 }} />
                <i className="sk-bar is-ink" style={{ width: '90%', height: 8, marginTop: 6 }} />
                <i className="sk-bar is-ink" style={{ width: '70%', height: 8 }} />
                <i className="sk-bar is-soft" style={{ width: '80%', height: 4 }} />
                <i className="sk-bar is-ind" style={{ width: '45%', height: 10, borderRadius: 99, marginTop: 'auto' }} />
              </Ui>
            ))}
          </div>
        ),
      },
      {
        tag: 'Scale',
        art: (
          <Ui>
            <UiHead left="Component library · example" right="New page from 6 blocks" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {COMPONENTS.map((c, i) => (
                <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 10, background: i < 6 ? '#f6f5fb' : '#ffffff', boxShadow: i < 6 ? 'inset 0 0 0 1.5px #c9c3f7' : 'inset 0 0 0 1px #e4e4ea' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: 40, justifyContent: 'center' }}>
                    <i className="sk-bar is-soft" style={{ width: '70%', height: 5 }} /><i className="sk-bar is-soft" style={{ width: '50%', height: 5 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{c}</span>
                </div>
              ))}
            </div>
          </Ui>
        ),
      },
    ],
    results: {
      title: <>The build behind a <span className="ghost">288% conversion lift.</span></>,
      lede: 'A component-first Webflow rebuild for a regulated health brand, then a six-month conversion program on top of it. Same team built the site and optimized it, so nothing got re-briefed between the people who ship and the people who grow.',
      cells: (
        <>
          <VideoCell who="sarig" big="288%" cap="Best conversion increase from a LoudFace build" quote={t.videos[1].quote} person={t.videos[1].person} role={t.videos[1].jobTitle} duration={t.videos[1].duration} />
          <QuoteCell logo="logos/color-outbound.png" logoAlt="Outbound Specialist" logoW={75} logoH={26} big="$1M+" cap="in sales from one landing page we designed" quote={t.videos[0].quote} person={t.videos[0].person} role={t.videos[0].jobTitle} tone="ind" />
          <QuoteCell logo="logos/brandfirm.png" logoAlt="Brandfirm" logoW={108} logoH={22} big={t.cards[2].metric} cap={t.cards[2].caption} quote={t.cards[2].quote} person={t.cards[2].person} role={t.cards[2].jobTitle} face="people/daan-smit.webp" tone="orange" />
          <StatCell tag="Teams" big="50+" cap="B2B teams we have built sites for">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px 14px', alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {CLIENTS.map((c) => <img loading="lazy" key={c.src} src={logo(c.src)} alt={c.alt} style={{ height: c.h, width: 'auto', maxWidth: 80, opacity: 0.75 }} />)}
            </div>
          </StatCell>
          <StatCell tag="Response time" big="2h" cap="Typical response time in working hours">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Request', 'Mon 09:12'], ['Reply from your lead', 'Mon 10:48'], ['Change live', 'Mon 15:30']].map(([k, v]) => (
                <div key={k} className="sk-row" style={{ fontSize: 13 }}><span className="is-k">{k}</span><span className="is-v" style={{ color: 'var(--quiet)', fontSize: 12.5 }}>{v}</span></div>
              ))}
              <div style={{ fontSize: 11.5, color: '#a3a0b8' }}>Example day</div>
            </div>
          </StatCell>
        </>
      ),
    },
    chartsUseHomeHead: true,
    signature: {
      eyebrow: 'Recent builds',
      title: <>Enterprise-grade Webflow <span className="ghost">expertise.</span></>,
      lede: 'Webflow is a delivery capability we have deep experience with. We use that expertise for B2B SaaS builds and migrations when it fits the client stack and scope.',
      node: (
        <div className="sv-wall">
          {[
            [['liqid', 520, 'LIQID', 'Wealth management'], ['radisson', 300, 'Radisson Hotels Group', 'Hospitality']],
            [['eraser', 340, 'Eraser', 'Developer tooling'], ['dimer', 480, 'Dimer Health', 'Digital health']],
            [['montblanc', 300, 'Montblanc', 'Luxury goods'], ['outbound', 520, 'Outbound Specialist', 'B2B sales']],
          ].map((col, i) => (
            <div key={i} className={`sv-wall-col ${i === 1 ? 'is-down' : ''}`}>
              {col.map(([k, h, name, sector]) => (
                <Link key={k as string} href={`/case-studies/${SHOTS[k as keyof typeof SHOTS].slug}`} className="sv-wall-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot(k as keyof typeof SHOTS, h as number)} alt={`${name}, a LoudFace project`} style={{ height: h as number }} loading="lazy" />
                  <span className="is-cap"><b>{name}</b><span>{sector}</span></span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  };
};
