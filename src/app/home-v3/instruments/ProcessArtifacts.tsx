/**
 * ProcessArtifacts — "How an engagement works", where each gate carries the
 * artifact it produces instead of a paragraph on a dashed rail.
 *
 * Rev 2: no chrome dots, no rounded chips, no card-within-a-card. The four gates
 * are cells of one hairline grid; each artifact is a flat list of rows with a
 * square status tag. Unmet or not-yet rows use the system's 45-degree hatching.
 * No 01/02/03 markers — banned house-wide; the dated gate label does that job.
 */

type ArtRow = { label: string; mark?: string; tone?: 'on' | 'filled'; blank?: boolean };

function Rows({ rows }: { rows: ArtRow[] }) {
  return (
    <ul className="art-rows">
      {rows.map((r) => (
        <li key={r.label} className={r.blank ? 'is-blank' : undefined}>
          <span>{r.label}</span>
          {r.mark && <b className={`art-mark${r.tone ? ` ${r.tone}` : ''}`}>{r.mark}</b>}
        </li>
      ))}
    </ul>
  );
}

const GATES = [
  {
    gate: 'Week 0',
    title: 'Strategy call',
    body: 'Thirty minutes. You tell us what’s broken and what you’ve tried; we tell you honestly whether we’re the right fit.',
    art: (
      <Rows
        rows={[
          { label: 'What we’d work on first', mark: 'Scoped', tone: 'on' },
          { label: 'What it costs, monthly', mark: 'Scoped', tone: 'on' },
          { label: 'What we would not touch yet', mark: 'Scoped', tone: 'on' },
          { label: 'Sent within 48 hours', mark: '48h', tone: 'filled' },
        ]}
      />
    ),
  },
  {
    gate: 'Weeks 1–4',
    title: 'Set the growth plan',
    body: 'We audit discovery, content, conversion, and the stack. The work then starts at whichever one is the constraint.',
    art: (
      <Rows
        rows={[
          { label: 'Discovery', mark: 'Constraint', tone: 'filled' },
          { label: 'Content', mark: 'Constraint', tone: 'filled' },
          { label: 'Conversion', mark: 'Holding' },
          { label: 'Stack', mark: 'Holding' },
        ]}
      />
    ),
  },
  {
    gate: 'Weeks 4–6',
    title: 'Ship and measure',
    body: 'We ship the agreed work, set up analytics where needed, and fix a baseline. We track what connects to pipeline.',
    art: (
      <Rows
        rows={[
          { label: 'Pages rebuilt', mark: 'Live', tone: 'on' },
          { label: 'Content published', mark: 'Live', tone: 'on' },
          { label: 'Analytics baseline', mark: 'Running' },
          { label: 'Vanity dashboards', mark: 'None', blank: true },
        ]}
      />
    ),
  },
  {
    gate: 'Month 3+',
    title: 'Grow and optimise',
    body: 'SEO, AEO, and CRO compound. You get a monthly report on what we did, what moved, and what is next.',
    art: (
      <>
        <svg viewBox="0 0 220 44" aria-hidden="true" className="art-spark">
          <line x1="0" y1="43" x2="220" y2="43" className="axis-line" />
          <line x1="0" y1="22" x2="220" y2="22" className="grid-line" />
          <line x1="0" y1="4" x2="220" y2="4" className="grid-line" />
          <path d="M2 40 C 44 38, 78 31, 112 24 S 178 10, 218 6" className="series" />
          <rect x="215" y="3" width="6" height="6" className="marker" />
        </svg>
        <Rows
          rows={[
            { label: 'What we did', mark: 'Monthly', tone: 'on' },
            { label: 'What moved', mark: 'Monthly', tone: 'on' },
            { label: 'What is next', mark: 'Monthly', tone: 'on' },
          ]}
        />
      </>
    ),
  },
];

export function ProcessArtifacts() {
  return (
    <ol className="gates">
      {GATES.map((g) => (
        <li key={g.gate} className="gate-col">
          <p className="gate-when">{g.gate}</p>
          <div className="gate-art">{g.art}</div>
          <div className="gate-text">
            <h3 className="gate-title">{g.title}</h3>
            <p className="gate-body">{g.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
