import type { ExtrasFn } from '../types';
import { QuoteCell, StatCell, Tag, Ui, UiHead, VideoCell } from '../kit';
import { EngineIcon, logo } from './shared';

const SWATCHES = [
  { name: 'Ink', hex: '#1A1040' },
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Lavender', hex: '#EBE6FD' },
  { name: 'Peach', hex: '#FDE6DC' },
  { name: 'Sand', hex: '#FCEFCF' },
];

/** A scroll-flow wireframe: every block numbered by the job it does for the visitor. */
function FlowWire() {
  const step = (n: number) => <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 99, background: 'var(--ind)', color: '#fff', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>{n}</span>;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
      <Ui style={{ flex: 1, gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><i className="sk-bar is-ink" style={{ width: 54, height: 9 }} /><i className="sk-bar is-ind" style={{ width: 46, height: 16, borderRadius: 99 }} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 0', borderBottom: '1px dashed #d9d7e6' }}>
          <i className="sk-bar is-ink" style={{ width: '80%', height: 13 }} /><i className="sk-bar is-soft" style={{ width: '60%' }} /><i className="sk-bar is-ind" style={{ width: 80, height: 20, borderRadius: 99, marginTop: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '4px 0 10px', borderBottom: '1px dashed #d9d7e6' }}>
          {[0, 1, 2, 3].map((k) => <i key={k} className="sk-bar" style={{ width: 36, height: 8, background: '#c9c7d8' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[0, 1, 2].map((k) => <div key={k} style={{ height: 38, borderRadius: 8, background: '#f2f1f7' }} />)}
        </div>
      </Ui>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 10, width: 170 }}>
        {[['What it is, for whom', 1], ['Who already trusts it', 2], ['What to do next', 3]].map(([k, n]) => (
          <div key={k as string} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 500, color: '#ffffff' }}>{step(n as number)}{k}</div>
        ))}
      </div>
    </div>
  );
}

/** UX/UI design: the system behind the pages. Signature: one page as its three audiences read it. */
export const uxUiDesign: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    heroCard: (
      <div className="sk-card">
        <div className="sk-card-head">
          <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo('fav-figma.png')} alt="" width={18} height={18} />
            Button / Primary
          </b>
          <span>Component</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 18px', borderRadius: 99, background: 'var(--ind)', color: '#fff', fontSize: 14, fontWeight: 500 }}>Book a demo</span>
          <span style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 18px', borderRadius: 99, boxShadow: 'inset 0 0 0 1.5px #d9d7e6', fontSize: 14, fontWeight: 500 }}>See pricing</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
          {[['Fill', 'color/indigo'], ['Radius', 'radius/pill'], ['Padding', 'space/18 · space/10'], ['Type', 'body/medium 14']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--quiet)' }}>{k}</span><span className="sk-mono" style={{ fontSize: 11.5 }}>{v}</span></div>
          ))}
        </div>
        <div className="sk-card-foot"><span>One token, every page</span><span>Figma → Webflow</span></div>
      </div>
    ),
    band: [
      { k: 'Before Figma', v: 'Copy', s: 'Messaging sets the hierarchy' },
      { k: 'What you get', v: 'A system', s: 'Components, tokens and documentation' },
      { k: 'PageSpeed target', v: '90+', s: 'Speed is a design requirement' },
    ],
    tiles: [
      { tag: 'UX', art: <FlowWire /> },
      {
        tag: 'System',
        art: (
          <Ui>
            <UiHead left="Tokens · example" right="12 components" />
            <div style={{ display: 'flex', gap: 8 }}>
              {SWATCHES.map((w) => (
                <div key={w.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ height: 34, borderRadius: 8, background: w.hex, boxShadow: 'inset 0 0 0 1px rgba(26,16,64,0.08)' }} />
                  <span style={{ fontSize: 11, color: 'var(--quiet)' }}>{w.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10, borderTop: '1px solid #efeef5' }}>
              <span style={{ display: 'flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 99, background: 'var(--ind)', color: '#fff', fontSize: 12, fontWeight: 500 }}>Primary</span>
              <span style={{ display: 'flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 99, boxShadow: 'inset 0 0 0 1.5px #d9d7e6', fontSize: 12, fontWeight: 500 }}>Secondary</span>
              <Tag tone="ind">Badge</Tag>
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Speed',
        art: (
          <Ui>
            <UiHead left="PageSpeed · example build" right="Mobile" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true">
                <circle cx="39" cy="39" r="33" fill="#e3f5ea" stroke="#cdebd8" strokeWidth="6" />
                <circle cx="39" cy="39" r="33" fill="none" stroke="#1f9d5c" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 33 * 0.96} 999`} transform="rotate(-90 39 39)" />
                <text x="39" y="46" textAnchor="middle" fontSize="22" fontWeight="600" fill="#1b7f4b">96</text>
              </svg>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                {[['Load', '1.6 s'], ['Page weight', '740 KB'], ['Motion', 'Purposeful only']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--quiet)' }}>{k}</span><b style={{ fontWeight: 500 }}>{v}</b></div>
                ))}
              </div>
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Structure',
        art: (
          <Ui style={{ gap: 8 }}>
            <UiHead left="Hub and spokes · example" right="Schema-ready" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 500 }}><Tag tone="ind">Hub</Tag>Payroll compliance guide</div>
            {['Contractor payroll by country', 'Stablecoin payroll, explained', 'Payroll tax deadlines'].map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 18, fontSize: 12.5 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 0v6h10" fill="none" stroke="#c9c7d8" strokeWidth="1.3" /></svg>{k}
              </div>
            ))}
          </Ui>
        ),
      },
      {
        tag: 'Brand',
        art: (
          <Ui style={{ gap: 6 }}>
            <UiHead left="Type scale · example" right="Neue Montreal · Satoshi" />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 40, lineHeight: 1, letterSpacing: '-0.045em' }}>Aa</div>
            {[['Display', 62], ['Heading', 32], ['Body', 17]].map(([k, v]) => (
              <div key={k} className="sk-row" style={{ fontSize: 12.5 }}><span className="is-k">{k}</span><span className="is-v sk-mono" style={{ fontSize: 11.5, color: 'var(--quiet)' }}>{v} px</span></div>
            ))}
          </Ui>
        ),
      },
    ],
    results: {
      title: <>Design that earned <span className="ghost">a 288% lift.</span></>,
      lede: 'A positioning-led redesign for a regulated health brand: trust architecture, message hierarchy, and a component system rebuilt so every layout points at one action. Same team designed it and optimized it against real conversion data.',
      cells: (
        <>
          <VideoCell who="sarig" big="288%" cap="Best conversion increase from a LoudFace design" quote={t.videos[1].quote} person={t.videos[1].person} role={t.videos[1].jobTitle} duration={t.videos[1].duration} />
          <QuoteCell logo="logos/color-outbound.png" logoAlt="Outbound Specialist" logoW={75} logoH={26} big="$1M+" cap="in sales from one landing page we designed" quote={t.videos[0].quote} person={t.videos[0].person} role={t.videos[0].jobTitle} tone="ind" />
          <VideoCell who="elizabete" quote={t.videos[2].quote} person={t.videos[2].person} role={t.videos[2].jobTitle} duration={t.videos[2].duration} />
          <StatCell tag="Performance" big="90+" cap="Target PageSpeed score on every build">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Sub-2-second load', 'Design requirement'], ['Compressed assets', 'Every image'], ['Purposeful motion', 'Nothing decorative']].map(([k, v]) => (
                <div key={k} className="sk-row"><span className="is-k">{k}</span><span className="is-v" style={{ fontSize: 12.5, color: 'var(--quiet)' }}>{v}</span></div>
              ))}
            </div>
          </StatCell>
        </>
      ),
    },
    chartsUseHomeHead: true,
    signature: {
      eyebrow: 'Three audiences',
      title: <>Design that earns <span className="ghost">its keep.</span></>,
      lede: 'A beautiful page that doesn’t convert is expensive decoration. We design for three audiences from the first wireframe — human visitors, search crawlers, and AI systems.',
      node: (
        <div className="sv-trio">
          <div className="sv-surface">
            <div className="sv-surface-label"><span className="is-pill">1</span><span>The visitor</span><span className="is-sub">Reads the page</span></div>
            <div className="sv-window">
              <div className="sv-window-bar"><span className="v11-lights"><span /><span /><span /></span></div>
              <div className="sv-window-body" style={{ gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><i className="sk-bar is-ink" style={{ width: 56, height: 10 }} /><i className="sk-bar is-ind" style={{ width: 60, height: 20, borderRadius: 99 }} /></div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 24, lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Payroll for global teams, in one run.</div>
                <div style={{ fontSize: 13 }}>Pay employees and contractors in 100+ countries from one dashboard.</div>
                <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', height: 34, padding: '0 14px', borderRadius: 99, background: 'var(--ind)', color: '#fff', fontSize: 13, fontWeight: 500 }}>Book a demo</span>
                <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid #efeef5' }}>{[0, 1, 2, 3].map((k) => <i key={k} className="sk-bar" style={{ width: 44, height: 9, background: '#d9d7e6' }} />)}</div>
              </div>
            </div>
          </div>
          <div className="sv-surface">
            <div className="sv-surface-label"><span className="is-pill">2</span><span>The crawler</span><span className="is-sub">Reads the structure</span></div>
            <div className="sv-window">
              <div className="sv-window-bar"><span className="sk-mono" style={{ fontSize: 11.5 }}>view-source</span></div>
              <pre className="sv-window-body sk-mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7, whiteSpace: 'pre', color: '#4a4466' }}>{`<h1>Payroll for global teams,
    in one run.</h1>
<h2>How payroll works</h2>
<h2>Pricing</h2>
<h2>Questions</h2>
<script type="application/ld+json">
  { "@type": "FAQPage", … }
</script>`}</pre>
            </div>
          </div>
          <div className="sv-surface">
            <div className="sv-surface-label"><span className="is-pill">3</span><span>The AI engine</span><span className="is-sub">Lifts the answer</span></div>
            <div className="sv-window">
              <div className="sv-window-bar" style={{ gap: 8 }}><EngineIcon i={0} size={16} /><span>Answer</span></div>
              <div className="sv-window-body">
                <div className="sv-query">Which payroll tools handle contractors abroad?</div>
                <div className="sv-ans">It runs payroll for employees and contractors in 100+ countries from one dashboard <span className="sv-cite">1</span></div>
                <div className="sv-src"><span className="is-us"><i />yourcompany.com</span><span><i />review site</span></div>
              </div>
            </div>
          </div>
          <p className="sv-note" style={{ gridColumn: '1 / -1', marginTop: 0 }}>Illustration: one example page as each audience receives it.</p>
        </div>
      ),
    },
  };
};
