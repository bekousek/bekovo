/** DocumentStore: undo/redo, transientní změny, fold „Simulace". */
import { describe, expect, it } from 'vitest';
import { demoScene } from '@engine/scene/defaults';
import type { DocOp } from '@engine/scene/ops';
import { DocumentStore } from '@editor/DocumentStore';
import { cmdAddEntity, cmdRemoveEntities, cmdSimRan, kinematicsOf } from '@editor/commands';
import { parseSceneDoc, type Entity } from '@engine/scene/schema';

const ball = (id: string): Entity =>
  parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 't' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      { kind: 'body', id, transform: { x: 0, y: 5 }, shapes: [{ type: 'circle', r: 0.1 }] },
    ],
  }).entities[0]!;

describe('DocumentStore', () => {
  it('apply → undo → redo, patche jdou ven v správném pořadí', () => {
    const store = new DocumentStore(demoScene());
    const sent: DocOp[][] = [];
    store.onPatch = (ops) => sent.push(ops);

    store.apply(cmdAddEntity('Přidat míč', ball('n1')));
    expect(store.doc.entities.find((e) => e.id === 'n1')).toBeDefined();
    expect(store.canUndo).toBe(true);
    expect(sent.length).toBe(1);
    expect(sent[0]![0]!.op).toBe('addEntity');

    store.undo();
    expect(store.doc.entities.find((e) => e.id === 'n1')).toBeUndefined();
    expect(store.canRedo).toBe(true);
    expect(sent[1]![0]!.op).toBe('removeEntity');

    store.redo();
    expect(store.doc.entities.find((e) => e.id === 'n1')).toBeDefined();
    expect(store.canRedo).toBe(false);
  });

  it('fold „Simulace" se aplikuje bez odeslání patche a jde vrátit', () => {
    const store = new DocumentStore(demoScene());
    const sent: DocOp[][] = [];
    store.onPatch = (ops) => sent.push(ops);

    const before = kinematicsOf(store.doc, 'ball-1')!;
    const cmd = cmdSimRan(store.doc, [
      { id: 'ball-1', x: 1, y: 0.3, angle: 2, vx: 0.5, vy: 0, omega: 1 },
    ]);
    expect(cmd).not.toBeNull();
    store.apply(cmd!, { send: false });
    expect(sent.length).toBe(0); // worker tento stav už má

    const folded = store.doc.entities.find((e) => e.id === 'ball-1')!;
    if (folded.kind !== 'body') throw new Error('expected body');
    expect(folded.transform.x).toBeCloseTo(1);

    store.undo(); // návrat před simulaci UŽ patch poslat musí
    expect(sent.length).toBe(1);
    const back = store.doc.entities.find((e) => e.id === 'ball-1')!;
    if (back.kind !== 'body') throw new Error('expected body');
    expect(back.transform.x).toBeCloseTo(before.transform.x);
  });

  it('cmdSimRan vrací null, když se nic nepohnulo', () => {
    const doc = demoScene();
    const b = doc.entities.find((e) => e.id === 'ball-1')!;
    if (b.kind !== 'body') throw new Error('expected body');
    const cmd = cmdSimRan(doc, [
      {
        id: 'ball-1',
        x: b.transform.x,
        y: b.transform.y,
        angle: b.transform.angle,
        vx: 0,
        vy: 0,
        omega: 0,
      },
    ]);
    expect(cmd).toBeNull();
  });

  it('kaskáda mazání: kloub vedoucí na mazané těleso jde s ním (a undo vrátí oba)', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 't2' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        { kind: 'body', id: 'a', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.2 }] },
        { kind: 'body', id: 'b', transform: { x: 1, y: 0 }, shapes: [{ type: 'circle', r: 0.2 }] },
        {
          kind: 'joint',
          id: 'j',
          type: 'axle',
          bodyA: 'a',
          bodyB: 'b',
          anchorA: { x: 0.5, y: 0 },
          anchorB: { x: -0.5, y: 0 },
        },
      ],
    });
    const store = new DocumentStore(doc);
    store.apply(cmdRemoveEntities('Smazat', store.doc, ['a']));
    expect(store.doc.entities.map((e) => e.id)).toEqual(['b']);

    store.undo();
    expect(store.doc.entities.map((e) => e.id).sort()).toEqual(['a', 'b', 'j']);
    // Pořadí v poli zachováno (kloub za tělesy).
    expect(store.doc.entities[2]!.id).toBe('j');
  });

  it('transientní změny nejdou do historie', () => {
    const store = new DocumentStore(demoScene());
    store.applyTransient([
      { op: 'setKinematics', id: 'ball-1', transform: { x: 9, y: 9, angle: 0 } },
    ]);
    expect(store.canUndo).toBe(false);
    const b = store.doc.entities.find((e) => e.id === 'ball-1')!;
    if (b.kind !== 'body') throw new Error('expected body');
    expect(b.transform.x).toBe(9);
  });
});
