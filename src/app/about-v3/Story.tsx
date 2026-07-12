/**
 * Story (A) — "Straight from the founder." A light stage with:
 *  row 1: founder pull-quote + the blueprint plate (FIG.001 the leverage loop)
 *  row 2 (flipped): the saturated client-logo panel + "small startups to large
 *         enterprises" copy
 *  then: the real timeline strip.
 * The blueprint plate SVG is the canonical house recipe, ported verbatim.
 */
import { teamPhoto, type TeamPerson } from './data';

const SANITY_CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const logo = (asset: string, w: number) => `${SANITY_CDN}${asset}?w=${w}&fm=png&q=80`;

const CLIENT_LOGOS: { asset: string; alt: string; h: number }[] = [
  { asset: '7421bda16647889739dd725fe4967e45b42dd4c5-997x139.png', alt: 'Montblanc', h: 42 },
  { asset: '90fcd30f2058c1975d25c315ccef475997d07461-836x203.png', alt: 'Radisson', h: 73 },
  { asset: '2916b66c3352d3932990dd7b7052901ae1078d04-845x178.png', alt: 'Hoxhunt', h: 63 },
  { asset: 'bf5fa13f7566496f48caf6e20a73ca612ced0291-619x202.png', alt: 'LIQID', h: 98 },
  { asset: '86cefc1d66ac01f9a48a5722d54579ad638eb575-724x106.png', alt: 'Eraser', h: 44 },
  { asset: 'bdd109e13c67dad916c89a42c71d67c3ba0b217e-680x233.png', alt: 'Dimer Health', h: 103 },
  { asset: '5139fa977e892fe5854a9dea4976ce056fec88d5-820x269.png', alt: 'Ceipal', h: 98 },
  { asset: '57a1d5dd25daa13a34e0888331efd47c05cb7111-748x140.png', alt: 'Viaduct', h: 56 },
  { asset: '6a79052d6d3db7428b73436f15350c87e0cefa3b-339x109.png', alt: 'Toku', h: 96 },
];

export function Story({ team }: { team: TeamPerson[] }) {
  const founder = team.find((p) => p.slug === 'arnel-bukva') ?? team[0];

  return (
    <section className="a-story">
      <div className="container">
        <div className="a-srow">
          <div className="rv">
            <h2>Straight from the founder.</h2>
            <figure className="a-fnote">
              <svg className="a-fnote-q" viewBox="0 0 32 24" aria-hidden="true">
                <path d="M0 24V13.8C0 6 4.9.7 12.6 0l1 3.4C8.4 4.7 5.9 7.7 5.6 11.4h6.2V24H0Zm18 0V13.8C18 6 22.9.7 30.6 0l1 3.4c-5.2 1.3-7.7 4.3-8 8h6.2V24H18Z" />
              </svg>
              <blockquote>
                I started LoudFace chasing a hunch: that <em>design and numbers</em> belonged on
                the same team, not in separate agencies handing off a brief. Seven years later
                that&rsquo;s still the whole bet.
              </blockquote>
              <figcaption>
                {founder && (
                  <img src={teamPhoto(founder.photoBase, 96, 96)} width={44} height={44} alt="" />
                )}
                <span>
                  <b>Arnel Bukva</b>
                  <small>Founder &amp; Head of Growth</small>
                </span>
              </figcaption>
            </figure>
          </div>
          <figure
            className="a-plate a-s-media rv"
            style={{ ['--d' as string]: '.1s' }}
            role="img"
            aria-label="Diagram: the leverage loop — a Webflow site feeds SEO and AI-search traffic, which feeds the conversion pipeline, which compounds back into the site."
          >
            <span className="a-fig-id">FIG.001</span>
            <span className="a-fig-meta">[ THE LEVERAGE LOOP ]</span>
            <span className="a-fig-yr">[ 2026 ]</span>
            <svg viewBox="0 0 640 342" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker
                  id="fx-arr"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0.6 L7.4,4 L0,7.4 Z" fill="var(--primary-600)" />
                </marker>
              </defs>
              <text x="52" y="66" className="tk">The site</text>
              <text x="52" y="80" className="t9">Built on Webflow</text>
              <rect x="42" y="96" width="166" height="118" rx="1" fill="var(--primary-50)" stroke="var(--primary-600)" strokeWidth="1.5" />
              <rect x="42" y="96" width="166" height="18" rx="1" fill="var(--primary-100)" stroke="var(--primary-600)" strokeWidth="1" />
              <circle cx="52" cy="105" r="2" fill="var(--primary-400)" />
              <circle cx="60" cy="105" r="2" fill="var(--primary-300)" />
              <circle cx="68" cy="105" r="2" fill="var(--primary-300)" />
              <rect x="54" y="126" width="76" height="30" rx="1" fill="var(--primary-200)" />
              <rect x="54" y="164" width="140" height="4" rx="1" fill="var(--primary-200)" />
              <rect x="54" y="174" width="122" height="4" rx="1" fill="var(--primary-200)" />
              <rect x="54" y="184" width="132" height="4" rx="1" fill="var(--primary-200)" />
              <rect x="54" y="197" width="44" height="10" rx="1" fill="var(--primary-400)" />
              <rect x="140" y="126" width="54" height="30" rx="1" fill="none" stroke="var(--primary-600)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="212" y1="155" x2="252" y2="155" stroke="var(--primary-600)" strokeWidth="1.5" markerEnd="url(#fx-arr)" />
              <text x="268" y="66" className="tk">Traffic</text>
              <text x="268" y="80" className="t9">SEO + AI search</text>
              <polyline points="268,100 268,206 420,206" fill="none" stroke="var(--primary-600)" strokeWidth="1" />
              <line x1="268" y1="210" x2="420" y2="210" stroke="var(--primary-200)" strokeWidth="6" strokeDasharray="1 3" />
              <path d="M268,196 L300,190 L322,178 L348,166 L374,142 L404,118 L404,206 L268,206 Z" fill="var(--primary-100)" />
              <path d="M268,196 L300,190 L322,178 L348,166 L374,142 L404,118" fill="none" stroke="var(--primary-600)" strokeWidth="2" />
              <circle cx="404" cy="118" r="4" fill="var(--primary-400)" className="flick" />
              <line x1="264" y1="180" x2="268" y2="180" stroke="var(--primary-600)" strokeWidth="1" />
              <line x1="264" y1="140" x2="268" y2="140" stroke="var(--primary-600)" strokeWidth="1" />
              <text x="300" y="222" className="t9">Compounding, not bought</text>
              <line x1="424" y1="155" x2="464" y2="155" stroke="var(--primary-600)" strokeWidth="1.5" markerEnd="url(#fx-arr)" />
              <text x="474" y="66" className="tk">Pipeline</text>
              <text x="474" y="80" className="t9">CRO on every page</text>
              <rect x="474" y="100" width="126" height="24" rx="1" fill="var(--primary-100)" stroke="var(--primary-600)" strokeWidth="1" />
              <rect x="474" y="134" width="94" height="24" rx="1" fill="var(--primary-200)" stroke="var(--primary-600)" strokeWidth="1" />
              <rect x="474" y="168" width="62" height="24" rx="1" fill="var(--primary-400)" />
              <text x="608" y="116" className="t9" textAnchor="end">Visits</text>
              <text x="608" y="150" className="t9" textAnchor="end">Leads</text>
              <text x="608" y="184" className="t9" textAnchor="end">Deals</text>
              <path d="M536,200 C536,272 480,282 320,282 C180,282 125,272 125,222" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" className="ants" markerEnd="url(#fx-arr)" />
              <text x="320" y="302" textAnchor="middle" className="t9">Results compound month over month</text>
            </svg>
          </figure>
        </div>

        <div className="a-srow flip">
          <figure className="a-logo-panel a-s-media rv" style={{ ['--d' as string]: '.1s' }}>
            <h3>Hundreds of teams later.</h3>
            <p className="a-lp-sub">A few of the companies we&rsquo;ve built and grown for.</p>
            <div className="a-lp-grid">
              {CLIENT_LOGOS.map((l) => (
                <img key={l.alt} src={logo(l.asset, 300)} width={300} height={l.h} alt={l.alt} loading="lazy" />
              ))}
            </div>
          </figure>
          <div className="rv">
            <h2>From small startups to large enterprises.</h2>
            <p>
              We&rsquo;ve helped hundreds of businesses reach their online goals, each with
              different challenges and opportunities. Today we&rsquo;re a remote team of seven,
              based in Dubai, working with SaaS companies around the world.
            </p>
          </div>
        </div>

        <ol className="a-timeline rv" style={{ ['--d' as string]: '.06s' }}>
          <li>
            <b>2017</b>
            <span>Arnel starts LoudFace, betting on Webflow before most agencies had heard of it.</span>
          </li>
          <li>
            <b>2019</b>
            <span>First enterprise engagement. The design-plus-code model starts to prove itself at scale.</span>
          </li>
          <li>
            <b>2022</b>
            <span>SEO and conversion work folds into every build. Growth becomes the retainer, not an upsell.</span>
          </li>
          <li>
            <b>2024</b>
            <span>Team grows to six. Webflow names LoudFace an Enterprise Partner.</span>
          </li>
          <li>
            <b>2026</b>
            <span>AI-search visibility joins the stack. 200+ sites shipped, 100+ companies served.</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
