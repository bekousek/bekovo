import {
  CATEGORIES,
  PART_BY_ID,
  type Case,
  type Cooler,
  type Cpu,
  type Gpu,
  type Motherboard,
  type Os,
  type Part,
  type Psu,
  type Ram,
  type Storage,
} from '../data/parts';

export interface Issue {
  level: 'error' | 'warn' | 'info';
  text: string;
  /** Díly, kterých se problém týká (pro zvýraznění a vrácení). */
  parts: string[];
}

export interface Bag {
  cpu: Cpu[];
  mb: Motherboard[];
  ram: Ram[];
  storage: Storage[];
  gpu: Gpu[];
  psu: Psu[];
  case: Case[];
  cooler: Cooler[];
  os: Os[];
}

export function bagOf(ids: string[]): Bag {
  const bag: Bag = { cpu: [], mb: [], ram: [], storage: [], gpu: [], psu: [], case: [], cooler: [], os: [] };
  for (const id of ids) {
    const p = PART_BY_ID[id];
    if (p) (bag[p.cat] as Part[]).push(p);
  }
  return bag;
}

// ——— Fyzické kontroly, stejné v obchodě i v dílně ———

export const cpuFitsBoard = (cpu: Cpu, mb: Motherboard) => cpu.socket === mb.socket;
export const ramFitsBoard = (ram: Ram, mb: Motherboard) => ram.mem === mb.mem;
export const boardFitsCase = (mb: Motherboard, c: Case) => c.forms.includes(mb.form);
export const coolerFitsCpu = (cooler: Cooler, cpu: Cpu) => cooler.sockets.includes(cpu.socket);
export const psuEnough = (psu: Psu, gpu: Gpu | undefined) => psu.watts >= (gpu ? gpu.recPsu : 300);

export const whyCpu = (cpu: Cpu, mb: Motherboard) =>
  `${cpu.short} má patici ${cpu.socket}, deska ${mb.short} má ${mb.socket}. Procesor do ní nepasuje.`;
export const whyRam = (ram: Ram, mb: Motherboard) =>
  `${ram.short} je ${ram.mem}, deska ${mb.short} má sloty pro ${mb.mem}. Zářez na modulu je jinde, paměť nejde zasunout.`;
export const whyCase = (mb: Motherboard, c: Case) =>
  `Deska ${mb.short} má formát ${mb.form}, do skříně ${c.short} se vejde jen ${c.forms.join(' a ')}.`;
export const whyCooler = (cooler: Cooler, cpu: Cpu) =>
  `Chladič ${cooler.short} umí jen patice ${cooler.sockets.join(', ')}. Na ${cpu.short} (${cpu.socket}) ho nepřipevníš.`;
export const whyPsu = (psu: Psu, gpu: Gpu) =>
  `${gpu.short} potřebuje zdroj aspoň ${gpu.recPsu} W, ${psu.short} má jen ${psu.watts} W. Při hraní by se počítač vypínal.`;

/** Kontrola sestavy na požádání (tlačítko „Zkontrolovat sestavu“). */
export function checkBuild(ids: string[]): Issue[] {
  const b = bagOf(ids);
  const out: Issue[] = [];

  const missing = CATEGORIES.filter((c) => c.required && b[c.id].length === 0).map((c) => c.label.toLowerCase());
  if (missing.length) {
    out.push({ level: 'warn', text: `Chybí: ${missing.join(', ')}.`, parts: [] });
  }

  for (const cpu of b.cpu) for (const mb of b.mb) {
    if (!cpuFitsBoard(cpu, mb)) out.push({ level: 'error', text: whyCpu(cpu, mb), parts: [cpu.id, mb.id] });
  }
  for (const ram of b.ram) for (const mb of b.mb) {
    if (!ramFitsBoard(ram, mb)) out.push({ level: 'error', text: whyRam(ram, mb), parts: [ram.id, mb.id] });
  }
  for (const mb of b.mb) for (const c of b.case) {
    if (!boardFitsCase(mb, c)) out.push({ level: 'error', text: whyCase(mb, c), parts: [mb.id, c.id] });
  }
  for (const psu of b.psu) for (const gpu of b.gpu) {
    if (!psuEnough(psu, gpu)) out.push({ level: 'error', text: whyPsu(psu, gpu), parts: [psu.id, gpu.id] });
  }
  if (b.gpu.length === 0) {
    for (const cpu of b.cpu) {
      if (cpu.igpu === 'none') {
        out.push({ level: 'error', text: `${cpu.short} nemá grafiku v procesoru a nemáš grafickou kartu. Monitor by zůstal černý.`, parts: [cpu.id] });
      }
    }
  }
  for (const cpu of b.cpu) {
    if (!cpu.boxCooler && b.cooler.length === 0) {
      out.push({ level: 'error', text: `${cpu.short} nemá v krabici chladič. Bez chladiče se přehřeje, dokup ho.`, parts: [cpu.id] });
    }
    for (const cooler of b.cooler) {
      if (!coolerFitsCpu(cooler, cpu)) out.push({ level: 'error', text: whyCooler(cooler, cpu), parts: [cooler.id, cpu.id] });
    }
  }

  if (b.storage.length > 0 && b.storage.every((s) => s.kind === 'hdd')) {
    out.push({ level: 'warn', text: 'Systém na pevném disku (HDD) bude startovat pomalu. Na systém se hodí SSD.', parts: b.storage.map((s) => s.id) });
  }
  for (const ram of b.ram) {
    if (ram.modules === 1) out.push({ level: 'info', text: `${ram.short} je jeden modul, paměť poběží jen v jednom kanálu. Dva moduly jsou rychlejší.`, parts: [ram.id] });
  }
  for (const cpu of b.cpu) {
    if (cpu.boxCooler && b.cooler.length > 0) out.push({ level: 'info', text: `${cpu.short} má chladič v krabici. Další chladič není nutný.`, parts: b.cooler.map((c) => c.id) });
  }
  for (const c of CATEGORIES) {
    if (c.id === 'storage') continue;
    const list = b[c.id] as Part[];
    if (list.length > 1) out.push({ level: 'info', text: `Máš ${list.length}× ${c.label.toLowerCase()}. Do počítače použiješ jen jeden, ostatní můžeš vrátit.`, parts: list.map((p) => p.id) });
  }

  return out;
}

export const hasErrors = (issues: Issue[]) => issues.some((i) => i.level === 'error');
