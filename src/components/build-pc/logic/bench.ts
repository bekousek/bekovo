import { partsIn, type Case, type Cooler, type Cpu, type Gpu, type Motherboard, type Os, type Psu, type Ram, type Storage } from '../data/parts';
import { boardFitsCase, coolerFitsCpu, cpuFitsBoard, psuEnough, ramFitsBoard } from './compat';

export type GoalId = 'gaming' | 'video' | 'school';

export interface Goal {
  id: GoalId;
  title: string;
  short: string;
  pitch: string;
  /** Co musí sestava splnit, lidsky. */
  target: string;
}

export const GOALS: Goal[] = [
  {
    id: 'gaming', title: 'Herní PC', short: 'herní PC',
    pitch: 'Hrát Fortnite a Forzu ve Full HD plynule a ve vysokých detailech.',
    target: 'Fortnite aspoň 100 FPS a Forza Horizon 5 aspoň 60 FPS (1080p, vysoké detaily).',
  },
  {
    id: 'video', title: 'PC na střih videa', short: 'PC na střih videa',
    pitch: 'Stříhat videa na YouTube a TikTok bez čekání.',
    target: 'Export 10minutového videa do 5 minut a aspoň 32 GB paměti.',
  },
  {
    id: 'school', title: 'Levné PC do školy', short: 'levné PC do školy',
    pitch: 'Úkoly, prezentace, prohlížeč a videohovory. Hlavně levně.',
    target: 'Funkční PC se systémem na SSD do 20 000 Kč.',
  },
];

export const GOAL_BY_ID = Object.fromEntries(GOALS.map((g) => [g.id, g])) as Record<GoalId, Goal>;

export interface Rig {
  cpu: Cpu;
  mb: Motherboard;
  ram: Ram;
  storage: Storage[];
  gpu?: Gpu;
  psu: Psu;
  case: Case;
  cooler?: Cooler;
  os: Os;
  /** Skutečné osazení slotů (dva moduly ve stejném kanálu = jeden kanál). */
  singleChannel?: boolean;
}

export interface Bench {
  fortnite: number;
  forza: number;
  exportMin: number;
  bootSec: number;
  singleChannel: boolean;
  systemOnHdd: boolean;
  fit: boolean;
  /** Proč sestava (ne)splnila zakázku, věty pro žáka. */
  reasons: string[];
}

const IGPU_FPS = { good: { fortnite: 45, forza: 30 }, basic: { fortnite: 18, forza: 10 }, none: { fortnite: 0, forza: 0 } };

export function rigPrice(r: Rig): number {
  return r.cpu.price + r.mb.price + r.ram.price + r.storage.reduce((s, x) => s + x.price, 0)
    + (r.gpu?.price ?? 0) + r.psu.price + r.case.price + (r.cooler?.price ?? 0) + r.os.price;
}

export function bench(r: Rig, goal: GoalId): Bench {
  const base = r.gpu ? r.gpu.fps : IGPU_FPS[r.cpu.igpu];
  const singleChannel = r.singleChannel ?? r.ram.modules === 1;
  const cpuScale = (0.4 + 0.6 * r.cpu.gameFactor) * (singleChannel ? 0.88 : 1);
  const fortnite = Math.round(base.fortnite * cpuScale);
  const forza = Math.round(base.forza * cpuScale);
  const systemOnHdd = r.storage.length > 0 && r.storage[0].kind === 'hdd';
  let exportMin = r.cpu.exportMin * (r.gpu ? 0.55 : 1) * (r.ram.totalGB < 32 ? 1.15 : 1) * (systemOnHdd ? 1.2 : 1);
  exportMin = Math.round(exportMin * 2) / 2;
  const bootSec = systemOnHdd ? 45 : 12;

  const reasons: string[] = [];
  let fit = false;
  if (goal === 'gaming') {
    const okF = fortnite >= 100;
    const okZ = forza >= 60;
    fit = okF && okZ;
    if (!r.gpu) reasons.push('Bez grafické karty se moderní hry ve vysokých detailech hrát nedají.');
    else if (!fit) reasons.push(`${r.gpu.short} na zadání nestačí.`);
    if (singleChannel) reasons.push('Jeden modul paměti ubral pár snímků za sekundu.');
    if (fit) reasons.push('Obě hry poběží plynule.');
  } else if (goal === 'video') {
    const okT = exportMin <= 5;
    const okR = r.ram.totalGB >= 32;
    fit = okT && okR;
    if (!okR) reasons.push(`${r.ram.totalGB} GB paměti je na střih málo, náhled videa se bude sekat.`);
    if (!okT) reasons.push(r.gpu ? 'Procesor je na export pomalý.' : 'Bez grafické karty se video exportuje jen procesorem, a to trvá dlouho.');
    if (fit) reasons.push('Export i náhled poběží rychle.');
  } else {
    const price = rigPrice(r);
    const okP = price <= 20000;
    const okS = !systemOnHdd;
    fit = okP && okS;
    if (!okP) reasons.push('Sestava je na školní počítač zbytečně drahá.');
    if (!okS) reasons.push('Systém na pevném disku startuje pomalu.');
    if (r.gpu) reasons.push('Grafická karta je do školy zbytečná, procesor s grafikou by stačil.');
    if (fit) reasons.push('Na úkoly, prezentace a videohovory počítač stačí.');
  }
  return { fortnite, forza, exportMin, bootSec, singleChannel, systemOnHdd, fit, reasons };
}

export interface Cheapest {
  price: number;
  rig: Rig;
}

const cheapestOf = <T extends { price: number }>(list: T[]) => list.reduce<T | undefined>((m, x) => (!m || x.price < m.price ? x : m), undefined);

/** Nejlevnější sestava z katalogu, která splní zakázku. Na srovnání „nepřeplatil jsi?“. */
export function cheapestFit(goal: GoalId): Cheapest | null {
  const cpus = partsIn('cpu');
  const mbs = partsIn('mb');
  const rams = partsIn('ram');
  const gpus: (Gpu | undefined)[] = [undefined, ...partsIn('gpu')];
  const ssds = partsIn('storage').filter((s) => s.kind === 'nvme');
  const psus = partsIn('psu');
  const cases = partsIn('case');
  const coolers = partsIn('cooler');
  const os = cheapestOf(partsIn('os'))!;
  const ssd = cheapestOf(ssds)!;

  let best: Cheapest | null = null;
  for (const cpu of cpus) for (const mb of mbs) {
    if (!cpuFitsBoard(cpu, mb)) continue;
    const kase = cheapestOf(cases.filter((c) => boardFitsCase(mb, c)));
    if (!kase) continue;
    const cooler = cpu.boxCooler ? undefined : cheapestOf(coolers.filter((c) => coolerFitsCpu(c, cpu)));
    if (!cpu.boxCooler && !cooler) continue;
    for (const ram of rams) {
      if (!ramFitsBoard(ram, mb)) continue;
      for (const gpu of gpus) {
        if (!gpu && cpu.igpu === 'none') continue;
        const psu = cheapestOf(psus.filter((p) => psuEnough(p, gpu)));
        if (!psu) continue;
        const rig: Rig = { cpu, mb, ram, storage: [ssd], gpu, psu, case: kase, cooler, os };
        if (!bench(rig, goal).fit) continue;
        const price = rigPrice(rig);
        if (!best || price < best.price) best = { price, rig };
      }
    }
  }
  return best;
}
