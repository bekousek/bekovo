/**
 * Ambientní vzduch — vztlak (Archimedes v plynu) + kvadratický odpor.
 *
 * Zjednodušený 2D model pro výuku:
 *  - vztlak: F = −ρ_vzduch · A · g (proti tíhovému poli, v ploše těžiště;
 *    helium ρ=0,17 < vzduch 1,2 → balónek stoupá),
 *  - odpor: F = ½ · ρ · C_d · d · v² proti pohybu, kde d je průměr kruhu
 *    o stejné ploše (žádná projekce průřezu podle natočení — záměrně
 *    jednoduché a předvídatelné pro výpočty žáků).
 *
 * Konstanty exportované kvůli accuracy testům (terminální rychlost).
 */

/** Součinitel odporu — koule/válec napříč (řádově realistická hodnota). */
export const DRAG_CD = 0.47;

/** Průměr kruhu o stejné ploše [m] — charakteristický rozměr pro odpor. */
export function effectiveDiameter(area: number): number {
  return 2 * Math.sqrt(area / Math.PI);
}

/** Analytická terminální rychlost pádu/stoupání [m/s] (pro testy a scény). */
export function terminalVelocity(
  mass: number,
  area: number,
  airDensity: number,
  g: number,
): number {
  const net = Math.abs(mass * g - airDensity * area * g); // tíha − vztlak
  return Math.sqrt((2 * net) / (airDensity * DRAG_CD * effectiveDiameter(area)));
}
