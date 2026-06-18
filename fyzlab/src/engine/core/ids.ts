/**
 * Stabilní krátká ID entit + seedovaný RNG.
 * Kód enginu NIKDY nepoužívá Math.random — determinismus je pilíř.
 */

/** Vytvoří generátor unikátních ID vůči existující množině (base36 čítač). */
export function createIdGenerator(existing: Iterable<string> = []): () => string {
  const used = new Set(existing);
  let counter = 0;
  return () => {
    let id: string;
    do {
      id = `e${(counter++).toString(36)}`;
    } while (used.has(id));
    used.add(id);
    return id;
  };
}

/** Deterministický RNG (mulberry32). */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Náhodné číslo v [0, 1). */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}
