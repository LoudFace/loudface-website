import type { ContactContent, HomeV11Content, PricingV11Content } from '@/lib/content-utils';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { Eyebrow, img } from '../home-v11/ui';
import { OFFICES } from '../contact-v3/data';
import { NextSteps } from './NextSteps';
import { strip } from '@/lib/inline-edit/mark';

/**
 * /contact in v11 (2026-09-25). Copy is the live page's (contact.json); the example screens inside the steps reuse the
 * pricing page's approved examples (pricing-v11.json `steps`). Each section is built against a tile from the Mobbin
 * harvest in design-lab/harvest/2026-09-25/contact-careers-2 (contact-sheets.pdf), named in the comment above it.
 */

/** The leads a caller talks to (operator model: everyone runs the whole account; no role chips). */
const PEOPLE = [
  { slug: 'arnel-bukva', name: 'Arnel Bukva', title: 'Founder & Head of Growth' },
  { slug: 'tamara-pavlovic', name: 'Tamara Pavlovic', title: 'Lead SEO, AEO & GEO Specialist' },
  { slug: 'andrea-van-wyk', name: 'Andrea Van Wyk', title: 'Lead SEO, AEO & GEO Specialist' },
  { slug: 'abhay-tyagi', name: 'Abhay Tyagi', title: 'Lead SEO, AEO & GEO Specialist' },
];
const CITY_PHOTO: Record<string, { src: string; alt: string }> = {
  'San Francisco': { src: 'contact/city-sf.webp', alt: 'Market Street, San Francisco, in the morning' },
  Dubai: { src: 'contact/city-dubai.webp', alt: 'Dubai Silicon Oasis with the downtown skyline behind it' },
};
const EMAIL = 'arnel@loudface.co';

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.4 11.2 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function ContactV11({ c, home, steps }: { c: ContactContent; home: HomeV11Content; steps: PricingV11Content['steps'] }) {
  const h = c.hero;
  const n = c.nextSteps;
  const o = c.offices;
  const facts = [o.facts.reply, o.facts.years, o.facts.sites] as { number: string; numberSuffix?: string; label: string; description: string }[];
  return (
    <div className="v11 ct">
      {/* 1 · the first move beside the call you are booking (01 Ramp live-demo hero, 01 Notion contact + quote card) */}
      <section className="ct-hero" data-hero="light">
        <div className="v11-wrap ct-hero-grid">
          <div className="ct-hero-copy">
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1>{h.headlinePrefix}<span className="ghost">{h.headlineHighlight}</span>{h.headlineSuffix}</h1>
            <p className="ct-hero-desc" data-speakable="">{h.description}</p>
            <div className="ct-hero-ctas">
              <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{h.ctaText}</span></a>
              <span className="ct-mail">{h.emailPrefix}<a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
            </div>
          </div>
          <div className="ct-call" aria-label={strip(h.cardTitle)}>
            <div className="ct-call-head">
              <span className="is-k">{h.cardKicker}</span>
              <span className="is-chip">{h.cardChip}</span>
            </div>
            <div className="ct-call-who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img('team/arnel-bukva.jpg')} alt="" width={56} height={56} />
              <div>
                <b>{h.cardTitle}</b>
                <span>{h.cardMetaVideo} · {h.cardMetaFounder}</span>
              </div>
            </div>
            <div className="ct-call-label">{h.cardLabel}</div>
            <ul>{h.agenda.map((a) => <li key={a}><Check /><span>{a}</span></li>)}</ul>
            <div className="ct-call-slots" aria-hidden="true">
              <span className="is-day">{steps.call.slotDay}</span>
              {steps.call.slotTimes.map((x) => <span key={x.t} className={'on' in x && x.on ? 'is-on' : ''}>{x.t}</span>)}
            </div>
            <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink ct-call-btn"><span>{h.ctaText}</span></a>
          </div>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 2 · what happens after you book, each step with what you receive (03 Clay "what to expect" cards) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{n.eyebrow}</Eyebrow>
              <h2 className="v11-h2">{n.headlinePrefix}<span className="ghost">{n.headlineHighlight}{n.headlineSuffix}</span></h2>
            </div>
            <p>{n.subtitle}</p>
          </div>
          <NextSteps n={n} steps={steps} />
        </div>
      </section>

      {/* 3 · two cities, photographed, with their address and the clock (03 Runway offices + photos, 02 Pentagram) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{o.eyebrow}</Eyebrow>
              <h2 className="v11-h2">{o.headlinePrefix}<span className="ghost">{o.headlineHighlight}{o.headlineSuffix}</span></h2>
            </div>
            <p>{o.subtitle}</p>
          </div>
          <div className="ct-cities">
            {OFFICES.map((city) => {
              const p = CITY_PHOTO[city.city];
              return (
                <figure key={city.city} className="ct-city">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(p.src)} alt={p.alt} width={1600} height={1200} loading="lazy" />
                  <figcaption>
                    <b>{city.city}</b>
                    <span>{city.lines.join(', ')}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className="ct-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <b>{f.number}{f.numberSuffix}</b>
                <span><strong>{f.label}</strong>{f.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · the people who answer, with the founder's promise (03 Airbnb founders, 03 Runway crew) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap ct-people">
          <blockquote className="ct-quote">
            <p>{o.founderQuote}</p>
            <cite>Arnel Bukva, Founder, LoudFace</cite>
          </blockquote>
          <div className="ct-faces">
            {PEOPLE.map((p) => (
              <figure key={p.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(`team/${p.slug}.jpg`)} alt={p.name} width={300} height={360} loading="lazy" />
                <figcaption><b>{p.name}</b><span>{p.title}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · the honest answers */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap v11-faq">
          <div className="v11-faq-head">
            <h2 className="v11-h2">{c.faq.headline}</h2>
            <p className="ct-faq-sub">{c.faq.intro}</p>
          </div>
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

      <Closing c={{ ...home.closing, heading: `${c.coverCta.headlinePrefix}${c.coverCta.headlineHighlight}${c.coverCta.headlineSuffix}`, agenda: [], email: EMAIL }} lede={c.coverCta.description} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
