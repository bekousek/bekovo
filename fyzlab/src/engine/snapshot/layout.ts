/**
 * Binární layout snapshotu simulace (Float32, transferable).
 *
 * Tělesa: pořadí záznamů = pořadí v idTable (worker ho posílá při změně
 * topologie). Fáze 3/4 přidají buffery `rays` a `particles`.
 */

export const BODY_STRIDE = 6; // x, y, angle, vx, vy, omega

export function bodiesByteLength(bodyCount: number): number {
  return bodyCount * BODY_STRIDE * Float32Array.BYTES_PER_ELEMENT;
}

/** Zapisovač — plní buffer sekvenčně v pořadí idTable. */
export class SnapshotWriter {
  readonly bodies: Float32Array;
  private cursor = 0;

  constructor(buffer: ArrayBuffer, bodyCount: number) {
    this.bodies = new Float32Array(buffer, 0, bodyCount * BODY_STRIDE);
  }

  pushBody(x: number, y: number, angle: number, vx: number, vy: number, omega: number): void {
    const b = this.bodies;
    const i = this.cursor;
    b[i] = x;
    b[i + 1] = y;
    b[i + 2] = angle;
    b[i + 3] = vx;
    b[i + 4] = vy;
    b[i + 5] = omega;
    this.cursor += BODY_STRIDE;
  }
}

export interface BodySnapshotView {
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  omega: number;
}

/** Alokačně líné čtení jednoho tělesa (pro hit-testy apod.). */
export function readBodyInto(
  arr: Float32Array,
  index: number,
  out: BodySnapshotView,
): BodySnapshotView {
  const i = index * BODY_STRIDE;
  out.x = arr[i]!;
  out.y = arr[i + 1]!;
  out.angle = arr[i + 2]!;
  out.vx = arr[i + 3]!;
  out.vy = arr[i + 4]!;
  out.omega = arr[i + 5]!;
  return out;
}
