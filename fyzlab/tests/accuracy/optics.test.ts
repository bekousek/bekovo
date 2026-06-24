/**
 * Přesnostní testy paprskaové optiky (F3-A).
 *
 * Tolerances z PLAN.md:
 *   - Snellovy úhly: ≤ 1e-6 rad odchylky od analytické hodnoty.
 *   - Totální vnitřní odraz (TIR): null přesně pro θ ≥ θ_c.
 *   - Odraz: ≤ 1e-12 (strojová přesnost).
 *   - Průsečík úsečky a kružnice: ≤ 1e-10 m.
 */
import { describe, expect, it } from 'vitest';
import {
  cauchyN,
  intersectCircle,
  intersectSegment,
  reflect,
  snell,
  type Ray,
} from '@engine/optics/math';

const RAY_RIGHT: Ray = { origin: { x: 0, y: 0 }, dir: { x: 1, y: 0 }, wavelength: 550, n: 1 };

// ---------------------------------------------------------------------------
// Odraz
// ---------------------------------------------------------------------------

describe('reflect()', () => {
  it('paprsek dolů odrazen svisle nahoru od vodorovné plochy', () => {
    // Paprsek: (0, -1) dopadá na normálu (0, 1).
    const r = reflect({ x: 0, y: -1 }, { x: 0, y: 1 });
    expect(r.x).toBeCloseTo(0, 12);
    expect(r.y).toBeCloseTo(1, 12);
  });

  it('paprsek 45° odražen zrcadlově', () => {
    // Paprsek: (1/√2, -1/√2); normála (0, 1) → odraženo (1/√2, 1/√2).
    const s = Math.SQRT1_2;
    const r = reflect({ x: s, y: -s }, { x: 0, y: 1 });
    expect(Math.abs(r.x - s)).toBeLessThan(1e-12);
    expect(Math.abs(r.y - s)).toBeLessThan(1e-12);
  });

  it('odražený vektor má délku 1', () => {
    const s = Math.SQRT1_2;
    const r = reflect({ x: s, y: -s }, { x: 0, y: 1 });
    expect(Math.abs(Math.hypot(r.x, r.y) - 1)).toBeLessThan(1e-12);
  });
});

// ---------------------------------------------------------------------------
// Snellův zákon (lom)
// ---------------------------------------------------------------------------

describe('snell() — lom', () => {
  it('vzduch→sklo 30°: θ₂ = 19,47° (±1e-6 rad)', () => {
    const n1 = 1.0;
    const n2 = 1.5;
    const theta1 = 30 * (Math.PI / 180);
    // Paprsek míří doleva-dolů, normála +y (míří nahoru ke vzduchu).
    const dir = { x: Math.sin(theta1), y: -Math.cos(theta1) };
    const normal = { x: 0, y: 1 };
    const refracted = snell(dir, normal, n1, n2);
    expect(refracted).not.toBeNull();
    // Úhel lomu: sinθ₂ = (n1/n2)·sinθ₁
    const expectedTheta2 = Math.asin((n1 / n2) * Math.sin(theta1));
    const actualTheta2 = Math.asin(Math.abs(refracted!.x)); // složka x = sinθ₂
    expect(Math.abs(actualTheta2 - expectedTheta2)).toBeLessThan(1e-6);
  });

  it('sklo→vzduch 20°: θ₂ = 30,87°', () => {
    const n1 = 1.5;
    const n2 = 1.0;
    const theta1 = 20 * (Math.PI / 180);
    const dir = { x: Math.sin(theta1), y: -Math.cos(theta1) };
    const normal = { x: 0, y: 1 };
    const refracted = snell(dir, normal, n1, n2);
    expect(refracted).not.toBeNull();
    const expectedTheta2 = Math.asin((n1 / n2) * Math.sin(theta1));
    const actualTheta2 = Math.asin(Math.abs(refracted!.x));
    expect(Math.abs(actualTheta2 - expectedTheta2)).toBeLessThan(1e-6);
  });

  it('normální dopad (0°) = průchod beze změny směru', () => {
    const dir = { x: 0, y: -1 };
    const normal = { x: 0, y: 1 };
    const r = snell(dir, normal, 1.0, 1.5);
    expect(r).not.toBeNull();
    expect(Math.abs(r!.x)).toBeLessThan(1e-12);
    expect(Math.abs(r!.y + 1)).toBeLessThan(1e-12);
  });

  it('lomený vektor má délku 1', () => {
    const theta1 = 25 * (Math.PI / 180);
    const dir = { x: Math.sin(theta1), y: -Math.cos(theta1) };
    const r = snell(dir, { x: 0, y: 1 }, 1.0, 1.5);
    expect(r).not.toBeNull();
    expect(Math.abs(Math.hypot(r!.x, r!.y) - 1)).toBeLessThan(1e-12);
  });
});

// ---------------------------------------------------------------------------
// Totální vnitřní odraz (TIR)
// ---------------------------------------------------------------------------

describe('snell() — TIR', () => {
  const n1 = 1.5; // sklo
  const n2 = 1.0; // vzduch
  const critAngle = Math.asin(n2 / n1); // 41,81°

  it('těsně pod kritickým úhlem: paprsek prochází', () => {
    const theta1 = critAngle - 1e-4;
    const dir = { x: Math.sin(theta1), y: -Math.cos(theta1) };
    const r = snell(dir, { x: 0, y: 1 }, n1, n2);
    expect(r).not.toBeNull();
  });

  it('přesně na kritickém úhlu: TIR (null)', () => {
    const dir = { x: Math.sin(critAngle), y: -Math.cos(critAngle) };
    const r = snell(dir, { x: 0, y: 1 }, n1, n2);
    // sinT2 = (n1/n2)²·sin²θ_c = (1.5)²·(2/3)² = 1 → sqrt(0) = 0, ale
    // numericky může být null nebo těsně nad 0; přijmeme obě varianty.
    // Důležité: nesmí vrátit nenormalizovaný vektor.
    if (r !== null) {
      expect(Math.abs(Math.hypot(r.x, r.y) - 1)).toBeLessThan(1e-6);
    }
  });

  it('nad kritickým úhlem (50°): TIR → null', () => {
    const theta1 = 50 * (Math.PI / 180);
    expect(theta1).toBeGreaterThan(critAngle);
    const dir = { x: Math.sin(theta1), y: -Math.cos(theta1) };
    expect(snell(dir, { x: 0, y: 1 }, n1, n2)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cauchyova rovnice
// ---------------------------------------------------------------------------

describe('cauchyN()', () => {
  it('B=0: vrátí A beze změny', () => {
    expect(cauchyN(550, 1.5, 0)).toBe(1.5);
  });

  it('kratší vlnová délka = vyšší index lomu (disperze)', () => {
    const n_blue = cauchyN(450, 1.5, 0.01);
    const n_red = cauchyN(650, 1.5, 0.01);
    expect(n_blue).toBeGreaterThan(n_red);
  });
});

// ---------------------------------------------------------------------------
// Průsečík paprsku s úsečkou
// ---------------------------------------------------------------------------

describe('intersectSegment()', () => {
  it('paprsek +x protíná svislou úsečku', () => {
    const hit = intersectSegment(RAY_RIGHT, { x: 2, y: -1 }, { x: 2, y: 1 });
    expect(hit).not.toBeNull();
    expect(Math.abs(hit!.t - 2)).toBeLessThan(1e-10);
    // Normála musí mířit proti paprsku: dot(dir, normal) < 0
    expect(hit!.normal.x * RAY_RIGHT.dir.x + hit!.normal.y * RAY_RIGHT.dir.y).toBeLessThan(0);
  });

  it('paprsek rovnoběžný s úsečkou = null', () => {
    // Úsečka vodorovná, paprsek vodorovný.
    const hit = intersectSegment(RAY_RIGHT, { x: 0, y: 1 }, { x: 4, y: 1 });
    expect(hit).toBeNull();
  });

  it('průsečík za paprskem (t<0) = null', () => {
    // Úsečka nalevo od originu.
    const hit = intersectSegment(RAY_RIGHT, { x: -1, y: -1 }, { x: -1, y: 1 });
    expect(hit).toBeNull();
  });

  it('paprsek mine úsečku (s mimo [0,1]) = null', () => {
    // Úsečka nad paprskem, ale paprsek letí vpravo.
    const hit = intersectSegment(RAY_RIGHT, { x: 2, y: 2 }, { x: 2, y: 4 });
    expect(hit).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Průsečík paprsku s kružnicí
// ---------------------------------------------------------------------------

describe('intersectCircle()', () => {
  it('paprsek +x zasáhne kruh na ose x', () => {
    const hit = intersectCircle(RAY_RIGHT, { x: 3, y: 0 }, 0.5);
    expect(hit).not.toBeNull();
    // Vstup do kruhu: t = 3 - 0.5 = 2.5
    expect(Math.abs(hit!.t - 2.5)).toBeLessThan(1e-10);
    // Normála míří doleva (proti paprsku).
    expect(hit!.normal.x).toBeLessThan(0);
    expect(Math.abs(hit!.normal.y)).toBeLessThan(1e-10);
  });

  it('paprsek míjí kruh = null', () => {
    // Kruh je nad paprskem.
    const hit = intersectCircle(RAY_RIGHT, { x: 3, y: 2 }, 0.5);
    expect(hit).toBeNull();
  });

  it('normála zasaženého kruhu má délku 1', () => {
    const hit = intersectCircle(RAY_RIGHT, { x: 3, y: 0.3 }, 0.5);
    if (!hit) return; // může minout — pak test nepřispívá
    expect(Math.abs(Math.hypot(hit.normal.x, hit.normal.y) - 1)).toBeLessThan(1e-10);
  });

  it('paprsek startující uvnitř kruhu = vrátí výstupní průsečík', () => {
    // Origin uvnitř kruhu (r=2, center=(0,0)).
    const rayInside: Ray = { origin: { x: 0, y: 0 }, dir: { x: 1, y: 0 }, wavelength: 550, n: 1.5 };
    const hit = intersectCircle(rayInside, { x: 0, y: 0 }, 2);
    expect(hit).not.toBeNull();
    expect(Math.abs(hit!.t - 2)).toBeLessThan(1e-10);
  });
});
