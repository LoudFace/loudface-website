/**
 * methodology-v3 / shared: the two primitives every concept renders the same
 * way, because the house already settled how they work.
 *
 * MeasureTable: a plain semantic <table>. The harvested candidate (beUI's
 * virtualized data table) was rejected: it renders only the visible rows, so an
 * eight-row measurement table would reach an AI crawler three rows deep, and it
 * needs @tanstack/react-virtual, a dependency this repo does not carry.
 *
 * FaqAccordion: native <details>/<summary>, the same mechanism /pricing ships.
 * Answers sit in the served HTML open or closed, which is the whole point on a
 * page whose FAQ also feeds FAQPage schema.
 */
import { MEASURE, METHODOLOGY_FAQ } from './data';

export function MeasureTable({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <div className={`mtable-wrap${dark ? ' is-dark' : ''}`}>
        <table className="mtable">
          <caption className="sr-only">
            What LoudFace measures, what each metric answers, and where it comes from
          </caption>
          <thead>
            <tr>
              {MEASURE.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEASURE.rows.map((r) => (
              <tr key={r.metric} data-floor={r.floor ? '' : undefined}>
                <th scope="row">
                  {r.metric}
                  {r.floor && <span className="floorchip">{MEASURE.floorLabel}</span>}
                </th>
                <td>{r.answers}</td>
                <td>{r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mtable-hint" aria-hidden="true">
        Swipe the table
        <svg viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </p>
    </>
  );
}

export function FaqAccordion() {
  return (
    <div className="acc">
      {METHODOLOGY_FAQ.map((item) => (
        <details key={item.q}>
          <summary>
            {item.q}
            <span className="mk" aria-hidden="true" />
          </summary>
          <div className="ans">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
