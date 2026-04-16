/**
 * Subtopics that have an interactive applet at
 * `/applety/{topicId}/{subtopicId}/index.html` (inside `public/`).
 *
 * Update this list when you add a new applet subdirectory under
 * `public/applety/`. The SubtopicNav tab and the overview grid card
 * for "Applet" are rendered only for subtopics listed here.
 */
export const APPLET_SUBTOPIC_IDS: ReadonlySet<string> = new Set([
  'spalovaci-motory',
  'parni-stroj',
  'proudovy-raketovy-motor',
]);

export function hasApplet(subtopicId: string): boolean {
  return APPLET_SUBTOPIC_IDS.has(subtopicId);
}
