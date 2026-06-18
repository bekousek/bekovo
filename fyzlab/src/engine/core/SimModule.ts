import type { SceneDoc } from '../scene/schema';
import type { SignalBus } from './SignalBus';
import type { SnapshotWriter } from '../snapshot/layout';

/** Kontext jednoho simulačního ticku. */
export interface TickCtx {
  /** Délka kroku v sekundách. */
  dt: number;
  tickIndex: number;
  simTime: number;
  bus: SignalBus;
}

/** Událost přístroje (fotobrána) se sub-tick časem průchodu. */
export interface InstrumentEvent {
  instrument: string;
  body: string;
  kind: 'enter' | 'exit';
  /** Sim čas [s] — lineární interpolace uvnitř ticku. */
  t: number;
}

/** Kinematický stav tělesa (SI: m, m/s, rad, rad/s). */
export interface BodyState {
  id: string;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  omega: number;
}

/**
 * Kontrakt simulačního modulu (rigid, fluid, optics, instruments,
 * později circuits, magnets). Pořadí volání tick() napříč moduly je
 * ZÁVAZNÉ — viz docs/ARCHITECTURE.md; je to mechanismus, kterým spolu
 * domény interagují.
 *
 * Fáze 1 přidá `applyPatch(ops: DocOp[])` pro inkrementální změny docu.
 */
export interface SimModule {
  readonly name: string;
  /** Plné (zno­vu)postavení runtime stavu z dokumentu scény. */
  build(doc: SceneDoc): void;
  tick(ctx: TickCtx): void;
  /** Zápis stavu do binárního snapshotu pro render. */
  writeSnapshot(w: SnapshotWriter): void;
  /** Aktuální stav těles (pro stateSync při pauze a pro testy). */
  readState(): BodyState[];
  /** Odebere nahromaděné události od minulého volání (přístroje). */
  drainEvents?(): InstrumentEvent[];
  dispose(): void;
}
