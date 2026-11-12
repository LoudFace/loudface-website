import Link from 'next/link';
import type { HomeV11Content, WorkingWithUsContent } from '@/lib/content-utils';
import { CONTACT_EMAIL } from '@/lib/site-contact';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, Eyebrow, LfMark, SectionHeadNode, personAvatar } from '../home-v11/ui';
import { ChapterRail } from './ChapterRail';

/**
 * Working with us, option A "Four chapters" (Tamara's Paper board, 12 Nov 2026, file "LinkedIn Visuals", page
 * "Working with us · 3 options"), with Andrea's copy notes and Abhay's AI-answer notes of 12 Nov 2026.
 *
 * The 15 asks are a real numbered list: each ask is a heading, and its two outcomes sit under it as labelled text
 * ("Without it:", "With it:"), so an AI engine can lift one item whole and the Markdown copy keeps the structure.
 * The four group names are the chapter headings. A contents rail (desktop) or chips (tablet, phone) stay on screen
 * until the list ends. The rows and the four promises are the same working-with-us.json the proposal's Working
 * together tab reads, so the two never drift. The FAQ follows the /pricing pattern; its schema is built in page.tsx
 * from the same items.
 */

type Block = WorkingWithUsContent['blocks'][number];
type TableBlock = Extract<Block, { rows: unknown }>;
type ListBlock = Extract<Block, { items: unknown }>;

/** The team member who writes the weekly update and the reply in the page's two pictures. */
const UPDATE_AUTHOR = 'tamara-pavlovic';
/** The person the FAQ points to, as on /pricing. */
const FAQ_PERSON = 'arnel-bukva';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const Slow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#e4e4ea" /><path d="M5 8h6" fill="none" stroke="#6b6788" strokeWidth="1.6" strokeLinecap="round" /></svg>
);
const Good = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#4f46e5" /><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Shipped = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#e3f5ea" /><path d="M6 9.2l2 2 4-4.4" fill="none" stroke="#1b7f4b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function WorkingV11({ c, home }: { c: WorkingWithUsContent; home: HomeV11Content }) {
  const p = c.page;
  const table = c.blocks.find((b): b is TableBlock => 'rows' in b);
  const promises = c.blocks.find((b): b is ListBlock => 'items' in b);
  if (!table || !promises) throw new Error('working-with-us.json needs one table block and one list block');
  const [, colSlow, colGood] = table.columns;
  const grouped = p.groups.reduce((sum, g) => sum + g.count, 0);
  if (grouped !== table.rows.length) throw new Error(`working-with-us.json: page.groups cover ${grouped} rows, the table has ${table.rows.length}`);
  // each group takes the next `count` rows, in order; the numbering runs on across groups (1 to 15)
  const groups = p.groups.map((g, i) => {
    const start = p.groups.slice(0, i).reduce((sum, earlier) => sum + earlier.count, 0);
    return { ...g, id: slug(g.title), start: start + 1, rows: table.rows.slice(start, start + g.count) };
  });
  const promiseId = slug(p.promise.eyebrow);
  const chapters = [
    ...groups.map((g) => ({ id: g.id, title: g.title, count: g.count })),
    { id: promiseId, title: p.promise.eyebrow, count: promises.items.length },
  ];

  return (
    <div className="v11 pr ww">
      {/* 1 · the ask and the one-line answer, beside the weekly update where every ask arrives with a date */}
      <section className="pr-hero ww-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="ww-hero-top">
            <div className="ww-hero-copy">
              <div className="ww-eyebrow"><span>{p.eyebrowBrand}</span><span className="is-sub">{p.eyebrowSub}</span></div>
              <h1>{p.headline} <span className="ghost">{p.headlineHighlight}</span></h1>
              <p className="ww-hero-desc" data-speakable=""><strong>{p.answer}</strong> {c.summary}</p>
              <div className="ww-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{p.primaryCta}</span></a>
                <a href="#list" className="v11-link ww-tap"><span>{p.listLink}</span><ArrowRight /></a>
              </div>
            </div>
            <div className="ww-plate" aria-hidden="true">
              <div className="ww-doc">
                <div className="ww-doc-head">
                  <span className="ww-doc-title"><LfMark size={18} />{p.update.title}</span>
                  <span>{p.update.week}</span>
                </div>
                <div className="ww-doc-from">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the v11 pages draw small avatars as plain img */}
                  <img src={personAvatar(UPDATE_AUTHOR)} alt="" width={30} height={30} />
                  <b>{p.update.from}</b><span>{p.update.time}</span>
                </div>
                <div className="ww-doc-label">{p.update.shippedLabel}</div>
                <div className="ww-doc-shipped">
                  {p.update.shipped.map((s) => <div key={s}><Shipped /><span>{s}</span></div>)}
                </div>
                <div className="ww-needs">
                  <div className="ww-needs-label">{p.update.needsLabel}</div>
                  {p.update.needs.map((n) => (
                    <div key={n._key} className="ww-need"><b>{n.text}</b><span>{n.by}</span></div>
                  ))}
                </div>
              </div>
              <span className="ww-plate-note">{p.update.note}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · the full list: four chapters, each ask a heading with its two outcomes under it */}
      <section className="v11-sec v11-warm ww-list" id="list">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={p.list.eyebrow} title={<>{p.list.headline} <span className="ghost">{p.list.headlineHighlight}</span></>} body={p.list.intro} bodyWidth={440} />
        </div>
        <div className="ww-body">
          <ChapterRail items={chapters} label={p.list.railLabel} variant="chips" />
          <div className="v11-wrap ww-body-grid">
            <aside className="ww-rail-col"><ChapterRail items={chapters} label={p.list.railLabel} variant="rail" /></aside>
            <div className="ww-chapters">
              {groups.map((g) => (
                <section key={g._key} id={g.id} className="ww-chapter" aria-labelledby={`${g.id}-h`}>
                  <h3 id={`${g.id}-h`} className="ww-chapter-title">{g.title}</h3>
                  <ol className="ww-asks" start={g.start}>
                    {g.rows.map((r) => (
                      <li key={r._key} className="ww-ask">
                        <h4>{r.cells[0]}</h4>
                        <div className="ww-outs">
                          <p className="ww-out is-slow"><Slow /><strong>{colSlow}:</strong> <span>{r.cells[1]}</span></p>
                          <p className="ww-out is-good"><Good /><strong>{colGood}:</strong> <span>{r.cells[2]}</span></p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 · in return: the head and a same-day reply, then the four promises in a row */}
      <section className="v11-sec v11-white ww-return" id={promiseId}>
        <div className="v11-wrap">
          <div className="ww-return-top">
            <div className="ww-return-head">
              <Eyebrow>{p.promise.eyebrow}</Eyebrow>
              <h2 className="v11-h2">{p.promise.headline} <span className="ghost">{p.promise.headlineHighlight}</span></h2>
              <p>{p.promise.intro}</p>
            </div>
            <div className="ww-reply" aria-hidden="true">
              <div className="ww-reply-msg">
                {/* eslint-disable-next-line @next/next/no-img-element -- the v11 pages draw small avatars as plain img */}
                <img loading="lazy" src={personAvatar(UPDATE_AUTHOR)} alt="" width={34} height={34} />
                <div>
                  <div className="ww-reply-head"><b>{p.promise.message.from}</b><span>{p.promise.message.time}</span></div>
                  <p>{p.promise.message.text}</p>
                </div>
              </div>
              <span className="ww-reply-state"><i />{p.promise.message.state}</span>
            </div>
          </div>
          <ul className="ww-gives">
            {promises.items.map((g) => (
              <li key={g._key}><h3>{g.lead}</h3><p>{g.text}</p></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 · questions, beside a person you can write to (the /pricing FAQ) */}
      <section className="v11-sec v11-warm" id="questions">
        <div className="v11-wrap v11-faq ww-faq">
          <div className="v11-faq-head">
            <Eyebrow>{p.faq.eyebrow}</Eyebrow>
            <h2 className="v11-h2"><span className="ghost">{p.faq.headlineHighlight}</span> {p.faq.headlineRest}</h2>
            <p className="ww-faq-sub">{p.faq.intro}</p>
            <div className="ww-person">
              {/* eslint-disable-next-line @next/next/no-img-element -- the v11 pages draw small avatars as plain img */}
              <img loading="lazy" src={personAvatar(FAQ_PERSON)} alt="" width={44} height={44} />
              <div><b>{p.faq.personName}</b><span>{p.faq.personRole}</span><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
            </div>
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{p.faq.ctaText}</span></a>
            <nav className="ww-next" aria-label={p.faq.linksLabel}>
              <span>{p.faq.linksLabel}</span>
              {p.faq.links.map((l) => (
                <Link key={l._key} href={l.href} className="v11-link ww-tap"><span>{l.label}</span><ArrowRight /></Link>
              ))}
            </nav>
          </div>
          <div className="v11-faq-list">
            {p.faq.items.map((f, i) => (
              <details key={f._key} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: p.closing.heading, agenda: [] }} lede={p.closing.lede} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
