import Link from 'next/link';

/** Values (A) — oversized statement on crisp white: "We build the site. Then we grow it." */
export function Values() {
  return (
    <section className="a-values">
      <div className="container">
        <h2 className="a-giant rv">
          We build the site.<span>Then we grow it.</span>
        </h2>
        <div className="a-vgrid rv" style={{ ['--d' as string]: '.1s' }}>
          <div className="a-vcell">
            <p className="a-vlabel">Build</p>
            <p>
              Positioning, copy, design, and code: shipped as one piece of work, on{' '}
              <Link href="/services/webflow">Webflow</Link>.
            </p>
          </div>
          <div className="a-vcell">
            <p className="a-vlabel">Grow</p>
            <p>
              SEO, conversion optimization, and{' '}
              <Link href="/services/geo">AI-search visibility</Link>, run month after month.
            </p>
          </div>
          <div className="a-vcell">
            <p className="a-vlabel">One team</p>
            <p>Seven people, no account layers. You work directly with the experts doing the work.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
