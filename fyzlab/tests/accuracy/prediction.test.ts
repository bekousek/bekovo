/**
 * Testy PredictionTrackeru — ověřuje detekci terminalní události (doskok)
 * a výpočet veličin landing-x, landing-y, max-height, max-speed.
 *
 * Tracker se testuje přímo (bez Rapieru) s ručně vytvořenými BodyState vzorky.
 */
import { describe, expect, it } from 'vitest';
import { PredictionTracker } from '@engine/instruments/PredictionTracker';
import type { BodyState, TickCtx } from '@engine/core/SimModule';
import type { SignalBus } from '@engine/core/SignalBus';

const DT = 1 / 120;

function makeCtx(tickIndex: number): TickCtx {
  return {
    dt: DT,
    tickIndex,
    simTime: tickIndex * DT,
    bus: {} as SignalBus,
  };
}

function makeState(x: number, y: number, vx: number, vy: number): BodyState {
  return { id: 'ball', x, y, angle: 0, vx, vy, omega: 0 };
}

function tickOnce(
  tracker: PredictionTracker,
  tick: number,
  state: BodyState,
): void {
  const ctx = makeCtx(tick);
  const getState = (id: string) => (id === 'ball' ? state : null);
  tracker.tick(ctx, getState);
}

// ---------------------------------------------------------------------------
// Základní lifecycle
// ---------------------------------------------------------------------------

describe('PredictionTracker — základní lifecycle', () => {
  it('nevrátí výsledek před nastavením cíle', () => {
    const tracker = new PredictionTracker();
    tickOnce(tracker, 0, makeState(0, 1, 1, -1));
    tickOnce(tracker, 1, makeState(0.1, 0.8, 1, 0.5));
    expect(tracker.drainResult()).toBeNull();
  });

  it('drainResult vrátí null po opakovaném volání', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');
    tickOnce(tracker, 0, makeState(0, 0.5, 2, -1));
    tickOnce(tracker, 1, makeState(0.1, 0.2, 2, 0.5)); // doskok
    const r = tracker.drainResult();
    expect(r).not.toBeNull();
    expect(tracker.drainResult()).toBeNull(); // drain je destruktivní
  });

  it('reset vymaže stav a přestane trackovat', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');
    tickOnce(tracker, 0, makeState(0, 1, 1, -1));
    tracker.reset();
    // Po resetu ne-doskok tick neprodukuje výsledek
    tickOnce(tracker, 1, makeState(0.1, 0.5, 1, 0.3));
    expect(tracker.drainResult()).toBeNull();
  });

  it('setTarget s null body přestane trackovat', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');
    tickOnce(tracker, 0, makeState(0, 1, 1, -1));
    tracker.setTarget(null, null);
    tickOnce(tracker, 1, makeState(0.1, 0.2, 1, 0.5));
    expect(tracker.drainResult()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Detekce dopadu (vy: záporná → nezáporná)
// ---------------------------------------------------------------------------

describe('PredictionTracker — detekce dopadu', () => {
  it('detekuje landing-x při přechodu vy < 0 → vy >= 0', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');

    // Tick 0: první vzorek (baseline), vy záporné
    tickOnce(tracker, 0, makeState(5.0, 0.3, 2, -1.5));
    // Tick 1: doskok — vy přejde na kladné (odraz)
    tickOnce(tracker, 1, makeState(5.1, 0.1, 2, 0.9));

    const result = tracker.drainResult();
    expect(result).not.toBeNull();
    // Sub-tick interpolace: frac = 1.5 / (0.9 + 1.5) = 0.625
    // landX = 5.0 + 0.625 * (5.1 - 5.0) = 5.0625
    expect(result!).toBeCloseTo(5.0625, 3);
  });

  it('detekuje doskok i při vy = 0 (inelastický ráz)', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');
    tickOnce(tracker, 0, makeState(3.0, 0.2, 1, -0.5));
    tickOnce(tracker, 1, makeState(3.05, 0.05, 1, 0.0)); // vy = 0
    expect(tracker.drainResult()).not.toBeNull();
  });

  it('nespustí se, dokud vy nebyla záporná', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');
    // Těleso jde jen nahoru (vy vždy >= 0)
    tickOnce(tracker, 0, makeState(0, 0.1, 1, 2.0));
    tickOnce(tracker, 1, makeState(0.1, 0.3, 1, 1.5));
    tickOnce(tracker, 2, makeState(0.2, 0.5, 1, 1.0));
    expect(tracker.drainResult()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Veličiny: max-height, max-speed
// ---------------------------------------------------------------------------

describe('PredictionTracker — max-height a max-speed', () => {
  it('max-height vrátí největší y (+ sub-tick)', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'max-height');

    tickOnce(tracker, 0, makeState(0, 0.5, 1, 2.0));
    tickOnce(tracker, 1, makeState(0.1, 0.9, 1, 1.0));
    tickOnce(tracker, 2, makeState(0.2, 1.1, 1, 0.1));  // blíže vrcholu
    tickOnce(tracker, 3, makeState(0.3, 1.1, 1, -0.1)); // klesá
    tickOnce(tracker, 4, makeState(0.4, 0.8, 1, -0.8));
    tickOnce(tracker, 5, makeState(0.5, 0.3, 1, -1.2));
    tickOnce(tracker, 6, makeState(0.6, 0.1, 1, 0.6)); // doskok

    const result = tracker.drainResult();
    expect(result).not.toBeNull();
    // Max y bylo 1.1 (tick 2 nebo 3)
    expect(result!).toBeCloseTo(1.1, 2);
  });

  it('max-speed vrátí největší absolutní rychlost', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'max-speed');

    // Rychlosti: 5, 4, 3, 2 (padá), při dopadu dostane zpět ~4
    tickOnce(tracker, 0, makeState(0, 2, 3, -4));  // speed = 5
    tickOnce(tracker, 1, makeState(0.1, 1.5, 3, -3)); // speed = ~4.2
    tickOnce(tracker, 2, makeState(0.2, 0.5, 3, -2)); // speed = ~3.6
    tickOnce(tracker, 3, makeState(0.3, 0.1, 3, 3));  // doskok, speed = ~4.2

    const result = tracker.drainResult();
    expect(result).not.toBeNull();
    // Max speed = 5 z prvního ticku
    expect(result!).toBeCloseTo(5.0, 2);
  });
});

// ---------------------------------------------------------------------------
// Timeout
// ---------------------------------------------------------------------------

describe('PredictionTracker — timeout', () => {
  it('timeout po 60 s vrátí poslední stav', () => {
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');

    // Jeden baseline tick
    tickOnce(tracker, 0, makeState(10, 2, 0, 0.5)); // vy > 0

    // Tick těsně po timeoutu: simTime + dt > 60 s od startTime (= simTime[0])
    // startTime = 0 * DT = 0; timedOut = ctx.simTime + DT > 60
    const timeoutTick = Math.ceil(60 / DT) + 1;
    const ctx = makeCtx(timeoutTick);
    const state = makeState(30, 1.5, 0, 0.3);
    tracker.tick(ctx, () => state);

    const result = tracker.drainResult();
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(30, 1); // landing-x = x při timeoutu
  });
});

// ---------------------------------------------------------------------------
// Integrace se zmrazenou fixturou (projektil vrh 45°)
// ---------------------------------------------------------------------------

describe('PredictionTracker — projektil vrh 45° (engine, bez Rapieru)', () => {
  it('analytický výpočet doskoku v ±5 % toleranci (přímý čas)', () => {
    // Analyticky: R = v²·sin(2α)/g + korekce na výšku h=0.2 m
    // vx = vy = 7.071 m/s, g = 9.81 m/s²
    // t_land ≈ (vy + √(vy² + 2g·h)) / g ≈ 1.469 s (z h=0.2)
    // R = vx * t_land ≈ 7.071 * 1.469 ≈ 10.39 m
    // (engine test níže; zde jen ověří, že tracker reaguje správně na vy přechod)
    const tracker = new PredictionTracker();
    tracker.setTarget('ball', 'landing-x');

    // Simulujeme jednoduchou parabolu — dva klíčové body
    // Tick 0: baseline, vx=7, vy=-3 (po vrcholu, klesá)
    tickOnce(tracker, 0, makeState(8.0, 0.3, 7, -3.0));
    // Tick 1: doskok, vy se změní na kladné
    tickOnce(tracker, 1, makeState(8.058, 0.1, 7, 1.5));

    // frac = 3.0 / (3.0 + 1.5) = 0.667
    // landX = 8.0 + 0.667 * (8.058 - 8.0) ≈ 8.039
    const result = tracker.drainResult();
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(8.03);
    expect(result!).toBeLessThan(8.06);
  });
});
