/**
 * Engine — headless hostitel simulačních modulů.
 *
 * Žádný DOM, žádné Pixi, žádný React: stejný kód běží ve web workeru
 * (produkce) i v Node (vitest accuracy testy). Závazné pořadí modulů
 * v ticku je mechanismus mezioborových interakcí — viz ARCHITECTURE.md.
 */
import { SignalBus } from './core/SignalBus';
import type { SimModule, BodyState, InstrumentEvent } from './core/SimModule';
import { InstrumentsModule } from './instruments/InstrumentsModule';
import { initRapier } from './rigid/rapier';
import { RigidModule } from './rigid/RigidModule';
import { SnapshotWriter, bodiesByteLength } from './snapshot/layout';
import { bodyIndexOf, type SceneDoc } from './scene/schema';
import { applyOpsToDoc, type DocOp } from './scene/ops';
import type { Vec2 } from './core/math';
import type { PlotSample } from './instruments/Recorder';
import type { FbdSample } from './rigid/fbd';

export class Engine {
  readonly dt: number;
  tickIndex = 0;
  simTime = 0;

  private readonly bus = new SignalBus();
  private readonly rigid: RigidModule;
  private readonly instruments: InstrumentsModule;
  /** Závazné pořadí: [circuits] → rigid → [fluid] → [optics] → instruments. */
  private readonly modules: SimModule[];

  doc: SceneDoc;

  private constructor(rigid: RigidModule, doc: SceneDoc) {
    this.rigid = rigid;
    this.instruments = new InstrumentsModule(
      (id) => rigid.poseOf(id),
      (id) => rigid.stateOf(id),
    );
    this.modules = [rigid, this.instruments];
    this.doc = doc;
    this.dt = 1 / doc.world.tickHz;
  }

  /** Asynchronní tovární metoda (inicializace WASM Rapieru). */
  static async create(doc: SceneDoc): Promise<Engine> {
    const R = await initRapier();
    const engine = new Engine(new RigidModule(R), doc);
    engine.load(doc);
    return engine;
  }

  /** Plné nahrazení scény (load souboru, reset). */
  load(doc: SceneDoc): void {
    this.doc = doc;
    this.tickIndex = 0;
    this.simTime = 0;
    this.bus.clear();
    for (const m of this.modules) m.build(doc);
  }

  /**
   * Inkrementální aplikace DocOps. Dokument se aktualizuje stejným čistým
   * reducerem jako v editoru; runtime stav se mění cíleně (bez rebuildu).
   *
   * @param preserveKinematics true za běhu simulace — `replaceEntity` pak
   *   zachová aktuální pozice/rychlosti tělesa (změna materiálu nesmí
   *   teleportovat). `setKinematics` nastavuje vždy explicitně.
   * @returns topologyChanged — změnila se množina těles (nutný nový idTable).
   */
  applyPatch(ops: readonly DocOp[], preserveKinematics: boolean): { topologyChanged: boolean } {
    let topologyChanged = false;
    for (const op of ops) {
      switch (op.op) {
        case 'replaceDoc':
          this.load(op.doc);
          topologyChanged = true;
          break;
        case 'addEntity': {
          this.doc = applyOpsToDoc(this.doc, [op]);
          if (op.entity.kind === 'body') {
            this.rigid.insertBody(op.entity, bodyIndexOf(this.doc, op.entity.id));
            this.instruments.addEntity(op.entity);
            topologyChanged = true;
          } else if (op.entity.kind === 'joint') {
            this.rigid.addJoint(op.entity);
          } else {
            this.instruments.addEntity(op.entity);
          }
          break;
        }
        case 'removeEntity': {
          const existing = this.doc.entities.find((e) => e.id === op.id);
          this.doc = applyOpsToDoc(this.doc, [op]);
          if (!existing) break;
          if (existing.kind === 'body') {
            this.rigid.removeBody(op.id);
            this.instruments.removeEntity(op.id);
            topologyChanged = true;
          } else if (existing.kind === 'joint') {
            this.rigid.removeJoint(op.id);
          } else {
            this.instruments.removeEntity(op.id);
          }
          break;
        }
        case 'replaceEntity': {
          this.doc = applyOpsToDoc(this.doc, [op]);
          if (op.entity.kind === 'body') {
            this.rigid.replaceBody(op.entity, preserveKinematics);
            this.instruments.replaceEntity(op.entity);
          } else if (op.entity.kind === 'joint') {
            this.rigid.replaceJoint(op.entity);
          } else {
            this.instruments.replaceEntity(op.entity);
          }
          break;
        }
        case 'setKinematics':
          this.doc = applyOpsToDoc(this.doc, [op]);
          this.rigid.setKinematics(op.id, op.transform, op.velocity);
          break;
        case 'setWorld':
          this.doc = applyOpsToDoc(this.doc, [op]);
          this.rigid.setWorld(op.gravity, op.airDensity);
          break;
      }
    }
    return { topologyChanged };
  }

  tick(): void {
    const ctx = {
      dt: this.dt,
      tickIndex: this.tickIndex,
      simTime: this.simTime,
      bus: this.bus,
    };
    for (const m of this.modules) m.tick(ctx);
    this.tickIndex += 1;
    this.simTime += this.dt;
  }

  get bodyCount(): number {
    return this.rigid.bodyCount;
  }

  get orderIds(): readonly string[] {
    return this.rigid.orderIds;
  }

  snapshotByteLength(): number {
    return bodiesByteLength(this.bodyCount);
  }

  /** Zapíše aktuální stav do předaného bufferu (vlastnictví zůstává volajícímu). */
  writeSnapshotInto(buffer: ArrayBuffer): void {
    const w = new SnapshotWriter(buffer, this.bodyCount);
    for (const m of this.modules) m.writeSnapshot(w);
  }

  readState(): BodyState[] {
    return this.modules.flatMap((m) => m.readState());
  }

  /** Odebere nahromaděné události přístrojů (fotobrány…). */
  drainEvents(): InstrumentEvent[] {
    return this.modules.flatMap((m) => m.drainEvents?.() ?? []);
  }

  /** Stav tělesa podle id (testy, ladění). */
  getBodyState(id: string): BodyState | undefined {
    return this.readState().find((s) => s.id === id);
  }

  /**
   * Kompletní kinematický stav jako Float64Array — pro byte-exact porovnání
   * v testech determinismu a pro reset-hash.
   */
  stateArray(): Float64Array {
    const states = this.readState();
    const out = new Float64Array(states.length * 6);
    states.forEach((s, i) => {
      const o = i * 6;
      out[o] = s.x;
      out[o + 1] = s.y;
      out[o + 2] = s.angle;
      out[o + 3] = s.vx;
      out[o + 4] = s.vy;
      out[o + 5] = s.omega;
    });
    return out;
  }

  // --- Recorder (F2-C) -------------------------------------------------------

  /** Nastaví těleso, jehož veličiny recorder vzorkuje (~10 Hz). Null = zákaz. */
  setRecordBodyId(id: string | null): void {
    this.instruments.setRecordBodyId(id);
  }

  /** Odebere nahromaděné vzorky recorderu od minulého volání. */
  drainPlotSamples(): PlotSample[] {
    return this.instruments.drainSamples();
  }

  // --- FBD (silový diagram, F2-D) -------------------------------------------

  /** Nastaví těleso, jehož silový rozklad se vzorkuje (~10 Hz). Null = zákaz. */
  setFbdBodyId(id: string | null): void {
    this.rigid.setFbdBodyId(id);
  }

  /** Odebere poslední silový vzorek tělesa (null = žádný nový). */
  drainFbdSample(): FbdSample | null {
    return this.rigid.drainFbdSample();
  }

  // --- Predikce (F2-E) -------------------------------------------------------

  /** Spustí sledování veličiny na tělesu; null bodyId = zákaz. */
  setPredictionTarget(bodyId: string | null, quantity: string | null): void {
    this.instruments.setPredictionTarget(bodyId, quantity);
  }

  /** Odebere výsledek predikce po dopadu tělesa (null = ještě nedorazil). */
  drainPredictionResult(): number | null {
    return this.instruments.drainPredictionResult();
  }

  // --- Ukazatel (drag joint) ----------------------------------------------

  pointerDragStart(entityId: string, point: Vec2): void {
    this.rigid.dragStart(entityId, point);
  }

  pointerDragMove(point: Vec2): void {
    this.rigid.dragMove(point);
  }

  pointerDragEnd(): void {
    this.rigid.dragEnd();
  }

  dispose(): void {
    for (const m of this.modules) m.dispose();
  }
}
