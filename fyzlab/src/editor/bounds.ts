/** Světové AABB těles — pro marquee výběr a úchopy transformací. */
import { rotate, type AABB, type Vec2 } from '@engine/core/math';
import type { Body, Shape } from '@engine/scene/schema';

export interface Pose {
  x: number;
  y: number;
  angle: number;
}

function expand(aabb: AABB, p: Vec2): void {
  if (p.x < aabb.minX) aabb.minX = p.x;
  if (p.y < aabb.minY) aabb.minY = p.y;
  if (p.x > aabb.maxX) aabb.maxX = p.x;
  if (p.y > aabb.maxY) aabb.maxY = p.y;
}

const EMPTY = (): AABB => ({
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
});

/** AABB tvaru ve světě; null pro nekonečnou rovinu. */
export function shapeWorldAABB(shape: Shape, pose: Pose): AABB | null {
  const out = EMPTY();
  const at = (lx: number, ly: number) => {
    const r = rotate({ x: lx, y: ly }, pose.angle);
    return { x: pose.x + r.x, y: pose.y + r.y };
  };
  switch (shape.type) {
    case 'circle': {
      const c = at(shape.offset.x, shape.offset.y);
      return { minX: c.x - shape.r, minY: c.y - shape.r, maxX: c.x + shape.r, maxY: c.y + shape.r };
    }
    case 'box': {
      for (const corner of [
        { x: -shape.hw, y: -shape.hh },
        { x: shape.hw, y: -shape.hh },
        { x: shape.hw, y: shape.hh },
        { x: -shape.hw, y: shape.hh },
      ]) {
        const local = rotate(corner, shape.angle);
        expand(out, at(shape.offset.x + local.x, shape.offset.y + local.y));
      }
      return out;
    }
    case 'polygon': {
      for (const p of shape.points) expand(out, at(p.x, p.y));
      return out;
    }
    case 'plane':
      return null;
  }
}

/** AABB tělesa ve světě; null pro tělesa složená jen z rovin. */
export function bodyWorldAABB(body: Body, pose: Pose): AABB | null {
  let acc: AABB | null = null;
  for (const shape of body.shapes) {
    const a = shapeWorldAABB(shape, pose);
    if (!a) continue;
    if (!acc) acc = { ...a };
    else {
      acc.minX = Math.min(acc.minX, a.minX);
      acc.minY = Math.min(acc.minY, a.minY);
      acc.maxX = Math.max(acc.maxX, a.maxX);
      acc.maxY = Math.max(acc.maxY, a.maxY);
    }
  }
  return acc;
}

export function aabbsOverlap(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
