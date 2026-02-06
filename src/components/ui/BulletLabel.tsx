import { ReactNode } from 'react';

interface BulletLabelProps {
  children: ReactNode;
  as?: 'span' | 'h2' | 'h3';
  variant?: 'light' | 'dark';
  className?: string;
}

export function BulletLabel({
  children,
  as: Tag = 'span',
  variant = 'light',
  className = '',
}: BulletLabelProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-surface-900';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="w-2 h-2 bg-surface-400 rounded-full flex-shrink-0" aria-hidden="true" />
      <Tag className={`text-lg font-medium ${textColor}`}>{children}</Tag>
    </div>
  );
}
