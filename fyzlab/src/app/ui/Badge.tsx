/**
 * Odznáček — kompaktní chip pro statistiky, stav, počty.
 * Varianty: default (neutrální), success, danger, warning, accent.
 */
import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'accent';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface-2)] [color:var(--text-secondary)] border border-[var(--border)]',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  accent: 'bg-indigo-50 [color:var(--accent)] border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] font-medium ${VARIANT_CLASS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
