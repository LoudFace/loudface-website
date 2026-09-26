import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { LiveChart } from '../../../home-v11/LiveChart';
import { VideoStill } from '../../../home-v11/VideoStill';
import { Eyebrow, img } from '../../../home-v11/ui';

export const metadata: Metadata = { title: 'CRO sections preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

const Marks = () => (
  <>
    <i className="v11-m is-tl" aria-hidden="true" /><i className="v11-m is-tr" aria-hidden="true" />
    <i className="v11-m is-bl" aria-hidden="true" /><i className="v11-m is-br" aria-hidden="true" />
  </>
);
const Play = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7.2-4.8c.4-.3.4-1 0-1.3L6.2 2.6C5.7 2.3 5 2.6 5 3.2z" fill="#ffffff" /></svg>
);

/** Design exploration for the CRO page's two new sections, rendered with the real components so the
 * charts carry real data, then imported into the Paper board. Copy is the page's existing copy where it exists. */
export default async function CroSections() {
  const [c, data] = await Promise.all([getHomeV11Content(), getHomeV11Data()]);
  const slides = c.hero.slides;
  const del = slides[2], gl = slides[5];
  const maksim = c.testimonials.videos[0];
  const brand = c.testimonials.cards[2];
  const chart = (series: NonNullable<typeof data>['hero']['delshad'] | undefined, tip: string) =>
    series ? (
      <LiveChart series={series} height={170} margin={{ top: 22, right: 10, bottom: 6, left: 10 }} dots={false} hatch lineWidth={1.75} barGap={0.5} pin={20} end="plain" tip={tip} format="index" />
    ) : null;
  return (
    <div className="v11">
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="v11-head">
            <div><Eyebrow>Results</Eyebrow><h2 className="v11-h2">Traffic into <span className="ghost">revenue.</span></h2></div>
            <p style={{ width: 420 }}>Traffic without conversion is a vanity metric. We run CRO as a system: a prioritization framework, systematic testing, and wins that compound alongside your traffic.</p>
          </div>
          <div className="cro-grid">
            <div className="cro-cell is-video">
              <Marks />
              <div className="cro-video">
                <VideoStill still={img('video-maksim.jpg')} video="https://cdn.sanity.io/files/xjjjqhgt/proposals/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4" label="Play the video from Outbound Specialist">
                  <span className="v11-video-play"><span className="is-btn"><Play /></span><span className="is-dur">{maksim.duration}</span></span>
                </VideoStill>
              </div>
              <div className="cro-video-copy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img('logos/color-outbound.png')} alt="Outbound Specialist" width={75} height={30} />
                <div className="cro-big">$1M+</div>
                <div className="cro-cap">in sales from one landing page we designed</div>
                <p className="cro-quote">{maksim.quote}</p>
                <div className="cro-who"><span className="is-name">{maksim.person}</span><span>{maksim.jobTitle}</span></div>
              </div>
            </div>
            <div className="cro-cell">
              <Marks />
              <div className="cro-tag"><span className="is-tag">Conversion rate</span><span>· Dimer Health</span></div>
              <div className="cro-big is-ind">288%</div>
              <div className="cro-cap">Best conversion increase from a LoudFace program</div>
              <svg className="cro-bars" viewBox="0 0 300 150" aria-hidden="true">
                <defs><pattern id="cro-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="2" /></pattern></defs>
                <line x1="0" x2="300" y1="130" y2="130" stroke="#dcdbe6" />
                <rect x="40" y="97" width="80" height="33" rx="3" fill="#ecebf3" />
                <rect x="180" y="2" width="80" height="128" rx="3" fill="url(#cro-h)" stroke="#4f46e5" strokeWidth="1.5" />
                <text x="80" y="146" textAnchor="middle" className="is-axis">Before</text>
                <text x="220" y="146" textAnchor="middle" className="is-axis">After six months</text>
              </svg>
            </div>
            <div className="cro-cell">
              <Marks />
              <div className="cro-tag"><span className="is-tag">{del.tag}</span><span>· {del.client}</span></div>
              <div className="cro-big">{del.metric}</div>
              <div className="cro-cap">{del.caption}</div>
              <div className="cro-chart">{chart(data?.hero.delshad, del.tip)}</div>
              <div className="cro-dates"><span>{del.periodStart}</span><span>{del.periodEnd}</span></div>
            </div>
            <div className="cro-cell">
              <Marks />
              <div className="cro-tag"><span className="is-tag">{gl.tag}</span><span>· {gl.client}</span></div>
              <div className="cro-big">{gl.metric}</div>
              <div className="cro-cap">{gl.caption}</div>
              <div className="cro-chart">{chart(data?.hero.genieLeads, gl.tip)}</div>
              <div className="cro-dates"><span>{gl.periodStart}</span><span>{gl.periodEnd}</span></div>
            </div>
            <div className="cro-cell is-brand">
              <Marks />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img('logos/brandfirm.png')} alt="Brandfirm" width={108} height={22} className="cro-logo" />
              <div className="cro-big is-orange">{brand.metric}</div>
              <div className="cro-cap">{brand.caption}</div>
              <p className="cro-quote">{brand.quote}</p>
              <div className="cro-who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img('people/daan-smit.webp')} alt="" width={32} height={32} />
                <span><span className="is-name">{brand.person}</span><span>{brand.jobTitle}</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="v11-head">
            <div><Eyebrow>How a test runs</Eyebrow><h2 className="v11-h2">One hypothesis, two pages, <span className="ghost">one winner.</span></h2></div>
            <p style={{ width: 420 }}>Headlines, CTAs, page structure, forms, social proof: tested systematically alongside your SEO and AEO program. As traffic scales, conversion rates improve in parallel.</p>
          </div>
          <div className="cro-ab">
            <div className="cro-variant">
              <div className="cro-variant-label"><span className="is-pill">A</span><span>Control</span><span className="is-split">50% of traffic</span></div>
              <div className="cro-page">
                <div className="cro-page-bar"><span className="v11-lights"><span /><span /><span /></span></div>
                <div className="cro-page-body">
                  <div className="cro-page-nav"><i className="is-logo" /><i /><i /><i /></div>
                  <div className="cro-page-h is-a">Innovative finance solutions for modern teams</div>
                  <div className="cro-page-p">A flexible platform that helps you streamline operations and unlock growth.</div>
                  <div className="cro-page-cta is-ghost">Learn more</div>
                </div>
              </div>
            </div>
            <div className="cro-variant is-b">
              <div className="cro-variant-label"><span className="is-pill">B</span><span>Challenger</span><span className="is-split">50% of traffic</span></div>
              <div className="cro-page">
                <div className="cro-page-bar"><span className="v11-lights"><span /><span /><span /></span></div>
                <div className="cro-page-body">
                  <div className="cro-page-nav"><i className="is-logo" /><i /><i /><i /></div>
                  <div className="cro-page-h">Close your books in two days, not ten.</div>
                  <div className="cro-page-p">Month-end for finance teams of 5 to 50. Live in a week, no migration.</div>
                  <div className="cro-page-cta">Book a 20-minute demo</div>
                  <div className="cro-page-logos"><i /><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="cro-readout">
              <div className="cro-readout-head"><span>Example experiment · hero section</span><span className="is-win">B shipped</span></div>
              <div className="cro-readout-row"><span className="is-k">Hypothesis</span><span>Naming the outcome and the next step lifts demo starts</span></div>
              <div className="cro-readout-row"><span className="is-k">Measured on</span><span>Demo starts per visitor, not clicks</span></div>
              <div className="cro-readout-bars">
                <div><span>A</span><i style={{ width: '52%' }} /><b>2.1%</b></div>
                <div className="is-b"><span>B</span><i style={{ width: '74%' }} /><b>3.0%</b></div>
              </div>
              <div className="cro-readout-foot"><span>Ran 21 days · 94% confidence</span><span>Reported in the Friday note</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
