export interface EntityConfidenceSignal {
  low: boolean;
  wrongEntityDescription?: string;
  brandRecognitionScore: number;
}

interface EntityConfidenceBannerProps {
  signal: EntityConfidenceSignal;
  variant?: 'full' | 'compact';
}

/**
 * Renders an uncertainty banner when Phase 1 extraction flagged a wrong-entity match
 * or when brand recognition is too low to anchor the downstream phases.
 *
 * The banner is shown on: CoverSlide (full), ScorecardSlide (full),
 * and on any numeric slide where the metrics might be misleading (compact).
 */
export function EntityConfidenceBanner({ signal, variant = 'full' }: EntityConfidenceBannerProps) {
  if (!signal.low) return null;

  const { wrongEntityDescription, brandRecognitionScore } = signal;

  const headline = wrongEntityDescription
    ? 'AI platforms likely described a different entity'
    : 'Low signal — limited AI knowledge about this brand';

  const detail = wrongEntityDescription
    ? `${formatWrongEntity(wrongEntityDescription)} Numeric results below reflect mentions of that other entity, not your brand.`
    : `Only ${brandRecognitionScore}% of branded queries recognized this brand, and the category could not be inferred with confidence. Share-of-voice and competitor numbers below should be read as a starting baseline, not a verdict.`;

  if (variant === 'compact') {
    return (
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5">
        <WarningIcon />
        <p className="text-2xs text-surface-300 leading-relaxed">
          <span className="font-medium text-warning">Low confidence.</span>{' '}
          {wrongEntityDescription
            ? 'Responses appear to be about a different entity with a similar name.'
            : 'Brand signal is weak — numbers are directional.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <WarningIcon className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-warning mb-1">{headline}</p>
          <p className="text-xs sm:text-sm text-surface-300 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Normalize `wrong_entity_description` into a standalone sentence.
 *
 * The LLM is asked for a noun phrase that slots after "The AI responses appear
 * to describe __", but occasionally returns a full sentence instead ("The AI
 * platforms are describing a different company..."). We only prepend the
 * preamble when the input clearly starts with an indefinite article — anything
 * else is treated as a standalone sentence so we don't stack "The AI responses
 * appear to describe The AI platforms..." style duplicates.
 */
function formatWrongEntity(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const withTerminator = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  const startsWithIndefiniteArticle = /^(a|an)\s/i.test(trimmed);

  if (startsWithIndefiniteArticle) {
    return `The AI responses appear to describe ${withTerminator}`;
  }
  return withTerminator;
}

function WarningIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-warning ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}
