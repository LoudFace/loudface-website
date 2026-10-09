import type { ReactNode } from 'react';
import type { ExtrasFn } from '../types';
import type { Series } from '../../home-v11/data';
import { LiveChart } from '../../home-v11/LiveChart';
import { BarsCell, QuoteCell, Tag, Ui, UiHead } from '../kit';
import { BrandfirmQuote, VideoProof } from './shared';
import { GrowthBoard } from './hero-art';
import { heroSlide, proofEnd, proofValue } from '../../home-v11/hero-slides';
import type { ProofKey } from '../../home-v11/data';

/** A tile's live chart: a published case-study series at tile size. */
export function TileChart({ head, client, num, series, format, tip }: { head: string; client: string; num?: string; series?: Series; format: 'index' | 'pct'; tip: string }) {
  return (
    <Ui style={{ gap: 6 }}>
      <UiHead left={head} right={client} />
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 30, letterSpacing: '-0.04em', color: 'var(--ind)' }}>{num}</div>
      {series && <LiveChart series={series} height={96} margin={{ top: 14, right: 6, bottom: 4, left: 6 }} dots={false} hatch lineWidth={1.5} barGap={0.5} pin={16} end="plain" tip={tip} format={format} />}
    </Ui>
  );
}

const LOOP: { k: string; s: string; proof: ProofKey; mk: string }[] = [
  { k: 'SEO', s: 'The foundation', proof: 'genie', mk: 'Genie Teacher, Google impressions a day' },
  { k: 'AEO', s: 'The visibility layer', proof: 'toku', mk: 'Toku, AI visibility on its core prompt' },
  { k: 'CRO', s: 'Where it converts', proof: 'dimer', mk: 'Dimer Health, best conversion increase' },
];
const LINKS = ['Authority earns the citation', 'Cited pages convert the traffic'];

function Arrow({ label }: { label: ReactNode }) {
  return (
    <div className="sv-loop-arrow">
      <span className="sk-hand">{label}</span>
      <svg width="100%" height="14" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7h114M108 2l6 5-6 5" fill="none" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
    </div>
  );
}

/** Growth Autopilot: three disciplines as one system. Signature: the loop, each layer feeding the next, with its real number. */
export const growthAutopilot: ExtrasFn = ({ home, data }) => {
  const t = home.testimonials;
  return {
    chartsUseHomeHead: true,
    heroArt: (
      <GrowthBoard title="yourcompany × LoudFace" meta="SEO, AEO and CRO · one team · example" cols={[
        { k: 'Shipped', tone: 'done', tasks: [
          { tag: 'SEO', t: 'Technical fixes: redirects and schema', who: 'abhay-tyagi', when: 'Week 2' },
          { tag: 'CRO', t: 'Pricing page: the new plan table', who: 'abhay-tyagi', when: 'Week 3' },
        ] },
        { k: 'In progress', tone: 'doing', tasks: [
          { tag: 'AEO', t: 'Answer blocks on 12 priority pages', who: 'andrea-van-wyk', when: 'Week 4' },
          { tag: 'CRO', t: 'Demo path test, variant B', who: 'tamara-pavlovic', when: 'Week 4' },
        ] },
        { k: 'Next', tone: 'next', tasks: [
          { tag: 'SEO', t: 'Comparison cluster: four pages', who: 'andrea-van-wyk', when: 'Week 5' },
          { tag: 'AEO', t: 'Entity coverage on product pages', who: 'abhay-tyagi', when: 'Week 6' },
        ] },
      ]} />
    ),
    heroCard: (
      <div className="sk-card">
        <div className="sk-card-head"><b>One system</b><span>Three disciplines</span></div>
        {LOOP.map((l, i) => (
          <div key={l.k} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: i ? 10 : 0, borderTop: i ? '1px solid var(--line)' : 0 }}>
            <Tag tone="ind">{l.k}</Tag>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--quiet)' }}>{l.mk.split(',')[0]}</span>
            <b style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 20, letterSpacing: '-0.03em' }}>{proofValue(data, l.proof)}</b>
          </div>
        ))}
      </div>
    ),
    band: [
      { k: 'Disciplines', v: 'Three', s: 'SEO, AEO and CRO' },
      { k: 'Team', v: 'One', s: 'No vendor fragmentation' },
      { k: 'Scoreboard', v: 'One', s: 'Tied to pipeline, not vanity metrics' },
    ],
    tiles: [
      { tag: 'Foundation', art: <TileChart head="Google impressions a day" client="Genie Teacher" num={proofValue(data, 'genie')} series={data?.hero.genie} format="index" tip={heroSlide(home, 'genie').tip} /> },
      { tag: 'Visibility', art: <TileChart head="Share of AI answers" client="LoudFace" num={proofValue(data, 'lf')} series={data?.hero.lf} format="pct" tip={heroSlide(home, 'lf').tip} /> },
      { tag: 'Conversion', art: <TileChart head="Lead requests a week" client="Genie Teacher" num={proofValue(data, 'genieLeads')} series={data?.hero.genieLeads} format="index" tip={heroSlide(home, 'genieLeads').tip} /> },
    ],
    results: {
      title: <>One system took Toku to <span className="ghost">{proofEnd(data, 'toku')} AI visibility.</span></>,
      lede: 'SEO, AEO, and CRO run as one program by one team — the authority that ranks the pages is the authority that gets them cited by AI, and the same pages are built to convert the traffic they earn.',
      cells: (
        <>
          <QuoteCell wide logo="logos/toku-ink.png" logoAlt="Toku" logoW={84} logoH={24} big={proofValue(data, 'toku')} cap="Toku’s AI visibility on its core prompt, from a standing start" quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind" />
          <BarsCell tag="Conversion rate" client="Dimer Health" big={proofValue(data, 'dimer')} cap="Best conversion increase from a LoudFace program" before="Before" after="After six months" />
          <VideoProof t={t} n={0} big="$1M+" cap="in sales from one landing page we designed" />
          <BrandfirmQuote t={t} data={data} />
        </>
      ),
    },
    signature: {
      eyebrow: 'How the layers connect',
      title: <>Each layer <span className="ghost">compounds the one before it.</span></>,
      lede: 'Three vendors running three separate playbooks means nothing connects and nothing compounds. Growth Autopilot integrates SEO, AEO, and CRO into a single system, run by one team.',
      node: (
        <div className="sv-loop">
          <div className="sv-loop-row">
            {LOOP.map((l, i) => (
              <div key={l.k} className="sv-loop-cell">
                <div className={`sv-loop-node ${i === 0 ? 'is-ind' : i === 1 ? 'is-lav' : 'is-peach'}`}>
                  <span className="sv-loop-k">{l.k}</span>
                  <span className="sv-loop-s">{l.s}</span>
                  <span className="sv-loop-m">{proofValue(data, l.proof)}</span>
                  <span className="sv-loop-mk">{l.mk}</span>
                </div>
                {i < 2 && <Arrow label={LINKS[i]} />}
              </div>
            ))}
          </div>
          <div className="sv-loop-board">
            <span className="sv-loop-board-k">One team, one scoreboard</span>
            {['Rankings and impressions', 'Share of AI answers', 'Conversion rate', 'Pipeline'].map((k) => <span key={k} className="sv-loop-board-i">{k}</span>)}
          </div>
        </div>
      ),
    },
  };
};
