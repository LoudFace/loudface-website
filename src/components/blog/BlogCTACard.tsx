/**
 * Sidebar CTA card — dark surface with a Cal-modal booking button. The
 * `href="#book-modal"` is intercepted by CalHandler.tsx to open the booking
 * flow without page navigation.
 */
export function BlogCTACard() {
  return (
    <a
      href="#book-modal"
      className="block bg-surface-950 rounded-2xl p-6 relative overflow-hidden group transition-transform hover:-translate-y-0.5"
    >
      {/* Radial brand glow — anchored top-right so it reads behind the heading */}
      <div
        aria-hidden="true"
        className="absolute -top-1/3 -right-1/4 w-52 h-52 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)',
        }}
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          2h response time
        </span>
        <h4 className="text-lg font-medium text-white leading-snug tracking-tight mb-2">
          Book a free SEO/AEO audit
        </h4>
        <p className="text-xs text-white/60 leading-relaxed mb-5">
          15 minutes. We review your site the way a YC partner would. No pitch, no follow-up sequence.
        </p>
        <span className="inline-flex items-center justify-center gap-2 w-full bg-white text-surface-950 rounded-md py-2.5 text-[13px] font-medium group-hover:bg-surface-100 transition-colors">
          Schedule a call
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}
