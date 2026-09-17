/**
 * Compare — crisp-light tier comparison table. On mobile it scrolls
 * horizontally with edge fades + a sticky feature column; the scroll-state
 * class (.is-scrolled-x) is toggled by PricingV3Scripts.
 */
import type { PricingCompareContent } from '@/lib/content-utils';

const d = (v: string) => ({ ['--d' as string]: v });

export function Compare({ content }: { content: PricingCompareContent }) {
  return (
    <section className="compare" id="compare">
      <div className="container">
        <div className="compare-head rv">
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
        <div className="ctable-wrap rv" style={d('.06s')}>
          <table className="ctable">
            <thead>
              <tr>
                <th scope="col">{content.columns.feature}</th>
                <th scope="col">
                  {content.columns.solo}<span className="th-tag">{content.columns.soloTag}</span>
                </th>
                <th scope="col" className="col-feat">
                  {content.columns.dual}<span className="th-tag">{content.columns.dualTag}</span>
                </th>
                <th scope="col">
                  {content.columns.scale}<span className="th-tag">{content.columns.scaleTag}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className={r.emph ? 'emph' : undefined}>{r.solo}</td>
                  <td className={`col-feat${r.emph ? ' emph' : ''}`}>{r.dual}</td>
                  <td className={r.emph ? 'emph' : undefined}>{r.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ctable-hint" aria-hidden="true">
          Swipe to compare
          <svg viewBox="0 0 24 24">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </p>
        <p className="compare-foot rv">
          {content.footnote}
        </p>
      </div>
    </section>
  );
}
