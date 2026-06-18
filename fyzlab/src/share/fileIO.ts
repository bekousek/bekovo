/**
 * Soubory .fyzlab: čitelný JSON (žák se může podívat dovnitř). Ukládání
 * přes Blob + <a download>, otevírání přes File/drag-drop. Validace a
 * migrace je společná s URL kodekem (migrateSceneDoc).
 */
import { migrateSceneDoc } from '@engine/scene/migrate';
import type { SceneDoc } from '@engine/scene/schema';

export const SCENE_EXTENSION = '.fyzlab';

/** Název souboru z titulku/id scény: „Houpačka na hřišti" → houpacka-na-hristi. */
export function sceneFileName(doc: SceneDoc): string {
  const base = (doc.meta.title || doc.meta.id || 'scena')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diakritika pryč
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'scena'}${SCENE_EXTENSION}`;
}

export function sceneToJson(doc: SceneDoc): string {
  return JSON.stringify(doc, null, 2);
}

/** Parsování textu souboru (JSON → migrace → validace). */
export function readSceneText(text: string): SceneDoc {
  return migrateSceneDoc(JSON.parse(text));
}

export async function readSceneFile(file: File): Promise<SceneDoc> {
  return readSceneText(await file.text());
}

/** Stáhne scénu jako soubor (jen prohlížeč). */
export function downloadScene(doc: SceneDoc): void {
  const blob = new Blob([sceneToJson(doc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sceneFileName(doc);
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Drag-drop scény na element. Vrací uninstall. Chybu hlásí přes onError
 * (uživatel může přetáhnout cokoli).
 */
export function installSceneDrop(
  el: HTMLElement,
  onScene: (doc: SceneDoc) => void,
  onError: (err: unknown) => void,
): () => void {
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    readSceneFile(file).then(onScene, onError);
  };
  el.addEventListener('dragover', onDragOver);
  el.addEventListener('drop', onDrop);
  return () => {
    el.removeEventListener('dragover', onDragOver);
    el.removeEventListener('drop', onDrop);
  };
}
