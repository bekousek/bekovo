/** Rychlé akce: zmrazit/uvolnit a duplikace výběru. */
import { describe, expect, it } from 'vitest';
import { parseSceneDoc, type Body, type Joint, type SceneDoc } from '@engine/scene/schema';
import { DocumentStore } from '@editor/DocumentStore';
import { EditorState } from '@editor/editorState';
import { cmdToggleFrozen, duplicateSelection } from '@editor/quickActions';

function scene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'qa-test' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
      },
      {
        kind: 'body',
        id: 'a',
        transform: { x: 0, y: 1 },
        velocity: { vx: 1, vy: 0, omega: 2 },
        shapes: [{ type: 'circle', r: 0.2 }],
      },
      {
        kind: 'body',
        id: 'b',
        bodyType: 'static',
        transform: { x: 1, y: 1 },
        shapes: [{ type: 'box', hw: 0.2, hh: 0.2 }],
      },
      {
        kind: 'joint',
        id: 'j1',
        type: 'axle',
        bodyA: null,
        bodyB: 'a',
        anchorA: { x: 0, y: 1 },
        anchorB: { x: 0, y: 0 },
      },
    ],
  });
}

const bodyOf = (store: DocumentStore, id: string): Body => {
  const e = store.doc.entities.find((x) => x.id === id);
  if (!e || e.kind !== 'body') throw new Error(`body ${id} missing`);
  return e;
};

describe('cmdToggleFrozen', () => {
  it('směs → zmrazit vše dynamické (a vynulovat rychlost); samé statické → uvolnit', () => {
    const store = new DocumentStore(scene());

    // a (dynamic) + b (static) → zmrazí se jen a.
    store.apply(cmdToggleFrozen(store.doc, new Set(['a', 'b']))!);
    expect(bodyOf(store, 'a').bodyType).toBe('static');
    expect(bodyOf(store, 'a').velocity).toEqual({ vx: 0, vy: 0, omega: 0 });
    expect(bodyOf(store, 'b').bodyType).toBe('static');

    // Teď jsou obě statické → uvolnit obě.
    store.apply(cmdToggleFrozen(store.doc, new Set(['a', 'b']))!);
    expect(bodyOf(store, 'a').bodyType).toBe('dynamic');
    expect(bodyOf(store, 'b').bodyType).toBe('dynamic');

    // Undo vrací b na static a a na static, další undo původní stav.
    store.undo();
    expect(bodyOf(store, 'a').bodyType).toBe('static');
    store.undo();
    expect(bodyOf(store, 'a').bodyType).toBe('dynamic');
    expect(bodyOf(store, 'a').velocity.vx).toBeCloseTo(1, 10);
  });

  it('roviny ignoruje; výběr jen s rovinou → žádný command', () => {
    const store = new DocumentStore(scene());
    expect(cmdToggleFrozen(store.doc, new Set(['ground']))).toBeNull();
  });
});

describe('duplicateSelection', () => {
  it('zduplikuje tělesa i vnitřní klouby s novými id a posunem, vybere kopie', () => {
    const store = new DocumentStore(scene());
    const state = new EditorState();
    state.setSelection(['a']);

    duplicateSelection(store, state, { x: 0.5, y: 0.5 });

    const bodies = store.doc.entities.filter((e) => e.kind === 'body');
    const joints = store.doc.entities.filter((e): e is Joint => e.kind === 'joint');
    expect(bodies).toHaveLength(4); // ground, a, b + kopie a
    expect(joints).toHaveLength(2); // j1 + kopie (kotvená ke světu, posunutá)

    const copyId = [...state.selection][0]!;
    expect(copyId).not.toBe('a');
    const copy = bodyOf(store, copyId);
    expect(copy.transform.x).toBeCloseTo(0.5, 10);
    expect(copy.transform.y).toBeCloseTo(1.5, 10);

    const jCopy = joints.find((j) => j.bodyB === copyId)!;
    expect(jCopy.anchorA.x).toBeCloseTo(0.5, 10); // světová kotva jede s tělesem
    expect(jCopy.anchorA.y).toBeCloseTo(1.5, 10);

    // Jedno undo („Vložit") vrátí scénu beze změn.
    store.undo();
    expect(store.doc.entities).toHaveLength(4);
  });
});
