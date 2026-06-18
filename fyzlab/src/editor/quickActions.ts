/**
 * Rychlé akce radiálního menu nad výběrem: duplikace a zmrazení/uvolnění.
 * (Smazat = cmdRemoveEntities, zrcadlit = EditorClipboard.mirror.)
 */
import type { Vec2 } from '@engine/core/math';
import type { Body, SceneDoc } from '@engine/scene/schema';
import { EditorClipboard } from './clipboard';
import type { Command, DocumentStore } from './DocumentStore';
import type { EditorState } from './editorState';

/** Duplikuje výběr s offsetem; vlastní schránka, ať uživateli nic nepřepíše. */
export function duplicateSelection(
  store: DocumentStore,
  state: EditorState,
  offset: Vec2,
): void {
  const scratch = new EditorClipboard();
  if (!scratch.copy(store.doc, state.selection)) return;
  scratch.paste(store, state, offset);
}

function isPlaneBody(b: Body): boolean {
  return b.shapes.some((s) => s.type === 'plane');
}

/** Tělesa výběru, která jde zmrazit/uvolnit (roviny jsou statické vždy). */
export function freezableBodies(doc: SceneDoc, ids: ReadonlySet<string>): Body[] {
  const out: Body[] = [];
  for (const e of doc.entities) {
    if (e.kind === 'body' && ids.has(e.id) && !isPlaneBody(e)) out.push(e);
  }
  return out;
}

/**
 * Zmrazí (dynamic → static, vynuluje rychlost), nebo uvolní (static →
 * dynamic) celý výběr. Směr určuje většinové pravidlo: je-li ve výběru
 * aspoň jedno dynamické, zmrazí se vše; jinak se vše uvolní.
 */
export function cmdToggleFrozen(doc: SceneDoc, ids: ReadonlySet<string>): Command | null {
  const bodies = freezableBodies(doc, ids);
  if (bodies.length === 0) return null;
  const freeze = bodies.some((b) => b.bodyType === 'dynamic');

  const changed = bodies.filter((b) =>
    freeze ? b.bodyType === 'dynamic' : b.bodyType === 'static',
  );
  if (changed.length === 0) return null;

  return {
    label: freeze ? 'Zmrazit' : 'Uvolnit',
    do: changed.map((b) => ({
      op: 'replaceEntity' as const,
      entity: freeze
        ? { ...b, bodyType: 'static' as const, velocity: { vx: 0, vy: 0, omega: 0 } }
        : { ...b, bodyType: 'dynamic' as const },
    })),
    undo: changed.map((b) => ({ op: 'replaceEntity' as const, entity: b })),
  };
}
