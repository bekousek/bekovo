import type { SpriteKey } from '../../pixel/sprites';

export type QuestionCategory = 'hw' | 'os' | 'net' | 'sec' | 'data';

export interface Question {
  id: string;
  cat: QuestionCategory;
  text: string;
  /** Správná odpověď je vždy první; ve hře se pořadí míchá. */
  options: [string, string, string, string];
  explain: string;
  img?: SpriteKey;
}

/** Zápis otázky: správná odpověď první, pak tři špatné. */
export function q(
  cat: QuestionCategory,
  n: number,
  text: string,
  options: [string, string, string, string],
  explain: string,
  img?: SpriteKey,
): Question {
  return { id: `${cat}-${String(n).padStart(2, '0')}`, cat, text, options, explain, img };
}
