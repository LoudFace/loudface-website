import type { Series } from '../home-v11/data';
import type { CaseStudyInstruments } from '@/lib/types';
import type { ResultStat } from '../case-detail-v3/helpers';
import { splitTitle } from './series';

/**
 * The revenue-led hero stage (Paper: "Case study revenue stage · pick one", option C2, approved 2026-10-29 for
 * Hayes Media). Left: found in search, the study's Result 2 over its Google line. Right: the return, Result 1.
 * Every figure is the study's own result field; `returnStage` carries only the words around them.
 */
export function ReturnStage({ stage, search, ret, line }: {
  stage: NonNullable<CaseStudyInstruments['returnStage']>;
  search?: ResultStat;
  ret: ResultStat;
  line?: Series;
}) {
  const s = search ? splitTitle(search.title) : null;
  return (
    <div className="cs-return">
      {search && s && (
        <div className="cs-return-search">
          <div className="cs-return-copy">
            <span className="cs-return-step">1 · Found in search</span>
            <span className="cs-return-num">{search.number}</span>
            <span className="cs-return-label">{s.label}{s.note ? `, ${s.note}` : ''}</span>
          </div>
          {line && <Sparkline values={line.values} />}
          {line && stage.searchCaption && <span className="cs-return-cap">{stage.searchCaption}</span>}
        </div>
      )}
      <div className="cs-return-money">
        <div className="cs-return-copy">
          <span className="cs-return-step">{search ? '2 · The return' : 'The return'}</span>
          <span className="cs-return-num is-big">{ret.number}</span>
          <p className="cs-return-body">{stage.body}</p>
        </div>
        {stage.quote && (
          <figure className="cs-return-quote">
            <blockquote>“{stage.quote}”</blockquote>
            {stage.quoteBy && <figcaption>{stage.quoteBy}</figcaption>}
          </figure>
        )}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const W = 300, H = 96, min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => [2 + ((W - 4) * i) / (values.length - 1), H - 6 - ((H - 16) * (v - min)) / (max - min || 1)]);
  const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg className="cs-return-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L${W - 2},${H} L2,${H} Z`} className="is-area" />
      <path d={d} className="is-line" vectorEffect="non-scaling-stroke" />
      <circle cx={ex} cy={ey} r="4.5" className="is-end" />
    </svg>
  );
}
