/**
 * DocumentStore — vlastník dokumentu scény na main threadu.
 *
 * Každá editační akce je Command {do, undo} nad DocOps; aplikace commandu
 * aktualizuje lokální doc (stejným čistým reducerem jako engine), pošle
 * patch do workeru a uloží inverz do undo stacku. Undo/redo tak funguje
 * jednotně — i za běhu simulace.
 */
import type { SceneDoc } from '@engine/scene/schema';
import { applyOpsToDoc, type DocOp } from '@engine/scene/ops';

export interface Command {
  /** Český popisek pro UI historie (např. „Přidat kruh"). */
  label: string;
  do: DocOp[];
  undo: DocOp[];
}

export type DocListener = (doc: SceneDoc, ops: readonly DocOp[]) => void;

const MAX_HISTORY = 200;

export class DocumentStore {
  private current: SceneDoc;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private listeners = new Set<DocListener>();

  /** Odeslání ops do simulačního workeru (zapojuje EditorController). */
  onPatch: ((ops: DocOp[]) => void) | null = null;

  constructor(initial: SceneDoc) {
    this.current = initial;
  }

  get doc(): SceneDoc {
    return this.current;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Popisek příští undo akce (pro tooltip). */
  get undoLabel(): string | null {
    return this.undoStack.at(-1)?.label ?? null;
  }

  subscribe(fn: DocListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(ops: readonly DocOp[]): void {
    for (const fn of this.listeners) fn(this.current, ops);
  }

  /**
   * Aplikuje command: doc + patch do workeru + undo stack.
   * @param send false = worker už tento stav má (fold stateSync) — neposílat.
   */
  apply(cmd: Command, { send = true }: { send?: boolean } = {}): void {
    this.current = applyOpsToDoc(this.current, cmd.do);
    this.undoStack.push(cmd);
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
    if (send) this.onPatch?.(cmd.do);
    this.emit(cmd.do);
  }

  /**
   * Transientní změna bez undo záznamu (živé tahání slideru). Volající pak
   * na pointer-up commitne finální Command s undo hodnotou z počátku tahu.
   */
  applyTransient(ops: DocOp[]): void {
    this.current = applyOpsToDoc(this.current, ops);
    this.onPatch?.(ops);
    this.emit(ops);
  }

  undo(): void {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    this.current = applyOpsToDoc(this.current, cmd.undo);
    this.redoStack.push(cmd);
    this.onPatch?.(cmd.undo);
    this.emit(cmd.undo);
  }

  redo(): void {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    this.current = applyOpsToDoc(this.current, cmd.do);
    this.undoStack.push(cmd);
    this.onPatch?.(cmd.do);
    this.emit(cmd.do);
  }

  /**
   * Načtení úplně nové scény (soubor, URL) — maže historii. Patch se
   * NEposílá; volající pošle workeru `loadScene` (plný rebuild).
   */
  resetTo(doc: SceneDoc): void {
    this.current = doc;
    this.undoStack = [];
    this.redoStack = [];
    this.emit([{ op: 'replaceDoc', doc }]);
  }
}
