/**
 * WhatWeDo — the "one partner from launch to growth" section: two phase panels
 * (Build / Grow) staged on the white ground. Panels map from PHASES.
 */
const PHASES = [
  {
    kind: 'build',
    phase: 'Phase one',
    word: 'Build',
    body: 'We design and build B2B SaaS sites on Webflow — positioning, copy, UX, UI, production code. You get a site your marketing team can run without filing a single engineering ticket, built to convert the traffic we’re about to send it.',
    detail: 'Shipped in weeks, not quarters. Your team gets full CMS control from day one.',
    caps: ['UX/UI Design', 'Webflow Development', 'Conversion Copywriting', 'CMS Architecture', 'Design System Setup'],
    delay: undefined as string | undefined,
  },
  {
    kind: 'grow',
    phase: 'Phase two',
    word: 'Grow',
    body: 'After launch, we stay. SEO and AEO bring in traffic from search engines and AI answers; CRO makes sure that traffic converts. You get a team that knows the site inside out — because we’re the ones who built it.',
    detail: 'No onboarding lag. No “getting up to speed.” We’re already there.',
    caps: ['Technical SEO', 'AI Search Optimization (AEO)', 'Content Strategy', 'Conversion Rate Optimization', 'Performance Analytics'],
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
            <h2 className="sec">One partner from launch to growth</h2>
            <p className="sub">
              Most agencies hand you a website and move on. Most SEO shops inherit someone else’s mess and work around
              it. We do both — so the growth work isn’t fighting the build, it’s built on it.
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
          <p>Most of our clients start with a build. Within three months, they ask us to handle growth too. That’s by design.</p>
        </div>
      </div>
    </section>
  );
}
