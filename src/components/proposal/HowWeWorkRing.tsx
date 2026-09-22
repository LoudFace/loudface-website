/**
 * How LoudFace works, drawn once for every proposal.
 *
 * Arnel, 2026-09-18: prospects could not tell whether we are a content
 * agency, a backlink agency or a web-design agency.
 *
 * Arnel, 2026-09-22 (Faith proposal): the two-half ring with six labelled
 * nodes and leader lines was "too thick" for a client who does not read.
 * Mobbin harvest (Sequence, Dovetail, Railway "how it works" sections) all
 * land on the same shape: a numbered, left-to-right flow, one line per step.
 * So: three steps and a result. A search, we make the client the answer,
 * the site books the job. Nothing to decode.
 */

type Step = { n: string; title: string; how: string; tone: 'geo' | 'site' };

const STEPS: Step[] = [
  { n: '1', title: 'Someone searches', how: 'Google, Maps or ChatGPT', tone: 'geo' },
  { n: '2', title: 'You are the answer', how: 'content, listings, reviews', tone: 'geo' },
  { n: '3', title: 'The site books the job', how: 'design, quote form, fast pages', tone: 'site' },
];

export function HowWeWorkRing() {
  return (
    <figure className="how-flow" data-print-keep aria-label="How LoudFace works: someone searches, you are the answer, the site books the job, and that is a lead.">
      <ol className="how-flow-steps">
        {STEPS.map((s, i) => (
          <li key={s.n} className={`how-flow-step tone-${s.tone}`}>
            <span className="how-flow-num" aria-hidden="true">{s.n}</span>
            <span className="how-flow-title">{s.title}</span>
            <span className="how-flow-how">{s.how}</span>
            {i < STEPS.length - 1 && <span className="how-flow-arrow" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <div className="how-flow-result">
        <span className="how-flow-result-arrow" aria-hidden="true" />
        <span className="how-flow-result-label">A lead</span>
        <span className="how-flow-result-how">a call, a quote request or a booking on your site</span>
      </div>
    </figure>
  );
}
