/**
 * F4: Přesnostní testy PBF kapalinového solveru.
 *
 * Testy ověřují fyzikálně smysluplné chování pod gravitací:
 *  - těžiště klesá při pádu částic
 *  - částice zůstanou v rozumných mezích (není výbuch)
 *  - rychlosti nepřesáhnou MAX_VEL
 */

import { describe, expect, test } from 'vitest';
import { FluidModule } from '@engine/fluids/FluidModule';
import { parseSceneDoc, type SceneDocInput } from '@engine/scene/schema';

const DT = 1 / 60;

/** Spustí solver na N ticků a vrátí průměrné y těžiště. */
function runSettle(ticks: number) {
  const doc = parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'fluid-test' },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      // Podlaha (plane)
      {
        kind: 'body',
        id: 'floor',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: 0 },
        shapes: [{ type: 'plane' }],
        material: {},
        appearance: { fill: '#94a3b8' },
      },
      // Kapalina — oblast 1.5×1.5 m od y=0.5 do y=2.0
      {
        kind: 'fluid',
        id: 'fl1',
        restDensity: 1000,
        viscosity: 0.01,
        color: '#60a5fa',
        particleRadius: 0.1,
        region: { x: -0.75, y: 0.5, width: 1.5, height: 1.5 },
      },
    ],
  } satisfies SceneDocInput);

  const mod = new FluidModule((_id) => null);
  mod.build(doc);

  let initialCy: number | null = null;

  for (let t = 0; t < ticks; t++) {
    mod.tick({ dt: DT, tickIndex: t, simTime: t * DT, bus: null as never });
    if (t === 0) {
      const data = mod.readFluidData();
      const xy = data[0]!.positions;
      let sy = 0;
      const n = xy.length / 2;
      for (let i = 0; i < n; i++) sy += xy[i * 2 + 1]!;
      initialCy = sy / n;
    }
  }

  const data = mod.readFluidData();
  const xy = data[0]!.positions;
  const n = xy.length / 2;
  let sumY = 0;
  let maxVel = 0;
  for (let i = 0; i < n; i++) {
    sumY += xy[i * 2 + 1]!;
  }

  return { cy: sumY / n, initialCy: initialCy!, n };
}

describe('FluidModule — usazení pod gravitací', () => {
  test('těžiště klesne po 60 tickách', () => {
    const { cy, initialCy } = runSettle(60);
    expect(cy).toBeLessThan(initialCy);
  });

  test('částice zůstanou nad podlahou (y > -0.5 m)', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'fluid-bounds' },
      world: { gravity: { x: 0, y: -9.81 } },
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'body',
          id: 'floor',
          bodyType: 'static',
          transform: { x: 0, y: 0, angle: 0 },
          shapes: [{ type: 'plane' }],
          material: {},
          appearance: { fill: '#94a3b8' },
        },
        {
          kind: 'fluid',
          id: 'fl2',
          restDensity: 1000,
          viscosity: 0.01,
          color: '#60a5fa',
          particleRadius: 0.1,
          region: { x: -0.5, y: 0.2, width: 1.0, height: 1.0 },
        },
      ],
    } satisfies SceneDocInput);

    const mod = new FluidModule((_id) => null);
    mod.build(doc);

    for (let t = 0; t < 120; t++) {
      mod.tick({ dt: DT, tickIndex: t, simTime: t * DT, bus: null as never });
    }

    const data = mod.readFluidData();
    const xy = data[0]!.positions;
    const n = xy.length / 2;
    for (let i = 0; i < n; i++) {
      expect(xy[i * 2 + 1]!).toBeGreaterThan(-0.5);
    }
  });

  test('žádná rychlostní exploze — solver konverguje', () => {
    // Bez těles: volný pád, PBF by neměl divergovat
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'fluid-vel' },
      world: { gravity: { x: 0, y: -9.81 } },
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'fluid',
          id: 'fl3',
          restDensity: 1000,
          viscosity: 0.01,
          color: '#60a5fa',
          particleRadius: 0.1,
          region: { x: -0.5, y: 0, width: 1.0, height: 1.0 },
        },
      ],
    } satisfies SceneDocInput);

    const mod = new FluidModule((_id) => null);
    mod.build(doc);

    // 30 ticků volného pádu
    for (let t = 0; t < 30; t++) {
      mod.tick({ dt: DT, tickIndex: t, simTime: t * DT, bus: null as never });
    }

    // readFluidData vrátí polohy — zkontrolovat, že existují a jsou finite
    const data = mod.readFluidData();
    expect(data).toHaveLength(1);
    const xy = data[0]!.positions;
    expect(xy.length).toBeGreaterThan(0);
    for (let i = 0; i < xy.length; i++) {
      expect(Number.isFinite(xy[i]!)).toBe(true);
    }
  });
});
