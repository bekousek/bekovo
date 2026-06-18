/**
 * Jediný vstupní bod k Rapieru. Výměna buildu (deterministic ↔ simd)
 * znamená změnu jen v tomto souboru.
 *
 * Používáme `-deterministic-compat`: cross-platform determinismus
 * (CI v Node = prohlížeč ve třídě) a WASM vložený v JS (žádné potíže
 * s načítáním ve workeru ani ve vitestu).
 */
import RAPIER from '@dimforge/rapier2d-deterministic-compat';

export type Rapier = typeof RAPIER;

let initPromise: Promise<Rapier> | null = null;

export function initRapier(): Promise<Rapier> {
  initPromise ??= RAPIER.init().then(() => RAPIER);
  return initPromise;
}
