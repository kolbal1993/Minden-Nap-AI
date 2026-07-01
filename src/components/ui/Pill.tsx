import type { ReactNode } from 'react';

type Variant = 'default' | 'accent' | 'success' | 'warning';

interface PillProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantMap: Record<Variant, string> = {
  default:
    'bg-[var(--bg-surface)] text-[var(--text-desc)] border border-[var(--border-subtle)]',
  accent:
    'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20',
  success:
    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-500 border border-amber-500/20',
};

/**
 * Canonical pill/badge — consistent radius, padding, typography.
 */
export function Pill({ children, variant = 'default', className = '' }: PillProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full text-xs font-medium
        ${variantMap[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
