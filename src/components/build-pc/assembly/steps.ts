/**
 * Logika dílny. Žák si z účtenky vezme díl, kabel nebo nářadí a sám hledá,
 * kam patří. Nic nesvítí: špatné místo se vysvětlí, po druhém omylu přijde
 * nápověda, po třetím se správné místo ukáže. Co chybí, prozradí až zapnutí.
 */
import {
  CATEGORIES, PART_BY_ID, type Case, type Cooler, type Cpu, type Gpu, type Motherboard, type Part, type Psu, type Ram, type Storage,
} from '../data/parts';
import {
  boardFitsCase, coolerFitsCpu, cpuFitsBoard, psuEnough, ramFitsBoard, whyCase, whyCooler, whyCpu, whyRam,
} from '../logic/compat';
import { addNote, emptyAsm, type Asm, type GameState, type RamSlot } from '../state';
import type { SpriteKey } from '../pixel/sprites';
import { spriteOf } from '../logic/assembly';
import { TARGETS, type TargetId } from './slots';

const SLOTS: RamSlot[] = ['A1', 'A2', 'B1', 'B2'];

/** Dva kanály = jeden modul v kanálu A a druhý v kanálu B. */
export const ramDual = (slots: RamSlot[]) => slots.some((x) => x[0] === 'A') && slots.some((x) => x[0] === 'B');

export type ItemState = 'box' | 'mat' | 'in' | 'block' | 'extra' | 'used';

export interface Item {
  key: string;
  label: string;
  sprite: SpriteKey;
  partId?: string;
  price?: number;
  state: ItemState;
  note: string;
  holdable: boolean;
  /** Díl jde zase vyndat (zdroj, karta, disk, paměť, SSD). */
  removable?: boolean;
  /** Kde to hledat (nápověda po druhém omylu). */
  hint: string;
  /** Správná místa (ukážou se po třetím omylu nebo přes „Co dál?“). */
  goal: TargetId[];
  group: 'part' | 'tool';
}

const owned = <T extends Part>(s: GameState, cat: string) => s.owned.map((id) => PART_BY_ID[id]).filter((p) => p?.cat === cat) as T[];

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
  const mb = s.asm.mb ? (PART_BY_ID[s.asm.mb] as Motherboard) : owned<Motherboard>(s, 'mb')[0];
  if (!mb) return cases[0];
  return cases.find((c) => boardFitsCase(mb, c)) ?? cases[0];
}

const ORDER = CATEGORIES.map((c) => c.id);

export function buildItems(s: GameState): Item[] {
  const a = s.asm;
  const items: Item[] = [];
  const parts = [...s.owned].map((id) => PART_BY_ID[id]).filter(Boolean).sort((x, y) => ORDER.indexOf(x.cat) - ORDER.indexOf(y.cat));
  const seen = new Set<string>();
  const cpuIn = a.cpu ? (PART_BY_ID[a.cpu.id] as Cpu) : undefined;

  for (const p of parts) {
    if (seen.has(p.id) || p.cat === 'os') continue;
    seen.add(p.id);
    const base = { key: `part:${p.id}`, label: p.short, sprite: spriteOf(p), partId: p.id, price: p.price, group: 'part' as const };
    const blocked = a.blocked.includes(p.id);
    switch (p.cat) {
      case 'mb': {
        const used = a.mb === p.id;
        const state: ItemState = used ? (a.caseId ? 'in' : 'mat') : a.mb ? 'extra' : blocked ? 'block' : 'box';
        items.push({ ...base, state, holdable: state === 'box' || state === 'mat',
          note: state === 'in' ? 'Ve skříni.' : state === 'mat' ? 'Na podložce. Až bude osazená, dej ji do skříně.' : state === 'extra' ? 'Navíc, můžeš ji vrátit.' : 'V krabici.',
          hint: 'Desku polož na antistatickou podložku (pohled Deska), nebo ji rovnou přišroubuj do skříně na distanční sloupky (pohled Skříň).',
          goal: used ? ['standoffs'] : ['mat', 'standoffs'] });
        break;
      }
      case 'cpu': {
        const used = a.cpu?.id === p.id;
        const state: ItemState = used ? 'in' : a.cpu ? 'extra' : blocked ? 'block' : 'box';
        items.push({ ...base, sprite: 'cpu', state, holdable: state === 'box',
          note: used ? (a.cpu!.lever ? 'V patici, páčka zavřená.' : 'V patici, páčka je ještě otevřená.') : state === 'block' ? 'Nepasuje do patice desky.' : state === 'extra' ? 'Navíc, můžeš ho vrátit.' : 'V krabici.',
          hint: 'Procesor patří do čtvercové patice se zlatými kontakty uprostřed desky.', goal: ['socket'] });
        break;
      }
      case 'ram': {
        const placed = Object.values(a.ram).filter((x) => x === p.id).length;
        const other = Object.values(a.ram).some((x) => x && x !== p.id);
        const mods = (p as Ram).modules;
        const state: ItemState = placed >= mods ? 'in' : other ? 'extra' : blocked ? 'block' : 'box';
        items.push({ ...base, state, holdable: state === 'box', removable: state === 'in',
          note: state === 'in' ? 'Zasunutá v desce.' : placed > 0 ? `Zasunuto ${placed} z ${mods} modulů.` : state === 'block' ? 'Nepasuje do slotů desky.' : state === 'extra' ? 'Navíc, můžeš ji vrátit.' : mods === 2 ? 'V krabici, 2 moduly.' : 'V krabici, 1 modul.',
          hint: 'Paměti patří do dlouhých slotů vpravo od patice. Manuál desky radí, které sloty použít.', goal: mods === 2 ? ['A2', 'B2'] : ['A2'] });
        break;
      }
      case 'storage': {
        const st = p as Storage;
        const used = st.kind === 'nvme' ? a.m2?.id === p.id : a.hdd === p.id;
        const other = st.kind === 'nvme' ? !!a.m2 && !used : !!a.hdd && !used;
        const state: ItemState = used ? 'in' : other ? 'extra' : 'box';
        items.push({ ...base, state, holdable: state === 'box', removable: used,
          note: used ? (st.kind === 'nvme' ? (a.m2!.screwed ? 'Ve slotu M.2, přišroubované.' : 'Ve slotu M.2, ještě nepřišroubované.') : 'V šachtě na disky.') : state === 'extra' ? 'Navíc, můžeš ho vrátit.' : 'V krabici.',
          hint: st.kind === 'nvme' ? 'SSD M.2 se zasouvá do krátkého slotu pod paticí procesoru a přišroubuje se.' : 'Pevný disk patří do šachty vpředu dole ve skříni.',
          goal: st.kind === 'nvme' ? ['m2'] : ['drive-bay'] });
        break;
      }
      case 'gpu': {
        const used = a.gpu === p.id;
        const state: ItemState = used ? 'in' : a.gpu ? 'extra' : 'box';
        items.push({ ...base, sprite: 'gpu', state, holdable: state === 'box', removable: used,
          note: used ? 'V horním slotu PCIe x16.' : state === 'extra' ? 'Navíc, můžeš ji vrátit.' : 'V krabici.',
          hint: 'Grafická karta patří do horního dlouhého slotu PCIe x16. Deska už musí být ve skříni.', goal: ['pcie'] });
        break;
      }
      case 'psu': {
        const used = a.psu === p.id;
        const state: ItemState = used ? 'in' : a.psu ? 'extra' : 'box';
        items.push({ ...base, sprite: 'psu', state, holdable: state === 'box', removable: used,
          note: used ? 'Ve skříni. Jeho kabely najdeš dole v nářadí.' : state === 'extra' ? 'Navíc, můžeš ho vrátit.' : 'V krabici.',
          hint: 'Zdroj patří dole vzadu do prostoru pod krytem skříně (pohled Skříň).', goal: ['psu-bay'] });
        break;
      }
      case 'case': {
        const used = caseFor(s)?.id === p.id;
        items.push({ ...base, sprite: 'case', state: blocked ? 'block' : used ? 'in' : 'extra', holdable: false,
          note: blocked ? 'Deska se do ní nevejde.' : used ? (a.panel ? 'Stojí na stole, zavřená.' : 'Stojí na stole, bočnice je sundaná.') : 'Druhá skříň navíc, můžeš ji vrátit.',
          hint: '', goal: [] });
        break;
      }
      case 'cooler': {
        const used = a.cooler?.id === p.id;
        const state: ItemState = used ? 'in' : a.cooler ? 'extra' : blocked ? 'block' : 'box';
        items.push({ ...base, state, holdable: state === 'box',
          note: used ? 'Na procesoru.' : state === 'block' ? 'Nejde připevnit na tenhle procesor.' : state === 'extra' ? 'Navíc, můžeš ho vrátit.' : 'V krabici, pastu přibalenou nemá nanesenou.',
          hint: 'Chladič se nasazuje přímo na procesor v patici. Mezi ně patří pasta.', goal: ['socket'] });
        break;
      }
    }
  }
  // chladič z krabice procesoru
  const boxCpu = owned<Cpu>(s, 'cpu').find((c) => c.boxCooler);
  if (boxCpu) {
    const used = a.cooler?.id === 'box';
    const state: ItemState = used ? 'in' : a.cooler ? 'extra' : 'box';
    items.push({ key: 'part:box-cooler', label: 'Chladič z krabice CPU', sprite: 'cooler', group: 'part', state, holdable: state === 'box',
      note: used ? 'Na procesoru.' : state === 'extra' ? 'Nepoužitý, nevadí.' : 'Pasta je na něm nanesená z výroby.',
      hint: 'Chladič se nasazuje přímo na procesor v patici.', goal: ['socket'] });
  }

  // ——— Kabely a nářadí ———
  const tool = (key: string, label: string, sprite: SpriteKey, state: ItemState, note: string, hint: string, goal: TargetId[]): Item =>
    ({ key, label, sprite, state, note, hint, goal, holdable: state === 'box', group: 'tool' });
  items.push(tool('tool:paste', 'Teplovodivá pasta', 'paste', a.paste ? 'used' : 'box',
    a.paste ? 'Nanesená na procesoru.' : 'Tuba z krabice chladiče.', 'Pasta se nanáší na kovové víčko procesoru v patici, ještě před chladičem.', ['socket']));
  if (a.cooler) {
    items.push(tool('cable:fan', 'Kabel větráku chladiče', 'plugFan', a.cooler.fan ? 'used' : 'box',
      a.cooler.fan ? 'Zapojený.' : 'Visí z chladiče.', 'Hledej malý čtyřpinový konektor poblíž patice. Manuál desky říká, který to je.', ['fan-cpu']));
  }
  if (a.psu) {
    items.push(tool('cable:atx', 'Kabel 24pin ATX', 'plug24', a.cables.atx ? 'used' : 'box', a.cables.atx ? 'Zapojený.' : 'Ze zdroje.', 'Nejširší konektor desky je na jejím pravém okraji.', ['atx24']));
    items.push(tool('cable:eps', 'Kabel 8pin CPU', 'plug8', a.cables.eps ? 'used' : 'box', a.cables.eps ? 'Zapojený.' : 'Ze zdroje, na konektoru je nápis CPU.', 'Napájení procesoru je v levém horním rohu desky.', ['eps8']));
    items.push(tool('cable:pcie', 'Kabel PCIe 6+2pin', 'plugPcie', a.cables.pcie ? 'used' : 'box', a.cables.pcie ? 'Zapojený.' : 'Ze zdroje, na konektoru je nápis PCIe.', 'Napájecí konektor grafické karty je na její horní hraně.', ['gpu-power']));
    items.push(tool('cable:sata', 'Kabel SATA (napájení)', 'plugSata', a.cables.sata ? 'used' : 'box', a.cables.sata ? 'Zapojený.' : 'Ze zdroje, plochý konektor.', 'Napájecí konektor SATA je na konci pevného disku.', ['hdd-sata']));
  }
  if (a.hdd) {
    items.push(tool('cable:data', 'Kabel SATA (data)', 'plugData', a.cables.data ? 'used' : 'box', a.cables.data ? 'Zapojený.' : 'Tenký, jeden konec už je v disku.', 'Datové porty SATA jsou na pravém okraji desky. Manuál desky ukáže kde.', ['sata-mb']));
  }
  items.push(tool('cable:hdmi', 'Kabel HDMI od monitoru', 'hdmi', a.monitor ? 'used' : 'box', a.monitor ? 'Zapojený.' : 'Druhý konec vede do monitoru.', 'Monitor se zapojuje vzadu (pohled Záda). Když máš grafickou kartu, patří do ní.', a.gpu ? ['port-gpu'] : ['port-mb']));
  if (owned<Case>(s, 'case').length) {
    items.push(tool('tool:panel', 'Bočnice se sklem', 'case', a.panel ? 'used' : 'box', a.panel ? 'Nasazená.' : 'Opřená o stůl.', 'Bočnice patří na otevřenou stranu skříně (pohled Skříň).', ['panel']));
  }
  return items;
}

export interface Result {
  ok: boolean;
  text: string;
  /** Špatné místo: počítá se do nápověd po druhém a třetím pokusu. */
  miss?: boolean;
}

const OK = (text: string): Result => ({ ok: true, text });
const NO = (text: string, miss = false): Result => ({ ok: false, text, miss });

function wrongPlace(target: TargetId, what: string): Result {
  return NO(`${TARGETS[target].what} ${what} sem nepatří.`, true);
}

/** Pokus dát vybranou věc na místo. Mění draft stavu. */
export function apply(d: GameState, item: Item, target: TargetId): Result {
  const a = d.asm;
  const p = item.partId ? PART_BY_ID[item.partId] : undefined;
  const kind = item.key.startsWith('part:') ? (item.key === 'part:box-cooler' ? 'cooler' : p!.cat) : item.key;

  switch (kind) {
    case 'mb': {
      const mb = p as Motherboard;
      if (target === 'mat') {
        if (a.caseId) return NO('Deska už je přišroubovaná ve skříni.');
        a.mb = mb.id;
        return OK('Deska leží na antistatické podložce. Statická elektřina z rukou jí tady neublíží a procesor, chladič i paměti se na stole montují snáz.');
      }
      if (target === 'standoffs') {
        const kase = caseFor(d);
        if (!kase) return NO('Nemáš skříň. Kup ji v obchodě.');
        if (!boardFitsCase(mb, kase)) {
          if (!a.blocked.includes(kase.id)) a.blocked.push(kase.id);
          addNote(d, 'mistake', `Deska ${mb.form} se nevejde do skříně ${kase.short}.`, true);
          return NO(`${whyCase(mb, kase)} Otvory v desce nesedí na sloupky. Vrať desku nebo skříň.`);
        }
        a.mb = mb.id;
        a.caseId = kase.id;
        return OK('Deska je přišroubovaná na distančních sloupcích. Nedotýká se kovové stěny, takže se kontakty na její spodní straně nezkratují.');
      }
      return wrongPlace(target, 'Základní deska');
    }
    case 'cpu': {
      if (target !== 'socket') return wrongPlace(target, 'Procesor');
      const cpu = p as Cpu;
      if (!a.mb) return NO('Procesor patří do patice na základní desce. Nejdřív polož desku na podložku nebo do skříně.');
      const mb = PART_BY_ID[a.mb] as Motherboard;
      if (!cpuFitsBoard(cpu, mb)) {
        if (!a.blocked.includes(cpu.id)) a.blocked.push(cpu.id);
        addNote(d, 'mistake', `Koupil jsi procesor s jinou paticí, než má deska (${cpu.socket} × ${mb.socket}).`, true);
        return NO(`${whyCpu(cpu, mb)} Vrať procesor nebo desku a kup kus se stejnou paticí.`);
      }
      if (a.cpuRot !== 0) {
        addNote(d, 'tip', 'Procesor jde do patice jen jedním směrem: podle zlatého trojúhelníku.');
        return NO('Procesor nedosedl. Zlatý trojúhelník na jeho rohu musí být ve stejném rohu jako značka na patici. Natoč ho tlačítkem v účtence nebo klávesou R.');
      }
      a.cpu = { id: cpu.id, seated: true, lever: false };
      return OK('Procesor dosedl sám, bez tlačení. Kontakty v patici jsou křehké, proto se nikdy netlačí. Teď ho zajisti páčkou patice.');
    }
    case 'tool:paste': {
      if (target !== 'socket') return wrongPlace(target, 'Pasta');
      if (!a.cpu) return NO('Pasta patří na procesor, a ten ještě není v patici.');
      if (a.cooler) return NO('Chladič už na procesoru sedí. Pasta patří pod něj, takže je pozdě.');
      a.paste = true;
      return OK('Kapka pasty velká jako hrášek je na procesoru. Chladič ji při přitlačení rozprostře a vyplní drobné nerovnosti, kde by jinak byl vzduch.');
    }
    case 'cooler': {
      if (target !== 'socket') return wrongPlace(target, 'Chladič');
      if (!a.cpu) return NO('Chladič se nasazuje na procesor. V patici zatím žádný není.');
      if (!a.cpu.lever) return NO('Procesor ještě není zajištěný. Nejdřív zavři páčku patice.');
      const cpu = PART_BY_ID[a.cpu.id] as Cpu;
      if (p) {
        const cooler = p as Cooler;
        if (!coolerFitsCpu(cooler, cpu)) {
          if (!a.blocked.includes(cooler.id)) a.blocked.push(cooler.id);
          addNote(d, 'mistake', `Chladič ${cooler.short} nepasuje na patici ${cpu.socket}.`, true);
          return NO(`${whyCooler(cooler, cpu)} Vrať ho a kup chladič pro ${cpu.socket}.`);
        }
        if (!a.paste) {
          addNote(d, 'mistake', 'Chladič bez teplovodivé pasty.');
          return NO('Stop! Mezi procesor a chladič patří teplovodivá pasta. Bez ní by mezi nimi zůstal vzduch, který vede teplo špatně, a procesor by se přehříval.', true);
        }
      }
      a.cooler = { id: p ? p.id : 'box', fan: false };
      const extra = !p && a.paste ? ' Pasta byla na chladiči už z výroby, tvoje vrstva navíc nebyla potřeba.' : '';
      return OK(`Chladič je přišroubovaný na procesoru. Jeho větrák ale zatím nemá proud.${extra}`);
    }
    case 'cable:fan': {
      if (target === 'fan-cpu') { a.cooler!.fan = true; return OK('Větrák chladiče je v CPU_FAN. Deska podle teploty procesoru řídí jeho otáčky a hlídá, jestli se točí.'); }
      if (target === 'fan-sys') {
        addNote(d, 'mistake', 'Větrák procesoru jsi zapojoval do SYS_FAN.');
        return NO('SYS_FAN je pro větráky skříně. Deska by hlásila, že větrák procesoru nefunguje, a procesor by se mohl přehřát. Najdi CPU_FAN.', true);
      }
      return wrongPlace(target, 'Kabel větráku');
    }
    case 'ram': {
      const slot = SLOTS.find((x) => x === target);
      if (!slot) return wrongPlace(target, 'Paměť RAM');
      const ram = p as Ram;
      if (!a.mb) return NO('Paměti se zasouvají do desky. Nejdřív ji polož na podložku nebo do skříně.');
      const mb = PART_BY_ID[a.mb] as Motherboard;
      if (!ramFitsBoard(ram, mb)) {
        if (!a.blocked.includes(ram.id)) a.blocked.push(ram.id);
        addNote(d, 'mistake', `Koupil jsi paměť ${ram.mem}, deska bere ${mb.mem}.`, true);
        return NO(`${whyRam(ram, mb)} Zářez na modulu nesedí na výstupek ve slotu.`);
      }
      if (a.ram[slot]) return NO(`Slot ${slot} je už obsazený.`);
      a.ram[slot] = ram.id;
      const placed = SLOTS.filter((x) => a.ram[x] === ram.id);
      if (placed.length < ram.modules) return OK(`Modul cvakl do ${slot}, západky se zavřely. Vezmi druhý modul.`);
      if (ram.modules === 1) return OK(`Modul je v ${slot}. Jeden modul ale běží jen v jednom kanálu.`);
      if (placed.includes('A2') && placed.includes('B2')) return OK('Oba moduly jsou v A2 a B2, přesně podle manuálu. Paměť poběží ve dvou kanálech, procesor čte z obou modulů naráz.');
      if (ramDual(placed)) {
        addNote(d, 'tip', 'Výrobce desky doporučuje pro dva moduly sloty A2 a B2.');
        return OK('Paměť poběží ve dvou kanálech (jeden modul v A, druhý v B). Manuál ale doporučuje A2 a B2, jsou elektricky výhodnější.');
      }
      addNote(d, 'tip', 'Dva moduly ve stejném kanálu (A1+A2 nebo B1+B2) běží jen v jednom kanálu.');
      return OK(`Funguje to, ale ${placed.join(' a ')} jsou oba v kanálu ${placed[0][0]}, takže paměť poběží jen v jednom kanálu a pomaleji. Podívej se do manuálu.`);
    }
    case 'storage': {
      const st = p as Storage;
      if (st.kind === 'nvme') {
        if (target !== 'm2') return wrongPlace(target, 'SSD M.2');
        if (!a.mb) return NO('SSD M.2 se zasouvá do desky. Nejdřív ji polož na podložku nebo do skříně.');
        a.m2 = { id: st.id, screwed: false };
        return OK('SSD zasunuté šikmo do slotu M.2 a přitlačené. Ještě ho zajisti šroubkem (klikni na něj).');
      }
      if (target !== 'drive-bay') return wrongPlace(target, 'Pevný disk');
      if (!caseFor(d)) return NO('Nemáš skříň.');
      a.hdd = st.id;
      return OK('Disk je v šachtě. Potřebuje ještě napájení ze zdroje (kabel SATA).');
    }
    case 'gpu': {
      if (target === 'pcie2') return NO('Tohle je dolní slot. Vypadá jako x16, ale elektricky má jen 4 linky, karta by v něm byla pomalejší. Grafika patří do horního slotu PCIe x16.', true);
      if (target !== 'pcie') return wrongPlace(target, 'Grafická karta');
      if (!a.caseId) return NO('Grafika se zasouvá až do desky přišroubované ve skříni. Karta je těžká a na stole by desku prohnula, navíc se musí přišroubovat k zádům skříně.');
      a.gpu = p!.id;
      return OK('Karta cvakla do horního slotu PCIe x16 a je přišroubovaná k zádům skříně. Bez napájení ze zdroje ale fungovat nebude.');
    }
    case 'psu': {
      if (target !== 'psu-bay') return wrongPlace(target, 'Zdroj');
      if (!caseFor(d)) return NO('Nemáš skříň.');
      a.psu = p!.id;
      return OK('Zdroj je dole pod krytem. Jeho větrák míří dolů, kde si bere chladný vzduch. Kabely ze zdroje teď najdeš v nářadí.');
    }
    case 'cable:atx': {
      if (target === 'eps8' || target === 'gpu-power' || target === 'hdd-sata') return wrongCable(d, 'Kabel 24pin');
      if (target !== 'atx24') return wrongPlace(target, 'Kabel 24pin');
      if (!a.caseId) return NO('Deska ještě není ve skříni, kabel ze zdroje by k ní nedosáhl.');
      a.cables.atx = true;
      return OK('24pin je zacvaknutý. Tímhle kabelem dostává proud celá deska.');
    }
    case 'cable:eps': {
      if (target === 'gpu-power') {
        addNote(d, 'mistake', 'Kabel 8pin CPU jsi chtěl zapojit do grafické karty.');
        return NO('Pozor! Konektory CPU (EPS) a PCIe vypadají podobně, ale mají jiné klíčování a jinak zapojené dráty. Na kabelu je napsáno CPU, patří do procesoru.', true);
      }
      if (target === 'atx24' || target === 'hdd-sata') return wrongCable(d, 'Kabel 8pin CPU');
      if (target !== 'eps8') return wrongPlace(target, 'Kabel 8pin CPU');
      if (!a.caseId) return NO('Deska ještě není ve skříni, kabel by k ní nedosáhl.');
      a.cables.eps = true;
      return OK('8pin CPU je zapojený. Procesor má vlastní napájení, protože si při zátěži bere hodně proudu.');
    }
    case 'cable:pcie': {
      if (target === 'eps8') {
        addNote(d, 'mistake', 'Kabel PCIe jsi chtěl zapojit do napájení procesoru.');
        return NO('Pozor! PCIe a CPU (EPS) konektor vypadají podobně, ale nejsou zaměnitelné. Na kabelu je napsáno PCIe, patří do grafické karty.', true);
      }
      if (target === 'atx24' || target === 'hdd-sata') return wrongCable(d, 'Kabel PCIe');
      if (target !== 'gpu-power') return wrongPlace(target, 'Kabel PCIe');
      if (!a.gpu) return NO('Grafická karta ještě není ve skříni.');
      a.cables.pcie = true;
      return OK('Karta má napájení. Silná grafika si bere mnohem víc proudu, než jí dá slot na desce.');
    }
    case 'cable:sata': {
      if (target === 'sata-mb') return NO('Porty SATA na desce jsou pro datový kabel. Tenhle plochý kabel ze zdroje je napájení a patří do disku.', true);
      if (target === 'atx24' || target === 'eps8' || target === 'gpu-power') return wrongCable(d, 'Kabel SATA');
      if (target !== 'hdd-sata') return wrongPlace(target, 'Kabel SATA');
      if (!a.hdd) return NO('V šachtě zatím není disk.');
      a.cables.sata = true;
      return OK('Disk má napájení. Data ale vede jiný, tenký kabel do desky.');
    }
    case 'cable:data': {
      if (target === 'hdd-sata') return NO('Tohle je širší napájecí konektor disku a datový kabel v disku už je. Druhý konec patří do desky, do portu SATA.', true);
      if (target === 'atx24' || target === 'eps8' || target === 'gpu-power' || target === 'fan-cpu' || target === 'fan-sys') return wrongCable(d, 'Datový kabel SATA');
      if (target !== 'sata-mb') return wrongPlace(target, 'Datový kabel SATA');
      if (!a.caseId) return NO('Deska ještě není ve skříni.');
      a.cables.data = true;
      return OK('Disk je propojený s deskou. Napájení dává zdroj, data tečou tímhle kabelem přes desku do procesoru.');
    }
    case 'cable:hdmi': {
      if (target === 'port-gpu') { a.monitor = 'gpu'; return OK('Monitor je zapojený do grafické karty, ta bude počítat obraz.'); }
      if (target === 'port-mb') {
        if (a.gpu) {
          addNote(d, 'mistake', 'Monitor jsi zapojoval do desky, i když máš grafickou kartu.');
          return NO('Když je v počítači grafická karta, obraz počítá ona a výstup na desce zůstane černý. Zapoj monitor do karty.', true);
        }
        a.monitor = 'mb';
        return OK('Monitor je zapojený do desky. Obraz bude počítat grafika v procesoru.');
      }
      if (target === 'usb-mb') return NO('Tohle jsou porty USB (klávesnice, myš). Kabel HDMI má jiný, lichoběžníkový tvar.', true);
      return wrongPlace(target, 'Kabel HDMI');
    }
    case 'tool:panel': {
      if (target !== 'panel') return wrongPlace(target, 'Bočnice');
      a.panel = true;
      return OK('Bočnice je zavřená. Vzduch teď proudí skříní od předních větráků k zadnímu a dovnitř nepadá prach.');
    }
  }
  return wrongPlace(target, item.label);
}

function wrongCable(d: GameState, name: string): Result {
  addNote(d, 'mistake', 'Kabel ze zdroje jsi zkoušel zapojit do špatného konektoru.');
  return NO(`${name} sem nejde: konektor má jiný tvar a jiný počet pinů. Každý kabel pasuje jen tam, kam patří.`, true);
}

/** Místa, na která se kliká bez nářadí (páčka, šroubek, vypínač, tlačítko). */
export function directAction(d: GameState, target: TargetId): Result | 'power' | null {
  const a = d.asm;
  if (target === 'lever') {
    if (!a.cpu) return NO('Páčku zavři, až bude procesor v patici.');
    if (a.cpu.lever) return null;
    a.cpu.lever = true;
    return OK('Páčka zavřená, procesor je pevně přitlačený ke kontaktům patice.');
  }
  if (target === 'm2-screw') {
    if (!a.m2) return null;
    if (a.m2.screwed) return null;
    a.m2.screwed = true;
    return OK('SSD je přišroubované. Kabely nepotřebuje: data i proud vedou přímo slotem M.2.');
  }
  if (target === 'psu-switch') {
    if (!a.psu) return NO('Ve skříni zatím není zdroj.');
    a.psuSwitch = !a.psuSwitch;
    return OK(a.psuSwitch ? 'Vypínač zdroje je v poloze I (zapnuto). Teď jde počítač zapnout tlačítkem na skříni.' : 'Vypínač zdroje je v poloze O (vypnuto).');
  }
  if (target === 'power-btn') {
    if (!a.psu) return NO('Nic se nestalo. Počítač nemá zdroj.');
    if (!a.psuSwitch) return NO('Nic se nestalo. Zdroj má vzadu vlastní vypínač a ten je vypnutý (pohled Záda).');
    if (!a.cables.atx) return NO('Nic se nestalo. Deska nedostává proud: chybí kabel 24pin ze zdroje.');
    return 'power';
  }
  return null;
}

export const DIRECT: TargetId[] = ['lever', 'm2-screw', 'psu-switch', 'power-btn'];

/** Vyndání dílu z počítače. */
export function remove(d: GameState, item: Item) {
  const a = d.asm;
  const p = item.partId ? PART_BY_ID[item.partId] : undefined;
  if (!p) return;
  if (p.cat === 'psu') { a.psu = null; a.psuSwitch = false; a.cables = { ...a.cables, atx: false, eps: false, pcie: false, sata: false }; }
  if (p.cat === 'gpu') { a.gpu = null; a.cables.pcie = false; if (a.monitor === 'gpu') a.monitor = null; }
  if (p.cat === 'storage') {
    if ((p as Storage).kind === 'hdd') { a.hdd = null; a.cables.sata = false; a.cables.data = false; } else a.m2 = null;
  }
  if (p.cat === 'ram') { for (const sl of SLOTS) if (a.ram[sl] === p.id) delete a.ram[sl]; }
  a.panel = false;
}

export function resetAsm(d: GameState) {
  d.asm = emptyAsm();
}

/** Co dál? Další rozumný krok (pro tlačítko nápovědy). */
export function nextStep(s: GameState, items: Item[]): { text: string; itemKey?: string; goal?: TargetId[] } {
  const a = s.asm;
  const find = (pred: (i: Item) => boolean) => items.find(pred);
  const part = (cat: string) => find((i) => i.state === 'box' && i.partId !== undefined && PART_BY_ID[i.partId]?.cat === cat);
  const blocked = items.find((i) => i.state === 'block');
  if (blocked) return { text: `${blocked.label} nepasuje. Vrať ho v účtence a kup správný díl.` };
  const mb = find((i) => i.key.startsWith('part:') && !!i.partId && PART_BY_ID[i.partId]?.cat === 'mb' && (i.state === 'box'));
  if (!a.mb && mb) return { text: 'Vezmi základní desku a polož ji na antistatickou podložku.', itemKey: mb.key, goal: ['mat'] };
  if (a.mb && !a.cpu) { const c = part('cpu'); if (c) return { text: 'Vlož procesor do patice. Pozor na zlatý trojúhelník.', itemKey: c.key, goal: ['socket'] }; }
  if (a.cpu && !a.cpu.lever) return { text: 'Zavři páčku patice, ať procesor drží.', goal: ['lever'] };
  const coolerItem = find((i) => i.state === 'box' && (i.key === 'part:box-cooler' || (!!i.partId && PART_BY_ID[i.partId]?.cat === 'cooler')));
  if (a.cpu && !a.cooler && coolerItem) {
    if (coolerItem.key !== 'part:box-cooler' && !a.paste) return { text: 'Než nasadíš chladič, nanes na procesor teplovodivou pastu.', itemKey: 'tool:paste', goal: ['socket'] };
    return { text: 'Nasaď chladič na procesor.', itemKey: coolerItem.key, goal: ['socket'] };
  }
  if (a.cooler && !a.cooler.fan) return { text: 'Zapoj kabel větráku chladiče do desky.', itemKey: 'cable:fan', goal: ['fan-cpu'] };
  const ram = find((i) => i.state === 'box' && !!i.partId && PART_BY_ID[i.partId]?.cat === 'ram');
  if (a.mb && ram) return { text: 'Zasuň paměti. Manuál desky radí, které sloty použít.', itemKey: ram.key, goal: ram.goal };
  const nvme = find((i) => i.state === 'box' && i.goal[0] === 'm2');
  if (a.mb && nvme && !a.m2) return { text: 'Zasuň SSD do slotu M.2.', itemKey: nvme.key, goal: ['m2'] };
  if (a.m2 && !a.m2.screwed) return { text: 'Přišroubuj SSD šroubkem.', goal: ['m2-screw'] };
  const mbItem = find((i) => i.state === 'mat');
  if (mbItem) return { text: 'Deska je osazená. Přenes ji do skříně na distanční sloupky.', itemKey: mbItem.key, goal: ['standoffs'] };
  const psu = part('psu');
  if (!a.psu && psu) return { text: 'Dej zdroj do skříně.', itemKey: psu.key, goal: ['psu-bay'] };
  const gpu = part('gpu');
  if (a.caseId && gpu && !a.gpu) return { text: 'Zasuň grafickou kartu.', itemKey: gpu.key, goal: ['pcie'] };
  const hdd = find((i) => i.state === 'box' && i.goal[0] === 'drive-bay');
  if (hdd && !a.hdd) return { text: 'Dej pevný disk do šachty.', itemKey: hdd.key, goal: ['drive-bay'] };
  if (a.psu && a.caseId && !a.cables.atx) return { text: 'Zapoj napájení desky (24pin).', itemKey: 'cable:atx', goal: ['atx24'] };
  if (a.psu && a.caseId && !a.cables.eps) return { text: 'Zapoj napájení procesoru (8pin CPU).', itemKey: 'cable:eps', goal: ['eps8'] };
  if (a.gpu && a.psu && !a.cables.pcie) return { text: 'Zapoj napájení grafické karty.', itemKey: 'cable:pcie', goal: ['gpu-power'] };
  if (a.hdd && a.psu && !a.cables.sata) return { text: 'Zapoj napájení disku.', itemKey: 'cable:sata', goal: ['hdd-sata'] };
  if (a.hdd && a.caseId && !a.cables.data) return { text: 'Propoj disk s deskou datovým kabelem SATA.', itemKey: 'cable:data', goal: ['sata-mb'] };
  if (!a.monitor) return { text: 'Zapoj monitor vzadu kabelem HDMI.', itemKey: 'cable:hdmi', goal: a.gpu ? ['port-gpu'] : ['port-mb'] };
  if (!a.panel) return { text: 'Nasaď bočnici.', itemKey: 'tool:panel', goal: ['panel'] };
  if (a.psu && !a.psuSwitch) return { text: 'Zapni vypínač na zadní straně zdroje.', goal: ['psu-switch'] };
  return { text: 'Zkus počítač zapnout tlačítkem na horní straně skříně.', goal: ['power-btn'] };
}

export interface PostResult {
  ok: boolean;
  leds: { cpu: boolean; dram: boolean; vga: boolean; boot: boolean };
  log: { text: string; ok: boolean }[];
  problem?: string;
  fix?: string;
  needShop?: boolean;
  /** Bez obrazu (černý monitor). */
  dark?: boolean;
}

export function postResult(s: GameState): PostResult {
  const { cpu, ram, gpu, psu, storage } = activeParts(s);
  const a = s.asm;
  const leds = { cpu: false, dram: false, vga: false, boot: false };
  const log: PostResult['log'] = [];
  const fail = (key: keyof typeof leds | null, problem: string, fix: string, opts: { shop?: boolean; dark?: boolean } = {}): PostResult => {
    if (key) leds[key] = true;
    return { ok: false, leds, log, problem, fix, needShop: opts.shop, dark: opts.dark ?? true };
  };

  if (!cpu) return fail('cpu', 'Deska nenašla procesor.', 'Vlož procesor do patice.');
  if (!a.cables.eps) return fail('cpu', 'Procesor nemá napájení: do levého horního rohu desky nevede kabel 8pin CPU.', 'Zapoj kabel 8pin CPU ze zdroje.');
  if (!a.cooler) return fail('cpu', 'Procesor se během pár sekund přehřál a počítač se sám vypnul. Chybí chladič.', 'Nasaď chladič (procesor s chladičem v krabici ho má přibalený).', { shop: !cpu.boxCooler });
  if (!ram) return fail('dram', 'Deska nenašla žádnou paměť RAM. Bez paměti počítač nenaběhne.', 'Zasuň paměť stejného typu, jaký bere deska.', { shop: true });
  if (gpu && !a.cables.pcie) return fail('vga', 'Grafická karta nemá napájení ze zdroje, takže nedává obraz.', 'Zapoj do karty kabel PCIe ze zdroje.');
  if (!gpu && cpu.igpu === 'none') return fail('vga', `${cpu.short} nemá vestavěnou grafiku a v počítači není grafická karta. Monitor zůstal černý.`, 'Kup grafickou kartu, nebo vyměň procesor za model s grafikou.', { shop: true });
  if (!a.monitor) return fail(null, 'Větráky se roztočily, ale monitor zůstal tmavý: není zapojený kabel HDMI.', 'Zapoj monitor vzadu do správného výstupu.');

  log.push({ text: `Procesor ${cpu.short} · ${cpu.cores} jader`, ok: true });
  if (!a.cooler.fan) {
    log.push({ text: 'CPU Fan Error! Větrák procesoru se netočí.', ok: false });
    return fail(null, 'Deska hlásí „CPU Fan Error“: větrák chladiče není zapojený do CPU_FAN.', 'Zapoj kabel větráku chladiče do konektoru CPU_FAN.', { dark: false });
  }
  const mods = Object.values(a.ram).length;
  log.push({ text: `Paměť ${ram.totalGB} GB ${ram.mem} · ${ramDual(Object.keys(a.ram) as RamSlot[]) ? 'dva kanály' : 'jeden kanál'}${mods === 1 ? ' (1 modul)' : ''}`, ok: true });
  log.push({ text: gpu ? `Grafika ${gpu.short}` : `Grafika v procesoru (${cpu.igpuName})`, ok: true });
  if (psu && gpu && !psuEnough(psu, gpu)) {
    log.push({ text: `Zdroj ${psu.watts} W přetížen`, ok: false });
    return fail(null, `Při startu grafické karty se zdroj ${psu.short} přetížil a počítač se vypnul. ${gpu.short} chce aspoň ${gpu.recPsu} W.`, 'Vyndej zdroj, vrať ho a kup silnější.', { shop: true, dark: false });
  }
  const hddOnly = storage.length > 0 && storage.every((x) => x.kind === 'hdd');
  if (storage.length === 0) return fail('boot', 'Deska nenašla žádný disk, na který by šel nainstalovat systém.', 'Zasuň SSD do slotu M.2 (nebo kup disk).', { shop: true, dark: false });
  if (hddOnly && !a.cables.sata) return fail('boot', 'Pevný disk nemá napájení, deska ho nevidí.', 'Zapoj do disku napájecí kabel SATA ze zdroje.', { dark: false });
  if (hddOnly && !a.cables.data) return fail('boot', 'Disk se točí, ale deska ho nevidí: nevede k ní datový kabel.', 'Propoj disk s portem SATA na desce datovým kabelem.', { dark: false });
  const hddLost = !!a.hdd && !hddOnly && (!a.cables.sata || !a.cables.data);
  const seen = hddLost ? storage.filter((x) => x.kind !== 'hdd') : storage;
  log.push({ text: `Disk ${seen.map((x) => x.short).join(', ')}`, ok: true });
  if (hddLost) log.push({ text: `Pevný disk nenalezen (chybí ${a.cables.sata ? 'datový kabel' : 'napájení'})`, ok: false });

  const osOwned = s.owned.some((id) => PART_BY_ID[id]?.cat === 'os');
  if (!osOwned) {
    log.push({ text: 'Instalační USB nenalezeno', ok: false });
    return fail(null, 'Počítač funguje, ale nemá z čeho nainstalovat systém.', 'V obchodě si vyber systém. Linux Mint je zdarma.', { shop: true, dark: false });
  }
  log.push({ text: 'Instalační USB se systémem', ok: true });
  return { ok: true, leds, log };
}

export function isBlocked(asm: Asm, id: string) {
  return asm.blocked.includes(id);
}
