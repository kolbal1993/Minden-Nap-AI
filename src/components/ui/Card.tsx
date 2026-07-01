import type { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'flat';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: () => void;
  href?: string;
}

const variantClass: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card-elevated transition-shadow hover:shadow-xl',
  flat: 'panel',
};

/**
 * Canonical card — replaces the 12+ hand-written card className combinations.
 * Background, border, radius all driven by design tokens.
 */
export function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
  href,
}: CardProps) {
  const cls = `${variantClass[variant]} ${onClick || href ? 'cursor-pointer transition-colors duration-200 surface-hover' : ''} ${className}`;
  if (href) {
    return (
      <a href={href} className={`block ${cls}`} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <div className={cls} onClick={onClick}>
      {children}
    </div>
  );
}
