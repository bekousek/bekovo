/**
 * Vzduch: terminální rychlost pádu a stoupání heliového balónku proti
 * analytice v_t = √(2·|m·g − ρ·A·g| / (ρ·C_d·d)), tolerance 5 %.
 * Model je záměrně jednoduchý (d = průměr kruhu o stejné ploše) — test
 * jistí, že engine počítá přesně tento vzorec, který žáci umí ověřit.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { terminalVelocity } from '@engine/rigid/air';
import { makeScene, sampleRun } from './helpers';

const G = 9.81;
const AIR = 1.2;

function ballScene(id: string, density: number, r: number) {
  return makeScene(
    id,
    [
      {
        kind: 'body' as const,
        id: 'ball',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'circle' as const, r }],
        material: { density, friction: 0.5, restitution: 0.3 },
      },
    ],
    { gravity: { x: 0, y: -G }, airDensity: AIR },
  );
}

describe('vzduch — odpor a vztlak', () => {
  it('lehký míč dosáhne terminální rychlosti pádu (±5 %)', async () => {
    const r = 0.1;
    const density = 5; // m ≈ 0,157 kg → v_t ≈ 5,2 m/s, ustálí se za ~2 s
    const engine = await Engine.create(ballScene('terminal-fall', density, r));

    const samples = sampleRun(engine, 'ball', 4 * 120);
    const area = Math.PI * r * r;
    const expected = terminalVelocity(area * density, area, AIR, G);

    const vEnd = -samples.at(-1)!.vy;
    const vEarlier = -samples.at(-60)!.vy;
    expect(Math.abs(vEnd - expected) / expected).toBeLessThan(0.05);
    // Ustálené: za poslední půlsekundu se rychlost už nemění.
    expect(Math.abs(vEnd - vEarlier) / expected).toBeLessThan(0.01);

    engine.dispose();
  });

  it('heliový balónek stoupá terminální rychlostí (±5 %)', async () => {
    const r = 0.15;
    const density = 0.17; // helium < vzduch 1,2 → vztlak vyhrává
    const engine = await Engine.create(ballScene('balloon', density, r));

    const samples = sampleRun(engine, 'ball', 4 * 120);
    const area = Math.PI * r * r;
    const expected = terminalVelocity(area * density, area, AIR, G);

    const vy = samples.at(-1)!.vy;
    expect(vy).toBeGreaterThan(0); // STOUPÁ
    expect(Math.abs(vy - expected) / expected).toBeLessThan(0.05);

    engine.dispose();
  });

  it('ve vakuu (ρ=0) vzduch nepůsobí — volný pád beze změny', async () => {
    const r = 0.1;
    const engine = await Engine.create(
      makeScene(
        'vacuum',
        [
          {
            kind: 'body' as const,
            id: 'ball',
            transform: { x: 0, y: 0 },
            shapes: [{ type: 'circle' as const, r }],
            material: { density: 5, friction: 0.5, restitution: 0.3 },
          },
        ],
        { gravity: { x: 0, y: -G }, airDensity: 0 },
      ),
    );
    const samples = sampleRun(engine, 'ball', 120);
    expect(samples.at(-1)!.vy).toBeCloseTo(-G, 3); // v = g·t po 1 s
    engine.dispose();
  });
});
