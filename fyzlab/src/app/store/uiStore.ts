import { create } from 'zustand';
import type { InstrumentEvent } from '@engine/core/SimModule';
import type { RenderStats } from '@render/Renderer';
import type { PlotSample } from '@engine/instruments/Recorder';

/** Poslední měření jedné fotobrány. */
export interface GateReading {
  lastEnter: number | null;
  lastExit: number | null;
  /** Doba zákrytu posledního průchodu [s]. */
  lastBlock: number | null;
  /** Počet dokončených průchodů. */
  count: number;
}

/** Pozice kontextového (radiálního) menu ve screen px; null = zavřeno. */
export interface RadialMenuState {
  x: number;
  y: number;
}

interface UiState {
  running: boolean;
  speed: number;
  stats: RenderStats;
  canUndo: boolean;
  canRedo: boolean;
  activeToolId: string;
  snapEnabled: boolean;
  radialMenu: RadialMenuState | null;
  /** Globální zobrazení vektorů rychlosti (renderer čte přes getState). */
  showVelocityAll: boolean;
  /** Stopa pohybu těles (renderer čte přes getState). */
  tracerEnabled: boolean;
  /** Krátká zpráva dole (zkopírovaný odkaz, chyba souboru…); null = nic. */
  toast: string | null;
  /** Měření fotobran (id brány → poslední průchod). */
  gateReadings: Record<string, GateReading>;
  /** Id tělesa, jehož veličiny se zaznamenávají; null = zákaz. */
  plotBodyId: string | null;
  /** Nahromaděné vzorky recorderu (F2-C). Reset při načtení scény. */
  plotBuffer: PlotSample[];
  setRunning: (running: boolean) => void;
  setSpeed: (speed: number) => void;
  setStats: (stats: RenderStats) => void;
  setHistory: (canUndo: boolean, canRedo: boolean) => void;
  setActiveToolId: (activeToolId: string) => void;
  setSnapEnabled: (snapEnabled: boolean) => void;
  setRadialMenu: (radialMenu: RadialMenuState | null) => void;
  setShowVelocityAll: (showVelocityAll: boolean) => void;
  setTracerEnabled: (tracerEnabled: boolean) => void;
  setToast: (toast: string | null) => void;
  applyInstrumentEvents: (events: InstrumentEvent[]) => void;
  clearGateReadings: () => void;
  setPlotBodyId: (id: string | null) => void;
  appendPlotChunk: (samples: PlotSample[]) => void;
  clearPlotBuffer: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  running: false,
  speed: 1,
  stats: { fps: 0, tickMs: 0, bodies: 0, slowMotion: false, simTime: 0 },
  canUndo: false,
  canRedo: false,
  activeToolId: 'drag',
  snapEnabled: true,
  radialMenu: null,
  showVelocityAll: false,
  tracerEnabled: false,
  toast: null,
  gateReadings: {},
  plotBodyId: null,
  plotBuffer: [],
  setRunning: (running) => set({ running }),
  setSpeed: (speed) => set({ speed }),
  setStats: (stats) => set({ stats }),
  setHistory: (canUndo, canRedo) => set({ canUndo, canRedo }),
  setActiveToolId: (activeToolId) => set({ activeToolId }),
  setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
  setRadialMenu: (radialMenu) => set({ radialMenu }),
  setShowVelocityAll: (showVelocityAll) => set({ showVelocityAll }),
  setTracerEnabled: (tracerEnabled) => set({ tracerEnabled }),
  setToast: (toast) => set({ toast }),
  applyInstrumentEvents: (events) =>
    set((s) => {
      const next = { ...s.gateReadings };
      for (const ev of events) {
        const r = next[ev.instrument] ?? {
          lastEnter: null,
          lastExit: null,
          lastBlock: null,
          count: 0,
        };
        next[ev.instrument] =
          ev.kind === 'enter'
            ? { ...r, lastEnter: ev.t }
            : {
                ...r,
                lastExit: ev.t,
                lastBlock: r.lastEnter !== null ? ev.t - r.lastEnter : null,
                count: r.count + 1,
              };
      }
      return { gateReadings: next };
    }),
  clearGateReadings: () => set({ gateReadings: {} }),
  setPlotBodyId: (id) => set({ plotBodyId: id }),
  appendPlotChunk: (samples) => set((s) => ({ plotBuffer: [...s.plotBuffer, ...samples] })),
  clearPlotBuffer: () => set({ plotBuffer: [], plotBodyId: null }),
}));
