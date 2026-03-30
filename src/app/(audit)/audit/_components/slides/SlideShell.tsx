interface SlideShellProps {
  index: number;
  totalSlides: number;
  children: React.ReactNode;
  variant?: 'dark' | 'darker';
}

export function SlideShell({
  index,
  totalSlides,
  children,
  variant = 'dark',
}: SlideShellProps) {
  const bg = variant === 'darker' ? 'bg-surface-950' : 'bg-surface-900';

  return (
    <section
      className={`audit-slide ${bg}`}
    >
      <div className="h-full flex flex-col px-4 sm:px-8 py-8 sm:py-12">
        {/* Top bar: slide number + progress dots */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
          <span className="text-2xs text-surface-600 font-mono">
            {String(index).padStart(2, '0')} / {String(totalSlides - 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-primary-500' : 'bg-surface-700'
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
