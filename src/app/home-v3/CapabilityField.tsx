import Image from 'next/image';

/**
 * CapabilityField — "what we do", as a colour field with typographic columns.
 *
 * Reference anchor: Locomotive's capabilities section
 * (design-lab/harvest/2026-09-15/services/Locomotive.webp) — one saturated
 * full-bleed field, a real image bleeding the bottom-left corner, and the
 * capability lists set as plain typographic columns with hairline rules. Aino,
 * Analogue and Mother Design do the same thing without the image. Across the ten
 * agency services sections harvested, NONE used the tinted-card-with-chips
 * pattern the live site uses here — that pattern is the tell, not the craft.
 *
 * So: no cards, no chips, no rounded pills. The field is the object, the type is
 * the structure, and the asset is a real client build cropped by the frame edge.
 *
 * Asset: the Montblanc microsite we built, cropped by the left edge of the
 * field, with a tonal scrim so it sits in the indigo ground rather than on it.
 */

const SANITY = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
// Montblanc's microsite, not Toku's dashboard: the first crop sliced a white
// product UI mid-word and fought the indigo field. This build is illustrated and
// tonally native to a deep ground, and it is shown as a whole composition.
const SHOT = `${SANITY}a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg?w=1240&h=1080&fit=crop&crop=center&fm=webp&q=84`;

const GROW = [
  'Generative Engine Optimization',
  'AI Search Optimization (AEO)',
  'Technical SEO',
  'Content Strategy',
  'Conversion Rate Optimization',
];

const DELIVER = [
  'Conversion Copywriting',
  'UX/UI Design',
  'Webflow Development',
  'CMS Architecture',
  'Design System Setup',
];

function Column({ label, note, items }: { label: string; note: string; items: string[] }) {
  return (
    <div className="cf-col">
      <p className="cf-col-head">
        <span>{label}</span>
        <em>{note}</em>
      </p>
      <ul>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export function CapabilityField() {
  return (
    <section className="cf" aria-labelledby="cf-h">
      <div className="cf-inner">
        <div className="cf-shot rv" aria-hidden="true">
          <Image src={SHOT} alt="" width={1240} height={1080} loading="lazy" quality={84} />
        </div>

        <div className="cf-body">
          <span className="cf-eyebrow rv">
            <i aria-hidden="true"></i>What we do
          </span>
          <h2 id="cf-h" className="rv">
            One growth system, across your stack<span className="ghost">.</span>
          </h2>
          <p className="cf-lede rv">
            The core program runs every month. The build work joins it when the site itself is what
            is holding the numbers back.
          </p>

          <div className="cf-cols rv">
            <Column label="Grow" note="Core program" items={GROW} />
            <Column label="Deliver" note="When needed" items={DELIVER} />
          </div>
        </div>
      </div>
    </section>
  );
}
