'use client';

import { UI_ICONS } from '@/lib/icons';

/**
 * CarouselNav Component
 *
 * Reusable carousel navigation buttons for Embla carousels.
 * Provides prev/next buttons with light and dark variants.
 */

interface CarouselNavProps {
  /** Visual variant: 'light' for light backgrounds, 'dark' for dark backgrounds */
  variant?: 'light' | 'dark';
  /** Additional classes for the container */
  className?: string;
  /** Optional click handlers for custom carousel control */
  onPrevClick?: () => void;
  onNextClick?: () => void;
}

export function CarouselNav({
  variant = 'light',
  className = '',
  onPrevClick,
  onNextClick,
}: CarouselNavProps) {
  // Variant-specific button classes
  const buttonClasses =
    variant === 'dark'
      ? 'bg-surface-700 text-white hover:bg-surface-600'
      : 'bg-surface-100 text-surface-700 hover:bg-surface-200';

  // Common button classes
  const baseClasses =
    'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 active:scale-95';

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        className={`${baseClasses} ${buttonClasses} embla__prev`}
        aria-label="Previous slide"
        onClick={onPrevClick}
      >
        <span dangerouslySetInnerHTML={{ __html: UI_ICONS.arrowLeft }} />
      </button>
      <button
        className={`${baseClasses} ${buttonClasses} embla__next`}
        aria-label="Next slide"
        onClick={onNextClick}
      >
        <span dangerouslySetInnerHTML={{ __html: UI_ICONS.arrowRight }} />
      </button>
    </div>
  );
}
