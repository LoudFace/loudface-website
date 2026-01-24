import { ReactNode } from 'react';

/**
 * SectionContainer - Consistent section wrapper
 *
 * Provides standardized padding, max-width, and horizontal gutters
 * for all page sections.
 */

interface SectionContainerProps {
  /** Vertical padding variant */
  padding?: 'none' | 'sm' | 'default' | 'lg';
  /** HTML tag to use (default: section) */
  as?: 'section' | 'div' | 'article' | 'aside' | 'footer';
  /** Additional classes for the outer element */
  className?: string;
  /** Additional classes for the inner max-width container */
  innerClassName?: string;
  /** ID for anchor links */
  id?: string;
  children: ReactNode;
}

// Padding variants - standardized across the site
const paddingClasses = {
  none: '',
  sm: 'py-12 md:py-16',
  default: 'py-16 md:py-20 lg:py-24',
  lg: 'py-16 md:py-24 lg:py-32',
};

export function SectionContainer({
  padding = 'default',
  as: Tag = 'section',
  className = '',
  innerClassName = '',
  id,
  children,
}: SectionContainerProps) {
  return (
    <Tag id={id} className={`${paddingClasses[padding]} ${className}`.trim()}>
      <div className="px-4 md:px-8 lg:px-12">
        <div className={`max-w-7xl mx-auto ${innerClassName}`.trim()}>{children}</div>
      </div>
    </Tag>
  );
}
