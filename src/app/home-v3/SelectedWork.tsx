import Image from 'next/image';
import type { HomeImages } from './data';

/**
 * SelectedWork — the "case grid / shelves" bento of client tiles. Each tile's
 * class (t-montblanc, t-sm t-hoxhunt, …) drives its bento span; data maps from
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
  { slug: 'liqid', cls: 't-liqid', domain: 'liqid.de', asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp', crop: '?w=1280&h=1000&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 1000, alt: 'LIQID website built by LoudFace', metric: '100+ pages launched', client: 'LIQID', delay: '.08s' },
  { slug: 'hoxhunt', cls: 't-sm t-hoxhunt', domain: 'hoxhunt.com', asset: '3ac92e2393c7a26dc96f737c27d7faf49fbe6243-1440x8455.jpg', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'Hoxhunt website built by LoudFace', metric: '20+ pages', client: 'Hoxhunt' },
  { slug: 'eraser', cls: 't-sm t-eraser', domain: 'eraser.io', asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp', crop: '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=82', w: 1280, h: 800, alt: 'Eraser website built by LoudFace', metric: '6+ pages', client: 'Eraser', delay: '.08s' },
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
            <article key={t.client} className={`tile ${t.cls} rv`} style={t.delay ? { transitionDelay: t.delay } : undefined}>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
