/**
 * Vrstva přístrojů: fotobrána = čárkovaný paprsek s koncovkami.
 * Statická geometrie (mění se jen s dokumentem a zoomem) — překresluje se
 * při změně reference seznamu nebo ppm.
 */
import { Graphics } from 'pixi.js';
import { rotate } from '@engine/core/math';
import type { Instrument, SceneDoc } from '@engine/scene/schema';
import { DRAW_SCALE as S } from './bodiesLayer';

const COLOR = 0xdc2626; // červený „laser" paprsek
const DASHES = 9;

export class InstrumentsLayer {
  readonly g = new Graphics();
  private gates: Instrument[] = [];
  private lastKey = '';

  constructor() {
    this.g.scale.set(1 / S);
  }

  setScene(doc: SceneDoc): void {
    this.gates = doc.entities.filter(
      (e): e is Instrument => e.kind === 'instrument' && e.type === 'photogate',
    );
    this.lastKey = ''; // vynutit překreslení
  }

  draw(pixelsPerMeter: number): void {
    // setScene nuluje lastKey; jinak se překresluje jen při změně zoomu.
    const key = `${pixelsPerMeter.toFixed(2)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const g = this.g;
    g.clear();
    if (this.gates.length === 0) return;
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
  }
}
