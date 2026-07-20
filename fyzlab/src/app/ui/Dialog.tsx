/**
 * Modální dialog — tmavý backdrop + bílá karta se scrollovatelným obsahem.
 * Klik na backdrop zavře dialog; Escape je na zodpovědnosti volajícího.
 */
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Maximální šířka karty; výchozí 'max-w-lg' */
  maxWidth?: string;
}

export function Dialog({ title, onClose, children, maxWidth = 'max-w-lg' }: DialogProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-[var(--radius-xl)] bg-[var(--surface-1)] [box-shadow:var(--shadow-pop)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-[15px] font-semibold [color:var(--text-primary)]">{title}</h2>
          <Button variant="icon" onClick={onClose} aria-label="Zavřít">
            <Icon name="close" size={16} />
          </Button>
        </div>

        {/* Obsah */}
        <div className="max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
