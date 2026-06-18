/**
 * EditorController — orchestrace dvou hodin: dokument (editor) vs. živý
 * stav (worker).
 *
 * - Play: zapamatuje si playBaseline (doc v okamžiku spuštění).
 * - Pauza/krok: worker pošle stateSync → fold do docu jako undoable
 *   command „Simulace" (bez zpětného patche — worker ten stav už má).
 * - Reset: pauza (fold) → replaceDoc(playBaseline) jako undoable command.
 */
import type { BodyState } from '@engine/core/SimModule';
import type { SceneDoc } from '@engine/scene/schema';
import type { SimWorkerClient } from '@worker/SimWorkerClient';
import { DocumentStore } from './DocumentStore';
import { cmdReplaceDoc, cmdSimRan } from './commands';

export class EditorController {
  readonly store: DocumentStore;
  private running = false;
  private playBaseline: SceneDoc | null = null;
  private afterNextSync: Array<() => void> = [];

  constructor(
    private readonly client: SimWorkerClient,
    initialDoc: SceneDoc,
  ) {
    this.store = new DocumentStore(initialDoc);
    this.store.onPatch = (ops) => this.client.patch(ops);
  }

  get isRunning(): boolean {
    return this.running;
  }

  // --- Napojení na zprávy z workeru (volá bootstrap) ------------------------

  handleStatus(running: boolean): void {
    this.running = running;
  }

  handleStateSync(states: BodyState[]): void {
    const cmd = cmdSimRan(this.store.doc, states);
    if (cmd) this.store.apply(cmd, { send: false });
    const pending = this.afterNextSync;
    this.afterNextSync = [];
    for (const cb of pending) cb();
  }

  // --- Řízení simulace -------------------------------------------------------

  play(): void {
    if (this.running) return;
    this.playBaseline = this.store.doc;
    this.client.play();
  }

  pause(): void {
    this.client.pause();
  }

  toggle(): void {
    if (this.running) this.pause();
    else this.play();
  }

  step(): void {
    if (this.running) return;
    this.playBaseline ??= this.store.doc;
    this.client.step();
  }

  /**
   * Vrátí scénu do stavu při posledním Spustit. Undoable. Když simulace
   * běží, nejdřív pauza + fold (správné pořadí přes frontu afterNextSync).
   */
  reset(): void {
    const baseline = this.playBaseline;
    if (!baseline) return;
    const doReset = () => {
      if (this.store.doc !== baseline) {
        this.store.apply(cmdReplaceDoc('Reset', this.store.doc, baseline));
      }
    };
    if (this.running) {
      this.afterNextSync.push(doReset);
      this.client.pause();
    } else {
      doReset();
    }
  }

  setSpeed(speed: number): void {
    this.client.setSpeed(speed);
  }

  undo(): void {
    this.store.undo();
  }

  redo(): void {
    this.store.redo();
  }

  /** Načtení nové scény (soubor/URL): plný rebuild workeru + smazat historii. */
  loadScene(doc: SceneDoc): void {
    this.playBaseline = null;
    this.store.resetTo(doc);
    this.client.loadScene(doc);
  }
}
