import { Suspense } from 'react';
import type { CareersV11Content, HomeV11Content } from '@/lib/content-utils';
import type { ApplicationOpeningResult } from '@/lib/careers-data';
import { CareersApplicationForm } from '../(site)/careers/apply/_components/CareersApplicationForm';
import { FooterV11 } from '../home-v11/FooterV11';
import { Eyebrow, img } from '../home-v11/ui';

/**
 * /careers/apply in v11 (2026-09-26): the role and how we hire beside the live form (CareersApplicationForm, restyled
 * by careers.css), with the people who read the application. Tiles from design-lab/harvest/2026-09-26/rest: 05-A
 * Vercel apply form, 05-B Dovetail role with "who you'll work closely with", 05-D Dovetail role page. Copy in
 * careers-v11.json (`apply`, `how`), unchanged from the live page.
 */

/** Some of the team who read applications, named (a sample of the team, as everywhere on the site). */
const READERS = [
  { slug: 'arnel-bukva', name: 'Arnel' },
  { slug: 'tamara-pavlovic', name: 'Tamara' },
  { slug: 'andrea-van-wyk', name: 'Andrea' },
  { slug: 'abhay-tyagi', name: 'Abhay' },
];

export function ApplyV11({ c, home, openingResult }: { c: CareersV11Content; home: HomeV11Content; openingResult: ApplicationOpeningResult }) {
  const a = c.apply;
  const title = openingResult.status === 'open' ? openingResult.opening.title : null;
  return (
    <div className="v11 cr2 ap">
      <section className="ap-page" data-hero="light">
        <div className="v11-wrap ap-grid">
          <div className="ap-copy">
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h1>{title ? <>{a.titleFor} <span className="ghost">{title}</span></> : <>{a.title} <span className="ghost">{a.titleGhost}</span></>}</h1>
            <p className="ap-intro">{a.intro}</p>
            <p className="ap-lead">{a.basisLead}</p>
            <ul className="ap-basis">{a.basis.map((b) => <li key={b}>{b}</li>)}</ul>
            <div className="ap-readers">
              <h2>{a.teamTitle}</h2>
              <div className="ap-faces">
                {READERS.map((r) => (
                  <figure key={r.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(`team/${r.slug}.jpg`)} alt="" width={580} height={704} />
                    <figcaption>{r.name}</figcaption>
                  </figure>
                ))}
              </div>
              <p>{a.note}</p>
            </div>
            <ol className="ap-steps">
              {c.how.steps.map((s) => <li key={s.title}><b>{s.title}</b><span>{s.body}</span></li>)}
            </ol>
          </div>
          <div className="ap-form">
            <Suspense fallback={<p className="ap-loading">{a.loading}</p>}>
              <CareersApplicationForm openingResult={openingResult} />
            </Suspense>
          </div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
    </div>
  );
}
