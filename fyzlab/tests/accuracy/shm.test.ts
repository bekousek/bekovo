/**
 * Pružinový oscilátor (SHM) v beztíži: T = 2π√(m/k) s tolerancí 1 %.
 * m = 10 kg (hustota volená tak, aby π·r²·ρ = 10), k = 1000 N/m, bez tlumení.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { crossingTimes, makeScene, meanSpacing, sampleRun } from './helpers';

describe('pružina — SHM', () => {
  it('perioda kmitů sedí na 1 %', async () => {
    const m = 10;
    const k = 1000;
    const r = 0.1;
    const rest = 1;
    const x0 = rest + 0.2; // počáteční výchylka 0,2 m

    const engine = await Engine.create(
      makeScene(
        'shm',
        [
          {
            kind: 'body',
            id: 'bob',
            transform: { x: x0, y: 0 },
            shapes: [{ type: 'circle', r }],
            material: { density: m / (Math.PI * r * r), friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'spring',
            type: 'spring',
            bodyA: null,
            bodyB: 'bob',
            anchorA: { x: 0, y: 0 },
            anchorB: { x: 0, y: 0 },
            spring: { restLength: rest, stiffness: k, damping: 0 },
          },
        ],
        { gravity: { x: 0, y: 0 } },
      ),
    );

    // T ≈ 0,63 s → 3 s ≈ 4,7 periody.
    const samples = sampleRun(engine, 'bob', 3 * 120);
    const crossings = crossingTimes(samples, (s) => s.x, rest, 1);
    const T = meanSpacing(crossings);

    const expected = 2 * Math.PI * Math.sqrt(m / k);
    expect(Math.abs(T - expected) / expected).toBeLessThan(0.01);

    // Bez tlumení se amplituda nesmí znatelně měnit (drift < 2 %).
    const early = Math.max(...samples.slice(0, 120).map((s) => s.x - rest));
    const late = Math.max(...samples.slice(-120).map((s) => s.x - rest));
    expect(Math.abs(late - early) / early).toBeLessThan(0.02);

    engine.dispose();
  });
});
