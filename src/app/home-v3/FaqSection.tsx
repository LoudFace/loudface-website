/**
 * FaqSection — "Before you book." A saturated focal panel (eyebrow, lead, CTA,
 * numbers) beside a native <details> accordion. The v3 design is bespoke, so
 * this keeps its own markup rather than reusing the shared FAQ component.
 */
const STATS = [
  { b: '200+', s: 'Projects completed' },
  { b: '288%', s: 'Increase in conversions, Dimer Health' },
  { b: '4+', s: 'Years as Webflow Enterprise Partner' },
  { b: '4–6 wks', s: 'Average time to launch' },
];

const FAQS = [
  {
    q: 'What types of companies do you work with?',
    a: 'B2B SaaS companies, primarily Series A and later. Our clients typically have a product in market, a marketing team (even if it’s one person), and a website that isn’t pulling its weight. We’ve worked across verticals — fintech, healthtech, devtools, HR tech, cybersecurity — but the common thread is always B2B SaaS.',
    open: true,
  },
  {
    q: 'Why Webflow instead of a custom-coded site?',
    a: 'Speed and independence. Webflow lets us ship a production-quality site in weeks instead of months, and your marketing team can update pages, publish content, and launch campaigns without filing engineering tickets. For most B2B SaaS companies under $100M ARR, a custom-coded marketing site is overkill, and the maintenance cost chips away at budget every quarter.',
  },
  {
    q: 'Do we have to sign up for growth services, or can we just get a website?',
    a: 'You can start with a website build only. Most of our clients do. About 70% of them add SEO and CRO within the first three months after launch, because by then they’ve seen the site perform and want to push it further. But there’s no obligation and no bait-and-switch.',
  },
  {
    q: 'How long does a website project take?',
    a: 'Most builds go from kickoff to launch in 4-6 weeks. That includes strategy, copywriting, design, and Webflow development. Larger projects with complex CMS structures or multiple product lines can take 8-10 weeks. We’ll give you a specific timeline in the scoping call before you commit to anything.',
  },
  {
    q: 'What does the growth engagement look like month to month?',
    a: 'We run SEO (technical and content), AEO (AI search optimization), and CRO (conversion experiments) on a monthly retainer. You get a dedicated team, weekly async updates, and a monthly performance review. We track organic traffic, keyword rankings, conversion rates, and qualified leads. Minimum engagement is three months — SEO needs at least that long to show meaningful results.',
  },
  {
    q: 'We already have a website. Can you optimize it without rebuilding?',
    a: 'Sometimes. If your current site is on Webflow or a platform we can work with efficiently, we can run SEO and CRO on what you have. If the site itself is the bottleneck — slow, hard to update, poorly structured for search — we’ll tell you that honestly. We won’t spend six months optimizing a site that needs to be rebuilt.',
  },
];

export function FaqSection() {
  return (
    <section className="faq">
      <div className="container faq-grid">
        <div className="faq-panel rv">
          <span className="eyebrow glass"><i aria-hidden="true"></i>FAQ</span>
          <h2 className="sec">Before you book.</h2>
          <p className="faq-lead">
            Straight answers to the questions every B2B SaaS team asks us. Everything else, bring to the call.
          </p>
          <div className="faq-cta">
            <a href="#book" data-cal-trigger="" className="btn btn-white btn-lg">Book a strategy call</a>
            <span className="slots"><i className="dot"></i>2h response time</span>
          </div>
          <div className="fstats" aria-label="LoudFace in numbers">
            {STATS.map((st) => (
              <div className="fstat" key={st.b}>
                <b>{st.b}</b>
                <span>{st.s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="faq-list rv" style={{ transitionDelay: '.1s' }}>
          {FAQS.map((f, i) => (
            <details className="qa" key={i} open={f.open || undefined}>
              <summary>
                {f.q}
                <span className="x" aria-hidden="true"></span>
              </summary>
              <p className="a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
