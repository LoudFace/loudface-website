/**
 * LegalPageV3 — the v3 template for LoudFace's policy pages.
 *
 * Built for /privacy (migrated 2026-08-01) and reusable verbatim by /terms and
 * /cookies when they follow. Rhythm (DESIGN.md §2 — pages OPEN electric):
 *   compact ELECTRIC hero → crisp-light prose stage w/ sticky contents rail →
 *   FooterV3.
 *
 * There is deliberately NO cover-stack CTA and no floating client artifact: a
 * policy page is a reading surface, and the v3 marketing furniture would read
 * as a pitch wrapped around a legal notice. The electric opening band, the
 * indigo hairline structure, the two-font type system and the shared FooterV3
 * are what make it part of the same site.
 *
 * The visual layer is service-v3.css (tokens, `.hero`, FooterV3 skin) +
 * seo-for-v3.css (`.sf-prose`/`.sf-body`) + legal-v3.css (the compact-hero and
 * contents-rail furniture), all rendered inside the shared `.svcv3` wrapper —
 * the same reuse pattern the /seo-for routes established, so these pages are
 * pixel-consistent with the rest of v3 instead of forking a third stylesheet.
 *
 * Server Component — zero page-level client JS beyond the shared reveal script.
 * The dark→scrolled nav flip is owned by the shared (site) Header.
 */
import type { ReactNode } from 'react';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';

export interface LegalSection {
  /** anchor id — also the contents-rail target */
  id: string;
  /** rendered as the h2 and as the rail label */
  heading: string;
  body: ReactNode;
}

export interface LegalView {
  eyebrow: string;
  h1: string;
  /** e.g. "July 2026" — rendered in the hero stamp */
  lastUpdated: string;
  /** short standfirst under the h1 */
  sub?: string;
  sections: LegalSection[];
}

export function LegalPageV3({ view }: { view: LegalView }) {
  const v = view;

  return (
    <>
      {/* NOTE: (site)/layout.tsx already wraps children in <main id="main-content">,
          so this template must not add a second <main>. */}

      {/* ============ HERO — compact electric stage ============ */}
      <section className="hero lgv3-hero" aria-label={v.h1}>
        <div className="hero-grid sf-solo">
          <div className="hero-copy">
            <span className="hero-eyebrow rv">{v.eyebrow}</span>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
              {v.h1}
            </h1>
            {v.sub ? (
              <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
                {v.sub}
              </p>
            ) : null}
            <span className="lgv3-stamp rv" style={{ ['--d' as string]: '.18s' }}>
              <i aria-hidden="true"></i>
              Last updated {v.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* ============ POLICY BODY — crisp light stage ============ */}
      <section className="sf-prose" aria-label={`${v.h1} — full text`}>
        <div className="container">
          <div className="lgv3-wrap">
            <div className="lgv3-main sf-body">
              {v.sections.map((section) => (
                <section key={section.id} id={section.id} className="lgv3-sec rv">
                  <h2>{section.heading}</h2>
                  {section.body}
                </section>
              ))}
            </div>

            <nav className="lgv3-toc" aria-label="Contents">
              <span>Contents</span>
              <ol>
                {v.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <FooterV3 />
      <ServiceV3Scripts />
    </>
  );
}
