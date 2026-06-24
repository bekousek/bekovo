/**
 * Panel silového diagramu (F2-D): legenda sil působících na sledované těleso
 * s magnitudami v newtonech. Šipky kreslí PixiJS (FbdLayer); tady jen čísla.
 * Zobrazí se, když uiStore.fbdBodyId !== null; zavře se ✕.
 */
import { useUiStore } from './store/uiStore';
import { FBD_COLOR_HEX } from '@render/layers/fbdLayer';
import type { FbdForce, FbdForceKind } from '@engine/rigid/fbd';
import type { Runtime } from './bootstrap';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';

const LABEL: Record<FbdForceKind, MsgKey> = {
  gravity: 'fbdGravity',
  buoyancy: 'fbdBuoyancy',
  drag: 'fbdDrag',
  spring: 'fbdSpring',
  thruster: 'fbdThruster',
  contact: 'fbdContact',
};

/** Pořadí řádků v legendě (stabilní, ať čísla neposkakují). */
const ORDER: FbdForceKind[] = ['gravity', 'contact', 'buoyancy', 'drag', 'spring', 'thruster'];

/** Sečte vektory sil podle druhu → magnituda na řádek legendy. */
function netByKind(forces: readonly FbdForce[]): Map<FbdForceKind, number> {
  const acc = new Map<FbdForceKind, { fx: number; fy: number }>();
  for (const f of forces) {
    const prev = acc.get(f.kind) ?? { fx: 0, fy: 0 };
    acc.set(f.kind, { fx: prev.fx + f.fx, fy: prev.fy + f.fy });
  }
  const out = new Map<FbdForceKind, number>();
  for (const [kind, v] of acc) out.set(kind, Math.hypot(v.fx, v.fy));
  return out;
}

/** Formát síly v N: pod 10 → 2 des. místa, jinak 1. */
function fmtN(n: number): string {
  return (n < 10 ? n.toFixed(2) : n.toFixed(1)).replace('.', ',');
}

export function FbdPanel({ runtime }: { runtime: Runtime }) {
  const fbdBodyId = useUiStore((s) => s.fbdBodyId);
  const fbdForces = useUiStore((s) => s.fbdForces);

  if (!fbdBodyId) return null;

  const mags = netByKind(fbdForces);
  const rows = ORDER.filter((k) => mags.has(k));

  const handleClose = () => {
    useUiStore.getState().clearFbd();
    runtime.client.setFbdBodyId(null);
  };

  return (
    <div className="pointer-events-auto w-44 rounded-2xl bg-white/85 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <h3 className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
          {t('fbdPanelTitle')}
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Zavřít"
        >
          ✕
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-400">{t('fbdNoData')}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((kind) => (
            <li key={kind} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FBD_COLOR_HEX[kind] }}
                />
                {t(LABEL[kind])}
              </span>
              <span className="tabular-nums text-slate-500">{fmtN(mags.get(kind)!)} N</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
