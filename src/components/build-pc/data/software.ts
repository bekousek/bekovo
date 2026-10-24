/**
 * Programy po instalaci systému. Oficiální weby jsou skutečné, pasti jsou
 * vymyšlené adresy a produkty (nepatří žádné skutečné firmě).
 */
import type { GoalId } from '../logic/bench';

export interface Result {
  kind: 'official' | 'ad' | 'portal';
  url: string;
  title: string;
  desc: string;
}

export interface SwTask {
  id: string;
  title: string;
  why: string;
  query: string;
  program: string;
  results: Result[];
  /** Po kliknutí na past: co se stalo a proč. */
  trapText: Record<'ad' | 'portal', string>;
}

const ADS = 'Reklama vypadá jako výsledek hledání, ale vede na cizí web. Oficiální web poznáš podle adresy.';

function task(t: Omit<SwTask, 'trapText'> & { trapText?: Partial<SwTask['trapText']> }): SwTask {
  return {
    ...t,
    trapText: {
      ad: t.trapText?.ad ?? `${ADS} Ze stránky by sis stáhl „stahovač“, který k programu přidá další věci.`,
      portal: t.trapText?.portal ?? 'Stahovací portály balí programy do vlastních instalátorů s přibalenými doplňky. Program stahuj od autora.',
    },
  };
}

export function tasksFor(goal: GoalId, os: 'windows' | 'linux', gpu: 'nvidia' | 'amd' | 'intel' | null): SwTask[] {
  const list: SwTask[] = [];
  if (gpu) {
    const site = gpu === 'nvidia' ? 'www.nvidia.com/cs-cz/drivers' : gpu === 'amd' ? 'www.amd.com/cs/support' : 'www.intel.com/content/www/cz/cs/download-center';
    const brand = gpu === 'nvidia' ? 'NVIDIA' : gpu === 'amd' ? 'AMD' : 'Intel';
    list.push(task({
      id: 'driver',
      title: `Ovladač grafické karty ${brand}`,
      why: 'Bez ovladače od výrobce karta neběží naplno.',
      query: `ovladač ${brand.toLowerCase()} stáhnout`,
      program: `Ovladač ${brand}`,
      results: [
        { kind: 'ad', url: 'driver-updater-pro.top', title: 'Aktualizuj VŠECHNY ovladače jedním klikem!', desc: 'Program Driver Updater Pro najde zastaralé ovladače. Zkušební verze zdarma.' },
        { kind: 'official', url: site, title: `Ovladače ${brand} – oficiální stránka podpory`, desc: `Stáhněte nejnovější ovladač pro svou grafickou kartu ${brand}.` },
        { kind: 'portal', url: 'ovladace-zdarma.eu', title: `${brand} ovladač 2026 ke stažení zdarma`, desc: 'Rychlé stažení bez registrace, 4,9 hvězdiček.' },
      ],
      trapText: { ad: 'Placené „aktualizátory ovladačů“ jsou zbytečné a často škodí. Ovladač zdarma dává výrobce karty na svém webu.' },
    }));
  }
  list.push(task({
    id: 'office',
    title: 'Kancelářský balík LibreOffice',
    why: 'Na referáty, tabulky a prezentace. Je zdarma a svobodný.',
    query: 'libreoffice stáhnout',
    program: 'LibreOffice',
    results: [
      { kind: 'official', url: 'www.libreoffice.org', title: 'LibreOffice – svobodný kancelářský balík', desc: 'Writer, Calc, Impress. Zdarma pro každého, i pro školy a firmy.' },
      { kind: 'ad', url: 'office-zdarma-ke-stazeni.top', title: 'Office 2026 ZDARMA – stáhnout hned', desc: 'Kompletní kancelář bez placení. Klikni a stahuj.' },
      { kind: 'portal', url: 'stahuj-programy.xyz', title: 'LibreOffice 25 – stažení zdarma', desc: 'Stahujte přes náš rychlý instalátor.' },
    ],
  }));
  list.push(task({
    id: 'zip',
    title: 'Archivátor 7-Zip',
    why: 'Otevře a zabalí soubory ZIP a 7z.',
    query: '7-zip stáhnout',
    program: '7-Zip',
    results: [
      { kind: 'portal', url: 'stahuj-programy.xyz', title: '7-Zip ke stažení zdarma – CZ verze', desc: 'Nejoblíbenější archivátor. Rychlé stažení přes náš instalátor.' },
      { kind: 'official', url: 'www.7-zip.org', title: '7-Zip', desc: '7-Zip je svobodný archivátor s vysokým kompresním poměrem.' },
      { kind: 'ad', url: 'zip-opener-free.top', title: 'Otevřít ZIP soubor – ZDARMA', desc: 'Nejrychlejší otvírač archivů. Stáhněte nyní.' },
    ],
  }));
  list.push(task({
    id: 'vlc',
    title: 'Přehrávač VLC',
    why: 'Přehraje skoro každé video a hudbu.',
    query: 'vlc stáhnout',
    program: 'VLC media player',
    results: [
      { kind: 'ad', url: 'vlc-player-download.top', title: 'VLC Player – STÁHNOUT (oficiální verze)', desc: 'Nejnovější verze přehrávače, rychlé stažení.' },
      { kind: 'official', url: 'www.videolan.org', title: 'VLC media player – VideoLAN', desc: 'Svobodný multimediální přehrávač pro Windows, Linux i Mac.' },
      { kind: 'portal', url: 'ovladace-zdarma.eu', title: 'VLC přehrávač CZ zdarma', desc: 'Bez registrace, přímý odkaz.' },
    ],
    trapText: { ad: `${ADS} Pozor: i když nadpis tvrdí „oficiální verze“, adresa vlc-player-download.top s VideoLAN nemá nic společného.` },
  }));
  if (goal === 'gaming') {
    list.push(task({
      id: 'steam',
      title: 'Herní obchod Steam',
      why: 'Na nákup a stahování her.',
      query: 'steam stáhnout',
      program: 'Steam',
      results: [
        { kind: 'official', url: 'store.steampowered.com', title: 'Steam – nainstalujte si Steam', desc: 'Obchod s tisíci her. Klient je zdarma.' },
        { kind: 'portal', url: 'hry-zdarma-crack.xyz', title: 'Steam hry ZDARMA – všechny hry odemčené', desc: 'Stáhni si placené hry zdarma, crack v ceně.' },
        { kind: 'ad', url: 'steam-gift-free.top', title: 'Dárková karta Steam 1000 Kč ZDARMA', desc: 'Stačí se přihlásit Steam účtem a vyzvednout.' },
      ],
      trapText: {
        portal: 'Cracknuté hry jsou nelegální a patří k nejčastějším zdrojům malwaru. Hry kupuj v oficiálním obchodě, často jsou ve slevě.',
        ad: 'Tohle je phishing: „dárková karta zdarma“ chce tvoje přihlašovací údaje ke Steamu. Účet by ti ukradli.',
      },
    }));
  } else if (goal === 'video') {
    list.push(task({
      id: 'shotcut',
      title: 'Střihový program Shotcut',
      why: 'Na střih videí. Je zdarma a svobodný.',
      query: 'shotcut stáhnout',
      program: 'Shotcut',
      results: [
        { kind: 'portal', url: 'video-editor-full.xyz', title: 'Profesionální střih FULL verze + crack', desc: 'Všechny funkce odemčené zdarma.' },
        { kind: 'official', url: 'shotcut.org', title: 'Shotcut – svobodný střihový program', desc: 'Střih videa pro Windows, Linux i Mac. Zdarma.' },
        { kind: 'ad', url: 'stahuj-programy.xyz', title: 'Shotcut 2026 CZ ke stažení', desc: 'Rychlé stažení přes náš instalátor.' },
      ],
      trapText: { portal: 'Crack = nelegálně odemčený program a častý zdroj malwaru. Navíc zbytečný: Shotcut je zdarma.' },
    }));
  } else {
    list.push(task({
      id: 'firefox',
      title: 'Prohlížeč Firefox',
      why: 'Druhý prohlížeč se hodí, když jeden zlobí.',
      query: 'firefox stáhnout',
      program: 'Firefox',
      results: [
        { kind: 'official', url: 'www.mozilla.org/cs/firefox', title: 'Firefox – rychlý a soukromý prohlížeč', desc: 'Stáhněte si Firefox zdarma od Mozilly.' },
        { kind: 'ad', url: 'browser-turbo.top', title: 'Nejrychlejší prohlížeč 2026 – zdarma', desc: 'Turbo prohlížeč s vestavěným blokováním reklam.' },
        { kind: 'portal', url: 'stahuj-programy.xyz', title: 'Firefox CZ zdarma', desc: 'Stahujte přes náš rychlý instalátor.' },
      ],
    }));
  }
  if (os === 'linux') {
    for (const t of list) {
      if (t.id === 'driver') continue;
      t.results = [{ kind: 'official', url: 'Správce aplikací (Linux Mint)', title: `${t.program} – instalace ze Správce aplikací`, desc: 'Ověřený zdroj programů přímo v systému. Instalace jedním klikem.' }, ...t.results.filter((r) => r.kind !== 'official')];
    }
  }
  return list;
}

export const SCAREWARE_ID = 'scareware';
export const BUNDLE_ID = 'bundle';
