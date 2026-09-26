import type { HomeV11Content } from '@/lib/content-utils';
import { strip } from '@/lib/inline-edit/mark';
import { CalEmbed } from './CalEmbed';
import { Eyebrow, img } from './ui';

type C = HomeV11Content['closing'];

/** `lede`: one paragraph in place of the agenda, for a page whose call is about its own subject (a service page). */
export function Closing({ c, lede }: { c: C; lede?: string }) {
  return (
    // id="book": the v3 pages linked their booking section as #book (/contact#book, /pricing#book), and old links still do
    <section className="v11-closing" id="book">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img('closing-terrain-1920.webp')} srcSet={`${img('closing-terrain-1280.webp')} 1280w, ${img('closing-terrain-1920.webp')} 1920w, ${img('closing-terrain-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt="" className="v11-closing-bg" loading="lazy" />
      <div className="v11-wrap v11-closing-inner">
        <div className="v11-closing-copy">
          <Eyebrow dot="#ffffff" color="#dcd9fe">{c.eyebrow}</Eyebrow>
          <h2 className="v11-closing-h2" dangerouslySetInnerHTML={{ __html: c.heading }} />
          {lede && <p className="v11-closing-lede">{lede}</p>}
          {c.agenda.length > 0 && <div className="v11-agenda">
            {c.agenda.map((a, i) => (
              <div key={i} className="v11-agenda-item">
                <span className="v11-agenda-tick" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2.2 5.6l2 2 4.4-4.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div><div className="is-head">{a.heading}</div><div className="is-body">{a.body}</div></div>
              </div>
            ))}
          </div>}
          <div className="v11-closing-cta">
            <span className="v11-closing-mail"><span>{c.emailLead}</span> <a href={`mailto:${strip(c.email)}`}>{c.email}</a></span>
          </div>
        </div>
        <div className="v11-closing-card">
          <div className="v11-cal"><CalEmbed /></div>
          <div className="v11-reply"><span className="v11-reply-dot" /><span>{c.reply}</span></div>
        </div>
      </div>
    </section>
  );
}
