/**
 * Kroky dílny odvozené z účtenky: každý koupený díl je řádek, k tomu kroky
 * bez dílu (pasta, kabely, bočnice, monitor). Stejná logika rozhoduje,
 * co se smí položit kam (place) i co ukáže POST.
 */
import {
  PART_BY_ID, type Case, type Cooler, type Cpu, type Gpu, type Motherboard, type Psu, type Ram, type Storage,
} from '../data/parts';
import {
  boardFitsCase, coolerFitsCpu, cpuFitsBoard, psuEnough, ramFitsBoard, whyCase, whyCooler, whyCpu, whyRam,
} from '../logic/compat';
import { addNote, emptyAsm, type Asm, type GameState, type RamSlot } from '../state';
import type { SpriteKey } from '../pixel/sprites';
import { spriteOf } from '../logic/assembly';
import type { TargetId, View } from './slots';

export type LineStatus = 'done' | 'ready' | 'wait' | 'block' | 'extra' | 'missing';

export interface Line {
  key: string;
  label: string;
  partId?: string;
  price?: number;
  sprite?: SpriteKey;
  status: LineStatus;
  sub?: string;
  view: View;
  targets: TargetId[];
  /** Lákavé, ale špatné cíle: ukážou se a po upuštění vysvětlí proč ne. */
  traps: TargetId[];
  tool?: 'rotate' | 'paste';
  /** Krok se provede ťuknutím na řádek (bez přetahování). */
  instant?: 'panel' | 'power';
  /** Díl jde z počítače zase vyndat. */
  removable?: boolean;
  indent?: boolean;
}

const SLOTS: RamSlot[] = ['A1', 'A2', 'B1', 'B2'];

/** Dva kanály = jeden modul v kanálu A a druhý v kanálu B. */
export const ramDual = (slots: RamSlot[]) => slots.some((x) => x[0] === 'A') && slots.some((x) => x[0] === 'B');
const CONNECTORS: TargetId[] = ['atx24', 'eps8', 'gpu-power', 'hdd-sata'];

const owned = <T>(s: GameState, cat: string) => s.owned.map((id) => PART_BY_ID[id]).filter((p) => p?.cat === cat) as T[];

export function activeParts(s: GameState) {
  const a = s.asm;
  const mb = a.mb ? (PART_BY_ID[a.mb] as Motherboard) : undefined;
  const cpu = a.cpu ? (PART_BY_ID[a.cpu.id] as Cpu) : undefined;
  const cooler = a.cooler && a.cooler.id !== 'box' ? (PART_BY_ID[a.cooler.id] as Cooler) : undefined;
  const ramIds = [...new Set(Object.values(a.ram))] as string[];
  const ram = ramIds.length ? (PART_BY_ID[ramIds[0]] as Ram) : undefined;
  const gpu = a.gpu ? (PART_BY_ID[a.gpu] as Gpu) : undefined;
  const psu = a.psu ? (PART_BY_ID[a.psu] as Psu) : undefined;
  const kase = a.caseId ? (PART_BY_ID[a.caseId] as Case) : undefined;
  const storage = [a.m2?.id, a.hdd].filter(Boolean).map((id) => PART_BY_ID[id!] as Storage);
  return { mb, cpu, cooler, ram, ramIds, gpu, psu, kase, storage };
}

/** Skříň, do které se deska bude dávat: první koupená, do které se vejde. */
export function caseFor(s: GameState): Case | undefined {
  const cases = owned<Case>(s, 'case');
  const mb = s.asm.mb ? (PART_BY_ID[s.asm.mb] as Motherboard) : undefined;
  if (!mb) return cases[0];
  return cases.find((c) => boardFitsCase(mb, c)) ?? cases[0];
}

function boardPrereqs(s: GameState): string[] {
  const a = s.asm;
  const todo: string[] = [];
  if (!a.cpu?.lever) todo.push('procesor');
  const cpu = a.cpu ? (PART_BY_ID[a.cpu.id] as Cpu) : undefined;
  const coolerAvailable = (cpu?.boxCooler ?? false) || owned<Cooler>(s, 'cooler').some((c) => !cpu || coolerFitsCpu(c, cpu));
  if (coolerAvailable && !(a.cooler?.fan)) todo.push('chladič');
  const mb = a.mb ? (PART_BY_ID[a.mb] as Motherboard) : undefined;
  const ramOk = owned<Ram>(s, 'ram').some((r) => !mb || ramFitsBoard(r, mb));
  const ramPlaced = Object.values(a.ram).length;
  const firstRam = Object.values(a.ram)[0];
  const need = firstRam ? (PART_BY_ID[firstRam] as Ram).modules : 1;
  if (ramOk && ramPlaced < need) todo.push('paměť');
  const nvme = owned<Storage>(s, 'storage').some((x) => x.kind === 'nvme');
  if (nvme && !a.m2?.screwed) todo.push('SSD');
  return todo;
}

export function buildLines(s: GameState): Line[] {
  const a = s.asm;
  const lines: Line[] = [];
  const blocked = (id: string) => a.blocked.includes(id);
  const mb = a.mb ? (PART_BY_ID[a.mb] as Motherboard) : undefined;
  const base = (over: Partial<Line> & Pick<Line, 'key' | 'label' | 'status'>): Line => ({ view: 'board', targets: [], traps: [], ...over });

  // ——— Základní deska ———
  const mbs = owned<Motherboard>(s, 'mb');
  if (mbs.length === 0) lines.push(base({ key: 'mb-missing', label: 'Základní deska', status: 'missing', sub: 'Chybí. Kup ji v obchodě.' }));
  for (const p of mbs) {
    const common = { key: `mb:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: spriteOf(p) };
    if (a.mb === p.id) lines.push(base({ ...common, status: 'done', sub: a.caseId ? 'Ve skříni.' : 'Leží na antistatické podložce.' }));
    else if (a.mb) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ji vrátit.' }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Polož desku na antistatickou podložku.', targets: ['mat'] }));
  }

  // ——— Procesor ———
  const cpus = owned<Cpu>(s, 'cpu');
  if (cpus.length === 0) lines.push(base({ key: 'cpu-missing', label: 'Procesor', status: 'missing', sub: 'Chybí. Kup ho v obchodě.' }));
  for (const p of cpus) {
    const common = { key: `cpu:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: 'cpu' as SpriteKey };
    if (a.cpu?.id === p.id) {
      if (!a.cpu.lever) lines.push(base({ ...common, status: 'ready', sub: 'Procesor sedí. Teď zavři páčku patice.', targets: ['lever'] }));
      else lines.push(base({ ...common, status: 'done', sub: 'V patici, páčka zavřená.' }));
    } else if (a.cpu) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ho vrátit.' }));
    else if (!mb) lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív polož desku na podložku.' }));
    else if (blocked(p.id)) lines.push(base({ ...common, status: 'block', sub: whyCpu(p, mb) }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Otoč procesor, aby zlatý trojúhelník seděl s trojúhelníkem na patici, a vlož ho.', targets: ['socket'], tool: 'rotate' }));
  }

  // ——— Chladič (z krabice procesoru nebo dokoupený) ———
  const cpuIn = a.cpu ? (PART_BY_ID[a.cpu.id] as Cpu) : undefined;
  const coolers = owned<Cooler>(s, 'cooler');
  const coolerLine = (key: string, label: string, part: Cooler | null, price?: number) => {
    const sprite: SpriteKey = part ? spriteOf(part) : 'cooler';
    const common = { key, label, partId: part?.id, price, sprite };
    const id = part ? part.id : 'box';
    if (a.cooler?.id === id) {
      if (!a.cooler.fan) lines.push(base({ ...common, status: 'ready', sub: 'Zapoj kabel větráku do konektoru na desce.', targets: ['fan-cpu'], traps: ['fan-sys'], sprite: 'plugFan' }));
      else lines.push(base({ ...common, status: 'done', sub: 'Nasazený, větrák zapojený do CPU_FAN.' }));
      return;
    }
    if (a.cooler) { lines.push(base({ ...common, status: 'extra', sub: part ? 'Navíc. Můžeš ho vrátit.' : 'Nepoužitý, nevadí.' })); return; }
    if (!a.cpu?.lever) { lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív vlož procesor.' })); return; }
    if (part && cpuIn && blocked(part.id)) { lines.push(base({ ...common, status: 'block', sub: whyCooler(part, cpuIn) })); return; }
    if (part && !a.paste) { lines.push(base({ ...common, status: 'ready', sub: 'Nejdřív nanes na procesor teplovodivou pastu.', tool: 'paste' })); return; }
    lines.push(base({
      ...common, status: 'ready', targets: ['cpu-top'],
      sub: part ? 'Pasta je na procesoru. Nasaď chladič.' : 'Chladič z krabice má pastu nanesenou z výroby. Nasaď ho na procesor.',
    }));
  };
  if (cpuIn?.boxCooler) coolerLine('cooler:box', 'Chladič z krabice CPU', null);
  for (const c of coolers) coolerLine(`cooler:${c.id}`, c.short, c, c.price);
  if (!cpuIn?.boxCooler && coolers.length === 0 && cpus.length > 0 && !cpus.some((c) => c.boxCooler)) {
    lines.push(base({ key: 'cooler-missing', label: 'Chladič', status: 'missing', sub: 'Chybí. Procesor ho nemá v krabici, kup ho v obchodě.' }));
  }

  // ——— Paměť ———
  const rams = owned<Ram>(s, 'ram');
  const usedRam = Object.values(a.ram)[0];
  if (rams.length === 0) lines.push(base({ key: 'ram-missing', label: 'Operační paměť', status: 'missing', sub: 'Chybí. Kup ji v obchodě.' }));
  for (const p of rams) {
    const placed = Object.values(a.ram).filter((x) => x === p.id).length;
    const common = { key: `ram:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: spriteOf(p) };
    if (placed >= p.modules) {
      const slots = SLOTS.filter((sl) => a.ram[sl] === p.id);
      lines.push(base({
        ...common, status: 'done', removable: !a.panel,
        sub: p.modules === 1
          ? `Ve slotu ${slots[0]}. Jeden modul = jeden kanál.`
          : ramDual(slots) ? `V ${slots.join(' a ')}, běží ve dvou kanálech.` : `V ${slots.join(' a ')}: jen jeden kanál.`,
      }));
    } else if (usedRam && usedRam !== p.id) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ji vrátit.' }));
    else if (!mb) lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív polož desku na podložku.' }));
    else if (blocked(p.id)) lines.push(base({ ...common, status: 'block', sub: whyRam(p, mb) }));
    else {
      const free = SLOTS.filter((sl) => !a.ram[sl]);
      lines.push(base({
        ...common, status: 'ready', targets: free,
        sub: placed === 0
          ? `Zasuň ${p.modules === 2 ? 'oba moduly' : 'modul'} do slotů. Výrobce desky doporučuje šedé sloty A2 a B2.`
          : 'Zasuň i druhý modul.',
      }));
    }
  }

  // ——— SSD M.2 ———
  const storages = owned<Storage>(s, 'storage');
  if (storages.length === 0) lines.push(base({ key: 'storage-missing', label: 'Disk', status: 'missing', sub: 'Chybí. Kup ho v obchodě.' }));
  for (const p of storages.filter((x) => x.kind === 'nvme')) {
    const common = { key: `ssd:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: 'ssd' as SpriteKey };
    if (a.m2?.id === p.id) {
      if (!a.m2.screwed) lines.push(base({ ...common, status: 'ready', sub: 'Přišroubuj konec SSD šroubkem.', targets: ['m2-screw'] }));
      else lines.push(base({ ...common, status: 'done', sub: 'Ve slotu M.2, přišroubovaný.', removable: !a.panel }));
    } else if (a.m2) lines.push(base({ ...common, status: 'extra', sub: 'Do druhého slotu M.2 se v této hře nedává. Můžeš ho vrátit.' }));
    else if (!mb) lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív polož desku na podložku.' }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Zasuň SSD šikmo do slotu M.2 a přitlač ho.', targets: ['m2'] }));
  }

  // ——— Deska do skříně ———
  const kase = caseFor(s);
  if (!kase) lines.push(base({ key: 'case-missing', label: 'Skříň', status: 'missing', sub: 'Chybí. Kup ji v obchodě.', view: 'case' }));
  else {
    const common = { key: `case:${kase.id}`, label: `Deska do skříně ${kase.short}`, partId: kase.id, price: kase.price, sprite: 'mb' as SpriteKey, view: 'case' as View };
    if (a.caseId) lines.push(base({ ...common, status: 'done', sub: 'Deska je přišroubovaná na sloupcích.' }));
    else if (!mb) lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív polož desku na podložku.' }));
    else if (blocked(kase.id)) lines.push(base({ ...common, status: 'block', sub: whyCase(mb, kase) }));
    else {
      const todo = boardPrereqs(s);
      if (todo.length) lines.push(base({ ...common, status: 'wait', sub: `Nejdřív dodělej na desce: ${todo.join(', ')}.` }));
      else lines.push(base({ ...common, status: 'ready', sub: 'Přenes desku do skříně na distanční sloupky.', targets: ['standoffs'] }));
    }
    for (const other of owned<Case>(s, 'case').filter((c) => c.id !== kase.id)) {
      lines.push(base({ key: `case:${other.id}`, label: other.short, partId: other.id, price: other.price, status: 'extra', sub: 'Druhá skříň navíc. Můžeš ji vrátit.', view: 'case' }));
    }
  }

  // ——— Zdroj ———
  const psus = owned<Psu>(s, 'psu');
  if (psus.length === 0) lines.push(base({ key: 'psu-missing', label: 'Zdroj', status: 'missing', sub: 'Chybí. Kup ho v obchodě.', view: 'case' }));
  for (const p of psus) {
    const common = { key: `psu:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: 'psu' as SpriteKey, view: 'case' as View };
    if (a.psu === p.id) lines.push(base({ ...common, status: 'done', sub: 'Přišroubovaný dole ve skříni.', removable: !a.panel }));
    else if (a.psu) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ho vrátit.' }));
    else if (!a.caseId) lines.push(base({ ...common, status: 'wait', sub: 'Nejdřív dej desku do skříně.' }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Zasuň zdroj na jeho místo dole ve skříni.', targets: ['psu-bay'] }));
  }

  // ——— Grafická karta ———
  for (const p of owned<Gpu>(s, 'gpu')) {
    const common = { key: `gpu:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: 'gpu' as SpriteKey, view: 'case' as View };
    if (a.gpu === p.id) lines.push(base({ ...common, status: 'done', sub: 'Ve slotu PCIe x16, přišroubovaná.', removable: !a.panel }));
    else if (a.gpu) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ji vrátit.' }));
    else if (!a.caseId) lines.push(base({ ...common, status: 'wait', sub: 'Karta se dává až do desky ve skříni.' }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Zasuň kartu do horního slotu PCIe x16, až cvakne pojistka.', targets: ['pcie'] }));
  }

  // ——— Pevný disk ———
  for (const p of storages.filter((x) => x.kind === 'hdd')) {
    const common = { key: `hdd:${p.id}`, label: p.short, partId: p.id, price: p.price, sprite: 'hdd' as SpriteKey, view: 'case' as View };
    if (a.hdd === p.id) lines.push(base({ ...common, status: 'done', sub: 'V šachtě na disky.', removable: !a.panel }));
    else if (a.hdd) lines.push(base({ ...common, status: 'extra', sub: 'Navíc. Můžeš ho vrátit.' }));
    else if (!a.caseId) lines.push(base({ ...common, status: 'wait', sub: 'Disk se montuje do skříně.' }));
    else lines.push(base({ ...common, status: 'ready', sub: 'Zasuň disk do šachty vpředu ve skříni.', targets: ['drive-bay'] }));
  }

  // ——— Kabely ze zdroje ———
  const cableTraps = (right: TargetId) => CONNECTORS.filter((c) => c !== right && (c !== 'gpu-power' || a.gpu) && (c !== 'hdd-sata' || a.hdd));
  if (!a.psu || !a.caseId) {
    lines.push(base({ key: 'cables', label: 'Kabely ze zdroje', status: 'wait', view: 'case', sub: 'Až bude zdroj i deska ve skříni.' }));
  } else {
    const cable = (key: keyof Asm['cables'], label: string, target: TargetId, sprite: SpriteKey, how: string) => {
      const done = a.cables[key];
      lines.push(base({
        key: `cable:${key}`, label, sprite, view: 'case', indent: true,
        status: done ? 'done' : 'ready', sub: done ? 'Zapojeno.' : how,
        targets: done ? [] : [target], traps: done ? [] : cableTraps(target),
      }));
    };
    cable('atx', 'Kabel 24pin → deska', 'atx24', 'plug24', 'Nejširší konektor. Patří na pravý okraj desky.');
    cable('eps', 'Kabel 8pin → procesor', 'eps8', 'plug8', 'Napájení procesoru, zapojuje se nahoře vlevo.');
    if (a.gpu) cable('pcie', 'Kabel PCIe → grafika', 'gpu-power', 'plugPcie', 'Napájení grafické karty, zapojuje se do jejího horního okraje.');
    if (a.hdd) cable('sata', 'Kabel SATA → disk', 'hdd-sata', 'plugSata', 'Plochý konektor do pevného disku.');
  }

  // ——— Bočnice, monitor, zapnutí ———
  const cablesDone = !!a.psu && !!a.caseId && a.cables.atx && a.cables.eps && (!a.gpu || a.cables.pcie) && (!a.hdd || a.cables.sata);
  const coolerDone = !!a.cooler?.fan || !(cpuIn?.boxCooler || coolers.length);
  const inside = cablesDone && coolerDone;
  lines.push(base({
    key: 'panel', label: 'Bočnice', view: 'case',
    status: a.panel ? 'done' : inside ? 'ready' : 'wait',
    sub: a.panel ? 'Zavřená.' : inside ? 'Všechno je zapojené. Ťukni a zavři skříň.' : 'Až bude všechno uvnitř zapojené.',
    instant: 'panel',
  }));
  const portRight: TargetId = a.gpu ? 'port-gpu' : 'port-mb';
  lines.push(base({
    key: 'monitor', label: 'Monitor (kabel HDMI)', view: 'back', sprite: 'hdmi',
    status: a.monitor ? 'done' : a.panel ? 'ready' : 'wait',
    sub: a.monitor ? (a.monitor === 'gpu' ? 'Zapojený do grafické karty.' : 'Zapojený do desky.') : a.panel ? 'Otoč počítač a zapoj monitor do správného výstupu.' : 'Až bude skříň zavřená.',
    targets: a.monitor ? [] : [portRight],
    traps: a.monitor || !a.gpu ? [] : ['port-mb'],
  }));
  lines.push(base({
    key: 'power', label: 'Zapnout počítač', view: 'back',
    status: a.monitor ? 'ready' : 'wait',
    sub: a.monitor ? 'Všechno je zapojené. Zmáčkni tlačítko napájení.' : 'Až bude zapojený monitor.',
    instant: 'power',
  }));

  return lines;
}

export interface PlaceResult {
  ok: boolean;
  text: string;
}

const T = (ok: boolean, text: string): PlaceResult => ({ ok, text });

/** Pokus položit díl z řádku `line` na cíl `target`. Mění draft stavu. */
export function place(d: GameState, line: Line, target: TargetId): PlaceResult {
  const a = d.asm;
  const p = line.partId ? PART_BY_ID[line.partId] : undefined;

  if (line.traps.includes(target)) {
    if (target === 'fan-sys') {
      addNote(d, 'mistake', 'Větrák procesoru jsi chtěl zapojit do SYS_FAN.');
      return T(false, 'SYS_FAN je pro větráky skříně. Větrák procesoru patří do CPU_FAN, jinak deska po startu hlásí chybu a procesor se může přehřát.');
    }
    if (target === 'port-mb') {
      addNote(d, 'mistake', 'Monitor jsi chtěl zapojit do desky, i když máš grafickou kartu.');
      return T(false, 'Monitor by zůstal černý. Když je v počítači grafická karta, obraz počítá ona. Zapoj ho do výstupu na kartě.');
    }
    addNote(d, 'mistake', 'Kabel ze zdroje jsi chtěl zapojit do špatného konektoru.');
    return T(false, 'Tenhle konektor má jiný tvar a počet pinů. Najdi ten, kam kabel pasuje.');
  }
  if (!line.targets.includes(target)) return T(false, 'Sem to nepatří.');

  switch (line.key.split(':')[0]) {
    case 'mb':
      a.mb = line.partId!;
      return T(true, 'Deska leží na podložce. Statická elektřina jí tu neublíží.');
    case 'cpu': {
      if (target === 'lever') {
        a.cpu!.lever = true;
        return T(true, 'Páčka zavřená, procesor je pevně v patici.');
      }
      const cpu = p as Cpu;
      const mb = PART_BY_ID[a.mb!] as Motherboard;
      if (!cpuFitsBoard(cpu, mb)) {
        if (!a.blocked.includes(cpu.id)) a.blocked.push(cpu.id);
        addNote(d, 'mistake', `Koupil jsi procesor s jinou paticí, než má deska (${cpu.socket} × ${mb.socket}).`, true);
        return T(false, `${whyCpu(cpu, mb)} Vrať procesor nebo desku a kup kus se stejnou paticí.`);
      }
      if (a.cpuRot !== 0) {
        addNote(d, 'tip', 'Procesor jde do patice jen jedním směrem: podle zlatého trojúhelníku.');
        return T(false, 'Nesedí to: zlatý trojúhelník na procesoru musí být ve stejném rohu jako trojúhelník na patici. Otoč procesor.');
      }
      a.cpu = { id: cpu.id, seated: true, lever: false };
      return T(true, 'Procesor dosedl bez tlačení. Teď zavři páčku.');
    }
    case 'cooler': {
      if (target === 'fan-cpu') {
        a.cooler!.fan = true;
        return T(true, 'Větrák je v CPU_FAN. Deska ho bude roztáčet podle teploty procesoru.');
      }
      const cpu = PART_BY_ID[a.cpu!.id] as Cpu;
      if (p) {
        const cooler = p as Cooler;
        if (!coolerFitsCpu(cooler, cpu)) {
          if (!a.blocked.includes(cooler.id)) a.blocked.push(cooler.id);
          addNote(d, 'mistake', `Chladič ${cooler.short} nepasuje na patici ${cpu.socket}.`, true);
          return T(false, `${whyCooler(cooler, cpu)} Vrať ho a kup chladič pro ${cpu.socket}.`);
        }
      }
      a.cooler = { id: p ? p.id : 'box', fan: false };
      return T(true, 'Chladič sedí na procesoru. Ještě zapoj jeho větrák.');
    }
    case 'ram': {
      const ram = p as Ram;
      const mb = PART_BY_ID[a.mb!] as Motherboard;
      if (!ramFitsBoard(ram, mb)) {
        if (!a.blocked.includes(ram.id)) a.blocked.push(ram.id);
        addNote(d, 'mistake', `Koupil jsi paměť ${ram.mem}, deska bere ${mb.mem}.`, true);
        return T(false, `${whyRam(ram, mb)} Podívej se na zářez modulu a výstupek ve slotu: nesedí na sebe.`);
      }
      const slot = target as RamSlot;
      a.ram[slot] = ram.id;
      const placed = SLOTS.filter((sl) => a.ram[sl] === ram.id);
      if (placed.length < ram.modules) return T(true, `Modul cvakl do ${slot}. Zbývá druhý.`);
      if (ram.modules === 2) {
        if (placed.includes('A2') && placed.includes('B2')) return T(true, 'Oba moduly sedí v A2 a B2. Paměť poběží ve dvou kanálech, tedy rychleji.');
        if (ramDual(placed)) {
          addNote(d, 'tip', 'Výrobce desky doporučuje pro dva moduly sloty A2 a B2.');
          return T(true, 'Paměť poběží ve dvou kanálech (jeden modul v A, druhý v B). Výrobce ale doporučuje sloty A2 a B2, jsou stabilnější.');
        }
        addNote(d, 'tip', 'Dva moduly ve stejném kanálu (A1+A2 nebo B1+B2) běží jen v jednom kanálu.');
        return T(true, `Funguje to, ale ${placed.join(' a ')} jsou oba v kanálu ${placed[0][0]}, takže paměť poběží jen v jednom kanálu. Příště dej moduly do A2 a B2.`);
      }
      return T(true, `Modul je v ${slot}. Jeden modul běží jen v jednom kanálu.`);
    }
    case 'ssd': {
      if (target === 'm2-screw') {
        a.m2!.screwed = true;
        return T(true, 'SSD je přišroubované. Kabely nepotřebuje, data i proud vedou přímo slotem.');
      }
      a.m2 = { id: p!.id, screwed: false };
      return T(true, 'SSD je ve slotu. Teď ho přišroubuj.');
    }
    case 'case': {
      const kase = p as Case;
      const mb = PART_BY_ID[a.mb!] as Motherboard;
      if (!boardFitsCase(mb, kase)) {
        if (!a.blocked.includes(kase.id)) a.blocked.push(kase.id);
        addNote(d, 'mistake', `Deska ${mb.form} se nevejde do skříně ${kase.short}.`, true);
        return T(false, `${whyCase(mb, kase)} Otvory na šrouby nesedí na sloupky. Vrať desku nebo skříň.`);
      }
      a.caseId = kase.id;
      return T(true, 'Deska je ve skříni na distančních sloupcích, nedotýká se kovu.');
    }
    case 'psu':
      a.psu = p!.id;
      return T(true, 'Zdroj je na svém místě. Větrák zdroje míří dolů, kde si bere chladný vzduch.');
    case 'gpu':
      a.gpu = p!.id;
      return T(true, 'Karta cvakla do slotu PCIe x16. Ještě ji bude potřeba napájet ze zdroje.');
    case 'hdd':
      a.hdd = p!.id;
      return T(true, 'Disk je v šachtě. Potřebuje kabel SATA ze zdroje.');
    case 'cable': {
      const key = line.key.split(':')[1] as keyof Asm['cables'];
      a.cables[key] = true;
      return T(true, 'Zacvaknuto. Konektor jde zapojit jen jedním směrem.');
    }
    case 'monitor':
      a.monitor = a.gpu ? 'gpu' : 'mb';
      return T(true, 'Monitor je zapojený.');
  }
  return T(false, 'Sem to nepatří.');
}

/** Vyndání dílu z počítače (zdroj, karta, disk, paměť). */
export function remove(d: GameState, line: Line) {
  const a = d.asm;
  const kind = line.key.split(':')[0];
  if (kind === 'psu') { a.psu = null; a.cables = { atx: false, eps: false, pcie: false, sata: false }; }
  if (kind === 'gpu') { a.gpu = null; a.cables.pcie = false; }
  if (kind === 'hdd') { a.hdd = null; a.cables.sata = false; }
  if (kind === 'ssd') { a.m2 = null; }
  if (kind === 'ram') { for (const sl of SLOTS) if (a.ram[sl] === line.partId) delete a.ram[sl]; }
  a.panel = false;
  a.monitor = null;
}

export function resetAsm(d: GameState) {
  d.asm = emptyAsm();
}

export interface PostResult {
  ok: boolean;
  leds: { cpu: boolean; dram: boolean; vga: boolean; boot: boolean };
  log: { text: string; ok: boolean }[];
  problem?: string;
  fix?: string;
  needShop?: boolean;
}

export function postResult(s: GameState): PostResult {
  const { cpu, ram, gpu, psu, storage } = activeParts(s);
  const a = s.asm;
  const leds = { cpu: false, dram: false, vga: false, boot: false };
  const log: PostResult['log'] = [];
  const fail = (key: keyof typeof leds | null, problem: string, fix: string, needShop = false): PostResult => {
    if (key) leds[key] = true;
    return { ok: false, leds, log, problem, fix, needShop };
  };

  if (!cpu) return fail('cpu', 'Deska nenašla procesor.', 'Vlož procesor do patice.');
  if (!a.cooler?.fan) {
    log.push({ text: `Procesor ${cpu.short}`, ok: true });
    return fail('cpu', 'Procesor se během pár sekund přehřál a počítač se vypnul. Chybí chladič.', 'Kup chladič pro patici procesoru a nasaď ho.', true);
  }
  log.push({ text: `Procesor ${cpu.short} · ${cpu.cores} jader`, ok: true });

  if (!ram) return fail('dram', 'Deska nenašla žádnou paměť RAM. Bez paměti počítač nenaběhne.', 'Kup paměť stejného typu, jaký bere deska, a zasuň ji.', true);
  const mods = Object.values(a.ram).length;
  log.push({ text: `Paměť ${ram.totalGB} GB ${ram.mem} · ${mods === 2 ? 'dva kanály' : 'jeden kanál'}`, ok: true });

  if (!gpu && cpu.igpu === 'none') {
    return fail('vga', `${cpu.short} nemá vestavěnou grafiku a v počítači není grafická karta. Monitor zůstal černý.`, 'Kup grafickou kartu, nebo vyměň procesor za model s grafikou.', true);
  }
  log.push({ text: gpu ? `Grafika ${gpu.short}` : `Grafika v procesoru (${cpu.igpuName})`, ok: true });

  if (psu && gpu && !psuEnough(psu, gpu)) {
    log.push({ text: `Zdroj ${psu.watts} W`, ok: false });
    return fail(null, `Při startu grafické karty se zdroj ${psu.short} přetížil a počítač se vypnul. ${gpu.short} chce aspoň ${gpu.recPsu} W.`, 'Vyndej zdroj, vrať ho a kup silnější.', true);
  }

  if (storage.length === 0) {
    return fail('boot', 'Deska nenašla žádný disk, na který by šel nainstalovat systém.', 'Kup SSD a zasuň ho do slotu M.2.', true);
  }
  log.push({ text: `Disk ${storage.map((x) => x.short).join(', ')}`, ok: true });

  const osOwned = s.owned.some((id) => PART_BY_ID[id]?.cat === 'os');
  if (!osOwned) {
    log.push({ text: 'Instalační USB nenalezeno', ok: false });
    return fail(null, 'Počítač funguje, ale nemá z čeho nainstalovat systém.', 'V obchodě si vyber systém. Linux Mint je zdarma.', true);
  }
  log.push({ text: 'Instalační USB se systémem', ok: true });
  return { ok: true, leds, log };
}
