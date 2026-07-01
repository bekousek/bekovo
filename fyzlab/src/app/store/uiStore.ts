import { create } from 'zustand';
import type { InstrumentEvent } from '@engine/core/SimModule';
import type { RenderStats } from '@render/Renderer';
import type { PlotSample } from '@engine/instruments/Recorder';
import type { FbdForce } from '@engine/rigid/fbd';
import type { Lesson } from '@engine/scene/lesson';
import type { RaySegment } from '@engine/optics/OpticsModule';

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
  /** Id tělesa se zapnutým silovým diagramem (F2-D); null = vypnuto. */
  fbdBodyId: string | null;
  /** Poslední silový rozklad tělesa [N]; renderer čte přes getState. */
  fbdForces: FbdForce[];
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
  setFbdBodyId: (id: string | null) => void;
  setFbdForces: (forces: FbdForce[]) => void;
  clearFbd: () => void;
  /** Aktuální sada paprsků (F3-A); latest-wins z workeru. */
  raySegments: RaySegment[];
  setRaySegments: (segments: RaySegment[]) => void;
  /** Polohy částic per-kapalina (F4); fluidId → [x0,y0,x1,y1,...]. */
  fluidParticles: Map<string, number[]>;
  updateFluidParticles: (fluidId: string, xy: number[]) => void;
  clearFluidParticles: () => void;
  // --- Predikce (F2-E) ---
  /** Lekce aktuálně načtené scény; null = scéna bez lekce. */
  lesson: Lesson | null;
  /** Stav overlay predikce. Relevantní jen když lesson !== null. */
  predictionState: 'waiting' | 'running' | 'done';
  /** Text zadaný studentem do numerického pole. */
  predictionInput: string;
  /** Id vybrané volby (pro `choice` predikci). */
  predictionChosenId: string | null;
  /** Naměřená hodnota z enginu (numerická predikce); null = zatím není. */
  predictionActual: number | null;
  /** Student zavřel overlay lekce, aby si prohlédl scénu; lze znovu otevřít. */
  predictionDismissed: boolean;
  setLesson: (lesson: Lesson | null) => void;
  setPredictionState: (state: 'waiting' | 'running' | 'done') => void;
  setPredictionInput: (input: string) => void;
  setPredictionChosenId: (id: string | null) => void;
  setPredictionActual: (value: number | null) => void;
  setPredictionDismissed: (dismissed: boolean) => void;
  /** Reset formuláře predikce na 'waiting' (Zkusit znovu). */
  resetPrediction: () => void;
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
  fbdBodyId: null,
  fbdForces: [],
  raySegments: [],
  fluidParticles: new Map(),
  lesson: null,
  predictionState: 'waiting',
  predictionInput: '',
  predictionChosenId: null,
  predictionActual: null,
  predictionDismissed: false,
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
  setFbdBodyId: (id) => set({ fbdBodyId: id, fbdForces: [] }),
  setFbdForces: (forces) => set({ fbdForces: forces }),
  clearFbd: () => set({ fbdBodyId: null, fbdForces: [] }),
  setRaySegments: (segments) => set({ raySegments: segments }),
  updateFluidParticles: (fluidId, xy) =>
    set((s) => {
      const next = new Map(s.fluidParticles);
      next.set(fluidId, xy);
      return { fluidParticles: next };
    }),
  clearFluidParticles: () => set({ fluidParticles: new Map() }),
  setLesson: (lesson) => set({ lesson }),
  setPredictionState: (predictionState) => set({ predictionState }),
  setPredictionInput: (predictionInput) => set({ predictionInput }),
  setPredictionChosenId: (predictionChosenId) => set({ predictionChosenId }),
  setPredictionActual: (predictionActual) => set({ predictionActual }),
  setPredictionDismissed: (predictionDismissed) => set({ predictionDismissed }),
  resetPrediction: () =>
    set({
      predictionState: 'waiting',
      predictionInput: '',
      predictionChosenId: null,
      predictionActual: null,
      predictionDismissed: false,
    }),
}));
