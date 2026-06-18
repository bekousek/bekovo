/**
 * Fyzické kyvadlo na čepu (osa ke světu): perioda s tolerancí 1 %.
 * Očekávání zahrnuje moment setrvačnosti koule (I = m(L² + r²/2)) i korekci
 * amplitudy (1 + θ₀²/16) pro 5°. Periodu měříme mezi průchody svislicí
 * stejným směrem (sub-tick interpolace).
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { crossingTimes, makeScene, meanSpacing, sampleRun } from './helpers';

const G = 9.81;

describe('kyvadlo', () => {
  it('perioda kyvu 5° na závěsu 1 m sedí na 1 %', async () => {
    const L = 1;
    const r = 0.05;
    const theta0 = (5 * Math.PI) / 180;
    const pivot = { x: 0, y: 1.5 };
    const center = { x: pivot.x + L * Math.sin(theta0), y: pivot.y - L * Math.cos(theta0) };

    const engine = await Engine.create(
      makeScene(
        'pendulum',
        [
          {
            kind: 'body',
            id: 'bob',
            transform: { x: center.x, y: center.y },
            shapes: [{ type: 'circle', r }],
            material: { density: 1000, friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'pivot',
            type: 'axle',
            bodyA: null,
            bodyB: 'bob',
            anchorA: pivot,
            anchorB: { x: pivot.x - center.x, y: pivot.y - center.y },
          },
        ],
        { gravity: { x: 0, y: -G } },
      ),
    );

    // ~3 periody (T ≈ 2 s).
    const samples = sampleRun(engine, 'bob', 6.5 * 120);
    const crossings = crossingTimes(samples, (s) => s.x - pivot.x, 0, 1);
    const T = meanSpacing(crossings);

    const inertiaFactor = Math.sqrt(1 + (r * r) / (2 * L * L)); // I = m(L² + r²/2)
    const amplitudeFactor = 1 + (theta0 * theta0) / 16;
    const expected = 2 * Math.PI * Math.sqrt(L / G) * inertiaFactor * amplitudeFactor;

    expect(Math.abs(T - expected) / expected).toBeLessThan(0.01);

    engine.dispose();
  });
});
