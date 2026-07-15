/**
 * FAQ — B's design (deep focal panel + light native-<details> accordion) with
 * A's panel copy + Q&A. Native <details> needs no client JS, so this stays a
 * server component. The "Team members" stat is derived from the live CMS count.
 */
const FAQS: { q: string; a: string; open?: boolean }[] = [
  {
    q: 'What services do you offer?',
    a: 'We specialize in full-service digital marketing, with a focus on Webflow development, SEO, and conversion rate optimization. Our expertise includes custom website design and development, comprehensive SEO strategies, landing page optimization, and ongoing marketing consultation.',
    open: true,
  },
  {
    q: 'Who do you work with?',
    a: 'We primarily work with B2B companies looking to improve their digital presence and conversion rates. Our clients range from funded startups to established enterprises across various industries including SaaS, professional services, and technology.',
  },
  {
    q: 'Why do you specialize in Webflow?',
    a: 'Webflow offers the perfect balance of design flexibility and development efficiency. It allows us to create custom, high-performance websites without the limitations of traditional CMS platforms, while still giving clients the ability to manage their content easily.',
  },
  {
    q: 'Where is LoudFace based?',
    a: "We're a fully remote team with members across different time zones. This allows us to work efficiently with clients globally while maintaining excellent communication and project delivery.",
  },
  {
    q: 'How do I get started?',
    a: "The best way to get started is to book an intro call with our team. During this call, we'll discuss your goals, current challenges, and how we can help. No obligation - just a conversation to see if we're a good fit.",
  },
  {
    q: 'What is your pricing?',
    a: "Our pricing varies based on project scope and requirements. We offer both project-based and retainer arrangements. During our initial call, we'll discuss your needs and provide a custom quote tailored to your specific goals and budget.",
  },
];

// Strip any markup before it lands in JSON-LD (answers are plain text today, but this
// keeps the schema safe if a future edit slips in a <br> or similar).
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function Faq({ teamCount }: { teamCount: number }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(f.a),
      },
    })),
  };

  return (
    <section className="faq">
      {/* FAQPage Structured Data — native script for SSR visibility to crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container faq-grid">
        <aside className="faq-panel rv" aria-label="Frequently asked questions summary">
          <h3>Still weighing it up?</h3>
          <p className="pl">
            We&rsquo;re here to help with anything you&rsquo;re still weighing up. No obligation,
            just a conversation to see if we&rsquo;re a good fit.
          </p>
          <a className="btn btn-pill btn-white btn-md" href="#book" data-cal-trigger="">
            Book a strategy call
          </a>
          <div className="fstats">
            <div className="fstat">
              <b className="tab">100+</b>
              <span>Companies served</span>
            </div>
            <div className="fstat">
              <b className="tab">7+</b>
              <span>Years on Webflow</span>
            </div>
            <div className="fstat">
              <b className="tab">{teamCount}</b>
              <span>Team members</span>
            </div>
            <div className="fstat">
              <b className="tab">288%</b>
              <span>Conversion lift, Dimer Health</span>
            </div>
          </div>
        </aside>

        <div className="acc rv" style={{ ['--d' as string]: '.08s' }}>
          {FAQS.map((f) => (
            <details key={f.q} open={f.open || undefined}>
              <summary>
                {f.q}
                <span className="mk" aria-hidden="true"></span>
              </summary>
              <p className="ans">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
