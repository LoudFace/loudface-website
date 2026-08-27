/**
 * CareersPageV3 — the /careers page body.
 *
 * Server Component. No client JS of its own: the roles list is a CSS-only row
 * treatment (see careers-v3.css), so it renders complete in the served HTML,
 * works with JavaScript off, and has nothing to hydrate. The only script on
 * the page is the shared ServiceV3Scripts reveal observer.
 *
 * The roles list sits on the crisp-light ground. A night-indigo alternative was
 * built and screenshotted, but with zero open roles there was no list to judge
 * it against, so it was NOT shipped on a guess — when real roles come back,
 * that ground is worth a proper look with real rows in it.
 *
 * COPY RULES APPLIED HERE (DESIGN.md §1, taste-laws):
 *  - No invented numbers. We have no real hiring statistics, so the page
 *    carries none — the only figure is a literal count of the rows below it.
 *  - No promise we cannot keep. The page never says everyone gets a reply.
 *  - Plain and factual. No aphorisms, no "Elevate / Seamless / Join the
 *    journey", no dash-rule eyebrow kickers, no 01/02/03 markers.
 */
import Image from 'next/image';
import Link from 'next/link';
import type { OpenRole, OpenRolesResult } from '@/lib/careers-data';

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

/** The open application — where an empty state and the closing call both point. */
const APPLY_URL = '/careers/apply';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── One role row ────────────────────────────────────────────────── */

function RoleRow({ role }: { role: OpenRole }) {
  // Both are empty on every role today. Render nothing rather than an empty
  // element — a reserved gap under a title is what makes a thin row look
  // broken instead of deliberate.
  const chips = [role.commitment, role.location].filter(Boolean);

  return (
    <a
      className="cr-role rv"
      href={role.applyUrl}
      // Notion holds an absolute loudface.co URL. It is our own domain, so this
      // is same-site navigation; it is a plain <a> rather than next/link
      // because the href is data, not a route literal, and may legitimately
      // point at a different host if the hiring team ever changes it.
    >
      <span className="cr-role-main">
        <span className="cr-role-title">{role.title}</span>
        {role.summary ? <span className="cr-role-summary">{role.summary}</span> : null}
        {chips.length > 0 ? (
          <span className="cr-role-meta">
            {chips.map((chip) => (
              <span className="cr-role-chip" key={chip}>
                {chip}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span className="cr-role-go">
        Apply
        <ArrowIcon />
      </span>
    </a>
  );
}

/* ── The roles section ───────────────────────────────────────────── */

function RolesSection({ result }: { result: OpenRolesResult }) {
  const unavailable = result.status === 'unavailable';
  const roles = result.status === 'ok' ? result.roles : [];
  const hasRoles = roles.length > 0;

  return (
    <section
      id="open-roles"
      aria-labelledby="open-roles-heading"
      style={{ padding: 'clamp(64px, 8vw, 104px) 0' }}
    >
      <div className="container">
        {/* The heading states the actual situation. "Open roles" sitting above
            "nothing open right now" says the same thing twice and reads like
            the list failed to load. */}
        <div className="cr-head">
          <h2 className="display rv" id="open-roles-heading">
            {hasRoles ? (
              <>
                Open <span className="ghost">roles</span>
              </>
            ) : unavailable ? (
              <>
                Open <span className="ghost">roles</span>
              </>
            ) : (
              <>
                No open roles <span className="ghost">right now.</span>
              </>
            )}
          </h2>
          {hasRoles ? (
            <p className="cr-count rv">
              {roles.length === 1 ? '1 role open' : `${roles.length} roles open`}
            </p>
          ) : null}
        </div>

        {hasRoles ? (
          <div className="cr-roles">
            {roles.map((role) => (
              // Keyed on the Notion page id, NOT the apply URL. Two roles can
              // legitimately share one apply URL (both SEO openings point at
              // ?role=seo), so a URL key would collide.
              <RoleRow key={role.id} role={role} />
            ))}
          </div>
        ) : (
          /* THE DEFAULT STATE, not an edge case. As of 2026-08-27 LoudFace has
             no live vacancies, so this is what the page shows — it has to carry
             the section on its own rather than read as a list that failed to
             load. It is also what a Notion outage renders, which is the right
             thing to fall back to: an honest "nothing posted" beats a broken
             list, and the open application still works either way. */
          <div className="cr-empty rv">
            <div className="cr-empty-say">
              {unavailable ? (
                /* We could not reach the list. Saying "no open roles" here would
                   be a claim we have not checked — and if we ARE hiring, it
                   hides real vacancies behind a page that looks perfectly
                   normal. Say what is actually true instead. */
                <p>
                  We could not load our current openings just now. Please try again shortly
                  — or send an application anyway, which reaches us either way.
                </p>
              ) : (
                <p>
                  We hire in bursts, and we read what comes in between them. Send us your work
                  anyway — a real person reads it, and we keep the ones we like on file for
                  when a role does open.
                </p>
              )}
              <div className="cr-empty-cta">
                <Link className="btn btn-ink btn-lg btn-pill" href={APPLY_URL}>
                  Send an open application
                </Link>
              </div>
            </div>
            <div className="cr-empty-aside">
              <h3>What we hire for</h3>
              <ul className="cr-disciplines">
                <li>Design</li>
                <li>Webflow development</li>
                <li>Project management</li>
                <li>Organic search (SEO / AEO)</li>
                <li>Copywriting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── How hiring actually goes ────────────────────────────────────── */

function HowSection() {
  return (
    <section
      className="cr-how"
      aria-labelledby="how-heading"
      style={{ padding: 'clamp(64px, 8vw, 104px) 0', background: 'var(--color-surface-50)' }}
    >
      <div className="container cr-how-grid">
        <div>
          <h2 className="display rv" id="how-heading">
            How this <span className="ghost">actually goes</span>
          </h2>
          <p className="lede rv" style={{ marginTop: '18px', ['--d' as string]: '.08s' }}>
            We are a small remote team. There is no applicant-tracking maze here, and no
            take-home project before anyone has spoken to you.
          </p>
          {/* A second way in, at the point where someone has just read how it
              works and is deciding. Also stops the left column bottoming out
              into empty space beside the taller rail. */}
          <p className="rv" style={{ marginTop: '26px', ['--d' as string]: '.14s' }}>
            <Link className="tlink on-light" href={APPLY_URL}>
              Send an application
              <ArrowIcon />
            </Link>
          </p>
        </div>

        <div className="cr-gates">
          <div className="cr-gate rv">
            <h3>You fill in one form</h3>
            <p>
              A few minutes. The questions change with the role, and most ask for a short
              intro video, because we would rather meet you than read about you.
            </p>
          </div>
          <div className="cr-gate rv" style={{ ['--d' as string]: '.06s' }}>
            <h3>A person reads it</h3>
            <p>
              Not a keyword filter. We look at what you have actually shipped — not where
              you studied, and not how long your CV is.
            </p>
          </div>
          <div className="cr-gate rv" style={{ ['--d' as string]: '.12s' }}>
            <h3>If it is a fit, we talk</h3>
            <p>
              A call with the team first. Arnel, who founded LoudFace, takes the final
              conversation and the final decision himself.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The closing call ────────────────────────────────────────────────
   Reuses the approved CoverCTA cover-stack (`.cover*` classes from
   service-v3.css) with candidate-facing copy instead of client-facing copy —
   per the 2026-07-06 rule that CTA sections are never re-invented per page,
   but their words do change. The client version's "Book a strategy call" and
   its client-proof card would both be wrong in front of a candidate. */

function CareersCoverCTA() {
  return (
    <section className="cover">
      <Image
        className="cover-img"
        src={`${CDN}a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82`}
        alt=""
        aria-hidden="true"
        width={1600}
        height={1000}
        sizes="100vw"
        quality={82}
        loading="lazy"
      />
      <div className="cover-veil" aria-hidden="true" />
      <div className="container cover-in">
        <div className="cover-meta rv">
          <span>LoudFace — hiring</span>
          <span>Remote team</span>
        </div>
        <div className="cover-mid">
          <h2 className="rv">Not sure which role you fit?</h2>
          <p className="rv" style={{ transitionDelay: '.08s' }}>
            Pick the closest one and tell us what you have built. We would rather see the
            work and sort out the title afterwards.
          </p>
          <div className="cover-cta rv" style={{ transitionDelay: '.16s' }}>
            <Link className="btn btn-white btn-lg" href={APPLY_URL}>
              Apply to LoudFace
            </Link>
            <span className="slots">
              <i className="dot" />A person reads every one
            </span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>Cover — Montblanc, built by LoudFace</span>
          <span>loudface.co</span>
        </div>
      </div>
    </section>
  );
}

/* ── The page ────────────────────────────────────────────────────── */

export function CareersPageV3({ result }: { result: OpenRolesResult }) {
  const roles = result.status === 'ok' ? result.roles : [];
  return (
    <>
      {/* HERO — electric stage. Pages open electric (hero law, 2026-07-12);
          the night gradient is for mid-page only. Copy budget is four parts:
          eyebrow, H1, sub, CTA row. The plate beside it is a separate focal
          object and does not count against that budget. */}
      <section className="hero" aria-label="Careers at LoudFace">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow rv">Careers at LoudFace</span>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
              Come build <span className="soft">with us at LoudFace.</span>
            </h1>
            <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
              We are a small remote team building and growing websites for B2B SaaS
              companies, and for brands like Montblanc and Radisson. We care about what you
              have shipped.
            </p>
            {/* The label has to tell the truth about what is below it. With no
                live vacancies, "See open roles" sends someone to an empty
                section and reads as a bait link. */}
            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              {roles.length > 0 ? (
                <a className="btn btn-white btn-lg btn-pill" href="#open-roles">
                  See open roles
                </a>
              ) : (
                <Link className="btn btn-white btn-lg btn-pill" href={APPLY_URL}>
                  Send an open application
                </Link>
              )}
            </div>
          </div>

          {/* Real work, not a DOM mock — leads with the work, never a portrait. */}
          <div className="cr-hero-media rv" style={{ ['--d' as string]: '.1s' }} aria-hidden="true">
            <div className="plate">
              <div className="bar">
                <b />
                <b />
                <b />
                <span>liqid.de</span>
              </div>
              <div className="shot">
                <Image
                  src={`${CDN}5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp?w=1200&h=640&fit=crop&crop=top&fm=webp&q=82`}
                  alt=""
                  width={1200}
                  height={640}
                  quality={82}
                  priority
                />
              </div>
              <span className="rpill">
                <i />
                <b>Recent build</b>
                <span>LIQID</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <RolesSection result={result} />
      <HowSection />
      <CareersCoverCTA />
    </>
  );
}
