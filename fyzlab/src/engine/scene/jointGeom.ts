/**
 * Geometrie kloubů: světové polohy kotev z dokumentu + aktuálních póz těles.
 * Sdílí editor (hit-test, nástroje) i render (jointsLayer) — proto žije
 * headless v engine/scene.
 */
import { rotate, type Vec2 } from '../core/math';
import type { Joint } from './schema';

export interface PoseLike {
  x: number;
  y: number;
  angle: number;
}

export type PoseGetter = (id: string) => PoseLike | null;

export interface JointAnchorsWorld {
  /** Kotva strany A (svět); pro bodyA === null přímo anchorA. */
  a: Vec2;
  /** Kotva strany B (svět). */
  b: Vec2;
}

/** Světové polohy obou kotev kloubu; null, když chybí póza tělesa B. */
export function jointWorldAnchors(j: Joint, getPose: PoseGetter): JointAnchorsWorld | null {
  const poseB = getPose(j.bodyB);
  if (!poseB) return null;
  const rb = rotate(j.anchorB, poseB.angle);
  const b = { x: poseB.x + rb.x, y: poseB.y + rb.y };

  if (j.bodyA === null) return { a: { x: j.anchorA.x, y: j.anchorA.y }, b };
  const poseA = getPose(j.bodyA);
  if (!poseA) return { a: { x: b.x, y: b.y }, b };
  const ra = rotate(j.anchorA, poseA.angle);
  return { a: { x: poseA.x + ra.x, y: poseA.y + ra.y }, b };
}

/** Světový bod → lokální souřadnice tělesa s danou pózou. */
export function worldToLocal(p: Vec2, pose: PoseLike): Vec2 {
  return rotate({ x: p.x - pose.x, y: p.y - pose.y }, -pose.angle);
}
