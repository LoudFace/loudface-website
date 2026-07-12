/**
 * Team (A) — full-bleed night stage, the card ladder. CMS-driven: cards render
 * from the live team array in the composite's 2/3/2 column arrangement. Each
 * card shows name, role, a one-line fact, and (when present) a short quote.
 *
 * Each card is a <button> that opens a per-member <dialog> (a deep-stage modal
 * with the fuller bio, fact, quote, and a "Full profile" link to /team/${slug}).
 * The dialogs are server-rendered here — their content and the /team/ links live
 * in the SSR HTML, so the internal links stay crawlable for SEO. TeamModals (a
 * small client component) wires open/close using the native <dialog> API.
 *
 * IMAGE GOTCHA: width/height attrs are presentational hints that would override
 * the CSS aspect-ratio crops — the CSS carries `height:auto` on `.a-tcard img`
 * to defeat that while keeping the attrs for CLS. Do not strip either side.
 */
import Link from 'next/link';
import { splitColumns, teamPhoto, type TeamPerson } from './data';
import { TeamModals } from './TeamModals';

function Tcard({ p, delay }: { p: TeamPerson; delay: number }) {
  return (
    <button
      type="button"
      className="a-tcard-link"
      data-team-open={`tm-${p.slug}`}
      aria-haspopup="dialog"
      aria-label={`More about ${p.name}, ${p.role}`}
    >
      <figure className="a-tcard rv" style={{ ['--d' as string]: `${delay.toFixed(2)}s` }}>
        <img
          src={teamPhoto(p.photoBase, 640, 640)}
          width={640}
          height={640}
          alt={`${p.name}, ${p.role}`}
        />
        <figcaption className="a-tmeta">
          <span className="a-tname">{p.name}</span>
          <span className="a-trole">{p.role}</span>
          {p.fact && <span className="a-tfact">{p.fact}</span>}
          {p.quote && <q className="a-tquote">{p.quote}</q>}
        </figcaption>
      </figure>
    </button>
  );
}

function TeamDialog({ p }: { p: TeamPerson }) {
  return (
    <dialog id={`tm-${p.slug}`} className="tmodal" aria-labelledby={`tm-${p.slug}-name`}>
      <div className="tmodal-panel">
        <button
          type="button"
          className="tmodal-x"
          data-team-close
          aria-label={`Close ${p.name} details`}
        >
          &#10005;
        </button>
        <div className="tmodal-media">
          <img
            src={teamPhoto(p.photoBase, 760, 900)}
            width={760}
            height={900}
            alt={`${p.name}, ${p.role}`}
          />
        </div>
        <div className="tmodal-body">
          <span className="tmodal-role">{p.role}</span>
          <h3 id={`tm-${p.slug}-name`} className="tmodal-name">
            {p.name}
          </h3>
          {p.bioSummary && <p className="tmodal-bio">{p.bioSummary}</p>}
          {p.fact && <p className="tmodal-fact">{p.fact}</p>}
          {p.quote && <q className="tmodal-quote">{p.quote}</q>}
          <Link href={`/team/${p.slug}`} className="tmodal-link">
            Full profile <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </dialog>
  );
}

export function Team({ team }: { team: TeamPerson[] }) {
  const columns = splitColumns(team);

  return (
    <section className="a-team" id="team">
      <div className="container">
        <div className="a-team-head rv">
          <p className="a-kick on-dark">
            <i></i>The team
          </p>
          <h2>Expert team committed to your growth.</h2>
          <p className="a-team-sub">
            People hellbent on making your business win the online game. This is everyone, no
            layers between you and them.
          </p>
        </div>
        <div className="a-ladder">
          {columns.map((col, ci) => (
            <div className="a-lcol" key={ci}>
              {col.map((p, pi) => (
                <Tcard key={p.slug} p={p} delay={ci * 0.14 + pi * 0.08} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Per-member modals — server-rendered inside .abv3 so the scoped modal CSS
          applies and the /team/ links stay in the SSR HTML for crawlers. */}
      {team.map((p) => (
        <TeamDialog key={p.slug} p={p} />
      ))}
      <TeamModals />
    </section>
  );
}
