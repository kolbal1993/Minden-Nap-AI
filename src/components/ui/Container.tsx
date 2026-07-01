import type { ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

/**
 * Canonical width wrapper — single source of truth for page content width.
 * Replaces dozens of hand-rolled max-w variants.
 */
export function Container({ children, size = 'xl', className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeMap[size]} ${className}`}>
      {children}
    </div>
  );
}
