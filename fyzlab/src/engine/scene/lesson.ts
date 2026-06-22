/**
 * Schéma lekce (F2-E Predikce) — volitelné rozšíření scény.
 *
 * Lekce přidává do scény otázku + typ předpovědi, které student vyplní
 * před spuštěním simulace. Vyhodnocení (overlay + zpětná vazba) přijde
 * v druhé půlce F2-E. Zde je jen datový kontrakt.
 *
 * Headless — žádný DOM/React. Závislost: jen zod + typy z tohoto souboru.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Typy předpovědi
// ---------------------------------------------------------------------------

/**
 * Student zadá číslo a výsledek se porovná s měřenou hodnotou simulace.
 * `quantity` určuje, co se měří na tělese `targetBodyId`.
 */
const NumericPredictionSchema = z.object({
  kind: z.literal('numeric'),
  /** Id tělesa, jehož veličina se sleduje při vyhodnocení. */
  targetBodyId: z.string().min(1),
  /** Sledovaná veličina. */
  quantity: z.enum(['landing-x', 'landing-y', 'max-speed', 'max-height']),
  /** Relativní tolerance úspěchu (0,10 = ±10 %). */
  tolerance: z.number().positive().max(1).default(0.1),
  /** Fyzikální jednotka pro zobrazení (informativní). */
  unit: z.string().default('m'),
});

/** Student vybere jednu z N možností; správná je označena `correctId`. */
const ChoicePredictionSchema = z.object({
  kind: z.literal('choice'),
  choices: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(2),
  /** `id` správné odpovědi z pole `choices`. */
  correctId: z.string().min(1),
});

export const PredictionSchema = z.discriminatedUnion('kind', [
  NumericPredictionSchema,
  ChoicePredictionSchema,
]);

// ---------------------------------------------------------------------------
// Lekce
// ---------------------------------------------------------------------------

export const LessonSchema = z.object({
  /** Otázka zobrazená studentovi před spuštěním simulace. */
  question: z.string().min(1),
  prediction: PredictionSchema,
  /** Nápověda (zobrazí se na vyžádání). */
  hint: z.string().optional(),
  /** Obtížnost pro filtraci v knihovně scén. */
  level: z.enum(['základní', 'střední', 'pokročilý']).optional(),
});

export type NumericPrediction = z.infer<typeof NumericPredictionSchema>;
export type ChoicePrediction = z.infer<typeof ChoicePredictionSchema>;
export type Prediction = z.infer<typeof PredictionSchema>;
export type Lesson = z.infer<typeof LessonSchema>;

export type LessonInput = z.input<typeof LessonSchema>;

export function parseLesson(input: unknown): Lesson {
  return LessonSchema.parse(input);
}
