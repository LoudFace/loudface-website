/**
 * Compare — crisp-light tier comparison table. On mobile it scrolls
 * horizontally with edge fades + a sticky feature column; the scroll-state
 * class (.is-scrolled-x) is toggled by PricingV3Scripts.
 */
const d = (v: string) => ({ ['--d' as string]: v });

const ROWS: { label: string; solo: string; dual: string; scale: string; emph?: boolean }[] = [
  { label: 'Tracks', solo: 'Build or Growth', dual: 'Build + Growth', scale: 'Multi-track' },
  { label: 'Active initiatives', solo: '1', dual: '2', scale: '3–4', emph: true },
  { label: 'Showcases', solo: '1/week', dual: '2/week', scale: '3+/week (or rolling)' },
  { label: 'Maintenance', solo: '1 batch/week', dual: '2 batches/week', scale: 'Rolling / priority' },
  { label: 'Response time', solo: '2h', dual: '2h', scale: '2h', emph: true },
  {
    label: 'Strategic layer',
    solo: 'Scoreboard, Monthly Memo, Quarterly Focus',
    dual: 'Everything in Solo + structured testing',
    scale: 'Everything in Dual + multi-stakeholder governance',
  },
  { label: 'Meetings', solo: 'Async by default', dual: 'Async by default', scale: 'Optional standups' },
];

export function Compare() {
  return (
    <section className="compare" id="compare">
      <div className="container">
        <div className="compare-head rv">
          <span className="eyebrow">
            <i></i>Compare the tiers
          </span>
          <h2 className="display">
            Same team, <span className="ghost">more velocity.</span>
          </h2>
          <p className="lede">
            Each tier turns up the number of initiatives, the cadence, and the coordination. The
            strategic layer never changes.
          </p>
        </div>
        <div className="ctable-wrap rv" style={d('.06s')}>
          <table className="ctable">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">
                  Solo<span className="th-tag">One track</span>
                </th>
                <th scope="col" className="col-feat">
                  Dual<span className="th-tag">Most popular</span>
                </th>
                <th scope="col">
                  Scale<span className="th-tag">Multi-track</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
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
          Every engagement is scoped to your goals. Pricing depends on tier, scope, and complexity.
          Book an intro call and we&rsquo;ll recommend the right fit.
        </p>
      </div>
    </section>
  );
}
