/**
 * AnswerCard — the AEO direct-answer as a quiet TL;DR block straddling the
 * electric→light seam (negative margin pulls it up over the lead band). The
 * answer <p> carries `data-speakable` — the exact element the Speakable
 * JSON-LD (cssSelector ['h1','[data-speakable]']) targets for AI-engine
 * extraction. Rendered ONLY when the post has a `direct-answer` (the caller
 * guards the render).
 *
 * 2026-07-16 (Arnel): stripped the mechanism-announcing chrome — the
 * "written to be quoted by an AI engine" subtitle, the read-timer, the
 * "marked data-speakable" footer, and the "Verify with ChatGPT/Claude/
 * Perplexity" outbound links (they handed readers an exit; the full engine
 * set still lives in the rail). The extraction function is the attribute +
 * the copy, not the costume.
 */

interface AnswerCardProps {
  answer: string;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  return (
    <div className="container">
      <div className="answer-wrap rv" style={{ ['--d' as string]: '.1s' }}>
        <div className="answer">
          <span className="answer-tag">The short answer</span>
          <p data-speakable>{answer}</p>
        </div>
      </div>
    </div>
  );
}
