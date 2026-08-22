import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const topics = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/topics' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    grade: z.number(),
    order: z.number(),
    icon: z.string(),
    subtopics: z.array(z.string()),
  }),
});

const subtopics = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/subtopics' }),
  schema: z.object({
    id: z.string(),
    topicId: z.string(),
    name: z.string(),
    order: z.number(),
    notebookEntry: z.object({
      content: z.string().optional(),
      latex: z.string().optional(),
      latexSvg: z.array(z.string()).optional(),
      latexPdf: z.object({
        pageCount: z.number().int().positive(),
        aspectRatio: z.number().positive(),
      }).optional(),
    }).optional(),
    lessonPrep: z.object({
      googleDocUrl: z.string().url().optional(),
      lessons: z.array(z.object({
        title: z.string(),
        sourceLessonNo: z.number().optional(),
        date: z.string().optional(),
        sourceUrl: z.string().url().optional(),
        content: z.string(),
      })).optional(),
    }).optional(),
    pastTests: z.array(z.object({
      title: z.string(),
      googleDocUrl: z.string().url(),
    })).optional(),
    formulas: z.array(z.string()).optional(),
  }),
});

const sourceSchema = z.object({
  label: z.string(),
  url: z.string().url().optional(),
  pdf: z.string().optional(),
}).optional();

const experiments = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experiments' }),
  schema: z.object({
    id: z.string(),
    subtopicId: z.string(),
    topicId: z.string(),
    title: z.string(),
    type: z.enum(['qualitative', 'measurement']),
    description: z.string(),
    materials: z.array(z.string()).optional(),
    procedure: z.string().optional(),
    driveFileUrl: z.string().url().optional(),
    source: sourceSchema,
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/activities' }),
  schema: z.object({
    id: z.string(),
    subtopicId: z.string(),
    topicId: z.string(),
    title: z.string(),
    type: z.enum(['game', 'method', 'group-work', 'other']),
    description: z.string(),
    driveFileUrl: z.string().url().optional(),
    source: sourceSchema,
  }),
});

const materials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/materials' }),
  schema: z.object({
    id: z.string(),
    subtopicId: z.string(),
    topicId: z.string(),
    title: z.string(),
    type: z.enum(['worksheet', 'video', 'applet', 'link', 'other']),
    description: z.string().optional(),
    url: z.string().url(),
  }),
});

const homework = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/homework' }),
  schema: z.object({
    id: z.string(),
    subtopicId: z.string(),
    topicId: z.string(),
    title: z.string(),
    description: z.string(),
    driveFileUrl: z.string().url().optional(),
    source: sourceSchema,
  }),
});

const formulas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/formulas' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    subtopicIds: z.array(z.string()),
    formula: z.string(),
    variables: z.array(z.object({
      symbol: z.string(),
      name: z.string(),
      unit: z.string(),
      altUnits: z.array(z.object({
        unit: z.string(),
        factor: z.number(),
      })).optional(),
      range: z.tuple([z.number(), z.number()]).optional(),
      constant: z.number().optional(),
      power: z.number().optional(),
    })),
  }),
});

const scenarios = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/scenarios' }),
  schema: z.object({
    formulaId: z.string(),
    fillers: z.record(z.string(), z.array(z.string())).optional(),
    scenarios: z.array(z.object({
      id: z.string(),
      templates: z.record(z.string(), z.string()),
      ranges: z.record(z.string(), z.tuple([z.number(), z.number()])).optional(),
    })),
  }),
});

/* ---------------------------------------------------------------------------
 * OSV — Osobnostní a sociální výchova (bekovo.cz/osv)
 *
 * Samostatná větev obsahu, nezávislá na fyzikálních tématech. Podle
 * revidovaného RVP ZV (2025) je OSV plnohodnotný vzdělávací obor v oblasti
 * „Člověk, jeho osobnost a svět práce“ (už ne průřezové téma) a jeho obsah je
 * rozdělen do tří tematických okruhů: Osobnostní rozvoj, Sociální a etický
 * rozvoj, Kariérový rozvoj. Čtvrtá kategorie (Rozvoj třídního kolektivu) není
 * okruh RVP — je to provozní vrstva třídnických hodin.
 * ------------------------------------------------------------------------- */

// Odkaz na soubor: buď absolutní URL (Google Drive, web), nebo cesta uvnitř
// tohoto webu začínající `/` (např. `/osv-soubory/emoce-karty.pdf`).
const osvHref = z.string().refine(
  (value) => /^https?:\/\//.test(value) || value.startsWith('/'),
  { message: 'Musí být absolutní URL (https://…) nebo cesta na webu začínající „/“.' },
);

const osvCategories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/osv-categories' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    /** Krátký název do navigace a breadcrumbů. */
    shortName: z.string(),
    order: z.number(),
    icon: z.string(),
    /** Barevný akcent. Hodnoty se v komponentách mapují na doslovné Tailwind
     *  třídy — Tailwind neumí `bg-${accent}-100`, viz TopicCard.astro. */
    accent: z.enum(['emerald', 'blue', 'amber', 'violet']),
    /** Jedna věta na kartu kategorie. */
    tagline: z.string(),
    /** Co do kategorie patří — vodítko pro rozřazování nových námětů. */
    description: z.string(),
    /** Ukotvení v RVP ZV (2025). */
    rvpAnchor: z.string(),
    /** Kanonický číselník podoblastí — položky se jimi štítkují (`rvpAreas`). */
    rvpAreas: z.array(z.string()),
  }),
});

const osvItems = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/osv-items' }),
  schema: z.object({
    id: z.string(),
    categoryId: z.string(),
    title: z.string(),
    /** Stručný popis — 1–3 věty, zobrazuje se na kartě. */
    description: z.string(),
    /** Klíčová slova pro vyhledávání. Bez diakritiky se hledá taky. */
    keywords: z.array(z.string()).default([]),
    type: z.enum([
      'aktivita',
      'hra',
      'plan-hodiny',
      'metodika',
      'pracovni-list',
      'plakat',
      'video',
      'clanek',
      'dotaznik',
      'namet',
      'jine',
    ]),
    /** Časová náročnost, volný text: „15 min“, „1 vyučovací hodina“, „2×45 min“. */
    duration: z.string().optional(),
    /** Pro které ročníky se hodí. */
    grades: z.array(z.number().int().min(1).max(9)).optional(),
    /** Cíl — co si žáci odnesou. */
    goal: z.string().optional(),
    /** Pomůcky. */
    materials: z.array(z.string()).optional(),
    /** Podrobný postup / scénář hodiny. Odstavce oddělené prázdným řádkem. */
    procedure: z.string().optional(),
    /** Otázky do závěrečné reflexe. */
    reflection: z.array(z.string()).optional(),
    /** Štítky z číselníku `rvpAreas` mateřské kategorie. */
    rvpAreas: z.array(z.string()).optional(),
    /** Odkaz na původní zdroj. */
    source: z.object({
      label: z.string(),
      url: z.string().url().optional(),
      note: z.string().optional(),
    }).optional(),
    /** Přiložené soubory — Drive, nebo `/osv-soubory/…` v tomto repu. */
    files: z.array(z.object({
      label: z.string(),
      href: osvHref,
      type: z.enum(['pdf', 'doc', 'slides', 'sheet', 'image', 'audio', 'video', 'other']).default('other'),
      note: z.string().optional(),
    })).default([]),
    /** Kde v přípravě položka je. */
    status: z.enum(['namet', 'pripraveno', 'odzkouseno']).default('namet'),
    /** Moje poznámka — co fungovalo, na co si dát pozor. */
    notes: z.string().optional(),
    /** Datum přidání (YYYY-MM-DD) — řadí se podle něj, nejnovější nahoře. */
    added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export const collections = {
  topics,
  subtopics,
  experiments,
  activities,
  materials,
  homework,
  formulas,
  scenarios,
  osvCategories,
  osvItems,
};
