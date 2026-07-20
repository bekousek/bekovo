/**
 * Plovoucí „glass" karta — bílý panel s hairline rámečkem a jemným stínem.
 * Staví na tokenech --surface-1, --shadow-panel, --radius-lg.
 */
import type { ReactNode } from 'react';

export interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <div
      className={`pointer-events-auto rounded-[var(--radius-lg)] bg-[var(--surface-1)] [box-shadow:var(--shadow-panel)] ${className}`}
    >
      {children}
    </div>
  );
}
