import Link from 'next/link';
import type { CareersV11Content, HomeV11Content } from '@/lib/content-utils';
import type { OpenRole, OpenRolesResult } from '@/lib/careers-data';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, Eyebrow, img } from '../home-v11/ui';
import { strip } from '@/lib/inline-edit/mark';

/**
 * /careers in v11 (2026-09-25). The copy is the live page's (careers-v3/CareersPageV3.tsx), moved unchanged; roles come
 * live from Notion (fetchOpenRoles). Each section is built against a tile from the Mobbin harvest in
 * design-lab/harvest/2026-09-25/contact-careers-2 (contact-sheets.pdf), named in the comment above it.
 */

const APPLY_URL = '/careers/apply';
/** The team as photographed, a sample of the people you would work with (never presented as a headcount). */
const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi', 'rezwan-nahid', 'david-dobrijevic', 'chandana-pitta'];

function Role({ role, apply }: { role: OpenRole; apply: string }) {
  const meta = [role.commitment, role.location].filter(Boolean).join(' · ');
  return (
    <a className="cr2-role" href={role.applyUrl}>
      <span className="is-title">{role.title}</span>
      <span className="is-sum">{role.summary}</span>
      <span className="is-meta">{meta}</span>
      <span className="is-go">{apply} <ArrowUpRight /></span>
    </a>
  );
}

export function CareersV11({ result, home, c }: { result: OpenRolesResult; home: HomeV11Content; c: CareersV11Content }) {
  const roles = result.status === 'ok' ? result.roles : [];
  const unavailable = result.status === 'unavailable';
  return (
    <div className="v11 cr2">
      {/* 1 · the invitation over the people you would work with (04 Runway "Careers at Runway" photo row, 04 Figma) */}
      <section className="cr2-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="cr2-hero-top">
            <div>
              <Eyebrow>{c.hero.eyebrow}</Eyebrow>
              <h1>{c.hero.headline} <span className="ghost">{c.hero.headlineGhost}</span></h1>
            </div>
            <div className="cr2-hero-side">
              <p>{c.hero.body}</p>
              {roles.length > 0 ? (
                <a className="v11-btn is-ink" href="#open-roles"><span>{c.hero.rolesCta}</span></a>
              ) : (
                <Link className="v11-btn is-ink" href={APPLY_URL}><span>{c.hero.applyCta}</span></Link>
              )}
            </div>
          </div>
        </div>
        <div className="cr2-faces" aria-hidden="true">
          {TEAM.map((slug) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={slug} src={img(`team/${slug}.jpg`)} alt="" width={580} height={704} />
          ))}
        </div>
      </section>

      {/* 2 · open roles on hairlines, or the honest empty state with the way in (05 Runway open roles, 05 Clay roles) */}
      <section className="v11-sec v11-white" id="open-roles">
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{c.roles.eyebrow}</Eyebrow>
              <h2 className="v11-h2">{roles.length > 0 || unavailable ? <>{c.roles.title} <span className="ghost">{c.roles.titleGhost}</span></> : <>{c.roles.emptyTitle} <span className="ghost">{c.roles.emptyTitleGhost}</span></>}</h2>
            </div>
            {roles.length > 0 && <p>{roles.length === 1 ? c.roles.countOne : `${roles.length} ${c.roles.countMany}`}</p>}
          </div>
          {roles.length > 0 ? (
            <div className="cr2-roles">{roles.map((r) => <Role key={r.id} role={r} apply={c.roles.apply} />)}</div>
          ) : (
            <div className="cr2-empty">
              <div className="cr2-empty-say">
                <p>
                  {unavailable ? c.roles.unavailable : c.roles.empty}
                </p>
                <Link className="v11-btn is-ink" href={APPLY_URL}><span>{c.hero.applyCta}</span></Link>
              </div>
              <div className="cr2-hire">
                <h3>{c.roles.hireTitle}</h3>
                <ul>{c.roles.disciplines.map((d) => <li key={d}><span>{d}</span><Link href={APPLY_URL} aria-label={strip(`${c.roles.applyFor} ${d}`)}><ArrowRight /></Link></li>)}</ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3 · how hiring actually goes (06 Retool candidate experience, 06 Clay what-to-expect) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap cr2-how">
          <div>
            <Eyebrow>{c.how.eyebrow}</Eyebrow>
            <h2 className="v11-h2">{c.how.title} <span className="ghost">{c.how.titleGhost}</span></h2>
            <p className="cr2-how-lede">{c.how.lede}</p>
            <Link className="v11-link cr2-tap" href={APPLY_URL}><span>{c.how.linkLabel}</span><ArrowRight /></Link>
          </div>
          <ol className="cr2-steps">
            {c.how.steps.map((s, i) => (
              <li key={s.title}>
                <span className="is-n">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {i === 2 && (
                    <div className="cr2-arnel">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" src={img('avatars/arnel-bukva.png')} alt="" width={36} height={36} />
                      <span><b>{c.how.founder}</b> {c.how.founderNote}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 4 · the closing call, candidate-facing, on the homepage's closing stage */}
      <section className="v11-closing cr2-closing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img('closing-terrain-1920.webp')} srcSet={`${img('closing-terrain-1280.webp')} 1280w, ${img('closing-terrain-1920.webp')} 1920w, ${img('closing-terrain-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt="" className="v11-closing-bg" loading="lazy" />
        <div className="v11-wrap">
          <Eyebrow dot="#ffffff" color="#dcd9fe">{c.closing.eyebrow}</Eyebrow>
          <h2 className="v11-closing-h2">{c.closing.title}</h2>
          <p className="v11-closing-lede">{c.closing.body}</p>
          <div className="v11-closing-cta">
            <Link className="v11-btn is-white" href={APPLY_URL}><span>{c.closing.cta}</span></Link>
            <span className="v11-closing-mail">{c.closing.note}</span>
          </div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
