/**
 * FluidTool (F4): táhnutím obdélníku vytvoří oblast kapaliny (Fluid entity).
 */
import type { Vec2 } from '@engine/core/math';
import type { Fluid } from '@engine/scene/schema';
import { cmdAddEntity } from '../commands';
import { newEntityId } from '../newId';
import type { Tool, ToolContext, ToolPointerEvent } from './Tool';

const MIN_SIZE = 0.1; // minimální rozměr oblasti [m]

export class FluidTool implements Tool {
  readonly id = 'fluid';
  private pointer = -1;
  private start: Vec2 | null = null;

  constructor(private readonly ctx: ToolContext) {}

  pointerDown(e: ToolPointerEvent): void {
    if (this.pointer !== -1) return;
    this.pointer = e.pointerId;
    this.start = this.ctx.snap.point(e.world);
  }

  pointerMove(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pointer || !this.start) return;
    const cur = this.ctx.snap.point(e.world);
    const s = this.start;
    const cx = (s.x + cur.x) / 2;
    const cy = (s.y + cur.y) / 2;
    const hw = Math.abs(cur.x - s.x) / 2;
    const hh = Math.abs(cur.y - s.y) / 2;
    this.ctx.state.setPreview({ kind: 'box', center: { x: cx, y: cy }, hw, hh, angle: 0, fill: '#60a5fa' });
  }

  pointerUp(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pointer) return;
    const cur = this.ctx.snap.point(e.world);
    const s = this.start!;
    const x = Math.min(s.x, cur.x);
    const y = Math.min(s.y, cur.y);
    const w = Math.abs(cur.x - s.x);
    const h = Math.abs(cur.y - s.y);
    if (w >= MIN_SIZE && h >= MIN_SIZE) {
      const fluid: Fluid = {
        kind: 'fluid',
        id: newEntityId(this.ctx.store.doc, 'fl'),
        restDensity: 1000,
        viscosity: 0.01,
        color: '#60a5fa',
        region: { x, y, width: w, height: h },
        particleRadius: 0.06,
      };
      this.ctx.store.apply(cmdAddEntity('Přidat kapalinu', fluid));
      this.ctx.state.setSelection([fluid.id]);
    }
    this.reset();
  }

  cancel(): void { this.reset(); }

  private reset(): void {
    this.pointer = -1;
    this.start = null;
    this.ctx.state.setPreview(null);
  }
}
