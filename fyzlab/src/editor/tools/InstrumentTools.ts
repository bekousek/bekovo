/**
 * Nástroje přístrojů. Fotobrána: ťuknutí umístí svislý paprsek (polodélka
 * 0,5 m); úhel a délka se ladí v panelu vlastností.
 */
import type { Vec2 } from '@engine/core/math';
import type { Instrument } from '@engine/scene/schema';
import { cmdAddEntity } from '../commands';
import { newEntityId } from '../newId';
import { TapTool } from './JointTools';

export class PhotogateTool extends TapTool {
  readonly id = 'photogate';

  protected onTap(p: Vec2): void {
    const ctx = this.ctx;
    const at = ctx.snap.point(p);
    const gate: Instrument = {
      kind: 'instrument',
      id: newEntityId(ctx.store.doc, 'i'),
      type: 'photogate',
      transform: { x: at.x, y: at.y, angle: 0 },
      gate: { halfLength: 0.5 },
    };
    ctx.store.apply(cmdAddEntity('Přidat fotobránu', gate));
    ctx.state.setSelection([gate.id]);
  }
}
