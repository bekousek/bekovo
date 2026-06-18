/**
 * Editor schránka: kopírovat / vložit (s přemapováním id) / zrcadlit.
 * Klouby se berou jen tehdy, když jsou oba konce uvnitř výběru
 * (nebo kotvené ke světu).
 */
import { wrapAngle, type Vec2 } from '@engine/core/math';
import type { DocOp } from '@engine/scene/ops';
import type { Body, Entity, Joint, SceneDoc, Shape } from '@engine/scene/schema';
import type { Command, DocumentStore } from './DocumentStore';
import type { EditorState } from './editorState';
import { newEntityId } from './newId';

function deepClone<T>(v: T): T {
  return structuredClone(v);
}

/** Entity výběru: tělesa + klouby s oběma konci uvnitř (bodyA může být svět). */
function collectSelection(doc: SceneDoc, ids: ReadonlySet<string>): Entity[] {
  const out: Entity[] = [];
  for (const e of doc.entities) {
    if (e.kind === 'body' && ids.has(e.id)) out.push(e);
    if (
      e.kind === 'joint' &&
      ids.has(e.bodyB) &&
      (e.bodyA === null || ids.has(e.bodyA))
    ) {
      out.push(e);
    }
  }
  return out;
}

function mirrorShape(shape: Shape): Shape {
  switch (shape.type) {
    case 'circle':
      return { ...shape, offset: { x: -shape.offset.x, y: shape.offset.y } };
    case 'box':
      return {
        ...shape,
        offset: { x: -shape.offset.x, y: shape.offset.y },
        angle: -shape.angle,
      };
    case 'polygon': {
      // Zrcadlení obrací orientaci → otočit pořadí, ať zůstane CCW.
      const pts = shape.points.map((p) => ({ x: -p.x, y: p.y })).reverse();
      return { ...shape, points: pts };
    }
    case 'plane':
      return shape;
  }
}

export class EditorClipboard {
  private payload: Entity[] = [];

  get isEmpty(): boolean {
    return this.payload.length === 0;
  }

  copy(doc: SceneDoc, selection: ReadonlySet<string>): boolean {
    const entities = collectSelection(doc, selection);
    if (entities.length === 0) return false;
    this.payload = deepClone(entities);
    return true;
  }

  /** Vloží obsah schránky s novými id, posunuté o offset; vybere vložené. */
  paste(store: DocumentStore, state: EditorState, offset: Vec2): void {
    if (this.payload.length === 0) return;

    const idMap = new Map<string, string>();
    const doc = store.doc;
    const used = new Set(doc.entities.map((e) => e.id));
    const claim = (prefix: string): string => {
      let n = 1;
      let id = `${prefix}${n}`;
      while (used.has(id)) id = `${prefix}${++n}`;
      used.add(id);
      return id;
    };

    const clones: Entity[] = [];
    for (const src of this.payload) {
      if (src.kind !== 'body') continue;
      const id = claim('b');
      idMap.set(src.id, id);
      const body = deepClone(src);
      body.id = id;
      body.transform = {
        ...body.transform,
        x: body.transform.x + offset.x,
        y: body.transform.y + offset.y,
      };
      clones.push(body);
    }
    for (const src of this.payload) {
      if (src.kind !== 'joint') continue;
      const joint = deepClone(src);
      joint.id = claim('j');
      joint.bodyB = idMap.get(src.bodyB) ?? src.bodyB;
      joint.bodyA = src.bodyA === null ? null : (idMap.get(src.bodyA) ?? src.bodyA);
      if (joint.bodyA === null) {
        // Světová kotva je ve světových souřadnicích → posunout s tělesy.
        joint.anchorA = { x: joint.anchorA.x + offset.x, y: joint.anchorA.y + offset.y };
      }
      clones.push(joint);
    }
    if (clones.length === 0) return;

    const cmd: Command = {
      label: 'Vložit',
      do: clones.map((entity) => ({ op: 'addEntity' as const, entity })),
      undo: [...clones].reverse().map((entity) => ({ op: 'removeEntity' as const, id: entity.id })),
    };
    store.apply(cmd);
    state.setSelection(clones.filter((e) => e.kind === 'body').map((e) => e.id));
  }

  /** Zrcadlí výběr vodorovně kolem středu výběru. Undoable. */
  static mirror(store: DocumentStore, state: EditorState): void {
    const doc = store.doc;
    const bodies: Body[] = [];
    for (const id of state.selection) {
      const e = doc.entities.find((x) => x.id === id);
      if (e && e.kind === 'body') bodies.push(e);
    }
    if (bodies.length === 0) return;

    const cx =
      bodies.reduce((acc, b) => acc + b.transform.x, 0) / bodies.length;

    const doOps: DocOp[] = [];
    const undoOps: DocOp[] = [];

    for (const b of bodies) {
      const mirrored: Body = {
        ...b,
        transform: {
          x: 2 * cx - b.transform.x,
          y: b.transform.y,
          angle: wrapAngle(-b.transform.angle),
        },
        velocity: { vx: -b.velocity.vx, vy: b.velocity.vy, omega: -b.velocity.omega },
        shapes: b.shapes.map(mirrorShape),
      };
      doOps.push({ op: 'replaceEntity', entity: mirrored });
      undoOps.push({ op: 'replaceEntity', entity: b });
    }

    // Klouby plně uvnitř výběru: lokální kotvy zrcadlit s tělesy.
    for (const e of doc.entities) {
      if (e.kind !== 'joint') continue;
      const insideB = state.selection.has(e.bodyB);
      const insideA = e.bodyA === null || state.selection.has(e.bodyA);
      if (!insideB || !insideA) continue;
      const j: Joint = deepClone(e);
      j.anchorB = { x: -j.anchorB.x, y: j.anchorB.y };
      j.anchorA =
        j.bodyA === null
          ? { x: 2 * cx - j.anchorA.x, y: j.anchorA.y }
          : { x: -j.anchorA.x, y: j.anchorA.y };
      doOps.push({ op: 'replaceEntity', entity: j });
      undoOps.push({ op: 'replaceEntity', entity: e });
    }

    store.apply({ label: 'Zrcadlit', do: doOps, undo: undoOps });
  }
}

export function defaultPasteOffset(pxToWorld: (px: number) => number): Vec2 {
  return { x: pxToWorld(24), y: -pxToWorld(24) };
}

export { newEntityId };
