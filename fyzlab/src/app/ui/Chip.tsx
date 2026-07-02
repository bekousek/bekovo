/**
 * Chip — malý přepínač pro materiálové presety a podobné volby.
 * Aktivní stav: akcent pozadí + kontrast text.
 */
import type { ReactNode } from 'react';

export interface ChipProps {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}

export function Chip({ active = false, onClick, children, title }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={
        'inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] ' +
        'font-medium transition select-none active:scale-95 ' +
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] ' +
        (active
          ? 'bg-[var(--accent)] [color:var(--accent-contrast)]'
          : 'bg-[var(--surface-2)] [color:var(--text-secondary)] hover:bg-[var(--border)] hover:[color:var(--text-primary)]')
      }
    >
      {children}
    </button>
  );
}
