/**
 * Přesnostní test recorderu — vzorky volného pádu a SHM sedí na analytiku.
 *
 * Volný pád: vzorky y polohy ≈ -½gt² s tolerancí 2 % (diskrétní integrátor).
 * SHM: maximální zaznamenaná rychlost ≈ A·ω s tolerancí 2 %. Používáme pomalý
 * oscilátor (T ≈ 6,28 s), aby 10 Hz vzorkování stihlo zachytit maximum.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { RECORD_EVERY } from '@engine/instruments/Recorder';
import { makeScene } from './helpers';

const G = 9.81;
const TICK_HZ = 120;

describe('recorder — datová cesta', () => {
  it('počet vzorků odpovídá ~10 Hz decimaci', async () => {
    const engine = await Engine.create(
      makeScene('rec-count', [
        { kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] },
      ]),
    );
    engine.setRecordBodyId('ball');
    const ticks = 120; // 1 s
    for (let i = 0; i < ticks; i++) engine.tick();
    const samples = engine.drainPlotSamples();
    // Vzorky při tickIndex 0, 12, 24, ... → 10 vzorků za 120 tiků
    expect(samples.length).toBe(Math.floor(ticks / RECORD_EVERY));
    engine.dispose();
  });

  it('žádné vzorky bez setRecordBodyId', async () => {
    const engine = await Engine.create(
      makeScene('rec-off', [
        { kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] },
      ]),
    );
    for (let i = 0; i < 120; i++) engine.tick();
    const samples = engine.drainPlotSamples();
    expect(samples.length).toBe(0);
    engine.dispose();
  });

  it('y-poloha volného pádu sedí na ½gt² s tolerancí 2 %', async () => {
    const engine = await Engine.create(
      makeScene(
        'rec-freefall',
        [{ kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] }],
        { gravity: { x: 0, y: -G }, tickHz: TICK_HZ },
      ),
    );
    engine.setRecordBodyId('ball');
    for (let i = 0; i < TICK_HZ; i++) engine.tick(); // 1 sekunda
    const samples = engine.drainPlotSamples();

    expect(samples.length).toBeGreaterThan(0);
    // Přeskočit první vzorek (t ≈ dt, chyba je malá ale relativní je velká)
    for (const s of samples.slice(1)) {
      const analytical = -0.5 * G * s.t * s.t;
      const relErr = Math.abs((s.y - analytical) / analytical);
      expect(relErr).toBeLessThan(0.02);
    }
    engine.dispose();
  });

  it('rychlost vzorků volného pádu sedí na gt s tolerancí 2 %', async () => {
    const engine = await Engine.create(
      makeScene(
        'rec-freefall-v',
        [{ kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] }],
        { gravity: { x: 0, y: -G }, tickHz: TICK_HZ },
      ),
    );
    engine.setRecordBodyId('ball');
    for (let i = 0; i < TICK_HZ; i++) engine.tick();
    const samples = engine.drainPlotSamples();

    for (const s of samples.slice(1)) {
      const analytical = G * s.t; // |vy| = g·t, vx = 0 → speed = g·t
      const relErr = Math.abs((s.speed - analytical) / analytical);
      expect(relErr).toBeLessThan(0.02);
    }
    engine.dispose();
  });

  it('max rychlost SHM sedí na A·ω s tolerancí 2 %', async () => {
    // Pomalý oscilátor: ω = 1 rad/s, T ≈ 6,28 s → 10 Hz vzorkování zachytí max velmi přesně
    const r = 0.1;
    const omega = 1; // rad/s
    const m = 1; // kg
    const k = m * omega * omega; // k = 1 N/m
    const A = 0.5; // amplituda [m]
    const vMax = A * omega; // 0,5 m/s

    const engine = await Engine.create(
      makeScene(
        'rec-shm',
        [
          {
            kind: 'body',
            id: 'bob',
            transform: { x: 1 + A, y: 0 }, // natažená pružina o A
            shapes: [{ type: 'circle', r }],
            material: { density: m / (Math.PI * r * r), friction: 0, restitution: 0 },
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
        { gravity: { x: 0, y: 0 } },
      ),
    );

    engine.setRecordBodyId('bob');
    // 1,5 periody = 1,5 × 6,28 ≈ 9,4 s → jistě projde přes maximum
    const ticks = Math.ceil(1.5 * 2 * Math.PI * TICK_HZ); // ≈ 1131 tiků
    for (let i = 0; i < ticks; i++) engine.tick();
    const samples = engine.drainPlotSamples();

    expect(samples.length).toBeGreaterThan(50);
    const maxSpeed = Math.max(...samples.map((s) => s.speed));
    expect(Math.abs(maxSpeed - vMax) / vMax).toBeLessThan(0.02);
    engine.dispose();
  });

  it('buffer se nuluje při načtení scény (build)', async () => {
    const scene = makeScene('rec-reset', [
      { kind: 'body', id: 'ball', transform: { x: 0, y: 0 }, shapes: [{ type: 'circle', r: 0.1 }] },
    ]);
    const engine = await Engine.create(scene);
    engine.setRecordBodyId('ball');
    for (let i = 0; i < 120; i++) engine.tick();
    // Reload scény — buffer i targetBodyId se mají vymazat
    engine.load(scene);
    const samples = engine.drainPlotSamples();
    expect(samples.length).toBe(0);
    engine.dispose();
  });
});
