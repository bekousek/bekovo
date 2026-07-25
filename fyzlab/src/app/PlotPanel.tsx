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
import { Button, Chip, Panel, PanelHeader } from './ui';

type SeriesKey = 'x' | 'y' | 'speed';

const SERIES: { key: SeriesKey; label: MsgKey; unit: string; color: string }[] = [
  { key: 'y', label: 'plotY', unit: 'm', color: '#10b981' },
  { key: 'x', label: 'plotX', unit: 'm', color: '#3b82f6' },
  { key: 'speed', label: 'plotSpeed', unit: 'm/s', color: '#f59e0b' },
];

const W = 284;
const H = 130;

/** Přečte aktuální hodnotu design tokenu (uPlot kreslí do canvasu — potřebuje resolvnutou barvu, ne var()). */
function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function PlotPanel({ runtime }: { runtime: Runtime }) {
  const plotBodyId = useUiStore((s) => s.plotBodyId);
  const plotBuffer = useUiStore((s) => s.plotBuffer);
  const theme = useUiStore((s) => s.theme);
  const [active, setActive] = useState<SeriesKey>('y');
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  // Vytvoř / přebuduj uPlot při změně aktivní série, motivu (light/dark), nebo když se
  // kontejner poprvé objeví v DOM (panel se vykreslí až s plotBodyId — bez této závislosti
  // by React efekt po tomto přechodu znovu nespustil a graf by se nikdy nenamountoval).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cfg = SERIES.find((s) => s.key === active)!;
    const axisColor = cssVar('--text-muted', '#94a3b8');
    const gridColor = cssVar('--border', '#e2e8f0');
    const opts: uPlot.Options = {
      width: W,
      height: H,
      series: [
        {},
        { label: `${t(cfg.label)} [${cfg.unit}]`, stroke: cfg.color, width: 2 },
      ],
      axes: [
        {
          label: 't [s]',
          size: 28,
          gap: 4,
          stroke: axisColor,
          grid: { stroke: gridColor, width: 1 },
          ticks: { stroke: gridColor },
        },
        {
          label: cfg.unit,
          size: 36,
          gap: 4,
          stroke: axisColor,
          grid: { stroke: gridColor, width: 1 },
          ticks: { stroke: gridColor },
        },
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
  }, [active, theme, plotBodyId]);

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
    <Panel className="max-w-[calc(100vw-2rem)]">
      <PanelHeader title={t('plotPanelTitle')} onClose={handleClose} />
      <div className="p-3">
        {/* Přepínač série */}
        <div className="mb-1.5 flex gap-1">
          {SERIES.map((cfg) => (
            <Chip key={cfg.key} active={active === cfg.key} onClick={() => setActive(cfg.key)}>
              {t(cfg.label)}
            </Chip>
          ))}
        </div>

        {/* Graf — kontejner je vždy v DOM, uPlot ho zaplní */}
        <div className="relative" style={{ width: W, height: H }}>
          <div ref={containerRef} />
          {plotBuffer.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[11px] [color:var(--text-muted)]">{t('plotNoData')}</p>
            </div>
          )}
        </div>

        {/* CSV export */}
        <Button
          variant="secondary"
          className="mt-2 w-full gap-1.5 text-xs"
          onClick={handleCsv}
          disabled={plotBuffer.length === 0}
        >
          {t('plotExportCsv')}
        </Button>
      </div>
    </Panel>
  );
}
