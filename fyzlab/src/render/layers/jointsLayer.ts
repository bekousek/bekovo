/**
 * Vrstva kloubů: čep (kroužek s tečkou), pružina (zigzag), fixace (svorka).
 * Kreslí se každý frame z póz těles v BodiesLayer (interpolované), takže
 * grafika kloubů sedí přesně na vykreslených tělesech. Velikosti symbolů
 * jsou ve screen px — čitelné a ťuknutelné při libovolném zoomu.
 */
import { Graphics } from 'pixi.js';
import { jointWorldAnchors, type PoseGetter } from '@engine/scene/jointGeom';
import type { Joint, SceneDoc } from '@engine/scene/schema';
import { DRAW_SCALE as S } from './bodiesLayer';

const COLOR = 0x334155;
const MOTOR_COLOR = 0xd97706;

function drawSpring(
  g: Graphics,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: (n: number) => number,
): void {
  g.circle(ax, ay, px(2.6)).fill({ color: COLOR, alpha: 0.9 });
  g.circle(bx, by, px(2.6)).fill({ color: COLOR, alpha: 0.9 });

  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const amp = px(5);
  const lead = Math.min(len * 0.18, px(12));
  const innerLen = len - 2 * lead;

  const COILS = 8;
  g.moveTo(ax, ay).lineTo(ax + ux * lead, ay + uy * lead);
  if (innerLen > 1e-6) {
    for (let i = 0; i < COILS; i++) {
      const t = lead + innerLen * ((i + 0.5) / COILS);
      const side = i % 2 === 0 ? 1 : -1;
      g.lineTo(ax + ux * t + nx * amp * side, ay + uy * t + ny * amp * side);
    }
  }
  g.lineTo(bx - ux * lead, by - uy * lead)
    .lineTo(bx, by)
    .stroke({ width: px(1.8), color: COLOR, alpha: 0.9 });
}

export class JointsLayer {
  readonly g = new Graphics();
  private joints: Joint[] = [];
  private lastEmpty = true;

  constructor() {
    this.g.scale.set(1 / S);
  }

  /** Obnoví seznam kloubů z dokumentu (volá se při každé změně docu). */
  setScene(doc: SceneDoc): void {
    this.joints = doc.entities.filter((e): e is Joint => e.kind === 'joint');
  }

  draw(getPose: PoseGetter, pixelsPerMeter: number): void {
    if (this.joints.length === 0) {
      if (!this.lastEmpty) this.g.clear();
      this.lastEmpty = true;
      return;
    }
    this.lastEmpty = false;

    const g = this.g;
    g.clear();
    const px = (n: number) => (n / pixelsPerMeter) * S;

    for (const j of this.joints) {
      const anchors = jointWorldAnchors(j, getPose);
      if (!anchors) continue;
      const bx = anchors.b.x * S;
      const by = anchors.b.y * S;

      switch (j.type) {
        case 'axle': {
          g.circle(bx, by, px(7))
            .fill({ color: 0xffffff, alpha: 0.9 })
            .stroke({ width: px(2), color: COLOR, alpha: 0.9 });
          g.circle(bx, by, px(2.2)).fill({ color: COLOR, alpha: 0.95 });
          if (j.axle?.enabled) {
            // Oblouk = poháněná osa (motor). moveTo na start oblouku, jinak
            // canvas sémantika dokreslí spojnici od minulého bodu cesty.
            const r = px(10.5);
            const a0 = -Math.PI * 0.2;
            g.moveTo(bx + r * Math.cos(a0), by + r * Math.sin(a0))
              .arc(bx, by, r, a0, Math.PI * 0.8)
              .stroke({ width: px(1.6), color: MOTOR_COLOR, alpha: 0.95 });
          }
          break;
        }
        case 'spring': {
          drawSpring(g, anchors.a.x * S, anchors.a.y * S, bx, by, px);
          break;
        }
        case 'fixed': {
          const size = px(6);
          g.rect(bx - size, by - size, size * 2, size * 2)
            .fill({ color: 0xffffff, alpha: 0.9 })
            .stroke({ width: px(1.8), color: COLOR, alpha: 0.9 });
          g.moveTo(bx - size * 0.55, by - size * 0.55)
            .lineTo(bx + size * 0.55, by + size * 0.55)
            .moveTo(bx - size * 0.55, by + size * 0.55)
            .lineTo(bx + size * 0.55, by - size * 0.55)
            .stroke({ width: px(1.4), color: COLOR, alpha: 0.9 });
          break;
        }
      }
    }
  }
}
