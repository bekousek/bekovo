/**
 * SceneDoc — jediný serializovatelný zdroj pravdy o scéně.
 *
 * SI jednotky všude: metry, kilogramy, sekundy, radiány. Svět je y-up
 * (gravitace má záporné y). Hustota je plošná (kg/m²) — číselně odpovídá
 * objemové hustotě materiálu při tloušťce 1 m, takže presety používají
 * známé hodnoty (voda 1000, ocel 7850…).
 *
 * Evoluce: `version` je povinná; každá změna tvaru PO PRVNÍM VYDÁNÍ = nová
 * verze + čistá migrace v scene/migrate.ts. Zmrazené fixtury starých verzí
 * se testují v CI navždy. (Před prvním vydáním se v1 ještě vyvíjí volně.)
 */
import { z } from 'zod';
import { LessonSchema } from './lesson';

export const Vec2Schema = z.object({ x: z.number(), y: z.number() });

// ---------------------------------------------------------------------------
// Tvary (lokální souřadnice tělesa)
// ---------------------------------------------------------------------------

const CircleShapeSchema = z.object({
  type: z.literal('circle'),
  /** Poloměr [m]. */
  r: z.number().positive(),
  offset: Vec2Schema.default({ x: 0, y: 0 }),
});

const BoxShapeSchema = z.object({
  type: z.literal('box'),
  /** Poloviční šířka [m]. */
  hw: z.number().positive(),
  /** Poloviční výška [m]. */
  hh: z.number().positive(),
  offset: Vec2Schema.default({ x: 0, y: 0 }),
  /** Natočení tvaru vůči tělesu [rad]. */
  angle: z.number().default(0),
});

/**
 * Obecný (i konkávní) polygon — obrys v lokálních souřadnicích, těžiště
 * by mělo ležet v počátku tělesa (zajišťuje nástroj). Konvexní dekompozice
 * na collidery probíhá až při stavbě enginu (rigid/geometry.ts).
 */
const PolygonShapeSchema = z.object({
  type: z.literal('polygon'),
  points: z.array(Vec2Schema).min(3),
});

/**
 * Nekonečná podlaha/stěna. Povrch prochází počátkem tělesa, normála míří
 * v lokálním +y (natočení řeší transform tělesa). Vždy patří statickému tělesu.
 */
const PlaneShapeSchema = z.object({
  type: z.literal('plane'),
});

export const ShapeSchema = z.discriminatedUnion('type', [
  CircleShapeSchema,
  BoxShapeSchema,
  PolygonShapeSchema,
  PlaneShapeSchema,
]);

// ---------------------------------------------------------------------------
// Materiál a vzhled
// ---------------------------------------------------------------------------

export const MaterialSchema = z.object({
  /** Plošná hustota [kg/m²] — viz hlavička souboru. */
  density: z.number().positive().max(100_000).default(1000),
  /** Koeficient tření (0 = led … ~1+ = guma). */
  friction: z.number().min(0).max(5).default(0.5),
  /** Restituce (0 = plastický ráz, 1 = dokonale pružný). */
  restitution: z.number().min(0).max(1).default(0.3),
});

export const AppearanceSchema = z.object({
  /** Barva výplně (CSS hex). */
  fill: z.string().default('#60a5fa'),
  stroke: z.string().optional(),
  /** Kreslit šipku rychlosti tohoto tělesa. */
  showVelocity: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Entity: tělesa a klouby (discriminated union na `kind`)
// ---------------------------------------------------------------------------

export const BodySchema = z.object({
  kind: z.literal('body'),
  id: z.string().min(1),
  name: z.string().optional(),
  bodyType: z.enum(['dynamic', 'static', 'kinematic']).default('dynamic'),
  transform: z.object({
    x: z.number(),
    y: z.number(),
    angle: z.number().default(0),
  }),
  velocity: z
    .object({
      vx: z.number(),
      vy: z.number(),
      omega: z.number(),
    })
    .default({ vx: 0, vy: 0, omega: 0 }),
  /** Složené těleso = více tvarů. */
  shapes: z.array(ShapeSchema).min(1),
  material: MaterialSchema.default({ density: 1000, friction: 0.5, restitution: 0.3 }),
  appearance: AppearanceSchema.default({ fill: '#60a5fa', showVelocity: false }),
});

export const MotorSchema = z.object({
  enabled: z.boolean().default(false),
  /** Cílová úhlová rychlost [rad/s]. */
  targetVelocity: z.number().default(5),
  /**
   * Maximální točivý moment [N·m]. Motor je regulátor s poctivou saturací;
   * reakční moment působí na druhé těleso (akce a reakce!).
   */
  maxTorque: z.number().positive().max(1_000_000).default(50),
});

export const JointSchema = z.object({
  kind: z.literal('joint'),
  id: z.string().min(1),
  name: z.string().optional(),
  type: z.enum(['axle', 'spring', 'fixed']),
  /** null = ukotvení ke světu; anchorA je pak ve SVĚTOVÝCH souřadnicích. */
  bodyA: z.string().nullable().default(null),
  bodyB: z.string().min(1),
  /** Kotva v lokálních souřadnicích tělesa A (či světová, je-li bodyA null). */
  anchorA: Vec2Schema,
  /** Kotva v lokálních souřadnicích tělesa B. */
  anchorB: Vec2Schema,
  /** Jen pro type==='axle'. */
  axle: MotorSchema.optional(),
  /** Jen pro type==='spring'. */
  spring: z
    .object({
      /** Klidová délka [m]. */
      restLength: z.number().min(0).default(0.5),
      /** Tuhost [N/m]. */
      stiffness: z.number().positive().default(100),
      /** Tlumení [N·s/m]. */
      damping: z.number().min(0).default(1),
    })
    .optional(),
});

/**
 * Virtuální měřicí přístroj. Fotobrána: paprsek podél lokální osy y
 * (±halfLength od středu), hlásí sub-tick časy vstupu/výstupu těles.
 */
export const InstrumentSchema = z.object({
  kind: z.literal('instrument'),
  id: z.string().min(1),
  name: z.string().optional(),
  type: z.enum(['photogate']),
  transform: z.object({
    x: z.number(),
    y: z.number(),
    angle: z.number().default(0),
  }),
  /** Jen pro type==='photogate'. */
  gate: z
    .object({
      /** Polodélka paprsku [m]. */
      halfLength: z.number().positive().default(0.5),
    })
    .default({ halfLength: 0.5 }),
});

export const EntitySchema = z.discriminatedUnion('kind', [
  BodySchema,
  JointSchema,
  InstrumentSchema,
]);

// ---------------------------------------------------------------------------
// Dokument
// ---------------------------------------------------------------------------

export const SceneDocSchema = z.object({
  format: z.literal('fyzlab-scene'),
  version: z.literal(1),
  meta: z.object({
    id: z.string().min(1),
    title: z.string().default(''),
  }),
  world: z.object({
    /** [m/s²]; výchozí zemská tíže, y-up. */
    gravity: Vec2Schema.default({ x: 0, y: -9.81 }),
    /** Hustota okolního vzduchu [kg/m³]; 0 = vakuum. Síly až ve fázi 2. */
    airDensity: z.number().min(0).max(100).default(0),
    /** Frekvence fixního kroku simulace [Hz]. */
    tickHz: z.number().int().min(30).max(480).default(120),
  }),
  camera: z.object({
    center: Vec2Schema,
    /** Kolik metrů světa se vejde na výšku obrazovky. */
    metersPerScreenH: z.number().positive(),
  }),
  /** Pořadí v poli = z-pořadí vykreslení; tělesa i klouby dohromady. */
  entities: z.array(EntitySchema),
  /** Volitelná lekce s předpovědí (F2-E). */
  lesson: LessonSchema.optional(),
});

export type Shape = z.infer<typeof ShapeSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Appearance = z.infer<typeof AppearanceSchema>;
export type Body = z.infer<typeof BodySchema>;
export type Joint = z.infer<typeof JointSchema>;
export type Motor = z.infer<typeof MotorSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type SceneDoc = z.infer<typeof SceneDocSchema>;

/** Vstupní (volnější) typ pro literály před parse/normalizací. */
export type SceneDocInput = z.input<typeof SceneDocSchema>;
export type EntityInput = z.input<typeof EntitySchema>;

export function parseSceneDoc(input: unknown): SceneDoc {
  return SceneDocSchema.parse(input);
}

/** Index entity v poli podle id (−1 = není). */
export function entityIndex(doc: SceneDoc, id: string): number {
  return doc.entities.findIndex((e) => e.id === id);
}

/** Pořadí tělesa mezi tělesy (= index ve snapshot bufferu), −1 = není. */
export function bodyIndexOf(doc: SceneDoc, id: string): number {
  let bi = 0;
  for (const e of doc.entities) {
    if (e.kind !== 'body') continue;
    if (e.id === id) return bi;
    bi += 1;
  }
  return -1;
}
