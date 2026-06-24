/**
 * RigidModule — tuhá tělesa a klouby přes Rapier2D. Referenční implementace
 * kontraktu SimModule, včetně inkrementálních změn (DocOp patche).
 *
 * Motor osy je vlastní regulátor: τ = clamp(K·(ω_cíl − ω_rel), ±maxTorque),
 * reakční moment působí na druhé těleso (akce a reakce). Rapier JS totiž
 * limit momentu motoru neexponuje — a poctivá saturace je pro výuku lepší.
 */
import type RAPIER from '@dimforge/rapier2d-deterministic-compat';
import type { Rapier } from './rapier';
import type { SimModule, TickCtx, BodyState } from '../core/SimModule';
import type { SnapshotWriter } from '../snapshot/layout';
import type { SceneDoc, Body, Joint, Shape } from '../scene/schema';
import type { Vec2 } from '../core/math';
import { clamp } from '../core/math';
import type { TransformPatch, VelocityPatch } from '../scene/ops';
import { bodyArea } from '../scene/mass';
import { DRAG_CD, effectiveDiameter } from './air';
import { decomposePolygon } from './geometry';
import { applyDragForce, startDrag, type DragState } from './dragJoint';
import { FBD_EVERY, type FbdForce, type FbdSample } from './fbd';

/** Poloviční rozměry náhradního kvádru za nekonečnou rovinu (fáze 0–1). */
const PLANE_HALF_WIDTH = 2000;
const PLANE_HALF_DEPTH = 100;

/** Pásmo proporcionality regulátoru motoru [rad/s] — pod ním moment klesá lineárně. */
const MOTOR_SOFTNESS = 0.5;

interface CapturedKinematics {
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  omega: number;
}

export class RigidModule implements SimModule {
  readonly name = 'rigid';

  private world: RAPIER.World | null = null;
  /** Skryté statické těleso pro klouby ukotvené ke světu. */
  private worldAnchor: RAPIER.RigidBody | null = null;
  private bodies = new Map<string, RAPIER.RigidBody>();
  /** Pořadí těles = pořadí mezi body-entitami v docu = pořadí ve snapshotu. */
  private order: string[] = [];
  private joints = new Map<string, RAPIER.ImpulseJoint>();
  /** Doc data kloubů (pro motor tick a re-create při výměně tělesa). */
  private jointData = new Map<string, Joint>();
  /** Plocha tvarů těles [m²] — vztlak a odpor vzduchu (cache z dokumentu). */
  private areas = new Map<string, number>();
  private airDensity = 0;
  private drag: DragState | null = null;

  /** Těleso, jehož silový rozklad se vzorkuje pro FBD (F2-D); null = zákaz. */
  private fbdBodyId: string | null = null;
  /** Síly nasbírané během aktuálně vzorkovaného ticku. */
  private fbdForces: FbdForce[] = [];
  /** Poslední dokončený silový vzorek (worker ho drainuje). */
  private fbdSample: FbdSample | null = null;

  constructor(private readonly R: Rapier) {}

  build(doc: SceneDoc): void {
    this.dispose();
    const world = new this.R.World({ x: doc.world.gravity.x, y: doc.world.gravity.y });
    world.timestep = 1 / doc.world.tickHz;
    this.world = world;
    this.airDensity = doc.world.airDensity;
    this.worldAnchor = world.createRigidBody(this.R.RigidBodyDesc.fixed());

    for (const entity of doc.entities) {
      if (entity.kind === 'body') this.createBody(entity);
    }
    // Klouby až po všech tělesech (mohou odkazovat dopředu).
    for (const entity of doc.entities) {
      if (entity.kind === 'joint') this.addJoint(entity);
    }
  }

  // --- Tělesa ---------------------------------------------------------------

  private createBody(b: Body, orderIndex?: number): void {
    const R = this.R;
    const world = this.world!;

    const desc =
      b.bodyType === 'static'
        ? R.RigidBodyDesc.fixed()
        : b.bodyType === 'kinematic'
          ? R.RigidBodyDesc.kinematicVelocityBased()
          : R.RigidBodyDesc.dynamic();

    desc
      .setTranslation(b.transform.x, b.transform.y)
      .setRotation(b.transform.angle)
      .setLinvel(b.velocity.vx, b.velocity.vy)
      .setAngvel(b.velocity.omega);

    if (b.bodyType === 'dynamic') {
      // Spánek vypnout: pomalé kyvadlo (5° → max 0,27 m/s) je celý kyv pod
      // Rapierovým prahem a usnulo by v krajní poloze. CCD + soft-CCD:
      // kontakt rychlého tělesa se řeší u okamžiku dopadu, ne až po průniku
      // — jinak poziční korekce pumpuje energii do odrazů (e=1).
      desc.setCanSleep(false).setCcdEnabled(true);
    }

    const body = world.createRigidBody(desc);

    for (const shape of b.shapes) {
      for (const colDesc of this.colliderDescsFor(shape)) {
        colDesc
          .setDensity(b.material.density)
          .setFriction(b.material.friction)
          .setRestitution(b.material.restitution);
        world.createCollider(colDesc, body);
      }
    }

    this.bodies.set(b.id, body);
    this.areas.set(b.id, bodyArea(b));
    if (orderIndex === undefined) {
      this.order.push(b.id);
    } else {
      this.order.splice(clamp(orderIndex, 0, this.order.length), 0, b.id);
    }
  }

  private colliderDescsFor(shape: Shape): RAPIER.ColliderDesc[] {
    const R = this.R;
    switch (shape.type) {
      case 'circle': {
        const d = R.ColliderDesc.ball(shape.r);
        d.setTranslation(shape.offset.x, shape.offset.y);
        return [d];
      }
      case 'box': {
        const d = R.ColliderDesc.cuboid(shape.hw, shape.hh);
        d.setTranslation(shape.offset.x, shape.offset.y);
        d.setRotation(shape.angle);
        return [d];
      }
      case 'polygon': {
        const out: RAPIER.ColliderDesc[] = [];
        for (const piece of decomposePolygon(shape.points)) {
          const flat = new Float32Array(piece.length * 2);
          piece.forEach((p, i) => {
            flat[i * 2] = p.x;
            flat[i * 2 + 1] = p.y;
          });
          const d = R.ColliderDesc.convexHull(flat);
          if (d) out.push(d);
        }
        return out;
      }
      case 'plane': {
        // Rovina jako velmi široký kvádr s horní hranou v počátku tělesa.
        const d = R.ColliderDesc.cuboid(PLANE_HALF_WIDTH, PLANE_HALF_DEPTH);
        d.setTranslation(0, -PLANE_HALF_DEPTH);
        return [d];
      }
    }
  }

  /** Vloží těleso na dané pořadí mezi tělesy (index ve snapshot bufferu). */
  insertBody(b: Body, bodyIndex: number): void {
    if (this.bodies.has(b.id)) return;
    this.createBody(b, bodyIndex);
  }

  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (!body) return;
    // Defenzivně odpojit klouby vedoucí na toto těleso (editor je má mazat sám).
    for (const j of [...this.jointData.values()]) {
      if (j.bodyA === id || j.bodyB === id) this.removeJoint(j.id);
    }
    if (this.drag?.body === body) this.drag = null;
    this.world!.removeRigidBody(body);
    this.bodies.delete(id);
    this.areas.delete(id);
    const idx = this.order.indexOf(id);
    if (idx >= 0) this.order.splice(idx, 1);
  }

  /**
   * Výměna definice tělesa (tvary/materiál/vzhled…). Za běhu zachovává
   * runtime kinematiku; v pauze přebírá transform/velocity z dokumentu.
   * Klouby vedoucí na těleso se znovu vytvoří proti novému handle.
   */
  replaceBody(entity: Body, preserveKinematics: boolean): void {
    const old = this.bodies.get(entity.id);
    if (!old) return;

    const captured: CapturedKinematics | null = preserveKinematics
      ? {
          x: old.translation().x,
          y: old.translation().y,
          angle: old.rotation(),
          vx: old.linvel().x,
          vy: old.linvel().y,
          omega: old.angvel(),
        }
      : null;

    const affected = [...this.jointData.values()].filter(
      (j) => j.bodyA === entity.id || j.bodyB === entity.id,
    );
    for (const j of affected) this.removeJoint(j.id);

    if (this.drag?.body === old) this.drag = null;
    const idx = this.order.indexOf(entity.id);
    this.world!.removeRigidBody(old);
    this.bodies.delete(entity.id);
    if (idx >= 0) this.order.splice(idx, 1);

    this.createBody(entity, idx >= 0 ? idx : undefined);

    if (captured) {
      const body = this.bodies.get(entity.id)!;
      body.setTranslation({ x: captured.x, y: captured.y }, true);
      body.setRotation(captured.angle, true);
      body.setLinvel({ x: captured.vx, y: captured.vy }, true);
      body.setAngvel(captured.omega, true);
    }

    for (const j of affected) this.addJoint(j);
  }

  /** Aktuální póza tělesa — pro ostatní moduly (instruments). */
  poseOf(id: string): { x: number; y: number; angle: number } | null {
    const body = this.bodies.get(id);
    if (!body) return null;
    const t = body.translation();
    return { x: t.x, y: t.y, angle: body.rotation() };
  }

  /** Plný kinematický stav tělesa — pro recorder (poloha + rychlosti). */
  stateOf(id: string): BodyState | null {
    const body = this.bodies.get(id);
    if (!body) return null;
    const t = body.translation();
    const lv = body.linvel();
    return { id, x: t.x, y: t.y, angle: body.rotation(), vx: lv.x, vy: lv.y, omega: body.angvel() };
  }

  setKinematics(id: string, transform?: TransformPatch, velocity?: VelocityPatch): void {
    const body = this.bodies.get(id);
    if (!body) return;
    if (transform) {
      body.setTranslation({ x: transform.x, y: transform.y }, true);
      body.setRotation(transform.angle, true);
    }
    if (velocity) {
      body.setLinvel({ x: velocity.vx, y: velocity.vy }, true);
      body.setAngvel(velocity.omega, true);
    }
  }

  setWorld(gravity?: Vec2, airDensity?: number): void {
    if (!this.world) return;
    if (gravity) this.world.gravity = { x: gravity.x, y: gravity.y };
    if (airDensity !== undefined) this.airDensity = airDensity;
    if (gravity || airDensity !== undefined) {
      for (const body of this.bodies.values()) {
        if (body.isDynamic()) body.wakeUp();
      }
    }
  }

  // --- Klouby ---------------------------------------------------------------

  addJoint(j: Joint): void {
    if (!this.world || this.jointData.has(j.id)) return;
    const bodyB = this.bodies.get(j.bodyB);
    const bodyA = j.bodyA === null ? this.worldAnchor : (this.bodies.get(j.bodyA) ?? null);
    if (!bodyA || !bodyB) return; // visící reference — defenzivně přeskočit

    // Pružina a tryska nejsou Rapier jointy — působí jako explicitní síla v ticku.
    if (j.type === 'spring' || j.type === 'thruster') {
      this.jointData.set(j.id, j);
      return;
    }

    const R = this.R;
    let data: RAPIER.JointData;
    switch (j.type) {
      case 'axle':
        data = R.JointData.revolute(j.anchorA, j.anchorB);
        break;
      case 'fixed': {
        // Frame tak, aby se zachovalo aktuální vzájemné natočení.
        const rel = bodyB.rotation() - bodyA.rotation();
        data = R.JointData.fixed(j.anchorA, rel, j.anchorB, 0);
        break;
      }
    }

    const joint = this.world.createImpulseJoint(data, bodyA, bodyB, true);
    // Osa a svár: spojená tělesa se nemají vzájemně srážet (jako v Algodoo).
    joint.setContactsEnabled(false);

    this.joints.set(j.id, joint);
    this.jointData.set(j.id, j);
  }

  removeJoint(id: string): void {
    const joint = this.joints.get(id);
    if (joint) this.world!.removeImpulseJoint(joint, true);
    this.joints.delete(id);
    this.jointData.delete(id);
  }

  replaceJoint(j: Joint): void {
    this.removeJoint(j.id);
    this.addJoint(j);
  }

  // --- Tick -----------------------------------------------------------------

  tick(ctx: TickCtx): void {
    const world = this.world;
    if (!world) return;

    // FBD: vzorkovat silový rozklad cílového tělesa ~10 Hz (F2-D).
    const sampleFbd =
      this.fbdBodyId !== null &&
      ctx.tickIndex % FBD_EVERY === 0 &&
      this.bodies.has(this.fbdBodyId);
    if (sampleFbd) {
      this.fbdForces = [];
      const body = this.bodies.get(this.fbdBodyId!)!;
      if (body.isDynamic()) {
        // Gravitaci aplikuje Rapier vnitřně — pro diagram ji dopočítáme z m·g.
        const m = body.mass();
        this.fbdForces.push({ kind: 'gravity', fx: world.gravity.x * m, fy: world.gravity.y * m });
      }
    }

    if (this.drag) applyDragForce(this.drag, ctx.dt);

    // Vzduch: vztlak + kvadratický odpor (viz air.ts). Jen při ρ > 0.
    if (this.airDensity > 0) {
      const rho = this.airDensity;
      const g = world.gravity;
      for (const [id, body] of this.bodies) {
        if (!body.isDynamic()) continue;
        const area = this.areas.get(id) ?? 0;
        if (area <= 0) continue;

        // Vztlak: proti tíhovému poli, úměrný vytlačené ploše.
        const bx = -rho * area * g.x;
        const by = -rho * area * g.y;
        let dragX = 0;
        let dragY = 0;

        const lv = body.linvel();
        const speed = Math.hypot(lv.x, lv.y);
        if (speed > 1e-6) {
          const d = effectiveDiameter(area);
          let mag = 0.5 * rho * DRAG_CD * d * speed * speed;
          // Odpor nesmí rychlost za jeden tick obrátit (stabilita).
          mag = Math.min(mag, (body.mass() * speed) / ctx.dt);
          dragX = -(lv.x / speed) * mag;
          dragY = -(lv.y / speed) * mag;
        }

        body.applyImpulse({ x: (bx + dragX) * ctx.dt, y: (by + dragY) * ctx.dt }, true);

        if (sampleFbd && id === this.fbdBodyId) {
          this.fbdForces.push({ kind: 'buoyancy', fx: bx, fy: by });
          if (dragX !== 0 || dragY !== 0) {
            this.fbdForces.push({ kind: 'drag', fx: dragX, fy: dragY });
          }
        }
      }
    }

    // Motory os: regulátor se saturací + reakční moment.
    for (const j of this.jointData.values()) {
      if (j.type !== 'axle') continue;
      const bodyB = this.bodies.get(j.bodyB);
      if (!bodyB) continue;
      const bodyA = j.bodyA === null ? null : this.bodies.get(j.bodyA);
      const omegaA = bodyA ? bodyA.angvel() : 0;
      const relOmega = bodyB.angvel() - omegaA;

      // Měřená úhlová rychlost osy — producent na SignalBusu (grafy, fáze 2).
      ctx.bus.set(j.id, 'axle.omega', relOmega);

      const motor = j.axle;
      if (!motor?.enabled) continue;
      // Cíl lze přepsat po sběrnici (později: obvody, skripty).
      const target = ctx.bus.has(j.id, 'motor.targetVelocity')
        ? ctx.bus.get(j.id, 'motor.targetVelocity')
        : motor.targetVelocity;

      const err = target - relOmega;
      const torque = clamp((err / MOTOR_SOFTNESS) * motor.maxTorque, -motor.maxTorque, motor.maxTorque);
      bodyB.applyTorqueImpulse(torque * ctx.dt, true);
      if (bodyA?.isDynamic()) bodyA.applyTorqueImpulse(-torque * ctx.dt, true);
    }

    // Pružiny: explicitní symplektická síla F = k·Δl + c·(dΔl/dt) podél osy,
    // akce i reakce v kotvách. Tuhost se klamruje na mez stability explicitní
    // integrace (ω·dt ≤ 0,5), tlumení na kritické.
    for (const j of this.jointData.values()) {
      if (j.type !== 'spring') continue;
      const bodyB = this.bodies.get(j.bodyB);
      if (!bodyB) continue;
      const bodyA = j.bodyA === null ? null : (this.bodies.get(j.bodyA) ?? null);
      if (j.bodyA !== null && !bodyA) continue;

      const dynB = bodyB.isDynamic();
      const dynA = bodyA?.isDynamic() ?? false;
      if (!dynB && !dynA) continue;

      const s = j.spring ?? { restLength: 0.5, stiffness: 100, damping: 1 };

      const tB = bodyB.translation();
      const rotB = bodyB.rotation();
      const cosB = Math.cos(rotB);
      const sinB = Math.sin(rotB);
      const rBx = j.anchorB.x * cosB - j.anchorB.y * sinB;
      const rBy = j.anchorB.x * sinB + j.anchorB.y * cosB;
      const pBx = tB.x + rBx;
      const pBy = tB.y + rBy;

      let pAx = j.anchorA.x;
      let pAy = j.anchorA.y;
      let rAx = 0;
      let rAy = 0;
      if (bodyA) {
        const tA = bodyA.translation();
        const rotA = bodyA.rotation();
        const cosA = Math.cos(rotA);
        const sinA = Math.sin(rotA);
        rAx = j.anchorA.x * cosA - j.anchorA.y * sinA;
        rAy = j.anchorA.x * sinA + j.anchorA.y * cosA;
        pAx = tA.x + rAx;
        pAy = tA.y + rAy;
      }

      const dx = pAx - pBx;
      const dy = pAy - pBy;
      const len = Math.hypot(dx, dy);
      if (len < 1e-9) continue; // nulová délka — směr nedefinován
      const ux = dx / len;
      const uy = dy / len;

      // Redukovaná hmotnost dvojice (statický konec = nekonečno).
      const mB = dynB ? bodyB.mass() : Number.POSITIVE_INFINITY;
      const mA = dynA ? bodyA!.mass() : Number.POSITIVE_INFINITY;
      const mu = Number.isFinite(mB)
        ? Number.isFinite(mA)
          ? (mA * mB) / (mA + mB)
          : mB
        : mA;
      const kMax = (0.25 * mu) / (ctx.dt * ctx.dt);
      const k = Math.min(s.stiffness, kMax);
      const c = Math.min(s.damping, 2 * Math.sqrt(k * mu));

      // Rychlost prodlužování: relativní rychlost kotev promítnutá do osy.
      const lvB = bodyB.linvel();
      const wB = bodyB.angvel();
      const vBx = lvB.x - wB * rBy;
      const vBy = lvB.y + wB * rBx;
      let vAx = 0;
      let vAy = 0;
      if (bodyA) {
        const lvA = bodyA.linvel();
        const wA = bodyA.angvel();
        vAx = lvA.x - wA * rAy;
        vAy = lvA.y + wA * rAx;
      }
      const stretchRate = (vAx - vBx) * ux + (vAy - vBy) * uy;

      const f = k * (len - s.restLength) + c * stretchRate;
      const ix = f * ux * ctx.dt;
      const iy = f * uy * ctx.dt;
      if (dynB) bodyB.applyImpulseAtPoint({ x: ix, y: iy }, { x: pBx, y: pBy }, true);
      if (dynA) bodyA!.applyImpulseAtPoint({ x: -ix, y: -iy }, { x: pAx, y: pAy }, true);

      // FBD: síla pružiny míří z kotvy tělesa k druhému konci (ux,uy).
      if (sampleFbd) {
        if (dynB && j.bodyB === this.fbdBodyId) {
          this.fbdForces.push({ kind: 'spring', fx: f * ux, fy: f * uy });
        }
        if (dynA && j.bodyA === this.fbdBodyId) {
          this.fbdForces.push({ kind: 'spring', fx: -f * ux, fy: -f * uy });
        }
      }
    }

    // Trysky (F2-F): tahová síla v lokálních souřadnicích tělesa.
    for (const j of this.jointData.values()) {
      if (j.type !== 'thruster') continue;
      const thruster = j.thruster;
      if (!thruster?.enabled) continue;
      const bodyB = this.bodies.get(j.bodyB);
      if (!bodyB || !bodyB.isDynamic()) continue;
      const angle = bodyB.rotation();
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      // Transformace z lokálního do světového souřadnicového systému.
      const wx = thruster.fx * cos - thruster.fy * sin;
      const wy = thruster.fx * sin + thruster.fy * cos;
      bodyB.applyImpulse({ x: wx * ctx.dt, y: wy * ctx.dt }, true);
      if (sampleFbd && j.bodyB === this.fbdBodyId) {
        this.fbdForces.push({ kind: 'thruster', fx: wx, fy: wy });
      }
    }

    world.step();

    if (sampleFbd) {
      this.fbdSample = { t: ctx.simTime + ctx.dt, bodyId: this.fbdBodyId!, forces: this.fbdForces };
    }
  }

  // --- Snapshot / stav --------------------------------------------------------

  writeSnapshot(w: SnapshotWriter): void {
    for (const id of this.order) {
      const body = this.bodies.get(id)!;
      const t = body.translation();
      const lv = body.linvel();
      w.pushBody(t.x, t.y, body.rotation(), lv.x, lv.y, body.angvel());
    }
  }

  readState(): BodyState[] {
    return this.order.map((id) => {
      const body = this.bodies.get(id)!;
      const t = body.translation();
      const lv = body.linvel();
      return {
        id,
        x: t.x,
        y: t.y,
        angle: body.rotation(),
        vx: lv.x,
        vy: lv.y,
        omega: body.angvel(),
      };
    });
  }

  // --- FBD (silový diagram, F2-D) ---------------------------------------------

  /** Nastaví těleso, jehož silový rozklad se vzorkuje. Null = zákaz. */
  setFbdBodyId(id: string | null): void {
    this.fbdBodyId = id;
    this.fbdForces = [];
    this.fbdSample = null;
  }

  /** Odebere poslední silový vzorek (null = od minula žádný nový). */
  drainFbdSample(): FbdSample | null {
    const s = this.fbdSample;
    this.fbdSample = null;
    return s;
  }

  get bodyCount(): number {
    return this.order.length;
  }

  get orderIds(): readonly string[] {
    return this.order;
  }

  // --- Uchopení ukazatelem ----------------------------------------------------

  dragStart(entityId: string, point: Vec2): void {
    const body = this.bodies.get(entityId);
    if (!body || !body.isDynamic()) return;
    this.drag = startDrag(body, point);
  }

  dragMove(point: Vec2): void {
    if (this.drag) {
      this.drag.target.x = point.x;
      this.drag.target.y = point.y;
    }
  }

  dragEnd(): void {
    this.drag = null;
  }

  dispose(): void {
    this.drag = null;
    this.fbdBodyId = null;
    this.fbdForces = [];
    this.fbdSample = null;
    this.bodies.clear();
    this.order = [];
    this.joints.clear();
    this.jointData.clear();
    this.areas.clear();
    this.worldAnchor = null;
    if (this.world) {
      this.world.free();
      this.world = null;
    }
  }
}
