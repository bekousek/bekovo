/**
 * Ovládání simulace: Spustit/Pauza, Krok, Reset, Zpět/Znovu, rychlost.
 * Dotykové cíle ≥ 44 px (tablety, interaktivní tabule).
 */
import type { EditorController } from '@editor/EditorController';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import { Button, Icon, Panel } from './ui';

/** Stopky — simulační čas (nuluje Reset/načtení scény). */
function Stopwatch() {
  const simTime = useUiStore((s) => s.stats.simTime);
  return (
    <span className="w-20 text-right font-mono text-[11px] [color:var(--text-secondary)] tabular-nums">
      {simTime.toFixed(2)} s
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
    <Panel className="flex items-center gap-1.5 p-2 backdrop-blur-sm">
      <Button
        variant="secondary"
        onClick={() => controller.undo()}
        disabled={!canUndo}
        aria-label={t('undo')}
        title={`${t('undo')} (Ctrl+Z)`}
      >
        <Icon name="undo" />
      </Button>
      <Button
        variant="secondary"
        onClick={() => controller.redo()}
        disabled={!canRedo}
        aria-label={t('redo')}
        title={`${t('redo')} (Ctrl+Y)`}
      >
        <Icon name="redo" />
      </Button>

      <div className="mx-0.5 h-8 w-px bg-[var(--border)]" />

      <Button
        variant={running ? 'secondary' : 'primary'}
        onClick={() => controller.toggle()}
        aria-label={running ? t('pause') : t('play')}
        title={`${running ? t('pause') : t('play')} (mezerník)`}
      >
        <Icon name={running ? 'pause' : 'play'} />
        <span className="ml-1.5 hidden text-sm sm:inline">{running ? t('pause') : t('play')}</span>
      </Button>

      <Button
        variant="secondary"
        onClick={() => controller.step()}
        disabled={running}
        aria-label={t('step')}
        title={t('step')}
      >
        <Icon name="step" />
      </Button>

      <Button
        variant="secondary"
        onClick={() => controller.reset()}
        aria-label={t('reset')}
        title={t('reset')}
      >
        <Icon name="reset" />
      </Button>

      <label className="ml-1 flex items-center gap-2 pr-2 text-[13px] [color:var(--text-secondary)]">
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
          className="h-11 w-28 accent-[var(--accent)] sm:w-36"
          aria-label={t('speed')}
        />
        <span className="w-12 tabular-nums [color:var(--text-muted)]">{speed.toFixed(speed < 1 ? 2 : 1)}×</span>
      </label>

      <div className="mx-0.5 h-8 w-px bg-[var(--border)]" />
      <Stopwatch />
    </Panel>
  );
}
