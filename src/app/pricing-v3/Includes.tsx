/**
 * Includes — "What every plan includes" icon band (7 tiles, 4+3 grid) followed
 * by the Special Arrangements editorial strip.
 */
import type { PricingIncludesContent, PricingSpecialArrangementsContent } from '@/lib/content-utils';

const d = (v: string) => ({ ['--d' as string]: v });

/** Decorative icon paths only — titles/descriptions come from content, matched by array position. */
const ICONS: React.ReactNode[] = [
  <path key="0" d="M12 2l2.4 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-1.5z" strokeLinejoin="round" />,
  <path key="1" d="M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="2" d="M4 5h16v11H4zM4 20h16M9 9l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="3" d="M6 3h12v18l-6-3-6 3zM9 8h6M9 12h6" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="4" d="M12 3v3M12 12l4 2M3 12a9 9 0 1018 0 9 9 0 00-18 0z" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="5" d="M3 5h18v11H3zM8 20h8M12 16v4M8 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="6" d="M14 4l6 6M3 21l1-5L15 5l4 4L8 20zM12 8l4 4" strokeLinecap="round" strokeLinejoin="round" />,
];

export function Includes({ content }: { content: PricingIncludesContent }) {
  return (
    <section className="includes" id="includes">
      <div className="container">
        <div className="includes-head rv">
          <span className="eyebrow">
            <i></i>{content.eyebrow}
          </span>
          <h2 className="display">
            {content.headline} <span className="ghost">{content.headlineHighlight}</span>
          </h2>
          <p className="lede">
            {content.intro}
          </p>
        </div>
        <div className="inc-band rv" style={d('.06s')}>
          {content.items.map((item, i) => (
            <div className="inc-cell" key={item.title}>
              <div className="tico">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[i]}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpecialArrangements({ content }: { content: PricingSpecialArrangementsContent }) {
  return (
    <section className="spec" id="arrangements">
      <div className="container">
        <div className="spec-card rv">
          <div className="spec-top">
            <h2>{content.title}</h2>
          </div>
          <p className="spec-desc">
            {content.description}
          </p>
          <div className="spec-two">
            <div className="spec-opt">
              <h3>
                <i aria-hidden="true"></i>{content.options[0].title}
              </h3>
              <p>
                {content.options[0].description}
              </p>
            </div>
            <div className="spec-opt">
              <h3>
                <i aria-hidden="true"></i>{content.options[1].title}
              </h3>
              <p>
                {content.options[1].description}
              </p>
            </div>
          </div>
          <div className="spec-cta">
            <a className="btn btn-ink btn-md" href="#book-modal" data-cal-trigger="">
              {content.ctaText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
