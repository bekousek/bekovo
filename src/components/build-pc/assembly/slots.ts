/**
 * Jediný zdroj geometrie dílny. Všechno je v herních pixelech „světa“ 400 × 300.
 *
 * Pohled „Skříň“ ukazuje celý svět: skříň zboku se sundanou levou bočnicí,
 * vlevo záda, vpravo předek. Pohled „Deska“ je TENTÝŽ svět, jen přiblížený
 * na desku (výřez CROP.board), takže obě scény do sebe sedí. „Záda“ jsou
 * samostatný svět stejné velikosti, otočený o 90°.
 *
 * Z těchto čísel se kreslí scény i počítají klikací zóny, zóna nemůže ujet.
 */

export const WORLD_W = 400;
export const WORLD_H = 300;

export type View = 'board' | 'case' | 'back';
export type Rect = readonly [number, number, number, number];

export const CROP: Record<View, Rect> = {
  case: [0, 0, WORLD_W, WORLD_H],
  board: [56, 14, 192, 224],
  back: [0, 0, WORLD_W, WORLD_H],
};

// ——— Skříň zboku ———
export const CASE = { x: 48, y: 10, w: 300, h: 278 } as const;
export const FRONT: Rect = [336, 12, 10, 274];
export const POWER_BTN: Rect = [316, 5, 12, 5];
export const PSU_BAY: Rect = [56, 244, 120, 36];
export const DRIVE_BAY: Rect = [262, 244, 66, 36];
export const SHROUD_Y = 236;

// ——— Deska (ATX) ve skříni ———
export const BOARD = { x: 64, y: 22, w: 176, h: 208 } as const;
const bx = (x: number) => BOARD.x + x;
const by = (y: number) => BOARD.y + y;
export const B = { x: bx, y: by };

export const SOCKET_FRAME: Rect = [bx(34), by(24), 40, 40];
export const SOCKET: Rect = [bx(36), by(26), 36, 36];
export const LEVER: Rect = [bx(76), by(22), 4, 44];
export const FAN_CPU: Rect = [bx(84), by(14), 10, 4];
export const FAN_SYS: Rect = [bx(112), by(199), 10, 4];
export const DIMM_X = { A1: bx(100), A2: bx(110), B1: bx(120), B2: bx(130) } as const;
export const DIMM_Y = by(8);
export const DIMM_W = 5;
export const DIMM_H = 84;
export const M2: Rect = [bx(30), by(100), 58, 10];
export const M2_SCREW: Rect = [bx(86), by(103), 4, 4];
export const ATX24: Rect = [bx(166), by(40), 9, 34];
export const EPS8: Rect = [bx(2), by(1), 12, 7];
export const PCIE1: Rect = [bx(16), by(118), 120, 7];
export const PCIEX1: Rect = [bx(16), by(138), 36, 5];
export const PCIE2: Rect = [bx(16), by(158), 120, 7];
export const SATA_MB: Rect = [bx(166), by(146), 9, 27];

// ——— Díly ve skříni ———
export const GPU_RECT: Rect = [57, 136, 172, 30];
export const GPU_POWER: Rect = [198, 132, 12, 4];
export const HDD_RECT: Rect = [268, 252, 56, 20];
export const HDD_SATA: Rect = [263, 254, 5, 14];

// ——— Záda ———
export const BACK_CASE: Rect = [130, 10, 140, 278];
export const IO_SHIELD: Rect = [140, 30, 34, 66];
export const USB_MB: Rect = [143, 35, 26, 13];
export const PORT_MB: Rect = [145, 66, 11, 5];
export const PORT_GPU: Rect = [147, 145, 11, 5];
export const SLOTS_BACK_Y = 133;
export const PSU_BACK: Rect = [134, 238, 132, 46];
export const PSU_SWITCH: Rect = [210, 252, 10, 14];

export type TargetId =
  | 'mat' | 'standoffs' | 'socket' | 'lever' | 'fan-cpu' | 'fan-sys'
  | 'A1' | 'A2' | 'B1' | 'B2' | 'm2' | 'm2-screw' | 'pcie' | 'pcie2' | 'sata-mb' | 'atx24' | 'eps8'
  | 'psu-bay' | 'drive-bay' | 'gpu-power' | 'hdd-sata' | 'panel' | 'power-btn'
  | 'port-mb' | 'port-gpu' | 'usb-mb' | 'psu-switch';

export interface Target {
  id: TargetId;
  /** Ve kterých pohledech je místo klikací (drobná místa jen v přiblížení). */
  views: View[];
  rect: Rect;
  /** Vstřícný okraj klikací zóny v herních px [vodorovně, svisle]. */
  pad: readonly [number, number];
  label: string;
  /** Co to je za místo: věta do vysvětlení po špatném pokusu. */
  what: string;
  labelTop?: boolean;
  /** Nezvětšovat na 44 px (sousední sloty RAM by se překryly). */
  noMin?: boolean;
}

const dimm = (id: 'A1' | 'A2' | 'B1' | 'B2', top: boolean): Target => ({
  id, views: ['board'], rect: [DIMM_X[id], DIMM_Y, DIMM_W, DIMM_H], pad: [2, 2], noMin: true, labelTop: top,
  label: id, what: `Slot ${id} pro operační paměť.`,
});

export const TARGETS: Record<TargetId, Target> = {
  mat: { id: 'mat', views: ['board'], rect: [BOARD.x, BOARD.y, BOARD.w, BOARD.h], pad: [0, 0], label: 'Antistatická podložka', what: 'Antistatická podložka: sem se pokládá deska, aby jí neublížila statická elektřina.' },
  standoffs: { id: 'standoffs', views: ['case'], rect: [BOARD.x, BOARD.y, BOARD.w, BOARD.h], pad: [0, 0], label: 'Distanční sloupky', what: 'Distanční sloupky ve skříni: na ně se přišroubuje základní deska.' },
  socket: { id: 'socket', views: ['board'], rect: SOCKET, pad: [3, 3], label: 'Patice procesoru', what: 'Patice procesoru (socket).' },
  lever: { id: 'lever', views: ['board'], rect: LEVER, pad: [4, 0], label: 'Páčka patice', what: 'Páčka patice: drží procesor přitlačený.' },
  'fan-cpu': { id: 'fan-cpu', views: ['board'], rect: FAN_CPU, pad: [3, 4], label: 'CPU_FAN', what: 'Konektor CPU_FAN: pro větrák chladiče procesoru.', labelTop: true },
  'fan-sys': { id: 'fan-sys', views: ['board'], rect: FAN_SYS, pad: [3, 4], label: 'SYS_FAN', what: 'Konektor SYS_FAN: pro větráky skříně.' },
  A1: dimm('A1', false),
  A2: dimm('A2', true),
  B1: dimm('B1', false),
  B2: dimm('B2', true),
  m2: { id: 'm2', views: ['board'], rect: M2, pad: [2, 3], label: 'Slot M.2', what: 'Slot M.2: pro malé rychlé SSD bez kabelů.' },
  'm2-screw': { id: 'm2-screw', views: ['board'], rect: M2_SCREW, pad: [4, 4], label: 'Šroubek M.2', what: 'Šroubek slotu M.2.' },
  pcie: { id: 'pcie', views: ['board', 'case'], rect: PCIE1, pad: [2, 4], label: 'PCIe x16 (horní)', what: 'Horní slot PCIe x16: plnohodnotný slot pro grafickou kartu.' },
  pcie2: { id: 'pcie2', views: ['board', 'case'], rect: PCIE2, pad: [2, 4], label: 'PCIe x16 (dolní)', what: 'Dolní slot PCIe: vypadá jako x16, ale elektricky má jen 4 linky (x4).' },
  'sata-mb': { id: 'sata-mb', views: ['board', 'case'], rect: SATA_MB, pad: [3, 2], label: 'SATA (data)', what: 'Porty SATA na desce: datové kabely k diskům, ne napájení.' },
  atx24: { id: 'atx24', views: ['board', 'case'], rect: ATX24, pad: [3, 2], label: '24pin ATX', what: 'Konektor 24pin ATX: napájení celé desky.', labelTop: true },
  eps8: { id: 'eps8', views: ['board', 'case'], rect: EPS8, pad: [3, 3], label: '8pin CPU', what: 'Konektor 8pin CPU (EPS): napájení procesoru.' },
  'psu-bay': { id: 'psu-bay', views: ['case'], rect: PSU_BAY, pad: [0, 0], label: 'Místo pro zdroj', what: 'Prostor pro zdroj dole vzadu pod krytem.' },
  'drive-bay': { id: 'drive-bay', views: ['case'], rect: DRIVE_BAY, pad: [0, 0], label: 'Šachta na disky', what: 'Šachta na pevné disky 3,5" vpředu dole.' },
  'gpu-power': { id: 'gpu-power', views: ['board', 'case'], rect: GPU_POWER, pad: [3, 3], label: 'Napájení karty', what: 'Napájecí konektor grafické karty.', labelTop: true },
  'hdd-sata': { id: 'hdd-sata', views: ['case'], rect: HDD_SATA, pad: [3, 2], label: 'Napájení disku', what: 'Napájecí konektor SATA na pevném disku.' },
  panel: { id: 'panel', views: ['case'], rect: [CASE.x, CASE.y, CASE.w, CASE.h], pad: [0, 0], label: 'Otevřená strana skříně', what: 'Otevřená strana skříně: sem patří bočnice.' },
  'power-btn': { id: 'power-btn', views: ['case'], rect: POWER_BTN, pad: [4, 4], label: 'Tlačítko napájení', what: 'Tlačítko napájení na horní straně skříně.', labelTop: true },
  'port-mb': { id: 'port-mb', views: ['back'], rect: PORT_MB, pad: [3, 3], label: 'HDMI na desce', what: 'Výstup HDMI na desce: obraz z grafiky v procesoru.' },
  'port-gpu': { id: 'port-gpu', views: ['back'], rect: PORT_GPU, pad: [3, 3], label: 'HDMI na kartě', what: 'Výstup HDMI na grafické kartě.' },
  'usb-mb': { id: 'usb-mb', views: ['back'], rect: USB_MB, pad: [1, 1], label: 'USB', what: 'Porty USB na desce: klávesnice, myš, flash disk.' },
  'psu-switch': { id: 'psu-switch', views: ['back'], rect: PSU_SWITCH, pad: [4, 3], label: 'Vypínač zdroje', what: 'Vypínač na zadní straně zdroje.' },
};

/** Klikací zóna v CSS px uvnitř výřezu pohledu: obdélník + okraj, nejméně 44 × 44 px. */
export function hitBox(t: Target, scale: number, crop: Rect) {
  const [x, y, w, h] = t.rect;
  const [px, py] = t.pad;
  const ox = crop[0], oy = crop[1];
  let left = (x - px - ox) * scale;
  let top = (y - py - oy) * scale;
  let width = (w + 2 * px) * scale;
  let height = (h + 2 * py) * scale;
  const min = 44;
  if (!t.noMin && width < min) { left -= (min - width) / 2; width = min; }
  if (!t.noMin && height < min) { top -= (min - height) / 2; height = min; }
  return {
    left, top, width, height,
    ring: { left: (x - ox) * scale - left, top: (y - oy) * scale - top, width: w * scale, height: h * scale },
  };
}
