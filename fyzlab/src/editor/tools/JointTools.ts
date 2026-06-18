/**
 * Nástroje kloubů: osa (otočný čep), pružina, fixace (svár).
 *
 * Ťuknutí spojí nejvrchnější těleso s tělesem pod ním; když je pod bodem
 * jen jedno, přichytí ho k pozadí (světová kotva — Algodoo „background").
 * Pružina se táhne z bodu do bodu, klidová délka = jak byla položena.
 * Funguje i za běhu simulace (live-edit); commit až na pointer-up, takže
 * pinch dvěma prsty gesto zruší bez vedlejších efektů.
 */
import { distance, type Vec2 } from '@engine/core/math';
import { worldToLocal } from '@engine/scene/jointGeom';
import { estimateBodyMass } from '@engine/scene/mass';
import type { Joint } from '@engine/scene/schema';
import { cmdAddEntity } from '../commands';
import { newEntityId } from '../newId';
import type { Tool, ToolContext, ToolPointerEvent } from './Tool';

const TAP_SLOP_PX = 10;

/** Pružina po založení prověsí těleso o ~15 % klidové délky… */
const SPRING_SAG = 0.15;
/** …a tlumí na ~15 % kritického — pár pěkně viditelných kmitů. */
const SPRING_DAMPING_RATIO = 0.15;

/**
 * Výchozí parametry pružiny podle hmotnosti zavěšeného tělesa (Algodoo
 * přístup): pevná tuhost by byla pro stokilová tělesa nit a pro drobky
 * ocelový nosník. Statickému/nehmotnému tělesu dá rozumný základ.
 */
function springDefaults(
  ctx: ToolContext,
  bodyId: string,
  restLength: number,
): { restLength: number; stiffness: number; damping: number } {
  const e = ctx.store.doc.entities.find((x) => x.id === bodyId);
  const m =
    e && e.kind === 'body' && e.bodyType === 'dynamic'
      ? Math.max(estimateBodyMass(e), 0.001)
      : 100;
  const g = ctx.store.doc.world.gravity;
  const gMag = Math.hypot(g.x, g.y) || 9.81; // beztížná scéna → pozemská reference
  const stiffness = (m * gMag) / (SPRING_SAG * Math.max(restLength, 0.3));
  const damping = 2 * SPRING_DAMPING_RATIO * Math.sqrt(stiffness * m);
  return { restLength, stiffness, damping };
}

/** Tap nástroj: commit na pointer-up bez posunu; pinch/Escape = zrušení. */
export abstract class TapTool implements Tool {
  abstract readonly id: string;
  private pid = -1;
  private downAt: Vec2 | null = null;
  private moved = false;

  constructor(protected readonly ctx: ToolContext) {}

  protected abstract onTap(p: Vec2): void;

  pointerDown(e: ToolPointerEvent): void {
    if (this.pid !== -1) return;
    this.pid = e.pointerId;
    this.downAt = e.world;
    this.moved = false;
  }

  pointerMove(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid || !this.downAt) return;
    const px = distance(e.world, this.downAt) * this.ctx.camera.pixelsPerMeter;
    if (px > TAP_SLOP_PX) this.moved = true;
  }

  pointerUp(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid) return;
    const at = this.downAt;
    const moved = this.moved;
    this.reset();
    if (at && !moved) this.onTap(at);
  }

  cancel(): void {
    this.reset();
  }

  private reset(): void {
    this.pid = -1;
    this.downAt = null;
    this.moved = false;
  }
}

/** Dvojice těles pod bodem: [horní, spodní?]; prázdné = nic ke spojení. */
function jointEndpoints(
  ctx: ToolContext,
  p: Vec2,
): { bodyB: string; bodyA: string | null } | null {
  const stack = ctx.hitTestAll(p);
  const bodyB = stack[0];
  if (!bodyB) return null;
  return { bodyB, bodyA: stack[1] ?? null };
}

function addJointCmd(ctx: ToolContext, label: string, joint: Joint): void {
  ctx.store.apply(cmdAddEntity(label, joint));
  ctx.state.setSelection([joint.id]);
}

export class AxleTool extends TapTool {
  readonly id = 'axle';

  protected onTap(p: Vec2): void {
    const ctx = this.ctx;
    const ends = jointEndpoints(ctx, p);
    if (!ends) return;
    const at = ctx.snap.point(p);
    const poseB = ctx.state.poseOf(ends.bodyB);
    const poseA = ends.bodyA ? ctx.state.poseOf(ends.bodyA) : null;
    if (!poseB) return;

    const joint: Joint = {
      kind: 'joint',
      id: newEntityId(ctx.store.doc, 'j'),
      type: 'axle',
      bodyA: poseA ? ends.bodyA : null,
      bodyB: ends.bodyB,
      anchorA: poseA ? worldToLocal(at, poseA) : { x: at.x, y: at.y },
      anchorB: worldToLocal(at, poseB),
      axle: { enabled: false, targetVelocity: 5, maxTorque: 50 },
    };
    addJointCmd(ctx, 'Přidat osu', joint);
  }
}

export class FixTool extends TapTool {
  readonly id = 'fixed';

  protected onTap(p: Vec2): void {
    const ctx = this.ctx;
    const ends = jointEndpoints(ctx, p);
    if (!ends) return;
    const at = ctx.snap.point(p);
    const poseB = ctx.state.poseOf(ends.bodyB);
    const poseA = ends.bodyA ? ctx.state.poseOf(ends.bodyA) : null;
    if (!poseB) return;

    const joint: Joint = {
      kind: 'joint',
      id: newEntityId(ctx.store.doc, 'j'),
      type: 'fixed',
      bodyA: poseA ? ends.bodyA : null,
      bodyB: ends.bodyB,
      anchorA: poseA ? worldToLocal(at, poseA) : { x: at.x, y: at.y },
      anchorB: worldToLocal(at, poseB),
    };
    addJointCmd(ctx, 'Přidat fixaci', joint);
  }
}

export class SpringTool implements Tool {
  readonly id = 'spring';
  private pid = -1;
  /** Počáteční bod (přichycený) + těleso pod ním. */
  private start: Vec2 | null = null;
  private startBody: string | null = null;

  constructor(private readonly ctx: ToolContext) {}

  pointerDown(e: ToolPointerEvent): void {
    if (this.pid !== -1) return;
    this.pid = e.pointerId;
    this.start = this.ctx.snap.point(e.world);
    this.startBody = this.ctx.hitTestAll(e.world)[0] ?? null;
    this.preview(this.start);
  }

  pointerMove(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid || !this.start) return;
    this.preview(this.ctx.snap.point(e.world));
  }

  pointerUp(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pid) return;
    const ctx = this.ctx;
    const a = this.start!;
    const aBody = this.startBody;
    const b = ctx.snap.point(e.world);
    const bBody = ctx.hitTestAll(e.world)[0] ?? null;
    this.reset();

    // Příliš krátký tah = omyl/tap, pružinu nezakládat.
    if (distance(a, b) < ctx.snap.pxToWorld(8)) return;

    // Konec na tělese má přednost být stranou B; volný konec kotví ke světu.
    let bodyB: string | null;
    let bodyA: string | null;
    let pB: Vec2;
    let pA: Vec2;
    if (bBody) {
      bodyB = bBody;
      pB = b;
      bodyA = aBody;
      pA = a;
    } else if (aBody) {
      bodyB = aBody;
      pB = a;
      bodyA = null;
      pA = b;
    } else {
      return; // pružina mezi dvěma body pozadí nemá smysl
    }
    if (bodyA === bodyB) bodyA = null; // tah uvnitř téhož tělesa → ke světu

    const poseB = ctx.state.poseOf(bodyB);
    const poseA = bodyA ? ctx.state.poseOf(bodyA) : null;
    if (!poseB) return;
    if (bodyA && !poseA) bodyA = null;

    const joint: Joint = {
      kind: 'joint',
      id: newEntityId(ctx.store.doc, 'j'),
      type: 'spring',
      bodyA,
      bodyB,
      anchorA: bodyA && poseA ? worldToLocal(pA, poseA) : { x: pA.x, y: pA.y },
      anchorB: worldToLocal(pB, poseB),
      spring: springDefaults(ctx, bodyB, distance(pA, pB)),
    };
    addJointCmd(ctx, 'Přidat pružinu', joint);
  }

  cancel(): void {
    this.reset();
  }

  private preview(to: Vec2): void {
    this.ctx.state.setPreview({ kind: 'line', a: this.start!, b: to });
  }

  private reset(): void {
    this.pid = -1;
    this.start = null;
    this.startBody = null;
    this.ctx.state.setPreview(null);
  }
}
