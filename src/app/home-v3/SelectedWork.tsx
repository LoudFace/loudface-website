import Image from 'next/image';
import Link from 'next/link';
import type { HomeImages } from './data';

/**
 * SelectedWork — the "case grid / shelves" bento of client tiles. Each tile's
 * class (t-montblanc, t-sm t-tm, …) drives its bento span; data maps from
 * TILES. Screenshots come from Sanity by slug (images prop) with a hardcoded
 * CDN fallback; metric strings + layout stay curated.
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
  { slug: 'montblanc', cls: 't-montblanc', domain: 'montblanc.com', asset: 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Montblanc microsite built by LoudFace', metric: '5+ microsite pages launched', client: 'Montblanc' },
  { slug: 'toku-ai-cited-pipeline', cls: 't-toku', domain: 'toku.com', asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Toku AI search visibility case study by LoudFace', metric: '0 → 97.8% AI visibility', client: 'Toku', delay: '.08s' },
  { slug: 'genie-teacher-organic-growth', cls: 't-genie', domain: 'genieteacher.com', asset: '21db9f63b8c898d5ac57015bd2617156ad61091b-2880x1800.png', crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1600, h: 1000, alt: 'Genie Teacher organic visibility case study by LoudFace', metric: '5x organic impressions', client: 'Genie Teacher', delay: '.16s' },
  { slug: 'trademomentum-niche-aeo-organic-growth', cls: 't-sm t-tm', domain: 'trademomentum.org', asset: '3d31a25d5ec584328e198c4617f7e9fd7f3ccaed-2880x1800.png', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'TradeMomentum organic growth case study by LoudFace', metric: '11.7x organic impressions', client: 'TradeMomentum' },
  { slug: 'delshad-legal-content-engine', cls: 't-sm t-delshad', domain: 'delshadlegal.com', asset: 'dcf12e21516b5edbe76587b2b38710d17e2d431e-2880x1800.png', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'Delshad Legal content engine case study by LoudFace', metric: '+54% Google clicks', client: 'Delshad Legal', delay: '.08s' },
  { slug: 'outbound-specialist', cls: 't-sm t-outbound', domain: 'outboundspecialist.com', asset: 'd90a9cec8351f259afd300dcbc51641ed9b40c3d-1440x1845.webp', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'Outbound Specialist website built by LoudFace', metric: '$200K sales in 30 days', client: 'Outbound Specialist', delay: '.16s' },
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
                    sizes="(max-width:1080px) 92vw, 640px"
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
