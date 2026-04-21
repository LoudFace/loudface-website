interface PartialDataBannerProps {
  reason?: string;
  variant?: 'full' | 'compact';
}

/**
 * Renders a banner when one or more phases hit a high failure rate
 * (≥30% of calls errored or returned empty). Tells the user the numbers
 * are partial and a rerun may capture more — stops them from treating a
 * noisy score as authoritative.
 *
 * Shown on CoverSlide (full) and ScorecardSlide (full) alongside
 * EntityConfidenceBanner when both apply.
 */
export function PartialDataBanner({ reason, variant = 'full' }: PartialDataBannerProps) {
  if (!reason) return null;

  if (variant === 'compact') {
    return (
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-info/30 bg-info/5 px-3 py-2.5">
        <InfoIcon />
        <p className="text-2xs text-surface-300 leading-relaxed">
          <span className="font-medium text-info">Partial data.</span>{' '}
          Some platforms returned errors — results are incomplete.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-info/30 bg-info/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <InfoIcon className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-info mb-1">Partial data captured</p>
          <p className="text-xs sm:text-sm text-surface-300 leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-info ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}
