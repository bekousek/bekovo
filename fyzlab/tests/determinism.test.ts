/**
 * Determinismus: stejná scéna → bit-přesně stejný průběh. Na tom stojí
 * Reset, replaye i důvěryhodnost sdílených experimentů.
 */
import { describe, expect, it } from 'vitest';
import { Engine } from '@engine/Engine';
import { demoScene } from '@engine/scene/defaults';

describe('determinismus', () => {
  it('dva nezávislé běhy téže scény → identický stav (600 ticků)', async () => {
    const a = await Engine.create(demoScene());
    const b = await Engine.create(demoScene());

    for (let i = 0; i < 600; i++) {
      a.tick();
      b.tick();
    }

    expect(Array.from(a.stateArray())).toEqual(Array.from(b.stateArray()));

    a.dispose();
    b.dispose();
  });

  it('reset (load téže scény) → identický stav po stejném počtu ticků', async () => {
    const engine = await Engine.create(demoScene());

    for (let i = 0; i < 300; i++) engine.tick();
    const first = Array.from(engine.stateArray());

    engine.load(demoScene());
    expect(engine.tickIndex).toBe(0);
    for (let i = 0; i < 300; i++) engine.tick();
    const second = Array.from(engine.stateArray());

    expect(second).toEqual(first);

    engine.dispose();
  });

  it('demo scéna se po 5 s ustálí na podlaze (nic nepropadne)', async () => {
    const engine = await Engine.create(demoScene());
    for (let i = 0; i < 600; i++) engine.tick();

    for (const s of engine.readState()) {
      if (s.id === 'ground') continue;
      expect(s.y).toBeGreaterThan(0); // nad podlahou
      expect(s.y).toBeLessThan(10); // nikam neuletělo
      expect(Math.hypot(s.vx, s.vy)).toBeLessThan(1.5); // v klidu / doznívá
    }

    engine.dispose();
  });
});
