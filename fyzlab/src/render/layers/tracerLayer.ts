/**
 * Tracer — tenká stopa pohybu dynamických těles (posledních TRACE_LEN poloh).
 * Kreslí se do world containeru (souřadnice v metrech, y-up).
 */
import { Graphics } from 'pixi.js';
import type { SceneDoc, Body } from '@engine/scene/schema';

/** Velikost kruhového bufferu poloh na těleso (~5 s při 60 fps). */
const TRACE_LEN = 300;
/** Minimální pohyb pro přidání bodu [m] — filtruje duplicity v pauze. */
const MIN_DIST = 0.003;
const COLOR = 0x8b5cf6;

export class TracerLayer {
  readonly g = new Graphics();
  private dynamicIds: string[] = [];
  private traces = new Map<string, Array<{ x: number; y: number }>>();

  setScene(doc: SceneDoc): void {
    this.dynamicIds = doc.entities
      .filter((e): e is Body => e.kind === 'body' && e.bodyType === 'dynamic')
      .map((e) => e.id);
    this.traces.clear();
    this.g.clear();
  }

  clear(): void {
    this.traces.clear();
    this.g.clear();
  }

  /** Zaznamenává aktuální polohu každého dynamického tělesa. */
  update(poseOf: (id: string) => { x: number; y: number } | null): void {
    for (const id of this.dynamicIds) {
      const pose = poseOf(id);
      if (!pose) continue;
      let pts = this.traces.get(id);
      if (!pts) {
        pts = [];
        this.traces.set(id, pts);
      }
      const last = pts[pts.length - 1];
      if (last && Math.hypot(pose.x - last.x, pose.y - last.y) < MIN_DIST) continue;
      pts.push({ x: pose.x, y: pose.y });
      if (pts.length > TRACE_LEN) pts.shift();
    }
  }

  /**
   * Kreslí stopu ve třech pásmech (starší = průhlednější).
   * Tři stroke volání na těleso udržují výkon i pro stovky bodů.
   */
  draw(pixelsPerMeter: number): void {
    const g = this.g;
    g.clear();
    const lw = 1.8 / pixelsPerMeter;

    for (const pts of this.traces.values()) {
      const n = pts.length;
      if (n < 2) continue;

      const b1 = Math.floor(n * 0.4);
      const b2 = Math.floor(n * 0.75);

      const drawBand = (from: number, to: number, alpha: number) => {
        if (to - from < 2) return;
        g.moveTo(pts[from]!.x, pts[from]!.y);
        for (let i = from + 1; i < to; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
        g.stroke({ width: lw, color: COLOR, alpha });
      };

      drawBand(0, b1, 0.15);
      drawBand(b1, b2, 0.42);
      drawBand(b2, n, 0.75);
    }
  }
}
