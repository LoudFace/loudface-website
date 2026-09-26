import type { ReactNode } from 'react';
import Link from 'next/link';
import { Caveat } from 'next/font/google';
import type { HomeV11Content } from '@/lib/content-utils';
import { type ServiceConfig, artifactSrc } from '../service-v3/data';
import { SERVICES, TRACK_BY_SLUG } from '../services-v3/data';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import type { HomeV11Data } from '../home-v11/data';
import { ArrowUpRight, Eyebrow, LfMark, img } from '../home-v11/ui';
import { Browser } from './kit';
import { EXTRAS } from './pages';
import { ServiceResults } from './proof';
import type { ServiceExtras } from './types';

/**
 * ServicePageV11: the /services/<slug> template in the v11 system, laid out as the approved CRO board
 * (Paper, "Services · CRO", 2026-09-24). The copy is the page's existing ServiceConfig; each page adds its
 * own stage picture, proof cells and one signature section (./pages). Sections alternate warm and white; the FAQ
 * always sits on --warm.
 *
 * 2026-09-25: a photo-first rebuild of this template lost to it section by section (Arnel's comments on the CRO
 * comparison boards). Kept from it: the results as live charts (ServiceResults), and the other services as photo cards.
 * The page's own proof grid moved after the FAQ as the social proof section.
 */

/** Each service's photograph from the device series, for the related-service cards. */
const PHOTO_FILE: Record<string, string> = { 'seo-aeo': 'seo-aeo-lf' };
const photo = (slug: string) => img(`services/photo-${PHOTO_FILE[slug] ?? slug}.webp`);

// preload off: the handwritten note sits far below the fold, and preloading it delayed the hero (Lighthouse, 2026-09-26)
const hand = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--font-hand', preload: false });

const CROP_HERO = '?w=1720&h=908&fit=crop&crop=top&fm=webp&q=82';
const TONES = ['is-ind', 'is-lav', 'is-peach', 'is-sand', 'is-lav', 'is-peach'];

/** Each service's own hero tint, so no two service pages open alike (DESIGN.md §6). */
export const TONE: Record<string, string> = {
  cro: 'peach', webflow: 'sky', 'ux-ui-design': 'lav', copywriting: 'sand', 'seo-aeo': 'mint',
  'organic-growth': 'lime', 'geo-agency': 'aqua', 'ai-overviews': 'rose', 'growth-autopilot': 'apricot',
};

/** Tile rows by count: the lead tile is wide and indigo, then rows of three; a sixth spans the page. */
function rows(n: number): { size: string }[][] {
  const w = { size: 'is-wide' }, nw = { size: 'is-narrow' }, t = { size: '' }, f = { size: 'is-full' };
  if (n <= 3) return [Array(n).fill(t)];
  if (n === 4) return [[w, nw], [nw, w]];
  if (n === 5) return [[w, nw], [t, t, t]];
  return [[w, nw], [t, t, t], [f]];
}

function Head({ eyebrow, title, lede }: { eyebrow?: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <div className="sv-head">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="v11-h2">{title}</h2>
      </div>
      {lede && <p>{lede}</p>}
    </div>
  );
}

type Home = Pick<HomeV11Content, 'hero' | 'logos' | 'closing' | 'footer' | 'testimonials'> & HomeV11Content;

export function ServicePageV11({ config: c, images, home, data }: { config: ServiceConfig; images: Record<string, string>; home: Home; data: HomeV11Data | null }) {
  const x: ServiceExtras = EXTRAS[c.slug]({ config: c, home, data, images });
  // four other services, the same track (build or grow) first
  const track = TRACK_BY_SLUG[c.slug];
  const others = SERVICES.filter((s) => s.slug !== c.slug);
  const siblings = [...others.filter((s) => TRACK_BY_SLUG[s.slug] === track), ...others.filter((s) => TRACK_BY_SLUG[s.slug] !== track)].slice(0, 4);
  const sections: { key: string; node: ReactNode; ground?: 'warm' | 'white' }[] = [];

  if (c.deliver) {
    const d = c.deliver;
    let i = 0;
    sections.push({
      key: 'deliver',
      node: (
        <div className="v11-wrap">
          <Head eyebrow="The program" title={d.title} lede={d.lede} />
          <div className="sv-tiles">
            {rows(d.tiles.length).map((row, r) => (
              <div key={r} className="sv-tiles-row">
                {row.map((cell) => {
                  const n = i++;
                  const t = d.tiles[n];
                  const extra = x.tiles?.[n];
                  return (
                    <div key={n} className={`sv-tile ${TONES[n]} ${cell.size}`}>
                      {extra?.tag && <div className="sv-tile-tag"><i /><span>{extra.tag}</span></div>}
                      <div className="sv-tile-title">{t.title}</div>
                      <p className="sv-tile-desc">{t.desc}</p>
                      {extra?.art && <div className="sv-tile-art">{extra.art}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (c.body) {
    sections.push({
      key: 'body',
      node: x.body ?? (
        <div className="v11-wrap v11-prose-wrap">
          {c.body.title && <h2 className="v11-h2">{c.body.title}</h2>}
          <div className="v11-prose" dangerouslySetInnerHTML={{ __html: c.body.html }} />
        </div>
      ),
    });
  }

  // Results: the live charts, one client per cell (ServiceResults). The page's proof grid (client videos, quotes and
  // figures) follows later as the social proof section (Arnel, 2026-09-25: "value-packed" and "aesthetically pleasing"
  // were two different jobs).
  sections.push({
    key: 'results',
    node: (
      <div className="v11-wrap">
        {x.chartsUseHomeHead || !c.proof ? (
          <Head eyebrow="Results" title={<span dangerouslySetInnerHTML={{ __html: home.results.heading }} />} lede={home.results.body} />
        ) : (
          <Head eyebrow="Results" title={c.proof.title} lede={c.proof.lede} />
        )}
        <ServiceResults slug={c.slug} home={home} data={data} />
      </div>
    ),
  });

  if (x.signature) {
    const s = x.signature;
    sections.push({
      key: 'signature',
      ground: s.ground,
      node: (
        <div className="v11-wrap">
          <Head eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
          {s.node}
        </div>
      ),
    });
  }

  for (const m of x.more ?? []) {
    sections.push({
      key: m.key,
      node: (
        <div className="v11-wrap">
          <Head eyebrow={m.eyebrow} title={m.title} lede={m.lede} />
          {m.node}
        </div>
      ),
    });
  }

  if (c.runway) {
    const r = c.runway;
    sections.push({
      key: 'runway',
      node: (
        <div className="v11-wrap">
          <Head title={r.title} lede={r.lede} />
          <div className="v11-svc-plate">
            <div className="v11-sheet is-program">
              <div className="v11-sheet-head">
                <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
                <span className="is-meta">{c.hero.eyebrow} · Your company</span>
              </div>
              <div className="v11-program">
                {r.pillars.map((p, i) => (
                  <div key={i} className={`v11-program-row is-${p.kind}`}>
                    <div className="v11-program-title">{p.title}</div>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    });
  }

  if (c.comparison) {
    const t = c.comparison;
    sections.push({
      key: 'comparison',
      node: (
        <div className="v11-wrap">
          <Head title={t.title} lede={t.intro} />
          <div className="v11-table-wrap is-plain">
            <table className="sv-table">
              <thead><tr>{t.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr></thead>
              <tbody>
                {t.rows.map((row) => (
                  <tr key={row.discipline}><th scope="row">{row.discipline}</th><td>{row.optimizesFor}</td><td>{row.whereWeShowUp}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    });
  }

  sections.push({
    key: 'faq',
    node: (
      <div className="v11-wrap v11-faq">
        <div className="v11-faq-head"><h2 className="v11-h2">{c.faq.title}</h2></div>
        <div className="v11-faq-list">
          {c.faq.items.map((f, i) => (
            <details key={i} className="v11-faq-item">
              <summary><span>{f.q}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
              <div className="v11-faq-a" dangerouslySetInnerHTML={{ __html: f.aHtml }} />
            </details>
          ))}
        </div>
      </div>
    ),
  });

  if (x.results) {
    sections.push({
      key: 'voices',
      node: (
        <div className="v11-wrap">
          {/* the grid's own heading where the page has one (it describes these clients), else the homepage's */}
          <Head
            eyebrow={x.results.eyebrow ?? home.testimonials.eyebrow}
            title={x.results.title ?? <span dangerouslySetInnerHTML={{ __html: home.testimonials.heading }} />}
            lede={x.results.lede}
          />
          <div className="cro-grid">{x.results.cells}</div>
        </div>
      ),
    });
  }

  sections.push({
    key: 'related',
    node: (
      <div className="v11-wrap">
        <Head title={c.rel.title} lede={c.rel.note} />
        <div className="sv-others">
          {siblings.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="sv-other">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(s.slug)} alt="" width={1800} height={1344} loading="lazy" />
              <span className="is-name">{s.serviceName}</span>
              <span className="is-blurb">{s.blurb}</span>
              <span className="is-go" aria-hidden="true"><ArrowUpRight /></span>
            </Link>
          ))}
        </div>
      </div>
    ),
  });

  // grounds alternate, anchored so the FAQ is always on --warm (Arnel, 2026-09-25)
  const faqAt = sections.findIndex((s) => s.key === 'faq');
  const ground = (i: number) => ((i - faqAt) % 2 === 0 ? 'v11-warm' : 'v11-white');

  const h = c.hero;
  return (
    <div className={`v11 ${hand.variable}`} aria-label={c.ariaLabel}>
      {/* The hero: copy on white beside a panel in this service's own tint, its product UI inside and the proof card
          on the panel's edge. Light on purpose; the indigo stage is the homepage's (DESIGN.md §6, 2026-09-25). */}
      <section className={`sv-hero2 is-${TONE[c.slug] ?? 'lav'}`} data-hero="light">
        <div className="v11-wrap">
          <div className="sv-hero2-grid">
            <div className="sv-hero2-copy">
              <Eyebrow>{h.eyebrow}</Eyebrow>
              <h1>{h.h1}</h1>
              <p className="sv-hero2-blurb">{h.blurb}</p>
              <div className="sv-hero2-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>Book a strategy call</span></a>
                <Link href={h.secondary.href} className="v11-btn is-line"><span>{h.secondary.label}</span></Link>
              </div>
            </div>
            <div className="sv-hero2-stage">
              <div className="sv-hero2-panel">
                <div className="sv-hero2-art">
                  {x.heroArt ?? <Browser src={artifactSrc(h.main, images, CROP_HERO)} domain={h.main.domain} alt={h.main.alt} priority />}
                </div>
              </div>
              <div className={`sv-hero2-card ${x.heroCardWide ? 'is-wide' : ''}`}>{x.heroCard}</div>
            </div>
          </div>
          <div className="sv-band is-light">
            {x.band.map((b) => (
              <div key={b.k}><span className="is-k">{b.k}</span><span className="is-v">{b.v}</span><span className="is-s">{b.s}</span></div>
            ))}
          </div>
        </div>
      </section>
      <LogoGrid c={{ ...home.logos, body: c.logosLead }} />
      {sections.map((s, i) => (
        <section key={s.key} className={`v11-sec ${ground(i)} is-${s.key}`}>{s.node}</section>
      ))}
      <Closing c={{ ...home.closing, heading: c.cover.h2, agenda: [] }} lede={c.cover.p} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
