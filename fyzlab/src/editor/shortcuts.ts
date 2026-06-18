/** Globální klávesové zkratky: historie, simulace, nástroje, snap, výběr. */
import type { EditorController } from './EditorController';
import type { EditorState } from './editorState';
import type { SnapService } from './snap';
import type { ToolManager } from './tools/ToolManager';

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  return (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    t instanceof HTMLSelectElement ||
    t.isContentEditable
  );
}

export interface ShortcutDeps {
  controller: EditorController;
  tools: ToolManager;
  state: EditorState;
  snap: SnapService;
  /** Promítnutí snap stavu do UI (uiStore). */
  onSnapChange?: (enabled: boolean) => void;
  onDeleteSelection?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onMirror?: () => void;
}

export function installShortcuts(deps: ShortcutDeps): () => void {
  const { controller, tools, state, snap } = deps;

  const onKey = (e: KeyboardEvent) => {
    if (isEditableTarget(e.target)) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      controller.undo();
      return;
    }
    if ((mod && key === 'y') || (mod && key === 'z' && e.shiftKey)) {
      e.preventDefault();
      controller.redo();
      return;
    }
    if (mod && key === 'c') {
      deps.onCopy?.();
      return;
    }
    if (mod && key === 'v') {
      e.preventDefault();
      deps.onPaste?.();
      return;
    }
    if (mod) return;

    if (key === 'm') {
      deps.onMirror?.();
      return;
    }

    if (key === ' ') {
      e.preventDefault();
      controller.toggle();
      return;
    }
    if (e.key === 'Escape') {
      tools.cancelActive();
      tools.setActive('drag');
      state.clearSelection();
      return;
    }
    if (key === 'g') {
      snap.enabled = !snap.enabled;
      deps.onSnapChange?.(snap.enabled);
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deps.onDeleteSelection?.();
      return;
    }
    tools.handleKey(key);
  };

  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
