import { PLATE_DEFS, PLATES } from './_plates';
import { BlueprintPlate } from './BlueprintPlate';

/**
 * ProblemSection — "Five ways your site is quietly costing you deals" on the
 * crisp light stage: a field-manual catalog of 5 blueprint plates, then the
 * "if two of these sound familiar" band. PLATE_DEFS holds the shared SVG
 * <defs> (arrowhead marker + hatch pattern) included once for all plates.
 */
export function ProblemSection() {
  return (
    <section className="problem">
      {/* shared arrowhead + hatch defs — included once, referenced by every plate */}
      <div dangerouslySetInnerHTML={{ __html: PLATE_DEFS }} />

      <div className="container">
        <span className="eyebrow rv">
          <i aria-hidden="true"></i>The problem
        </span>
        <h2 className="display rv" style={{ transitionDelay: '.04s' }}>
          Five ways your site is quietly costing you deals<span className="ghost">.</span>
        </h2>
        <div className="light-rule rv" style={{ transitionDelay: '.08s' }} aria-hidden="true">
          <span className="rule-tag">FIG.001–005 · FIELD NOTES FROM 200+ BUILDS</span>
        </div>

        <div className="figgrid">
          {PLATES.map((p, i) => (
            <BlueprintPlate key={i} p={p} />
          ))}
        </div>

        <div className="pband rv" style={{ transitionDelay: '.08s' }}>
          <p>
            <i aria-hidden="true"></i>If two of these sound familiar, the rest of this page is for you.
          </p>
          <a href="#book" data-cal-trigger="" className="pband-btn">
            Book a strategy call{' '}
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1.5 6.5h10M8 2.5l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
