/**
 * Fotobrána: sub-tick časy průchodů proti analytice. Těleso letí
 * konstantní rychlostí v beztíži → časy hran jsou přesně (x_hrana − x₀)/v.
 * Lineární interpolace uvnitř ticku je pro rovnoměrný pohyb exaktní —
 * tolerance jen na f32 šum, řádově pod 1/120 s.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import type { InstrumentEvent } from '@engine/core/SimModule';
import type { SceneDocInput } from '@engine/scene/schema';
import { makeScene } from './helpers';

const TOL = 1e-4; // s — výrazně pod tick 8,3 ms

function gateAt(x: number, halfLength = 1): SceneDocInput['entities'][number] {
  return {
    kind: 'instrument',
    id: `gate-${x}`,
    type: 'photogate',
    transform: { x, y: 0, angle: 0 },
    gate: { halfLength },
  };
}

async function runAndCollect(
  entities: SceneDocInput['entities'],
  seconds: number,
): Promise<InstrumentEvent[]> {
  const engine = await Engine.create(
    makeScene('photogate', entities, { gravity: { x: 0, y: 0 } }),
  );
  const events: InstrumentEvent[] = [];
  for (let i = 0; i < seconds * 120; i++) {
    engine.tick();
    events.push(...engine.drainEvents());
  }
  engine.dispose();
  return events;
}

describe('fotobrána', () => {
  it('míč: vstup/výstup hran sedí na analytiku (sub-tick)', async () => {
    const r = 0.1;
    const v = 2;
    const events = await runAndCollect(
      [
        {
          kind: 'body',
          id: 'ball',
          transform: { x: -1, y: 0 },
          velocity: { vx: v, vy: 0, omega: 0 },
          shapes: [{ type: 'circle', r }],
        },
        gateAt(0),
      ],
      1.2,
    );

    expect(events).toHaveLength(2);
    const [enter, exit] = events;
    expect(enter!.kind).toBe('enter');
    expect(enter!.t).toBeCloseTo((1 - r) / v, 4); // 0,45 s
    expect(exit!.kind).toBe('exit');
    expect(exit!.t).toBeCloseTo((1 + r) / v, 4); // 0,55 s
    expect(Math.abs(exit!.t - enter!.t - (2 * r) / v)).toBeLessThan(TOL);
  });

  it('vozík (kvádr): doba zákrytu = šířka / rychlost', async () => {
    const hw = 0.25;
    const v = 4;
    const events = await runAndCollect(
      [
        {
          kind: 'body',
          id: 'cart',
          transform: { x: -2, y: 0 },
          velocity: { vx: v, vy: 0, omega: 0 },
          shapes: [{ type: 'box', hw, hh: 0.1 }],
        },
        gateAt(0),
      ],
      1.5,
    );

    expect(events).toHaveLength(2);
    expect(events[0]!.t).toBeCloseTo((2 - hw) / v, 4);
    expect(events[1]!.t).toBeCloseTo((2 + hw) / v, 4);
  });

  it('mimo podélný rozsah brány se nic neměří', async () => {
    const events = await runAndCollect(
      [
        {
          kind: 'body',
          id: 'ball',
          transform: { x: -1, y: 2 }, // letí 2 m NAD bránou s polodélkou 0,5
          velocity: { vx: 3, vy: 0, omega: 0 },
          shapes: [{ type: 'circle', r: 0.1 }],
        },
        gateAt(0, 0.5),
      ],
      1,
    );
    expect(events).toHaveLength(0);
  });

  it('vypadnutí pod bránu uvolní paprsek (exit i bez bočního průchodu)', async () => {
    // Míč prolétá bránou a zároveň padá: z podélného rozsahu vypadne dřív,
    // než vyletí bokem — exit musí přijít stejně (reálný paprsek se uvolní).
    const engine = await Engine.create(
      makeScene(
        'photogate-drop',
        [
          {
            kind: 'body',
            id: 'ball',
            transform: { x: -1, y: 0.3 },
            velocity: { vx: 2, vy: 0, omega: 0 },
            shapes: [{ type: 'circle', r: 0.15 }],
          },
          gateAt(0, 0.5),
        ],
        { gravity: { x: 0, y: -9.81 } },
      ),
    );
    const events: InstrumentEvent[] = [];
    for (let i = 0; i < 1.2 * 120; i++) {
      engine.tick();
      events.push(...engine.drainEvents());
    }
    engine.dispose();

    expect(events.filter((e) => e.kind === 'enter')).toHaveLength(1);
    expect(events.filter((e) => e.kind === 'exit')).toHaveLength(1);
    expect(events.at(-1)!.kind).toBe('exit');
  });

  it('dvě brány měří průměrnou rychlost: Δx / Δt', async () => {
    const v = 3;
    const events = await runAndCollect(
      [
        {
          kind: 'body',
          id: 'ball',
          transform: { x: -1, y: 0 },
          velocity: { vx: v, vy: 0, omega: 0 },
          shapes: [{ type: 'circle', r: 0.05 }],
        },
        gateAt(0),
        gateAt(1.5),
      ],
      1.5,
    );

    const enters = events.filter((e) => e.kind === 'enter');
    expect(enters).toHaveLength(2);
    const dt = enters[1]!.t - enters[0]!.t;
    expect(1.5 / dt).toBeCloseTo(v, 3); // změřená rychlost
  });
});
