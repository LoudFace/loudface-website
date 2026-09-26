import type { ExtrasFn } from '../types';
import { StatCell, Ui, UiHead } from '../kit';
import { ClimbCard, EngineIcon, GenieQuote, StatusList, TokuQuote, VideoProof } from './shared';
import { Lines, Named, PromptTable } from './seo-aeo';
import { ConsoleChart } from './hero-art';

/** The 90-day roadmap as four lanes: each bar a piece of work, placed in the weeks it ships. */
const LANES = [
  { lane: 'Search + answer engines', tone: '#4f46e5', bars: [[1, 2, 'Technical fixes'], [3, 5, 'Entity coverage + schema'], [8, 10, 'Answer blocks on priority pages']] },
  { lane: 'Content engine', tone: '#8b7cf0', bars: [[1, 1, 'Calibration articles'], [2, 7, 'Comparison cluster'], [8, 12, 'First-party research']] },
  { lane: 'Conversion', tone: '#e0724f', bars: [[3, 4, 'Pricing page'], [5, 8, 'Demo path test'], [10, 12, 'Versus pages']] },
  { lane: 'Authority', tone: '#d9a23a', bars: [[2, 4, 'G2 and Capterra'], [6, 9, 'Guest placements'], [10, 12, 'Community answers']] },
] as const;

function Roadmap() {
  return (
    <div className="sv-road">
      <div className="sv-road-head">
        <span className="is-brand">90-day roadmap · example</span>
        <span className="is-meta">Four tracks, one team, one scoreboard</span>
      </div>
      <div className="sv-road-grid">
        <span />
        <div className="sv-road-weeks">{Array.from({ length: 12 }, (_, i) => <span key={i}>W{i + 1}</span>)}</div>
        {LANES.map((l) => (
          <div key={l.lane} className="sv-road-lane">
            <span className="sv-road-name"><i style={{ background: l.tone }} />{l.lane}</span>
            <div className="sv-road-track">
              {l.bars.map(([a, b, name]) => (
                <span key={name} className="sv-road-bar" style={{ gridColumn: `${a} / ${b + 1}`, background: `${l.tone}1f`, boxShadow: `inset 0 0 0 1.5px ${l.tone}`, color: '#1a1040' }}>{name}</span>
              ))}
            </div>
          </div>
        ))}
        <span />
        <div className="sv-road-checks">
          {Array.from({ length: 12 }, (_, i) => <span key={i} title="Weekly check-in"><i /></span>)}
        </div>
      </div>
      <div className="sv-road-foot">
        <span><i className="is-dot" />Weekly check-in: what shipped and what moved</span>
        <span className="sk-hand" style={{ fontSize: 20, color: '#e0572f' }}>goals set in week one</span>
      </div>
    </div>
  );
}

/** Organic growth: four tracks on one roadmap. Signature: the 90-day roadmap as lanes. */
export const organicGrowth: ExtrasFn = ({ home, data }) => {
  const s = home.hero.slides;
  const t = home.testimonials;
  return {
    // Genie Teacher's own Search Console, its two published figures above its impressions curve
    heroArt: (
      <ConsoleChart client="Genie Teacher" icon="logos/genie-icon.png" plotTitle="Impressions per day" series={data?.results.genie} tip={s[1].tip} figures={[
        { k: 'Impressions a day', v: '150×', s: '1 to 15 September, on the May average' },
        { k: 'Clicks a week', v: '28×', s: 'On the May average' },
      ]} />
    ),
    heroCard: <ClimbCard label="Share of AI answers" client="LoudFace" from="0.13%" to="15.3%" foot="Our own site, Apr to Sep 2026" footRight="Peec AI" />,
    band: [
      { k: 'Tracks', v: 'Four', s: 'Search, content, conversion, authority' },
      { k: 'Roadmap', v: '90 days', s: 'Three to five goals, one scoreboard' },
      { k: 'Numbers', v: 'Weekly', s: 'Share of answer, rankings, pipeline' },
    ],
    tiles: [
      {
        tag: 'Search',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="One page, two surfaces · example" right={<span style={{ display: 'flex', gap: 6 }}><EngineIcon i={2} size={16} /><EngineIcon i={0} size={16} /></span>} />
            <div className="sv-hit is-us" style={{ padding: '10px 12px' }}><div className="is-url">yourcompany.com › guides</div><div className="is-title" style={{ fontSize: 15 }}>The payroll compliance guide</div></div>
            <Lines w={['88%', '70%']} />
            <div><Named name="Your company" /></div>
          </Ui>
        ),
      },
      {
        tag: 'Content',
        art: (
          <StatusList head="This week · example" right="Ships Friday" rows={[
            { k: 'Comparison: you vs the incumbent', tag: 'Live' },
            { k: 'Guide: contractor payroll by country', tag: 'In review', tone: 'ind' },
            { k: 'Research: 2026 payroll survey', tag: 'Drafting', tone: 'grey' },
          ]} />
        ),
      },
      {
        tag: 'Conversion',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="Demo path · example" right="Last 30 days" />
            {[['Visits to pricing', 100, ''], ['Started demo form', 38, ''], ['Booked a call', 14, 'is-ind']].map(([k, w, c]) => (
              <div key={k as string} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span>{k}</span><span style={{ color: 'var(--quiet)' }}>{w}%</span></div>
                <i className={`sk-bar ${c}`} style={{ width: `${w}%`, height: 10, background: c ? undefined : '#dcd9f0' }} />
              </div>
            ))}
          </Ui>
        ),
      },
      {
        tag: 'Authority',
        art: (
          <StatusList head="Where the brand shows up · example" right="This month" rows={[
            { k: 'G2 category page', tag: 'Listed' },
            { k: 'Industry newsletter feature', tag: 'Published' },
            { k: 'Reddit, practitioner thread', tag: 'Answered', tone: 'ind' },
          ]} />
        ),
      },
      {
        tag: 'Measurement',
        art: <PromptTable head="Share of answer by prompt · example" rows={[{ p: 'best payroll for remote teams', v: ['2', '1', '3'] }, { p: 'contractor payroll software', v: ['4', '2', null] }, { p: 'payroll compliance checklist', v: ['1', '1', '2'] }]} />,
      },
    ],
    results: {
      cells: (
        <>
          <TokuQuote t={t} wide />
          <StatCell tag="Organic clicks" client="CodeOp" big="+49%" cap="CodeOp organic clicks up 49% and impressions up 43% in four months">
            <svg viewBox="0 0 300 150" width="100%" aria-hidden="true" className="cro-bars" style={{ paddingTop: 0 }}>
              <line x1="0" x2="300" y1="130" y2="130" stroke="#dcdbe6" />
              <rect x="30" y="64" width="50" height="66" rx="3" fill="#ecebf3" /><rect x="90" y="32" width="50" height="98" rx="3" fill="#c9c3f7" />
              <rect x="170" y="70" width="50" height="60" rx="3" fill="#ecebf3" /><rect x="230" y="44" width="50" height="86" rx="3" fill="#c9c3f7" />
              <text x="85" y="146" textAnchor="middle" className="is-axis">Clicks</text><text x="225" y="146" textAnchor="middle" className="is-axis">Impressions</text>
            </svg>
          </StatCell>
          <VideoProof t={t} n={2} />
          <GenieQuote t={t} />
        </>
      ),
    },
    signature: {
      eyebrow: 'How the quarter runs',
      title: <>Four tracks, <span className="ghost">one roadmap.</span></>,
      lede: 'Three to five measurable goals across the four tracks, with a shared scoreboard and clear ownership. The same window we used to measure the program on our own site.',
      node: <Roadmap />,
    },
  };
};


