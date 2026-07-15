import Image from 'next/image';
import type { ExhibitTestimonial } from './data';

/**
 * Exhibits — "What our clients say": deep-stage 3-up exhibit gallery with big
 * duotone portraits, brand pills, and quotes. Data comes LIVE from Sanity via
 * getPricingTestimonials() (see ./data).
 */
const DELAYS = ['0s', '.08s', '.16s'];

export function Exhibits({ testimonials }: { testimonials: ExhibitTestimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="exh diag" aria-label="What our clients say">
      <div className="container">
        <div className="exh-head rv">
          <h2 className="display on-dark">
            What our clients <span className="ghost">say.</span>
          </h2>
        </div>
        <div className="exh-grid">
          {testimonials.map((t, i) => (
            <article
              className="exh-card rv"
              key={t.id}
              style={{ ['--d' as string]: DELAYS[i] ?? '0s' }}
              data-mono={t.mono ? '' : undefined}
            >
              <div className="exh-photo">
                <span className="exh-plogo">
                  <i></i>
                  <b>{t.brand}</b>
                </span>
                <Image src={t.photo} width={720} height={900} quality={82} alt={`${t.name} portrait`} loading="lazy" />
              </div>
              <p className="exh-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="exh-cap">
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
