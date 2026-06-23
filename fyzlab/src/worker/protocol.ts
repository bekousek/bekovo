/**
 * Kontrakt zpráv Main ↔ Worker — jediný zdroj pravdy.
 *
 * Snapshoty jezdí jako transferable ArrayBuffer (zero-copy); main je po
 * spotřebování vrací zprávou `returnBuffer` (recyklační pool).
 * Fáze 1 přidá `patch(DocOp[])` pro inkrementální editaci dokumentu.
 */
import type { SceneDoc } from '@engine/scene/schema';
import type { BodyState, InstrumentEvent } from '@engine/core/SimModule';
import type { DocOp } from '@engine/scene/ops';
export type { PlotSample } from '@engine/instruments/Recorder';
export type { FbdSample } from '@engine/rigid/fbd';

export type PointerMsg =
  | { kind: 'dragStart'; entityId: string; x: number; y: number }
  | { kind: 'dragMove'; x: number; y: number }
  | { kind: 'dragEnd' };

export type ControlAction = 'play' | 'pause' | 'step';

export type MainToWorker =
  | { type: 'init'; doc: SceneDoc }
  | { type: 'loadScene'; doc: SceneDoc }
  | { type: 'patch'; ops: DocOp[] }
  | { type: 'control'; action: ControlAction }
  | { type: 'setSpeed'; speed: number }
  | { type: 'pointer'; ev: PointerMsg }
  | { type: 'requestStateSync' }
  | { type: 'returnBuffer'; buffer: ArrayBuffer }
  | { type: 'setRecordBodyId'; bodyId: string | null }
  | { type: 'setFbdBodyId'; bodyId: string | null }
  | { type: 'setPredictionTarget'; bodyId: string | null; quantity: string | null };

export interface SnapshotMsg {
  type: 'snapshot';
  seq: number;
  simTime: number;
  tickIndex: number;
  slowMotion: boolean;
  /** Verze idTable, ke které se snapshot vztahuje. */
  topologyVersion: number;
  bodyCount: number;
  /** Klouzavý průměr délky jednoho ticku [ms] (diagnostika). */
  tickMs: number;
  /** Float32 buffer dle engine/snapshot/layout.ts (transferable). */
  bodies: ArrayBuffer;
}

export type WorkerToMain =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'idTable'; topologyVersion: number; ids: string[] }
  | SnapshotMsg
  | { type: 'status'; running: boolean; speed: number }
  | { type: 'stateSync'; states: BodyState[] }
  | { type: 'events'; events: InstrumentEvent[] }
  | { type: 'plotChunk'; samples: import('@engine/instruments/Recorder').PlotSample[]; }
  | { type: 'fbdSample'; sample: import('@engine/rigid/fbd').FbdSample }
  | { type: 'predictionResult'; value: number };
