/**
 * PredictionOverlay (F2-E) — zobrazí se nad plátnem při načtení scény s lekcí.
 *
 * - 'waiting': student zadá tip (numeric = textové pole; choice = tlačítka).
 * - 'running': lehká lišta dole — student sleduje průběh simulace.
 * - 'done': výsledek (správně / zkus znovu) s naměřenou hodnotou.
 *
 * Bez zavíracího tlačítka — nejde o obecný modál (sdílený Dialog), ale o
 * účelovou kartu bez „zrušit" akce, proto vlastní backdrop/karta ve stejném
 * vizuálním jazyce (tokeny, rádiusy, stíny).
 */
import { useState } from 'react';
import { useUiStore } from './store/uiStore';
import type { Runtime } from './bootstrap';
import { t } from './i18n/t';
import { Button, Icon } from './ui';

const cardCls =
  'pointer-events-auto w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--surface-1)] p-5 [box-shadow:var(--shadow-pop)]';

/** Formát čísla pro zobrazení výsledku (max 3 platné číslice). */
function fmt(n: number): string {
  if (Math.abs(n) >= 100) return n.toFixed(1).replace('.', ',');
  if (Math.abs(n) >= 10) return n.toFixed(2).replace('.', ',');
  return n.toFixed(3).replace('.', ',');
}

export function PredictionOverlay({ runtime }: { runtime: Runtime }) {
  const lesson = useUiStore((s) => s.lesson);
  const predictionState = useUiStore((s) => s.predictionState);
  const predictionInput = useUiStore((s) => s.predictionInput);
  const predictionChosenId = useUiStore((s) => s.predictionChosenId);
  const predictionActual = useUiStore((s) => s.predictionActual);
  const [showHint, setShowHint] = useState(false);

  if (!lesson) return null;

  const pred = lesson.prediction;

  // --- 'running': lišta, aby student věděl, co se děje ---
  if (predictionState === 'running') {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center px-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--accent)]/90 px-4 py-2 text-sm font-medium text-[var(--accent-contrast)] shadow backdrop-blur">
          {t('predRunning')}
        </div>
      </div>
    );
  }

  // --- 'done': výsledek ---
  if (predictionState === 'done') {
    let correct = false;
    let resultNode: React.ReactNode = null;

    if (pred.kind === 'numeric' && predictionActual !== null) {
      const userVal = parseFloat(predictionInput.replace(',', '.'));
      if (!Number.isNaN(userVal)) {
        correct = Math.abs(userVal - predictionActual) / Math.abs(predictionActual) <= pred.tolerance;
        const diff = userVal - predictionActual;
        resultNode = (
          <div className="mt-3 space-y-1 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-3 text-sm">
            <div className="flex justify-between">
              <span className="[color:var(--text-muted)]">{t('predMeasured')}</span>
              <span className="tabular-nums font-medium [color:var(--text-primary)]">
                {fmt(predictionActual)} {pred.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="[color:var(--text-muted)]">{t('predYourTip')}</span>
              <span className="tabular-nums font-medium [color:var(--text-primary)]">
                {fmt(userVal)} {pred.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="[color:var(--text-muted)]">{t('predDiff')}</span>
              <span
                className={`tabular-nums font-medium ${correct ? '[color:var(--success)]' : '[color:var(--danger)]'}`}
              >
                {diff >= 0 ? '+' : ''}
                {fmt(diff)} {pred.unit}
              </span>
            </div>
          </div>
        );
      }
    } else if (pred.kind === 'choice') {
      correct = predictionChosenId === pred.correctId;
      const chosenLabel = pred.choices.find((c) => c.id === predictionChosenId)?.label ?? '';
      const correctLabel = pred.choices.find((c) => c.id === pred.correctId)?.label ?? '';
      resultNode = (
        <div className="mt-3 space-y-1 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-3 text-sm">
          {!correct && (
            <div className="flex justify-between gap-2">
              <span className="[color:var(--text-muted)]">Správná odpověď</span>
              <span className="font-medium [color:var(--success)]">{correctLabel}</span>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <span className="[color:var(--text-muted)]">{t('predYourTip')}</span>
            <span className={`font-medium ${correct ? '[color:var(--success)]' : '[color:var(--danger)]'}`}>
              {chosenLabel}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 p-4">
        <div className={cardCls}>
          <div
            className={`mb-1 flex items-center gap-1.5 text-lg font-bold ${correct ? '[color:var(--success)]' : '[color:var(--danger)]'}`}
          >
            <Icon name={correct ? 'check' : 'close'} size={20} />
            {correct ? t('predCorrect') : t('predWrong')}
          </div>
          <p className="text-sm [color:var(--text-secondary)]">{lesson.question}</p>
          {resultNode}
          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() => {
              runtime.client.setPredictionTarget(null, null);
              runtime.controller.reset();
              // subscribe v bootstrapu nastavi predictionState = 'waiting' a resetPrediction()
            }}
          >
            {t('predTryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  // --- 'waiting': vstupní formulář ---
  const canConfirm =
    pred.kind === 'numeric'
      ? predictionInput.trim() !== '' &&
        !Number.isNaN(parseFloat(predictionInput.replace(',', '.')))
      : predictionChosenId !== null;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const ui = useUiStore.getState();
    if (pred.kind === 'numeric') {
      runtime.client.setPredictionTarget(pred.targetBodyId, pred.quantity);
      ui.setPredictionState('running');
    } else {
      // Výsledek pro choice vyhodnotíme hned; sim jen doběhne vizuálně
      ui.setPredictionState('done');
    }
    runtime.controller.play();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 p-4">
      <div className={cardCls}>
        <h2 className="mb-1 text-xs font-bold tracking-wide [color:var(--accent)] uppercase">
          Lekce
          {lesson.level && (
            <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium [color:var(--accent)] normal-case dark:bg-indigo-950/40">
              {lesson.level}
            </span>
          )}
        </h2>
        <p className="mb-4 text-sm leading-relaxed [color:var(--text-secondary)]">{lesson.question}</p>

        {/* Numerický vstup */}
        {pred.kind === 'numeric' && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm [color:var(--text-muted)]">{t('predYourTip')}:</span>
            <input
              type="text"
              inputMode="decimal"
              className="w-28 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-1.5 text-right text-sm font-mono tabular-nums focus-visible:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]"
              placeholder="0,00"
              value={predictionInput}
              onChange={(e) => useUiStore.getState().setPredictionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
            />
            <span className="text-sm [color:var(--text-muted)]">{pred.unit}</span>
          </div>
        )}

        {/* Výběr z možností */}
        {pred.kind === 'choice' && (
          <div className="mb-3 flex flex-wrap gap-2">
            {pred.choices.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => useUiStore.getState().setPredictionChosenId(ch.id)}
                className={`rounded-[var(--radius-lg)] px-3 py-2 text-sm transition select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  predictionChosenId === ch.id
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow'
                    : 'bg-[var(--surface-2)] [color:var(--text-secondary)] hover:bg-[var(--border)]'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        )}

        {/* Nápověda */}
        {lesson.hint && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] text-xs [color:var(--text-muted)] hover:[color:var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <Icon name={showHint ? 'chevronDown' : 'chevronRight'} size={12} />
              {t('predHint')}
            </button>
            {showHint && (
              <p className="mt-1 rounded-[var(--radius-md)] bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800">
                {lesson.hint}
              </p>
            )}
          </div>
        )}

        <Button variant="primary" className="w-full" disabled={!canConfirm} onClick={handleConfirm}>
          {t('predConfirm')}
        </Button>
      </div>
    </div>
  );
}
