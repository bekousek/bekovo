/**
 * InstrumentsModule — virtuální měřicí přístroje. Fáze 2: fotobrána.
 *
 * Fotobrána = úsečka podél lokální osy y (±halfLength). Pro každé těleso
 * v podélném rozsahu brány se sleduje laterální odstup g (vzdálenost
 * nejbližší hrany tvaru od přímky paprsku; záporný = paprsek přerušen).
 * Průchod nulou mezi dvěma ticky dává SUB-TICK čas události lineární
 * interpolací — fotobrána je tak řádově přesnější než 1/120 s.
 *
 * Modul tiká PO rigid.step (čte čerstvé pózy přes PoseSource) — pořadí
 * modulů viz ARCHITECTURE.md.
 */
import { rotate } from '../core/math';
import type {
  BodyState,
  InstrumentEvent,
  SimModule,
  TickCtx,
} from '../core/SimModule';
import type { SnapshotWriter } from '../snapshot/layout';
import type { PoseLike } from '../scene/jointGeom';
import type { Body, Entity, Instrument, SceneDoc, Shape } from '../scene/schema';

export type PoseSource = (id: string) => PoseLike | null;

interface LateralResult {
  /** Laterální odstup od přímky paprsku (záporný = protíná). */
  g: number;
  /** Leží tvar v podélném rozsahu brány? */
  inExtent: boolean;
}

/** Laterální odstup jednoho tvaru od paprsku brány. */
function shapeLateral(
  shape: Shape,
  pose: PoseLike,
  gx: number,
  gy: number,
  nx: number,
  ny: number,
  dx: number,
  dy: number,
  halfLength: number,
): LateralResult | null {
  switch (shape.type) {
    case 'circle': {
      const off = rotate(shape.offset, pose.angle);
      const cx = pose.x + off.x - gx;
      const cy = pose.y + off.y - gy;
      const u = cx * nx + cy * ny;
      const w = cx * dx + cy * dy;
      return {
        g: Math.abs(u) - shape.r,
        inExtent: w >= -halfLength - shape.r && w <= halfLength + shape.r,
      };
    }
    case 'box': {
      const corners = [
        { x: -shape.hw, y: -shape.hh },
        { x: shape.hw, y: -shape.hh },
        { x: shape.hw, y: shape.hh },
        { x: -shape.hw, y: shape.hh },
      ];
      let sMin = Infinity;
      let sMax = -Infinity;
      let wMin = Infinity;
      let wMax = -Infinity;
      for (const c of corners) {
        const l = rotate(c, shape.angle);
        const world = rotate({ x: shape.offset.x + l.x, y: shape.offset.y + l.y }, pose.angle);
        const px = pose.x + world.x - gx;
        const py = pose.y + world.y - gy;
        const s = px * nx + py * ny;
        const w = px * dx + py * dy;
        sMin = Math.min(sMin, s);
        sMax = Math.max(sMax, s);
        wMin = Math.min(wMin, w);
        wMax = Math.max(wMax, w);
      }
      return { g: Math.max(sMin, -sMax), inExtent: wMax >= -halfLength && wMin <= halfLength };
    }
    case 'polygon': {
      let sMin = Infinity;
      let sMax = -Infinity;
      let wMin = Infinity;
      let wMax = -Infinity;
      for (const p of shape.points) {
        const world = rotate(p, pose.angle);
        const px = pose.x + world.x - gx;
        const py = pose.y + world.y - gy;
        const s = px * nx + py * ny;
        const w = px * dx + py * dy;
        sMin = Math.min(sMin, s);
        sMax = Math.max(sMax, s);
        wMin = Math.min(wMin, w);
        wMax = Math.max(wMax, w);
      }
      return { g: Math.max(sMin, -sMax), inExtent: wMax >= -halfLength && wMin <= halfLength };
    }
    case 'plane':
      return null; // nekonečná rovina bránu „blokuje" trvale — ignorovat
  }
}

interface GatePairState {
  /** Paprsek přerušen (laterálně protnut a zároveň v podélném rozsahu). */
  blocked: boolean;
  /** Laterální odstup (platný jen když inExtent). */
  g: number;
  inExtent: boolean;
}

export class InstrumentsModule implements SimModule {
  readonly name = 'instruments';

  private gates: Instrument[] = [];
  /** Pohyblivá tělesa (dynamic/kinematic) — tvary pro průsečíky. */
  private bodies = new Map<string, Body>();
  /** `gateId bodyId` → stav z minulého ticku. */
  private pairs = new Map<string, GatePairState>();
  private events: InstrumentEvent[] = [];

  constructor(private readonly poses: PoseSource) {}

  build(doc: SceneDoc): void {
    this.gates = [];
    this.bodies.clear();
    this.pairs.clear();
    this.events = [];
    for (const e of doc.entities) this.addEntity(e);
  }

  // --- Inkrementální změny (volá Engine.applyPatch) -------------------------

  addEntity(e: Entity): void {
    if (e.kind === 'instrument') {
      if (e.type === 'photogate' && !this.gates.some((g) => g.id === e.id)) this.gates.push(e);
    } else if (e.kind === 'body' && e.bodyType !== 'static') {
      this.bodies.set(e.id, e);
    }
  }

  removeEntity(id: string): void {
    this.gates = this.gates.filter((g) => g.id !== id);
    this.bodies.delete(id);
    for (const key of [...this.pairs.keys()]) {
      const [gateId, bodyId] = key.split(' ');
      if (gateId === id || bodyId === id) this.pairs.delete(key);
    }
  }

  replaceEntity(e: Entity): void {
    this.removeEntity(e.id);
    this.addEntity(e);
  }

  // --- Tick ------------------------------------------------------------------

  tick(ctx: TickCtx): void {
    for (const gate of this.gates) {
      const angle = gate.transform.angle;
      const d = rotate({ x: 0, y: 1 }, angle); // směr paprsku
      const n = rotate({ x: 1, y: 0 }, angle); // normála (laterální osa)
      const L = gate.gate.halfLength;

      for (const body of this.bodies.values()) {
        const pose = this.poses(body.id);
        if (!pose) continue;

        let g = Infinity;
        let inExtent = false;
        for (const shape of body.shapes) {
          const r = shapeLateral(
            shape, pose, gate.transform.x, gate.transform.y, n.x, n.y, d.x, d.y, L,
          );
          if (!r || !r.inExtent) continue;
          inExtent = true;
          g = Math.min(g, r.g);
        }

        const key = `${gate.id} ${body.id}`;
        const blocked = inExtent && g < 0;
        const prev = this.pairs.get(key);

        if (prev !== undefined && prev.blocked !== blocked) {
          // Laterální průchod hranou paprsku → sub-tick lineární interpolace.
          // Podélné opuštění/vstup (vypadnutí pod bránu apod.) interpolovat
          // nejde — bere se konec ticku.
          const lateral = prev.inExtent && inExtent && prev.g < 0 !== g < 0;
          const t = lateral
            ? ctx.simTime + (prev.g / (prev.g - g)) * ctx.dt
            : ctx.simTime + ctx.dt;
          this.events.push({
            instrument: gate.id,
            body: body.id,
            kind: blocked ? 'enter' : 'exit',
            t,
          });
        }
        this.pairs.set(key, { blocked, g, inExtent });
      }
    }
  }

  drainEvents(): InstrumentEvent[] {
    if (this.events.length === 0) return this.events;
    const out = this.events;
    this.events = [];
    return out;
  }

  writeSnapshot(_w: SnapshotWriter): void {
    // Přístroje do binárního snapshotu nepíší (fáze 2: jen eventy).
  }

  readState(): BodyState[] {
    return [];
  }

  dispose(): void {
    this.gates = [];
    this.bodies.clear();
    this.pairs.clear();
    this.events = [];
  }
}
