import type { PalKey } from './palette';

/** Obdélník na pixelové mřížce: x, y, šířka, výška, barva. */
export type Px = readonly [number, number, number, number, PalKey];

export interface Art {
  w: number;
  h: number;
  px: readonly Px[];
}

const art = (w: number, h: number, px: Px[]): Art => ({ w, h, px });

/** Řada zlatých kontaktů s mezerou (zářezem) na pozici `notch`. */
function contacts(x0: number, y: number, len: number, notch: number | null, h = 2): Px[] {
  const out: Px[] = [];
  for (let x = x0; x < x0 + len; x += 2) {
    if (notch !== null && (x === notch || x === notch + 1)) continue;
    out.push([x, y, 1, h, 'gold']);
  }
  return out;
}

/** Zářez DDR5 je blíž středu, u DDR4 víc vlevo. Na stejné pozici je i přepážka ve slotu. */
export const NOTCH = { DDR5: 15, DDR4: 11 } as const;

function ramArt(mem: 'DDR4' | 'DDR5'): Art {
  const n = NOTCH[mem];
  const accent: PalKey = mem === 'DDR5' ? 'red' : 'gold';
  return art(32, 10, [
    [0, 0, 32, 6, 'ink'],
    [0, 0, 32, 1, 'slate'],
    [2, 2, 28, 1, 'slate'],
    [3, 3, 7, 1, accent],
    [0, 6, n, 2, 'teal'],
    [n + 2, 6, 32 - n - 2, 2, 'teal'],
    ...contacts(1, 8, 31, n),
  ]);
}

export const SPRITES = {
  cpu: art(16, 16, [
    [1, 1, 14, 14, 'teal'],
    [2, 2, 12, 12, 'silver'],
    [3, 3, 10, 10, 'white'],
    [4, 5, 8, 1, 'silver'],
    [4, 7, 5, 1, 'silver'],
    [4, 9, 7, 1, 'silver'],
    [1, 12, 1, 3, 'gold'],
    [2, 13, 1, 2, 'gold'],
    [3, 14, 1, 1, 'gold'],
  ]),
  mb: art(24, 24, [
    [0, 0, 24, 24, 'ink'],
    [1, 1, 22, 22, 'night'],
    [0, 3, 3, 10, 'silver'],
    [5, 3, 8, 8, 'slate'],
    [6, 4, 6, 6, 'silver'],
    [15, 2, 1, 12, 'slate'],
    [17, 2, 1, 12, 'silver'],
    [19, 2, 1, 12, 'slate'],
    [21, 2, 1, 12, 'silver'],
    [4, 13, 9, 2, 'teal'],
    [3, 17, 14, 2, 'slate'],
    [3, 20, 8, 1, 'slate'],
    [16, 16, 5, 5, 'slate'],
    [17, 17, 3, 3, 'ink'],
  ]),
  ram: ramArt('DDR5'),
  ramDdr4: ramArt('DDR4'),
  ssd: art(24, 7, [
    [0, 0, 23, 7, 'teal'],
    [23, 0, 1, 2, 'teal'],
    [23, 5, 1, 2, 'teal'],
    [3, 1, 12, 5, 'ink'],
    [4, 2, 6, 1, 'white'],
    [4, 4, 4, 1, 'slate'],
    [17, 1, 4, 5, 'slate'],
    [0, 1, 1, 1, 'gold'],
    [0, 3, 1, 1, 'gold'],
    [0, 5, 1, 1, 'gold'],
  ]),
  hdd: art(20, 14, [
    [0, 0, 20, 14, 'slate'],
    [1, 1, 18, 12, 'silver'],
    [3, 3, 10, 7, 'white'],
    [4, 4, 7, 1, 'blue'],
    [4, 6, 5, 1, 'slate'],
    [4, 8, 6, 1, 'slate'],
    [14, 8, 4, 4, 'slate'],
    [15, 9, 2, 2, 'ink'],
  ]),
  gpu: art(32, 13, [
    [0, 0, 30, 1, 'slate'],
    [0, 1, 30, 10, 'ink'],
    [5, 3, 6, 6, 'night'],
    [4, 4, 8, 4, 'night'],
    [7, 5, 2, 2, 'slate'],
    [6, 2, 4, 1, 'slate'],
    [6, 9, 4, 1, 'slate'],
    [19, 3, 6, 6, 'night'],
    [18, 4, 8, 4, 'night'],
    [21, 5, 2, 2, 'slate'],
    [20, 2, 4, 1, 'slate'],
    [20, 9, 4, 1, 'slate'],
    [13, 5, 3, 2, 'green'],
    [30, 0, 2, 13, 'silver'],
    [30, 3, 1, 2, 'night'],
    [30, 7, 1, 2, 'night'],
    [6, 11, 18, 2, 'teal'],
    ...contacts(7, 11, 16, null),
  ]),
  psu: art(20, 14, [
    [0, 0, 20, 14, 'ink'],
    [0, 0, 20, 1, 'slate'],
    [3, 2, 10, 10, 'night'],
    [4, 4, 8, 1, 'slate'],
    [4, 6, 8, 1, 'slate'],
    [4, 8, 8, 1, 'slate'],
    [4, 10, 8, 1, 'slate'],
    [15, 2, 3, 6, 'gold'],
    [16, 3, 1, 4, 'ink'],
    [15, 10, 3, 2, 'slate'],
  ]),
  case: art(16, 24, [
    [0, 0, 16, 24, 'ink'],
    [1, 1, 14, 22, 'night'],
    [3, 3, 10, 1, 'slate'],
    [3, 5, 10, 1, 'slate'],
    [3, 7, 10, 1, 'slate'],
    [3, 9, 10, 1, 'slate'],
    [3, 11, 10, 1, 'slate'],
    [3, 13, 10, 1, 'slate'],
    [7, 17, 2, 2, 'sky'],
    [5, 20, 2, 1, 'slate'],
    [9, 20, 2, 1, 'slate'],
  ]),
  cooler: art(16, 18, [
    [1, 0, 14, 14, 'silver'],
    [1, 1, 14, 1, 'slate'],
    [1, 3, 14, 1, 'slate'],
    [1, 5, 14, 1, 'slate'],
    [1, 7, 14, 1, 'slate'],
    [1, 9, 14, 1, 'slate'],
    [1, 11, 14, 1, 'slate'],
    [0, 2, 16, 11, 'ink'],
    [4, 3, 8, 9, 'night'],
    [3, 4, 10, 7, 'night'],
    [7, 6, 2, 3, 'slate'],
    [4, 14, 1, 3, 'orange'],
    [7, 14, 1, 3, 'orange'],
    [10, 14, 1, 3, 'orange'],
    [3, 16, 10, 2, 'slate'],
  ]),
  aio: art(24, 16, [
    [0, 0, 24, 6, 'ink'],
    [2, 1, 9, 4, 'night'],
    [13, 1, 9, 4, 'night'],
    [6, 2, 1, 2, 'slate'],
    [17, 2, 1, 2, 'slate'],
    [6, 6, 1, 5, 'night'],
    [16, 6, 1, 5, 'night'],
    [7, 10, 10, 6, 'ink'],
    [8, 11, 8, 4, 'night'],
    [11, 12, 2, 2, 'sky'],
  ]),
  osWin: art(14, 16, [
    [0, 0, 14, 16, 'blue'],
    [1, 1, 12, 14, 'navy'],
    [3, 4, 8, 7, 'white'],
    [3, 4, 8, 2, 'sky'],
    [4, 7, 4, 1, 'slate'],
    [4, 9, 6, 1, 'slate'],
    [3, 12, 8, 1, 'sky'],
  ]),
  osLinux: art(14, 16, [
    [0, 0, 14, 16, 'green'],
    [1, 1, 12, 14, 'teal'],
    [3, 4, 8, 7, 'night'],
    [4, 6, 1, 1, 'lime'],
    [5, 7, 1, 1, 'lime'],
    [4, 8, 1, 1, 'lime'],
    [7, 8, 3, 1, 'white'],
    [3, 12, 8, 1, 'lime'],
  ]),
  /** Konektory kabelů ze zdroje: každý má jiný tvar, jako ve skutečnosti. */
  plug24: art(8, 16, [
    [0, 0, 8, 12, 'ink'],
    [1, 1, 6, 10, 'night'],
    [2, 2, 1, 1, 'gold'], [5, 2, 1, 1, 'gold'], [2, 4, 1, 1, 'gold'], [5, 4, 1, 1, 'gold'],
    [2, 6, 1, 1, 'gold'], [5, 6, 1, 1, 'gold'], [2, 8, 1, 1, 'gold'], [5, 8, 1, 1, 'gold'],
    [8 - 8, 12, 8, 4, 'slate'],
    [2, 12, 1, 4, 'gold'], [5, 12, 1, 4, 'red'],
  ]),
  plug8: art(10, 10, [
    [0, 0, 10, 5, 'ink'],
    [1, 1, 8, 3, 'night'],
    [2, 2, 1, 1, 'gold'], [4, 2, 1, 1, 'gold'], [6, 2, 1, 1, 'gold'], [8, 2, 1, 1, 'gold'],
    [3, 5, 4, 5, 'slate'],
    [4, 5, 1, 5, 'gold'],
  ]),
  plugPcie: art(10, 10, [
    [0, 0, 10, 5, 'ink'],
    [1, 1, 8, 3, 'night'],
    [2, 2, 1, 1, 'lime'], [4, 2, 1, 1, 'lime'], [6, 2, 1, 1, 'lime'], [8, 2, 1, 1, 'lime'],
    [3, 5, 4, 5, 'slate'],
    [4, 5, 1, 5, 'lime'],
  ]),
  plugSata: art(10, 8, [
    [0, 0, 10, 3, 'ink'],
    [0, 3, 2, 1, 'ink'],
    [1, 1, 8, 1, 'gold'],
    [4, 3, 3, 5, 'slate'],
  ]),
  plugFan: art(6, 8, [
    [0, 0, 6, 3, 'white'],
    [1, 1, 1, 1, 'ink'], [3, 1, 1, 1, 'ink'],
    [2, 3, 2, 5, 'ink'],
  ]),
  hdmi: art(12, 8, [
    [0, 0, 6, 4, 'silver'],
    [1, 1, 4, 2, 'night'],
    [6, 0, 6, 4, 'ink'],
    [8, 4, 2, 4, 'ink'],
  ]),
  paste: art(14, 6, [
    [0, 1, 10, 4, 'silver'],
    [1, 2, 8, 2, 'white'],
    [10, 2, 2, 2, 'slate'],
    [12, 2, 2, 2, 'silver'],
  ]),
  usb: art(14, 6, [
    [0, 0, 10, 6, 'blue'],
    [1, 1, 3, 1, 'sky'],
    [10, 1, 4, 4, 'silver'],
    [11, 2, 1, 1, 'ink'],
    [12, 2, 1, 1, 'ink'],
  ]),
} as const;

export type SpriteKey = keyof typeof SPRITES;

/** Ikony 12×12, kreslené stejnou mřížkou jako díly (místo emoji). */
export const ICONS = {
  coin: art(12, 12, [
    [3, 0, 6, 12, 'gold'],
    [1, 2, 10, 8, 'gold'],
    [2, 1, 8, 10, 'gold'],
    [4, 2, 4, 8, 'orange'],
    [5, 3, 2, 6, 'gold'],
    [2, 3, 1, 3, 'white'],
  ]),
  cart: art(12, 12, [
    [0, 1, 2, 1, 'white'],
    [2, 1, 1, 7, 'white'],
    [3, 3, 9, 1, 'white'],
    [11, 3, 1, 4, 'white'],
    [3, 7, 9, 1, 'white'],
    [4, 4, 1, 3, 'silver'],
    [7, 4, 1, 3, 'silver'],
    [3, 9, 2, 2, 'white'],
    [9, 9, 2, 2, 'white'],
  ]),
  wrench: art(12, 12, [
    [7, 0, 4, 2, 'silver'],
    [9, 2, 3, 2, 'silver'],
    [6, 2, 3, 3, 'silver'],
    [5, 4, 2, 2, 'silver'],
    [4, 5, 2, 2, 'silver'],
    [3, 6, 2, 2, 'silver'],
    [2, 7, 2, 2, 'silver'],
    [1, 8, 2, 2, 'silver'],
    [0, 9, 2, 2, 'silver'],
  ]),
  book: art(12, 12, [
    [1, 1, 10, 10, 'red'],
    [2, 1, 1, 10, 'plum'],
    [4, 3, 5, 1, 'gold'],
    [4, 5, 4, 1, 'gold'],
    [3, 9, 8, 1, 'white'],
  ]),
  bag: art(12, 12, [
    [4, 1, 4, 1, 'silver'],
    [3, 2, 1, 2, 'silver'],
    [8, 2, 1, 2, 'silver'],
    [0, 4, 12, 7, 'orange'],
    [0, 7, 12, 1, 'red'],
    [5, 6, 2, 3, 'gold'],
  ]),
  home: art(12, 12, [
    [5, 0, 2, 1, 'white'],
    [4, 1, 4, 1, 'white'],
    [3, 2, 6, 1, 'white'],
    [2, 3, 8, 1, 'white'],
    [1, 4, 10, 1, 'white'],
    [2, 5, 8, 6, 'white'],
    [5, 7, 2, 4, 'ink'],
  ]),
  check: art(12, 12, [
    [9, 2, 2, 2, 'lime'],
    [8, 4, 2, 2, 'lime'],
    [7, 5, 2, 2, 'lime'],
    [6, 6, 2, 2, 'lime'],
    [5, 7, 2, 2, 'lime'],
    [4, 8, 2, 2, 'lime'],
    [3, 7, 2, 2, 'lime'],
    [2, 6, 2, 2, 'lime'],
    [1, 5, 2, 2, 'lime'],
  ]),
  cross: art(12, 12, [
    [1, 1, 2, 2, 'orange'], [3, 3, 2, 2, 'orange'], [5, 5, 2, 2, 'orange'], [7, 7, 2, 2, 'orange'], [9, 9, 2, 2, 'orange'],
    [9, 1, 2, 2, 'orange'], [7, 3, 2, 2, 'orange'], [3, 7, 2, 2, 'orange'], [1, 9, 2, 2, 'orange'],
  ]),
  warn: art(12, 12, [
    [5, 0, 2, 2, 'gold'],
    [4, 2, 4, 2, 'gold'],
    [3, 4, 6, 2, 'gold'],
    [2, 6, 8, 2, 'gold'],
    [1, 8, 10, 2, 'gold'],
    [0, 10, 12, 2, 'gold'],
    [5, 3, 2, 4, 'night'],
    [5, 8, 2, 2, 'night'],
  ]),
  speaker: art(12, 12, [
    [1, 4, 3, 4, 'white'],
    [4, 3, 1, 6, 'white'],
    [5, 2, 1, 8, 'white'],
    [6, 1, 1, 10, 'white'],
    [8, 4, 1, 4, 'silver'],
    [10, 2, 1, 8, 'silver'],
  ]),
  mute: art(12, 12, [
    [1, 4, 3, 4, 'white'],
    [4, 3, 1, 6, 'white'],
    [5, 2, 1, 8, 'white'],
    [6, 1, 1, 10, 'white'],
    [8, 4, 1, 1, 'orange'], [9, 5, 1, 1, 'orange'], [10, 6, 1, 1, 'orange'], [11, 7, 1, 1, 'orange'],
    [11, 4, 1, 1, 'orange'], [10, 5, 1, 1, 'orange'], [9, 6, 1, 1, 'orange'], [8, 7, 1, 1, 'orange'],
  ]),
  box: art(12, 12, [
    [0, 3, 12, 9, 'orange'],
    [0, 3, 12, 2, 'gold'],
    [5, 3, 2, 9, 'gold'],
    [2, 0, 3, 3, 'orange'],
    [7, 0, 3, 3, 'orange'],
  ]),
  star: art(12, 12, [
    [5, 0, 2, 3, 'gold'],
    [0, 3, 12, 2, 'gold'],
    [2, 5, 8, 2, 'gold'],
    [3, 7, 6, 2, 'gold'],
    [2, 9, 3, 2, 'gold'],
    [7, 9, 3, 2, 'gold'],
    [1, 11, 2, 1, 'gold'],
    [9, 11, 2, 1, 'gold'],
  ]),
  starOff: art(12, 12, [
    [5, 0, 2, 3, 'slate'],
    [0, 3, 12, 2, 'slate'],
    [2, 5, 8, 2, 'slate'],
    [3, 7, 6, 2, 'slate'],
    [2, 9, 3, 2, 'slate'],
    [7, 9, 3, 2, 'slate'],
    [1, 11, 2, 1, 'slate'],
    [9, 11, 2, 1, 'slate'],
  ]),
  arrow: art(12, 12, [
    [0, 5, 9, 2, 'white'],
    [6, 2, 2, 2, 'white'],
    [7, 3, 2, 2, 'white'],
    [8, 4, 2, 4, 'white'],
    [7, 7, 2, 2, 'white'],
    [6, 8, 2, 2, 'white'],
    [10, 5, 1, 2, 'white'],
  ]),
  back: art(12, 12, [
    [3, 5, 9, 2, 'white'],
    [4, 2, 2, 2, 'white'],
    [3, 3, 2, 2, 'white'],
    [2, 4, 2, 4, 'white'],
    [3, 7, 2, 2, 'white'],
    [4, 8, 2, 2, 'white'],
    [1, 5, 1, 2, 'white'],
  ]),
  rotate: art(12, 12, [
    [3, 1, 6, 2, 'white'],
    [1, 3, 2, 6, 'white'],
    [3, 9, 6, 2, 'white'],
    [9, 6, 2, 3, 'white'],
    [8, 0, 1, 5, 'white'],
    [9, 2, 2, 1, 'white'],
    [7, 3, 3, 1, 'white'],
  ]),
  info: art(12, 12, [
    [3, 0, 6, 12, 'sky'],
    [1, 2, 10, 8, 'sky'],
    [2, 1, 8, 10, 'sky'],
    [5, 2, 2, 2, 'night'],
    [5, 5, 2, 5, 'night'],
  ]),
  power: art(12, 12, [
    [5, 0, 2, 6, 'white'],
    [2, 2, 2, 2, 'white'],
    [8, 2, 2, 2, 'white'],
    [1, 4, 2, 4, 'white'],
    [9, 4, 2, 4, 'white'],
    [2, 8, 2, 2, 'white'],
    [8, 8, 2, 2, 'white'],
    [4, 10, 4, 2, 'white'],
  ]),
} as const;

export type IconKey = keyof typeof ICONS;

export interface AvatarLook {
  hair: PalKey;
  skin: PalKey;
  shirt: PalKey;
  pants: PalKey;
  long: boolean;
}

export const AVATARS: AvatarLook[] = [
  { hair: 'ink', skin: 'gold', shirt: 'sky', pants: 'navy', long: false },
  { hair: 'orange', skin: 'white', shirt: 'green', pants: 'ink', long: true },
  { hair: 'night', skin: 'orange', shirt: 'red', pants: 'navy', long: false },
  { hair: 'gold', skin: 'white', shirt: 'plum', pants: 'teal', long: true },
];

/** Postavička 10×16, dvě fáze chůze. */
export function avatarArt(look: AvatarLook, frame: 0 | 1 = 0): Art {
  const { hair, skin, shirt, pants, long } = look;
  const legs: Px[] = frame === 0
    ? [[2, 13, 2, 2, pants], [6, 13, 2, 2, pants], [2, 15, 2, 1, 'night'], [6, 15, 2, 1, 'night']]
    : [[2, 13, 2, 1, pants], [6, 13, 2, 2, pants], [1, 14, 3, 1, 'night'], [6, 15, 2, 1, 'night']];
  return art(10, 16, [
    [2, 0, 6, 1, hair],
    [1, 1, 8, 2, hair],
    [2, 2, 6, 5, skin],
    [2, 2, 6, 1, hair],
    [1, 2, 1, 2, hair],
    [8, 2, 1, 2, hair],
    ...(long ? ([[1, 3, 1, 5, hair], [8, 3, 1, 5, hair]] as Px[]) : []),
    [3, 4, 1, 1, 'night'],
    [6, 4, 1, 1, 'night'],
    [4, 6, 2, 1, 'red'],
    [1, 7, 8, 5, shirt],
    [0, 8, 1, 3, shirt],
    [9, 8, 1, 3, shirt],
    [0, 11, 1, 1, skin],
    [9, 11, 1, 1, skin],
    [2, 12, 6, 1, pants],
    ...legs,
  ]);
}

/** Pro kontrolu dat: všechny obdélníky leží uvnitř plátna. */
export function artInBounds(a: Art): boolean {
  return a.px.every(([x, y, w, h]) => x >= 0 && y >= 0 && x + w <= a.w && y + h <= a.h);
}
