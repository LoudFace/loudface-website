import Image from 'next/image';
import Link from 'next/link';
import type { HomeImages } from './data';

/**
 * SelectedWork — the "case grid / shelves" bento of client tiles. Each tile's
 * class pairs a SPAN (t-lg = 6 cols, t-md = 4) with a COLOUR field
 * (t-toku, t-delshad, …); data maps from TILES. Seven tiles lay out 2 / 3 / 2. Screenshots come from Sanity by slug (images prop) with a hardcoded
 * CDN fallback; metric strings + layout stay curated.
 *
 * Metric strings match the hero marquee pill for the same client (2026-09-01),
 * so one client never carries two different headline numbers on one page.
 * Genie Teacher and Delshad Legal used to quote "5x organic impressions" and
 * "+54% Google clicks" — both still true in Sanity, both superseded by the
 * AI share-of-voice figure the studies now lead with.
 *
 * One hard rule when editing these: never print a number that contradicts a
 * DIFFERENT value of the SAME metric printed inside the tile's own composite.
 * The crop is 1.6 ratio against a 1.6 source, so the tile shows the whole
 * artwork, numbers included.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

type Tile = {
  slug: string;
  cls: string;
  domain: string;
  asset: string;
  crop: string;
  w: number;
  h: number;
  alt: string;
  metric: string;
  client: string;
  delay?: string;
};

const TILES: Tile[] = [
  // Row 1 — the two strongest AI-search results, on the wide tiles.
  { slug: 'toku-ai-cited-pipeline', cls: 't-lg t-toku', domain: 'toku.com', asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Toku AI search visibility case study by LoudFace', metric: '0 \u2192 97.8% AI visibility', client: 'Toku' },
  { slug: 'delshad-legal-content-engine', cls: 't-lg t-delshad', domain: 'delshadlegal.com', asset: 'dcf12e21516b5edbe76587b2b38710d17e2d431e-2880x1800.png', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Delshad Legal content engine case study by LoudFace', metric: '32.7% AI share of voice', client: 'Delshad Legal', delay: '.08s' },
  // Row 2 — three medium tiles.
  { slug: 'genie-teacher-organic-growth', cls: 't-md t-genie', domain: 'genieteacher.com', asset: '21db9f63b8c898d5ac57015bd2617156ad61091b-2880x1800.png', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Genie Teacher organic visibility case study by LoudFace', metric: '12.9% AI share of voice', client: 'Genie Teacher' },
  { slug: 'trademomentum-niche-aeo-organic-growth', cls: 't-md t-tm', domain: 'trademomentum.org', asset: '3d31a25d5ec584328e198c4617f7e9fd7f3ccaed-2880x1800.png', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'TradeMomentum organic growth case study by LoudFace', metric: '11.7x organic impressions', client: 'TradeMomentum', delay: '.08s' },
  { slug: 'stealth-fintech-ai-visibility', cls: 't-md t-stealth', domain: 'under NDA', asset: 'bbb33c1a5f465dd585e93ea11d0a6963f9f82870-2880x1800.png', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'Stealth fintech AI visibility case study by LoudFace', metric: '10.5% AI visibility', client: 'Stealth Fintech', delay: '.16s' },
  // Row 3 — the delivery and revenue proof, on the wide tiles.
  { slug: 'montblanc', cls: 't-lg t-montblanc', domain: 'montblanc.com', asset: 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Montblanc microsite built by LoudFace', metric: '5+ microsite pages launched', client: 'Montblanc' },
  { slug: 'outbound-specialist', cls: 't-lg t-outbound', domain: 'outboundspecialist.com', asset: 'd90a9cec8351f259afd300dcbc51641ed9b40c3d-1440x1845.webp', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Outbound Specialist website built by LoudFace', metric: '$200K sales in 30 days', client: 'Outbound Specialist', delay: '.08s' },
];

export function SelectedWork({ images }: { images?: HomeImages } = {}) {
  return (
    <section className="work" id="work">
      <div className="container">
        <div className="sec-head rv">
          <div>
            <span className="eyebrow"><i aria-hidden="true"></i>Selected work</span>
            <h2 className="sec">The work speaks. Specifically.</h2>
            <p className="sub">Named clients, measured results, live links. No case-study theater.</p>
          </div>
          <a href="/case-studies" className="pill-link">
            See all the work{' '}
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1.5 6.5h10M8 2.5l4 4-4 4" />
            </svg>
          </a>
        </div>
        <div className="bento">
          {TILES.map((t) => (
            <Link key={t.client} href={`/case-studies/${t.slug}`} className={`tile ${t.cls} rv`} style={t.delay ? { transitionDelay: t.delay } : undefined}>
              <div className="tile-frame">
                <div className="tile-bar" aria-hidden="true"><b></b><b></b><b></b><span>{t.domain}</span></div>
                <div className="tile-media">
                  {/* `sizes` always rounds UP: overestimating costs nothing (the
                      w=1280/1600 source caps the output, and next/image never
                      upscales), whereas underestimating would ship a blurry tile.
                      At ≤1080 the montblanc/liqid tiles go span-12 while t-sm goes
                      span-6, so 92vw covers the widest case for both. */}
                  <Image
                    src={(images?.[t.slug] ?? CDN + t.asset) + t.crop}
                    alt={t.alt}
                    width={t.w}
                    height={t.h}
                    sizes="(max-width:1080px) 92vw, 580px"
                    quality={82}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="tile-foot">
                <span className="tag"><i></i><b>{t.metric}</b><span>{t.client}</span></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
