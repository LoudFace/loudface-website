import type { ExtrasFn } from '../types';
import { BarsCell, Browser, QuoteCell, Ui, VideoCell } from '../kit';
import { SHOTS } from '../../service-v3/data';
import { BeforeAfterCard, Redline, StatusList, Wireframe } from './shared';

/** CRO: the approved board (Paper "Services · CRO", 2026-09-24). Signature: how one test runs. */
export const cro: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    // the clean capture of the live site: the Sanity thumbnail for this slug is a collage of framed screens
    heroArt: <Browser src={`https://cdn.sanity.io/images/xjjjqhgt/production/${SHOTS.dimer.asset}?w=1440&h=900&fit=crop&crop=top&fm=webp&q=82`} domain={SHOTS.dimer.domain} alt="Dimer Health website, built and optimized by LoudFace" priority />,
    heroCard: <BeforeAfterCard label="Conversion rate" client="Dimer Health" num="+288%" before="Before the program" after="After six months" />,
    band: [
      { k: 'Where it starts', v: 'The audit', s: 'Every drop-off scored by revenue impact' },
      { k: 'Optimization cycle', v: '90 days', s: 'Three to five goals tied to pipeline' },
      { k: 'Showcase', v: 'Weekly', s: 'What shipped and what moved' },
    ],
    tiles: [
      { tag: 'Clarity', art: <Wireframe pills={['Headline states the outcome', 'One next step above the fold', 'Proof on the first screen']} /> },
      {
        tag: 'Trust',
        art: (
          <Ui>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>Ready to see it on your site?</div><div style={{ fontSize: 12, color: 'var(--quiet)' }}>20-minute walkthrough, no slides</div></div>
              <span style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 14px', borderRadius: 99, background: 'var(--ind)', color: '#fff', fontSize: 12.5, fontWeight: 500 }}>Book a demo</span>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 10, background: '#f6f5fb' }}>
              <i style={{ width: 3, borderRadius: 3, background: 'var(--ind)' }} />
              <div><div style={{ fontSize: 13, lineHeight: '19px' }}>{t.videos[1].quote}</div><div style={{ fontSize: 11.5, color: 'var(--quiet)', marginTop: 6 }}>{t.videos[1].person}, {t.videos[1].jobTitle}</div></div>
            </div>
          </Ui>
        ),
      },
      { tag: 'Copy', art: <Redline head="Example · hero headline" right="v1 → v2" before="Innovative finance solutions for modern teams" after="Close your books in two days, not ten." why="Names the problem, then the outcome" /> },
      { tag: 'Speed', art: <StatusList head="Core Web Vitals · example audit" right="Mobile" rows={[{ k: 'Largest paint', v: '1.8 s', tag: 'Good' }, { k: 'Interaction delay', v: '120 ms', tag: 'Good' }, { k: 'Layout shift', v: '0.04', tag: 'Good' }]} /> },
      { tag: 'Testing', art: <StatusList head="Test log · example" right="Measured on demo starts" rows={[{ k: 'Hero headline', tag: 'Winner shipped' }, { k: 'Pricing page proof', tag: 'Running · day 9', tone: 'ind' }, { k: 'Demo form, three fields', tag: 'Queued', tone: 'grey' }]} /> },
    ],
    results: {
      cells: (
        <>
          <VideoCell who="maksim" big="$1M+" cap="in sales from one landing page we designed" quote={t.videos[0].quote} person={t.videos[0].person} role={t.videos[0].jobTitle} duration={t.videos[0].duration} />
          <BarsCell tag="Conversion rate" client="Dimer Health" big="288%" cap="Best conversion increase from a LoudFace program" before="Before" after="After six months" />
          <VideoCell who="elizabete" quote={t.videos[2].quote} person={t.videos[2].person} role={t.videos[2].jobTitle} duration={t.videos[2].duration} />
          <QuoteCell logo="logos/brandfirm.png" logoAlt="Brandfirm" logoW={108} logoH={22} big={t.cards[2].metric} cap={t.cards[2].caption} quote={t.cards[2].quote} person={t.cards[2].person} role={t.cards[2].jobTitle} face="people/daan-smit.webp" tone="orange" />
        </>
      ),
    },
    signature: {
      eyebrow: 'How a test runs',
      title: <>One hypothesis, two pages, <span className="ghost">one winner.</span></>,
      lede: 'Headlines, CTAs, page structure, forms, social proof: tested systematically alongside your SEO and AEO program. As traffic scales, conversion rates improve in parallel.',
      node: (
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
      ),
    },
  };
};


