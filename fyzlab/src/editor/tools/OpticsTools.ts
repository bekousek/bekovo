/**
 * Optické nástroje (F3-C).
 * LaserTool: ťuknutí umístí laser (typ 'laser', λ=550 nm, míří vpravo).
 * Pokud ťukneš na těleso, laser se k němu přichytí (parentId).
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
    // Přichytit na těleso pod kurzorem (parentId).
    const bodyUnder = ctx.hitTestAll(p)[0] ?? null;

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
      parentId: bodyUnder,
    };
    ctx.store.apply(cmdAddEntity('Přidat laser', source));
    ctx.state.setSelection([source.id]);
  }
}
