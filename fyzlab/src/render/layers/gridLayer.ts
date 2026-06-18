/**
 * Metrová mřížka + osy. Kreslí se ve screen-space; překresluje se jen
 * při změně kamery nebo viewportu.
 */
import { Graphics } from 'pixi.js';
import type { Camera } from '@editor/camera';

const MINOR_COLOR = 0xe2e8f0;
const MAJOR_COLOR = 0xcbd5e1;
const AXIS_COLOR = 0x94a3b8;

/** Krok mřížky 1-2-5×10ⁿ tak, aby major rozestup byl ≥ ~70 px. */
export function niceStep(pixelsPerMeter: number): number {
  const targetMeters = 70 / pixelsPerMeter;
  const pow = 10 ** Math.floor(Math.log10(targetMeters));
  for (const m of [1, 2, 5, 10]) {
    if (pow * m >= targetMeters) return pow * m;
  }
  return pow * 10;
}

export class GridLayer {
  readonly g = new Graphics();
  private lastKey = '';

  draw(camera: Camera): void {
    const key = `${camera.center.x}|${camera.center.y}|${camera.pixelsPerMeter}|${camera.viewportW}|${camera.viewportH}`;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const g = this.g;
    g.clear();

    const rect = camera.visibleWorldRect();
    const step = niceStep(camera.pixelsPerMeter);
    const minor = step / 5;
    const drawMinor = minor * camera.pixelsPerMeter >= 11;

    const w = camera.viewportW;
    const h = camera.viewportH;

    if (drawMinor) {
      for (let x = Math.ceil(rect.minX / minor) * minor; x <= rect.maxX; x += minor) {
        const sx = camera.worldToScreenX(x);
        g.moveTo(sx, 0).lineTo(sx, h);
      }
      for (let y = Math.ceil(rect.minY / minor) * minor; y <= rect.maxY; y += minor) {
        const sy = camera.worldToScreenY(y);
        g.moveTo(0, sy).lineTo(w, sy);
      }
      g.stroke({ width: 1, color: MINOR_COLOR });
    }

    for (let x = Math.ceil(rect.minX / step) * step; x <= rect.maxX; x += step) {
      const sx = camera.worldToScreenX(x);
      g.moveTo(sx, 0).lineTo(sx, h);
    }
    for (let y = Math.ceil(rect.minY / step) * step; y <= rect.maxY; y += step) {
      const sy = camera.worldToScreenY(y);
      g.moveTo(0, sy).lineTo(w, sy);
    }
    g.stroke({ width: 1, color: MAJOR_COLOR });

    // Osy světa
    const ax = camera.worldToScreenX(0);
    const ay = camera.worldToScreenY(0);
    if (ax >= 0 && ax <= w) g.moveTo(ax, 0).lineTo(ax, h);
    if (ay >= 0 && ay <= h) g.moveTo(0, ay).lineTo(w, ay);
    g.stroke({ width: 1.5, color: AXIS_COLOR });
  }
}
