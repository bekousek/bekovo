/**
 * Zachování energie: míč s restitucí e = 1 na dokonale pružné podlaze.
 * Vrcholy odrazů (≡ celková energie) se hledají jako průchody vy nulou
 * shora (sub-tick).
 *
 * ZNÁMÁ MEZ (Rapier 0.19 TGS-soft): restituce vrací systematicky ~100,4 %
 * dopadové rychlosti → energie ROSTE ~+0,4 %/odraz, tj. +2,6 % za 10 s
 * (7 odrazů z 1,9 m). Změřeno: nezávisí na tickHz (120 ≈ 240) ani na počtu
 * PGS iterací; všechny laditelné parametry to zhoršují (natural_frequency
 * 15 Hz → +6,3 %, 120 Hz → +5,5 %, numSolverIterations 8 → +8 %, soft-CCD
 * odraz zabije úplně). Výchozí konfigurace je optimum. Tolerance proto 4 %
 * místo plánovaných 2 %; náprava = vlastní restituce přes contact eventy
 * (kandidát pro fázi 2) nebo oprava v Rapieru. Tenhle test je kanárek —
 * při upgradu Rapieru ukáže, jestli se pumpa zlepšila.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { crossingTimes, makeScene, sampleRun, type Sample } from './helpers';

describe('drift energie', () => {
  it('výška odrazů se za 10 s nezmění o víc než 4 % (viz mez v hlavičce)', async () => {
    const r = 0.1;
    const h0 = 2;
    const engine = await Engine.create(
      makeScene(
        'energy',
        [
          {
            kind: 'body',
            id: 'floor',
            bodyType: 'static',
            transform: { x: 0, y: 0 },
            shapes: [{ type: 'plane' }],
            material: { density: 1000, friction: 0, restitution: 1 },
          },
          {
            kind: 'body',
            id: 'ball',
            transform: { x: 0, y: h0 },
            shapes: [{ type: 'circle', r }],
            material: { density: 1000, friction: 0, restitution: 1 },
          },
        ],
        { gravity: { x: 0, y: -9.81 } },
      ),
    );

    const samples = sampleRun(engine, 'ball', 10 * 120);

    // Výška ve vrcholu: y interpolované v časech, kdy vy prochází nulou dolů.
    const apexTimes = crossingTimes(samples, (s) => s.vy, 0, -1);
    const yAt = (t: number): number => {
      const i = samples.findIndex((s) => s.t >= t);
      const a: Sample = samples[Math.max(0, i - 1)]!;
      const b: Sample = samples[i]!;
      const f = (t - a.t) / (b.t - a.t || 1);
      return a.y + (b.y - a.y) * f;
    };
    // První vrchol po prvním dopadu vs. poslední vrchol v okně.
    const apexes = apexTimes.filter((t) => t > 0.8).map(yAt);
    expect(apexes.length).toBeGreaterThan(5);

    const first = apexes[0]! - r;
    const last = apexes.at(-1)! - r;
    expect(Math.abs(last - first) / first).toBeLessThan(0.04);

    engine.dispose();
  });
});
