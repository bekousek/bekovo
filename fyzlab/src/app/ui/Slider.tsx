/**
 * Slider s popiskem a hodnotou — transientní změny + onCommit na konci tahu.
 * Commit zaznamená undo krok; live změny jdou bez záznamu (onTransient).
 */
import { useRef } from 'react';

/** Zaokrouhlení pro zobrazení */
function fmt(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return String(Object.is(r, -0) ? 0 : r);
}

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Živá změna (bez undo záznamu). */
  onTransient: (v: number) => void;
  /** Konec tahu — hodnota před tahem → konečná (jeden undo krok). */
  onCommit: (start: number, end: number) => void;
}

export function Slider({ label, value, min, max, step, onTransient, onCommit }: SliderProps) {
  const startRef = useRef<number | null>(null);

  return (
    <label className="block">
      <span className="flex justify-between text-[12px]">
        <span className="[color:var(--text-secondary)]">{label}</span>
        <span className="tabular-nums [color:var(--text-muted)]">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={() => { startRef.current = value; }}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (startRef.current !== null) onTransient(v);
        }}
        onPointerUp={(e) => {
          const v = Number((e.target as HTMLInputElement).value);
          if (startRef.current !== null) {
            onCommit(startRef.current, v);
            startRef.current = null;
          }
        }}
        className="mt-1 w-full accent-[var(--accent)]"
        aria-label={label}
      />
    </label>
  );
}
