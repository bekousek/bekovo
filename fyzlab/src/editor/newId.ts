import type { SceneDoc } from '@engine/scene/schema';

/** Nejnižší volné id s daným prefixem (b3, j7…). Stabilní a čitelné v JSON. */
export function newEntityId(doc: SceneDoc, prefix: string): string {
  const used = new Set(doc.entities.map((e) => e.id));
  let n = 1;
  while (used.has(`${prefix}${n}`)) n += 1;
  return `${prefix}${n}`;
}
