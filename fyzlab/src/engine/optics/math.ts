/**
 * Paprsková optika — jádrová matematika (headless).
 *
 * Souřadnicový systém je y-up (stejný jako zbytek enginu).
 * Normály vždy míří VEN z tělesa (do média dopadajícího paprsku).
 *
 * Přesnostní požadavky (CI):
 *   - Snellovy úhly ≤ 1e-6 rad odchylky od analytické hodnoty.
 *   - Kritický úhel TIR: vrátí null přesně pro θ ≥ θ_c.
 */
import type { Vec2 } from '../core/math';

/** Paprsek: poloha, normalizovaný směr, médium a vlnová délka. */
export interface Ray {
  /** Počáteční bod paprsku [m]. */
  origin: Vec2;
  /** Normalizovaný směrový vektor (|dir| = 1). */
  dir: Vec2;
  /** Vlnová délka [nm]; 0 = achromatické (bílé). */
  wavelength: number;
  /** Index lomu aktuálního média (vzduch ≈ 1,0; sklo ≈ 1,5). */
  n: number;
}

/** Výsledek průsečíku paprsku s povrchem. */
export interface RayHit {
  /** Vzdálenost od origin podél dir: hitPoint = origin + t·dir. */
  t: number;
  /** Normála povrchu v místě dopadu — míří VEN z tělesa do média paprsku. */
  normal: Vec2;
}

/**
 * Odraz (zákon odrazu, θ_r = θ_i).
 * Vrátí normalizovaný odražený směr.
 *
 * @param dir     Normalizovaný směr dopadajícího paprsku.
 * @param normal  Normála povrchu (míří do média paprsku, tj. dot(dir,normal) < 0).
 */
export function reflect(dir: Vec2, normal: Vec2): Vec2 {
  const dot = dir.x * normal.x + dir.y * normal.y; // < 0
  return { x: dir.x - 2 * dot * normal.x, y: dir.y - 2 * dot * normal.y };
}

/**
 * Lom (Snellův zákon): n₁·sinθ₁ = n₂·sinθ₂.
 * Vrátí normalizovaný lomený směr, nebo null při totálním vnitřním odrazu (TIR).
 *
 * @param dir     Normalizovaný směr dopadajícího paprsku.
 * @param normal  Normála povrchu (z média n₁ do média n₂).
 * @param n1      Index lomu média paprsku.
 * @param n2      Index lomu na druhé straně povrchu.
 */
export function snell(dir: Vec2, normal: Vec2, n1: number, n2: number): Vec2 | null {
  // cosθ₁ = –dot(dir, normal), protože normal míří PROTI paprsku.
  const cosI = -(dir.x * normal.x + dir.y * normal.y);
  const ratio = n1 / n2;
  const sinT2 = ratio * ratio * (1 - cosI * cosI); // sin²θ₂
  if (sinT2 > 1) return null; // TIR
  const cosT = Math.sqrt(1 - sinT2);
  return {
    x: ratio * dir.x + (ratio * cosI - cosT) * normal.x,
    y: ratio * dir.y + (ratio * cosI - cosT) * normal.y,
  };
}

/**
 * Cauchyova rovnice: n(λ) = A + B/λ²  (λ v µm).
 * Používá se pro disperzi (duha, hranol). Pro B=0 = achromatické.
 *
 * @param wavelengthNm  Vlnová délka [nm].
 * @param A             Cauchyova konstanta A (≈ základní index lomu).
 * @param B             Cauchyova konstanta B [µm²].
 */
export function cauchyN(wavelengthNm: number, A: number, B: number): number {
  if (B === 0) return A;
  const lambdaMicron = wavelengthNm / 1000; // nm → µm
  return A + B / (lambdaMicron * lambdaMicron);
}

// Minimální vzdálenost, aby paprsek nenarazil sám na sebe (numerická stabilita).
const SELF_EPSILON = 1e-9;

/**
 * Průsečík paprsku s úsečkou [a, b].
 * Vrátí RayHit (t, normal) nebo null.
 * Normála míří na stranu dopadajícího paprsku (dot(dir, normal) < 0).
 */
export function intersectSegment(ray: Ray, a: Vec2, b: Vec2): RayHit | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Parametrická forma: O + t·D = A + s·(B−A)
  // t a s z 2×2 soustavy.
  const denom = ray.dir.x * dy - ray.dir.y * dx;
  if (Math.abs(denom) < SELF_EPSILON) return null; // rovnoběžné
  const ox = a.x - ray.origin.x;
  const oy = a.y - ray.origin.y;
  const t = (ox * dy - oy * dx) / denom;
  if (t < SELF_EPSILON) return null; // za paprskem nebo příliš blízko
  const s = (ox * ray.dir.y - oy * ray.dir.x) / denom;
  if (s < 0 || s > 1) return null; // mimo úsečku
  // Normála kolmá na úsečku; orientujeme proti paprsku.
  const len = Math.hypot(dx, dy);
  let nx = -dy / len;
  let ny = dx / len;
  if (nx * ray.dir.x + ny * ray.dir.y > 0) { nx = -nx; ny = -ny; }
  return { t, normal: { x: nx, y: ny } };
}

/**
 * Průsečík paprsku s kružnicí (center, radius).
 * Vrátí RayHit (t, normal) pro nejbližší průsečík před paprskem, nebo null.
 * Normála míří na stranu dopadajícího paprsku.
 */
export function intersectCircle(ray: Ray, center: Vec2, radius: number): RayHit | null {
  // f = origin − center; hledáme t: |f + t·D|² = r²
  // t² + 2(f·D)t + (|f|²−r²) = 0
  const fx = ray.origin.x - center.x;
  const fy = ray.origin.y - center.y;
  const bHalf = fx * ray.dir.x + fy * ray.dir.y;
  const c = fx * fx + fy * fy - radius * radius;
  const disc = bHalf * bHalf - c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  const t1 = -bHalf - sq;
  const t2 = -bHalf + sq;
  const t = t1 > SELF_EPSILON ? t1 : t2 > SELF_EPSILON ? t2 : null;
  if (t === null) return null;
  // Normála = vektor od středu k místu dopadu, normalizovaný.
  const hx = fx + t * ray.dir.x;
  const hy = fy + t * ray.dir.y;
  const rLen = Math.hypot(hx, hy); // ≈ radius (numericky)
  let nx = hx / rLen;
  let ny = hy / rLen;
  if (nx * ray.dir.x + ny * ray.dir.y > 0) { nx = -nx; ny = -ny; }
  return { t, normal: { x: nx, y: ny } };
}
