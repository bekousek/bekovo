/**
 * Overlay: náhledy nástrojů, marquee a obrysy výběru. Kreslí se ve world
 * containeru v měřítku DRAW_SCALE (hladké oblouky), překresluje se jen
 * při změně verze zdroje nebo zoomu.
 */
import { Graphics } from 'pixi.js';
import { rotate } from '@engine/core/math';
import type { Shape } from '@engine/scene/schema';
import { DRAW_SCALE as S } from './bodiesLayer';
import type { OverlaySource } from './overlayTypes';

const ACCENT = 0x2563eb;
const PLANE_HALF_WIDTH = 2000;

function strokeShapeOutline(
  g: Graphics,
  shape: Shape,
  pose: { x: number; y: number; angle: number },
  width: number,
): void {
  const at = (lx: number, ly: number) => {
    const r = rotate({ x: lx, y: ly }, pose.angle);
    return { x: (pose.x + r.x) * S, y: (pose.y + r.y) * S };
  };
  switch (shape.type) {
    case 'circle': {
      const c = at(shape.offset.x, shape.offset.y);
      g.circle(c.x, c.y, shape.r * S).stroke({ width, color: ACCENT, alpha: 0.95 });
      return;
    }
    case 'box': {
      const pts: number[] = [];
      for (const corner of [
        { x: -shape.hw, y: -shape.hh },
        { x: shape.hw, y: -shape.hh },
        { x: shape.hw, y: shape.hh },
        { x: -shape.hw, y: shape.hh },
      ]) {
        const local = rotate(corner, shape.angle);
        const p = at(shape.offset.x + local.x, shape.offset.y + local.y);
        pts.push(p.x, p.y);
      }
      g.poly(pts).stroke({ width, color: ACCENT, alpha: 0.95 });
      return;
    }
    case 'polygon': {
      const pts: number[] = [];
      for (const lp of shape.points) {
        const p = at(lp.x, lp.y);
        pts.push(p.x, p.y);
      }
      g.poly(pts).stroke({ width, color: ACCENT, alpha: 0.95 });
      return;
    }
    case 'plane': {
      const a = at(-PLANE_HALF_WIDTH, 0);
      const b = at(PLANE_HALF_WIDTH, 0);
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width, color: ACCENT, alpha: 0.95 });
      return;
    }
  }
}

export class OverlayLayer {
  readonly g = new Graphics();
  private lastKey = '';

  constructor() {
    this.g.scale.set(1 / S);
  }

  draw(src: OverlaySource, pixelsPerMeter: number): void {
    const key = `${src.version}|${pixelsPerMeter.toFixed(2)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const g = this.g;
    g.clear();

    const lw = (1.5 / pixelsPerMeter) * S; // ≈1,5 px nezávisle na zoomu

    const p = src.preview;
    if (p) {
      switch (p.kind) {
        case 'circle':
          g.circle(p.center.x * S, p.center.y * S, p.r * S)
            .fill({ color: p.fill, alpha: 0.4 })
            .stroke({ width: lw, color: ACCENT, alpha: 0.9 });
          break;
        case 'box': {
          const pts: number[] = [];
          for (const corner of [
            { x: -p.hw, y: -p.hh },
            { x: p.hw, y: -p.hh },
            { x: p.hw, y: p.hh },
            { x: -p.hw, y: p.hh },
          ]) {
            const r = rotate(corner, p.angle);
            pts.push((p.center.x + r.x) * S, (p.center.y + r.y) * S);
          }
          g.poly(pts).fill({ color: p.fill, alpha: 0.4 }).stroke({ width: lw, color: ACCENT, alpha: 0.9 });
          break;
        }
        case 'polyline': {
          if (p.points.length >= 2) {
            const first = p.points[0]!;
            g.moveTo(first.x * S, first.y * S);
            for (let i = 1; i < p.points.length; i++) {
              g.lineTo(p.points[i]!.x * S, p.points[i]!.y * S);
            }
            if (p.closed) g.closePath();
            if (p.points.length >= 3) {
              g.fill({ color: p.fill, alpha: 0.25 });
            }
            g.stroke({ width: lw, color: ACCENT, alpha: 0.9 });
          }
          break;
        }
        case 'line':
          g.moveTo(p.a.x * S, p.a.y * S)
            .lineTo(p.b.x * S, p.b.y * S)
            .stroke({ width: lw * 1.4, color: 0x475569, alpha: 0.8 });
          break;
      }
    }

    if (src.marquee) {
      const m = src.marquee;
      g.rect(m.minX * S, m.minY * S, (m.maxX - m.minX) * S, (m.maxY - m.minY) * S)
        .fill({ color: ACCENT, alpha: 0.08 })
        .stroke({ width: lw, color: ACCENT, alpha: 0.7 });
    }

    for (const { body, pose } of src.selectedBodies()) {
      for (const shape of body.shapes) {
        strokeShapeOutline(g, shape, pose, lw * 1.3);
      }
    }

    // Vybrané přístroje: zvýraznit celý paprsek.
    for (const { a, b } of src.selectedInstruments()) {
      g.moveTo(a.x * S, a.y * S)
        .lineTo(b.x * S, b.y * S)
        .stroke({ width: lw * 3, color: ACCENT, alpha: 0.35 });
    }

    // Vybrané klouby: kroužek kolem kotvy (u pružiny oba konce + spojnice).
    for (const { a, b } of src.selectedJoints()) {
      const rPx = (px: number) => (px / pixelsPerMeter) * S;
      const apart = Math.hypot(a.x - b.x, a.y - b.y) > 1e-6;
      if (apart) {
        g.moveTo(a.x * S, a.y * S)
          .lineTo(b.x * S, b.y * S)
          .stroke({ width: lw, color: ACCENT, alpha: 0.5 });
        g.circle(a.x * S, a.y * S, rPx(9)).stroke({ width: lw * 1.3, color: ACCENT, alpha: 0.95 });
      }
      g.circle(b.x * S, b.y * S, rPx(11)).stroke({ width: lw * 1.3, color: ACCENT, alpha: 0.95 });
    }

    // Úchopy transformací (rotace nahoře, škálování v rohu).
    const h = src.handles((px) => px / pixelsPerMeter);
    if (h) {
      const rPx = (px: number) => (px / pixelsPerMeter) * S;
      // Rámeček výběru
      g.rect(h.aabb.minX * S, h.aabb.minY * S, (h.aabb.maxX - h.aabb.minX) * S, (h.aabb.maxY - h.aabb.minY) * S)
        .stroke({ width: lw * 0.8, color: ACCENT, alpha: 0.4 });
      // Stopka + rotační úchop
      g.moveTo(h.center.x * S, h.aabb.maxY * S)
        .lineTo(h.rotate.x * S, h.rotate.y * S)
        .stroke({ width: lw * 0.8, color: ACCENT, alpha: 0.5 });
      g.circle(h.rotate.x * S, h.rotate.y * S, rPx(13))
        .fill({ color: 0xffffff, alpha: 0.95 })
        .stroke({ width: lw * 1.2, color: ACCENT, alpha: 0.95 });
      g.circle(h.rotate.x * S, h.rotate.y * S, rPx(5)).fill({ color: ACCENT, alpha: 0.9 });
      // Škálovací úchop (čtvereček)
      const sSize = rPx(11);
      g.rect(h.scale.x * S - sSize, h.scale.y * S - sSize, sSize * 2, sSize * 2)
        .fill({ color: 0xffffff, alpha: 0.95 })
        .stroke({ width: lw * 1.2, color: ACCENT, alpha: 0.95 });
    }
  }
}
