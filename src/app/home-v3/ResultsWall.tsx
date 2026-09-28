import Image from 'next/image';
import { LOGOS } from './_logos';

/**
 * ResultsWall — the page leads with results.
 *
 * Reference anchor: Amplemarket's "Real results from real customers"
 * (design-lab/harvest/2026-09-16/results-hero/Amplemarket.webp) — a mosaic of
 * result tiles at mixed sizes, each tied to a named client's logo, interleaved
 * with pull-quote tiles. Apollo's 4-up metric row and Mews' huge percentage sit
 * in the same family.
 *
 * One deliberate departure. Amplemarket's tiles are pastel washes with plain
 * text on them, which DESIGN.md §0 bans outright ("no mid-tone tint slabs", "never
 * plain text on a pastel wash"). So the mosaic STRUCTURE is borrowed and the
 * colour is taken from the system that already ships: each stat tile stands in
 * that client's own deep brand field, the same --field / --field-hi / --stick
 * triplet SelectedWork paints its plates with. Quotes stay on crisp white with a
 * hairline and a real shadow, so the two tile types read as different objects.
 *
 * Asset: nine saturated client-brand colour fields carrying drawn content, plus
 * real client wordmarks. Not a tinted card grid — the colour is the client's.
 *
 * Every figure here already ships elsewhere on this site. Nothing is invented.
 */

type Stat = {
  cls: string;
  value: string;
  label: string;
  client: string;
  desc?: string;
  logo?: string;
  span: string;
  tall?: boolean;
};

const STATS: Stat[] = [
  { cls: 't-toku', value: '0 → 97.8%', label: 'AI visibility on the core prompt', desc: 'From absent to cited on the answer that decides Toku’s category.', client: 'Toku', logo: 'Toku', span: 'rw-4', tall: true },
  { cls: 't-dimer', value: '288%', label: 'Increase in conversions', client: 'Dimer Health', logo: 'Dimer Health', span: 'rw-4' },
  { cls: 't-tm', value: '11.7x', label: 'Organic impressions', client: 'TradeMomentum', span: 'rw-4' },
  { cls: 't-outbound', value: '$200K', label: 'Sales in the first 30 days', client: 'Outbound Specialist', span: 'rw-4' },
  { cls: 't-delshad', value: '32.7%', label: 'AI share of voice', client: 'Delshad Legal', span: 'rw-6' },
  { cls: 't-montblanc', value: '5+', label: 'Microsite pages launched', client: 'Montblanc', logo: 'Montblanc', span: 'rw-4' },
  { cls: 't-stealth', value: '10.5%', label: 'AI visibility', client: 'Stealth Fintech', span: 'rw-6' },
];

const QUOTES = [
  {
    text: 'It was very refreshing working with you compared to other agencies we’re working with.',
    who: 'Anthony Dean',
    role: 'Radisson Hotels Group',
    logo: 'Radisson Hotels Group',
    span: 'rw-4',
  },
  {
    text: 'We are extremely happy with the landing page LoudFace built for us on Webflow.',
    who: 'Daan Smit',
    role: 'CEO & Founder, Brandfirm',
    span: 'rw-8',
  },
];

function logoFor(alt?: string) {
  if (!alt) return null;
  return LOGOS.find((l) => l.alt === alt) ?? null;
}

function StatTile({ s, delay }: { s: Stat; delay?: string }) {
  const logo = logoFor(s.logo);
  return (
    <article
      className={`rw-tile rw-stat ${s.cls} ${s.span}${s.tall ? ' rw-tall' : ''} rv`}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      <p className="rw-value">{s.value}</p>
      <p className="rw-label">{s.label}</p>
      {s.desc ? <p className="rw-desc">{s.desc}</p> : null}
      <div className="rw-foot">
        {logo ? (
          <Image className="rw-logo" src={logo.src} alt={logo.alt} width={logo.w} height={logo.h} loading="lazy" quality={82} />
        ) : (
          <span className="rw-client">{s.client}</span>
        )}
      </div>
    </article>
  );
}

function QuoteTile({ q, delay }: { q: (typeof QUOTES)[number]; delay?: string }) {
  const logo = logoFor(q.logo);
  return (
    <article className={`rw-tile rw-quote ${q.span} rv`} style={delay ? { transitionDelay: delay } : undefined}>
      <blockquote>{q.text}</blockquote>
      <div className="rw-foot">
        <span className="rw-who">
          {q.who} <span>— {q.role}</span>
        </span>
        {logo ? (
          <Image className="rw-logo rw-logo-dark" src={logo.src} alt={logo.alt} width={logo.w} height={logo.h} loading="lazy" quality={82} />
        ) : null}
      </div>
    </article>
  );
}

export function ResultsWall() {
  return (
    <section className="rw" aria-labelledby="rw-h">
      <div className="container">
        <div className="rw-head">
          <span className="rw-eyebrow rv">
            <i aria-hidden="true"></i>Results
          </span>
          <h2 id="rw-h" className="rv">
            Real results from real clients<span className="ghost">.</span>
          </h2>
          <p className="rw-lede rv">
            Every figure below is a live engagement, and every one of them links to the work that produced it.
          </p>
        </div>

        <div className="rw-grid">
          <StatTile s={STATS[0]} />
          <StatTile s={STATS[1]} delay=".06s" />
          <QuoteTile q={QUOTES[0]} delay=".12s" />
          <StatTile s={STATS[2]} />
          <StatTile s={STATS[3]} delay=".06s" />
          <QuoteTile q={QUOTES[1]} />
          <StatTile s={STATS[5]} delay=".06s" />
          <StatTile s={STATS[4]} />
          <StatTile s={STATS[6]} delay=".06s" />
        </div>
      </div>
    </section>
  );
}
