/**
 * PredictionTracker — sleduje číselnou veličinu na tělesu a detekuje
 * terminalní událost: vy přejde ze záporné na nezápornou (doskok/odraz).
 *
 * Headless: žádný DOM, Pixi ani React. Tiká každý fyzikální krok (120 Hz).
 * Sub-tick lineární interpolace pro přesnější landing-x/y (~1 mm při 120 Hz).
 * Timeout 60 s zajistí doručení výsledku i pro tělesa bez jednoznačného dopadu.
 */
import type { BodyState, TickCtx } from '../core/SimModule';
import type { NumericPrediction } from '../scene/lesson';

export type QuantityKind = NumericPrediction['quantity'];

export type PredictionBodyStateSource = (id: string) => BodyState | null;

/** Max simulační čas [s] před vynuceným výsledkem (timeout). */
const TIMEOUT_S = 60;

export class PredictionTracker {
  targetBodyId: string | null = null;
  quantity: QuantityKind | null = null;

  private prevVy: number | null = null;
  private prevX: number | null = null;
  private prevY: number | null = null;
  private maxY = -Infinity;
  private maxSpeed = 0;
  private done = false;
  private result: number | null = null;
  private startTime: number | null = null;

  setTarget(bodyId: string | null, quantity: QuantityKind | null): void {
    this.targetBodyId = bodyId;
    this.quantity = quantity;
    this.reset();
  }

  tick(ctx: TickCtx, getState: PredictionBodyStateSource): void {
    if (this.done || !this.targetBodyId || !this.quantity) return;
    const s = getState(this.targetBodyId);
    if (!s) return;

    if (this.startTime === null) this.startTime = ctx.simTime;

    const speed = Math.hypot(s.vx, s.vy);
    if (speed > this.maxSpeed) this.maxSpeed = speed;
    if (s.y > this.maxY) this.maxY = s.y;

    const prevVy = this.prevVy;
    const prevX = this.prevX;
    const prevY = this.prevY;
    this.prevVy = s.vy;
    this.prevX = s.x;
    this.prevY = s.y;

    if (prevVy === null) return; // první tick — jen uložit stav

    const landed = prevVy < 0 && s.vy >= 0;
    const timedOut =
      this.startTime !== null &&
      ctx.simTime + ctx.dt - this.startTime > TIMEOUT_S;

    if (!landed && !timedOut) return;

    this.done = true;

    // Sub-tick lineární interpolace při dopadu; timeout vrátí aktuální polohu.
    let landX: number;
    let landY: number;
    if (landed) {
      const dVy = s.vy - prevVy;
      const frac = dVy !== 0 ? -prevVy / dVy : 0; // ∈ [0, 1]
      landX = (prevX ?? s.x) + frac * (s.x - (prevX ?? s.x));
      landY = (prevY ?? s.y) + frac * (s.y - (prevY ?? s.y));
    } else {
      landX = s.x;
      landY = s.y;
    }

    switch (this.quantity) {
      case 'landing-x':
        this.result = landX;
        break;
      case 'landing-y':
        this.result = landY;
        break;
      case 'max-height':
        this.result = this.maxY === -Infinity ? s.y : this.maxY;
        break;
      case 'max-speed':
        this.result = this.maxSpeed;
        break;
    }
  }

  /** Vrátí výsledek a smaže ho (volá worker po každé smyčce). Null = ještě ne. */
  drainResult(): number | null {
    if (this.result === null) return null;
    const r = this.result;
    this.result = null;
    return r;
  }

  reset(): void {
    this.prevVy = null;
    this.prevX = null;
    this.prevY = null;
    this.maxY = -Infinity;
    this.maxSpeed = 0;
    this.done = false;
    this.result = null;
    this.startTime = null;
  }

  dispose(): void {
    this.reset();
    this.targetBodyId = null;
    this.quantity = null;
  }
}
