import Link from 'next/link';
import type { AboutValuesContent } from '@/lib/content-utils';

/** Values (A) — oversized statement on crisp white: "We build the site. Then we grow it." */
export function Values({ content }: { content: AboutValuesContent }) {
  return (
    <section className="a-values">
      <div className="container">
        <h2 className="a-giant rv">
          {content.headline}<span>{content.headlineHighlight}</span>
        </h2>
        <div className="a-vgrid rv" style={{ ['--d' as string]: '.1s' }}>
          <div className="a-vcell">
            <p className="a-vlabel">{content.build.label}</p>
            <p>
              {content.build.prefix}
              <Link href="/services/webflow">{content.build.linkText}</Link>
              {content.build.suffix}
            </p>
          </div>
          <div className="a-vcell">
            <p className="a-vlabel">{content.grow.label}</p>
            <p>
              {content.grow.prefix}
              <Link href="/services/geo-agency">{content.grow.linkText}</Link>
              {content.grow.suffix}
            </p>
          </div>
          <div className="a-vcell">
            <p className="a-vlabel">{content.oneTeam.label}</p>
            <p>{content.oneTeam.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
