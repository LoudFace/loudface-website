import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and can be rendered as button or anchor
 */

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  /** For Cal.com integration */
  calLink?: string;
  calConfig?: string;
  /** Aria label for icon-only buttons */
  ariaLabel?: string;
  children: ReactNode;
  onClick?: () => void;
}

// Size variants
const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

// Color variants
const variantClasses = {
  primary: 'bg-surface-900 text-white hover:bg-surface-800 focus-visible:outline-surface-900',
  secondary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-500',
  ghost:
    'bg-transparent text-surface-700 hover:bg-surface-100 hover:text-surface-900 focus-visible:outline-surface-500',
  outline:
    'border border-surface-200 bg-transparent text-surface-900 hover:bg-surface-100 focus-visible:outline-surface-500',
};

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  className = '',
  disabled = false,
  fullWidth = false,
  calLink,
  calConfig,
  ariaLabel,
  children,
  onClick,
}: ButtonProps) {
  // Base classes shared by all buttons
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const classes = [baseClasses, sizeClasses[size], variantClasses[variant], className].join(' ');

  // Cal.com attributes
  const calAttrs = calLink
    ? {
        'data-cal-link': calLink,
        'data-cal-config': calConfig || '{"layout":"month_view"}',
      }
    : {};

  // For CTA buttons that open Cal.com modal
  const isCta = calLink || className.includes('btn-cta');

  if (href) {
    // Check if it's an external link
    const isExternal = href.startsWith('http') || href.startsWith('//');

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          data-cal-trigger={isCta ? '' : undefined}
          target="_blank"
          rel="noopener noreferrer"
          {...calAttrs}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        data-cal-trigger={isCta ? '' : undefined}
        {...calAttrs}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
      data-cal-trigger={isCta ? '' : undefined}
      onClick={onClick}
      {...calAttrs}
    >
      {children}
    </button>
  );
}
