/**
 * Katalog PC obchodu. Skutečné modely, ceny z Alza.cz k datu PRICES_DATE.
 * Ceny jednou ročně přepiš tady; nic jiného se měnit nemusí.
 * Výkonová čísla (gameFps, exportMin) jsou zaokrouhlené odhady pro hru,
 * ne naměřené benchmarky — na učitelské stránce jsou tak i popsané.
 */

export const PRICES_DATE = '22. 10. 2026';
export const PRICES_SOURCE = 'Alza.cz';

export type Category = 'cpu' | 'mb' | 'ram' | 'storage' | 'gpu' | 'psu' | 'case' | 'cooler' | 'os';
export type Socket = 'AM5' | 'LGA1700' | 'LGA1851';
export type MemType = 'DDR4' | 'DDR5';
export type FormFactor = 'ATX' | 'mATX' | 'mITX';

export interface Spec {
  label: string;
  value: string;
  /** Vysvětlivka pro žáka: co ten parametr znamená. */
  hint?: string;
}

interface PartBase {
  id: string;
  cat: Category;
  name: string;
  /** Krátký název na účtenku (max ~22 znaků). */
  short: string;
  price: number;
  /** Jedna věta lidsky: k čemu se to hodí. */
  blurb: string;
}

export interface Cpu extends PartBase {
  cat: 'cpu';
  socket: Socket;
  cores: number;
  threads: number;
  /** Integrovaná grafika: none = bez obrazu, basic = jen na obraz, good = zvládne i lehké hry. */
  igpu: 'none' | 'basic' | 'good';
  igpuName?: string;
  boxCooler: boolean;
  /** Herní výkon procesoru, 1 = dobrý průměr. */
  gameFactor: number;
  /** Doba exportu 10min videa jen procesorem (minuty, odhad). */
  exportMin: number;
}

export interface Motherboard extends PartBase {
  cat: 'mb';
  socket: Socket;
  mem: MemType;
  form: FormFactor;
  m2: number;
  wifi: boolean;
}

export interface Ram extends PartBase {
  cat: 'ram';
  mem: MemType;
  modules: 1 | 2;
  totalGB: number;
}

export interface Storage extends PartBase {
  cat: 'storage';
  kind: 'nvme' | 'hdd';
  sizeGB: number;
  readMBs: number;
}

export interface Gpu extends PartBase {
  cat: 'gpu';
  vramGB: number;
  /** Doporučený zdroj podle výrobce čipu (W). */
  recPsu: number;
  /** Odhad FPS ve 1080p, vysoké detaily. */
  fps: { fortnite: number; forza: number };
}

export interface Psu extends PartBase {
  cat: 'psu';
  watts: number;
  cert: 'none' | 'bronze' | 'gold';
}

export interface Case extends PartBase {
  cat: 'case';
  forms: FormFactor[];
}

export interface Cooler extends PartBase {
  cat: 'cooler';
  sockets: Socket[];
  kind: 'air' | 'aio';
}

export interface Os extends PartBase {
  cat: 'os';
  kind: 'windows' | 'linux';
}

export type Part = Cpu | Motherboard | Ram | Storage | Gpu | Psu | Case | Cooler | Os;

export const CATEGORIES: { id: Category; label: string; plural: string; required: boolean; hint: string }[] = [
  { id: 'cpu', label: 'Procesor', plural: 'Procesory', required: true, hint: 'Počítá všechno, co počítač dělá.' },
  { id: 'mb', label: 'Základní deska', plural: 'Základní desky', required: true, hint: 'Propojuje všechny díly. Musí pasovat k procesoru i pamětem.' },
  { id: 'ram', label: 'Operační paměť', plural: 'Paměti RAM', required: true, hint: 'Pracovní stůl počítače. Po vypnutí se vymaže.' },
  { id: 'storage', label: 'Disk', plural: 'Disky', required: true, hint: 'Sem se ukládá systém, programy a tvoje soubory.' },
  { id: 'gpu', label: 'Grafická karta', plural: 'Grafické karty', required: false, hint: 'Počítá obraz. Na hry nutná, do školy často zbytečná.' },
  { id: 'psu', label: 'Zdroj', plural: 'Zdroje', required: true, hint: 'Mění proud ze zásuvky na napětí pro díly.' },
  { id: 'case', label: 'Skříň', plural: 'Skříně', required: true, hint: 'Do ní se všechno přišroubuje. Musí se do ní vejít deska.' },
  { id: 'cooler', label: 'Chladič', plural: 'Chladiče', required: false, hint: 'Odvádí teplo z procesoru. Některé procesory ho mají v krabici.' },
  { id: 'os', label: 'Operační systém', plural: 'Operační systémy', required: true, hint: 'Bez systému počítač po zapnutí nic neumí.' },
];

export const PARTS: Part[] = [
  // ——— Procesory ———
  {
    id: 'cpu-8500g', cat: 'cpu', name: 'AMD Ryzen 5 8500G', short: 'Ryzen 5 8500G', price: 3459,
    blurb: 'Levný šestijádrový procesor s docela silnou vestavěnou grafikou.',
    socket: 'AM5', cores: 6, threads: 12, igpu: 'good', igpuName: 'Radeon 740M', boxCooler: true,
    gameFactor: 0.8, exportMin: 8.5,
  },
  {
    id: 'cpu-7600', cat: 'cpu', name: 'AMD Ryzen 5 7600', short: 'Ryzen 5 7600', price: 4169,
    blurb: 'Oblíbený herní procesor za rozumnou cenu, chladič je v krabici.',
    socket: 'AM5', cores: 6, threads: 12, igpu: 'basic', igpuName: 'Radeon Graphics (2 jádra)', boxCooler: true,
    gameFactor: 0.95, exportMin: 7.5,
  },
  {
    id: 'cpu-9700x', cat: 'cpu', name: 'AMD Ryzen 7 9700X', short: 'Ryzen 7 9700X', price: 7190,
    blurb: 'Osm jader na střih videa i hry. Chladič je potřeba dokoupit.',
    socket: 'AM5', cores: 8, threads: 16, igpu: 'basic', igpuName: 'Radeon Graphics (2 jádra)', boxCooler: false,
    gameFactor: 1.0, exportMin: 6,
  },
  {
    id: 'cpu-9800x3d', cat: 'cpu', name: 'AMD Ryzen 7 9800X3D', short: 'Ryzen 7 9800X3D', price: 10590,
    blurb: 'Nejrychlejší herní procesor v obchodě. Na školní práci zbytečně drahý.',
    socket: 'AM5', cores: 8, threads: 16, igpu: 'basic', igpuName: 'Radeon Graphics (2 jádra)', boxCooler: false,
    gameFactor: 1.15, exportMin: 6,
  },
  {
    id: 'cpu-14100', cat: 'cpu', name: 'Intel Core i3-14100', short: 'Core i3-14100', price: 3399,
    blurb: 'Čtyřjádrový procesor do kanceláře a do školy, s vestavěnou grafikou.',
    socket: 'LGA1700', cores: 4, threads: 8, igpu: 'basic', igpuName: 'Intel UHD 730', boxCooler: true,
    gameFactor: 0.75, exportMin: 12,
  },
  {
    id: 'cpu-14400f', cat: 'cpu', name: 'Intel Core i5-14400F', short: 'Core i5-14400F', price: 4229,
    blurb: 'Deset jader za málo peněz. Písmeno F znamená, že nemá vestavěnou grafiku.',
    socket: 'LGA1700', cores: 10, threads: 16, igpu: 'none', boxCooler: true,
    gameFactor: 0.95, exportMin: 6.5,
  },
  {
    id: 'cpu-265kf', cat: 'cpu', name: 'Intel Core Ultra 7 265KF', short: 'Core Ultra 7 265KF', price: 6499,
    blurb: 'Dvacet jader, výborný na střih videa. Bez grafiky a bez chladiče v krabici.',
    socket: 'LGA1851', cores: 20, threads: 20, igpu: 'none', boxCooler: false,
    gameFactor: 1.0, exportMin: 4,
  },

  // ——— Základní desky ———
  {
    id: 'mb-a620m', cat: 'mb', name: 'GIGABYTE A620M DS3H', short: 'GB A620M DS3H', price: 2079,
    blurb: 'Nejlevnější deska pro procesory AMD AM5. Menší formát mATX.',
    socket: 'AM5', mem: 'DDR5', form: 'mATX', m2: 1, wifi: false,
  },
  {
    id: 'mb-b650pg', cat: 'mb', name: 'ASRock B650 PG Lightning', short: 'ASRock B650 PG', price: 2999,
    blurb: 'Velká deska ATX pro AM5 se třemi sloty na rychlé SSD.',
    socket: 'AM5', mem: 'DDR5', form: 'ATX', m2: 3, wifi: false,
  },
  {
    id: 'mb-b850', cat: 'mb', name: 'MSI B850 GAMING PLUS WIFI6E', short: 'MSI B850 Gaming+', price: 3899,
    blurb: 'Herní deska ATX pro AM5 s Wi-Fi, není potřeba kabel k routeru.',
    socket: 'AM5', mem: 'DDR5', form: 'ATX', m2: 2, wifi: true,
  },
  {
    id: 'mb-b760d4', cat: 'mb', name: 'GIGABYTE B760M DS3H DDR4', short: 'GB B760M DDR4', price: 2249,
    blurb: 'Levná deska pro Intel s patici LGA1700. Bere starší a levnější paměti DDR4.',
    socket: 'LGA1700', mem: 'DDR4', form: 'mATX', m2: 2, wifi: false,
  },
  {
    id: 'mb-b860', cat: 'mb', name: 'MSI PRO B860-P WIFI', short: 'MSI PRO B860-P', price: 4619,
    blurb: 'Deska ATX pro nejnovější procesory Intel Core Ultra (patice LGA1851).',
    socket: 'LGA1851', mem: 'DDR5', form: 'ATX', m2: 2, wifi: true,
  },

  // ——— Paměti ———
  {
    id: 'ram-d5-16x1', cat: 'ram', name: 'Kingston FURY Beast 16GB DDR5 5600 (1 modul)', short: 'FURY 16GB DDR5 1×16', price: 7639,
    blurb: 'Jeden modul 16 GB. Funguje, ale paměť pak běží jen v jednom kanálu.',
    mem: 'DDR5', modules: 1, totalGB: 16,
  },
  {
    id: 'ram-d5-16kit', cat: 'ram', name: 'Kingston FURY Beast 16GB KIT DDR5 5600 (2× 8 GB)', short: 'FURY 16GB DDR5 2×8', price: 7989,
    blurb: 'Dva moduly po 8 GB. Na hry a školu tak akorát.',
    mem: 'DDR5', modules: 2, totalGB: 16,
  },
  {
    id: 'ram-d5-32kit', cat: 'ram', name: 'Kingston FURY Beast 32GB KIT DDR5 5600 (2× 16 GB)', short: 'FURY 32GB DDR5 2×16', price: 12090,
    blurb: 'Dvojnásobek paměti. Hodí se na střih videa, kde se pracuje s velkými soubory.',
    mem: 'DDR5', modules: 2, totalGB: 32,
  },
  {
    id: 'ram-d4-16kit', cat: 'ram', name: 'Corsair Vengeance LPX 16GB KIT DDR4 3200 (2× 8 GB)', short: 'Vengeance 16GB DDR4', price: 3599,
    blurb: 'Starší typ DDR4, a proto o dost levnější. Pasuje jen do desek pro DDR4.',
    mem: 'DDR4', modules: 2, totalGB: 16,
  },
  {
    id: 'ram-d4-32kit', cat: 'ram', name: 'Corsair Vengeance LPX 32GB KIT DDR4 3200 (2× 16 GB)', short: 'Vengeance 32GB DDR4', price: 7190,
    blurb: '32 GB starší paměti DDR4 za cenu 16 GB nové DDR5.',
    mem: 'DDR4', modules: 2, totalGB: 32,
  },

  // ——— Disky ———
  {
    id: 'ssd-nv3-500', cat: 'storage', name: 'Kingston NV3 500GB (M.2 NVMe)', short: 'Kingston NV3 500GB', price: 2449,
    blurb: 'Malé, ale rychlé SSD. Na systém a školní věci stačí.',
    kind: 'nvme', sizeGB: 500, readMBs: 5000,
  },
  {
    id: 'ssd-nv3-1tb', cat: 'storage', name: 'Kingston NV3 1TB (M.2 NVMe)', short: 'Kingston NV3 1TB', price: 3689,
    blurb: 'Rychlé SSD s místem i na pár velkých her.',
    kind: 'nvme', sizeGB: 1000, readMBs: 6000,
  },
  {
    id: 'ssd-990-1tb', cat: 'storage', name: 'Samsung 990 EVO Plus 1TB (M.2 NVMe)', short: 'Samsung 990 EVO+ 1TB', price: 4399,
    blurb: 'Ještě rychlejší SSD od Samsungu. Rozdíl poznáš hlavně při kopírování velkých souborů.',
    kind: 'nvme', sizeGB: 1000, readMBs: 7150,
  },
  {
    id: 'ssd-sn7100-2tb', cat: 'storage', name: 'WD_BLACK SN7100 2TB (M.2 NVMe)', short: 'WD_BLACK SN7100 2TB', price: 7599,
    blurb: 'Velké a rychlé SSD na videa a hodně her.',
    kind: 'nvme', sizeGB: 2000, readMBs: 7250,
  },
  {
    id: 'hdd-barracuda-2tb', cat: 'storage', name: 'Seagate BarraCuda 2TB (pevný disk, SATA)', short: 'Seagate HDD 2TB', price: 3290,
    blurb: 'Klasický pevný disk s točícími se plotnami. Hodně místa, ale asi 25× pomalejší než SSD.',
    kind: 'hdd', sizeGB: 2000, readMBs: 220,
  },

  // ——— Grafické karty ———
  {
    id: 'gpu-b580', cat: 'gpu', name: 'ASRock Intel Arc B580 Challenger 12GB', short: 'Intel Arc B580 12GB', price: 9290,
    blurb: 'Levná karta s 12 GB paměti, silná i na střih videa.',
    vramGB: 12, recPsu: 600, fps: { fortnite: 125, forza: 100 },
  },
  {
    id: 'gpu-5050', cat: 'gpu', name: 'PALIT GeForce RTX 5050 Dual 8GB', short: 'RTX 5050 8GB', price: 9399,
    blurb: 'Nejslabší z nových karet NVIDIA. Na Fortnite stačí.',
    vramGB: 8, recPsu: 550, fps: { fortnite: 120, forza: 95 },
  },
  {
    id: 'gpu-5060', cat: 'gpu', name: 'MSI GeForce RTX 5060 8G VENTUS 2X OC', short: 'RTX 5060 8GB', price: 12190,
    blurb: 'Oblíbená herní karta do 1080p.',
    vramGB: 8, recPsu: 550, fps: { fortnite: 150, forza: 115 },
  },
  {
    id: 'gpu-9060xt', cat: 'gpu', name: 'ASUS DUAL Radeon RX 9060 XT 16G', short: 'RX 9060 XT 16GB', price: 14790,
    blurb: 'Rychlejší karta od AMD s dvojnásobkem paměti.',
    vramGB: 16, recPsu: 450, fps: { fortnite: 165, forza: 125 },
  },
  {
    id: 'gpu-5070', cat: 'gpu', name: 'MSI GeForce RTX 5070 12G VENTUS 2X OC', short: 'RTX 5070 12GB', price: 22290,
    blurb: 'Silná karta i na vyšší rozlišení. Potřebuje pořádný zdroj.',
    vramGB: 12, recPsu: 650, fps: { fortnite: 230, forza: 165 },
  },

  // ——— Zdroje ———
  {
    id: 'psu-pulse-400', cat: 'psu', name: 'EVOLVEO Pulse 400W', short: 'EVOLVEO Pulse 400W', price: 749,
    blurb: 'Levný zdroj bez certifikace účinnosti. Na kartu nestačí.',
    watts: 400, cert: 'none',
  },
  {
    id: 'psu-vero-600', cat: 'psu', name: 'Endorfy Vero L5 Bronze 600W', short: 'Endorfy Vero 600W', price: 1479,
    blurb: 'Spolehlivý zdroj s certifikací 80 PLUS Bronze.',
    watts: 600, cert: 'bronze',
  },
  {
    id: 'psu-rm650e', cat: 'psu', name: 'Corsair RM650e (2025) 650W Gold', short: 'Corsair RM650e', price: 1999,
    blurb: 'Účinný zdroj 80 PLUS Gold, méně hřeje a méně spotřebuje.',
    watts: 650, cert: 'gold',
  },
  {
    id: 'psu-rm750e', cat: 'psu', name: 'Corsair RM750e (2025) 750W Gold', short: 'Corsair RM750e', price: 2889,
    blurb: 'Silný zdroj s rezervou i pro výkonné karty.',
    watts: 750, cert: 'gold',
  },

  // ——— Skříně ———
  {
    id: 'case-valor', cat: 'case', name: 'ADATA XPG Valor Air', short: 'XPG Valor Air', price: 899,
    blurb: 'Nejlevnější skříň. Vejde se do ní každá deska z obchodu.',
    forms: ['ATX', 'mATX', 'mITX'],
  },
  {
    id: 'case-ventum', cat: 'case', name: 'Endorfy Ventum 200 Air', short: 'Endorfy Ventum 200', price: 1199,
    blurb: 'Skříň s dobrým prouděním vzduchu.',
    forms: ['ATX', 'mATX', 'mITX'],
  },
  {
    id: 'case-popmini', cat: 'case', name: 'Fractal Design Pop Mini Air RGB', short: 'Fractal Pop Mini', price: 1999,
    blurb: 'Menší skříň se svítícími větráky. Jen pro desky mATX a mITX.',
    forms: ['mATX', 'mITX'],
  },
  {
    id: 'case-north', cat: 'case', name: 'Fractal Design North', short: 'Fractal North', price: 3729,
    blurb: 'Hezká skříň s dřevěnou mřížkou. Platíš hlavně za vzhled.',
    forms: ['ATX', 'mATX', 'mITX'],
  },

  // ——— Chladiče ———
  {
    id: 'cool-alpine17', cat: 'cooler', name: 'ARCTIC Alpine 17', short: 'ARCTIC Alpine 17', price: 219,
    blurb: 'Malý levný chladič. Pozor: jen pro procesory Intel.',
    sockets: ['LGA1700', 'LGA1851'], kind: 'air',
  },
  {
    id: 'cool-freezer36', cat: 'cooler', name: 'ARCTIC Freezer 36', short: 'ARCTIC Freezer 36', price: 749,
    blurb: 'Věžový chladič pro AMD i Intel. Tichý a výkonný.',
    sockets: ['AM5', 'LGA1700', 'LGA1851'], kind: 'air',
  },
  {
    id: 'cool-lf3-240', cat: 'cooler', name: 'ARCTIC Liquid Freezer III 240', short: 'Liquid Freezer III', price: 1329,
    blurb: 'Vodní chlazení v jednom celku. Na nejsilnější procesory.',
    sockets: ['AM5', 'LGA1700', 'LGA1851'], kind: 'aio',
  },

  // ——— Systémy ———
  {
    id: 'os-win11', cat: 'os', name: 'Microsoft Windows 11 Home CZ (OEM)', short: 'Windows 11 Home', price: 3051,
    blurb: 'Nejrozšířenější systém. Licence platí pro jeden počítač.',
    kind: 'windows',
  },
  {
    id: 'os-mint', cat: 'os', name: 'Linux Mint 22', short: 'Linux Mint 22', price: 0,
    blurb: 'Svobodný systém zdarma. Stáhneš ho z oficiálního webu linuxmint.com.',
    kind: 'linux',
  },
];

export const PART_BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

export function partsIn<C extends Category>(cat: C): Extract<Part, { cat: C }>[] {
  return PARTS.filter((p) => p.cat === cat) as Extract<Part, { cat: C }>[];
}

export function specsOf(p: Part): Spec[] {
  switch (p.cat) {
    case 'cpu':
      return [
        { label: 'Patice', value: p.socket, hint: 'Do jaké desky procesor pasuje. Musí být stejná jako patice desky.' },
        { label: 'Jádra / vlákna', value: `${p.cores} / ${p.threads}`, hint: 'Víc jader = víc práce najednou. Pomáhá hlavně při střihu videa.' },
        { label: 'Grafika v procesoru', value: p.igpu === 'none' ? 'Ne' : `Ano (${p.igpuName})`, hint: 'Bez ní potřebuješ grafickou kartu, jinak nebude obraz.' },
        { label: 'Chladič v krabici', value: p.boxCooler ? 'Ano' : 'Ne', hint: 'Když chybí, musíš chladič dokoupit.' },
      ];
    case 'mb':
      return [
        { label: 'Patice', value: p.socket, hint: 'Musí být stejná jako patice procesoru.' },
        { label: 'Paměti', value: `${p.mem}, 4 sloty`, hint: 'DDR4 a DDR5 mají zářez jinde, nejdou zaměnit.' },
        { label: 'Formát', value: p.form === 'mATX' ? 'mATX (menší)' : 'ATX (velká)', hint: 'Velikost desky. Skříň musí daný formát podporovat.' },
        { label: 'Sloty M.2', value: String(p.m2), hint: 'Kolik rychlých SSD jde zasunout přímo do desky.' },
        { label: 'Wi-Fi', value: p.wifi ? 'Ano' : 'Ne', hint: 'Bez Wi-Fi se připojíš kabelem.' },
      ];
    case 'ram':
      return [
        { label: 'Typ', value: p.mem, hint: 'Musí odpovídat typu slotů na desce.' },
        { label: 'Kapacita', value: `${p.totalGB} GB`, hint: '16 GB stačí na hry a školu, na střih videa je lepší 32 GB.' },
        { label: 'Moduly', value: p.modules === 2 ? `2× ${p.totalGB / 2} GB` : `1× ${p.totalGB} GB`, hint: 'Dva moduly běží ve dvou kanálech, a jsou proto rychlejší.' },
      ];
    case 'storage':
      return [
        { label: 'Druh', value: p.kind === 'nvme' ? 'SSD M.2 NVMe' : 'Pevný disk (HDD), SATA', hint: 'SSD nemá pohyblivé části a je mnohem rychlejší.' },
        { label: 'Kapacita', value: p.sizeGB >= 1000 ? `${p.sizeGB / 1000} TB` : `${p.sizeGB} GB`, hint: '1 TB je zhruba 1 000 GB.' },
        { label: 'Čtení', value: `${p.readMBs.toLocaleString('cs-CZ')} MB/s`, hint: 'Jak rychle disk načítá data.' },
      ];
    case 'gpu':
      return [
        { label: 'Paměť karty', value: `${p.vramGB} GB`, hint: 'Vlastní paměť grafiky na textury ve hrách.' },
        { label: 'Doporučený zdroj', value: `${p.recPsu} W`, hint: 'Slabší zdroj by se při hraní mohl vypnout.' },
      ];
    case 'psu':
      return [
        { label: 'Výkon', value: `${p.watts} W`, hint: 'Kolik wattů zdroj dodá. Musí stačit grafické kartě.' },
        { label: 'Účinnost', value: p.cert === 'none' ? 'bez certifikace' : p.cert === 'bronze' ? '80 PLUS Bronze' : '80 PLUS Gold', hint: 'Vyšší účinnost = méně energie se promění v teplo.' },
      ];
    case 'case':
      return [
        { label: 'Desky', value: p.forms.join(', '), hint: 'Jaké formáty desek se do skříně vejdou.' },
      ];
    case 'cooler':
      return [
        { label: 'Patice', value: p.sockets.join(', '), hint: 'Na jaké procesory jde chladič připevnit.' },
        { label: 'Druh', value: p.kind === 'air' ? 'vzduchový' : 'vodní (uzavřený okruh)', hint: 'Oba druhy fungují, vodní se hodí na nejsilnější procesory.' },
      ];
    case 'os':
      return [
        { label: 'Licence', value: p.kind === 'windows' ? 'placená, 1 počítač' : 'svobodná, zdarma', hint: 'Licence říká, jak smíš program používat.' },
      ];
  }
}

export function formatKc(n: number): string {
  return `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
}
