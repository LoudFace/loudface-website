/**
 * SystemMatrix — "the whole system, not the pieces".
 *
 * A comparison matrix where the LoudFace row is the electric indigo stage and
 * every other route sits on crisp light. The compared rows are generic routes a
 * buyer actually weighs (in-house, a content-only agency, an AI writing tool) —
 * never a named competitor, and no claim is made about any specific company.
 *
 * Cells are honest: a filled mark means the route covers it as standard, an open
 * mark means it varies by who you hire, and a struck mark means it is not part
 * of that route. No guarantee, uptime, or invented figure appears here.
 */

type Cell = 'yes' | 'varies' | 'no';

const COLUMNS = ['Strategy before output', 'Google rankings', 'AI citations', 'Conversion work', 'One team accountable'];

const ROWS: { name: string; note: string; cells: Cell[]; hero?: boolean }[] = [
  {
    name: 'LoudFace',
    note: 'One partner across discovery, content, AI answers, and the pages that convert.',
    cells: ['yes', 'yes', 'yes', 'yes', 'yes'],
    hero: true,
  },
  {
    name: 'In-house, on your own',
    note: 'Full control and the lowest invoice. Also your roadmap, your hiring, and your risk.',
    cells: ['varies', 'varies', 'no', 'varies', 'yes'],
  },
  {
    name: 'A content-only agency',
    note: 'Words get produced. Whether they rank, get cited, or convert is somebody else’s job.',
    cells: ['no', 'varies', 'no', 'no', 'no'],
  },
  {
    name: 'An AI writing tool',
    note: 'Fast and cheap output. No strategy underneath it and nothing that fixes the page.',
    cells: ['no', 'no', 'no', 'no', 'no'],
  },
];

const LABEL: Record<Cell, string> = {
  yes: 'Included as standard',
  varies: 'Varies',
  no: 'Not part of this route',
};

function Mark({ v }: { v: Cell }) {
  return (
    <span className={`mx-mark mx-${v}`} role="img" aria-label={LABEL[v]}>
      {v === 'yes' ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 8.5l3.5 3.5L13 4.5" />
        </svg>
      ) : v === 'varies' ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3.5 8h9" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        </svg>
      )}
    </span>
  );
}

export function SystemMatrix() {
  return (
    <div className="mx-wrap">
      <table className="mx">
        <caption className="sr-only">
          How an operator-led growth partner compares with running it in-house, hiring a content-only agency, or using an
          AI writing tool.
        </caption>
        <thead>
          <tr>
            <th scope="col">Route</th>
            {COLUMNS.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name} className={r.hero ? 'is-hero' : undefined}>
              <th scope="row">
                <b>{r.name}</b>
                <span>{r.note}</span>
              </th>
              {r.cells.map((c, i) => (
                <td key={COLUMNS[i]} data-label={COLUMNS[i]} className={c === 'no' ? 'is-no' : undefined}>
                  <Mark v={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mx-note">
        Every route on this table can work. Only one of them is one team, answerable for the whole outcome.
      </p>
    </div>
  );
}
