import type { CSSProperties } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import type { Series } from './data';
import { Pin } from './Chart';
import { LiveChart } from './LiveChart';
import { Chip, SectionHead, img } from './ui';

type C = HomeV11Content['route'];

/** Where each step sits on the drawn route (1440 × 1120 canvas); the last stop carries the LoudFace pin. */
const STOPS = [
  { x: 72, y: 714 },
  { x: 394, y: 636 },
  { x: 769, y: 556 },
  { x: 1096, y: 470 },
];
const SUMMIT = { x: 1262, y: 372 };
const PLAN_ROWS = [
  { from: 0.3, to: 1, tone: 'ai' },
  { from: 0.36, to: 1, tone: 'search' },
  { from: 0.08, to: 0.46, tone: 'design' },
  { from: 0.26, to: 0.56, tone: 'build' },
];
const TOOL_ICONS = ['logos/fav-google.png', 'logos/peec-icon.png', 'logos/posthog-icon.png'];

const Avatar = ({ who, size = 22 }: { who: string; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img loading="lazy" src={img(`avatars/${who}.png`)} alt="" width={size} height={size} className="v11-av" />
);

function CallFragment({ c }: { c: C['call'] }) {
  return (
    <div className="v11-frag">
      <div className="v11-frag-who">
        <Avatar who="arnel-bukva" />
        <div><div className="v11-frag-title">{c.heading}</div><div className="v11-frag-meta">{c.meta}</div></div>
      </div>
      <div className="v11-frag-days">
        {c.days.map((d, i) => (
          <div key={i} className={i === 0 ? 'is-on' : ''}><span>{d.weekday}</span><span className="is-date">{d.date}</span></div>
        ))}
      </div>
      <div className="v11-frag-slots">
        {c.slots.map((s, i) => <span key={i} className={i === 1 ? 'is-on' : ''}>{s}</span>)}
      </div>
    </div>
  );
}

function PlanFragment({ c }: { c: C['plan'] }) {
  return (
    <div className="v11-frag">
      <div className="v11-frag-row">
        <div className="v11-frag-title"><span>{c.heading}</span> <span className="is-muted">{c.meta}</span></div>
        <div className="v11-stack">
          {['chandana-pitta', 'abhay-tyagi', 'rezwan-nahid'].map((w) => <Avatar key={w} who={w} size={16} />)}
        </div>
      </div>
      <div className="v11-frag-gantt">
        {c.rows.map((r, i) => {
          const g = PLAN_ROWS[i];
          return (
            <div key={i} className={`v11-gantt-row is-${g.tone}`}>
              <div className="v11-gantt-label"><span className="v11-gantt-dot" /><span>{r}</span></div>
              <span className="v11-gantt-bar" style={{ left: 74 + 134 * g.from, width: 134 * (g.to - g.from), borderRadius: g.to >= 1 ? '4px 0 0 4px' : 4 }} />
            </div>
          );
        })}
        <span className="v11-gantt-today" style={{ left: 74 + 134 * 0.52 }} />
      </div>
    </div>
  );
}

function TrackFragment({ c }: { c: C['track'] }) {
  return (
    <div className="v11-frag">
      <div className="v11-frag-row"><div className="v11-frag-title">{c.heading}</div><div className="v11-frag-meta">{c.meta}</div></div>
      {c.tools.map((t, i) => (
        <div key={i} className="v11-tool">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={img(TOOL_ICONS[i])} alt="" width={18} height={18} />
          <span className="is-tool">{t.tool}</span>
          <span className="is-use">{t.use}</span>
          <span className="v11-live"><span className="v11-live-dot" /><span>{c.live}</span></span>
        </div>
      ))}
    </div>
  );
}

function ReportFragment({ c, spark }: { c: C['report']; spark: Series | null }) {
  return (
    <div className="v11-frag">
      <div className="v11-frag-row"><div className="v11-frag-title">{c.heading}</div><div className="v11-frag-meta">{c.meta}</div></div>
      <div className="v11-frag-chips">
        <Chip metric={c.chipOneMetric} label={c.chipOneLabel} />
        <Chip metric={c.chipTwoMetric} label={c.chipTwoLabel} />
      </div>
      {spark && (
        <div className="v11-frag-spark">
          <LiveChart series={spark} width={208} height={44} margin={{ top: 6, right: 6, bottom: 4, left: 2 }} dots={false} pin={false} end="plain" tip={c.tip} format="index" />
        </div>
      )}
    </div>
  );
}

export function Route({ c, spark }: { c: C; spark: Series | null }) {
  const frags = [<CallFragment key="c" c={c.call} />, <PlanFragment key="p" c={c.plan} />, <TrackFragment key="t" c={c.track} />, <ReportFragment key="r" c={c.report} spark={spark} />];
  return (
    <section className="v11-route">
      <div className="v11-route-canvas">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img('route-map-v2.svg')} alt="" className="v11-route-map" loading="lazy" />
        <div className="v11-route-head">
          <SectionHead eyebrow={c.eyebrow} heading={c.heading} body={c.body} bodyWidth={380} />
        </div>
        <div className="v11-steps">
          {c.steps.map((s, i) => (
            <div key={i} className="v11-step" style={{ '--x': `${STOPS[i].x}px`, '--y': `${STOPS[i].y}px` } as CSSProperties}>
              <div className="v11-step-when">{s.when}</div>
              <div className="v11-step-title">{s.heading}</div>
              <div className="v11-step-frag" aria-hidden="true">{frags[i]}</div>
              <p className="v11-step-body">{s.body}</p>
              <div className="v11-step-out"><span className="is-muted">{c.youGet}</span> <span>{s.outcome}</span></div>
            </div>
          ))}
        </div>
        <div className="v11-route-summit"><Pin x={SUMMIT.x} y={SUMMIT.y} size={34} /></div>
      </div>
    </section>
  );
}
