/**
 * Inkrementální patche enginu: add/remove/replace/setKinematics + klouby.
 * Sémantika: za běhu replaceEntity zachovává kinematiku, v pauze bere doc.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { parseSceneDoc, type Body, type Entity, type SceneDoc } from '@engine/scene/schema';

function emptyScene(extra: unknown[] = []): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'patch-test' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: extra,
  });
}

const ballInput = (id: string, x = 0, y = 0) => ({
  kind: 'body' as const,
  id,
  transform: { x, y },
  shapes: [{ type: 'circle' as const, r: 0.2 }],
});

function ball(id: string, x = 0, y = 0): Body {
  const e = emptyScene([ballInput(id, x, y)]).entities[0]!;
  if (e.kind !== 'body') throw new Error('expected body');
  return e;
}

describe('engine applyPatch', () => {
  it('addEntity/removeEntity mění topologii a snapshot pořadí', async () => {
    const engine = await Engine.create(emptyScene([ballInput('a')]));
    expect(engine.bodyCount).toBe(1);

    const r1 = engine.applyPatch([{ op: 'addEntity', entity: ball('b', 1, 0) }], false);
    expect(r1.topologyChanged).toBe(true);
    expect(engine.bodyCount).toBe(2);
    expect([...engine.orderIds]).toEqual(['a', 'b']);

    // Vložení na začátek dokumentu → na začátek snapshot pořadí.
    const r2 = engine.applyPatch([{ op: 'addEntity', entity: ball('c'), index: 0 }], false);
    expect(r2.topologyChanged).toBe(true);
    expect([...engine.orderIds]).toEqual(['c', 'a', 'b']);

    const r3 = engine.applyPatch([{ op: 'removeEntity', id: 'a' }], false);
    expect(r3.topologyChanged).toBe(true);
    expect([...engine.orderIds]).toEqual(['c', 'b']);
    expect(engine.getBodyState('a')).toBeUndefined();

    engine.dispose();
  });

  it('replaceEntity za běhu zachová kinematiku, v pauze bere dokument', async () => {
    const engine = await Engine.create(emptyScene([ballInput('a', 0, 10)]));
    for (let i = 0; i < 60; i++) engine.tick(); // 0.5 s pádu
    const before = engine.getBodyState('a')!;
    expect(before.vy).toBeLessThan(-4);

    const heavy: Entity = { ...ball('a', 0, 10), material: { density: 5000, friction: 0.5, restitution: 0.3 } };

    // Za běhu (preserveKinematics=true): pozice i rychlost zůstávají.
    engine.applyPatch([{ op: 'replaceEntity', entity: heavy }], true);
    const after = engine.getBodyState('a')!;
    expect(after.y).toBeCloseTo(before.y, 5);
    expect(after.vy).toBeCloseTo(before.vy, 5);

    // V pauze (false): teleport na hodnoty z dokumentu.
    engine.applyPatch([{ op: 'replaceEntity', entity: heavy }], false);
    const reset = engine.getBodyState('a')!;
    expect(reset.y).toBeCloseTo(10, 6);
    expect(reset.vy).toBeCloseTo(0, 6);

    engine.dispose();
  });

  it('setKinematics nastavuje přesně (i za běhu)', async () => {
    const engine = await Engine.create(emptyScene([ballInput('a')]));
    engine.applyPatch(
      [
        {
          op: 'setKinematics',
          id: 'a',
          transform: { x: 2, y: 3, angle: 0.5 },
          velocity: { vx: -1, vy: 4, omega: 2 },
        },
      ],
      true,
    );
    const s = engine.getBodyState('a')!;
    expect(s.x).toBeCloseTo(2, 6);
    expect(s.y).toBeCloseTo(3, 6);
    expect(s.angle).toBeCloseTo(0.5, 6);
    expect(s.vx).toBeCloseTo(-1, 6);
    expect(s.vy).toBeCloseTo(4, 6);
    expect(s.omega).toBeCloseTo(2, 6);
    engine.dispose();
  });

  it('osa s motorem roztočí kolo k cílové rychlosti; fixace drží tělesa', async () => {
    const doc = emptyScene([
      ballInput('wheel', 0, 0),
      {
        kind: 'joint',
        id: 'j1',
        type: 'axle',
        bodyA: null,
        bodyB: 'wheel',
        anchorA: { x: 0, y: 0 },
        anchorB: { x: 0, y: 0 },
        axle: { enabled: true, targetVelocity: 5, maxTorque: 100 },
      },
    ]);
    const engine = await Engine.create(doc);
    for (let i = 0; i < 240; i++) engine.tick(); // 2 s
    const wheel = engine.getBodyState('wheel')!;
    expect(Math.abs(wheel.omega - 5)).toBeLessThan(0.1);
    // Osa drží kolo na místě i v gravitaci.
    expect(Math.hypot(wheel.x, wheel.y)).toBeLessThan(0.01);
    engine.dispose();

    // Fixace: dvě tělesa padají jako jeden celek, vzájemná poloha konstantní.
    const weldDoc = emptyScene([
      ballInput('p', 0, 5),
      ballInput('q', 0.5, 5),
      {
        kind: 'joint',
        id: 'w1',
        type: 'fixed',
        bodyA: 'p',
        bodyB: 'q',
        anchorA: { x: 0.25, y: 0 },
        anchorB: { x: -0.25, y: 0 },
      },
    ]);
    const e2 = await Engine.create(weldDoc);
    for (let i = 0; i < 120; i++) e2.tick();
    const p = e2.getBodyState('p')!;
    const q = e2.getBodyState('q')!;
    expect(Math.hypot(q.x - p.x, q.y - p.y)).toBeCloseTo(0.5, 3);
    expect(p.y).toBeLessThan(1); // opravdu padají
    e2.dispose();
  });

  it('patche jsou deterministické (dva běhy se stejnou sekvencí)', async () => {
    const run = async () => {
      const engine = await Engine.create(emptyScene([ballInput('a', 0, 5)]));
      for (let i = 0; i < 30; i++) engine.tick();
      engine.applyPatch([{ op: 'addEntity', entity: ball('b', 0.1, 8) }], true);
      for (let i = 0; i < 30; i++) engine.tick();
      engine.applyPatch(
        [{ op: 'setKinematics', id: 'a', velocity: { vx: 1, vy: 0, omega: 0 } }],
        true,
      );
      for (let i = 0; i < 120; i++) engine.tick();
      const out = Array.from(engine.stateArray());
      engine.dispose();
      return out;
    };
    expect(await run()).toEqual(await run());
  });
});
