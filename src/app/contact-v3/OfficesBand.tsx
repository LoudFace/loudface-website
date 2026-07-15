import type { ContactFounder } from './data';
import { OFFICES } from './data';

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
export function OfficesBand({ founder }: { founder: ContactFounder }) {
  const initials = founder.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className="band" aria-label="Offices and facts">
      <div className="wrap band__inner">
        <span className="eyebrow eyebrow--dark rv">Where we are</span>
        <h2 className="rv" style={{ ['--d' as string]: '.06s' }}>
          Two cities. <span className="hl">One team</span> on the other end.
        </h2>
        <p className="band__sub rv" style={{ ['--d' as string]: '.12s' }}>
          Wherever your message lands, the same people answer it, typically within two hours during
          working hours. No ticket queue, no offshore relay.
        </p>

        <div className="tiles rv" style={{ ['--d' as string]: '.16s' }}>
          {OFFICES.map((o) => (
            <div className="tile" key={o.city}>
              <div className="tile__city">{o.city}</div>
              <div className="tile__time">
                <span className="live-dot" aria-hidden="true"></span>{' '}
                <span data-tz={o.tz}></span> local
              </div>
              <address className="tile__addr">
                {o.lines[0]}
                <br />
                {o.lines[1]}
              </address>
            </div>
          ))}
          <div className="tile">
            <div className="tile__num">2h</div>
            <div className="tile__txt">
              <b>Typical reply</b> to a new enquiry, during working hours.
            </div>
          </div>
          <div className="tile">
            <div className="tile__num">
              4<em>+</em>
            </div>
            <div className="tile__txt">
              <b>Years</b> as a Webflow Enterprise Partner.
            </div>
          </div>
          <div className="tile">
            <div className="tile__num">
              200<em>+</em>
            </div>
            <div className="tile__txt">
              <b>B2B SaaS sites</b> designed, built and grown.
            </div>
          </div>
        </div>

        <div className="founder rv" style={{ ['--d' as string]: '.1s' }}>
          <div className="founder__avatar">
            {founder.photoUrl ? (
              <img src={founder.photoUrl} alt={`${founder.name}, founder of LoudFace`} width={92} height={92} loading="lazy" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="founder__quote">
              &ldquo;You&rsquo;ll talk to the people who&rsquo;ll actually do the work, never an
              account manager.&rdquo;
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
