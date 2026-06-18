/**
 * Přesnostní test: volný pád proti analytickému řešení.
 *
 * Engine integruje symplektickým Eulerem, takže diskrétní dráha po N krocích
 * je y = -g·dt²·N(N+1)/2 — o ~(1/N) víc než spojité ½gt². Pro 120 kroků
 * (1 s) je odchylka ~0,83 %, proto tolerance 1 % vůči spojitému řešení.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { parseSceneDoc } from '@engine/scene/schema';

const G = 9.81;

function freefallScene() {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'test-freefall', title: 'Volný pád' },
    world: { gravity: { x: 0, y: -G }, tickHz: 120 },
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ball',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'circle', r: 0.1 }],
      },
    ],
  });
}

describe('volný pád', () => {
  it('dráha po 1 s odpovídá ½gt² s tolerancí 1 %', async () => {
    const engine = await Engine.create(freefallScene());
    for (let i = 0; i < 120; i++) engine.tick();

    const state = engine.getBodyState('ball');
    expect(state).toBeDefined();

    const expected = -0.5 * G; // ½·g·t², t = 1 s
    const relError = Math.abs((state!.y - expected) / expected);
    expect(relError).toBeLessThan(0.01);

    // Rychlost po 1 s: v = g·t. Rapier počítá ve f32 → šum ~1e-5.
    expect(state!.vy).toBeCloseTo(-G, 3);
    // Vodorovně se nesmí dít nic.
    expect(state!.x).toBeCloseTo(0, 10);
    expect(state!.vx).toBeCloseTo(0, 10);

    engine.dispose();
  });

  it('dráha přesně sedí na diskrétní symplektické řešení (4 substepy)', async () => {
    const engine = await Engine.create(freefallScene());
    const N = 120;
    for (let i = 0; i < N; i++) engine.tick();

    const state = engine.getBodyState('ball')!;
    // Rapier (TGS-soft) integruje gravitaci po `numSolverIterations` (default 4)
    // vnitřních substepech → efektivní symplektické řešení s M = 4N kroky.
    // Empiricky ověřeno; když Rapier změní default, tenhle kanárek to chytí.
    const SOLVER_SUBSTEPS = 4;
    const M = N * SOLVER_SUBSTEPS;
    const dtSub = engine.dt / SOLVER_SUBSTEPS;
    const discrete = -G * dtSub * dtSub * ((M * (M + 1)) / 2);
    // Volné těleso bez kontaktů musí sledovat integrátor až na f32 šum.
    expect(Math.abs(state.y - discrete)).toBeLessThan(1e-3);

    engine.dispose();
  });
});
