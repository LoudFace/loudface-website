import type { ReactNode } from 'react';
import type { ExtrasFn } from '../types';
import { QuoteCell, Tag, Ui, UiHead } from '../kit';
import { BrandfirmQuote, ClimbCard, ENGINES, EngineIcon, GenieQuote, StatusList, VideoProof, logo } from './shared';
import { RankTracker } from './hero-art';

/** Grey text lines standing in for answer prose we do not quote. */
export const Lines = ({ w = ['92%', '84%', '70%'] }: { w?: string[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    {w.map((x, i) => <i key={i} className="sk-bar" style={{ width: x, height: 7, background: '#e6e5ee' }} />)}
  </div>
);

/** One brand named inside an answer: the chip the engines show. */
export const Named = ({ name, icon, n }: { name: string; icon?: string; n?: number }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 28, padding: '0 10px 0 6px', borderRadius: 8, background: '#eef0ff', boxShadow: 'inset 0 0 0 1.5px #4f46e5', color: 'var(--ink)', fontSize: 13, fontWeight: 500 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {icon ? <img src={logo(icon)} alt="" width={16} height={16} style={{ borderRadius: 4 }} /> : <i style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--ind)' }} />}
    {name}
    {n !== undefined && <span className="sv-cite">{n}</span>}
  </span>
);

/** One buyer question, as three surfaces answer it. */
export function ThreeSurfaces({ query, brand, icon, domain, note }: { query: string; brand: string; icon: string; domain: string; note: ReactNode }) {
  return (
    <div className="sv-trio">
      <div className="sv-surface">
        <div className="sv-surface-label"><span className="is-pill">SEO</span><span>Google</span><span className="is-sub">Ranked</span></div>
        <div className="sv-window">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="sv-window-bar"><img src={logo('fav-google-g.png')} alt="" width={16} height={16} /><span>Search</span></div>
          <div className="sv-window-body">
            <div className="sv-query">{query}</div>
            <div className="sv-hit"><i className="sk-bar" style={{ width: 90, marginBottom: 8 }} /><Lines w={['70%', '88%']} /></div>
            <div className="sv-hit is-us"><div className="is-url">{domain}</div><div className="is-title">{brand}</div><Lines w={['90%', '64%']} /></div>
          </div>
        </div>
      </div>
      <div className="sv-surface">
        <div className="sv-surface-label"><span className="is-pill">AEO</span><span>ChatGPT</span><span className="is-sub">Cited</span></div>
        <div className="sv-window">
          <div className="sv-window-bar"><EngineIcon i={0} size={16} /><span>{ENGINES[0].name}</span></div>
          <div className="sv-window-body">
            <div className="sv-query" style={{ alignSelf: 'flex-end', background: '#f4f4f6', boxShadow: 'none' }}>{query}</div>
            <Lines />
            <div><Named name={brand} icon={icon} /></div>
            <Lines w={['86%', '60%']} />
          </div>
        </div>
      </div>
      <div className="sv-surface">
        <div className="sv-surface-label"><span className="is-pill">GEO</span><span>Perplexity</span><span className="is-sub">Same story</span></div>
        <div className="sv-window">
          <div className="sv-window-bar"><EngineIcon i={1} size={16} /><span>{ENGINES[1].name}</span></div>
          <div className="sv-window-body">
            <div className="sv-query">{query}</div>
            <div className="sv-src"><span className="is-us"><i />{domain}</span><span><i />g2.com</span><span><i />reddit.com</span></div>
            <Lines w={['94%', '80%']} />
            <div><Named name={brand} icon={icon} /></div>
          </div>
        </div>
      </div>
      <p className="sv-note" style={{ gridColumn: '1 / -1', marginTop: 0 }}>{note}</p>
    </div>
  );
}

/** A per-prompt tracking table: the weekly readout. */
export function PromptTable({ head, rows }: { head: string; rows: { p: string; v: (string | null)[] }[] }) {
  return (
    <Ui style={{ gap: 0 }}>
      <UiHead left={head} right={<span style={{ display: 'flex', gap: 14 }}>{[0, 1, 2].map((i) => <EngineIcon key={i} i={i} size={16} />)}</span>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
        {rows.map((r) => (
          <div key={r.p} className="sk-row">
            <span className="is-k" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.p}</span>
            <span className="is-v" style={{ gap: 14 }}>{r.v.map((x, i) => <b key={i} style={{ width: 16, textAlign: 'center', fontSize: 13, fontFamily: 'var(--font-sans)', color: x ? 'var(--ink)' : '#c9c7d8' }}>{x ?? '·'}</b>)}</span>
          </div>
        ))}
      </div>
    </Ui>
  );
}

/** SEO + AEO: one program, three surfaces. Signature: the same buyer question on Google, ChatGPT and Perplexity. */
export const seoAeo: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    heroArt: (
      <RankTracker title="yourcompany" meta="Google, ChatGPT, Perplexity and Gemini · example" rows={[
        { q: 'best payroll software for remote teams', pos: '2', move: '↑1', seen: [true, true, true] },
        { q: 'how to pay contractors abroad', pos: '1', move: 'new', seen: [true, true, false] },
        { q: 'payroll compliance checklist', pos: '3', seen: [true, false, true] },
        { q: 'EOR vs contractor', pos: '4', move: '↑2', seen: [true, true, true] },
        { q: 'stablecoin payroll providers', pos: '6', move: '↑3', seen: [false, true, false] },
      ]} />
    ),
    heroCard: <ClimbCard label="Share of AI answers" client="LoudFace" from="0.13%" to="15.3%" foot="Our own site, Apr to Sep 2026" footRight="Peec AI" />,
    band: [
      { k: 'Week one', v: 'The audit', s: 'Technical, content, entities and AI answers' },
      { k: 'Roadmap', v: '90 days', s: 'Three to five goals tied to pipeline' },
      { k: 'Check-in', v: 'Weekly', s: 'What shipped and how visibility moved' },
    ],
    tiles: [
      {
        tag: 'Technical',
        art: (
          <Ui style={{ gap: 0 }}>
            <UiHead left="Server log · AI crawlers · example" right="Last 24 hours" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
              {[
                ['OAI-SearchBot', '/pricing', '200', 'good'],
                ['PerplexityBot', '/guides/payroll-compliance', '200', 'good'],
                ['Googlebot', '/compare/vendors', '200', 'good'],
                ['ClaudeBot', '/blog/close-checklist', '403', 'warn'],
              ].map(([b, p, c, tone]) => (
                <div key={b} className="sk-row"><span className="is-k" style={{ display: 'flex', gap: 10 }}><span className="sk-mono" style={{ fontWeight: 600 }}>{b}</span><span className="sk-mono" style={{ color: 'var(--quiet)' }}>{p}</span></span><Tag tone={tone as 'good'}>{c}</Tag></div>
              ))}
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Content',
        art: (
          <StatusList head="Cluster · example" right="8 of 12 live" rows={[
            { k: 'Pillar: the complete guide', tag: 'Live' },
            { k: 'Comparison: vendor A vs B', tag: 'Live' },
            { k: 'FAQ compilation', tag: 'In review', tone: 'ind' },
            { k: 'Programmatic: by country', tag: 'Queued', tone: 'grey' },
          ]} />
        ),
      },
      {
        tag: 'Off-page',
        art: (
          <StatusList head="Placements · example" right="This month" rows={[
            { k: 'G2 category profile', tag: 'Updated' },
            { k: 'Guest article, trade publication', tag: 'Published' },
            { k: 'Reddit thread, practitioner answer', tag: 'Posted', tone: 'ind' },
          ]} />
        ),
      },
      {
        tag: 'Authority',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="Byline · example" right={<Tag tone="good">Reviewed</Tag>} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 99, background: 'linear-gradient(135deg,#c9c3f7,#fde6dc)' }} />
              <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Head of Payroll, 12 years</div><div style={{ fontSize: 12, color: 'var(--quiet)' }}>Expert reviewer · credentials linked</div></div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}><Tag tone="ind">Person schema</Tag><Tag tone="ind">Sources cited</Tag></div>
          </Ui>
        ),
      },
      {
        tag: 'Monitoring',
        art: <PromptTable head="Buyer prompts · example week" rows={[{ p: 'best payroll for remote teams', v: ['2', '1', '3'] }, { p: 'payroll tool for contractors', v: ['4', '2', null] }, { p: 'stablecoin payroll providers', v: ['1', '1', '2'] }]} />,
      },
    ],
    results: {
      title: <>From invisible to the answer <span className="ghost">AI names.</span></>,
      lede: 'An answer-engine program aimed at the buying question: when someone asks an AI which vendor to use, Toku had to be in the answer. We built the pages and signals that get a brand cited by name.',
      cells: (
        <>
          <QuoteCell wide logo="logos/toku-ink.png" logoAlt="Toku" logoW={84} logoH={24} big={t.cards[0].metric} cap="Toku AI visibility on its core stablecoin-payroll prompt (30-day Peec reading ending 19 August 2026; average cited position 3.1 on that prompt)" quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind" />
          <GenieQuote t={t} />
          <VideoProof t={t} n={0} big="$1M+" cap="in sales from one landing page we designed" />
          <BrandfirmQuote t={t} />
        </>
      ),
    },
    chartsUseHomeHead: true,
    signature: {
      eyebrow: 'Three surfaces',
      title: <>Found on Google. <span className="ghost">Cited by AI.</span></>,
      lede: 'The authority that ranks you on Google is what teaches an AI engine to trust you. We build SEO, AEO, and GEO into one program instead of three invoices.',
      node: <ThreeSurfaces query="best stablecoin payroll providers" brand="Toku" icon="toku-app-icon.png" domain="toku.com" note="Illustration of the prompt Toku is tracked on. Answer text and positions are not shown; the grey lines stand in for them." />,
    },
  };
};
