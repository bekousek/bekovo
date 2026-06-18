/**
 * Motor osy pod zátěží: excentricky zavěšené kolo (gravitace periodicky
 * brzdí a roztáčí) — regulátor musí držet střední ω na cíli s tolerancí 2 %.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { makeScene, sampleRun } from './helpers';

describe('motor osy', () => {
  it('drží 5 rad/s ±2 % i s excentrickou zátěží', async () => {
    const target = 5;
    const engine = await Engine.create(
      makeScene(
        'motor',
        [
          {
            kind: 'body',
            id: 'wheel',
            transform: { x: 0, y: 2 },
            shapes: [{ type: 'circle', r: 0.5 }],
            material: { density: 800, friction: 0.5, restitution: 0.3 },
          },
          {
            kind: 'joint',
            id: 'axle',
            type: 'axle',
            bodyA: null,
            bodyB: 'wheel',
            // Čep 10 cm mimo střed → gravitační moment ±616 N·m kolem čepu.
            anchorA: { x: 0.1, y: 2 },
            anchorB: { x: 0.1, y: 0 },
            axle: { enabled: true, targetVelocity: target, maxTorque: 5000 },
          },
        ],
        { gravity: { x: 0, y: -9.81 } },
      ),
    );

    const samples = sampleRun(engine, 'wheel', 4 * 120);
    // Střední ω přes poslední 2 s (≈ 1,6 otáčky — ripple se vystředuje).
    const tail = samples.slice(-240);
    const mean = tail.reduce((acc, s) => acc + s.omega, 0) / tail.length;
    expect(Math.abs(mean - target) / target).toBeLessThan(0.02);

    // Ripple zůstává malý: žádný vzorek neujede o víc než 5 %.
    for (const s of tail) {
      expect(Math.abs(s.omega - target) / target).toBeLessThan(0.05);
    }

    engine.dispose();
  });
});
