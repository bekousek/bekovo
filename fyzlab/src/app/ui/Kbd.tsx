/**
 * Zobrazení klávesové zkratky v nápovědě — styl „fyzická klávesa".
 */
import type { ReactNode } from 'react';

export interface KbdProps {
  children: ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-1 font-mono text-[10px] font-semibold [color:var(--text-secondary)] [box-shadow:0_1px_0_var(--border-strong)]">
      {children}
    </kbd>
  );
}
