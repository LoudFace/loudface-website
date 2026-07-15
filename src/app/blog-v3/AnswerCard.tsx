/**
 * AnswerCard — the SIGNATURE move. The AEO direct-answer lifted into a
 * distinguished citation card that straddles the electric→light seam (negative
 * margin pulls it up over the lead band). The answer <p> carries `data-speakable`
 * — the exact element the Speakable JSON-LD (cssSelector ['h1','[data-speakable]'])
 * targets for AI-engine extraction. Rendered ONLY when the post has a
 * `direct-answer` (94% of posts); posts without it get the plain header flow and
 * no empty card (the caller guards the render).
 */
import { aiExploreLinks, answerReadSeconds } from './helpers';

interface AnswerCardProps {
  answer: string;
  articleUrl: string;
}

export function AnswerCard({ answer, articleUrl }: AnswerCardProps) {
  const secs = answerReadSeconds(answer);
  // "Verify with" uses the three chat engines; full 5-engine set lives in the rail.
  const verify = aiExploreLinks(articleUrl).filter((l) => ['ChatGPT', 'Perplexity', 'Claude'].includes(l.name));

  return (
    <div className="container">
      <div className="answer-wrap rv" style={{ ['--d' as string]: '.1s' }}>
        <div className="answer">
          <div className="answer-head">
            <span className="answer-tag">
              <span className="qm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M8 12h8M8 8h8M8 16h5" /><rect x="3" y="4" width="18" height="16" rx="3" /></svg>
              </span>
              <span><b>The short answer</b><em>Written to be quoted by an AI engine</em></span>
            </span>
            <span className="answer-read">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>
              ~{secs}-second read
            </span>
          </div>
          <p data-speakable>{answer}</p>
          <div className="answer-foot">
            <span className="answer-note"><i></i>Marked <b style={{ fontWeight: 600, color: 'var(--surface-700)' }}>data-speakable</b> for AI answer engines</span>
            <span className="ask">
              <span>Verify with</span>
              {verify.map((l) => (
                <a key={l.name} target="_blank" rel="noopener" href={l.href}>{l.name}</a>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
