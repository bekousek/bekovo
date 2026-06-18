/**
 * Akumulátor fixního kroku. Simulace běží vždy v násobcích `dt`
 * (determinismus); reálný čas se akumuluje a přebytek se přenáší.
 */
export class FixedStepAccumulator {
  private acc = 0;

  constructor(
    /** Délka jednoho ticku v sekundách (např. 1/120). */
    readonly dt: number,
    /** Strop ticků na jedno probuzení — ochrana proti spirále smrti. */
    readonly maxTicksPerAdvance: number,
  ) {}

  /**
   * Přidá uplynulý (již škálovaný rychlostí simulace) čas a vrátí počet
   * ticků k provedení. `dropped: true` znamená, že jsme nestíhali a
   * přebytek byl zahozen (UI ukáže „zpomaleno").
   */
  advance(elapsedSeconds: number): { ticks: number; dropped: boolean } {
    this.acc += elapsedSeconds;
    let ticks = Math.floor(this.acc / this.dt);
    let dropped = false;
    if (ticks > this.maxTicksPerAdvance) {
      ticks = this.maxTicksPerAdvance;
      this.acc = 0; // zahodit backlog, jinak se nikdy nedoženeme
      dropped = true;
    } else {
      this.acc -= ticks * this.dt;
    }
    return { ticks, dropped };
  }

  reset(): void {
    this.acc = 0;
  }

  /** Kolik sekund zbývá do dalšího ticku (pro plánování timeru). */
  get secondsToNextTick(): number {
    return Math.max(0, this.dt - this.acc);
  }
}
