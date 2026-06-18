/**
 * DocOp — atomické operace nad dokumentem scény.
 *
 * Jeden čistý reducer (`applyOpsToDoc`) sdílí editor (main thread)
 * i engine (worker), takže oba drží bit-přesně stejný dokument.
 *
 * Sémantika za běhu simulace: `replaceEntity` zachovává runtime kinematiku
 * tělesa (změna materiálu nesmí teleportovat); `setKinematics` ji naopak
 * explicitně nastavuje (přesné rychlosti, move nástroj v pauze).
 */
import type { SceneDoc, Entity } from './schema';
import type { Vec2 } from '../core/math';

export interface TransformPatch {
  x: number;
  y: number;
  angle: number;
}

export interface VelocityPatch {
  vx: number;
  vy: number;
  omega: number;
}

export type DocOp =
  | { op: 'addEntity'; entity: Entity; index?: number }
  | { op: 'removeEntity'; id: string }
  | { op: 'replaceEntity'; entity: Entity }
  | { op: 'setKinematics'; id: string; transform?: TransformPatch; velocity?: VelocityPatch }
  | { op: 'setWorld'; gravity?: Vec2; airDensity?: number }
  | { op: 'replaceDoc'; doc: SceneDoc };

function applyOne(doc: SceneDoc, op: DocOp): SceneDoc {
  switch (op.op) {
    case 'addEntity': {
      const entities = [...doc.entities];
      const index = op.index === undefined ? entities.length : op.index;
      entities.splice(Math.max(0, Math.min(index, entities.length)), 0, op.entity);
      return { ...doc, entities };
    }
    case 'removeEntity': {
      const idx = doc.entities.findIndex((e) => e.id === op.id);
      if (idx < 0) return doc;
      const entities = [...doc.entities];
      entities.splice(idx, 1);
      return { ...doc, entities };
    }
    case 'replaceEntity': {
      const idx = doc.entities.findIndex((e) => e.id === op.entity.id);
      if (idx < 0) return doc;
      const entities = [...doc.entities];
      entities[idx] = op.entity;
      return { ...doc, entities };
    }
    case 'setKinematics': {
      const idx = doc.entities.findIndex((e) => e.id === op.id);
      const prev = doc.entities[idx];
      if (!prev || prev.kind !== 'body') return doc;
      const entities = [...doc.entities];
      entities[idx] = {
        ...prev,
        transform: op.transform ? { ...op.transform } : prev.transform,
        velocity: op.velocity ? { ...op.velocity } : prev.velocity,
      };
      return { ...doc, entities };
    }
    case 'setWorld': {
      return {
        ...doc,
        world: {
          ...doc.world,
          ...(op.gravity !== undefined ? { gravity: { ...op.gravity } } : {}),
          ...(op.airDensity !== undefined ? { airDensity: op.airDensity } : {}),
        },
      };
    }
    case 'replaceDoc':
      return op.doc;
  }
}

export function applyOpsToDoc(doc: SceneDoc, ops: readonly DocOp[]): SceneDoc {
  let cur = doc;
  for (const op of ops) cur = applyOne(cur, op);
  return cur;
}

/** Obsahuje dávka operaci měnící množinu těles (→ nutný nový idTable)? */
export function opsChangeTopology(doc: SceneDoc, ops: readonly DocOp[]): boolean {
  for (const op of ops) {
    if (op.op === 'replaceDoc') return true;
    if (op.op === 'addEntity' && op.entity.kind === 'body') return true;
    if (op.op === 'removeEntity') {
      const e = doc.entities.find((x) => x.id === op.id);
      if (!e || e.kind === 'body') return true;
    }
  }
  return false;
}
