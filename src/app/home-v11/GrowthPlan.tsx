import { Caveat } from 'next/font/google';
import type { HomeV11Content } from '@/lib/content-utils';
import { PlanTabs } from './PlanTabs';
import { LfMark, SectionHead, img } from './ui';

/**
 * Plan and reporting, told through the documents a client actually receives: the plan in week one, the Friday
 * note, the monthly report with a signed recommendation, and the chart marked up for the call. Paper, not an app,
 * so the section reads as a service. Illustrative client ("Your company"); the numbers are an example.
 */

const hand = Caveat({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-hand',
  // a handwritten note far below the fold: loading it with the page's first requests delayed the hero (Lighthouse, 2026-09-26)
  preload: false,
});

type C = HomeV11Content['plan'];

/** Illustrative weekly share of AI answers, in percent: the client and their strongest competitor. */
const YOU = [6.1, 6.4, 6.2, 7.0, 7.9, 9.3, 10.8, 12.6, 14.2];
const THEM = [11.8, 12.0, 11.6, 11.9, 12.3, 11.8, 12.1, 11.7, 12.0];
const PIN_WEEK = 4;

/** Both series as SVG paths inside a plot box, scaled 0–16%. */
function paths(l: number, r: number, t: number, b: number) {
  const x = (i: number) => l + ((r - l) * i) / (YOU.length - 1);
  const y = (v: number) => t + (b - t) * (1 - v / 16);
  const line = (s: number[]) => s.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return {
    x,
    y,
    you: line(YOU),
    them: line(THEM),
    area: `${line(YOU)} L${r} ${b} L${l} ${b} Z`,
  };
}

const Letterhead = ({ c, meta }: { c: C; meta: string }) => (
  <div className="v11-sheet-head">
    <span className="is-brand">
      <LfMark size={20} />
      <span>{c.brand}</span>
    </span>
    <span className="is-meta">{meta}</span>
  </div>
);

const Signature = ({ c }: { c: C }) => (
  <div className="v11-sheet-sign">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img loading="lazy" src={img('avatars/arnel-bukva.png')} alt="" width={36} height={36} />
    <span>
      <span className="is-name">{c.sign}</span>
      <span className="is-role">{c.signRole}</span>
    </span>
  </div>
);

function PlanSheet({ c }: { c: C }) {
  const d = c.planDoc;
  return (
    <div className="v11-sheet is-plan">
      <Letterhead c={c} meta={d.meta} />
      <div className="v11-sheet-label">{d.betLabel}</div>
      <div className="v11-sheet-title">{d.bet}</div>
      <p className="v11-sheet-body">{d.betBody}</p>
      <div className="v11-sheet-label">{d.daysLabel}</div>
      <div className="v11-sheet-months">
        {d.months.map((m, i) => (
          <div key={i}>
            <span className="is-month">{m.month}</span>
            <span className="is-work">{m.work}</span>
          </div>
        ))}
      </div>
      <div className="v11-sheet-label">{d.measureLabel}</div>
      <p className="v11-sheet-body">{d.measure}</p>
      <Signature c={c} />
    </div>
  );
}

function NoteSheet({ c }: { c: C }) {
  const n = c.note;
  return (
    <div className="v11-sheet is-note">
      <Letterhead c={c} meta={n.meta} />
      <p className="v11-sheet-greet">{n.greeting}</p>
      <p className="v11-sheet-body">{n.body}</p>
      <div className="v11-sheet-label">{n.nextLabel}</div>
      <p className="v11-sheet-body">{n.next}</p>
      <div className="v11-sheet-label">{n.askLabel}</div>
      <p className="v11-sheet-body">{n.ask}</p>
      <div className="v11-sheet-sign is-small">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={img('avatars/arnel-bukva.png')} alt="" width={30} height={30} />
        <span className="is-name">{n.signOff}</span>
      </div>
    </div>
  );
}

function ReportSheet({ c }: { c: C }) {
  const r = c.report;
  const p = paths(30, 500, 10, 160);
  return (
    <div className="v11-sheet is-report">
      <Letterhead c={c} meta={r.meta} />
      <div className="v11-sheet-label">{r.summaryLabel}</div>
      <div className="v11-sheet-title is-lg">{r.headline}</div>
      <p className="v11-sheet-body">{r.body}</p>
      <div className="v11-sheet-fig">
        <div className="v11-sheet-fighead">
          <span>{r.figure}</span>
          <span className="is-note">{r.figureNote}</span>
        </div>
        <div className="v11-sheet-chart">
          <svg viewBox="0 0 508 180" width="100%" aria-hidden="true">
            {[0, 5, 10, 15].map((v) => (
              <line key={v} x1="30" x2="500" y1={p.y(v)} y2={p.y(v)} stroke={v ? '#f0eff5' : '#dcdbe6'} />
            ))}
            {[5, 10, 15].map((v) => (
              <text key={v} x="0" y={p.y(v) + 4} className="is-axis">
                {v}%
              </text>
            ))}
            <path d={p.area} fill="#4f46e5" fillOpacity="0.07" />
            <path d={p.them} fill="none" stroke="#bdbbcc" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d={p.you} fill="none" stroke="#4f46e5" strokeWidth="2" />
            <line x1={p.x(PIN_WEEK)} x2={p.x(PIN_WEEK)} y1="22" y2="160" stroke="#1a1040" strokeOpacity="0.35" strokeDasharray="2 3" />
            <circle cx={p.x(8)} cy={p.y(YOU[8])} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <span className="v11-sheet-pin" style={{ left: `${(p.x(PIN_WEEK) / 508) * 100}%` }}>
            {r.pin}
          </span>
          <span className="v11-sheet-axis is-start">{r.start}</span>
          <span className="v11-sheet-axis is-end">{r.end}</span>
        </div>
      </div>
      <div className="v11-sheet-label">{r.didLabel}</div>
      <div className="v11-sheet-did">
        {r.did.map((d, i) => (
          <div key={i}>
            <span className="is-figure">{d.figure}</span>
            <span className="is-line">{d.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecNote({ c }: { c: C }) {
  const r = c.report;
  return (
    <div className="v11-sheet is-rec">
      <div className="v11-sheet-label">{r.recLabel}</div>
      <div className="v11-sheet-title">{r.rec}</div>
      <p className="v11-sheet-body">{r.recBody}</p>
      <Signature c={c} />
    </div>
  );
}

/** The chart as the strategist marks it up before the call. Fluid: positions in %, ink sized to the sheet. */
function MarkupSheet({ c }: { c: C }) {
  const m = c.markup;
  const W = 1076,
    H = 624,
    OX = 48,
    OY = 110;
  const p = paths(60, 920, 30, 400);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className="v11-sheet is-markup">
      <div className="v11-markup-plot">
        <div className="v11-markup-head">
          <span className="is-brand">
            <LfMark size={20} />
            <span>{m.figure}</span>
          </span>
          <span className="is-meta">{m.meta}</span>
        </div>
        <svg className="v11-markup-svg" viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
          <g transform={`translate(${OX} ${OY})`}>
            {[0, 5, 10, 15].map((v) => (
              <line key={v} x1="60" x2="920" y1={p.y(v)} y2={p.y(v)} stroke={v ? '#f0eff5' : '#dcdbe6'} />
            ))}
            {[0, 5, 10, 15].map((v) => (
              <text key={v} x="18" y={p.y(v) + 4} className="is-axis">
                {v}%
              </text>
            ))}
            <path d={p.area} fill="#4f46e5" fillOpacity="0.06" />
            <path d={p.them} fill="none" stroke="#bdbbcc" strokeWidth="1.75" strokeDasharray="4 4" />
            <path d={p.you} fill="none" stroke="#1a1040" strokeWidth="2.25" />
            <circle cx={p.x(8)} cy={p.y(YOU[8])} r="4.5" fill="#1a1040" />
            <circle cx={p.x(PIN_WEEK)} cy={p.y(YOU[PIN_WEEK])} r="4" fill="#1a1040" />
          </g>
          <g className="v11-ink" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M940 166 C 950 148, 1004 150, 1008 178 C 1012 206, 956 214, 936 197 C 926 187, 928 170, 948 162" />
            <path d="M880 146 C 900 146, 916 152, 928 166" />
            <path d="M918 158 L 928 166 L 916 170" />
            <path d="M374 432 C 440 428, 510 400, 530 344" />
            <path d="M522 352 L 530 342 L 537 354" />
            <path d="M232 196 C 236 208, 238 216, 240 226" />
            <path d="M233 219 L 240 227 L 246 218" />
          </g>
        </svg>
        <span className="v11-hand" style={{ left: pct(676, W), top: pct(124, H) }}>
          {m.doubled}
        </span>
        <span className="v11-hand" style={{ left: pct(150, W), top: pct(418, H) }}>
          {m.live}
        </span>
        <span className="v11-hand" style={{ left: pct(150, W), top: pct(160, H) }}>
          {m.flat}
        </span>
      </div>
      <span className="v11-hand is-verdict" style={{ left: pct(104, W), top: pct(560, H) }}>
        {m.verdict}
      </span>
    </div>
  );
}

export function GrowthPlan({ c }: { c: C }) {
  const stages = [
    <div key="plan" className="v11-scene is-plan">
      <span className="v11-backpage" style={{ left: 392, top: 78, transform: 'rotate(3.5deg)' }} />
      <div className="v11-scene-sheet" style={{ left: 348, top: 52, width: 600 }}>
        <PlanSheet c={c} />
      </div>
    </div>,
    <div key="note" className="v11-scene is-note">
      <span
        className="v11-backpage"
        style={{
          left: 420,
          top: 118,
          width: 500,
          height: 500,
          transform: 'rotate(3deg)',
        }}
      />
      <div
        className="v11-scene-sheet"
        style={{
          left: 388,
          top: 100,
          width: 520,
          transform: 'rotate(-1.2deg)',
        }}
      >
        <NoteSheet c={c} />
      </div>
    </div>,
    <div key="report" className="v11-scene is-report">
      <span className="v11-backpage is-deep" style={{ left: 380, top: 92, transform: 'rotate(6deg)' }} />
      <span className="v11-backpage" style={{ left: 330, top: 74, transform: 'rotate(2.5deg)' }} />
      <div className="v11-scene-sheet" style={{ left: 240, top: 60, width: 620 }}>
        <ReportSheet c={c} />
      </div>
      <div className="v11-scene-sheet" style={{ left: 900, top: 300, width: 340 }}>
        <RecNote c={c} />
      </div>
    </div>,
    <div key="markup" className="v11-scene is-markup">
      <div className="v11-scene-sheet" style={{ left: 110, top: 48, width: 1076, transform: 'rotate(-1deg)' }}>
        <MarkupSheet c={c} />
      </div>
    </div>,
  ];
  const compact = [
    <PlanSheet key="plan" c={c} />,
    <NoteSheet key="note" c={c} />,
    <div key="report" className="v11-compact-stack">
      <ReportSheet c={c} />
      <RecNote c={c} />
    </div>,
    <MarkupSheet key="markup" c={c} />,
  ];
  return (
    <section className={`v11-sec v11-plan ${hand.variable}`}>
      <div className="v11-wrap">
        <SectionHead eyebrow={c.eyebrow} heading={c.heading} body={c.body} bodyWidth={420} />
      </div>
      <p className="v11-sr">{c.srText}</p>
      <PlanTabs tabs={c.tabs} stages={stages} compact={compact} />
    </section>
  );
}
