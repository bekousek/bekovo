/**
 * Vrstva přístrojů: fotobrána = čárkovaný paprsek s koncovkami; optický zdroj
 * (laser/svazek/bod) = viditelný marker se šipkou směru. Statická geometrie
 * (mění se jen s dokumentem a zoomem) — překresluje se při změně reference
 * seznamu nebo ppm.
 */
import { Graphics } from 'pixi.js';
import { rotate } from '@engine/core/math';
import type { Instrument, OpticalSource, SceneDoc } from '@engine/scene/schema';
import { DRAW_SCALE as S } from './bodiesLayer';
import { wavelengthColor } from './raysLayer';

type PoseGetter = (id: string) => { x: number; y: number; angle: number } | null;

const COLOR = 0xdc2626; // červený „laser" paprsek
const DASHES = 9;

export class InstrumentsLayer {
  readonly g = new Graphics();
  private gates: Instrument[] = [];
  private sources: OpticalSource[] = [];
  private lastKey = '';

  constructor() {
    this.g.scale.set(1 / S);
  }

  setScene(doc: SceneDoc): void {
    this.gates = doc.entities.filter(
      (e): e is Instrument => e.kind === 'instrument' && e.type === 'photogate',
    );
    this.sources = doc.entities.filter((e): e is OpticalSource => e.kind === 'opticalSource');
    this.lastKey = ''; // vynutit překreslení
  }

  draw(pixelsPerMeter: number, poseOf: PoseGetter = () => null): void {
    // setScene nuluje lastKey; jinak se překresluje jen při změně zoomu.
    const key = `${pixelsPerMeter.toFixed(2)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const g = this.g;
    g.clear();
    const px = (n: number) => (n / pixelsPerMeter) * S;

    for (const gate of this.gates) {
      const d = rotate({ x: 0, y: 1 }, gate.transform.angle);
      const n = rotate({ x: 1, y: 0 }, gate.transform.angle);
      const L = gate.gate.halfLength;
      const cx = gate.transform.x;
      const cy = gate.transform.y;
      const ax = (cx - d.x * L) * S;
      const ay = (cy - d.y * L) * S;
      const bx = (cx + d.x * L) * S;
      const by = (cy + d.y * L) * S;

      // Čárkovaný paprsek.
      const segs = DASHES * 2 - 1;
      for (let i = 0; i < segs; i += 2) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        g.moveTo(ax + (bx - ax) * t0, ay + (by - ay) * t0)
          .lineTo(ax + (bx - ax) * t1, ay + (by - ay) * t1);
      }
      g.stroke({ width: px(1.8), color: COLOR, alpha: 0.85 });

      // Koncovky (vysílač/přijímač) — krátké příčky.
      const c = px(5);
      g.moveTo(ax - n.x * c, ay - n.y * c)
        .lineTo(ax + n.x * c, ay + n.y * c)
        .moveTo(bx - n.x * c, by - n.y * c)
        .lineTo(bx + n.x * c, by + n.y * c)
        .stroke({ width: px(3), color: 0x334155, alpha: 0.9 });
    }

    // Optické zdroje: pouzdro + barevné jádro + šipka směru paprsku.
    for (const src of this.sources) {
      let wx = src.transform.x;
      let wy = src.transform.y;
      let angle = src.transform.angle;
      if (src.parentId) {
        const pp = poseOf(src.parentId);
        if (pp) {
          const local = rotate({ x: src.transform.x, y: src.transform.y }, pp.angle);
          wx = pp.x + local.x;
          wy = pp.y + local.y;
          angle = pp.angle + src.transform.angle;
        }
      }
      const ox = wx * S;
      const oy = wy * S;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const core = src.wavelength === 0 ? 0xf1f5f9 : wavelengthColor(src.wavelength);

      // Šipka směru — kam laser míří.
      const stub = px(24);
      const tipx = ox + dx * stub;
      const tipy = oy + dy * stub;
      g.moveTo(ox, oy).lineTo(tipx, tipy).stroke({ width: px(3), color: core, alpha: 0.95 });
      const head = px(7);
      const pxn = -dy;
      const pyn = dx;
      g.moveTo(tipx, tipy)
        .lineTo(tipx - dx * head + pxn * head * 0.6, tipy - dy * head + pyn * head * 0.6)
        .moveTo(tipx, tipy)
        .lineTo(tipx - dx * head - pxn * head * 0.6, tipy - dy * head - pyn * head * 0.6)
        .stroke({ width: px(3), color: core, alpha: 0.95 });

      // Pouzdro zdroje + barevné jádro (aby bylo vidět, kde zdroj je).
      g.circle(ox, oy, px(9)).fill({ color: 0x334155, alpha: 0.95 });
      g.circle(ox, oy, px(5)).fill({ color: core, alpha: 1 });
    }
  }
}
