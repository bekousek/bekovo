/**
 * FBD (free-body diagram) — kontrakt silových vzorků jednoho tělesa.
 * Headless: žádný DOM/Pixi/React (běží ve workeru i ve vitestu).
 *
 * Síly se vzorkují ~10 Hz (stejný rytmus jako Recorder) pro vybrané těleso.
 * Render kreslí šipky z těžiště tělesa; vektory jsou v newtonech (SI).
 */

/** Počet fyzikálních tiků (120 Hz) mezi dvěma silovými vzorky → ~10 Hz. */
export const FBD_EVERY = 12;

/** Druh síly — určuje barvu šipky a popisek v legendě. */
export type FbdForceKind = 'gravity' | 'buoyancy' | 'drag' | 'spring';

/** Jedna složka silového diagramu: vektor síly [N]. */
export interface FbdForce {
  kind: FbdForceKind;
  /** Vektor síly ve světových osách [N]. */
  fx: number;
  fy: number;
}

/** Silový vzorek tělesa v daném simulačním čase. */
export interface FbdSample {
  /** Simulační čas odpovídající stavu [s]. */
  t: number;
  /** Id tělesa, k němuž síly patří. */
  bodyId: string;
  forces: FbdForce[];
}
