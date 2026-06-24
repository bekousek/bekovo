/**
 * F3-D: Přesnostní testy tenké čočky.
 *
 * Ideální tenká čočka (maticová optika) splňuje zobrazovací rovnici:
 *   1/f = 1/d_o + 1/d_i
 *
 * Tolerance: ≤ 1 % chyby vzdálenosti obrazu.
 * Paprsky jsou v paraxiálním režimu (h/f ≤ 0.1) — mimo paraxiální limit
 * matice dává jen přibližný výsledek (sin θ ≈ θ).
 */

import { describe, expect, test } from 'vitest';
import { OpticsModule } from '@engine/optics/OpticsModule';
import { parseSceneDoc, type SceneDocInput } from '@engine/scene/schema';

// -------------------------------------------------------------------------
// Pomocná továrna
// -------------------------------------------------------------------------

interface LensSetup {
  /** Ohnisková vzdálenost [m]; záporná = rozptylná. */
  f: number;
  /** Vzdálenost předmětu od čočky [m] (kladná = předmět vlevo). */
  do: number;
  /** Výšky paprsků h (pro h/f < 0.1 platí paraxiální limit). */
  heights: number[];
}

/** Vytvoří OpticsModule s čočkovým tělesem a bodovým zdrojem. */
function makeModule(setup: LensSetup) {
  const { f, do: doVal, heights } = setup;

  // Bodový zdroj emituje paprsky k čočce na každé výšce z heights.
  // Směr každého paprsku: od (-doVal, 0) na (0, h).
  const sources = heights.map((h, i) => {
    const angle = Math.atan2(h, doVal); // paprsek míří na (0, h) od (-doVal, 0)
    return {
      kind: 'opticalSource' as const,
      id: `src-${i}`,
      type: 'laser' as const,
      transform: { x: -doVal, y: 0, angle },
      wavelength: 550,
      power: 1,
      rayCount: 1,
      beamWidth: 0.1,
      parentId: null,
    };
  });

  const doc = parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'lens-test' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'lens',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'box', hw: 0.01, hh: 1.0 }],
        material: {},
        appearance: { fill: '#bae6fd' },
        optics: { mode: 'lens', focalLength: f, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
      },
      ...sources,
    ],
  } satisfies SceneDocInput);

  const mod = new OpticsModule((_id) => null);
  mod.build(doc);
  mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
  return mod;
}

/** Najde y-souřadnici průniku úsečky (ox,oy)→(ex,ey) s vertikálou x=xTarget. */
function yAtX(ox: number, oy: number, ex: number, ey: number, xTarget: number): number | null {
  const dx = ex - ox;
  if (Math.abs(dx) < 1e-12) return null;
  const t = (xTarget - ox) / dx;
  if (t < 0) return null; // xTarget za paprskem
  return oy + t * (ey - oy);
}

// -------------------------------------------------------------------------
// Testy
// -------------------------------------------------------------------------

describe('Tenká čočka — zobrazovací rovnice (F3-D)', () => {
  test('Spojná: do=3f, očekávané di=1.5f (1/3+1/1.5=1/1)', () => {
    const f = 1.5;
    const doVal = 3.0; // 2*f
    const diExpected = (f * doVal) / (doVal - f); // = 3.0m
    const heights = [0.05, 0.08, 0.10]; // paraxiální (h/f < 0.07)

    const mod = makeModule({ f, do: doVal, heights });
    const segs = mod.readRaySegments();

    // Segmenty po průchodu čočkou mají ox ≈ 0 (začínají na čočce).
    const exitSegs = segs.filter((s) => s.ox > -0.05 && s.ox < 0.05 && s.ex > 0.05);

    expect(exitSegs.length).toBeGreaterThanOrEqual(heights.length);

    for (const seg of exitSegs) {
      const y = yAtX(seg.ox, seg.oy, seg.ex, seg.ey, diExpected);
      expect(y).not.toBeNull();
      // Všechny výstupní paprsky by se měly sbíhat v obrazové rovině (y ≈ 0)
      expect(Math.abs(y!)).toBeLessThan(diExpected * 0.01); // ≤ 1 %
    }
  });

  test('Spojná: rovnoběžné paprsky sbíhají v ohnisku f', () => {
    // Rovnoběžné paprsky (do=∞): sbíhají se v ohnisku na x=f.
    const f = 1.0;
    const heights = [-0.10, -0.05, 0, 0.05, 0.10];

    // Beam source ≈ rovnoběžné paprsky — simulujeme jako laser z daleka.
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'lens-parallel' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 8 },
      entities: [
        {
          kind: 'body',
          id: 'lens',
          bodyType: 'static',
          transform: { x: 0, y: 0 },
          shapes: [{ type: 'box', hw: 0.01, hh: 0.5 }],
          material: {},
          appearance: { fill: '#bae6fd' },
          optics: { mode: 'lens', focalLength: f, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
        },
        ...heights.map((h, i) => ({
          kind: 'opticalSource' as const,
          id: `beam-${i}`,
          type: 'laser' as const,
          transform: { x: -5, y: h, angle: 0 }, // vodorovný paprsek
          wavelength: 550,
          power: 1,
          rayCount: 1,
          beamWidth: 0.1,
          parentId: null,
        })),
      ],
    } satisfies SceneDocInput);

    const mod = new OpticsModule((_id) => null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();

    const exitSegs = segs.filter((s) => s.ox > -0.05 && s.ox < 0.05 && s.ex > 0.05);
    expect(exitSegs.length).toBeGreaterThanOrEqual(heights.length);

    for (const seg of exitSegs) {
      const y = yAtX(seg.ox, seg.oy, seg.ex, seg.ey, f);
      expect(y).not.toBeNull();
      // Průsečík v ohnisku (x=f) leží blízko osy (y ≈ 0)
      expect(Math.abs(y!)).toBeLessThan(f * 0.01); // ≤ 1 % ohniskové vzdálenosti
    }
  });

  test('Rozptylná: rovnoběžné paprsky se rozbíhají (žádné sbíhání za čočkou)', () => {
    const f = -1.0; // záporná = rozptylná
    const heights = [0.05, 0.10];

    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'lens-div' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 8 },
      entities: [
        {
          kind: 'body',
          id: 'lens',
          bodyType: 'static',
          transform: { x: 0, y: 0 },
          shapes: [{ type: 'box', hw: 0.01, hh: 0.5 }],
          material: {},
          appearance: { fill: '#bae6fd' },
          optics: { mode: 'lens', focalLength: f, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
        },
        ...heights.map((h, i) => ({
          kind: 'opticalSource' as const,
          id: `beam-${i}`,
          type: 'laser' as const,
          transform: { x: -5, y: h, angle: 0 },
          wavelength: 550,
          power: 1,
          rayCount: 1,
          beamWidth: 0.1,
          parentId: null,
        })),
      ],
    } satisfies SceneDocInput);

    const mod = new OpticsModule((_id) => null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();

    const exitSegs = segs.filter((s) => s.ox > -0.05 && s.ox < 0.05 && s.ex > 0.05);
    expect(exitSegs.length).toBeGreaterThanOrEqual(heights.length);

    // Výstupní paprsky mají kladnou výšku h a mají se rozbíhat (dy/dx > 0 pro h > 0).
    for (const seg of exitSegs) {
      if (seg.oy <= 0) continue; // jen horní paprsky
      const dy = seg.ey - seg.oy;
      const dx = seg.ex - seg.ox;
      // Rozptylná čočka: paprsek míří od osy (dy/dx > 0 pro h > 0)
      expect(dy / dx).toBeGreaterThan(0);
    }
  });

  test('Průchodový paprsek středem čočky není odkloněn', () => {
    // Paprsek procházející přesně středem čočky (h=0) se neodkloní.
    // Zdroj je výše na ose y a míří přímo na střed čočky (0, 0).
    const f = 1.5;
    const srcX = -3;
    const srcY = 0.3; // výše od osy
    // Úhel namířený přesně na (0, 0):
    const angle = Math.atan2(-srcY, -srcX); // = atan2(-0.3, 3)

    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'lens-center' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 8 },
      entities: [
        {
          kind: 'body',
          id: 'lens',
          bodyType: 'static',
          transform: { x: 0, y: 0 },
          shapes: [{ type: 'box', hw: 0.01, hh: 0.5 }],
          material: {},
          appearance: { fill: '#bae6fd' },
          optics: { mode: 'lens', focalLength: f, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
        },
        {
          kind: 'opticalSource',
          id: 'center-ray',
          type: 'laser',
          transform: { x: srcX, y: srcY, angle }, // míří přes střed čočky (0, 0)
          wavelength: 550,
          power: 1,
          rayCount: 1,
          beamWidth: 0.1,
          parentId: null,
        },
      ],
    } satisfies SceneDocInput);

    const mod = new OpticsModule((_id) => null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();

    // Výstupní segment: začíná těsně za čočkou.
    const exitSeg = segs.find((s) => s.ox > -0.05 && s.ox < 0.05 && s.ex > 0.5);
    expect(exitSeg).toBeDefined();

    // Směr výstupního segmentu musí být shodný s vstupním (h≈0 → nulová korekce).
    const dirIn = { x: Math.cos(angle), y: Math.sin(angle) };
    const len = Math.hypot(exitSeg!.ex - exitSeg!.ox, exitSeg!.ey - exitSeg!.oy);
    const dirOut = { x: (exitSeg!.ex - exitSeg!.ox) / len, y: (exitSeg!.ey - exitSeg!.oy) / len };
    expect(Math.abs(dirOut.x - dirIn.x)).toBeLessThan(0.005); // ≤ 0.3°
    expect(Math.abs(dirOut.y - dirIn.y)).toBeLessThan(0.005);
  });
});
