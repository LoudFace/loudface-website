import { ReactNode } from 'react';

/**
 * Card - Consistent card surface for content containers.
 *
 * Three variants matching the design system:
 * - default: white card with subtle border (light backgrounds)
 * - dark: solid dark card (standalone dark containers)
 * - glass: frosted glass effect (inside dark sections)
 */

interface CardProps {
  /** Visual style */
  variant?: 'default' | 'dark' | 'glass';
  /** Inner padding scale */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  /** Enable hover interaction styles */
  hover?: boolean;
  /** Additional classes */
  className?: string;
  children: ReactNode;
}

const variantClasses = {
  default: 'bg-white rounded-xl border border-surface-200',
  dark: 'bg-surface-900 rounded-xl text-white',
  glass: 'bg-white/5 rounded-xl',
};

const hoverClasses = {
  default: 'hover:border-surface-300 hover:shadow-md transition-all duration-200',
  dark: 'hover:bg-surface-800 transition-colors',
  glass: 'hover:bg-white/[0.08] transition-colors',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hover = true,
  className = '',
  children,
}: CardProps) {
  const classes = [
    variantClasses[variant],
    paddingClasses[padding],
    hover ? hoverClasses[variant] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
