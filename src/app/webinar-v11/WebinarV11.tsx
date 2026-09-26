import Link from 'next/link';
import { rawContent, type AiAuditContent, type HomeV11Content, type WebinarAiSearchContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { WebinarConsentGate } from '../(site)/webinar/ai-search-visibility/_components/WebinarConsentGate';
import { Scorecard } from '../audit-v11/AuditPageV11';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { Eyebrow, img } from '../home-v11/ui';
import { strip } from '@/lib/inline-edit/mark';

/**
 * /webinar/ai-search-visibility in v11 (2026-09-26). The live page's copy (webinar-ai-search.json) on the event
 * pattern from design-lab/harvest/2026-09-26/singles: 03-A Stripe Sessions (the ticket beside the registration),
 * 03-C Slack events, 03-D Intercom webinars (speakers as photographs). The registration is the live consent gate.
 * Once the start time (`hero.startsAt`) has passed, the page stops selling a seat: the hero and closing point to the
 * recording in the recap post, the closing becomes the usual booking stage, and the pre-session audit pitch goes.
 */

/** Whether the session has begun. The page renders on each request, so the clock is read then. */
function hasStarted(startsAt: string): boolean {
  return Date.now() > Date.parse(startsAt);
}

export function WebinarV11({ c, audit, home }: { c: WebinarAiSearchContent; audit: AiAuditContent; home: HomeV11Content }) {
  const h = c.hero;
  const total = c.agenda.items.reduce((n, a) => n + a.minutes, 0);
  // the start time is read unmarked: in editing mode the visible value carries markers and would not parse
  const past = hasStarted(rawContent<WebinarAiSearchContent>('webinar-ai-search').hero.startsAt);
  return (
    <div className="v11 wb">
      {/* 1 · the session: title and registration beside the ticket (who, when, and the result it is about) */}
      <section className="wb-hero" data-hero="light">
        <div className="v11-wrap wb-hero-grid">
          <div>
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1>{h.h1} <span className="ghost">{h.h1Ghost}</span> {h.h1End}</h1>
            <p className="wb-sub">{h.sub}</p>
            {past ? (
              <div className="wb-past">
                <p>{c.past.note} <b>{h.date}</b>. {c.past.recapLabel}</p>
                <Link href={c.past.href} className="v11-btn is-ink"><span>{c.past.cta}</span></Link>
              </div>
            ) : (
              <div className="wb-gate"><WebinarConsentGate source="hero" /></div>
            )}
          </div>
          <div className="wb-ticket">
            <div className="wb-ticket-top">
              <div className="wb-when">
                <b>{h.date}</b>
                <span>{h.time} · {h.format}</span>
              </div>
              <div className="wb-logos">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img('logos/toku-white.png')} alt="Toku" width={70} height={20} />
                <span aria-hidden="true">×</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset('/images/webflow-logo.png')} alt="Webflow" width={96} height={16} className="is-wf" />
              </div>
            </div>
            <div className="wb-stat">
              <b>{h.statValue}</b>
              <span>{h.statLabel}</span>
            </div>
            <div className="wb-ticket-people">
              {c.speakers.people.map((p) => (
                <div key={p.photo} className="wb-mini">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(`/images/speakers/${strip(p.photo)}.jpg`)} alt="" width={44} height={44} />
                  <span><b>{p.person}</b><i>{p.role}</i></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2 · what you will leave with, beside the answer it is about: Toku named by ChatGPT */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap wb-learn">
          <div className="wb-chat-ground"><ChatWindow c={home.bento.chat} /></div>
          <div>
            <Eyebrow>{c.takeaways.eyebrow}</Eyebrow>
            <h2 className="v11-h2">{c.takeaways.title}</h2>
            <ul className="wb-takeaways">{c.takeaways.items.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* 3 · the speakers as people (03-D Intercom webinar speakers) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head"><div><Eyebrow>{c.speakers.eyebrow}</Eyebrow><h2 className="v11-h2">{c.speakers.title}</h2></div></div>
          <div className="wb-speakers">
            {c.speakers.people.map((p) => (
              <figure key={p.photo} className="wb-speaker">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={strip(p.photo) === 'arnel-bukva' ? img('team/arnel-bukva.jpg') : asset(`/images/speakers/${strip(p.photo)}.jpg`)} alt={strip(p.person)} width={320} height={320} loading="lazy" />
                <figcaption>
                  <b>{p.person}</b>
                  <span className="is-role">{p.role}</span>
                  <p>{p.bio}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · the run of show: the fifty minutes drawn to scale, then the rows */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head"><div><Eyebrow>{c.agenda.eyebrow}</Eyebrow><h2 className="v11-h2">{c.agenda.title}</h2></div></div>
          <div className="wb-run" aria-hidden="true">
            {c.agenda.items.map((a, i) => (
              <span key={a.title} className={i % 2 ? 'is-b' : ''} style={{ flexGrow: a.minutes / total }}><b>{a.duration}</b></span>
            ))}
          </div>
          <ol className="wb-agenda">
            {c.agenda.items.map((a) => (
              <li key={a.title}><span className="is-d">{a.duration}</span><span className="is-t">{a.title}</span></li>
            ))}
          </ol>
        </div>
      </section>

      {past ? (
        <Closing c={home.closing} />
      ) : (
        <>
        {/* 5 · registration on the closing stage */}
        <section className="v11-closing wb-closing" id="register">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img('closing-terrain-1920.webp')} srcSet={`${img('closing-terrain-1280.webp')} 1280w, ${img('closing-terrain-1920.webp')} 1920w, ${img('closing-terrain-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt="" className="v11-closing-bg" loading="lazy" />
          <div className="v11-wrap wb-closing-grid">
            <div>
              <Eyebrow dot="#ffffff" color="#dcd9fe">{c.register.eyebrow}</Eyebrow>
              <h2 className="v11-closing-h2">{c.register.title}</h2>
              <p className="v11-closing-lede">{h.date} · {h.time} · {h.format}</p>
            </div>
            <div className="wb-gate is-card"><WebinarConsentGate source="register" /></div>
          </div>
        </section>

        {/* 6 · before the session: the audit, with the report it returns */}
        <section className="v11-sec v11-white">
          <div className="v11-wrap wb-audit">
            <div>
              <Eyebrow>{c.audit.eyebrow}</Eyebrow>
              <h2 className="wb-audit-h">{c.audit.title}</h2>
              <p>{c.audit.body}</p>
              <div className="wb-audit-cta">
                <Link href="/ai-audit" className="v11-btn is-ink"><span>{c.audit.cta}</span></Link>
                <span>{c.audit.note}</span>
              </div>
            </div>
            <div className="wb-audit-pic"><Scorecard x={audit.example} /></div>
          </div>
        </section>
        </>
      )}
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}

