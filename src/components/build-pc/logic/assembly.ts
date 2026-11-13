import type { Asm } from '../state';
import type { SpriteKey } from '../pixel/sprites';
import type { Part } from '../data/parts';

/** Díly, které jsou fyzicky v počítači (nedají se vrátit). */
export function installedIds(asm: Asm): string[] {
  const ids = [
    asm.mb,
    asm.cpu?.id,
    asm.cooler && asm.cooler.id !== 'box' ? asm.cooler.id : null,
    ...Object.values(asm.ram),
    asm.m2?.id,
    asm.caseId,
    asm.psu,
    asm.gpu,
    asm.hdd,
  ];
  return [...new Set(ids.filter((x): x is string => !!x))];
}

export const RETURN_FEE = 149;

export function refundOf(p: Part): number {
  return Math.max(0, p.price - (p.price > 0 ? RETURN_FEE : 0));
}

export function spriteOf(p: Part): SpriteKey {
  switch (p.cat) {
    case 'cpu': return 'cpu';
    case 'mb': return 'mb';
    case 'ram': return p.mem === 'DDR4' ? 'ramDdr4' : 'ram';
    case 'storage': return p.kind === 'hdd' ? 'hdd' : 'ssd';
    case 'gpu': return 'gpu';
    case 'psu': return 'psu';
    case 'case': return 'case';
    case 'cooler': return p.kind === 'aio' ? 'aio' : 'cooler';
    case 'os': return p.kind === 'windows' ? 'osWin' : 'osLinux';
  }
}

/** Měřítko spritu v obchodě, aby díly různých velikostí působily vyrovnaně. */
