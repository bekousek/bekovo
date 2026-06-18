/**
 * Klouby v editoru: geometrie kotev, zásobníkový hit-test, nástroje
 * osa/pružina/fixace a vyhledání kloubu pod bodem.
 */
import { describe, expect, it } from 'vitest';
import { jointWorldAnchors, worldToLocal } from '@engine/scene/jointGeom';
import { parseSceneDoc, type Joint, type SceneDoc } from '@engine/scene/schema';
import { Camera } from '@editor/camera';
import { DocumentStore } from '@editor/DocumentStore';
import { EditorState } from '@editor/editorState';
import { findJointAt, makeStackHitTester } from '@editor/hitTest';
import { SnapService } from '@editor/snap';
import { AxleTool, FixTool, SpringTool } from '@editor/tools/JointTools';
import type { Tool, ToolContext, ToolPointerEvent } from '@editor/tools/Tool';
import type { Vec2 } from '@engine/core/math';

/** Podlaha + statický podstavec + prkno přes něj + míč stranou. */
function scene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'joints-test' },
    world: {},
    camera: { center: { x: 0, y: 2 }, metersPerScreenH: 8 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
      },
      {
        kind: 'body',
        id: 'base',
        bodyType: 'static',
        transform: { x: 0, y: 1 },
        shapes: [{ type: 'box', hw: 0.5, hh: 0.5 }],
      },
      {
        kind: 'body',
        id: 'plank',
        transform: { x: 0, y: 1.5 },
        shapes: [{ type: 'box', hw: 1.5, hh: 0.1 }],
      },
      {
        kind: 'body',
        id: 'ball',
        transform: { x: 3, y: 2 },
        shapes: [{ type: 'circle', r: 0.3 }],
      },
    ],
  });
}

function makeCtx(doc: SceneDoc): { ctx: ToolContext; store: DocumentStore; state: EditorState } {
  const store = new DocumentStore(doc);
  const state = new EditorState();
  state.lookupBody = (id) => {
    const e = store.doc.entities.find((x) => x.id === id);
    return e && e.kind === 'body' ? e : null;
  };
  state.lookupJoint = (id) => {
    const e = store.doc.entities.find((x) => x.id === id);
    return e && e.kind === 'joint' ? e : null;
  };
  // lookupPose zůstává null → poseOf padá na transform z dokumentu.

  const camera = new Camera({ x: 0, y: 2 }, 8); // výchozí 100 px/m
  const snap = new SnapService(camera);
  snap.enabled = false;

  const ctx: ToolContext = {
    client: null as unknown as ToolContext['client'],
    store,
    state,
    snap,
    camera,
    hitTest: () => null,
    hitTestAll: makeStackHitTester(
      () => store.doc,
      (id) => state.poseOf(id),
    ),
    isRunning: () => false,
  };
  return { ctx, store, state };
}

let pidCounter = 1;
function tap(tool: Tool, world: Vec2): void {
  const pid = pidCounter++;
  const e = (w: Vec2): ToolPointerEvent => ({
    world: w,
    screen: { x: 0, y: 0 },
    pointerId: pid,
    pointerType: 'mouse',
    buttons: 1,
    isPrimary: true,
    shiftKey: false,
  });
  tool.pointerDown(e(world));
  tool.pointerUp(e(world));
}

function drag(tool: Tool, from: Vec2, to: Vec2): void {
  const pid = pidCounter++;
  const e = (w: Vec2): ToolPointerEvent => ({
    world: w,
    screen: { x: 0, y: 0 },
    pointerId: pid,
    pointerType: 'mouse',
    buttons: 1,
    isPrimary: true,
    shiftKey: false,
  });
  tool.pointerDown(e(from));
  tool.pointerMove(e({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }));
  tool.pointerMove(e(to));
  tool.pointerUp(e(to));
}

function joints(store: DocumentStore): Joint[] {
  return store.doc.entities.filter((e): e is Joint => e.kind === 'joint');
}

describe('jointGeom', () => {
  it('worldToLocal a jointWorldAnchors zvládají natočená tělesa', () => {
    const pose = { x: 2, y: 1, angle: Math.PI / 2 };
    const local = worldToLocal({ x: 2, y: 1.5 }, pose);
    expect(local.x).toBeCloseTo(0.5, 10);
    expect(local.y).toBeCloseTo(0, 10);

    const j: Joint = {
      kind: 'joint',
      id: 'j1',
      type: 'axle',
      bodyA: null,
      bodyB: 'b',
      anchorA: { x: -1, y: 4 },
      anchorB: { x: 0.5, y: 0 },
    };
    const anchors = jointWorldAnchors(j, (id) => (id === 'b' ? pose : null))!;
    expect(anchors.b.x).toBeCloseTo(2, 10);
    expect(anchors.b.y).toBeCloseTo(1.5, 10);
    expect(anchors.a).toEqual({ x: -1, y: 4 }); // světová kotva beze změny
  });
});

describe('makeStackHitTester', () => {
  it('vrací tělesa odshora dolů včetně statických, roviny vynechá', () => {
    const { ctx } = makeCtx(scene());
    // (0, 1.45) je uvnitř prkna (1.4–1.6) i podstavce (0.5–1.5).
    expect(ctx.hitTestAll({ x: 0, y: 1.45 })).toEqual(['plank', 'base']);
    // (0, 0.7) jen podstavec; rovina podlahy se nepočítá.
    expect(ctx.hitTestAll({ x: 0, y: 0.7 })).toEqual(['base']);
    expect(ctx.hitTestAll({ x: 5, y: 5 })).toEqual([]);
  });
});

describe('AxleTool', () => {
  it('ťuknutí na dvě tělesa přes sebe je spojí čepem s lokálními kotvami', () => {
    const { ctx, store, state } = makeCtx(scene());
    const tool = new AxleTool(ctx);
    tap(tool, { x: 0, y: 1.45 });

    const all = joints(store);
    expect(all).toHaveLength(1);
    const j = all[0]!;
    expect(j.type).toBe('axle');
    expect(j.bodyB).toBe('plank');
    expect(j.bodyA).toBe('base');
    expect(j.anchorB.y).toBeCloseTo(-0.05, 10); // 1.45 − 1.5
    expect(j.anchorA.y).toBeCloseTo(0.45, 10); // 1.45 − 1.0
    expect(j.axle?.enabled).toBe(false);
    expect(state.selection.has(j.id)).toBe(true);

    store.undo();
    expect(joints(store)).toHaveLength(0);
  });

  it('ťuknutí na samotné těleso ho přichytí k pozadí (světová kotva)', () => {
    const { ctx, store } = makeCtx(scene());
    tap(new AxleTool(ctx), { x: 3.1, y: 2 });

    const j = joints(store)[0]!;
    expect(j.bodyB).toBe('ball');
    expect(j.bodyA).toBeNull();
    expect(j.anchorA).toEqual({ x: 3.1, y: 2 }); // svět
    expect(j.anchorB.x).toBeCloseTo(0.1, 10); // lokálně k míči
  });

  it('tah (posun nad slop) kloub nezaloží — gesto patří pinchi/omylu', () => {
    const { ctx, store } = makeCtx(scene());
    drag(new AxleTool(ctx), { x: 3, y: 2 }, { x: 3, y: 3 });
    expect(joints(store)).toHaveLength(0);
  });

  it('ťuknutí do prázdna nedělá nic', () => {
    const { ctx, store } = makeCtx(scene());
    tap(new AxleTool(ctx), { x: 8, y: 8 });
    expect(joints(store)).toHaveLength(0);
  });
});

describe('SpringTool', () => {
  it('tah z tělesa do prázdna ukotví pružinu ke světu, klidová délka = položená', () => {
    const { ctx, store } = makeCtx(scene());
    drag(new SpringTool(ctx), { x: 3, y: 2 }, { x: 3, y: 4 });

    const j = joints(store)[0]!;
    expect(j.type).toBe('spring');
    expect(j.bodyB).toBe('ball');
    expect(j.bodyA).toBeNull();
    expect(j.anchorA).toEqual({ x: 3, y: 4 }); // volný konec = svět
    expect(j.anchorB.x).toBeCloseTo(0, 10);
    expect(j.spring?.restLength).toBeCloseTo(2, 10);

    // Výchozí tuhost podle hmotnosti: statické protažení ≈ 15 % klidové délky
    // a tlumení ≈ 15 % kritického (viditelné, dohasínající kmity).
    const m = Math.PI * 0.3 * 0.3 * 1000; // míč r=0.3, hustota 1000 kg/m²
    const { stiffness, damping, restLength } = j.spring!;
    expect((m * 9.81) / stiffness / restLength).toBeCloseTo(0.15, 6);
    expect(damping / (2 * Math.sqrt(stiffness * m))).toBeCloseTo(0.15, 6);
  });

  it('tah z tělesa na těleso spojí obě (konec tahu = strana B)', () => {
    const { ctx, store } = makeCtx(scene());
    drag(new SpringTool(ctx), { x: 3, y: 2 }, { x: 0, y: 1.55 });

    const j = joints(store)[0]!;
    expect(j.bodyB).toBe('plank');
    expect(j.bodyA).toBe('ball');
    expect(j.anchorB.y).toBeCloseTo(0.05, 10); // lokálně k prknu
    expect(j.anchorA).toEqual({ x: 0, y: 0 }); // lokálně k míči (střed)
    expect(j.spring?.restLength).toBeCloseTo(Math.hypot(3, 0.45), 10);
    expect(j.spring!.stiffness).toBeGreaterThan(0);
  });

  it('krátký tah (tap) pružinu nezaloží', () => {
    const { ctx, store } = makeCtx(scene());
    drag(new SpringTool(ctx), { x: 3, y: 2 }, { x: 3.02, y: 2 });
    expect(joints(store)).toHaveLength(0);
  });
});

describe('FixTool + findJointAt', () => {
  it('fixace samotného tělesa vede na svár se světem; kloub jde najít pod bodem', () => {
    const { ctx, store, state } = makeCtx(scene());
    tap(new FixTool(ctx), { x: 3, y: 2.1 });

    const j = joints(store)[0]!;
    expect(j.type).toBe('fixed');
    expect(j.bodyA).toBeNull();
    expect(j.spring).toBeUndefined();
    expect(j.axle).toBeUndefined();

    const at = (p: Vec2, tol: number) =>
      findJointAt(store.doc, (id) => state.poseOf(id), p, tol);
    expect(at({ x: 3.05, y: 2.12 }, 0.1)).toBe(j.id);
    expect(at({ x: 4, y: 4 }, 0.1)).toBeNull();
  });
});
