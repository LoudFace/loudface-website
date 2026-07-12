/**
 * HeroPricing — deep night stage where the 3 Autopilot tier cards ARE the hero
 * objects (white featured Dual between two glass cards). The $5k/mo anchor pill
 * is the hero's only CTA-equivalent (scroll-links to #compare); the tier CTAs
 * open the Cal modal. The shared (site) Header renders its transparent
 * dark-variant bar over this stage — this section carries NO nav of its own.
 */
interface Tier {
  name: string;
  tag: string;
  desc: string;
  feats: string[];
  hint?: string;
  featured?: boolean;
  delay: string;
}

const TIERS: Tier[] = [
  {
    name: 'Solo Autopilot',
    tag: 'One focused track. Full ownership.',
    desc: 'For teams that need a single, dedicated workstream executed end-to-end without the overhead of managing it.',
    feats: [
      '1 active initiative at a time',
      'Weekly showcase to review progress',
      'Weekly maintenance batch to keep things tight',
      'Choose one track: Build or Growth',
    ],
    hint: 'Move to Dual when you need both tracks running in parallel.',
    delay: '.16s',
  },
  {
    name: 'Dual Autopilot',
    tag: 'Two parallel tracks. Real momentum.',
    desc: 'For teams ready to ship site improvements and scale organic visibility at the same time. Build + Growth running simultaneously, with tighter feedback loops.',
    feats: [
      'Run Build + Growth at the same time',
      'Double the showcase and maintenance cadence',
      'Structured testing: we run growth experiments, measure results, and double down on what works',
    ],
    hint: 'Move to Scale when you need 3+ parallel initiatives or multi-stakeholder coordination.',
    featured: true,
    delay: '.1s',
  },
  {
    name: 'Scale Autopilot',
    tag: 'Multi-track. Maximum velocity.',
    desc: 'For companies that need full-spectrum execution across multiple workstreams: design, development, SEO, content, and experiments all moving simultaneously.',
    feats: [
      '3–4 concurrent initiatives instead of 2',
      'Rolling maintenance with priority handling, no batching delays',
      'Multi-stakeholder coordination for complex orgs',
      'Optional standups if your team prefers live sync',
    ],
    delay: '.22s',
  },
];

const d = (v: string) => ({ ['--d' as string]: v });

export function HeroPricing() {
  return (
    <section className="hero diag">
      <div className="container">
        <div className="hero-head">
          <span className="hero-eyebrow rv">
            <b>Pricing</b>
            <em>autopilot</em>
          </span>
          <h1 className="rv" style={d('.06s')}>
            We run your website and growth.
            <br />
            <span className="soft">You run your business.</span>
          </h1>
          <p className="hero-sub rv" style={d('.12s')} data-speakable>
            We embed into your team as your always-on web and growth partner, owning the roadmap,
            execution, and results so you don&rsquo;t have to.
          </p>
          <a className="hero-anchor rv" style={d('.18s')} href="#compare">
            <span className="lbl">Engagements start from</span>
            <span className="amt">
              $5k<em>/mo</em>
            </span>
            <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* the tier deck: the hero objects */}
        <div className="deck" role="list" aria-label="Autopilot plans">
          {TIERS.map((t) => (
            <article
              key={t.name}
              className={`tier rv${t.featured ? ' is-feat' : ''}`}
              style={d(t.delay)}
              role="listitem"
            >
              {t.featured && (
                <span className="tier-badge">
                  <i></i>Most Popular
                </span>
              )}
              <h2 className="tier-name">{t.name}</h2>
              <p className="tier-tag">{t.tag}</p>
              <p className="tier-desc">{t.desc}</p>
              <div className="tier-div" aria-hidden="true"></div>
              <ul className="tier-feat">
                {t.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="tier-hint">{t.hint ?? ' '}</p>
              <a
                className={`btn ${t.featured ? 'btn-brand' : 'btn-outline'} btn-md btn-full tier-cta`}
                style={t.featured ? undefined : { borderColor: 'rgba(255,255,255,.28)', color: '#fff' }}
                href="#book-modal"
                data-cal-trigger=""
              >
                Start with {t.name.split(' ')[0]}
              </a>
            </article>
          ))}
        </div>
        <p className="deck-note rv">
          Built for B2B SaaS, fintech, and funded companies (Series A&ndash;C) that need a web
          partner, <b>not a vendor.</b>
        </p>
      </div>
    </section>
  );
}
