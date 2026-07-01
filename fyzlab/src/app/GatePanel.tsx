/**
 * Panel měření fotobran (vlevo dole): časy vstupu/výstupu posledního
 * průchodu, doba zákrytu a počet průchodů. Zobrazí se, jen když scéna
 * nějaké brány má. Δt zákrytu + známá šířka tělesa = rychlost — přesně
 * jak se měří v reálné laboratoři.
 */
import { useState } from 'react';
import type { Instrument } from '@engine/scene/schema';
import type { Runtime } from './bootstrap';
import { useEditorVersion } from './PropertiesPanel';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';

const fmtT = (v: number | null) => (v === null ? '—' : `${v.toFixed(4)} s`);

export function GatePanel({ runtime }: { runtime: Runtime }) {
  useEditorVersion(runtime);
  const readings = useUiStore((s) => s.gateReadings);
  const [collapsed, setCollapsed] = useState(false);

  const gates = runtime.controller.store.doc.entities.filter(
    (e): e is Instrument => e.kind === 'instrument' && e.type === 'photogate',
  );
  if (gates.length === 0) return null;

  return (
    <div className="pointer-events-auto max-w-xs rounded-2xl bg-white/85 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t('gateExpand') : t('gateCollapse')}
        title={collapsed ? t('gateExpand') : t('gateCollapse')}
        className="flex w-full items-center justify-between gap-2 text-[11px] font-bold tracking-wide text-slate-400 uppercase transition hover:text-slate-600"
      >
        <span>{t('gatePanelTitle')}</span>
        <span className="text-slate-400">{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <div className="mt-1.5 space-y-1">
          {gates.map((gate) => {
            const r = readings[gate.id];
            return (
              <div key={gate.id} className="text-xs text-slate-600 tabular-nums">
                <span className="font-semibold text-slate-700">{gate.name ?? gate.id}</span>
                {r ? (
                  <>
                    {' · '}
                    {t('gateIn')} {fmtT(r.lastEnter)} · {t('gateOut')} {fmtT(r.lastExit)} ·{' '}
                    {t('gateBlock')} {fmtT(r.lastBlock)} · ×{r.count}
                  </>
                ) : (
                  <span className="text-slate-400"> · {t('gateNoData')}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
