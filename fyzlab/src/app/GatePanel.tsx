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
import { Panel } from './ui';

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
    <Panel className="max-w-xs p-3">
      {/* Hlavička je tlačítko (sbalování) — stylovaná jako nadpis Section,
          proto se Section nepoužívá: ta renderuje pevné <h3>. */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t('gateExpand') : t('gateCollapse')}
        title={collapsed ? t('gateExpand') : t('gateCollapse')}
        className="flex w-full items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest [color:var(--text-muted)] transition hover:[color:var(--text-secondary)]"
      >
        <span>{t('gatePanelTitle')}</span>
        <span aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <div className="mt-1.5 space-y-1.5">
          {gates.map((gate) => {
            const r = readings[gate.id];
            return (
              <div
                key={gate.id}
                className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-2 py-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold [color:var(--text-primary)]">
                    {gate.name ?? gate.id}
                  </span>
                  {r && (
                    <span className="text-[11px] tabular-nums [color:var(--text-muted)]">
                      ×{r.count}
                    </span>
                  )}
                </div>
                {r ? (
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] tabular-nums [color:var(--text-secondary)]">
                    <span>
                      {t('gateIn')} {fmtT(r.lastEnter)}
                    </span>
                    <span>
                      {t('gateOut')} {fmtT(r.lastExit)}
                    </span>
                    <span>
                      {t('gateBlock')} {fmtT(r.lastBlock)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-0.5 text-[11px] [color:var(--text-muted)]">{t('gateNoData')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
