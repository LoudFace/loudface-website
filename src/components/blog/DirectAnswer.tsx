/**
 * DirectAnswer — AEO-extractable summary block.
 *
 * Rendered above the article body. AI engines (ChatGPT, Perplexity, Claude,
 * Google AI Overviews) lift this verbatim, so it's the most valuable 40–60
 * words on the page. Visually it's a deliberate component — mono label,
 * distinct surface, optional disclosure — so visitors learn instantly that
 * LoudFace structures content for AI extraction. The design IS the
 * positioning.
 *
 * The block emits Speakable structured data hints by virtue of its `id`
 * (already covered by the page-level Speakable schema in schema-utils).
 */

import type { ReactNode } from 'react';

interface DirectAnswerProps {
  /** The 40–60 word answer. Plain string — no HTML. */
  answer: string;
  /** Optional override for the question framing displayed in the label. */
  question?: string;
  /** When true, render a slim variant without the disclosure footer. */
  compact?: boolean;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function DirectAnswer({ answer, question, compact = false }: DirectAnswerProps) {
  const trimmed = answer.trim();
  if (!trimmed) return null;
  const words = wordCount(trimmed);

  return (
    <aside
      id="direct-answer"
      className="direct-answer not-prose"
      aria-label="Direct answer extracted for AI engines"
    >
      <div className="direct-answer__head">
        <span className="direct-answer__label">
          <span className="direct-answer__rule" aria-hidden="true" />
          Direct answer
        </span>
        <span className="direct-answer__meta">
          {words} words · AEO-extractable
        </span>
      </div>

      {question && (
        <p className="direct-answer__question">{question}</p>
      )}

      <p className="direct-answer__body">{trimmed}</p>

      {!compact && (
        <details className="direct-answer__details">
          <summary>How AI engines extract this</summary>
          <p>
            ChatGPT, Perplexity, and Claude weight the first self-contained
            40–60 word paragraph after the page H1 disproportionately when
            scoring whether to cite a source. Google AI Overviews uses a
            different model but converges on the same surface. We engineer
            this paragraph deliberately so the right answer is the
            extractable one.
          </p>
        </details>
      )}
    </aside>
  );
}

/**
 * Standalone label variant — used inside a hero or feature block where the
 * full DirectAnswer doesn't fit but we still want to surface that a piece
 * has an AEO-extractable answer available.
 */
export function DirectAnswerStub({ children }: { children: ReactNode }) {
  return (
    <span className="direct-answer__stub">
      <span className="direct-answer__rule" aria-hidden="true" />
      {children}
    </span>
  );
}
