import { Fragment } from 'react';
import type { ExtrasFn } from '../types';
import { BarsCell, QuoteCell, StatCell, Tag, Ui, UiHead, VideoCell } from '../kit';
import { LfMark } from '../../home-v11/ui';
import { Redline } from './shared';
import { DraftPage } from './hero-art';

const BRIEF = [
  { n: 1, k: 'Who it is for', v: 'Finance leads at 20 to 200-person SaaS companies who close the books by hand.', note: 'their words, from 6 calls' },
  { n: 2, k: 'The problem, as they say it', v: '“Month-end eats a week and I still don’t trust the numbers.”' },
  { n: 3, k: 'The promise', v: 'Close your books in two days, not ten.', note: 'outcome first' },
  { n: 4, k: 'Proof', v: 'Named customers, days saved, a founder who did the job.' },
  { n: 5, k: 'The objection to answer', v: '“We’d have to migrate everything.” No migration: live in a week.' },
];

/** Copywriting: the brief comes before the page. Signature: one messaging brief and the page it produced. */
export const copywriting: ExtrasFn = ({ home }) => {
  const t = home.testimonials;
  return {
    // the page the brief produced, on the example the whole page follows (the month-end close tool)
    heroArt: (
      <DraftPage brand="yourcompany" eyebrow="Month-end close for SaaS finance teams" headline="Close your books in two days, not ten."
        sub="It reconciles as you go, so month-end stops eating a week." primary="Start your close" secondary="See how it works"
        notes={[
          { who: 'andrea-van-wyk', name: 'Andrea', text: 'Outcome first, then the how.' },
          { who: 'arnel-bukva', name: 'Arnel', text: 'Their words, from six calls.' },
        ]}
        rows={[{ k: 'Bank feeds', v: 'Reconciled' }, { k: 'Card spend', v: 'Reconciled' }, { k: 'Payroll journal', v: 'Reconciled' }]} />
    ),
    heroCard: <Redline head="Example · hero headline" right="v1 → v2" before="Innovative finance solutions for modern teams" after="Close your books in two days, not ten." why="Names the problem, then the outcome" />,
    heroCardWide: true,
    band: [
      { k: 'First deliverable', v: 'Messaging', s: 'Before any layout is drawn' },
      { k: 'The order', v: 'Copy first', s: 'Then design, then development' },
      { k: 'Human-written', v: '100%', s: 'AI speeds up research, people write' },
    ],
    tiles: [
      {
        tag: 'Positioning',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="Positioning statement · example" right={<Tag tone="ind">Draft 3</Tag>} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 17, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
              For <span style={{ background: '#eef0ff', color: 'var(--ind)', borderRadius: 4, padding: '0 4px' }}>finance leads at growing SaaS teams</span> who lose a week to month-end, this is the close tool that <span style={{ background: '#eef0ff', color: 'var(--ind)', borderRadius: 4, padding: '0 4px' }}>gets the books done in two days</span>. Unlike spreadsheets, it reconciles as you go.
            </div>
            <div style={{ display: 'flex', gap: 6 }}><Tag tone="grey">Buyer</Tag><Tag tone="grey">Pain</Tag><Tag tone="grey">Outcome</Tag><Tag tone="grey">Alternative</Tag></div>
          </Ui>
        ),
      },
      {
        tag: 'Voice',
        art: (
          <Ui style={{ gap: 10 }}>
            <UiHead left="Founder interview · 00:14:32" right="Example" />
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--body)' }}>
              …the thing nobody gets is that <mark style={{ background: '#fcefcf', color: 'var(--ink)', padding: '0 2px' }}>month-end isn’t hard, it’s just late</mark>. Everyone’s waiting on everyone…
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid #efeef5', fontSize: 12.5, fontWeight: 500 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 0v6h10M8 3l3 3-3 3" fill="none" stroke="#4f46e5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Became the H2: “Month-end isn’t hard. It’s late.”
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Search and AI',
        art: (
          <Ui style={{ gap: 8 }}>
            <UiHead left="Answer block · example" right={<Tag tone="good">42 words</Tag>} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 15.5 }}>How long should a month-end close take?</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--body)' }}>For a SaaS company under 200 people, five working days is typical and two is achievable with continuous reconciliation…</div>
            <div style={{ display: 'flex', gap: 6 }}><Tag tone="ind">Question heading</Tag><Tag tone="ind">Answer first</Tag></div>
          </Ui>
        ),
      },
      {
        tag: 'Systems',
        art: (
          <Ui style={{ gap: 6 }}>
            <UiHead left="Content matrix · example" right="Weekly" />
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr repeat(3, 1fr)', gap: 6, fontSize: 11.5, color: 'var(--quiet)' }}>
              <span />{['Founders', 'Finance', 'Ops'].map((k) => <span key={k}>{k}</span>)}
              {['Close checklist', 'Tool comparison', 'Audit prep'].map((row, r) => (
                <Fragment key={row}>
                  <span style={{ color: 'var(--ink)', fontSize: 12 }}>{row}</span>
                  {[0, 1, 2].map((c) => {
                    const st = (r + c) % 3;
                    return <span key={`${row}${c}`} style={{ height: 22, borderRadius: 5, background: st === 0 ? '#e3f5ea' : st === 1 ? '#eef0ff' : '#f2f1f6' }} />;
                  })}
                </Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--quiet)', paddingTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#bfe6cc' }} />Published</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#c9cdfb' }} />In review</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#dddbe6' }} />Queued</span>
            </div>
          </Ui>
        ),
      },
      {
        tag: 'Point of view',
        art: (
          <Ui style={{ gap: 8 }}>
            <UiHead left="Opinion piece · example" right={<Tag tone="ind">Founder review</Tag>} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 17, lineHeight: 1.2 }}>The five-day close is a habit, not a law.</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Tag tone="grey">First-party data</Tag><Tag tone="grey">A clear position</Tag></div>
          </Ui>
        ),
      },
    ],
    results: {
      cells: (
        <>
          <VideoCell who="maksim" big="$1M+" cap="in sales from one landing page we designed" quote={t.videos[0].quote} person={t.videos[0].person} role={t.videos[0].jobTitle} duration={t.videos[0].duration} />
          <BarsCell tag="Conversion rate" client="Dimer Health" big="288%" cap="Best conversion increase from a LoudFace build" before="Before" after="After six months" />
          <QuoteCell logo="logos/brandfirm.png" logoAlt="Brandfirm" logoW={108} logoH={22} big={t.cards[2].metric} cap={t.cards[2].caption} quote={t.cards[2].quote} person={t.cards[2].person} role={t.cards[2].jobTitle} face="people/daan-smit.webp" tone="orange" />
          <QuoteCell logo="logos/toku-ink.png" logoAlt="Toku" logoW={70} logoH={20} big={t.cards[0].metric} cap={t.cards[0].caption} quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind" />
          <StatCell tag="Human-written" big="100%" cap="Human-written content: AI accelerates, humans write">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Research and outlines', 'AI-assisted'], ['Every sentence', 'A writer'], ['Final read', 'Your strategist']].map(([k, v]) => (
                <div key={k} className="sk-row"><span className="is-k">{k}</span><span className="is-v" style={{ fontSize: 12.5, color: 'var(--quiet)' }}>{v}</span></div>
              ))}
            </div>
          </StatCell>
        </>
      ),
    },
    signature: {
      eyebrow: 'Brief first',
      title: <>Copy that reads like <span className="ghost">the product built it.</span></>,
      lede: 'Before writing a single headline, we design the information hierarchy. What does a visitor need to understand first? What builds confidence? What triggers action? Every page gets a conversion blueprint before copy is written.',
      node: (
        <div className="sv-brief">
          <div className="sv-doc">
            <div className="sv-doc-head">
              <span className="is-brand"><LfMark size={20} /><span>Messaging brief</span></span>
              <span className="is-meta">Example · a close-management tool</span>
            </div>
            <div className="sv-brief-rows">
              {BRIEF.map((b) => (
                <div key={b.n} className="sv-brief-row">
                  <span className="sv-brief-n">{b.n}</span>
                  <div>
                    <div className="sv-brief-k">{b.k}</div>
                    <div className="sv-brief-v">{b.v}</div>
                  </div>
                  {b.note && <span className="sv-brief-note sk-hand">{b.note}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="sv-brief-page">
            <div className="cro-page">
              <div className="cro-page-bar"><span className="v11-lights"><span /><span /><span /></span></div>
              <div className="cro-page-body" style={{ gap: 0 }}>
                <div className="cro-page-nav"><i className="is-logo" /><i /><i /><i /></div>
                <div className="sv-brief-block"><span className="sv-brief-n">1</span><span className="sv-brief-n">3</span><div className="cro-page-h" style={{ marginTop: 0 }}>Close your books in two days, not ten.</div></div>
                <div className="cro-page-p">For finance teams at SaaS companies of 20 to 200.</div>
                <div className="cro-page-cta">Book a 20-minute demo</div>
                <div className="sv-brief-block is-row"><span className="sv-brief-n">4</span><div className="cro-page-logos" style={{ marginTop: 0, border: 0, padding: 0 }}><i /><i /><i /><i /></div></div>
                <div className="sv-brief-block is-row"><span className="sv-brief-n">2</span><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 18 }}>Month-end isn’t hard. It’s late.</div></div>
                <div className="sv-brief-block is-row"><span className="sv-brief-n">5</span><div style={{ fontSize: 13, color: 'var(--muted)' }}>No migration. Live in a week.</div></div>
              </div>
            </div>
          </div>
          <p className="sv-note" style={{ gridColumn: '1 / -1', marginTop: 0 }}>Illustration: an example brief for a made-up company, and the page each line of it became.</p>
        </div>
      ),
    },
  };
};
