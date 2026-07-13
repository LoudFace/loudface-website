/**
 * HowItWorks — light two-column section: reading column (H2 + lede + Cal CTA)
 * beside the blueprint stepper plate. Each step carries a small blueprint-style
 * SVG figure (Satoshi uppercase labels, marching-ants flow line, one flickering
 * live node).
 */
const d = (v: string) => ({ ['--d' as string]: v });

export function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="container how-grid">
        <div className="how-head rv">
          <h2 className="display">
            From intro call to shipping, <span className="ghost">in four moves.</span>
          </h2>
          <p className="lede">
            No lengthy onboarding, no bloated statements of work. We learn the gap, scope the first
            initiatives, and start shipping on a weekly cadence.
          </p>
          <div className="how-cta">
            <a className="btn btn-ink btn-md btn-pill" href="#book-modal" data-cal-trigger="">
              Book an intro call
            </a>
            <span className="slots">
              <i className="dot"></i>2h response time, every tier
            </span>
          </div>
        </div>
        <div className="steps rv" style={d('.08s')} aria-label="How it works, four steps">
          <div className="step">
            <div className="step-tick">
              <i></i>
              <b className="tab">
                01<em>/04</em>
              </b>
            </div>
            <div className="step-body">
              <h3>Intro call</h3>
              <p>
                30 minutes. We learn your goals, current setup, and the gap. We recommend the right
                tier.
              </p>
            </div>
            <div className="step-fig" role="img" aria-label="Diagram: your goals mapped to the right tier">
              <svg viewBox="0 0 150 62" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="18" width="52" height="26" rx="5" fill="none" stroke="#4f46e5" strokeOpacity=".4" />
                <text x="28" y="34" textAnchor="middle" className="tk">GOALS</text>
                <line className="ants" x1="56" y1="31" x2="92" y2="31" stroke="#4f46e5" strokeOpacity=".55" />
                <circle className="flick" cx="74" cy="31" r="2.6" fill="#4f46e5" />
                <rect x="94" y="18" width="54" height="26" rx="5" fill="#4f46e5" fillOpacity=".08" stroke="#4f46e5" strokeOpacity=".4" />
                <text x="121" y="34" textAnchor="middle" className="tk">TIER</text>
              </svg>
            </div>
          </div>
          <div className="step">
            <div className="step-tick">
              <i></i>
              <b className="tab">
                02<em>/04</em>
              </b>
            </div>
            <div className="step-body">
              <h3>Scoping &amp; proposal</h3>
              <p>
                We map out the first initiatives, define success metrics, and send a fixed monthly
                proposal.
              </p>
            </div>
            <div className="step-fig" role="img" aria-label="Diagram: initiatives compiled into a fixed monthly proposal">
              <svg viewBox="0 0 150 62" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="60" height="13" rx="3" fill="none" stroke="#4f46e5" strokeOpacity=".35" />
                <rect x="2" y="24" width="60" height="13" rx="3" fill="none" stroke="#4f46e5" strokeOpacity=".35" />
                <rect x="2" y="42" width="44" height="13" rx="3" fill="none" stroke="#4f46e5" strokeOpacity=".35" />
                <line className="ants" x1="68" y1="31" x2="92" y2="31" stroke="#4f46e5" strokeOpacity=".5" />
                <rect x="94" y="16" width="54" height="30" rx="5" fill="#4f46e5" fillOpacity=".08" stroke="#4f46e5" strokeOpacity=".4" />
                <text x="121" y="29" textAnchor="middle" className="tk">FIXED</text>
                <text x="121" y="40" textAnchor="middle" className="tk">MONTHLY</text>
              </svg>
            </div>
          </div>
          <div className="step">
            <div className="step-tick">
              <i></i>
              <b className="tab">
                03<em>/04</em>
              </b>
            </div>
            <div className="step-body">
              <h3>Kickoff</h3>
              <p>Access setup, Scoreboard live, first initiative briefed. You meet your delivery team.</p>
            </div>
            <div className="step-fig" role="img" aria-label="Diagram: Scoreboard goes live at kickoff">
              <svg viewBox="0 0 150 62" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="6" width="102" height="50" rx="6" fill="none" stroke="#4f46e5" strokeOpacity=".4" />
                <line x1="24" y1="22" x2="126" y2="22" stroke="#4f46e5" strokeOpacity=".3" />
                <circle className="flick" cx="33" cy="14" r="2.6" fill="#4f46e5" />
                <text x="41" y="17" className="tk">SCOREBOARD</text>
                <rect x="32" y="30" width="52" height="7" rx="2" fill="#4f46e5" fillOpacity=".18" />
                <rect x="32" y="43" width="72" height="7" rx="2" fill="#4f46e5" fillOpacity=".1" />
              </svg>
            </div>
          </div>
          <div className="step">
            <div className="step-tick">
              <i></i>
              <b className="tab">
                04<em>/04</em>
              </b>
            </div>
            <div className="step-body">
              <h3>We ship, weekly</h3>
              <p>Showcases land in your inbox. Work flows on cadence. You approve, we ship, repeat.</p>
            </div>
            <div className="step-fig" role="img" aria-label="Diagram: weekly showcase, approve, ship loop">
              <svg viewBox="0 0 150 62" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="20" width="38" height="22" rx="4" fill="#4f46e5" fillOpacity=".08" stroke="#4f46e5" strokeOpacity=".4" />
                <rect x="56" y="20" width="38" height="22" rx="4" fill="none" stroke="#4f46e5" strokeOpacity=".4" />
                <rect x="110" y="20" width="38" height="22" rx="4" fill="none" stroke="#4f46e5" strokeOpacity=".4" />
                <line className="ants" x1="42" y1="31" x2="54" y2="31" stroke="#4f46e5" strokeOpacity=".55" />
                <line className="ants" x1="96" y1="31" x2="108" y2="31" stroke="#4f46e5" strokeOpacity=".55" />
                <text x="21" y="34" textAnchor="middle" className="tk">WK 01</text>
                <text x="75" y="34" textAnchor="middle" className="tk">WK 02</text>
                <text x="129" y="34" textAnchor="middle" className="tk">WK 03</text>
                <circle className="flick" cx="21" cy="13" r="2.6" fill="#4f46e5" />
                <text x="28" y="16">SHIPPED</text>
              </svg>
            </div>
          </div>
          <div className="steps-cap">[ Fixed monthly &middot; async by default &middot; 2h response ]</div>
        </div>
      </div>
    </section>
  );
}
