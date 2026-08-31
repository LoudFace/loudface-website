/**
 * AnswerReadout — the "you are not in the answer" plate.
 *
 * Rev 2: the chrome dots and the rounded question-mark tile are gone (both are
 * banned house tells). The panel is titled the way a figure on a drawing sheet
 * is titled — a letterspaced caption on a rule — and the absent row is marked
 * with 45-degree hatching rather than a colour.
 *
 * Domains are deliberately generic placeholders; no real company is named. The
 * only figure on the plate is Toku's 0 -> 97.8%, which already ships on the site.
 */

type Row = { domain: string; state: 'cited' | 'absent'; you?: boolean };

const BEFORE: Row[] = [
  { domain: 'competitor-a.com', state: 'cited' },
  { domain: 'competitor-b.com', state: 'cited' },
  { domain: 'a-review-site.com', state: 'cited' },
  { domain: 'your-domain.com', state: 'absent', you: true },
];

const AFTER: Row[] = [
  { domain: 'your-domain.com', state: 'cited', you: true },
  { domain: 'competitor-a.com', state: 'cited' },
  { domain: 'competitor-b.com', state: 'cited' },
];

function Panel({
  title,
  meta,
  rows,
  foot,
}: {
  title: string;
  meta: string;
  rows: Row[];
  foot: React.ReactNode;
}) {
  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>{title}</h4>
        <span className="ip-meta">{meta}</span>
      </div>
      <div className="ip-body">
        <p className="ans-prompt">
          <small>Buyer prompt</small>
          “Best analytics platform for a Series B engineering team?”
        </p>
        <ul className="ans-list">
          {rows.map((r, i) => (
            <li
              key={r.domain}
              className={[r.state === 'absent' ? 'is-absent' : '', r.you ? 'is-you' : ''].join(' ').trim() || undefined}
            >
              <span className="ans-rank">{r.state === 'absent' ? '—' : String(i + 1).padStart(2, '0')}</span>
              <span className="ans-domain">{r.domain}</span>
              <span className={`ans-chip ${r.state}`}>{r.state === 'absent' ? 'Not in the answer' : 'Cited'}</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="ip-foot">{foot}</figcaption>
    </figure>
  );
}

export function AnswerReadout() {
  return (
    <div className="answer-pair">
      <Panel
        title="Answer sources, today"
        meta="Fig. 01"
        rows={BEFORE}
        foot={<>Asked across ChatGPT, Gemini, Perplexity, and Google AI Overviews.</>}
      />
      <Panel
        title="Answer sources, after the work"
        meta="Fig. 02"
        rows={AFTER}
        foot={
          <>
            <b>0 → 97.8%</b> visibility on the core prompt — measured on Toku.
          </>
        }
      />
    </div>
  );
}
