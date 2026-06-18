/**
 * Vektory rychlosti — výuková vrstva. Šipka z těžiště ve směru v, délka
 * úměrná |v| (dráha za TIME_SCALE sekund), takže žák VIDÍ zrychlování.
 * Kreslí se per frame z posledního snapshotu (rychlosti se neinterpolují).
 */
import { Graphics } from 'pixi.js';
import { readBodyInto, type BodySnapshotView } from '@engine/snapshot/layout';
import type { Body, SceneDoc } from '@engine/scene/schema';
import { DRAW_SCALE as S } from './bodiesLayer';

const COLOR = 0x16a34a;
/** Šipka = dráha uražená za tento čas (5 m/s → 0,75 m šipka). */
const TIME_SCALE = 0.15;
const MIN_SPEED = 0.05;

export class VectorsLayer {
  readonly g = new Graphics();
  private bodies: Body[] = [];
  private scratch: BodySnapshotView = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, omega: 0 };
  private lastEmpty = true;

  constructor() {
    this.g.scale.set(1 / S);
  }

  setScene(doc: SceneDoc): void {
    this.bodies = doc.entities.filter(
      (e): e is Body => e.kind === 'body' && e.bodyType === 'dynamic',
    );
  }

  draw(
    latest: { bodies: Float32Array; bodyCount: number } | null,
    indexOf: (id: string) => number | undefined,
    pixelsPerMeter: number,
    showAll: boolean,
  ): void {
    const g = this.g;
    let drew = false;

    if (latest) {
      const px = (n: number) => (n / pixelsPerMeter) * S;
      for (const b of this.bodies) {
        if (!showAll && !b.appearance.showVelocity) continue;
        const index = indexOf(b.id);
        if (index === undefined || index >= latest.bodyCount) continue;
        const s = readBodyInto(latest.bodies, index, this.scratch);
        const speed = Math.hypot(s.vx, s.vy);
        if (speed < MIN_SPEED) continue;

        if (!drew) {
          g.clear();
          drew = true;
        }
        const x0 = s.x * S;
        const y0 = s.y * S;
        const x1 = (s.x + s.vx * TIME_SCALE) * S;
        const y1 = (s.y + s.vy * TIME_SCALE) * S;
        const ux = (x1 - x0) / (speed * TIME_SCALE * S);
        const uy = (y1 - y0) / (speed * TIME_SCALE * S);
        // Hlavička šipky: dvě křidélka 28° zpět od hrotu.
        const head = Math.min(speed * TIME_SCALE * S * 0.3, px(14));
        const cos = Math.cos(Math.PI - 0.49);
        const sin = Math.sin(Math.PI - 0.49);
        const w1 = { x: x1 + head * (ux * cos - uy * sin), y: y1 + head * (ux * sin + uy * cos) };
        const w2 = { x: x1 + head * (ux * cos + uy * sin), y: y1 + head * (-ux * sin + uy * cos) };

        g.moveTo(x0, y0)
          .lineTo(x1, y1)
          .moveTo(w1.x, w1.y)
          .lineTo(x1, y1)
          .lineTo(w2.x, w2.y)
          .stroke({ width: px(2.4), color: COLOR, alpha: 0.95 });
      }
    }

    if (!drew) {
      if (!this.lastEmpty) g.clear();
      this.lastEmpty = true;
      return;
    }
    this.lastEmpty = false;
  }
}
