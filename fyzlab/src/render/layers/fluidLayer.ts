/**
 * FluidLayer — vizualizace SPH částic kapaliny (F4).
 *
 * Každá kapalina = sada kruhů ve světových souřadnicích (metrech).
 * Barva a poloměr se čtou z definice kapaliny v dokumentu scény.
 * Vrstva se kreslí do world containeru (y-up; y-flip řeší world.scale).
 */
import { Graphics } from 'pixi.js';
import type { Fluid, SceneDoc } from '@engine/scene/schema';

const ALPHA = 0.8;
/**
 * Vykreslovací poloměr = particleRadius × FILL. Částice se spawnují v mřížce
 * s roztečí 2·particleRadius; kdyby se kreslily poloměrem r, jen by se dotýkaly
 * a mezi nimi zůstaly kosočtvercové díry („objem z půlky prázdný"). Kreslení
 * o něco větším poloměrem sousedy překryje → souvislá kapalina.
 */
const FILL = 1.35;

export class FluidLayer {
  readonly g: Graphics;

  private defs: Map<string, Fluid> = new Map();
  private particles: Map<string, number[]> = new Map();

  constructor() {
    this.g = new Graphics();
  }

  setScene(doc: SceneDoc): void {
    this.defs.clear();
    this.particles.clear();
    for (const e of doc.entities) {
      if (e.kind === 'fluid') this.defs.set(e.id, e);
    }
  }

  update(fluidId: string, xy: number[]): void {
    this.particles.set(fluidId, xy);
  }

  clear(): void {
    this.particles.clear();
    this.g.clear();
  }

  draw(_pixelsPerMeter: number): void {
    this.g.clear();
    for (const [id, xy] of this.particles) {
      const def = this.defs.get(id);
      if (!def || xy.length < 2) continue;
      const color = parseInt(def.color.replace('#', ''), 16);
      const r = def.particleRadius * FILL;
      for (let i = 0; i + 1 < xy.length; i += 2) {
        this.g.circle(xy[i]!, xy[i + 1]!, r).fill({ color, alpha: ALPHA });
      }
    }
  }
}
