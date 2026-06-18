/**
 * Geometrie polygonů: zjednodušení tahu od ruky (Douglas-Peucker),
 * plocha/těžiště, kontrola jednoduchosti, konvexní obal a konvexní
 * dekompozice (poly-decomp-es) pro Rapier collidery.
 *
 * Čistý kód bez DOM — běží ve workeru i v testech.
 */
import { makeCCW, quickDecomp, removeCollinearPoints, type Polygon } from 'poly-decomp-es';
import type { Vec2 } from '../core/math';

/** Douglas-Peucker zjednodušení otevřené polyčáry. */
export function simplifyPolyline(points: readonly Vec2[], tolerance: number): Vec2[] {
  if (points.length <= 2) return points.map((p) => ({ ...p }));

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [a, b] = stack.pop()!;
    if (b - a < 2) continue;
    const pa = points[a]!;
    const pb = points[b]!;
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const len = Math.hypot(dx, dy);
    // Degenerovaná tětiva (uzavřený tah: start == konec) → vzdálenost od bodu,
    // jinak by všechny vzdálenosti vyšly 0 a smyčka by se celá zahodila.
    const degenerate = len < 1e-9;

    let maxDist = -1;
    let maxIdx = -1;
    for (let i = a + 1; i < b; i++) {
      const p = points[i]!;
      const dist = degenerate
        ? Math.hypot(p.x - pa.x, p.y - pa.y)
        : Math.abs(dx * (pa.y - p.y) - (pa.x - p.x) * dy) / len;
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }
    if (maxDist > tolerance && maxIdx > 0) {
      keep[maxIdx] = 1;
      stack.push([a, maxIdx], [maxIdx, b]);
    }
  }

  const out: Vec2[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) out.push({ x: points[i]!.x, y: points[i]!.y });
  }
  return out;
}

/** Orientovaná plocha (kladná pro CCW). */
export function polygonArea(pts: readonly Vec2[]): number {
  let area = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    area += (pts[j]!.x + pts[i]!.x) * (pts[i]!.y - pts[j]!.y);
  }
  return area / 2;
}

export function polygonCentroid(pts: readonly Vec2[]): Vec2 {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const cross = pts[j]!.x * pts[i]!.y - pts[i]!.x * pts[j]!.y;
    a += cross;
    cx += (pts[j]!.x + pts[i]!.x) * cross;
    cy += (pts[j]!.y + pts[i]!.y) * cross;
  }
  if (Math.abs(a) < 1e-12) {
    // Degenerovaný polygon — průměr bodů.
    for (const p of pts) {
      cx += p.x;
      cy += p.y;
    }
    return { x: cx / pts.length, y: cy / pts.length };
  }
  a /= 2;
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

function segmentsIntersect(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const o = (p: Vec2, q: Vec2, r: Vec2) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const o1 = o(a, b, c);
  const o2 = o(a, b, d);
  const o3 = o(c, d, a);
  const o4 = o(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

/** Je polygon jednoduchý (bez self-intersekce)? O(n²) — n je po zjednodušení malé. */
export function isSimplePolygon(pts: readonly Vec2[]): boolean {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % n]!;
    for (let j = i + 1; j < n; j++) {
      // Sousední hrany sdílí vrchol — nepočítat.
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue;
      const c = pts[j]!;
      const d = pts[(j + 1) % n]!;
      if (segmentsIntersect(a, b, c, d)) return false;
    }
  }
  return true;
}

/** Konvexní obal (monotone chain), vrací CCW. */
export function convexHull(points: readonly Vec2[]): Vec2[] {
  const pts = points
    .map((p) => ({ x: p.x, y: p.y }))
    .sort((p, q) => p.x - q.x || p.y - q.y);
  if (pts.length <= 3) return pts;

  const cross = (o: Vec2, a: Vec2, b: Vec2) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Vec2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Vec2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Rozloží (i konkávní) jednoduchý polygon na konvexní kusy pro collidery.
 * Není-li jednoduchý nebo dekompozice selže, vrátí konvexní obal (poctivý,
 * předvídatelný fallback).
 */
export function decomposePolygon(points: readonly Vec2[]): Vec2[][] {
  if (points.length < 3) return [];

  if (!isSimplePolygon(points)) {
    const hull = convexHull(points);
    return hull.length >= 3 ? [hull] : [];
  }

  const poly: Polygon = points.map((p) => [p.x, p.y]);
  makeCCW(poly);
  removeCollinearPoints(poly, 0.005);
  if (poly.length < 3) {
    const hull = convexHull(points);
    return hull.length >= 3 ? [hull] : [];
  }

  try {
    const pieces = quickDecomp(poly);
    if (pieces.length === 0) throw new Error('empty decomposition');
    return pieces
      .filter((piece) => piece.length >= 3)
      .map((piece) => piece.map(([x, y]) => ({ x, y })));
  } catch {
    const hull = convexHull(points);
    return hull.length >= 3 ? [hull] : [];
  }
}
