import { Fragment } from 'react';
import type { ExtrasFn } from '../types';
import { QuoteCell, StatCell, Tag, Ui, UiHead } from '../kit';
import { BrandfirmQuote, ENGINES, EngineIcon, GenieQuote, StatusList } from './shared';
import { Lines, Named } from './seo-aeo';
import { ChatWindow } from '../../home-v11/Bento';

/** An example per-engine panel: visibility, position and the leader, never blended. */
export function EnginePanel({ rows, head = 'Share of answer · example prompt set' }: { rows: [number, string, string][]; head?: string }) {
  return (
    <Ui style={{ gap: 0 }}>
      <UiHead left={head} right="Per engine, weekly" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {rows.map(([i, v, pos]) => (
          <div key={i} className="sk-row" style={{ gap: 14 }}>
            <span className="is-k" style={{ display: 'flex', alignItems: 'center', gap: 9, width: 150, flexShrink: 0 }}><EngineIcon i={i} size={18} />{ENGINES[i].name}</span>
            <span style={{ flex: 1, height: 8, borderRadius: 99, background: '#efeef5', position: 'relative' }}><i style={{ position: 'absolute', inset: 0, width: v, borderRadius: 99, background: 'var(--ind)' }} /></span>
            <span className="is-v" style={{ width: 92, justifyContent: 'flex-end' }}><b>{v}</b><span style={{ fontSize: 11.5, color: 'var(--quiet)' }}>{pos}</span></span>
          </div>
        ))}
      </div>
    </Ui>
  );
}

const CHAIN = [
  { k: 'Reachable', s: 'The crawler gets the page' },
  { k: 'Extractable', s: 'A unit the model can lift' },
  { k: 'Trusted', s: 'Entities it can resolve' },
  { k: 'Retrieved', s: 'In the sources it reads' },
];

/** GEO: the citation is a chain. Signature: the four links, then the answer they earn. */
export const geoAgency: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    heroArt: <ChatWindow c={home.bento.chat} className="is-hero" />,
    heroCard: (
      <div className="sk-card">
        <div className="sk-card-head"><b>AI visibility</b><span>Toku · core prompt</span></div>
        <div className="sk-card-num">97.8%</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)' }}>of AI answers to “best stablecoin payroll providers”, the highest of any brand on that prompt</div>
        <div className="sk-card-foot"><span>30-day read to 19 Aug 2026</span><span>Avg position 3.1</span></div>
      </div>
    ),
    band: [
      { k: 'Engines monitored', v: '7+', s: 'ChatGPT, Perplexity, Gemini and more' },
      { k: 'Reported', v: 'Per engine', s: 'Weekly, never blended' },
      { k: 'Starts with', v: 'The audit', s: 'Including crawler access most audits skip' },
    ],
    tiles: [
      { tag: 'Tracking', art: <EnginePanel rows={[[0, '34%', 'pos 2.4'], [1, '41%', 'pos 1.9'], [2, '22%', 'pos 3.6']]} /> },
      {
        tag: 'Extraction',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="Answer-first page · example" right={<Tag tone="ind">First screen</Tag>} />
            <div style={{ padding: 12, borderRadius: 10, background: '#f6f5fb', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ind)' }}>TL;DR</span>
              <Lines w={['94%', '72%']} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['1', '2', '3'].map((n) => <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><span className="sv-cite">{n}</span><i className="sk-bar" style={{ width: `${70 - Number(n) * 10}%`, background: '#e6e5ee' }} /></div>)}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Entities',
        art: (
          <Ui style={{ gap: 6 }}>
            <UiHead left="Structured data · example" right={<Tag tone="good">Valid</Tag>} />
            <pre className="sk-mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: '#4a4466', whiteSpace: 'pre' }}>{`{ "@type": "Service",
  "provider": "Your company",
  "serviceType": "Payroll",
  "areaServed": "150 countries" }`}</pre>
          </Ui>
        ),
      },
      {
        tag: 'Corpus',
        art: (
          <StatusList head="Sources the engines read · example" right="Retrieved" rows={[
            { k: 'Vendor roundup, trade site', tag: 'Listed' },
            { k: 'G2 category page', tag: 'Listed' },
            { k: 'Reddit, practitioner thread', tag: 'Pitched', tone: 'ind' },
          ]} />
        ),
      },
      {
        tag: 'Crawlers',
        art: (
          <StatusList head="AI crawler access · example" right="robots.txt + logs" rows={[
            { k: <span className="sk-mono">OAI-SearchBot</span>, tag: 'Allowed' },
            { k: <span className="sk-mono">PerplexityBot</span>, tag: 'Allowed' },
            { k: <span className="sk-mono">ClaudeBot</span>, tag: 'Unblocked', tone: 'ind' },
            { k: <span className="sk-mono">GPTBot (training)</span>, tag: 'Your call', tone: 'grey' },
          ]} />
        ),
      },
      {
        tag: 'Reporting',
        art: (
          <Ui style={{ gap: 0 }}>
            <UiHead left="Scoreboard · example week" right="Per engine" />
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: '10px 14px', marginTop: 12, fontSize: 12.5, alignItems: 'center' }}>
              {['Engine', 'Visibility', 'Position', 'Sentiment', 'Leader'].map((h) => <span key={h} style={{ color: 'var(--quiet)', fontSize: 11.5 }}>{h}</span>)}
              {[[0, '34%', '2.4', 'Positive', 'You'], [1, '41%', '1.9', 'Positive', 'You'], [2, '22%', '3.6', 'Neutral', 'Rival A']].map(([i, v, p, se, l]) => (
                <Fragment key={i as number}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #efeef5', paddingTop: 10 }}><EngineIcon i={i as number} size={16} />{ENGINES[i as number].name}</span>
                  <b style={{ fontWeight: 500, borderTop: '1px solid #efeef5', paddingTop: 10 }}>{v}</b>
                  <span style={{ borderTop: '1px solid #efeef5', paddingTop: 10 }}>{p}</span>
                  <span style={{ borderTop: '1px solid #efeef5', paddingTop: 10 }}><Tag tone={se === 'Positive' ? 'good' : 'grey'}>{se}</Tag></span>
                  <span style={{ borderTop: '1px solid #efeef5', paddingTop: 10, color: l === 'You' ? 'var(--ind)' : 'var(--quiet)', fontWeight: 500 }}>{l}</span>
                </Fragment>
              ))}
            </div>
          </Ui>
        ),
      },
    ],
    results: {
      title: <>Cited in 97.8% of AI answers <span className="ghost">on the core prompt.</span></>,
      lede: 'On Toku’s core crypto-payroll prompt, the brand appears in 97.8% of AI answers, the highest of any brand on that prompt, in the 30-day read ending 19 August 2026. Across all 95 tracked prompts the average cited position is 2.1.',
      cells: (
        <>
          <QuoteCell wide logo="logos/toku-ink.png" logoAlt="Toku" logoW={84} logoH={24} big="97.8%" cap="Of AI answers on Toku’s core prompt · 30-day read ending 19 August 2026" quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind" />
          <StatCell tag="Average cited position" client="Toku" big="2.1" cap="Average cited position across all 95 tracked prompts">
            <div style={{ position: 'relative', paddingTop: 34 }}>
              <div style={{ position: 'absolute', left: `${((2.1 - 1) / 4) * 100}%`, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#ffffff', background: 'var(--ind)', borderRadius: 6, padding: '2px 7px' }}>2.1</span>
                <i style={{ width: 1.5, height: 12, background: 'var(--ind)' }} />
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'linear-gradient(90deg, #4f46e5, #c9c3f7 45%, #ecebf3)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a3a0b8', marginTop: 8 }}>{[1, 2, 3, 4, 5].map((p) => <span key={p}>{p}</span>)}</div>
              <div style={{ fontSize: 11.5, color: '#a3a0b8', marginTop: 4 }}>Cited position, 1 is named first</div>
            </div>
          </StatCell>
          <GenieQuote t={t} />
          <BrandfirmQuote t={t} />
          <StatCell tag="Engines monitored" big="7+" cap="AI engines monitored: ChatGPT, Perplexity, Gemini, and more">
            <div style={{ display: 'flex', gap: 10 }}>{[0, 1, 2, 3].map((i) => <EngineIcon key={i} i={i} size={34} />)}</div>
          </StatCell>
        </>
      ),
    },
    signature: {
      eyebrow: 'How a citation happens',
      title: <>Four links, <span className="ghost">one citation.</span></>,
      lede: 'An engine can only cite a page that reaches its retrieved set. On-page format and off-page corpus run together, because engines only cite what they retrieve.',
      node: (
        <div className="sv-chain">
          <div className="sv-chain-steps">
            {CHAIN.map((c, i) => (
              <div key={c.k} className="sv-chain-step">
                <span className="sv-chain-n">{i + 1}</span>
                <div className="sv-chain-k">{c.k}</div>
                <div className="sv-chain-s">{c.s}</div>
                <div className="sv-chain-ui">
                  {i === 0 && <div className="sk-mono" style={{ fontSize: 11.5, lineHeight: 1.7 }}>GET /guides/payroll <span style={{ color: '#1b7f4b' }}>200</span><br />OAI-SearchBot · 142 ms</div>}
                  {i === 1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ind)' }}>TL;DR</span><Lines w={['92%', '66%']} /></div>}
                  {i === 2 && <div className="sk-mono" style={{ fontSize: 11.5, lineHeight: 1.7 }}>&quot;@type&quot;: &quot;Organization&quot;<br />&quot;sameAs&quot;: [ … ]</div>}
                  {i === 3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}><span style={{ display: 'flex', justifyContent: 'space-between' }}>Vendor roundup <Tag tone="good">Listed</Tag></span><span style={{ display: 'flex', justifyContent: 'space-between' }}>G2 category <Tag tone="good">Listed</Tag></span></div>}
                </div>
              </div>
            ))}
          </div>
          <div className="sv-chain-answer">
            <div className="sv-window" style={{ boxShadow: '0 0 0 2px #4f46e5, 0 24px 50px rgba(79,70,229,0.2)' }}>
              <div className="sv-window-bar"><EngineIcon i={0} size={16} /><EngineIcon i={1} size={16} /><EngineIcon i={2} size={16} /><span>The answer</span></div>
              <div className="sv-window-body">
                <div className="sv-query" style={{ alignSelf: 'flex-end', background: '#f4f4f6', boxShadow: 'none' }}>Which payroll tools handle stablecoin payouts?</div>
                <Lines w={['96%', '88%']} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Named name="Your company" /><span className="sv-src"><span className="is-us"><i />yourcompany.com</span></span></div>
                <Lines w={['74%']} />
              </div>
            </div>
          </div>
          <p className="sv-note" style={{ gridColumn: '1 / -1', marginTop: 0 }}>Illustration: an example page moving through the four checks we run.</p>
        </div>
      ),
    },
  };
};
