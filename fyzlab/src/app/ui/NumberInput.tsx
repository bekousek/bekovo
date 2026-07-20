/**
 * Číselný vstup se zarovnáním vpravo, focus ringem z tokenů a tabulárním fontem.
 * Commituje Enter/blur; Escape vrátí původní hodnotu.
 */
import { useState, type InputHTMLAttributes } from 'react';

/** Zaokrouhlení pro zobrazení (potlačí f32 šum, např. −1.2000000476 → −1.2). */
function fmt(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return String(Object.is(r, -0) ? 0 : r);
}

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  step?: number;
  onCommit: (v: number) => void;
}

export function NumberInput({ value, step = 0.1, onCommit, className = '', ...rest }: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const v = Number(draft.replace(',', '.'));
    setDraft(null);
    if (Number.isFinite(v) && v !== value) onCommit(v);
  };

  return (
    <input
      type="number"
      step={step}
      value={draft ?? fmt(value)}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => setDraft(fmt(value))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
      className={
        'w-20 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] ' +
        'px-1.5 py-1 text-right text-[12px] tabular-nums [color:var(--text-primary)] ' +
        'focus:border-[var(--accent)] focus:outline-none ' +
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] ' +
        className
      }
      {...rest}
    />
  );
}
