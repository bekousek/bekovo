/** Stavitelé Commandů — párují do-ops s inverzními undo-ops. */
import type { BodyState } from '@engine/core/SimModule';
import type { DocOp, TransformPatch, VelocityPatch } from '@engine/scene/ops';
import { entityIndex, type Entity, type SceneDoc } from '@engine/scene/schema';
import type { Vec2 } from '@engine/core/math';
import type { Command } from './DocumentStore';

export function cmdAddEntity(label: string, entity: Entity, index?: number): Command {
  return {
    label,
    do: [{ op: 'addEntity', entity, index }],
    undo: [{ op: 'removeEntity', id: entity.id }],
  };
}

/**
 * Smazání entit včetně kaskády kloubů, které na mazaná tělesa vedou.
 * Undo vrací entity na původní indexy (vzestupně, ať indexy sedí).
 */
export function cmdRemoveEntities(label: string, doc: SceneDoc, ids: readonly string[]): Command {
  const toRemove = new Set(ids);
  for (const e of doc.entities) {
    if (e.kind === 'joint' && ((e.bodyA && toRemove.has(e.bodyA)) || toRemove.has(e.bodyB))) {
      toRemove.add(e.id);
    }
  }
  const removed: Array<{ entity: Entity; index: number }> = [];
  doc.entities.forEach((e, index) => {
    if (toRemove.has(e.id)) removed.push({ entity: e, index });
  });

  return {
    label,
    // Klouby mazat dřív než tělesa (engine je tak nemusí odpojovat defenzivně).
    do: [...removed]
      .sort((a, b) => (a.entity.kind === 'joint' ? -1 : 1) - (b.entity.kind === 'joint' ? -1 : 1))
      .map(({ entity }) => ({ op: 'removeEntity' as const, id: entity.id })),
    undo: removed.map(({ entity, index }) => ({ op: 'addEntity' as const, entity, index })),
  };
}

export function cmdReplaceEntity(label: string, before: Entity, after: Entity): Command {
  return {
    label,
    do: [{ op: 'replaceEntity', entity: after }],
    undo: [{ op: 'replaceEntity', entity: before }],
  };
}

export interface KinematicsSnapshot {
  transform: TransformPatch;
  velocity: VelocityPatch;
}

export function kinematicsOf(doc: SceneDoc, id: string): KinematicsSnapshot | null {
  const e = doc.entities[entityIndex(doc, id)];
  if (!e || e.kind !== 'body') return null;
  return {
    transform: { ...e.transform },
    velocity: { ...e.velocity },
  };
}

export function cmdSetKinematics(
  label: string,
  id: string,
  before: KinematicsSnapshot,
  after: Partial<KinematicsSnapshot>,
): Command {
  return {
    label,
    do: [{ op: 'setKinematics', id, transform: after.transform, velocity: after.velocity }],
    undo: [
      {
        op: 'setKinematics',
        id,
        transform: after.transform ? before.transform : undefined,
        velocity: after.velocity ? before.velocity : undefined,
      },
    ],
  };
}

export function cmdSetWorld(
  label: string,
  before: { gravity?: Vec2; airDensity?: number },
  after: { gravity?: Vec2; airDensity?: number },
): Command {
  return {
    label,
    do: [{ op: 'setWorld', ...after }],
    undo: [{ op: 'setWorld', ...before }],
  };
}

export function cmdReplaceDoc(label: string, before: SceneDoc, after: SceneDoc): Command {
  return {
    label,
    do: [{ op: 'replaceDoc', doc: after }],
    undo: [{ op: 'replaceDoc', doc: before }],
  };
}

const EPS = 1e-7;

/**
 * Implicitní command „Simulace" — slije stavy těles z workeru (stateSync
 * při pauze) do dokumentu. Vrací null, pokud se nic znatelně nepohnulo.
 * Aplikovat s {send:false} — worker tento stav už má.
 */
export function cmdSimRan(doc: SceneDoc, states: readonly BodyState[]): Command | null {
  const doOps: DocOp[] = [];
  const undoOps: DocOp[] = [];

  for (const s of states) {
    const e = doc.entities[entityIndex(doc, s.id)];
    if (!e || e.kind !== 'body' || e.bodyType === 'static') continue;
    const moved =
      Math.abs(e.transform.x - s.x) > EPS ||
      Math.abs(e.transform.y - s.y) > EPS ||
      Math.abs(e.transform.angle - s.angle) > EPS ||
      Math.abs(e.velocity.vx - s.vx) > EPS ||
      Math.abs(e.velocity.vy - s.vy) > EPS ||
      Math.abs(e.velocity.omega - s.omega) > EPS;
    if (!moved) continue;

    doOps.push({
      op: 'setKinematics',
      id: s.id,
      transform: { x: s.x, y: s.y, angle: s.angle },
      velocity: { vx: s.vx, vy: s.vy, omega: s.omega },
    });
    undoOps.push({
      op: 'setKinematics',
      id: s.id,
      transform: { ...e.transform },
      velocity: { ...e.velocity },
    });
  }

  if (doOps.length === 0) return null;
  return { label: 'Simulace', do: doOps, undo: undoOps };
}
