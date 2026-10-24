/**
 * Kresby dílny ve světě 400 × 300. Pohled „Skříň“ i „Deska“ kreslí stejný svět
 * (deska je jen přiblížená), „Záda“ mají vlastní svět. Souřadnice jsou ze slots.ts.
 */
import { Rects } from '../pixel/Sprite';
import type { PalKey } from '../pixel/palette';
import { NOTCH, type Px } from '../pixel/sprites';
import { box, disc, dots, fan, hstripes, line, r, ring, vstripes } from '../pixel/draw';
import { PART_BY_ID, type Cooler, type Motherboard, type Ram } from '../data/parts';
import type { GameState, RamSlot } from '../state';
import {
  ATX24, B, BACK_CASE, BOARD, CASE, CROP, DIMM_H, DIMM_W, DIMM_X, DIMM_Y, DRIVE_BAY, EPS8, FAN_CPU, FAN_SYS,
  FRONT, GPU_POWER, GPU_RECT, HDD_RECT, HDD_SATA, IO_SHIELD, LEVER, M2, M2_SCREW, PCIE1, PCIE2, PCIEX1, PORT_GPU,
  PORT_MB, POWER_BTN, PSU_BACK, PSU_BAY, PSU_SWITCH, SATA_MB, SHROUD_Y, SLOTS_BACK_Y, SOCKET, SOCKET_FRAME,
  USB_MB, WORLD_H, WORLD_W, type Rect, type View,
} from './slots';

const R = (rect: Rect, c: PalKey): Px => [rect[0], rect[1], rect[2], rect[3], c];
const ramAccent = (id: string): PalKey => ((PART_BY_ID[id] as Ram).mem === 'DDR5' ? 'red' : 'gold');
const { x: bx, y: by } = B;

function room(): Px[] {
  return [r(0, 0, WORLD_W, 294, 'night'), ...dots(6, 6, WORLD_W, 286, 16, 'ink'), r(0, 294, WORLD_W, 6, 'orange'), r(0, 294, WORLD_W, 1, 'gold')];
}

// ——— Skříň zboku (a přiblížená deska) ———

export function SideScene({ s, view }: { s: GameState; view: View }) {
  const a = s.asm;
  const mb = a.mb ? (PART_BY_ID[a.mb] as Motherboard) : undefined;
  const boardInCase = !!a.caseId;
  const onMat = !!mb && !boardInCase;
  const zoom = view === 'board';

  const px: Px[] = [];
  if (zoom && !boardInCase) {
    // Deska leží na antistatické podložce na stole (díváš se na ni shora).
    const [cx, cy, cw, ch] = CROP.board;
    px.push(r(cx, cy, cw, ch, 'teal'), ...dots(cx + 3, cy + 3, cw, ch, 6, 'green'));
    if (!mb) px.push(...hstripes(BOARD.x, BOARD.y, BOARD.w, 1, 1, 'lime'), r(BOARD.x, BOARD.y + BOARD.h - 1, BOARD.w, 1, 'lime'), r(BOARD.x, BOARD.y, 1, BOARD.h, 'lime'), r(BOARD.x + BOARD.w - 1, BOARD.y, 1, BOARD.h, 'lime'));
  } else {
    px.push(...room(), ...caseShell(s));
  }
  const showBoard = !!mb && (boardInCase || (zoom && onMat));
  if (showBoard) px.push(...board(mb!), ...boardParts(s));
  if (!zoom || boardInCase) px.push(...caseParts(s, boardInCase));

  return (
    <>
      <Rects px={px} />
      {a.panel && (!zoom || boardInCase) ? <Glass /> : null}
    </>
  );
}

function caseShell(s: GameState): Px[] {
  const a = s.asm;
  const px: Px[] = [
    // plášť skříně
    r(CASE.x, CASE.y, CASE.w, CASE.h, 'slate'), r(CASE.x + 2, CASE.y + 2, CASE.w - 4, CASE.h - 4, 'ink'),
    r(52, 14, 284, 270, 'night'),
    // přední panel se síťkou (vpravo) a horní panel
    R(FRONT, 'ink'), ...dots(FRONT[0] + 2, FRONT[1] + 4, 7, FRONT[3] - 8, 3, 'night'),
    ...dots(70, 12, 240, 2, 6, 'night'),
    // nožky
    r(64, 288, 28, 6, 'ink'), r(64, 288, 28, 1, 'slate'), r(304, 288, 28, 6, 'ink'), r(304, 288, 28, 1, 'slate'),
    // tlačítko napájení a USB nahoře vpředu
    r(POWER_BTN[0], POWER_BTN[1], POWER_BTN[2], POWER_BTN[3], 'slate'), r(POWER_BTN[0] + 3, POWER_BTN[1] + 1, 6, 2, s.os.done ? 'sky' : 'night'),
    r(292, 8, 8, 2, 'night'), r(302, 8, 8, 2, 'night'),
    // zadní větrák (z boku je vidět jen hrana) a záslepky slotů vlevo
    r(53, 20, 6, 50, 'ink'), ...hstripes(54, 22, 4, 46, 4, 'slate'),
    r(52, 133, 5, 98, 'slate'), ...hstripes(52, 146, 5, 98, 14, 'ink'),
    // přední větráky zevnitř
    r(326, 24, 9, 92, 'ink'), ...hstripes(327, 27, 7, 86, 5, 'slate'),
    r(326, 124, 9, 92, 'ink'), ...hstripes(327, 127, 7, 86, 5, 'slate'),
    // průchodky na kabely vpravo od desky
    ...[30, 92, 168].flatMap((y) => [r(250, y, 10, 22, 'ink'), r(254, y + 2, 2, 18, 'night')]),
    // kryt zdroje a otvory pro zdroj a disky
    r(52, SHROUD_Y, 284, 48, 'ink'), r(52, SHROUD_Y, 284, 2, 'slate'), ...dots(186, SHROUD_Y + 6, 70, 30, 4, 'night'),
    R(PSU_BAY, 'night'), r(PSU_BAY[0], PSU_BAY[1], PSU_BAY[2], 1, 'slate'),
    R(DRIVE_BAY, 'night'), r(DRIVE_BAY[0], DRIVE_BAY[1] + 12, DRIVE_BAY[2], 1, 'slate'), r(DRIVE_BAY[0], DRIVE_BAY[1] + 24, DRIVE_BAY[2], 1, 'slate'),
  ];
  if (!a.caseId) {
    // distanční sloupky, na které se přišroubuje deska
    for (const [x, y] of HOLES) px.push(r(bx(x), by(y), 3, 3, 'gold'), r(bx(x) + 1, by(y) + 1, 1, 1, 'orange'));
  }
  return px;
}

const HOLES: [number, number][] = [[5, 5], [84, 5], [167, 5], [5, 103], [167, 103], [5, 199], [84, 199], [167, 199]];

function board(mb: Motherboard): Px[] {
  const W = BOARD.w, H = BOARD.h;
  const px: Px[] = [
    r(BOARD.x, BOARD.y, W, H, 'ink'),
    r(BOARD.x, BOARD.y, W, 1, 'slate'), r(BOARD.x, BOARD.y, 1, H, 'slate'),
    r(BOARD.x, BOARD.y + H - 1, W, 1, 'night'), r(BOARD.x + W - 1, BOARD.y, 1, H, 'night'),
  ];
  for (const [x, y] of HOLES) px.push(r(bx(x), by(y), 3, 3, 'silver'), r(bx(x) + 1, by(y) + 1, 1, 1, 'night'));
  px.push(
    // zadní panel s porty (u zad skříně)
    r(bx(0), by(10), 12, 66, 'slate'), r(bx(1), by(11), 10, 64, 'silver'), ...hstripes(bx(1), by(13), 10, 60, 4, 'slate'),
    // chladiče napájení procesoru
    r(bx(16), by(2), 58, 12, 'night'), r(bx(16), by(2), 58, 1, 'slate'), ...vstripes(bx(17), by(4), 56, 9, 3, 'slate'),
    r(bx(14), by(16), 12, 64, 'night'), r(bx(14), by(16), 1, 64, 'slate'), ...hstripes(bx(16), by(18), 9, 60, 3, 'slate'),
    // napájení: 8pin CPU a 24pin ATX
    R(EPS8, 'night'), ...dots(EPS8[0] + 2, EPS8[1] + 2, 9, 4, 3, 'slate'),
    R(ATX24, 'night'), ...dots(ATX24[0] + 2, ATX24[1] + 2, 6, 31, 3, 'slate'),
    r(bx(166), by(82), 9, 12, 'night'), ...dots(bx(168), by(84), 6, 9, 3, 'slate'),
    // konektory větráků
    R(FAN_CPU, 'night'), ...dots(FAN_CPU[0] + 1, FAN_CPU[1] + 1, 9, 2, 2, 'gold'),
    R(FAN_SYS, 'night'), ...dots(FAN_SYS[0] + 1, FAN_SYS[1] + 1, 9, 2, 2, 'gold'),
    // sloty PCIe: horní x16 (oplechovaný), x1, dolní x16 (jen x4)
    R(PCIE1, 'night'), r(PCIE1[0], PCIE1[1], PCIE1[2], 1, 'silver'), r(PCIE1[0], PCIE1[1] + 6, PCIE1[2], 1, 'silver'), r(PCIE1[0] + 1, PCIE1[1] + 3, PCIE1[2] - 2, 1, 'ink'),
    r(PCIE1[0] + PCIE1[2], PCIE1[1] - 2, 6, 11, 'white'),
    R(PCIEX1, 'night'), r(PCIEX1[0] + 1, PCIEX1[1] + 2, PCIEX1[2] - 2, 1, 'ink'),
    R(PCIE2, 'night'), r(PCIE2[0] + 1, PCIE2[1] + 3, PCIE2[2] - 2, 1, 'ink'), r(PCIE2[0] + PCIE2[2], PCIE2[1] - 2, 6, 11, 'slate'),
    // čipset, SATA, baterie, zvuk, panel tlačítek
    r(bx(124), by(140), 36, 34, 'night'), r(bx(124), by(140), 36, 1, 'slate'), ...hstripes(bx(126), by(143), 32, 29, 3, 'slate'), r(bx(136), by(154), 12, 3, 'red'),
    ...[0, 7, 14, 21].flatMap((d) => [r(SATA_MB[0], SATA_MB[1] + d, 9, 5, 'night'), r(SATA_MB[0] + 2, SATA_MB[1] + d + 2, 6, 1, 'slate')]),
    ...disc(bx(100), by(186), 7, 'silver'), ...ring(bx(100), by(186), 7, 1, 'slate'), r(bx(97), by(183), 3, 2, 'white'),
    r(bx(16), by(174), 52, 1, 'teal'), r(bx(20), by(178), 26, 18, 'night'), ...dots(bx(50), by(178), 14, 18, 4, 'gold'),
    r(bx(140), by(198), 22, 6, 'night'), ...dots(bx(141), by(199), 21, 5, 2, 'gold'),
    // M.2 slot se sloupkem na šroubek
    r(M2[0], M2[1], 4, M2[3], 'night'), r(M2[0] + 4, M2[1] + 4, 52, 1, 'slate'),
    // patice procesoru
    R(SOCKET_FRAME, 'silver'), R(SOCKET, 'night'),
    r(SOCKET_FRAME[0] + 1, SOCKET_FRAME[1] + 1, 2, 2, 'slate'), r(SOCKET_FRAME[0] + 37, SOCKET_FRAME[1] + 1, 2, 2, 'slate'),
    r(SOCKET_FRAME[0] + 1, SOCKET_FRAME[1] + 37, 2, 2, 'slate'), r(SOCKET_FRAME[0] + 37, SOCKET_FRAME[1] + 37, 2, 2, 'slate'),
    // značka trojúhelníku vlevo dole
    r(SOCKET_FRAME[0], SOCKET_FRAME[1] + 39, 5, 1, 'gold'), r(SOCKET_FRAME[0], SOCKET_FRAME[1] + 38, 4, 1, 'gold'), r(SOCKET_FRAME[0], SOCKET_FRAME[1] + 37, 3, 1, 'gold'), r(SOCKET_FRAME[0], SOCKET_FRAME[1] + 36, 2, 1, 'gold'),
  );
  // výstupek ve slotech RAM odpovídá zářezu paměti daného typu
  const bump = DIMM_Y + Math.round((DIMM_H * NOTCH[mb.mem]) / 64);
  for (const slot of ['A1', 'A2', 'B1', 'B2'] as RamSlot[]) {
    const x = DIMM_X[slot];
    const rec = slot === 'A2' || slot === 'B2';
    px.push(r(x, DIMM_Y, DIMM_W, DIMM_H, rec ? 'slate' : 'night'), r(x + 1, DIMM_Y + 1, 3, DIMM_H - 2, rec ? 'night' : 'ink'), r(x + 1, bump, 3, 3, 'silver'));
  }
  px.push(r(DIMM_X.A1 - 2, DIMM_Y + DIMM_H + 4, 39, 2, mb.mem === 'DDR5' ? 'red' : 'gold'));
  return px;
}

function boardParts(s: GameState): Px[] {
  const a = s.asm;
  const px: Px[] = [];
  const [sx, sy] = SOCKET;
  if (!a.cpu) px.push(...dots(sx + 2, sy + 2, 33, 33, 3, 'gold'));
  else {
    px.push(
      r(sx, sy, 36, 36, 'teal'), r(sx, sy + 35, 36, 1, 'navy'), r(sx + 35, sy, 1, 36, 'navy'),
      ...[8, 12, 22, 26].map((d) => r(sx + d, sy + 2, 1, 2, 'gold')), ...[8, 12, 22, 26].map((d) => r(sx + d, sy + 32, 1, 2, 'gold')),
      r(sx + 5, sy + 5, 26, 26, 'slate'), r(sx + 5, sy + 5, 25, 25, 'silver'), r(sx + 6, sy + 6, 23, 23, 'white'),
      r(sx + 9, sy + 10, 8, 2, 'slate'), r(sx + 9, sy + 14, 16, 1, 'silver'), r(sx + 9, sy + 18, 12, 1, 'silver'), r(sx + 9, sy + 22, 14, 1, 'silver'),
      r(sx, sy + 31, 1, 5, 'gold'), r(sx + 1, sy + 32, 1, 4, 'gold'), r(sx + 2, sy + 33, 1, 3, 'gold'), r(sx + 3, sy + 34, 1, 2, 'gold'), r(sx + 4, sy + 35, 1, 1, 'gold'),
    );
  }
  if (a.paste && !a.cooler) px.push(...disc(sx + 18, sy + 18, 4, 'silver'), r(sx + 16, sy + 16, 2, 1, 'white'));
  // páčka patice: zavřená leží podél patice, otevřená trčí nahoru
  const lx = LEVER[0] + 1;
  if (a.cpu?.lever) px.push(r(lx, LEVER[1] + 2, 2, LEVER[3] - 2, 'silver'), r(lx - 1, LEVER[1] + LEVER[3] - 2, 4, 2, 'white'));
  else px.push(r(lx, LEVER[1] - 16, 2, 20, 'silver'), r(lx - 1, LEVER[1] - 18, 4, 2, 'white'));
  // paměti
  for (const slot of ['A1', 'A2', 'B1', 'B2'] as RamSlot[]) {
    const id = a.ram[slot];
    const x = DIMM_X[slot];
    if (id) px.push(r(x, DIMM_Y + 1, DIMM_W, DIMM_H - 2, 'night'), r(x, DIMM_Y + 1, 1, DIMM_H - 2, 'slate'), r(x + 1, DIMM_Y + 3, 3, DIMM_H - 6, ramAccent(id)), r(x, DIMM_Y - 2, DIMM_W, 2, 'white'), r(x, DIMM_Y + DIMM_H, DIMM_W, 2, 'white'));
    else px.push(r(x - 1, DIMM_Y - 3, 2, 3, 'silver'), r(x + 4, DIMM_Y + DIMM_H, 2, 3, 'silver'));
  }
  // SSD M.2
  if (a.m2) px.push(r(M2[0] + 3, M2[1] + 1, 54, 8, 'teal'), r(M2[0] + 3, M2[1] + 1, 54, 1, 'green'), r(M2[0] + 6, M2[1] + 2, 28, 6, 'night'), r(M2[0] + 8, M2[1] + 3, 12, 2, 'white'), r(M2[0] + 38, M2[1] + 2, 8, 6, 'ink'));
  px.push(a.m2?.screwed ? r(M2_SCREW[0], M2_SCREW[1], 4, 4, 'silver') : r(M2_SCREW[0], M2_SCREW[1], 4, 4, 'gold'));
  if (a.m2?.screwed) px.push(r(M2_SCREW[0] + 1, M2_SCREW[1] + 2, 2, 1, 'slate'));
  // chladič procesoru
  if (a.cooler) px.push(...coolerPx(a.cooler.id));
  if (a.cooler?.fan) px.push(R(FAN_CPU, 'white'), r(FAN_CPU[0] + 1, FAN_CPU[1] + 1, 2, 2, 'ink'), r(FAN_CPU[0] - 6, FAN_CPU[1] + 4, 8, 2, 'night'));
  // kabely zapojené do desky
  if (a.cables.eps) px.push(r(EPS8[0] - 1, EPS8[1] - 1, 14, 9, 'night'), r(EPS8[0] + 4, CASE.y + 4, 6, EPS8[1] - CASE.y - 4, 'ink'), r(EPS8[0] + 5, CASE.y + 4, 1, EPS8[1] - CASE.y - 4, 'gold'));
  if (a.cables.atx) px.push(r(ATX24[0] - 2, ATX24[1] - 1, 12, 36, 'night'), r(ATX24[0] - 1, ATX24[1] + 14, 2, 8, 'slate'), r(ATX24[0] + 10, ATX24[1] + 4, 16, 26, 'ink'), ...vstripes(ATX24[0] + 10, ATX24[1] + 5, 16, 24, 3, 'slate'));
  return px;
}

function coolerPx(id: string): Px[] {
  const [sx, sy] = SOCKET;
  const cx = sx + 18, cy = sy + 18;
  if (id === 'box') {
    // nízký chladič z krabice: díváš se přímo na jeho větrák
    return [...disc(cx, cy, 29, 'ink'), ...ring(cx, cy, 29, 1, 'slate'), ...fan(cx, cy, 25, { frame: 'slate', blade: 'silver', bg: 'night', hub: 'ink' }), r(cx - 3, cy - 1, 6, 2, 'red')];
  }
  const cooler = PART_BY_ID[id] as Cooler;
  if (cooler.kind === 'aio') {
    // pumpa na procesoru, hadice vedou k chladiči nahoře ve skříni
    return [
      r(96, 15, 150, 7, 'slate'), r(97, 16, 148, 5, 'night'), ...vstripes(98, 16, 146, 5, 2, 'ink'), r(96, 22, 150, 5, 'ink'),
      r(cx - 9, 22, 3, cy - 14 - 22, 'night'), r(cx + 6, 22, 3, cy - 14 - 22, 'night'),
      r(cx - 14, cy - 14, 28, 28, 'slate'), r(cx - 13, cy - 13, 26, 26, 'night'), ...ring(cx, cy, 8, 1, 'sky'), r(cx - 2, cy - 1, 4, 2, 'sky'),
    ];
  }
  // věžový chladič: shora je vidět horní žebro s konci heatpipe, větrák zboku
  const x = sx - 10, y = sy - 18;
  return [
    r(x, y, 52, 66, 'slate'), r(x + 1, y + 1, 50, 64, 'silver'), r(x + 1, y + 1, 50, 1, 'white'), ...hstripes(x + 2, y + 4, 48, 60, 6, 'slate'),
    r(x + 14, y + 22, 24, 20, 'ink'), r(x + 18, y + 30, 16, 3, 'silver'),
    ...[[8, 10], [16, 10], [34, 10], [42, 10], [8, 52], [16, 52], [34, 52], [42, 52]].map(([dx, dy]) => r(x + dx, y + dy, 3, 3, 'orange')),
    r(x + 52, y + 2, 8, 62, 'ink'), r(x + 52, y + 2, 1, 62, 'slate'), ...hstripes(x + 54, y + 6, 5, 56, 5, 'slate'),
  ];
}

function caseParts(s: GameState, boardInCase: boolean): Px[] {
  const a = s.asm;
  const px: Px[] = [];
  if (a.psu) {
    const [x, y, w, h] = PSU_BAY;
    px.push(...box(x + 2, y + 2, w - 4, h - 4, 'ink', 'slate'), r(x + 14, y + 8, 40, 18, 'gold'), r(x + 17, y + 11, 26, 2, 'ink'), r(x + 17, y + 15, 18, 1, 'ink'), r(x + 17, y + 19, 22, 1, 'ink'), r(x + w - 8, y + 4, 4, h - 8, 'night'), ...dots(x + w - 7, y + 6, 2, h - 12, 3, 'slate'));
  }
  if (a.hdd) px.push(...box(HDD_RECT[0], HDD_RECT[1], HDD_RECT[2], HDD_RECT[3], 'silver', 'slate'), r(HDD_RECT[0] + 6, HDD_RECT[1] + 3, 30, 13, 'white'), r(HDD_RECT[0] + 8, HDD_RECT[1] + 5, 16, 2, 'blue'), r(HDD_RECT[0] + 8, HDD_RECT[1] + 10, 22, 1, 'slate'), R(HDD_SATA, 'night'));
  if (a.gpu && boardInCase) {
    const [x, y, w, h] = GPU_RECT;
    px.push(
      r(x - 4, y - 2, 4, h + 4, 'silver'), r(x - 5, y - 4, 6, 3, 'white'),
      ...box(x, y, w, h, 'night', 'slate'), r(x + 1, y + 1, w - 2, 3, 'ink'), r(x + 1, y + 1, w - 2, 1, 'silver'),
      ...line(x + 40, y + 5, x + 52, y + h - 6, 'slate'), ...line(x + 120, y + 5, x + 108, y + h - 6, 'slate'),
      r(x + 66, y + 11, 40, 3, 'lime'), r(x + 3, y + h - 7, w - 6, 5, 'ink'),
      R(GPU_POWER, 'night'), ...dots(GPU_POWER[0] + 1, GPU_POWER[1] + 1, 11, 2, 3, 'slate'),
    );
  }
  // kabely ze zdroje
  if (a.cables.atx && boardInCase) px.push(r(252, 66, 10, SHROUD_Y - 66, 'ink'), ...vstripes(253, 66, 9, SHROUD_Y - 66, 3, 'slate'));
  if (a.cables.pcie && a.gpu) px.push(r(GPU_POWER[0] - 2, GPU_POWER[1] - 4, 16, 8, 'night'), r(GPU_POWER[0] + 14, GPU_POWER[1] - 3, 238 - GPU_POWER[0], 5, 'ink'), r(GPU_POWER[0] + 14, GPU_POWER[1] - 2, 238 - GPU_POWER[0], 1, 'lime'));
  if (a.cables.sata && a.hdd) px.push(r(HDD_SATA[0] - 2, HDD_SATA[1] - 1, 8, 16, 'night'), r(HDD_SATA[0], HDD_SATA[1] + 15, 4, 280 - HDD_SATA[1] - 15, 'ink'));
  // datový kabel: z disku nahoru k portům SATA na pravém okraji desky
  if (a.cables.data && a.hdd && boardInCase) {
    const [sx, sy] = SATA_MB;
    const cx = HDD_RECT[0] + 4;
    px.push(
      r(cx - 1, HDD_RECT[1] - 3, 5, 3, 'red'), r(cx, sy + 2, 2, HDD_RECT[1] - 3 - sy - 2, 'red'),
      r(sx + 9, sy + 2, cx - sx - 9, 2, 'red'), r(sx + 4, sy + 1, 5, 4, 'red'),
    );
  }
  return px;
}

function Glass() {
  // tvrzené sklo bočnice: interiér je vidět, jen ztmavený
  return (
    <>
      <rect x={CASE.x + 4} y={CASE.y + 4} width={CASE.w - 8} height={CASE.h - 8} fill="#29366f" opacity={0.42} />
      <rect x={CASE.x} y={CASE.y} width={CASE.w} height={6} fill="#566c86" />
      <rect x={CASE.x} y={CASE.y + CASE.h - 6} width={CASE.w} height={6} fill="#566c86" />
      <rect x={CASE.x} y={CASE.y} width={6} height={CASE.h} fill="#566c86" />
      <rect x={CASE.x + CASE.w - 6} y={CASE.y} width={6} height={CASE.h} fill="#566c86" />
      <polygon points={`${CASE.x + 30},${CASE.y + 6} ${CASE.x + 60},${CASE.y + 6} ${CASE.x + 10},${CASE.y + 80} ${CASE.x + 6},${CASE.y + 60}`} fill="#f4f4f4" opacity={0.12} />
    </>
  );
}

// ——— Záda počítače ———

export function BackScene({ s }: { s: GameState }) {
  const a = s.asm;
  const [x, y, w, h] = BACK_CASE;
  const px: Px[] = [
    ...room(),
    r(x, y, w, h, 'slate'), r(x + 2, y + 2, w - 4, h - 4, 'ink'),
    r(x + 6, 288, 26, 6, 'ink'), r(x + w - 32, 288, 26, 6, 'ink'),
    // šroubky bočnice na pravé hraně
    r(x + w - 6, y + 30, 3, 6, 'silver'), r(x + w - 6, y + 236, 3, 6, 'silver'),
  ];
  // panel portů desky (jen když je deska ve skříni)
  if (a.caseId) {
    const [ix, iy, iw, ih] = IO_SHIELD;
    px.push(
      r(ix, iy, iw, ih, 'silver'), r(ix, iy, iw, 1, 'white'),
      ...[[0, 0], [13, 0], [0, 7], [13, 7]].flatMap(([dx, dy]) => [r(USB_MB[0] + dx, USB_MB[1] + dy, 10, 5, 'night'), r(USB_MB[0] + dx + 2, USB_MB[1] + dy + 2, 6, 1, 'sky')]),
      r(ix + 4, iy + 22, 11, 9, 'night'), ...dots(ix + 6, iy + 24, 8, 2, 2, 'gold'),
      r(ix + 20, iy + 22, 8, 8, 'night'),
      R(PORT_MB, 'night'), r(PORT_MB[0] + 2, PORT_MB[1] + 4, 7, 1, 'silver'), r(PORT_MB[0] + 2, PORT_MB[1] + 1, 7, 2, 'ink'),
      r(PORT_MB[0] + 15, PORT_MB[1], 9, 5, 'night'),
      ...disc(ix + 7, iy + 55, 2, 'sky'), ...disc(ix + 14, iy + 55, 2, 'lime'), ...disc(ix + 21, iy + 55, 2, 'red'),
    );
  } else {
    px.push(r(IO_SHIELD[0], IO_SHIELD[1], IO_SHIELD[2], IO_SHIELD[3], 'night'));
  }
  // zadní větrák
  px.push(r(182, 24, 66, 66, 'slate'), r(183, 25, 64, 64, 'ink'), ...fan(215, 57, 28, { frame: 'slate', blade: 'slate', bg: 'night', hub: 'ink' }), ...ring(215, 57, 20, 1, 'silver'), ...ring(215, 57, 12, 1, 'silver'));
  // záslepky slotů (7 vodorovných plíšků), grafika zabírá dva
  for (let i = 0; i < 7; i++) {
    const sy = SLOTS_BACK_Y + i * 14;
    if (a.gpu && i < 2) continue;
    px.push(r(140, sy, 96, 12, 'slate'), ...dots(150, sy + 4, 80, 4, 4, 'ink'), r(136, sy + 4, 3, 3, 'silver'));
  }
  if (a.gpu) {
    px.push(
      r(140, SLOTS_BACK_Y, 96, 28, 'silver'), r(140, SLOTS_BACK_Y, 96, 1, 'white'), r(136, SLOTS_BACK_Y + 4, 3, 3, 'silver'), r(136, SLOTS_BACK_Y + 18, 3, 3, 'silver'),
      R(PORT_GPU, 'night'), r(PORT_GPU[0] + 2, PORT_GPU[1] + 1, 7, 2, 'ink'),
      r(PORT_GPU[0] + 15, PORT_GPU[1], 9, 5, 'night'), r(PORT_GPU[0] + 28, PORT_GPU[1], 9, 5, 'night'), r(PORT_GPU[0] + 41, PORT_GPU[1], 9, 5, 'night'),
      ...dots(206, SLOTS_BACK_Y + 4, 26, 20, 3, 'slate'),
    );
  }
  // zdroj: mřížka, zásuvka na kabel, vypínač
  if (a.psu) {
    const [px0, py0, pw, ph] = PSU_BACK;
    const on = a.psuSwitch;
    px.push(
      r(px0, py0, pw, ph, 'slate'), r(px0 + 1, py0 + 1, pw - 2, ph - 2, 'ink'),
      ...dots(px0 + 6, py0 + 5, 64, 36, 3, 'slate'),
      r(222, 248, 20, 14, 'night'), r(226, 252, 2, 5, 'silver'), r(231, 252, 2, 5, 'silver'), r(236, 252, 2, 5, 'silver'),
      r(228, 262, 8, 32, 'night'),
      R(PSU_SWITCH, 'night'), on ? r(PSU_SWITCH[0] + 1, PSU_SWITCH[1] + 1, 8, 6, 'lime') : r(PSU_SWITCH[0] + 1, PSU_SWITCH[1] + 7, 8, 6, 'red'),
      on ? r(PSU_SWITCH[0] + 4, PSU_SWITCH[1] + 9, 2, 3, 'slate') : r(PSU_SWITCH[0] + 3, PSU_SWITCH[1] + 2, 4, 3, 'slate'),
    );
  } else {
    px.push(r(PSU_BACK[0], PSU_BACK[1], PSU_BACK[2], PSU_BACK[3], 'night'));
  }
  if (a.monitor) {
    const port = a.monitor === 'gpu' ? PORT_GPU : PORT_MB;
    px.push(r(port[0] - 2, port[1] - 2, 15, 9, 'night'), r(port[0] - 1, port[1] - 1, 13, 7, 'ink'), r(port[0] + 4, port[1] + 7, 4, 287 - port[1] - 7, 'ink'));
  }
  return <Rects px={px} />;
}

/** Malá mapka celé skříně s rámečkem, kam se právě díváš (v přiblížení na desku). */
export function MiniMap({ onMat }: { onMat: boolean }) {
  const [cx, cy, cw, ch] = CROP.board;
  return (
    <svg width={80} height={60} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect x={0} y={0} width={WORLD_W} height={WORLD_H} fill="#1a1c2c" />
      <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} fill="#566c86" />
      <rect x={CASE.x + 6} y={CASE.y + 6} width={CASE.w - 12} height={CASE.h - 12} fill="#333c57" />
      <rect x={52} y={SHROUD_Y} width={284} height={48} fill="#1a1c2c" />
      {onMat ? null : <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} fill="#29366f" />}
      <rect x={cx} y={cy} width={cw} height={ch} fill="none" stroke="#ffcd75" strokeWidth={10} />
    </svg>
  );
}

/** Prázdná deska na bílém papíře pro manuál. */
export function ManualBoard({ mb }: { mb: Motherboard }) {
  const [cx, cy, cw, ch] = CROP.board;
  return <Rects px={[r(cx, cy, cw, ch, 'white'), ...board(mb)]} />;
}
