/**
 * Kamera: převod svět (metry, y-up) ↔ obrazovka (pixely, y-down).
 * Nástroje nikdy nevidí pixely — PointerManager převádí přes kameru.
 */
import { clamp, type AABB, type Vec2 } from '@engine/core/math';

const MIN_PPM = 2; // 2 px/m — pohled na ~500 m světa
const MAX_PPM = 5000; // 5000 px/m — pohled na milimetry

export class Camera {
  readonly center: Vec2;
  pixelsPerMeter = 100;
  viewportW = 1;
  viewportH = 1;

  private initialized = false;

  constructor(
    center: Vec2,
    /** Kolik metrů světa se má vejít na výšku obrazovky (z dokumentu scény). */
    private readonly desiredMetersPerScreenH: number,
  ) {
    this.center = { x: center.x, y: center.y };
  }

  /** Kolik metrů světa je vidět na výšku — pro uložení pohledu do dokumentu. */
  get metersPerScreenH(): number {
    return this.viewportH > 1
      ? this.viewportH / this.pixelsPerMeter
      : this.desiredMetersPerScreenH;
  }

  /** Převzetí kamery z načteného dokumentu (soubor/URL). */
  setFromDoc(center: Vec2, metersPerScreenH: number): void {
    this.center.x = center.x;
    this.center.y = center.y;
    if (this.viewportH > 1) {
      this.pixelsPerMeter = clamp(this.viewportH / metersPerScreenH, MIN_PPM, MAX_PPM);
    }
  }

  setViewport(w: number, h: number): void {
    if (w === this.viewportW && h === this.viewportH) return;
    this.viewportW = Math.max(1, w);
    this.viewportH = Math.max(1, h);
    if (!this.initialized && h > 1) {
      this.pixelsPerMeter = this.viewportH / this.desiredMetersPerScreenH;
      this.initialized = true;
    }
  }

  worldToScreenX(wx: number): number {
    return (wx - this.center.x) * this.pixelsPerMeter + this.viewportW / 2;
  }

  worldToScreenY(wy: number): number {
    return this.viewportH / 2 - (wy - this.center.y) * this.pixelsPerMeter;
  }

  worldToScreen(p: Vec2): Vec2 {
    return { x: this.worldToScreenX(p.x), y: this.worldToScreenY(p.y) };
  }

  screenToWorld(p: Vec2): Vec2 {
    return {
      x: (p.x - this.viewportW / 2) / this.pixelsPerMeter + this.center.x,
      y: (this.viewportH / 2 - p.y) / this.pixelsPerMeter + this.center.y,
    };
  }

  /** Posun kamery o vektor v pixelech obrazovky (drag pozadí). */
  panByScreen(dx: number, dy: number): void {
    this.center.x -= dx / this.pixelsPerMeter;
    this.center.y += dy / this.pixelsPerMeter;
  }

  /** Zoom se zachováním světového bodu pod kurzorem/prsty. */
  zoomAt(screenPoint: Vec2, factor: number): void {
    const before = this.screenToWorld(screenPoint);
    this.pixelsPerMeter = clamp(this.pixelsPerMeter * factor, MIN_PPM, MAX_PPM);
    const after = this.screenToWorld(screenPoint);
    this.center.x += before.x - after.x;
    this.center.y += before.y - after.y;
  }

  visibleWorldRect(): AABB {
    const halfW = this.viewportW / 2 / this.pixelsPerMeter;
    const halfH = this.viewportH / 2 / this.pixelsPerMeter;
    return {
      minX: this.center.x - halfW,
      minY: this.center.y - halfH,
      maxX: this.center.x + halfW,
      maxY: this.center.y + halfH,
    };
  }
}
