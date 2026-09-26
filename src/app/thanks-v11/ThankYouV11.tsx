import Link from 'next/link';
import type { ContactContent, HomeV11Content, PricingV11Content, ThankYouContent } from '@/lib/content-utils';
import { NextSteps } from '../contact-v11/NextSteps';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowUpRight, Eyebrow, img } from '../home-v11/ui';

/**
 * /thank-you in v11 (2026-09-26), after someone books a call. The confirmation beside the booked call itself (06-A
 * Intercom "your ticket has been submitted"), what happens next (the contact page's steps, shared), and somewhere
 * useful to go while they wait, as two picture cards. Copy in thank-you.json; the call card and steps read
 * contact.json and pricing-v11.json, the same words the visitor saw before booking. The call card names no time: the
 * visitor's own slot is in their calendar invite, and an example slot here would read as theirs (review, 2026-09-26).
 */

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.4 11.2 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function ThankYouV11({ t, contact, steps, home, blogCover }: { t: ThankYouContent; contact: ContactContent; steps: PricingV11Content['steps']; home: HomeV11Content; blogCover?: string }) {
  const h = contact.hero;
  const n = contact.nextSteps;
  const covers = [img('cases/dimer-mobile.webp'), blogCover ? `${blogCover}?w=1000&fm=webp&q=80` : img('cases/genie-site.webp')];
  return (
    <div className="v11 ty">
      {/* 1 · the confirmation beside the call that is now booked */}
      <section className="ty-hero" data-hero="light">
        <div className="v11-wrap ty-hero-grid">
          <div>
            <span className="ty-tick" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 28 28"><path d="M7 14.5l4.6 4.6L21.5 9" fill="none" stroke="#1b7f4b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <h1>{t.hero.title} <span className="ghost">{t.hero.titleGhost}</span></h1>
            <p className="ty-body">{t.hero.body}</p>
          </div>
          <div className="ct-call ty-call">
            <div className="ct-call-head">
              <span className="is-k">{h.cardKicker}</span>
              <span className="ty-booked">{t.hero.bookedLabel}</span>
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
          </div>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 2 · what happens next (the contact page's steps) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{n.eyebrow}</Eyebrow>
              <h2 className="v11-h2">{n.headlinePrefix}<span className="ghost">{n.headlineHighlight}{n.headlineSuffix}</span></h2>
            </div>
            <p>{n.subtitle}</p>
          </div>
          <NextSteps n={n} steps={steps} showSlot={false} />
        </div>
      </section>

      {/* 3 · while you wait: two places worth going, as pictures */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head"><div><h2 className="v11-h2">{t.wait.title}</h2></div></div>
          <div className="ty-cards">
            {t.wait.cards.map((k, i) => (
              <Link key={k.href} href={k.href} className="ty-card">
                <div className="in-card-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={covers[i]} alt="" width={1000} height={625} loading="lazy" />
                </div>
                <span className="is-t">{k.title}<ArrowUpRight /></span>
                <span className="is-b">{k.body}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
