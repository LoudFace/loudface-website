import { PLATE_DEFS, PLATES } from './_plates';
import { BlueprintPlate } from './BlueprintPlate';
import type { HomeV3ProblemContent } from '@/lib/content-utils';

/**
 * ProblemSection — "Five ways your site is quietly costing you deals" on the
 * crisp light stage: a field-manual catalog of 5 blueprint plates, then the
 * "if two of these sound familiar" band. PLATE_DEFS holds the shared SVG
 * <defs> (arrowhead marker + hatch pattern) included once for all plates.
 */
export function ProblemSection({ content }: { content: HomeV3ProblemContent }) {
  return (
    <section className="problem">
      {/* shared arrowhead + hatch defs — included once, referenced by every plate */}
      <div dangerouslySetInnerHTML={{ __html: PLATE_DEFS }} />

      <div className="container">
        <span className="eyebrow rv">
          <i aria-hidden="true"></i>{content.eyebrow}
        </span>
        <h2 className="display rv" style={{ transitionDelay: '.04s' }}>
          {content.headline}<span className="ghost">.</span>
        </h2>
        <div className="light-rule rv" style={{ transitionDelay: '.08s' }} aria-hidden="true">
          <span className="rule-tag">{content.ruleTag}</span>
        </div>

        <div className="figgrid">
          {PLATES.map((p, i) => (
            <BlueprintPlate key={i} p={p} content={content.plates[i]} />
          ))}
        </div>

        <div className="pband rv" style={{ transitionDelay: '.08s' }}>
          <p>
            <i aria-hidden="true"></i>{content.bandText}
          </p>
          <a href="#book" data-cal-trigger="" className="pband-btn">
            {content.bandCtaText}{' '}
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1.5 6.5h10M8 2.5l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
