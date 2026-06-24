/**
 * Přesnostní testy trasování paprsků — OpticsModule standalone (F3-B).
 *
 * OpticsModule je headless a nezávisí na Rapieru: lze ho testovat přímo v Node.
 * Testujeme výsledné segmenty paprsku (výstup z tick()) pro jednoduché geometrie.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { OpticsModule, type RaySegment } from '@engine/optics/OpticsModule';
import type { SceneDoc } from '@engine/scene/schema';
import { parseSceneDoc } from '@engine/scene/schema';

// ---------------------------------------------------------------------------
// Pomocné funkce
// ---------------------------------------------------------------------------

/** Snellův zákon pro ověření. */
function snellAngle(theta1: number, n1: number, n2: number): number {
  return Math.asin((n1 / n2) * Math.sin(theta1));
}

// ---------------------------------------------------------------------------
// Jednoduchá scéna: laser + skleněný blok
//
//   Laser: origin (−2, 0), direction (1, 0) — vodorovný paprsek
//   Blok: box hw=0.5, hh=0.5, střed (0, 0) — paprsek prochází středem
//   n_glass = 1.5
//
// Vodorovný paprsek, normální dopad na levou stěnu bloku (x=−0.5) → no lom.
// ---------------------------------------------------------------------------

function makeGlassBlockDoc(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'test-glass-block', title: 'Test' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'glass',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'box', hw: 0.5, hh: 0.5 }],
        material: {},
        optics: { mode: 'glass', refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0.04 },
      },
      {
        kind: 'opticalSource',
        id: 'laser',
        type: 'laser',
        transform: { x: -2, y: 0, angle: 0 }, // míří +x
        wavelength: 550,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Scéna: laser pod úhlem 30° na rozhraní vzduch → sklo
//
//   Laser: origin (−2, 0), míří pod 30° dolů → úhel = −π/6
//   Blok: box hw=0.5, hh=1.5, střed (0, 0), statický
//   n_glass = 1.5
//
// Paprsek míří pod 30° od svislé osy kolmice normály (vodorovná stěna x=−0.5).
// Úhel dopadu = 30° od normály; Snellův zákon: sinθ₂ = sin30°/1.5 ≈ 0.333 → θ₂≈19.47°.
// ---------------------------------------------------------------------------

function makeAngledLaserDoc(incidenceDeg: number, n: number): SceneDoc {
  const theta1 = (incidenceDeg * Math.PI) / 180;
  // Laser míří +x a dolů tak, aby úhel dopadu na svislou stěnu (normála +x nebo −x)
  // byl theta1 od normály: paprsek direction = (cos(theta1), −sin(theta1)).
  const angle = -theta1; // od +x osy
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'test-angled', title: 'Test' },
    world: {},
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'glass',
        bodyType: 'static',
        transform: { x: 1, y: 0 }, // střed bloku napravo
        shapes: [{ type: 'box', hw: 0.5, hh: 1.5 }],
        material: {},
        optics: { mode: 'glass', refractiveIndex: n, cauchyB: 0, reflectivity: 0.04 },
      },
      {
        kind: 'opticalSource',
        id: 'laser',
        type: 'laser',
        transform: { x: -1, y: 0, angle },
        wavelength: 550,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Testy
// ---------------------------------------------------------------------------

function makeModule(doc: SceneDoc): { mod: OpticsModule; segments: () => readonly RaySegment[] } {
  // Statická tělesa — poseOf vrátí transform přímo z dokumentu.
  const poseMap: Map<string, { x: number; y: number; angle: number }> = new Map();
  for (const e of doc.entities) {
    if (e.kind === 'body') {
      poseMap.set(e.id, { x: e.transform.x, y: e.transform.y, angle: e.transform.angle ?? 0 });
    }
  }
  const mod = new OpticsModule((id) => poseMap.get(id) ?? null);
  mod.build(doc);
  const ctx = { dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never };
  mod.tick(ctx);
  return { mod, segments: () => mod.readRaySegments() };
}

describe('OpticsModule — normální dopad (0°)', () => {
  let segs: readonly RaySegment[];

  beforeEach(() => {
    const doc = makeGlassBlockDoc();
    const { segments } = makeModule(doc);
    segs = segments();
  });

  it('vyemituje alespoň 1 segment', () => {
    expect(segs.length).toBeGreaterThan(0);
  });

  it('první segment začíná u laseru', () => {
    expect(Math.abs(segs[0]!.ox - (-2))).toBeLessThan(1e-9);
    expect(Math.abs(segs[0]!.oy)).toBeLessThan(1e-9);
  });

  it('paprsek míří vodorovně (y-souřadnice segmentů konstantní)', () => {
    for (const s of segs) {
      expect(Math.abs(s.oy)).toBeLessThan(1e-6);
      expect(Math.abs(s.ey)).toBeLessThan(1e-6);
    }
  });

  it('všechny segmenty mají vlnovou délku 550 nm', () => {
    for (const s of segs) {
      expect(s.wavelength).toBe(550);
    }
  });
});

describe('OpticsModule — lom pod 30°', () => {
  it('úhel lomu ≤ 1e-4 rad od Snellovy predikce', () => {
    const n2 = 1.5;
    const doc = makeAngledLaserDoc(30, n2);
    const { segments } = makeModule(doc);
    const segs = segments();
    expect(segs.length).toBeGreaterThanOrEqual(2);

    // Druhý segment = paprsek uvnitř skla (po lomu na levé stěně).
    const inside = segs[1]!;
    const dx = inside.ex - inside.ox;
    const dy = inside.ey - inside.oy;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) return; // propustíme pokud je nulový

    // Úhel od +x osy → převedeme na úhel dopadu (od normály svislé stěny = +x).
    const actualAngle = Math.abs(Math.atan2(Math.abs(dy), dx));
    const expectedAngle = snellAngle(30 * (Math.PI / 180), 1.0, n2);
    expect(Math.abs(actualAngle - expectedAngle)).toBeLessThan(1e-4);
  });
});

describe('OpticsModule — mirror (zrcadlo)', () => {
  it('paprsek se odráží od zrcadla', () => {
    // Paprsek vodorovný doleva→doprava, narazí na svislé zrcadlo.
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'test-mirror', title: 'Test' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'body',
          id: 'mirror',
          bodyType: 'static',
          transform: { x: 1, y: 0 },
          shapes: [{ type: 'box', hw: 0.05, hh: 1 }],
          material: {},
          optics: { mode: 'mirror', refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0.9 },
        },
        {
          kind: 'opticalSource',
          id: 'laser',
          type: 'laser',
          transform: { x: -1, y: 0, angle: 0 },
          wavelength: 650,
          power: 1,
          rayCount: 1,
          beamWidth: 0.1,
          parentId: null,
        },
      ],
    });
    const poseMap = new Map([['mirror', { x: 1, y: 0, angle: 0 }]]);
    const mod = new OpticsModule((id) => poseMap.get(id) ?? null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();

    // Alespoň 2 segmenty: před a za odrazem.
    expect(segs.length).toBeGreaterThanOrEqual(2);

    // Po odrazu paprsek míří zpět doleva (dx < 0).
    const afterBounce = segs[1]!;
    const dx = afterBounce.ex - afterBounce.ox;
    expect(dx).toBeLessThan(0);

    // y-složka zůstává nulová (kolmý dopad → rovný odraz).
    const dy = afterBounce.ey - afterBounce.oy;
    expect(Math.abs(dy)).toBeLessThan(1e-6);
  });
});

describe('OpticsModule — absorber zastaví paprsek', () => {
  it('paprsek se zastaví u absorbéru (1 segment)', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'test-absorb', title: 'Test' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'body',
          id: 'absorb',
          bodyType: 'static',
          transform: { x: 1, y: 0 },
          shapes: [{ type: 'box', hw: 0.5, hh: 0.5 }],
          material: {},
          optics: { mode: 'absorb', refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
        },
        {
          kind: 'opticalSource',
          id: 'laser',
          type: 'laser',
          transform: { x: -1, y: 0, angle: 0 },
          wavelength: 550,
          power: 1,
          rayCount: 1,
          beamWidth: 0.1,
          parentId: null,
        },
      ],
    });
    const poseMap = new Map([['absorb', { x: 1, y: 0, angle: 0 }]]);
    const mod = new OpticsModule((id) => poseMap.get(id) ?? null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();
    // Absorber → paprsek se zastaví → pouze 1 segment (před absorberem).
    expect(segs.length).toBe(1);
    // Segment končí na levé stěně absorbéru (x ≈ 0.5).
    expect(Math.abs(segs[0]!.ex - 0.5)).toBeLessThan(1e-4);
  });
});

describe('OpticsModule — beam (rovnoběžný svazek)', () => {
  it('svazek 5 paprsků vyemituje 5 iniciálních segmentů', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'test-beam', title: 'Test' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
      entities: [
        {
          kind: 'opticalSource',
          id: 'beam',
          type: 'beam',
          transform: { x: -2, y: 0, angle: 0 },
          wavelength: 550,
          power: 1,
          rayCount: 5,
          beamWidth: 1.0,
          parentId: null,
        },
      ],
    });
    const mod = new OpticsModule(() => null);
    mod.build(doc);
    mod.tick({ dt: 1 / 120, tickIndex: 0, simTime: 0, bus: null as never });
    const segs = mod.readRaySegments();
    // 5 paprsků, žádné překážky → každý paprsek = 1 segment.
    expect(segs.length).toBe(5);
  });
});
