import type { ContactContent, PricingV11Content } from '@/lib/content-utils';
import { LfMark, img } from '../home-v11/ui';

/**
 * What happens after someone books: the four steps from contact.json, each with the thing that arrives (the booked
 * slot, the call on their own site, the proposal, the kickoff message; examples from pricing-v11.json `steps`).
 * Used by /contact and /thank-you. Styles in contact.css (03 Clay "what to expect" cards).
 */
// showSlot: false on /thank-you, where an example time would read as the visitor's own booking (their invite has it)
export function NextSteps({ n, steps, showSlot = true }: { n: ContactContent['nextSteps']; steps: PricingV11Content['steps']; showSlot?: boolean }) {
  return (
    <ol className="ct-steps">
      {n.steps.map((s, i) => (
        <li key={s.title} className={i === 0 ? 'is-now' : ''}>
          <div className="ct-step-top"><span className="is-chip">{s.chip}</span></div>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
          <div className="ct-step-ui">
            {i === 0 && (
              <div className="ct-ui">
                <div className="ct-ui-row is-head"><b>{steps.call.title}</b><span className="ct-ok">{steps.call.status}</span></div>
                {showSlot && <div className="ct-ui-row"><span>{steps.call.slot}</span></div>}
                <div className="ct-ui-row is-quiet"><span>{steps.call.with}</span></div>
              </div>
            )}
            {i === 1 && (
              <div className="ct-ui ct-ui-call">
                <div className="ct-ui-row is-head"><b>{n.screenTitle}</b><span className="is-rec">{n.screenTime}</span></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img('cases/genie-site.webp')} alt="" width={640} height={400} loading="lazy" />
              </div>
            )}
            {i === 2 && (
              <div className="ct-ui">
                <div className="ct-ui-row is-head"><b>{steps.proposal.title}</b><LfMark size={16} /></div>
                {steps.proposal.rows.map((r) => <div key={r.k} className="ct-ui-kv"><span>{r.k}</span><b>{r.v}</b></div>)}
              </div>
            )}
            {i === 3 && (
              <div className="ct-ui">
                <div className="ct-msg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={img('team/tamara-pavlovic.jpg')} alt="" width={28} height={28} />
                  <div><div className="ct-msg-head"><b>{steps.kickoff.from}</b><span>{steps.kickoff.time}</span></div><p>{steps.kickoff.message}</p></div>
                </div>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
