interface SlideShellProps {
  index: number;
  totalSlides: number;
  children: React.ReactNode;
  /**
   * Stage tonality (DESIGN.md §2 hero-tonality law — v3 reskin, 2026-07-16):
   * 'electric' is the vivid indigo hero stage (cover slide only, pages OPEN
   * electric). 'dark' / 'darker' / 'night' all render the SAME night-indigo
   * gradient (#171445 → #191552) — kept as distinct accepted values so
   * existing call sites didn't need to change; 'night' is the preferred name
   * for new/edited call sites since it actually describes what renders.
   */
  variant?: 'dark' | 'darker' | 'night' | 'electric';
}

export function SlideShell({
  index,
  totalSlides,
  children,
  variant = 'dark',
}: SlideShellProps) {
  const bg = variant === 'electric' ? 'audit-slide-electric' : 'audit-slide-night';

  return (
    <section
      className={`audit-slide ${bg}`}
    >
      <div className="h-full flex flex-col px-4 sm:px-8 py-8 sm:py-12">
        {/* Top bar: progress dots. (The numeric "00 / 14" counter was removed —
            a banned numbered-section-marker per the taste laws.) */}
        <div className="flex items-center justify-end mb-6 sm:mb-8 shrink-0">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-y-auto">
          {children}
        </div>
      </div>
    </section>
  );
}
