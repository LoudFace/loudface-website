/**
 * HeroAbout — deep night stage. B's copy column (left) + A's team-photo mosaic
 * (right, flush to the edge). The 7 photos render in the composite's 2/3/2
 * column arrangement, driven by the live CMS team array. The shared Header sits
 * transparent over this hero (heroTheme="dark" wired in (site)/layout.tsx), so
 * this section carries NO nav of its own.
 */
import { splitColumns, teamPhoto, type TeamPerson } from './data';

export function HeroAbout({ team }: { team: TeamPerson[] }) {
  const [colA, colB, colC] = splitColumns(team);
  const columns = [colA, colB, colC];

  // facepile: every team member, small circular avatars
  return (
    <section className="hero diag">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-eyebrow rv">
            <b>About LoudFace</b>
            <em>since 2017</em>
          </span>
          <h1 className="rv" data-speakable style={{ ['--d' as string]: '.06s' }}>
            The team behind <span className="soft">200+ B2B SaaS websites.</span>
          </h1>
          <p className="hero-sub rv" data-speakable style={{ ['--d' as string]: '.12s' }}>
            We build the site on Webflow: positioning, copy, design, code. Then we run the SEO,
            conversion, and AI-search work that grows it. Seven of us, fully remote, based in
            Dubai, serving global SaaS teams.
          </p>
          <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
            <a className="btn btn-white btn-lg" href="#book" data-cal-trigger="">
              Book an intro call
            </a>
            <span className="slots">
              <i className="dot"></i>2h response time
            </span>
            <span className="hero-cta-div" aria-hidden="true"></span>
            <a className="hero-meta" href="#team">
              <span className="facepile" aria-hidden="true">
                {team.map((p) => (
                  <img
                    key={p.slug}
                    src={teamPhoto(p.photoBase, 180, 180)}
                    width={30}
                    height={30}
                    alt=""
                  />
                ))}
              </span>
              <span className="hero-meta-tx">
                Meet the whole team <span aria-hidden="true">&darr;</span>
              </span>
            </a>
          </div>
        </div>

        {/* A's signature: structured team-photo mosaic, flush right */}
        <div className="a-wall" aria-label="The LoudFace team">
          {columns.map((col, ci) => (
            <div className="a-wcol" key={ci}>
              {col.map((p, pi) => (
                <figure
                  className="a-wcard rv"
                  key={p.slug}
                  style={{ ['--d' as string]: `${(ci * 0.14 + pi * 0.08).toFixed(2)}s` }}
                >
                  <img
                    src={teamPhoto(p.photoBase, 640, 640)}
                    width={640}
                    height={640}
                    alt={`${p.name}, ${p.role}`}
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
