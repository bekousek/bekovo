/**
 * OpticsModule — paprsková optika (F3-A/B).
 *
 * Trasování paprsků se spustí každý tick po rigid.step() (viz ARCHITECTURE.md).
 * Modul nezávisí na DOM/Pixi/React; běží stejně ve workeru i ve vitestu.
 *
 * Pořadí v ticku:
 *   rigid.applyForces → rigid.step → optics.tick → instruments.tick
 *
 * Zjednodušení v1:
 * - Tvary: circle (s offset), box (shape.angle podporováno), polygon (hrany),
 *   plane (nekonečná podlaha ≈ dlouhý segment).
 * - MAX_BOUNCES = 16 odrazů/lomů na paprsek.
 * - MAX_RAYS celkem K=512 (ochrana CPU).
 * - Intenzita se při každém odrazu/lomu násobí koeficientem (Fresnelova aprox.).
 */
import { rotate } from '../core/math';
import type { BodyState, SimModule, TickCtx } from '../core/SimModule';
import type { SnapshotWriter } from '../snapshot/layout';
import type { Body, OpticalSource, SceneDoc } from '../scene/schema';
import {
  cauchyN,
  intersectCircle,
  intersectSegment,
  reflect,
  snell,
  type Ray,
  type RayHit,
} from './math';

export interface RaySegment {
  /** Počátek úseku [m]. */
  ox: number;
  oy: number;
  /** Konec úseku [m]. */
  ex: number;
  ey: number;
  /** Vlnová délka [nm]; 0 = bílá. */
  wavelength: number;
  /** Relativní intenzita 0–1. */
  intensity: number;
}

/** Póza tělesa (subtyp PoseLike). */
interface Pose {
  x: number;
  y: number;
  angle: number;
}

type PoseGetter = (id: string) => Pose | null;

const MAX_BOUNCES = 16;
const MAX_TOTAL_RAYS = 512;
const MAX_RAY_LENGTH = 50; // m

/** Optické těleso = body + aktuální póza. */
interface OpticalBody {
  body: Body;
  pose: Pose;
}

// ---------------------------------------------------------------------------
// Průsečíky tvaru v lokálním prostoru tělesa
// ---------------------------------------------------------------------------

/**
 * Vrátí všechny průsečíky paprsku (v LOKÁLNÍM prostoru tělesa) se tvary body.
 * Výsledek bude transformován zpět do světa volajícím.
 */
function shapeHits(
  localRay: Ray,
  body: Body,
): { hit: RayHit; refractiveIndex: number; enteringBody: boolean }[] {
  const result: { hit: RayHit; refractiveIndex: number; enteringBody: boolean }[] = [];
  const nBody = body.optics
    ? cauchyN(localRay.wavelength || 550, body.optics.refractiveIndex, body.optics.cauchyB)
    : 1.5;

  for (const shape of body.shapes) {
    switch (shape.type) {
      case 'circle': {
        const h = intersectCircle(localRay, shape.offset, shape.r);
        if (h) {
          const entering = localRay.n < nBody;
          result.push({ hit: h, refractiveIndex: nBody, enteringBody: entering });
        }
        break;
      }
      case 'box': {
        // 4 hrany boxu v lokálním prostoru tělesa (s shape.angle).
        const hw = shape.hw;
        const hh = shape.hh;
        const sa = shape.angle;
        const ox = shape.offset.x;
        const oy = shape.offset.y;
        const corners = [
          rotate({ x: -hw, y: -hh }, sa),
          rotate({ x: hw, y: -hh }, sa),
          rotate({ x: hw, y: hh }, sa),
          rotate({ x: -hw, y: hh }, sa),
        ].map((c) => ({ x: c.x + ox, y: c.y + oy }));
        for (let i = 0; i < 4; i++) {
          const a = corners[i]!;
          const b = corners[(i + 1) % 4]!;
          const h = intersectSegment(localRay, a, b);
          if (h) {
            const entering = localRay.n < nBody;
            result.push({ hit: h, refractiveIndex: nBody, enteringBody: entering });
          }
        }
        break;
      }
      case 'polygon': {
        const pts = shape.points;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i]!;
          const b = pts[(i + 1) % pts.length]!;
          const h = intersectSegment(localRay, a, b);
          if (h) {
            const entering = localRay.n < nBody;
            result.push({ hit: h, refractiveIndex: nBody, enteringBody: entering });
          }
        }
        break;
      }
      case 'plane': {
        // Nekonečná podlaha: normála tělesa je +y. Modelujeme jako dlouhý segment.
        const half = MAX_RAY_LENGTH * 2;
        const h = intersectSegment(localRay, { x: -half, y: 0 }, { x: half, y: 0 });
        if (h) {
          const entering = localRay.n < nBody;
          result.push({ hit: h, refractiveIndex: nBody, enteringBody: entering });
        }
        break;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Světové průsečíky
// ---------------------------------------------------------------------------

interface WorldHit {
  t: number;
  /** Normála ve světovém prostoru. */
  normal: { x: number; y: number };
  body: Body;
  refractiveIndex: number;
}

function nearestWorldHit(ray: Ray, optBodies: OpticalBody[]): WorldHit | null {
  let best: WorldHit | null = null;

  for (const { body, pose } of optBodies) {
    // Transformuj paprsek do lokálního prostoru tělesa.
    const ca = Math.cos(-pose.angle);
    const sa = Math.sin(-pose.angle);
    const dx = ray.origin.x - pose.x;
    const dy = ray.origin.y - pose.y;
    const localOrigin = {
      x: ca * dx - sa * dy,
      y: sa * dx + ca * dy,
    };
    const localDir = {
      x: ca * ray.dir.x - sa * ray.dir.y,
      y: sa * ray.dir.x + ca * ray.dir.y,
    };
    const localRay: Ray = { origin: localOrigin, dir: localDir, wavelength: ray.wavelength, n: ray.n };

    const hits = shapeHits(localRay, body);
    for (const { hit, refractiveIndex } of hits) {
      if (hit.t <= 0 || (best && hit.t >= best.t)) continue;
      // Transformuj normálu zpět do světového prostoru.
      const ca2 = Math.cos(pose.angle);
      const sa2 = Math.sin(pose.angle);
      const worldNormal = {
        x: ca2 * hit.normal.x - sa2 * hit.normal.y,
        y: sa2 * hit.normal.x + ca2 * hit.normal.y,
      };
      best = { t: hit.t, normal: worldNormal, body, refractiveIndex };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Emise paprsků ze zdroje
// ---------------------------------------------------------------------------

function emitRays(source: OpticalSource, poseGetter: PoseGetter): Ray[] {
  // Parentovaný zdroj zdědí pozici rodiče.
  let worldX = source.transform.x;
  let worldY = source.transform.y;
  let worldAngle = source.transform.angle;
  if (source.parentId) {
    const parentPose = poseGetter(source.parentId);
    if (parentPose) {
      const local = rotate({ x: source.transform.x, y: source.transform.y }, parentPose.angle);
      worldX = parentPose.x + local.x;
      worldY = parentPose.y + local.y;
      worldAngle = parentPose.angle + source.transform.angle;
    }
  }

  const origin = { x: worldX, y: worldY };
  const wavelength = source.wavelength;
  const n = 1.0; // zdroj vždy ve vzduchu

  switch (source.type) {
    case 'laser':
      return [{ origin, dir: { x: Math.cos(worldAngle), y: Math.sin(worldAngle) }, wavelength, n }];

    case 'beam': {
      const count = source.rayCount;
      const hw = source.beamWidth / 2;
      const perp = { x: -Math.sin(worldAngle), y: Math.cos(worldAngle) };
      const dir = { x: Math.cos(worldAngle), y: Math.sin(worldAngle) };
      const rays: Ray[] = [];
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // −1 … 1
        const ox = origin.x + perp.x * hw * t;
        const oy = origin.y + perp.y * hw * t;
        rays.push({ origin: { x: ox, y: oy }, dir, wavelength, n });
      }
      return rays;
    }

    case 'point': {
      const count = source.rayCount;
      const rays: Ray[] = [];
      for (let i = 0; i < count; i++) {
        const a = worldAngle + (i / count) * Math.PI * 2;
        rays.push({ origin, dir: { x: Math.cos(a), y: Math.sin(a) }, wavelength, n });
      }
      return rays;
    }
  }
}

// ---------------------------------------------------------------------------
// Trasování jednoho paprsku
// ---------------------------------------------------------------------------

function traceRay(ray: Ray, bodies: OpticalBody[], segments: RaySegment[], maxRays: number): void {
  let current = ray;
  let intensity = 1.0;

  for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    if (segments.length >= maxRays) return;

    const hit = nearestWorldHit(current, bodies);
    if (!hit) {
      // Paprsek letí do nekonečna — přidej konečný úsek.
      segments.push({
        ox: current.origin.x,
        oy: current.origin.y,
        ex: current.origin.x + current.dir.x * MAX_RAY_LENGTH,
        ey: current.origin.y + current.dir.y * MAX_RAY_LENGTH,
        wavelength: current.wavelength,
        intensity,
      });
      return;
    }

    // Místo dopadu.
    const hx = current.origin.x + hit.t * current.dir.x;
    const hy = current.origin.y + hit.t * current.dir.y;

    segments.push({
      ox: current.origin.x,
      oy: current.origin.y,
      ex: hx,
      ey: hy,
      wavelength: current.wavelength,
      intensity,
    });

    if (!hit.body.optics) return;
    const { mode, reflectivity } = hit.body.optics;

    switch (mode) {
      case 'absorb':
        return;

      case 'mirror': {
        const newDir = reflect(current.dir, hit.normal);
        intensity *= reflectivity;
        if (intensity < 0.01) return;
        current = { origin: { x: hx, y: hy }, dir: newDir, wavelength: current.wavelength, n: current.n };
        break;
      }

      case 'glass': {
        const n2 = hit.refractiveIndex;
        const n1 = current.n;
        const refracted = snell(current.dir, hit.normal, n1, n2);
        if (!refracted) {
          // TIR — odraž paprsek.
          const newDir = reflect(current.dir, hit.normal);
          current = { origin: { x: hx, y: hy }, dir: newDir, wavelength: current.wavelength, n: n1 };
        } else {
          // Fresnelova odrazivost (zanedbáme odražený paprsek — pro výuku stačí).
          const transIntensity = 1 - reflectivity;
          intensity *= transIntensity;
          if (intensity < 0.01) return;
          current = {
            origin: { x: hx, y: hy },
            dir: refracted,
            wavelength: current.wavelength,
            n: n2,
          };
        }
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// OpticsModule
// ---------------------------------------------------------------------------

export class OpticsModule implements SimModule {
  readonly name = 'optics';

  private sources: OpticalSource[] = [];
  private optBodies: OpticalBody[] = [];
  private allBodies: Body[] = [];
  private segments: RaySegment[] = [];

  constructor(private readonly getPose: PoseGetter) {}

  build(doc: SceneDoc): void {
    this.sources = doc.entities.filter((e): e is OpticalSource => e.kind === 'opticalSource');
    this.allBodies = doc.entities.filter((e): e is Body => e.kind === 'body');
    this.segments = [];
  }

  addSource(e: OpticalSource): void {
    if (!this.sources.some((s) => s.id === e.id)) this.sources.push(e);
  }

  removeSource(id: string): void {
    this.sources = this.sources.filter((s) => s.id !== id);
  }

  replaceSource(e: OpticalSource): void {
    const idx = this.sources.findIndex((s) => s.id === e.id);
    if (idx >= 0) this.sources[idx] = e;
    else this.sources.push(e);
  }

  addBody(body: Body): void {
    if (!this.allBodies.some((b) => b.id === body.id)) this.allBodies.push(body);
  }

  removeBody(id: string): void {
    this.allBodies = this.allBodies.filter((b) => b.id !== id);
  }

  replaceBody(body: Body): void {
    const idx = this.allBodies.findIndex((b) => b.id === body.id);
    if (idx >= 0) this.allBodies[idx] = body;
    else this.allBodies.push(body);
  }

  tick(_ctx: TickCtx): void {
    this.segments = [];
    if (this.sources.length === 0) return;

    // Sestav seznam těles s optikou a jejich aktuálními pózami.
    this.optBodies = [];
    for (const body of this.allBodies) {
      if (!body.optics) continue;
      const pose = this.getPose(body.id);
      if (!pose) continue;
      this.optBodies.push({ body, pose });
    }

    let totalRays = 0;
    for (const source of this.sources) {
      const rays = emitRays(source, this.getPose);
      for (const ray of rays) {
        if (totalRays >= MAX_TOTAL_RAYS) break;
        const before = this.segments.length;
        traceRay(ray, this.optBodies, this.segments, MAX_TOTAL_RAYS);
        totalRays += this.segments.length - before;
      }
    }
  }

  writeSnapshot(_w: SnapshotWriter): void {
    // Paprsky se posílají jako oddělená zpráva (drainRaySegments).
  }

  readState(): BodyState[] {
    return [];
  }

  /** Vrátí aktuální sadu paprsků (latest-wins). */
  readRaySegments(): readonly RaySegment[] {
    return this.segments;
  }

  dispose(): void {
    this.sources = [];
    this.allBodies = [];
    this.optBodies = [];
    this.segments = [];
  }
}
