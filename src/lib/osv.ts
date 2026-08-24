import { getCollection, type CollectionEntry } from 'astro:content';

export type OsvCategory = CollectionEntry<'osvCategories'>['data'];
export type OsvItem = CollectionEntry<'osvItems'>['data'];

/** Popisky typů položek — používá se na kartách i ve filtrech. */
export const ITEM_TYPE_LABELS: Record<OsvItem['type'], string> = {
  aktivita: 'Aktivita',
  hra: 'Hra',
  'plan-hodiny': 'Plán hodiny',
  metodika: 'Metodika',
  'pracovni-list': 'Pracovní list',
  plakat: 'Plakát',
  video: 'Video',
  clanek: 'Článek',
  dotaznik: 'Dotazník',
  namet: 'Námět',
  jine: 'Jiné',
};

export const ITEM_TYPE_ICONS: Record<OsvItem['type'], string> = {
  aktivita: '🎯',
  hra: '🎲',
  'plan-hodiny': '🗒️',
  metodika: '📘',
  'pracovni-list': '📋',
  plakat: '🖼️',
  video: '🎬',
  clanek: '📰',
  dotaznik: '📊',
  namet: '💡',
  jine: '📎',
};

export const STATUS_LABELS: Record<NonNullable<OsvItem['status']>, string> = {
  namet: 'Námět',
  pripraveno: 'Připraveno',
  odzkouseno: 'Odzkoušeno',
};

/** Doslovné Tailwind třídy — dynamické `bg-${x}-100` Tailwind nenajde. */
export const STATUS_CLASSES: Record<NonNullable<OsvItem['status']>, string> = {
  namet: 'bg-gray-100 text-gray-600',
  pripraveno: 'bg-sky-100 text-sky-800',
  odzkouseno: 'bg-emerald-100 text-emerald-800',
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📕',
  doc: '📄',
  slides: '🖼️',
  sheet: '📈',
  image: '🏞️',
  audio: '🎧',
  video: '🎬',
  other: '📎',
};

type AccentClasses = {
  /** Barva levého pruhu karty. Jen `border-l-…`, aby nekolidovala
   *  s hairline rámečkem — ten dělá `ring-1 ring-gray-200`. */
  border: string;
  /** Kolečko / plná plocha. */
  bg: string;
  /** Světlý štítek. */
  chip: string;
  /** Text v barvě akcentu. */
  text: string;
};

/**
 * Mapa akcentů na doslovné Tailwind třídy. Tailwind skenuje zdroják na
 * literální řetězce, takže se nesmí skládat interpolací (viz TopicCard.astro).
 */
export const ACCENTS: Record<OsvCategory['accent'], AccentClasses> = {
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-800',
    text: 'text-emerald-700',
  },
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-800',
    text: 'text-blue-700',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-800',
    text: 'text-amber-700',
  },
  violet: {
    border: 'border-l-violet-500',
    bg: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-800',
    text: 'text-violet-700',
  },
};

/**
 * Normalizace pro fulltext: malá písmena bez diakritiky, aby „socialni“
 * našlo „sociální“. Stejná funkce běží v prohlížeči nad dotazem — viz
 * `OsvSearch.astro`; když se změní tady, změň ji i tam.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Vše, v čem se na stránce hledá. Vzniká při buildu, jde do `data-search`. */
export function searchIndex(item: OsvItem): string {
  return normalize([
    item.title,
    item.description,
    item.goal ?? '',
    item.notes ?? '',
    ITEM_TYPE_LABELS[item.type],
    item.keywords.join(' '),
    (item.rvpAreas ?? []).join(' '),
    (item.materials ?? []).join(' '),
    item.source?.label ?? '',
    item.files.map((f) => f.label).join(' '),
  ].join(' '));
}

export function itemHref(item: OsvItem): string {
  return `/osv/${item.categoryId}/${item.id}`;
}

export function categoryHref(category: Pick<OsvCategory, 'id'>): string {
  return `/osv/${category.id}`;
}

export async function getCategories(): Promise<OsvCategory[]> {
  const categories = await getCollection('osvCategories');
  return categories.map((c) => c.data).sort((a, b) => a.order - b.order);
}

/**
 * Položky kategorie. Řadí se nejnovější nahoru (`added`), položky bez data
 * na konec, při shodě abecedně podle názvu.
 */
export async function getItems(categoryId?: string): Promise<OsvItem[]> {
  const items = await getCollection('osvItems');
  return items
    .map((i) => i.data)
    .filter((i) => (categoryId ? i.categoryId === categoryId : true))
    .sort((a, b) => {
      if (a.added !== b.added) return (b.added ?? '').localeCompare(a.added ?? '');
      return a.title.localeCompare(b.title, 'cs');
    });
}

/** Kolik položek má která kategorie — pro rozcestník na /osv. */
export async function getItemCounts(): Promise<Record<string, number>> {
  const items = await getCollection('osvItems');
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.data.categoryId] = (counts[item.data.categoryId] ?? 0) + 1;
  }
  return counts;
}

/** Typy, které se v dané sadě položek opravdu vyskytují — pro filtry. */
export function usedTypes(items: OsvItem[]): OsvItem['type'][] {
  const order = Object.keys(ITEM_TYPE_LABELS) as OsvItem['type'][];
  const present = new Set(items.map((i) => i.type));
  return order.filter((t) => present.has(t));
}

/** Ročníky, které se v dané sadě vyskytují — pro filtry. */
export function usedGrades(items: OsvItem[]): number[] {
  const present = new Set<number>();
  for (const item of items) for (const g of item.grades ?? []) present.add(g);
  return [...present].sort((a, b) => a - b);
}

/** „6.–9. třída“ / „6. a 8. třída“ — kompaktní zápis rozsahu ročníků. */
export function formatGrades(grades?: number[]): string | null {
  if (!grades || grades.length === 0) return null;
  const sorted = [...grades].sort((a, b) => a - b);
  const isRange =
    sorted.length > 2 && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1;
  if (isRange) return `${sorted[0]}.–${sorted[sorted.length - 1]}. třída`;
  return `${sorted.map((g) => `${g}.`).join(' a ')} třída`;
}

/** `2026-08-22` → `„22. 8. 2026"`. Neplatné datum vrátí vstup beze změny. */
export function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day}. ${month}. ${year}`;
}
