/** Přichytávání k mřížce a úhlům. Krok sleduje aktuální zoom (minor mřížku). */
import type { Vec2 } from '@engine/core/math';
import { niceStep } from '@render/layers/gridLayer';
import type { Camera } from './camera';

const ANGLE_STEP = Math.PI / 12; // 15°

export class SnapService {
  enabled = true;

  constructor(private readonly camera: Camera) {}

  /** Krok pro snap = minor krok mřížky (1/5 major). */
  gridStep(): number {
    return niceStep(this.camera.pixelsPerMeter) / 5;
  }

  point(p: Vec2): Vec2 {
    if (!this.enabled) return p;
    const s = this.gridStep();
    return { x: Math.round(p.x / s) * s, y: Math.round(p.y / s) * s };
  }

  length(d: number): number {
    if (!this.enabled) return d;
    const s = this.gridStep();
    return Math.max(s, Math.round(d / s) * s);
  }

  angle(a: number): number {
    if (!this.enabled) return a;
    return Math.round(a / ANGLE_STEP) * ANGLE_STEP;
  }

  /** Převod px tolerance na metry při aktuálním zoomu. */
  pxToWorld(px: number): number {
    return px / this.camera.pixelsPerMeter;
  }
}
