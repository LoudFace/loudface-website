import Image from 'next/image';
import type { ContactFounder } from './data';
import { OFFICES } from './data';
import type { ContactOfficesContent } from '@/lib/content-utils';

/**
 * OfficesBand — the deep indigo "where we are" band: SF + Dubai office tiles
 * (with live local clocks, progressive enhancement via ContactV3Scripts) plus
 * the fact tiles (2h reply, 4+ years Enterprise Partner, 200+ sites — the safe
 * claim set only), closed by the founder quote with the real Sanity headshot
 * (initials fallback when the photo is unavailable).
 *
 * Address data is single-sourced from OFFICES in ./data — the same object the
 * page's ContactPage JSON-LD is generated from, so the visible band and the
 * structured data can never drift apart.
 */
export function OfficesBand({
  founder,
  content,
}: {
  founder: ContactFounder;
  content: ContactOfficesContent;
}) {
  const initials = founder.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className="band" aria-label="Offices and facts">
      <div className="wrap band__inner">
        <span className="eyebrow eyebrow--dark rv">{content.eyebrow}</span>
        <h2 className="rv" style={{ ['--d' as string]: '.06s' }}>
          {content.headlinePrefix}<span className="hl">{content.headlineHighlight}</span>{content.headlineSuffix}
        </h2>
        <p className="band__sub rv" style={{ ['--d' as string]: '.12s' }}>
          {content.subtitle}
        </p>

        <div className="tiles rv" style={{ ['--d' as string]: '.16s' }}>
          {OFFICES.map((o, i) => (
            <div className="tile" key={o.city}>
              <div className="tile__city">{content.cities[i].city}</div>
              <div className="tile__time">
                <span className="live-dot" aria-hidden="true"></span>{' '}
                <span data-tz={o.tz}></span> {content.localLabel}
              </div>
              <address className="tile__addr">
                {content.cities[i].lines[0]}
                <br />
                {content.cities[i].lines[1]}
              </address>
            </div>
          ))}
          <div className="tile">
            <div className="tile__num">{content.facts.reply.number}</div>
            <div className="tile__txt">
              <b>{content.facts.reply.label}</b>{content.facts.reply.description}
            </div>
          </div>
          <div className="tile">
            <div className="tile__num">
              {content.facts.years.number}<em>{content.facts.years.numberSuffix}</em>
            </div>
            <div className="tile__txt">
              <b>{content.facts.years.label}</b>{content.facts.years.description}
            </div>
          </div>
          <div className="tile">
            <div className="tile__num">
              {content.facts.sites.number}<em>{content.facts.sites.numberSuffix}</em>
            </div>
            <div className="tile__txt">
              <b>{content.facts.sites.label}</b>{content.facts.sites.description}
            </div>
          </div>
        </div>

        <div className="founder rv" style={{ ['--d' as string]: '.1s' }}>
          <div className="founder__avatar">
            {founder.photoUrl ? (
              <Image src={founder.photoUrl} alt={`${founder.name}, founder of LoudFace`} width={92} height={92} quality={82} loading="lazy" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="founder__quote">
              {content.founderQuote}
            </div>
            <div className="founder__who">
              {founder.name} &middot; {founder.role}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
