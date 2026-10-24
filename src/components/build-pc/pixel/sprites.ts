import type { PalKey } from './palette';
import { disc, dots, fan, fingers, hstripes, line, r, ring, vstripes } from './draw';

/** Obdélník na pixelové mřížce: x, y, šířka, výška, barva. */
export type Px = readonly [number, number, number, number, PalKey];

export interface Art {
  w: number;
  h: number;
  px: readonly Px[];
}

const art = (w: number, h: number, px: Px[]): Art => ({ w, h, px });

/** Zářez paměti: pozice v pixelech na 64px modulu. DDR5 skoro uprostřed, DDR4 víc vlevo. */
export const NOTCH = { DDR5: 31, DDR4: 23 } as const;

function ramArt(mem: 'DDR4' | 'DDR5'): Art {
  const n = NOTCH[mem];
  const accent: PalKey = mem === 'DDR5' ? 'red' : 'gold';
  return art(64, 20, [
    // chladič (heatspreader) s lomenou horní hranou
    r(0, 2, 64, 11, 'night'),
    r(2, 0, 14, 2, 'night'), r(22, 0, 20, 2, 'night'), r(48, 0, 14, 2, 'night'),
    r(0, 2, 1, 11, 'slate'), r(63, 2, 1, 11, 'slate'),
    r(2, 0, 14, 1, 'slate'), r(22, 0, 20, 1, 'slate'), r(48, 0, 14, 1, 'slate'),
    r(0, 2, 2, 1, 'slate'), r(16, 2, 6, 1, 'slate'), r(42, 2, 6, 1, 'slate'), r(62, 2, 2, 1, 'slate'),
    r(1, 12, 62, 1, 'ink'),
    // štítek s logem
    r(6, 5, 26, 5, 'ink'), r(6, 5, 4, 5, accent), r(12, 6, 14, 1, 'silver'), r(12, 8, 9, 1, 'slate'),
    r(36, 6, 22, 1, 'slate'), r(36, 8, 16, 1, 'slate'),
    // deska plošného spoje a čipy
    r(0, 13, n - 1, 3, 'teal'), r(n + 2, 13, 63 - n - 1, 3, 'teal'),
    ...[4, 12, 20, 40, 48, 56].map((x) => r(x, 13, 5, 2, 'night')),
    // zlaté kontakty se zářezem
    r(0, 16, n - 1, 1, 'teal'), r(n + 2, 16, 63 - n - 1, 1, 'teal'),
    ...fingers(1, 16, 62, 4, n),
    // výřezy pro západky na koncích
    r(0, 16, 1, 1, 'teal'),
  ]);
}

function cpuArt(): Art {
  return art(32, 32, [
    r(1, 1, 30, 30, 'teal'),
    r(1, 30, 30, 1, 'navy'), r(30, 1, 1, 30, 'navy'),
    // SMD součástky kolem víčka
    ...[6, 9, 12, 19, 22, 25].map((x) => r(x, 2, 1, 2, 'gold')),
    ...[6, 9, 12, 19, 22, 25].map((x) => r(x, 28, 1, 2, 'gold')),
    ...[7, 11, 20, 24].map((y) => r(2, y, 2, 1, 'gold')),
    ...[7, 11, 20, 24].map((y) => r(28, y, 2, 1, 'gold')),
    // kovové víčko (IHS) se stínováním
    r(5, 5, 22, 22, 'slate'),
    r(5, 5, 21, 21, 'silver'),
    r(6, 6, 19, 19, 'white'),
    r(6, 6, 19, 1, 'white'), r(25, 6, 1, 20, 'silver'), r(6, 25, 20, 1, 'silver'),
    r(8, 9, 7, 2, 'slate'), r(8, 13, 14, 1, 'silver'), r(8, 16, 10, 1, 'silver'), r(8, 19, 12, 1, 'silver'), r(8, 22, 6, 1, 'silver'),
    // zlatý trojúhelník: jediný správný směr vložení
    r(1, 27, 1, 4, 'gold'), r(2, 28, 1, 3, 'gold'), r(3, 29, 1, 2, 'gold'), r(4, 30, 1, 1, 'gold'),
  ]);
}

function gpuArt(): Art {
  return art(64, 30, [
    // zadní kryt (backplate) a krabice karty
    r(0, 2, 60, 2, 'slate'),
    r(0, 4, 60, 20, 'night'),
    r(0, 4, 60, 1, 'slate'), r(0, 23, 60, 1, 'slate'), r(0, 4, 1, 20, 'slate'),
    ...line(22, 5, 30, 22, 'slate'), ...line(34, 5, 26, 22, 'slate'),
    // dva větráky s lopatkami
    ...fan(15, 14, 9, { frame: 'slate', blade: 'silver', bg: 'ink', hub: 'night' }),
    ...fan(45, 14, 9, { frame: 'slate', blade: 'silver', bg: 'ink', hub: 'night' }),
    r(27, 20, 6, 2, 'lime'),
    // napájecí konektor nahoře
    r(46, 0, 10, 2, 'night'), r(47, 0, 1, 1, 'slate'), r(50, 0, 1, 1, 'slate'), r(53, 0, 1, 1, 'slate'),
    // deska plošných spojů a kontakty PCIe
    r(4, 24, 52, 2, 'teal'),
    r(10, 26, 40, 1, 'teal'), ...fingers(10, 26, 40, 3, 17),
    // záslepka (bracket) s výstupy
    r(60, 0, 4, 30, 'silver'), r(60, 0, 4, 2, 'white'), r(61, 2, 2, 1, 'slate'),
    r(61, 6, 2, 4, 'night'), r(61, 12, 2, 4, 'night'), r(61, 18, 2, 4, 'night'), r(61, 24, 2, 3, 'night'),
  ]);
}

function psuArt(): Art {
  return art(40, 30, [
    r(0, 0, 40, 30, 'slate'), r(1, 1, 38, 28, 'ink'),
    r(1, 1, 38, 1, 'slate'),
    // větrák s mřížkou
    ...fan(14, 15, 11, { frame: 'slate', blade: 'slate', bg: 'night', hub: 'ink', blades: 5 }),
    ...ring(14, 15, 8, 1, 'silver'), ...ring(14, 15, 5, 1, 'silver'),
    r(3, 15, 23, 1, 'silver'), r(14, 4, 1, 23, 'silver'),
    // štítek
    r(28, 3, 10, 13, 'gold'), r(29, 5, 8, 1, 'ink'), r(29, 7, 6, 1, 'ink'), r(29, 9, 7, 1, 'ink'), r(29, 12, 4, 2, 'red'),
    // modulární konektory
    r(28, 19, 10, 8, 'night'), ...dots(29, 20, 9, 6, 2, 'slate'),
  ]);
}

function mbArt(): Art {
  return art(48, 48, [
    r(0, 0, 48, 48, 'slate'), r(1, 1, 46, 46, 'ink'),
    // zadní panel a chladiče napájení
    r(0, 5, 7, 22, 'silver'), ...hstripes(1, 6, 5, 20, 3, 'slate'),
    r(9, 2, 22, 6, 'night'), ...vstripes(10, 3, 20, 4, 2, 'slate'),
    r(8, 9, 5, 18, 'night'), ...hstripes(9, 10, 3, 16, 2, 'slate'),
    // patice
    r(15, 11, 15, 15, 'silver'), r(16, 12, 13, 13, 'night'), ...dots(17, 13, 11, 11, 2, 'gold'),
    r(31, 11, 1, 16, 'silver'),
    // paměťové sloty
    r(35, 4, 1, 26, 'night'), r(37, 4, 1, 26, 'slate'), r(39, 4, 1, 26, 'night'), r(41, 4, 1, 26, 'slate'),
    ...[35, 37, 39, 41].map((x) => r(x, 3, 1, 1, 'white')),
    // 24pin, M.2, PCIe, čipset, baterie, SATA
    r(44, 10, 3, 12, 'night'), ...dots(45, 11, 2, 10, 2, 'slate'),
    r(13, 30, 18, 3, 'teal'), r(30, 31, 1, 1, 'gold'),
    r(5, 36, 30, 2, 'night'), r(5, 36, 30, 1, 'silver'), r(35, 35, 2, 4, 'white'),
    r(5, 42, 10, 1, 'night'),
    r(34, 34, 10, 10, 'night'), ...hstripes(35, 35, 8, 8, 2, 'slate'), r(38, 38, 2, 1, 'red'),
    ...disc(25, 42, 3, 'silver'), r(25, 42, 1, 1, 'white'),
    r(44, 34, 3, 7, 'night'),
  ]);
}

function ssdArt(): Art {
  return art(48, 12, [
    r(0, 0, 45, 12, 'teal'), r(45, 0, 3, 4, 'teal'), r(45, 8, 3, 4, 'teal'),
    r(0, 0, 45, 1, 'green'),
    // kontakty se zářezem (klíč M)
    ...[1, 3, 7, 9].map((y) => r(0, y, 2, 1, 'gold')), r(0, 5, 1, 2, 'teal'),
    // štítek a čipy
    r(4, 1, 28, 10, 'night'), r(6, 3, 12, 2, 'white'), r(6, 6, 18, 1, 'slate'), r(6, 8, 12, 1, 'slate'),
    r(34, 2, 8, 8, 'ink'), r(35, 3, 1, 1, 'slate'),
  ]);
}

function hddArt(): Art {
  return art(40, 30, [
    r(0, 0, 40, 30, 'slate'), r(1, 1, 38, 28, 'silver'), r(1, 1, 38, 1, 'white'),
    // štítek
    r(4, 4, 22, 16, 'white'), r(6, 6, 14, 2, 'blue'), r(6, 10, 18, 1, 'slate'), r(6, 13, 12, 1, 'slate'), r(6, 16, 15, 1, 'slate'),
    // kryt ploten a vřeteno
    ...ring(30, 21, 6, 1, 'slate'), ...disc(30, 21, 2, 'slate'),
    r(2, 2, 2, 2, 'slate'), r(36, 2, 2, 2, 'slate'), r(2, 26, 2, 2, 'slate'), r(36, 26, 2, 2, 'slate'),
  ]);
}

function caseArt(): Art {
  return art(32, 50, [
    r(0, 0, 32, 48, 'slate'), r(1, 1, 30, 46, 'night'),
    // přední síťka s větráky za ní
    r(2, 4, 28, 40, 'ink'),
    ...ring(16, 14, 9, 1, 'slate'), ...ring(16, 33, 9, 1, 'slate'),
    ...dots(3, 5, 27, 38, 2, 'night'),
    // horní panel: tlačítko napájení, USB
    r(22, 1, 5, 2, 'sky'), r(5, 1, 4, 1, 'slate'), r(11, 1, 4, 1, 'slate'),
    // nožky
    r(2, 48, 6, 2, 'night'), r(24, 48, 6, 2, 'night'),
  ]);
}

function coolerArt(): Art {
  return art(32, 40, [
    // heatpipy nad žebry
    ...[7, 12, 19, 24].map((x) => r(x, 0, 2, 4, 'orange')),
    // žebra
    r(3, 3, 26, 30, 'silver'), ...hstripes(3, 4, 26, 29, 2, 'slate'),
    // větrák na boku žeber
    r(1, 5, 30, 26, 'slate'), r(2, 6, 28, 24, 'night'),
    ...fan(16, 18, 11, { frame: 'slate', blade: 'silver', bg: 'ink', hub: 'night' }),
    // spodní základna s heatpipy
    r(7, 33, 2, 4, 'orange'), r(12, 33, 2, 4, 'orange'), r(18, 33, 2, 4, 'orange'), r(23, 33, 2, 4, 'orange'),
    r(6, 36, 20, 2, 'silver'), r(9, 38, 14, 2, 'orange'),
  ]);
}

function aioArt(): Art {
  return art(48, 38, [
    // chladič (radiátor) se dvěma větráky
    r(0, 0, 48, 16, 'slate'), r(1, 1, 46, 14, 'night'),
    ...fan(12, 8, 6, { frame: 'slate', blade: 'silver', bg: 'ink', hub: 'night', blades: 5 }),
    ...fan(36, 8, 6, { frame: 'slate', blade: 'silver', bg: 'ink', hub: 'night', blades: 5 }),
    // hadice
    r(14, 16, 3, 10, 'night'), r(31, 16, 3, 10, 'night'),
    // pumpa
    r(14, 25, 20, 13, 'slate'), r(15, 26, 18, 11, 'night'), ...ring(24, 31, 4, 1, 'sky'),
  ]);
}

function osArt(kind: 'win' | 'linux'): Art {
  const [a, b]: [PalKey, PalKey] = kind === 'win' ? ['blue', 'navy'] : ['green', 'teal'];
  return art(28, 34, [
    r(0, 2, 26, 32, a), r(26, 4, 2, 30, b), r(2, 0, 26, 2, b),
    r(2, 4, 22, 28, b),
    ...(kind === 'win'
      ? [r(5, 9, 18, 13, 'white'), r(5, 9, 18, 3, 'sky'), r(7, 14, 9, 1, 'slate'), r(7, 17, 12, 1, 'slate'), r(5, 25, 14, 2, 'sky')]
      : [r(5, 9, 18, 13, 'night'), r(7, 12, 1, 1, 'lime'), r(8, 13, 1, 1, 'lime'), r(7, 14, 1, 1, 'lime'), r(10, 14, 6, 1, 'white'), r(5, 25, 14, 2, 'lime')]),
  ]);
}

export const SPRITES = {
  cpu: cpuArt(),
  mb: mbArt(),
  ram: ramArt('DDR5'),
  ramDdr4: ramArt('DDR4'),
  ssd: ssdArt(),
  hdd: hddArt(),
  gpu: gpuArt(),
  psu: psuArt(),
  case: caseArt(),
  cooler: coolerArt(),
  aio: aioArt(),
  osWin: osArt('win'),
  osLinux: osArt('linux'),
  /** Konektory kabelů ze zdroje: každý má jiný tvar, jako ve skutečnosti. */
  plug24: art(16, 30, [
    r(0, 0, 16, 16, 'night'), r(6, 0, 4, 2, 'slate'),
    ...dots(2, 3, 12, 12, 2, 'gold'),
    r(2, 16, 12, 14, 'ink'),
    ...[3, 5, 7, 9, 11].map((x, i) => r(x, 16, 1, 14, (['gold', 'red', 'night', 'gold', 'night'] as PalKey[])[i])),
  ]),
  plug8: art(14, 22, [
    r(0, 0, 14, 8, 'night'), r(4, 0, 6, 1, 'slate'),
    ...dots(2, 2, 10, 5, 3, 'gold'),
    r(3, 8, 8, 14, 'ink'), r(4, 8, 1, 14, 'gold'), r(6, 8, 1, 14, 'night'), r(8, 8, 1, 14, 'gold'),
    r(1, 4, 12, 1, 'night'),
  ]),
  plugPcie: art(16, 22, [
    r(0, 0, 9, 8, 'night'), r(10, 0, 6, 8, 'night'), r(3, 0, 3, 1, 'slate'),
    ...dots(2, 2, 6, 5, 3, 'lime'), ...dots(11, 2, 4, 5, 3, 'lime'),
    r(4, 8, 8, 14, 'ink'), r(5, 8, 1, 14, 'gold'), r(7, 8, 1, 14, 'night'), r(9, 8, 1, 14, 'gold'),
  ]),
  plugSata: art(16, 14, [
    r(0, 0, 16, 4, 'night'), r(0, 4, 3, 2, 'night'), r(4, 1, 11, 1, 'gold'),
    r(5, 4, 7, 10, 'ink'), r(6, 4, 1, 10, 'gold'), r(8, 4, 1, 10, 'red'), r(10, 4, 1, 10, 'night'),
  ]),
  // datový SATA: tenký červený kabel, úzký konektor ve tvaru L
  plugData: art(12, 14, [
    r(0, 0, 12, 4, 'night'), r(0, 4, 3, 2, 'night'), r(3, 1, 8, 1, 'gold'),
    r(4, 4, 4, 10, 'red'), r(5, 4, 1, 10, 'orange'),
  ]),
  plugFan: art(8, 14, [
    r(0, 0, 8, 5, 'white'), r(1, 1, 1, 2, 'ink'), r(3, 1, 1, 2, 'ink'), r(5, 1, 1, 2, 'ink'),
    r(3, 5, 2, 9, 'ink'),
  ]),
  hdmi: art(22, 10, [
    r(0, 2, 8, 6, 'silver'), r(1, 3, 6, 3, 'night'), r(1, 7, 6, 1, 'slate'),
    r(8, 0, 9, 10, 'slate'), r(9, 1, 7, 8, 'night'),
    r(17, 4, 5, 2, 'slate'),
  ]),
  paste: art(26, 10, [
    r(0, 3, 2, 4, 'slate'), r(2, 4, 3, 2, 'silver'),
    r(5, 1, 14, 8, 'silver'), r(6, 2, 12, 6, 'white'), r(7, 3, 8, 4, 'silver'),
    r(19, 2, 2, 6, 'slate'), r(21, 4, 4, 2, 'slate'), r(24, 2, 2, 6, 'slate'),
  ]),
  usb: art(14, 6, [
    r(0, 0, 10, 6, 'blue'),
    r(1, 1, 3, 1, 'sky'),
    r(10, 1, 4, 4, 'silver'),
    r(11, 2, 1, 1, 'ink'),
    r(12, 2, 1, 1, 'ink'),
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
