import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { ArrowUpRight, img } from './ui';

/**
 * Ten client logos on one uniform grid, each in its brand colour (from the client's Sanity record) at a matched
 * optical size. Every one links to its case study; a small quiet label in the corner says so and wakes on hover.
 */
/** Also read by the Industries menu (NavV11.tsx), which shows six of them at these sizes. */
export const CLIENT_LOGOS: { href: string; logo: string | null; w: number; h: number; alt: string }[] = [
  { href: '/case-studies/toku-ai-cited-pipeline', logo: 'logos/color-toku.png', w: 68, h: 22, alt: 'Toku' },
  { href: '/case-studies/genie-teacher-organic-growth', logo: null, w: 24, h: 24, alt: 'Genie Teacher' },
  { href: '/case-studies/dimer-health', logo: 'logos/color-dimer.png', w: 82, h: 28, alt: 'Dimer Health' },
  { href: '/case-studies/outbound-specialist', logo: 'logos/color-outbound.png', w: 75, h: 30, alt: 'Outbound Specialist' },
  { href: '/case-studies/ceipal-wp-to-wf-migration', logo: 'logos/color-ceipal.png', w: 79, h: 26, alt: 'Ceipal' },
  { href: '/case-studies/montblanc', logo: 'logos/color-montblanc.png', w: 115, h: 16, alt: 'Montblanc' },
  { href: '/case-studies/radisson-hotels-group', logo: 'logos/color-radisson.png', w: 91, h: 22, alt: 'Radisson Hotels Group' },
  { href: '/case-studies/hoxhunt', logo: 'logos/color-hoxhunt.png', w: 95, h: 20, alt: 'Hoxhunt' },
  { href: '/case-studies/liqid', logo: 'logos/color-liqid.png', w: 67, h: 22, alt: 'LIQID' },
  { href: '/case-studies/eraser', logo: 'logos/color-eraser.png', w: 109, h: 16, alt: 'Eraser' },
];

export function LogoGrid({ c }: { c: HomeV11Content['logos'] }) {
  return (
    <section className="v11-logos">
      <div className="v11-wrap v11-logos-inner">
        <div className="v11-logos-label">
          <h2 className="v11-logos-kicker">{c.label}</h2>
          <div className="v11-logos-count">{c.count}</div>
          <p>{c.body}</p>
        </div>
        <div className="v11-logos-grid">
          {CLIENT_LOGOS.map((l) => (
            <Link key={l.href} href={l.href} className="v11-logo-cell" aria-label={`${l.alt} case study`}>
              <span className="v11-logo-tag" aria-hidden="true"><span>{c.tag}</span><ArrowUpRight /></span>
              {l.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img(l.logo)} alt="" width={l.w} height={l.h} style={{ width: l.w, height: l.h }} />
              ) : (
                <span className="v11-logo-genie">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img('logos/genie-icon.png')} alt="" width={24} height={24} className="v11-case-icon" />
                  <span>{c.genie}</span>
                </span>
              )}
            </Link>
          ))}
          <div className="v11-logos-lines" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => <span key={`v${i}`} className="is-v" style={{ left: `${i * 20}%` }} />)}
            {['0%', '50%', '100%'].map((y) => <span key={`h${y}`} className="is-h" style={{ top: y }} />)}
            {[0, 1, 2, 3, 4, 5].flatMap((i) =>
              ['0%', '50%', '100%'].map((y) => <span key={`m${i}${y}`} className="is-m" style={{ left: `${i * 20}%`, top: y }} />),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
