import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantMap: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.98] shadow-md hover:shadow-lg',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--bg-hover)]',
  ghost:
    'text-[var(--text-main)] hover:bg-[var(--bg-hover)]',
  outline:
    'border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]',
};

/**
 * Canonical button — single source of truth for buttons (replaces ~40 hand-written variants).
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeMap[size]}
        ${variantMap[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
