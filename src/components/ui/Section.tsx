import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** vertical padding scale */
  spacing?: 'sm' | 'md' | 'lg';
  /** render as <section> for landmark semantics */
  as?: 'section' | 'div' | 'main' | 'article';
  id?: string;
}

const spacingMap = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
};

/**
 * Canonical page section with consistent vertical rhythm.
 * Use instead of hand-written py-* on every page.
 */
export function Section({
  children,
  className = '',
  spacing = 'md',
  as: Tag = 'section',
  id,
}: SectionProps) {
  return (
    <Tag id={id} className={`${spacingMap[spacing]} ${className}`}>
      {children}
    </Tag>
  );
}
