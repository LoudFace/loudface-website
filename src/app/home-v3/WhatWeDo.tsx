/**
 * WhatWeDo — the "one partner from launch to growth" section: two phase panels
 * (Build / Grow) staged on the white ground. Panels map from PHASES.
 */
const PHASES = [
  {
    kind: 'grow',
    phase: 'Core program',
    word: 'Grow',
    body: 'We run GEO, SEO, AEO, content, and conversion work to get B2B SaaS companies discovered across Google and AI search. We turn that visibility into customers.',
    detail: 'The program starts with the surface that has the clearest route to customers.',
    caps: ['Generative Engine Optimization', 'Technical SEO', 'AI Search Optimization (AEO)', 'Content Strategy', 'Conversion Rate Optimization'],
    delay: undefined as string | undefined,
  },
  {
    kind: 'build',
    phase: 'When needed',
    word: 'Deliver',
    body: 'When the audit finds a conversion or implementation gap, we fix it across your stack. That can mean positioning, copy, UX/UI, Webflow, or another delivery path.',
    detail: 'Delivery work supports the organic growth program. It does not define it.',
    caps: ['Conversion Copywriting', 'UX/UI Design', 'Webflow Development', 'CMS Architecture', 'Design System Setup'],
    delay: '.08s',
  },
];

export function WhatWeDo() {
  return (
    <section className="tracks" id="tracks">
      <div className="container">
        <div className="sec-head rv">
          <div>
            <span className="eyebrow"><i aria-hidden="true"></i>What we do</span>
            <h2 className="sec">One growth system, across your stack</h2>
            <p className="sub">
              Organic growth and conversion work together. We start with the highest-impact surface, then fix what
              blocks discovery or customers.
            </p>
          </div>
        </div>
        <div className="tpanels">
          {PHASES.map((ph) => (
            <div key={ph.kind} className={`tpanel ${ph.kind} rv`} style={ph.delay ? { transitionDelay: ph.delay } : undefined}>
              <span className="tphase"><i aria-hidden="true"></i>{ph.phase}</span>
              <p className="tword">{ph.word}</p>
              <p className="tbody">{ph.body}</p>
              <p className="tdetail">{ph.detail}</p>
              <ul className="caps">
                {ph.caps.map((c) => <li key={c} className="cap">{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="tconnect rv" style={{ transitionDelay: '.14s' }}>
          <span className="rule" aria-hidden="true"></span>
          <p>The audit sets the starting point. It may be visibility, content, conversion, or implementation.</p>
        </div>
      </div>
    </section>
  );
}
