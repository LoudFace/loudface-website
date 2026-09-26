import type { HomeV11Content } from '@/lib/content-utils';
import type { LegalView } from '../legal-v3/LegalPageV3';
import { FooterV11 } from '../home-v11/FooterV11';
import { Eyebrow } from '../home-v11/ui';
import { strip } from '@/lib/inline-edit/mark';

/**
 * LegalPageV11: /privacy, /terms and /cookies in v11 (2026-09-26). A reading surface: a quiet light head with the
 * date, then one column of text beside its contents rail (07-A Stripe privacy policy, 07-B Miro legal information).
 * No picture and no pitch (DESIGN.md §2.7 exempts reading sections). The text is the pages' own (legal-v11/*.tsx),
 * unchanged. Labels come from the view and home-v11.json so nothing is written here.
 */
export function LegalPageV11({ view: v, home, labels }: { view: LegalView; home: HomeV11Content; labels: { updated: string; contents: string } }) {
  return (
    <div className="v11 lg">
      <section className="lg-hero" data-hero="light">
        <div className="v11-wrap">
          <Eyebrow>{v.eyebrow}</Eyebrow>
          <h1>{v.h1}</h1>
          {v.sub && <p className="lg-sub">{v.sub}</p>}
          <p className="lg-date">{labels.updated} {v.lastUpdated}</p>
        </div>
      </section>
      <section className="v11-sec v11-white lg-body-sec">
        <div className="v11-wrap lg-grid">
          <nav className="sv-toc lg-toc" aria-label={strip(labels.contents)}>
            <div className="sv-toc-k">{labels.contents}</div>
            {v.sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.heading}</a>)}
          </nav>
          <div className="lg-body">
            {v.sections.map((s) => (
              <section key={s.id} id={s.id} className="lg-sec">
                <h2>{s.heading}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
    </div>
  );
}
