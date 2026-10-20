/**
 * Načtení všech čtyř kolekcí do sjednoceného modelu (jen při buildu).
 * Z podkapitol se berou jen metadata — `latexSvg` (stovky kB na podkapitolu)
 * se do stránek ani JSONu nikdy nedostane.
 */
import { getCollection } from 'astro:content';
import { hasApplet } from '../applets';
import {
  type Audience,
  type Kind,
  KINDS,
  MATERIAL_TYPE_ORDER,
  TYPE_LABEL,
  deriveAudience,
  hostLabel,
  isOptional,
  itemKey,
  matchEquipment,
  normalize,
  splitSteps,
  stripAudienceLead,
} from './model';

export interface LibraryItem {
  key: string;
  id: string;
  kind: Kind;
  title: string;
  type: string;
  typeLabel: string;
  topicId: string;
  subtopicId: string;
  grade: number;
  audience: Audience;
  /** Popis bez úvodního „Demonstrační pokus." (ten nese štítek). */
  description: string;
  paragraphs: string[];
  excerpt: string;
  materials: string[];
  optional: boolean[];
  /** Pro každý řádek pomůcek indexy ze slovníku EQUIPMENT. */
  eq: number[][];
  procedure?: string;
  steps: string[];
  url?: string;
  host?: string;
  source?: { label: string; url?: string; host?: string };
  driveFileUrl?: string;
  links: { label: string; url: string }[];
  search: string;
}

export interface SubtopicInfo {
  id: string;
  topicId: string;
  name: string;
  order: number;
  grade: number;
  counts: Record<Kind, number>;
  total: number;
  hasNotebook: boolean;
  hasPrep: boolean;
  hasApplet: boolean;
}

export interface TopicInfo {
  id: string;
  name: string;
  grade: number;
  order: number;
  subtopics: SubtopicInfo[];
  total: number;
}

export interface Library {
  items: LibraryItem[];
  topics: TopicInfo[];
  topicById: Map<string, TopicInfo>;
  subById: Map<string, SubtopicInfo>;
  bySub: Map<string, LibraryItem[]>;
}

const collator = new Intl.Collator('cs');

function excerptOf(text: string, max = 170): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function sortItems(items: LibraryItem[]): LibraryItem[] {
  const kindRank = (i: LibraryItem) => KINDS.indexOf(i.kind);
  const typeRank = (i: LibraryItem) => (i.kind === 'material' ? MATERIAL_TYPE_ORDER.indexOf(i.type) : 0);
  return items.sort(
    (a, b) => kindRank(a) - kindRank(b) || typeRank(a) - typeRank(b) || collator.compare(a.title, b.title),
  );
}

let cache: Promise<Library> | undefined;

export function getLibrary(): Promise<Library> {
  cache ??= load();
  return cache;
}

async function load(): Promise<Library> {
  const [topicsCol, subtopicsCol, experiments, activities, materials, homework] = await Promise.all([
    getCollection('topics'),
    getCollection('subtopics'),
    getCollection('experiments'),
    getCollection('activities'),
    getCollection('materials'),
    getCollection('homework'),
  ]);

  const gradeOf = new Map(topicsCol.map((t) => [t.data.id, t.data.grade]));
  const topicName = new Map(topicsCol.map((t) => [t.data.id, t.data.name]));
  const subName = new Map(subtopicsCol.map((s) => [s.data.id, s.data.name]));

  const items: LibraryItem[] = [];

  const base = (
    kind: Kind,
    d: { id: string; title: string; topicId: string; subtopicId: string; description?: string },
    type: string,
  ) => {
    const raw = d.description ?? '';
    const audience = kind === 'pokus' ? deriveAudience(raw) : null;
    const description = kind === 'pokus' ? stripAudienceLead(raw) : raw;
    return {
      key: itemKey(kind, d.id),
      id: d.id,
      kind,
      title: d.title,
      type,
      typeLabel: TYPE_LABEL[type] ?? type,
      topicId: d.topicId,
      subtopicId: d.subtopicId,
      grade: gradeOf.get(d.topicId) ?? 0,
      audience,
      description,
      paragraphs: description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      excerpt: excerptOf(description),
      materials: [] as string[],
      optional: [] as boolean[],
      eq: [] as number[][],
      steps: [] as string[],
      links: [] as { label: string; url: string }[],
    };
  };

  const withSource = (source?: { label: string; url?: string; pdf?: string }) =>
    source ? { label: source.label, url: source.url, host: hostLabel(source.url) } : undefined;

  for (const { data: d } of experiments) {
    const materials = d.materials ?? [];
    items.push({
      ...base('pokus', d, d.type),
      materials,
      optional: materials.map(isOptional),
      eq: materials.map(matchEquipment),
      procedure: d.procedure,
      steps: splitSteps(d.procedure),
      source: withSource(d.source),
      driveFileUrl: d.driveFileUrl,
      search: '',
    });
  }
  for (const { data: d } of activities) {
    items.push({
      ...base('aktivita', d, d.type),
      steps: splitSteps(d.description),
      source: withSource(d.source),
      driveFileUrl: d.driveFileUrl,
      search: '',
    });
  }
  for (const { data: d } of materials) {
    items.push({
      ...base('material', d, d.type),
      url: d.url,
      host: hostLabel(d.url),
      search: '',
    });
  }
  for (const { data: d } of homework) {
    items.push({
      ...base('ukol', d, 'homework'),
      source: withSource(d.source),
      driveFileUrl: d.driveFileUrl,
      links: d.links ?? [],
      search: '',
    });
  }

  for (const item of items) {
    item.search = normalize(
      [
        item.title,
        item.description,
        item.materials.join(' '),
        item.procedure ?? '',
        item.typeLabel,
        item.host ?? '',
        item.source?.label ?? '',
        item.source?.host ?? '',
        topicName.get(item.topicId) ?? '',
        subName.get(item.subtopicId) ?? '',
      ].join(' '),
    );
  }

  const bySub = new Map<string, LibraryItem[]>();
  for (const item of items) {
    const list = bySub.get(item.subtopicId) ?? [];
    list.push(item);
    bySub.set(item.subtopicId, list);
  }
  for (const list of bySub.values()) sortItems(list);

  const subById = new Map<string, SubtopicInfo>();
  const topics: TopicInfo[] = topicsCol
    .map((t) => t.data)
    .sort((a, b) => a.order - b.order)
    .map((t) => {
      const subtopics = subtopicsCol
        .map((s) => s.data)
        .filter((s) => s.topicId === t.id)
        .sort((a, b) => a.order - b.order)
        .map((s) => {
          const list = bySub.get(s.id) ?? [];
          const counts = Object.fromEntries(KINDS.map((k) => [k, list.filter((i) => i.kind === k).length])) as Record<
            Kind,
            number
          >;
          const info: SubtopicInfo = {
            id: s.id,
            topicId: t.id,
            name: s.name,
            order: s.order,
            grade: t.grade,
            counts,
            total: list.length,
            hasNotebook: Boolean(s.notebookEntry),
            hasPrep: Boolean(s.lessonPrep?.lessons?.length || s.lessonPrep?.googleDocUrl),
            hasApplet: hasApplet(s.id),
          };
          subById.set(s.id, info);
          return info;
        });
      return {
        id: t.id,
        name: t.name,
        grade: t.grade,
        order: t.order,
        subtopics,
        total: subtopics.reduce((sum, s) => sum + s.total, 0),
      };
    });

  return {
    items: sortItems(items),
    topics,
    topicById: new Map(topics.map((t) => [t.id, t])),
    subById,
    bySub,
  };
}

/** getStaticPaths pro /testN/[topic]/[subtopic] — props nesou jen id, žádná těžká data. */
export async function getProtoSubtopicPaths() {
  const lib = await getLibrary();
  return lib.topics.flatMap((t) =>
    t.subtopics.map((s) => ({ params: { topic: t.id, subtopic: s.id }, props: { topicId: t.id, subtopicId: s.id } })),
  );
}

/** Odkazy na ostatní sekce podkapitoly na současném webu. */
export function sectionLinks(sub: SubtopicInfo) {
  const base = `/${sub.topicId}/${sub.id}`;
  return [
    sub.hasNotebook && { label: 'Zápis do sešitu', href: `${base}/zapis` },
    sub.hasPrep && { label: 'Příprava na hodinu', href: `${base}/priprava` },
    { label: 'Generátor příkladů', href: `${base}/generator` },
    { label: 'Minulé testy', href: `${base}/testy` },
    sub.hasApplet && { label: 'Interaktivní applet', href: `/applety/${sub.topicId}/${sub.id}/` },
  ].filter(Boolean) as { label: string; href: string }[];
}

// ---------------------------------------------------------------------------
// JSON pro prohlížeč (/test/library.json a /test/library-text.json).

export interface IndexItem {
  k: string;
  kind: Kind;
  t: string;
  type: string;
  topic: string;
  sub: string;
  g: number;
  aud?: Exclude<Audience, null>;
  url?: string;
  host?: string;
  src?: string;
  srcUrl?: string;
  mat?: string[];
  opt?: number[];
  eq?: number[][];
  ns?: number;
}

export interface IndexJson {
  topics: { id: string; name: string; grade: number; subtopics: { id: string; name: string; total: number }[] }[];
  items: IndexItem[];
}

export function toIndexJson(lib: Library): IndexJson {
  return {
    topics: lib.topics.map((t) => ({
      id: t.id,
      name: t.name,
      grade: t.grade,
      subtopics: t.subtopics.map((s) => ({ id: s.id, name: s.name, total: s.total })),
    })),
    items: lib.items.map((i) => {
      const out: IndexItem = { k: i.key, kind: i.kind, t: i.title, type: i.type, topic: i.topicId, sub: i.subtopicId, g: i.grade };
      if (i.audience) out.aud = i.audience;
      if (i.url) out.url = i.url;
      if (i.host) out.host = i.host;
      if (i.source) {
        out.src = i.source.label;
        if (i.source.url) out.srcUrl = i.source.url;
      }
      if (i.materials.length) {
        out.mat = i.materials;
        out.eq = i.eq;
        const opt = i.optional.flatMap((o, idx) => (o ? [idx] : []));
        if (opt.length) out.opt = opt;
      }
      if (i.steps.length && i.kind === 'pokus') out.ns = i.steps.length;
      return out;
    }),
  };
}

export interface TextItem {
  d: string;
  s?: string[];
  f?: string;
  l?: { label: string; url: string }[];
}

export function toTextJson(lib: Library): Record<string, TextItem> {
  return Object.fromEntries(
    lib.items.map((i) => {
      const out: TextItem = { d: i.description };
      if (i.kind === 'pokus' && i.steps.length) out.s = i.steps;
      if (i.driveFileUrl) out.f = i.driveFileUrl;
      if (i.links.length) out.l = i.links;
      return [i.key, out];
    }),
  );
}

export function assertJsonSize(name: string, body: string, maxBytes = 2_000_000) {
  if (body.length > maxBytes) throw new Error(`${name}: ${body.length} B přesahuje limit ${maxBytes} B`);
  return body;
}
