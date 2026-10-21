/**
 * Sjednocený model položek (pokusy, aktivity, materiály, úkoly) pro prototypy
 * přehledů pod /test*. Soubor nesmí importovat `astro:content` — používají ho
 * i skripty v prohlížeči. Data načítá `./data.ts` (jen při buildu).
 */

export type Kind = 'pokus' | 'aktivita' | 'material' | 'ukol';
export type Audience = 'zak' | 'demo' | 'oboje' | null;

export const KINDS: Kind[] = ['pokus', 'aktivita', 'material', 'ukol'];

/** Prefix klíče — dvě id jsou zároveň pokusem i aktivitou, klíč proto nese druh. */
export const KIND_PREFIX: Record<Kind, string> = { pokus: 'e', aktivita: 'a', material: 'm', ukol: 'h' };

export const KIND_LABEL: Record<Kind, { one: string; many: string }> = {
  pokus: { one: 'Pokus', many: 'Pokusy' },
  aktivita: { one: 'Aktivita', many: 'Aktivity' },
  material: { one: 'Materiál', many: 'Materiály' },
  ukol: { one: 'Úkol', many: 'Úkoly' },
};

/** Tvary pro počty: 1 pokus, 2–4 pokusy, 5+ pokusů. */
export const KIND_FORMS: Record<Kind, [string, string, string]> = {
  pokus: ['pokus', 'pokusy', 'pokusů'],
  aktivita: ['aktivita', 'aktivity', 'aktivit'],
  material: ['materiál', 'materiály', 'materiálů'],
  ukol: ['úkol', 'úkoly', 'úkolů'],
};

export const TYPE_LABEL: Record<string, string> = {
  qualitative: 'Kvalitativní',
  measurement: 'S měřením',
  game: 'Hra',
  method: 'Metoda',
  'group-work': 'Skupinová práce',
  worksheet: 'Pracovní list',
  video: 'Video',
  applet: 'Applet',
  link: 'Odkaz',
  other: 'Jiné',
  homework: 'Domácí úkol',
};

/** Pořadí typů materiálů v přehledech — applety a videa se v hodině používají nejčastěji. */
export const MATERIAL_TYPE_ORDER = ['applet', 'video', 'worksheet', 'link', 'other'];

export const MATERIAL_ACTION: Record<string, string> = {
  applet: 'Spustit applet',
  video: 'Pustit video',
  worksheet: 'Otevřít list',
  link: 'Otevřít odkaz',
  other: 'Otevřít',
};

export const AUDIENCE_LABEL: Record<Exclude<Audience, null>, string> = {
  zak: 'Žákovský',
  demo: 'Demonstrační',
  oboje: 'Žákovský i demo',
};

export const GRADES = [6, 7, 8, 9];

/** Malá písmena bez diakritiky — stejně jako `normalize()` v src/lib/osv.ts. */
export const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const plural = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

export const countKind = (kind: Kind, n: number) => `${n.toLocaleString('cs-CZ')} ${plural(n, ...KIND_FORMS[kind])}`;

export const itemKey =(kind: Kind, id: string) => `${KIND_PREFIX[kind]}.${id}`;

// ---------------------------------------------------------------------------
// Žákovský × demonstrační — v datech je to jen úvod popisu („Demonstrační pokus.").

const AUD_BOTH = /^(žákovsk\S*|demonstra\S*)( pokus)?\s+(i|nebo|či)\s+(žákovsk|demonstra)/i;

export function deriveAudience(description: string): Audience {
  const head = description.trimStart().slice(0, 80);
  if (AUD_BOTH.test(head)) return 'oboje';
  if (/^demonstra/i.test(head)) return 'demo';
  if (/^(žákovsk|žáci\s)/i.test(head)) return 'zak';
  return null;
}

/**
 * Úvodní „Demonstrační pokus." nahrazuje štítek, takže se z popisu odstřihne.
 * Jen když je to samostatná věta / návěští — „Demonstrační pokus s měřením…"
 * nese informaci a zůstává.
 */
const AUD_LEAD =
  /^(demonstrační|žákovský)(\s+(i|nebo)\s+(demonstrační|žákovský))?\s+pokus(\s+učitele)?\s*[.:—–-]\s*/i;

export function stripAudienceLead(description: string): string {
  const m = description.match(AUD_LEAD);
  if (!m) return description;
  const rest = description.slice(m[0].length);
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

// ---------------------------------------------------------------------------
// Postup do kroků: explicitní číslování „1) … 2) …" / „1. … 2. …", jinak věty.

export function splitSteps(text: string | undefined): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  for (const marker of [/(?:^|\s)(\d{1,2})\)\s+/g, /(?:^|\s)(\d{1,2})\.\s+(?=\p{Lu})/gu]) {
    const parts = trimmed.split(marker);
    // split se skupinou vrací [před, číslo, text, číslo, text…]
    if (parts.length >= 5 && parts[1] === '1') {
      const steps: string[] = [];
      for (let i = 2; i < parts.length; i += 2) steps.push(parts[i].trim());
      if (parts[0].trim()) steps.unshift(parts[0].trim());
      return steps.filter(Boolean);
    }
  }
  const sentences = trimmed
    .split(/(?<=[.!?])\s+(?=[\p{Lu}„"])/u)
    .map((s) => s.trim())
    .filter(Boolean);
  // Velmi krátké „věty" (zkratky typ „cca.") se připojí k předchozí.
  const merged: string[] = [];
  for (const s of sentences) {
    if (merged.length && s.length < 18) merged[merged.length - 1] += ` ${s}`;
    else merged.push(s);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Zdroje — čitelný název webu místo domény.

export const HOST_LABELS: Record<string, string> = {
  'edu.ceskatelevize.cz': 'ČT edu',
  'ceskatelevize.cz': 'Česká televize',
  'edu.techmania.cz': 'Techmania',
  'digital.techmania.cz': 'Techmania',
  'fyzika.jreichl.com': 'Reichl',
  'svetenergie.cz': 'Svět energie',
  'phet.colorado.edu': 'PhET',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'm.youtube.com': 'YouTube',
  'fyzikalnipokusy.cz': 'Fyzikální pokusy',
  'vnuf.cz': 'VNUF',
  'vascak.cz': 'Vaščák',
  'dumy.cz': 'DUMY',
  'walter-fendt.de': 'Walter Fendt',
  'kdf.mff.cuni.cz': 'KDF MFF UK',
  'mff.cuni.cz': 'MFF UK',
  'matfyz.cz': 'Matfyz',
  'geogebra.org': 'GeoGebra',
  'clanky.rvp.cz': 'Metodický portál RVP',
  'veskole.cz': 'Ve škole',
  'scienceon.cz': 'Science ON',
  'vyfuk.org': 'Výfuk',
  'iqlandia.cz': 'iQLANDIA',
  'fyzikum.cz': 'Fyzikum',
  'falstad.com': 'Falstad',
  'aldebaran.cz': 'Aldebaran',
  'fyzweb.cz': 'Fyzweb',
  'ucimesevenku.cz': 'Učíme se venku',
  'globe-czech.cz': 'GLOBE',
  'vimproc.cz': 'Vím proč',
  'pokusy.upol.cz': 'Pokusy UP Olomouc',
  'vida.cz': 'VIDA!',
  'compadre.org': 'ComPADRE',
  'astro.cz': 'astro.cz',
  'science-on-stage.eu': 'Science on Stage',
  'fykos.cz': 'FYKOS',
  'static.fykos.cz': 'FYKOS',
  'fyzikalniolympiada.cz': 'Fyzikální olympiáda',
  'elixirdoskol.cz': 'Elixír do škol',
  'drive.google.com': 'Google Drive',
  'docs.google.com': 'Google Docs',
  'cs.wikipedia.org': 'Wikipedie',
};

export function hostLabel(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return HOST_LABELS[host] ?? host;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// „Mám po ruce" — slovník běžných pomůcek. Pomůcky jsou v datech volný text
// (přes 2 000 různých zápisů), proto se shoduje podle začátků slov.

export interface Equipment {
  id: string;
  label: string;
  pattern: RegExp;
}

export const EQUIPMENT: Equipment[] = [
  { id: 'voda', label: 'voda', pattern: /\bvod(a|u|ou|y|e)\b/ },
  { id: 'lahev', label: 'PET láhev', pattern: /\b(lahev|lahve|lahvi|lahvic|pet\b)/ },
  { id: 'sklenice', label: 'sklenice', pattern: /\bsklen(ic|k)/ },
  { id: 'nadoba', label: 'miska / nádoba', pattern: /\b(nadob|misk|kadin|vanick|lavor)/ },
  { id: 'kelimek', label: 'kelímek', pattern: /\bkelim/ },
  { id: 'papir', label: 'papír', pattern: /\bpapir/ },
  { id: 'karton', label: 'karton', pattern: /\bkarto/ },
  { id: 'nuzky', label: 'nůžky', pattern: /\bnuzk/ },
  { id: 'lepidlo', label: 'lepidlo / páska', pattern: /\b(lepid|lepic|izolepa|paska)/ },
  { id: 'provazek', label: 'provázek', pattern: /\b(provaz|nit\b|niti\b|spag)/ },
  { id: 'baterie', label: 'baterie / zdroj', pattern: /\b(bateri|zdroj (napeti|proudu|stejnosmer)|clanek|clanky|akumul)/ },
  { id: 'vodice', label: 'vodiče', pattern: /\b(vodic|krokosvork|kabel)/ },
  { id: 'zarovka', label: 'žárovka', pattern: /\b(zarovk|objimk)/ },
  { id: 'multimetr', label: 'multimetr', pattern: /\b(multimetr|voltmetr|ampermetr|ohmmetr)/ },
  { id: 'magnet', label: 'magnet', pattern: /\b(magnet|neodym)/ },
  { id: 'kompas', label: 'kompas', pattern: /\b(kompas|buzol|magnetk)/ },
  { id: 'svicka', label: 'svíčka', pattern: /\bsvic(k|ek)/ },
  { id: 'zapalky', label: 'zápalky', pattern: /\bzapal/ },
  { id: 'kahan', label: 'kahan / vařič', pattern: /\b(kahan|varic|rychlovarn|konvic)/ },
  { id: 'teplomer', label: 'teploměr', pattern: /\b(teplomer|termomet|termocl)/ },
  { id: 'balonek', label: 'balónek', pattern: /\bbalon/ },
  { id: 'brcko', label: 'brčko', pattern: /\bbrck/ },
  { id: 'strikacka', label: 'injekční stříkačka', pattern: /\b(strikack|injekc)/ },
  { id: 'hadicka', label: 'hadička', pattern: /\bhadic/ },
  { id: 'stojan', label: 'stojan', pattern: /\bstojan/ },
  { id: 'zavazi', label: 'závaží', pattern: /\bzavaz/ },
  { id: 'silomer', label: 'siloměr', pattern: /\bsilomer/ },
  { id: 'stopky', label: 'stopky', pattern: /\bstop(k|ek)/ },
  { id: 'meritko', label: 'pravítko / metr', pattern: /\b(pravitk|metr\b|svinovac|meritk)/ },
  { id: 'mobil', label: 'mobil', pattern: /\b(mobil|telefon|smartphon|tablet)/ },
  { id: 'laser', label: 'laser', pattern: /\blaser/ },
  { id: 'baterka', label: 'baterka / lampa', pattern: /\b(baterk|svitiln|lamp)/ },
  { id: 'zrcatko', label: 'zrcátko', pattern: /\bzrca/ },
  { id: 'cocka', label: 'čočka / lupa', pattern: /\b(cock|lup(a|u|y)\b)/ },
  { id: 'alobal', label: 'alobal', pattern: /\balobal/ },
  { id: 'mince', label: 'mince', pattern: /\bminc/ },
  { id: 'hrebik', label: 'hřebík', pattern: /\bhrebik/ },
  { id: 'gumicka', label: 'gumička', pattern: /\bgumic/ },
  { id: 'spejle', label: 'špejle', pattern: /\bspejl/ },
  { id: 'polystyren', label: 'polystyren', pattern: /\bpolystyr/ },
  { id: 'olej', label: 'olej', pattern: /\bolej/ },
  { id: 'sul', label: 'sůl / cukr', pattern: /\b(sul|soli|cukr)\b/ },
];

/** Indexy pomůcek ze slovníku, které daný řádek „Pomůcek" pokrývá. */
export function matchEquipment(entry: string): number[] {
  const text = normalize(entry);
  const hits: number[] = [];
  EQUIPMENT.forEach((eq, i) => {
    if (eq.pattern.test(text)) hits.push(i);
  });
  return hits;
}

export const isOptional = (entry: string) => /volitel|nepovinn|případně|pokud m/i.test(entry);
