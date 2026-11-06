import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './pixel/Sprite';
import { formatKc } from './data/parts';
import { useGame, type Screen } from './state';

/**
 * Plocha pro pixelovou scénu: spočítá největší CELÉ měřítko, které se vejde
 * do šířky rodiče a do výšky okna. Scéna i klikací zóny pak berou stejné `scale`.
 */
export function PixelStage({
  artW, artH, reserveH = 220, maxScale = 6, children,
}: {
  artW: number;
  artH: number;
  /** Kolik px výšky okna nechat pro HUD a ovládání kolem scény. */
  reserveH?: number;
  maxScale?: number;
  children: (scale: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = Math.max(240, window.innerHeight - reserveH);
      const fit = Math.min(w / artW, h / artH);
      // Celé měřítko drží pixely stejně velké. Jen na malém telefonu, kde by
      // vyšlo 1×, se měřítko zaokrouhlí na čtvrtiny, aby scéna nebyla drobná.
      const sc = fit >= 2 ? Math.min(maxScale, Math.floor(fit)) : Math.max(1, Math.floor(fit * 4) / 4);
      setScale(sc);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [artW, artH, reserveH, maxScale]);

  return (
    <div ref={ref} className="stage">
      {scale > 0 ? (
        <div className="stage__inner" style={{ width: artW * scale, height: artH * scale, ['--s' as string]: `${scale}px` }}>
          {children(scale)}
        </div>
      ) : null}
    </div>
  );
}

export function ScreenHead({ title, lead, back = 'town', children }: { title: string; lead?: ReactNode; back?: Screen | null; children?: ReactNode }) {
  const { go } = useGame();
  return (
    <header className="bpc-screenhead">
      <div className="bpc-screenhead__text">
        <div className="bpc-screenhead__row">
          {back ? (
            <button type="button" className="px-btn px-btn--dark px-btn--small bpc-back" onClick={() => go(back)}>
              <Icon name="back" /> {back === 'town' ? 'Do městečka' : 'Zpět'}
            </button>
          ) : null}
          <h1 className="t-32">{title}</h1>
        </div>
        {lead ? <p className="t-muted">{lead}</p> : null}
      </div>
      {children}
    </header>
  );
}

export function Money({ value }: { value: number }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 400);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
  }, [value]);
  return (
    <span className={`bpc-money${bump ? ' bpc-money--bump' : ''}`} aria-live="polite">
      <Icon name="coin" />
      <span><span className="bpc-sr">Peníze: </span>{formatKc(value)}</span>
    </span>
  );
}

export function Dialog({ title, children, actions, onClose, wide }: { title: string; children: ReactNode; actions: ReactNode; onClose?: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('button, [href], input');
    first?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prevFocus?.focus?.(); };
  }, [onClose]);
  return (
    <div className="bpc-dialog-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div ref={ref} className={`bpc-dialog px-frame px-panel${wide ? ' bpc-dialog--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="t-24">{title}</h2>
        {children}
        <div className="bpc-dialog__actions">{actions}</div>
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismiss } = useGame();
  return (
    <div aria-live="assertive">
      {toasts.map((t) => (
        <div key={t.id} className={`bpc-toast px-frame bpc-toast--${t.kind}`} role="status">
          <Icon name={t.kind === 'ok' ? 'check' : t.kind === 'bad' ? 'warn' : 'info'} />
          <p>{t.text}</p>
          <button type="button" className="bpc-iconbtn bpc-toast__close" onClick={() => dismiss(t.id)} aria-label="Zavřít hlášku">
            <Icon name="cross" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
