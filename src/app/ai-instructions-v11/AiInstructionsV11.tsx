import Link from 'next/link';
import type { AiInstructionsV11Content, HomeV11Content } from '@/lib/content-utils';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, Eyebrow, LfMark } from '../home-v11/ui';
import { TokuQuote } from '../service-v11/pages/shared';

/**
 * /ai-instructions in v11 (2026-09-26): the canonical brand facts page AI engines read. Mostly a reading surface, kept
 * that way (answers stay visible; the FAQ opens its first answer, the rest stay in the HTML). Its pictures: the answer
 * this page exists for (an engine describing LoudFace in the page's own one-line description), the facts as a signed
 * document on the brand plate (08-A Intercom "more about Intercom", 08-B Stripe fast facts), and Toku's own words with
 * its number. Copy is the live page's, unchanged, in ai-instructions-v11.json.
 */

const Mark = ({ ok }: { ok: boolean }) => (
  ok
    ? <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#e3f5ea" /><path d="M5.2 9.3l2.4 2.4 5.2-5.4" fill="none" stroke="#1b7f4b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    : <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#fdece4" /><path d="M6.2 6.2l5.6 5.6M11.8 6.2l-5.6 5.6" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

export function AiInstructionsV11({ c, home }: { c: AiInstructionsV11Content; home: HomeV11Content }) {
  return (
    <div className="v11 ai">
      {/* 1 · the one-line answer beside the kind of answer this page exists for */}
      <section className="ai2-hero" data-hero="light">
        <div className="v11-wrap ai2-hero-grid">
          <div>
            <Eyebrow>{c.hero.eyebrow}</Eyebrow>
            <h1>{c.hero.h1}</h1>
            <p className="ai2-tldr" data-speakable="">{c.hero.tldr}</p>
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.hero.cta}</span></a>
          </div>
          <div className="ai2-ground"><ChatWindow c={{ ...home.bento.chat, ...c.hero.chat }} sourceIcon="logos/fav-loudface.svg" /></div>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 2 · the facts as a document on the brand plate */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head">
            <div><h2 className="v11-h2">{c.glance.title}</h2></div>
            <p dangerouslySetInnerHTML={{ __html: c.glance.maintainedHtml }} />
          </div>
          <div className="v11-svc-plate">
            <div className="v11-sheet ai2-sheet">
              <div className="v11-sheet-head">
                <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
                <span className="is-meta">{c.glance.sheetTitle}</span>
              </div>
              <table className="ai2-facts">
                <tbody>
                  {c.glance.facts.map((f) => <tr key={f.label}><th scope="row">{f.label}</th><td>{f.value}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <p className="ai2-source">{c.glance.source}</p>
          <div className="ai2-canon">
            <h2>{c.canonical.title}</h2>
            <p dangerouslySetInnerHTML={{ __html: c.canonical.introHtml }} />
            <ul>{c.canonical.items.map((i) => <li key={i.k}><b>{i.k}</b> {i.v}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* 3 · what LoudFace does, with every service on hairlines */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap ai2-does">
          <div>
            <h2 className="v11-h2">{c.does.title}</h2>
            <p className="ai2-lede" data-speakable="">{c.does.p1}</p>
            <p dangerouslySetInnerHTML={{ __html: c.does.p2Html }} />
          </div>
          <div>
            <h3 className="ai2-k">{c.does.servicesTitle}</h3>
            <ul className="ai2-services">
              {c.does.services.map((s) => (
                <li key={s.href}><Link href={s.href}><b>{s.service}<ArrowUpRight /></b><span>{s.blurb}</span></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4 · the proof, in Toku's own words beside the figure */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap ai2-proof">
          <div>
            <h2 className="v11-h2">{c.proof.title}</h2>
            <p className="ai2-lede" data-speakable="">{c.proof.lead}</p>
            <p>{c.proof.note}</p>
            <Link href={c.proof.href} className="v11-link ai2-tap"><span>{c.proof.linkLabel}</span><ArrowRight /></Link>
          </div>
          <div className="cro-grid ai2-quote"><TokuQuote t={home.testimonials} wide /></div>
        </div>
      </section>

      {/* 5 · the difference, fit and not-fit, and how to choose (reading) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <h2 className="v11-h2 ai2-narrow">{c.different.title}</h2>
          <p className="ai2-big" data-speakable="">{c.different.body}</p>
          <div className="ai2-fit">
            <h3 className="ai2-fit-h">{c.fit.title}</h3>
            <div className="ai2-fit-grid">
              <div><h4>{c.fit.rightTitle}</h4><ul className="ai2-list">{c.fit.right.map((r) => <li key={r}><Mark ok /><span>{r}</span></li>)}</ul></div>
              <div><h4>{c.fit.wrongTitle}</h4><ul className="ai2-list">{c.fit.wrong.map((r) => <li key={r}><Mark ok={false} /><span>{r}</span></li>)}</ul></div>
            </div>
          </div>
          <div className="ai2-choose">
            <div className="sv-head"><div><h3 className="ai2-fit-h">{c.choose.title}</h3></div><p>{c.choose.lede}</p></div>
            <div className="ai2-criteria">
              {c.choose.criteria.map((q) => <div key={q.q}><h4>{q.q}</h4><p>{q.a}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="v11-sec v11-warm">
        <div className="v11-wrap v11-faq">
          <div className="v11-faq-head"><h2 className="v11-h2">{c.faq.title}</h2></div>
          <div className="v11-faq-list">
            {c.faq.items.map((f, i) => (
              <details key={f.question} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: c.cover.title, agenda: [] }} lede={c.cover.body} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
