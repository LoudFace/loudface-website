import Link from 'next/link';
import type { ExtrasFn } from '../types';
import { QuoteCell, StatCell, Tag, Ui, UiHead } from '../kit';
import { ArrowRight } from '../../home-v11/ui';
import { AIO_FANOUT_LEDE, AIO_NOT_FOR } from '../configs';
import { EngineIcon, GenieQuote, StatusList, VideoProof, logo } from './shared';
import { Lines } from './seo-aeo';

const FANOUT: { q: string; page: string; act: string; tone: 'good' | 'ind' | 'grey' | 'warn' }[] = [
  { q: 'how to pay international contractors', page: '/guides/contractor-payments', act: 'Answered well', tone: 'good' },
  { q: 'contractor payment compliance by country', page: '/guides/compliance', act: 'Deepen', tone: 'ind' },
  { q: 'fees for paying contractors abroad', page: 'No page', act: 'Write one', tone: 'warn' },
  { q: 'pay contractors in stablecoins', page: '/guides/stablecoin-payroll', act: 'Answered well', tone: 'good' },
  { q: 'pay contractors abroad 2026 cheap fast', page: 'Same intent', act: 'Don’t write', tone: 'grey' },
  { q: 'best way to pay contractors in Brazil', page: 'Covered by country table', act: 'Don’t write', tone: 'grey' },
];

const REPORT = [
  { p: 'best payroll software for remote teams', seen: true, pos: '2', url: '/guides/remote-payroll', d: '+1' },
  { p: 'how to pay contractors abroad', seen: true, pos: '1', url: '/guides/contractor-payments', d: 'new' },
  { p: 'payroll compliance checklist', seen: true, pos: '3', url: '/checklists/payroll', d: '0' },
  { p: 'stablecoin payroll providers', seen: false, pos: '–', url: '–', d: '–' },
];

/** Google AI Overviews as a service page, built from the verified article's sentences. Signature: the fan-out map. */
export const aiOverviews: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    heroArt: (
      <div className="sk-browser sv-aio">
        <div className="sk-browser-bar"><span className="v11-lights" aria-hidden="true"><span /><span /><span /></span><span className="sk-browser-url">google.com/search</span></div>
        <div className="sv-aio-body">
          <div className="sv-query" style={{ width: 520 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo('fav-google-g.png')} alt="" width={18} height={18} />how to pay contractors abroad
          </div>
          <div className="sv-aio-panel">
            <div className="sv-aio-main">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}><EngineIcon i={3} size={18} />AI Overview</div>
              <Lines w={['96%', '90%', '72%']} />
              <Lines w={['92%', '58%']} />
            </div>
            <div className="sv-aio-sources">
              {[['yourcompany.com', 'How to pay contractors abroad', true], ['', '', false], ['', '', false]].map(([d, h, us], i) => (
                <div key={i} className={`sv-aio-src ${us ? 'is-us' : ''}`}>
                  {us ? <><span className="is-d">{d}</span><span className="is-h">{h}</span></> : <><i className="sk-bar" style={{ width: 70 }} /><i className="sk-bar" style={{ width: '90%', background: '#e6e5ee' }} /></>}
                </div>
              ))}
            </div>
          </div>
          <div className="sv-hit" style={{ background: 'none', padding: '0 4px' }}><i className="sk-bar" style={{ width: 120, marginBottom: 8 }} /><Lines w={['64%', '80%']} /></div>
        </div>
      </div>
    ),
    heroCard: (
      <div className="sk-card">
        <div className="sk-card-head"><b>This week · example</b><span>AI Overviews</span></div>
        {REPORT.slice(0, 3).map((r) => (
          <div key={r.p} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.p}</span>
            <b style={{ fontWeight: 500, flexShrink: 0 }}>pos {r.pos}</b>
          </div>
        ))}
        <div className="sk-card-foot"><span>Per prompt, every week</span><span>Answers linked</span></div>
      </div>
    ),
    band: [
      { k: 'Where answers come from', v: 'The index', s: 'No separate AI ranking system' },
      { k: 'Reported', v: 'Weekly', s: 'Per-prompt visibility and cited position' },
      { k: 'Engagements from', v: '$5k/mo', s: 'Scoped on the intro call' },
    ],
    tiles: [
      {
        tag: 'Fan-out',
        art: (
          <Ui style={{ gap: 0 }}>
            <UiHead left="Sub-queries around one buying question · example" right="What to do" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
              {FANOUT.slice(0, 4).map((f) => <div key={f.q} className="sk-row"><span className="is-k">{f.q}</span><Tag tone={f.tone}>{f.act}</Tag></div>)}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Eligibility',
        art: (
          <StatusList head="Eligibility check · example" right="Site, then page" rows={[
            { k: 'Search generative AI features', tag: 'Included' },
            { k: 'Indexed and crawlable', tag: 'Yes' },
            { k: <span className="sk-mono">nosnippet</span>, tag: 'Removed', tone: 'ind' },
            { k: <span className="sk-mono">max-snippet</span>, tag: 'None set', tone: 'grey' },
          ]} />
        ),
      },
      {
        tag: 'Extraction',
        art: (
          <Ui style={{ gap: 8 }}>
            <UiHead left="Page top · example" right={<Tag tone="ind">Self-sufficient answer</Tag>} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 15.5 }}>How do you pay contractors abroad?</div>
            <Lines w={['94%', '80%']} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ height: 14, borderRadius: 3, background: i < 3 ? '#e4e2f5' : '#f2f1f7' }} />)}</div>
          </Ui>
        ),
      },
      {
        tag: 'Entities',
        art: (
          <StatusList head="One description, everywhere · example" right="Consistent" rows={[
            { k: 'Your homepage', tag: 'Matches' },
            { k: 'G2 profile', tag: 'Matches' },
            { k: 'Partner directory listing', tag: 'Updated', tone: 'ind' },
          ]} />
        ),
      },
      {
        tag: 'Freshness',
        art: (
          <StatusList head="Corrections on retrieved pages · example" right="Live index" rows={[
            { k: 'Pricing table updated', v: 'Mon', tag: 'Re-cited Thu' },
            { k: 'Country list extended', v: 'Tue', tag: 'Watching', tone: 'ind' },
          ]} />
        ),
      },
      {
        tag: 'Structured data',
        art: (
          <Ui style={{ gap: 6 }}>
            <UiHead left="Markup matches the visible page · example" right={<Tag tone="good">Valid</Tag>} />
            <pre className="sk-mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: '#4a4466', whiteSpace: 'pre' }}>{`{ "@type": "FAQPage",
  "mainEntity": [ … 6 questions … ] }`}</pre>
            <div style={{ fontSize: 12, color: 'var(--quiet)' }}>Kept for rich results, not sold as an AI lever</div>
          </Ui>
        ),
      },
    ],
    results: {
      title: <>Why AI Overviews is the surface <span className="ghost">to fix first.</span></>,
      lede: 'Google AI Overviews refreshes on the live Search index. It is the surface where a change you ship this week can show up this week.',
      cells: (
        <>
          <QuoteCell wide logo="logos/toku-ink.png" logoAlt="Toku" logoW={84} logoH={24} big="39.3%" cap="Toku’s visibility in Google AI Overviews, 30 days to 19 August 2026: the second most-visible brand" quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind">
            <div className="sv-rivals">
              {[['Deel', 43.1], ['Toku', 39.3], ['Remote', 35.9]].map(([n, v]) => (
                <div key={n as string} className={n === 'Toku' ? 'is-us' : ''}><span>{n}</span><i style={{ width: `${(v as number) / 45 * 100}%` }} /><b>{v}%</b></div>
              ))}
            </div>
          </QuoteCell>
          <StatCell tag="Per-engine split" client="Toku" big="57%" cap="of Toku’s total AI mentions came from Google AI Overviews, spring 2026, at average cited position 2.3">
            <div className="sv-rivals">
              {[[2, 35], [0, 11], [1, 10]].map(([i, v]) => (
                <div key={i} className={i === 2 ? 'is-us' : ''}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><EngineIcon i={i} size={14} />{['ChatGPT', 'Perplexity', 'AI Overviews'][i]}</span><i style={{ width: `${v / 40 * 100}%` }} /><b>{v}%</b></div>
              ))}
            </div>
          </StatCell>
          <VideoProof t={t} n={0} big="$1M+" cap="in sales from one landing page we designed" />
          <GenieQuote t={t} />
        </>
      ),
    },
    signature: {
      eyebrow: 'Fan-out mapping',
      title: <>One buying question, <span className="ghost">many sub-queries.</span></>,
      lede: AIO_FANOUT_LEDE,
      node: (
        <div className="sv-fan">
          <div className="sv-fan-root">
            <span className="is-k">Buying question · example</span>
            <span className="is-q">best way to pay contractors in other countries</span>
            <span className="is-k" style={{ marginTop: 'auto' }}>Sub-queries the models issue</span>
          </div>
          <div className="sv-fan-list">
            {FANOUT.map((f) => (
              <div key={f.q} className={`sv-fan-row is-${f.tone}`}>
                <span className="sv-fan-q">{f.q}</span>
                <span className="sv-fan-p">{f.page}</span>
                <Tag tone={f.tone}>{f.act}</Tag>
              </div>
            ))}
          </div>
          <p className="sv-note" style={{ gridColumn: '1 / -1', marginTop: 0 }}>Illustration: an example buying question and the sub-queries around it.</p>
        </div>
      ),
    },
    more: [
      {
        key: 'not-for',
        eyebrow: 'Fit',
        title: <>Who this is <span className="ghost">not for.</span></>,
        lede: AIO_NOT_FOR[0],
        node: (
          <div className="sv-notfor">
            {AIO_NOT_FOR.slice(1).map((n) => (
              <div key={n} className="sv-notfor-item">
                <span className="sv-notfor-x" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
                <p dangerouslySetInnerHTML={{ __html: n }} />
              </div>
            ))}
            <Link href="/blog/google-ai-overviews-optimization" className="sv-notfor-guide">
              <span className="is-k">The full guide</span>
              <span className="is-t">How AI Overviews picks a source, what Google lets you measure, and where it stops</span>
              <span className="is-go">Read the guide <ArrowRight /></span>
            </Link>
          </div>
        ),
      },
    ],
  };
};
