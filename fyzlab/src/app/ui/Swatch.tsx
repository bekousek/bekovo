/**
 * Barevný vzorek — klikací kruh pro výběr barvy.
 * Aktivní má ring ve výběrové barvě.
 */
export interface SwatchProps {
  color: string;
  active?: boolean;
  onClick: () => void;
  label?: string;
}

export function Swatch({ color, active = false, onClick, label }: SwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? color}
      aria-pressed={active}
      title={label ?? color}
      className={
        'h-6 w-6 rounded-full transition select-none active:scale-95 ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ' +
        'hover:scale-110 ' +
        (active ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface-1)]' : '')
      }
      style={{ backgroundColor: color }}
    />
  );
}
