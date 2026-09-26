import Link from 'next/link';
import type { AiAuditContent, AuditReportV11Content } from '@/lib/content-utils';
import { AuditForm } from '../../(audit)/audit/_components/AuditForm';
import { Eyebrow, LfMark, img } from '../../home-v11/ui';

/**
 * The audit tool's own screens in v11 (2026-09-26): the start page (/audit) and the progress screen shown while an
 * audit runs (/audit/<id> before it completes). Tiles from design-lab/harvest/2026-09-26/rest: 04-A Stripe status,
 * 04-B Linear sync status (named steps with their state), 01 Airtable key facts. The live polling stays in
 * AuditProgress; this view takes its state (progress, phase, the rotating line) and draws it.
 */

const ENGINES = ['fav-chatgpt.webp', 'fav-claude.png', 'fav-gemini.png', 'fav-perplexity.png'];

export function AuditStartV11({ c }: { c: AuditReportV11Content; example?: AiAuditContent['example'] }) {
  const s = c.start;
  return (
    <div className="v11 au af">
      <section className="af-page" data-hero="light">
        <div className="v11-wrap af-grid">
          <div>
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h1>{s.title}</h1>
            <p className="af-body">{s.body}</p>
            <ul className="af-gets">{s.gets.map((g) => <li key={g}>{g}</li>)}</ul>
            <div className="au-form af-form"><AuditForm /></div>
          </div>
          {/* the four steps the audit is about to run (04-B Linear sync status), not the landing page's scorecard */}
          <figure className="au-pic">
            <div className="au-ground">
              <div className="af-card af-plan">
                <div className="au-rep-head">
                  <span className="is-brand"><LfMark size={16} /><span>{c.progress.eyebrow}</span></span>
                  <span className="af-engines" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {ENGINES.map((e) => <img key={e} src={img(`logos/${e}`)} alt="" width={18} height={18} />)}
                  </span>
                </div>
                <ol className="af-steps">
                  {c.progress.steps.map((st) => (
                    <li key={st.key} className="is-next">
                      <span className="af-dot" aria-hidden="true" />
                      <div><b>{st.title}</b><span>{st.body}</span></div>
                    </li>
                  ))}
                </ol>
                <p className="af-note">{c.progress.note}</p>
              </div>
            </div>
          </figure>
        </div>
      </section>
    </div>
  );
}

type State = 'running' | 'failed' | 'slow';

/** The four steps and where the run is: phase number '01'–'04' from AuditProgress's getPhaseNumber. */
export function AuditProgressV11({ c, progress, phase, phaseNum, tagline, state = 'running', onRetry }: { c: AuditReportV11Content; progress: number; phase: string; phaseNum: string; tagline: string; state?: State; onRetry?: React.ReactNode }) {
  const p = c.progress;
  const current = p.steps.findIndex((s) => s.key === phaseNum);
  return (
    <div className="v11 au af">
      <section className="af-page is-progress" data-hero="light">
        <div className="v11-wrap">
          <div className="af-card">
            <div className="au-rep-head">
              <span className="is-brand"><LfMark size={16} /><span>{p.eyebrow}</span></span>
              <span className="af-engines" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {ENGINES.map((e) => <img key={e} src={img(`logos/${e}`)} alt="" width={18} height={18} />)}
              </span>
            </div>
            {state === 'running' ? (
              <>
                <h1>{p.title}</h1>
                <p role="status" aria-live="polite" className="af-phase">{phase}</p>
                <p className="af-tagline">{tagline}</p>
                <div className="af-bar-k"><span>{p.progressLabel}</span><span>{progress}%</span></div>
                <div className="af-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></div>
                <ol className="af-steps">
                  {p.steps.map((s, i) => {
                    const k = i < current ? 'done' : i === current ? 'now' : 'next';
                    return (
                      <li key={s.key} className={`is-${k}`}>
                        <span className="af-dot" aria-hidden="true">{k === 'done' && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
                        <div><b>{s.title}</b><span>{s.body}</span></div>
                        <span className="af-state">{k === 'done' ? p.done : k === 'now' ? p.now : p.next}</span>
                      </li>
                    );
                  })}
                </ol>
                <p className="af-note">{p.note}</p>
              </>
            ) : (
              <div className={`af-stop is-${state}`}>
                <h1>{state === 'failed' ? p.failedTitle : p.slowTitle}</h1>
                <p>{state === 'failed' ? p.failedBody : p.slowBody}</p>
                {onRetry ?? <Link href="/ai-audit" className="v11-btn is-ink"><span>{p.retry}</span></Link>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
