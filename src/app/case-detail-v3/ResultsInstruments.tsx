/**
 * ResultsInstruments — the "By the numbers" section (server component, zero JS).
 *
 * The 2026-08-19 chart redesign (design-loop pick: concept C, "the ledger
 * becomes the instrument"). Replaces BOTH ResultsLedger and the old bottom
 * NightCharts on studies that carry charts; studies without charts keep the
 * plain ResultsLedger. Sits directly after the hero.
 *
 * Language: bklit-style instruments re-keyed to the house — card-less charts
 * drawn straight on dotted drafting paper, hairline rules, ONE indigo ink mark
 * per chart. Chart ink is ALWAYS house indigo, never the client brand color
 * (a green-toned client color on the indigo site is what triggered the redesign).
 *
 * The growth curve is a STEP area (honest for month buckets) and stays
 * axis-free on the y axis: the shape is public, the client's exact rate is not.
 * Styles live in case-detail-v3.css under `.csv3 .nmx`.
 */
import type { CaseStudyChart } from '@/lib/types';
import type { ResultStat } from './helpers';
import { parseResultTransition } from './helpers';

interface ResultsInstrumentsProps {
  results: ResultStat[];
  charts: CaseStudyChart[];
  /** Highlights the client's own row in bar charts (falls back to the max-value row). */
  clientName?: string;
}

/* Split a trailing unit ("%", "x") off a numeral so it can render smaller. */
function splitUnit(num: string): { value: string; unit?: string } {
  const m = num.match(/^(.*?)(%|x)$/i);
  return m ? { value: m[1], unit: m[2] } : { value: num };
}

function Numeral({ text }: { text: string }) {
  const { value, unit } = splitUnit(text.trim());
  return (
    <>
      {value}
      {unit && <span className="u">{unit}</span>}
    </>
  );
}

function StatNumber({ number }: { number: string }) {
  const transition = parseResultTransition(number);
  if (!transition) {
    return (
      <div className="stat-n tnum">
        <Numeral text={number} />
      </div>
    );
  }
  return (
    <div className="stat-n tnum">
      <span>
        <Numeral text={transition.before} />
      </span>
      <svg className="arw" width="36" height="15" viewBox="0 0 36 15" fill="none" aria-hidden="true">
        <path d="M1 7.5H25.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M23.5 1.4 35 7.5l-11.5 6.1z" fill="currentColor" />
      </svg>
      <span>
        <Numeral text={transition.after} />
      </span>
    </div>
  );
}

/* ── The step-area growth curve (axis-free) ────────────────── */

const W = 800;
const H = 400;
const Y_TOP = 70;
const Y_BOTTOM = 372;

function StepCurve({ chart }: { chart: CaseStudyChart }) {
  const data = chart.data;
  const n = data.length;
  if (n < 2) return null;

  const values = data.map((d) => d.value);
  const vmin = Math.min(...values);
  const vmax = Math.max(...values);
  const span = vmax - vmin || 1;

  const band = W / n;
  const yFor = (v: number) => Y_BOTTOM - ((v - vmin) / span) * (Y_BOTTOM - Y_TOP);

  let line = `M0 ${yFor(values[0]).toFixed(1)}`;
  values.forEach((v, i) => {
    const y = yFor(v).toFixed(1);
    if (i > 0) line += ` V${y}`;
    line += ` H${((i + 1) * band).toFixed(1)}`;
  });
  const area = `${line} V${H} H0 Z`;

  // Labels: on mobile only the first (baseline), one mid, and the last survive.
  const midIndex = Math.floor((n - 1) / 2);

  return (
    <div className="curve-plot" role="img" aria-label={`Stepped growth curve from ${data[0].label ?? 'start'} to ${data[n - 1].label ?? 'end'}${data[0].displayValue && data[n - 1].displayValue ? `, ${data[0].displayValue} to ${data[n - 1].displayValue}` : ''}`}>
      <svg className="curve-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path fill="var(--acc-100, #e0e7ff)" d={area} />
        <g stroke="rgba(79,70,229,.22)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke">
          <path d="M0 100H800" />
          <path d="M0 200H800" />
          <path d="M0 300H800" />
          {Array.from({ length: n - 1 }, (_, i) => (
            <path key={i} d={`M${((i + 1) * band).toFixed(1)} 0V${H}`} />
          ))}
        </g>
        <path
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
          d={line}
        />
        <path d={`M0 399.5H${W}`} stroke="#e7e7ea" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="nodes">
        {data.map((d, i) => {
          const x = `${(((i + 0.5) * band) / W * 100).toFixed(2)}%`;
          const y = `${(((H - yFor(d.value)) / H) * 100).toFixed(1)}%`;
          const isEnd = i === n - 1;
          const keep = i === 0 || i === midIndex || isEnd;
          const style = { '--x': x, '--y': y } as React.CSSProperties;
          return (
            <span key={i}>
              <i className={`node${isEnd ? ' end' : ''}`} style={style} />
              {i === 0 && <i className="tick-lead" style={style} />}
              {d.displayValue && (
                <b className={`dlab${i === 0 ? ' base' : ''}${isEnd ? ' end' : ''}${keep ? ' keep' : ''}`} style={style}>
                  {d.displayValue}
                </b>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Bar instruments (single + before/after series) ────────── */

function BarChart({ chart, clientName }: { chart: CaseStudyChart; clientName?: string }) {
  const grouped = chart.chartType === 'barComparison';
  const maxValue = Math.max(...chart.data.flatMap((d) => [d.value, d.secondaryValue ?? 0]));
  const leadValue = Math.max(...chart.data.map((d) => (grouped ? d.secondaryValue ?? 0 : d.value)));
  // Indigo marks OUR client: prefer the row naming them; only fall back to the max row.
  const clientRow = clientName
    ? chart.data.findIndex((d) => (d.label || '').toLowerCase().includes(clientName.toLowerCase()))
    : -1;
  const isLead = (d: (typeof chart.data)[number], i: number) =>
    clientRow >= 0 ? i === clientRow : (grouped ? d.secondaryValue ?? 0 : d.value) === leadValue;
  const pct = (v: number) => `${Math.max((v / (maxValue || 1)) * 100, 1.2).toFixed(1)}%`;

  return (
    <div className="plot-wrap">
      <div className="guides" aria-hidden="true">
        <i className="solid" style={{ left: 0 }} />
        <i style={{ left: '25%' }} />
        <i style={{ left: '50%' }} />
        <i style={{ left: '75%' }} />
        <i className="solid" style={{ left: '100%' }} />
      </div>
      {grouped && (chart.legendPrimary || chart.legendSecondary) && (
        <div className="bar-legend">
          {chart.legendPrimary && (
            <span>
              <i className="swatch was" /> {chart.legendPrimary}
            </span>
          )}
          {chart.legendSecondary && (
            <span>
              <i className="swatch now" /> {chart.legendSecondary}
            </span>
          )}
        </div>
      )}
      <div className="plot" role="img" aria-label={chart.title || 'Bar chart'}>
        {chart.data.map((d, i) => {
          const lead = isLead(d, i);
          return (
            <div key={i} className={`brow${lead ? ' lead' : ''}`}>
              <div className="bar-lab">{d.label}</div>
              {grouped ? (
                <div className="bar-track two">
                  <div className="bar-fill was" style={{ width: pct(d.value) }} />
                  <div className="bar-fill" style={{ width: pct(d.secondaryValue ?? 0) }} />
                </div>
              ) : (
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: pct(d.value) }} />
                </div>
              )}
              <div className="bar-val tnum">
                {grouped
                  ? d.secondaryDisplayValue || (d.secondaryValue ?? 0).toLocaleString()
                  : d.displayValue || d.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── The section ───────────────────────────────────────────── */

export function ResultsInstruments({ results, charts, clientName }: ResultsInstrumentsProps) {
  if (!charts || charts.length === 0) return null;

  const curve = charts.find((c) => c.chartType === 'growthCurve');
  const bars = charts.filter((c) => c.chartType !== 'growthCurve');

  return (
    <section className="nmx" aria-label="Results by the numbers">
      <div className="container-wide">
        <header className="nm-head">
          <h2>By the numbers</h2>
          <p className="lede">Every mark below is measured — nothing here is modelled.</p>
        </header>

        {curve && (
          <figure className="curve">
            <div className="curve-head">
              <h3 className="ch-h">{curve.title}</h3>
              {curve.legendPrimary && <p className="ch-d">{curve.legendPrimary}</p>}
            </div>
            <StepCurve chart={curve} />
            <div className="curve-x" style={{ gridTemplateColumns: `repeat(${curve.data.length}, 1fr)` }}>
              {curve.data.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
            <figcaption className="nm-privacy">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                <rect x=".75" y="6" width="10.5" height="7.25" rx="1.5" stroke="currentColor" strokeWidth="1" />
                <path d="M3.25 6V3.9a2.75 2.75 0 0 1 5.5 0V6" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span>Axis values withheld by design: the shape of the trend is public, the exact rate stays the client&rsquo;s.</span>
            </figcaption>
          </figure>
        )}

        <div className={`nm-grid${bars.length === 0 ? ' ledger-only' : ''}`}>
          <div className="ldgr">
            {results.map((r, i) => (
              <div className="stat" key={i}>
                <StatNumber number={r.number ?? ''} />
                {r.title && <p className="stat-t">{r.title}</p>}
              </div>
            ))}
          </div>

          {bars.length > 0 && (
            <div className="instr">
              {bars.map((chart, i) => (
                <figure className="chart" key={i}>
                  <h3 className="ch-h">{chart.title}</h3>
                  {chart.chartType !== 'barComparison' && chart.legendPrimary && (
                    <p className="ch-d">{chart.legendPrimary}</p>
                  )}
                  <BarChart chart={chart} clientName={clientName} />
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
