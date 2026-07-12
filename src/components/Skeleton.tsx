/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Skeleton — light-weight shimmer placeholder for loading states.
 * Avoids "loading..." text. Used by Admin pages while Firestore
 * snapshot is initialising.
 */
import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  /** Whether to apply the shimmer animation (default true) */
  shimmer?: boolean;
}

export default function Skeleton({ className = '', style, shimmer = true }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`rounded-xl bg-hover/60 overflow-hidden relative ${
        shimmer ? 'animate-pulse' : ''
      } ${className}`}
      style={style}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </div>
  );
}
