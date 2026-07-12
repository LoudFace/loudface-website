/** ProcessSteps — "How an engagement works": four gates on one dashed runway. Maps STEPS. */
const STEPS = [
  {
    gate: 'Week 0',
    title: 'Strategy call',
    body: 'We talk for 30 minutes. You tell us what’s broken, what you’ve tried, and what good looks like. We tell you honestly whether we’re the right fit. If we are, we send a scope and timeline within 48 hours.',
    live: false,
    delay: undefined as string | undefined,
  },
  {
    gate: 'Weeks 1–4',
    title: 'Design and build',
    body: 'We handle positioning, copy, design, and Webflow development in parallel, not in sequence. You see working pages, not static mockups. Your team reviews in weekly syncs and has CMS access from week two.',
    live: false,
    delay: '.07s',
  },
  {
    gate: 'Weeks 4–6 · Live',
    title: 'Launch and measure',
    body: 'We launch, set up analytics, and establish baseline metrics. No vanity dashboards. We track the numbers that connect to pipeline: organic traffic, conversion rates, form submissions, and qualified lead volume.',
    live: true,
    delay: '.14s',
  },
  {
    gate: 'Month 3+',
    title: 'Grow and optimize',
    body: 'SEO, AEO, and CRO kick in. We publish content, optimize pages, and run conversion experiments. You get a monthly report with what we did, what moved, and what we’re doing next.',
    live: false,
    delay: '.21s',
  },
];

export function ProcessSteps() {
  return (
    <section className="process">
      <div className="container">
        <div className="sec-head rv" style={{ marginBottom: 0 }}>
          <div>
            <h2 className="sec">How an engagement works</h2>
            <p className="sub">No 47-slide proposals. No three-month discovery phases. Here’s what actually happens.</p>
          </div>
        </div>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.gate} className={`step${s.live ? ' live' : ''} rv`} style={s.delay ? { transitionDelay: s.delay } : undefined}>
              <span className="node" aria-hidden="true"></span>
              <span className="gate">{s.gate}</span>
              <article>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
