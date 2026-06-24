/**
 * Tryska (F2-F): těleso zrychlí o F/m za 0,5 s.
 *
 * Scénario A: beztíže, 1 kg box, tryska fy=10 N (lokální osa y = světová osa y,
 * angle=0). Po 0,5 s → vy = 10·0,5 = 5 m/s (±1 %).
 *
 * Scénario B: totéž těleso natočené o 90° (π/2 rad). Lokální oy → světová ox.
 * Po 0,5 s → vx = 5 m/s, vy ≈ 0 (±1 %).
 *
 * Scénario C: tryska neaktivní (enabled=false) → těleso zůstane v klidu.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { makeScene, sampleRun } from './helpers';

const TICKS_05S = 0.5 * 120; // 60 tiků

describe('tryska (thruster joint)', () => {
  it('A: zrychlí těleso ve směru lokální osy y (angle=0) o F/m·t', async () => {
    const engine = await Engine.create(
      makeScene(
        'thruster-a',
        [
          {
            kind: 'body',
            id: 'box',
            transform: { x: 0, y: 2, angle: 0 },
            shapes: [{ type: 'box', hw: 0.3, hh: 0.3 }],
            material: { density: 1000, friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'thr',
            type: 'thruster',
            bodyA: null,
            bodyB: 'box',
            anchorA: { x: 0, y: 0 },
            anchorB: { x: 0, y: 0 },
            thruster: { enabled: true, fx: 0, fy: 10 },
          },
        ],
        // Beztíže — čistý thruster vliv.
        { gravity: { x: 0, y: 0 } },
      ),
    );

    const samples = sampleRun(engine, 'box', TICKS_05S);
    const last = samples[samples.length - 1]!;
    // m = density * plocha = 1000 * (0.6*0.6) = 360 kg; F=10 N → a=10/360 m/s²
    // Hmotnost přes Rapier — stačí ověřit, že vy = fy / m * t.
    const m = 1000 * 0.6 * 0.6; // kg (plocha x hustota)
    const expected = (10 / m) * 0.5;
    expect(Math.abs(last.vy - expected) / expected).toBeLessThan(0.01);
    expect(Math.abs(last.vx)).toBeLessThan(0.001);
    engine.dispose();
  });

  it('B: síla se rotuje s tělesem (natočení 90°)', async () => {
    const engine = await Engine.create(
      makeScene(
        'thruster-b',
        [
          {
            kind: 'body',
            id: 'box',
            transform: { x: 0, y: 2, angle: Math.PI / 2 },
            shapes: [{ type: 'box', hw: 0.3, hh: 0.3 }],
            material: { density: 1000, friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'thr',
            type: 'thruster',
            bodyA: null,
            bodyB: 'box',
            anchorA: { x: 0, y: 0 },
            anchorB: { x: 0, y: 0 },
            thruster: { enabled: true, fx: 0, fy: 10 },
          },
        ],
        { gravity: { x: 0, y: 0 } },
      ),
    );

    const samples = sampleRun(engine, 'box', TICKS_05S);
    const last = samples[samples.length - 1]!;
    const m = 1000 * 0.6 * 0.6;
    const expected = (10 / m) * 0.5;
    // Lokální +y otočeno o 90° → světový -x
    expect(Math.abs(last.vx + expected) / expected).toBeLessThan(0.01);
    expect(Math.abs(last.vy)).toBeLessThan(0.001);
    engine.dispose();
  });

  it('C: neaktivní tryska nepohne tělesem', async () => {
    const engine = await Engine.create(
      makeScene(
        'thruster-c',
        [
          {
            kind: 'body',
            id: 'box',
            transform: { x: 0, y: 2, angle: 0 },
            shapes: [{ type: 'box', hw: 0.3, hh: 0.3 }],
            material: { density: 1000, friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'thr',
            type: 'thruster',
            bodyA: null,
            bodyB: 'box',
            anchorA: { x: 0, y: 0 },
            anchorB: { x: 0, y: 0 },
            thruster: { enabled: false, fx: 0, fy: 10 },
          },
        ],
        { gravity: { x: 0, y: 0 } },
      ),
    );

    const samples = sampleRun(engine, 'box', TICKS_05S);
    const last = samples[samples.length - 1]!;
    expect(Math.abs(last.vx)).toBeLessThan(1e-6);
    expect(Math.abs(last.vy)).toBeLessThan(1e-6);
    engine.dispose();
  });
});
