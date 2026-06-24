/**
 * FBD vrstva — šipky sil působících na vybrané těleso (free-body diagram).
 * Všechny síly kreslíme z těžiště tělesa (učebnicový diagram bodového tělesa).
 * Délky jsou normované: největší síla = pevná délka na obrazovce, ostatní
 * úměrně — diagram je čitelný bez ohledu na měřítko hmotnosti. Magnitudy v N
 * vypisuje React panel (FbdPanel) podle stejných barev.
 */
import { Graphics } from 'pixi.js';
import type { FbdForceKind, FbdForce } from '@engine/rigid/fbd';

/** Barvy podle druhu síly — sdílí Pixi vrstva i legenda (CSS hex). */
export const FBD_COLOR_HEX: Record<FbdForceKind, string> = {
  gravity: '#dc2626',
  buoyancy: '#2563eb',
  drag: '#ea580c',
  spring: '#7c3aed',
  thruster: '#16a34a',
};

const FBD_COLOR_NUM: Record<FbdForceKind, number> = {
  gravity: 0xdc2626,
  buoyancy: 0x2563eb,
  drag: 0xea580c,
  spring: 0x7c3aed,
  thruster: 0x16a34a,
};

/** Délka nejsilnější šipky na obrazovce [px]. */
const MAX_ARROW_PX = 78;
/** Síly slabší než tento zlomek maxima nekreslíme (vizuální šum). */
const MIN_FRACTION = 0.04;

export class FbdLayer {
  readonly g = new Graphics();
  private lastEmpty = true;

  /**
   * @param center  těžiště tělesa v metrech (živá interpolovaná póza), null = skryto
   * @param forces  silový rozklad [N]
   */
  draw(
    center: { x: number; y: number } | null,
    forces: readonly FbdForce[],
    pixelsPerMeter: number,
  ): void {
    const g = this.g;
    if (!center || forces.length === 0) {
      if (!this.lastEmpty) g.clear();
      this.lastEmpty = true;
      return;
    }

    let maxMag = 0;
    for (const f of forces) maxMag = Math.max(maxMag, Math.hypot(f.fx, f.fy));
    if (maxMag < 1e-9) {
      if (!this.lastEmpty) g.clear();
      this.lastEmpty = true;
      return;
    }

    g.clear();
    this.lastEmpty = false;

    // px na newton tak, aby největší síla měla délku MAX_ARROW_PX.
    const pxPerN = MAX_ARROW_PX / maxMag;
    const lw = 2.6 / pixelsPerMeter;
    const headLen = 12 / pixelsPerMeter;
    const minMag = maxMag * MIN_FRACTION;

    for (const f of forces) {
      const mag = Math.hypot(f.fx, f.fy);
      if (mag < minMag) continue;
      const ux = f.fx / mag;
      const uy = f.fy / mag;
      const lenM = (mag * pxPerN) / pixelsPerMeter;

      const x1 = center.x + ux * lenM;
      const y1 = center.y + uy * lenM;
      // Hlavička: dvě křidélka 28° zpět od hrotu.
      const cos = Math.cos(Math.PI - 0.49);
      const sin = Math.sin(Math.PI - 0.49);
      const w1x = x1 + headLen * (ux * cos - uy * sin);
      const w1y = y1 + headLen * (ux * sin + uy * cos);
      const w2x = x1 + headLen * (ux * cos + uy * sin);
      const w2y = y1 + headLen * (-ux * sin + uy * cos);

      const color = FBD_COLOR_NUM[f.kind];
      g.moveTo(center.x, center.y)
        .lineTo(x1, y1)
        .moveTo(w1x, w1y)
        .lineTo(x1, y1)
        .lineTo(w2x, w2y)
        .stroke({ width: lw, color, alpha: 0.95 });
    }
  }

  clear(): void {
    this.g.clear();
    this.lastEmpty = true;
  }
}
