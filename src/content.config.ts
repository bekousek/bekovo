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
    }).optional(),
    lessonPrep: z.object({
      googleDocUrl: z.string().url(),
    }).optional(),
    pastTests: z.array(z.object({
      title: z.string(),
      googleDocUrl: z.string().url(),
    })).optional(),
    formulas: z.array(z.string()).optional(),
  }),
});

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

export const collections = {
  topics,
  subtopics,
  experiments,
  activities,
  materials,
  homework,
  formulas,
  scenarios,
};
