'use client';

/**
 * HeroWork — the electric deep-indigo hero fused with the cinematic "now
 * showing" marquee. Left: a strict copy budget (eyebrow + h1 + sub + CTA row).
 * Right: the marquee stage — four flagship studies held one at a time on a
 * shared night mat, cycled by the tab switcher that crowns the frame (the
 * structurally-distinct proof-object DESIGN.md §7 carves out of the hero-copy
 * budget). The tab interaction is the only reason this is a client component;
 * all four panels are server-rendered into the DOM (crawlers/AI engines see
 * every flagship), and the tabs just toggle which one is on display.
 *
 * Screenshots resolve from Sanity by slug (images prop) with a hardcoded CDN
 * fallback, so a missing doc or fetch failure can never blank a panel.
 */
import { useState } from 'react';
import Link from 'next/link';
import { FLAGSHIPS, WORK_CDN, type WorkImages } from './content';

const CROP = '?w=1120&h=672&fit=crop&crop=top&fm=webp&q=80';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function HeroWork({ images, total }: { images?: WorkImages; total: number }) {
  const [active, setActive] = useState(FLAGSHIPS[0].key);

  return (
    <section className="hero" aria-label="Selected work">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow rv">
              <b>Selected work</b>
              <em>{total} studies</em>
            </span>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
              Real results.
              <br />
              <span className="soft">Receipts attached.</span>
            </h1>
            <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
              Every site below is a real B2B SaaS engagement we shipped — no stock mockups, no
              invented numbers.
            </p>
            <div className="hero-cta rv" style={{ ['--d' as string]: '.24s' }}>
              <a href="#archive" className="btn btn-white btn-lg btn-pill">
                Browse all {total}
              </a>
              <a href="#book" data-cal-trigger className="tlink">
                Book a strategy call
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div
            className="stage rv"
            style={{ ['--d' as string]: '.16s' }}
            aria-label="Featured study preview"
          >
            <div className="now">
              <div className="now-lead">
                <i></i>Now showing
              </div>
              <div className="now-tabs" role="tablist" aria-label="Featured studies">
                {FLAGSHIPS.map((f) => (
                  <button
                    key={f.key}
                    className="now-tab"
                    id={`tab-${f.key}`}
                    role="tab"
                    type="button"
                    aria-selected={active === f.key}
                    aria-controls={`panel-${f.key}`}
                    onClick={() => setActive(f.key)}
                  >
                    <span className="nt-dot"></span>
                    {f.tab}
                  </button>
                ))}
              </div>
            </div>

            {FLAGSHIPS.map((f) => {
              const on = active === f.key;
              const src = (images?.[f.slug] ?? WORK_CDN + f.asset) + CROP;
              return (
                <div
                  key={f.key}
                  className={`panel${on ? ' on' : ''}`}
                  id={`panel-${f.key}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${f.key}`}
                  hidden={!on}
                >
                  <div className="mat">
                    <div className="mat-frame">
                      <div className="mat-bar" aria-hidden="true">
                        <b></b>
                        <b></b>
                        <b></b>
                        <span>{f.domain}</span>
                      </div>
                      <div className="mat-shot">
                        <img
                          src={src}
                          alt={f.alt}
                          width={1280}
                          height={768}
                          loading={f.eager ? 'eager' : 'lazy'}
                          {...(f.eager ? { fetchPriority: 'high' as const } : {})}
                        />
                      </div>
                    </div>
                    <span className="rpill">
                      <i></i>
                      <b>{f.rNum}</b>
                      <span>{f.rLabel}</span>
                    </span>
                  </div>
                  <div className="mat-cap">
                    <div className="mat-out">
                      <b>{f.headline}</b>
                      <span>{f.meta}</span>
                    </div>
                    <Link className="mat-view" href={`/case-studies/${f.slug}`}>
                      {f.viewLabel} <ArrowIcon />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
