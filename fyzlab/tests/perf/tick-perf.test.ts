/**
 * F5-B: Výkonnostní průchod — headless tick benchmarky.
 *
 * FluidModule @ ~4 k částic: každý tick <100 ms (ve workeru ~3× rychlejší).
 * OpticsModule @ 64 paprsků (schema max) + 8 odrazových stěn: každý tick <50 ms.
 *
 * Testy NEnestanovují přísnou hranici; výsledky se logují pro ruční posouzení.
 * Assertujeme jen "nespadne + je konečné" + hrubou horní mez (gracious bound).
 */
import { describe, expect, test } from 'vitest';
import { FluidModule } from '@engine/fluids/FluidModule';
import { OpticsModule } from '@engine/optics/OpticsModule';
import { parseSceneDoc, type SceneDocInput } from '@engine/scene/schema';

const DT = 1 / 60;
const TICKS = 60;

// ---------------------------------------------------------------------------
// FluidModule benchmark — ~4 096 částic
// ---------------------------------------------------------------------------

describe('Perf: FluidModule', () => {
  test('4 096 částic — tick < 100 ms průměrně', () => {
    // r=0.05 → spacing=0.1 → 64×64 grid = 4 096 (MAX_N)
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'perf-fluid' },
      world: { gravity: { x: 0, y: -9.81 } },
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'body',
          id: 'floor',
          bodyType: 'static',
          transform: { x: 0, y: -3.5, angle: 0 },
          shapes: [{ type: 'box', hw: 4, hh: 0.2 }],
          material: {},
          appearance: { fill: '#94a3b8' },
        },
        {
          kind: 'fluid',
          id: 'fl-big',
          restDensity: 1000,
          viscosity: 0.01,
          color: '#60a5fa',
          particleRadius: 0.05,
          // 6.4×6.4 m → 64×64 = 4 096 částic (capped na MAX_N=4096)
          region: { x: -3.2, y: 0, width: 6.4, height: 6.4 },
        },
      ],
    } satisfies SceneDocInput);

    const mod = new FluidModule((_id) => null);
    mod.build(doc);

    // Warmup (1 tick)
    mod.tick({ dt: DT, tickIndex: 0, simTime: 0, bus: null as never });

    const t0 = performance.now();
    for (let t = 1; t <= TICKS; t++) {
      mod.tick({ dt: DT, tickIndex: t, simTime: t * DT, bus: null as never });
    }
    const elapsed = performance.now() - t0;
    const avgMs = elapsed / TICKS;

    const data = mod.readFluidData();
    const N = data[0]!.positions.length / 2;

    console.log(
      `[FluidPerf] N=${N} částic, průměr ${avgMs.toFixed(2)} ms/tick, celkem ${elapsed.toFixed(0)} ms (${TICKS} ticků)`,
    );

    // Ověřit, že výsledky jsou konečné.
    for (const v of data[0]!.positions) {
      expect(Number.isFinite(v)).toBe(true);
    }
    // Hrubá mez: průměrný tick < 100 ms v Node (bez JIT warmup má horší výkon).
    expect(avgMs).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// OpticsModule benchmark — 100 paprsků, 8 odrazových stěn
// ---------------------------------------------------------------------------

describe('Perf: OpticsModule', () => {
  test('64 paprsků (schema max) + 8 zrcadlových stěn — tick < 50 ms průměrně', () => {
    // 8 zrcadlových boxů rozmístěných okolo středu.
    const mirrors = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return {
        kind: 'body' as const,
        id: `mirror-${i}`,
        bodyType: 'static' as const,
        transform: { x: Math.cos(a) * 2, y: Math.sin(a) * 2, angle: a },
        shapes: [{ type: 'box' as const, hw: 0.6, hh: 0.05 }],
        material: {},
        optics: { mode: 'mirror' as const, refractiveIndex: 1, cauchyB: 0, reflectivity: 0.95 },
        appearance: { fill: '#64748b' },
      };
    });

    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'perf-optics' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        ...mirrors,
        {
          kind: 'opticalSource',
          id: 'src',
          type: 'point',
          transform: { x: 0, y: 0, angle: 0 },
          wavelength: 550,
          power: 1,
          rayCount: 64,
          beamWidth: 0.1,
          parentId: null,
        },
      ],
    } satisfies SceneDocInput);

    // OpticsModule potřebuje getter pózy těles.
    const poseMap = new Map(
      doc.entities
        .filter((e) => e.kind === 'body')
        .map((e) => [e.id, { x: e.transform.x, y: e.transform.y, angle: e.transform.angle ?? 0 }]),
    );

    const mod = new OpticsModule((id) => poseMap.get(id) ?? null);
    mod.build(doc);

    // Warmup
    mod.tick({ dt: DT, tickIndex: 0, simTime: 0, bus: null as never });

    const t0 = performance.now();
    for (let t = 1; t <= TICKS; t++) {
      mod.tick({ dt: DT, tickIndex: t, simTime: t * DT, bus: null as never });
    }
    const elapsed = performance.now() - t0;
    const avgMs = elapsed / TICKS;

    const segs = mod.readRaySegments();
    console.log(
      `[OpticsPerf] ${segs.length} segmentů (64 paprsků), průměr ${avgMs.toFixed(2)} ms/tick, celkem ${elapsed.toFixed(0)} ms (${TICKS} ticků)`,
    );

    // Výsledky musí být konečné.
    for (const s of segs) {
      expect(Number.isFinite(s.ox)).toBe(true);
      expect(Number.isFinite(s.ey)).toBe(true);
    }
    // Hrubá mez: průměrný tick < 50 ms v Node.
    expect(avgMs).toBeLessThan(50);
  });
});
