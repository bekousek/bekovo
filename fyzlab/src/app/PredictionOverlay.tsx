/**
 * PredictionOverlay (F2-E) — zobrazí se nad plátnem při načtení scény s lekcí.
 *
 * - 'waiting': student zadá tip (numeric = textové pole; choice = tlačítka).
 * - 'running': lehká lišta dole — student sleduje průběh simulace.
 * - 'done': výsledek (správně / zkus znovu) s naměřenou hodnotou.
 */
import { useState } from 'react';
import { useUiStore } from './store/uiStore';
import type { Runtime } from './bootstrap';
import { t } from './i18n/t';

const cardCls =
  'pointer-events-auto w-full max-w-sm rounded-2xl bg-white/95 p-5 shadow-xl ring-1 ring-slate-200 backdrop-blur';

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
        <div className="rounded-xl bg-blue-600/90 px-4 py-2 text-sm font-medium text-white shadow backdrop-blur">
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
          <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('predMeasured')}</span>
              <span className="tabular-nums font-medium text-slate-700">
                {fmt(predictionActual)} {pred.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('predYourTip')}</span>
              <span className="tabular-nums font-medium text-slate-700">
                {fmt(userVal)} {pred.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('predDiff')}</span>
              <span
                className={`tabular-nums font-medium ${correct ? 'text-emerald-600' : 'text-red-500'}`}
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
        <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          {!correct && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Správná odpověď</span>
              <span className="font-medium text-emerald-700">{correctLabel}</span>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">{t('predYourTip')}</span>
            <span className={`font-medium ${correct ? 'text-emerald-700' : 'text-red-500'}`}>
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
            className={`mb-1 text-lg font-bold ${correct ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {correct ? `✓ ${t('predCorrect')}` : `✗ ${t('predWrong')}`}
          </div>
          <p className="text-sm text-slate-600">{lesson.question}</p>
          {resultNode}
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 active:scale-95"
            onClick={() => {
              runtime.client.setPredictionTarget(null, null);
              runtime.controller.reset();
              // subscribe v bootstrapu nastavi predictionState = 'waiting' a resetPrediction()
            }}
          >
            {t('predTryAgain')}
          </button>
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
        <h2 className="mb-1 text-xs font-bold tracking-wide text-blue-600 uppercase">
          Lekce
          {lesson.level && (
            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-500 normal-case">
              {lesson.level}
            </span>
          )}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-700">{lesson.question}</p>

        {/* Numerický vstup */}
        {pred.kind === 'numeric' && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-slate-500">{t('predYourTip')}:</span>
            <input
              type="text"
              inputMode="decimal"
              className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm font-mono tabular-nums focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="0,00"
              value={predictionInput}
              onChange={(e) => useUiStore.getState().setPredictionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
            />
            <span className="text-sm text-slate-500">{pred.unit}</span>
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
                className={`rounded-xl px-3 py-2 text-sm transition select-none ${
                  predictionChosenId === ch.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {showHint ? '▾' : '▸'} {t('predHint')}
            </button>
            {showHint && (
              <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-200">
                {lesson.hint}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('predConfirm')}
        </button>
      </div>
    </div>
  );
}
