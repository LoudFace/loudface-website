import type { HomeV11Content, WorkingWithUsContent } from '@/lib/content-utils';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, Eyebrow, LfMark, SectionHeadNode, personAvatar } from '../home-v11/ui';
import { Check } from '../pricing-v11/PricingV11';
import { Tag, Ui, UiHead } from '../service-v11/kit';

/**
 * Working with us (Arnel, 12 Nov 2026): what LoudFace needs from a client, what slows the work and what gets results.
 * The 15 rows and the four promises are the same working-with-us.json the proposal's Working together tab reads, so
 * the two never drift. Match mode: every section is a pattern /pricing already has (light hero on plan paper, the
 * compare table with one lifted column, a head beside a hairline list, the shared closing). Tiles from the
 * 2026-11-12 harvest (design-lab/harvest/2026-11-12-working-with-us): the paired statements (30 Ploy), the hairline
 * promise rows (143 Attio), the document beside the headline (384 Craft).
 */

type Block = WorkingWithUsContent['blocks'][number];
type TableBlock = Extract<Block, { rows: unknown }>;
type ListBlock = Extract<Block, { items: unknown }>;

/** The team member who writes the weekly update and the replies in the page's two pictures. */
const UPDATE_AUTHOR = 'tamara-pavlovic';

const Slow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.14" /><path d="M5 8h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);

export function WorkingV11({ c, home }: { c: WorkingWithUsContent; home: HomeV11Content }) {
  const p = c.page;
  const table = c.blocks.find((b): b is TableBlock => 'rows' in b);
  const promises = c.blocks.find((b): b is ListBlock => 'items' in b);
  if (!table || !promises) throw new Error('working-with-us.json needs one table block and one list block');
  const [colNeed, colSlow, colGood] = table.columns;
  const grouped = p.groups.reduce((sum, g) => sum + g.count, 0);
  if (grouped !== table.rows.length) throw new Error(`working-with-us.json: page.groups cover ${grouped} rows, the table has ${table.rows.length}`);
  // each group takes the next `count` rows, in order
  const groups = p.groups.map((g, i) => {
    const start = p.groups.slice(0, i).reduce((sum, earlier) => sum + earlier.count, 0);
    return { ...g, rows: table.rows.slice(start, start + g.count) };
  });

  return (
    <div className="v11 pr ww">
      {/* 1 · the ask, beside the weekly update where every ask arrives with a date */}
      <section className="pr-hero ww-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="pr-hero-top ww-hero-top">
            <div className="pr-hero-copy">
              <div className="pr-hero-eyebrow"><span>{p.eyebrowBrand}</span><span className="is-sub">{p.eyebrowSub}</span></div>
              <h1>{p.headline} <span className="ghost">{p.headlineHighlight}</span></h1>
              <p className="pr-hero-desc" data-speakable="">{c.summary}</p>
              <div className="pr-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{p.primaryCta}</span></a>
                <a href="#list" className="v11-link pr-tap"><span>{p.listLink}</span><ArrowRight /></a>
              </div>
            </div>
            <div className="ww-update" aria-hidden="true">
              <Ui className="ww-doc">
                <UiHead left={<span className="ww-doc-title"><LfMark size={16} />{p.update.title}</span>} right={p.update.week} />
                <div className="ww-doc-from">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the v11 pages draw small avatars as plain img */}
                  <img src={personAvatar(UPDATE_AUTHOR)} alt="" width={28} height={28} />
                  <b>{p.update.from}</b><span>{p.update.time}</span>
                </div>
                <div className="ww-doc-label">{p.update.shippedLabel}</div>
                {p.update.shipped.map((s) => <div key={s} className="pr-mini-check"><Check /><span>{s}</span></div>)}
                <div className="ww-needs">
                  <div className="ww-doc-label">{p.update.needsLabel}</div>
                  {p.update.needs.map((n) => (
                    <div key={n._key} className="ww-need"><span>{n.text}</span><Tag tone="warn">{n.by}</Tag></div>
                  ))}
                </div>
              </Ui>
              <span className="ww-update-note">{p.update.note}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · the fifteen rows, the results column lifted (the pricing compare table's pattern) */}
      <section className="v11-sec v11-warm" id="list">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={p.list.eyebrow} title={<>{p.list.headline} <span className="ghost">{p.list.headlineHighlight}</span></>} body={p.list.intro} bodyWidth={440} />
          <div className="ww-table" role="table">
            <div className="ww-row is-head" role="row">
              <span role="columnheader">{colNeed}</span>
              <span role="columnheader"><Slow />{colSlow}</span>
              <span role="columnheader" className="is-lift"><Check />{colGood}</span>
            </div>
            {groups.map((g) => (
              <div key={g._key} className="ww-group" role="rowgroup">
                <div className="ww-row is-group" role="row">
                  <span role="cell" className="ww-group-title">{g.title}</span>
                  <span role="cell" aria-hidden="true" />
                  <span role="cell" className="is-lift" aria-hidden="true" />
                </div>
                {g.rows.map((r) => (
                  <div key={r._key} className="ww-row" role="row">
                    <span role="rowheader" className="is-label">{r.cells[0]}</span>
                    <span role="cell" className="is-slow"><small>{colSlow}</small>{r.cells[1]}</span>
                    <span role="cell" className="is-lift"><small>{colGood}</small>{r.cells[2]}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="ww-row is-tail" aria-hidden="true"><span /><span /><span className="is-lift" /></div>
          </div>
        </div>
      </section>

      {/* 3 · what we promise back: a head and a reply beside four hairline rows (the pricing questions pattern) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap ww-promise">
          <div className="ww-promise-head">
            <Eyebrow>{p.promise.eyebrow}</Eyebrow>
            <h2 className="v11-h2">{p.promise.headline} <span className="ghost">{p.promise.headlineHighlight}</span></h2>
            <p className="pr-faq-sub">{p.promise.intro}</p>
            <Ui className="pr-mini ww-reply">
              <div className="pr-msg">
                {/* eslint-disable-next-line @next/next/no-img-element -- the v11 pages draw small avatars as plain img */}
                <img loading="lazy" src={personAvatar(UPDATE_AUTHOR)} alt="" width={28} height={28} />
                <div><div className="pr-msg-head"><b>{p.promise.message.from}</b><span>{p.promise.message.time}</span></div><p>{p.promise.message.text}</p></div>
              </div>
              <span className="pr-reply"><i aria-hidden="true" />{p.promise.message.state}</span>
            </Ui>
          </div>
          <ul className="ww-gives">
            {promises.items.map((g) => (
              <li key={g._key}><b>{g.lead}</b><span>{g.text}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: p.closing.heading, agenda: [] }} lede={p.closing.lede} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
