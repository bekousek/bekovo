/**
 * Optické nástroje (F3-C).
 * LaserTool: ťuknutí umístí laser (typ 'laser', λ=550 nm, míří vpravo).
 * Zdroj je ukotvený ve světě; směr se ladí úhlem v panelu vlastností.
 * (Dřív se laser při ťuknutí na těleso „přichytil" a jeho poloha se pak
 * počítala jako lokální vůči tělesu — jenže se do ní ukládaly světové
 * souřadnice, takže paprsek vyskočil na náhodné místo. Proto ukotvení
 * ke světu.)
 */
import type { Vec2 } from '@engine/core/math';
import type { OpticalSource } from '@engine/scene/schema';
import { cmdAddEntity } from '../commands';
import { newEntityId } from '../newId';
import { TapTool } from './JointTools';

export class LaserTool extends TapTool {
  readonly id = 'laser';

  protected onTap(p: Vec2): void {
    const ctx = this.ctx;
    const at = ctx.snap.point(p);

    const source: OpticalSource = {
      kind: 'opticalSource',
      id: newEntityId(ctx.store.doc, 'opt'),
      name: 'Laser',
      type: 'laser',
      transform: { x: at.x, y: at.y, angle: 0 },
      wavelength: 550,
      power: 1,
      rayCount: 1,
      beamWidth: 0.1,
      parentId: null,
    };
    ctx.store.apply(cmdAddEntity('Přidat laser', source));
    ctx.state.setSelection([source.id]);
  }
}
