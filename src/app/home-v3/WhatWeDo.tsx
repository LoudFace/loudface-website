import type { HomeV3WhatWeDoContent } from '@/lib/content-utils';

/**
 * WhatWeDo — the "one partner from launch to growth" section: two phase panels
 * (Build / Grow) staged on the white ground. Panels map from PHASE_LAYOUT,
 * merged by index with content.phases (src/data/content/homepage-v3.json).
 */
const PHASE_LAYOUT = [
  { kind: 'grow', delay: undefined as string | undefined },
  { kind: 'build', delay: '.08s' },
];

export function WhatWeDo({ content }: { content: HomeV3WhatWeDoContent }) {
  return (
    <section className="tracks" id="tracks">
      <div className="container">
        <div className="sec-head rv">
          <div>
            <span className="eyebrow"><i aria-hidden="true"></i>{content.eyebrow}</span>
            <h2 className="sec">{content.headline}</h2>
            <p className="sub">
              {content.sub}
            </p>
          </div>
        </div>
        <div className="tpanels">
          {PHASE_LAYOUT.map((layout, i) => {
            const ph = content.phases[i];
            return (
              <div key={layout.kind} className={`tpanel ${layout.kind} rv`} style={layout.delay ? { transitionDelay: layout.delay } : undefined}>
                <span className="tphase"><i aria-hidden="true"></i>{ph.phase}</span>
                <p className="tword">{ph.word}</p>
                <p className="tbody">{ph.body}</p>
                <p className="tdetail">{ph.detail}</p>
                <ul className="caps">
                  {ph.capabilities.map((c) => <li key={c.label} className="cap">{c.label}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="tconnect rv" style={{ transitionDelay: '.14s' }}>
          <span className="rule" aria-hidden="true"></span>
          <p>{content.connectText}</p>
        </div>
      </div>
    </section>
  );
}
