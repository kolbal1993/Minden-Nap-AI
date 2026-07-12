/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EmptyState — reusable empty-state component for the admin panel.
 * Shows an icon + title + description + optional CTA button when a
 * Firestore collection has no data. NO fake numbers, NO "0 user" labels.
 *
 * Used by all Admin*.tsx pages where Firestore returned an empty list.
 */
import { ReactNode } from 'react';
import { Inbox, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** Lucide icon component (default: Inbox) */
  icon?: LucideIcon;
  /** Short title, e.g. "Még nincsenek felhasználók" */
  title: string;
  /** Optional longer description/help text */
  description?: string;
  /** Optional CTA button — full row of {label, onClick, icon?} */
  cta?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Optional second-line CTA (e.g. secondary action) */
  secondaryCta?: {
    label: string;
    onClick: () => void;
  };
  /** Tailwind-utility hint for sizing the icon (default: w-16 h-16) */
  iconSize?: string;
  /** Optional children rendered below the description (e.g. <code> snippet) */
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  cta,
  secondaryCta,
  iconSize = 'w-16 h-16',
  children,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="bg-card border border-main rounded-full p-5 mb-6 inline-flex items-center justify-center shadow-sm">
        <Icon className={`${iconSize} text-muted`} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-title mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-md leading-relaxed mb-6">{description}</p>
      )}
      {children && <div className="mb-6">{children}</div>}
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {cta && (
            <button
              type="button"
              onClick={cta.onClick}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {cta.icon && <cta.icon className="w-4 h-4" />}
              {cta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              type="button"
              onClick={secondaryCta.onClick}
              className="bg-hover hover:bg-hover/80 text-title px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-main"
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
