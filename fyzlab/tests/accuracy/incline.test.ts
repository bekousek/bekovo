/**
 * Nakloněná rovina: práh smyku tan θ = μ s tolerancí 2 %.
 * Pod prahem (tan θ = 0,98·μ) kvádr stojí, nad prahem (1,02·μ) klouže.
 * Tření obou povrchů μ = 0,5 (Rapier kombinuje průměrem → výsledné μ = 0,5).
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { makeScene, sampleRun } from './helpers';
import type { SceneDoc } from '@engine/scene/schema';

const MU = 0.5;

function inclineScene(tanTheta: number): SceneDoc {
  const theta = Math.atan(tanTheta);
  const hh = 0.1;
  // Kvádr položený na povrch: střed je hh nad rovinou podél normály.
  const n = { x: -Math.sin(theta), y: Math.cos(theta) };
  return makeScene(
    'incline',
    [
      {
        kind: 'body',
        id: 'ramp',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: theta },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: MU, restitution: 0 },
      },
      {
        kind: 'body',
        id: 'box',
        transform: { x: n.x * hh, y: n.y * hh, angle: theta },
        shapes: [{ type: 'box', hw: 0.2, hh }],
        material: { density: 800, friction: MU, restitution: 0 },
      },
    ],
    { gravity: { x: 0, y: -9.81 } },
  );
}

/** Posun podél svahu mezi 0,5 s a 2,5 s. */
async function slopeSlide(tanTheta: number): Promise<number> {
  const engine = await Engine.create(inclineScene(tanTheta));
  const theta = Math.atan(tanTheta);
  const u = { x: Math.cos(theta), y: Math.sin(theta) };
  const samples = sampleRun(engine, 'box', 2.5 * 120);
  const at = (t: number) => samples[Math.round(t * 120) - 1]!;
  const s0 = at(0.5);
  const s1 = at(2.5);
  engine.dispose();
  return (s1.x - s0.x) * u.x + (s1.y - s0.y) * u.y;
}

describe('nakloněná rovina — práh smyku', () => {
  it('2 % pod prahem stojí', async () => {
    const slide = await slopeSlide(MU * 0.98);
    expect(Math.abs(slide)).toBeLessThan(0.002);
  });

  it('2 % nad prahem klouže', async () => {
    const slide = await slopeSlide(MU * 1.02);
    expect(slide).toBeLessThan(-0.01); // sjíždí dolů po svahu
  });
});
