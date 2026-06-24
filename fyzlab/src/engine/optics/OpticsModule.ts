/**
 * OpticsModule — paprsková optika (F3-A/B/D).
 *
 * Trasování paprsků se spustí každý tick po rigid.step() (viz ARCHITECTURE.md).
 * Modul nezávisí na DOM/Pixi/React; běží stejně ve workeru i ve vitestu.
 *
 * Pořadí v ticku:
 *   rigid.applyForces → rigid.step → optics.tick → instruments.tick
 *
 * Zjednodušení v1:
 * - Tvary: circle, box (shape.angle podporováno), polygon, plane.
 * - mode='lens': ideální tenká čočka (maticová optika, paraxiální aproximace).
 * - MAX_BOUNCES = 16 odrazů/lomů/průchodů čočkou na paprsek.
 * - MAX_RAYS celkem K=512 (ochrana CPU).
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

function shapeHits(
  localRay: Ray,
  body: Body,
): { hit: RayHit; refractiveIndex: number }[] {
  const result: { hit: RayHit; refractiveIndex: number }[] = [];
  const nBody = body.optics
    ? cauchyN(localRay.wavelength || 550, body.optics.refractiveIndex, body.optics.cauchyB)
    : 1.5;

  for (const shape of body.shapes) {
    switch (shape.type) {
      case 'circle': {
        const h = intersectCircle(localRay, shape.offset, shape.r);
        if (h) result.push({ hit: h, refractiveIndex: nBody });
        break;
      }
      case 'box': {
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
          if (h) result.push({ hit: h, refractiveIndex: nBody });
        }
        break;
      }
      case 'polygon': {
        const pts = shape.points;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i]!;
          const b = pts[(i + 1) % pts.length]!;
          const h = intersectSegment(localRay, a, b);
          if (h) result.push({ hit: h, refractiveIndex: nBody });
        }
        break;
      }
      case 'plane': {
        const half = MAX_RAY_LENGTH * 2;
        const h = intersectSegment(localRay, { x: -half, y: 0 }, { x: half, y: 0 });
        if (h) result.push({ hit: h, refractiveIndex: nBody });
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
  /** Póza tělesa — potřebná pro výpočet čočky (výška od optické osy). */
  pose: Pose;
}

/**
 * Vrátí nejbližší světový průsečík, volitelně přeskočí jedno těleso
 * (používá se k přeskočení výstupní stěny tenké čočky po průchodu).
 */
function nearestWorldHit(
  ray: Ray,
  optBodies: OpticalBody[],
  skipId: string | null,
): WorldHit | null {
  let best: WorldHit | null = null;

  for (const { body, pose } of optBodies) {
    if (skipId !== null && body.id === skipId) continue;

    const ca = Math.cos(-pose.angle);
    const sa = Math.sin(-pose.angle);
    const dx = ray.origin.x - pose.x;
    const dy = ray.origin.y - pose.y;
    const localOrigin = { x: ca * dx - sa * dy, y: sa * dx + ca * dy };
    const localDir = {
      x: ca * ray.dir.x - sa * ray.dir.y,
      y: sa * ray.dir.x + ca * ray.dir.y,
    };
    const localRay: Ray = { origin: localOrigin, dir: localDir, wavelength: ray.wavelength, n: ray.n };

    const hits = shapeHits(localRay, body);
    for (const { hit, refractiveIndex } of hits) {
      if (hit.t <= 0 || (best && hit.t >= best.t)) continue;
      const ca2 = Math.cos(pose.angle);
      const sa2 = Math.sin(pose.angle);
      const worldNormal = {
        x: ca2 * hit.normal.x - sa2 * hit.normal.y,
        y: sa2 * hit.normal.x + ca2 * hit.normal.y,
      };
      best = { t: hit.t, normal: worldNormal, body, refractiveIndex, pose };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Emise paprsků ze zdroje
// ---------------------------------------------------------------------------

function emitRays(source: OpticalSource, poseGetter: PoseGetter): Ray[] {
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
  const n = 1.0;

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
        const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
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
  // Po průchodu čočkou přeskočíme výstupní stěnu stejného tělesa.
  let lastLensId: string | null = null;

  for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    if (segments.length >= maxRays) return;

    const hit = nearestWorldHit(current, bodies, lastLensId);
    lastLensId = null; // reset po každém bouncu

    if (!hit) {
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
        // Index skla při dané vlnové délce (disperze přes Cauchyho B).
        const bodyN = hit.refractiveIndex;
        // Jsme-li už uvnitř skla (current.n ≈ bodyN), paprsek VYSTUPUJE do
        // vzduchu (n2 = 1); jinak do skla VSTUPUJE (n2 = bodyN). Bez tohoto
        // rozlišení by výstupní stěna měla n1 == n2 a paprsek by se na výstupu
        // vůbec nelomil — sklo by neposunulo svazek a hranol by odchýlil jen
        // z poloviny.
        const exiting = Math.abs(current.n - bodyN) < 1e-6;
        const n1 = current.n;
        const n2 = exiting ? 1.0 : bodyN;
        const refracted = snell(current.dir, hit.normal, n1, n2);
        if (!refracted) {
          // Totální vnitřní odraz (sklo→vzduch nad kritickým úhlem).
          const newDir = reflect(current.dir, hit.normal);
          current = { origin: { x: hx, y: hy }, dir: newDir, wavelength: current.wavelength, n: n1 };
        } else {
          intensity *= 1 - reflectivity;
          if (intensity < 0.01) return;
          current = { origin: { x: hx, y: hy }, dir: refracted, wavelength: current.wavelength, n: n2 };
        }
        break;
      }

      case 'lens': {
        // Ideální tenká čočka — maticová optika (paraxiální aproximace).
        // Optická osa = lokální x-osa tělesa. Výška h = lokální y-souřadnice místa dopadu.
        const f = hit.body.optics.focalLength;
        if (f === 0) return; // nulová ohnisková vzdálenost = absurdní — zastaví paprsek

        // Transformuj místo dopadu do lokálních souřadnic tělesa → výška h.
        const caNeg = Math.cos(-hit.pose.angle);
        const saNeg = Math.sin(-hit.pose.angle);
        const dhx = hx - hit.pose.x;
        const dhy = hy - hit.pose.y;
        const h = saNeg * dhx + caNeg * dhy; // lokální y

        // Transformuj směr paprsku do lokálních souřadnic.
        const dlX = caNeg * current.dir.x - saNeg * current.dir.y;
        const dlY = saNeg * current.dir.x + caNeg * current.dir.y;

        // Úhel paprsku k optické ose.
        const thetaI = Math.atan2(dlY, dlX);
        // Maticová refrakce: θ_out = θ_in − sgn(dl_x) · h / f
        const signX = dlX >= 0 ? 1 : -1;
        const thetaO = thetaI - signX * h / f;

        // Výstupní směr v lokálních souřadnicích → světové souřadnice.
        const exitLx = Math.cos(thetaO);
        const exitLy = Math.sin(thetaO);
        const ca2 = Math.cos(hit.pose.angle);
        const sa2 = Math.sin(hit.pose.angle);
        const exitWx = ca2 * exitLx - sa2 * exitLy;
        const exitWy = sa2 * exitLx + ca2 * exitLy;

        // Přeskočit výstupní stěnu téhož tělesa (čočka je "bez tloušťky").
        lastLensId = hit.body.id;
        current = {
          origin: { x: hx, y: hy },
          dir: { x: exitWx, y: exitWy },
          wavelength: current.wavelength,
          n: current.n,
        };
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

    this.optBodies = [];
    for (const body of this.allBodies) {
      if (!body.optics) continue;
      const pose = this.getPose(body.id) ?? {
        x: body.transform.x,
        y: body.transform.y,
        angle: body.transform.angle,
      };
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

  writeSnapshot(_w: SnapshotWriter): void {}

  readState(): BodyState[] {
    return [];
  }

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
