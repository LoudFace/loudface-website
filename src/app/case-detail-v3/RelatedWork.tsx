/**
 * RelatedWork — the marquee wall + up to 3 related-study cards (server component).
 *
 * Card selection is done upstream by the existing industry(+3)/service(+2)
 * scoring util; this component only renders. Each card is text-forward (client,
 * title, lead result, tag) — no thumbnail, matching the concept. The marquee is
 * purely decorative (aria-hidden) and lists the portfolio's client names.
 */
import Link from 'next/link';

const ArrowIcon = () => (
  <svg className="arrow" width="13" height="10" viewBox="0 0 15 12" fill="none" aria-hidden="true">
    <path d="M9 1l5 5-5 5M14 6H1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface RelatedCard {
  slug: string;
  title: string;
  clientName?: string;
  clientColor: string;
  resultNumber?: string;
  resultTitle?: string;
  tag?: string;
}

interface RelatedWorkProps {
  cards: RelatedCard[];
  marqueeNames: string[];
}

export function RelatedWork({ cards, marqueeNames }: RelatedWorkProps) {
  if (cards.length === 0) return null;
  const strip = marqueeNames.length ? [...marqueeNames, ...marqueeNames] : [];

  return (
    <section className="related" aria-label="Related case studies">
      {strip.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {strip.map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </div>
        </div>
      )}
      <div className="container-wide">
        <div className="rel-head">
          <h2 className="h-sec">Related work</h2>
          <Link className="rel-go" href="/case-studies">
            See all case studies <ArrowIcon />
          </Link>
        </div>
        <div className="rel-cards">
          {cards.map((c) => (
            <Link className="rel-card" href={`/case-studies/${c.slug}`} key={c.slug}>
              <div className="rel-top" style={{ background: c.clientColor }} />
              <div className="rel-body">
                {c.clientName && <div className="rel-client">{c.clientName}</div>}
                <h3>{c.title}</h3>
                {c.resultNumber && (
                  <div className="rel-metric">
                    <div className="num tnum">{c.resultNumber}</div>
                    {c.resultTitle && <div className="lab">{c.resultTitle}</div>}
                  </div>
                )}
                <div className="rel-foot">
                  <span className="rel-tag">{c.tag || 'Case study'}</span>
                  <span className="rel-go">Read <ArrowIcon /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
