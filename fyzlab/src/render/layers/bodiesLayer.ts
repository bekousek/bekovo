/**
 * Vrstva těles: jeden Pixi Graphics na těleso, geometrie kreslená
 * v lokálních metrech (world container řeší měřítko a y-flip).
 * Per-frame se mění jen transformy z interpolovaného snapshotu.
 */
import { Container, Graphics } from 'pixi.js';
import { lerp, lerpAngle, rotate } from '@engine/core/math';
import { BODY_STRIDE } from '@engine/snapshot/layout';
import type { Body, SceneDoc, Shape } from '@engine/scene/schema';
import type { Sample } from '../Interpolator';

/** Musí odpovídat náhradnímu kvádru v RigidModule. */
const PLANE_HALF_WIDTH = 2000;
const PLANE_HALF_DEPTH = 100;

/**
 * Geometrie se kreslí ve zvětšeném měřítku (1 m = 100 jednotek) a Graphics
 * se zmenší zpět — Pixi teseluje oblouky podle lokální velikosti, takže
 * kruh o r=0.3 by jinak vyšel hranatý. Sdílí i overlay vrstva.
 */
export const DRAW_SCALE = 100;

const STROKE = { width: 0.02 * DRAW_SCALE, color: 0x0f172a, alpha: 0.35 } as const;

function drawShape(g: Graphics, shape: Shape, fill: string): void {
  const S = DRAW_SCALE;
  switch (shape.type) {
    case 'circle': {
      const x = shape.offset.x * S;
      const y = shape.offset.y * S;
      const r = shape.r * S;
      g.circle(x, y, r).fill(fill).stroke(STROKE);
      // „Paprsek" — zviditelňuje rotaci kruhu.
      g.moveTo(x, y)
        .lineTo(x + r * 0.92, y)
        .stroke({ width: Math.max(0.015 * S, r * 0.08), color: 0x0f172a, alpha: 0.3 });
      return;
    }
    case 'box': {
      const pts: number[] = [];
      const corners = [
        { x: -shape.hw, y: -shape.hh },
        { x: shape.hw, y: -shape.hh },
        { x: shape.hw, y: shape.hh },
        { x: -shape.hw, y: shape.hh },
      ];
      for (const c of corners) {
        const r = rotate(c, shape.angle);
        pts.push((shape.offset.x + r.x) * S, (shape.offset.y + r.y) * S);
      }
      g.poly(pts).fill(fill).stroke(STROKE);
      return;
    }
    case 'polygon': {
      const pts: number[] = [];
      for (const p of shape.points) pts.push(p.x * S, p.y * S);
      g.poly(pts).fill(fill).stroke(STROKE);
      return;
    }
    case 'plane': {
      g.rect(
        -PLANE_HALF_WIDTH * S,
        -2 * PLANE_HALF_DEPTH * S,
        2 * PLANE_HALF_WIDTH * S,
        2 * PLANE_HALF_DEPTH * S,
      ).fill(fill);
      g.moveTo(-PLANE_HALF_WIDTH * S, 0)
        .lineTo(PLANE_HALF_WIDTH * S, 0)
        .stroke({ width: 0.04 * S, color: 0x334155, alpha: 0.8 });
      return;
    }
  }
}

export class BodiesLayer {
  readonly container = new Container();
  private items: Graphics[] = [];
  private indexById = new Map<string, number>();

  /** Přestaví display objekty podle dokumentu a pořadí idTable. */
  setScene(doc: SceneDoc, ids: readonly string[]): void {
    for (const g of this.items) g.destroy();
    this.container.removeChildren();
    this.items = [];
    this.indexById.clear();

    const byId = new Map<string, Body>();
    for (const e of doc.entities) {
      if (e.kind === 'body') byId.set(e.id, e);
    }

    ids.forEach((id, index) => {
      const body = byId.get(id);
      const g = new Graphics();
      if (body) {
        for (const shape of body.shapes) drawShape(g, shape, body.appearance.fill);
      }
      g.scale.set(1 / DRAW_SCALE);
      this.container.addChild(g);
      this.items.push(g);
      this.indexById.set(id, index);
    });
  }

  /** Aplikuje interpolované pozice ze snapshotů. */
  apply(sample: Sample): void {
    const curr = sample.curr.bodies;
    const prev = sample.prev?.bodies ?? null;
    const a = sample.alpha;
    const n = Math.min(this.items.length, sample.curr.bodyCount);

    for (let i = 0; i < n; i++) {
      const g = this.items[i]!;
      const o = i * BODY_STRIDE;
      const cx = curr[o]!;
      const cy = curr[o + 1]!;
      const cang = curr[o + 2]!;
      if (prev) {
        g.position.set(lerp(prev[o]!, cx, a), lerp(prev[o + 1]!, cy, a));
        g.rotation = lerpAngle(prev[o + 2]!, cang, a);
      } else {
        g.position.set(cx, cy);
        g.rotation = cang;
      }
    }
  }

  indexOf(id: string): number | undefined {
    return this.indexById.get(id);
  }

  /** Vykreslená (interpolovaná) póza tělesa — pro vrstvu kloubů. */
  poseOf(id: string): { x: number; y: number; angle: number } | null {
    const index = this.indexById.get(id);
    if (index === undefined) return null;
    const g = this.items[index]!;
    return { x: g.position.x, y: g.position.y, angle: g.rotation };
  }

  /** Překreslí geometrii/vzhled jednoho tělesa (transform řeší snapshot). */
  updateEntity(body: Body): void {
    const index = this.indexById.get(body.id);
    if (index === undefined) return;
    const g = this.items[index]!;
    g.clear();
    for (const shape of body.shapes) drawShape(g, shape, body.appearance.fill);
  }
}
