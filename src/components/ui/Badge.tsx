import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'subtle' | 'outline';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
}

const variantClasses = {
  subtle: 'bg-surface-100 border border-surface-200',
  outline: 'border border-surface-200',
};

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
};

export function Badge({
  children,
  variant = 'subtle',
  size = 'sm',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium text-surface-900 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
