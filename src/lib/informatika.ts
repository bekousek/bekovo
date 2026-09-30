import { getCollection, type CollectionEntry } from 'astro:content';
import { FILE_TYPE_ICONS, formatDate, formatGrades, normalize } from './osv';

export { FILE_TYPE_ICONS, formatDate, formatGrades, normalize };

export type InfoCategory = CollectionEntry<'infoCategories'>['data'];
export type InfoItem = CollectionEntry<'infoItems'>['data'];
export type InfoSeries = CollectionEntry<'infoSeries'>['data'];
export type Equipment = NonNullable<InfoItem['equipment']>[number];

export const BASE = '/informatika';

export const ITEM_TYPE_LABELS: Record<InfoItem['type'], string> = {
  blok: 'Výukový blok',
  aktivita: 'Aktivita',
  projekt: 'Projekt',
  hra: 'Hra / soutěž',
  'pracovni-list': 'Pracovní list',
  video: 'Video',
  kurz: 'Kurz',
  metodika: 'Metodika',
};

export const ITEM_TYPE_ICONS: Record<InfoItem['type'], string> = {
  blok: '📦',
  aktivita: '🎯',
  projekt: '🛠️',
  hra: '🎲',
  'pracovni-list': '📋',
  video: '🎬',
  kurz: '🎓',
  metodika: '📘',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  'bez-pocitace': '✂️ Bez počítače',
  pocitac: '🖥️ Počítač',
  tablet: '📱 Tablet',
  mobil: '📱 Mobil',
  robot: '🤖 Robot',
  microbit: '🔌 micro:bit',
  '3d-tiskarna': '🖨️ 3D tiskárna',
  vr: '🥽 VR brýle',
};

export const LANGUAGE_LABELS: Record<NonNullable<InfoItem['language']>, string> = {
  cs: 'CZ',
  sk: 'SK',
  en: 'EN',
  de: 'DE',
};

type AccentClasses = { border: string; bg: string; chip: string; text: string };

/** Doslovné Tailwind třídy — interpolaci `bg-${x}-500` Tailwind nenajde. */
export const ACCENTS: Record<InfoCategory['accent'], AccentClasses> = {
  sky: { border: 'border-l-sky-500', bg: 'bg-sky-500', chip: 'bg-sky-100 text-sky-800', text: 'text-sky-700' },
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-500', chip: 'bg-blue-100 text-blue-800', text: 'text-blue-700' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-500', chip: 'bg-indigo-100 text-indigo-800', text: 'text-indigo-700' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500', chip: 'bg-violet-100 text-violet-800', text: 'text-violet-700' },
  purple: { border: 'border-l-purple-500', bg: 'bg-purple-500', chip: 'bg-purple-100 text-purple-800', text: 'text-purple-700' },
  fuchsia: { border: 'border-l-fuchsia-500', bg: 'bg-fuchsia-500', chip: 'bg-fuchsia-100 text-fuchsia-800', text: 'text-fuchsia-700' },
  pink: { border: 'border-l-pink-500', bg: 'bg-pink-500', chip: 'bg-pink-100 text-pink-800', text: 'text-pink-700' },
  rose: { border: 'border-l-rose-500', bg: 'bg-rose-500', chip: 'bg-rose-100 text-rose-800', text: 'text-rose-700' },
  red: { border: 'border-l-red-500', bg: 'bg-red-500', chip: 'bg-red-100 text-red-800', text: 'text-red-700' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800', text: 'text-orange-700' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', text: 'text-amber-700' },
  yellow: { border: 'border-l-yellow-400', bg: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-700' },
  lime: { border: 'border-l-lime-500', bg: 'bg-lime-500', chip: 'bg-lime-100 text-lime-800', text: 'text-lime-700' },
  green: { border: 'border-l-green-500', bg: 'bg-green-500', chip: 'bg-green-100 text-green-800', text: 'text-green-700' },
  emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-700' },
  teal: { border: 'border-l-teal-500', bg: 'bg-teal-500', chip: 'bg-teal-100 text-teal-800', text: 'text-teal-700' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-500', chip: 'bg-cyan-100 text-cyan-800', text: 'text-cyan-700' },
};

/**
 * Má položka vlastní stránku? Jen když je co ukázat navíc oproti kartě —
 * jinak karta vede rovnou na `url` a detail se negeneruje.
 */
export function hasDetail(item: InfoItem): boolean {
  return Boolean(
    item.goal || item.procedure || item.notes || item.materials?.length || item.files.length,
  );
}

export function categoryHref(category: Pick<InfoCategory, 'id'>): string {
  return `${BASE}/${category.id}`;
}

export function itemHref(item: InfoItem): string {
  return `${BASE}/${item.categoryId}/${item.id}`;
}

/** Kam vede klik na název karty: detail, jinak rovnou ven. */
export function primaryHref(item: InfoItem): { href: string; external: boolean } | null {
  if (hasDetail(item)) return { href: itemHref(item), external: false };
  if (item.url) return { href: item.url, external: true };
  return null;
}

export function seriesHref(series: Pick<InfoSeries, 'id'>): string {
  return `${BASE}/serie/${series.id}`;
}

export function subcategoryName(category: InfoCategory, id?: string): string | null {
  if (!id) return null;
  return category.subcategories.find((s) => s.id === id)?.name ?? null;
}

/** Hostname bez `www.` — ukáže se na kartě, ať je vidět, kam odkaz vede. */
export function hostname(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function searchIndex(item: InfoItem, category: InfoCategory): string {
  return normalize([
    item.title,
    item.description ?? '',
    item.goal ?? '',
    item.notes ?? '',
    ITEM_TYPE_LABELS[item.type],
    category.name,
    subcategoryName(category, item.subcategoryId) ?? '',
    item.keywords.join(' '),
    (item.materials ?? []).join(' '),
    (item.equipment ?? []).map((e) => EQUIPMENT_LABELS[e]).join(' '),
    item.source?.label ?? '',
    hostname(item.url) ?? '',
  ].join(' '));
}

export async function getCategories(): Promise<InfoCategory[]> {
  const categories = await getCollection('infoCategories');
  return categories.map((c) => c.data).sort((a, b) => a.order - b.order);
}

/** Nejnovější nahoře, bez data na konec, při shodě abecedně. */
export async function getItems(categoryId?: string): Promise<InfoItem[]> {
  const items = await getCollection('infoItems');
  return items
    .map((i) => i.data)
    .filter((i) => (categoryId ? i.categoryId === categoryId : true))
    .sort((a, b) => {
      if (a.added !== b.added) return (b.added ?? '').localeCompare(a.added ?? '');
      return a.title.localeCompare(b.title, 'cs');
    });
}

export function plural(n: number, one: string, few: string, many: string): string {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

export async function getSeries(): Promise<InfoSeries[]> {
  const series = await getCollection('infoSeries');
  return series.map((s) => s.data).sort((a, b) => a.name.localeCompare(b.name, 'cs'));
}

export async function getSeriesById(id: string): Promise<InfoSeries | undefined> {
  return (await getSeries()).find((s) => s.id === id);
}

/** Karty jedné série v pořadí `part` (bez pořadí na konec, pak abecedně). */
export async function getSeriesItems(seriesId: string): Promise<InfoItem[]> {
  const items = await getItems();
  return items
    .filter((i) => i.series?.id === seriesId)
    .sort((a, b) => {
      const pa = a.series?.part ?? Infinity;
      const pb = b.series?.part ?? Infinity;
      if (pa !== pb) return pa - pb;
      return a.title.localeCompare(b.title, 'cs');
    });
}
