/**
 * OpticsModule — skeleton SimModule pro paprskouvou optiku (F3-A).
 *
 * Fáze 3-A: schéma + math hotové, trasování paprsků přijde v F3-B.
 * Modul je zařazen DO pořadí ticku (za rigid, před instruments), ale
 * zatím nedělá nic — placeholder pro plnou implementaci.
 *
 * Pořadí v ticku (ARCHITECTURE.md):
 *   rigid.applyForces → rigid.step → optics.tick → instruments.tick
 */
import type { BodyState, SimModule, TickCtx } from '../core/SimModule';
import type { SnapshotWriter } from '../snapshot/layout';
import type { OpticalSource, SceneDoc } from '../scene/schema';

export class OpticsModule implements SimModule {
  readonly name = 'optics';

  private sources: OpticalSource[] = [];

  build(doc: SceneDoc): void {
    this.sources = doc.entities.filter(
      (e): e is OpticalSource => e.kind === 'opticalSource',
    );
  }

  addSource(e: OpticalSource): void {
    if (!this.sources.some((s) => s.id === e.id)) this.sources.push(e);
  }

  removeSource(id: string): void {
    this.sources = this.sources.filter((s) => s.id !== id);
  }

  replaceSource(e: OpticalSource): void {
    this.removeSource(e.id);
    this.addSource(e);
  }

  tick(_ctx: TickCtx): void {
    // F3-B: trasovat paprsky pro každý zdroj, zapsat výsledky na SignalBus.
  }

  writeSnapshot(_w: SnapshotWriter): void {
    // F3-B: zapsat paprsky do snapshotu (sloty K×6: ox, oy, dx, dy, λ, I).
  }

  readState(): BodyState[] {
    return [];
  }

  dispose(): void {
    this.sources = [];
  }
}
