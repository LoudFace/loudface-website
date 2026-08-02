/**
 * TeamMemberPageV3 — the v3 template for `/team/<slug>` author profiles.
 *
 * Rhythm (DESIGN.md §2 — pages OPEN electric, night is mid-page depth only):
 *   ELECTRIC hero (portrait medallion — §7: the team is the one place
 *   portraits belong) → CRISP LIGHT published-articles gallery → NIGHT
 *   cover-stack CTA → FooterV3.
 *
 * The visual layer is service-v3/service-v3.css rendered inside a `.svcv3`
 * wrapper; only the portrait/social/article furniture (`.tm-*`) is new and
 * lives in team-v3.css. Server Component — zero page-level client JS beyond
 * the shared reveal script; the dark→scrolled nav flip is owned by the shared
 * (site) Header.
 */
import Image from 'next/image';
import Link from 'next/link';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';

const CROP_CARD = '?w=760&h=476&fit=crop&crop=top&fm=webp&q=82';

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export interface ArticleCard {
  href: string;
  title: string;
  category?: string;
  /** ISO date — rendered in a <time datetime> */
  publishedDate?: string;
  imageUrl?: string;
}

export interface TeamMemberView {
  name: string;
  jobTitle?: string;
  bio?: string;
  portraitUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  articles: ArticleCard[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TeamMemberPageV3({ view }: { view: TeamMemberView }) {
  const v = view;
  const hasSocial = Boolean(v.linkedinUrl || v.twitterUrl);

  return (
    <>
      {/* NOTE: (site)/layout.tsx already wraps children in <main id="main-content">,
          so this template must not add a second <main>. */}

      {/* ============ HERO — electric stage ============ */}
      <section className="hero" aria-label={v.name}>
        <div className="hero-grid tm-hero">
          <div className="hero-copy">
            <nav className="tm-crumb rv" aria-label="Breadcrumb">
              <Link href="/about">About</Link>
              <span aria-hidden="true">/</span>
              <span>{v.name}</span>
            </nav>

            <span className="hero-eyebrow rv">LoudFace team</span>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }} data-speakable>
              {v.name}
            </h1>
            {v.jobTitle ? <p className="tm-role rv">{v.jobTitle}</p> : null}
            {v.bio ? (
              <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
                {v.bio}
              </p>
            ) : null}

            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg btn-pill">
                Book a call
              </a>
              <Link href="/about" className="tlink">
                Meet the team
                <Arrow />
              </Link>
            </div>

            {hasSocial ? (
              <div className="tm-social rv" style={{ ['--d' as string]: '.22s' }}>
                {v.linkedinUrl ? (
                  <a
                    href={v.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${v.name} on LinkedIn`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                ) : null}
                {v.twitterUrl ? (
                  <a
                    href={v.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${v.name} on X`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="tm-portrait rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="tm-frame">
              {v.portraitUrl ? (
                <Image
                  src={v.portraitUrl}
                  alt={v.name}
                  width={544}
                  height={544}
                  quality={82}
                  priority
                />
              ) : (
                <span className="tm-initial" aria-hidden="true">
                  {v.name.charAt(0)}
                </span>
              )}
            </div>
            {v.articles.length > 0 ? (
              <span className="tm-count">
                <i></i>
                <b>{v.articles.length}</b>
                <span>{v.articles.length === 1 ? 'published article' : 'published articles'}</span>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* ============ PUBLISHED ARTICLES — crisp light ============ */}
      <section className="tm-work">
        <div className="container">
          <div className="tm-work-head">
            <span className="eyebrow rv">Published work</span>
            <h2 className="rv">Articles by {v.name}</h2>
          </div>

          {v.articles.length > 0 ? (
            <div className="tm-grid">
              {v.articles.map((a, i) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="tm-card rv"
                  style={{ ['--d' as string]: `${Math.min(i, 5) * 0.05}s` }}
                >
                  <div className="tm-card-shot">
                    {a.imageUrl ? (
                      <Image
                        src={a.imageUrl + CROP_CARD}
                        alt={a.title}
                        width={760}
                        height={476}
                        quality={82}
                        sizes="(min-width:1040px) 360px, (min-width:700px) 46vw, 92vw"
                        loading="lazy"
                      />
                    ) : (
                      <span className="tm-card-plate" aria-hidden="true">
                        {a.title.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="tm-card-body">
                    {a.category ? <span className="tm-tag">{a.category}</span> : null}
                    <h3>{a.title}</h3>
                    {a.publishedDate ? (
                      <time dateTime={a.publishedDate}>{formatDate(a.publishedDate)}</time>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="tm-empty rv">
              {v.name} has not published an article on the LoudFace blog yet.{' '}
              <Link href="/blog">Read the latest posts</Link>.
            </p>
          )}
        </div>
      </section>

      {/* ============ COVER — night stage close ============ */}
      <section className="cover">
        <div className="container cover-in">
          <div className="cover-meta">
            <span>LoudFace — intro call</span>
            <span>30 minutes</span>
          </div>
          <div className="cover-mid">
            <h2 className="rv">Want to work with our team?</h2>
            <p className="rv" style={{ ['--d' as string]: '.08s' }}>
              Tell us where the site is losing you pipeline. We&rsquo;ll show you what we&rsquo;d
              change first.
            </p>
            <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">
                Book an intro call
              </a>
              <span className="slots">
                <span className="dot"></span>One team — build and growth
              </span>
            </div>
          </div>
          <div className="cover-credit rv">
            <span>Typical first response — around 2 hours</span>
            <span>loudface.co</span>
          </div>
        </div>
      </section>

      <FooterV3 />
      <ServiceV3Scripts />
    </>
  );
}
