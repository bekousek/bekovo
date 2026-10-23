/**
 * Jediný zdroj geometrie dílny. Každý cíl je obdélník v herních pixelech scény
 * 200 × 150. Z těchto čísel se kreslí desky, sloty i konektory A ZÁROVEŇ se
 * z nich počítají klikací zóny, takže zóna nemůže od obrázku „ujet“.
 */

export const SCENE_W = 200;
export const SCENE_H = 150;

export type View = 'board' | 'case' | 'back';

export type TargetId =
  | 'mat' | 'socket' | 'lever' | 'cpu-top' | 'fan-cpu' | 'fan-sys'
  | 'A1' | 'A2' | 'B1' | 'B2' | 'm2' | 'm2-screw'
  | 'standoffs' | 'psu-bay' | 'pcie' | 'drive-bay' | 'atx24' | 'eps8' | 'gpu-power' | 'hdd-sata' | 'panel'
  | 'port-mb' | 'port-gpu';

export type Rect = readonly [number, number, number, number];

export interface Target {
  id: TargetId;
  view: View;
  rect: Rect;
  /** Vstřícný okraj klikací zóny v herních px [vodorovně, svisle]. */
  pad: readonly [number, number];
  label: string;
  labelTop?: boolean;
  /** Nezvětšovat na 44 px (sousední sloty RAM by se překryly). Popisky
   *  RAM se střídají nahoře a dole, aby se nepřekrývaly ani na malé obrazovce. */
  noMin?: boolean;
}

// ——— Deska zblízka (pohled shora). Počátek desky na scéně: ———
export const BOARD = { x: 30, y: 6, w: 140, h: 138 } as const;
const bx = (x: number) => BOARD.x + x;
const by = (y: number) => BOARD.y + y;

/** Sloty paměti: od procesoru A1, A2, B1, B2. A2 a B2 jsou šedé = doporučené. */
export const DIMM_X = { A1: bx(82), A2: bx(91), B1: bx(100), B2: bx(109) } as const;
export const DIMM_Y = by(8);
export const DIMM_W = 4;
export const DIMM_H = 68;

export const SOCKET: Rect = [bx(28), by(22), 32, 32];
export const LEVER: Rect = [bx(62), by(20), 4, 38];
export const COOLER_AREA: Rect = [bx(18), by(12), 52, 52];
export const FAN_CPU: Rect = [bx(46), by(10), 8, 3];
export const FAN_SYS: Rect = [bx(116), by(130), 8, 3];
export const M2: Rect = [bx(24), by(72), 42, 7];
export const M2_SCREW: Rect = [bx(62), by(74), 3, 3];
export const ATX24_BOARD: Rect = [bx(128), by(28), 7, 26];
export const EPS_BOARD: Rect = [bx(4), by(1), 10, 4];
export const PCIE_BOARD: Rect = [bx(12), by(90), 92, 5];

// ——— Skříň z boku (bočnice dole, záď vlevo) ———
export const CASE = { x: 22, y: 4, w: 156, h: 140 } as const;
/** Deska ve skříni je kreslená menší, s vlastní geometrií. */
export const CBOARD = { x: 38, y: 12, w: 96, h: 96 } as const;
const cx = (x: number) => CBOARD.x + x;
const cy = (y: number) => CBOARD.y + y;
export const C_ATX24: Rect = [cx(88), cy(20), 6, 18];
export const C_EPS: Rect = [cx(4), cy(1), 9, 3];
export const C_PCIE: Rect = [cx(8), cy(60), 62, 4];
export const C_SOCKET: Rect = [cx(18), cy(14), 24, 24];
export const PSU_BAY: Rect = [30, 114, 52, 24];
export const DRIVE_BAY: Rect = [142, 44, 28, 40];
export const GPU_RECT: Rect = [cx(6), cy(64), 86, 14];
export const GPU_POWER: Rect = [cx(74), cy(64), 8, 3];
export const HDD_RECT: Rect = [144, 52, 24, 14];
export const HDD_SATA: Rect = [144, 54, 3, 10];

// ——— Záda počítače ———
export const BACK_CASE: Rect = [62, 6, 76, 138];
export const PORT_MB: Rect = [76, 40, 9, 4];
export const PORT_GPU: Rect = [78, 90, 9, 4];

export const TARGETS: Record<TargetId, Target> = {
  mat: { id: 'mat', view: 'board', rect: [BOARD.x, BOARD.y, BOARD.w, BOARD.h], pad: [0, 0], label: 'Antistatická podložka' },
  socket: { id: 'socket', view: 'board', rect: SOCKET, pad: [2, 2], label: 'Patice procesoru' },
  lever: { id: 'lever', view: 'board', rect: LEVER, pad: [4, 0], label: 'Páčka' },
  'cpu-top': { id: 'cpu-top', view: 'board', rect: COOLER_AREA, pad: [0, 0], label: 'Na procesor' },
  'fan-cpu': { id: 'fan-cpu', view: 'board', rect: FAN_CPU, pad: [4, 4], label: 'CPU_FAN', labelTop: true },
  'fan-sys': { id: 'fan-sys', view: 'board', rect: FAN_SYS, pad: [4, 4], label: 'SYS_FAN' },
  A1: { id: 'A1', view: 'board', rect: [DIMM_X.A1, DIMM_Y, DIMM_W, DIMM_H], pad: [2, 2], label: 'A1', noMin: true },
  A2: { id: 'A2', view: 'board', rect: [DIMM_X.A2, DIMM_Y, DIMM_W, DIMM_H], pad: [2, 2], label: 'A2', noMin: true, labelTop: true },
  B1: { id: 'B1', view: 'board', rect: [DIMM_X.B1, DIMM_Y, DIMM_W, DIMM_H], pad: [2, 2], label: 'B1', noMin: true },
  B2: { id: 'B2', view: 'board', rect: [DIMM_X.B2, DIMM_Y, DIMM_W, DIMM_H], pad: [2, 2], label: 'B2', noMin: true, labelTop: true },
  m2: { id: 'm2', view: 'board', rect: M2, pad: [2, 3], label: 'Slot M.2' },
  'm2-screw': { id: 'm2-screw', view: 'board', rect: M2_SCREW, pad: [4, 4], label: 'Šroubek' },
  standoffs: { id: 'standoffs', view: 'case', rect: [CBOARD.x, CBOARD.y, CBOARD.w, CBOARD.h], pad: [0, 0], label: 'Distanční sloupky' },
  'psu-bay': { id: 'psu-bay', view: 'case', rect: PSU_BAY, pad: [0, 0], label: 'Místo pro zdroj' },
  pcie: { id: 'pcie', view: 'case', rect: C_PCIE, pad: [2, 5], label: 'PCIe x16' },
  'drive-bay': { id: 'drive-bay', view: 'case', rect: DRIVE_BAY, pad: [0, 0], label: 'Šachta na disk' },
  atx24: { id: 'atx24', view: 'case', rect: C_ATX24, pad: [3, 2], label: '24pin', labelTop: true },
  eps8: { id: 'eps8', view: 'case', rect: C_EPS, pad: [3, 3], label: '8pin CPU' },
  'gpu-power': { id: 'gpu-power', view: 'case', rect: GPU_POWER, pad: [3, 3], label: 'Napájení karty', labelTop: true },
  'hdd-sata': { id: 'hdd-sata', view: 'case', rect: HDD_SATA, pad: [3, 2], label: 'SATA' },
  panel: { id: 'panel', view: 'case', rect: [CASE.x, CASE.y, CASE.w, CASE.h], pad: [0, 0], label: 'Bočnice' },
  'port-mb': { id: 'port-mb', view: 'back', rect: PORT_MB, pad: [4, 4], label: 'HDMI na desce' },
  'port-gpu': { id: 'port-gpu', view: 'back', rect: PORT_GPU, pad: [4, 4], label: 'HDMI na grafické kartě' },
};

/** Klikací zóna v CSS px: obdélník + okraj, nejméně 44 × 44 px (dotyk). */
export function hitBox(t: Target, scale: number) {
  const [x, y, w, h] = t.rect;
  const [px, py] = t.pad;
  let left = (x - px) * scale;
  let top = (y - py) * scale;
  let width = (w + 2 * px) * scale;
  let height = (h + 2 * py) * scale;
  const min = 44;
  if (!t.noMin && width < min) { left -= (min - width) / 2; width = min; }
  if (!t.noMin && height < min) { top -= (min - height) / 2; height = min; }
  return {
    left, top, width, height,
    /** Skutečný obrys slotu uvnitř zóny (na zvýraznění). */
    ring: { left: x * scale - left, top: y * scale - top, width: w * scale, height: h * scale },
  };
}
