/**
 * Pomocníci přesnostních testů: vzorkování stavu po ticích a sub-tick
 * detekce průchodů (lineární interpolace mezi vzorky) — periody měříme
 * přesněji než po 1/120 s.
 */
import { Engine } from '@engine/Engine';
import { parseSceneDoc, type SceneDoc, type SceneDocInput } from '@engine/scene/schema';

export function makeScene(
  id: string,
  entities: SceneDocInput['entities'],
  world: SceneDocInput['world'] = {},
): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id, title: id },
    world,
    camera: { center: { x: 0, y: 0 }, metersPerScreenH: 10 },
    entities,
  });
}

export interface Sample {
  t: number;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  omega: number;
}

/** Odsimuluje `ticks` kroků a vrací vzorek stavu tělesa po každém ticku. */
export function sampleRun(engine: Engine, bodyId: string, ticks: number): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i < ticks; i++) {
    engine.tick();
    const s = engine.getBodyState(bodyId);
    if (!s) throw new Error(`těleso ${bodyId} zmizelo`);
    out.push({ t: engine.simTime, x: s.x, y: s.y, angle: s.angle, vx: s.vx, vy: s.vy, omega: s.omega });
  }
  return out;
}

/**
 * Časy průchodů veličiny `value` hodnotou `target` (sub-tick, lineární
 * interpolace). `slope` filtruje směr: 1 = zdola nahoru, -1 = shora dolů,
 * 0 = oba.
 */
export function crossingTimes(
  samples: readonly Sample[],
  value: (s: Sample) => number,
  target: number,
  slope: 1 | -1 | 0 = 0,
): number[] {
  const out: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const a = value(samples[i - 1]!) - target;
    const b = value(samples[i]!) - target;
    if (a === 0) continue; // průchod přesně na vzorku zachytí předchozí interval
    if (a < 0 === b < 0) continue;
    const dir = b > a ? 1 : -1;
    if (slope !== 0 && dir !== slope) continue;
    const f = a / (a - b);
    out.push(samples[i - 1]!.t + f * (samples[i]!.t - samples[i - 1]!.t));
  }
  return out;
}

/** Průměrný rozestup po sobě jdoucích hodnot (např. časů průchodů → perioda). */
export function meanSpacing(times: readonly number[]): number {
  if (times.length < 2) throw new Error('málo průchodů na změření periody');
  let acc = 0;
  for (let i = 1; i < times.length; i++) acc += times[i]! - times[i - 1]!;
  return acc / (times.length - 1);
}
