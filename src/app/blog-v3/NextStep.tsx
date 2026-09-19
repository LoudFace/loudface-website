/**
 * NextStep — compact in-body CTA for buyer-intent posts (agency, pricing,
 * comparison pieces). Renders after the body, before the FAQ, only for
 * slugs in buyer-intent-slugs.ts. A smaller variant of CoverCTA: same dark
 * card treatment (--night tokens), same .btn button component, no new
 * visual language. Server-rendered, no client state.
 */
export function NextStep() {
  return (
    <section className="next-step">
      <div className="container">
        <div className="next-step-card">
          <h2 className="next-step-h">Next step</h2>
          <p>See where your brand stands in AI answers before you shortlist anyone.</p>
          <div className="next-step-cta">
            <a href="/ai-audit" className="btn btn-white btn-pill">Get your free AI visibility audit</a>
            <a href="/pricing" className="next-step-link">or see plans and pricing</a>
          </div>
        </div>
      </div>
    </section>
  );
}
