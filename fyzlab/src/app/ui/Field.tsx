/**
 * Řádek pole — popisek vlevo, ovládací prvek vpravo.
 * Použití: <Field label="Hmotnost" unit="kg"><NumberInput … /></Field>
 */
import type { ReactNode } from 'react';

export interface FieldProps {
  label: string;
  unit?: string;
  children: ReactNode;
}

export function Field({ label, unit, children }: FieldProps) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="whitespace-nowrap text-[12px] [color:var(--text-secondary)]">{label}</span>
      <span className="flex items-center gap-1">
        {children}
        {unit && (
          <span className="w-9 text-[10px] [color:var(--text-muted)]">{unit}</span>
        )}
      </span>
    </label>
  );
}
