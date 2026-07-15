/**
 * BuildStory — the reading act: the CMS rich-text body in a scoped prose wrapper
 * beside a sticky sidebar (server component).
 *
 * Must-keeps carried from the old template:
 *  - TOC anchors: rendered from the H2 ids injected into the body upstream, both
 *    as a desktop sticky list and a mobile pill row.
 *  - Sidebar: services pills, technologies pills, project facts, sticky book CTA.
 *  - The pills/facts/CTA also render in a mobile block below the article (the
 *    sticky aside is display:none < 1000px), so nothing is lost on small screens.
 */
export interface TocEntry {
  id: string;
  text: string;
}
export interface Pill {
  name: string;
  href: string;
}
export interface Fact {
  k: string;
  v: string;
}

interface BuildStoryProps {
  bodyHtml: string;
  toc: TocEntry[];
  services: Pill[];
  technologies: Pill[];
  facts: Fact[];
}

function SidebarBlocks({ services, technologies, facts }: Pick<BuildStoryProps, 'services' | 'technologies' | 'facts'>) {
  return (
    <>
      {services.length > 0 && (
        <div>
          <p className="aside-h">Services</p>
          <div className="pillrow">
            {services.map((s) => (
              <a key={s.name} href={s.href} className="pill">{s.name}</a>
            ))}
          </div>
        </div>
      )}
      {technologies.length > 0 && (
        <div>
          <p className="aside-h">Technologies</p>
          <div className="pillrow">
            {technologies.map((t) => (
              <a key={t.name} href={t.href} className="pill">{t.name}</a>
            ))}
          </div>
        </div>
      )}
      {facts.length > 0 && (
        <div>
          <p className="aside-h">Project</p>
          <div className="facts">
            {facts.map((f) => (
              <div className="fact" key={f.k}>
                <span className="k">{f.k}</span>
                <span className="v">{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="aside-cta">
        <p>Want results like this?</p>
        <span className="sub">A 30-minute call on where your category&rsquo;s growth is going.</span>
        <button type="button" className="btn btn-light" data-cal-trigger>Book an intro call</button>
      </div>
    </>
  );
}

export function BuildStory({ bodyHtml, toc, services, technologies, facts }: BuildStoryProps) {
  return (
    <section className="build" id="build">
      <div className="container-wide">
        <div className="build-head">
          <span className="eyebrow">The build</span>
          <h2 className="h-sec">Inside the work</h2>
        </div>

        {toc.length > 0 && (
          <nav className="toc-mobile" aria-label="On this page">
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`}>{t.text}</a>
            ))}
          </nav>
        )}

        <div className="build-grid">
          <article className="article">
            {bodyHtml ? (
              <div className="cs-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : (
              <p className="cs-empty">No write-up available for this case study yet.</p>
            )}
          </article>

          <aside className="aside" aria-label="Project details">
            {toc.length > 0 && (
              <div>
                <p className="aside-h">On this page</p>
                <nav className="toc" aria-label="On this page">
                  {toc.map((t) => (
                    <a key={t.id} href={`#${t.id}`}>{t.text}</a>
                  ))}
                </nav>
              </div>
            )}
            <SidebarBlocks services={services} technologies={technologies} facts={facts} />
          </aside>
        </div>

        {/* Mobile-only: the sticky aside is hidden < 1000px, so surface the same
            pills / facts / booking nudge below the article. */}
        <div className="facts-mobile">
          <SidebarBlocks services={services} technologies={technologies} facts={facts} />
        </div>
      </div>
    </section>
  );
}
