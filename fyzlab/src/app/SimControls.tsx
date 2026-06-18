/**
 * Ovládání simulace: Spustit/Pauza, Krok, Reset, Zpět/Znovu, rychlost.
 * Dotykové cíle ≥ 48 px (tablety, interaktivní tabule).
 */
import type { EditorController } from '@editor/EditorController';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';

const btnBase =
  'flex h-12 min-w-12 items-center justify-center rounded-xl px-3 text-lg font-semibold ' +
  'shadow-sm ring-1 transition select-none active:scale-95 disabled:opacity-40';
const btn = `${btnBase} bg-white text-slate-700 ring-slate-200 hover:bg-slate-50`;
const btnPrimary = `${btnBase} bg-blue-600 text-white ring-blue-600 hover:bg-blue-500`;

/** Stopky — simulační čas (nuluje Reset/načtení scény). */
function Stopwatch() {
  const simTime = useUiStore((s) => s.stats.simTime);
  return (
    <span className="w-20 text-right font-mono text-sm text-slate-600 tabular-nums">
      ⏱ {simTime.toFixed(2)}
    </span>
  );
}

export function SimControls({ controller }: { controller: EditorController }) {
  const running = useUiStore((s) => s.running);
  const speed = useUiStore((s) => s.speed);
  const setSpeed = useUiStore((s) => s.setSpeed);
  const canUndo = useUiStore((s) => s.canUndo);
  const canRedo = useUiStore((s) => s.canRedo);

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/85 p-2 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <button
        type="button"
        className={btn}
        onClick={() => controller.undo()}
        disabled={!canUndo}
        aria-label={t('undo')}
        title={`${t('undo')} (Ctrl+Z)`}
      >
        ↶
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => controller.redo()}
        disabled={!canRedo}
        aria-label={t('redo')}
        title={`${t('redo')} (Ctrl+Y)`}
      >
        ↷
      </button>

      <div className="mx-1 h-8 w-px bg-slate-200" />

      <button
        type="button"
        className={running ? btn : btnPrimary}
        onClick={() => controller.toggle()}
        aria-label={running ? t('pause') : t('play')}
        title={`${running ? t('pause') : t('play')} (mezerník)`}
      >
        {running ? '⏸' : '▶'}
        <span className="ml-2 hidden text-sm sm:inline">{running ? t('pause') : t('play')}</span>
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => controller.step()}
        disabled={running}
        aria-label={t('step')}
        title={t('step')}
      >
        ⏭
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => controller.reset()}
        aria-label={t('reset')}
        title={t('reset')}
      >
        ↺
      </button>

      <label className="ml-2 flex items-center gap-2 pr-2 text-sm text-slate-600">
        <span className="hidden sm:inline">{t('speed')}</span>
        <input
          type="range"
          min={-2}
          max={2}
          step={0.1}
          value={Math.log2(speed)}
          onChange={(e) => {
            const v = 2 ** Number(e.target.value);
            const snapped = Math.abs(v - 1) < 0.08 ? 1 : v;
            setSpeed(snapped);
            controller.setSpeed(snapped);
          }}
          className="h-12 w-28 accent-blue-600 sm:w-36"
          aria-label={t('speed')}
        />
        <span className="w-12 tabular-nums">{speed.toFixed(speed < 1 ? 2 : 1)}×</span>
      </label>

      <div className="mx-1 h-8 w-px bg-slate-200" />
      <Stopwatch />
    </div>
  );
}
