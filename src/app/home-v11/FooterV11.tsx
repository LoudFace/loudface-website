import type { ReactNode } from 'react';
import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { Rating } from './Testimonials';
import { LfMark, img } from './ui';

const FLAG_UAE = (
  <svg width="22" height="15" viewBox="0 0 22 15" className="v11-flag" role="img" aria-label="United Arab Emirates">
    <rect width="22" height="5" fill="#00732f" /><rect y="5" width="22" height="5" fill="#ffffff" /><rect y="10" width="22" height="5" fill="#000000" /><rect width="6" height="15" fill="#ff0000" />
  </svg>
);
const FLAG_US = (
  <svg width="22" height="15" viewBox="0 0 22 15" className="v11-flag" role="img" aria-label="United States">
    {Array.from({ length: 13 }, (_, i) => <rect key={i} y={(i * 15) / 13} width="22" height={15 / 13} fill={i % 2 ? '#ffffff' : '#b22234'} />)}
    <rect width="9.5" height="8.1" fill="#3c3b6e" />
    {[1, 2.5, 4, 5.5, 7].flatMap((cy, r) =>
      (r % 2 ? [2.1, 3.9, 5.7, 7.5] : [1.2, 3, 4.8, 6.6, 8.4]).map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.42" fill="#ffffff" />),
    )}
  </svg>
);
const FLAGS = [FLAG_UAE, FLAG_US];

/** Link targets per footer column, in the content file's order. A null opens the booking modal. */
const HREFS: (string | null)[][] = [
  ['/services/geo-agency', '/services/seo-aeo', '/services/webflow', '/services/ux-ui-design', '/services/cro'],
  ['/case-studies', '/methodology', '/about', '/pricing', '/blog', '/careers'],
  [null, 'mailto:hello@loudface.co', 'https://www.linkedin.com/company/loudface/', 'https://x.com/meetloudface'],
];

function FooterLink({ href, children }: { href: string | null; children: ReactNode }) {
  if (href === null) return <a href="#book-modal" data-cal-trigger="">{children}</a>;
  if (href.startsWith('/')) return <Link href={href}>{children}</Link>;
  return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>;
}

export function FooterV11({ c, ratings }: { c: HomeV11Content['footer']; ratings: HomeV11Content['testimonials']['ratings'] }) {
  return (
    <footer className="v11-footer">
      <div className="v11-wrap">
        <div className="v11-footer-top">
          <div className="v11-footer-brand">
            <div className="v11-footer-logo"><LfMark size={28} /><span>{c.brand}</span></div>
            <p>{c.blurb}</p>
            <div className="v11-footer-partner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img('logos/webflow-icon.png')} alt="" width={28} height={28} />
              <span>{c.partner}</span>
            </div>
            <div className="v11-offices">
              {c.offices.map((o, i) => (
                <div key={i} className="v11-office">
                  <div className="v11-office-city">{FLAGS[i]}<span>{o.city}</span></div>
                  <div className="v11-office-addr" dangerouslySetInnerHTML={{ __html: o.address }} />
                </div>
              ))}
            </div>
          </div>
          <div className="v11-footer-cols">
            {c.columns.map((col, i) => (
              <div key={i} className="v11-footer-col">
                <div className="is-head">{col.heading}</div>
                {col.links.map((l, j) => (
                  <FooterLink key={j} href={HREFS[i][j]}><span>{l}</span></FooterLink>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="v11-footer-base">
          <div className="v11-footer-ratings">
            {ratings.map((r, i) => <Rating key={i} r={{ platform: r.platform, score: r.score }} i={i} size="sm" />)}
          </div>
          <div className="v11-footer-legal">
            <span>{c.legal}</span> · <Link href="/privacy"><span>{c.privacy}</span></Link> · <Link href="/terms"><span>{c.terms}</span></Link> · <Link href="/cookies"><span>{c.cookies}</span></Link>
            {/* the attribution Isocons' licence asks for (the menus' isometric icons, 2026-09-27) */}
            <span className="v11-footer-credit">
              <a href="https://www.isocons.app/" rel="noopener"><span>{c.iconCredit}</span></a> (<a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener license"><span>{c.iconLicence}</span></a>), <span>{c.iconChange}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="v11-footer-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img('wordmark-white.svg')} alt="LoudFace" className="v11-footer-wordmark" loading="lazy" />
      </div>
    </footer>
  );
}
