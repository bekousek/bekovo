/**
 * Přesnostní test silového diagramu (F2-D). Ověřuje, že RigidModule
 * reportuje fyzikálně správné složky sil pro vybrané těleso:
 * - tíhová síla = m·g (vždy, i v klidu),
 * - vztlak míří vzhůru a sedí na ρ·A·g,
 * - síla pružiny se objeví u zavěšeného tělesa,
 * - bez setFbdBodyId nepřijde žádný vzorek.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { FBD_EVERY } from '@engine/rigid/fbd';
import { makeScene } from './helpers';

const G = 9.81;
const TICK_HZ = 120;

/** Hustota kruhu o poloměru r, aby měl hmotnost m [kg/m²]. */
function densityFor(m: number, r: number): number {
  return m / (Math.PI * r * r);
}

describe('FBD — silový diagram', () => {
  it('bez setFbdBodyId nepřijde žádný vzorek', async () => {
    const engine = await Engine.create(
      makeScene('fbd-off', [
        { kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] },
      ]),
    );
    for (let i = 0; i < 24; i++) engine.tick();
    expect(engine.drainFbdSample()).toBeNull();
    engine.dispose();
  });

  it('tíhová síla = m·g, ve vakuu jediná složka', async () => {
    const r = 0.1;
    const m = 2;
    const engine = await Engine.create(
      makeScene(
        'fbd-gravity',
        [
          {
            kind: 'body',
            id: 'ball',
            transform: { x: 0, y: 5 },
            shapes: [{ type: 'circle', r }],
            material: { density: densityFor(m, r), friction: 0, restitution: 0 },
          },
        ],
        { gravity: { x: 0, y: -G }, airDensity: 0, tickHz: TICK_HZ },
      ),
    );
    engine.setFbdBodyId('ball');
    for (let i = 0; i <= FBD_EVERY; i++) engine.tick();
    const sample = engine.drainFbdSample();

    expect(sample).not.toBeNull();
    expect(sample!.bodyId).toBe('ball');
    // Ve vakuu bez pružin: jen gravitace.
    expect(sample!.forces).toHaveLength(1);
    const grav = sample!.forces[0]!;
    expect(grav.kind).toBe('gravity');
    expect(grav.fx).toBeCloseTo(0, 6);
    expect(grav.fy).toBeCloseTo(-m * G, 4); // míří dolů
    engine.dispose();
  });

  it('vztlak míří vzhůru a sedí na ρ·A·g', async () => {
    const r = 0.1;
    const m = 1;
    const rho = 1.2;
    const area = Math.PI * r * r;
    const engine = await Engine.create(
      makeScene(
        'fbd-buoyancy',
        [
          {
            kind: 'body',
            id: 'ball',
            transform: { x: 0, y: 5 },
            shapes: [{ type: 'circle', r }],
            material: { density: densityFor(m, r), friction: 0, restitution: 0 },
          },
        ],
        { gravity: { x: 0, y: -G }, airDensity: rho, tickHz: TICK_HZ },
      ),
    );
    engine.setFbdBodyId('ball');
    for (let i = 0; i <= FBD_EVERY; i++) engine.tick();
    const sample = engine.drainFbdSample()!;

    const buoy = sample.forces.find((f) => f.kind === 'buoyancy');
    expect(buoy).toBeDefined();
    expect(buoy!.fy).toBeGreaterThan(0); // vzhůru, proti gravitaci
    expect(buoy!.fy).toBeCloseTo(rho * area * G, 4);
    // Gravitace tu je taky.
    expect(sample.forces.some((f) => f.kind === 'gravity')).toBe(true);
    engine.dispose();
  });

  it('síla pružiny se reportuje u zavěšeného tělesa', async () => {
    const r = 0.1;
    const m = 1;
    const k = 50;
    const A = 0.3;
    const engine = await Engine.create(
      makeScene(
        'fbd-spring',
        [
          {
            kind: 'body',
            id: 'bob',
            transform: { x: 1 + A, y: 0 }, // natažená pružina o A
            shapes: [{ type: 'circle', r }],
            material: { density: densityFor(m, r), friction: 0, restitution: 0 },
          },
          {
            kind: 'joint',
            id: 'spring',
            type: 'spring',
            bodyA: null,
            bodyB: 'bob',
            anchorA: { x: 0, y: 0 },
            anchorB: { x: 0, y: 0 },
            spring: { restLength: 1, stiffness: k, damping: 0 },
          },
        ],
        { gravity: { x: 0, y: 0 }, airDensity: 0, tickHz: TICK_HZ },
      ),
    );
    engine.setFbdBodyId('bob');
    engine.tick(); // tickIndex 0 → vzorek
    const sample = engine.drainFbdSample()!;

    const spring = sample.forces.find((f) => f.kind === 'spring');
    expect(spring).toBeDefined();
    // Pružina natažená o A táhne těleso zpět k ukotvení (záporné x).
    expect(spring!.fx).toBeLessThan(0);
    expect(Math.abs(spring!.fx)).toBeCloseTo(k * A, 1);
    engine.dispose();
  });

  it('cíl se nuluje při načtení scény', async () => {
    const scene = makeScene('fbd-reset', [
      { kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] },
    ]);
    const engine = await Engine.create(scene);
    engine.setFbdBodyId('ball');
    engine.load(scene); // build → dispose vynuluje fbdBodyId
    for (let i = 0; i <= FBD_EVERY; i++) engine.tick();
    expect(engine.drainFbdSample()).toBeNull();
    engine.dispose();
  });
});
