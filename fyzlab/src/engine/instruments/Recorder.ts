/**
 * Recorder — lehký sampler veličin vybraného tělesa, ~10 Hz decimace.
 * Headless: žádný DOM, Pixi ani React. Tiká po rigidu (čte čerstvé pózy).
 */
import type { BodyState, TickCtx } from '../core/SimModule';

/** Počet fyzikálních tiků (120 Hz) mezi dvěma vzorky → ~10 Hz. */
export const RECORD_EVERY = 12;

/** Jeden datový vzorek: poloha + rychlost tělesa. */
export interface PlotSample {
  /** Simulační čas odpovídající stavu tělesa [s]. */
  t: number;
  x: number;
  y: number;
  /** Absolutní hodnota rychlosti [m/s]. */
  speed: number;
}

export type BodyStateSource = (id: string) => BodyState | null;

/** Vzorkuje těleso každých RECORD_EVERY tiků; buffer drainuje worker. */
export class Recorder {
  targetBodyId: string | null = null;
  private buffer: PlotSample[] = [];

  tick(ctx: TickCtx, getState: BodyStateSource): void {
    if (!this.targetBodyId) return;
    if (ctx.tickIndex % RECORD_EVERY !== 0) return;
    const s = getState(this.targetBodyId);
    if (!s) return;
    // simTime je začátek ticku; rigid.tick proběhl, tělo je o dt napřed
    this.buffer.push({
      t: ctx.simTime + ctx.dt,
      x: s.x,
      y: s.y,
      speed: Math.hypot(s.vx, s.vy),
    });
  }

  drainSamples(): PlotSample[] {
    if (this.buffer.length === 0) return this.buffer;
    const out = this.buffer;
    this.buffer = [];
    return out;
  }

  reset(): void {
    this.buffer = [];
    this.targetBodyId = null;
  }

  dispose(): void {
    this.buffer = [];
    this.targetBodyId = null;
  }
}
