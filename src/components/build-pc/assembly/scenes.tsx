/** Kresby dílny. Všechny souřadnice pocházejí ze slots.ts. */
import { Rects } from '../pixel/Sprite';
import type { PalKey } from '../pixel/palette';
import { NOTCH, type Px } from '../pixel/sprites';
import { PART_BY_ID, type Cooler, type Motherboard, type Ram } from '../data/parts';
import type { GameState, RamSlot } from '../state';
import {
  ATX24_BOARD, BACK_CASE, BOARD, C_ATX24, C_EPS, C_PCIE, C_SOCKET, CASE, CBOARD, COOLER_AREA, DIMM_H, DIMM_W,
  DIMM_X, DIMM_Y, DRIVE_BAY, EPS_BOARD, FAN_CPU, FAN_SYS, GPU_POWER, GPU_RECT, HDD_RECT, HDD_SATA, LEVER, M2,
  M2_SCREW, PCIE_BOARD, PORT_GPU, PORT_MB, PSU_BAY, SCENE_H, SCENE_W, SOCKET, type Rect,
} from './slots';

const r = (rect: Rect, c: PalKey): Px => [rect[0], rect[1], rect[2], rect[3], c];
const bx = (x: number) => BOARD.x + x;
const by = (y: number) => BOARD.y + y;
const cx = (x: number) => CBOARD.x + x;
const cy = (y: number) => CBOARD.y + y;

function dots(x0: number, y0: number, w: number, h: number, step: number, c: PalKey): Px[] {
  const out: Px[] = [];
  for (let y = y0; y < y0 + h; y += step) for (let x = x0; x < x0 + w; x += step) out.push([x, y, 1, 1, c]);
  return out;
}

function stripes(x: number, y: number, w: number, h: number, step: number, c: PalKey): Px[] {
  const out: Px[] = [];
  for (let yy = y + 1; yy < y + h - 1; yy += step) out.push([x + 1, yy, w - 2, 1, c]);
  return out;
}

const ramAccent = (id: string): PalKey => ((PART_BY_ID[id] as Ram).mem === 'DDR5' ? 'red' : 'gold');

// ——— Deska zblízka ———

export function BoardScene({ s }: { s: GameState }) {
  const a = s.asm;
  const mb = a.mb ? (PART_BY_ID[a.mb] as Motherboard) : undefined;
  const inCase = !!a.caseId;
  const bg: Px[] = inCase
    ? [[0, 0, SCENE_W, SCENE_H, 'night'], ...dots(4, 4, SCENE_W, SCENE_H, 12, 'ink')]
    : [[0, 0, SCENE_W, SCENE_H, 'teal'], ...dots(3, 3, SCENE_W, SCENE_H, 6, 'green')];
  return (
    <>
      <Rects px={bg} />
      {!mb ? <Rects px={[[BOARD.x, BOARD.y, BOARD.w, 1, 'green'], [BOARD.x, BOARD.y + BOARD.h - 1, BOARD.w, 1, 'green'], [BOARD.x, BOARD.y, 1, BOARD.h, 'green'], [BOARD.x + BOARD.w - 1, BOARD.y, 1, BOARD.h, 'green']]} /> : null}
      {mb ? <Rects px={boardBase(mb)} /> : null}
      {mb ? <Rects px={socketPx(!!a.cpu, !!a.cpu?.lever)} /> : null}
      {a.cpu ? <Rects px={cpuInSocket()} /> : null}
      {a.paste && !a.cooler ? <Rects px={[[SOCKET[0] + 14, SOCKET[1] + 14, 4, 4, 'silver'], [SOCKET[0] + 15, SOCKET[1] + 13, 2, 6, 'silver']]} /> : null}
      {mb ? <Rects px={dimmPx(a.ram, mb)} /> : null}
      {mb ? <Rects px={m2Px(a.m2)} /> : null}
      {a.cooler ? <Rects px={coolerPx(a.cooler.id)} /> : null}
      {mb ? <Rects px={fanHeaders(!!a.cooler?.fan)} /> : null}
    </>
  );
}

function boardBase(mb: Motherboard): Px[] {
  const px: Px[] = [
    [BOARD.x, BOARD.y, BOARD.w, BOARD.h, 'ink'],
    [BOARD.x, BOARD.y, BOARD.w, 1, 'slate'],
    [BOARD.x, BOARD.y, 1, BOARD.h, 'slate'],
    // otvory na šrouby
    [bx(4), by(4), 3, 3, 'silver'], [bx(133), by(4), 3, 3, 'silver'], [bx(4), by(131), 3, 3, 'silver'],
    [bx(133), by(131), 3, 3, 'silver'], [bx(72), by(4), 3, 3, 'silver'], [bx(72), by(131), 3, 3, 'silver'],
    // vstupy a výstupy vzadu
    [bx(0), by(10), 10, 50, 'slate'],
    [bx(2), by(14), 6, 3, 'night'], [bx(2), by(19), 6, 3, 'night'], [bx(2), by(26), 6, 4, 'night'],
    [bx(2), by(34), 6, 5, 'night'], [bx(2), by(44), 2, 2, 'sky'], [bx(5), by(44), 2, 2, 'lime'], [bx(2), by(50), 6, 3, 'night'],
    // chladiče napájení
    [bx(14), by(2), 44, 8, 'night'], ...stripes(bx(14), by(2), 44, 8, 2, 'slate'),
    [bx(12), by(12), 6, 42, 'night'], [bx(13), by(14), 4, 38, 'slate'],
    // napájení 8pin a 24pin
    r(EPS_BOARD, 'night'), ...dots(EPS_BOARD[0] + 1, EPS_BOARD[1] + 1, 9, 2, 2, 'slate'),
    r(ATX24_BOARD, 'night'), ...dots(ATX24_BOARD[0] + 2, ATX24_BOARD[1] + 1, 4, 25, 2, 'slate'),
    // sloty PCIe
    r(PCIE_BOARD, 'night'), [PCIE_BOARD[0] + 1, PCIE_BOARD[1] + 2, PCIE_BOARD[2] - 2, 1, 'slate'],
    [PCIE_BOARD[0] + PCIE_BOARD[2], PCIE_BOARD[1] - 1, 4, 7, 'silver'],
    [bx(12), by(106), 24, 4, 'night'],
    // čipset, baterie, SATA, panel
    [bx(96), by(98), 26, 26, 'night'], ...stripes(bx(96), by(98), 26, 26, 3, 'slate'),
    [bx(68), by(112), 8, 10, 'silver'], [bx(67), by(113), 10, 8, 'silver'], [bx(70), by(115), 4, 4, 'white'],
    [bx(128), by(92), 7, 4, 'night'], [bx(128), by(98), 7, 4, 'night'], [bx(128), by(104), 7, 4, 'night'],
    [bx(104), by(130), 10, 3, 'night'],
  ];
  // Popisek typu pamětí u slotů (DDR4 / DDR5) jako barevný proužek
  px.push([DIMM_X.A1 - 2, DIMM_Y + DIMM_H + 4, 33, 2, mb.mem === 'DDR5' ? 'red' : 'gold']);
  return px;
}

function socketPx(hasCpu: boolean, lever: boolean): Px[] {
  const [x, y, w, h] = SOCKET;
  const px: Px[] = [[x - 2, y - 2, w + 4, h + 4, 'silver'], [x, y, w, h, 'night']];
  if (!hasCpu) px.push(...dots(x + 2, y + 2, w - 3, h - 3, 3, 'gold'));
  // značka trojúhelníku v rohu patice
  px.push([x - 2, y + h - 1, 4, 1, 'gold'], [x - 2, y + h - 2, 3, 1, 'gold'], [x - 2, y + h - 3, 2, 1, 'gold'], [x - 2, y + h - 4, 1, 1, 'gold']);
  const lx = LEVER[0] + 1;
  if (lever) px.push([lx, LEVER[1], 2, LEVER[3], 'silver'], [lx - 1, LEVER[1] + LEVER[3] - 2, 4, 2, 'white']);
  else px.push([lx, LEVER[1] - 14, 2, 18, 'silver'], [lx - 1, LEVER[1] - 16, 4, 2, 'white']);
  return px;
}

function cpuInSocket(): Px[] {
  const [x, y] = SOCKET;
  return [
    [x, y, 32, 32, 'teal'],
    [x + 2, y + 2, 28, 28, 'silver'],
    [x + 4, y + 4, 24, 24, 'white'],
    [x + 7, y + 10, 18, 1, 'silver'],
    [x + 7, y + 14, 12, 1, 'silver'],
    [x + 7, y + 18, 15, 1, 'silver'],
    [x, y + 28, 1, 4, 'gold'], [x + 1, y + 29, 1, 3, 'gold'], [x + 2, y + 30, 1, 2, 'gold'], [x + 3, y + 31, 1, 1, 'gold'],
  ];
}

function dimmPx(ram: Partial<Record<RamSlot, string>>, mb: Motherboard): Px[] {
  const px: Px[] = [];
  const bump = DIMM_Y + Math.round((DIMM_H * (NOTCH[mb.mem] + 1)) / 32);
  (Object.keys(DIMM_X) as RamSlot[]).forEach((slot) => {
    const x = DIMM_X[slot];
    const id = ram[slot];
    if (id) {
      px.push(
        [x, DIMM_Y + 1, DIMM_W, DIMM_H - 2, 'night'],
        [x + 1, DIMM_Y + 3, 2, DIMM_H - 6, ramAccent(id)],
        [x, DIMM_Y - 2, DIMM_W, 2, 'white'], [x, DIMM_Y + DIMM_H, DIMM_W, 2, 'white'],
      );
    } else {
      const recommended = slot === 'A2' || slot === 'B2';
      px.push(
        [x, DIMM_Y, DIMM_W, DIMM_H, recommended ? 'slate' : 'night'],
        [x + 1, DIMM_Y + 1, 2, DIMM_H - 2, recommended ? 'night' : 'ink'],
        [x + 1, bump, 2, 2, 'silver'],
        [x - 1, DIMM_Y - 3, 2, 3, 'silver'], [x + 3, DIMM_Y + DIMM_H, 2, 3, 'silver'],
      );
    }
  });
  return px;
}

function m2Px(m2: GameState['asm']['m2']): Px[] {
  const [x, y] = M2;
  const px: Px[] = [[x, y, 3, 7, 'night'], [x + 3, y + 3, 36, 1, 'night']];
  if (m2) {
    px.push([x + 2, y, 38, 7, 'teal'], [x + 5, y + 1, 20, 5, 'night'], [x + 6, y + 2, 10, 1, 'white'], [x + 28, y + 1, 6, 5, 'slate']);
  }
  px.push(m2?.screwed
    ? [M2_SCREW[0], M2_SCREW[1], 3, 3, 'silver']
    : [M2_SCREW[0], M2_SCREW[1], 3, 3, 'gold']);
  if (m2?.screwed) px.push([M2_SCREW[0] + 1, M2_SCREW[1] + 1, 1, 1, 'slate']);
  return px;
}

function coolerPx(id: string): Px[] {
  const [x, y] = COOLER_AREA;
  if (id === 'box') {
    return [
      [x + 10, y + 2, 32, 48, 'night'], [x + 6, y + 6, 40, 40, 'night'], [x + 2, y + 10, 48, 32, 'night'],
      [x + 12, y + 8, 28, 36, 'ink'], [x + 8, y + 12, 36, 28, 'ink'],
      [x + 22, y + 22, 8, 8, 'slate'],
      [x + 25, y + 10, 2, 12, 'slate'], [x + 25, y + 30, 2, 12, 'slate'], [x + 10, y + 25, 12, 2, 'slate'], [x + 30, y + 25, 12, 2, 'slate'],
    ];
  }
  const cooler = PART_BY_ID[id] as Cooler;
  if (cooler.kind === 'aio') {
    return [
      [x + 20, 0, 3, y + 14, 'night'], [x + 29, 0, 3, y + 14, 'night'],
      [x + 12, y + 12, 28, 28, 'night'], [x + 14, y + 14, 24, 24, 'ink'], [x + 22, y + 24, 8, 4, 'sky'],
    ];
  }
  return [
    [x + 4, y + 6, 44, 40, 'silver'], ...stripes(x + 4, y + 6, 44, 40, 2, 'slate'),
    [x, y + 4, 5, 44, 'night'], [x + 47, y + 4, 5, 44, 'night'],
    [x + 1, y + 12, 3, 28, 'ink'], [x + 48, y + 12, 3, 28, 'ink'],
    [x + 14, y + 22, 2, 8, 'orange'], [x + 22, y + 22, 2, 8, 'orange'], [x + 30, y + 22, 2, 8, 'orange'], [x + 38, y + 22, 2, 8, 'orange'],
  ];
}

function fanHeaders(connected: boolean): Px[] {
  const px: Px[] = [r(FAN_CPU, 'night'), r(FAN_SYS, 'night'), ...dots(FAN_SYS[0] + 1, FAN_SYS[1] + 1, 7, 1, 2, 'gold')];
  if (connected) px.push(r(FAN_CPU, 'white'), [FAN_CPU[0] + 3, FAN_CPU[1] + 3, 2, 3, 'night']);
  else px.push(...dots(FAN_CPU[0] + 1, FAN_CPU[1] + 1, 7, 1, 2, 'gold'));
  return px;
}

// ——— Skříň z boku ———

function room(): Px[] {
  return [[0, 0, SCENE_W, SCENE_H, 'night'], [0, 144, SCENE_W, 6, 'orange'], [0, 144, SCENE_W, 1, 'gold']];
}

export function CaseScene({ s }: { s: GameState }) {
  const a = s.asm;
  const px: Px[] = [
    ...room(),
    [CASE.x, CASE.y, CASE.w, CASE.h, 'ink'],
    [CASE.x + 4, CASE.y + 4, CASE.w - 8, CASE.h - 8, 'night'],
    // záď: výřez pro I/O a záslepky slotů
    [CASE.x + 4, 20, 6, 36, 'slate'],
    [CASE.x + 4, 72, 6, 32, 'slate'], ...stripes(CASE.x + 4, 72, 6, 32, 4, 'ink'),
    // přední větráky
    [CASE.x + CASE.w - 10, 12, 6, 40, 'ink'], [CASE.x + CASE.w - 10, 56, 6, 40, 'ink'],
    [CASE.x + CASE.w - 9, 28, 4, 8, 'slate'], [CASE.x + CASE.w - 9, 72, 4, 8, 'slate'],
    // kryt zdroje dole
    [CASE.x + 4, 110, CASE.w - 8, 30, 'ink'], [CASE.x + 4, 110, CASE.w - 8, 1, 'slate'],
    r(PSU_BAY, 'night'),
    // šachta na disky
    r(DRIVE_BAY, 'slate'), [DRIVE_BAY[0] + 2, DRIVE_BAY[1] + 4, 24, 14, 'night'], [DRIVE_BAY[0] + 2, DRIVE_BAY[1] + 22, 24, 14, 'night'],
  ];

  if (!a.caseId) {
    px.push(
      [cx(3), cy(3), 2, 2, 'gold'], [cx(91), cy(3), 2, 2, 'gold'], [cx(3), cy(91), 2, 2, 'gold'],
      [cx(91), cy(91), 2, 2, 'gold'], [cx(48), cy(3), 2, 2, 'gold'], [cx(48), cy(91), 2, 2, 'gold'],
    );
  } else {
    px.push(...caseBoard(s));
  }
  if (a.psu) px.push(r(PSU_BAY, 'slate'), [PSU_BAY[0] + 4, PSU_BAY[1] + 4, 16, 16, 'ink'], ...stripes(PSU_BAY[0] + 4, PSU_BAY[1] + 4, 16, 16, 3, 'night'), [PSU_BAY[0] + 28, PSU_BAY[1] + 6, 18, 6, 'gold']);
  if (a.gpu) px.push(...gpuSide());
  if (a.hdd) px.push(r(HDD_RECT, 'silver'), [HDD_RECT[0] + 6, HDD_RECT[1] + 3, 14, 7, 'white'], [HDD_RECT[0] + 7, HDD_RECT[1] + 4, 8, 1, 'blue'], r(HDD_SATA, 'night'));
  px.push(...cables(s));
  if (a.panel) {
    px.push([CASE.x, CASE.y, CASE.w, CASE.h, 'ink'], [CASE.x + 2, CASE.y + 2, CASE.w - 4, 1, 'slate']);
  }
  return (
    <>
      <Rects px={px} />
      {a.panel ? (
        <>
          <rect x={CASE.x + 8} y={CASE.y + 8} width={CASE.w - 16} height={96} fill="#29366f" opacity={0.85} />
          <rect x={CASE.x + 12} y={CASE.y + 12} width={30} height={2} fill="#73eff7" opacity={0.6} />
          <rect x={CASE.x + 12} y={CASE.y + 16} width={14} height={2} fill="#73eff7" opacity={0.6} />
        </>
      ) : null}
    </>
  );
}

function caseBoard(s: GameState): Px[] {
  const a = s.asm;
  const px: Px[] = [
    [CBOARD.x, CBOARD.y, CBOARD.w, CBOARD.h, 'ink'],
    [CBOARD.x, CBOARD.y, CBOARD.w, 1, 'slate'],
    [cx(0), cy(6), 6, 30, 'slate'],
    r(C_ATX24, 'night'), ...dots(C_ATX24[0] + 1, C_ATX24[1] + 1, 4, 17, 2, 'slate'),
    r(C_EPS, 'night'),
    r(C_PCIE, 'night'),
    [cx(66), cy(68), 16, 16, 'night'], ...stripes(cx(66), cy(68), 16, 16, 3, 'slate'),
  ];
  (['A1', 'A2', 'B1', 'B2'] as RamSlot[]).forEach((slot, i) => {
    const id = a.ram[slot];
    px.push([cx(50 + i * 4), cy(6), 2, 40, id ? ramAccent(id) : 'night']);
  });
  if (a.m2) px.push([cx(14), cy(50), 26, 3, 'teal']);
  if (a.cooler) {
    const c = a.cooler.id === 'box' ? null : (PART_BY_ID[a.cooler.id] as Cooler);
    if (c?.kind === 'aio') px.push([C_SOCKET[0] + 4, C_SOCKET[1] + 4, 16, 16, 'night'], [C_SOCKET[0] + 9, C_SOCKET[1] + 10, 6, 3, 'sky'], [C_SOCKET[0] + 6, CASE.y + 4, 3, C_SOCKET[1] - CASE.y, 'night'], [C_SOCKET[0] + 14, CASE.y + 4, 3, C_SOCKET[1] - CASE.y, 'night']);
    else if (c) px.push([C_SOCKET[0] - 2, C_SOCKET[1] - 2, 28, 28, 'silver'], ...stripes(C_SOCKET[0] - 2, C_SOCKET[1] - 2, 28, 28, 2, 'slate'), [C_SOCKET[0] - 4, C_SOCKET[1], 3, 24, 'night']);
    else px.push([C_SOCKET[0], C_SOCKET[1], 24, 24, 'night'], [C_SOCKET[0] + 9, C_SOCKET[1] + 9, 6, 6, 'slate']);
  } else if (a.cpu) {
    px.push([C_SOCKET[0] + 4, C_SOCKET[1] + 4, 16, 16, 'silver']);
  } else {
    px.push([C_SOCKET[0] + 2, C_SOCKET[1] + 2, 20, 20, 'silver'], [C_SOCKET[0] + 4, C_SOCKET[1] + 4, 16, 16, 'night']);
  }
  return px;
}

function gpuSide(): Px[] {
  const [x, y, w, h] = GPU_RECT;
  return [
    [x - 4, y - 2, 4, h + 4, 'silver'],
    [x, y, w, h - 2, 'slate'],
    [x, y, w, 2, 'silver'],
    [x + 26, y + 5, 24, 2, 'lime'],
    [x + 4, y + h - 2, 60, 2, 'teal'],
    r(GPU_POWER, 'night'),
  ];
}

function cables(s: GameState): Px[] {
  const a = s.asm;
  const px: Px[] = [];
  if (a.cables.atx) {
    px.push([136, C_ATX24[1] + 8, 4, 110 - C_ATX24[1] - 8, 'night'], [137, C_ATX24[1] + 8, 1, 110 - C_ATX24[1] - 8, 'slate'],
      [C_ATX24[0] - 1, C_ATX24[1] - 1, 8, 20, 'night'], [C_ATX24[0] + 6, C_ATX24[1] + 8, 4, 4, 'night'], [134, 108, 8, 3, 'night']);
  }
  if (a.cables.eps) {
    px.push([CASE.x + 12, C_EPS[1] + 1, 3, 110 - C_EPS[1], 'night'], [CASE.x + 12, C_EPS[1], C_EPS[0] - CASE.x - 10, 3, 'night'],
      [C_EPS[0] - 1, C_EPS[1] - 1, 11, 5, 'night'], [CASE.x + 13, C_EPS[1] + 4, 1, 100 - C_EPS[1], 'slate']);
  }
  if (a.cables.pcie && a.gpu) {
    px.push([GPU_POWER[0] + 2, GPU_POWER[1] + 3, 3, 110 - GPU_POWER[1] - 3, 'night'], [GPU_POWER[0] - 1, GPU_POWER[1] - 1, 10, 5, 'night'], [GPU_POWER[0] + 3, GPU_POWER[1] + 3, 1, 108 - GPU_POWER[1] - 3, 'lime']);
  }
  if (a.cables.sata && a.hdd) {
    px.push([HDD_SATA[0] - 5, HDD_SATA[1] + 4, 2, 110 - HDD_SATA[1] - 4, 'night'], [HDD_SATA[0] - 5, HDD_SATA[1] + 3, 7, 2, 'night'], [HDD_SATA[0] - 1, HDD_SATA[1] - 1, 5, 12, 'night']);
  }
  return px;
}

// ——— Záda počítače ———

export function BackScene({ s }: { s: GameState }) {
  const a = s.asm;
  const [x, y, w, h] = BACK_CASE;
  const px: Px[] = [
    ...room(),
    [x, y, w, h, 'ink'], [x + 2, y + 2, w - 4, h - 4, 'night'],
    // panel vstupů a výstupů desky
    [x + 8, y + 8, 26, 52, 'silver'],
    [x + 11, y + 12, 6, 3, 'night'], [x + 19, y + 12, 6, 3, 'night'], [x + 11, y + 18, 6, 3, 'night'], [x + 19, y + 18, 6, 3, 'night'],
    [x + 11, y + 25, 6, 3, 'night'], [x + 19, y + 25, 6, 3, 'night'],
    r(PORT_MB, 'night'), [PORT_MB[0] + 1, PORT_MB[1] + 1, PORT_MB[2] - 2, 1, 'slate'],
    [x + 12, y + 44, 8, 6, 'night'], [x + 12, y + 53, 2, 2, 'sky'], [x + 16, y + 53, 2, 2, 'lime'], [x + 20, y + 53, 2, 2, 'red'],
    // zadní větrák
    [x + 40, y + 8, 30, 30, 'night'], [x + 44, y + 12, 22, 22, 'ink'], [x + 52, y + 20, 6, 6, 'slate'],
    // záslepky slotů
    [x + 8, y + 70, 60, 40, 'slate'],
  ];
  for (let i = 0; i < 6; i++) px.push([x + 9, y + 72 + i * 6, 58, 1, 'ink']);
  if (a.gpu) {
    px.push([x + 8, y + 80, 60, 14, 'silver'], r(PORT_GPU, 'night'), [PORT_GPU[0] + 1, PORT_GPU[1] + 1, PORT_GPU[2] - 2, 1, 'slate'],
      [PORT_GPU[0] + 14, PORT_GPU[1], 7, 4, 'night'], [PORT_GPU[0] + 26, PORT_GPU[1], 7, 4, 'night'], [PORT_GPU[0] + 38, PORT_GPU[1], 7, 4, 'night']);
  }
  // zdroj
  px.push([x + 4, y + 112, w - 8, 22, 'slate'], [x + 8, y + 115, 16, 16, 'ink'], ...stripes(x + 8, y + 115, 16, 16, 3, 'night'),
    [x + 52, y + 118, 10, 8, 'night'], [x + 64, y + 119, 4, 6, 'red']);
  if (a.monitor) {
    const port = a.monitor === 'gpu' ? PORT_GPU : PORT_MB;
    px.push([port[0] - 2, port[1] - 1, 13, 6, 'ink'], [port[0] + 4, port[1] + 5, 3, SCENE_H - port[1] - 11, 'ink']);
  }
  return <Rects px={px} />;
}
