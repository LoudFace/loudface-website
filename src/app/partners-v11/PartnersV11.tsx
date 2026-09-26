import type { HomeV11Content, PartnersV11Content } from '@/lib/content-utils';
import { PartnerApplicationForm } from '../(site)/partners/_components/PartnerApplicationForm';
import { PartnersCTALink } from '../(site)/partners/_components/PartnersCTALink';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, Eyebrow, LfMark, img } from '../home-v11/ui';
import { IndustryVoices } from '../seo-for-v11/voices';

/**
 * /partners in v11 (2026-09-26). The live page's copy (partners.json) with each section built against a tile from
 * design-lab/harvest/2026-09-26/singles: 04-A Ramp partner hero, 04-B Framer "earn 50%" cards, 05-A Webflow affiliate
 * "how it works", 05-D Webflow requirements table. The hero's picture is a partner statement (example): the offer
 * shown as the thing a partner receives every month.
 */

/** The leads a referred client works with (operator model; a sample of the team). */
const LEADS = [
  { slug: 'arnel-bukva', name: 'Arnel Bukva' },
  { slug: 'tamara-pavlovic', name: 'Tamara Pavlovic' },
  { slug: 'andrea-van-wyk', name: 'Andrea Van Wyk' },
  { slug: 'abhay-tyagi', name: 'Abhay Tyagi' },
];

const Tick = ({ on = true }: { on?: boolean }) => (
  on
    ? <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#e3f5ea" /><path d="M5.2 9.3l2.4 2.4 5.2-5.4" fill="none" stroke="#1b7f4b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    : <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#fdece4" /><path d="M6.2 6.2l5.6 5.6M11.8 6.2l-5.6 5.6" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

/** The example statement: twelve monthly payouts and the running total, drawn to scale. */
export function Statement({ s }: { s: PartnersV11Content['statement'] }) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="pt-stmt">
      <div className="pt-stmt-head">
        <span className="is-brand"><LfMark size={18} /><span>{s.title}</span></span>
        <span className="is-meta">{s.label}</span>
      </div>
      <div className="pt-stmt-client">
        <div><b>{s.client}</b><span>{s.retainer}</span></div>
        <span className="pt-stmt-rate">{s.rate}</span>
      </div>
      <div className="pt-stmt-k">{s.chartLabel}</div>
      <div className="pt-stmt-chart" aria-hidden="true">
        {months.map((m) => (
          <div key={m} className="pt-stmt-col">
            <div className="pt-stmt-bar"><i style={{ height: `${(m / 12) * 100}%` }} /></div>
            <span>{m}</span>
          </div>
        ))}
      </div>
      <div className="pt-stmt-rows">
        {[3, 2, 1].map((m) => (
          <div key={m} className="pt-stmt-row">
            <span>{s.monthLabel} {m}</span>
            <b>{s.payout}</b>
            <span className="is-paid">{s.status}</span>
          </div>
        ))}
      </div>
      <div className="pt-stmt-total"><span>{s.totalLabel}</span><b>{s.total}</b></div>
    </div>
  );
}

export function PartnersV11({ c, home }: { c: PartnersV11Content; home: HomeV11Content }) {
  const cta = 'v11-btn is-ink';
  return (
    <div className="v11 pt">
      {/* 1 · the offer beside the statement a partner receives (04-A Ramp partner hero) */}
      <section className="pt-hero" data-hero="light">
        <div className="v11-wrap pt-hero-grid">
          <div>
            <Eyebrow>{c.hero.eyebrow}</Eyebrow>
            <h1>{c.hero.h1}</h1>
            <p className="pt-sub">{c.hero.sub}</p>
            <PartnersCTALink source="hero" className={cta}><span>{c.hero.cta}</span></PartnersCTALink>
          </div>
          <div className="pt-ground"><Statement s={c.statement} /></div>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 2 · the earnings table (05-D Webflow requirements table) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head">
            <div><Eyebrow>{c.earnings.eyebrow}</Eyebrow><h2 className="v11-h2">{c.earnings.title}</h2></div>
            <p>{c.earnings.lede}</p>
          </div>
          <div className="v11-table-wrap is-plain">
            <table className="sv-table pt-table">
              <thead><tr>{c.earnings.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr></thead>
              <tbody>
                {c.earnings.rows.map((r) => (
                  <tr key={r.retainer}><th scope="row">{r.retainer}</th><td className="is-ind">{r.monthly}</td><td>{r.y1}</td><td className="is-strong">{r.y2}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pt-note">{c.earnings.note}</p>
        </div>
      </section>

      {/* 3 · how it works, each step with what arrives (05-A Webflow affiliate, 05-B Vercel steps) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head"><div><h2 className="v11-h2">{c.steps.title} <span className="ghost">{c.steps.titleGhost}</span></h2></div></div>
          <ol className="pt-steps">
            {c.steps.items.map((s, i) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {'bullets' in s && s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
                {s.detail && <p className="is-detail">{s.detail}</p>}
                <div className="pt-ui">
                  {c.steps.ui[i]?.map((r) => (
                    <div key={r.k} className={`pt-ui-row is-${r.tone}`}><span className="is-k">{r.k}</span>{r.v && <span className="is-v">{r.v}</span>}</div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · the terms: one accent card and one plain (04-B Framer earn cards) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="pt-terms">
            <div className="pt-term is-accent">
              <Eyebrow dot="#ffffff" color="#dcd9fe">{c.terms.earnEyebrow}</Eyebrow>
              <h2>{c.terms.earnTitle}</h2>
              <p>{c.terms.earnBody}</p>
            </div>
            <div className="pt-term">
              <Eyebrow>{c.terms.qualifyEyebrow}</Eyebrow>
              <h2>{c.terms.qualifyTitle}</h2>
              <p>{c.terms.qualifyBody}</p>
              <PartnersCTALink source="earn_section" className={cta}><span>{c.terms.cta}</span></PartnersCTALink>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · why: the people who do the work, beside what they promise */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap pt-why">
          <div>
            <Eyebrow>{c.why.eyebrow}</Eyebrow>
            <h2 className="v11-h2 pt-why-h">{c.why.title}</h2>
            <ul className="pt-list">{c.why.items.map((w) => <li key={w}><Tick /><span>{w}</span></li>)}</ul>
          </div>
          <div className="pt-faces">
            {LEADS.map((p) => (
              <figure key={p.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(`team/${p.slug}.jpg`)} alt="" width={580} height={704} loading="lazy" />
                <figcaption>{p.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <div className="sv-head"><div><h2 className="v11-h2">{c.voices.title}</h2></div><p>{c.voices.lede}</p></div>
          <IndustryVoices t={home.testimonials} avoid={[]} />
        </div>
      </section>

      {/* 6 · criteria on hairlines */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head"><div><Eyebrow>{c.criteria.eyebrow}</Eyebrow><h2 className="v11-h2">{c.criteria.title}</h2></div></div>
          <div className="pt-criteria">
            <div><h3>{c.criteria.rightTitle}</h3><ul className="pt-list">{c.criteria.right.map((r) => <li key={r}><Tick /><span>{r}</span></li>)}</ul></div>
            <div><h3>{c.criteria.notTitle}</h3><ul className="pt-list">{c.criteria.not.map((r) => <li key={r}><Tick on={false} /><span>{r}</span></li>)}</ul></div>
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

      {/* 7 · the application beside the promise */}
      <section className="v11-sec v11-white" id="apply">
        <div className="v11-wrap pt-apply">
          <div className="pt-apply-copy">
            <Eyebrow>{c.apply.eyebrow}</Eyebrow>
            <h2 className="v11-h2">{c.apply.title}</h2>
            <p>{c.apply.body}</p>
          </div>
          <div className="pt-form"><PartnerApplicationForm /></div>
        </div>
      </section>

      {/* the closing stage without the terrain: nothing sits on it here (review, 2026-09-26) */}
      <section className="v11-closing pt-closing">
        <div className="v11-wrap">
          <Eyebrow dot="#ffffff" color="#dcd9fe">{c.hero.eyebrow}</Eyebrow>
          <h2 className="v11-closing-h2">{c.final.title}</h2>
          <p className="v11-closing-lede">{c.final.body}</p>
          <div className="v11-closing-cta"><a href="#apply" className="v11-btn is-white"><span>{c.final.cta}</span><ArrowRight /></a></div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
