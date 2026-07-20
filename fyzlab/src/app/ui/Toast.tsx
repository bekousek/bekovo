/**
 * Dočasná zpráva zobrazená dole uprostřed obrazovky.
 * Automaticky zmizí po 3,5 s (timeout řídí volající přes uiStore).
 */
export interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute bottom-36 left-1/2 -translate-x-1/2 rounded-[var(--radius-md)] bg-slate-800/90 px-4 py-2 text-[13px] text-white [box-shadow:var(--shadow-pop)] whitespace-nowrap"
    >
      {message}
    </div>
  );
}
