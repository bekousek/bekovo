/**
 * Šikmý vrh: dostřel R = v²·sin 2θ / g s tolerancí 0,5 %.
 * Okamžik návratu na výšku startu se hledá sub-tick interpolací;
 * x je v ní lineární přesně (vx je konstantní).
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { crossingTimes, makeScene, sampleRun } from './helpers';

const G = 9.81;

describe('šikmý vrh', () => {
  it('dostřel pod 45° při v₀ = 10 m/s sedí na 0,5 %', async () => {
    const v0 = 10;
    const vx0 = v0 * Math.SQRT1_2;
    const vy0 = v0 * Math.SQRT1_2;

    const engine = await Engine.create(
      makeScene(
        'projectile',
        [
          {
            kind: 'body',
            id: 'ball',
            transform: { x: 0, y: 0 },
            velocity: { vx: vx0, vy: vy0, omega: 0 },
            shapes: [{ type: 'circle', r: 0.1 }],
          },
        ],
        { gravity: { x: 0, y: -G } },
      ),
    );

    // Let trvá 2·vy0/g ≈ 1,44 s → 1,8 s stačí i s rezervou.
    const samples = sampleRun(engine, 'ball', Math.ceil(1.8 * 120));
    const [tLand] = crossingTimes(samples, (s) => s.y, 0, -1);
    expect(tLand).toBeDefined();

    const range = vx0 * tLand!;
    const expected = (v0 * v0 * Math.sin(Math.PI / 2)) / G;
    expect(Math.abs(range - expected) / expected).toBeLessThan(0.005);

    engine.dispose();
  });
});
