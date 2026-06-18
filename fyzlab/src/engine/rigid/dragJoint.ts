/**
 * Pružinové uchopení tělesa ukazatelem („mouse joint").
 *
 * Síla = kritickě tlumená pružina mezi kotevním bodem na tělese a cílem
 * pod prstem/kurzorem. Pružnost záměrně pohltí 1–2 framy latence z worker
 * round-tripu (dotykové tabule). Síla je omezená násobkem tíhy tělesa,
 * aby uchopení nemohlo simulaci rozstřelit.
 */
import type RAPIER from '@dimforge/rapier2d-deterministic-compat';
import { rotate, type Vec2 } from '../core/math';

export interface DragState {
  body: RAPIER.RigidBody;
  /** Kotevní bod v lokálních souřadnicích tělesa. */
  localAnchor: Vec2;
  /** Cíl ve světových souřadnicích (pozice ukazatele). */
  target: Vec2;
}

/** Vlastní frekvence pružiny [rad/s] — určuje „tuhost" úchopu. */
const OMEGA = 20;
/** Poměrné tlumení (1 = kritické). */
const ZETA = 1.0;
/** Strop síly v násobcích m·g — pojistka proti explozi. */
const MAX_FORCE_G = 40;

export function startDrag(body: RAPIER.RigidBody, worldPoint: Vec2): DragState {
  const pos = body.translation();
  const angle = body.rotation();
  const localAnchor = rotate({ x: worldPoint.x - pos.x, y: worldPoint.y - pos.y }, -angle);
  return { body, localAnchor, target: { x: worldPoint.x, y: worldPoint.y } };
}

export function applyDragForce(drag: DragState, dt: number): void {
  const { body, localAnchor, target } = drag;
  const m = body.mass();
  if (m <= 0) return;

  const pos = body.translation();
  const angle = body.rotation();
  const r = rotate(localAnchor, angle); // rameno od těžiště ke kotvě
  const anchorX = pos.x + r.x;
  const anchorY = pos.y + r.y;

  // Rychlost kotevního bodu: v + ω × r
  const lv = body.linvel();
  const om = body.angvel();
  const vAnchorX = lv.x - om * r.y;
  const vAnchorY = lv.y + om * r.x;

  const k = m * OMEGA * OMEGA;
  const c = 2 * ZETA * m * OMEGA;

  let fx = k * (target.x - anchorX) - c * vAnchorX;
  let fy = k * (target.y - anchorY) - c * vAnchorY;

  const fMax = m * 9.81 * MAX_FORCE_G;
  const fLen = Math.hypot(fx, fy);
  if (fLen > fMax) {
    const s = fMax / fLen;
    fx *= s;
    fy *= s;
  }

  body.applyImpulseAtPoint({ x: fx * dt, y: fy * dt }, { x: anchorX, y: anchorY }, true);
}
