/**
 * Panel grafu pohybu (F2-C): uPlot graf x(t) / y(t) / v(t) + CSV export.
 * Zobrazí se, když uiStore.plotBodyId !== null; zavře se tlačítkem ✕.
 */
import { useEffect, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useUiStore } from './store/uiStore';
import type { Runtime } from './bootstrap';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';

type SeriesKey = 'x' | 'y' | 'speed';

const SERIES: { key: SeriesKey; label: MsgKey; unit: string; color: string }[] = [
  { key: 'y', label: 'plotY', unit: 'm', color: '#10b981' },
  { key: 'x', label: 'plotX', unit: 'm', color: '#3b82f6' },
  { key: 'speed', label: 'plotSpeed', unit: 'm/s', color: '#f59e0b' },
];

const W = 284;
const H = 130;

export function PlotPanel({ runtime }: { runtime: Runtime }) {
  const plotBodyId = useUiStore((s) => s.plotBodyId);
  const plotBuffer = useUiStore((s) => s.plotBuffer);
  const [active, setActive] = useState<SeriesKey>('y');
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  // Vytvoř / přebuduj uPlot při změně aktivní série
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cfg = SERIES.find((s) => s.key === active)!;
    const opts: uPlot.Options = {
      width: W,
      height: H,
      series: [
        {},
        { label: `${t(cfg.label)} [${cfg.unit}]`, stroke: cfg.color, width: 2 },
      ],
      axes: [
        { label: 't [s]', size: 28, gap: 4 },
        { label: cfg.unit, size: 36, gap: 4 },
      ],
      cursor: { show: false },
      legend: { show: false },
    };
    const chart = new uPlot(opts, [[], []], el);
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [active]);

  // Aktualizuj data při změně bufferu nebo série
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (plotBuffer.length === 0) {
      chart.setData([[], []]);
      return;
    }
    const ts = plotBuffer.map((s) => s.t);
    const vals = plotBuffer.map((s) => s[active]);
    chart.setData([ts, vals]);
  }, [plotBuffer, active]);

  if (!plotBodyId) return null;

  const handleCsv = () => {
    if (plotBuffer.length === 0) return;
    const header = 't,x,y,speed\n';
    const rows = plotBuffer.map((s) => `${s.t},${s.x},${s.y},${s.speed}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fyzlab_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    useUiStore.getState().clearPlotBuffer();
    runtime.client.setRecordBodyId(null);
  };

  return (
    <div className="pointer-events-auto rounded-2xl bg-white/85 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      {/* Záhlaví */}
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <h3 className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
          {t('plotPanelTitle')}
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

      {/* Přepínač série */}
      <div className="mb-1.5 flex gap-1">
        {SERIES.map((cfg) => (
          <button
            key={cfg.key}
            type="button"
            onClick={() => setActive(cfg.key)}
            className={`rounded-full px-2 py-0.5 text-[11px] transition select-none ${
              active === cfg.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t(cfg.label)}
          </button>
        ))}
      </div>

      {/* Graf — kontejner je vždy v DOM, uPlot ho zaplní */}
      <div className="relative" style={{ width: W, height: H }}>
        <div ref={containerRef} />
        {plotBuffer.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] text-slate-400">{t('plotNoData')}</p>
          </div>
        )}
      </div>

      {/* CSV export */}
      <button
        type="button"
        onClick={handleCsv}
        disabled={plotBuffer.length === 0}
        className="mt-2 w-full rounded-lg bg-slate-100 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-40"
      >
        {t('plotExportCsv')}
      </button>
    </div>
  );
}
