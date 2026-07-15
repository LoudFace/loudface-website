/**
 * ResultsLedger — the crisp-light "outcome" band (server component).
 *
 * Renders the study's populated result stats as a ledger whose column count is
 * driven by how many results exist (1 / 2 / 3). result-1 is schema-required, so
 * this always shows at least one tile; result-2 (31%) and result-3 (19%) compose
 * in cleanly when present. Sparse studies get a single-column ledger.
 */
import type { ResultStat } from './helpers';

export function ResultsLedger({ results }: { results: ResultStat[] }) {
  if (results.length === 0) return null;
  const cols = results.length === 1 ? 'cols-1' : results.length === 2 ? 'cols-2' : 'cols-3';

  return (
    <section className="results" aria-label="Key results">
      <div className="container-wide">
        <div className="results-top">
          <span className="eyebrow">Key results</span>
          <p className="lead">The headline numbers from this engagement — each measured against the client&rsquo;s own starting point.</p>
        </div>
        <div className={`ledger ${cols}`}>
          {results.map((r, i) => (
            <div className="ldg" key={i}>
              <div className="ldg-num tnum">{r.number}</div>
              <div className="ldg-lab">{r.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
