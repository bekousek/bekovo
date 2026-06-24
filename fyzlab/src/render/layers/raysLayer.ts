/**
 * RaysLayer — vizualizace optických paprsků (F3-A).
 *
 * Každý paprsek = barevná čára ve světových souřadnicích (metrech).
 * Barva závisí na vlnové délce (λ→RGB), intenzita řídí průhlednost.
 * Vrstva se kreslí do world containeru (y-up, metry → pixely řeší world.scale).
 *
 * Blending: normální (ne additivní). Plátno má světlé pozadí (#f8fafc) a
 * additivní blend by paprsky „rozsvítil do běla" (bílá + barva = bílá), takže
 * by byly neviditelné. Normální blend s barvou spektra je na světlém pozadí
 * čitelný.
 */
import { Graphics } from 'pixi.js';
import type { RaySegment } from '@engine/optics/OpticsModule';

/** Převod vlnové délky [nm] na RGB (0–255). Aproximace CIE 1931. */
function wavelengthToRgb(nm: number): { r: number; g: number; b: number } {
  // λ = 0 = bílá
  if (nm === 0) return { r: 255, g: 255, b: 255 };
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm >= 490 && nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm >= 580 && nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm >= 645 && nm <= 750) {
    r = 1;
  } else {
    // mimo viditelné spektrum — bílá
    return { r: 255, g: 255, b: 255 };
  }
  // Útlum na okrajích spektra
  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm >= 700 && nm <= 750) factor = 0.3 + 0.7 * (750 - nm) / 50;
  return {
    r: Math.round(r * factor * 255),
    g: Math.round(g * factor * 255),
    b: Math.round(b * factor * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

const RAY_WIDTH_M = 0.012; // tloušťka čáry v metrech (viditelná při libovolném zoomu)

export class RaysLayer {
  readonly g: Graphics;

  constructor() {
    this.g = new Graphics();
  }

  draw(segments: readonly RaySegment[], pixelsPerMeter: number): void {
    this.g.clear();
    if (segments.length === 0) return;

    // Graphics je dítě world containeru (měřítko = pixelsPerMeter), takže
    // tloušťka čáry je v METRECH. Chceme alespoň ~1,5 px na obrazovce při
    // libovolném zoomu → spodní mez 1,5/ppm metru. (Dřív se sem dosazovala
    // px hodnota, kterou pak world.scale roztáhl na metry → paprsek byl
    // místo čáry obří světelný klín.)
    const lineWidth = Math.max(RAY_WIDTH_M, 1.5 / pixelsPerMeter);

    for (const seg of segments) {
      const rgb = wavelengthToRgb(seg.wavelength);
      // Mírné ztmavení spektrálních barev (×0,82) zvedne kontrast na světlém
      // pozadí — čistá zelená/žlutá by jinak na bílé skoro zmizela.
      const color = rgbToHex(
        Math.round(rgb.r * 0.82),
        Math.round(rgb.g * 0.82),
        Math.round(rgb.b * 0.82),
      );
      const alpha = Math.max(0.4, Math.min(0.95, seg.intensity * 0.9));
      this.g
        .moveTo(seg.ox, seg.oy)
        .lineTo(seg.ex, seg.ey)
        .stroke({ width: lineWidth, color, alpha });
    }
  }

  /** Smaže vrstvu (nová scéna, pauza bez zdrojů). */
  clear(): void {
    this.g.clear();
  }
}
