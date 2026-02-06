import { createElement } from 'react';
import { BulletLabel } from './BulletLabel';

/**
 * SectionHeader - Consistent section heading pattern
 *
 * Provides standardized H2 typography with optional highlighted word,
 * subtitle, eyebrow label, and flexible alignment.
 */

interface SectionHeaderProps {
  /** Section title text */
  title: string;
  /** Word to highlight (will be styled differently) */
  highlightWord?: string;
  /** Optional subtitle/description below the title */
  subtitle?: string;
  /** Optional eyebrow label rendered as a BulletLabel above the title */
  eyebrow?: string;
  /** Color variant */
  variant?: 'light' | 'dark';
  /** Text alignment */
  align?: 'left' | 'center';
  /** Additional classes for the container */
  className?: string;
  /** Heading level (default: h2) */
  as?: 'h1' | 'h2' | 'h3';
}

// Split title to highlight the specified word
function formatTitle(text: string, highlight?: string): string[] {
  if (!highlight) return [text];
  return text.split(new RegExp(`(${highlight})`, 'i'));
}

export function SectionHeader({
  title,
  highlightWord,
  subtitle,
  eyebrow,
  variant = 'light',
  align = 'left',
  className = '',
  as: Tag = 'h2',
}: SectionHeaderProps) {
  const titleParts = formatTitle(title, highlightWord);

  // Color classes based on variant
  const titleColor = variant === 'dark' ? 'text-white' : 'text-surface-900';
  const highlightColor = variant === 'dark' ? 'text-surface-500' : 'text-primary-600';
  const subtitleColor = variant === 'dark' ? 'text-surface-400' : 'text-surface-600';

  // Alignment classes
  const alignClass = align === 'center' ? 'text-center' : '';

  return (
    <div className={`${alignClass} ${className}`.trim()}>
      {eyebrow && (
        <BulletLabel variant={variant} className="mb-4">{eyebrow}</BulletLabel>
      )}
      {createElement(
        Tag,
        {
          className: `text-2xl sm:text-3xl md:text-4xl font-medium ${titleColor}`,
        },
        highlightWord
          ? titleParts.map((part, index) =>
              part.toLowerCase() === highlightWord.toLowerCase() ? (
                <span key={index} className={highlightColor}>
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              )
            )
          : <span dangerouslySetInnerHTML={{ __html: title }} />
      )}
      {subtitle && (
        <p
          className={`mt-4 text-lg ${subtitleColor} ${align === 'center' ? 'max-w-2xl mx-auto' : ''}`}
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      )}
    </div>
  );
}
