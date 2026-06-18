/** Geometrie polygonů: zjednodušení, plocha/těžiště, dekompozice. */
import { describe, expect, it } from 'vitest';
import {
  convexHull,
  decomposePolygon,
  isSimplePolygon,
  polygonArea,
  polygonCentroid,
  simplifyPolyline,
} from '@engine/rigid/geometry';
import type { Vec2 } from '@engine/core/math';

const square: Vec2[] = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 2 },
  { x: 0, y: 2 },
];

describe('geometry', () => {
  it('simplifyPolyline odstraní šum, zachová rohy', () => {
    // Lomená čára L s mezilehlým šumem ±0.01.
    const noisy: Vec2[] = [];
    for (let i = 0; i <= 20; i++) noisy.push({ x: i / 10, y: (i % 2) * 0.01 });
    for (let i = 1; i <= 20; i++) noisy.push({ x: 2, y: i / 10 + ((i % 2) * 0.01 - 0.005) });
    const out = simplifyPolyline(noisy, 0.05);
    expect(out.length).toBeLessThan(6);
    expect(out[0]).toEqual(noisy[0]);
    expect(out.at(-1)).toEqual(noisy.at(-1));
    // Roh u (2, 0) musí přežít.
    expect(out.some((p) => Math.abs(p.x - 2) < 0.1 && Math.abs(p.y) < 0.1)).toBe(true);
  });

  it('simplifyPolyline zvládne uzavřený tah (start == konec)', () => {
    // Trojúhelník nakreslený od ruky, který končí přesně ve startu.
    const loop: Vec2[] = [];
    const corners = [
      { x: 0, y: 0 },
      { x: 1, y: 1.5 },
      { x: 2, y: 0 },
      { x: 0, y: 0 },
    ];
    for (let leg = 0; leg < 3; leg++) {
      const a = corners[leg]!;
      const b = corners[leg + 1]!;
      for (let i = 0; i < 8; i++) {
        loop.push({ x: a.x + ((b.x - a.x) * i) / 8, y: a.y + ((b.y - a.y) * i) / 8 });
      }
    }
    loop.push({ x: 0, y: 0 });
    const out = simplifyPolyline(loop, 0.05);
    // Musí přežít všechny tři rohy (start/konec + 2 vnitřní vrcholy).
    expect(out.length).toBeGreaterThanOrEqual(4);
    expect(out.some((p) => Math.abs(p.x - 1) < 0.15 && Math.abs(p.y - 1.5) < 0.15)).toBe(true);
    expect(out.some((p) => Math.abs(p.x - 2) < 0.15 && Math.abs(p.y) < 0.15)).toBe(true);
  });

  it('plocha a těžiště čtverce', () => {
    expect(polygonArea(square)).toBeCloseTo(4, 9);
    const c = polygonCentroid(square);
    expect(c.x).toBeCloseTo(1, 9);
    expect(c.y).toBeCloseTo(1, 9);
    // CW orientace → záporná plocha.
    expect(polygonArea([...square].reverse())).toBeCloseTo(-4, 9);
  });

  it('isSimplePolygon pozná motýlka', () => {
    expect(isSimplePolygon(square)).toBe(true);
    const bowtie: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ];
    expect(isSimplePolygon(bowtie)).toBe(false);
  });

  it('dekompozice konkávního L na konvexní kusy', () => {
    const L: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ];
    const pieces = decomposePolygon(L);
    expect(pieces.length).toBeGreaterThanOrEqual(2);
    // Součet ploch kusů = plocha L (3 m²).
    const total = pieces.reduce((acc, piece) => acc + Math.abs(polygonArea(piece)), 0);
    expect(total).toBeCloseTo(3, 6);
  });

  it('self-intersekce → fallback na konvexní obal', () => {
    const bowtie: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ];
    const pieces = decomposePolygon(bowtie);
    expect(pieces.length).toBe(1);
    expect(Math.abs(polygonArea(pieces[0]!))).toBeCloseTo(4, 6); // obal = čtverec 2×2
    expect(convexHull(bowtie).length).toBe(4);
  });
});
