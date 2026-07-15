/**
 * CoverCTADetail — the closing cover-stack CTA (server component). Copy is
 * lightly personalized with the client name where present; the booking button
 * routes through the shared Cal.com handler via data-cal-trigger.
 */
const ArrowIcon = () => (
  <svg className="arrow" width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
    <path d="M9 1l5 5-5 5M14 6H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CoverCTADetail({ clientName }: { clientName?: string }) {
  return (
    <section className="cta" aria-label="Book a call">
      <div className="container-wide">
        <div className="cta-meta">
          <span className="label">LoudFace &middot; intro call</span>
          <span className="label">B2B SaaS &amp; fintech only</span>
        </div>
        <div className="cta-in">
          <div className="cta-copy">
            <h2>
              Want results <span className="hl">{clientName ? `like ${clientName}'s?` : 'like these?'}</span>
              <br />
              Let&rsquo;s build your pipeline.
            </h2>
            <p>A 30-minute intro call on where your category&rsquo;s growth is going, and how to become the brand it names.</p>
            <div className="cta-actions">
              <button type="button" className="btn btn-light" data-cal-trigger>
                Book an intro call <ArrowIcon />
              </button>
              <span className="slots">2h response time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
