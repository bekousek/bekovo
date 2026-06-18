/**
 * SignalBus — mechanismus mezioborových interakcí.
 *
 * Typovaná mapa (entityId, port) → číslo. Producent zapisuje ve svém kroku
 * ticku, konzument čte buď později v témže ticku (podle závazného pořadí
 * modulů), nebo si hodnotu latchne na začátku dalšího ticku (zpoždění
 * 1 tick = 8 ms je fyzikálně zanedbatelné a drží řešení acyklické).
 *
 * Příklady portů (postupně): 'motor.targetVelocity', 'photocell.fluxW',
 * 'switch.closed', 'bulb.power'.
 */
export class SignalBus {
  private values = new Map<string, number>();

  private static key(entityId: string, port: string): string {
    return `${entityId}:${port}`;
  }

  set(entityId: string, port: string, value: number): void {
    this.values.set(SignalBus.key(entityId, port), value);
  }

  get(entityId: string, port: string, fallback = 0): number {
    return this.values.get(SignalBus.key(entityId, port)) ?? fallback;
  }

  has(entityId: string, port: string): boolean {
    return this.values.has(SignalBus.key(entityId, port));
  }

  clear(): void {
    this.values.clear();
  }
}
