/**
 * Kreslicí primitiva na pixelové mřížce. Všechno vrací seznam obdélníků
 * (Px), takže sprity i scény zůstávají ve stejném stylu a stejné paletě.
 */
import type { PalKey } from './palette';
import type { Px } from './sprites';

export const r = (x: number, y: number, w: number, h: number, c: PalKey): Px => [x, y, w, h, c];

/** Plný kruh po řádcích. */
export function disc(cx: number, cy: number, rad: number, c: PalKey): Px[] {
  const out: Px[] = [];
  for (let dy = -rad; dy <= rad; dy++) {
    const half = Math.floor(Math.sqrt(rad * rad - dy * dy + rad * 0.6));
    out.push([cx - half, cy + dy, half * 2 + 1, 1, c]);
  }
  return out;
}

/** Mezikruží o tloušťce t (vnější poloměr rad). */
export function ring(cx: number, cy: number, rad: number, t: number, c: PalKey): Px[] {
  const out: Px[] = [];
  const inner = rad - t;
  for (let dy = -rad; dy <= rad; dy++) {
    const ho = Math.floor(Math.sqrt(rad * rad - dy * dy + rad * 0.6));
    const hi2 = inner * inner - dy * dy + inner * 0.6;
    if (hi2 <= 0 || inner <= 0) { out.push([cx - ho, cy + dy, ho * 2 + 1, 1, c]); continue; }
    const hi = Math.floor(Math.sqrt(hi2));
    if (ho - hi > 0) {
      out.push([cx - ho, cy + dy, ho - hi, 1, c]);
      out.push([cx + hi + 1, cy + dy, ho - hi, 1, c]);
    }
  }
  return out;
}

/** Úsečka (Bresenham), tloušťka po pixelech. */
export function line(x0: number, y0: number, x1: number, y1: number, c: PalKey, t = 1): Px[] {
  const out: Px[] = [];
  let x = Math.round(x0), y = Math.round(y0);
  const xe = Math.round(x1), ye = Math.round(y1);
  const dx = Math.abs(xe - x), dy = -Math.abs(ye - y);
  const sx = x < xe ? 1 : -1, sy = y < ye ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    out.push([x, y, t, t, c]);
    if (x === xe && y === ye) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return out;
}

/** Větrák při pohledu zepředu: rám, lopatky, náboj. */
export function fan(cx: number, cy: number, rad: number, opts: { frame?: PalKey; blade?: PalKey; bg?: PalKey; hub?: PalKey; blades?: number } = {}): Px[] {
  const { frame = 'ink', blade = 'slate', bg = 'night', hub = 'ink', blades = 7 } = opts;
  const out: Px[] = [...disc(cx, cy, rad, bg), ...ring(cx, cy, rad, 1, frame)];
  const hubR = Math.max(2, Math.round(rad * 0.28));
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    // lopatka je mírně zahnutá: dvě úsečky s pootočením
    const a2 = a + 0.5;
    const mx = cx + Math.cos(a) * (rad * 0.62), my = cy + Math.sin(a) * (rad * 0.62);
    out.push(...line(cx + Math.cos(a) * hubR, cy + Math.sin(a) * hubR, mx, my, blade));
    out.push(...line(mx, my, cx + Math.cos(a2) * (rad - 2), cy + Math.sin(a2) * (rad - 2), blade));
  }
  out.push(...disc(cx, cy, hubR, hub), [cx - 1, cy - 1, 1, 1, 'slate']);
  return out;
}

/** Vodorovné proužky (žebra chladiče, mřížka). */
export function hstripes(x: number, y: number, w: number, h: number, step: number, c: PalKey, from = 0): Px[] {
  const out: Px[] = [];
  for (let yy = y + from; yy < y + h; yy += step) out.push([x, yy, w, 1, c]);
  return out;
}

/** Svislé proužky. */
export function vstripes(x: number, y: number, w: number, h: number, step: number, c: PalKey, from = 0): Px[] {
  const out: Px[] = [];
  for (let xx = x + from; xx < x + w; xx += step) out.push([xx, y, 1, h, c]);
  return out;
}

/** Mřížka teček (kontakty patice, perforace, piny). */
export function dots(x: number, y: number, w: number, h: number, step: number, c: PalKey, size = 1): Px[] {
  const out: Px[] = [];
  for (let yy = y; yy < y + h; yy += step) for (let xx = x; xx < x + w; xx += step) out.push([xx, yy, size, size, c]);
  return out;
}

/** Řada zlatých kontaktů s mezerou (zářezem) na pozici `notch`. */
export function fingers(x0: number, y: number, len: number, h: number, notch: number | null, c: PalKey = 'gold'): Px[] {
  const out: Px[] = [];
  for (let x = x0; x < x0 + len; x += 2) {
    if (notch !== null && x >= notch - 1 && x <= notch + 1) continue;
    out.push([x, y, 1, h, c]);
  }
  return out;
}

/** Obdélník s rámečkem (okraj jinou barvou). */
export function box(x: number, y: number, w: number, h: number, fill: PalKey, edge: PalKey): Px[] {
  return [[x, y, w, h, edge], [x + 1, y + 1, w - 2, h - 2, fill]];
}

/** Posun seznamu obdélníků. */
export function shift(px: readonly Px[], dx: number, dy: number): Px[] {
  return px.map(([x, y, w, h, c]) => [x + dx, y + dy, w, h, c] as Px);
}
