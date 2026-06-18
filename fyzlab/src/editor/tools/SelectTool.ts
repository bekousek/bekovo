/**
 * Výchozí nástroj „ruka/výběr":
 *  - za běhu: uchopení tělesa pružinovým drag jointem (worker),
 *  - v pauze: tap = výběr, tažení = posun výběru, prázdno = marquee,
 *    úchopy = rotace kolem středu výběru / škálování,
 *  - Shift = přidat/odebrat z výběru.
 *
 * Transformace jdou během gesta jako transientní patche (živý náhled bez
 * undo šumu); na pointer-up se commitne jeden Command.
 */
import { clamp, distance, rotate, wrapAngle, type Vec2 } from '@engine/core/math';
import type { Body, Entity, Shape } from '@engine/scene/schema';
import type { DocOp, TransformPatch, VelocityPatch } from '@engine/scene/ops';
import { aabbsOverlap, bodyWorldAABB } from '../bounds';
import type { Command } from '../DocumentStore';
import { findInstrumentAt, findJointAt } from '../hitTest';
import type { Tool, ToolContext, ToolPointerEvent } from './Tool';

type Mode = 'idle' | 'grab' | 'move' | 'rotate' | 'scale' | 'marquee';

interface StartKin {
  transform: TransformPatch;
  velocity: VelocityPatch;
}

function scaleShape(shape: Shape, f: number): Shape {
  switch (shape.type) {
    case 'circle':
      return { ...shape, r: shape.r * f, offset: { x: shape.offset.x * f, y: shape.offset.y * f } };
    case 'box':
      return {
        ...shape,
        hw: shape.hw * f,
        hh: shape.hh * f,
        offset: { x: shape.offset.x * f, y: shape.offset.y * f },
      };
    case 'polygon':
      return { ...shape, points: shape.points.map((p) => ({ x: p.x * f, y: p.y * f })) };
    case 'plane':
      return shape;
  }
}

export class SelectTool implements Tool {
  readonly id = 'drag';

  private mode: Mode = 'idle';
  private pid = -1;
  private startWorld: Vec2 = { x: 0, y: 0 };
  private moved = false;
  private downHit: string | null = null;
  private downShift = false;
  private wasSelected = false;

  private startKin = new Map<string, StartKin>();
  private startEntities = new Map<string, Body>();
  private center: Vec2 = { x: 0, y: 0 };
  private startAngle = 0;
  private startDist = 1;

  constructor(private readonly ctx: ToolContext) {}

  // --- Pomocníci -------------------------------------------------------------

  private pxToWorld(px: number): number {
    return px / this.ctx.camera.pixelsPerMeter;
  }

  private selectedBodies(): Body[] {
    const out: Body[] = [];
    for (const id of this.ctx.state.selection) {
      const e = this.ctx.store.doc.entities.find((x) => x.id === id);
      if (e && e.kind === 'body') out.push(e);
    }
    return out;
  }

  private captureStart(): void {
    this.startKin.clear();
    this.startEntities.clear();
    for (const b of this.selectedBodies()) {
      this.startKin.set(b.id, {
        transform: { ...b.transform },
        velocity: { ...b.velocity },
      });
      this.startEntities.set(b.id, b);
    }
  }

  private handleHit(p: Vec2): 'rotate' | 'scale' | null {
    const h = this.ctx.state.handles((px) => this.pxToWorld(px));
    if (!h) return null;
    const tol = this.pxToWorld(20);
    if (distance(p, h.rotate) < tol) return 'rotate';
    if (distance(p, h.scale) < tol) return 'scale';
    return null;
  }

  // --- Pointer ---------------------------------------------------------------

  pointerDown(e: ToolPointerEvent): void {
    if (this.mode !== 'idle') return;
    this.pid = e.pointerId;
    this.startWorld = e.world;
    this.moved = false;
    this.downShift = e.shiftKey;
    this.downHit = null;

    if (this.ctx.isRunning()) {
      const hit = this.ctx.hitTest(e.world);
      if (hit) {
        this.mode = 'grab';
        this.ctx.client.dragStart(hit, e.world);
      } else {
        this.pid = -1;
      }
      return;
    }

    const state = this.ctx.state;

    const handle = this.handleHit(e.world);
    if (handle && state.selection.size > 0) {
      const h = this.ctx.state.handles((px) => this.pxToWorld(px))!;
      this.center = h.center;
      this.captureStart();
      if (handle === 'rotate') {
        this.mode = 'rotate';
        this.startAngle = Math.atan2(e.world.y - h.center.y, e.world.x - h.center.x);
      } else {
        this.mode = 'scale';
        this.startDist = Math.max(distance(e.world, h.center), 1e-6);
      }
      return;
    }

    // Klouby a přístroje se kreslí nad tělesy → mají při ťuknutí přednost.
    const jointHit = findJointAt(
      this.ctx.store.doc,
      (id) => state.poseOf(id),
      e.world,
      this.pxToWorld(14),
    );
    const hit =
      jointHit ??
      findInstrumentAt(this.ctx.store.doc, e.world, this.pxToWorld(12)) ??
      this.ctx.hitTest(e.world);
    if (hit) {
      this.downHit = hit;
      this.wasSelected = state.selection.has(hit);
      if (this.downShift) {
        if (!this.wasSelected) {
          state.selection.add(hit);
          state.bump();
        }
      } else if (!this.wasSelected) {
        state.setSelection([hit]);
      }
      this.mode = 'move';
      this.captureStart();
      return;
    }

    this.mode = 'marquee';
    state.setMarquee({ minX: e.world.x, minY: e.world.y, maxX: e.world.x, maxY: e.world.y });
  }

  pointerMove(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid) return;
    const deltaPx = distance(e.world, this.startWorld) * this.ctx.camera.pixelsPerMeter;
    if (deltaPx > 6) this.moved = true;

    switch (this.mode) {
      case 'grab':
        this.ctx.client.dragMove(e.world);
        return;

      case 'move': {
        if (!this.moved) return;
        const rawDelta = { x: e.world.x - this.startWorld.x, y: e.world.y - this.startWorld.y };
        // Snap: skupina se posune tak, aby primární těleso sedlo na mřížku.
        let delta = rawDelta;
        const first = this.startKin.values().next().value;
        if (first) {
          const target = this.ctx.snap.point({
            x: first.transform.x + rawDelta.x,
            y: first.transform.y + rawDelta.y,
          });
          delta = { x: target.x - first.transform.x, y: target.y - first.transform.y };
        }
        const ops: DocOp[] = [];
        for (const [id, kin] of this.startKin) {
          ops.push({
            op: 'setKinematics',
            id,
            transform: {
              x: kin.transform.x + delta.x,
              y: kin.transform.y + delta.y,
              angle: kin.transform.angle,
            },
          });
        }
        if (ops.length) this.ctx.store.applyTransient(ops);
        return;
      }

      case 'rotate': {
        const a = Math.atan2(e.world.y - this.center.y, e.world.x - this.center.x);
        const dTheta = this.ctx.snap.angle(wrapAngle(a - this.startAngle));
        const ops: DocOp[] = [];
        for (const [id, kin] of this.startKin) {
          const rel = rotate(
            { x: kin.transform.x - this.center.x, y: kin.transform.y - this.center.y },
            dTheta,
          );
          ops.push({
            op: 'setKinematics',
            id,
            transform: {
              x: this.center.x + rel.x,
              y: this.center.y + rel.y,
              angle: kin.transform.angle + dTheta,
            },
          });
        }
        if (ops.length) this.ctx.store.applyTransient(ops);
        return;
      }

      case 'scale': {
        const f = clamp(distance(e.world, this.center) / this.startDist, 0.05, 20);
        const ops: DocOp[] = [];
        for (const [id, start] of this.startEntities) {
          if (start.shapes.every((s) => s.type === 'plane')) continue; // roviny neškálujeme
          const kin = this.startKin.get(id)!;
          const entity: Body = {
            ...start,
            transform: {
              x: this.center.x + (kin.transform.x - this.center.x) * f,
              y: this.center.y + (kin.transform.y - this.center.y) * f,
              angle: kin.transform.angle,
            },
            shapes: start.shapes.map((s) => scaleShape(s, f)),
          };
          ops.push({ op: 'replaceEntity', entity });
        }
        if (ops.length) this.ctx.store.applyTransient(ops);
        return;
      }

      case 'marquee': {
        this.ctx.state.setMarquee({
          minX: Math.min(this.startWorld.x, e.world.x),
          minY: Math.min(this.startWorld.y, e.world.y),
          maxX: Math.max(this.startWorld.x, e.world.x),
          maxY: Math.max(this.startWorld.y, e.world.y),
        });
        return;
      }

      case 'idle':
        return;
    }
  }

  pointerUp(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid) return;
    const state = this.ctx.state;
    const store = this.ctx.store;

    switch (this.mode) {
      case 'grab':
        this.ctx.client.dragEnd();
        break;

      case 'move': {
        if (this.moved) {
          this.commitKinematics('Posun');
        } else if (this.downHit) {
          // Tap: bez shiftu zúžit výběr na jedno těleso, se shiftem toggle.
          if (this.downShift && this.wasSelected) {
            state.selection.delete(this.downHit);
            state.bump();
          } else if (!this.downShift) {
            state.setSelection([this.downHit]);
          }
        }
        break;
      }

      case 'rotate':
        if (this.moved) this.commitKinematics('Otočení');
        break;

      case 'scale':
        if (this.moved) this.commitScale();
        break;

      case 'marquee': {
        const rect = state.marquee;
        state.setMarquee(null);
        if (rect && this.moved) {
          const hits: string[] = [];
          for (const ent of store.doc.entities) {
            if (ent.kind !== 'body') continue;
            const pose = state.lookupPose(ent.id) ?? {
              x: ent.transform.x,
              y: ent.transform.y,
              angle: ent.transform.angle,
            };
            const aabb = bodyWorldAABB(ent, pose);
            if (aabb && aabbsOverlap(aabb, rect)) hits.push(ent.id);
          }
          if (this.downShift) {
            for (const id of hits) state.selection.add(id);
            state.bump();
          } else {
            state.setSelection(hits);
          }
        } else if (!this.moved && !this.downShift) {
          state.clearSelection();
        }
        break;
      }

      case 'idle':
        break;
    }

    this.reset();
  }

  cancel(): void {
    if (this.mode === 'grab') this.ctx.client.dragEnd();
    if (this.mode === 'move' || this.mode === 'rotate') this.revertKinematics();
    if (this.mode === 'scale') this.revertScale();
    if (this.mode === 'marquee') this.ctx.state.setMarquee(null);
    this.reset();
  }

  // --- Commit / revert ---------------------------------------------------------

  private commitKinematics(label: string): void {
    const doOps: DocOp[] = [];
    const undoOps: DocOp[] = [];
    for (const [id, start] of this.startKin) {
      const e = this.ctx.store.doc.entities.find((x) => x.id === id);
      if (!e || e.kind !== 'body') continue;
      doOps.push({ op: 'setKinematics', id, transform: { ...e.transform } });
      undoOps.push({ op: 'setKinematics', id, transform: { ...start.transform } });
    }
    if (doOps.length === 0) return;
    const cmd: Command = { label, do: doOps, undo: undoOps };
    this.ctx.store.apply(cmd);
  }

  private revertKinematics(): void {
    const ops: DocOp[] = [];
    for (const [id, start] of this.startKin) {
      ops.push({ op: 'setKinematics', id, transform: { ...start.transform } });
    }
    if (ops.length) this.ctx.store.applyTransient(ops);
  }

  private commitScale(): void {
    const doOps: DocOp[] = [];
    const undoOps: DocOp[] = [];
    for (const [id, start] of this.startEntities) {
      const e = this.ctx.store.doc.entities.find((x) => x.id === id);
      if (!e || e.kind !== 'body' || e === start) continue;
      doOps.push({ op: 'replaceEntity', entity: e });
      undoOps.push({ op: 'replaceEntity', entity: start });
    }
    if (doOps.length === 0) return;
    this.ctx.store.apply({ label: 'Změna velikosti', do: doOps, undo: undoOps });
  }

  private revertScale(): void {
    const ops: DocOp[] = [];
    for (const start of this.startEntities.values()) {
      ops.push({ op: 'replaceEntity', entity: start satisfies Entity });
    }
    if (ops.length) this.ctx.store.applyTransient(ops);
  }

  private reset(): void {
    this.mode = 'idle';
    this.pid = -1;
    this.downHit = null;
    this.startKin.clear();
    this.startEntities.clear();
  }
}
