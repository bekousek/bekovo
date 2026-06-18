/** Čistý reducer DocOps — sdílený editorem i enginem. */
import { describe, expect, it } from 'vitest';
import { demoScene } from '@engine/scene/defaults';
import { applyOpsToDoc, opsChangeTopology } from '@engine/scene/ops';
import { parseSceneDoc, type Entity } from '@engine/scene/schema';

const newBall = (id: string): Entity =>
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

describe('applyOpsToDoc', () => {
  it('addEntity přidá na konec i na index', () => {
    const doc = demoScene();
    const a = applyOpsToDoc(doc, [{ op: 'addEntity', entity: newBall('x1') }]);
    expect(a.entities.at(-1)!.id).toBe('x1');

    const b = applyOpsToDoc(doc, [{ op: 'addEntity', entity: newBall('x2'), index: 0 }]);
    expect(b.entities[0]!.id).toBe('x2');
    // Původní dokument nedotčen (imutabilita).
    expect(doc.entities.find((e) => e.id === 'x1')).toBeUndefined();
    expect(doc.entities.find((e) => e.id === 'x2')).toBeUndefined();
  });

  it('removeEntity / replaceEntity / setKinematics', () => {
    const doc = demoScene();
    const removed = applyOpsToDoc(doc, [{ op: 'removeEntity', id: 'ball-1' }]);
    expect(removed.entities.find((e) => e.id === 'ball-1')).toBeUndefined();
    expect(removed.entities.length).toBe(doc.entities.length - 1);

    const ball = doc.entities.find((e) => e.id === 'ball-1')!;
    if (ball.kind !== 'body') throw new Error('expected body');
    const recolored = { ...ball, appearance: { ...ball.appearance, fill: '#ff0000' } };
    const replaced = applyOpsToDoc(doc, [{ op: 'replaceEntity', entity: recolored }]);
    const got = replaced.entities.find((e) => e.id === 'ball-1')!;
    expect(got.kind === 'body' && got.appearance.fill).toBe('#ff0000');

    const moved = applyOpsToDoc(doc, [
      {
        op: 'setKinematics',
        id: 'ball-1',
        transform: { x: 7, y: 8, angle: 1 },
        velocity: { vx: 1, vy: 2, omega: 3 },
      },
    ]);
    const m = moved.entities.find((e) => e.id === 'ball-1')!;
    if (m.kind !== 'body') throw new Error('expected body');
    expect(m.transform).toEqual({ x: 7, y: 8, angle: 1 });
    expect(m.velocity).toEqual({ vx: 1, vy: 2, omega: 3 });
    // Shapes sdílí referenci — geometrie se nezměnila (render to využívá).
    expect(m.shapes).toBe(ball.shapes);
  });

  it('setWorld a replaceDoc', () => {
    const doc = demoScene();
    const g = applyOpsToDoc(doc, [{ op: 'setWorld', gravity: { x: 0, y: -1.62 } }]);
    expect(g.world.gravity.y).toBeCloseTo(-1.62);
    expect(g.world.airDensity).toBe(doc.world.airDensity);

    const other = demoScene();
    const r = applyOpsToDoc(doc, [{ op: 'replaceDoc', doc: other }]);
    expect(r).toBe(other);
  });

  it('opsChangeTopology rozliší tělesa od kloubů', () => {
    const doc = demoScene();
    expect(opsChangeTopology(doc, [{ op: 'addEntity', entity: newBall('n') }])).toBe(true);
    expect(opsChangeTopology(doc, [{ op: 'removeEntity', id: 'ball-1' }])).toBe(true);
    expect(
      opsChangeTopology(doc, [
        { op: 'setKinematics', id: 'ball-1', transform: { x: 0, y: 0, angle: 0 } },
      ]),
    ).toBe(false);
  });
});
