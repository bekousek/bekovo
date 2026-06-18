/**
 * Drží poslední dva snapshoty a vzorkuje mezi nimi podle reálného času
 * příchodu — render tak běží hladce na libovolné obnovovací frekvenci
 * s indukovanou latencí ~1 snapshot interval (≈16 ms, neviditelné).
 */
import { clamp } from '@engine/core/math';

export interface Snapshot {
  seq: number;
  simTime: number;
  topologyVersion: number;
  bodyCount: number;
  bodies: Float32Array;
  buffer: ArrayBuffer;
  arrivalMs: number;
}

export interface Sample {
  prev: Snapshot | null;
  curr: Snapshot;
  /** 0 = prev, 1 = curr. */
  alpha: number;
}

export class Interpolator {
  private prev: Snapshot | null = null;
  private curr: Snapshot | null = null;
  /** EMA reálného intervalu mezi snapshoty [ms]. */
  private intervalMs = 1000 / 60;

  /** Vrátí buffery, které lze vrátit workeru k recyklaci. */
  push(snap: Snapshot): ArrayBuffer[] {
    const released: ArrayBuffer[] = [];

    if (this.curr) {
      const delta = snap.arrivalMs - this.curr.arrivalMs;
      if (delta > 0 && delta < 250) {
        this.intervalMs = this.intervalMs * 0.8 + delta * 0.2;
      }
    }

    if (this.curr && this.curr.topologyVersion !== snap.topologyVersion) {
      // Změna topologie — stará data nejdou interpolovat.
      if (this.prev) released.push(this.prev.buffer);
      released.push(this.curr.buffer);
      this.prev = null;
      this.curr = snap;
      return released;
    }

    if (this.prev) released.push(this.prev.buffer);
    this.prev = this.curr;
    this.curr = snap;
    return released;
  }

  sample(nowMs: number): Sample | null {
    if (!this.curr) return null;
    if (!this.prev || this.curr.simTime <= this.prev.simTime) {
      return { prev: null, curr: this.curr, alpha: 1 };
    }
    const alpha = clamp((nowMs - this.curr.arrivalMs) / this.intervalMs, 0, 1);
    return { prev: this.prev, curr: this.curr, alpha };
  }

  get latest(): Snapshot | null {
    return this.curr;
  }

  clear(): ArrayBuffer[] {
    const released: ArrayBuffer[] = [];
    if (this.prev) released.push(this.prev.buffer);
    if (this.curr) released.push(this.curr.buffer);
    this.prev = null;
    this.curr = null;
    return released;
  }
}
