/**
 * Sdílená tlačítková komponenta.
 *
 * Varianty:
 *  - tool    — čtvercové 48 px, levá Toolbar
 *  - bar     — čtvercové 44 px, horní TopBar
 *  - primary — akcent (Spustit), výška 44 px
 *  - secondary — neutrální s rámečkem
 *  - ghost   — bez výplně, malé
 *  - icon    — 32 px, inline ikony (zavřít panel apod.)
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'tool' | 'bar' | 'primary' | 'secondary' | 'ghost' | 'icon';

const BASE =
  'inline-flex items-center justify-center select-none transition-all ' +
  'active:scale-95 disabled:opacity-40 disabled:pointer-events-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

/** Základní třídy bez aktivního stavu */
const VARIANT_BASE: Record<ButtonVariant, string> = {
  tool: 'h-12 w-12 rounded-[var(--radius-lg)] [color:var(--text-secondary)]',
  bar: 'h-11 w-11 rounded-[var(--radius-md)] [color:var(--text-secondary)]',
  primary:
    'h-11 min-w-11 gap-1.5 px-3 rounded-[var(--radius-md)] ' +
    'bg-[var(--accent)] [color:var(--accent-contrast)] font-semibold text-sm ' +
    'hover:bg-[var(--accent-hover)]',
  secondary:
    'h-11 min-w-11 gap-1.5 px-3 rounded-[var(--radius-md)] ' +
    'bg-[var(--surface-1)] [color:var(--text-primary)] border border-[var(--border)] ' +
    'hover:bg-[var(--surface-2)] font-medium text-sm',
  ghost:
    'h-9 min-w-9 gap-1 px-2 rounded-[var(--radius-sm)] ' +
    '[color:var(--text-secondary)] text-sm hover:bg-[var(--surface-2)]',
  icon:
    'h-8 w-8 rounded-[var(--radius-sm)] ' +
    '[color:var(--text-muted)] hover:bg-[var(--surface-2)] hover:[color:var(--text-primary)]',
};

/** Přidat k VARIANT_BASE, pokud active=true (jen pro tool a bar) */
const VARIANT_ACTIVE: Partial<Record<ButtonVariant, string>> = {
  tool: 'bg-[var(--accent)] ![color:var(--accent-contrast)] hover:bg-[var(--accent-hover)]',
  bar: 'bg-[var(--accent)] ![color:var(--accent-contrast)] hover:bg-[var(--accent-hover)]',
  secondary:
    'bg-[var(--accent)] ![color:var(--accent-contrast)] border-[var(--accent)] hover:bg-[var(--accent-hover)]',
};

/** Hover pro neaktivní tool/bar (přidáme jen pokud !active) */
const VARIANT_HOVER: Partial<Record<ButtonVariant, string>> = {
  tool: 'hover:bg-[var(--surface-2)]',
  bar: 'hover:bg-[var(--surface-2)]',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  active?: boolean;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'secondary',
  active = false,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const activeClass = active && VARIANT_ACTIVE[variant] ? VARIANT_ACTIVE[variant]! : '';
  const hoverClass = !active && VARIANT_HOVER[variant] ? VARIANT_HOVER[variant]! : '';

  return (
    <button
      type={type}
      {...rest}
      className={`${BASE} ${VARIANT_BASE[variant]} ${hoverClass} ${activeClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
